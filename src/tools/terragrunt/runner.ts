import type { IAgent, IRunnerResult } from '../../agents';
import {
  RunnerBase,
  setupToolVersion,
  configureSharedIacBuilder,
  executeIacCommand,
} from '../common';
import { TerragruntBuilder } from '../../actions/iac/terragrunt';
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
    ['execute', this.runExecute.bind(this)],
  ]);

  /**
   * Execute step: Build and run the Terragrunt command.
   * All command execution goes through IAgent (not child_process).
   */
  private async runExecute(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      const modeLabel = settings.runAll ? 'run-all ' : '';
      agent.info(`Starting Terragrunt ${modeLabel}${settings.command} action...`);

      // Resolve and install Terraform + Terragrunt versions
      await setupToolVersion(
        agent,
        'Terraform',
        settings.terraformVersion,
        settings.terraformVersionFile,
        settings.workingDirectory,
        tfResolver,
        tfInstaller,
      );
      const tgMajor = await this.setupTerragruntVersion(agent, settings);

      // Build the service (with detected major version for v0/v1 flag selection)
      const service = this.buildService(settings, tgMajor);

      // Run command through IAgent interface
      return await executeIacCommand(
        agent,
        `Terragrunt ${modeLabel}${settings.command}`,
        service,
        settings,
        this.success.bind(this),
        this.failure.bind(this),
      );
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
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
    const builder = TerragruntBuilder.create(settings.command);
    builder.withWorkingDirectory(settings.workingDirectory);
    builder.withTerragruntMajorVersion(terragruntMajorVersion);

    // Apply shared IaC settings
    configureSharedIacBuilder(builder, settings);

    // Terragrunt-specific configuration
    if (settings.runAll) {
      builder.withRunAll();
    }
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
      const value = parseInt(settings.terragruntParallelism, 10);
      if (!isNaN(value)) {
        builder.withTerragruntParallelism(value);
      }
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

    return builder.build();
  }
}

/**
 * Factory function to create a Terragrunt runner
 */
export function createTerragruntRunner(): TerragruntRunner {
  return new TerragruntRunner();
}
