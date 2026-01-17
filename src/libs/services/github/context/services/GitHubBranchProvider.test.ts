import { GitHubBranchProvider, createGitHubBranchProvider } from './GitHubBranchProvider';
import { IGitHubContextService } from '../../interfaces';

describe('GitHubBranchProvider', () => {
  const createMockContextService = (isDefaultBranch: boolean): IGitHubContextService => {
    return {
      context: {
        payload: {},
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
        isDefaultBranch,
        isPullRequest: false,
        isTag: false,
        refName: 'main',
        shaShort: 'abcdef1',
      },
    };
  };

  describe('constructor', () => {
    test('creates provider with valid context service', () => {
      const mockContextService = createMockContextService(true);
      const provider = new GitHubBranchProvider(mockContextService);

      expect(provider).toBeInstanceOf(GitHubBranchProvider);
    });

    test('throws error when context service is null', () => {
      expect(() => new GitHubBranchProvider(null as any)).toThrow('GitHub context service is required');
    });

    test('throws error when context service is undefined', () => {
      expect(() => new GitHubBranchProvider(undefined as any)).toThrow('GitHub context service is required');
    });
  });

  describe('isDefaultBranch', () => {
    test('returns true when context indicates default branch', () => {
      const mockContextService = createMockContextService(true);
      const provider = new GitHubBranchProvider(mockContextService);

      expect(provider.isDefaultBranch).toBe(true);
    });

    test('returns false when context indicates non-default branch', () => {
      const mockContextService = createMockContextService(false);
      const provider = new GitHubBranchProvider(mockContextService);

      expect(provider.isDefaultBranch).toBe(false);
    });

    test('reflects changes in context service', () => {
      const mockContextService = createMockContextService(true);
      const provider = new GitHubBranchProvider(mockContextService);

      expect(provider.isDefaultBranch).toBe(true);

      // Simulate context change
      mockContextService.context.isDefaultBranch = false;

      expect(provider.isDefaultBranch).toBe(false);
    });
  });

  describe('createGitHubBranchProvider factory function', () => {
    test('creates GitHubBranchProvider instance', () => {
      const mockContextService = createMockContextService(true);
      const provider = createGitHubBranchProvider(mockContextService);

      expect(provider).toBeInstanceOf(GitHubBranchProvider);
      expect(provider.isDefaultBranch).toBe(true);
    });

    test('throws error for null context service', () => {
      expect(() => createGitHubBranchProvider(null as any)).toThrow('GitHub context service is required');
    });

    test('creates provider with false default branch status', () => {
      const mockContextService = createMockContextService(false);
      const provider = createGitHubBranchProvider(mockContextService);

      expect(provider.isDefaultBranch).toBe(false);
    });
  });

  describe('integration with context service', () => {
    test('properly delegates to context service', () => {
      const mockContextService = createMockContextService(true);
      
      const provider = new GitHubBranchProvider(mockContextService);
      
      const result = provider.isDefaultBranch;
      
      expect(result).toBe(true);
      expect(result).toBe(mockContextService.context.isDefaultBranch);
    });

    test('handles context service with complex state', () => {
      const mockContextService = createMockContextService(false);
      mockContextService.context.refName = 'feature-branch';
      mockContextService.context.defaultBranch = 'main';
      mockContextService.context.isPullRequest = false;
      mockContextService.context.isTag = false;

      const provider = new GitHubBranchProvider(mockContextService);

      expect(provider.isDefaultBranch).toBe(false);
    });
  });
});