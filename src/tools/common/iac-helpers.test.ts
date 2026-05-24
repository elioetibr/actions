import type { IAgent } from '../../agents/interfaces';
import type { IVersionResolver, IVersionInstaller, VersionSpec } from '../../libs/version-manager';
import {
  setupToolVersion,
  configureSharedIacBuilder,
  executeIacCommand,
  ISharedIacSettings,
} from './iac-helpers';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createAgent(
  execResult: { exitCode: number; stdout?: string; stderr?: string } = { exitCode: 0 },
): jest.Mocked<IAgent> {
  return {
    getInput: jest.fn().mockReturnValue(''),
    getBooleanInput: jest.fn().mockReturnValue(false),
    getMultilineInput: jest.fn().mockReturnValue([]),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    addPath: jest.fn(),
    exportVariable: jest.fn(),
    // IAgent.exec — safe via @actions/exec (execFile, not shell)
    exec: jest.fn().mockResolvedValue({
      exitCode: execResult.exitCode,
      stdout: execResult.stdout ?? '',
      stderr: execResult.stderr ?? '',
    }),
    writeSummary: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IAgent>;
}

function baseSettings(overrides: Partial<ISharedIacSettings> = {}): ISharedIacSettings {
  return {
    command: 'plan',
    workingDirectory: '.',
    variables: {},
    varFiles: [],
    backendConfig: {},
    targets: [],
    autoApprove: false,
    planFile: '',
    noColor: false,
    compactWarnings: false,
    parallelism: '',
    lockTimeout: '',
    refresh: '',
    reconfigure: false,
    migrateState: false,
    dryRun: false,
    ...overrides,
  };
}

function createBuilderMock(): Record<string, jest.Mock> {
  const builder = {
    withVariables: jest.fn(),
    withVarFiles: jest.fn(),
    withBackendConfigs: jest.fn(),
    withTargets: jest.fn(),
    withAutoApprove: jest.fn(),
    withPlanFile: jest.fn(),
    withOutFile: jest.fn(),
    withNoColor: jest.fn(),
    withCompactWarnings: jest.fn(),
    withParallelism: jest.fn(),
    withLockTimeout: jest.fn(),
    withoutRefresh: jest.fn(),
    withReconfigure: jest.fn(),
    withMigrateState: jest.fn(),
    withDryRun: jest.fn(),
  };
  // Each "with" method returns this for chaining
  for (const key of Object.keys(builder)) {
    builder[key as keyof typeof builder].mockReturnValue(builder);
  }
  return builder as unknown as Record<string, jest.Mock>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('setupToolVersion', () => {
  it('installs the resolved version and registers cache dir on PATH', async () => {
    const agent = createAgent();
    const spec: VersionSpec = { resolved: '1.7.0', source: 'version-file' };
    const resolver: jest.Mocked<IVersionResolver> = {
      resolve: jest.fn().mockResolvedValue(spec),
    } as unknown as jest.Mocked<IVersionResolver>;
    const installer: jest.Mocked<IVersionInstaller> = {
      install: jest.fn().mockResolvedValue('/cache/tool/1.7.0'),
    } as unknown as jest.Mocked<IVersionInstaller>;

    await setupToolVersion(agent, 'terraform', '1.7.0', '', '.', resolver, installer);

    expect(resolver.resolve).toHaveBeenCalledWith('1.7.0', '', '.');
    expect(installer.install).toHaveBeenCalledWith('1.7.0', agent);
    expect(agent.addPath).toHaveBeenCalledWith('/cache/tool/1.7.0');
    expect(agent.startGroup).toHaveBeenCalledWith('terraform version setup');
    expect(agent.endGroup).toHaveBeenCalled();
  });

  it('skips install when resolver returns undefined (use PATH binary)', async () => {
    const agent = createAgent();
    const resolver: jest.Mocked<IVersionResolver> = {
      resolve: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IVersionResolver>;
    const installer: jest.Mocked<IVersionInstaller> = {
      install: jest.fn(),
    } as unknown as jest.Mocked<IVersionInstaller>;

    await setupToolVersion(agent, 'terragrunt', '', '', '.', resolver, installer);

    expect(installer.install).not.toHaveBeenCalled();
    expect(agent.info).toHaveBeenCalledWith(
      'terragrunt version: skip (using existing PATH binary)',
    );
    expect(agent.endGroup).toHaveBeenCalled();
  });

  it('still calls endGroup if installer throws', async () => {
    const agent = createAgent();
    const spec: VersionSpec = { resolved: '1.0.0', source: 'input' };
    const resolver: jest.Mocked<IVersionResolver> = {
      resolve: jest.fn().mockResolvedValue(spec),
    } as unknown as jest.Mocked<IVersionResolver>;
    const installer: jest.Mocked<IVersionInstaller> = {
      install: jest.fn().mockRejectedValue(new Error('install failed')),
    } as unknown as jest.Mocked<IVersionInstaller>;

    await expect(
      setupToolVersion(agent, 'tf', '1.0.0', '', '.', resolver, installer),
    ).rejects.toThrow('install failed');
    expect(agent.endGroup).toHaveBeenCalled();
  });
});

describe('configureSharedIacBuilder', () => {
  it('applies all configured settings to the builder', () => {
    const builder = createBuilderMock();
    const settings = baseSettings({
      command: 'apply',
      variables: { env: 'prod' },
      varFiles: ['prod.tfvars'],
      backendConfig: { bucket: 'b' },
      targets: ['module.x'],
      autoApprove: true,
      planFile: 'tfplan',
      noColor: true,
      compactWarnings: true,
      parallelism: '8',
      lockTimeout: '30s',
      refresh: 'false',
      reconfigure: true,
      migrateState: true,
      dryRun: true,
    });

    const result = configureSharedIacBuilder(builder as never, settings);

    expect(result).toBe(builder);
    expect(builder.withVariables).toHaveBeenCalledWith({ env: 'prod' });
    expect(builder.withVarFiles).toHaveBeenCalledWith(['prod.tfvars']);
    expect(builder.withBackendConfigs).toHaveBeenCalledWith({ bucket: 'b' });
    expect(builder.withTargets).toHaveBeenCalledWith(['module.x']);
    expect(builder.withAutoApprove).toHaveBeenCalled();
    expect(builder.withPlanFile).toHaveBeenCalledWith('tfplan');
    expect(builder.withNoColor).toHaveBeenCalled();
    expect(builder.withCompactWarnings).toHaveBeenCalled();
    expect(builder.withParallelism).toHaveBeenCalledWith(8);
    expect(builder.withLockTimeout).toHaveBeenCalledWith('30s');
    expect(builder.withoutRefresh).toHaveBeenCalled();
    expect(builder.withReconfigure).toHaveBeenCalled();
    expect(builder.withMigrateState).toHaveBeenCalled();
    expect(builder.withDryRun).toHaveBeenCalled();
  });

  it('skips disabled settings (empty arrays / objects / falsy flags)', () => {
    const builder = createBuilderMock();
    configureSharedIacBuilder(builder as never, baseSettings());

    expect(builder.withVariables).not.toHaveBeenCalled();
    expect(builder.withVarFiles).not.toHaveBeenCalled();
    expect(builder.withBackendConfigs).not.toHaveBeenCalled();
    expect(builder.withTargets).not.toHaveBeenCalled();
    expect(builder.withAutoApprove).not.toHaveBeenCalled();
    expect(builder.withPlanFile).not.toHaveBeenCalled();
    expect(builder.withOutFile).not.toHaveBeenCalled();
    expect(builder.withNoColor).not.toHaveBeenCalled();
    expect(builder.withCompactWarnings).not.toHaveBeenCalled();
    expect(builder.withParallelism).not.toHaveBeenCalled();
    expect(builder.withLockTimeout).not.toHaveBeenCalled();
    expect(builder.withoutRefresh).not.toHaveBeenCalled();
    expect(builder.withReconfigure).not.toHaveBeenCalled();
    expect(builder.withMigrateState).not.toHaveBeenCalled();
    expect(builder.withDryRun).not.toHaveBeenCalled();
  });

  it('uses withOutFile for the plan command and withPlanFile for apply', () => {
    const planBuilder = createBuilderMock();
    configureSharedIacBuilder(
      planBuilder as never,
      baseSettings({ command: 'plan', planFile: 'tfplan' }),
    );
    expect(planBuilder.withOutFile).toHaveBeenCalledWith('tfplan');
    expect(planBuilder.withPlanFile).not.toHaveBeenCalled();

    const applyBuilder = createBuilderMock();
    configureSharedIacBuilder(
      applyBuilder as never,
      baseSettings({ command: 'apply', planFile: 'tfplan' }),
    );
    expect(applyBuilder.withPlanFile).toHaveBeenCalledWith('tfplan');
    expect(applyBuilder.withOutFile).not.toHaveBeenCalled();
  });

  it('does not call withPlanFile/withOutFile for non plan/apply commands', () => {
    const builder = createBuilderMock();
    configureSharedIacBuilder(
      builder as never,
      baseSettings({ command: 'destroy', planFile: 'tfplan' }),
    );
    expect(builder.withPlanFile).not.toHaveBeenCalled();
    expect(builder.withOutFile).not.toHaveBeenCalled();
  });

  it('ignores parallelism when value is not numeric', () => {
    const builder = createBuilderMock();
    configureSharedIacBuilder(builder as never, baseSettings({ parallelism: 'abc' }));
    expect(builder.withParallelism).not.toHaveBeenCalled();
  });

  it('does not call withoutRefresh when refresh is not exactly "false"', () => {
    const builder = createBuilderMock();
    configureSharedIacBuilder(builder as never, baseSettings({ refresh: 'true' }));
    expect(builder.withoutRefresh).not.toHaveBeenCalled();
  });
});

describe('executeIacCommand', () => {
  const service = {
    buildCommand: (): string[] => ['terraform', 'plan'],
    toString: (): string => 'terraform plan',
  };
  const successFn = jest.fn().mockReturnValue({ success: true, outputs: {} });
  const failureFn = jest
    .fn()
    .mockReturnValue({ success: false, error: new Error('fail'), outputs: {} });

  beforeEach(() => {
    successFn.mockClear();
    failureFn.mockClear();
  });

  it('skips execution and returns success in dry-run mode', async () => {
    const agent = createAgent();
    await executeIacCommand(
      agent,
      'Terraform',
      service,
      { command: 'plan', workingDirectory: '.', dryRun: true },
      successFn,
      failureFn,
    );

    expect(agent.exec).not.toHaveBeenCalled();
    expect(agent.info).toHaveBeenCalledWith('Dry run mode - skipping execution');
    expect(successFn).toHaveBeenCalledWith(expect.objectContaining({ 'exit-code': '0' }));
  });

  it('returns failure when the service produces an empty command', async () => {
    const agent = createAgent();
    const emptyService = { buildCommand: () => [], toString: () => '' };
    await executeIacCommand(
      agent,
      'Terraform',
      emptyService,
      { command: 'plan', workingDirectory: '.', dryRun: false },
      successFn,
      failureFn,
    );

    expect(failureFn).toHaveBeenCalledWith(expect.any(Error));
    expect((failureFn.mock.calls[0]![0] as Error).message).toBe(
      'Terraform produced an empty command',
    );
  });

  it('executes the command and returns success on exit 0', async () => {
    const agent = createAgent({ exitCode: 0, stdout: 'ok' });
    await executeIacCommand(
      agent,
      'Terraform',
      service,
      { command: 'plan', workingDirectory: '.', dryRun: false },
      successFn,
      failureFn,
    );

    expect(agent.exec).toHaveBeenCalledWith('terraform', ['plan'], {
      cwd: '.',
      ignoreReturnCode: true,
    });
    expect(successFn).toHaveBeenCalledWith(
      expect.objectContaining({ 'exit-code': '0', stdout: 'ok' }),
    );
  });

  it('returns failure with outputs when the command exits non-zero', async () => {
    const agent = createAgent({ exitCode: 1, stderr: 'boom' });
    await executeIacCommand(
      agent,
      'Terraform',
      service,
      { command: 'plan', workingDirectory: '.', dryRun: false },
      successFn,
      failureFn,
    );

    expect(failureFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Terraform failed with exit code 1' }),
      expect.objectContaining({ 'exit-code': '1', stderr: 'boom' }),
    );
  });
});
