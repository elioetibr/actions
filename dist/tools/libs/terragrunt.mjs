import { R as RunnerBase } from './tools.mjs';
import { V as ValidationUtils, a as parseJsonObject, p as parseCommaSeparated } from './docker-buildx-images.mjs';
import './agents.mjs';
import { V as VARIABLE_COMMANDS, T as TARGET_COMMANDS, A as AUTO_APPROVE_COMMANDS } from './terraform.mjs';

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

class TerragruntArgumentBuilder {
  constructor(provider) {
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
    this.addInitArguments(args, command);
    this.addVariableArguments(args, command);
    this.addTargetArguments(args, command);
    this.addPlanArguments(args, command);
    this.addApplyArguments(args, command);
    this.addCommonArguments(args);
  }
  /**
   * Add init-specific arguments
   */
  addInitArguments(args, command) {
    if (command !== "init") return;
    for (const [key, value] of this.provider.backendConfig.entries()) {
      args.push("-backend-config", `${key}=${value}`);
    }
    if (this.provider.reconfigure) {
      args.push("-reconfigure");
    }
    if (this.provider.migrateState) {
      args.push("-migrate-state");
    }
  }
  /**
   * Add variable-related arguments
   */
  addVariableArguments(args, command) {
    if (!this.supportsVariables(command)) return;
    for (const varFile of this.provider.varFiles) {
      args.push("-var-file", varFile);
    }
    for (const [key, value] of this.provider.variables.entries()) {
      args.push("-var", `${key}=${value}`);
    }
  }
  /**
   * Add target-related arguments
   */
  addTargetArguments(args, command) {
    if (!this.supportsTargets(command)) return;
    for (const target of this.provider.targets) {
      args.push("-target", target);
    }
  }
  /**
   * Add plan-specific arguments
   */
  addPlanArguments(args, command) {
    if (command !== "plan") return;
    if (this.provider.outFile) {
      args.push("-out", this.provider.outFile);
    }
    if (!this.provider.refresh) {
      args.push("-refresh=false");
    }
  }
  /**
   * Add apply/destroy-specific arguments
   */
  addApplyArguments(args, command) {
    if (!this.supportsAutoApprove(command)) return;
    if (this.provider.autoApprove) {
      args.push("-auto-approve");
    }
    if (command === "apply" || command === "destroy") {
      if (!this.provider.refresh) {
        args.push("-refresh=false");
      }
    }
  }
  /**
   * Add common arguments
   */
  addCommonArguments(args) {
    if (this.provider.parallelism !== void 0) {
      args.push("-parallelism", String(this.provider.parallelism));
    }
    if (this.provider.lockTimeout) {
      args.push("-lock-timeout", this.provider.lockTimeout);
    }
    if (this.provider.noColor) {
      args.push("-no-color");
    }
    if (this.provider.compactWarnings) {
      args.push("-compact-warnings");
    }
    if (this.provider.command === "apply" && this.provider.planFile) {
      args.push(this.provider.planFile);
    }
  }
  /**
   * Check if command is a terraform command
   */
  isTerraformCommand(command) {
    const terraformCommands = [
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
      "workspace"
    ];
    return terraformCommands.includes(command);
  }
  /**
   * Check if command supports variables
   */
  supportsVariables(command) {
    return VARIABLE_COMMANDS.includes(command);
  }
  /**
   * Check if command supports targets
   */
  supportsTargets(command) {
    return TARGET_COMMANDS.includes(command);
  }
  /**
   * Check if command supports auto-approve
   */
  supportsAutoApprove(command) {
    return AUTO_APPROVE_COMMANDS.includes(command);
  }
}

class TerragruntStringFormatter {
  argumentBuilder;
  constructor(provider) {
    this.argumentBuilder = new TerragruntArgumentBuilder(provider);
  }
  /**
   * Generate command as a single-line string
   * @returns Space-separated command string
   */
  toString() {
    const command = this.argumentBuilder.buildCommand();
    return command.map((arg) => this.escapeArg(arg)).join(" ");
  }
  /**
   * Generate command as multi-line string with backslash continuations
   * @returns Multi-line command string
   */
  toStringMultiLineCommand() {
    const command = this.argumentBuilder.buildCommand();
    if (command.length === 0) return "";
    const lines = [];
    for (let i = 0; i < command.length; i++) {
      const currentArg = command[i];
      const arg = this.escapeArg(currentArg);
      const isLast = i === command.length - 1;
      const nextArg = command[i + 1];
      if (arg.startsWith("-") && !isLast && nextArg && !nextArg.startsWith("-")) {
        const value = this.escapeArg(nextArg);
        lines.push(`  ${arg} ${value}` + (i + 1 === command.length - 1 ? "" : " \\"));
        i++;
      } else if (i === 0) {
        lines.push(arg + " \\");
      } else if (i === 1) {
        lines.push(`  ${arg}` + (isLast ? "" : " \\"));
      } else {
        lines.push(`  ${arg}` + (isLast ? "" : " \\"));
      }
    }
    return lines.join("\n");
  }
  /**
   * Generate a string list
   * @returns Array of strings suitable for StringListProvider
   */
  toStringList() {
    return this.argumentBuilder.buildCommand();
  }
  /**
   * Escape an argument for shell safety
   * @param arg - Argument to escape
   * @returns Escaped argument
   */
  escapeArg(arg) {
    if (/[\s"'\\$`]/.test(arg)) {
      return `"${arg.replace(/"/g, '\\"')}"`;
    }
    return arg;
  }
}

class TerragruntService {
  // Core configuration
  _command;
  _workingDirectory;
  executor = "terragrunt";
  // Terraform configuration
  _environment = /* @__PURE__ */ new Map();
  _variables = /* @__PURE__ */ new Map();
  _varFiles = [];
  _backendConfig = /* @__PURE__ */ new Map();
  _targets = [];
  // Terraform flags
  _autoApprove = false;
  _dryRun = false;
  _noColor = false;
  _compactWarnings = false;
  _refresh = true;
  _reconfigure = false;
  _migrateState = false;
  // Terraform optional values
  _planFile;
  _outFile;
  _parallelism;
  _lockTimeout;
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
  // Internal services
  argumentBuilder;
  stringFormatter;
  constructor(command, workingDirectory = ".") {
    this._command = command;
    this._workingDirectory = workingDirectory;
    this.argumentBuilder = new TerragruntArgumentBuilder(this);
    this.stringFormatter = new TerragruntStringFormatter(this);
  }
  // ============ ITerragruntProvider Implementation (Read-only) ============
  get command() {
    return this._command;
  }
  get workingDirectory() {
    return this._workingDirectory;
  }
  get environment() {
    return this._environment;
  }
  get variables() {
    return this._variables;
  }
  get varFiles() {
    return [...this._varFiles];
  }
  get backendConfig() {
    return this._backendConfig;
  }
  get targets() {
    return [...this._targets];
  }
  get autoApprove() {
    return this._autoApprove;
  }
  get dryRun() {
    return this._dryRun;
  }
  get planFile() {
    return this._planFile;
  }
  get outFile() {
    return this._outFile;
  }
  get noColor() {
    return this._noColor;
  }
  get compactWarnings() {
    return this._compactWarnings;
  }
  get parallelism() {
    return this._parallelism;
  }
  get lockTimeout() {
    return this._lockTimeout;
  }
  get refresh() {
    return this._refresh;
  }
  get reconfigure() {
    return this._reconfigure;
  }
  get migrateState() {
    return this._migrateState;
  }
  // Terragrunt-specific read-only properties
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
  // ============ IStringListProvider Implementation ============
  get useStringList() {
    return true;
  }
  get stringList() {
    return this.stringFormatter.toStringList();
  }
  // ============ ITerragruntService Implementation (Mutators) ============
  setCommand(command) {
    this._command = command;
    return this;
  }
  setWorkingDirectory(directory) {
    this._workingDirectory = directory;
    return this;
  }
  // Terraform configuration methods
  addEnvironmentVariable(key, value) {
    this._environment.set(key, value);
    return this;
  }
  removeEnvironmentVariable(key) {
    this._environment.delete(key);
    return this;
  }
  clearEnvironmentVariables() {
    this._environment.clear();
    return this;
  }
  addVariable(key, value) {
    this._variables.set(key, value);
    return this;
  }
  removeVariable(key) {
    this._variables.delete(key);
    return this;
  }
  clearVariables() {
    this._variables.clear();
    return this;
  }
  addVarFile(filePath) {
    if (!this._varFiles.includes(filePath)) {
      this._varFiles.push(filePath);
    }
    return this;
  }
  removeVarFile(filePath) {
    const index = this._varFiles.indexOf(filePath);
    if (index !== -1) {
      this._varFiles.splice(index, 1);
    }
    return this;
  }
  clearVarFiles() {
    this._varFiles.length = 0;
    return this;
  }
  addBackendConfig(key, value) {
    this._backendConfig.set(key, value);
    return this;
  }
  removeBackendConfig(key) {
    this._backendConfig.delete(key);
    return this;
  }
  clearBackendConfig() {
    this._backendConfig.clear();
    return this;
  }
  addTarget(target) {
    if (!this._targets.includes(target)) {
      this._targets.push(target);
    }
    return this;
  }
  removeTarget(target) {
    const index = this._targets.indexOf(target);
    if (index !== -1) {
      this._targets.splice(index, 1);
    }
    return this;
  }
  clearTargets() {
    this._targets.length = 0;
    return this;
  }
  setAutoApprove(enabled) {
    this._autoApprove = enabled;
    return this;
  }
  setDryRun(enabled) {
    this._dryRun = enabled;
    return this;
  }
  setPlanFile(filePath) {
    this._planFile = filePath;
    return this;
  }
  setOutFile(filePath) {
    this._outFile = filePath;
    return this;
  }
  setNoColor(enabled) {
    this._noColor = enabled;
    return this;
  }
  setCompactWarnings(enabled) {
    this._compactWarnings = enabled;
    return this;
  }
  setParallelism(level) {
    this._parallelism = level;
    return this;
  }
  setLockTimeout(timeout) {
    this._lockTimeout = timeout;
    return this;
  }
  setRefresh(enabled) {
    this._refresh = enabled;
    return this;
  }
  setReconfigure(enabled) {
    this._reconfigure = enabled;
    return this;
  }
  setMigrateState(enabled) {
    this._migrateState = enabled;
    return this;
  }
  // Terragrunt-specific methods
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
  // ============ Command Generation Methods ============
  toCommandArgs() {
    return this.argumentBuilder.toCommandArgs();
  }
  buildCommand() {
    return this.argumentBuilder.buildCommand();
  }
  toString() {
    return this.stringFormatter.toString();
  }
  toStringMultiLineCommand() {
    return this.stringFormatter.toStringMultiLineCommand();
  }
  // ============ Utility Methods ============
  reset() {
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
    this._planFile = void 0;
    this._outFile = void 0;
    this._parallelism = void 0;
    this._lockTimeout = void 0;
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
    return this;
  }
  clone() {
    const cloned = new TerragruntService(this._command, this._workingDirectory);
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

class TerragruntBuilder {
  // Core configuration
  _command;
  _workingDirectory = ".";
  // Terraform configuration
  _environment = /* @__PURE__ */ new Map();
  _variables = /* @__PURE__ */ new Map();
  _varFiles = [];
  _backendConfig = /* @__PURE__ */ new Map();
  _targets = [];
  // Terraform flags
  _autoApprove = false;
  _dryRun = false;
  _noColor = false;
  _compactWarnings = false;
  _refresh = true;
  _reconfigure = false;
  _migrateState = false;
  // Terraform optional values
  _planFile;
  _outFile;
  _parallelism;
  _lockTimeout;
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
  }
  // ============ Static Factory Methods ============
  /**
   * Create a new TerragruntBuilder instance
   * @param command - Optional initial command
   */
  static create(command) {
    const builder = new TerragruntBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }
  /**
   * Create a builder for terragrunt init
   */
  static forInit() {
    return TerragruntBuilder.create("init");
  }
  /**
   * Create a builder for terragrunt validate
   */
  static forValidate() {
    return TerragruntBuilder.create("validate");
  }
  /**
   * Create a builder for terragrunt fmt
   */
  static forFmt() {
    return TerragruntBuilder.create("fmt");
  }
  /**
   * Create a builder for terragrunt hclfmt
   */
  static forHclFmt() {
    return TerragruntBuilder.create("hclfmt");
  }
  /**
   * Create a builder for terragrunt plan
   */
  static forPlan() {
    return TerragruntBuilder.create("plan");
  }
  /**
   * Create a builder for terragrunt apply
   */
  static forApply() {
    return TerragruntBuilder.create("apply");
  }
  /**
   * Create a builder for terragrunt destroy
   */
  static forDestroy() {
    return TerragruntBuilder.create("destroy");
  }
  /**
   * Create a builder for terragrunt output
   */
  static forOutput() {
    return TerragruntBuilder.create("output");
  }
  /**
   * Create a builder for terragrunt run-all plan
   */
  static forRunAllPlan() {
    return TerragruntBuilder.create("plan").withRunAll();
  }
  /**
   * Create a builder for terragrunt run-all apply
   */
  static forRunAllApply() {
    return TerragruntBuilder.create("apply").withRunAll();
  }
  /**
   * Create a builder for terragrunt run-all destroy
   */
  static forRunAllDestroy() {
    return TerragruntBuilder.create("destroy").withRunAll();
  }
  /**
   * Create a builder for terragrunt graph-dependencies
   */
  static forGraphDependencies() {
    return TerragruntBuilder.create("graph-dependencies");
  }
  /**
   * Create a builder for terragrunt validate-inputs
   */
  static forValidateInputs() {
    return TerragruntBuilder.create("validate-inputs");
  }
  // ============ ITerragruntBuilder Implementation ============
  withCommand(command) {
    this.validateCommand(command);
    this._command = command;
    return this;
  }
  withWorkingDirectory(directory) {
    ValidationUtils.validateStringInput(directory, "workingDirectory");
    this._workingDirectory = directory;
    return this;
  }
  // Terraform configuration methods
  withEnvironmentVariable(key, value) {
    ValidationUtils.validateStringInput(key, "environment variable key");
    this._environment.set(key, value);
    return this;
  }
  withEnvironmentVariables(variables) {
    for (const [key, value] of Object.entries(variables)) {
      this.withEnvironmentVariable(key, value);
    }
    return this;
  }
  withVariable(key, value) {
    ValidationUtils.validateStringInput(key, "variable key");
    this._variables.set(key, value);
    return this;
  }
  withVariables(variables) {
    for (const [key, value] of Object.entries(variables)) {
      this.withVariable(key, value);
    }
    return this;
  }
  withVarFile(filePath) {
    ValidationUtils.validateStringInput(filePath, "var file path");
    if (!this._varFiles.includes(filePath)) {
      this._varFiles.push(filePath);
    }
    return this;
  }
  withVarFiles(filePaths) {
    for (const filePath of filePaths) {
      this.withVarFile(filePath);
    }
    return this;
  }
  withBackendConfig(key, value) {
    ValidationUtils.validateStringInput(key, "backend config key");
    this._backendConfig.set(key, value);
    return this;
  }
  withBackendConfigs(config) {
    for (const [key, value] of Object.entries(config)) {
      this.withBackendConfig(key, value);
    }
    return this;
  }
  withTarget(target) {
    ValidationUtils.validateStringInput(target, "target");
    if (!this._targets.includes(target)) {
      this._targets.push(target);
    }
    return this;
  }
  withTargets(targets) {
    for (const target of targets) {
      this.withTarget(target);
    }
    return this;
  }
  withAutoApprove() {
    this._autoApprove = true;
    return this;
  }
  withDryRun() {
    this._dryRun = true;
    return this;
  }
  withPlanFile(filePath) {
    ValidationUtils.validateStringInput(filePath, "plan file path");
    this._planFile = filePath;
    return this;
  }
  withOutFile(filePath) {
    ValidationUtils.validateStringInput(filePath, "output file path");
    this._outFile = filePath;
    return this;
  }
  withNoColor() {
    this._noColor = true;
    return this;
  }
  withCompactWarnings() {
    this._compactWarnings = true;
    return this;
  }
  withParallelism(level) {
    if (level < 1) {
      throw new Error("Parallelism level must be at least 1");
    }
    this._parallelism = level;
    return this;
  }
  withLockTimeout(timeout) {
    ValidationUtils.validateStringInput(timeout, "lock timeout");
    this._lockTimeout = timeout;
    return this;
  }
  withRefresh() {
    this._refresh = true;
    return this;
  }
  withoutRefresh() {
    this._refresh = false;
    return this;
  }
  withReconfigure() {
    this._reconfigure = true;
    return this;
  }
  withMigrateState() {
    this._migrateState = true;
    return this;
  }
  // Terragrunt-specific methods
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
  reset() {
    this._command = void 0;
    this._workingDirectory = ".";
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
    this._planFile = void 0;
    this._outFile = void 0;
    this._parallelism = void 0;
    this._lockTimeout = void 0;
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
    return this;
  }
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
