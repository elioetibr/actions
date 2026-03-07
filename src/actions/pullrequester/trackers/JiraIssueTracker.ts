import type { Version3Client } from 'jira.js';
import type { Version3Models } from 'jira.js/version3';
import type { IIssueKey, IIssueTracker, ITrackerIssue, TrackerType } from '../interfaces';
import { buildMarker } from '../utils/comment-marker';

/**
 * Converts plain text to Atlassian Document Format (ADF).
 * ADF is required for Jira Cloud REST API v3 comments.
 * Returns a proper jira.js `Document` type.
 */
function toADF(text: string): Version3Models.Document {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

/**
 * Extract plain text from an ADF document (simplified).
 * Only handles paragraph > text nodes.
 */
function fromADF(adf: unknown): string {
  if (!adf || typeof adf !== 'object') return '';
  const doc = adf as { content?: Array<{ content?: Array<{ text?: string }> }> };
  return (
    doc.content?.flatMap(block => block.content?.map(inline => inline.text ?? '') ?? []).join('') ??
    ''
  );
}

/**
 * Jira issue tracker implementation.
 * Uses jira.js Version3Client for issue operations.
 */
export class JiraIssueTracker implements IIssueTracker {
  readonly type: TrackerType = 'jira';

  constructor(
    private readonly client: Version3Client,
    private readonly baseUrl: string,
  ) {}

  async findIssue(key: IIssueKey): Promise<ITrackerIssue | undefined> {
    try {
      const response = await this.client.issues.getIssue({
        issueIdOrKey: key.raw,
        fields: ['summary', 'status', 'labels'],
      });

      const rawLabels = response.fields?.labels;
      const labels = Array.isArray(rawLabels) ? (rawLabels as string[]) : [];

      return {
        key: key.raw,
        title: response.fields?.summary ?? '',
        status: response.fields?.status?.name ?? 'Unknown',
        url: `${this.baseUrl}/browse/${key.raw}`,
        labels,
      };
    } catch (error: unknown) {
      if (isJiraNotFound(error)) return undefined;
      throw error;
    }
  }

  async linkPullRequest(
    key: IIssueKey,
    prUrl: string,
    prTitle: string,
    prNumber: number,
  ): Promise<void> {
    await this.client.issueRemoteLinks.createOrUpdateRemoteIssueLink({
      issueIdOrKey: key.raw,
      globalId: `github-pr-${prNumber}`,
      object: {
        url: prUrl,
        title: prTitle,
        icon: {
          url16x16: 'https://github.com/favicon.ico',
          title: 'GitHub',
        },
      },
    });
  }

  async upsertComment(key: IIssueKey, comment: string, markerId: string): Promise<boolean> {
    const marker = buildMarker(markerId);
    const fullText = `${marker}\n${comment}`;

    // Get existing comments
    const response = await this.client.issueComments.getComments({
      issueIdOrKey: key.raw,
    });

    const comments = response.comments ?? [];

    // Search for existing comment with our marker
    const existing = comments.find(c => {
      const body = fromADF(c.body);
      return body.includes(marker);
    });

    if (existing?.id) {
      await this.client.issueComments.updateComment({
        issueIdOrKey: key.raw,
        id: existing.id,
        body: toADF(fullText),
      });
      return true;
    }

    await this.client.issueComments.addComment({
      issueIdOrKey: key.raw,
      comment: toADF(fullText),
    });
    return false;
  }

  async transitionIssue(key: IIssueKey, targetState: string): Promise<void> {
    // Always fetch transitions dynamically -- NEVER hardcode IDs
    const response = await this.client.issues.getTransitions({
      issueIdOrKey: key.raw,
    });

    const transitions = response.transitions ?? [];
    const matching = transitions.find(t => t.name?.toLowerCase() === targetState.toLowerCase());

    if (!matching?.id) {
      const available = transitions.map(t => t.name).join(', ');
      throw new Error(
        `Cannot transition ${key.raw} to "${targetState}": transition not found. Available: ${available}`,
      );
    }

    await this.client.issues.doTransition({
      issueIdOrKey: key.raw,
      transition: { id: matching.id },
    });
  }

  async getLabels(key: IIssueKey): Promise<string[]> {
    const issue = await this.findIssue(key);
    return issue ? [...issue.labels] : [];
  }
}

/**
 * Type guard for Jira 404 errors.
 */
function isJiraNotFound(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status: number }).status === 404;
  }
  return false;
}
