import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { TerraformBuilder } from './TerraformBuilder';
import { TerraformCommand } from './interfaces';
import { catchErrorAndSetFailed, parseCommaSeparated, parseJsonObject } from '../../../libs/utils';

/**
 * Main action runner for Terraform
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const command = core.getInput('command', { required: true }) as TerraformCommand;
    const workingDirectory = core.getInput('working-directory') || '.';
    const variables = parseJsonObject(core.getInput('variables'));
    const varFiles = parseCommaSeparated(core.getInput('var-files'));
    const backendConfig = parseJsonObject(core.getInput('backend-config'));
    const targets = parseCommaSeparated(core.getInput('targets'));
    const autoApprove = core.getBooleanInput('auto-approve');
    const planFile = core.getInput('plan-file');
    const noColor = core.getBooleanInput('no-color');
    const compactWarnings = core.getBooleanInput('compact-warnings');
    const parallelism = core.getInput('parallelism');
    const lockTimeout = core.getInput('lock-timeout');
    const refresh = core.getInput('refresh');
    const reconfigure = core.getBooleanInput('reconfigure');
    const migrateState = core.getBooleanInput('migrate-state');
    const dryRun = core.getBooleanInput('dry-run');

    core.info(`Starting Terraform ${command} action...`);

    // Build the Terraform service
    const builder = TerraformBuilder.create(command).withWorkingDirectory(workingDirectory);

    // Add variables
    if (Object.keys(variables).length > 0) {
      builder.withVariables(variables);
    }

    // Add var files
    if (varFiles.length > 0) {
      builder.withVarFiles(varFiles);
    }

    // Add backend config
    if (Object.keys(backendConfig).length > 0) {
      builder.withBackendConfigs(backendConfig);
    }

    // Add targets
    if (targets.length > 0) {
      builder.withTargets(targets);
    }

    // Add flags
    if (autoApprove) {
      builder.withAutoApprove();
    }

    if (planFile) {
      if (command === 'apply') {
        builder.withPlanFile(planFile);
      } else if (command === 'plan') {
        builder.withOutFile(planFile);
      }
    }

    if (noColor) {
      builder.withNoColor();
    }

    if (compactWarnings) {
      builder.withCompactWarnings();
    }

    if (parallelism) {
      const value = parseInt(parallelism, 10);
      if (!isNaN(value)) {
        builder.withParallelism(value);
      }
    }

    if (lockTimeout) {
      builder.withLockTimeout(lockTimeout);
    }

    if (refresh === 'false') {
      builder.withoutRefresh();
    }

    if (reconfigure) {
      builder.withReconfigure();
    }

    if (migrateState) {
      builder.withMigrateState();
    }

    if (dryRun) {
      builder.withDryRun();
    }

    // Build the service
    const service = builder.build();

    // Get command details
    const commandArgs = service.buildCommand();
    const commandString = service.toString();

    core.info(`Command: ${commandString}`);
    core.setOutput('command', command);
    core.setOutput('command-args', JSON.stringify(commandArgs));
    core.setOutput('command-string', commandString);

    // Execute if not dry run
    if (dryRun) {
      core.info('Dry run mode - skipping execution');
      core.setOutput('exit-code', '0');
      core.setOutput('stdout', '');
      core.setOutput('stderr', '');
    } else {
      let stdout = '';
      let stderr = '';

      const [cmd, ...cmdArgs] = commandArgs;
      if (!cmd) {
        core.setFailed('Terraform produced an empty command');
        return;
      }

      // IAgent.exec — safe via @actions/exec (execFile, not shell)
      const exitCode = await exec(cmd, cmdArgs, {
        cwd: workingDirectory,
        listeners: {
          stdout: (data: Buffer) => {
            stdout += data.toString();
          },
          stderr: (data: Buffer) => {
            stderr += data.toString();
          },
        },
        ignoreReturnCode: true,
      });

      core.setOutput('exit-code', exitCode.toString());
      core.setOutput('stdout', stdout);
      core.setOutput('stderr', stderr);

      if (exitCode !== 0) {
        core.setFailed(`Terraform ${command} failed with exit code ${exitCode}`);
      }
    }
  } catch (error) {
    catchErrorAndSetFailed(error);
  }
}
