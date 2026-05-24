import { a as ValidationUtils, d as removeItem, f as RunnerBase, o as parseCommaSeparated, s as parseJsonObject, u as addUnique } from "./deployment-gate.mjs";
import { chmod, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";
//#region src/actions/iac/common/BaseIacBuilder.ts
/**
* Abstract base builder for IaC service instances
* Contains all shared builder state (17 fields) and 24 shared builder methods
* Subclasses implement build() and tool-specific builder methods
*/
var BaseIacBuilder = class {
	_command;
	_workingDirectory = ".";
	_environment = /* @__PURE__ */ new Map();
	_variables = /* @__PURE__ */ new Map();
	_varFiles = [];
	_backendConfig = /* @__PURE__ */ new Map();
	_targets = [];
	_autoApprove = false;
	_dryRun = false;
	_noColor = false;
	_compactWarnings = false;
	_refresh = true;
	_reconfigure = false;
	_migrateState = false;
	_planFile;
	_outFile;
	_parallelism;
	_lockTimeout;
	constructor() {}
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
		for (const [key, value] of Object.entries(variables)) this.withEnvironmentVariable(key, value);
		return this;
	}
	withVariable(key, value) {
		ValidationUtils.validateStringInput(key, "variable key");
		this._variables.set(key, value);
		return this;
	}
	withVariables(variables) {
		for (const [key, value] of Object.entries(variables)) this.withVariable(key, value);
		return this;
	}
	withVarFile(filePath) {
		ValidationUtils.validateStringInput(filePath, "var file path");
		addUnique(this._varFiles, filePath);
		return this;
	}
	withVarFiles(filePaths) {
		for (const filePath of filePaths) this.withVarFile(filePath);
		return this;
	}
	withBackendConfig(key, value) {
		ValidationUtils.validateStringInput(key, "backend config key");
		this._backendConfig.set(key, value);
		return this;
	}
	withBackendConfigs(config) {
		for (const [key, value] of Object.entries(config)) this.withBackendConfig(key, value);
		return this;
	}
	withTarget(target) {
		ValidationUtils.validateStringInput(target, "target");
		addUnique(this._targets, target);
		return this;
	}
	withTargets(targets) {
		for (const target of targets) this.withTarget(target);
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
		if (level < 1) throw new Error("Parallelism level must be at least 1");
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
	/**
	* Transfer all shared builder state to a service instance
	*/
	transferSharedState(service) {
		for (const [key, value] of this._environment.entries()) service.addEnvironmentVariable(key, value);
		for (const [key, value] of this._variables.entries()) service.addVariable(key, value);
		for (const varFile of this._varFiles) service.addVarFile(varFile);
		for (const [key, value] of this._backendConfig.entries()) service.addBackendConfig(key, value);
		for (const target of this._targets) service.addTarget(target);
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
};
//#endregion
//#region src/actions/iac/terraform/interfaces/ITerraformProvider.ts
/**
* Terraform command categories for validation
*/
var TERRAFORM_COMMANDS = [
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
//#endregion
//#region src/actions/iac/common/interfaces/IIacProvider.ts
/**
* Commands that support -auto-approve flag
*/
var AUTO_APPROVE_COMMANDS = ["apply", "destroy"];
/**
* Commands that support -target flag
*/
var TARGET_COMMANDS = [
	"plan",
	"apply",
	"destroy",
	"refresh",
	"taint",
	"untaint"
];
/**
* Commands that support -var and -var-file flags
*/
var VARIABLE_COMMANDS = [
	"plan",
	"apply",
	"destroy",
	"refresh",
	"import"
];
//#endregion
//#region src/actions/iac/common/services/BaseIacArgumentBuilder.ts
/**
* Base argument builder for IaC commands
* Contains shared argument building logic for Terraform-compatible commands
*/
var BaseIacArgumentBuilder = class {
	provider;
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
		for (const [key, value] of this.provider.backendConfig.entries()) args.push("-backend-config", `${key}=${value}`);
		if (this.provider.reconfigure) args.push("-reconfigure");
		if (this.provider.migrateState) args.push("-migrate-state");
	}
	/**
	* Add variable-related arguments (-var, -var-file)
	*/
	addVariableArguments(args, command) {
		if (!this.supportsVariables(command)) return;
		for (const varFile of this.provider.varFiles) args.push("-var-file", varFile);
		for (const [key, value] of this.provider.variables.entries()) args.push("-var", `${key}=${value}`);
	}
	/**
	* Add target-related arguments (-target)
	*/
	addTargetArguments(args, command) {
		if (!this.supportsTargets(command)) return;
		for (const target of this.provider.targets) args.push("-target", target);
	}
	/**
	* Add plan-specific arguments
	*/
	addPlanArguments(args, command) {
		if (command !== "plan") return;
		if (this.provider.outFile) args.push("-out", this.provider.outFile);
		if (!this.provider.refresh) args.push("-refresh=false");
	}
	/**
	* Add apply/destroy-specific arguments
	*/
	addApplyArguments(args, command) {
		if (!this.supportsAutoApprove(command)) return;
		if (this.provider.autoApprove) args.push("-auto-approve");
		if (command === "apply" || command === "destroy") {
			if (!this.provider.refresh) args.push("-refresh=false");
		}
		if (command === "apply" && this.provider.planFile) {}
	}
	/**
	* Add common arguments applicable to multiple commands
	*/
	addCommonArguments(args) {
		if (this.provider.parallelism !== void 0) args.push("-parallelism", String(this.provider.parallelism));
		if (this.provider.lockTimeout) args.push("-lock-timeout", this.provider.lockTimeout);
		if (this.provider.noColor) args.push("-no-color");
		if (this.provider.compactWarnings) args.push("-compact-warnings");
		if (this.provider.command === "apply" && this.provider.planFile) args.push(this.provider.planFile);
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
};
//#endregion
//#region src/actions/iac/terraform/services/TerraformArgumentBuilder.ts
/**
* Builds command-line arguments for Terraform commands
* Extends BaseIacArgumentBuilder with Terraform-specific command assembly
*/
var TerraformArgumentBuilder = class extends BaseIacArgumentBuilder {
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
		return [
			this.provider.executor,
			this.provider.command,
			...this.toCommandArgs()
		];
	}
};
//#endregion
//#region src/actions/iac/common/services/BaseIacService.ts
/**
* Abstract base service implementation for IaC operations.
*
* This class is intentionally large (~390 lines) because it consolidates all
* 17 shared IaC fields into a single Template Method hierarchy. Each section
* is a mechanical pattern:
*
* - Read-only getters (18): one-liner property accessors
* - Mutators (24): one-liner setters returning `this` for chaining
* - Utility methods: clone() and reset() for lifecycle management
*
* Subclasses (TerraformService, TerragruntService) only implement factory
* methods and tool-specific state. Splitting this class would scatter
* related state without reducing actual complexity.
*/
var BaseIacService = class {
	_command;
	_workingDirectory;
	_executor;
	_environment = /* @__PURE__ */ new Map();
	_variables = /* @__PURE__ */ new Map();
	_varFiles = [];
	_backendConfig = /* @__PURE__ */ new Map();
	_targets = [];
	_autoApprove = false;
	_dryRun = false;
	_noColor = false;
	_compactWarnings = false;
	_refresh = true;
	_reconfigure = false;
	_migrateState = false;
	_planFile;
	_outFile;
	_parallelism;
	_lockTimeout;
	_argumentBuilder;
	_stringFormatter;
	constructor(command, executor, workingDirectory) {
		this._command = command;
		this._executor = executor;
		this._workingDirectory = workingDirectory;
	}
	get argumentBuilder() {
		if (!this._argumentBuilder) this._argumentBuilder = this.createArgumentBuilder();
		return this._argumentBuilder;
	}
	get stringFormatter() {
		if (!this._stringFormatter) this._stringFormatter = this.createStringFormatter();
		return this._stringFormatter;
	}
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
	get useStringList() {
		return true;
	}
	get stringList() {
		return this.stringFormatter.toStringList();
	}
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
		addUnique(this._varFiles, filePath);
		return this;
	}
	removeVarFile(filePath) {
		removeItem(this._varFiles, filePath);
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
		addUnique(this._targets, target);
		return this;
	}
	removeTarget(target) {
		removeItem(this._targets, target);
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
		for (const [key, value] of this._environment.entries()) cloned.addEnvironmentVariable(key, value);
		for (const [key, value] of this._variables.entries()) cloned.addVariable(key, value);
		for (const varFile of this._varFiles) cloned.addVarFile(varFile);
		for (const [key, value] of this._backendConfig.entries()) cloned.addBackendConfig(key, value);
		for (const target of this._targets) cloned.addTarget(target);
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
};
//#endregion
//#region src/actions/iac/common/services/BaseIacStringFormatter.ts
/**
* Base string formatter for IaC commands
* Formats command arrays as single-line, multi-line, or string list representations
*/
var BaseIacStringFormatter = class {
	commandBuilder;
	constructor(commandBuilder) {
		this.commandBuilder = commandBuilder;
	}
	/**
	* Generate command as a single-line string
	* @returns Space-separated command string
	*/
	toString() {
		return this.commandBuilder.buildCommand().map((arg) => this.escapeArg(arg)).join(" ");
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
			} else if (i === 0) lines.push(arg + " \\");
			else if (i === 1) lines.push(`  ${arg}` + (isLast ? "" : " \\"));
			else lines.push(`  ${arg}` + (isLast ? "" : " \\"));
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
		if (/[\s"'\\$`]/.test(arg)) return `"${arg.replace(/"/g, "\\\"")}"`;
		return arg;
	}
};
//#endregion
//#region src/actions/iac/terraform/services/TerraformStringFormatter.ts
/**
* Formats Terraform commands as strings for display and debugging
* Delegates to BaseIacStringFormatter with a TerraformArgumentBuilder
*/
var TerraformStringFormatter = class extends BaseIacStringFormatter {
	constructor(provider) {
		super(new TerraformArgumentBuilder(provider));
	}
};
//#endregion
//#region src/actions/iac/terraform/services/TerraformService.ts
/**
* Main service implementation for Terraform operations
* Extends BaseIacService with Terraform-specific factory methods
*/
var TerraformService = class TerraformService extends BaseIacService {
	constructor(command, workingDirectory = ".") {
		super(command, "terraform", workingDirectory);
	}
	get command() {
		return super.command;
	}
	setCommand(command) {
		return super.setCommand(command);
	}
	createArgumentBuilder() {
		return new TerraformArgumentBuilder(this);
	}
	createStringFormatter() {
		return new TerraformStringFormatter(this);
	}
	resetSpecific() {}
	cloneSpecific(_target) {}
	createEmptyClone() {
		return new TerraformService(this.command, this.workingDirectory);
	}
	clone() {
		return super.clone();
	}
};
//#endregion
//#region src/actions/iac/terraform/TerraformBuilder.ts
/**
* Fluent builder for constructing Terraform service instances
* Extends BaseIacBuilder — only contains static factories and build()
*/
var TerraformBuilder = class TerraformBuilder extends BaseIacBuilder {
	/**
	* Private constructor - use static factory methods
	*/
	constructor() {
		super();
	}
	static create(command) {
		const builder = new TerraformBuilder();
		if (command) builder.withCommand(command);
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
	build() {
		if (!this._command) throw new Error("Terraform command is required. Use withCommand() or a static factory method.");
		const service = new TerraformService(this._command, this._workingDirectory);
		this.transferSharedState(service);
		return service;
	}
	resetSpecific() {}
	validateCommand(command) {
		if (!TERRAFORM_COMMANDS.includes(command)) throw new Error(`Invalid Terraform command: ${command}. Valid commands are: ${TERRAFORM_COMMANDS.join(", ")}`);
	}
};
//#endregion
//#region src/tools/terraform/settings.ts
/**
* Validates that a raw string is a valid TerraformCommand
*/
function validateTerraformCommand(input) {
	if (!TERRAFORM_COMMANDS.includes(input)) throw new Error(`Invalid terraform command: "${input}". Valid commands: ${TERRAFORM_COMMANDS.join(", ")}`);
	return input;
}
/**
* Get Terraform settings from agent inputs
*/
function getSettings(agent) {
	return {
		command: validateTerraformCommand(agent.getInput("command", true)),
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
//#endregion
//#region src/libs/version-manager/base-version-resolver.ts
/** Matches an exact semver version without prerelease suffix */
var SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
/**
* Abstract base class for version resolvers.
*
* Encapsulates the shared resolution logic used by all tool-specific resolvers.
* Subclasses only need to implement `fetchLatestVersion()`.
*
* Resolution priority:
* 1. `version` is 'skip' -> return undefined (do not install)
* 2. `version` is 'x.y.z' -> return as-is
* 3. `version` is 'latest' -> fetch from upstream
* 4. `version` is empty -> read version file -> resolve from file or latest
*/
var BaseVersionResolver = class {
	fileReader;
	toolName;
	constructor(fileReader, toolName) {
		this.fileReader = fileReader;
		this.toolName = toolName;
	}
	async resolve(version, versionFile, workingDirectory) {
		const trimmed = version.trim();
		if (trimmed === "skip") return;
		if (SEMVER_REGEX.test(trimmed)) return {
			input: trimmed,
			resolved: trimmed,
			source: "input"
		};
		if (trimmed === "latest") return {
			input: trimmed,
			resolved: await this.fetchLatestVersion(),
			source: "latest"
		};
		if (trimmed === "") {
			const fileVersion = await this.fileReader.read(workingDirectory, versionFile);
			if (fileVersion) return this.resolveFileVersion(fileVersion, versionFile);
			return {
				input: "latest",
				resolved: await this.fetchLatestVersion(),
				source: "latest"
			};
		}
		throw new Error(`Invalid ${this.toolName} version spec: '${trimmed}'. Use 'x.y.z', 'latest', or 'skip'.`);
	}
	/**
	* Resolve a version string read from a version file.
	* Supports: 'skip', 'latest', and exact 'x.y.z' specs.
	*/
	async resolveFileVersion(fileVersion, versionFile) {
		if (fileVersion === "skip") return;
		if (fileVersion === "latest") return {
			input: fileVersion,
			resolved: await this.fetchLatestVersion(),
			source: "file"
		};
		if (SEMVER_REGEX.test(fileVersion)) return {
			input: fileVersion,
			resolved: fileVersion,
			source: "file"
		};
		throw new Error(`Invalid version in ${versionFile}: '${fileVersion}'. Use 'x.y.z', 'latest', or 'skip'.`);
	}
};
//#endregion
//#region src/libs/version-manager/platform.ts
var SUPPORTED_PLATFORMS = new Set([
	"linux",
	"darwin",
	"win32"
]);
var SUPPORTED_ARCHES = new Set(["x64", "arm64"]);
/**
* Detect the current platform and architecture.
* Throws if the platform is unsupported.
*/
function getPlatform() {
	if (!SUPPORTED_PLATFORMS.has(process.platform)) throw new Error(`Unsupported platform: ${process.platform}. Supported: linux, darwin, windows.`);
	if (!SUPPORTED_ARCHES.has(process.arch)) throw new Error(`Unsupported architecture: ${process.arch}. Supported: x64 (amd64), arm64.`);
	return {
		os: process.platform === "win32" ? "windows" : process.platform,
		arch: process.arch === "arm64" ? "arm64" : "amd64"
	};
}
/**
* Get the cache directory for tool installations.
* Prefers $RUNNER_TOOL_CACHE (GitHub Actions) with fallback to $HOME.
*/
function getCacheDir(toolName, version) {
	const base = process.env["RUNNER_TOOL_CACHE"] || `${process.env["HOME"] ?? "/tmp"}/.tool-versions`;
	const { arch } = getPlatform();
	return `${base}/${toolName}/${version}/${arch}`;
}
//#endregion
//#region src/libs/version-manager/version-detector.ts
/**
* Module-level cache: one --version call per tool per action run.
* Safe because a GitHub Actions step runs in a single process.
*/
var versionCache = /* @__PURE__ */ new Map();
/** Regex for Terragrunt version output: "terragrunt version v0.75.10" */
var TERRAGRUNT_VERSION_RE = /terragrunt\s+version\s+v(\d+)\.(\d+)\.(\d+)/i;
/**
* Parse a version string from CLI output using the given regex.
* @returns SemVer or throws if the output doesn't match.
*/
function parseVersion(output, pattern, toolName) {
	const match = pattern.exec(output);
	if (!match?.[1] || !match[2] || !match[3]) throw new Error(`Failed to parse ${toolName} version from output: ${output.slice(0, 200)}`);
	return {
		major: parseInt(match[1], 10),
		minor: parseInt(match[2], 10),
		patch: parseInt(match[3], 10),
		raw: `${match[1]}.${match[2]}.${match[3]}`
	};
}
/**
* Detect the installed Terragrunt version.
* Result is cached per action run (one --version invocation per tool).
*
* Uses agent.exec() — the IToolAgent adapter method,
* NOT child_process. This is safe execFile-based execution.
*/
async function detectTerragruntVersion(agent) {
	const cached = versionCache.get("terragrunt");
	if (cached) return cached;
	const result = await agent.exec("terragrunt", ["--version"], {
		silent: true,
		ignoreReturnCode: true
	});
	if (result.exitCode !== 0) throw new Error(`terragrunt --version failed (exit ${result.exitCode}): ${result.stderr}`);
	const version = parseVersion(result.stdout, TERRAGRUNT_VERSION_RE, "Terragrunt");
	versionCache.set("terragrunt", version);
	return version;
}
/**
* Check if the detected version is Terragrunt v1.x or later (CLI redesign).
*/
function isV1OrLater(version) {
	return version.major >= 1;
}
//#endregion
//#region src/libs/version-manager/version-file-reader.ts
/**
* Reads version files (e.g., .terraform-version, .terragrunt-version)
* by walking up the directory tree from the starting directory.
*
* Compatible with tfenv and tgenv version file conventions.
*/
var VersionFileReader = class {
	constructor() {}
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
				if (version) return version;
			} catch {}
			const parentDir = dirname(currentDir);
			if (currentDir === home || parentDir === currentDir) break;
			currentDir = parentDir;
		}
		if (resolve(startDir) !== home) {
			const homeFilePath = join(home, fileName);
			try {
				const content = await readFile(homeFilePath, "utf-8");
				return this.parseVersionFile(content);
			} catch {}
		}
	}
	/**
	* Parse the version file content.
	* Returns the first non-empty, non-comment line, trimmed.
	*/
	parseVersionFile(content) {
		const lines = content.split("\n");
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith("#")) return trimmed;
		}
	}
};
//#endregion
//#region src/libs/version-manager/terraform-version-manager.ts
/** HashiCorp Terraform releases base URL */
var HASHICORP_RELEASES_URL = "https://releases.hashicorp.com/terraform";
/**
* Compare two semver version strings in descending order.
* Both strings must be in x.y.z format (validated before calling).
*/
function compareSemverDesc(a, b) {
	const ap = a.split(".").map(Number);
	const bp = b.split(".").map(Number);
	return bp[0] - ap[0] || bp[1] - ap[1] || bp[2] - ap[2];
}
/**
* Resolves a Terraform version spec to a concrete version string.
*
* Resolution priority:
* 1. `version` is 'skip' -> return undefined (do not install)
* 2. `version` is 'x.y.z' -> return as-is
* 3. `version` is 'latest' -> fetch from HashiCorp releases index
* 4. `version` is empty -> read version file -> resolve from file or latest
*
* Compatible with tfenv `.terraform-version` file conventions.
*/
var TerraformVersionResolver = class extends BaseVersionResolver {
	constructor(fileReader) {
		super(fileReader, "terraform");
	}
	/**
	* Fetch the latest stable Terraform version from the HashiCorp releases index.
	* Filters out prerelease versions (alpha, beta, rc).
	*/
	async fetchLatestVersion() {
		const response = await fetch(`${HASHICORP_RELEASES_URL}/index.json`);
		if (!response.ok) throw new Error(`Failed to fetch Terraform version index: ${response.status} ${response.statusText}`);
		const data = await response.json();
		const versions = Object.keys(data.versions).filter((v) => SEMVER_REGEX.test(v)).sort(compareSemverDesc);
		if (versions.length === 0) throw new Error("No stable Terraform versions found in the version index");
		return versions[0];
	}
};
/**
* Downloads and installs Terraform binaries from HashiCorp releases.
*
* Cache location: `$RUNNER_TOOL_CACHE/terraform/<version>/` in CI,
* `$HOME/.tool-versions/terraform/<version>/` locally.
*
* Cache lifetime: indefinite (content-addressed by version). Entries are
* never evicted — runners are ephemeral and caches are per-runner.
* For self-hosted runners, manually prune `$RUNNER_TOOL_CACHE` if disk space
* is a concern.
*
* Extraction uses the `unzip` command via agent's IToolAgent adapter
* method — NOT child_process. This is safe execFile-based invocation.
*/
var TerraformVersionInstaller = class {
	constructor() {}
	async isInstalled(version) {
		return existsSync(join(getCacheDir("terraform", version), getPlatform().os === "windows" ? "terraform.exe" : "terraform"));
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
		if (!response.ok) throw new Error(`Failed to download Terraform ${version}: ${response.status} ${response.statusText}`);
		await mkdir(cacheDir, { recursive: true });
		const zipPath = join(cacheDir, zipName);
		await writeFile(zipPath, Buffer.from(await response.arrayBuffer()));
		const result = await agent.exec("unzip", [
			"-o",
			zipPath,
			"-d",
			cacheDir
		], { silent: true });
		if (result.exitCode !== 0) throw new Error(`Failed to extract Terraform ${version}: ${result.stderr}`);
		await unlink(zipPath);
		await chmod(join(cacheDir, os === "windows" ? "terraform.exe" : "terraform"), 493);
		agent.info(`Terraform ${version} installed to ${cacheDir}`);
		return cacheDir;
	}
};
//#endregion
//#region src/libs/version-manager/terragrunt-version-manager.ts
/** GitHub Releases API endpoint for Terragrunt */
var TERRAGRUNT_LATEST_URL = "https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest";
/** GitHub Releases download base URL */
var TERRAGRUNT_DOWNLOAD_URL = "https://github.com/gruntwork-io/terragrunt/releases/download";
/**
* Resolves a Terragrunt version spec to a concrete version string.
*
* Resolution priority:
* 1. `version` is 'skip' -> return undefined (do not install)
* 2. `version` is 'x.y.z' -> return as-is
* 3. `version` is 'latest' -> fetch from GitHub Releases API
* 4. `version` is empty -> read version file -> resolve from file or latest
*
* Compatible with tgenv `.terragrunt-version` file conventions.
*/
var TerragruntVersionResolver = class extends BaseVersionResolver {
	constructor(fileReader) {
		super(fileReader, "terragrunt");
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
		if (token) headers["Authorization"] = `Bearer ${token}`;
		const response = await fetch(TERRAGRUNT_LATEST_URL, { headers });
		if (!response.ok) {
			const hint = response.status === 403 ? " (GitHub API rate limit -- set GITHUB_TOKEN to increase the limit)" : "";
			throw new Error(`Failed to fetch latest Terragrunt version: ${response.status} ${response.statusText}${hint}`);
		}
		const tag = (await response.json()).tag_name;
		const version = tag.startsWith("v") ? tag.slice(1) : tag;
		if (!SEMVER_REGEX.test(version)) throw new Error(`Unexpected Terragrunt latest version format: '${tag}'`);
		return version;
	}
};
/**
* Downloads and installs Terragrunt binaries from GitHub Releases.
*
* Terragrunt releases are standalone binaries (no archive extraction needed).
* The binary is downloaded directly and made executable.
*
* Cache location: `$RUNNER_TOOL_CACHE/terragrunt/<version>/` in CI,
* `$HOME/.tool-versions/terragrunt/<version>/` locally.
*
* Cache lifetime: indefinite (content-addressed by version). See
* TerraformVersionInstaller for eviction notes.
*
* Uses the GitHub Actions tool cache directory ($RUNNER_TOOL_CACHE) when
* available, with a fallback to $HOME/.tool-versions for local development.
*/
var TerragruntVersionInstaller = class {
	constructor() {}
	async isInstalled(version) {
		return existsSync(join(getCacheDir("terragrunt", version), getPlatform().os === "windows" ? "terragrunt.exe" : "terragrunt"));
	}
	async install(version, agent) {
		const cacheDir = getCacheDir("terragrunt", version);
		if (await this.isInstalled(version)) {
			agent.info(`Terragrunt ${version} already cached at ${cacheDir}`);
			return cacheDir;
		}
		const { os, arch } = getPlatform();
		const binaryName = os === "windows" ? "terragrunt.exe" : "terragrunt";
		const url = `${TERRAGRUNT_DOWNLOAD_URL}/v${version}/${`terragrunt_${os}_${arch}`}`;
		agent.info(`Downloading Terragrunt ${version} from ${url}`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to download Terragrunt ${version}: ${response.status} ${response.statusText}`);
		await mkdir(cacheDir, { recursive: true });
		const binaryPath = join(cacheDir, binaryName);
		await writeFile(binaryPath, Buffer.from(await response.arrayBuffer()));
		await chmod(binaryPath, 493);
		agent.info(`Terragrunt ${version} installed to ${cacheDir}`);
		return cacheDir;
	}
};
//#endregion
//#region src/tools/common/iac-helpers.ts
/**
* Resolve and optionally install a tool version.
* When the resolver returns undefined (i.e. 'skip'), the runner uses
* whatever binary is already on PATH.
*/
async function setupToolVersion(agent, toolName, version, versionFile, workingDirectory, resolver, installer) {
	agent.startGroup(`${toolName} version setup`);
	try {
		const spec = await resolver.resolve(version, versionFile, workingDirectory);
		if (!spec) {
			agent.info(`${toolName} version: skip (using existing PATH binary)`);
			return;
		}
		agent.info(`${toolName} version: ${spec.resolved} (source: ${spec.source})`);
		const cacheDir = await installer.install(spec.resolved, agent);
		agent.addPath(cacheDir);
	} finally {
		agent.endGroup();
	}
}
/**
* Apply the 17 shared settings to an IaC builder.
* Returns the builder for continued chaining.
*/
function configureSharedIacBuilder(builder, settings) {
	if (Object.keys(settings.variables).length > 0) builder.withVariables(settings.variables);
	if (settings.varFiles.length > 0) builder.withVarFiles(settings.varFiles);
	if (Object.keys(settings.backendConfig).length > 0) builder.withBackendConfigs(settings.backendConfig);
	if (settings.targets.length > 0) builder.withTargets(settings.targets);
	if (settings.autoApprove) builder.withAutoApprove();
	if (settings.planFile) {
		if (settings.command === "apply") builder.withPlanFile(settings.planFile);
		else if (settings.command === "plan") builder.withOutFile(settings.planFile);
	}
	if (settings.noColor) builder.withNoColor();
	if (settings.compactWarnings) builder.withCompactWarnings();
	if (settings.parallelism) {
		const value = parseInt(settings.parallelism, 10);
		if (!isNaN(value)) builder.withParallelism(value);
	}
	if (settings.lockTimeout) builder.withLockTimeout(settings.lockTimeout);
	if (settings.refresh === "false") builder.withoutRefresh();
	if (settings.reconfigure) builder.withReconfigure();
	if (settings.migrateState) builder.withMigrateState();
	if (settings.dryRun) builder.withDryRun();
	return builder;
}
/**
* Run an IaC command through the agent.
* Shared flow: build command → log → dry-run check → agent.run → exit code.
*
* NOTE: This calls agent.exec() — the IAgent interface method that
* delegates to @actions/exec (execFile under the hood), NOT child_process.
*/
async function executeIacCommand(agent, toolLabel, service, settings, successFn, failureFn) {
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
		return successFn({
			...baseOutputs,
			"exit-code": "0",
			stdout: "",
			stderr: ""
		});
	}
	const [cmd, ...cmdArgs] = commandArgs;
	if (!cmd) return failureFn(/* @__PURE__ */ new Error(`${toolLabel} produced an empty command`));
	const result = await agent.exec(cmd, cmdArgs, {
		cwd: settings.workingDirectory,
		ignoreReturnCode: true
	});
	const outputs = {
		...baseOutputs,
		"exit-code": result.exitCode.toString(),
		stdout: result.stdout,
		stderr: result.stderr
	};
	if (result.exitCode !== 0) return failureFn(/* @__PURE__ */ new Error(`${toolLabel} failed with exit code ${result.exitCode}`), outputs);
	return successFn(outputs);
}
//#endregion
//#region src/tools/terraform/runner.ts
var resolver = new TerraformVersionResolver(new VersionFileReader());
var installer = new TerraformVersionInstaller();
/**
* Terraform runner
* Handles command generation and execution for Terraform operations
*/
var TerraformRunner = class extends RunnerBase {
	name = "terraform";
	steps = new Map([["execute", this.runExecute.bind(this)]]);
	constructor() {
		super();
	}
	/**
	* Execute step: Build and run the Terraform command.
	* All command execution goes through IAgent (not child_process).
	*/
	async runExecute(agent) {
		try {
			const settings = getSettings(agent);
			agent.info(`Starting Terraform ${settings.command} action...`);
			await setupToolVersion(agent, "Terraform", settings.terraformVersion, settings.terraformVersionFile, settings.workingDirectory, resolver, installer);
			const builder = TerraformBuilder.create(settings.command).withWorkingDirectory(settings.workingDirectory);
			configureSharedIacBuilder(builder, settings);
			const service = builder.build();
			return await executeIacCommand(agent, `Terraform ${settings.command}`, service, settings, this.success.bind(this), this.failure.bind(this));
		} catch (error) {
			return this.failure(error instanceof Error ? error : new Error(String(error)));
		}
	}
};
/**
* Factory function to create a Terraform runner
*/
function createTerraformRunner() {
	return new TerraformRunner();
}
//#endregion
export { TerragruntVersionInstaller as a, TerraformVersionResolver as c, isV1OrLater as d, BaseIacStringFormatter as f, BaseIacBuilder as g, TERRAFORM_COMMANDS as h, setupToolVersion as i, VersionFileReader as l, BaseIacArgumentBuilder as m, configureSharedIacBuilder as n, TerragruntVersionResolver as o, BaseIacService as p, executeIacCommand as r, TerraformVersionInstaller as s, createTerraformRunner as t, detectTerragruntVersion as u };

//# sourceMappingURL=terraform.mjs.map