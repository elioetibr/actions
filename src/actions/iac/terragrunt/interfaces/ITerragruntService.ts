import { IIacService } from '../../common/interfaces';
import { ITerragruntProvider, TerragruntCommand } from './ITerragruntProvider';

/**
 * Service interface for Terragrunt operations
 * Extends IIacService with Terragrunt-specific mutator methods
 */
export interface ITerragruntService extends ITerragruntProvider, IIacService {
  /** Narrowed executor type resolving ITerragruntProvider and IIacService */
  readonly executor: 'terragrunt';

  /** Narrowed command type resolving ITerragruntProvider and IIacService */
  readonly command: TerragruntCommand;

  /**
   * Set the terragrunt command
   * @param command - The terragrunt command
   */
  setCommand(command: TerragruntCommand): this;

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
   * Set the detected Terragrunt major version for version-aware flag generation
   * @param version - Major version number (0 for legacy, 1+ for CLI redesign)
   */
  setTerragruntMajorVersion(version: number): this;

  /**
   * Clone the service with current configuration
   * @returns New service instance with same configuration
   */
  clone(): ITerragruntService;
}
