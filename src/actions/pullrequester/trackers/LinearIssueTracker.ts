import type { LinearClient } from '@linear/sdk';
import type { IIssueKey, IIssueTracker, ITrackerIssue, TrackerType } from '../interfaces';
import { buildMarker } from '../utils/comment-marker';

/**
 * Linear issue tracker implementation.
 * Uses the Linear SDK for issue operations.
 */
export class LinearIssueTracker implements IIssueTracker {
  readonly type: TrackerType = 'linear';

  constructor(private readonly client: LinearClient) {}

  async findIssue(key: IIssueKey): Promise<ITrackerIssue | undefined> {
    try {
      const identifier = `${key.project}-${key.number}`;
      const issue = await this.client.issue(identifier);

      if (!issue) return undefined;

      const state = await issue.state;
      const labelsConnection = await issue.labels();
      const labels = labelsConnection.nodes.map(l => l.name);

      return {
        key: identifier,
        title: issue.title,
        status: state?.name ?? 'Unknown',
        url: issue.url,
        labels,
      };
    } catch {
      return undefined;
    }
  }

  async linkPullRequest(
    key: IIssueKey,
    prUrl: string,
    prTitle: string,
    _prNumber: number,
  ): Promise<void> {
    const identifier = `${key.project}-${key.number}`;
    const issue = await this.client.issue(identifier);

    if (!issue) {
      throw new Error(`Linear issue ${identifier} not found`);
    }

    await this.client.createAttachment({
      issueId: issue.id,
      url: prUrl,
      title: prTitle,
      subtitle: 'Pull Request',
      iconUrl: 'https://github.com/favicon.ico',
    });
  }

  async upsertComment(key: IIssueKey, comment: string, markerId: string): Promise<boolean> {
    const marker = buildMarker(markerId);
    const fullComment = `${marker}\n${comment}`;
    const identifier = `${key.project}-${key.number}`;
    const issue = await this.client.issue(identifier);

    const commentsConnection = await issue.comments();
    const existingComment = commentsConnection.nodes.find(c => c.body?.includes(marker));

    if (existingComment) {
      await existingComment.update({ body: fullComment });
      return true;
    }

    await this.client.createComment({
      issueId: issue.id,
      body: fullComment,
    });
    return false;
  }

  async transitionIssue(key: IIssueKey, targetState: string): Promise<void> {
    const identifier = `${key.project}-${key.number}`;
    const issue = await this.client.issue(identifier);
    const team = await issue.team;

    if (!team) {
      throw new Error(`Cannot transition ${identifier}: issue has no team`);
    }

    const statesConnection = await team.states();
    const matchingState = statesConnection.nodes.find(
      s => s.name.toLowerCase() === targetState.toLowerCase(),
    );

    if (!matchingState) {
      const available = statesConnection.nodes.map(s => s.name).join(', ');
      throw new Error(
        `Cannot transition ${identifier} to "${targetState}": state not found. Available: ${available}`,
      );
    }

    await issue.update({ stateId: matchingState.id });
  }

  async getLabels(key: IIssueKey): Promise<string[]> {
    const issue = await this.findIssue(key);
    return issue ? [...issue.labels] : [];
  }
}
