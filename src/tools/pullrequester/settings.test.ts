import type { IAgent } from '../../agents/interfaces';
import { getSettings } from './settings';

function createMockAgent(
  inputOverrides: Record<string, string> = {},
  boolOverrides: Record<string, boolean> = {},
): jest.Mocked<IAgent> {
  const inputs: Record<string, string> = {
    token: 'ghp_test-token',
    branch: '',
    base: '',
    title: '',
    body: '',
    'body-path': '',
    'body-template': '',
    'commit-message': '',
    author: '',
    committer: '',
    labels: '',
    assignees: '',
    reviewers: '',
    'team-reviewers': '',
    milestone: '',
    draft: '',
    'add-paths': '',
    'conflict-label': '',
    'comment-marker-id': '',
    'project-management': '',
    'issue-key-source': '',
    'issue-transition-state': '',
    'linear-api-key': '',
    'linear-team-key': '',
    'jira-base-url': '',
    'jira-user-email': '',
    'jira-api-token': '',
    ...inputOverrides,
  };

  const boolInputs: Record<string, boolean> = {
    signoff: false,
    'sign-commits': false,
    'delete-branch': false,
    'maintainer-can-modify': false,
    'skip-on-collaborator-commits': false,
    'auto-body': false,
    'auto-label-from-issue': false,
    'issue-link-pr': false,
    'issue-add-comment': false,
    ...boolOverrides,
  };

  return {
    getInput: jest.fn((name: string, _required?: boolean) => inputs[name] ?? ''),
    getBooleanInput: jest.fn((name: string, _required?: boolean) => boolInputs[name] ?? false),
    getMultilineInput: jest.fn((_name: string, _required?: boolean) => []),
    setOutput: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    setFailed: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    addPath: jest.fn(),
    exportVariable: jest.fn(),
    exec: jest.fn().mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' }),
    writeSummary: jest.fn().mockResolvedValue(undefined),
  };
}

describe('getSettings', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GITHUB_REF_NAME;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('default values', () => {
    it('should return correct defaults when inputs are empty', () => {
      const agent = createMockAgent();
      const settings = getSettings(agent);

      expect(settings.token).toBe('ghp_test-token');
      expect(settings.branch).toBe('pullrequester/patch');
      expect(settings.base).toBe('');
      expect(settings.title).toBe('Automated changes');
      expect(settings.body).toBe('');
      expect(settings.bodyPath).toBe('');
      expect(settings.bodyTemplate).toBe('');
      expect(settings.commitMessage).toBe('[pullrequester] automated change');
      expect(settings.author).toBe(
        'github-actions[bot] <github-actions[bot]@users.noreply.github.com>',
      );
      expect(settings.committer).toBe(
        'github-actions[bot] <github-actions[bot]@users.noreply.github.com>',
      );
      expect(settings.signoff).toBe(false);
      expect(settings.signCommits).toBe(false);
      expect(settings.labels).toEqual([]);
      expect(settings.assignees).toEqual([]);
      expect(settings.reviewers).toEqual([]);
      expect(settings.teamReviewers).toEqual([]);
      expect(settings.milestone).toBe(0);
      expect(settings.draft).toBe('false');
      expect(settings.addPaths).toEqual([]);
      expect(settings.deleteBranch).toBe(false);
      expect(settings.maintainerCanModify).toBe(false);
      expect(settings.skipOnCollaboratorCommits).toBe(false);
      expect(settings.autoBody).toBe(false);
      expect(settings.conflictLabel).toBe('');
      expect(settings.autoLabelFromIssue).toBe(false);
      expect(settings.commentMarkerId).toBe('pullrequester');
      expect(settings.projectManagement).toBe('github');
      expect(settings.issueKeySource).toBe('both');
      expect(settings.issueLinkPr).toBe(false);
      expect(settings.issueAddComment).toBe(false);
      expect(settings.issueTransitionState).toBe('');
      expect(settings.linearApiKey).toBe('');
      expect(settings.linearTeamKey).toBe('');
      expect(settings.jiraBaseUrl).toBe('');
      expect(settings.jiraUserEmail).toBe('');
      expect(settings.jiraApiToken).toBe('');
    });

    it('should use GITHUB_REF_NAME as base fallback', () => {
      process.env.GITHUB_REF_NAME = 'develop';
      const agent = createMockAgent();
      const settings = getSettings(agent);

      expect(settings.base).toBe('develop');
    });

    it('should prefer explicit base input over GITHUB_REF_NAME', () => {
      process.env.GITHUB_REF_NAME = 'develop';
      const agent = createMockAgent({ base: 'main' });
      const settings = getSettings(agent);

      expect(settings.base).toBe('main');
    });
  });

  describe('token', () => {
    it('should call getInput with required=true for token', () => {
      const agent = createMockAgent();
      getSettings(agent);

      expect(agent.getInput).toHaveBeenCalledWith('token', true);
    });
  });

  describe('custom values', () => {
    it('should pass through non-empty string inputs', () => {
      const agent = createMockAgent({
        branch: 'feature/my-branch',
        title: 'My PR Title',
        body: 'PR body content',
        'body-path': '.github/pr-body.md',
        'body-template': 'template.md',
        'commit-message': 'chore: automated',
        author: 'bot <bot@example.com>',
        committer: 'bot <bot@example.com>',
        'conflict-label': 'conflict',
        'comment-marker-id': 'custom-marker',
        'issue-transition-state': 'done',
        'linear-api-key': 'lin_key',
        'linear-team-key': 'ENG',
        'jira-base-url': 'https://jira.example.com',
        'jira-user-email': 'user@example.com',
        'jira-api-token': 'jira_token',
      });
      const settings = getSettings(agent);

      expect(settings.branch).toBe('feature/my-branch');
      expect(settings.title).toBe('My PR Title');
      expect(settings.body).toBe('PR body content');
      expect(settings.bodyPath).toBe('.github/pr-body.md');
      expect(settings.bodyTemplate).toBe('template.md');
      expect(settings.commitMessage).toBe('chore: automated');
      expect(settings.author).toBe('bot <bot@example.com>');
      expect(settings.committer).toBe('bot <bot@example.com>');
      expect(settings.conflictLabel).toBe('conflict');
      expect(settings.commentMarkerId).toBe('custom-marker');
      expect(settings.issueTransitionState).toBe('done');
      expect(settings.linearApiKey).toBe('lin_key');
      expect(settings.linearTeamKey).toBe('ENG');
      expect(settings.jiraBaseUrl).toBe('https://jira.example.com');
      expect(settings.jiraUserEmail).toBe('user@example.com');
      expect(settings.jiraApiToken).toBe('jira_token');
    });

    it('should parse comma-separated inputs into arrays', () => {
      const agent = createMockAgent({
        labels: 'bug, enhancement, help wanted',
        assignees: 'user1, user2',
        reviewers: 'reviewer1',
        'team-reviewers': 'team-a, team-b',
        'add-paths': 'src/, docs/',
      });
      const settings = getSettings(agent);

      expect(settings.labels).toEqual(['bug', 'enhancement', 'help wanted']);
      expect(settings.assignees).toEqual(['user1', 'user2']);
      expect(settings.reviewers).toEqual(['reviewer1']);
      expect(settings.teamReviewers).toEqual(['team-a', 'team-b']);
      expect(settings.addPaths).toEqual(['src/', 'docs/']);
    });

    it('should pass through boolean inputs', () => {
      const agent = createMockAgent(
        {},
        {
          signoff: true,
          'sign-commits': true,
          'delete-branch': true,
          'maintainer-can-modify': true,
          'skip-on-collaborator-commits': true,
          'auto-body': true,
          'auto-label-from-issue': true,
          'issue-link-pr': true,
          'issue-add-comment': true,
        },
      );
      const settings = getSettings(agent);

      expect(settings.signoff).toBe(true);
      expect(settings.signCommits).toBe(true);
      expect(settings.deleteBranch).toBe(true);
      expect(settings.maintainerCanModify).toBe(true);
      expect(settings.skipOnCollaboratorCommits).toBe(true);
      expect(settings.autoBody).toBe(true);
      expect(settings.autoLabelFromIssue).toBe(true);
      expect(settings.issueLinkPr).toBe(true);
      expect(settings.issueAddComment).toBe(true);
    });
  });

  describe('parseTrackerType', () => {
    it.each(['github', 'linear', 'jira'] as const)(
      'should accept valid tracker type "%s"',
      trackerType => {
        const agent = createMockAgent({ 'project-management': trackerType });
        const settings = getSettings(agent);

        expect(settings.projectManagement).toBe(trackerType);
      },
    );

    it('should default to "github" when empty', () => {
      const agent = createMockAgent({ 'project-management': '' });
      const settings = getSettings(agent);

      expect(settings.projectManagement).toBe('github');
    });

    it('should throw on invalid tracker type', () => {
      const agent = createMockAgent({ 'project-management': 'bitbucket' });

      expect(() => getSettings(agent)).toThrow(
        'Invalid project-management value "bitbucket". Must be one of: github, linear, jira',
      );
    });
  });

  describe('parseIssueKeySource', () => {
    it.each(['branch', 'commits', 'both'] as const)(
      'should accept valid issue-key-source "%s"',
      source => {
        const agent = createMockAgent({ 'issue-key-source': source });
        const settings = getSettings(agent);

        expect(settings.issueKeySource).toBe(source);
      },
    );

    it('should default to "both" when empty', () => {
      const agent = createMockAgent({ 'issue-key-source': '' });
      const settings = getSettings(agent);

      expect(settings.issueKeySource).toBe('both');
    });

    it('should throw on invalid issue-key-source', () => {
      const agent = createMockAgent({ 'issue-key-source': 'tags' });

      expect(() => getSettings(agent)).toThrow(
        'Invalid issue-key-source value "tags". Must be one of: branch, commits, both',
      );
    });
  });

  describe('parseDraftMode', () => {
    it.each(['true', 'false', 'always-true'] as const)(
      'should accept valid draft mode "%s"',
      mode => {
        const agent = createMockAgent({ draft: mode });
        const settings = getSettings(agent);

        expect(settings.draft).toBe(mode);
      },
    );

    it('should default to "false" when empty', () => {
      const agent = createMockAgent({ draft: '' });
      const settings = getSettings(agent);

      expect(settings.draft).toBe('false');
    });

    it('should throw on invalid draft mode', () => {
      const agent = createMockAgent({ draft: 'maybe' });

      expect(() => getSettings(agent)).toThrow(
        'Invalid draft value "maybe". Must be one of: true, false, always-true',
      );
    });
  });

  describe('parseMilestone', () => {
    it('should return 0 when milestone is empty', () => {
      const agent = createMockAgent({ milestone: '' });
      const settings = getSettings(agent);

      expect(settings.milestone).toBe(0);
    });

    it('should parse valid integer milestone', () => {
      const agent = createMockAgent({ milestone: '42' });
      const settings = getSettings(agent);

      expect(settings.milestone).toBe(42);
    });

    it('should parse milestone value of 0', () => {
      const agent = createMockAgent({ milestone: '0' });
      const settings = getSettings(agent);

      expect(settings.milestone).toBe(0);
    });

    it('should throw on non-numeric milestone', () => {
      const agent = createMockAgent({ milestone: 'abc' });

      expect(() => getSettings(agent)).toThrow(
        'Invalid milestone value "abc". Must be a non-negative integer.',
      );
    });

    it('should throw on negative milestone', () => {
      const agent = createMockAgent({ milestone: '-1' });

      expect(() => getSettings(agent)).toThrow(
        'Invalid milestone value "-1". Must be a non-negative integer.',
      );
    });

    it('should truncate floating-point milestone via parseInt', () => {
      const agent = createMockAgent({ milestone: '3.14' });
      const settings = getSettings(agent);

      expect(settings.milestone).toBe(3);
    });
  });
});
