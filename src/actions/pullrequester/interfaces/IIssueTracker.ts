import type { IIssueKey, TrackerType } from './IIssueKey';

/**
 * Configuration for a specific issue tracker.
 */
export interface ITrackerConfig {
  /** The type of tracker */
  readonly type: TrackerType;
}

/**
 * An issue found in a tracker.
 */
export interface ITrackerIssue {
  /** The issue key (e.g., "PROJ-123", "#42") */
  readonly key: string;

  /** Issue title/summary */
  readonly title: string;

  /** Current status/state name */
  readonly status: string;

  /** URL to the issue in the tracker UI */
  readonly url: string;

  /** Labels attached to the issue (for auto-label mirroring) */
  readonly labels: readonly string[];
}

/**
 * Discriminated union for tracker credentials.
 * Each tracker type has its own required credentials shape,
 * enforced at the type level.
 */
export type TrackerCredentials =
  | GitHubTrackerCredentials
  | LinearTrackerCredentials
  | JiraTrackerCredentials;

export interface GitHubTrackerCredentials {
  readonly type: 'github';
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
}

export interface LinearTrackerCredentials {
  readonly type: 'linear';
  readonly linearApiKey: string;
  readonly linearTeamKey: string;
}

export interface JiraTrackerCredentials {
  readonly type: 'jira';
  readonly jiraBaseUrl: string;
  readonly jiraUserEmail: string;
  readonly jiraApiToken: string;
}

/**
 * Strategy interface for issue tracker operations.
 * Each tracker (GitHub, Linear, Jira) implements this interface.
 * Only ONE tracker is active per workflow run.
 */
export interface IIssueTracker {
  /** The tracker type this instance handles */
  readonly type: TrackerType;

  /**
   * Find an issue by its key.
   * @param key - The parsed issue key to look up
   * @returns The issue if found, undefined otherwise
   */
  findIssue(key: IIssueKey): Promise<ITrackerIssue | undefined>;

  /**
   * Link a pull request to an issue.
   * - GitHub: appends `Closes #N` to PR body
   * - Linear: creates an attachment on the issue
   * - Jira: creates/updates a remote link on the issue
   * @param key - The issue key
   * @param prUrl - Full URL of the pull request
   * @param prTitle - Title of the pull request
   * @param prNumber - PR number
   */
  linkPullRequest(key: IIssueKey, prUrl: string, prTitle: string, prNumber: number): Promise<void>;

  /**
   * Add or update a comment on an issue, using a marker to find existing comments.
   * Prevents comment spam across CI runs by upserting instead of always creating.
   * @param key - The issue key
   * @param comment - The comment body (Markdown for GitHub/Linear, ADF for Jira)
   * @param markerId - Hidden marker ID to identify this comment for future upserts
   * @returns true if an existing comment was updated, false if a new one was created
   */
  upsertComment(key: IIssueKey, comment: string, markerId: string): Promise<boolean>;

  /**
   * Transition an issue to a target state.
   * - GitHub: only supports open/closed
   * - Linear: queries workflow states, finds matching, updates
   * - Jira: fetches transitions dynamically, executes matching one
   * @param key - The issue key
   * @param targetState - Name of the target state (e.g., "In Review", "closed")
   */
  transitionIssue(key: IIssueKey, targetState: string): Promise<void>;

  /**
   * Get labels from an issue (for auto-label mirroring to PR).
   * @param key - The issue key
   * @returns Array of label names
   */
  getLabels(key: IIssueKey): Promise<string[]>;
}
