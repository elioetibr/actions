import { IBuilder } from '../../../../libs/services/types';
import { ITerraformService } from './ITerraformService';
import { TerraformCommand } from './ITerraformProvider';
/**
 * Fluent builder interface for constructing Terraform service instances
 * All configuration methods return `this` for method chaining
 */
export interface ITerraformBuilder extends IBuilder<ITerraformService> {
    /**
     * Set the terraform command to execute
     * @param command - The terraform command (plan, apply, destroy, etc.)
     */
    withCommand(command: TerraformCommand): this;
    /**
     * Set the working directory for terraform operations
     * @param directory - Path to the terraform working directory
     */
    withWorkingDirectory(directory: string): this;
    /**
     * Add an environment variable for the terraform process
     * @param key - Environment variable name
     * @param value - Environment variable value
     */
    withEnvironmentVariable(key: string, value: string): this;
    /**
     * Add multiple environment variables
     * @param variables - Record of environment variables
     */
    withEnvironmentVariables(variables: Record<string, string>): this;
    /**
     * Add a terraform variable (-var)
     * @param key - Variable name
     * @param value - Variable value
     */
    withVariable(key: string, value: string): this;
    /**
     * Add multiple terraform variables
     * @param variables - Record of terraform variables
     */
    withVariables(variables: Record<string, string>): this;
    /**
     * Add a variable file path (-var-file)
     * @param filePath - Path to the .tfvars file
     */
    withVarFile(filePath: string): this;
    /**
     * Add multiple variable file paths
     * @param filePaths - Array of .tfvars file paths
     */
    withVarFiles(filePaths: string[]): this;
    /**
     * Add a backend configuration option (-backend-config)
     * @param key - Backend config key
     * @param value - Backend config value
     */
    withBackendConfig(key: string, value: string): this;
    /**
     * Add multiple backend configuration options
     * @param config - Record of backend configuration
     */
    withBackendConfigs(config: Record<string, string>): this;
    /**
     * Add a target resource (-target)
     * @param target - Resource address to target
     */
    withTarget(target: string): this;
    /**
     * Add multiple target resources
     * @param targets - Array of resource addresses
     */
    withTargets(targets: string[]): this;
    /**
     * Enable auto-approve flag (-auto-approve)
     * Only valid for apply and destroy commands
     */
    withAutoApprove(): this;
    /**
     * Enable dry-run mode (no actual execution)
     */
    withDryRun(): this;
    /**
     * Set the plan file for apply operations
     * @param filePath - Path to the saved plan file
     */
    withPlanFile(filePath: string): this;
    /**
     * Set the output file for plan operations (-out)
     * @param filePath - Path to save the plan
     */
    withOutFile(filePath: string): this;
    /**
     * Enable no-color output (-no-color)
     */
    withNoColor(): this;
    /**
     * Enable compact warnings (-compact-warnings)
     */
    withCompactWarnings(): this;
    /**
     * Set parallelism level (-parallelism)
     * @param level - Number of parallel operations
     */
    withParallelism(level: number): this;
    /**
     * Set lock timeout (-lock-timeout)
     * @param timeout - Lock timeout duration (e.g., "10s", "5m")
     */
    withLockTimeout(timeout: string): this;
    /**
     * Enable state refresh (-refresh=true)
     */
    withRefresh(): this;
    /**
     * Disable state refresh (-refresh=false)
     */
    withoutRefresh(): this;
    /**
     * Enable backend reconfiguration for init (-reconfigure)
     */
    withReconfigure(): this;
    /**
     * Enable state migration for init (-migrate-state)
     */
    withMigrateState(): this;
    /**
     * Reset builder to initial state
     */
    reset(): this;
    /**
     * Build the Terraform service instance
     * @throws Error if required configuration is missing
     */
    build(): ITerraformService;
}
//# sourceMappingURL=ITerraformBuilder.d.ts.map