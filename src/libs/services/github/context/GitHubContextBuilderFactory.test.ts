import { Context } from '@actions/github/lib/context';
import { 
  GitHubContextBuilderFactory, 
  createGitHubBuilder, 
  createGitHubBuilderFromContext 
} from './GitHubContextBuilderFactory';
import { GitHubContextBuilder } from './GitHubContextBuilder';

describe('GitHubContextBuilderFactory', () => {
  const createMockContext = (overrides: Partial<Context> = {}): Context => {
    return {
      payload: { 
        repository: { default_branch: 'main' },
        action: 'opened',
        number: 123 
      },
      eventName: 'pull_request',
      sha: 'abcdef1234567890abcdef1234567890abcdef12',
      ref: 'refs/heads/feature-branch',
      workflow: 'CI/CD Pipeline',
      action: 'test-action',
      actor: 'john-doe',
      job: 'build',
      runAttempt: 2,
      runNumber: 42,
      runId: 123456789,
      apiUrl: 'https://api.github.com',
      serverUrl: 'https://github.com',
      graphqlUrl: 'https://api.github.com/graphql',
      issue: { owner: 'test-owner', repo: 'test-repo', number: 456 },
      repo: { owner: 'test-owner', repo: 'test-repo' },
      ...overrides,
    } as Context;
  };

  describe('create', () => {
    test('creates new empty GitHubContextBuilder instance', () => {
      const builder = GitHubContextBuilderFactory.create();

      expect(builder).toBeInstanceOf(GitHubContextBuilder);
      expect(builder.payload).toEqual({});
      expect(builder.eventName).toBe('');
      expect(builder.sha).toBe('');
      expect(builder.ref).toBe('');
      expect(builder.workflow).toBe('');
      expect(builder.action).toBe('');
      expect(builder.actor).toBe('');
      expect(builder.job).toBe('');
      expect(builder.runAttempt).toBe(1);
      expect(builder.runNumber).toBe(0);
      expect(builder.runId).toBe(0);
      expect(builder.apiUrl).toBe('');
      expect(builder.serverUrl).toBe('');
      expect(builder.graphqlUrl).toBe('');
      expect(builder.issue).toEqual({ owner: '', repo: '', number: 0 });
      expect(builder.repo).toEqual({ owner: '', repo: '' });
      expect(builder.defaultBranch).toBe('main');
    });

    test('creates different instances on each call', () => {
      const builder1 = GitHubContextBuilderFactory.create();
      const builder2 = GitHubContextBuilderFactory.create();

      expect(builder1).not.toBe(builder2);
      expect(builder1).toBeInstanceOf(GitHubContextBuilder);
      expect(builder2).toBeInstanceOf(GitHubContextBuilder);
    });
  });

  describe('createFromContext', () => {
    test('creates builder populated with context values', () => {
      const mockContext = createMockContext();
      const builder = GitHubContextBuilderFactory.createFromContext(mockContext);

      expect(builder).toBeInstanceOf(GitHubContextBuilder);
      expect(builder.payload).toEqual(mockContext.payload);
      expect(builder.eventName).toBe('pull_request');
      expect(builder.sha).toBe('abcdef1234567890abcdef1234567890abcdef12');
      expect(builder.ref).toBe('refs/heads/feature-branch');
      expect(builder.workflow).toBe('CI/CD Pipeline');
      expect(builder.action).toBe('test-action');
      expect(builder.actor).toBe('john-doe');
      expect(builder.job).toBe('build');
      expect(builder.runAttempt).toBe(2);
      expect(builder.runNumber).toBe(42);
      expect(builder.runId).toBe(123456789);
      expect(builder.apiUrl).toBe('https://api.github.com');
      expect(builder.serverUrl).toBe('https://github.com');
      expect(builder.graphqlUrl).toBe('https://api.github.com/graphql');
      expect(builder.issue).toEqual({ owner: 'test-owner', repo: 'test-repo', number: 456 });
      expect(builder.repo).toEqual({ owner: 'test-owner', repo: 'test-repo' });
      expect(builder.defaultBranch).toBe('main');
    });

    test('handles missing optional context properties with defaults', () => {
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

      const builder = GitHubContextBuilderFactory.createFromContext(minimalContext);

      expect(builder.workflow).toBe('');
      expect(builder.action).toBe('');
      expect(builder.actor).toBe('');
      expect(builder.job).toBe('');
      expect(builder.runAttempt).toBe(1);
      expect(builder.runNumber).toBe(0);
      expect(builder.runId).toBe(0);
      expect(builder.apiUrl).toBe('');
      expect(builder.serverUrl).toBe('');
      expect(builder.graphqlUrl).toBe('');
    });

    test('handles missing eventName, sha, and ref with defaults', () => {
      const minimalContext = createMockContext({
        eventName: undefined,
        sha: undefined,
        ref: undefined,
      });

      const builder = GitHubContextBuilderFactory.createFromContext(minimalContext);

      expect(builder.eventName).toBe('');
      expect(builder.sha).toBe('');
      expect(builder.ref).toBe('');
    });

    test('handles missing issue and repo with defaults', () => {
      const contextWithoutIssueRepo = createMockContext({
        issue: undefined,
        repo: undefined,
      });

      const builder = GitHubContextBuilderFactory.createFromContext(contextWithoutIssueRepo);

      expect(builder.issue).toEqual({ owner: '', repo: '', number: 0 });
      expect(builder.repo).toEqual({ owner: '', repo: '' });
    });

    test('handles partial issue and repo information', () => {
      const contextWithPartialInfo = createMockContext({
        issue: { owner: 'owner', repo: '', number: undefined } as any,
        repo: { owner: '', repo: 'repo' } as any,
      });

      const builder = GitHubContextBuilderFactory.createFromContext(contextWithPartialInfo);

      expect(builder.issue).toEqual({ owner: 'owner', repo: '', number: 0 });
      expect(builder.repo).toEqual({ owner: '', repo: 'repo' });
    });

    test('uses "main" as default branch when not specified in payload', () => {
      const contextWithoutDefaultBranch = createMockContext({
        payload: {},
      });

      const builder = GitHubContextBuilderFactory.createFromContext(contextWithoutDefaultBranch);

      expect(builder.defaultBranch).toBe('main');
    });

    test('uses "main" as default branch when repository is not in payload', () => {
      const contextWithoutRepository = createMockContext({
        payload: { repository: undefined },
      });

      const builder = GitHubContextBuilderFactory.createFromContext(contextWithoutRepository);

      expect(builder.defaultBranch).toBe('main');
    });

    test('uses custom default branch from payload', () => {
      const contextWithCustomBranch = createMockContext({
        payload: { repository: { default_branch: 'develop' } },
      });

      const builder = GitHubContextBuilderFactory.createFromContext(contextWithCustomBranch);

      expect(builder.defaultBranch).toBe('develop');
    });

    test('throws error when context is null', () => {
      expect(() => GitHubContextBuilderFactory.createFromContext(null as any))
        .toThrow('GitHub context is required');
    });

    test('throws error when context is undefined', () => {
      expect(() => GitHubContextBuilderFactory.createFromContext(undefined as any))
        .toThrow('GitHub context is required');
    });

    test('handles empty payload correctly', () => {
      const contextWithEmptyPayload = createMockContext({
        payload: undefined,
      });

      const builder = GitHubContextBuilderFactory.createFromContext(contextWithEmptyPayload);

      expect(builder.payload).toEqual({});
      expect(builder.defaultBranch).toBe('main');
    });

    test('builder can be used to build valid context', () => {
      const mockContext = createMockContext();
      const builder = GitHubContextBuilderFactory.createFromContext(mockContext);

      expect(() => builder.build()).not.toThrow();
      const builtContext = builder.build();
      expect(builtContext.sha).toBe(mockContext.sha);
      expect(builtContext.ref).toBe(mockContext.ref);
    });
  });

  describe('createGitHubBuilder convenience function', () => {
    test('creates GitHubContextBuilder instance', () => {
      const builder = createGitHubBuilder();

      expect(builder).toBeInstanceOf(GitHubContextBuilder);
      expect(builder.payload).toEqual({});
      expect(builder.defaultBranch).toBe('main');
    });

    test('creates different instances on each call', () => {
      const builder1 = createGitHubBuilder();
      const builder2 = createGitHubBuilder();

      expect(builder1).not.toBe(builder2);
    });
  });

  describe('createGitHubBuilderFromContext convenience function', () => {
    test('creates GitHubContextBuilder from context', () => {
      const mockContext = createMockContext();
      const builder = createGitHubBuilderFromContext(mockContext);

      expect(builder).toBeInstanceOf(GitHubContextBuilder);
      expect(builder.eventName).toBe('pull_request');
      expect(builder.actor).toBe('john-doe');
    });

    test('throws error for null context', () => {
      expect(() => createGitHubBuilderFromContext(null as any))
        .toThrow('GitHub context is required');
    });
  });

  describe('integration tests', () => {
    test('factory methods work together correctly', () => {
      const mockContext = createMockContext();
      
      // Create from context
      const builderFromContext = createGitHubBuilderFromContext(mockContext);
      const contextFromFactory = builderFromContext.build();
      
      // Create empty and populate manually
      const emptyBuilder = createGitHubBuilder();
      const manualContext = emptyBuilder
        .withSha(mockContext.sha)
        .withRef(mockContext.ref)
        .withEventName(mockContext.eventName)
        .withActor(mockContext.actor)
        .build();

      expect(contextFromFactory.sha).toBe(manualContext.sha);
      expect(contextFromFactory.ref).toBe(manualContext.ref);
      expect(contextFromFactory.eventName).toBe(manualContext.eventName);
      expect(contextFromFactory.actor).toBe(manualContext.actor);
    });

    test('handles real-world GitHub context patterns', () => {
      const realWorldContext = createMockContext({
        eventName: 'push',
        ref: 'refs/heads/main',
        sha: 'abc123def456ghi789jkl012mno345pqr678stu90',
        payload: {
          repository: {
            default_branch: 'main',
            name: 'my-repo',
            owner: { login: 'my-org' }
          },
          pusher: { name: 'developer' }
        }
      });

      const builder = createGitHubBuilderFromContext(realWorldContext);
      const context = builder.build();

      expect(context.eventName).toBe('push');
      expect(context.isDefaultBranch).toBe(true);
      expect(context.isPullRequest).toBe(false);
      expect(context.isTag).toBe(false);
      expect(context.refName).toBe('main');
      expect(context.shaShort).toBe('abc123d');
    });
  });
});