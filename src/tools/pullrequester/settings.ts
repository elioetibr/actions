import type { IAgent } from '../../agents/interfaces';
import type { DraftMode, TrackerType } from '../../actions/pullrequester/Why ';
import { parseCommaSeparated } from '../../libs/utils';

const VALID_TRACKER_TYPES: readonly TrackerType[] = ['github', 'linear', 'jira'];
const VALID_KEY_SOURCES = ['branch', 'commits', 'both'] as const;
const VALID_DRAFT_MODES: readonly DraftMode[] = ['true', 'false', 'always-true'];

type IssueKeySource = (typeof VALID_KEY_SOURCES)[number];

/**
 * Input settings for PullRequester operations.
 * Types are validated at parse time — no downstream `as` casts needed.
 */
export interface IPullRequesterSettings {
  // Core PR
  token: string;
  branch: string;
  base: string;
  title: string;
  body: string;
  bodyPath: string;
  bodyTemplate: string;
  commitMessage: string;
  author: string;
  committer: string;
  signoff: boolean;
  signCommits: boolean;
  labels: string[];
  assignees: string[];
  reviewers: string[];
  teamReviewers: string[];
  milestone: number;
  draft: DraftMode;
  addPaths: string[];
  deleteBranch: boolean;
  maintainerCanModify: boolean;
  skipOnCollaboratorCommits: boolean;
  // Smart features
  autoBody: boolean;
  conflictLabel: string;
  autoLabelFromIssue: boolean;
  commentMarkerId: string;
  // Project management
  projectManagement: TrackerType;
  issueKeySource: IssueKeySource;
  issueLinkPr: boolean;
  issueAddComment: boolean;
  issueTransitionState: string;
  // Linear
  linearApiKey: string;
  linearTeamKey: string;
  // Jira
  jiraBaseUrl: string;
  jiraUserEmail: string;
  jiraApiToken: string;
}

/**
 * Parse and validate the project-management input.
 * @throws Error if the value is not a valid TrackerType
 */
function parseTrackerType(raw: string): TrackerType {
  const value = raw || 'github';
  if (VALID_TRACKER_TYPES.includes(value as TrackerType)) {
    return value as TrackerType;
  }
  throw new Error(
    `Invalid project-management value "${value}". Must be one of: ${VALID_TRACKER_TYPES.join(', ')}`,
  );
}

/**
 * Parse and validate the issue-key-source input.
 * @throws Error if the value is not valid
 */
function parseIssueKeySource(raw: string): IssueKeySource {
  const value = raw || 'both';
  if ((VALID_KEY_SOURCES as readonly string[]).includes(value)) {
    return value as IssueKeySource;
  }
  throw new Error(
    `Invalid issue-key-source value "${value}". Must be one of: ${VALID_KEY_SOURCES.join(', ')}`,
  );
}

/**
 * Parse and validate the draft input.
 * @throws Error if the value is not a valid DraftMode
 */
function parseDraftMode(raw: string): DraftMode {
  const value = raw || 'false';
  if (VALID_DRAFT_MODES.includes(value as DraftMode)) {
    return value as DraftMode;
  }
  throw new Error(
    `Invalid draft value "${value}". Must be one of: ${VALID_DRAFT_MODES.join(', ')}`,
  );
}

/**
 * Parse and validate the milestone input.
 * Returns 0 if empty/unset, throws if non-numeric.
 */
function parseMilestone(raw: string): number {
  if (!raw) return 0;
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid milestone value "${raw}". Must be a non-negative integer.`);
  }
  return parsed;
}

/**
 * Get PullRequester settings from agent inputs.
 * Validates narrow-typed fields at this boundary.
 */
export function getSettings(agent: IAgent): IPullRequesterSettings {
  const bodyPath = agent.getInput('body-path');

  return {
    token: agent.getInput('token', true),
    branch: agent.getInput('branch') || 'pullrequester/patch',
    base: agent.getInput('base') || process.env.GITHUB_REF_NAME || '',
    title: agent.getInput('title') || 'Automated changes',
    body: agent.getInput('body') || '',
    bodyPath,
    bodyTemplate: agent.getInput('body-template') || '',
    commitMessage: agent.getInput('commit-message') || '[pullrequester] automated change',
    author:
      agent.getInput('author') ||
      'github-actions[bot] <github-actions[bot]@users.noreply.github.com>',
    committer:
      agent.getInput('committer') ||
      'github-actions[bot] <github-actions[bot]@users.noreply.github.com>',
    signoff: agent.getBooleanInput('signoff'),
    signCommits: agent.getBooleanInput('sign-commits'),
    labels: parseCommaSeparated(agent.getInput('labels')),
    assignees: parseCommaSeparated(agent.getInput('assignees')),
    reviewers: parseCommaSeparated(agent.getInput('reviewers')),
    teamReviewers: parseCommaSeparated(agent.getInput('team-reviewers')),
    milestone: parseMilestone(agent.getInput('milestone')),
    draft: parseDraftMode(agent.getInput('draft')),
    addPaths: parseCommaSeparated(agent.getInput('add-paths')),
    deleteBranch: agent.getBooleanInput('delete-branch'),
    maintainerCanModify: agent.getBooleanInput('maintainer-can-modify'),
    skipOnCollaboratorCommits: agent.getBooleanInput('skip-on-collaborator-commits'),
    autoBody: agent.getBooleanInput('auto-body'),
    conflictLabel: agent.getInput('conflict-label') || '',
    autoLabelFromIssue: agent.getBooleanInput('auto-label-from-issue'),
    commentMarkerId: agent.getInput('comment-marker-id') || 'pullrequester',
    projectManagement: parseTrackerType(agent.getInput('project-management')),
    issueKeySource: parseIssueKeySource(agent.getInput('issue-key-source')),
    issueLinkPr: agent.getBooleanInput('issue-link-pr'),
    issueAddComment: agent.getBooleanInput('issue-add-comment'),
    issueTransitionState: agent.getInput('issue-transition-state') || '',
    linearApiKey: agent.getInput('linear-api-key') || '',
    linearTeamKey: agent.getInput('linear-team-key') || '',
    jiraBaseUrl: agent.getInput('jira-base-url') || '',
    jiraUserEmail: agent.getInput('jira-user-email') || '',
    jiraApiToken: agent.getInput('jira-api-token') || '',
  };
}
