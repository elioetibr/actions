import { IIacProvider } from '../../common/interfaces';
import { TerraformCommand } from '../../terraform/interfaces';

/**
 * Read-only provider interface for Terragrunt configuration
 * Extends IIacProvider with Terragrunt-specific properties
 */
export interface ITerragruntProvider extends IIacProvider {
  /** The terragrunt command to execute */
  readonly command: TerragruntCommand;

  /** The executor binary (terragrunt) */
  readonly executor: 'terragrunt';

  // Terragrunt-specific properties

  /** Terragrunt configuration file path (--terragrunt-config) */
  readonly terragruntConfig: string | undefined;

  /** Working directory for terragrunt (--terragrunt-working-dir) */
  readonly terragruntWorkingDir: string | undefined;

  /** Whether to run on all modules (run-all) */
  readonly runAll: boolean;

  /** Whether to disable auto-init (--terragrunt-no-auto-init) */
  readonly noAutoInit: boolean;

  /** Whether to disable auto-retry (--terragrunt-no-auto-retry) */
  readonly noAutoRetry: boolean;

  /** Whether to use non-interactive mode (--terragrunt-non-interactive) */
  readonly nonInteractive: boolean;

  /** Parallelism for run-all (--terragrunt-parallelism) */
  readonly terragruntParallelism: number | undefined;

  /** Include directories for run-all (--terragrunt-include-dir) */
  readonly includeDirs: readonly string[];

  /** Exclude directories for run-all (--terragrunt-exclude-dir) */
  readonly excludeDirs: readonly string[];

  /** Whether to ignore dependency errors (--terragrunt-ignore-dependency-errors) */
  readonly ignoreDependencyErrors: boolean;

  /** Whether to ignore external dependencies (--terragrunt-ignore-external-dependencies) */
  readonly ignoreExternalDependencies: boolean;

  /** Include external dependencies (--terragrunt-include-external-dependencies) */
  readonly includeExternalDependencies: boolean;

  /** Source for terraform (--terragrunt-source) */
  readonly terragruntSource: string | undefined;

  /** Source map for overriding module sources (--terragrunt-source-map) */
  readonly sourceMap: ReadonlyMap<string, string>;

  /** Download directory (--terragrunt-download-dir) */
  readonly downloadDir: string | undefined;

  /** IAM role to assume (--terragrunt-iam-role) */
  readonly iamRole: string | undefined;

  /** IAM role session name (--terragrunt-iam-role-session-name) */
  readonly iamRoleSessionName: string | undefined;

  /** Whether to use strict include mode (--terragrunt-strict-include) */
  readonly strictInclude: boolean;
}

/**
 * Terragrunt-specific commands (in addition to terraform commands)
 */
export type TerragruntCommand =
  | TerraformCommand
  | 'run-all'
  | 'graph-dependencies'
  | 'hclfmt'
  | 'aws-provider-patch'
  | 'render-json'
  | 'output-module-groups'
  | 'validate-inputs';

/**
 * All valid Terragrunt commands
 */
export const TERRAGRUNT_COMMANDS: readonly TerragruntCommand[] = [
  // Terraform commands
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
  // Terragrunt-specific commands
  'run-all',
  'graph-dependencies',
  'hclfmt',
  'aws-provider-patch',
  'render-json',
  'output-module-groups',
  'validate-inputs',
] as const;
