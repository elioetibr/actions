import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { ActionRunner, run } from './main';
import { IServiceContainer, createServices } from '../ServiceBuilder';
import { handleError, handleSuccess } from '../../utils';

// Mock the dependencies
jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../../utils');
jest.mock('../ServiceBuilder');

describe('ActionRunner', () => {
  let mockServices: jest.Mocked<IServiceContainer>;
  let mockCore: jest.Mocked<typeof core>;
  let mockHandleError: jest.MockedFunction<typeof handleError>;

  beforeEach(() => {
    mockServices = {
      githubContextService: {
        buildContext: jest.fn(),
      },
      semanticVersionService: {
        version: '1.0.0',
        semVer: '1.0.0',
        major: '1',
        minor: '0',
        patch: '0',
        majorMinor: '1.0',
        majorMinorPatch: '1.0.0',
        semVerSuffix: '',
        semVerInfo: {
          version: '1.0.0',
          semVer: '1.0.0',
          major: '1',
          minor: '0',
          patch: '0',
          majorMinor: '1.0',
          majorMinorPatch: '1.0.0',
          semVerSuffix: '',
        },
      },
    } as jest.Mocked<IServiceContainer>;

    mockCore = core as jest.Mocked<typeof core>;
    mockCore.info = jest.fn();
    mockCore.isDebug = jest.fn().mockReturnValue(true);

    mockHandleError = handleError as jest.MockedFunction<typeof handleError>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create ActionRunner with provided services', () => {
      const runner = new ActionRunner(mockServices);
      expect(runner).toBeInstanceOf(ActionRunner);
    });
  });

  describe('run', () => {
    it('should log startup messages with debug info', async () => {
      const runner = new ActionRunner(mockServices);

      await runner.run();

      expect(mockCore.info).toHaveBeenCalledWith('⭐ Starting Action Runner...');
      expect(mockCore.info).toHaveBeenCalledWith('❓ Debug is Enabled: true');
      expect(mockCore.info).toHaveBeenCalledWith(expect.stringContaining('❓ Debug is Enabled:'));
      expect(mockCore.isDebug).toHaveBeenCalled();
    });

    it('should handle errors and call handleError', async () => {
      const error = new Error('Test error');
      mockCore.info = jest.fn().mockImplementation(() => {
        throw error;
      });

      const runner = new ActionRunner(mockServices);

      await runner.run();

      expect(mockHandleError).toHaveBeenCalledWith(error);
    });

    it('should stringify services object for debug output', async () => {
      const runner = new ActionRunner(mockServices);

      await runner.run();

      expect(mockCore.info).toHaveBeenCalledWith(
        expect.stringMatching(/❓ Debug is Enabled: \{[\s\S]*\}/),
      );
    });
  });
});

describe('run function', () => {
  let mockContext: Context;
  let mockCreateServices: jest.MockedFunction<any>;
  let mockServices: jest.Mocked<IServiceContainer>;
  beforeEach(() => {
    mockContext = {
      ref: 'refs/heads/main',
      sha: 'abc123',
      eventName: 'push',
    } as Context;

    mockServices = {
      githubContextService: {
        buildContext: jest.fn(),
      },
      semanticVersionService: {
        version: '1.0.0',
        semVer: '1.0.0',
        major: '1',
        minor: '0',
        patch: '0',
        majorMinor: '1.0',
        majorMinorPatch: '1.0.0',
        semVerSuffix: '',
        semVerInfo: {
          version: '1.0.0',
          semVer: '1.0.0',
          major: '1',
          minor: '0',
          patch: '0',
          majorMinor: '1.0',
          majorMinorPatch: '1.0.0',
          semVerSuffix: '',
        },
      },
    } as jest.Mocked<IServiceContainer>;

    mockCreateServices = jest.fn().mockReturnValue(mockServices);
    jest.mocked(createServices).mockImplementation(mockCreateServices);

    const mockCore = core as jest.Mocked<typeof core>;
    mockCore.info = jest.fn();
    mockCore.isDebug = jest.fn().mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use default github.context when no context provided', async () => {
    const mockGithubContext = { ref: 'refs/heads/default', sha: 'default123' };
    (github as any).context = mockGithubContext;

    await run();

    expect(mockCreateServices).toHaveBeenCalledWith(mockGithubContext);
  });

  it('should use provided context when given', async () => {
    await run(mockContext);

    expect(mockCreateServices).toHaveBeenCalledWith(mockContext);
  });

  it('should use provided services container when given', async () => {
    await run(mockContext, mockServices);

    expect(mockCreateServices).not.toHaveBeenCalled();
  });

  it('should create and run ActionRunner with services', async () => {
    const mockCore = core as jest.Mocked<typeof core>;
    mockCore.info = jest.fn();
    mockCore.isDebug = jest.fn().mockReturnValue(false);

    await run(mockContext, mockServices);

    expect(mockCore.info).toHaveBeenCalledWith('⭐ Starting Action Runner...');
  });
});

describe('promise handling patterns', () => {
  let mockHandleSuccess: jest.MockedFunction<typeof handleSuccess>;
  let mockHandleError: jest.MockedFunction<typeof handleError>;

  beforeEach(() => {
    mockHandleSuccess = handleSuccess as jest.MockedFunction<typeof handleSuccess>;
    mockHandleError = handleError as jest.MockedFunction<typeof handleError>;

    // Mock Promise methods
    mockHandleSuccess.mockResolvedValue(undefined);
    mockHandleError.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful promise execution', async () => {
    const promise = Promise.resolve();

    await promise.then(handleSuccess).catch(handleError);

    expect(mockHandleSuccess).toHaveBeenCalled();
  });

  it('should handle failed promise execution', async () => {
    const error = new Error('Execution failed');
    const promise = Promise.reject(error);

    await promise.then(handleSuccess).catch(handleError);

    expect(mockHandleError).toHaveBeenCalledWith(error);
  });
});
