import { ValidationUtils } from '../../../libs/utils';
import { BaseIacBuilder } from '../common/BaseIacBuilder';
import {
  ITerragruntBuilder,
  ITerragruntService,
  TERRAGRUNT_COMMANDS,
  TerragruntCommand,
} from './interfaces';
import { TerragruntService } from './services';

/**
 * Fluent builder for constructing Terragrunt service instances
 * Extends BaseIacBuilder with Terragrunt-specific builder methods
 */
export class TerragruntBuilder
  extends BaseIacBuilder<TerragruntCommand, ITerragruntService>
  implements ITerragruntBuilder
{
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
  private constructor() {
    super();
  }

  // ============ Static Factory Methods ============

  static create(command?: TerragruntCommand): TerragruntBuilder {
    const builder = new TerragruntBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }

  static forInit(): TerragruntBuilder {
    return TerragruntBuilder.create('init');
  }

  static forValidate(): TerragruntBuilder {
    return TerragruntBuilder.create('validate');
  }

  static forFmt(): TerragruntBuilder {
    return TerragruntBuilder.create('fmt');
  }

  static forHclFmt(): TerragruntBuilder {
    return TerragruntBuilder.create('hclfmt');
  }

  static forPlan(): TerragruntBuilder {
    return TerragruntBuilder.create('plan');
  }

  static forApply(): TerragruntBuilder {
    return TerragruntBuilder.create('apply');
  }

  static forDestroy(): TerragruntBuilder {
    return TerragruntBuilder.create('destroy');
  }

  static forOutput(): TerragruntBuilder {
    return TerragruntBuilder.create('output');
  }

  static forRunAllPlan(): TerragruntBuilder {
    return TerragruntBuilder.create('plan').withRunAll();
  }

  static forRunAllApply(): TerragruntBuilder {
    return TerragruntBuilder.create('apply').withRunAll();
  }

  static forRunAllDestroy(): TerragruntBuilder {
    return TerragruntBuilder.create('destroy').withRunAll();
  }

  static forGraphDependencies(): TerragruntBuilder {
    return TerragruntBuilder.create('graph-dependencies');
  }

  static forValidateInputs(): TerragruntBuilder {
    return TerragruntBuilder.create('validate-inputs');
  }

  // ============ Terragrunt-Specific Builder Methods ============

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

  // ============ Build ============

  build(): ITerragruntService {
    if (!this._command) {
      throw new Error(
        'Terragrunt command is required. Use withCommand() or a static factory method.',
      );
    }

    const service = new TerragruntService(this._command, this._workingDirectory);

    // Transfer shared state
    this.transferSharedState(service);

    // Transfer terragrunt-specific state
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

  // ============ Protected Overrides ============

  protected resetSpecific(): void {
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
  }

  protected validateCommand(command: string): void {
    if (!TERRAGRUNT_COMMANDS.includes(command as TerragruntCommand)) {
      throw new Error(
        `Invalid Terragrunt command: ${command}. Valid commands are: ${TERRAGRUNT_COMMANDS.join(', ')}`,
      );
    }
  }
}
