import { DeploymentGateBuilder } from './DeploymentGateBuilder';

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

function validBuilder(): DeploymentGateBuilder {
  return DeploymentGateBuilder.create()
    .withToken('ghp_test')
    .withOwner('test-owner')
    .withRepo('test-repo')
    .withApprovers(['alice', 'bob']);
}

describe('DeploymentGateBuilder', () => {
  describe('create', () => {
    it('returns a new builder instance', () => {
      const builder = DeploymentGateBuilder.create();
      expect(builder).toBeInstanceOf(DeploymentGateBuilder);
    });
  });

  describe('fluent chaining', () => {
    it('supports method chaining', () => {
      const builder = DeploymentGateBuilder.create()
        .withToken('ghp_test')
        .withOwner('owner')
        .withRepo('repo')
        .withApprovers(['alice'])
        .withMinimumApprovals(1)
        .withIssueTitle('Title')
        .withIssueBody('Body')
        .withPollingIntervalSeconds(30)
        .withFailOnDenial(false)
        .withExcludeWorkflowInitiator(true)
        .withAdditionalApprovedWords(['ship-it'])
        .withAdditionalDeniedWords(['block']);

      expect(builder).toBeInstanceOf(DeploymentGateBuilder);
    });
  });

  describe('build', () => {
    it('builds a service with all configuration', () => {
      const service = validBuilder()
        .withMinimumApprovals(1)
        .withIssueTitle('Deploy gate')
        .withIssueBody('Please approve')
        .withPollingIntervalSeconds(30)
        .withFailOnDenial(false)
        .withExcludeWorkflowInitiator(true)
        .withAdditionalApprovedWords(['ship-it'])
        .withAdditionalDeniedWords(['block'])
        .build();

      expect(service.token).toBe('ghp_test');
      expect(service.owner).toBe('test-owner');
      expect(service.repo).toBe('test-repo');
      expect(service.approvers).toEqual(['alice', 'bob']);
      expect(service.minimumApprovals).toBe(1);
      expect(service.issueTitle).toBe('Deploy gate');
      expect(service.issueBody).toBe('Please approve');
      expect(service.pollingIntervalSeconds).toBe(30);
      expect(service.failOnDenial).toBe(false);
      expect(service.excludeWorkflowInitiator).toBe(true);
      expect(service.additionalApprovedWords).toEqual(['ship-it']);
      expect(service.additionalDeniedWords).toEqual(['block']);
    });

    it('builds with default values', () => {
      const service = validBuilder().build();

      expect(service.minimumApprovals).toBe(0);
      expect(service.issueTitle).toBe('');
      expect(service.issueBody).toBe('');
      expect(service.pollingIntervalSeconds).toBe(10);
      expect(service.failOnDenial).toBe(true);
      expect(service.excludeWorkflowInitiator).toBe(false);
      expect(service.additionalApprovedWords).toEqual([]);
      expect(service.additionalDeniedWords).toEqual([]);
    });
  });

  describe('validation', () => {
    it('throws when token is missing', () => {
      expect(() =>
        DeploymentGateBuilder.create()
          .withOwner('owner')
          .withRepo('repo')
          .withApprovers(['alice'])
          .build(),
      ).toThrow('Token is required');
    });

    it('throws when owner is missing', () => {
      expect(() =>
        DeploymentGateBuilder.create()
          .withToken('ghp_test')
          .withRepo('repo')
          .withApprovers(['alice'])
          .build(),
      ).toThrow('Owner is required');
    });

    it('throws when repo is missing', () => {
      expect(() =>
        DeploymentGateBuilder.create()
          .withToken('ghp_test')
          .withOwner('owner')
          .withApprovers(['alice'])
          .build(),
      ).toThrow('Repo is required');
    });

    it('throws when approvers is empty', () => {
      expect(() =>
        DeploymentGateBuilder.create()
          .withToken('ghp_test')
          .withOwner('owner')
          .withRepo('repo')
          .build(),
      ).toThrow('At least one approver is required');
    });

    it('throws when minimumApprovals exceeds approver count', () => {
      expect(() =>
        DeploymentGateBuilder.create()
          .withToken('ghp_test')
          .withOwner('owner')
          .withRepo('repo')
          .withApprovers(['alice'])
          .withMinimumApprovals(5)
          .build(),
      ).toThrow('Minimum approvals (5) exceeds approver count (1)');
    });
  });
});
