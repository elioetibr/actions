import { existsSync } from 'node:fs';
import { readFile, mkdir, writeFile, unlink, chmod } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { R as RunnerBase } from './tools.mjs';
import { V as ValidationUtils, p as parseCommaSeparated, a as parseJsonObject } from './docker-buildx-images.mjs';
import './agents.mjs';

class BaseIacBuilder {
  // Core configuration
  _command;
  _workingDirectory = ".";
  // Environment and variables
  _environment = /* @__PURE__ */ new Map();
  _variables = /* @__PURE__ */ new Map();
  _varFiles = [];
  _backendConfig = /* @__PURE__ */ new Map();
  _targets = [];
  // Flags
  _autoApprove = false;
  _dryRun = false;
  _noColor = false;
  _compactWarnings = false;
  _refresh = true;
  _reconfigure = false;
  _migrateState = false;
  // Optional values
  _planFile;
  _outFile;
  _parallelism;
  _lockTimeout;
  // ============ Shared Builder Methods ============
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
    this.resetSpecific();
    return this;
  }
  // ============ Protected Helpers ============
  /**
   * Transfer all shared builder state to a service instance
   */
  transferSharedState(service) {
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
  }
}

const TERRAFORM_COMMANDS = [
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

const AUTO_APPROVE_COMMANDS = ["apply", "destroy"];
const TARGET_COMMANDS = [
  "plan",
  "apply",
  "destroy",
  "refresh",
  "taint",
  "untaint"
];
const VARIABLE_COMMANDS = [
  "plan",
  "apply",
  "destroy",
  "refresh",
  "import"
];

class BaseIacArgumentBuilder {
  constructor(provider) {
    this.provider = provider;
  }
  /**
   * Add all shared Terraform arguments in sequence
   * Subclasses call this to add the standard terraform argument set
   */
  addAllSharedArguments(args, command) {
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
   * Add variable-related arguments (-var, -var-file)
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
   * Add target-related arguments (-target)
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
    if (command === "apply" && this.provider.planFile) ;
  }
  /**
   * Add common arguments applicable to multiple commands
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
   * Check if command supports -var and -var-file flags
   */
  supportsVariables(command) {
    return VARIABLE_COMMANDS.includes(command);
  }
  /**
   * Check if command supports -target flag
   */
  supportsTargets(command) {
    return TARGET_COMMANDS.includes(command);
  }
  /**
   * Check if command supports -auto-approve flag
   */
  supportsAutoApprove(command) {
    return AUTO_APPROVE_COMMANDS.includes(command);
  }
}

class TerraformArgumentBuilder extends BaseIacArgumentBuilder {
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
    this.addAllSharedArguments(args, this.provider.command);
    return args;
  }
  /**
   * Generate full command array including executor and command
   * @returns Full command array ready for execution
   */
  buildCommand() {
    return [this.provider.executor, this.provider.command, ...this.toCommandArgs()];
  }
}

class BaseIacService {
  // Core configuration
  _command;
  _workingDirectory;
  _executor;
  // Environment and variables
  _environment = /* @__PURE__ */ new Map();
  _variables = /* @__PURE__ */ new Map();
  _varFiles = [];
  _backendConfig = /* @__PURE__ */ new Map();
  _targets = [];
  // Flags
  _autoApprove = false;
  _dryRun = false;
  _noColor = false;
  _compactWarnings = false;
  _refresh = true;
  _reconfigure = false;
  _migrateState = false;
  // Optional values
  _planFile;
  _outFile;
  _parallelism;
  _lockTimeout;
  // Internal services (lazy-initialized)
  _argumentBuilder;
  _stringFormatter;
  constructor(command, executor, workingDirectory = ".") {
    this._command = command;
    this._executor = executor;
    this._workingDirectory = workingDirectory;
  }
  // ============ Lazy Accessors for Internal Services ============
  get argumentBuilder() {
    if (!this._argumentBuilder) {
      this._argumentBuilder = this.createArgumentBuilder();
    }
    return this._argumentBuilder;
  }
  get stringFormatter() {
    if (!this._stringFormatter) {
      this._stringFormatter = this.createStringFormatter();
    }
    return this._stringFormatter;
  }
  // ============ IIacProvider Implementation (Read-only) ============
  get command() {
    return this._command;
  }
  get executor() {
    return this._executor;
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
  // ============ IStringListProvider Implementation ============
  get useStringList() {
    return true;
  }
  get stringList() {
    return this.stringFormatter.toStringList();
  }
  // ============ IIacService Implementation (Mutators) ============
  setCommand(command) {
    this._command = command;
    return this;
  }
  setWorkingDirectory(directory) {
    this._workingDirectory = directory;
    return this;
  }
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
    this.resetSpecific();
    return this;
  }
  clone() {
    const cloned = this.createEmptyClone();
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
    this.cloneSpecific(cloned);
    return cloned;
  }
}

class BaseIacStringFormatter {
  constructor(commandBuilder) {
    this.commandBuilder = commandBuilder;
  }
  /**
   * Generate command as a single-line string
   * @returns Space-separated command string
   */
  toString() {
    const command = this.commandBuilder.buildCommand();
    return command.map((arg) => this.escapeArg(arg)).join(" ");
  }
  /**
   * Generate command as multi-line string with backslash continuations
   * Suitable for shell scripts and documentation
   * @returns Multi-line command string
   */
  toStringMultiLineCommand() {
    const command = this.commandBuilder.buildCommand();
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
    return this.commandBuilder.buildCommand();
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

class TerraformStringFormatter extends BaseIacStringFormatter {
  constructor(provider) {
    super(new TerraformArgumentBuilder(provider));
  }
}

class TerraformService extends BaseIacService {
  constructor(command, workingDirectory = ".") {
    super(command, "terraform", workingDirectory);
  }
  // ============ Type-Narrowed Accessors ============
  get command() {
    return super.command;
  }
  setCommand(command) {
    return super.setCommand(command);
  }
  // ============ Factory Method Implementations ============
  createArgumentBuilder() {
    return new TerraformArgumentBuilder(this);
  }
  createStringFormatter() {
    return new TerraformStringFormatter(this);
  }
  resetSpecific() {
  }
  cloneSpecific(_target) {
  }
  createEmptyClone() {
    return new TerraformService(this.command, this.workingDirectory);
  }
  // ============ Clone Override for Return Type ============
  clone() {
    return super.clone();
  }
}

class TerraformBuilder extends BaseIacBuilder {
  /**
   * Private constructor - use static factory methods
   */
  constructor() {
    super();
  }
  // ============ Static Factory Methods ============
  static create(command) {
    const builder = new TerraformBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }
  static forInit() {
    return TerraformBuilder.create("init");
  }
  static forValidate() {
    return TerraformBuilder.create("validate");
  }
  static forFmt() {
    return TerraformBuilder.create("fmt");
  }
  static forPlan() {
    return TerraformBuilder.create("plan");
  }
  static forApply() {
    return TerraformBuilder.create("apply");
  }
  static forDestroy() {
    return TerraformBuilder.create("destroy");
  }
  static forOutput() {
    return TerraformBuilder.create("output");
  }
  static forShow() {
    return TerraformBuilder.create("show");
  }
  // ============ Build ============
  build() {
    if (!this._command) {
      throw new Error(
        "Terraform command is required. Use withCommand() or a static factory method."
      );
    }
    const service = new TerraformService(this._command, this._workingDirectory);
    this.transferSharedState(service);
    return service;
  }
  // ============ Protected Overrides ============
  resetSpecific() {
  }
  validateCommand(command) {
    if (!TERRAFORM_COMMANDS.includes(command)) {
      throw new Error(
        `Invalid Terraform command: ${command}. Valid commands are: ${TERRAFORM_COMMANDS.join(", ")}`
      );
    }
  }
}

function getSettings(agent) {
  return {
    command: agent.getInput("command", true),
    workingDirectory: agent.getInput("working-directory") || ".",
    terraformVersion: agent.getInput("terraform-version"),
    terraformVersionFile: agent.getInput("terraform-version-file") || ".terraform-version",
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
    dryRun: agent.getBooleanInput("dry-run")
  };
}

const SUPPORTED_PLATFORMS = /* @__PURE__ */ new Set([
  "linux",
  "darwin",
  "win32"
]);
const SUPPORTED_ARCHES = /* @__PURE__ */ new Set(["x64", "arm64"]);
function getPlatform() {
  if (!SUPPORTED_PLATFORMS.has(process.platform)) {
    throw new Error(
      `Unsupported platform: ${process.platform}. Supported: linux, darwin, windows.`
    );
  }
  if (!SUPPORTED_ARCHES.has(process.arch)) {
    throw new Error(
      `Unsupported architecture: ${process.arch}. Supported: x64 (amd64), arm64.`
    );
  }
  const os = process.platform === "win32" ? "windows" : process.platform;
  const arch = process.arch === "arm64" ? "arm64" : "amd64";
  return { os, arch };
}
function getCacheDir(toolName, version) {
  const base = process.env["RUNNER_TOOL_CACHE"] || `${process.env["HOME"] ?? "/tmp"}/.tool-versions`;
  const { arch } = getPlatform();
  return `${base}/${toolName}/${version}/${arch}`;
}

const versionCache = /* @__PURE__ */ new Map();
const TERRAGRUNT_VERSION_RE = /terragrunt\s+version\s+v(\d+)\.(\d+)\.(\d+)/i;
function parseVersion(output, pattern, toolName) {
  const match = pattern.exec(output);
  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error(
      `Failed to parse ${toolName} version from output: ${output.slice(0, 200)}`
    );
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    raw: `${match[1]}.${match[2]}.${match[3]}`
  };
}
async function detectTerragruntVersion(agent) {
  const cached = versionCache.get("terragrunt");
  if (cached) {
    return cached;
  }
  const result = await agent.exec("terragrunt", ["--version"], {
    silent: true,
    ignoreReturnCode: true
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `terragrunt --version failed (exit ${result.exitCode}): ${result.stderr}`
    );
  }
  const version = parseVersion(
    result.stdout,
    TERRAGRUNT_VERSION_RE,
    "Terragrunt"
  );
  versionCache.set("terragrunt", version);
  return version;
}
function isV1OrLater(version) {
  return version.major >= 1;
}

class VersionFileReader {
  /**
   * Walk from startDir upward looking for the version file.
   * Stops at the filesystem root or $HOME.
   *
   * @param startDir - Directory to start searching from
   * @param fileName - Version file name (e.g., '.terraform-version')
   * @returns The version string from the file, or undefined if not found
   */
  async read(startDir, fileName) {
    const home = homedir();
    let currentDir = resolve(startDir);
    while (true) {
      const filePath = join(currentDir, fileName);
      try {
        const content = await readFile(filePath, "utf-8");
        const version = this.parseVersionFile(content);
        if (version) {
          return version;
        }
      } catch {
      }
      const parentDir = dirname(currentDir);
      if (currentDir === home || parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }
    if (resolve(startDir) !== home) {
      const homeFilePath = join(home, fileName);
      try {
        const content = await readFile(homeFilePath, "utf-8");
        return this.parseVersionFile(content);
      } catch {
      }
    }
    return void 0;
  }
  /**
   * Parse the version file content.
   * Returns the first non-empty, non-comment line, trimmed.
   */
  parseVersionFile(content) {
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        return trimmed;
      }
    }
    return void 0;
  }
}

const VERSION_REGEX$1 = /^\d+\.\d+\.\d+$/;
const HASHICORP_RELEASES_URL = "https://releases.hashicorp.com/terraform";
function compareSemverDesc(a, b) {
  const ap = a.split(".").map(Number);
  const bp = b.split(".").map(Number);
  return bp[0] - ap[0] || bp[1] - ap[1] || bp[2] - ap[2];
}
class TerraformVersionResolver {
  constructor(fileReader) {
    this.fileReader = fileReader;
  }
  async resolve(version, versionFile, workingDirectory) {
    const trimmed = version.trim();
    if (trimmed === "skip") {
      return void 0;
    }
    if (VERSION_REGEX$1.test(trimmed)) {
      return { input: trimmed, resolved: trimmed, source: "input" };
    }
    if (trimmed === "latest") {
      const latest = await this.fetchLatestVersion();
      return { input: trimmed, resolved: latest, source: "latest" };
    }
    if (trimmed === "") {
      const fileVersion = await this.fileReader.read(
        workingDirectory,
        versionFile
      );
      if (fileVersion) {
        return this.resolveFileVersion(fileVersion, versionFile);
      }
      const latest = await this.fetchLatestVersion();
      return { input: "latest", resolved: latest, source: "latest" };
    }
    throw new Error(
      `Invalid terraform version spec: '${trimmed}'. Use 'x.y.z', 'latest', or 'skip'.`
    );
  }
  /**
   * Resolve a version string read from a version file.
   * Supports: 'skip', 'latest', and exact 'x.y.z' specs.
   */
  async resolveFileVersion(fileVersion, versionFile) {
    if (fileVersion === "skip") {
      return void 0;
    }
    if (fileVersion === "latest") {
      const latest = await this.fetchLatestVersion();
      return { input: fileVersion, resolved: latest, source: "file" };
    }
    if (VERSION_REGEX$1.test(fileVersion)) {
      return { input: fileVersion, resolved: fileVersion, source: "file" };
    }
    throw new Error(
      `Invalid version in ${versionFile}: '${fileVersion}'. Use 'x.y.z', 'latest', or 'skip'.`
    );
  }
  /**
   * Fetch the latest stable Terraform version from the HashiCorp releases index.
   * Filters out prerelease versions (alpha, beta, rc).
   */
  async fetchLatestVersion() {
    const response = await fetch(`${HASHICORP_RELEASES_URL}/index.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Terraform version index: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    const versions = Object.keys(data.versions).filter((v) => VERSION_REGEX$1.test(v)).sort(compareSemverDesc);
    if (versions.length === 0) {
      throw new Error(
        "No stable Terraform versions found in the version index"
      );
    }
    return versions[0];
  }
}
class TerraformVersionInstaller {
  async isInstalled(version) {
    const dir = getCacheDir("terraform", version);
    const binaryName = getPlatform().os === "windows" ? "terraform.exe" : "terraform";
    return existsSync(join(dir, binaryName));
  }
  async install(version, agent) {
    const cacheDir = getCacheDir("terraform", version);
    if (await this.isInstalled(version)) {
      agent.info(`Terraform ${version} already cached at ${cacheDir}`);
      return cacheDir;
    }
    const { os, arch } = getPlatform();
    const zipName = `terraform_${version}_${os}_${arch}.zip`;
    const url = `${HASHICORP_RELEASES_URL}/${version}/${zipName}`;
    agent.info(`Downloading Terraform ${version} from ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download Terraform ${version}: ${response.status} ${response.statusText}`
      );
    }
    await mkdir(cacheDir, { recursive: true });
    const zipPath = join(cacheDir, zipName);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(zipPath, buffer);
    const result = await agent.exec("unzip", ["-o", zipPath, "-d", cacheDir], {
      silent: true
    });
    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to extract Terraform ${version}: ${result.stderr}`
      );
    }
    await unlink(zipPath);
    const binaryName = os === "windows" ? "terraform.exe" : "terraform";
    await chmod(join(cacheDir, binaryName), 493);
    agent.info(`Terraform ${version} installed to ${cacheDir}`);
    return cacheDir;
  }
}

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;
const TERRAGRUNT_LATEST_URL = "https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest";
const TERRAGRUNT_DOWNLOAD_URL = "https://github.com/gruntwork-io/terragrunt/releases/download";
class TerragruntVersionResolver {
  constructor(fileReader) {
    this.fileReader = fileReader;
  }
  async resolve(version, versionFile, workingDirectory) {
    const trimmed = version.trim();
    if (trimmed === "skip") {
      return void 0;
    }
    if (VERSION_REGEX.test(trimmed)) {
      return { input: trimmed, resolved: trimmed, source: "input" };
    }
    if (trimmed === "latest") {
      const latest = await this.fetchLatestVersion();
      return { input: trimmed, resolved: latest, source: "latest" };
    }
    if (trimmed === "") {
      const fileVersion = await this.fileReader.read(
        workingDirectory,
        versionFile
      );
      if (fileVersion) {
        return this.resolveFileVersion(fileVersion, versionFile);
      }
      const latest = await this.fetchLatestVersion();
      return { input: "latest", resolved: latest, source: "latest" };
    }
    throw new Error(
      `Invalid terragrunt version spec: '${trimmed}'. Use 'x.y.z', 'latest', or 'skip'.`
    );
  }
  /**
   * Resolve a version string read from a version file.
   * Supports: 'skip', 'latest', and exact 'x.y.z' specs.
   */
  async resolveFileVersion(fileVersion, versionFile) {
    if (fileVersion === "skip") {
      return void 0;
    }
    if (fileVersion === "latest") {
      const latest = await this.fetchLatestVersion();
      return { input: fileVersion, resolved: latest, source: "file" };
    }
    if (VERSION_REGEX.test(fileVersion)) {
      return { input: fileVersion, resolved: fileVersion, source: "file" };
    }
    throw new Error(
      `Invalid version in ${versionFile}: '${fileVersion}'. Use 'x.y.z', 'latest', or 'skip'.`
    );
  }
  /**
   * Fetch the latest stable Terragrunt version from the GitHub Releases API.
   * Strips the 'v' prefix from the tag name.
   *
   * Note: GitHub API has a 60 req/hour rate limit for unauthenticated calls.
   * If you hit rate limits in CI, set the GITHUB_TOKEN environment variable
   * or pre-specify an exact version.
   */
  async fetchLatestVersion() {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "elioetibr/actions"
    };
    const token = process.env["GITHUB_TOKEN"];
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(TERRAGRUNT_LATEST_URL, { headers });
    if (!response.ok) {
      const hint = response.status === 403 ? " (GitHub API rate limit — set GITHUB_TOKEN to increase the limit)" : "";
      throw new Error(
        `Failed to fetch latest Terragrunt version: ${response.status} ${response.statusText}${hint}`
      );
    }
    const data = await response.json();
    const tag = data.tag_name;
    const version = tag.startsWith("v") ? tag.slice(1) : tag;
    if (!VERSION_REGEX.test(version)) {
      throw new Error(
        `Unexpected Terragrunt latest version format: '${tag}'`
      );
    }
    return version;
  }
}
class TerragruntVersionInstaller {
  async isInstalled(version) {
    const dir = getCacheDir("terragrunt", version);
    const binaryName = getPlatform().os === "windows" ? "terragrunt.exe" : "terragrunt";
    return existsSync(join(dir, binaryName));
  }
  async install(version, agent) {
    const cacheDir = getCacheDir("terragrunt", version);
    if (await this.isInstalled(version)) {
      agent.info(`Terragrunt ${version} already cached at ${cacheDir}`);
      return cacheDir;
    }
    const { os, arch } = getPlatform();
    const binaryName = os === "windows" ? "terragrunt.exe" : "terragrunt";
    const downloadName = `terragrunt_${os}_${arch}`;
    const url = `${TERRAGRUNT_DOWNLOAD_URL}/v${version}/${downloadName}`;
    agent.info(`Downloading Terragrunt ${version} from ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download Terragrunt ${version}: ${response.status} ${response.statusText}`
      );
    }
    await mkdir(cacheDir, { recursive: true });
    const binaryPath = join(cacheDir, binaryName);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(binaryPath, buffer);
    await chmod(binaryPath, 493);
    agent.info(`Terragrunt ${version} installed to ${cacheDir}`);
    return cacheDir;
  }
}

const fileReader = new VersionFileReader();
const resolver = new TerraformVersionResolver(fileReader);
const installer = new TerraformVersionInstaller();
class TerraformRunner extends RunnerBase {
  name = "terraform";
  steps = /* @__PURE__ */ new Map([
    ["execute", this.execute.bind(this)]
  ]);
  /**
   * Execute step: Build and run the Terraform command
   * Uses the IAgent.exec() interface for safe command execution (not child_process)
   */
  async execute(agent) {
    try {
      const settings = getSettings(agent);
      agent.info(`Starting Terraform ${settings.command} action...`);
      await this.setupTerraformVersion(agent, settings);
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
          new Error(`Terraform ${settings.command} failed with exit code ${result.exitCode}`),
          outputs
        );
      }
      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
  /**
   * Resolve and optionally install the requested Terraform version.
   * When 'skip' is returned the runner uses whatever terraform is on PATH.
   */
  async setupTerraformVersion(agent, settings) {
    agent.startGroup("Terraform version setup");
    try {
      const spec = await resolver.resolve(
        settings.terraformVersion,
        settings.terraformVersionFile,
        settings.workingDirectory
      );
      if (!spec) {
        agent.info("Terraform version: skip (using existing PATH binary)");
        return;
      }
      agent.info(
        `Terraform version: ${spec.resolved} (source: ${spec.source})`
      );
      const cacheDir = await installer.install(spec.resolved, agent);
      agent.addPath(cacheDir);
    } finally {
      agent.endGroup();
    }
  }
  /**
   * Build the Terraform service from settings
   */
  buildService(settings) {
    const builder = TerraformBuilder.create(settings.command).withWorkingDirectory(
      settings.workingDirectory
    );
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
    if (settings.dryRun) {
      builder.withDryRun();
    }
    return builder.build();
  }
}
function createTerraformRunner() {
  return new TerraformRunner();
}

export { BaseIacArgumentBuilder as B, TERRAFORM_COMMANDS as T, VersionFileReader as V, BaseIacStringFormatter as a, BaseIacService as b, BaseIacBuilder as c, TerraformVersionResolver as d, TerraformVersionInstaller as e, TerragruntVersionResolver as f, TerragruntVersionInstaller as g, detectTerragruntVersion as h, isV1OrLater as i, createTerraformRunner as j };
//# sourceMappingURL=terraform.mjs.map
