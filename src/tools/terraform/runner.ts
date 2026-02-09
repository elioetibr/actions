import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from '../common/runner-base';
import { TerraformBuilder } from '../../actions/iac/terraform/TerraformBuilder';
import { getSettings } from './settings';
import {
  TerraformVersionResolver,
  TerraformVersionInstaller,
  VersionFileReader,
} from '../../libs/version-manager';
import {
  setupToolVersion,
  configureSharedIacBuilder,
  executeIacCommand,
} from '../common/iac-helpers';

// Module-level singletons — reused across invocations within the same action run
const fileReader = new VersionFileReader();
const resolver = new TerraformVersionResolver(fileReader);
const installer = new TerraformVersionInstaller();

/**
 * Terraform runner
 * Handles command generation and execution for Terraform operations
 */
export class TerraformRunner extends RunnerBase {
  readonly name = 'terraform';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['execute', this.runExecute.bind(this)],
  ]);

  /**
   * Execute step: Build and run the Terraform command.
   * All command execution goes through IAgent (not child_process).
   */
  private async runExecute(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      agent.info(`Starting Terraform ${settings.command} action...`);

      // Resolve and install Terraform version
      await setupToolVersion(
        agent,
        'Terraform',
        settings.terraformVersion,
        settings.terraformVersionFile,
        settings.workingDirectory,
        resolver,
        installer,
      );

      // Build the service
      const builder = TerraformBuilder.create(settings.command).withWorkingDirectory(
        settings.workingDirectory,
      );
      configureSharedIacBuilder(builder, settings);
      const service = builder.build();

      // Run command through IAgent interface
      return await executeIacCommand(
        agent,
        `Terraform ${settings.command}`,
        service,
        settings,
        this.success.bind(this),
        this.failure.bind(this),
      );
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Factory function to create a Terraform runner
 */
export function createTerraformRunner(): TerraformRunner {
  return new TerraformRunner();
}
