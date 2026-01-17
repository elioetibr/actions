import { GitHubContextBuilder } from './GitHubContextBuilder';
import { IGitHubContext } from '../interfaces';

describe('GitHubContextBuilder', () => {
  let builder: GitHubContextBuilder;

  beforeEach(() => {
    builder = new GitHubContextBuilder();
  });

  describe('constructor', () => {
    test('initializes with default values', () => {
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
      expect(builder.isDefaultBranch).toBe(false);
      expect(builder.isPullRequest).toBe(false);
      expect(builder.isTag).toBe(false);
      expect(builder.refName).toBe('');
      expect(builder.shaShort).toBe('');
    });
  });

  describe('withPayload', () => {
    test('sets payload and returns builder instance', () => {
      const payload = { action: 'opened', number: 123 };
      const result = builder.withPayload(payload);

      expect(builder.payload).toEqual(payload);
      expect(result).toBe(builder);
    });
  });

  describe('withEventName', () => {
    test('sets event name and returns builder instance', () => {
      const result = builder.withEventName('pull_request');

      expect(builder.eventName).toBe('pull_request');
      expect(result).toBe(builder);
    });
  });

  describe('withSha', () => {
    test('sets SHA and calculates short SHA', () => {
      const sha = 'abcdef1234567890abcdef1234567890abcdef12';
      const result = builder.withSha(sha);

      expect(builder.sha).toBe(sha);
      expect(builder.shaShort).toBe('abcdef1');
      expect(result).toBe(builder);
    });

    test('handles short SHA correctly', () => {
      const sha = 'abc123';
      builder.withSha(sha);

      expect(builder.sha).toBe(sha);
      expect(builder.shaShort).toBe('abc123');
    });
  });

  describe('withRef', () => {
    test('sets ref and calculates derived properties for branch', () => {
      const result = builder.withRef('refs/heads/feature-branch');

      expect(builder.ref).toBe('refs/heads/feature-branch');
      expect(builder.refName).toBe('feature-branch');
      expect(builder.isPullRequest).toBe(false);
      expect(builder.isTag).toBe(false);
      expect(result).toBe(builder);
    });

    test('identifies pull request refs correctly', () => {
      builder.withRef('refs/pull/123/merge');

      expect(builder.refName).toBe('123/merge');
      expect(builder.isPullRequest).toBe(true);
      expect(builder.isTag).toBe(false);
    });

    test('identifies tag refs correctly', () => {
      builder.withRef('refs/tags/v1.2.3');

      expect(builder.refName).toBe('v1.2.3');
      expect(builder.isPullRequest).toBe(false);
      expect(builder.isTag).toBe(true);
    });

    test('updates isDefaultBranch when default branch is set', () => {
      builder.withDefaultBranch('main');
      builder.withRef('refs/heads/main');

      expect(builder.isDefaultBranch).toBe(true);
    });

    test('updates isDefaultBranch to false for non-default branch', () => {
      builder.withDefaultBranch('main');
      builder.withRef('refs/heads/feature');

      expect(builder.isDefaultBranch).toBe(false);
    });
  });

  describe('withWorkflow', () => {
    test('sets workflow and returns builder instance', () => {
      const result = builder.withWorkflow('CI/CD Pipeline');

      expect(builder.workflow).toBe('CI/CD Pipeline');
      expect(result).toBe(builder);
    });
  });

  describe('withAction', () => {
    test('sets action and returns builder instance', () => {
      const result = builder.withAction('test-action');

      expect(builder.action).toBe('test-action');
      expect(result).toBe(builder);
    });
  });

  describe('withActor', () => {
    test('sets actor and returns builder instance', () => {
      const result = builder.withActor('john-doe');

      expect(builder.actor).toBe('john-doe');
      expect(result).toBe(builder);
    });
  });

  describe('withJob', () => {
    test('sets job and returns builder instance', () => {
      const result = builder.withJob('build');

      expect(builder.job).toBe('build');
      expect(result).toBe(builder);
    });
  });

  describe('withRunAttempt', () => {
    test('sets run attempt and returns builder instance', () => {
      const result = builder.withRunAttempt(3);

      expect(builder.runAttempt).toBe(3);
      expect(result).toBe(builder);
    });
  });

  describe('withRunNumber', () => {
    test('sets run number and returns builder instance', () => {
      const result = builder.withRunNumber(42);

      expect(builder.runNumber).toBe(42);
      expect(result).toBe(builder);
    });
  });

  describe('withRunId', () => {
    test('sets run ID and returns builder instance', () => {
      const result = builder.withRunId(123456789);

      expect(builder.runId).toBe(123456789);
      expect(result).toBe(builder);
    });
  });

  describe('withApiUrl', () => {
    test('sets API URL and returns builder instance', () => {
      const result = builder.withApiUrl('https://api.github.com');

      expect(builder.apiUrl).toBe('https://api.github.com');
      expect(result).toBe(builder);
    });
  });

  describe('withServerUrl', () => {
    test('sets server URL and returns builder instance', () => {
      const result = builder.withServerUrl('https://github.com');

      expect(builder.serverUrl).toBe('https://github.com');
      expect(result).toBe(builder);
    });
  });

  describe('withGraphqlUrl', () => {
    test('sets GraphQL URL and returns builder instance', () => {
      const result = builder.withGraphqlUrl('https://api.github.com/graphql');

      expect(builder.graphqlUrl).toBe('https://api.github.com/graphql');
      expect(result).toBe(builder);
    });
  });

  describe('withIssue', () => {
    test('sets issue information and returns builder instance', () => {
      const result = builder.withIssue('owner', 'repo', 123);

      expect(builder.issue).toEqual({ owner: 'owner', repo: 'repo', number: 123 });
      expect(result).toBe(builder);
    });
  });

  describe('withRepo', () => {
    test('sets repository information and returns builder instance', () => {
      const result = builder.withRepo('owner', 'repo');

      expect(builder.repo).toEqual({ owner: 'owner', repo: 'repo' });
      expect(result).toBe(builder);
    });
  });

  describe('withDefaultBranch', () => {
    test('sets default branch and returns builder instance', () => {
      const result = builder.withDefaultBranch('develop');

      expect(builder.defaultBranch).toBe('develop');
      expect(result).toBe(builder);
    });

    test('updates isDefaultBranch when ref is already set', () => {
      builder.withRef('refs/heads/develop');
      builder.withDefaultBranch('develop');

      expect(builder.isDefaultBranch).toBe(true);
    });

    test('updates isDefaultBranch to false when ref does not match', () => {
      builder.withRef('refs/heads/feature');
      builder.withDefaultBranch('develop');

      expect(builder.isDefaultBranch).toBe(false);
    });
  });

  describe('build', () => {
    test('builds valid GitHub context when required fields are set', () => {
      const payload = { action: 'opened' };
      const sha = 'abcdef1234567890abcdef1234567890abcdef12';
      const ref = 'refs/heads/main';

      const context: IGitHubContext = builder
        .withPayload(payload)
        .withEventName('pull_request')
        .withSha(sha)
        .withRef(ref)
        .withWorkflow('CI')
        .withAction('test')
        .withActor('john')
        .withJob('build')
        .withRunAttempt(1)
        .withRunNumber(42)
        .withRunId(123)
        .withApiUrl('https://api.github.com')
        .withServerUrl('https://github.com')
        .withGraphqlUrl('https://api.github.com/graphql')
        .withIssue('owner', 'repo', 123)
        .withRepo('owner', 'repo')
        .withDefaultBranch('main')
        .build();

      expect(context).toEqual({
        payload,
        eventName: 'pull_request',
        sha,
        ref,
        workflow: 'CI',
        action: 'test',
        actor: 'john',
        job: 'build',
        runAttempt: 1,
        runNumber: 42,
        runId: 123,
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
      });
    });

    test('throws error when SHA is missing', () => {
      builder.withRef('refs/heads/main');

      expect(() => builder.build()).toThrow('Invalid GitHub context: missing ref or sha');
    });

    test('throws error when ref is missing', () => {
      builder.withSha('abcdef1234567890abcdef1234567890abcdef12');

      expect(() => builder.build()).toThrow('Invalid GitHub context: missing ref or sha');
    });

    test('throws error when both SHA and ref are missing', () => {
      expect(() => builder.build()).toThrow('Invalid GitHub context: missing ref or sha');
    });
  });

  describe('fluent interface', () => {
    test('allows method chaining', () => {
      const result = builder
        .withPayload({ action: 'opened' })
        .withEventName('pull_request')
        .withSha('abcdef1234567890abcdef1234567890abcdef12')
        .withRef('refs/heads/main')
        .withWorkflow('CI')
        .withAction('test')
        .withActor('john')
        .withJob('build')
        .withRunAttempt(1)
        .withRunNumber(42)
        .withRunId(123)
        .withApiUrl('https://api.github.com')
        .withServerUrl('https://github.com')
        .withGraphqlUrl('https://api.github.com/graphql')
        .withIssue('owner', 'repo', 123)
        .withRepo('owner', 'repo')
        .withDefaultBranch('main');

      expect(result).toBe(builder);
      expect(() => result.build()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('handles empty strings correctly', () => {
      builder
        .withSha('')
        .withRef('refs/heads/main');

      expect(() => builder.build()).toThrow('Invalid GitHub context: missing ref or sha');
    });

    test('handles complex ref patterns', () => {
      builder.withRef('refs/remotes/origin/feature/complex-name');

      expect(builder.refName).toBe('remotes/origin/feature/complex-name');
      expect(builder.isPullRequest).toBe(false);
      expect(builder.isTag).toBe(false);
    });

    test('handles ref without prefix', () => {
      builder.withRef('main');

      expect(builder.refName).toBe('main');
      expect(builder.isPullRequest).toBe(false);
      expect(builder.isTag).toBe(false);
    });
  });
});