import { IStringListProvider } from '../../../../libs/providers';
import { ITerragruntProvider, TerragruntCommand } from './ITerragruntProvider';

/**
 * Service interface for Terragrunt operations
 * Provides a complete interface for configuring and executing Terragrunt commands
 */
export interface ITerragruntService extends ITerragruntProvider, IStringListProvider {
  /**
   * Set the terragrunt command
   * @param command - The terragrunt command
   */
  setCommand(command: TerragruntCommand): this;

  /**
   * Set the working directory
   * @param directory - Path to the working directory
   */
  setWorkingDirectory(directory: string): this;

  /**
   * Add an environment variable
   * @param key - Environment variable name
   * @param value - Environment variable value
   */
  addEnvironmentVariable(key: string, value: string): this;

  /**
   * Remove an environment variable
   * @param key - Environment variable name to remove
   */
  removeEnvironmentVariable(key: string): this;

  /**
   * Clear all environment variables
   */
  clearEnvironmentVariables(): this;

  /**
   * Add a terraform variable (-var)
   * @param key - Variable name
   * @param value - Variable value
   */
  addVariable(key: string, value: string): this;

  /**
   * Remove a terraform variable
   * @param key - Variable name to remove
   */
  removeVariable(key: string): this;

  /**
   * Clear all terraform variables
   */
  clearVariables(): this;

  /**
   * Add a variable file (-var-file)
   * @param filePath - Path to the .tfvars file
   */
  addVarFile(filePath: string): this;

  /**
   * Remove a variable file
   * @param filePath - Path to remove
   */
  removeVarFile(filePath: string): this;

  /**
   * Clear all variable files
   */
  clearVarFiles(): this;

  /**
   * Add a backend configuration option (-backend-config)
   * @param key - Backend config key
   * @param value - Backend config value
   */
  addBackendConfig(key: string, value: string): this;

  /**
   * Remove a backend configuration option
   * @param key - Backend config key to remove
   */
  removeBackendConfig(key: string): this;

  /**
   * Clear all backend configurations
   */
  clearBackendConfig(): this;

  /**
   * Add a target resource (-target)
   * @param target - Resource address to target
   */
  addTarget(target: string): this;

  /**
   * Remove a target resource
   * @param target - Resource address to remove
   */
  removeTarget(target: string): this;

  /**
   * Clear all targets
   */
  clearTargets(): this;

  /**
   * Set auto-approve flag (-auto-approve)
   * @param enabled - Whether to enable auto-approve
   */
  setAutoApprove(enabled: boolean): this;

  /**
   * Set dry-run mode (no actual execution)
   * @param enabled - Whether to enable dry-run mode
   */
  setDryRun(enabled: boolean): this;

  /**
   * Set the plan file for apply operations
   * @param filePath - Path to the plan file
   */
  setPlanFile(filePath: string | undefined): this;

  /**
   * Set the output file for plan operations (-out)
   * @param filePath - Path to save the plan
   */
  setOutFile(filePath: string | undefined): this;

  /**
   * Set no-color flag (-no-color)
   * @param enabled - Whether to disable color output
   */
  setNoColor(enabled: boolean): this;

  /**
   * Set compact-warnings flag (-compact-warnings)
   * @param enabled - Whether to use compact warnings
   */
  setCompactWarnings(enabled: boolean): this;

  /**
   * Set parallelism level (-parallelism)
   * @param level - Number of parallel operations
   */
  setParallelism(level: number | undefined): this;

  /**
   * Set lock timeout (-lock-timeout)
   * @param timeout - Lock timeout duration (e.g., "10s", "5m")
   */
  setLockTimeout(timeout: string | undefined): this;

  /**
   * Set refresh flag (-refresh)
   * @param enabled - Whether to refresh state
   */
  setRefresh(enabled: boolean): this;

  /**
   * Set reconfigure flag for init (-reconfigure)
   * @param enabled - Whether to reconfigure backend
   */
  setReconfigure(enabled: boolean): this;

  /**
   * Set migrate-state flag for init (-migrate-state)
   * @param enabled - Whether to migrate state
   */
  setMigrateState(enabled: boolean): this;

  // Terragrunt-specific methods

  /**
   * Set the terragrunt configuration file path
   * @param configPath - Path to terragrunt.hcl
   */
  setTerragruntConfig(configPath: string | undefined): this;

  /**
   * Set the terragrunt working directory
   * @param directory - Working directory for terragrunt
   */
  setTerragruntWorkingDir(directory: string | undefined): this;

  /**
   * Enable run-all mode
   * @param enabled - Whether to run on all modules
   */
  setRunAll(enabled: boolean): this;

  /**
   * Set no-auto-init flag
   * @param enabled - Whether to disable auto-init
   */
  setNoAutoInit(enabled: boolean): this;

  /**
   * Set no-auto-retry flag
   * @param enabled - Whether to disable auto-retry
   */
  setNoAutoRetry(enabled: boolean): this;

  /**
   * Set non-interactive mode
   * @param enabled - Whether to use non-interactive mode
   */
  setNonInteractive(enabled: boolean): this;

  /**
   * Set terragrunt parallelism for run-all
   * @param level - Number of parallel modules
   */
  setTerragruntParallelism(level: number | undefined): this;

  /**
   * Add an include directory for run-all
   * @param directory - Directory path to include
   */
  addIncludeDir(directory: string): this;

  /**
   * Remove an include directory
   * @param directory - Directory path to remove
   */
  removeIncludeDir(directory: string): this;

  /**
   * Clear all include directories
   */
  clearIncludeDirs(): this;

  /**
   * Add an exclude directory for run-all
   * @param directory - Directory path to exclude
   */
  addExcludeDir(directory: string): this;

  /**
   * Remove an exclude directory
   * @param directory - Directory path to remove
   */
  removeExcludeDir(directory: string): this;

  /**
   * Clear all exclude directories
   */
  clearExcludeDirs(): this;

  /**
   * Set ignore dependency errors flag
   * @param enabled - Whether to ignore dependency errors
   */
  setIgnoreDependencyErrors(enabled: boolean): this;

  /**
   * Set ignore external dependencies flag
   * @param enabled - Whether to ignore external dependencies
   */
  setIgnoreExternalDependencies(enabled: boolean): this;

  /**
   * Set include external dependencies flag
   * @param enabled - Whether to include external dependencies
   */
  setIncludeExternalDependencies(enabled: boolean): this;

  /**
   * Set terragrunt source override
   * @param source - Source path for terraform modules
   */
  setTerragruntSource(source: string | undefined): this;

  /**
   * Add a source map entry for module source override
   * @param originalSource - Original module source
   * @param newSource - New source to use
   */
  addSourceMap(originalSource: string, newSource: string): this;

  /**
   * Remove a source map entry
   * @param originalSource - Original module source to remove
   */
  removeSourceMap(originalSource: string): this;

  /**
   * Clear all source map entries
   */
  clearSourceMap(): this;

  /**
   * Set download directory
   * @param directory - Directory for downloaded modules
   */
  setDownloadDir(directory: string | undefined): this;

  /**
   * Set IAM role to assume
   * @param role - IAM role ARN
   */
  setIamRole(role: string | undefined): this;

  /**
   * Set IAM role session name
   * @param sessionName - Session name for assumed role
   */
  setIamRoleSessionName(sessionName: string | undefined): this;

  /**
   * Set strict include mode
   * @param enabled - Whether to use strict include mode
   */
  setStrictInclude(enabled: boolean): this;

  /**
   * Generate command arguments array
   * @returns Array of command arguments
   */
  toCommandArgs(): string[];

  /**
   * Generate full command array including executor
   * @returns Full command array ready for execution
   */
  buildCommand(): string[];

  /**
   * Generate command as a single string
   * @returns Command as space-separated string
   */
  toString(): string;

  /**
   * Generate command as multi-line string with backslash continuations
   * @returns Multi-line command string
   */
  toStringMultiLineCommand(): string;

  /**
   * Reset all configuration to defaults
   */
  reset(): this;

  /**
   * Clone the service with current configuration
   * @returns New service instance with same configuration
   */
  clone(): ITerragruntService;
}
