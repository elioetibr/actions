import { ValidationUtils } from '../../../libs/utils';
import {
  ITerraformBuilder,
  ITerraformService,
  TERRAFORM_COMMANDS,
  TerraformCommand,
} from './interfaces';
import { TerraformService } from './services';

/**
 * Fluent builder for constructing Terraform service instances
 * Provides a type-safe API for configuring Terraform commands
 */
export class TerraformBuilder implements ITerraformBuilder {
  // Core configuration
  private _command: TerraformCommand | undefined;
  private _workingDirectory: string = '.';

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

  /**
   * Private constructor - use static factory methods
   */
  private constructor() {}

  // ============ Static Factory Methods ============

  /**
   * Create a new TerraformBuilder instance
   * @param command - Optional initial command
   */
  static create(command?: TerraformCommand): TerraformBuilder {
    const builder = new TerraformBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }

  /**
   * Create a builder for terraform init
   */
  static forInit(): TerraformBuilder {
    return TerraformBuilder.create('init');
  }

  /**
   * Create a builder for terraform validate
   */
  static forValidate(): TerraformBuilder {
    return TerraformBuilder.create('validate');
  }

  /**
   * Create a builder for terraform fmt
   */
  static forFmt(): TerraformBuilder {
    return TerraformBuilder.create('fmt');
  }

  /**
   * Create a builder for terraform plan
   */
  static forPlan(): TerraformBuilder {
    return TerraformBuilder.create('plan');
  }

  /**
   * Create a builder for terraform apply
   */
  static forApply(): TerraformBuilder {
    return TerraformBuilder.create('apply');
  }

  /**
   * Create a builder for terraform destroy
   */
  static forDestroy(): TerraformBuilder {
    return TerraformBuilder.create('destroy');
  }

  /**
   * Create a builder for terraform output
   */
  static forOutput(): TerraformBuilder {
    return TerraformBuilder.create('output');
  }

  /**
   * Create a builder for terraform show
   */
  static forShow(): TerraformBuilder {
    return TerraformBuilder.create('show');
  }

  // ============ ITerraformBuilder Implementation ============

  withCommand(command: TerraformCommand): this {
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
    return this;
  }

  build(): ITerraformService {
    // Validate required fields
    if (!this._command) {
      throw new Error('Terraform command is required. Use withCommand() or a static factory method.');
    }

    // Create service instance
    const service = new TerraformService(this._command, this._workingDirectory);

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

    return service;
  }

  // ============ Private Helper Methods ============

  /**
   * Validate that a command is a valid Terraform command
   */
  private validateCommand(command: string): void {
    if (!TERRAFORM_COMMANDS.includes(command as TerraformCommand)) {
      throw new Error(
        `Invalid Terraform command: ${command}. Valid commands are: ${TERRAFORM_COMMANDS.join(', ')}`
      );
    }
  }
}
