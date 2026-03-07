import type { IIssueKey, TrackerType } from '../interfaces';
import { assertNever } from '../../../libs/utils/assertNever';

/**
 * Extracts issue keys from branch names and text based on the configured tracker type.
 * Only ONE tracker type is active per run — no ambiguity.
 */
export class IssueKeyParser {
  /** GitHub: #123, GH-123, owner/repo#123 */
  private static readonly GITHUB_PATTERN = /(?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+))?#(\d+)/g;

  /** Jira/Linear: PROJ-123 (1-10 uppercase letters + dash + number) */
  private static readonly PROJECT_KEY_PATTERN = /\b([A-Z]{1,10})-(\d+)\b/g;

  /**
   * Extract issue keys from a branch name.
   * Strips common prefixes (feature/, fix/, bugfix/, etc.) before parsing.
   * @param branch - Git branch name (e.g., "feature/PROJ-123-add-login")
   * @param trackerType - The active tracker type
   */
  static extractFromBranch(branch: string, trackerType: TrackerType): IIssueKey[] {
    return IssueKeyParser.extractFromText(branch, trackerType);
  }

  /**
   * Extract issue keys from arbitrary text (commit messages, PR titles, etc.).
   * @param text - The text to scan for issue keys
   * @param trackerType - The active tracker type
   */
  static extractFromText(text: string, trackerType: TrackerType): IIssueKey[] {
    if (!text || text.trim() === '') return [];

    switch (trackerType) {
      case 'github':
        return IssueKeyParser.extractGitHubKeys(text);
      case 'linear':
      case 'jira':
        return IssueKeyParser.extractProjectKeys(text, trackerType);
      default:
        return assertNever(trackerType);
    }
  }

  private static extractGitHubKeys(text: string): IIssueKey[] {
    const keys: IIssueKey[] = [];
    const seen = new Set<string>();
    const regex = new RegExp(IssueKeyParser.GITHUB_PATTERN.source, 'g');
    let match: RegExpExecArray | null;

    // RegExp.exec — not child_process exec
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0];
      const project = match[1] ?? ''; // Optional group: owner/repo prefix
      const num = Number(match[2]);
      if (!Number.isInteger(num) || num <= 0) continue;
      if (!seen.has(raw)) {
        seen.add(raw);
        keys.push({ tracker: 'github', project, number: num, raw });
      }
    }

    return keys;
  }

  private static extractProjectKeys(text: string, trackerType: 'linear' | 'jira'): IIssueKey[] {
    const keys: IIssueKey[] = [];
    const seen = new Set<string>();
    const regex = new RegExp(IssueKeyParser.PROJECT_KEY_PATTERN.source, 'g');
    let match: RegExpExecArray | null;

    // RegExp.exec — not child_process exec
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0];
      // Both groups are required by the regex pattern
      const project = match[1] as string;
      const num = Number(match[2]);
      if (!Number.isInteger(num) || num <= 0) continue;
      if (!seen.has(raw)) {
        seen.add(raw);
        keys.push({ tracker: trackerType, project, number: num, raw });
      }
    }

    return keys;
  }
}
