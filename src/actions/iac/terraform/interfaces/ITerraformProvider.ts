import { IIacProvider } from '../../common/interfaces';

/**
 * Read-only provider interface for Terraform configuration
 * Extends IIacProvider with Terraform-specific command type narrowing
 */
export interface ITerraformProvider extends IIacProvider {
  /** The terraform command to execute (plan, apply, destroy, validate, fmt) */
  readonly command: TerraformCommand;
}

/**
 * Supported Terraform commands
 */
export type TerraformCommand =
  | 'init'
  | 'validate'
  | 'fmt'
  | 'plan'
  | 'apply'
  | 'destroy'
  | 'output'
  | 'show'
  | 'state'
  | 'import'
  | 'refresh'
  | 'taint'
  | 'untaint'
  | 'workspace';

/**
 * Terraform command categories for validation
 */
export const TERRAFORM_COMMANDS: readonly TerraformCommand[] = [
  'init',
  'validate',
  'fmt',
  'plan',
  'apply',
  'destroy',
  'output',
  'show',
  'state',
  'import',
  'refresh',
  'taint',
  'untaint',
  'workspace',
] as const;
