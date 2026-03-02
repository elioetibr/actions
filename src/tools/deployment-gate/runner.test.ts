import type { IAgent } from '../../agents/interfaces';
import { ApprovalStatus } from '../../actions/deployment-gate/interfaces';
import type { IDeploymentGateService } from '../../actions/deployment-gate/interfaces';
import { DeploymentGateRunner, createDeploymentGateRunner } from './runner';

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    paginate: jest.fn(),
    issues: {
      create: jest.fn(),
      createComment: jest.fn(),
      update: jest.fn(),
      listComments: jest.fn(),
    },
    teams: { listMembersInOrg: jest.fn() },
  })),
}));

jest.mock('../../actions/deployment-gate/DeploymentGateBuilder', () => {
  const mockService: Partial<IDeploymentGateService> = {
    token: 'ghp_test',
    owner: 'test-owner',
    repo: 'test-repo',
    approvers: ['alice', 'bob'],
    minimumApprovals: 0,
    issueTitle: 'Manual approval required',
    issueBody: '',
    pollingIntervalSeconds: 1,
    failOnDenial: true,
    excludeWorkflowInitiator: false,
    additionalApprovedWords: [],
    additionalDeniedWords: [],
    resolveApprovers: jest.fn().mockResolvedValue(['alice', 'bob']),
    createApprovalIssue: jest.fn().mockResolvedValue({
      number: 42,
      url: 'https://github.com/test-owner/test-repo/issues/42',
    }),
    getIssueComments: jest.fn().mockResolvedValue([]),
    evaluateApproval: jest.fn().mockReturnValue({
      status: ApprovalStatus.Pending,
      approvedBy: [],
    }),
    closeIssue: jest.fn().mockResolvedValue(undefined),
  };

  return {
    DeploymentGateBuilder: {
      create: jest.fn().mockReturnValue({
        withToken: jest.fn().mockReturnThis(),
        withOwner: jest.fn().mockReturnThis(),
        withRepo: jest.fn().mockReturnThis(),
        withApprovers: jest.fn().mockReturnThis(),
        withMinimumApprovals: jest.fn().mockReturnThis(),
        withIssueTitle: jest.fn().mockReturnThis(),
        withIssueBody: jest.fn().mockReturnThis(),
        withPollingIntervalSeconds: jest.fn().mockReturnThis(),
        withFailOnDenial: jest.fn().mockReturnThis(),
        withExcludeWorkflowInitiator: jest.fn().mockReturnThis(),
        withAdditionalApprovedWords: jest.fn().mockReturnThis(),
        withAdditionalDeniedWords: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockService),
      }),
    },
    __mockService: mockService,
  };
});

// Access mock service for test manipulation
function getMockService(): jest.Mocked<IDeploymentGateService> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('../../actions/deployment-gate/DeploymentGateBuilder') as {
    __mockService: jest.Mocked<IDeploymentGateService>;
  };
  return mod.__mockService;
}

function createMockAgent(): jest.Mocked<IAgent> {
  return {
    getInput: jest.fn().mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        approvers: 'alice,bob',
        secret: 'ghp_test',
        'minimum-approvals': '0',
        'issue-title': '',
        'issue-body': '',
        'polling-interval-seconds': '1',
        'additional-approved-words': '',
        'additional-denied-words': '',
        'target-repository-owner': '',
        'target-repository': '',
      };
      return inputs[name] ?? '';
    }),
    getBooleanInput: jest.fn().mockImplementation((name: string) => {
      const inputs: Record<string, boolean> = {
        'exclude-workflow-initiator-as-approver': false,
        'fail-on-denial': true,
      };
      return inputs[name] ?? false;
    }),
    getMultilineInput: jest.fn().mockReturnValue([]),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    addPath: jest.fn(),
    exportVariable: jest.fn(),
    // IAgent.exec — safe via @actions/exec (execFile, not shell)
    exec: jest.fn().mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' }),
  } as jest.Mocked<IAgent>;
}

describe('DeploymentGateRunner', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_REPOSITORY_OWNER: 'test-owner',
      GITHUB_REPOSITORY: 'test-owner/test-repo',
      GITHUB_RUN_ID: '12345',
      GITHUB_ACTOR: 'initiator',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createDeploymentGateRunner', () => {
    it('returns a DeploymentGateRunner instance', () => {
      const runner = createDeploymentGateRunner();
      expect(runner).toBeInstanceOf(DeploymentGateRunner);
      expect(runner.name).toBe('deployment-gate');
    });
  });

  describe('approve step', () => {
    it('returns success when approved on first poll', async () => {
      const agent = createMockAgent();
      const mockService = getMockService();
      (mockService.evaluateApproval as jest.Mock).mockReturnValue({
        status: ApprovalStatus.Approved,
        approvedBy: ['alice', 'bob'],
      });

      const runner = createDeploymentGateRunner();
      // Override sleep to be instant
      jest
        .spyOn(runner as DeploymentGateRunner, 'sleep' as keyof DeploymentGateRunner)
        .mockResolvedValue(undefined);

      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(true);
      expect(result.outputs['issue-number']).toBe(42);
      expect(result.outputs['issue-url']).toBe('https://github.com/test-owner/test-repo/issues/42');
      expect(result.outputs['approval-status']).toBe('approved');
      expect(mockService.closeIssue).toHaveBeenCalledWith(42, 'Approved by: alice, bob');
    });

    it('returns failure when denied and failOnDenial is true', async () => {
      const agent = createMockAgent();
      const mockService = getMockService();
      (mockService.evaluateApproval as jest.Mock).mockReturnValue({
        status: ApprovalStatus.Denied,
        approvedBy: [],
        deniedBy: 'alice',
      });

      const runner = createDeploymentGateRunner();
      jest
        .spyOn(runner as DeploymentGateRunner, 'sleep' as keyof DeploymentGateRunner)
        .mockResolvedValue(undefined);

      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Deployment approval was denied');
      expect(result.outputs['approval-status']).toBe('denied');
      expect(mockService.closeIssue).toHaveBeenCalledWith(42, 'Denied by: alice');
    });

    it('returns success with denied status when failOnDenial is false', async () => {
      const agent = createMockAgent();
      agent.getBooleanInput.mockImplementation((name: string) => {
        if (name === 'fail-on-denial') return false;
        return false;
      });
      const mockService = getMockService();
      (mockService.evaluateApproval as jest.Mock).mockReturnValue({
        status: ApprovalStatus.Denied,
        approvedBy: [],
        deniedBy: 'bob',
      });

      const runner = createDeploymentGateRunner();
      jest
        .spyOn(runner as DeploymentGateRunner, 'sleep' as keyof DeploymentGateRunner)
        .mockResolvedValue(undefined);

      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(true);
      expect(result.outputs['approval-status']).toBe('denied');
    });

    it('polls multiple times until approved', async () => {
      const agent = createMockAgent();
      const mockService = getMockService();
      let callCount = 0;
      (mockService.evaluateApproval as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount >= 3) {
          return { status: ApprovalStatus.Approved, approvedBy: ['alice', 'bob'] };
        }
        return { status: ApprovalStatus.Pending, approvedBy: callCount > 1 ? ['alice'] : [] };
      });

      const runner = createDeploymentGateRunner();
      jest
        .spyOn(runner as DeploymentGateRunner, 'sleep' as keyof DeploymentGateRunner)
        .mockResolvedValue(undefined);

      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(true);
      expect(mockService.getIssueComments).toHaveBeenCalledTimes(3);
    });

    it('fails when no approvers remain after resolution', async () => {
      const agent = createMockAgent();
      const mockService = getMockService();
      (mockService.resolveApprovers as jest.Mock).mockResolvedValue([]);

      const runner = createDeploymentGateRunner();
      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('No approvers remaining after resolution');
    });

    it('fails when target repository cannot be determined', async () => {
      delete process.env.GITHUB_REPOSITORY_OWNER;
      delete process.env.GITHUB_REPOSITORY;

      const agent = createMockAgent();
      const runner = createDeploymentGateRunner();
      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Could not determine target repository');
    });

    it('uses default issue title with run ID', async () => {
      const agent = createMockAgent();
      const mockService = getMockService();
      (mockService.evaluateApproval as jest.Mock).mockReturnValue({
        status: ApprovalStatus.Approved,
        approvedBy: ['alice', 'bob'],
      });

      const runner = createDeploymentGateRunner();
      jest
        .spyOn(runner as DeploymentGateRunner, 'sleep' as keyof DeploymentGateRunner)
        .mockResolvedValue(undefined);

      await runner.run(agent, 'approve');

      const { DeploymentGateBuilder } = jest.requireMock(
        '../../actions/deployment-gate/DeploymentGateBuilder',
      );
      const builderInstance = DeploymentGateBuilder.create();
      expect(builderInstance.withIssueTitle).toHaveBeenCalledWith(
        'Manual approval required for workflow run 12345',
      );
    });

    it('handles unknown step name', async () => {
      const agent = createMockAgent();
      const runner = createDeploymentGateRunner();
      const result = await runner.run(agent, 'unknown-step');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unknown step');
    });

    it('catches unexpected errors', async () => {
      const agent = createMockAgent();
      const mockService = getMockService();
      (mockService.resolveApprovers as jest.Mock).mockRejectedValue(new Error('API rate limit'));

      const runner = createDeploymentGateRunner();
      const result = await runner.run(agent, 'approve');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('API rate limit');
    });
  });
});
