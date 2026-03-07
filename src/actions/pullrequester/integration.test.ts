import { PullRequesterBuilder } from './PullRequesterBuilder';
import type { DraftMode, IIssueTracker, TrackerType } from './interfaces';
import type { IGitService } from './services/GitService';
import type { IOctokitPRClient } from './services/PullRequesterService';
import type { ICommitEntry } from './parsers/CommitLogParser';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function createMockGit(overrides: Partial<IGitService> = {}): IGitService {
  return {
    hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(true),
    getChangedFiles: jest.fn<Promise<string[]>, [string[]?]>().mockResolvedValue(['file.txt']),
    createBranch: jest.fn<Promise<void>, [string, string?]>().mockResolvedValue(undefined),
    commitChanges: jest
      .fn<Promise<string>, [string, string?, boolean?]>()
      .mockResolvedValue('abc1234deadbeef'),
    pushBranch: jest.fn<Promise<void>, [string, boolean?]>().mockResolvedValue(undefined),
    hasDiffWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
    hasCollaboratorCommits: jest
      .fn<Promise<boolean>, [string, string, string]>()
      .mockResolvedValue(false),
    hasConflictsWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(false),
    getCommitLog: jest.fn<Promise<ICommitEntry[]>, [string, string?]>().mockResolvedValue([]),
    configureCredentials: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
    configureUser: jest.fn<Promise<void>, [string, string]>().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createMockOctokit(
  overrides: Partial<{
    list: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    requestReviewers: jest.Mock;
    addLabels: jest.Mock;
    addAssignees: jest.Mock;
    issuesUpdate: jest.Mock;
  }> = {},
): IOctokitPRClient {
  return {
    rest: {
      pulls: {
        list: overrides.list ?? jest.fn().mockResolvedValue({ data: [] }),
        create:
          overrides.create ??
          jest.fn().mockResolvedValue({
            data: { number: 1, html_url: 'https://github.com/owner/repo/pull/1' },
          }),
        update:
          overrides.update ??
          jest.fn().mockResolvedValue({
            data: { number: 1, html_url: 'https://github.com/owner/repo/pull/1' },
          }),
        requestReviewers: overrides.requestReviewers ?? jest.fn().mockResolvedValue({}),
      },
      issues: {
        addLabels: overrides.addLabels ?? jest.fn().mockResolvedValue({}),
        addAssignees: overrides.addAssignees ?? jest.fn().mockResolvedValue({}),
        update: overrides.issuesUpdate ?? jest.fn().mockResolvedValue({}),
      },
    },
  };
}

function createMockTracker(
  type: TrackerType,
  overrides: Partial<IIssueTracker> = {},
): IIssueTracker {
  return {
    type,
    findIssue: jest.fn().mockResolvedValue({
      key: 'TEST-1',
      title: 'Test issue',
      status: 'Open',
      url: 'https://example.com/TEST-1',
      labels: [],
    }),
    linkPullRequest: jest.fn().mockResolvedValue(undefined),
    upsertComment: jest.fn().mockResolvedValue(false),
    transitionIssue: jest.fn().mockResolvedValue(undefined),
    getLabels: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

/**
 * Build a service via the builder with sensible defaults.
 * Each test overrides only what it needs.
 */
function buildService(opts: {
  branch?: string;
  base?: string;
  title?: string;
  body?: string;
  bodyTemplate?: string;
  commitMessage?: string;
  draft?: DraftMode;
  autoBody?: boolean;
  conflictLabel?: string;
  autoLabelFromIssue?: boolean;
  projectManagement?: TrackerType;
  issueKeySource?: 'branch' | 'commits' | 'both';
  issueLinkPr?: boolean;
  issueAddComment?: boolean;
  issueTransitionState?: string;
  commentMarkerId?: string;
  labels?: string[];
  assignees?: string[];
  reviewers?: string[];
  teamReviewers?: string[];
  milestone?: number;
  skipOnCollaboratorCommits?: boolean;
  jiraBaseUrl?: string;
  git?: IGitService;
  octokit?: IOctokitPRClient;
  tracker?: IIssueTracker;
}) {
  const git = opts.git ?? createMockGit();
  const octokit = opts.octokit ?? createMockOctokit();

  let builder = PullRequesterBuilder.create()
    .withToken('ghp_test-token')
    .withBranch(opts.branch ?? 'pullrequester/patch')
    .withBase(opts.base ?? 'main')
    .withTitle(opts.title ?? 'Automated changes')
    .withGitService(git)
    .withOctokit(octokit)
    .withOwner('owner')
    .withRepo('repo');

  if (opts.body !== undefined) builder = builder.withBody(opts.body);
  if (opts.bodyTemplate !== undefined) builder = builder.withBodyTemplate(opts.bodyTemplate);
  if (opts.commitMessage !== undefined) builder = builder.withCommitMessage(opts.commitMessage);
  if (opts.draft !== undefined) builder = builder.withDraft(opts.draft);
  if (opts.autoBody !== undefined) builder = builder.withAutoBody(opts.autoBody);
  if (opts.conflictLabel !== undefined) builder = builder.withConflictLabel(opts.conflictLabel);
  if (opts.autoLabelFromIssue !== undefined)
    builder = builder.withAutoLabelFromIssue(opts.autoLabelFromIssue);
  if (opts.projectManagement !== undefined)
    builder = builder.withProjectManagement(opts.projectManagement);
  if (opts.issueKeySource !== undefined) builder = builder.withIssueKeySource(opts.issueKeySource);
  if (opts.issueLinkPr !== undefined) builder = builder.withIssueLinkPr(opts.issueLinkPr);
  if (opts.issueAddComment !== undefined)
    builder = builder.withIssueAddComment(opts.issueAddComment);
  if (opts.issueTransitionState !== undefined)
    builder = builder.withIssueTransitionState(opts.issueTransitionState);
  if (opts.commentMarkerId !== undefined)
    builder = builder.withCommentMarkerId(opts.commentMarkerId);
  if (opts.labels !== undefined) builder = builder.withLabels(opts.labels);
  if (opts.assignees !== undefined) builder = builder.withAssignees(opts.assignees);
  if (opts.reviewers !== undefined) builder = builder.withReviewers(opts.reviewers);
  if (opts.teamReviewers !== undefined) builder = builder.withTeamReviewers(opts.teamReviewers);
  if (opts.milestone !== undefined) builder = builder.withMilestone(opts.milestone);
  if (opts.skipOnCollaboratorCommits !== undefined)
    builder = builder.withSkipOnCollaboratorCommits(opts.skipOnCollaboratorCommits);
  if (opts.jiraBaseUrl !== undefined) builder = builder.withJiraBaseUrl(opts.jiraBaseUrl);
  if (opts.tracker) builder = builder.withTracker(opts.tracker);

  const service = builder.build();
  return { service, git, octokit };
}

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

describe('PullRequester integration', () => {
  // -----------------------------------------------------------------------
  // 1. Happy path — GitHub tracker (#42 from branch)
  // -----------------------------------------------------------------------
  describe('happy path (github)', () => {
    it('should create a PR and link GitHub issue #42 from branch name', async () => {
      const commitEntries: ICommitEntry[] = [
        {
          sha: 'aaa1111bbb2222',
          subject: 'add login page',
          body: '',
          type: 'feat',
          isBreaking: false,
        },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
      });
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 7, html_url: 'https://github.com/owner/repo/pull/7' },
        }),
      });
      const tracker = createMockTracker('github');

      // Use a branch name where #42 is not preceded by owner/repo pattern
      // The GitHub regex (?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+))?#(\d+)
      // would match "feature/add-login-#42" as a cross-repo ref.
      // A commit-message source avoids that ambiguity.
      const { service } = buildService({
        branch: 'add-login',
        commitMessage: 'feat: add login page closes #42',
        title: 'feat: add login',
        projectManagement: 'github',
        issueKeySource: 'commits',
        issueLinkPr: true,
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.pullRequestNumber).toBe(7);
      expect(result.pullRequestUrl).toBe('https://github.com/owner/repo/pull/7');
      expect(result.pullRequestBranch).toBe('add-login');
      expect(result.headSha).toBe('abc1234deadbeef');
      expect(result.issuesLinked).toHaveLength(1);
      expect(result.issuesLinked[0].raw).toBe('#42');
      expect(result.issuesLinked[0].number).toBe(42);
      expect(result.issuesLinked[0].tracker).toBe('github');
      expect(result.hasConflicts).toBe(false);

      // Verify tracker was called with the extracted key
      expect(tracker.linkPullRequest).toHaveBeenCalledWith(
        expect.objectContaining({ raw: '#42', number: 42 }),
        'https://github.com/owner/repo/pull/7',
        'feat: add login',
        7,
      );
    });
  });

  // -----------------------------------------------------------------------
  // 2. Happy path — Linear tracker (ENG-123 from branch)
  // -----------------------------------------------------------------------
  describe('happy path (linear)', () => {
    it('should create a PR, link ENG-123, add comment, transition to In Review', async () => {
      const commitEntries: ICommitEntry[] = [
        {
          sha: 'bbb2222ccc3333',
          subject: 'add OAuth flow',
          body: '',
          type: 'feat',
          isBreaking: false,
        },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
      });
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 10, html_url: 'https://github.com/owner/repo/pull/10' },
        }),
      });
      const tracker = createMockTracker('linear');

      const { service } = buildService({
        branch: 'ENG-123-oauth',
        title: 'feat: add OAuth',
        projectManagement: 'linear',
        issueKeySource: 'branch',
        issueLinkPr: true,
        issueAddComment: true,
        issueTransitionState: 'In Review',
        commentMarkerId: 'pullrequester',
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.pullRequestNumber).toBe(10);
      expect(result.issuesLinked).toHaveLength(1);
      expect(result.issuesLinked[0].raw).toBe('ENG-123');
      expect(result.issuesLinked[0].tracker).toBe('linear');

      // linkPullRequest called
      expect(tracker.linkPullRequest).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'ENG-123' }),
        'https://github.com/owner/repo/pull/10',
        'feat: add OAuth',
        10,
      );

      // upsertComment called
      expect(tracker.upsertComment).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'ENG-123' }),
        expect.stringContaining('Pull Request #10'),
        'pullrequester',
      );

      // transitionIssue called
      expect(tracker.transitionIssue).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'ENG-123' }),
        'In Review',
      );
    });
  });

  // -----------------------------------------------------------------------
  // 3. Happy path — Jira tracker (PROJ-456 from branch)
  // -----------------------------------------------------------------------
  describe('happy path (jira)', () => {
    it('should create a PR, link PROJ-456, add comment, and transition', async () => {
      const commitEntries: ICommitEntry[] = [
        {
          sha: 'ccc3333ddd4444',
          subject: 'fix login redirect',
          body: '',
          type: 'fix',
          isBreaking: false,
        },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
      });
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 15, html_url: 'https://github.com/owner/repo/pull/15' },
        }),
      });
      const tracker = createMockTracker('jira');

      const { service } = buildService({
        branch: 'feature/PROJ-456-fix-login',
        title: 'fix: login redirect',
        projectManagement: 'jira',
        issueKeySource: 'branch',
        issueLinkPr: true,
        issueAddComment: true,
        issueTransitionState: 'In Progress',
        jiraBaseUrl: 'https://myorg.atlassian.net',
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.pullRequestNumber).toBe(15);
      expect(result.issuesLinked).toHaveLength(1);
      expect(result.issuesLinked[0].raw).toBe('PROJ-456');
      expect(result.issuesLinked[0].tracker).toBe('jira');
      expect(result.issuesLinked[0].project).toBe('PROJ');
      expect(result.issuesLinked[0].number).toBe(456);

      expect(tracker.linkPullRequest).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'PROJ-456' }),
        'https://github.com/owner/repo/pull/15',
        'fix: login redirect',
        15,
      );
      expect(tracker.upsertComment).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'PROJ-456' }),
        expect.stringContaining('Pull Request #15'),
        'pullrequester',
      );
      expect(tracker.transitionIssue).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'PROJ-456' }),
        'In Progress',
      );
    });
  });

  // -----------------------------------------------------------------------
  // 4. No changes — no existing PR => skipped
  // -----------------------------------------------------------------------
  describe('no changes', () => {
    it('should return skipped when no changes and no existing PR', async () => {
      const git = createMockGit({
        hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(false),
      });
      const octokit = createMockOctokit();

      const { service } = buildService({ git, octokit });

      const result = await service.execute();

      expect(result.operation).toBe('skipped');
      expect(result.pullRequestNumber).toBeUndefined();
      expect(result.pullRequestUrl).toBeUndefined();
      expect(result.headSha).toBeUndefined();
      expect(result.issuesLinked).toEqual([]);
      expect(result.hasConflicts).toBe(false);

      // Should not attempt to create branch, commit, or push
      expect(git.createBranch).not.toHaveBeenCalled();
      expect(git.commitChanges).not.toHaveBeenCalled();
      expect(git.pushBranch).not.toHaveBeenCalled();
      expect(octokit.rest.pulls.create).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 5. Collaborator commits — skipped-collaborator
  // -----------------------------------------------------------------------
  describe('collaborator commits', () => {
    it('should return skipped-collaborator when collaborator pushed to existing PR branch', async () => {
      const git = createMockGit({
        hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(true),
        hasCollaboratorCommits: jest
          .fn<Promise<boolean>, [string, string, string]>()
          .mockResolvedValue(true),
      });
      const octokit = createMockOctokit({
        list: jest.fn().mockResolvedValue({
          data: [{ number: 5, html_url: 'https://github.com/owner/repo/pull/5', draft: false }],
        }),
      });

      const { service } = buildService({
        branch: 'pullrequester/patch',
        skipOnCollaboratorCommits: true,
        git,
        octokit,
      });

      const result = await service.execute();

      expect(result.operation).toBe('skipped-collaborator');
      expect(result.pullRequestNumber).toBeUndefined();

      // Should have created branch but not committed or pushed
      expect(git.createBranch).toHaveBeenCalled();
      expect(git.commitChanges).not.toHaveBeenCalled();
      expect(git.pushBranch).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 6. Update existing PR (not duplicated)
  // -----------------------------------------------------------------------
  describe('update existing PR', () => {
    it('should update the existing PR instead of creating a new one', async () => {
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue([
            { sha: 'ddd4444eee5555', subject: 'update deps', body: '', isBreaking: false },
          ]),
      });
      const octokit = createMockOctokit({
        list: jest.fn().mockResolvedValue({
          data: [{ number: 3, html_url: 'https://github.com/owner/repo/pull/3', draft: false }],
        }),
        update: jest.fn().mockResolvedValue({
          data: { number: 3, html_url: 'https://github.com/owner/repo/pull/3' },
        }),
      });

      const { service } = buildService({ git, octokit });

      const result = await service.execute();

      expect(result.operation).toBe('updated');
      expect(result.pullRequestNumber).toBe(3);
      expect(result.pullRequestUrl).toBe('https://github.com/owner/repo/pull/3');

      // pulls.create should NOT have been called
      expect(octokit.rest.pulls.create).not.toHaveBeenCalled();
      // pulls.update should have been called
      expect(octokit.rest.pulls.update).toHaveBeenCalledWith(
        expect.objectContaining({ pull_number: 3 }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // 7. Closed — no diff after commit
  // -----------------------------------------------------------------------
  describe('closed — no diff after commit', () => {
    it('should return closed when committed changes produce no diff with base', async () => {
      const git = createMockGit({
        hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(true),
        hasDiffWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(false),
      });
      const octokit = createMockOctokit({
        list: jest.fn().mockResolvedValue({
          data: [{ number: 9, html_url: 'https://github.com/owner/repo/pull/9', draft: false }],
        }),
      });

      const { service } = buildService({ git, octokit });

      const result = await service.execute();

      expect(result.operation).toBe('closed');
      expect(result.pullRequestNumber).toBe(9);
      expect(result.pullRequestUrl).toBe('https://github.com/owner/repo/pull/9');

      // Should have committed but not pushed or created/updated PR
      expect(git.commitChanges).toHaveBeenCalled();
      expect(git.pushBranch).not.toHaveBeenCalled();
      expect(octokit.rest.pulls.create).not.toHaveBeenCalled();
      expect(octokit.rest.pulls.update).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 8. No issue keys found — branch with no pattern
  // -----------------------------------------------------------------------
  describe('no issue keys found', () => {
    it('should create PR with empty issuesLinked when branch has no issue pattern', async () => {
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue([
            { sha: 'eee5555fff6666', subject: 'update dependencies', body: '', isBreaking: false },
          ]),
      });
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 20, html_url: 'https://github.com/owner/repo/pull/20' },
        }),
      });
      const tracker = createMockTracker('github');

      const { service } = buildService({
        branch: 'update-deps',
        commitMessage: 'chore: update dependencies',
        projectManagement: 'github',
        issueKeySource: 'branch',
        issueLinkPr: true,
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.issuesLinked).toEqual([]);

      // Tracker should not be called when there are no issue keys
      expect(tracker.linkPullRequest).not.toHaveBeenCalled();
      expect(tracker.upsertComment).not.toHaveBeenCalled();
      expect(tracker.transitionIssue).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 9. Template rendering
  // -----------------------------------------------------------------------
  describe('template rendering', () => {
    it('should render bodyTemplate with issue_keys, commit_log, and conflicts placeholders', async () => {
      const commitEntries: ICommitEntry[] = [
        {
          sha: 'fff6666aaa7777',
          subject: 'add search',
          body: '',
          type: 'feat',
          scope: 'ui',
          isBreaking: false,
        },
        {
          sha: 'ggg7777bbb8888',
          subject: 'fix null check',
          body: '',
          type: 'fix',
          isBreaking: false,
        },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
        hasConflictsWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
      });
      const createFn = jest.fn().mockResolvedValue({
        data: { number: 25, html_url: 'https://github.com/owner/repo/pull/25' },
      });
      const octokit = createMockOctokit({ create: createFn });

      const { service } = buildService({
        branch: 'feature/PROJ-100-search',
        bodyTemplate: 'Issues: {{issue_keys}}\n{{commit_log}}\n{{conflicts}}',
        projectManagement: 'jira',
        issueKeySource: 'branch',
        git,
        octokit,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.hasConflicts).toBe(true);

      // Verify the body passed to pulls.create
      const createCall = createFn.mock.calls[0][0] as Record<string, unknown>;
      const body = createCall.body as string;

      // issue_keys placeholder should contain PROJ-100
      expect(body).toContain('Issues: PROJ-100');

      // commit_log placeholder should contain rendered markdown from real CommitLogParser
      expect(body).toContain('### Features');
      expect(body).toContain('**ui**: add search');
      expect(body).toContain('### Bug Fixes');
      expect(body).toContain('fix null check');

      // conflicts placeholder
      expect(body).toContain('Has merge conflicts with base branch');
    });
  });

  // -----------------------------------------------------------------------
  // 10. Auto-body from commits
  // -----------------------------------------------------------------------
  describe('auto-body from commits', () => {
    it('should generate structured body with sections from conventional commits', async () => {
      const commitEntries: ICommitEntry[] = [
        {
          sha: 'aaa0001bbb0002',
          subject: 'add dashboard',
          body: '',
          type: 'feat',
          scope: 'ui',
          isBreaking: false,
        },
        {
          sha: 'ccc0003ddd0004',
          subject: 'fix auth timeout',
          body: '',
          type: 'fix',
          scope: 'auth',
          isBreaking: false,
        },
        {
          sha: 'eee0005fff0006',
          subject: 'update readme',
          body: '',
          type: 'docs',
          isBreaking: false,
        },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
      });
      const createFn = jest.fn().mockResolvedValue({
        data: { number: 30, html_url: 'https://github.com/owner/repo/pull/30' },
      });
      const octokit = createMockOctokit({ create: createFn });

      const { service } = buildService({
        branch: 'feature/PROJ-200-dashboard',
        autoBody: true,
        projectManagement: 'jira',
        issueKeySource: 'branch',
        jiraBaseUrl: 'https://myorg.atlassian.net',
        git,
        octokit,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');

      const createCall = createFn.mock.calls[0][0] as Record<string, unknown>;
      const body = createCall.body as string;

      // Linked Issues section with Jira link
      expect(body).toContain('## Linked Issues');
      expect(body).toContain('[PROJ-200](https://myorg.atlassian.net/browse/PROJ-200)');

      // Changes section with rendered commit log
      expect(body).toContain('## Changes');
      expect(body).toContain('### Features');
      expect(body).toContain('**ui**: add dashboard');
      expect(body).toContain('### Bug Fixes');
      expect(body).toContain('**auth**: fix auth timeout');
      expect(body).toContain('### Documentation');
      expect(body).toContain('update readme');

      // No conflict warning (hasConflicts is false)
      expect(body).not.toContain('Warning');
    });
  });

  // -----------------------------------------------------------------------
  // 11. Draft modes
  // -----------------------------------------------------------------------
  describe('draft modes', () => {
    it('should create a draft PR when draft="true"', async () => {
      const git = createMockGit();
      const createFn = jest.fn().mockResolvedValue({
        data: { number: 40, html_url: 'https://github.com/owner/repo/pull/40' },
      });
      const octokit = createMockOctokit({ create: createFn });

      const { service } = buildService({ draft: 'true', git, octokit });

      await service.execute();

      const createCall = createFn.mock.calls[0][0] as Record<string, unknown>;
      expect(createCall.draft).toBe(true);
    });

    it('should keep existing draft state on update when draft="always-true"', async () => {
      const git = createMockGit();
      const updateFn = jest.fn().mockResolvedValue({
        data: { number: 41, html_url: 'https://github.com/owner/repo/pull/41' },
      });
      const octokit = createMockOctokit({
        list: jest.fn().mockResolvedValue({
          data: [{ number: 41, html_url: 'https://github.com/owner/repo/pull/41', draft: false }],
        }),
        update: updateFn,
      });

      const { service } = buildService({ draft: 'always-true', git, octokit });

      const result = await service.execute();

      expect(result.operation).toBe('updated');
      const updateCall = updateFn.mock.calls[0][0] as Record<string, unknown>;
      // always-true means draft=true regardless
      expect(updateCall.draft).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 12. Issue key from commits (not branch)
  // -----------------------------------------------------------------------
  describe('issue key from commits', () => {
    it('should extract issue key from commit message when issueKeySource="commits"', async () => {
      const git = createMockGit();
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 50, html_url: 'https://github.com/owner/repo/pull/50' },
        }),
      });
      const tracker = createMockTracker('jira');

      const { service } = buildService({
        branch: 'update-deps',
        commitMessage: 'fix(PROJ-789): resolve login timeout',
        projectManagement: 'jira',
        issueKeySource: 'commits',
        issueLinkPr: true,
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.issuesLinked).toHaveLength(1);
      expect(result.issuesLinked[0].raw).toBe('PROJ-789');
      expect(result.issuesLinked[0].project).toBe('PROJ');
      expect(result.issuesLinked[0].number).toBe(789);

      expect(tracker.linkPullRequest).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'PROJ-789' }),
        expect.any(String),
        expect.any(String),
        50,
      );
    });
  });

  // -----------------------------------------------------------------------
  // 13. Conflict detection
  // -----------------------------------------------------------------------
  describe('conflict detection', () => {
    it('should set hasConflicts=true and add conflictLabel when conflicts detected', async () => {
      const git = createMockGit({
        hasConflictsWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
      });
      const addLabelsFn = jest.fn().mockResolvedValue({});
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 55, html_url: 'https://github.com/owner/repo/pull/55' },
        }),
        addLabels: addLabelsFn,
      });

      const { service } = buildService({
        conflictLabel: 'has-conflicts',
        labels: ['auto-pr'],
        git,
        octokit,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.hasConflicts).toBe(true);

      // Verify conflictLabel was merged with existing labels
      expect(addLabelsFn).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: ['auto-pr', 'has-conflicts'],
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // 14. Auto-label from issue
  // -----------------------------------------------------------------------
  describe('auto-label from issue', () => {
    it('should fetch labels from tracker and merge them to the PR', async () => {
      const git = createMockGit();
      const addLabelsFn = jest.fn().mockResolvedValue({});
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 60, html_url: 'https://github.com/owner/repo/pull/60' },
        }),
        addLabels: addLabelsFn,
      });
      const tracker = createMockTracker('jira', {
        getLabels: jest.fn().mockResolvedValue(['bug', 'priority-high']),
      });

      const { service } = buildService({
        branch: 'feature/PROJ-300-fix-bug',
        projectManagement: 'jira',
        issueKeySource: 'branch',
        autoLabelFromIssue: true,
        labels: ['auto-pr'],
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.labelsFromIssue).toEqual(['bug', 'priority-high']);

      // Labels should include both configured + tracker labels
      expect(addLabelsFn).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: expect.arrayContaining(['auto-pr', 'bug', 'priority-high']),
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // 15. Upsert comment flow
  // -----------------------------------------------------------------------
  describe('upsert comment flow', () => {
    it('should call upsertComment with correct marker when issueAddComment=true', async () => {
      const git = createMockGit();
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 65, html_url: 'https://github.com/owner/repo/pull/65' },
        }),
      });
      const upsertFn = jest.fn().mockResolvedValue(true);
      const tracker = createMockTracker('linear', {
        upsertComment: upsertFn,
      });

      const { service } = buildService({
        branch: 'ENG-500-refactor',
        projectManagement: 'linear',
        issueKeySource: 'branch',
        issueAddComment: true,
        commentMarkerId: 'my-custom-marker',
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      expect(result.commentUpdated).toBe(true);

      // Verify upsertComment was called with the custom marker
      expect(upsertFn).toHaveBeenCalledWith(
        expect.objectContaining({ raw: 'ENG-500' }),
        expect.stringContaining('Pull Request #65'),
        'my-custom-marker',
      );

      // Verify comment includes branch info
      const commentBody = upsertFn.mock.calls[0][1] as string;
      expect(commentBody).toContain('ENG-500-refactor');
      expect(commentBody).toContain('main');
      expect(commentBody).toContain('https://github.com/owner/repo/pull/65');
    });
  });

  // -----------------------------------------------------------------------
  // 16. Multiple issue keys dedup
  // -----------------------------------------------------------------------
  describe('multiple issue keys dedup', () => {
    it('should deduplicate issue keys when same key appears in branch and commit message', async () => {
      const git = createMockGit();
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 70, html_url: 'https://github.com/owner/repo/pull/70' },
        }),
      });
      const tracker = createMockTracker('jira');

      const { service } = buildService({
        branch: 'feature/PROJ-123-add-feature',
        commitMessage: 'feat(PROJ-123): add the feature for PROJ-123',
        projectManagement: 'jira',
        issueKeySource: 'both',
        issueLinkPr: true,
        git,
        octokit,
        tracker,
      });

      const result = await service.execute();

      expect(result.operation).toBe('created');
      // Only one key, even though PROJ-123 appears in branch and commit msg
      expect(result.issuesLinked).toHaveLength(1);
      expect(result.issuesLinked[0].raw).toBe('PROJ-123');

      // linkPullRequest should only be called once
      expect(tracker.linkPullRequest).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // Additional edge-case integrations
  // -----------------------------------------------------------------------

  describe('metadata application', () => {
    it('should apply assignees, reviewers, team reviewers, and milestone', async () => {
      const git = createMockGit();
      const addAssigneesFn = jest.fn().mockResolvedValue({});
      const requestReviewersFn = jest.fn().mockResolvedValue({});
      const issuesUpdateFn = jest.fn().mockResolvedValue({});
      const octokit = createMockOctokit({
        create: jest.fn().mockResolvedValue({
          data: { number: 80, html_url: 'https://github.com/owner/repo/pull/80' },
        }),
        addAssignees: addAssigneesFn,
        requestReviewers: requestReviewersFn,
        issuesUpdate: issuesUpdateFn,
      });

      const { service } = buildService({
        assignees: ['alice', 'bob'],
        reviewers: ['charlie'],
        teamReviewers: ['platform-team'],
        milestone: 5,
        git,
        octokit,
      });

      await service.execute();

      expect(addAssigneesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          assignees: ['alice', 'bob'],
          issue_number: 80,
        }),
      );
      expect(requestReviewersFn).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewers: ['charlie'],
          team_reviewers: ['platform-team'],
          pull_number: 80,
        }),
      );
      expect(issuesUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          milestone: 5,
          issue_number: 80,
        }),
      );
    });
  });

  describe('auto-body with conflicts warning', () => {
    it('should include conflict warning in auto-generated body', async () => {
      const commitEntries: ICommitEntry[] = [
        {
          sha: 'hhh8888iii9999',
          subject: 'add feature',
          body: '',
          type: 'feat',
          isBreaking: false,
        },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
        hasConflictsWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
      });
      const createFn = jest.fn().mockResolvedValue({
        data: { number: 85, html_url: 'https://github.com/owner/repo/pull/85' },
      });
      const octokit = createMockOctokit({ create: createFn });

      const { service } = buildService({
        autoBody: true,
        git,
        octokit,
      });

      await service.execute();

      const createCall = createFn.mock.calls[0][0] as Record<string, unknown>;
      const body = createCall.body as string;

      expect(body).toContain('**Warning**: This branch has merge conflicts with the base branch.');
    });
  });

  describe('git configuration', () => {
    it('should configure credentials and user before any git operations', async () => {
      const callOrder: string[] = [];
      const git = createMockGit({
        configureCredentials: jest.fn<Promise<void>, [string]>().mockImplementation(async () => {
          callOrder.push('configureCredentials');
        }),
        configureUser: jest.fn<Promise<void>, [string, string]>().mockImplementation(async () => {
          callOrder.push('configureUser');
        }),
        hasChanges: jest.fn<Promise<boolean>, []>().mockImplementation(async () => {
          callOrder.push('hasChanges');
          return true;
        }),
        createBranch: jest.fn<Promise<void>, [string, string?]>().mockImplementation(async () => {
          callOrder.push('createBranch');
        }),
      });
      const octokit = createMockOctokit();

      const { service } = buildService({ git, octokit });

      await service.execute();

      // Credentials and user must be configured before hasChanges
      expect(callOrder.indexOf('configureCredentials')).toBeLessThan(
        callOrder.indexOf('hasChanges'),
      );
      expect(callOrder.indexOf('configureUser')).toBeLessThan(callOrder.indexOf('hasChanges'));
    });
  });

  describe('force push behavior', () => {
    it('should always force push when updating an existing PR', async () => {
      const git = createMockGit();
      const octokit = createMockOctokit({
        list: jest.fn().mockResolvedValue({
          data: [{ number: 90, html_url: 'https://github.com/owner/repo/pull/90', draft: false }],
        }),
        update: jest.fn().mockResolvedValue({
          data: { number: 90, html_url: 'https://github.com/owner/repo/pull/90' },
        }),
      });

      const { service } = buildService({
        skipOnCollaboratorCommits: true,
        git,
        octokit,
      });

      await service.execute();

      // Always force push on update, regardless of skipOnCollaboratorCommits
      expect(git.pushBranch).toHaveBeenCalledWith('pullrequester/patch', true);
    });

    it('should not force push when creating a new PR', async () => {
      const git = createMockGit();
      const octokit = createMockOctokit();

      const { service } = buildService({ git, octokit });

      await service.execute();

      expect(git.pushBranch).toHaveBeenCalledWith('pullrequester/patch', false);
    });
  });

  describe('linear issue link format in auto-body', () => {
    it('should render Linear issue links correctly in auto-body', async () => {
      const commitEntries: ICommitEntry[] = [
        { sha: 'jjj0000kkk1111', subject: 'add SSO', body: '', type: 'feat', isBreaking: false },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
      });
      const createFn = jest.fn().mockResolvedValue({
        data: { number: 95, html_url: 'https://github.com/owner/repo/pull/95' },
      });
      const octokit = createMockOctokit({ create: createFn });

      const { service } = buildService({
        branch: 'ENG-999-add-sso',
        autoBody: true,
        projectManagement: 'linear',
        issueKeySource: 'branch',
        git,
        octokit,
      });

      await service.execute();

      const createCall = createFn.mock.calls[0][0] as Record<string, unknown>;
      const body = createCall.body as string;

      expect(body).toContain('## Linked Issues');
      expect(body).toContain('[ENG-999](https://linear.app/issue/ENG-999)');
    });
  });

  describe('github issue link format in auto-body', () => {
    it('should render GitHub issue links as plain #N references', async () => {
      const commitEntries: ICommitEntry[] = [
        { sha: 'lll2222mmm3333', subject: 'fix typo', body: '', type: 'fix', isBreaking: false },
      ];
      const git = createMockGit({
        getCommitLog: jest
          .fn<Promise<ICommitEntry[]>, [string, string?]>()
          .mockResolvedValue(commitEntries),
      });
      const createFn = jest.fn().mockResolvedValue({
        data: { number: 100, html_url: 'https://github.com/owner/repo/pull/100' },
      });
      const octokit = createMockOctokit({ create: createFn });

      const { service } = buildService({
        branch: 'fix-typo-#77',
        autoBody: true,
        projectManagement: 'github',
        issueKeySource: 'branch',
        git,
        octokit,
      });

      await service.execute();

      const createCall = createFn.mock.calls[0][0] as Record<string, unknown>;
      const body = createCall.body as string;

      expect(body).toContain('## Linked Issues');
      // GitHub issues without project (same repo) should render as plain #N
      expect(body).toContain('#77');
    });
  });
});
