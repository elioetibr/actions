import { IApprovalResult } from './IApprovalResult';
import { IDeploymentGateProvider } from './IDeploymentGateProvider';

/**
 * Represents a comment on a GitHub issue
 */
export interface IIssueComment {
  /** Comment author's GitHub username */
  readonly user: string;

  /** Comment body text */
  readonly body: string;
}

/**
 * Result of creating an approval issue
 */
export interface IApprovalIssue {
  /** Issue number */
  readonly number: number;

  /** Issue HTML URL */
  readonly url: string;
}

/**
 * Service interface for deployment gate operations
 * Handles GitHub API interactions for the approval workflow
 */
export interface IDeploymentGateService extends IDeploymentGateProvider {
  /**
   * Resolve approvers list, expanding org team slugs into individual usernames
   * @param org - GitHub organization for team expansion
   * @param excludeActor - Username to exclude (workflow initiator)
   */
  resolveApprovers(org: string, excludeActor?: string): Promise<string[]>;

  /**
   * Create the approval issue on GitHub
   * @returns Issue number and URL
   */
  createApprovalIssue(): Promise<IApprovalIssue>;

  /**
   * Fetch all comments on an issue (with pagination)
   * @param issueNumber - The issue to fetch comments from
   */
  getIssueComments(issueNumber: number): Promise<IIssueComment[]>;

  /**
   * Close an issue with a status comment
   * @param issueNumber - The issue to close
   * @param comment - Comment to post before closing
   */
  closeIssue(issueNumber: number, comment: string): Promise<void>;

  /**
   * Evaluate comments against the approval criteria
   * @param comments - Issue comments to evaluate
   * @returns Approval result with status and details
   */
  evaluateApproval(comments: IIssueComment[]): IApprovalResult;
}
