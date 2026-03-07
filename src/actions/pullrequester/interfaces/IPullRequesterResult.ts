import type { IIssueKey } from './IIssueKey';

/**
 * The operation performed on the pull request.
 * String literal union (not enum) for lightweight runtime representation
 * and compatibility with exhaustive switch via assertNever.
 */
export type PullRequestOperation =
  | 'created'
  | 'updated'
  | 'skipped'
  | 'skipped-collaborator'
  | 'closed';

/**
 * The result of a PullRequester execution.
 */
export interface IPullRequesterResult {
  /** Which operation was performed */
  readonly operation: PullRequestOperation;

  /** The PR number (undefined if skipped) */
  readonly pullRequestNumber?: number;

  /** The full PR URL (undefined if skipped) */
  readonly pullRequestUrl?: string;

  /** The branch name used for the PR */
  readonly pullRequestBranch: string;

  /** The HEAD commit SHA after push (undefined if skipped) */
  readonly headSha?: string;

  /** Issue keys that were linked to the PR */
  readonly issuesLinked: readonly IIssueKey[];

  /** Whether merge conflicts were detected with the base branch */
  readonly hasConflicts: boolean;

  /** Labels mirrored from the issue tracker */
  readonly labelsFromIssue: readonly string[];

  /** Whether an existing comment was updated (true) or a new one created (false) */
  readonly commentUpdated: boolean;
}
