/**
 * A parsed commit entry from git log.
 */
export interface ICommitEntry {
  /** Full commit SHA */
  readonly sha: string;
  /** First line of commit message */
  readonly subject: string;
  /** Remaining lines of commit message */
  readonly body: string;
  /** Conventional commit type (feat, fix, chore, docs, refactor, test, ci, perf, build, style) */
  readonly type?: string;
  /** Conventional commit scope from type(scope): */
  readonly scope?: string;
  /** Whether this is a breaking change (! or BREAKING CHANGE footer) */
  readonly isBreaking: boolean;
}

/**
 * A group of commits by conventional commit type.
 */
export interface ICommitGroup {
  /** Display heading for this group */
  readonly heading: string;
  /** Commits in this group */
  readonly commits: ICommitEntry[];
}

/** Maps conventional commit types to display headings */
const TYPE_HEADINGS: Record<string, string> = {
  feat: 'Features',
  fix: 'Bug Fixes',
  docs: 'Documentation',
  style: 'Styles',
  refactor: 'Code Refactoring',
  perf: 'Performance Improvements',
  test: 'Tests',
  build: 'Build System',
  ci: 'Continuous Integration',
  chore: 'Chores',
  revert: 'Reverts',
};

/**
 * Parses git log output and generates structured commit logs.
 */
export class CommitLogParser {
  /**
   * Regex for conventional commits: type(scope)!: subject
   * Groups: [1]=type, [2]=scope (optional), [3]=! (optional), [4]=subject
   */
  private static readonly CONVENTIONAL_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?\s*:\s*(.+)$/;

  /**
   * Parse a raw git log output (null-delimited format) into commit entries.
   * Expected format from: git log --format='%H%x00%s%x00%b%x00'
   * Each commit is: SHA\0subject\0body\0
   * @param rawLog - The raw git log output
   */
  static parseRawLog(rawLog: string): ICommitEntry[] {
    if (!rawLog || rawLog.trim() === '') return [];

    const entries: ICommitEntry[] = [];
    // Split by null character, process in groups of 3
    const parts = rawLog.split('\0');

    for (let i = 0; i < parts.length; i += 3) {
      // parts[i] always exists when i < parts.length; trailing groups may lack i+1 or i+2
      const sha = (parts[i] as string).trim();
      const subject = parts[i + 1]?.trim();
      const body = parts[i + 2]?.trim() ?? '';

      if (!sha || !subject) continue;

      const match = CommitLogParser.CONVENTIONAL_REGEX.exec(subject);
      const isBreaking =
        match?.[3] === '!' ||
        body.includes('BREAKING CHANGE:') ||
        body.includes('BREAKING-CHANGE:');

      entries.push({
        sha,
        subject: match?.[4] ?? subject,
        body,
        isBreaking,
        ...(match?.[1] ? { type: match[1].toLowerCase() } : {}),
        ...(match?.[2] ? { scope: match[2] } : {}),
      });
    }

    return entries;
  }

  /**
   * Parse a single commit subject line into its conventional commit parts.
   * Useful for testing without full git log output.
   * @param subject - A single commit subject line
   * @param sha - Optional SHA (defaults to empty)
   */
  static parseSubject(subject: string, sha = ''): ICommitEntry {
    const match = CommitLogParser.CONVENTIONAL_REGEX.exec(subject);
    const isBreaking = match?.[3] === '!';

    return {
      sha,
      subject: match?.[4] ?? subject,
      body: '',
      isBreaking,
      ...(match?.[1] ? { type: match[1].toLowerCase() } : {}),
      ...(match?.[2] ? { scope: match[2] } : {}),
    };
  }

  /**
   * Group commit entries by conventional commit type.
   * Non-conventional commits go under "Other Changes".
   * @param entries - Parsed commit entries
   */
  static groupByType(entries: ICommitEntry[]): ICommitGroup[] {
    const groups = new Map<string, ICommitEntry[]>();

    for (const entry of entries) {
      const key = entry.type ?? 'other';
      const existing = groups.get(key) ?? [];
      existing.push(entry);
      groups.set(key, existing);
    }

    const result: ICommitGroup[] = [];

    // Add known types in order (if they have entries)
    for (const [type, heading] of Object.entries(TYPE_HEADINGS)) {
      const commits = groups.get(type);
      if (commits && commits.length > 0) {
        result.push({ heading, commits });
        groups.delete(type);
      }
    }

    // Add remaining unknown types under "Other Changes"
    const otherCommits: ICommitEntry[] = [];
    for (const [, commits] of groups) {
      otherCommits.push(...commits);
    }
    if (otherCommits.length > 0) {
      result.push({ heading: 'Other Changes', commits: otherCommits });
    }

    return result;
  }

  /**
   * Render grouped commits as Markdown.
   * Output format:
   * ### Features
   * - **scope**: subject (sha7)
   * - subject without scope (sha7)
   *
   * ### Bug Fixes
   * - **scope**: subject (sha7)
   */
  static renderMarkdown(groups: ICommitGroup[]): string {
    const lines: string[] = [];

    for (const group of groups) {
      lines.push(`### ${group.heading}`);
      lines.push('');
      for (const commit of group.commits) {
        const sha7 = commit.sha.substring(0, 7);
        const breaking = commit.isBreaking ? '**BREAKING** ' : '';
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        const shaRef = sha7 ? ` (${sha7})` : '';
        lines.push(`- ${breaking}${scope}${commit.subject}${shaRef}`);
      }
      lines.push('');
    }

    return lines.join('\n').trimEnd();
  }

  /**
   * Convenience: parse raw log -> group -> render as Markdown.
   * @param rawLog - Raw git log output
   */
  static generateChangelog(rawLog: string): string {
    const entries = CommitLogParser.parseRawLog(rawLog);
    const groups = CommitLogParser.groupByType(entries);
    return CommitLogParser.renderMarkdown(groups);
  }
}
