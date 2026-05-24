import { mock, jest, describe, test, beforeAll, beforeEach, expect } from 'bun:test';
import type { IAgent } from '../../agents/interfaces';
import type { VersionSpec } from '../../libs/version-manager';

// Define mock instances at module scope — available before mock.module() runs
const mockFileReader = { read: jest.fn() };
const mockResolver = { resolve: jest.fn() };
const mockInstaller = { install: jest.fn(), isInstalled: jest.fn() };

// mock.module() is NOT hoisted, so mock instances above are already assigned.
// Include ALL version-manager exports so the module object has the full shape —
// this prevents Bun from failing when another test file in the same worker later
// imports additional named exports (TerragruntVersionResolver etc.) from this path.
mock.module('../../libs/version-manager', () => ({
  VersionFileReader: jest.fn(() => mockFileReader),
  TerraformVersionResolver: jest.fn(() => mockResolver),
  TerraformVersionInstaller: jest.fn(() => mockInstaller),
  TerragruntVersionResolver: jest.fn(),
  TerragruntVersionInstaller: jest.fn(),
  detectTerragruntVersion: jest.fn(),
  isV1OrLater: jest.fn(),
}));

// Load the runner via dynamic import AFTER mock is registered
// (runner.ts module-level singletons are created here, with our mocks in place)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TerraformRunner: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createTerraformRunner: any;
beforeAll(async () => {
  const mod = await import('./runner');
  TerraformRunner = mod.TerraformRunner;
  createTerraformRunner = mod.createTerraformRunner;
});

function createMockAgent(overrides: Record<string, string> = {}): jest.Mocked<IAgent> {
  const inputs: Record<string, string> = {
    command: 'plan',
    'working-directory': '/workspace',
    'terraform-version': '',
    'terraform-version-file': '.terraform-version',
    variables: '{}',
    'var-files': '',
    'backend-config': '{}',
    targets: '',
    'plan-file': '',
    parallelism: '',
    'lock-timeout': '',
    refresh: 'true',
    ...overrides,
  };

  const boolInputs: Record<string, boolean> = {
    'auto-approve': false,
    'no-color': false,
    'compact-warnings': false,
    reconfigure: false,
    'migrate-state': false,
    'dry-run': true, // dry-run by default so we don't need to mock exec for command
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

describe('TerraformRunner', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let runner: any;

  beforeEach(() => {
    jest.clearAllMocks();
    runner = new TerraformRunner();
  });

  describe('version management', () => {
    test('resolves and installs terraform version before command execution', async () => {
      const agent = createMockAgent({ 'terraform-version': '1.9.8' });
      const spec: VersionSpec = { input: '1.9.8', resolved: '1.9.8', source: 'input' };
      mockResolver.resolve.mockResolvedValue(spec);
      mockInstaller.install.mockResolvedValue('/cache/terraform/1.9.8');

      await runner.run(agent, 'execute');

      expect(mockResolver.resolve).toHaveBeenCalledWith(
        '1.9.8',
        '.terraform-version',
        '/workspace',
      );
      expect(mockInstaller.install).toHaveBeenCalledWith('1.9.8', agent);
      expect(agent.addPath).toHaveBeenCalledWith('/cache/terraform/1.9.8');
      expect(agent.startGroup).toHaveBeenCalledWith('Terraform version setup');
      expect(agent.endGroup).toHaveBeenCalled();
    });

    test('skip mode does not install terraform', async () => {
      const agent = createMockAgent({ 'terraform-version': 'skip' });
      mockResolver.resolve.mockResolvedValue(undefined);

      await runner.run(agent, 'execute');

      expect(mockResolver.resolve).toHaveBeenCalled();
      expect(mockInstaller.install).not.toHaveBeenCalled();
      expect(agent.addPath).not.toHaveBeenCalled();
      expect(agent.info).toHaveBeenCalledWith(
        'Terraform version: skip (using existing PATH binary)',
      );
    });

    test('latest mode resolves and installs latest version', async () => {
      const agent = createMockAgent({ 'terraform-version': 'latest' });
      const spec: VersionSpec = { input: 'latest', resolved: '1.10.0', source: 'latest' };
      mockResolver.resolve.mockResolvedValue(spec);
      mockInstaller.install.mockResolvedValue('/cache/terraform/1.10.0');

      await runner.run(agent, 'execute');

      expect(mockResolver.resolve).toHaveBeenCalledWith(
        'latest',
        '.terraform-version',
        '/workspace',
      );
      expect(mockInstaller.install).toHaveBeenCalledWith('1.10.0', agent);
      expect(agent.addPath).toHaveBeenCalledWith('/cache/terraform/1.10.0');
    });

    test('empty version input resolves via version file', async () => {
      const agent = createMockAgent({ 'terraform-version': '' });
      const spec: VersionSpec = { input: '1.8.5', resolved: '1.8.5', source: 'file' };
      mockResolver.resolve.mockResolvedValue(spec);
      mockInstaller.install.mockResolvedValue('/cache/terraform/1.8.5');

      await runner.run(agent, 'execute');

      expect(mockResolver.resolve).toHaveBeenCalledWith('', '.terraform-version', '/workspace');
      expect(mockInstaller.install).toHaveBeenCalledWith('1.8.5', agent);
      expect(agent.info).toHaveBeenCalledWith('Terraform version: 1.8.5 (source: file)');
    });

    test('version resolution error propagates as runner failure', async () => {
      const agent = createMockAgent({ 'terraform-version': 'invalid' });
      mockResolver.resolve.mockRejectedValue(
        new Error("Invalid terraform version spec: 'invalid'"),
      );

      const result = await runner.run(agent, 'execute');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid terraform version spec');
    });

    test('endGroup is always called even if version resolution fails', async () => {
      const agent = createMockAgent();
      mockResolver.resolve.mockRejectedValue(new Error('Network error'));

      await runner.run(agent, 'execute');

      expect(agent.startGroup).toHaveBeenCalledWith('Terraform version setup');
      expect(agent.endGroup).toHaveBeenCalled();
    });
  });

  describe('command execution', () => {
    test('version setup runs before command build', async () => {
      const agent = createMockAgent();
      const spec: VersionSpec = { input: '1.9.8', resolved: '1.9.8', source: 'input' };
      const callOrder: string[] = [];

      mockResolver.resolve.mockImplementation(async () => {
        callOrder.push('resolve');
        return spec;
      });
      mockInstaller.install.mockImplementation(async () => {
        callOrder.push('install');
        return '/cache/terraform/1.9.8';
      });

      await runner.run(agent, 'execute');

      expect(callOrder).toEqual(['resolve', 'install']);
      expect(agent.info).toHaveBeenCalledWith(expect.stringContaining('Command:'));
    });
  });

  describe('runner metadata', () => {
    test('name is terraform', () => {
      expect(runner.name).toBe('terraform');
    });

    test('unknown step returns failure', async () => {
      const agent = createMockAgent();
      const result = await runner.run(agent, 'nonexistent');
      expect(result.success).toBe(false);
    });

    test('createTerraformRunner returns a TerraformRunner instance', () => {
      expect(createTerraformRunner()).toBeInstanceOf(TerraformRunner);
    });
  });
});
