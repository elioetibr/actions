import { Octokit } from '@octokit/rest';

import { DEFAULT_APPROVED_WORDS, DEFAULT_DENIED_WORDS, evaluateComments } from '../approval';
import {
  IApprovalResult,
  IDeploymentGateService,
  IIssueComment,
  IApprovalIssue,
} from '../interfaces';

/**
 * Maximum characters per issue comment (GitHub limit is 65536)
 */
const MAX_COMMENT_LENGTH = 65536;

export class DeploymentGateService implements IDeploymentGateService {
  private readonly octokit: Octokit;

  private _approvers: string[];

  constructor(
    readonly token: string,
    readonly owner: string,
    readonly repo: string,
    approvers: readonly string[],
    readonly minimumApprovals: number,
    readonly issueTitle: string,
    readonly issueBody: string,
    readonly pollingIntervalSeconds: number,
    readonly failOnDenial: boolean,
    readonly excludeWorkflowInitiator: boolean,
    readonly additionalApprovedWords: readonly string[],
    readonly additionalDeniedWords: readonly string[],
  ) {
    this._approvers = [...approvers];
    this.octokit = new Octokit({ auth: token });
  }

  get approvers(): readonly string[] {
    return this._approvers;
  }

  async resolveApprovers(org: string, excludeActor?: string): Promise<string[]> {
    const resolved: string[] = [];

    for (const entry of this._approvers) {
      const teamSlug = entry.replace(/\./g, '-');
      try {
        const members = await this.octokit.paginate(this.octokit.teams.listMembersInOrg, {
          org,
          team_slug: teamSlug,
          per_page: 100,
        });
        resolved.push(...members.map(m => m.login));
      } catch {
        resolved.push(entry);
      }
    }

    const deduplicated = [...new Map(resolved.map(u => [u.toLowerCase(), u])).values()];

    if (excludeActor) {
      const filtered = deduplicated.filter(u => u.toLowerCase() !== excludeActor.toLowerCase());
      this._approvers = filtered;
      return filtered;
    }

    this._approvers = deduplicated;
    return deduplicated;
  }

  async createApprovalIssue(): Promise<IApprovalIssue> {
    const approverMentions = this._approvers.map(a => `@${a}`).join(', ');

    const allApproved = [...DEFAULT_APPROVED_WORDS, ...this.additionalApprovedWords];
    const allDenied = [...DEFAULT_DENIED_WORDS, ...this.additionalDeniedWords];

    const body = [
      `**Approval required for workflow run.**`,
      '',
      `**Required approvers:** ${approverMentions}`,
      '',
      `**Minimum approvals:** ${this.minimumApprovals > 0 ? this.minimumApprovals : 'all'}`,
      '',
      `To approve, comment with one of: ${allApproved.map(w => `\`${w}\``).join(', ')}`,
      '',
      `To deny, comment with one of: ${allDenied.map(w => `\`${w}\``).join(', ')}`,
    ].join('\n');

    const { data: issue } = await this.octokit.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: this.issueTitle,
      body,
      assignees: this._approvers,
    });

    if (this.issueBody) {
      await this.postBodyAsComments(issue.number, this.issueBody);
    }

    return { number: issue.number, url: issue.html_url };
  }

  async getIssueComments(issueNumber: number): Promise<IIssueComment[]> {
    const comments = await this.octokit.paginate(this.octokit.issues.listComments, {
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      per_page: 100,
    });

    return comments
      .filter((c): c is typeof c & { user: { login: string }; body: string } =>
        Boolean(c.user?.login && c.body),
      )
      .map(c => ({
        user: c.user.login,
        body: c.body,
      }));
  }

  async closeIssue(issueNumber: number, comment: string): Promise<void> {
    await this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body: comment,
    });

    await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      state: 'closed',
    });
  }

  evaluateApproval(comments: IIssueComment[]): IApprovalResult {
    const allApproved = [...DEFAULT_APPROVED_WORDS, ...this.additionalApprovedWords];
    const allDenied = [...DEFAULT_DENIED_WORDS, ...this.additionalDeniedWords];

    return evaluateComments(
      comments,
      this._approvers,
      this.minimumApprovals,
      allApproved,
      allDenied,
    );
  }

  private async postBodyAsComments(issueNumber: number, body: string): Promise<void> {
    const chunks = this.splitIntoChunks(body, MAX_COMMENT_LENGTH);

    for (const chunk of chunks) {
      await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: chunk,
      });
    }
  }

  private splitIntoChunks(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }
      chunks.push(remaining.slice(0, maxLength));
      remaining = remaining.slice(maxLength);
    }

    return chunks;
  }
}
