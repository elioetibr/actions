import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from '../common/runner-base';
import { TerragruntBuilder } from '../../actions/iac/terragrunt/TerragruntBuilder';
import { getSettings, type ITerragruntSettings } from './settings';
import {
  TerraformVersionResolver,
  TerraformVersionInstaller,
  TerragruntVersionResolver,
  TerragruntVersionInstaller,
  VersionFileReader,
  detectTerragruntVersion,
  isV1OrLater,
} from '../../libs/version-manager';

// Module-level singletons — reused across invocations within the same action run
const fileReader = new VersionFileReader();
const tfResolver = new TerraformVersionResolver(fileReader);
const tfInstaller = new TerraformVersionInstaller();
const tgResolver = new TerragruntVersionResolver(fileReader);
const tgInstaller = new TerragruntVersionInstaller();

/**
 * Terragrunt runner
 * Handles command generation and execution for Terragrunt operations
 */
export class TerragruntRunner extends RunnerBase {
  readonly name = 'terragrunt';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['execute', this.execute.bind(this)],
  ]);

  /**
   * Execute step: Build and run the Terragrunt command
   * Uses the IAgent.exec() interface for safe command execution (not child_process)
   */
  private async execute(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      const modeLabel = settings.runAll ? 'run-all ' : '';
      agent.info(`Starting Terragrunt ${modeLabel}${settings.command} action...`);

      // Resolve and install Terraform + Terragrunt versions
      await this.setupTerraformVersion(agent, settings);
      const tgMajor = await this.setupTerragruntVersion(agent, settings);

      // Build the service (with detected major version for v0/v1 flag selection)
      const service = this.buildService(settings, tgMajor);

      // Get command details
      const commandArgs = service.buildCommand();
      const commandString = service.toString();

      agent.info(`Command: ${commandString}`);

      const baseOutputs: Record<string, string | number | boolean> = {
        command: settings.command,
        'command-args': JSON.stringify(commandArgs),
        'command-string': commandString,
      };

      // Execute if not dry run
      if (settings.dryRun) {
        agent.info('Dry run mode - skipping execution');
        return this.success({
          ...baseOutputs,
          'exit-code': '0',
          stdout: '',
          stderr: '',
        });
      }

      // Safe execution via IAgent interface (uses execFile internally, not shell)
      const result = await agent.exec(commandArgs[0]!, commandArgs.slice(1), {
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
        return this.failure(
          new Error(
            `Terragrunt ${modeLabel}${settings.command} failed with exit code ${result.exitCode}`,
          ),
          outputs,
        );
      }

      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Resolve and optionally install the requested Terraform version.
   * Terragrunt wraps Terraform, so both tools need version management.
   */
  private async setupTerraformVersion(agent: IAgent, settings: ITerragruntSettings): Promise<void> {
    agent.startGroup('Terraform version setup');
    try {
      const spec = await tfResolver.resolve(
        settings.terraformVersion,
        settings.terraformVersionFile,
        settings.workingDirectory,
      );

      if (!spec) {
        agent.info('Terraform version: skip (using existing PATH binary)');
        return;
      }

      agent.info(`Terraform version: ${spec.resolved} (source: ${spec.source})`);

      const cacheDir = await tfInstaller.install(spec.resolved, agent);
      agent.addPath(cacheDir);
    } finally {
      agent.endGroup();
    }
  }

  /**
   * Resolve and optionally install the requested Terragrunt version.
   * After installation, detects the major version for v0/v1 flag selection.
   * @returns The detected major version number (0 for v0.x, 1 for v1.x+)
   */
  private async setupTerragruntVersion(
    agent: IAgent,
    settings: ITerragruntSettings,
  ): Promise<number> {
    agent.startGroup('Terragrunt version setup');
    try {
      const spec = await tgResolver.resolve(
        settings.terragruntVersion,
        settings.terragruntVersionFile,
        settings.workingDirectory,
      );

      if (spec) {
        agent.info(`Terragrunt version: ${spec.resolved} (source: ${spec.source})`);

        const cacheDir = await tgInstaller.install(spec.resolved, agent);
        agent.addPath(cacheDir);
      } else {
        agent.info('Terragrunt version: skip (using existing PATH binary)');
      }

      // Detect installed version for v0/v1 flag selection
      const detected = await detectTerragruntVersion(agent);
      const majorLabel = isV1OrLater(detected) ? 'v1.x+ (new CLI)' : 'v0.x (classic CLI)';
      agent.info(`Detected Terragrunt ${detected.raw} — ${majorLabel}`);

      return detected.major;
    } finally {
      agent.endGroup();
    }
  }

  /**
   * Build the Terragrunt service from settings
   */
  private buildService(settings: ITerragruntSettings, terragruntMajorVersion: number) {
    const builder = TerragruntBuilder.create(settings.command)
      .withWorkingDirectory(settings.workingDirectory)
      .withTerragruntMajorVersion(terragruntMajorVersion);

    if (settings.runAll) {
      builder.withRunAll();
    }
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
      builder.withParallelism(parseInt(settings.parallelism, 10));
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

    // Terragrunt-specific configuration
    if (settings.terragruntConfig) {
      builder.withTerragruntConfig(settings.terragruntConfig);
    }
    if (settings.terragruntWorkingDir) {
      builder.withTerragruntWorkingDir(settings.terragruntWorkingDir);
    }
    if (settings.nonInteractive) {
      builder.withNonInteractive();
    }
    if (settings.noAutoInit) {
      builder.withNoAutoInit();
    }
    if (settings.noAutoRetry) {
      builder.withNoAutoRetry();
    }
    if (settings.terragruntParallelism) {
      builder.withTerragruntParallelism(parseInt(settings.terragruntParallelism, 10));
    }
    if (settings.includeDirs.length > 0) {
      builder.withIncludeDirs(settings.includeDirs);
    }
    if (settings.excludeDirs.length > 0) {
      builder.withExcludeDirs(settings.excludeDirs);
    }
    if (settings.ignoreDependencyErrors) {
      builder.withIgnoreDependencyErrors();
    }
    if (settings.ignoreExternalDependencies) {
      builder.withIgnoreExternalDependencies();
    }
    if (settings.includeExternalDependencies) {
      builder.withIncludeExternalDependencies();
    }
    if (settings.terragruntSource) {
      builder.withTerragruntSource(settings.terragruntSource);
    }
    if (Object.keys(settings.sourceMap).length > 0) {
      builder.withSourceMaps(settings.sourceMap);
    }
    if (settings.downloadDir) {
      builder.withDownloadDir(settings.downloadDir);
    }
    if (settings.iamRole) {
      if (settings.iamRoleSessionName) {
        builder.withIamRoleAndSession(settings.iamRole, settings.iamRoleSessionName);
      } else {
        builder.withIamRole(settings.iamRole);
      }
    }
    if (settings.strictInclude) {
      builder.withStrictInclude();
    }
    if (settings.dryRun) {
      builder.withDryRun();
    }

    return builder.build();
  }
}

/**
 * Factory function to create a Terragrunt runner
 */
export function createTerragruntRunner(): TerragruntRunner {
  return new TerragruntRunner();
}
