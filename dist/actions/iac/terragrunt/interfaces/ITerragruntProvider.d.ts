import { TerraformCommand } from '../../terraform/interfaces';
/**
 * Read-only provider interface for Terragrunt configuration
 * Contains all configuration properties for Terragrunt operations
 */
export interface ITerragruntProvider {
    /** The terragrunt command to execute */
    readonly command: TerragruntCommand;
    /** The executor binary (terragrunt) */
    readonly executor: 'terragrunt';
    /** Working directory for terragrunt operations */
    readonly workingDirectory: string;
    /** Environment variables for the terragrunt process */
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
export type TerragruntCommand = TerraformCommand | 'run-all' | 'graph-dependencies' | 'hclfmt' | 'aws-provider-patch' | 'render-json' | 'output-module-groups' | 'validate-inputs';
/**
 * All valid Terragrunt commands
 */
export declare const TERRAGRUNT_COMMANDS: readonly TerragruntCommand[];
//# sourceMappingURL=ITerragruntProvider.d.ts.map