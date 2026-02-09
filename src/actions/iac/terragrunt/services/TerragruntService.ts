import { BaseIacService } from '../../common/services/BaseIacService';
import { ITerragruntService, TerragruntCommand } from '../interfaces';
import { TerragruntArgumentBuilder } from './TerragruntArgumentBuilder';
import { TerragruntStringFormatter } from './TerragruntStringFormatter';

/**
 * Main service implementation for Terragrunt operations
 * Extends BaseIacService with Terragrunt-specific state and factory methods
 */
export class TerragruntService extends BaseIacService implements ITerragruntService {
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
  private _terragruntMajorVersion: number = 0;

  constructor(command: TerragruntCommand, workingDirectory: string = '.') {
    super(command, 'terragrunt', workingDirectory);
  }

  // ============ Type-Narrowed Accessors ============

  override get executor(): 'terragrunt' {
    return 'terragrunt';
  }

  override get command(): TerragruntCommand {
    return super.command as TerragruntCommand;
  }

  override setCommand(command: TerragruntCommand): this {
    return super.setCommand(command);
  }

  // ============ Terragrunt-Specific Read-Only Properties ============

  get terragruntConfig(): string | undefined {
    return this._terragruntConfig;
  }

  get terragruntWorkingDir(): string | undefined {
    return this._terragruntWorkingDir;
  }

  get runAll(): boolean {
    return this._runAll;
  }

  get noAutoInit(): boolean {
    return this._noAutoInit;
  }

  get noAutoRetry(): boolean {
    return this._noAutoRetry;
  }

  get nonInteractive(): boolean {
    return this._nonInteractive;
  }

  get terragruntParallelism(): number | undefined {
    return this._terragruntParallelism;
  }

  get includeDirs(): readonly string[] {
    return [...this._includeDirs];
  }

  get excludeDirs(): readonly string[] {
    return [...this._excludeDirs];
  }

  get ignoreDependencyErrors(): boolean {
    return this._ignoreDependencyErrors;
  }

  get ignoreExternalDependencies(): boolean {
    return this._ignoreExternalDependencies;
  }

  get includeExternalDependencies(): boolean {
    return this._includeExternalDependencies;
  }

  get terragruntSource(): string | undefined {
    return this._terragruntSource;
  }

  get sourceMap(): ReadonlyMap<string, string> {
    return this._sourceMap;
  }

  get downloadDir(): string | undefined {
    return this._downloadDir;
  }

  get iamRole(): string | undefined {
    return this._iamRole;
  }

  get iamRoleSessionName(): string | undefined {
    return this._iamRoleSessionName;
  }

  get strictInclude(): boolean {
    return this._strictInclude;
  }

  get terragruntMajorVersion(): number {
    return this._terragruntMajorVersion;
  }

  // ============ Terragrunt-Specific Mutators ============

  setTerragruntConfig(configPath: string | undefined): this {
    this._terragruntConfig = configPath;
    return this;
  }

  setTerragruntWorkingDir(directory: string | undefined): this {
    this._terragruntWorkingDir = directory;
    return this;
  }

  setRunAll(enabled: boolean): this {
    this._runAll = enabled;
    return this;
  }

  setNoAutoInit(enabled: boolean): this {
    this._noAutoInit = enabled;
    return this;
  }

  setNoAutoRetry(enabled: boolean): this {
    this._noAutoRetry = enabled;
    return this;
  }

  setNonInteractive(enabled: boolean): this {
    this._nonInteractive = enabled;
    return this;
  }

  setTerragruntParallelism(level: number | undefined): this {
    this._terragruntParallelism = level;
    return this;
  }

  addIncludeDir(directory: string): this {
    if (!this._includeDirs.includes(directory)) {
      this._includeDirs.push(directory);
    }
    return this;
  }

  removeIncludeDir(directory: string): this {
    const index = this._includeDirs.indexOf(directory);
    if (index !== -1) {
      this._includeDirs.splice(index, 1);
    }
    return this;
  }

  clearIncludeDirs(): this {
    this._includeDirs.length = 0;
    return this;
  }

  addExcludeDir(directory: string): this {
    if (!this._excludeDirs.includes(directory)) {
      this._excludeDirs.push(directory);
    }
    return this;
  }

  removeExcludeDir(directory: string): this {
    const index = this._excludeDirs.indexOf(directory);
    if (index !== -1) {
      this._excludeDirs.splice(index, 1);
    }
    return this;
  }

  clearExcludeDirs(): this {
    this._excludeDirs.length = 0;
    return this;
  }

  setIgnoreDependencyErrors(enabled: boolean): this {
    this._ignoreDependencyErrors = enabled;
    return this;
  }

  setIgnoreExternalDependencies(enabled: boolean): this {
    this._ignoreExternalDependencies = enabled;
    return this;
  }

  setIncludeExternalDependencies(enabled: boolean): this {
    this._includeExternalDependencies = enabled;
    return this;
  }

  setTerragruntSource(source: string | undefined): this {
    this._terragruntSource = source;
    return this;
  }

  addSourceMap(originalSource: string, newSource: string): this {
    this._sourceMap.set(originalSource, newSource);
    return this;
  }

  removeSourceMap(originalSource: string): this {
    this._sourceMap.delete(originalSource);
    return this;
  }

  clearSourceMap(): this {
    this._sourceMap.clear();
    return this;
  }

  setDownloadDir(directory: string | undefined): this {
    this._downloadDir = directory;
    return this;
  }

  setIamRole(role: string | undefined): this {
    this._iamRole = role;
    return this;
  }

  setIamRoleSessionName(sessionName: string | undefined): this {
    this._iamRoleSessionName = sessionName;
    return this;
  }

  setStrictInclude(enabled: boolean): this {
    this._strictInclude = enabled;
    return this;
  }

  setTerragruntMajorVersion(version: number): this {
    this._terragruntMajorVersion = version;
    return this;
  }

  // ============ Factory Method Implementations ============

  protected createArgumentBuilder(): TerragruntArgumentBuilder {
    return new TerragruntArgumentBuilder(this);
  }

  protected createStringFormatter(): TerragruntStringFormatter {
    return new TerragruntStringFormatter(this);
  }

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
    this._terragruntMajorVersion = 0;
  }

  protected cloneSpecific(target: this): void {
    const t = target as TerragruntService;
    t.setTerragruntConfig(this._terragruntConfig);
    t.setTerragruntWorkingDir(this._terragruntWorkingDir);
    t.setRunAll(this._runAll);
    t.setNoAutoInit(this._noAutoInit);
    t.setNoAutoRetry(this._noAutoRetry);
    t.setNonInteractive(this._nonInteractive);
    t.setTerragruntParallelism(this._terragruntParallelism);

    for (const dir of this._includeDirs) {
      t.addIncludeDir(dir);
    }

    for (const dir of this._excludeDirs) {
      t.addExcludeDir(dir);
    }

    t.setIgnoreDependencyErrors(this._ignoreDependencyErrors);
    t.setIgnoreExternalDependencies(this._ignoreExternalDependencies);
    t.setIncludeExternalDependencies(this._includeExternalDependencies);
    t.setTerragruntSource(this._terragruntSource);

    for (const [original, newSource] of this._sourceMap.entries()) {
      t.addSourceMap(original, newSource);
    }

    t.setDownloadDir(this._downloadDir);
    t.setIamRole(this._iamRole);
    t.setIamRoleSessionName(this._iamRoleSessionName);
    t.setStrictInclude(this._strictInclude);
    t.setTerragruntMajorVersion(this._terragruntMajorVersion);
  }

  protected createEmptyClone(): this {
    return new TerragruntService(this.command, this.workingDirectory) as this;
  }

  // ============ Clone Override for Return Type ============

  override clone(): ITerragruntService {
    return super.clone() as ITerragruntService;
  }
}
