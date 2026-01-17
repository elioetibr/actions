import { IBuilder } from '../../../../libs/services/types';
import { ITerragruntService } from './ITerragruntService';
import { TerragruntCommand } from './ITerragruntProvider';

/**
 * Fluent builder interface for constructing Terragrunt service instances
 * All configuration methods return `this` for method chaining
 */
export interface ITerragruntBuilder extends IBuilder<ITerragruntService> {
  /**
   * Set the terragrunt command to execute
   * @param command - The terragrunt command
   */
  withCommand(command: TerragruntCommand): this;

  /**
   * Set the working directory for terragrunt operations
   * @param directory - Path to the terragrunt working directory
   */
  withWorkingDirectory(directory: string): this;

  /**
   * Add an environment variable for the terragrunt process
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
   * @param timeout - Lock timeout duration
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

  // Terragrunt-specific methods

  /**
   * Set the terragrunt configuration file path
   * @param configPath - Path to terragrunt.hcl
   */
  withTerragruntConfig(configPath: string): this;

  /**
   * Set the terragrunt working directory
   * @param directory - Working directory for terragrunt
   */
  withTerragruntWorkingDir(directory: string): this;

  /**
   * Enable run-all mode to execute on all modules
   */
  withRunAll(): this;

  /**
   * Disable auto-init
   */
  withNoAutoInit(): this;

  /**
   * Disable auto-retry
   */
  withNoAutoRetry(): this;

  /**
   * Enable non-interactive mode
   */
  withNonInteractive(): this;

  /**
   * Set terragrunt parallelism for run-all
   * @param level - Number of parallel modules
   */
  withTerragruntParallelism(level: number): this;

  /**
   * Add an include directory for run-all
   * @param directory - Directory path to include
   */
  withIncludeDir(directory: string): this;

  /**
   * Add multiple include directories
   * @param directories - Array of directory paths
   */
  withIncludeDirs(directories: string[]): this;

  /**
   * Add an exclude directory for run-all
   * @param directory - Directory path to exclude
   */
  withExcludeDir(directory: string): this;

  /**
   * Add multiple exclude directories
   * @param directories - Array of directory paths
   */
  withExcludeDirs(directories: string[]): this;

  /**
   * Ignore dependency errors during run-all
   */
  withIgnoreDependencyErrors(): this;

  /**
   * Ignore external dependencies
   */
  withIgnoreExternalDependencies(): this;

  /**
   * Include external dependencies
   */
  withIncludeExternalDependencies(): this;

  /**
   * Set terragrunt source override
   * @param source - Source path for terraform modules
   */
  withTerragruntSource(source: string): this;

  /**
   * Add a source map entry for module source override
   * @param originalSource - Original module source
   * @param newSource - New source to use
   */
  withSourceMap(originalSource: string, newSource: string): this;

  /**
   * Add multiple source map entries
   * @param sourceMap - Record of original to new source mappings
   */
  withSourceMaps(sourceMap: Record<string, string>): this;

  /**
   * Set download directory
   * @param directory - Directory for downloaded modules
   */
  withDownloadDir(directory: string): this;

  /**
   * Set IAM role to assume
   * @param role - IAM role ARN
   */
  withIamRole(role: string): this;

  /**
   * Set IAM role with session name
   * @param role - IAM role ARN
   * @param sessionName - Session name for assumed role
   */
  withIamRoleAndSession(role: string, sessionName: string): this;

  /**
   * Enable strict include mode
   */
  withStrictInclude(): this;

  /**
   * Reset builder to initial state
   */
  reset(): this;

  /**
   * Build the Terragrunt service instance
   * @throws Error if required configuration is missing
   */
  build(): ITerragruntService;
}
