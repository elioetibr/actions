import type { DraftMode, TrackerType } from './IIssueKey';

/**
 * Read-only configuration for the PullRequester action.
 * Follows Interface Segregation Principle -- consumers that only need
 * configuration data depend on this, not the full service.
 */
export interface IPullRequesterProvider {
  // --- Core PR settings ---

  /** GitHub token for API access */
  readonly token: string;

  /** The branch name for the pull request head */
  readonly branch: string;

  /** The base branch to merge into */
  readonly base: string;

  /** Pull request title */
  readonly title: string;

  /** Pull request body (raw string) */
  readonly body: string;

  /** Path to a file containing the PR body */
  readonly bodyPath: string;

  /** Template string for the PR body (supports placeholders) */
  readonly bodyTemplate: string;

  /** Commit message for the automated commit */
  readonly commitMessage: string;

  /** Git author in "Name <email>" format */
  readonly author: string;

  /** Git committer in "Name <email>" format */
  readonly committer: string;

  /** Whether to add Signed-off-by trailer to the commit */
  readonly signoff: boolean;

  /** Whether to GPG-sign the commits */
  readonly signCommits: boolean;

  /** Labels to apply to the pull request */
  readonly labels: string[];

  /** GitHub usernames to assign to the pull request */
  readonly assignees: string[];

  /** GitHub usernames to request review from */
  readonly reviewers: string[];

  /** GitHub team slugs to request review from */
  readonly teamReviewers: string[];

  /** Milestone number to associate with the pull request */
  readonly milestone: number;

  /** Draft mode: "true", "false", or "always-true" */
  readonly draft: DraftMode;

  /** File paths to add to the commit (glob patterns) */
  readonly addPaths: string[];

  /** Whether to delete the head branch after merge */
  readonly deleteBranch: boolean;

  /** Whether maintainers can push to the head branch */
  readonly maintainerCanModify: boolean;

  /** Whether to skip when collaborator commits are detected on the PR branch */
  readonly skipOnCollaboratorCommits: boolean;

  // --- Smart features ---

  /** Whether to auto-generate PR body from commit log */
  readonly autoBody: boolean;

  /** Label to apply when merge conflicts are detected */
  readonly conflictLabel: string;

  /** Whether to mirror labels from the linked issue to the PR */
  readonly autoLabelFromIssue: boolean;

  /** Hidden marker ID for upsert-based commenting on issues */
  readonly commentMarkerId: string;

  // --- Project Management ---

  /** Which project management tracker to use */
  readonly projectManagement: TrackerType;

  /** Where to extract issue keys from: branch name, commit messages, or both */
  readonly issueKeySource: 'branch' | 'commits' | 'both';

  /** Whether to link the PR to the issue in the tracker */
  readonly issueLinkPr: boolean;

  /** Whether to add/update a comment on the issue */
  readonly issueAddComment: boolean;

  /** Target state to transition the issue to (empty string = no transition) */
  readonly issueTransitionState: string;

  // --- Linear credentials ---

  /** Linear API key for authentication */
  readonly linearApiKey: string;

  /** Linear team key (optional, auto-detected from issue key) */
  readonly linearTeamKey: string;

  // --- Jira credentials ---

  /** Jira instance base URL (e.g., "https://myorg.atlassian.net") */
  readonly jiraBaseUrl: string;

  /** Jira user email for authentication */
  readonly jiraUserEmail: string;

  /** Jira API token for authentication */
  readonly jiraApiToken: string;
}
