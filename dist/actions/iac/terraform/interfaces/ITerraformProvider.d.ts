/**
 * Read-only provider interface for Terraform configuration
 * Provides access to Terraform configuration state without modification
 */
export interface ITerraformProvider {
    /** The terraform command to execute (plan, apply, destroy, validate, fmt) */
    readonly command: TerraformCommand;
    /** The executor binary (terraform) */
    readonly executor: string;
    /** Working directory for terraform operations */
    readonly workingDirectory: string;
    /** Environment variables for the terraform process */
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
 * Supported Terraform commands
 */
export type TerraformCommand = 'init' | 'validate' | 'fmt' | 'plan' | 'apply' | 'destroy' | 'output' | 'show' | 'state' | 'import' | 'refresh' | 'taint' | 'untaint' | 'workspace';
/**
 * Terraform command categories for validation
 */
export declare const TERRAFORM_COMMANDS: readonly TerraformCommand[];
/**
 * Commands that support -auto-approve flag
 */
export declare const AUTO_APPROVE_COMMANDS: readonly TerraformCommand[];
/**
 * Commands that support -target flag
 */
export declare const TARGET_COMMANDS: readonly TerraformCommand[];
/**
 * Commands that support -var and -var-file flags
 */
export declare const VARIABLE_COMMANDS: readonly TerraformCommand[];
//# sourceMappingURL=ITerraformProvider.d.ts.map