import type { IAgent } from '../../agents/interfaces';
import type { TerraformCommand } from '../../actions/iac/terraform/interfaces';
import { parseCommaSeparated, parseJsonObject } from '../../libs/utils';

/**
 * Input settings for Terraform operations
 */
export interface ITerraformSettings {
  command: TerraformCommand;
  workingDirectory: string;
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
  dryRun: boolean;
}

/**
 * Get Terraform settings from agent inputs
 */
export function getSettings(agent: IAgent): ITerraformSettings {
  return {
    command: agent.getInput('command', true) as TerraformCommand,
    workingDirectory: agent.getInput('working-directory') || '.',
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
    dryRun: agent.getBooleanInput('dry-run'),
  };
}
