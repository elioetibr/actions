import { Context } from '@actions/github/lib/context';
import { GitHubContextService, createGitHubContextService } from './GitHubContextService';
import { IGitHubContext } from '../../interfaces';

describe('GitHubContextService', () => {
  const createMockContext = (overrides: Partial<Context> = {}): Context => {
    return {
      payload: { repository: { default_branch: 'main' } },
      eventName: 'push',
      sha: 'abcdef1234567890abcdef1234567890abcdef12',
      ref: 'refs/heads/main',
      workflow: 'CI',
      action: 'test-action',
      actor: 'john-doe',
      job: 'build',
      runAttempt: 1,
      runNumber: 42,
      runId: 123456789,
      apiUrl: 'https://api.github.com',
      serverUrl: 'https://github.com',
      graphqlUrl: 'https://api.github.com/graphql',
      issue: { owner: 'owner', repo: 'repo', number: 123 },
      repo: { owner: 'owner', repo: 'repo' },
      ...overrides,
    } as Context;
  };

  describe('constructor', () => {
    test('creates service with valid context', () => {
      const mockContext = createMockContext();
      const service = new GitHubContextService(mockContext);

      expect(service).toBeInstanceOf(GitHubContextService);
      expect(service.context).toBeDefined();
    });

    test('throws error when context is null', () => {
      expect(() => new GitHubContextService(null as any)).toThrow('GitHub context is required');
    });

    test('throws error when context is undefined', () => {
      expect(() => new GitHubContextService(undefined as any)).toThrow('GitHub context is required');
    });

    test('throws error when context is missing ref', () => {
      const mockContext = createMockContext({ ref: '' });
      expect(() => new GitHubContextService(mockContext)).toThrow('Invalid GitHub context: missing ref or sha');
    });

    test('throws error when context is missing sha', () => {
      const mockContext = createMockContext({ sha: '' });
      expect(() => new GitHubContextService(mockContext)).toThrow('Invalid GitHub context: missing ref or sha');
    });

    test('throws error when context is missing both ref and sha', () => {
      const mockContext = createMockContext({ ref: '', sha: '' });
      expect(() => new GitHubContextService(mockContext)).toThrow('Invalid GitHub context: missing ref or sha');
    });
  });

  describe('buildContext', () => {
    test('builds complete GitHub context from valid input', () => {
      const mockContext = createMockContext();
      const service = new GitHubContextService(mockContext);

      const expectedContext: IGitHubContext = {
        payload: mockContext.payload,
        eventName: 'push',
        sha: 'abcdef1234567890abcdef1234567890abcdef12',
        ref: 'refs/heads/main',
        workflow: 'CI',
        action: 'test-action',
        actor: 'john-doe',
        job: 'build',
        runAttempt: 1,
        runNumber: 42,
        runId: 123456789,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql',
        issue: { owner: 'owner', repo: 'repo', number: 123 },
        repo: { owner: 'owner', repo: 'repo' },
        defaultBranch: 'main',
        isDefaultBranch: true,
        isPullRequest: false,
        isTag: false,
        refName: 'main',
        shaShort: 'abcdef1',
      };

      expect(service.context).toEqual(expectedContext);
    });

    test('handles missing optional properties with defaults', () => {
      const minimalContext = createMockContext({
        workflow: undefined,
        action: undefined,
        actor: undefined,
        job: undefined,
        runAttempt: undefined,
        runNumber: undefined,
        runId: undefined,
        apiUrl: undefined,
        serverUrl: undefined,
        graphqlUrl: undefined,
      });

      const service = new GitHubContextService(minimalContext);

      expect(service.context.workflow).toBe('');
      expect(service.context.action).toBe('');
      expect(service.context.actor).toBe('');
      expect(service.context.job).toBe('');
      expect(service.context.runAttempt).toBe(1);
      expect(service.context.runNumber).toBe(0);
      expect(service.context.runId).toBe(0);
      expect(service.context.apiUrl).toBe('');
      expect(service.context.serverUrl).toBe('');
      expect(service.context.graphqlUrl).toBe('');
    });

    test('detects pull request refs correctly', () => {
      const mockContext = createMockContext({ ref: 'refs/pull/123/merge' });
      const service = new GitHubContextService(mockContext);

      expect(service.context.isPullRequest).toBe(true);
      expect(service.context.isTag).toBe(false);
      expect(service.context.refName).toBe('123/merge');
      expect(service.context.isDefaultBranch).toBe(false);
    });

    test('detects tag refs correctly', () => {
      const mockContext = createMockContext({ ref: 'refs/tags/v1.2.3' });
      const service = new GitHubContextService(mockContext);

      expect(service.context.isPullRequest).toBe(false);
      expect(service.context.isTag).toBe(true);
      expect(service.context.refName).toBe('v1.2.3');
      expect(service.context.isDefaultBranch).toBe(false);
    });

    test('detects default branch correctly', () => {
      const mockContext = createMockContext({
        ref: 'refs/heads/develop',
        payload: { repository: { default_branch: 'develop' } },
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.isDefaultBranch).toBe(true);
      expect(service.context.defaultBranch).toBe('develop');
      expect(service.context.refName).toBe('develop');
    });

    test('detects non-default branch correctly', () => {
      const mockContext = createMockContext({
        ref: 'refs/heads/feature-branch',
        payload: { repository: { default_branch: 'main' } },
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.isDefaultBranch).toBe(false);
      expect(service.context.defaultBranch).toBe('main');
      expect(service.context.refName).toBe('feature-branch');
    });

    test('uses "main" as default branch when not specified in payload', () => {
      const mockContext = createMockContext({
        payload: {},
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.defaultBranch).toBe('main');
    });

    test('uses "main" as default branch when repository is not in payload', () => {
      const mockContext = createMockContext({
        payload: { repository: undefined },
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.defaultBranch).toBe('main');
    });

    test('calculates short SHA correctly', () => {
      const mockContext = createMockContext({
        sha: 'abcdef1234567890abcdef1234567890abcdef12',
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.shaShort).toBe('abcdef1');
    });

    test('handles short SHA correctly', () => {
      const mockContext = createMockContext({
        sha: 'abc123',
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.shaShort).toBe('abc123');
    });

    test('handles complex ref patterns', () => {
      const mockContext = createMockContext({
        ref: 'refs/remotes/origin/feature/complex-name',
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.refName).toBe('remotes/origin/feature/complex-name');
      expect(service.context.isPullRequest).toBe(false);
      expect(service.context.isTag).toBe(false);
    });

    test('handles ref without prefix', () => {
      const mockContext = createMockContext({
        ref: 'main',
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.refName).toBe('main');
      expect(service.context.isPullRequest).toBe(false);
      expect(service.context.isTag).toBe(false);
    });
  });

  describe('createGitHubContextService factory function', () => {
    test('creates GitHubContextService instance', () => {
      const mockContext = createMockContext();
      const service = createGitHubContextService(mockContext);

      expect(service).toBeInstanceOf(GitHubContextService);
      expect(service.context).toBeDefined();
    });

    test('throws error for invalid context', () => {
      const mockContext = createMockContext({ sha: '' });
      expect(() => createGitHubContextService(mockContext)).toThrow('Invalid GitHub context: missing ref or sha');
    });
  });

  describe('edge cases', () => {
    test('handles empty strings for optional fields', () => {
      const mockContext = createMockContext({
        workflow: '',
        action: '',
        actor: '',
        job: '',
        apiUrl: '',
        serverUrl: '',
        graphqlUrl: '',
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.workflow).toBe('');
      expect(service.context.action).toBe('');
      expect(service.context.actor).toBe('');
      expect(service.context.job).toBe('');
      expect(service.context.apiUrl).toBe('');
      expect(service.context.serverUrl).toBe('');
      expect(service.context.graphqlUrl).toBe('');
    });

    test('handles zero values for numeric fields', () => {
      const mockContext = createMockContext({
        runAttempt: 0,
        runNumber: 0,
        runId: 0,
      });
      const service = new GitHubContextService(mockContext);

      expect(service.context.runAttempt).toBe(1); // defaults to 1
      expect(service.context.runNumber).toBe(0);
      expect(service.context.runId).toBe(0);
    });
  });
});