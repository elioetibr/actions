import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import type { IVersionResolver, IVersionInstaller, VersionSpec } from '../../libs/version-manager';
import type { IIacBuilder } from '../../actions/iac/common/interfaces';
import type { IIacService } from '../../actions/iac/common/interfaces';

export interface ISharedIacSettings {
  /** IaC subcommand to execute (e.g. 'plan', 'apply', 'destroy', 'init') */
  readonly command: string;
  /** Directory containing the IaC configuration files */
  readonly workingDirectory: string;
  /** Key-value variable overrides passed via -var flags */
  readonly variables: Record<string, string>;
  /** Paths to .tfvars files passed via -var-file flags */
  readonly varFiles: string[];
  /** Key-value backend configuration overrides for init -backend-config */
  readonly backendConfig: Record<string, string>;
  /** Resource addresses to target via -target flags */
  readonly targets: string[];
  /** Auto-approve apply/destroy without prompting */
  readonly autoApprove: boolean;
  /** Path to a plan file (input for apply, output for plan -out) */
  readonly planFile: string;
  /** Disable color output */
  readonly noColor: boolean;
  /** Reduce warning verbosity */
  readonly compactWarnings: boolean;
  /** Max concurrent operations (-parallelism); empty string means default */
  readonly parallelism: string;
  /** Duration to wait for state lock (e.g. '30s') */
  readonly lockTimeout: string;
  /** 'false' disables resource refresh during plan/apply */
  readonly refresh: string;
  /** Reconfigure backend during init, ignoring saved config */
  readonly reconfigure: boolean;
  /** Migrate state to new backend during init */
  readonly migrateState: boolean;
  /** Log the command without executing it */
  readonly dryRun: boolean;
}

/**
 * Resolve and optionally install a tool version.
 * When the resolver returns undefined (i.e. 'skip'), the runner uses
 * whatever binary is already on PATH.
 */
export async function setupToolVersion(
  agent: IAgent,
  toolName: string,
  version: string,
  versionFile: string,
  workingDirectory: string,
  resolver: IVersionResolver,
  installer: IVersionInstaller,
): Promise<void> {
  agent.startGroup(`${toolName} version setup`);
  try {
    const spec: VersionSpec | undefined = await resolver.resolve(
      version,
      versionFile,
      workingDirectory,
    );

    if (!spec) {
      agent.info(`${toolName} version: skip (using existing PATH binary)`);
      return;
    }

    agent.info(`${toolName} version: ${spec.resolved} (source: ${spec.source})`);

    const cacheDir = await installer.install(spec.resolved, agent);
    agent.addPath(cacheDir);
  } finally {
    agent.endGroup();
  }
}

/**
 * Apply the 17 shared settings to an IaC builder.
 * Returns the builder for continued chaining.
 */
export function configureSharedIacBuilder<T extends IIacBuilder<IIacService>>(
  builder: T,
  settings: ISharedIacSettings,
): T {
  if (Object.keys(settings.variables).length > 0) {
    builder.withVariables(settings.variables);
  }
  if (settings.varFiles.length > 0) {
    builder.withVarFiles(settings.varFiles);
  }
  if (Object.keys(settings.backendConfig).length > 0) {
    builder.withBackendConfigs(settings.backendConfig);
  }
  if (settings.targets.length > 0) {
    builder.withTargets(settings.targets);
  }
  if (settings.autoApprove) {
    builder.withAutoApprove();
  }
  if (settings.planFile) {
    if (settings.command === 'apply') {
      builder.withPlanFile(settings.planFile);
    } else if (settings.command === 'plan') {
      builder.withOutFile(settings.planFile);
    }
  }
  if (settings.noColor) {
    builder.withNoColor();
  }
  if (settings.compactWarnings) {
    builder.withCompactWarnings();
  }
  if (settings.parallelism) {
    const value = parseInt(settings.parallelism, 10);
    if (!isNaN(value)) {
      builder.withParallelism(value);
    }
  }
  if (settings.lockTimeout) {
    builder.withLockTimeout(settings.lockTimeout);
  }
  if (settings.refresh === 'false') {
    builder.withoutRefresh();
  }
  if (settings.reconfigure) {
    builder.withReconfigure();
  }
  if (settings.migrateState) {
    builder.withMigrateState();
  }
  if (settings.dryRun) {
    builder.withDryRun();
  }

  return builder;
}

/**
 * Run an IaC command through the agent.
 * Shared flow: build command → log → dry-run check → agent.run → exit code.
 *
 * NOTE: This calls agent.exec() — the IAgent interface method that
 * delegates to @actions/exec (execFile under the hood), NOT child_process.
 */
export async function executeIacCommand(
  agent: IAgent,
  toolLabel: string,
  service: { buildCommand(): string[]; toString(): string },
  settings: { command: string; workingDirectory: string; dryRun: boolean },
  successFn: (outputs: Record<string, string | number | boolean>) => IRunnerResult,
  failureFn: (error: Error, outputs?: Record<string, string | number | boolean>) => IRunnerResult,
): Promise<IRunnerResult> {
  const commandArgs = service.buildCommand();
  const commandString = service.toString();

  agent.info(`Command: ${commandString}`);

  const baseOutputs: Record<string, string | number | boolean> = {
    command: settings.command,
    'command-args': JSON.stringify(commandArgs),
    'command-string': commandString,
  };

  if (settings.dryRun) {
    agent.info('Dry run mode - skipping execution');
    return successFn({
      ...baseOutputs,
      'exit-code': '0',
      stdout: '',
      stderr: '',
    });
  }

  const [cmd, ...cmdArgs] = commandArgs;
  if (!cmd) {
    return failureFn(new Error(`${toolLabel} produced an empty command`));
  }

  // Safe: IAgent wraps @actions/exec internally
  const result = await agent.exec(cmd, cmdArgs, {
    cwd: settings.workingDirectory,
    ignoreReturnCode: true,
  });

  const outputs = {
    ...baseOutputs,
    'exit-code': result.exitCode.toString(),
    stdout: result.stdout,
    stderr: result.stderr,
  };

  if (result.exitCode !== 0) {
    return failureFn(new Error(`${toolLabel} failed with exit code ${result.exitCode}`), outputs);
  }

  return successFn(outputs);
}
