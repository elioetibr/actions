import { ITerraformService, TerraformCommand } from '../interfaces';
import { TerraformArgumentBuilder } from './TerraformArgumentBuilder';
import { TerraformStringFormatter } from './TerraformStringFormatter';

/**
 * Main service implementation for Terraform operations
 * Implements ITerraformService with fluent configuration methods
 */
export class TerraformService implements ITerraformService {
  // Core configuration
  private _command: TerraformCommand;
  private _workingDirectory: string;
  private readonly _executor: string = 'terraform';

  // Environment and variables
  private readonly _environment: Map<string, string> = new Map();
  private readonly _variables: Map<string, string> = new Map();
  private readonly _varFiles: string[] = [];
  private readonly _backendConfig: Map<string, string> = new Map();
  private readonly _targets: string[] = [];

  // Flags
  private _autoApprove: boolean = false;
  private _dryRun: boolean = false;
  private _noColor: boolean = false;
  private _compactWarnings: boolean = false;
  private _refresh: boolean = true;
  private _reconfigure: boolean = false;
  private _migrateState: boolean = false;

  // Optional values
  private _planFile: string | undefined;
  private _outFile: string | undefined;
  private _parallelism: number | undefined;
  private _lockTimeout: string | undefined;

  // Internal services
  private readonly argumentBuilder: TerraformArgumentBuilder;
  private readonly stringFormatter: TerraformStringFormatter;

  constructor(command: TerraformCommand, workingDirectory: string = '.') {
    this._command = command;
    this._workingDirectory = workingDirectory;
    this.argumentBuilder = new TerraformArgumentBuilder(this);
    this.stringFormatter = new TerraformStringFormatter(this);
  }

  // ============ ITerraformProvider Implementation (Read-only) ============

  get command(): TerraformCommand {
    return this._command;
  }

  get executor(): string {
    return this._executor;
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

  // ============ IStringListProvider Implementation ============

  get useStringList(): boolean {
    return true;
  }

  get stringList(): string[] {
    return this.stringFormatter.toStringList();
  }

  // ============ ITerraformService Implementation (Mutators) ============

  setCommand(command: TerraformCommand): this {
    this._command = command;
    return this;
  }

  setWorkingDirectory(directory: string): this {
    this._workingDirectory = directory;
    return this;
  }

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
    return this;
  }

  clone(): ITerraformService {
    const cloned = new TerraformService(this._command, this._workingDirectory);

    // Copy environment
    for (const [key, value] of this._environment.entries()) {
      cloned.addEnvironmentVariable(key, value);
    }

    // Copy variables
    for (const [key, value] of this._variables.entries()) {
      cloned.addVariable(key, value);
    }

    // Copy var files
    for (const varFile of this._varFiles) {
      cloned.addVarFile(varFile);
    }

    // Copy backend config
    for (const [key, value] of this._backendConfig.entries()) {
      cloned.addBackendConfig(key, value);
    }

    // Copy targets
    for (const target of this._targets) {
      cloned.addTarget(target);
    }

    // Copy flags
    cloned.setAutoApprove(this._autoApprove);
    cloned.setDryRun(this._dryRun);
    cloned.setNoColor(this._noColor);
    cloned.setCompactWarnings(this._compactWarnings);
    cloned.setRefresh(this._refresh);
    cloned.setReconfigure(this._reconfigure);
    cloned.setMigrateState(this._migrateState);

    // Copy optional values
    cloned.setPlanFile(this._planFile);
    cloned.setOutFile(this._outFile);
    cloned.setParallelism(this._parallelism);
    cloned.setLockTimeout(this._lockTimeout);

    return cloned;
  }
}
