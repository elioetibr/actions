import { DeploymentGateService } from './DeploymentGateService';

const mockPaginate = jest.fn();
const mockIssuesCreate = jest.fn();
const mockIssuesCreateComment = jest.fn();
const mockIssuesUpdate = jest.fn();
const mockIssuesListComments = jest.fn();
const mockTeamsListMembersInOrg = jest.fn();

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    paginate: mockPaginate,
    issues: {
      create: mockIssuesCreate,
      createComment: mockIssuesCreateComment,
      update: mockIssuesUpdate,
      listComments: mockIssuesListComments,
    },
    teams: {
      listMembersInOrg: mockTeamsListMembersInOrg,
    },
  })),
}));

interface ServiceOverrides {
  token?: string;
  owner?: string;
  repo?: string;
  approvers?: string[];
  minimumApprovals?: number;
  issueTitle?: string;
  issueBody?: string;
  pollingIntervalSeconds?: number;
  failOnDenial?: boolean;
  excludeWorkflowInitiator?: boolean;
  additionalApprovedWords?: string[];
  additionalDeniedWords?: string[];
}

function createService(overrides: ServiceOverrides = {}): DeploymentGateService {
  return new DeploymentGateService(
    overrides.token ?? 'ghp_token',
    overrides.owner ?? 'test-owner',
    overrides.repo ?? 'test-repo',
    overrides.approvers ?? ['alice', 'bob'],
    overrides.minimumApprovals ?? 0,
    overrides.issueTitle ?? 'Manual approval required',
    overrides.issueBody ?? '',
    overrides.pollingIntervalSeconds ?? 10,
    overrides.failOnDenial ?? true,
    overrides.excludeWorkflowInitiator ?? false,
    overrides.additionalApprovedWords ?? [],
    overrides.additionalDeniedWords ?? [],
  );
}

describe('DeploymentGateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('approvers getter', () => {
    it('returns the approvers list', () => {
      const service = createService({ approvers: ['alice', 'charlie'] });
      expect(service.approvers).toEqual(['alice', 'charlie']);
    });
  });

  describe('resolveApprovers', () => {
    it('expands team slugs into individual members', async () => {
      const service = createService({ approvers: ['team-reviewers'] });
      mockPaginate.mockResolvedValueOnce([{ login: 'alice' }, { login: 'bob' }]);

      const result = await service.resolveApprovers('test-org');

      expect(mockPaginate).toHaveBeenCalledWith(mockTeamsListMembersInOrg, {
        org: 'test-org',
        team_slug: 'team-reviewers',
        per_page: 100,
      });
      expect(result).toEqual(['alice', 'bob']);
    });

    it('falls back to individual user when team expansion fails', async () => {
      const service = createService({ approvers: ['individual-user'] });
      mockPaginate.mockRejectedValueOnce(new Error('Not found'));

      const result = await service.resolveApprovers('test-org');
      expect(result).toEqual(['individual-user']);
    });

    it('replaces periods with hyphens in team slug', async () => {
      const service = createService({ approvers: ['team.with.dots'] });
      mockPaginate.mockResolvedValueOnce([{ login: 'charlie' }]);

      await service.resolveApprovers('test-org');

      expect(mockPaginate).toHaveBeenCalledWith(
        mockTeamsListMembersInOrg,
        expect.objectContaining({ team_slug: 'team-with-dots' }),
      );
    });

    it('deduplicates resolved approvers', async () => {
      const service = createService({ approvers: ['team-a', 'team-b'] });
      mockPaginate
        .mockResolvedValueOnce([{ login: 'alice' }, { login: 'bob' }])
        .mockResolvedValueOnce([{ login: 'Bob' }, { login: 'charlie' }]);

      const result = await service.resolveApprovers('test-org');
      expect(result).toEqual(['alice', 'Bob', 'charlie']);
    });

    it('excludes workflow initiator when specified', async () => {
      const service = createService({ approvers: ['alice', 'bob', 'charlie'] });
      mockPaginate
        .mockRejectedValueOnce(new Error('Not team'))
        .mockRejectedValueOnce(new Error('Not team'))
        .mockRejectedValueOnce(new Error('Not team'));

      const result = await service.resolveApprovers('test-org', 'alice');
      expect(result).toEqual(['bob', 'charlie']);
    });

    it('excludes actor case-insensitively', async () => {
      const service = createService({ approvers: ['Alice', 'bob'] });
      mockPaginate
        .mockRejectedValueOnce(new Error('Not team'))
        .mockRejectedValueOnce(new Error('Not team'));

      const result = await service.resolveApprovers('test-org', 'alice');
      expect(result).toEqual(['bob']);
    });

    it('updates internal approvers list after resolution', async () => {
      const service = createService({ approvers: ['team-a'] });
      mockPaginate.mockResolvedValueOnce([{ login: 'alice' }, { login: 'bob' }]);

      await service.resolveApprovers('test-org');
      expect(service.approvers).toEqual(['alice', 'bob']);
    });
  });

  describe('createApprovalIssue', () => {
    it('creates an issue with title, body, and assignees', async () => {
      const service = createService();
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test-owner/test-repo/issues/42' },
      });

      const result = await service.createApprovalIssue();

      expect(mockIssuesCreate).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        title: 'Manual approval required',
        body: expect.stringContaining('@alice'),
        assignees: ['alice', 'bob'],
      });
      expect(result).toEqual({
        number: 42,
        url: 'https://github.com/test-owner/test-repo/issues/42',
      });
    });

    it('shows "all" in body when minimumApprovals is 0', async () => {
      const service = createService({ minimumApprovals: 0 });
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });

      await service.createApprovalIssue();

      const issueBody = mockIssuesCreate.mock.calls[0][0].body;
      expect(issueBody).toContain('**Minimum approvals:** all');
    });

    it('shows numeric count in body when minimumApprovals is set', async () => {
      const service = createService({ minimumApprovals: 2 });
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });

      await service.createApprovalIssue();

      const issueBody = mockIssuesCreate.mock.calls[0][0].body;
      expect(issueBody).toContain('**Minimum approvals:** 2');
    });

    it('posts issue body as comment when provided', async () => {
      const service = createService({ issueBody: 'Please review deployment to production' });
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });
      mockIssuesCreateComment.mockResolvedValueOnce({});

      await service.createApprovalIssue();

      expect(mockIssuesCreateComment).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 42,
        body: 'Please review deployment to production',
      });
    });

    it('does not post body comment when issueBody is empty', async () => {
      const service = createService();
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });

      await service.createApprovalIssue();

      expect(mockIssuesCreateComment).not.toHaveBeenCalled();
    });

    it('splits long issue body into chunks', async () => {
      const longBody = 'x'.repeat(70000);
      const service = createService({ issueBody: longBody });
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });
      mockIssuesCreateComment.mockResolvedValue({});

      await service.createApprovalIssue();

      expect(mockIssuesCreateComment).toHaveBeenCalledTimes(2);
      const firstChunk = mockIssuesCreateComment.mock.calls[0][0].body;
      const secondChunk = mockIssuesCreateComment.mock.calls[1][0].body;
      expect(firstChunk.length).toBe(65536);
      expect(secondChunk.length).toBe(70000 - 65536);
    });

    it('includes approved and denied keywords in issue body', async () => {
      const service = createService({
        additionalApprovedWords: ['ship-it'],
        additionalDeniedWords: ['block'],
      });
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });

      await service.createApprovalIssue();

      const issueBody = mockIssuesCreate.mock.calls[0][0].body;
      expect(issueBody).toContain('`ship-it`');
      expect(issueBody).toContain('`block`');
    });

    it('includes approver @mentions in issue body', async () => {
      const service = createService({ approvers: ['alice', 'bob'] });
      mockIssuesCreate.mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/test/repo/issues/42' },
      });

      await service.createApprovalIssue();

      const issueBody = mockIssuesCreate.mock.calls[0][0].body;
      expect(issueBody).toContain('@alice, @bob');
    });
  });

  describe('getIssueComments', () => {
    it('returns mapped comments with pagination', async () => {
      mockPaginate.mockResolvedValueOnce([
        { user: { login: 'alice' }, body: 'approved' },
        { user: { login: 'bob' }, body: 'lgtm' },
      ]);

      const service = createService();
      const comments = await service.getIssueComments(42);

      expect(mockPaginate).toHaveBeenCalledWith(mockIssuesListComments, {
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 42,
        per_page: 100,
      });
      expect(comments).toEqual([
        { user: 'alice', body: 'approved' },
        { user: 'bob', body: 'lgtm' },
      ]);
    });

    it('filters out comments with missing user', async () => {
      mockPaginate.mockResolvedValueOnce([
        { user: null, body: 'approved' },
        { user: { login: 'bob' }, body: 'lgtm' },
      ]);

      const service = createService();
      const comments = await service.getIssueComments(42);

      expect(comments).toEqual([{ user: 'bob', body: 'lgtm' }]);
    });

    it('filters out comments with missing body', async () => {
      mockPaginate.mockResolvedValueOnce([
        { user: { login: 'alice' }, body: null },
        { user: { login: 'bob' }, body: 'lgtm' },
      ]);

      const service = createService();
      const comments = await service.getIssueComments(42);

      expect(comments).toEqual([{ user: 'bob', body: 'lgtm' }]);
    });

    it('returns empty array when no valid comments exist', async () => {
      mockPaginate.mockResolvedValueOnce([{ user: null, body: null }]);

      const service = createService();
      const comments = await service.getIssueComments(42);

      expect(comments).toEqual([]);
    });
  });

  describe('closeIssue', () => {
    it('posts comment and closes the issue', async () => {
      mockIssuesCreateComment.mockResolvedValueOnce({});
      mockIssuesUpdate.mockResolvedValueOnce({});

      const service = createService();
      await service.closeIssue(42, 'Approved by alice, bob');

      expect(mockIssuesCreateComment).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 42,
        body: 'Approved by alice, bob',
      });
      expect(mockIssuesUpdate).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 42,
        state: 'closed',
      });
    });

    it('posts comment before closing', async () => {
      const callOrder: string[] = [];
      mockIssuesCreateComment.mockImplementation(() => {
        callOrder.push('comment');
        return Promise.resolve({});
      });
      mockIssuesUpdate.mockImplementation(() => {
        callOrder.push('update');
        return Promise.resolve({});
      });

      const service = createService();
      await service.closeIssue(42, 'Done');

      expect(callOrder).toEqual(['comment', 'update']);
    });
  });

  describe('evaluateApproval', () => {
    it('delegates to evaluateComments with merged keywords', () => {
      const service = createService({
        additionalApprovedWords: ['ship-it'],
        additionalDeniedWords: ['block'],
      });

      const result = service.evaluateApproval([
        { user: 'alice', body: 'ship-it' },
        { user: 'bob', body: 'approved' },
      ]);

      expect(result.status).toBe('approved');
      expect(result.approvedBy).toEqual(['alice', 'bob']);
    });

    it('returns denied when approver denies with custom word', () => {
      const service = createService({
        additionalDeniedWords: ['block'],
      });

      const result = service.evaluateApproval([{ user: 'alice', body: 'block' }]);

      expect(result.status).toBe('denied');
      expect(result.deniedBy).toBe('alice');
    });

    it('returns pending when no comments provided', () => {
      const service = createService();
      const result = service.evaluateApproval([]);

      expect(result.status).toBe('pending');
      expect(result.approvedBy).toEqual([]);
    });

    it('uses default keywords when no additional words configured', () => {
      const service = createService();
      const result = service.evaluateApproval([
        { user: 'alice', body: 'lgtm' },
        { user: 'bob', body: 'yes' },
      ]);

      expect(result.status).toBe('approved');
    });
  });
});
