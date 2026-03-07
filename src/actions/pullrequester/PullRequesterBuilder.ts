import type { IBuilder } from '../../libs/services/types/interfaces/IBuilder';
import type { DraftMode, IIssueTracker, IPullRequesterService, TrackerType } from './interfaces';
import type { IGitService } from './services/GitService';
import type { IOctokitPRClient } from './services/PullRequesterService';
import { PullRequesterService } from './services/PullRequesterService';

/**
 * Fluent builder for constructing PullRequesterService instances.
 *
 * Uses a standalone builder pattern (not extending BaseIacBuilder)
 * because the PullRequester makes GitHub API calls rather than
 * executing CLI commands.
 */
export class PullRequesterBuilder implements IBuilder<IPullRequesterService> {
  // --- Core PR settings ---
  private _token = '';
  private _branch = 'pullrequester/patch';
  private _base = '';
  private _title = 'Automated changes';
  private _body = '';
  private _bodyPath = '';
  private _bodyTemplate = '';
  private _commitMessage = 'Automated changes';
  private _author = 'github-actions[bot] <github-actions[bot]@users.noreply.github.com>';
  private _committer = 'github-actions[bot] <github-actions[bot]@users.noreply.github.com>';
  private _signoff = false;
  private _signCommits = false;
  private _labels: string[] = [];
  private _assignees: string[] = [];
  private _reviewers: string[] = [];
  private _teamReviewers: string[] = [];
  private _milestone = 0;
  private _draft: DraftMode = 'false';
  private _addPaths: string[] = [];
  private _deleteBranch = false;
  private _maintainerCanModify = true;
  private _skipOnCollaboratorCommits = true;

  // --- Smart features ---
  private _autoBody = false;
  private _conflictLabel = '';
  private _autoLabelFromIssue = false;
  private _commentMarkerId = 'pullrequester';

  // --- Project Management ---
  private _projectManagement: TrackerType = 'github';
  private _issueKeySource: 'branch' | 'commits' | 'both' = 'both';
  private _issueLinkPr = false;
  private _issueAddComment = false;
  private _issueTransitionState = '';

  // --- Linear credentials ---
  private _linearApiKey = '';
  private _linearTeamKey = '';

  // --- Jira credentials ---
  private _jiraBaseUrl = '';
  private _jiraUserEmail = '';
  private _jiraApiToken = '';

  // --- Dependencies ---
  private _git: IGitService | undefined;
  private _octokit: IOctokitPRClient | undefined;
  private _tracker: IIssueTracker | undefined;
  private _owner = '';
  private _repo = '';

  private constructor() {}

  static create(): PullRequesterBuilder {
    return new PullRequesterBuilder();
  }

  // --- Core PR settings ---

  withToken(token: string): this {
    this._token = token;
    return this;
  }

  withBranch(branch: string): this {
    this._branch = branch;
    return this;
  }

  withBase(base: string): this {
    this._base = base;
    return this;
  }

  withTitle(title: string): this {
    this._title = title;
    return this;
  }

  withBody(body: string): this {
    this._body = body;
    return this;
  }

  withBodyPath(bodyPath: string): this {
    this._bodyPath = bodyPath;
    return this;
  }

  withBodyTemplate(bodyTemplate: string): this {
    this._bodyTemplate = bodyTemplate;
    return this;
  }

  withCommitMessage(commitMessage: string): this {
    this._commitMessage = commitMessage;
    return this;
  }

  withAuthor(author: string): this {
    this._author = author;
    return this;
  }

  withCommitter(committer: string): this {
    this._committer = committer;
    return this;
  }

  withSignoff(signoff: boolean): this {
    this._signoff = signoff;
    return this;
  }

  withSignCommits(signCommits: boolean): this {
    this._signCommits = signCommits;
    return this;
  }

  withLabels(labels: string[]): this {
    this._labels = [...labels];
    return this;
  }

  withAssignees(assignees: string[]): this {
    this._assignees = [...assignees];
    return this;
  }

  withReviewers(reviewers: string[]): this {
    this._reviewers = [...reviewers];
    return this;
  }

  withTeamReviewers(teamReviewers: string[]): this {
    this._teamReviewers = [...teamReviewers];
    return this;
  }

  withMilestone(milestone: number): this {
    this._milestone = milestone;
    return this;
  }

  withDraft(draft: DraftMode): this {
    this._draft = draft;
    return this;
  }

  withAddPaths(addPaths: string[]): this {
    this._addPaths = [...addPaths];
    return this;
  }

  withDeleteBranch(deleteBranch: boolean): this {
    this._deleteBranch = deleteBranch;
    return this;
  }

  withMaintainerCanModify(maintainerCanModify: boolean): this {
    this._maintainerCanModify = maintainerCanModify;
    return this;
  }

  withSkipOnCollaboratorCommits(skip: boolean): this {
    this._skipOnCollaboratorCommits = skip;
    return this;
  }

  // --- Smart features ---

  withAutoBody(autoBody: boolean): this {
    this._autoBody = autoBody;
    return this;
  }

  withConflictLabel(conflictLabel: string): this {
    this._conflictLabel = conflictLabel;
    return this;
  }

  withAutoLabelFromIssue(autoLabel: boolean): this {
    this._autoLabelFromIssue = autoLabel;
    return this;
  }

  withCommentMarkerId(markerId: string): this {
    this._commentMarkerId = markerId;
    return this;
  }

  // --- Project Management ---

  withProjectManagement(pm: TrackerType): this {
    this._projectManagement = pm;
    return this;
  }

  withIssueKeySource(source: 'branch' | 'commits' | 'both'): this {
    this._issueKeySource = source;
    return this;
  }

  withIssueLinkPr(link: boolean): this {
    this._issueLinkPr = link;
    return this;
  }

  withIssueAddComment(addComment: boolean): this {
    this._issueAddComment = addComment;
    return this;
  }

  withIssueTransitionState(state: string): this {
    this._issueTransitionState = state;
    return this;
  }

  // --- Linear credentials ---

  withLinearApiKey(key: string): this {
    this._linearApiKey = key;
    return this;
  }

  withLinearTeamKey(key: string): this {
    this._linearTeamKey = key;
    return this;
  }

  // --- Jira credentials ---

  withJiraBaseUrl(url: string): this {
    this._jiraBaseUrl = url;
    return this;
  }

  withJiraUserEmail(email: string): this {
    this._jiraUserEmail = email;
    return this;
  }

  withJiraApiToken(token: string): this {
    this._jiraApiToken = token;
    return this;
  }

  // --- Dependencies ---

  withGitService(git: IGitService): this {
    this._git = git;
    return this;
  }

  withOctokit(octokit: IOctokitPRClient): this {
    this._octokit = octokit;
    return this;
  }

  withTracker(tracker: IIssueTracker): this {
    this._tracker = tracker;
    return this;
  }

  withOwner(owner: string): this {
    this._owner = owner;
    return this;
  }

  withRepo(repo: string): this {
    this._repo = repo;
    return this;
  }

  // --- Build ---

  build(): IPullRequesterService {
    if (!this._token) throw new Error('Token is required');
    if (!this._git) throw new Error('GitService is required');
    if (!this._octokit) throw new Error('Octokit is required');
    if (!this._owner) throw new Error('Owner is required');
    if (!this._repo) throw new Error('Repo is required');
    if (!this._base) throw new Error('Base branch is required');

    return new PullRequesterService(
      {
        token: this._token,
        branch: this._branch,
        base: this._base,
        title: this._title,
        body: this._body,
        bodyPath: this._bodyPath,
        bodyTemplate: this._bodyTemplate,
        commitMessage: this._commitMessage,
        author: this._author,
        committer: this._committer,
        signoff: this._signoff,
        signCommits: this._signCommits,
        labels: this._labels,
        assignees: this._assignees,
        reviewers: this._reviewers,
        teamReviewers: this._teamReviewers,
        milestone: this._milestone,
        draft: this._draft,
        addPaths: this._addPaths,
        deleteBranch: this._deleteBranch,
        maintainerCanModify: this._maintainerCanModify,
        skipOnCollaboratorCommits: this._skipOnCollaboratorCommits,
        autoBody: this._autoBody,
        conflictLabel: this._conflictLabel,
        autoLabelFromIssue: this._autoLabelFromIssue,
        commentMarkerId: this._commentMarkerId,
        projectManagement: this._projectManagement,
        issueKeySource: this._issueKeySource,
        issueLinkPr: this._issueLinkPr,
        issueAddComment: this._issueAddComment,
        issueTransitionState: this._issueTransitionState,
        linearApiKey: this._linearApiKey,
        linearTeamKey: this._linearTeamKey,
        jiraBaseUrl: this._jiraBaseUrl,
        jiraUserEmail: this._jiraUserEmail,
        jiraApiToken: this._jiraApiToken,
      },
      this._git,
      this._octokit,
      this._tracker,
      this._owner,
      this._repo,
    );
  }
}
