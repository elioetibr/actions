import { ITerragruntService, TerragruntCommand } from '../interfaces';
import { TerragruntArgumentBuilder } from './TerragruntArgumentBuilder';
import { TerragruntStringFormatter } from './TerragruntStringFormatter';

/**
 * Main service implementation for Terragrunt operations
 * Implements ITerragruntService with fluent configuration methods
 */
export class TerragruntService implements ITerragruntService {
  // Core configuration
  private _command: TerragruntCommand;
  private _workingDirectory: string;
  readonly executor: 'terragrunt' = 'terragrunt';

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

  // Internal services
  private readonly argumentBuilder: TerragruntArgumentBuilder;
  private readonly stringFormatter: TerragruntStringFormatter;

  constructor(command: TerragruntCommand, workingDirectory: string = '.') {
    this._command = command;
    this._workingDirectory = workingDirectory;
    this.argumentBuilder = new TerragruntArgumentBuilder(this);
    this.stringFormatter = new TerragruntStringFormatter(this);
  }

  // ============ ITerragruntProvider Implementation (Read-only) ============

  get command(): TerragruntCommand {
    return this._command;
  }

  get workingDirectory(): string {
    return this._workingDirectory;
  }

  get environment(): ReadonlyMap<string, string> {
    return this._environment;
  }

  get variables(): ReadonlyMap<string, string> {
    return this._variables;
  }

  get varFiles(): readonly string[] {
    return [...this._varFiles];
  }

  get backendConfig(): ReadonlyMap<string, string> {
    return this._backendConfig;
  }

  get targets(): readonly string[] {
    return [...this._targets];
  }

  get autoApprove(): boolean {
    return this._autoApprove;
  }

  get dryRun(): boolean {
    return this._dryRun;
  }

  get planFile(): string | undefined {
    return this._planFile;
  }

  get outFile(): string | undefined {
    return this._outFile;
  }

  get noColor(): boolean {
    return this._noColor;
  }

  get compactWarnings(): boolean {
    return this._compactWarnings;
  }

  get parallelism(): number | undefined {
    return this._parallelism;
  }

  get lockTimeout(): string | undefined {
    return this._lockTimeout;
  }

  get refresh(): boolean {
    return this._refresh;
  }

  get reconfigure(): boolean {
    return this._reconfigure;
  }

  get migrateState(): boolean {
    return this._migrateState;
  }

  // Terragrunt-specific read-only properties

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

  // ============ IStringListProvider Implementation ============

  get useStringList(): boolean {
    return true;
  }

  get stringList(): string[] {
    return this.stringFormatter.toStringList();
  }

  // ============ ITerragruntService Implementation (Mutators) ============

  setCommand(command: TerragruntCommand): this {
    this._command = command;
    return this;
  }

  setWorkingDirectory(directory: string): this {
    this._workingDirectory = directory;
    return this;
  }

  // Terraform configuration methods

  addEnvironmentVariable(key: string, value: string): this {
    this._environment.set(key, value);
    return this;
  }

  removeEnvironmentVariable(key: string): this {
    this._environment.delete(key);
    return this;
  }

  clearEnvironmentVariables(): this {
    this._environment.clear();
    return this;
  }

  addVariable(key: string, value: string): this {
    this._variables.set(key, value);
    return this;
  }

  removeVariable(key: string): this {
    this._variables.delete(key);
    return this;
  }

  clearVariables(): this {
    this._variables.clear();
    return this;
  }

  addVarFile(filePath: string): this {
    if (!this._varFiles.includes(filePath)) {
      this._varFiles.push(filePath);
    }
    return this;
  }

  removeVarFile(filePath: string): this {
    const index = this._varFiles.indexOf(filePath);
    if (index !== -1) {
      this._varFiles.splice(index, 1);
    }
    return this;
  }

  clearVarFiles(): this {
    this._varFiles.length = 0;
    return this;
  }

  addBackendConfig(key: string, value: string): this {
    this._backendConfig.set(key, value);
    return this;
  }

  removeBackendConfig(key: string): this {
    this._backendConfig.delete(key);
    return this;
  }

  clearBackendConfig(): this {
    this._backendConfig.clear();
    return this;
  }

  addTarget(target: string): this {
    if (!this._targets.includes(target)) {
      this._targets.push(target);
    }
    return this;
  }

  removeTarget(target: string): this {
    const index = this._targets.indexOf(target);
    if (index !== -1) {
      this._targets.splice(index, 1);
    }
    return this;
  }

  clearTargets(): this {
    this._targets.length = 0;
    return this;
  }

  setAutoApprove(enabled: boolean): this {
    this._autoApprove = enabled;
    return this;
  }

  setDryRun(enabled: boolean): this {
    this._dryRun = enabled;
    return this;
  }

  setPlanFile(filePath: string | undefined): this {
    this._planFile = filePath;
    return this;
  }

  setOutFile(filePath: string | undefined): this {
    this._outFile = filePath;
    return this;
  }

  setNoColor(enabled: boolean): this {
    this._noColor = enabled;
    return this;
  }

  setCompactWarnings(enabled: boolean): this {
    this._compactWarnings = enabled;
    return this;
  }

  setParallelism(level: number | undefined): this {
    this._parallelism = level;
    return this;
  }

  setLockTimeout(timeout: string | undefined): this {
    this._lockTimeout = timeout;
    return this;
  }

  setRefresh(enabled: boolean): this {
    this._refresh = enabled;
    return this;
  }

  setReconfigure(enabled: boolean): this {
    this._reconfigure = enabled;
    return this;
  }

  setMigrateState(enabled: boolean): this {
    this._migrateState = enabled;
    return this;
  }

  // Terragrunt-specific methods

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

  // ============ Command Generation Methods ============

  toCommandArgs(): string[] {
    return this.argumentBuilder.toCommandArgs();
  }

  buildCommand(): string[] {
    return this.argumentBuilder.buildCommand();
  }

  toString(): string {
    return this.stringFormatter.toString();
  }

  toStringMultiLineCommand(): string {
    return this.stringFormatter.toStringMultiLineCommand();
  }

  // ============ Utility Methods ============

  reset(): this {
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

  clone(): ITerragruntService {
    const cloned = new TerragruntService(this._command, this._workingDirectory);

    // Copy terraform configuration
    for (const [key, value] of this._environment.entries()) {
      cloned.addEnvironmentVariable(key, value);
    }

    for (const [key, value] of this._variables.entries()) {
      cloned.addVariable(key, value);
    }

    for (const varFile of this._varFiles) {
      cloned.addVarFile(varFile);
    }

    for (const [key, value] of this._backendConfig.entries()) {
      cloned.addBackendConfig(key, value);
    }

    for (const target of this._targets) {
      cloned.addTarget(target);
    }

    cloned.setAutoApprove(this._autoApprove);
    cloned.setDryRun(this._dryRun);
    cloned.setNoColor(this._noColor);
    cloned.setCompactWarnings(this._compactWarnings);
    cloned.setRefresh(this._refresh);
    cloned.setReconfigure(this._reconfigure);
    cloned.setMigrateState(this._migrateState);
    cloned.setPlanFile(this._planFile);
    cloned.setOutFile(this._outFile);
    cloned.setParallelism(this._parallelism);
    cloned.setLockTimeout(this._lockTimeout);

    // Copy terragrunt configuration
    cloned.setTerragruntConfig(this._terragruntConfig);
    cloned.setTerragruntWorkingDir(this._terragruntWorkingDir);
    cloned.setRunAll(this._runAll);
    cloned.setNoAutoInit(this._noAutoInit);
    cloned.setNoAutoRetry(this._noAutoRetry);
    cloned.setNonInteractive(this._nonInteractive);
    cloned.setTerragruntParallelism(this._terragruntParallelism);

    for (const dir of this._includeDirs) {
      cloned.addIncludeDir(dir);
    }

    for (const dir of this._excludeDirs) {
      cloned.addExcludeDir(dir);
    }

    cloned.setIgnoreDependencyErrors(this._ignoreDependencyErrors);
    cloned.setIgnoreExternalDependencies(this._ignoreExternalDependencies);
    cloned.setIncludeExternalDependencies(this._includeExternalDependencies);
    cloned.setTerragruntSource(this._terragruntSource);

    for (const [original, newSource] of this._sourceMap.entries()) {
      cloned.addSourceMap(original, newSource);
    }

    cloned.setDownloadDir(this._downloadDir);
    cloned.setIamRole(this._iamRole);
    cloned.setIamRoleSessionName(this._iamRoleSessionName);
    cloned.setStrictInclude(this._strictInclude);

    return cloned;
  }
}
