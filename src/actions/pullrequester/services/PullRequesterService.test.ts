import { PullRequesterService } from './PullRequesterService';
import type { IOctokitPRClient } from './PullRequesterService';
import type { IGitService } from './GitService';
import type {
  DraftMode,
  IIssueKey,
  IIssueTracker,
  IPullRequesterProvider,
  TrackerType,
} from '../interfaces';
import type { ICommitEntry } from '../parsers/CommitLogParser';

// --- Mock factories ---

function createMockGit(overrides: Partial<IGitService> = {}): IGitService {
  return {
    hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(true),
    getChangedFiles: jest.fn<Promise<string[]>, [string[]?]>().mockResolvedValue(['file.ts']),
    createBranch: jest.fn<Promise<void>, [string, string?]>().mockResolvedValue(undefined),
    commitChanges: jest
      .fn<Promise<string>, [string, string?, boolean?]>()
      .mockResolvedValue('abc1234'),
    pushBranch: jest.fn<Promise<void>, [string, boolean?]>().mockResolvedValue(undefined),
    hasDiffWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
    hasCollaboratorCommits: jest
      .fn<Promise<boolean>, [string, string, string]>()
      .mockResolvedValue(false),
    hasConflictsWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(false),
    getCommitLog: jest
      .fn<Promise<ICommitEntry[]>, [string, string?]>()
      .mockResolvedValue([
        { sha: 'abc1234def', subject: 'add login page', body: '', type: 'feat', isBreaking: false },
      ]),
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

function createMockTracker(overrides: Partial<IIssueTracker> = {}): IIssueTracker {
  return {
    type: 'github' as TrackerType,
    findIssue: jest.fn().mockResolvedValue(undefined),
    linkPullRequest: jest.fn().mockResolvedValue(undefined),
    upsertComment: jest.fn().mockResolvedValue(false),
    transitionIssue: jest.fn().mockResolvedValue(undefined),
    getLabels: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function createConfig(overrides: Partial<IPullRequesterProvider> = {}): IPullRequesterProvider {
  return {
    token: 'ghp_test-token',
    branch: 'pullrequester/patch',
    base: 'main',
    title: 'Automated changes',
    body: '',
    bodyPath: '',
    bodyTemplate: '',
    commitMessage: 'chore: automated changes',
    author: 'Bot <bot@users.noreply.github.com>',
    committer: 'Bot <bot@users.noreply.github.com>',
    signoff: false,
    signCommits: false,
    labels: [],
    assignees: [],
    reviewers: [],
    teamReviewers: [],
    milestone: 0,
    draft: 'false',
    addPaths: [],
    deleteBranch: false,
    maintainerCanModify: true,
    skipOnCollaboratorCommits: true,
    autoBody: false,
    conflictLabel: '',
    autoLabelFromIssue: false,
    commentMarkerId: 'pullrequester',
    projectManagement: 'github',
    issueKeySource: 'both',
    issueLinkPr: false,
    issueAddComment: false,
    issueTransitionState: '',
    linearApiKey: '',
    linearTeamKey: '',
    jiraBaseUrl: '',
    jiraUserEmail: '',
    jiraApiToken: '',
    ...overrides,
  };
}

function createService(
  options: {
    config?: Partial<IPullRequesterProvider>;
    git?: Partial<IGitService>;
    octokit?: Parameters<typeof createMockOctokit>[0];
    tracker?: IIssueTracker | undefined;
    owner?: string;
    repo?: string;
  } = {},
): {
  service: PullRequesterService;
  git: IGitService;
  octokit: IOctokitPRClient;
  tracker: IIssueTracker | undefined;
} {
  const config = createConfig(options.config);
  const git = createMockGit(options.git);
  const octokit = createMockOctokit(options.octokit);
  const tracker = options.tracker !== undefined ? options.tracker : undefined;

  const service = new PullRequesterService(
    config,
    git,
    octokit,
    tracker,
    options.owner ?? 'test-owner',
    options.repo ?? 'test-repo',
  );

  return { service, git, octokit, tracker };
}

describe('PullRequesterService', () => {
  describe('static helpers', () => {
    describe('extractName', () => {
      it('should extract name from "Name <email>" format', () => {
        expect(PullRequesterService.extractName('Bot User <bot@example.com>')).toBe('Bot User');
      });

      it('should return trimmed string when no angle brackets', () => {
        expect(PullRequesterService.extractName('JustAName')).toBe('JustAName');
      });

      it('should handle empty string', () => {
        expect(PullRequesterService.extractName('')).toBe('');
      });
    });

    describe('extractEmail', () => {
      it('should extract email from "Name <email>" format', () => {
        expect(PullRequesterService.extractEmail('Bot <bot@example.com>')).toBe('bot@example.com');
      });

      it('should return empty string when no angle brackets', () => {
        expect(PullRequesterService.extractEmail('NoEmail')).toBe('');
      });

      it('should return empty string for empty input', () => {
        expect(PullRequesterService.extractEmail('')).toBe('');
      });
    });

    describe('renderTemplate', () => {
      it('should replace all placeholders', () => {
        const template = '{{greeting}} {{name}}! You have {{count}} items.';
        const vars = { greeting: 'Hello', name: 'World', count: '5' };
        expect(PullRequesterService.renderTemplate(template, vars)).toBe(
          'Hello World! You have 5 items.',
        );
      });

      it('should leave unknown placeholders untouched', () => {
        const template = '{{known}} and {{unknown}}';
        const vars = { known: 'replaced' };
        expect(PullRequesterService.renderTemplate(template, vars)).toBe(
          'replaced and {{unknown}}',
        );
      });

      it('should handle empty template', () => {
        expect(PullRequesterService.renderTemplate('', { key: 'val' })).toBe('');
      });

      it('should replace multiple occurrences of the same placeholder', () => {
        const template = '{{x}} and {{x}} again';
        expect(PullRequesterService.renderTemplate(template, { x: 'A' })).toBe('A and A again');
      });
    });

    describe('truncateBody', () => {
      it('should return body unchanged when within limit', () => {
        const body = 'Short body';
        expect(PullRequesterService.truncateBody(body)).toBe(body);
      });

      it('should return body unchanged at exactly 65536 characters', () => {
        const body = 'x'.repeat(65536);
        expect(PullRequesterService.truncateBody(body)).toBe(body);
        expect(PullRequesterService.truncateBody(body).length).toBe(65536);
      });

      it('should truncate body exceeding 65536 characters with notice', () => {
        const body = 'y'.repeat(65537);
        const result = PullRequesterService.truncateBody(body);
        expect(result.length).toBeLessThanOrEqual(65536);
        expect(result).toContain('Body truncated due to GitHub character limit.');
      });

      it('should truncate large body and maintain total length within limit', () => {
        const body = 'z'.repeat(100_000);
        const result = PullRequesterService.truncateBody(body);
        expect(result.length).toBeLessThanOrEqual(65536);
        expect(result.endsWith('*Body truncated due to GitHub character limit.*')).toBe(true);
      });
    });
  });

  describe('construction', () => {
    it('should accept config and dependencies without error', () => {
      const config = createConfig({
        token: 'test-token',
        branch: 'feature/test',
        base: 'develop',
      });

      const service = new PullRequesterService(
        config,
        createMockGit(),
        createMockOctokit(),
        undefined,
        'owner',
        'repo',
      );

      // Service only exposes execute() — config is private
      expect(service).toBeDefined();
      expect(typeof service.execute).toBe('function');
    });
  });

  describe('execute', () => {
    describe('Step 1: Configure git', () => {
      it('should configure credentials and user from committer field', async () => {
        const { service, git } = createService({
          config: { committer: 'My Bot <mybot@example.com>' },
        });

        await service.execute();

        expect(git.configureCredentials).toHaveBeenCalledWith('ghp_test-token');
        expect(git.configureUser).toHaveBeenCalledWith('My Bot', 'mybot@example.com');
      });
    });

    describe('Step 2: No changes and no existing PR', () => {
      it('should return Skipped when no changes and no existing PR', async () => {
        const { service } = createService({
          git: { hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(false) },
        });

        const result = await service.execute();

        expect(result.operation).toBe('skipped');
        expect(result.pullRequestBranch).toBe('pullrequester/patch');
        expect(result.issuesLinked).toEqual([]);
        expect(result.hasConflicts).toBe(false);
      });
    });

    describe('Step 3: Create branch', () => {
      it('should create branch from base', async () => {
        const { service, git } = createService({
          config: { branch: 'my-branch', base: 'develop' },
        });

        await service.execute();

        expect(git.createBranch).toHaveBeenCalledWith('my-branch', 'develop');
      });
    });

    describe('Step 4: Collaborator commits', () => {
      it('should return SkippedCollaborator when collaborator commits found', async () => {
        const { service } = createService({
          config: {
            skipOnCollaboratorCommits: true,
            author: 'Bot <bot@test.com>',
          },
          git: {
            hasCollaboratorCommits: jest
              .fn<Promise<boolean>, [string, string, string]>()
              .mockResolvedValue(true),
          },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 42, html_url: 'https://github.com/o/r/pull/42', draft: false }],
            }),
          },
        });

        const result = await service.execute();

        expect(result.operation).toBe('skipped-collaborator');
      });

      it('should not check collaborator commits when skipOnCollaboratorCommits is false', async () => {
        const hasCollabs = jest
          .fn<Promise<boolean>, [string, string, string]>()
          .mockResolvedValue(true);
        const { service, git } = createService({
          config: { skipOnCollaboratorCommits: false },
          git: { hasCollaboratorCommits: hasCollabs },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 42, html_url: 'https://github.com/o/r/pull/42', draft: false }],
            }),
          },
        });

        const result = await service.execute();

        expect(git.hasCollaboratorCommits).not.toHaveBeenCalled();
        expect(result.operation).not.toBe('skipped-collaborator');
      });

      it('should not check collaborator commits when no existing PR', async () => {
        const hasCollabs = jest
          .fn<Promise<boolean>, [string, string, string]>()
          .mockResolvedValue(true);
        const { service, git } = createService({
          config: { skipOnCollaboratorCommits: true },
          git: { hasCollaboratorCommits: hasCollabs },
        });

        await service.execute();

        expect(git.hasCollaboratorCommits).not.toHaveBeenCalled();
      });
    });

    describe('Step 5: Merge conflicts', () => {
      it('should detect merge conflicts', async () => {
        const { service } = createService({
          git: {
            hasConflictsWithBase: jest
              .fn<Promise<boolean>, [string, string]>()
              .mockResolvedValue(true),
          },
        });

        const result = await service.execute();

        expect(result.hasConflicts).toBe(true);
      });
    });

    describe('Step 6: Commit changes', () => {
      it('should commit with author and signoff', async () => {
        const { service, git } = createService({
          config: {
            author: 'Test <test@test.com>',
            signoff: true,
            commitMessage: 'fix: something',
          },
        });

        await service.execute();

        expect(git.commitChanges).toHaveBeenCalledWith(
          'fix: something',
          'Test <test@test.com>',
          true,
        );
      });

      it('should skip commit when no changes', async () => {
        const { service, git } = createService({
          git: { hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(false) },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 10, html_url: 'https://github.com/o/r/pull/10', draft: false }],
            }),
          },
        });

        await service.execute();

        expect(git.commitChanges).not.toHaveBeenCalled();
      });

      it('should return headSha from commit', async () => {
        const { service } = createService({
          git: {
            commitChanges: jest
              .fn<Promise<string>, [string, string?, boolean?]>()
              .mockResolvedValue('deadbeef123'),
          },
        });

        const result = await service.execute();

        expect(result.headSha).toBe('deadbeef123');
      });
    });

    describe('Step 6b: No diff after commit (Closed)', () => {
      it('should return Closed when no diff remains and PR exists', async () => {
        const { service } = createService({
          git: {
            hasDiffWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(false),
          },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 99, html_url: 'https://github.com/o/r/pull/99', draft: false }],
            }),
          },
        });

        const result = await service.execute();

        expect(result.operation).toBe('closed');
        expect(result.pullRequestNumber).toBe(99);
        expect(result.pullRequestUrl).toBe('https://github.com/o/r/pull/99');
      });
    });

    describe('Step 7: Push branch', () => {
      it('should force push when updating an existing PR', async () => {
        const { service, git } = createService({
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 5, html_url: 'https://github.com/o/r/pull/5', draft: false }],
            }),
          },
        });

        await service.execute();

        expect(git.pushBranch).toHaveBeenCalledWith('pullrequester/patch', true);
      });

      it('should not force push when creating a new PR', async () => {
        const { service, git } = createService();

        await service.execute();

        expect(git.pushBranch).toHaveBeenCalledWith('pullrequester/patch', false);
      });

      it('should force push regardless of skipOnCollaboratorCommits when PR exists', async () => {
        const { service, git } = createService({
          config: { skipOnCollaboratorCommits: true },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 5, html_url: 'https://github.com/o/r/pull/5', draft: false }],
            }),
          },
        });

        await service.execute();

        expect(git.pushBranch).toHaveBeenCalledWith('pullrequester/patch', true);
      });
    });

    describe('Step 8: Extract issue keys', () => {
      it('should extract keys from branch when source is branch', async () => {
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-123-add-login',
            issueKeySource: 'branch',
            projectManagement: 'jira',
          },
        });

        const result = await service.execute();

        // Keys are always reported in result, even without tracker linking
        expect(result.issuesLinked.length).toBe(1);
        expect(result.issuesLinked[0].raw).toBe('PROJ-123');
      });

      it('should extract keys from commits when source is commits', async () => {
        const { service } = createService({
          config: {
            commitMessage: 'fix(PROJ-456): resolve bug',
            issueKeySource: 'commits',
            projectManagement: 'jira',
            issueLinkPr: true,
          },
          tracker: createMockTracker(),
        });

        const result = await service.execute();

        expect(result.issuesLinked.length).toBe(1);
        expect(result.issuesLinked[0].raw).toBe('PROJ-456');
      });

      it('should extract from both sources and deduplicate', async () => {
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-123-login',
            commitMessage: 'fix(PROJ-123): resolve bug for PROJ-789',
            issueKeySource: 'both',
            projectManagement: 'jira',
            issueLinkPr: true,
          },
          tracker: createMockTracker(),
        });

        const result = await service.execute();

        const raws = result.issuesLinked.map(k => k.raw);
        expect(raws).toContain('PROJ-123');
        expect(raws).toContain('PROJ-789');
        // PROJ-123 should only appear once (deduplicated)
        expect(raws.filter(r => r === 'PROJ-123').length).toBe(1);
      });

      it('should extract github issue keys', async () => {
        const { service } = createService({
          config: {
            branch: 'fix/issue-42',
            commitMessage: 'fix: resolve #42',
            issueKeySource: 'commits',
            projectManagement: 'github',
            issueLinkPr: true,
          },
          tracker: createMockTracker(),
        });

        const result = await service.execute();

        expect(result.issuesLinked.length).toBe(1);
        expect(result.issuesLinked[0].number).toBe(42);
      });
    });

    describe('Step 10: Fetch issue labels', () => {
      it('should fetch labels from tracker when autoLabelFromIssue is true', async () => {
        const tracker = createMockTracker({
          getLabels: jest.fn().mockResolvedValue(['bug', 'critical']),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-123',
            commitMessage: 'feat: something',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            autoLabelFromIssue: true,
          },
          tracker,
        });

        const result = await service.execute();

        expect(result.labelsFromIssue).toEqual(['bug', 'critical']);
      });

      it('should return empty when autoLabelFromIssue is false', async () => {
        const tracker = createMockTracker({
          getLabels: jest.fn().mockResolvedValue(['bug']),
        });

        const { service } = createService({
          config: { autoLabelFromIssue: false },
          tracker,
        });

        const result = await service.execute();

        expect(result.labelsFromIssue).toEqual([]);
      });

      it('should return empty when no tracker', async () => {
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-123',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            autoLabelFromIssue: true,
          },
        });

        const result = await service.execute();

        expect(result.labelsFromIssue).toEqual([]);
      });

      it('should continue when getLabels throws', async () => {
        const tracker = createMockTracker({
          getLabels: jest.fn().mockRejectedValue(new Error('API error')),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-123',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            autoLabelFromIssue: true,
          },
          tracker,
        });

        const result = await service.execute();

        expect(result.labelsFromIssue).toEqual([]);
        expect(result.operation).not.toBe('skipped');
      });

      it('should deduplicate labels across multiple issues', async () => {
        let callCount = 0;
        const tracker = createMockTracker({
          getLabels: jest.fn().mockImplementation(() => {
            callCount++;
            return callCount === 1
              ? Promise.resolve(['bug', 'enhancement'])
              : Promise.resolve(['bug', 'ui']);
          }),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-123/PROJ-456',
            commitMessage: 'feat: something',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            autoLabelFromIssue: true,
          },
          tracker,
        });

        const result = await service.execute();

        expect(result.labelsFromIssue).toEqual(
          expect.arrayContaining(['bug', 'enhancement', 'ui']),
        );
        // 'bug' should only appear once
        expect(result.labelsFromIssue.filter(l => l === 'bug').length).toBe(1);
      });
    });

    describe('Step 11: Create or update PR', () => {
      it('should create a new PR when none exists', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({ octokit: { create } });

        const result = await service.execute();

        expect(result.operation).toBe('created');
        expect(result.pullRequestNumber).toBe(1);
        expect(result.pullRequestUrl).toBe('https://github.com/o/r/pull/1');
        expect(create).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: 'test-owner',
            repo: 'test-repo',
            head: 'pullrequester/patch',
            base: 'main',
            title: 'Automated changes',
            draft: false,
            maintainer_can_modify: true,
          }),
        );
      });

      it('should update an existing PR', async () => {
        const update = jest.fn().mockResolvedValue({
          data: { number: 42, html_url: 'https://github.com/o/r/pull/42' },
        });
        const { service } = createService({
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 42, html_url: 'https://github.com/o/r/pull/42', draft: false }],
            }),
            update,
          },
        });

        const result = await service.execute();

        expect(result.operation).toBe('updated');
        expect(result.pullRequestNumber).toBe(42);
        expect(update).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: 'test-owner',
            repo: 'test-repo',
            pull_number: 42,
            title: 'Automated changes',
          }),
        );
      });
    });

    describe('Draft mode', () => {
      it('should create as draft when draft is "true"', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: { draft: 'true' },
          octokit: { create },
        });

        await service.execute();

        expect(create).toHaveBeenCalledWith(expect.objectContaining({ draft: true }));
      });

      it('should preserve existing draft state on update when draft is "true"', async () => {
        const update = jest.fn().mockResolvedValue({
          data: { number: 42, html_url: 'https://github.com/o/r/pull/42' },
        });
        const { service } = createService({
          config: { draft: 'true' },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 42, html_url: 'https://github.com/o/r/pull/42', draft: false }],
            }),
            update,
          },
        });

        await service.execute();

        // Should preserve the existing draft: false
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ draft: false }));
      });

      it('should never use draft when draft is "false"', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: { draft: 'false' },
          octokit: { create },
        });

        await service.execute();

        expect(create).toHaveBeenCalledWith(expect.objectContaining({ draft: false }));
      });

      it('should always use draft when draft is "always-true"', async () => {
        const update = jest.fn().mockResolvedValue({
          data: { number: 42, html_url: 'https://github.com/o/r/pull/42' },
        });
        const { service } = createService({
          config: { draft: 'always-true' },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 42, html_url: 'https://github.com/o/r/pull/42', draft: false }],
            }),
            update,
          },
        });

        await service.execute();

        expect(update).toHaveBeenCalledWith(expect.objectContaining({ draft: true }));
      });

      it('should throw for unknown draft values via assertNever', async () => {
        const { service } = createService({
          config: { draft: 'unknown-value' as DraftMode },
        });

        await expect(service.execute()).rejects.toThrow();
      });
    });

    describe('PR body generation', () => {
      it('should use raw body when no template and autoBody is false', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            body: 'My custom body',
            bodyTemplate: '',
            autoBody: false,
          },
          octokit: { create },
        });

        await service.execute();

        expect(create).toHaveBeenCalledWith(expect.objectContaining({ body: 'My custom body' }));
      });

      it('should render bodyTemplate with variables', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate:
              'Branch: {{branch_name}}\nSummary: {{commit_summary}}\nConflicts: {{conflicts}}',
            branch: 'feature/test',
          },
          git: {
            getCommitLog: jest.fn<Promise<ICommitEntry[]>, [string, string?]>().mockResolvedValue([
              {
                sha: 'abc1234',
                subject: 'add feature',
                body: '',
                type: 'feat',
                isBreaking: false,
              },
            ]),
          },
          octokit: { create },
        });

        await service.execute();

        expect(create).toHaveBeenCalledWith(
          expect.objectContaining({
            body: 'Branch: feature/test\nSummary: add feature\nConflicts: No conflicts',
          }),
        );
      });

      it('should auto-generate body from commit log when autoBody is true', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: { autoBody: true },
          git: {
            getCommitLog: jest.fn<Promise<ICommitEntry[]>, [string, string?]>().mockResolvedValue([
              {
                sha: 'abc1234def',
                subject: 'add login',
                body: '',
                type: 'feat',
                isBreaking: false,
              },
            ]),
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('## Changes');
        expect(callBody).toContain('add login');
      });

      it('should include issue links in auto body', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            autoBody: true,
            branch: 'feature/PROJ-123',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            jiraBaseUrl: 'https://test.atlassian.net',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('## Linked Issues');
        expect(callBody).toContain('[PROJ-123](https://test.atlassian.net/browse/PROJ-123)');
      });

      it('should include conflict warning in auto body', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: { autoBody: true },
          git: {
            hasConflictsWithBase: jest
              .fn<Promise<boolean>, [string, string]>()
              .mockResolvedValue(true),
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('merge conflicts');
      });

      it('should include template variables for issue keys and links', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: 'Keys: {{issue_keys}}\nLinks: {{issue_links}}',
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            jiraBaseUrl: 'https://jira.test.com',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('Keys: PROJ-100');
        expect(callBody).toContain('Links: [PROJ-100](https://jira.test.com/browse/PROJ-100)');
      });

      it('should handle body template with {{body}} placeholder', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: 'Header\n{{body}}\nFooter',
            body: 'Custom content here',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toBe('Header\nCustom content here\nFooter');
      });
    });

    describe('PR metadata (labels, assignees, reviewers, milestone)', () => {
      it('should add labels', async () => {
        const addLabels = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { labels: ['bug', 'enhancement'] },
          octokit: { addLabels },
        });

        await service.execute();

        expect(addLabels).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: 'test-owner',
            repo: 'test-repo',
            issue_number: 1,
            labels: ['bug', 'enhancement'],
          }),
        );
      });

      it('should add conflict label when conflicts detected', async () => {
        const addLabels = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { conflictLabel: 'has-conflicts' },
          git: {
            hasConflictsWithBase: jest
              .fn<Promise<boolean>, [string, string]>()
              .mockResolvedValue(true),
          },
          octokit: { addLabels },
        });

        await service.execute();

        expect(addLabels).toHaveBeenCalledWith(
          expect.objectContaining({
            labels: ['has-conflicts'],
          }),
        );
      });

      it('should merge user labels, issue labels, and conflict label', async () => {
        const addLabels = jest.fn().mockResolvedValue({});
        const tracker = createMockTracker({
          getLabels: jest.fn().mockResolvedValue(['from-issue']),
        });

        const { service } = createService({
          config: {
            labels: ['user-label'],
            conflictLabel: 'conflict',
            autoLabelFromIssue: true,
            branch: 'feature/PROJ-123',
            issueKeySource: 'branch',
            projectManagement: 'jira',
          },
          git: {
            hasConflictsWithBase: jest
              .fn<Promise<boolean>, [string, string]>()
              .mockResolvedValue(true),
          },
          tracker,
          octokit: { addLabels },
        });

        await service.execute();

        expect(addLabels).toHaveBeenCalledWith(
          expect.objectContaining({
            labels: ['user-label', 'from-issue', 'conflict'],
          }),
        );
      });

      it('should not call addLabels when no labels', async () => {
        const addLabels = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { labels: [], conflictLabel: '' },
          octokit: { addLabels },
        });

        await service.execute();

        expect(addLabels).not.toHaveBeenCalled();
      });

      it('should add assignees', async () => {
        const addAssignees = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { assignees: ['alice', 'bob'] },
          octokit: { addAssignees },
        });

        await service.execute();

        expect(addAssignees).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: 'test-owner',
            repo: 'test-repo',
            issue_number: 1,
            assignees: ['alice', 'bob'],
          }),
        );
      });

      it('should not call addAssignees when no assignees', async () => {
        const addAssignees = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { assignees: [] },
          octokit: { addAssignees },
        });

        await service.execute();

        expect(addAssignees).not.toHaveBeenCalled();
      });

      it('should request reviewers', async () => {
        const requestReviewers = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { reviewers: ['charlie'], teamReviewers: ['team-alpha'] },
          octokit: { requestReviewers },
        });

        await service.execute();

        expect(requestReviewers).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: 'test-owner',
            repo: 'test-repo',
            pull_number: 1,
            reviewers: ['charlie'],
            team_reviewers: ['team-alpha'],
          }),
        );
      });

      it('should request only individual reviewers when no team reviewers', async () => {
        const requestReviewers = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { reviewers: ['charlie'], teamReviewers: [] },
          octokit: { requestReviewers },
        });

        await service.execute();

        const callArgs = requestReviewers.mock.calls[0][0] as Record<string, unknown>;
        expect(callArgs).toHaveProperty('reviewers', ['charlie']);
        expect(callArgs).not.toHaveProperty('team_reviewers');
      });

      it('should request only team reviewers when no individual reviewers', async () => {
        const requestReviewers = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { reviewers: [], teamReviewers: ['team-beta'] },
          octokit: { requestReviewers },
        });

        await service.execute();

        const callArgs = requestReviewers.mock.calls[0][0] as Record<string, unknown>;
        expect(callArgs).not.toHaveProperty('reviewers');
        expect(callArgs).toHaveProperty('team_reviewers', ['team-beta']);
      });

      it('should not request reviewers when none configured', async () => {
        const requestReviewers = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { reviewers: [], teamReviewers: [] },
          octokit: { requestReviewers },
        });

        await service.execute();

        expect(requestReviewers).not.toHaveBeenCalled();
      });

      it('should set milestone when configured', async () => {
        const issuesUpdate = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { milestone: 7 },
          octokit: { issuesUpdate },
        });

        await service.execute();

        expect(issuesUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: 'test-owner',
            repo: 'test-repo',
            issue_number: 1,
            milestone: 7,
          }),
        );
      });

      it('should not set milestone when 0', async () => {
        const issuesUpdate = jest.fn().mockResolvedValue({});
        const { service } = createService({
          config: { milestone: 0 },
          octokit: { issuesUpdate },
        });

        await service.execute();

        expect(issuesUpdate).not.toHaveBeenCalled();
      });
    });

    describe('Step 12: Link issues', () => {
      it('should link PR, add comment, and transition issue', async () => {
        const tracker = createMockTracker({
          linkPullRequest: jest.fn().mockResolvedValue(undefined),
          upsertComment: jest.fn().mockResolvedValue(true),
          transitionIssue: jest.fn().mockResolvedValue(undefined),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: true,
            issueAddComment: true,
            commentMarkerId: 'my-marker',
            issueTransitionState: 'In Review',
          },
          tracker,
        });

        const result = await service.execute();

        expect(tracker.linkPullRequest).toHaveBeenCalledWith(
          expect.objectContaining({ raw: 'PROJ-100' }),
          'https://github.com/owner/repo/pull/1',
          'Automated changes',
          1,
        );
        expect(tracker.upsertComment).toHaveBeenCalledWith(
          expect.objectContaining({ raw: 'PROJ-100' }),
          expect.stringContaining('Pull Request #1'),
          'my-marker',
        );
        expect(tracker.transitionIssue).toHaveBeenCalledWith(
          expect.objectContaining({ raw: 'PROJ-100' }),
          'In Review',
        );
        expect(result.commentUpdated).toBe(true);
      });

      it('should not link when issueLinkPr is false', async () => {
        const tracker = createMockTracker();
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: false,
            issueAddComment: false,
            issueTransitionState: '',
          },
          tracker,
        });

        await service.execute();

        expect(tracker.linkPullRequest).not.toHaveBeenCalled();
        expect(tracker.upsertComment).not.toHaveBeenCalled();
        expect(tracker.transitionIssue).not.toHaveBeenCalled();
      });

      it('should not comment when issueAddComment is false', async () => {
        const tracker = createMockTracker();
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: true,
            issueAddComment: false,
          },
          tracker,
        });

        await service.execute();

        expect(tracker.linkPullRequest).toHaveBeenCalled();
        expect(tracker.upsertComment).not.toHaveBeenCalled();
      });

      it('should not comment when commentMarkerId is empty', async () => {
        const tracker = createMockTracker();
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueAddComment: true,
            commentMarkerId: '',
          },
          tracker,
        });

        await service.execute();

        expect(tracker.upsertComment).not.toHaveBeenCalled();
      });

      it('should not transition when issueTransitionState is empty', async () => {
        const tracker = createMockTracker();
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: true,
            issueTransitionState: '',
          },
          tracker,
        });

        await service.execute();

        expect(tracker.transitionIssue).not.toHaveBeenCalled();
      });

      it('should not fail when tracker operation throws', async () => {
        const tracker = createMockTracker({
          linkPullRequest: jest.fn().mockRejectedValue(new Error('API error')),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: true,
          },
          tracker,
        });

        // Should not throw
        const result = await service.execute();
        expect(result.operation).toBe('created');
      });

      it('should return false for commentUpdated when no tracker', async () => {
        const { service } = createService({
          config: {
            branch: 'feature/PROJ-100',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: true,
          },
        });

        const result = await service.execute();

        expect(result.commentUpdated).toBe(false);
      });

      it('should return false for commentUpdated when no issue keys', async () => {
        const tracker = createMockTracker();
        const { service } = createService({
          config: {
            branch: 'no-issue-keys-here',
            commitMessage: 'plain commit',
            issueKeySource: 'both',
            projectManagement: 'jira',
            issueLinkPr: true,
          },
          tracker,
        });

        const result = await service.execute();

        expect(result.commentUpdated).toBe(false);
      });
    });

    describe('Issue link formatting', () => {
      it('should format github issue with project as link', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: '{{issue_links}}',
            branch: 'fix/owner/repo#42',
            issueKeySource: 'branch',
            projectManagement: 'github',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('[owner/repo#42](https://github.com/owner/repo/issues/42)');
      });

      it('should format github issue without project as shorthand', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: '{{issue_links}}',
            commitMessage: 'fix #99',
            issueKeySource: 'commits',
            projectManagement: 'github',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toBe('#99');
      });

      it('should format linear issue as link', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: '{{issue_links}}',
            branch: 'feature/ENG-456',
            issueKeySource: 'branch',
            projectManagement: 'linear',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('[ENG-456](https://linear.app/issue/ENG-456)');
      });

      it('should format jira issue with base URL', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: '{{issue_links}}',
            branch: 'feature/PROJ-789',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            jiraBaseUrl: 'https://myorg.atlassian.net',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toContain('[PROJ-789](https://myorg.atlassian.net/browse/PROJ-789)');
      });

      it('should format jira issue without base URL as raw text', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });
        const { service } = createService({
          config: {
            bodyTemplate: '{{issue_links}}',
            branch: 'feature/PROJ-789',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            jiraBaseUrl: '',
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toBe('PROJ-789');
      });
    });

    describe('Happy path: new PR with all features', () => {
      it('should create PR with labels, assignees, reviewers, and issue linking', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 10, html_url: 'https://github.com/o/r/pull/10' },
        });
        const addLabels = jest.fn().mockResolvedValue({});
        const addAssignees = jest.fn().mockResolvedValue({});
        const requestReviewers = jest.fn().mockResolvedValue({});
        const issuesUpdate = jest.fn().mockResolvedValue({});

        const tracker = createMockTracker({
          getLabels: jest.fn().mockResolvedValue(['tracker-label']),
          linkPullRequest: jest.fn().mockResolvedValue(undefined),
          upsertComment: jest.fn().mockResolvedValue(false),
          transitionIssue: jest.fn().mockResolvedValue(undefined),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-42-new-feature',
            title: 'New Feature',
            labels: ['enhancement'],
            assignees: ['alice'],
            reviewers: ['bob'],
            teamReviewers: ['team-x'],
            milestone: 3,
            autoLabelFromIssue: true,
            conflictLabel: 'conflict',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueLinkPr: true,
            issueAddComment: true,
            commentMarkerId: 'pr-comment',
            issueTransitionState: 'In Progress',
            autoBody: true,
            jiraBaseUrl: 'https://jira.test.com',
          },
          git: {
            hasConflictsWithBase: jest
              .fn<Promise<boolean>, [string, string]>()
              .mockResolvedValue(true),
            commitChanges: jest
              .fn<Promise<string>, [string, string?, boolean?]>()
              .mockResolvedValue('sha123abc'),
          },
          tracker,
          octokit: { create, addLabels, addAssignees, requestReviewers, issuesUpdate },
        });

        const result = await service.execute();

        expect(result.operation).toBe('created');
        expect(result.pullRequestNumber).toBe(10);
        expect(result.pullRequestUrl).toBe('https://github.com/o/r/pull/10');
        expect(result.headSha).toBe('sha123abc');
        expect(result.pullRequestBranch).toBe('feature/PROJ-42-new-feature');
        expect(result.hasConflicts).toBe(true);
        expect(result.labelsFromIssue).toEqual(['tracker-label']);
        expect(result.issuesLinked.length).toBe(1);
        expect(result.issuesLinked[0].raw).toBe('PROJ-42');

        // Labels: user + tracker + conflict
        expect(addLabels).toHaveBeenCalledWith(
          expect.objectContaining({
            labels: ['enhancement', 'tracker-label', 'conflict'],
          }),
        );
        expect(addAssignees).toHaveBeenCalled();
        expect(requestReviewers).toHaveBeenCalled();
        expect(issuesUpdate).toHaveBeenCalledWith(expect.objectContaining({ milestone: 3 }));
        expect(tracker.linkPullRequest).toHaveBeenCalled();
        expect(tracker.upsertComment).toHaveBeenCalled();
        expect(tracker.transitionIssue).toHaveBeenCalledWith(
          expect.objectContaining({ raw: 'PROJ-42' }),
          'In Progress',
        );
      });
    });

    describe('Issue comment body', () => {
      it('should include PR number, title, URL, and branch info', async () => {
        const tracker = createMockTracker({
          upsertComment: jest.fn().mockResolvedValue(false),
        });

        const { service } = createService({
          config: {
            branch: 'feature/PROJ-50',
            base: 'develop',
            title: 'My PR Title',
            issueKeySource: 'branch',
            projectManagement: 'jira',
            issueAddComment: true,
            commentMarkerId: 'test-marker',
          },
          tracker,
        });

        await service.execute();

        const commentCall = (tracker.upsertComment as jest.Mock).mock.calls[0] as unknown[];
        const commentBody = commentCall[1] as string;

        expect(commentBody).toContain('Pull Request #1');
        expect(commentBody).toContain('My PR Title');
        expect(commentBody).toContain('https://github.com/owner/repo/pull/1');
        expect(commentBody).toContain('`feature/PROJ-50`');
        expect(commentBody).toContain('`develop`');
        expect(commentBody).toContain('<!-- pullrequester:test-marker -->');
      });
    });

    describe('No changes but existing PR with diff', () => {
      it('should update existing PR even without local changes', async () => {
        const update = jest.fn().mockResolvedValue({
          data: { number: 5, html_url: 'https://github.com/o/r/pull/5' },
        });

        const { service } = createService({
          config: { skipOnCollaboratorCommits: true },
          git: {
            hasChanges: jest.fn<Promise<boolean>, []>().mockResolvedValue(false),
            hasDiffWithBase: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
          },
          octokit: {
            list: jest.fn().mockResolvedValue({
              data: [{ number: 5, html_url: 'https://github.com/o/r/pull/5', draft: false }],
            }),
            update,
          },
        });

        const result = await service.execute();

        expect(result.operation).toBe('updated');
        expect(result.headSha).toBeUndefined();
      });
    });

    describe('Auto body with empty commit log', () => {
      it('should generate empty body when no commits and no issues', async () => {
        const create = jest.fn().mockResolvedValue({
          data: { number: 1, html_url: 'https://github.com/o/r/pull/1' },
        });

        const { service } = createService({
          config: { autoBody: true },
          git: {
            getCommitLog: jest
              .fn<Promise<ICommitEntry[]>, [string, string?]>()
              .mockResolvedValue([]),
          },
          octokit: { create },
        });

        await service.execute();

        const callBody = (create.mock.calls[0] as Record<string, unknown>[])[0]?.body as string;
        expect(callBody).toBe('');
      });
    });
  });
});
