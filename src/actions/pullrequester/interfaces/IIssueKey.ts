/**
 * The type of project management tracker configured for this run.
 * Set via the `project-management` input. Only ONE tracker is active per workflow run.
 */
export type TrackerType = 'github' | 'linear' | 'jira';

/**
 * Draft mode for pull request creation/update.
 * - 'true': create as draft, preserve existing state on update
 * - 'false': never create as draft
 * - 'always-true': always set draft=true on create and update (peter-evans compat)
 */
export type DraftMode = 'true' | 'false' | 'always-true';

/**
 * A parsed issue key extracted from branch names or commit messages.
 */
export interface IIssueKey {
  /** The tracker this key belongs to */
  readonly tracker: TrackerType;

  /** Project identifier (e.g., "PROJ", "ENG", or owner/repo for github) */
  readonly project: string;

  /** Issue number */
  readonly number: number;

  /** Original raw text (e.g., "PROJ-123", "#42", "ENG-456") */
  readonly raw: string;
}
