import { IIacBuilder } from '../../common/interfaces';
import { ITerragruntService } from './ITerragruntService';
import { TerragruntCommand } from './ITerragruntProvider';

/**
 * Fluent builder interface for constructing Terragrunt service instances
 * Extends IIacBuilder with Terragrunt-specific builder methods
 */
export interface ITerragruntBuilder extends IIacBuilder<ITerragruntService> {
  /**
   * Set the terragrunt command to execute
   * @param command - The terragrunt command
   */
  withCommand(command: TerragruntCommand): this;

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
   * Set the detected Terragrunt major version for version-aware flag generation
   * @param major - Major version number (0 for legacy, 1+ for CLI redesign)
   */
  withTerragruntMajorVersion(major: number): this;

  /**
   * Build the Terragrunt service instance
   * @throws Error if required configuration is missing
   */
  build(): ITerragruntService;
}
