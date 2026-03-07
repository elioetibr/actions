import type { Octokit } from '@octokit/rest';
import type { IIssueKey, IIssueTracker, ITrackerIssue, TrackerType } from '../interfaces';
import { buildMarker } from '../utils/comment-marker';

/**
 * GitHub Issues tracker implementation.
 * Uses Octokit REST API for issue operations.
 */
export class GitHubIssueTracker implements IIssueTracker {
  readonly type: TrackerType = 'github';

  constructor(
    private readonly octokit: Octokit,
    private readonly owner: string,
    private readonly repo: string,
  ) {}

  async findIssue(key: IIssueKey): Promise<ITrackerIssue | undefined> {
    try {
      const { data } = await this.octokit.rest.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: key.number,
      });
      return {
        key: `#${data.number}`,
        title: data.title,
        status: data.state,
        url: data.html_url,
        labels: data.labels
          .map(l => (typeof l === 'string' ? l : (l.name ?? '')))
          .filter(name => name.length > 0),
      };
    } catch (error: unknown) {
      if (isHttpError(error) && error.status === 404) return undefined;
      throw error;
    }
  }

  async linkPullRequest(
    key: IIssueKey,
    _prUrl: string,
    _prTitle: string,
    prNumber: number,
  ): Promise<void> {
    // Get current PR body
    const { data: pr } = await this.octokit.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
    });

    const closesRef = `Closes #${key.number}`;
    const currentBody = pr.body ?? '';

    // Only append if not already present
    if (!currentBody.includes(closesRef)) {
      const newBody = currentBody.length > 0 ? `${currentBody}\n\n${closesRef}` : closesRef;
      await this.octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: newBody,
      });
    }
  }

  async upsertComment(key: IIssueKey, comment: string, markerId: string): Promise<boolean> {
    const marker = buildMarker(markerId);
    const fullComment = `${marker}\n${comment}`;

    // List existing comments
    const { data: comments } = await this.octokit.rest.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: key.number,
    });

    // Find existing comment with our marker
    const existing = comments.find((c: { body?: string }) => c.body?.includes(marker));

    if (existing) {
      await this.octokit.rest.issues.updateComment({
        owner: this.owner,
        repo: this.repo,
        comment_id: existing.id,
        body: fullComment,
      });
      return true;
    }

    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: key.number,
      body: fullComment,
    });
    return false;
  }

  async transitionIssue(key: IIssueKey, targetState: string): Promise<void> {
    const state = targetState.toLowerCase() === 'closed' ? 'closed' : 'open';
    await this.octokit.rest.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: key.number,
      state,
    });
  }

  async getLabels(key: IIssueKey): Promise<string[]> {
    const issue = await this.findIssue(key);
    return issue ? [...issue.labels] : [];
  }
}

/**
 * Type guard for Octokit HTTP errors that have a `status` property.
 */
function isHttpError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}
