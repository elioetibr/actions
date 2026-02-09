import { addUnique, ValidationUtils } from '../../../libs/utils';
import { IIacBuilder, IIacService } from './interfaces';

/**
 * Abstract base builder for IaC service instances
 * Contains all shared builder state (17 fields) and 24 shared builder methods
 * Subclasses implement build() and tool-specific builder methods
 */
export abstract class BaseIacBuilder<
  TCommand extends string,
  TService extends IIacService,
> implements IIacBuilder<TService> {
  // Core configuration
  protected _command: TCommand | undefined;
  protected _workingDirectory: string = '.';

  // Environment and variables
  protected readonly _environment: Map<string, string> = new Map();
  protected readonly _variables: Map<string, string> = new Map();
  protected readonly _varFiles: string[] = [];
  protected readonly _backendConfig: Map<string, string> = new Map();
  protected readonly _targets: string[] = [];

  // Flags
  protected _autoApprove: boolean = false;
  protected _dryRun: boolean = false;
  protected _noColor: boolean = false;
  protected _compactWarnings: boolean = false;
  protected _refresh: boolean = true;
  protected _reconfigure: boolean = false;
  protected _migrateState: boolean = false;

  // Optional values
  protected _planFile: string | undefined;
  protected _outFile: string | undefined;
  protected _parallelism: number | undefined;
  protected _lockTimeout: string | undefined;

  // ============ Abstract Methods ============

  abstract build(): TService;
  protected abstract resetSpecific(): void;

  // ============ Shared Builder Methods ============

  withCommand(command: TCommand): this {
    this.validateCommand(command);
    this._command = command;
    return this;
  }

  withWorkingDirectory(directory: string): this {
    ValidationUtils.validateStringInput(directory, 'workingDirectory');
    this._workingDirectory = directory;
    return this;
  }

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
    addUnique(this._varFiles, filePath);
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
    addUnique(this._targets, target);
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

  reset(): this {
    this._command = undefined;
    this._workingDirectory = '.';
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
    this.resetSpecific();
    return this;
  }

  // ============ Protected Helpers ============

  /**
   * Transfer all shared builder state to a service instance
   */
  protected transferSharedState(service: IIacService): void {
    // Transfer environment variables
    for (const [key, value] of this._environment.entries()) {
      service.addEnvironmentVariable(key, value);
    }

    // Transfer variables
    for (const [key, value] of this._variables.entries()) {
      service.addVariable(key, value);
    }

    // Transfer var files
    for (const varFile of this._varFiles) {
      service.addVarFile(varFile);
    }

    // Transfer backend config
    for (const [key, value] of this._backendConfig.entries()) {
      service.addBackendConfig(key, value);
    }

    // Transfer targets
    for (const target of this._targets) {
      service.addTarget(target);
    }

    // Transfer flags
    service.setAutoApprove(this._autoApprove);
    service.setDryRun(this._dryRun);
    service.setNoColor(this._noColor);
    service.setCompactWarnings(this._compactWarnings);
    service.setRefresh(this._refresh);
    service.setReconfigure(this._reconfigure);
    service.setMigrateState(this._migrateState);

    // Transfer optional values
    service.setPlanFile(this._planFile);
    service.setOutFile(this._outFile);
    service.setParallelism(this._parallelism);
    service.setLockTimeout(this._lockTimeout);
  }

  /**
   * Validate that a command is valid
   * Subclasses should override this to check against their command list
   */
  protected abstract validateCommand(command: string): void;
}
