import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { TerragruntBuilder } from './TerragruntBuilder';
import { TerragruntCommand } from './interfaces';
import { handleError, parseCommaSeparated, parseJsonObject } from '../../../libs/utils';

/**
 * Main action runner for Terragrunt
 */
export async function run(): Promise<void> {
  try {
    // Get inputs - core terraform/terragrunt options
    const command = core.getInput('command', { required: true }) as TerragruntCommand;
    const workingDirectory = core.getInput('working-directory') || '.';
    const runAll = core.getBooleanInput('run-all');
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

    // Terragrunt-specific inputs
    const terragruntConfig = core.getInput('terragrunt-config');
    const terragruntWorkingDir = core.getInput('terragrunt-working-dir');
    const nonInteractive = core.getBooleanInput('non-interactive');
    const noAutoInit = core.getBooleanInput('no-auto-init');
    const noAutoRetry = core.getBooleanInput('no-auto-retry');
    const terragruntParallelism = core.getInput('terragrunt-parallelism');
    const includeDirs = parseCommaSeparated(core.getInput('include-dirs'));
    const excludeDirs = parseCommaSeparated(core.getInput('exclude-dirs'));
    const ignoreDependencyErrors = core.getBooleanInput('ignore-dependency-errors');
    const ignoreExternalDependencies = core.getBooleanInput('ignore-external-dependencies');
    const includeExternalDependencies = core.getBooleanInput('include-external-dependencies');
    const terragruntSource = core.getInput('terragrunt-source');
    const sourceMap = parseJsonObject(core.getInput('source-map'));
    const downloadDir = core.getInput('download-dir');
    const iamRole = core.getInput('iam-role');
    const iamRoleSessionName = core.getInput('iam-role-session-name');
    const strictInclude = core.getBooleanInput('strict-include');
    const dryRun = core.getBooleanInput('dry-run');

    const modeLabel = runAll ? 'run-all ' : '';
    core.info(`Starting Terragrunt ${modeLabel}${command} action...`);

    // Build the Terragrunt service
    const builder = TerragruntBuilder.create(command).withWorkingDirectory(workingDirectory);

    // Run-all mode
    if (runAll) {
      builder.withRunAll();
    }

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

    // Add terraform flags
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

    // Terragrunt-specific configuration
    if (terragruntConfig) {
      builder.withTerragruntConfig(terragruntConfig);
    }

    if (terragruntWorkingDir) {
      builder.withTerragruntWorkingDir(terragruntWorkingDir);
    }

    if (nonInteractive) {
      builder.withNonInteractive();
    }

    if (noAutoInit) {
      builder.withNoAutoInit();
    }

    if (noAutoRetry) {
      builder.withNoAutoRetry();
    }

    if (terragruntParallelism) {
      const value = parseInt(terragruntParallelism, 10);
      if (!isNaN(value)) {
        builder.withTerragruntParallelism(value);
      }
    }

    if (includeDirs.length > 0) {
      builder.withIncludeDirs(includeDirs);
    }

    if (excludeDirs.length > 0) {
      builder.withExcludeDirs(excludeDirs);
    }

    if (ignoreDependencyErrors) {
      builder.withIgnoreDependencyErrors();
    }

    if (ignoreExternalDependencies) {
      builder.withIgnoreExternalDependencies();
    }

    if (includeExternalDependencies) {
      builder.withIncludeExternalDependencies();
    }

    if (terragruntSource) {
      builder.withTerragruntSource(terragruntSource);
    }

    if (Object.keys(sourceMap).length > 0) {
      builder.withSourceMaps(sourceMap);
    }

    if (downloadDir) {
      builder.withDownloadDir(downloadDir);
    }

    if (iamRole) {
      if (iamRoleSessionName) {
        builder.withIamRoleAndSession(iamRole, iamRoleSessionName);
      } else {
        builder.withIamRole(iamRole);
      }
    }

    if (strictInclude) {
      builder.withStrictInclude();
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
        core.setFailed('Terragrunt produced an empty command');
        return;
      }

      // Safe: @actions/exec uses execFile internally
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
        core.setFailed(`Terragrunt ${modeLabel}${command} failed with exit code ${exitCode}`);
      }
    }
  } catch (error) {
    handleError(error);
  }
}
