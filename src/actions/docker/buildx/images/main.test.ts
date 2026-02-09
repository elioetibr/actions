import * as core from '@actions/core';
import * as execModule from '@actions/exec';
import { run } from './main';
import { DockerBuildXImageToolsBuilder } from './DockerBuildXImageToolsBuilder';

jest.mock('@actions/core');
jest.mock('@actions/exec');

const mockedCore = jest.mocked(core);
const mockedExec = jest.mocked(execModule);

// Default inputs for a valid invocation
const defaultInputs: Record<string, string> = {
  ecrRegistry: '123456789.dkr.ecr.us-east-1.amazonaws.com',
  ecrRepository: 'my-app',
  amd64MetaTags: '["sha-abc-amd64"]',
  arm64MetaTags: '["sha-abc-arm64"]',
  manifestMetaTags: '["latest","v1.2.3"]',
  manifestMetaAnnotations: '["org.opencontainers.image.title=my-app"]',
  semVer: '1.2.3',
};

function setupInputs(overrides: Record<string, string> = {}) {
  const inputs = { ...defaultInputs, ...overrides };
  mockedCore.getInput.mockImplementation((name: string) => inputs[name] ?? '');
  mockedCore.getBooleanInput.mockImplementation((name: string) => {
    if (name === 'dryRun') return inputs['dryRun'] === 'true';
    return false;
  });
}

describe('Docker BuildX ImageTools main', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedExec.exec.mockResolvedValue(0);
  });

  describe('dry run mode', () => {
    it('should set all outputs and skip execution', async () => {
      setupInputs({ dryRun: 'true' });

      await run();

      // Version outputs
      expect(mockedCore.setOutput).toHaveBeenCalledWith('major', '1');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('minor', '2');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('patch', '3');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('version', '1.2.3');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('fullVersion', '1.2.3');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('versionSuffix', '');

      // Registry outputs
      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'ecrRegistry',
        '123456789.dkr.ecr.us-east-1.amazonaws.com',
      );
      expect(mockedCore.setOutput).toHaveBeenCalledWith('ecrRepository', 'my-app');
      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'imageUri',
        '123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:1.2.3',
      );

      // Dry run output
      expect(mockedCore.setOutput).toHaveBeenCalledWith('dryRun', 'true');

      // Should NOT call exec
      expect(mockedExec.exec).not.toHaveBeenCalled();
      expect(mockedCore.info).toHaveBeenCalledWith('Dry run mode - skipping execution');
    });
  });

  describe('successful execution', () => {
    it('should execute create and inspect commands', async () => {
      setupInputs();
      mockedExec.exec.mockResolvedValue(0);

      await run();

      // Should call exec twice: create + inspect
      expect(mockedExec.exec).toHaveBeenCalledTimes(2);

      // First call: create command
      expect(mockedExec.exec).toHaveBeenNthCalledWith(
        1,
        'docker',
        expect.arrayContaining(['buildx', 'imagetools', 'create']),
        expect.objectContaining({ ignoreReturnCode: true }),
      );

      // Second call: inspect command
      expect(mockedExec.exec).toHaveBeenNthCalledWith(
        2,
        'docker',
        expect.arrayContaining(['buildx', 'imagetools', 'inspect']),
        expect.objectContaining({ ignoreReturnCode: true }),
      );

      expect(mockedCore.setFailed).not.toHaveBeenCalled();
    });
  });

  describe('failed create command', () => {
    it('should call setFailed when create exits non-zero', async () => {
      setupInputs();
      mockedExec.exec.mockResolvedValueOnce(1);

      await run();

      expect(mockedCore.setFailed).toHaveBeenCalledWith(
        'Docker BuildX ImageTools create failed with exit code 1',
      );

      // Should NOT call inspect after failed create
      expect(mockedExec.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('annotation parsing', () => {
    it('should parse key=value annotations', async () => {
      setupInputs({
        dryRun: 'true',
        manifestMetaAnnotations: '["org.title=MyApp","org.version=1.0"]',
      });

      await run();

      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'metaAnnotations',
        JSON.stringify({ 'org.title': 'MyApp', 'org.version': '1.0' }),
      );
    });

    it('should handle annotations with = in value', async () => {
      setupInputs({
        dryRun: 'true',
        manifestMetaAnnotations: '["key=value=extra"]',
      });

      await run();

      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'metaAnnotations',
        JSON.stringify({ key: 'value=extra' }),
      );
    });

    it('should skip malformed annotations without =', async () => {
      setupInputs({
        dryRun: 'true',
        manifestMetaAnnotations: '["no-separator"]',
      });

      await run();

      expect(mockedCore.setOutput).toHaveBeenCalledWith('metaAnnotations', JSON.stringify({}));
    });

    it('should skip annotations where = is at position 0', async () => {
      setupInputs({
        dryRun: 'true',
        manifestMetaAnnotations: '["=nokey"]',
      });

      await run();

      expect(mockedCore.setOutput).toHaveBeenCalledWith('metaAnnotations', JSON.stringify({}));
    });

    it('should not call withAnnotations when no valid annotations exist', async () => {
      setupInputs({
        dryRun: 'true',
        manifestMetaAnnotations: '["no-separator"]',
      });

      await run();

      // Command should still be set (without annotations flag)
      expect(mockedCore.setOutput).toHaveBeenCalledWith('buildXArgs', expect.any(String));
    });
  });

  describe('tag outputs', () => {
    it('should set tag-related outputs', async () => {
      setupInputs({ dryRun: 'true' });

      await run();

      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'amd64MetaTags',
        JSON.stringify(['sha-abc-amd64']),
      );
      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'arm64MetaTags',
        JSON.stringify(['sha-abc-arm64']),
      );
      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'archTags',
        JSON.stringify(['sha-abc-amd64', 'sha-abc-arm64']),
      );
      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'manifestMetaTags',
        JSON.stringify(['latest', 'v1.2.3']),
      );
    });
  });

  describe('error handling', () => {
    it('should catch errors and set failed', async () => {
      mockedCore.getInput.mockImplementation(() => {
        throw new Error('missing input');
      });

      await run();

      expect(mockedCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('missing input'));
    });
  });

  describe('semver with suffix', () => {
    it('should handle semver with pre-release suffix', async () => {
      setupInputs({ dryRun: 'true', semVer: '2.0.0-alpha.1' });

      await run();

      expect(mockedCore.setOutput).toHaveBeenCalledWith('major', '2');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('minor', '0');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('patch', '0');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('fullVersion', '2.0.0-alpha.1');
      expect(mockedCore.setOutput).toHaveBeenCalledWith('versionSuffix', '-alpha.1');
      expect(mockedCore.setOutput).toHaveBeenCalledWith(
        'imageUri',
        '123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:2.0.0-alpha.1',
      );
    });
  });

  describe('empty command guards', () => {
    it('should set failed when create buildCommand returns empty array', async () => {
      setupInputs();
      const mockCreateService = {
        buildCommand: jest.fn().mockReturnValue([]),
        toString: jest.fn().mockReturnValue(''),
      };
      const mockCreateBuilder = {
        withTags: jest.fn().mockReturnThis(),
        withSources: jest.fn().mockReturnThis(),
        withAnnotations: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockCreateService),
      };
      const mockInspectService = {
        buildCommand: jest.fn().mockReturnValue(['docker', 'buildx', 'imagetools', 'inspect']),
        toString: jest.fn().mockReturnValue('docker buildx imagetools inspect'),
      };
      const mockInspectBuilder = {
        withSource: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockInspectService),
      };
      jest
        .spyOn(DockerBuildXImageToolsBuilder, 'forCreate')
        .mockReturnValue(mockCreateBuilder as any);
      jest
        .spyOn(DockerBuildXImageToolsBuilder, 'forInspect')
        .mockReturnValue(mockInspectBuilder as any);

      await run();

      expect(mockedCore.setFailed).toHaveBeenCalledWith(
        'Docker BuildX ImageTools produced an empty create command',
      );
      expect(mockedExec.exec).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    });

    it('should set failed when inspect buildCommand returns empty array', async () => {
      setupInputs();
      const mockCreateService = {
        buildCommand: jest.fn().mockReturnValue(['docker', 'buildx', 'imagetools', 'create']),
        toString: jest.fn().mockReturnValue('docker buildx imagetools create'),
      };
      const mockCreateBuilder = {
        withTags: jest.fn().mockReturnThis(),
        withSources: jest.fn().mockReturnThis(),
        withAnnotations: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockCreateService),
      };
      const mockInspectService = {
        buildCommand: jest.fn().mockReturnValue([]),
        toString: jest.fn().mockReturnValue(''),
      };
      const mockInspectBuilder = {
        withSource: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockInspectService),
      };
      jest
        .spyOn(DockerBuildXImageToolsBuilder, 'forCreate')
        .mockReturnValue(mockCreateBuilder as any);
      jest
        .spyOn(DockerBuildXImageToolsBuilder, 'forInspect')
        .mockReturnValue(mockInspectBuilder as any);

      await run();

      expect(mockedCore.setFailed).toHaveBeenCalledWith(
        'Docker BuildX ImageTools produced an empty inspect command',
      );
      // Create command should have executed successfully
      expect(mockedExec.exec).toHaveBeenCalledTimes(1);
      jest.restoreAllMocks();
    });
  });
});
