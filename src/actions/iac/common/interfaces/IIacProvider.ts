import { TerraformCommand } from '../../terraform/interfaces/ITerraformProvider';

/**
 * Read-only provider interface for shared IaC configuration
 * Captures the common contract between Terraform and Terragrunt providers
 */
export interface IIacProvider {
  /** The IaC command to execute */
  readonly command: string;

  /** The executor binary */
  readonly executor: string;

  /** Working directory for operations */
  readonly workingDirectory: string;

  /** Environment variables for the process */
  readonly environment: ReadonlyMap<string, string>;

  /** Terraform variables (-var) */
  readonly variables: ReadonlyMap<string, string>;

  /** Terraform variable files (-var-file) */
  readonly varFiles: readonly string[];

  /** Backend configuration options (-backend-config) */
  readonly backendConfig: ReadonlyMap<string, string>;

  /** Target resources for targeted operations (-target) */
  readonly targets: readonly string[];

  /** Whether auto-approve is enabled (-auto-approve) */
  readonly autoApprove: boolean;

  /** Whether to run in dry-run mode (no actual execution) */
  readonly dryRun: boolean;

  /** Plan file path for apply operations */
  readonly planFile: string | undefined;

  /** Output file path for plan operations (-out) */
  readonly outFile: string | undefined;

  /** Whether to disable color output (-no-color) */
  readonly noColor: boolean;

  /** Whether to use compact warnings (-compact-warnings) */
  readonly compactWarnings: boolean;

  /** Parallelism level (-parallelism) */
  readonly parallelism: number | undefined;

  /** Lock timeout (-lock-timeout) */
  readonly lockTimeout: string | undefined;

  /** Whether to refresh state (-refresh) */
  readonly refresh: boolean;

  /** Whether to reconfigure backend (-reconfigure) */
  readonly reconfigure: boolean;

  /** Whether to migrate state (-migrate-state) */
  readonly migrateState: boolean;
}

/**
 * Commands that support -auto-approve flag
 */
export const AUTO_APPROVE_COMMANDS: readonly TerraformCommand[] = ['apply', 'destroy'] as const;

/**
 * Commands that support -target flag
 */
export const TARGET_COMMANDS: readonly TerraformCommand[] = [
  'plan',
  'apply',
  'destroy',
  'refresh',
  'taint',
  'untaint',
] as const;

/**
 * Commands that support -var and -var-file flags
 */
export const VARIABLE_COMMANDS: readonly TerraformCommand[] = [
  'plan',
  'apply',
  'destroy',
  'refresh',
  'import',
] as const;
