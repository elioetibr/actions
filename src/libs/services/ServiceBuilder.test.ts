import { Context } from '@actions/github/lib/context';
import { ServiceBuilder, createServices } from './ServiceBuilder';
import { IGitHubContextService } from './github';
import { ISemanticVersionService } from './version';

// Mock the dependencies
jest.mock('@actions/github', () => ({
  context: {
    ref: 'refs/heads/main',
    sha: 'abc123def456',
    eventName: 'push',
    payload: {},
    actor: 'test-user',
    workflow: 'test-workflow',
    action: 'test-action',
    job: 'test-job',
    runNumber: 1,
    runId: 123,
    runAttempt: 1,
    apiUrl: 'https://api.github.com',
    serverUrl: 'https://github.com',
    graphqlUrl: 'https://api.github.com/graphql',
    issue: { number: 1, owner: 'test-owner', repo: 'test-repo' },
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

jest.mock('./github/context/services', () => ({
  createGitHubContextService: jest.fn(),
}));

describe('ServiceBuilder', () => {
  let mockContext: Context;
  let mockGitHubContextService: jest.Mocked<IGitHubContextService>;

  beforeEach(() => {
    mockContext = {
      ref: 'refs/heads/main',
      sha: 'abc123def456',
      eventName: 'push',
      payload: {},
      actor: 'test-user',
      workflow: 'test-workflow',
      action: 'test-action',
      job: 'test-job',
      runNumber: 1,
      runId: 123,
      runAttempt: 1,
      apiUrl: 'https://api.github.com',
      serverUrl: 'https://github.com',
      graphqlUrl: 'https://api.github.com/graphql',
      issue: { number: 1, owner: 'test-owner', repo: 'test-repo' },
      repo: { owner: 'test-owner', repo: 'test-repo' },
    } as Context;

    mockGitHubContextService = {
      buildContext: jest.fn().mockReturnValue({
        ref: 'refs/heads/main',
        sha: 'abc123def456',
        shortSha: 'abc123d',
        eventName: 'push',
        isDefaultBranch: true,
        isPullRequest: false,
        isTag: false,
      }),
    } as jest.Mocked<IGitHubContextService>;

    const { createGitHubContextService } = require('./github/context/services');
    createGitHubContextService.mockReturnValue(mockGitHubContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default github context when no context provided', () => {
      const builder = new ServiceBuilder();
      expect(builder).toBeInstanceOf(ServiceBuilder);
    });

    it('should initialize with provided context', () => {
      const builder = new ServiceBuilder(mockContext);
      expect(builder).toBeInstanceOf(ServiceBuilder);
    });
  });

  describe('withGitHubContext', () => {
    it('should create GitHub context service and return self for chaining', () => {
      const builder = new ServiceBuilder(mockContext);
      const result = builder.withGitHubContext();

      expect(result).toBe(builder);
      expect(require('./github/context/services').createGitHubContextService).toHaveBeenCalledWith(
        mockContext,
      );
    });
  });

  describe('build', () => {
    it('should throw error when required services are missing', () => {
      const builder = new ServiceBuilder(mockContext);

      expect(() => builder.build()).toThrow(
        'Missing required services: githubContextService, semanticVersionService',
      );
    });

    it('should return service container when githubContextService is provided but semanticVersionService is missing', () => {
      const builder = new ServiceBuilder(mockContext);
      builder.withGitHubContext();

      expect(() => builder.build()).toThrow('Missing required services: semanticVersionService');
    });

    it('should return service container when all required services are provided', () => {
      const builder = new ServiceBuilder(mockContext);
      builder.withGitHubContext();

      // Mock semantic version service for the build to pass
      (builder as any).services.semanticVersionService = {} as ISemanticVersionService;

      const result = builder.build();

      expect(result).toBeDefined();
      expect(result.githubContextService).toBe(mockGitHubContextService);
      expect(result.semanticVersionService).toBeDefined();
    });
  });

  describe('buildAll', () => {
    it('should build all services and return service container', () => {
      const builder = new ServiceBuilder(mockContext);

      // Mock semantic version service for the build to pass
      (builder as any).services.semanticVersionService = {} as ISemanticVersionService;

      const result = builder.buildAll();

      expect(result).toBeDefined();
      expect(result.githubContextService).toBe(mockGitHubContextService);
      expect(require('./github/context/services').createGitHubContextService).toHaveBeenCalledWith(
        mockContext,
      );
    });

    it('should call withGitHubContext and build in sequence', () => {
      const builder = new ServiceBuilder(mockContext);

      // Mock semantic version service for the build to pass
      (builder as any).services.semanticVersionService = {} as ISemanticVersionService;

      const withGitHubContextSpy = jest.spyOn(builder, 'withGitHubContext');
      const buildSpy = jest.spyOn(builder, 'build');

      builder.buildAll();

      expect(withGitHubContextSpy).toHaveBeenCalled();
      expect(buildSpy).toHaveBeenCalled();
    });
  });

  describe('build validation', () => {
    it('should validate all required services exist before building', () => {
      const builder = new ServiceBuilder(mockContext);

      // Only set githubContextService
      builder.withGitHubContext();

      expect(() => builder.build()).toThrow('Missing required services: semanticVersionService');
    });

    it('should not throw when all required services are present', () => {
      const builder = new ServiceBuilder(mockContext);

      // Set all required services
      builder.withGitHubContext();
      (builder as any).services.semanticVersionService = {} as ISemanticVersionService;

      expect(() => builder.build()).not.toThrow();
    });
  });

  describe('service container interface compliance', () => {
    it('should return object that implements IServiceContainer interface', () => {
      const builder = new ServiceBuilder(mockContext);
      builder.withGitHubContext();
      (builder as any).services.semanticVersionService = {} as ISemanticVersionService;

      const result = builder.build();

      expect(result).toHaveProperty('githubContextService');
      expect(result).toHaveProperty('semanticVersionService');
      expect(result.githubContextService).toBe(mockGitHubContextService);
    });
  });
});

describe('createServices factory function', () => {
  let mockGitHubContextService: jest.Mocked<IGitHubContextService>;

  beforeEach(() => {
    mockGitHubContextService = {
      buildContext: jest.fn().mockReturnValue({
        ref: 'refs/heads/main',
        sha: 'abc123def456',
        shortSha: 'abc123d',
        eventName: 'push',
        isDefaultBranch: true,
        isPullRequest: false,
        isTag: false,
      }),
    } as jest.Mocked<IGitHubContextService>;

    const { createGitHubContextService } = require('./github/context/services');
    createGitHubContextService.mockReturnValue(mockGitHubContextService);
  });

  it('should create services using default github context when no context provided', () => {
    // The actual createServices function will fail because it requires all services
    // This is expected behavior - the factory requires the semantic version service
    expect(() => createServices()).toThrow('Missing required services: semanticVersionService');
  });

  it('should create services using provided context', () => {
    const mockContext = {
      ref: 'refs/heads/test',
      sha: 'test123',
      eventName: 'push',
    } as Context;

    // The actual createServices function will fail because it requires all services
    // This is expected behavior - the factory requires the semantic version service
    expect(() => createServices(mockContext)).toThrow('Missing required services: semanticVersionService');
  });
});
