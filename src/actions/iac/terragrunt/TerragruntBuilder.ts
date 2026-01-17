import { ValidationUtils } from '../../../libs/utils';
import {
  ITerragruntBuilder,
  ITerragruntService,
  TERRAGRUNT_COMMANDS,
  TerragruntCommand,
} from './interfaces';
import { TerragruntService } from './services';

/**
 * Fluent builder for constructing Terragrunt service instances
 * Provides a type-safe API for configuring Terragrunt commands
 */
export class TerragruntBuilder implements ITerragruntBuilder {
  // Core configuration
  private _command: TerragruntCommand | undefined;
  private _workingDirectory: string = '.';

  // Terraform configuration
  private readonly _environment: Map<string, string> = new Map();
  private readonly _variables: Map<string, string> = new Map();
  private readonly _varFiles: string[] = [];
  private readonly _backendConfig: Map<string, string> = new Map();
  private readonly _targets: string[] = [];

  // Terraform flags
  private _autoApprove: boolean = false;
  private _dryRun: boolean = false;
  private _noColor: boolean = false;
  private _compactWarnings: boolean = false;
  private _refresh: boolean = true;
  private _reconfigure: boolean = false;
  private _migrateState: boolean = false;

  // Terraform optional values
  private _planFile: string | undefined;
  private _outFile: string | undefined;
  private _parallelism: number | undefined;
  private _lockTimeout: string | undefined;

  // Terragrunt-specific configuration
  private _terragruntConfig: string | undefined;
  private _terragruntWorkingDir: string | undefined;
  private _runAll: boolean = false;
  private _noAutoInit: boolean = false;
  private _noAutoRetry: boolean = false;
  private _nonInteractive: boolean = false;
  private _terragruntParallelism: number | undefined;
  private readonly _includeDirs: string[] = [];
  private readonly _excludeDirs: string[] = [];
  private _ignoreDependencyErrors: boolean = false;
  private _ignoreExternalDependencies: boolean = false;
  private _includeExternalDependencies: boolean = false;
  private _terragruntSource: string | undefined;
  private readonly _sourceMap: Map<string, string> = new Map();
  private _downloadDir: string | undefined;
  private _iamRole: string | undefined;
  private _iamRoleSessionName: string | undefined;
  private _strictInclude: boolean = false;

  /**
   * Private constructor - use static factory methods
   */
  private constructor() {}

  // ============ Static Factory Methods ============

  /**
   * Create a new TerragruntBuilder instance
   * @param command - Optional initial command
   */
  static create(command?: TerragruntCommand): TerragruntBuilder {
    const builder = new TerragruntBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }

  /**
   * Create a builder for terragrunt init
   */
  static forInit(): TerragruntBuilder {
    return TerragruntBuilder.create('init');
  }

  /**
   * Create a builder for terragrunt validate
   */
  static forValidate(): TerragruntBuilder {
    return TerragruntBuilder.create('validate');
  }

  /**
   * Create a builder for terragrunt fmt
   */
  static forFmt(): TerragruntBuilder {
    return TerragruntBuilder.create('fmt');
  }

  /**
   * Create a builder for terragrunt hclfmt
   */
  static forHclFmt(): TerragruntBuilder {
    return TerragruntBuilder.create('hclfmt');
  }

  /**
   * Create a builder for terragrunt plan
   */
  static forPlan(): TerragruntBuilder {
    return TerragruntBuilder.create('plan');
  }

  /**
   * Create a builder for terragrunt apply
   */
  static forApply(): TerragruntBuilder {
    return TerragruntBuilder.create('apply');
  }

  /**
   * Create a builder for terragrunt destroy
   */
  static forDestroy(): TerragruntBuilder {
    return TerragruntBuilder.create('destroy');
  }

  /**
   * Create a builder for terragrunt output
   */
  static forOutput(): TerragruntBuilder {
    return TerragruntBuilder.create('output');
  }

  /**
   * Create a builder for terragrunt run-all plan
   */
  static forRunAllPlan(): TerragruntBuilder {
    return TerragruntBuilder.create('plan').withRunAll();
  }

  /**
   * Create a builder for terragrunt run-all apply
   */
  static forRunAllApply(): TerragruntBuilder {
    return TerragruntBuilder.create('apply').withRunAll();
  }

  /**
   * Create a builder for terragrunt run-all destroy
   */
  static forRunAllDestroy(): TerragruntBuilder {
    return TerragruntBuilder.create('destroy').withRunAll();
  }

  /**
   * Create a builder for terragrunt graph-dependencies
   */
  static forGraphDependencies(): TerragruntBuilder {
    return TerragruntBuilder.create('graph-dependencies');
  }

  /**
   * Create a builder for terragrunt validate-inputs
   */
  static forValidateInputs(): TerragruntBuilder {
    return TerragruntBuilder.create('validate-inputs');
  }

  // ============ ITerragruntBuilder Implementation ============

  withCommand(command: TerragruntCommand): this {
    this.validateCommand(command);
    this._command = command;
    return this;
  }

  withWorkingDirectory(directory: string): this {
    ValidationUtils.validateStringInput(directory, 'workingDirectory');
    this._workingDirectory = directory;
    return this;
  }

  // Terraform configuration methods

  withEnvironmentVariable(key: string, value: string): this {
    ValidationUtils.validateStringInput(key, 'environment variable key');
    this._environment.set(key, value);
    return this;
  }

  withEnvironmentVariables(variables: Record<string, string>): this {
    for (const [key, value] of Object.entries(variables)) {
      this.withEnvironmentVariable(key, value);
    }
    return this;
  }

  withVariable(key: string, value: string): this {
    ValidationUtils.validateStringInput(key, 'variable key');
    this._variables.set(key, value);
    return this;
  }

  withVariables(variables: Record<string, string>): this {
    for (const [key, value] of Object.entries(variables)) {
      this.withVariable(key, value);
    }
    return this;
  }

  withVarFile(filePath: string): this {
    ValidationUtils.validateStringInput(filePath, 'var file path');
    if (!this._varFiles.includes(filePath)) {
      this._varFiles.push(filePath);
    }
    return this;
  }

  withVarFiles(filePaths: string[]): this {
    for (const filePath of filePaths) {
      this.withVarFile(filePath);
    }
    return this;
  }

  withBackendConfig(key: string, value: string): this {
    ValidationUtils.validateStringInput(key, 'backend config key');
    this._backendConfig.set(key, value);
    return this;
  }

  withBackendConfigs(config: Record<string, string>): this {
    for (const [key, value] of Object.entries(config)) {
      this.withBackendConfig(key, value);
    }
    return this;
  }

  withTarget(target: string): this {
    ValidationUtils.validateStringInput(target, 'target');
    if (!this._targets.includes(target)) {
      this._targets.push(target);
    }
    return this;
  }

  withTargets(targets: string[]): this {
    for (const target of targets) {
      this.withTarget(target);
    }
    return this;
  }

  withAutoApprove(): this {
    this._autoApprove = true;
    return this;
  }

  withDryRun(): this {
    this._dryRun = true;
    return this;
  }

  withPlanFile(filePath: string): this {
    ValidationUtils.validateStringInput(filePath, 'plan file path');
    this._planFile = filePath;
    return this;
  }

  withOutFile(filePath: string): this {
    ValidationUtils.validateStringInput(filePath, 'output file path');
    this._outFile = filePath;
    return this;
  }

  withNoColor(): this {
    this._noColor = true;
    return this;
  }

  withCompactWarnings(): this {
    this._compactWarnings = true;
    return this;
  }

  withParallelism(level: number): this {
    if (level < 1) {
      throw new Error('Parallelism level must be at least 1');
    }
    this._parallelism = level;
    return this;
  }

  withLockTimeout(timeout: string): this {
    ValidationUtils.validateStringInput(timeout, 'lock timeout');
    this._lockTimeout = timeout;
    return this;
  }

  withRefresh(): this {
    this._refresh = true;
    return this;
  }

  withoutRefresh(): this {
    this._refresh = false;
    return this;
  }

  withReconfigure(): this {
    this._reconfigure = true;
    return this;
  }

  withMigrateState(): this {
    this._migrateState = true;
    return this;
  }

  // Terragrunt-specific methods

  withTerragruntConfig(configPath: string): this {
    ValidationUtils.validateStringInput(configPath, 'terragrunt config path');
    this._terragruntConfig = configPath;
    return this;
  }

  withTerragruntWorkingDir(directory: string): this {
    ValidationUtils.validateStringInput(directory, 'terragrunt working directory');
    this._terragruntWorkingDir = directory;
    return this;
  }

  withRunAll(): this {
    this._runAll = true;
    return this;
  }

  withNoAutoInit(): this {
    this._noAutoInit = true;
    return this;
  }

  withNoAutoRetry(): this {
    this._noAutoRetry = true;
    return this;
  }

  withNonInteractive(): this {
    this._nonInteractive = true;
    return this;
  }

  withTerragruntParallelism(level: number): this {
    if (level < 1) {
      throw new Error('Terragrunt parallelism level must be at least 1');
    }
    this._terragruntParallelism = level;
    return this;
  }

  withIncludeDir(directory: string): this {
    ValidationUtils.validateStringInput(directory, 'include directory');
    if (!this._includeDirs.includes(directory)) {
      this._includeDirs.push(directory);
    }
    return this;
  }

  withIncludeDirs(directories: string[]): this {
    for (const dir of directories) {
      this.withIncludeDir(dir);
    }
    return this;
  }

  withExcludeDir(directory: string): this {
    ValidationUtils.validateStringInput(directory, 'exclude directory');
    if (!this._excludeDirs.includes(directory)) {
      this._excludeDirs.push(directory);
    }
    return this;
  }

  withExcludeDirs(directories: string[]): this {
    for (const dir of directories) {
      this.withExcludeDir(dir);
    }
    return this;
  }

  withIgnoreDependencyErrors(): this {
    this._ignoreDependencyErrors = true;
    return this;
  }

  withIgnoreExternalDependencies(): this {
    this._ignoreExternalDependencies = true;
    return this;
  }

  withIncludeExternalDependencies(): this {
    this._includeExternalDependencies = true;
    return this;
  }

  withTerragruntSource(source: string): this {
    ValidationUtils.validateStringInput(source, 'terragrunt source');
    this._terragruntSource = source;
    return this;
  }

  withSourceMap(originalSource: string, newSource: string): this {
    ValidationUtils.validateStringInput(originalSource, 'original source');
    ValidationUtils.validateStringInput(newSource, 'new source');
    this._sourceMap.set(originalSource, newSource);
    return this;
  }

  withSourceMaps(sourceMap: Record<string, string>): this {
    for (const [original, newSource] of Object.entries(sourceMap)) {
      this.withSourceMap(original, newSource);
    }
    return this;
  }

  withDownloadDir(directory: string): this {
    ValidationUtils.validateStringInput(directory, 'download directory');
    this._downloadDir = directory;
    return this;
  }

  withIamRole(role: string): this {
    ValidationUtils.validateStringInput(role, 'IAM role');
    this._iamRole = role;
    return this;
  }

  withIamRoleAndSession(role: string, sessionName: string): this {
    this.withIamRole(role);
    ValidationUtils.validateStringInput(sessionName, 'IAM role session name');
    this._iamRoleSessionName = sessionName;
    return this;
  }

  withStrictInclude(): this {
    this._strictInclude = true;
    return this;
  }

  reset(): this {
    this._command = undefined;
    this._workingDirectory = '.';

    // Reset terraform configuration
    this._environment.clear();
    this._variables.clear();
    this._varFiles.length = 0;
    this._backendConfig.clear();
    this._targets.length = 0;
    this._autoApprove = false;
    this._dryRun = false;
    this._noColor = false;
    this._compactWarnings = false;
    this._refresh = true;
    this._reconfigure = false;
    this._migrateState = false;
    this._planFile = undefined;
    this._outFile = undefined;
    this._parallelism = undefined;
    this._lockTimeout = undefined;

    // Reset terragrunt configuration
    this._terragruntConfig = undefined;
    this._terragruntWorkingDir = undefined;
    this._runAll = false;
    this._noAutoInit = false;
    this._noAutoRetry = false;
    this._nonInteractive = false;
    this._terragruntParallelism = undefined;
    this._includeDirs.length = 0;
    this._excludeDirs.length = 0;
    this._ignoreDependencyErrors = false;
    this._ignoreExternalDependencies = false;
    this._includeExternalDependencies = false;
    this._terragruntSource = undefined;
    this._sourceMap.clear();
    this._downloadDir = undefined;
    this._iamRole = undefined;
    this._iamRoleSessionName = undefined;
    this._strictInclude = false;

    return this;
  }

  build(): ITerragruntService {
    // Validate required fields
    if (!this._command) {
      throw new Error(
        'Terragrunt command is required. Use withCommand() or a static factory method.'
      );
    }

    // Create service instance
    const service = new TerragruntService(
      this._command,
      this._workingDirectory
    );

    // Transfer terraform configuration
    for (const [key, value] of this._environment.entries()) {
      service.addEnvironmentVariable(key, value);
    }

    for (const [key, value] of this._variables.entries()) {
      service.addVariable(key, value);
    }

    for (const varFile of this._varFiles) {
      service.addVarFile(varFile);
    }

    for (const [key, value] of this._backendConfig.entries()) {
      service.addBackendConfig(key, value);
    }

    for (const target of this._targets) {
      service.addTarget(target);
    }

    service.setAutoApprove(this._autoApprove);
    service.setDryRun(this._dryRun);
    service.setNoColor(this._noColor);
    service.setCompactWarnings(this._compactWarnings);
    service.setRefresh(this._refresh);
    service.setReconfigure(this._reconfigure);
    service.setMigrateState(this._migrateState);
    service.setPlanFile(this._planFile);
    service.setOutFile(this._outFile);
    service.setParallelism(this._parallelism);
    service.setLockTimeout(this._lockTimeout);

    // Transfer terragrunt configuration
    service.setTerragruntConfig(this._terragruntConfig);
    service.setTerragruntWorkingDir(this._terragruntWorkingDir);
    service.setRunAll(this._runAll);
    service.setNoAutoInit(this._noAutoInit);
    service.setNoAutoRetry(this._noAutoRetry);
    service.setNonInteractive(this._nonInteractive);
    service.setTerragruntParallelism(this._terragruntParallelism);

    for (const dir of this._includeDirs) {
      service.addIncludeDir(dir);
    }

    for (const dir of this._excludeDirs) {
      service.addExcludeDir(dir);
    }

    service.setIgnoreDependencyErrors(this._ignoreDependencyErrors);
    service.setIgnoreExternalDependencies(this._ignoreExternalDependencies);
    service.setIncludeExternalDependencies(this._includeExternalDependencies);
    service.setTerragruntSource(this._terragruntSource);

    for (const [original, newSource] of this._sourceMap.entries()) {
      service.addSourceMap(original, newSource);
    }

    service.setDownloadDir(this._downloadDir);
    service.setIamRole(this._iamRole);
    service.setIamRoleSessionName(this._iamRoleSessionName);
    service.setStrictInclude(this._strictInclude);

    return service;
  }

  // ============ Private Helper Methods ============

  /**
   * Validate that a command is a valid Terragrunt command
   */
  private validateCommand(command: string): void {
    if (!TERRAGRUNT_COMMANDS.includes(command as TerragruntCommand)) {
      throw new Error(
        `Invalid Terragrunt command: ${command}. Valid commands are: ${TERRAGRUNT_COMMANDS.join(', ')}`
      );
    }
  }
}
