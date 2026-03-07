import type {
  DraftMode,
  IIssueKey,
  IIssueTracker,
  IPullRequesterProvider,
  IPullRequesterResult,
  IPullRequesterService,
} from '../interfaces';
import { assertNever } from '../../../libs/utils/assertNever';
import { IssueKeyParser } from '../parsers/IssueKeyParser';
import { CommitLogParser } from '../parsers/CommitLogParser';
import type { IGitService } from './GitService';

/** GitHub API maximum body length for pull requests */
const GITHUB_MAX_BODY_LENGTH = 65536;

/**
 * Typed Octokit interface for PR operations.
 * Decouples from the full @octokit/rest type for testability.
 */
export interface IOctokitPRClient {
  rest: {
    pulls: {
      list(params: {
        owner: string;
        repo: string;
        head: string;
        base: string;
        state: string;
      }): Promise<{
        data: Array<{ number: number; html_url: string; draft: boolean }>;
      }>;
      create(params: {
        owner: string;
        repo: string;
        head: string;
        base: string;
        title: string;
        body: string;
        draft: boolean;
        maintainer_can_modify: boolean;
      }): Promise<{
        data: { number: number; html_url: string };
      }>;
      update(params: {
        owner: string;
        repo: string;
        pull_number: number;
        title: string;
        body: string;
        draft: boolean;
      }): Promise<{
        data: { number: number; html_url: string };
      }>;
      requestReviewers(params: {
        owner: string;
        repo: string;
        pull_number: number;
        reviewers?: string[];
        team_reviewers?: string[];
      }): Promise<unknown>;
    };
    issues: {
      addLabels(params: {
        owner: string;
        repo: string;
        issue_number: number;
        labels: string[];
      }): Promise<unknown>;
      addAssignees(params: {
        owner: string;
        repo: string;
        issue_number: number;
        assignees: string[];
      }): Promise<unknown>;
      update(params: {
        owner: string;
        repo: string;
        issue_number: number;
        milestone: number;
      }): Promise<unknown>;
    };
  };
}

/** Regex to parse "Name <email>" format — RegExp.exec, not child_process */
const AUTHOR_EMAIL_REGEX = /<([^>]+)>/;
const AUTHOR_NAME_REGEX = /^([^<]+)/;

/**
 * Core orchestrator for the PullRequester action.
 * Creates or updates pull requests with optional issue tracker integration.
 *
 * All dependencies are injected via constructor for testability.
 */
export class PullRequesterService implements IPullRequesterService {
  constructor(
    private readonly config: IPullRequesterProvider,
    private readonly git: IGitService,
    private readonly octokit: IOctokitPRClient,
    private readonly tracker: IIssueTracker | undefined,
    private readonly owner: string,
    private readonly repo: string,
  ) {}

  // --- Execution ---

  async execute(): Promise<IPullRequesterResult> {
    // Step 1: Configure git
    const committerName = PullRequesterService.extractName(this.config.committer);
    const committerEmail = PullRequesterService.extractEmail(this.config.committer);
    await this.git.configureCredentials(this.config.token);
    await this.git.configureUser(committerName, committerEmail);

    // Step 2: Detect changes
    const hasChanges = await this.git.hasChanges();

    // Check if PR branch already exists remotely by checking for existing PRs
    const existingPrs = await this.findExistingPr();
    const existingPr = existingPrs.length > 0 ? existingPrs[0] : undefined;

    if (!hasChanges && !existingPr) {
      return this.buildResult('skipped');
    }

    // Step 3: Create branch
    await this.git.createBranch(this.config.branch, this.config.base);

    // Step 4: Check collaborator commits
    const botEmail = PullRequesterService.extractEmail(this.config.author);
    if (existingPr && this.config.skipOnCollaboratorCommits) {
      const hasCollabs = await this.git.hasCollaboratorCommits(
        this.config.branch,
        this.config.base,
        botEmail,
      );
      if (hasCollabs) {
        return this.buildResult('skipped-collaborator');
      }
    }

    // Step 5: Check merge conflicts
    const hasConflicts = await this.git.hasConflictsWithBase(this.config.branch, this.config.base);

    // Step 6: Commit changes
    let headSha: string | undefined;
    if (hasChanges) {
      headSha = await this.git.commitChanges(
        this.config.commitMessage,
        this.config.author,
        this.config.signoff,
      );
    }

    // Check if branch still has diff with base after commit
    const hasDiff = await this.git.hasDiffWithBase(this.config.branch, this.config.base);
    if (!hasDiff && existingPr) {
      // No diff remains — close the PR by deleting branch
      return this.buildResult('closed', {
        pullRequestNumber: existingPr.number,
        pullRequestUrl: existingPr.html_url,
      });
    }

    // Step 7: Push branch (always use --force-with-lease on update)
    const isUpdate = existingPr !== undefined;
    await this.git.pushBranch(this.config.branch, isUpdate);

    // Step 8: Extract issue keys
    const issueKeys = this.extractIssueKeys();

    // Step 9: Build commit log
    const commitEntries = await this.git.getCommitLog(this.config.base);
    const commitLog = CommitLogParser.renderMarkdown(CommitLogParser.groupByType(commitEntries));
    const firstEntry = commitEntries[0];
    const commitSummary = firstEntry ? firstEntry.subject : '';

    // Step 10: Fetch labels from tracker
    const labelsFromIssue = await this.fetchIssueLabels(issueKeys);

    // Step 11: Create or update PR
    const prBody = this.buildPrBody(issueKeys, commitLog, commitSummary, hasConflicts);
    const truncatedBody = PullRequesterService.truncateBody(prBody);
    const isDraft = this.resolveDraftMode(existingPr?.draft);

    let prNumber: number;
    let prUrl: string;
    let operation: 'created' | 'updated';

    if (existingPr) {
      const updated = await this.updatePr(existingPr.number, truncatedBody, isDraft);
      prNumber = updated.number;
      prUrl = updated.html_url;
      operation = 'updated';
    } else {
      const created = await this.createPr(truncatedBody, isDraft);
      prNumber = created.number;
      prUrl = created.html_url;
      operation = 'created';
    }

    // Apply labels, assignees, reviewers, milestone
    await this.applyPrMetadata(prNumber, labelsFromIssue, hasConflicts);

    // Step 12: Link issues
    const commentUpdated = await this.linkIssues(issueKeys, prUrl, prNumber);

    // Step 13: Return result
    return this.buildResult(operation, {
      pullRequestNumber: prNumber,
      pullRequestUrl: prUrl,
      ...(headSha ? { headSha } : {}),
      issuesLinked: issueKeys,
      hasConflicts,
      labelsFromIssue,
      commentUpdated,
    });
  }

  // --- Private helpers ---

  /**
   * Extract name from "Name <email>" format.
   * Uses RegExp pattern matching — not child_process.
   */
  static extractName(authorStr: string): string {
    // RegExp.exec — not child_process
    const match = AUTHOR_NAME_REGEX.exec(authorStr);
    return match?.[1] ? match[1].trim() : authorStr.trim();
  }

  /**
   * Extract email from "Name <email>" format.
   * Uses RegExp pattern matching — not child_process.
   */
  static extractEmail(authorStr: string): string {
    // RegExp.exec — not child_process
    const match = AUTHOR_EMAIL_REGEX.exec(authorStr);
    return match?.[1] ?? '';
  }

  /**
   * Truncate body to GitHub's maximum allowed length.
   * Appends a truncation notice if the body is too long.
   */
  static truncateBody(body: string): string {
    if (body.length <= GITHUB_MAX_BODY_LENGTH) return body;
    const notice = '\n\n---\n*Body truncated due to GitHub character limit.*';
    return body.substring(0, GITHUB_MAX_BODY_LENGTH - notice.length) + notice;
  }

  /**
   * Find existing open PR for this branch->base combination.
   */
  private async findExistingPr(): Promise<
    Array<{ number: number; html_url: string; draft: boolean }>
  > {
    const response = await this.octokit.rest.pulls.list({
      owner: this.owner,
      repo: this.repo,
      head: `${this.owner}:${this.config.branch}`,
      base: this.config.base,
      state: 'open',
    });
    return response.data;
  }

  /**
   * Extract issue keys based on the configured source.
   */
  private extractIssueKeys(): IIssueKey[] {
    const keys: IIssueKey[] = [];
    const seen = new Set<string>();

    const addKeys = (newKeys: IIssueKey[]): void => {
      for (const key of newKeys) {
        if (!seen.has(key.raw)) {
          seen.add(key.raw);
          keys.push(key);
        }
      }
    };

    const source = this.config.issueKeySource;
    if (source === 'branch' || source === 'both') {
      addKeys(IssueKeyParser.extractFromBranch(this.config.branch, this.config.projectManagement));
    }
    if (source === 'commits' || source === 'both') {
      addKeys(
        IssueKeyParser.extractFromText(this.config.commitMessage, this.config.projectManagement),
      );
    }

    return keys;
  }

  /**
   * Fetch labels from the issue tracker for auto-labeling.
   */
  private async fetchIssueLabels(issueKeys: IIssueKey[]): Promise<string[]> {
    if (!this.config.autoLabelFromIssue || !this.tracker || issueKeys.length === 0) {
      return [];
    }

    const allLabels = new Set<string>();
    for (const key of issueKeys) {
      try {
        const labels = await this.tracker.getLabels(key);
        for (const label of labels) {
          allLabels.add(label);
        }
      } catch {
        // Non-critical — label fetch failure should not block PR creation
      }
    }
    return [...allLabels];
  }

  /**
   * Build the PR body from template, autoBody, or raw body.
   */
  private buildPrBody(
    issueKeys: IIssueKey[],
    commitLog: string,
    commitSummary: string,
    hasConflicts: boolean,
  ): string {
    const vars: Record<string, string> = {
      issue_keys: issueKeys.map(k => k.raw).join(', '),
      issue_links: issueKeys.map(k => this.formatIssueLink(k)).join(', '),
      branch_name: this.config.branch,
      commit_summary: commitSummary,
      commit_log: commitLog,
      body: this.config.body,
      conflicts: hasConflicts ? 'Has merge conflicts with base branch' : 'No conflicts',
    };

    if (this.config.bodyTemplate) {
      return PullRequesterService.renderTemplate(this.config.bodyTemplate, vars);
    }

    if (this.config.autoBody) {
      return this.generateAutoBody(issueKeys, commitLog, hasConflicts);
    }

    return this.config.body;
  }

  /**
   * Auto-generate PR body from commit log and issue keys.
   */
  private generateAutoBody(
    issueKeys: IIssueKey[],
    commitLog: string,
    hasConflicts: boolean,
  ): string {
    const parts: string[] = [];

    if (issueKeys.length > 0) {
      const links = issueKeys.map(k => this.formatIssueLink(k)).join(', ');
      parts.push(`## Linked Issues\n\n${links}`);
    }

    if (commitLog) {
      parts.push(`## Changes\n\n${commitLog}`);
    }

    if (hasConflicts) {
      parts.push('> **Warning**: This branch has merge conflicts with the base branch.');
    }

    return parts.join('\n\n');
  }

  /**
   * Format an issue key as a Markdown link.
   */
  private formatIssueLink(key: IIssueKey): string {
    switch (key.tracker) {
      case 'github':
        return key.project
          ? `[${key.raw}](https://github.com/${key.project}/issues/${key.number})`
          : `#${key.number}`;
      case 'linear':
        return `[${key.raw}](https://linear.app/issue/${key.raw})`;
      case 'jira':
        return this.config.jiraBaseUrl
          ? `[${key.raw}](${this.config.jiraBaseUrl}/browse/${key.raw})`
          : key.raw;
    }
  }

  /**
   * Render a template string by replacing {{key}} placeholders.
   */
  static renderTemplate(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }

  /**
   * Resolve the draft mode for the PR.
   * - "true": create as draft, preserve existing state on update
   * - "false": never draft
   * - "always-true": always set draft=true on create and update
   */
  private resolveDraftMode(existingDraft?: boolean): boolean {
    const mode: DraftMode = this.config.draft;
    switch (mode) {
      case 'true':
        // Only draft on creation; if updating, preserve existing state
        return existingDraft !== undefined ? existingDraft : true;
      case 'always-true':
        return true;
      case 'false':
        return false;
      default:
        return assertNever(mode);
    }
  }

  /**
   * Create a new pull request.
   */
  private async createPr(
    body: string,
    isDraft: boolean,
  ): Promise<{ number: number; html_url: string }> {
    const response = await this.octokit.rest.pulls.create({
      owner: this.owner,
      repo: this.repo,
      head: this.config.branch,
      base: this.config.base,
      title: this.config.title,
      body,
      draft: isDraft,
      maintainer_can_modify: this.config.maintainerCanModify,
    });
    return response.data;
  }

  /**
   * Update an existing pull request.
   */
  private async updatePr(
    prNumber: number,
    body: string,
    isDraft: boolean,
  ): Promise<{ number: number; html_url: string }> {
    const response = await this.octokit.rest.pulls.update({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      title: this.config.title,
      body,
      draft: isDraft,
    });
    return response.data;
  }

  /**
   * Apply labels, assignees, reviewers, and milestone to the PR.
   */
  private async applyPrMetadata(
    prNumber: number,
    labelsFromIssue: readonly string[],
    hasConflicts: boolean,
  ): Promise<void> {
    // Merge all labels
    const allLabels = [...this.config.labels, ...labelsFromIssue];
    if (hasConflicts && this.config.conflictLabel) {
      allLabels.push(this.config.conflictLabel);
    }

    if (allLabels.length > 0) {
      await this.octokit.rest.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        labels: allLabels,
      });
    }

    if (this.config.assignees.length > 0) {
      await this.octokit.rest.issues.addAssignees({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        assignees: this.config.assignees,
      });
    }

    if (this.config.reviewers.length > 0 || this.config.teamReviewers.length > 0) {
      await this.octokit.rest.pulls.requestReviewers({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        ...(this.config.reviewers.length > 0 ? { reviewers: this.config.reviewers } : {}),
        ...(this.config.teamReviewers.length > 0
          ? { team_reviewers: this.config.teamReviewers }
          : {}),
      });
    }

    if (this.config.milestone > 0) {
      await this.octokit.rest.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        milestone: this.config.milestone,
      });
    }
  }

  /**
   * Link issues to the PR via the tracker.
   * Returns whether an existing comment was updated.
   */
  private async linkIssues(
    issueKeys: IIssueKey[],
    prUrl: string,
    prNumber: number,
  ): Promise<boolean> {
    if (!this.tracker || issueKeys.length === 0) return false;

    let anyCommentUpdated = false;

    for (const key of issueKeys) {
      try {
        if (this.config.issueLinkPr) {
          await this.tracker.linkPullRequest(key, prUrl, this.config.title, prNumber);
        }

        if (this.config.issueAddComment && this.config.commentMarkerId) {
          const comment = this.buildIssueComment(prUrl, prNumber);
          const updated = await this.tracker.upsertComment(
            key,
            comment,
            this.config.commentMarkerId,
          );
          if (updated) anyCommentUpdated = true;
        }

        if (this.config.issueTransitionState) {
          await this.tracker.transitionIssue(key, this.config.issueTransitionState);
        }
      } catch {
        // Non-critical — tracker errors should not fail the action
      }
    }

    return anyCommentUpdated;
  }

  /**
   * Build the comment body to post on linked issues.
   */
  private buildIssueComment(prUrl: string, prNumber: number): string {
    return [
      `## Pull Request #${prNumber}`,
      '',
      `**Title:** ${this.config.title}`,
      `**URL:** ${prUrl}`,
      `**Branch:** \`${this.config.branch}\` -> \`${this.config.base}\``,
      '',
      `<!-- pullrequester:${this.config.commentMarkerId} -->`,
    ].join('\n');
  }

  /**
   * Build the result object with sensible defaults for optional fields.
   */
  private buildResult(
    operation: IPullRequesterResult['operation'],
    overrides: Partial<Omit<IPullRequesterResult, 'operation' | 'pullRequestBranch'>> = {},
  ): IPullRequesterResult {
    return {
      operation,
      pullRequestBranch: this.config.branch,
      issuesLinked: [],
      hasConflicts: false,
      labelsFromIssue: [],
      commentUpdated: false,
      ...overrides,
    };
  }
}
