import type { IAgent } from '../../agents/interfaces';
import type { SemVer, VersionSpec } from '../../libs/version-manager';
import * as versionManager from '../../libs/version-manager';

// Mock the version-manager module before importing the runner
jest.mock('../../libs/version-manager', () => {
  const mockFileReader = { read: jest.fn() };
  const mockTfResolver = { resolve: jest.fn() };
  const mockTfInstaller = { install: jest.fn(), isInstalled: jest.fn() };
  const mockTgResolver = { resolve: jest.fn() };
  const mockTgInstaller = { install: jest.fn(), isInstalled: jest.fn() };

  return {
    VersionFileReader: jest.fn(() => mockFileReader),
    TerraformVersionResolver: jest.fn(() => mockTfResolver),
    TerraformVersionInstaller: jest.fn(() => mockTfInstaller),
    TerragruntVersionResolver: jest.fn(() => mockTgResolver),
    TerragruntVersionInstaller: jest.fn(() => mockTgInstaller),
    detectTerragruntVersion: jest.fn(),
    isV1OrLater: jest.fn(),
    __mockTfResolver: mockTfResolver,
    __mockTfInstaller: mockTfInstaller,
    __mockTgResolver: mockTgResolver,
    __mockTgInstaller: mockTgInstaller,
  };
});

import { TerragruntRunner } from './runner';

const mockDetectTerragruntVersion = jest.mocked(versionManager.detectTerragruntVersion);
const mockIsV1OrLater = jest.mocked(versionManager.isV1OrLater);

interface MockInternals {
  __mockTfResolver: { resolve: jest.Mock };
  __mockTfInstaller: { install: jest.Mock; isInstalled: jest.Mock };
  __mockTgResolver: { resolve: jest.Mock };
  __mockTgInstaller: { install: jest.Mock; isInstalled: jest.Mock };
}

const {
  __mockTfResolver: tfResolver,
  __mockTfInstaller: tfInstaller,
  __mockTgResolver: tgResolver,
  __mockTgInstaller: tgInstaller,
} = versionManager as unknown as MockInternals;

function createMockAgent(overrides: Record<string, string> = {}): jest.Mocked<IAgent> {
  const inputs: Record<string, string> = {
    command: 'plan',
    'working-directory': '/workspace',
    'terraform-version': '',
    'terraform-version-file': '.terraform-version',
    'terragrunt-version': '',
    'terragrunt-version-file': '.terragrunt-version',
    variables: '{}',
    'var-files': '',
    'backend-config': '{}',
    targets: '',
    'plan-file': '',
    parallelism: '',
    'lock-timeout': '',
    refresh: 'true',
    'terragrunt-config': '',
    'terragrunt-working-dir': '',
    'terragrunt-parallelism': '',
    'include-dirs': '',
    'exclude-dirs': '',
    'terragrunt-source': '',
    'source-map': '{}',
    'download-dir': '',
    'iam-role': '',
    'iam-role-session-name': '',
    ...overrides,
  };

  const boolInputs: Record<string, boolean> = {
    'run-all': false,
    'auto-approve': false,
    'no-color': false,
    'compact-warnings': false,
    reconfigure: false,
    'migrate-state': false,
    'non-interactive': true,
    'no-auto-init': false,
    'no-auto-retry': false,
    'ignore-dependency-errors': false,
    'ignore-external-dependencies': false,
    'include-external-dependencies': false,
    'strict-include': false,
    'dry-run': true, // dry-run by default
  };

  return {
    getInput: jest.fn((name: string, _required?: boolean) => inputs[name] ?? ''),
    getBooleanInput: jest.fn((name: string, _required?: boolean) => boolInputs[name] ?? false),
    getMultilineInput: jest.fn((_name: string, _required?: boolean) => []),
    setOutput: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    setFailed: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    addPath: jest.fn(),
    exportVariable: jest.fn(),
    exec: jest.fn().mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' }),
  };
}

/** Default Terragrunt v0.x SemVer for mocking */
const tgV0: SemVer = { major: 0, minor: 75, patch: 10, raw: '0.75.10' };
/** Terragrunt v1.x SemVer for mocking */
const tgV1: SemVer = { major: 1, minor: 0, patch: 0, raw: '1.0.0' };

function setupDefaultMocks(tgVersion: SemVer = tgV0): void {
  // Terraform version: skip (no install)
  tfResolver.resolve.mockResolvedValue(undefined);
  // Terragrunt version: skip (no install)
  tgResolver.resolve.mockResolvedValue(undefined);
  // Version detection defaults
  mockDetectTerragruntVersion.mockResolvedValue(tgVersion);
  mockIsV1OrLater.mockReturnValue(tgVersion.major >= 1);
}

describe('TerragruntRunner', () => {
  let runner: TerragruntRunner;

  beforeEach(() => {
    jest.clearAllMocks();
    runner = new TerragruntRunner();
    setupDefaultMocks();
  });

  describe('terraform version management', () => {
    test('resolves and installs terraform version', async () => {
      const agent = createMockAgent({ 'terraform-version': '1.9.8' });
      const spec: VersionSpec = { input: '1.9.8', resolved: '1.9.8', source: 'input' };
      tfResolver.resolve.mockResolvedValue(spec);
      tfInstaller.install.mockResolvedValue('/cache/terraform/1.9.8');

      await runner.run(agent, 'execute');

      expect(tfResolver.resolve).toHaveBeenCalledWith('1.9.8', '.terraform-version', '/workspace');
      expect(tfInstaller.install).toHaveBeenCalledWith('1.9.8', agent);
      expect(agent.addPath).toHaveBeenCalledWith('/cache/terraform/1.9.8');
    });

    test('skip mode does not install terraform', async () => {
      const agent = createMockAgent({ 'terraform-version': 'skip' });
      tfResolver.resolve.mockResolvedValue(undefined);

      await runner.run(agent, 'execute');

      expect(tfInstaller.install).not.toHaveBeenCalled();
      expect(agent.info).toHaveBeenCalledWith(
        'Terraform version: skip (using existing PATH binary)',
      );
    });
  });

  describe('terragrunt version management', () => {
    test('resolves and installs terragrunt version', async () => {
      const agent = createMockAgent({ 'terragrunt-version': '0.75.10' });
      const spec: VersionSpec = { input: '0.75.10', resolved: '0.75.10', source: 'input' };
      tgResolver.resolve.mockResolvedValue(spec);
      tgInstaller.install.mockResolvedValue('/cache/terragrunt/0.75.10');

      await runner.run(agent, 'execute');

      expect(tgResolver.resolve).toHaveBeenCalledWith(
        '0.75.10',
        '.terragrunt-version',
        '/workspace',
      );
      expect(tgInstaller.install).toHaveBeenCalledWith('0.75.10', agent);
      expect(agent.addPath).toHaveBeenCalledWith('/cache/terragrunt/0.75.10');
    });

    test('skip mode does not install terragrunt', async () => {
      const agent = createMockAgent({ 'terragrunt-version': 'skip' });
      tgResolver.resolve.mockResolvedValue(undefined);

      await runner.run(agent, 'execute');

      expect(tgInstaller.install).not.toHaveBeenCalled();
      expect(agent.info).toHaveBeenCalledWith(
        'Terragrunt version: skip (using existing PATH binary)',
      );
    });

    test('empty version resolves via version file', async () => {
      const agent = createMockAgent({ 'terragrunt-version': '' });
      const spec: VersionSpec = { input: '0.75.10', resolved: '0.75.10', source: 'file' };
      tgResolver.resolve.mockResolvedValue(spec);
      tgInstaller.install.mockResolvedValue('/cache/terragrunt/0.75.10');

      await runner.run(agent, 'execute');

      expect(tgResolver.resolve).toHaveBeenCalledWith('', '.terragrunt-version', '/workspace');
      expect(tgInstaller.install).toHaveBeenCalledWith('0.75.10', agent);
    });
  });

  describe('version detection and v0/v1 flag selection', () => {
    test('detects v0.x and logs classic CLI label', async () => {
      const agent = createMockAgent();
      setupDefaultMocks(tgV0);

      await runner.run(agent, 'execute');

      expect(mockDetectTerragruntVersion).toHaveBeenCalledWith(agent);
      expect(agent.info).toHaveBeenCalledWith('Detected Terragrunt 0.75.10 — v0.x (classic CLI)');
    });

    test('detects v1.x and logs new CLI label', async () => {
      const agent = createMockAgent();
      setupDefaultMocks(tgV1);

      await runner.run(agent, 'execute');

      expect(mockDetectTerragruntVersion).toHaveBeenCalledWith(agent);
      expect(agent.info).toHaveBeenCalledWith('Detected Terragrunt 1.0.0 — v1.x+ (new CLI)');
    });

    test('detected major version is passed to builder (v0 generates v0 flags)', async () => {
      const agent = createMockAgent();
      setupDefaultMocks(tgV0);

      const result = await runner.run(agent, 'execute');

      // In dry-run mode, we can inspect the command string from outputs
      expect(result.success).toBe(true);
      const commandString = result.outputs['command-string'];
      // v0 with non-interactive should generate --terragrunt-non-interactive
      expect(commandString).toContain('--terragrunt-non-interactive');
    });

    test('detected major version is passed to builder (v1 generates v1 flags)', async () => {
      const agent = createMockAgent();
      setupDefaultMocks(tgV1);

      const result = await runner.run(agent, 'execute');

      expect(result.success).toBe(true);
      const commandString = result.outputs['command-string'];
      // v1 with non-interactive should generate --non-interactive
      expect(commandString).toContain('--non-interactive');
      // And should NOT have --terragrunt- prefix
      expect(commandString).not.toContain('--terragrunt-non-interactive');
    });
  });

  describe('execution order', () => {
    test('terraform version setup runs before terragrunt version setup', async () => {
      const agent = createMockAgent();
      const callOrder: string[] = [];

      tfResolver.resolve.mockImplementation(async () => {
        callOrder.push('tf-resolve');
        return undefined;
      });
      tgResolver.resolve.mockImplementation(async () => {
        callOrder.push('tg-resolve');
        return undefined;
      });

      await runner.run(agent, 'execute');

      expect(callOrder).toEqual(['tf-resolve', 'tg-resolve']);
    });

    test('version setup uses log groups', async () => {
      const agent = createMockAgent();

      await runner.run(agent, 'execute');

      expect(agent.startGroup).toHaveBeenCalledWith('Terraform version setup');
      expect(agent.startGroup).toHaveBeenCalledWith('Terragrunt version setup');
      // endGroup called twice (once for each setup)
      expect(agent.endGroup).toHaveBeenCalledTimes(2);
    });

    test('endGroup is always called even if version resolution fails', async () => {
      const agent = createMockAgent();
      tfResolver.resolve.mockRejectedValue(new Error('Network error'));

      await runner.run(agent, 'execute');

      expect(agent.startGroup).toHaveBeenCalledWith('Terraform version setup');
      expect(agent.endGroup).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('terraform version resolution error propagates as runner failure', async () => {
      const agent = createMockAgent();
      tfResolver.resolve.mockRejectedValue(new Error('Invalid terraform version'));

      const result = await runner.run(agent, 'execute');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid terraform version');
    });

    test('terragrunt version resolution error propagates as runner failure', async () => {
      const agent = createMockAgent();
      tgResolver.resolve.mockRejectedValue(new Error('Invalid terragrunt version'));

      const result = await runner.run(agent, 'execute');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid terragrunt version');
    });

    test('version detection error propagates as runner failure', async () => {
      const agent = createMockAgent();
      mockDetectTerragruntVersion.mockRejectedValue(new Error('terragrunt --version failed'));

      const result = await runner.run(agent, 'execute');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('terragrunt --version failed');
    });
  });

  describe('runner metadata', () => {
    test('name is terragrunt', () => {
      expect(runner.name).toBe('terragrunt');
    });

    test('unknown step returns failure', async () => {
      const agent = createMockAgent();
      const result = await runner.run(agent, 'nonexistent');
      expect(result.success).toBe(false);
    });
  });
});
