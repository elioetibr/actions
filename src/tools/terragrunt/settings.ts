import type { IAgent } from '../../agents/interfaces';
import type { TerragruntCommand } from '../../actions/iac/terragrunt/interfaces';
import { TERRAGRUNT_COMMANDS } from '../../actions/iac/terragrunt/interfaces';
import { parseCommaSeparated, parseJsonObject } from '../../libs/utils';

/**
 * Validates that a raw string is a valid TerragruntCommand
 */
function validateTerragruntCommand(input: string): TerragruntCommand {
  if (!TERRAGRUNT_COMMANDS.includes(input as TerragruntCommand)) {
    throw new Error(
      `Invalid terragrunt command: "${input}". Valid commands: ${TERRAGRUNT_COMMANDS.join(', ')}`,
    );
  }
  return input as TerragruntCommand;
}

/**
 * Input settings for Terragrunt operations
 */
export interface ITerragruntSettings {
  command: TerragruntCommand;
  workingDirectory: string;
  terraformVersion: string;
  terraformVersionFile: string;
  terragruntVersion: string;
  terragruntVersionFile: string;
  runAll: boolean;
  variables: Record<string, string>;
  varFiles: string[];
  backendConfig: Record<string, string>;
  targets: string[];
  autoApprove: boolean;
  planFile: string;
  noColor: boolean;
  compactWarnings: boolean;
  parallelism: string;
  lockTimeout: string;
  refresh: string;
  reconfigure: boolean;
  migrateState: boolean;
  terragruntConfig: string;
  terragruntWorkingDir: string;
  nonInteractive: boolean;
  noAutoInit: boolean;
  noAutoRetry: boolean;
  terragruntParallelism: string;
  includeDirs: string[];
  excludeDirs: string[];
  ignoreDependencyErrors: boolean;
  ignoreExternalDependencies: boolean;
  includeExternalDependencies: boolean;
  terragruntSource: string;
  sourceMap: Record<string, string>;
  downloadDir: string;
  iamRole: string;
  iamRoleSessionName: string;
  strictInclude: boolean;
  dryRun: boolean;
}

/**
 * Get Terragrunt settings from agent inputs
 */
export function getSettings(agent: IAgent): ITerragruntSettings {
  return {
    command: validateTerragruntCommand(agent.getInput('command', true)),
    workingDirectory: agent.getInput('working-directory') || '.',
    terraformVersion: agent.getInput('terraform-version'),
    terraformVersionFile: agent.getInput('terraform-version-file') || '.terraform-version',
    terragruntVersion: agent.getInput('terragrunt-version'),
    terragruntVersionFile: agent.getInput('terragrunt-version-file') || '.terragrunt-version',
    runAll: agent.getBooleanInput('run-all'),
    variables: parseJsonObject(agent.getInput('variables')),
    varFiles: parseCommaSeparated(agent.getInput('var-files')),
    backendConfig: parseJsonObject(agent.getInput('backend-config')),
    targets: parseCommaSeparated(agent.getInput('targets')),
    autoApprove: agent.getBooleanInput('auto-approve'),
    planFile: agent.getInput('plan-file'),
    noColor: agent.getBooleanInput('no-color'),
    compactWarnings: agent.getBooleanInput('compact-warnings'),
    parallelism: agent.getInput('parallelism'),
    lockTimeout: agent.getInput('lock-timeout'),
    refresh: agent.getInput('refresh'),
    reconfigure: agent.getBooleanInput('reconfigure'),
    migrateState: agent.getBooleanInput('migrate-state'),
    terragruntConfig: agent.getInput('terragrunt-config'),
    terragruntWorkingDir: agent.getInput('terragrunt-working-dir'),
    nonInteractive: agent.getBooleanInput('non-interactive'),
    noAutoInit: agent.getBooleanInput('no-auto-init'),
    noAutoRetry: agent.getBooleanInput('no-auto-retry'),
    terragruntParallelism: agent.getInput('terragrunt-parallelism'),
    includeDirs: parseCommaSeparated(agent.getInput('include-dirs')),
    excludeDirs: parseCommaSeparated(agent.getInput('exclude-dirs')),
    ignoreDependencyErrors: agent.getBooleanInput('ignore-dependency-errors'),
    ignoreExternalDependencies: agent.getBooleanInput('ignore-external-dependencies'),
    includeExternalDependencies: agent.getBooleanInput('include-external-dependencies'),
    terragruntSource: agent.getInput('terragrunt-source'),
    sourceMap: parseJsonObject(agent.getInput('source-map')),
    downloadDir: agent.getInput('download-dir'),
    iamRole: agent.getInput('iam-role'),
    iamRoleSessionName: agent.getInput('iam-role-session-name'),
    strictInclude: agent.getBooleanInput('strict-include'),
    dryRun: agent.getBooleanInput('dry-run'),
  };
}
