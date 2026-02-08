import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from '../common/runner-base';
import { TerraformBuilder } from '../../actions/iac/terraform/TerraformBuilder';
import { getSettings, type ITerraformSettings } from './settings';

/**
 * Terraform runner
 * Handles command generation and execution for Terraform operations
 */
export class TerraformRunner extends RunnerBase {
  readonly name = 'terraform';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['execute', this.execute.bind(this)],
  ]);

  /**
   * Execute step: Build and run the Terraform command
   * Uses the IAgent.exec() interface for safe command execution (not child_process)
   */
  private async execute(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      agent.info(`Starting Terraform ${settings.command} action...`);

      // Build the service
      const service = this.buildService(settings);

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
          new Error(`Terraform ${settings.command} failed with exit code ${result.exitCode}`),
          outputs,
        );
      }

      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Build the Terraform service from settings
   */
  private buildService(settings: ITerraformSettings) {
    const builder = TerraformBuilder.create(settings.command).withWorkingDirectory(
      settings.workingDirectory,
    );

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
    if (settings.dryRun) {
      builder.withDryRun();
    }

    return builder.build();
  }
}

/**
 * Factory function to create a Terraform runner
 */
export function createTerraformRunner(): TerraformRunner {
  return new TerraformRunner();
}
