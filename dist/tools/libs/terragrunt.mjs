import { R as RunnerBase } from './tools.mjs';
import { V as ValidationUtils, a as parseJsonObject, p as parseCommaSeparated } from './docker-buildx-images.mjs';
import './agents.mjs';
import { B as BaseIacArgumentBuilder, T as TERRAFORM_COMMANDS, a as BaseIacStringFormatter, b as BaseIacService, c as BaseIacBuilder } from './terraform.mjs';

const TERRAGRUNT_COMMANDS = [
  // Terraform commands
  "init",
  "validate",
  "fmt",
  "plan",
  "apply",
  "destroy",
  "output",
  "show",
  "state",
  "import",
  "refresh",
  "taint",
  "untaint",
  "workspace",
  // Terragrunt-specific commands
  "run-all",
  "graph-dependencies",
  "hclfmt",
  "aws-provider-patch",
  "render-json",
  "output-module-groups",
  "validate-inputs"
];

class TerragruntArgumentBuilder extends BaseIacArgumentBuilder {
  provider;
  constructor(provider) {
    super(provider);
    this.provider = provider;
  }
  /**
   * Generate command arguments based on provider configuration
   * @returns Array of command-line arguments
   */
  toCommandArgs() {
    const args = [];
    this.addTerragruntGlobalArgs(args);
    this.addTerraformArgs(args);
    return args;
  }
  /**
   * Generate full command array including executor and command
   * @returns Full command array ready for execution
   */
  buildCommand() {
    const command = this.provider.command;
    if (this.provider.runAll && this.isTerraformCommand(command)) {
      return [
        this.provider.executor,
        "run-all",
        command,
        ...this.toCommandArgs()
      ];
    }
    return [this.provider.executor, command, ...this.toCommandArgs()];
  }
  /**
   * Add terragrunt-specific global arguments
   */
  addTerragruntGlobalArgs(args) {
    if (this.provider.terragruntConfig) {
      args.push("--terragrunt-config", this.provider.terragruntConfig);
    }
    if (this.provider.terragruntWorkingDir) {
      args.push("--terragrunt-working-dir", this.provider.terragruntWorkingDir);
    }
    if (this.provider.noAutoInit) {
      args.push("--terragrunt-no-auto-init");
    }
    if (this.provider.noAutoRetry) {
      args.push("--terragrunt-no-auto-retry");
    }
    if (this.provider.nonInteractive) {
      args.push("--terragrunt-non-interactive");
    }
    if (this.provider.runAll && this.provider.terragruntParallelism !== void 0) {
      args.push(
        "--terragrunt-parallelism",
        String(this.provider.terragruntParallelism)
      );
    }
    for (const dir of this.provider.includeDirs) {
      args.push("--terragrunt-include-dir", dir);
    }
    for (const dir of this.provider.excludeDirs) {
      args.push("--terragrunt-exclude-dir", dir);
    }
    if (this.provider.ignoreDependencyErrors) {
      args.push("--terragrunt-ignore-dependency-errors");
    }
    if (this.provider.ignoreExternalDependencies) {
      args.push("--terragrunt-ignore-external-dependencies");
    }
    if (this.provider.includeExternalDependencies) {
      args.push("--terragrunt-include-external-dependencies");
    }
    if (this.provider.terragruntSource) {
      args.push("--terragrunt-source", this.provider.terragruntSource);
    }
    for (const [original, newSource] of this.provider.sourceMap.entries()) {
      args.push("--terragrunt-source-map", `${original}=${newSource}`);
    }
    if (this.provider.downloadDir) {
      args.push("--terragrunt-download-dir", this.provider.downloadDir);
    }
    if (this.provider.iamRole) {
      args.push("--terragrunt-iam-role", this.provider.iamRole);
    }
    if (this.provider.iamRoleSessionName) {
      args.push(
        "--terragrunt-iam-role-session-name",
        this.provider.iamRoleSessionName
      );
    }
    if (this.provider.strictInclude) {
      args.push("--terragrunt-strict-include");
    }
  }
  /**
   * Add terraform-related arguments
   */
  addTerraformArgs(args) {
    const command = this.provider.command;
    if (!this.isTerraformCommand(command)) {
      return;
    }
    this.addAllSharedArguments(args, command);
  }
  /**
   * Check if command is a terraform command
   */
  isTerraformCommand(command) {
    return TERRAFORM_COMMANDS.includes(command);
  }
}

class TerragruntStringFormatter extends BaseIacStringFormatter {
  constructor(provider) {
    super(new TerragruntArgumentBuilder(provider));
  }
}

class TerragruntService extends BaseIacService {
  // Terragrunt-specific configuration
  _terragruntConfig;
  _terragruntWorkingDir;
  _runAll = false;
  _noAutoInit = false;
  _noAutoRetry = false;
  _nonInteractive = false;
  _terragruntParallelism;
  _includeDirs = [];
  _excludeDirs = [];
  _ignoreDependencyErrors = false;
  _ignoreExternalDependencies = false;
  _includeExternalDependencies = false;
  _terragruntSource;
  _sourceMap = /* @__PURE__ */ new Map();
  _downloadDir;
  _iamRole;
  _iamRoleSessionName;
  _strictInclude = false;
  constructor(command, workingDirectory = ".") {
    super(command, "terragrunt", workingDirectory);
  }
  // ============ Type-Narrowed Accessors ============
  get executor() {
    return "terragrunt";
  }
  get command() {
    return super.command;
  }
  setCommand(command) {
    return super.setCommand(command);
  }
  // ============ Terragrunt-Specific Read-Only Properties ============
  get terragruntConfig() {
    return this._terragruntConfig;
  }
  get terragruntWorkingDir() {
    return this._terragruntWorkingDir;
  }
  get runAll() {
    return this._runAll;
  }
  get noAutoInit() {
    return this._noAutoInit;
  }
  get noAutoRetry() {
    return this._noAutoRetry;
  }
  get nonInteractive() {
    return this._nonInteractive;
  }
  get terragruntParallelism() {
    return this._terragruntParallelism;
  }
  get includeDirs() {
    return [...this._includeDirs];
  }
  get excludeDirs() {
    return [...this._excludeDirs];
  }
  get ignoreDependencyErrors() {
    return this._ignoreDependencyErrors;
  }
  get ignoreExternalDependencies() {
    return this._ignoreExternalDependencies;
  }
  get includeExternalDependencies() {
    return this._includeExternalDependencies;
  }
  get terragruntSource() {
    return this._terragruntSource;
  }
  get sourceMap() {
    return this._sourceMap;
  }
  get downloadDir() {
    return this._downloadDir;
  }
  get iamRole() {
    return this._iamRole;
  }
  get iamRoleSessionName() {
    return this._iamRoleSessionName;
  }
  get strictInclude() {
    return this._strictInclude;
  }
  // ============ Terragrunt-Specific Mutators ============
  setTerragruntConfig(configPath) {
    this._terragruntConfig = configPath;
    return this;
  }
  setTerragruntWorkingDir(directory) {
    this._terragruntWorkingDir = directory;
    return this;
  }
  setRunAll(enabled) {
    this._runAll = enabled;
    return this;
  }
  setNoAutoInit(enabled) {
    this._noAutoInit = enabled;
    return this;
  }
  setNoAutoRetry(enabled) {
    this._noAutoRetry = enabled;
    return this;
  }
  setNonInteractive(enabled) {
    this._nonInteractive = enabled;
    return this;
  }
  setTerragruntParallelism(level) {
    this._terragruntParallelism = level;
    return this;
  }
  addIncludeDir(directory) {
    if (!this._includeDirs.includes(directory)) {
      this._includeDirs.push(directory);
    }
    return this;
  }
  removeIncludeDir(directory) {
    const index = this._includeDirs.indexOf(directory);
    if (index !== -1) {
      this._includeDirs.splice(index, 1);
    }
    return this;
  }
  clearIncludeDirs() {
    this._includeDirs.length = 0;
    return this;
  }
  addExcludeDir(directory) {
    if (!this._excludeDirs.includes(directory)) {
      this._excludeDirs.push(directory);
    }
    return this;
  }
  removeExcludeDir(directory) {
    const index = this._excludeDirs.indexOf(directory);
    if (index !== -1) {
      this._excludeDirs.splice(index, 1);
    }
    return this;
  }
  clearExcludeDirs() {
    this._excludeDirs.length = 0;
    return this;
  }
  setIgnoreDependencyErrors(enabled) {
    this._ignoreDependencyErrors = enabled;
    return this;
  }
  setIgnoreExternalDependencies(enabled) {
    this._ignoreExternalDependencies = enabled;
    return this;
  }
  setIncludeExternalDependencies(enabled) {
    this._includeExternalDependencies = enabled;
    return this;
  }
  setTerragruntSource(source) {
    this._terragruntSource = source;
    return this;
  }
  addSourceMap(originalSource, newSource) {
    this._sourceMap.set(originalSource, newSource);
    return this;
  }
  removeSourceMap(originalSource) {
    this._sourceMap.delete(originalSource);
    return this;
  }
  clearSourceMap() {
    this._sourceMap.clear();
    return this;
  }
  setDownloadDir(directory) {
    this._downloadDir = directory;
    return this;
  }
  setIamRole(role) {
    this._iamRole = role;
    return this;
  }
  setIamRoleSessionName(sessionName) {
    this._iamRoleSessionName = sessionName;
    return this;
  }
  setStrictInclude(enabled) {
    this._strictInclude = enabled;
    return this;
  }
  // ============ Factory Method Implementations ============
  createArgumentBuilder() {
    return new TerragruntArgumentBuilder(this);
  }
  createStringFormatter() {
    return new TerragruntStringFormatter(this);
  }
  resetSpecific() {
    this._terragruntConfig = void 0;
    this._terragruntWorkingDir = void 0;
    this._runAll = false;
    this._noAutoInit = false;
    this._noAutoRetry = false;
    this._nonInteractive = false;
    this._terragruntParallelism = void 0;
    this._includeDirs.length = 0;
    this._excludeDirs.length = 0;
    this._ignoreDependencyErrors = false;
    this._ignoreExternalDependencies = false;
    this._includeExternalDependencies = false;
    this._terragruntSource = void 0;
    this._sourceMap.clear();
    this._downloadDir = void 0;
    this._iamRole = void 0;
    this._iamRoleSessionName = void 0;
    this._strictInclude = false;
  }
  cloneSpecific(target) {
    const t = target;
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
  }
  createEmptyClone() {
    return new TerragruntService(this.command, this.workingDirectory);
  }
  // ============ Clone Override for Return Type ============
  clone() {
    return super.clone();
  }
}

class TerragruntBuilder extends BaseIacBuilder {
  // Terragrunt-specific configuration
  _terragruntConfig;
  _terragruntWorkingDir;
  _runAll = false;
  _noAutoInit = false;
  _noAutoRetry = false;
  _nonInteractive = false;
  _terragruntParallelism;
  _includeDirs = [];
  _excludeDirs = [];
  _ignoreDependencyErrors = false;
  _ignoreExternalDependencies = false;
  _includeExternalDependencies = false;
  _terragruntSource;
  _sourceMap = /* @__PURE__ */ new Map();
  _downloadDir;
  _iamRole;
  _iamRoleSessionName;
  _strictInclude = false;
  /**
   * Private constructor - use static factory methods
   */
  constructor() {
    super();
  }
  // ============ Static Factory Methods ============
  static create(command) {
    const builder = new TerragruntBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }
  static forInit() {
    return TerragruntBuilder.create("init");
  }
  static forValidate() {
    return TerragruntBuilder.create("validate");
  }
  static forFmt() {
    return TerragruntBuilder.create("fmt");
  }
  static forHclFmt() {
    return TerragruntBuilder.create("hclfmt");
  }
  static forPlan() {
    return TerragruntBuilder.create("plan");
  }
  static forApply() {
    return TerragruntBuilder.create("apply");
  }
  static forDestroy() {
    return TerragruntBuilder.create("destroy");
  }
  static forOutput() {
    return TerragruntBuilder.create("output");
  }
  static forRunAllPlan() {
    return TerragruntBuilder.create("plan").withRunAll();
  }
  static forRunAllApply() {
    return TerragruntBuilder.create("apply").withRunAll();
  }
  static forRunAllDestroy() {
    return TerragruntBuilder.create("destroy").withRunAll();
  }
  static forGraphDependencies() {
    return TerragruntBuilder.create("graph-dependencies");
  }
  static forValidateInputs() {
    return TerragruntBuilder.create("validate-inputs");
  }
  // ============ Terragrunt-Specific Builder Methods ============
  withTerragruntConfig(configPath) {
    ValidationUtils.validateStringInput(configPath, "terragrunt config path");
    this._terragruntConfig = configPath;
    return this;
  }
  withTerragruntWorkingDir(directory) {
    ValidationUtils.validateStringInput(directory, "terragrunt working directory");
    this._terragruntWorkingDir = directory;
    return this;
  }
  withRunAll() {
    this._runAll = true;
    return this;
  }
  withNoAutoInit() {
    this._noAutoInit = true;
    return this;
  }
  withNoAutoRetry() {
    this._noAutoRetry = true;
    return this;
  }
  withNonInteractive() {
    this._nonInteractive = true;
    return this;
  }
  withTerragruntParallelism(level) {
    if (level < 1) {
      throw new Error("Terragrunt parallelism level must be at least 1");
    }
    this._terragruntParallelism = level;
    return this;
  }
  withIncludeDir(directory) {
    ValidationUtils.validateStringInput(directory, "include directory");
    if (!this._includeDirs.includes(directory)) {
      this._includeDirs.push(directory);
    }
    return this;
  }
  withIncludeDirs(directories) {
    for (const dir of directories) {
      this.withIncludeDir(dir);
    }
    return this;
  }
  withExcludeDir(directory) {
    ValidationUtils.validateStringInput(directory, "exclude directory");
    if (!this._excludeDirs.includes(directory)) {
      this._excludeDirs.push(directory);
    }
    return this;
  }
  withExcludeDirs(directories) {
    for (const dir of directories) {
      this.withExcludeDir(dir);
    }
    return this;
  }
  withIgnoreDependencyErrors() {
    this._ignoreDependencyErrors = true;
    return this;
  }
  withIgnoreExternalDependencies() {
    this._ignoreExternalDependencies = true;
    return this;
  }
  withIncludeExternalDependencies() {
    this._includeExternalDependencies = true;
    return this;
  }
  withTerragruntSource(source) {
    ValidationUtils.validateStringInput(source, "terragrunt source");
    this._terragruntSource = source;
    return this;
  }
  withSourceMap(originalSource, newSource) {
    ValidationUtils.validateStringInput(originalSource, "original source");
    ValidationUtils.validateStringInput(newSource, "new source");
    this._sourceMap.set(originalSource, newSource);
    return this;
  }
  withSourceMaps(sourceMap) {
    for (const [original, newSource] of Object.entries(sourceMap)) {
      this.withSourceMap(original, newSource);
    }
    return this;
  }
  withDownloadDir(directory) {
    ValidationUtils.validateStringInput(directory, "download directory");
    this._downloadDir = directory;
    return this;
  }
  withIamRole(role) {
    ValidationUtils.validateStringInput(role, "IAM role");
    this._iamRole = role;
    return this;
  }
  withIamRoleAndSession(role, sessionName) {
    this.withIamRole(role);
    ValidationUtils.validateStringInput(sessionName, "IAM role session name");
    this._iamRoleSessionName = sessionName;
    return this;
  }
  withStrictInclude() {
    this._strictInclude = true;
    return this;
  }
  // ============ Build ============
  build() {
    if (!this._command) {
      throw new Error(
        "Terragrunt command is required. Use withCommand() or a static factory method."
      );
    }
    const service = new TerragruntService(
      this._command,
      this._workingDirectory
    );
    this.transferSharedState(service);
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
  resetSpecific() {
    this._terragruntConfig = void 0;
    this._terragruntWorkingDir = void 0;
    this._runAll = false;
    this._noAutoInit = false;
    this._noAutoRetry = false;
    this._nonInteractive = false;
    this._terragruntParallelism = void 0;
    this._includeDirs.length = 0;
    this._excludeDirs.length = 0;
    this._ignoreDependencyErrors = false;
    this._ignoreExternalDependencies = false;
    this._includeExternalDependencies = false;
    this._terragruntSource = void 0;
    this._sourceMap.clear();
    this._downloadDir = void 0;
    this._iamRole = void 0;
    this._iamRoleSessionName = void 0;
    this._strictInclude = false;
  }
  validateCommand(command) {
    if (!TERRAGRUNT_COMMANDS.includes(command)) {
      throw new Error(
        `Invalid Terragrunt command: ${command}. Valid commands are: ${TERRAGRUNT_COMMANDS.join(", ")}`
      );
    }
  }
}

function getSettings(agent) {
  return {
    command: agent.getInput("command", true),
    workingDirectory: agent.getInput("working-directory") || ".",
    runAll: agent.getBooleanInput("run-all"),
    variables: parseJsonObject(agent.getInput("variables")),
    varFiles: parseCommaSeparated(agent.getInput("var-files")),
    backendConfig: parseJsonObject(agent.getInput("backend-config")),
    targets: parseCommaSeparated(agent.getInput("targets")),
    autoApprove: agent.getBooleanInput("auto-approve"),
    planFile: agent.getInput("plan-file"),
    noColor: agent.getBooleanInput("no-color"),
    compactWarnings: agent.getBooleanInput("compact-warnings"),
    parallelism: agent.getInput("parallelism"),
    lockTimeout: agent.getInput("lock-timeout"),
    refresh: agent.getInput("refresh"),
    reconfigure: agent.getBooleanInput("reconfigure"),
    migrateState: agent.getBooleanInput("migrate-state"),
    terragruntConfig: agent.getInput("terragrunt-config"),
    terragruntWorkingDir: agent.getInput("terragrunt-working-dir"),
    nonInteractive: agent.getBooleanInput("non-interactive"),
    noAutoInit: agent.getBooleanInput("no-auto-init"),
    noAutoRetry: agent.getBooleanInput("no-auto-retry"),
    terragruntParallelism: agent.getInput("terragrunt-parallelism"),
    includeDirs: parseCommaSeparated(agent.getInput("include-dirs")),
    excludeDirs: parseCommaSeparated(agent.getInput("exclude-dirs")),
    ignoreDependencyErrors: agent.getBooleanInput("ignore-dependency-errors"),
    ignoreExternalDependencies: agent.getBooleanInput("ignore-external-dependencies"),
    includeExternalDependencies: agent.getBooleanInput("include-external-dependencies"),
    terragruntSource: agent.getInput("terragrunt-source"),
    sourceMap: parseJsonObject(agent.getInput("source-map")),
    downloadDir: agent.getInput("download-dir"),
    iamRole: agent.getInput("iam-role"),
    iamRoleSessionName: agent.getInput("iam-role-session-name"),
    strictInclude: agent.getBooleanInput("strict-include"),
    dryRun: agent.getBooleanInput("dry-run")
  };
}

class TerragruntRunner extends RunnerBase {
  name = "terragrunt";
  steps = /* @__PURE__ */ new Map([
    ["execute", this.execute.bind(this)]
  ]);
  /**
   * Execute step: Build and run the Terragrunt command
   * Uses the IAgent.exec() interface for safe command execution (not child_process)
   */
  async execute(agent) {
    try {
      const settings = getSettings(agent);
      const modeLabel = settings.runAll ? "run-all " : "";
      agent.info(`Starting Terragrunt ${modeLabel}${settings.command} action...`);
      const service = this.buildService(settings);
      const commandArgs = service.buildCommand();
      const commandString = service.toString();
      agent.info(`Command: ${commandString}`);
      const baseOutputs = {
        command: settings.command,
        "command-args": JSON.stringify(commandArgs),
        "command-string": commandString
      };
      if (settings.dryRun) {
        agent.info("Dry run mode - skipping execution");
        return this.success({
          ...baseOutputs,
          "exit-code": "0",
          stdout: "",
          stderr: ""
        });
      }
      const result = await agent.exec(commandArgs[0], commandArgs.slice(1), {
        cwd: settings.workingDirectory,
        ignoreReturnCode: true
      });
      const outputs = {
        ...baseOutputs,
        "exit-code": result.exitCode.toString(),
        stdout: result.stdout,
        stderr: result.stderr
      };
      if (result.exitCode !== 0) {
        return this.failure(
          new Error(
            `Terragrunt ${modeLabel}${settings.command} failed with exit code ${result.exitCode}`
          ),
          outputs
        );
      }
      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
  /**
   * Build the Terragrunt service from settings
   */
  buildService(settings) {
    const builder = TerragruntBuilder.create(settings.command).withWorkingDirectory(
      settings.workingDirectory
    );
    if (settings.runAll) {
      builder.withRunAll();
    }
    if (Object.keys(settings.variables).length > 0) {
      builder.withVariables(settings.variables);
    }
    if (settings.varFiles.length > 0) {
      builder.withVarFiles(settings.varFiles);
    }
    if (Object.keys(settings.backendConfig).length > 0) {
      builder.withBackendConfigs(settings.backendConfig);
    }
    if (settings.targets.length > 0) {
      builder.withTargets(settings.targets);
    }
    if (settings.autoApprove) {
      builder.withAutoApprove();
    }
    if (settings.planFile) {
      if (settings.command === "apply") {
        builder.withPlanFile(settings.planFile);
      } else if (settings.command === "plan") {
        builder.withOutFile(settings.planFile);
      }
    }
    if (settings.noColor) {
      builder.withNoColor();
    }
    if (settings.compactWarnings) {
      builder.withCompactWarnings();
    }
    if (settings.parallelism) {
      builder.withParallelism(parseInt(settings.parallelism, 10));
    }
    if (settings.lockTimeout) {
      builder.withLockTimeout(settings.lockTimeout);
    }
    if (settings.refresh === "false") {
      builder.withoutRefresh();
    }
    if (settings.reconfigure) {
      builder.withReconfigure();
    }
    if (settings.migrateState) {
      builder.withMigrateState();
    }
    if (settings.terragruntConfig) {
      builder.withTerragruntConfig(settings.terragruntConfig);
    }
    if (settings.terragruntWorkingDir) {
      builder.withTerragruntWorkingDir(settings.terragruntWorkingDir);
    }
    if (settings.nonInteractive) {
      builder.withNonInteractive();
    }
    if (settings.noAutoInit) {
      builder.withNoAutoInit();
    }
    if (settings.noAutoRetry) {
      builder.withNoAutoRetry();
    }
    if (settings.terragruntParallelism) {
      builder.withTerragruntParallelism(parseInt(settings.terragruntParallelism, 10));
    }
    if (settings.includeDirs.length > 0) {
      builder.withIncludeDirs(settings.includeDirs);
    }
    if (settings.excludeDirs.length > 0) {
      builder.withExcludeDirs(settings.excludeDirs);
    }
    if (settings.ignoreDependencyErrors) {
      builder.withIgnoreDependencyErrors();
    }
    if (settings.ignoreExternalDependencies) {
      builder.withIgnoreExternalDependencies();
    }
    if (settings.includeExternalDependencies) {
      builder.withIncludeExternalDependencies();
    }
    if (settings.terragruntSource) {
      builder.withTerragruntSource(settings.terragruntSource);
    }
    if (Object.keys(settings.sourceMap).length > 0) {
      builder.withSourceMaps(settings.sourceMap);
    }
    if (settings.downloadDir) {
      builder.withDownloadDir(settings.downloadDir);
    }
    if (settings.iamRole) {
      if (settings.iamRoleSessionName) {
        builder.withIamRoleAndSession(settings.iamRole, settings.iamRoleSessionName);
      } else {
        builder.withIamRole(settings.iamRole);
      }
    }
    if (settings.strictInclude) {
      builder.withStrictInclude();
    }
    if (settings.dryRun) {
      builder.withDryRun();
    }
    return builder.build();
  }
}
function createTerragruntRunner() {
  return new TerragruntRunner();
}

export { createTerragruntRunner as c };
//# sourceMappingURL=terragrunt.mjs.map
