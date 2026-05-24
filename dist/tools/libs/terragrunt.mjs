import "./agents.mjs";
import { a as ValidationUtils, d as removeItem, f as RunnerBase, o as parseCommaSeparated, s as parseJsonObject, u as addUnique } from "./deployment-gate.mjs";
import { a as TerragruntVersionInstaller, c as TerraformVersionResolver, d as isV1OrLater, f as BaseIacStringFormatter, g as BaseIacBuilder, h as TERRAFORM_COMMANDS, i as setupToolVersion, l as VersionFileReader, m as BaseIacArgumentBuilder, n as configureSharedIacBuilder, o as TerragruntVersionResolver, p as BaseIacService, r as executeIacCommand, s as TerraformVersionInstaller, u as detectTerragruntVersion } from "./terraform.mjs";
//#region src/actions/iac/terragrunt/interfaces/ITerragruntProvider.ts
/**
* All valid Terragrunt commands
*/
var TERRAGRUNT_COMMANDS = [
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
	"run-all",
	"graph-dependencies",
	"hclfmt",
	"aws-provider-patch",
	"render-json",
	"output-module-groups",
	"validate-inputs"
];
//#endregion
//#region src/actions/iac/terragrunt/services/TerragruntFlagMapping.ts
/**
* Maps semantic flag names to their v0.x and v1.x CLI representations.
* Only includes flags currently used by the action.
*/
var TERRAGRUNT_FLAG_MAP = {
	config: {
		v0: "--terragrunt-config",
		v1: "--config"
	},
	workingDir: {
		v0: "--terragrunt-working-dir",
		v1: "--working-dir"
	},
	noAutoInit: {
		v0: "--terragrunt-no-auto-init",
		v1: "--no-auto-init"
	},
	noAutoRetry: {
		v0: "--terragrunt-no-auto-retry",
		v1: "--no-auto-retry"
	},
	nonInteractive: {
		v0: "--terragrunt-non-interactive",
		v1: "--non-interactive"
	},
	parallelism: {
		v0: "--terragrunt-parallelism",
		v1: "--parallelism"
	},
	includeDir: {
		v0: "--terragrunt-include-dir",
		v1: "--queue-include-dir"
	},
	excludeDir: {
		v0: "--terragrunt-exclude-dir",
		v1: "--queue-exclude-dir"
	},
	ignoreDependencyErrors: {
		v0: "--terragrunt-ignore-dependency-errors",
		v1: "--queue-ignore-errors"
	},
	ignoreExternalDeps: {
		v0: "--terragrunt-ignore-external-dependencies",
		v1: "--queue-exclude-external"
	},
	includeExternalDeps: {
		v0: "--terragrunt-include-external-dependencies",
		v1: "--queue-include-external"
	},
	source: {
		v0: "--terragrunt-source",
		v1: "--source"
	},
	sourceMap: {
		v0: "--terragrunt-source-map",
		v1: "--source-map"
	},
	downloadDir: {
		v0: "--terragrunt-download-dir",
		v1: "--download-dir"
	},
	iamRole: {
		v0: "--terragrunt-iam-role",
		v1: "--iam-role"
	},
	iamRoleSessionName: {
		v0: "--terragrunt-iam-role-session-name",
		v1: "--iam-role-session-name"
	},
	strictInclude: {
		v0: "--terragrunt-strict-include",
		v1: "--queue-strict-include"
	}
};
/**
* Maps v0.x command names to their v1.x multi-word equivalents.
* Each entry is an array of tokens for the v1.x command.
*/
var TERRAGRUNT_COMMAND_MAP = {
	"run-all": ["run", "--all"],
	"graph-dependencies": ["dag", "graph"],
	hclfmt: ["hcl", "fmt"],
	"render-json": [
		"render",
		"--json",
		"-w"
	],
	"output-module-groups": [
		"find",
		"--dag",
		"--json"
	],
	"validate-inputs": ["validate", "inputs"]
};
/** Commands removed in v1.x with no equivalent */
var REMOVED_V1_COMMANDS = ["aws-provider-patch"];
/**
* Select the correct flag string based on the Terragrunt major version.
*
* @param flagKey - Semantic key from TERRAGRUNT_FLAG_MAP (e.g., 'config', 'workingDir')
* @param majorVersion - Detected Terragrunt major version (0 for legacy, 1+ for CLI redesign)
* @returns The correct CLI flag string for the given version
* @throws Error if the flag key is not found in the mapping table
*/
function selectFlag(flagKey, majorVersion) {
	const mapping = TERRAGRUNT_FLAG_MAP[flagKey];
	if (!mapping) throw new Error(`Unknown Terragrunt flag key: ${flagKey}`);
	return majorVersion >= 1 ? mapping.v1 : mapping.v0;
}
//#endregion
//#region src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.ts
/**
* Builds command-line arguments for Terragrunt commands.
* Extends BaseIacArgumentBuilder with Terragrunt-specific global arguments.
*
* Version-aware: uses `provider.terragruntMajorVersion` to emit the correct
* flag format (v0.x `--terragrunt-*` or v1.x short flags) and to translate
* commands that were renamed in the CLI redesign.
*/
var TerragruntArgumentBuilder = class extends BaseIacArgumentBuilder {
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
	* Generate full command array including executor and command.
	*
	* Handles version-aware command translation:
	* - run-all: v0.x `run-all <cmd>` → v1.x `run --all <cmd>`
	* - Renamed commands: v0.x `hclfmt` → v1.x `hcl fmt`, etc.
	* - Removed commands: throws an error with a clear message
	*
	* @returns Full command array ready for execution
	*/
	buildCommand() {
		const command = this.provider.command;
		const isV1 = this.provider.terragruntMajorVersion >= 1;
		const args = this.toCommandArgs();
		if (this.provider.runAll && this.isTerraformCommand(command)) {
			if (isV1) return [
				this.provider.executor,
				"run",
				"--all",
				command,
				...args
			];
			return [
				this.provider.executor,
				"run-all",
				command,
				...args
			];
		}
		if (isV1 && REMOVED_V1_COMMANDS.includes(command)) throw new Error(`Command '${command}' was removed in Terragrunt v1.x and has no equivalent.`);
		if (isV1 && command in TERRAGRUNT_COMMAND_MAP) {
			const v1Tokens = TERRAGRUNT_COMMAND_MAP[command];
			return [
				this.provider.executor,
				...v1Tokens,
				...args
			];
		}
		return [
			this.provider.executor,
			command,
			...args
		];
	}
	/**
	* Add terragrunt-specific global arguments.
	* Uses selectFlag() to emit the correct flag format for the detected version.
	*/
	addTerragruntGlobalArgs(args) {
		const v = this.provider.terragruntMajorVersion;
		if (this.provider.terragruntConfig) args.push(selectFlag("config", v), this.provider.terragruntConfig);
		if (this.provider.terragruntWorkingDir) args.push(selectFlag("workingDir", v), this.provider.terragruntWorkingDir);
		if (this.provider.noAutoInit) args.push(selectFlag("noAutoInit", v));
		if (this.provider.noAutoRetry) args.push(selectFlag("noAutoRetry", v));
		if (this.provider.nonInteractive) args.push(selectFlag("nonInteractive", v));
		if (this.provider.runAll && this.provider.terragruntParallelism !== void 0) args.push(selectFlag("parallelism", v), String(this.provider.terragruntParallelism));
		for (const dir of this.provider.includeDirs) args.push(selectFlag("includeDir", v), dir);
		for (const dir of this.provider.excludeDirs) args.push(selectFlag("excludeDir", v), dir);
		if (this.provider.ignoreDependencyErrors) args.push(selectFlag("ignoreDependencyErrors", v));
		if (this.provider.ignoreExternalDependencies) args.push(selectFlag("ignoreExternalDeps", v));
		if (this.provider.includeExternalDependencies) args.push(selectFlag("includeExternalDeps", v));
		if (this.provider.terragruntSource) args.push(selectFlag("source", v), this.provider.terragruntSource);
		for (const [original, newSource] of this.provider.sourceMap.entries()) args.push(selectFlag("sourceMap", v), `${original}=${newSource}`);
		if (this.provider.downloadDir) args.push(selectFlag("downloadDir", v), this.provider.downloadDir);
		if (this.provider.iamRole) args.push(selectFlag("iamRole", v), this.provider.iamRole);
		if (this.provider.iamRoleSessionName) args.push(selectFlag("iamRoleSessionName", v), this.provider.iamRoleSessionName);
		if (this.provider.strictInclude) args.push(selectFlag("strictInclude", v));
	}
	/**
	* Add terraform-related arguments
	*/
	addTerraformArgs(args) {
		const command = this.provider.command;
		if (!this.isTerraformCommand(command)) return;
		this.addAllSharedArguments(args, command);
	}
	/**
	* Check if command is a terraform command
	*/
	isTerraformCommand(command) {
		return TERRAFORM_COMMANDS.includes(command);
	}
};
//#endregion
//#region src/actions/iac/terragrunt/services/TerragruntStringFormatter.ts
/**
* Formats Terragrunt commands as strings for display and debugging
* Delegates to BaseIacStringFormatter with a TerragruntArgumentBuilder
*/
var TerragruntStringFormatter = class extends BaseIacStringFormatter {
	constructor(provider) {
		super(new TerragruntArgumentBuilder(provider));
	}
};
//#endregion
//#region src/actions/iac/terragrunt/services/TerragruntService.ts
/**
* Main service implementation for Terragrunt operations
* Extends BaseIacService with Terragrunt-specific state and factory methods
*/
var TerragruntService = class TerragruntService extends BaseIacService {
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
	_terragruntMajorVersion = 0;
	constructor(command, workingDirectory = ".") {
		super(command, "terragrunt", workingDirectory);
	}
	get executor() {
		return "terragrunt";
	}
	get command() {
		return super.command;
	}
	setCommand(command) {
		return super.setCommand(command);
	}
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
	get terragruntMajorVersion() {
		return this._terragruntMajorVersion;
	}
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
		addUnique(this._includeDirs, directory);
		return this;
	}
	removeIncludeDir(directory) {
		removeItem(this._includeDirs, directory);
		return this;
	}
	clearIncludeDirs() {
		this._includeDirs.length = 0;
		return this;
	}
	addExcludeDir(directory) {
		addUnique(this._excludeDirs, directory);
		return this;
	}
	removeExcludeDir(directory) {
		removeItem(this._excludeDirs, directory);
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
	setTerragruntMajorVersion(version) {
		this._terragruntMajorVersion = version;
		return this;
	}
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
		this._terragruntMajorVersion = 0;
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
		for (const dir of this._includeDirs) t.addIncludeDir(dir);
		for (const dir of this._excludeDirs) t.addExcludeDir(dir);
		t.setIgnoreDependencyErrors(this._ignoreDependencyErrors);
		t.setIgnoreExternalDependencies(this._ignoreExternalDependencies);
		t.setIncludeExternalDependencies(this._includeExternalDependencies);
		t.setTerragruntSource(this._terragruntSource);
		for (const [original, newSource] of this._sourceMap.entries()) t.addSourceMap(original, newSource);
		t.setDownloadDir(this._downloadDir);
		t.setIamRole(this._iamRole);
		t.setIamRoleSessionName(this._iamRoleSessionName);
		t.setStrictInclude(this._strictInclude);
		t.setTerragruntMajorVersion(this._terragruntMajorVersion);
	}
	createEmptyClone() {
		return new TerragruntService(this.command, this.workingDirectory);
	}
	clone() {
		return super.clone();
	}
};
//#endregion
//#region src/actions/iac/terragrunt/TerragruntBuilder.ts
/**
* Fluent builder for constructing Terragrunt service instances
* Extends BaseIacBuilder with Terragrunt-specific builder methods
*/
var TerragruntBuilder = class TerragruntBuilder extends BaseIacBuilder {
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
	_terragruntMajorVersion = 0;
	/**
	* Private constructor - use static factory methods
	*/
	constructor() {
		super();
	}
	static create(command) {
		const builder = new TerragruntBuilder();
		if (command) builder.withCommand(command);
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
		if (level < 1) throw new Error("Terragrunt parallelism level must be at least 1");
		this._terragruntParallelism = level;
		return this;
	}
	withIncludeDir(directory) {
		ValidationUtils.validateStringInput(directory, "include directory");
		addUnique(this._includeDirs, directory);
		return this;
	}
	withIncludeDirs(directories) {
		for (const dir of directories) this.withIncludeDir(dir);
		return this;
	}
	withExcludeDir(directory) {
		ValidationUtils.validateStringInput(directory, "exclude directory");
		addUnique(this._excludeDirs, directory);
		return this;
	}
	withExcludeDirs(directories) {
		for (const dir of directories) this.withExcludeDir(dir);
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
		for (const [original, newSource] of Object.entries(sourceMap)) this.withSourceMap(original, newSource);
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
	withTerragruntMajorVersion(major) {
		this._terragruntMajorVersion = major;
		return this;
	}
	build() {
		if (!this._command) throw new Error("Terragrunt command is required. Use withCommand() or a static factory method.");
		const service = new TerragruntService(this._command, this._workingDirectory);
		this.transferSharedState(service);
		service.setTerragruntConfig(this._terragruntConfig);
		service.setTerragruntWorkingDir(this._terragruntWorkingDir);
		service.setRunAll(this._runAll);
		service.setNoAutoInit(this._noAutoInit);
		service.setNoAutoRetry(this._noAutoRetry);
		service.setNonInteractive(this._nonInteractive);
		service.setTerragruntParallelism(this._terragruntParallelism);
		for (const dir of this._includeDirs) service.addIncludeDir(dir);
		for (const dir of this._excludeDirs) service.addExcludeDir(dir);
		service.setIgnoreDependencyErrors(this._ignoreDependencyErrors);
		service.setIgnoreExternalDependencies(this._ignoreExternalDependencies);
		service.setIncludeExternalDependencies(this._includeExternalDependencies);
		service.setTerragruntSource(this._terragruntSource);
		for (const [original, newSource] of this._sourceMap.entries()) service.addSourceMap(original, newSource);
		service.setDownloadDir(this._downloadDir);
		service.setIamRole(this._iamRole);
		service.setIamRoleSessionName(this._iamRoleSessionName);
		service.setStrictInclude(this._strictInclude);
		service.setTerragruntMajorVersion(this._terragruntMajorVersion);
		return service;
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
		this._terragruntMajorVersion = 0;
	}
	validateCommand(command) {
		if (!TERRAGRUNT_COMMANDS.includes(command)) throw new Error(`Invalid Terragrunt command: ${command}. Valid commands are: ${TERRAGRUNT_COMMANDS.join(", ")}`);
	}
};
(class TerragruntBuilderFactory {
	static {
		new TerragruntBuilderFactory();
	}
	constructor() {}
	/**
	* Get a new TerragruntBuilder instance
	* @param command - Optional initial command
	*/
	static builder(command) {
		return TerragruntBuilder.create(command);
	}
	/**
	* Create a terragrunt init service
	* @param workingDir - Working directory for terragrunt
	*/
	static init(workingDir) {
		return TerragruntBuilder.forInit().withWorkingDirectory(workingDir).withNonInteractive().build();
	}
	/**
	* Create a terragrunt run-all init service
	* @param workingDir - Working directory for terragrunt
	*/
	static runAllInit(workingDir) {
		return TerragruntBuilder.forInit().withWorkingDirectory(workingDir).withRunAll().withNonInteractive().build();
	}
	/**
	* Create a terragrunt validate service
	* @param workingDir - Working directory for terragrunt
	*/
	static validate(workingDir) {
		return TerragruntBuilder.forValidate().withWorkingDirectory(workingDir).build();
	}
	/**
	* Create a terragrunt run-all validate service
	* @param workingDir - Working directory for terragrunt
	*/
	static runAllValidate(workingDir) {
		return TerragruntBuilder.forValidate().withWorkingDirectory(workingDir).withRunAll().build();
	}
	/**
	* Create a terragrunt fmt service
	* @param workingDir - Working directory for terragrunt
	*/
	static fmt(workingDir) {
		return TerragruntBuilder.forFmt().withWorkingDirectory(workingDir).build();
	}
	/**
	* Create a terragrunt hclfmt service
	* @param workingDir - Working directory for terragrunt
	*/
	static hclFmt(workingDir) {
		return TerragruntBuilder.forHclFmt().withWorkingDirectory(workingDir).build();
	}
	/**
	* Create a terragrunt plan service
	* @param workingDir - Working directory for terragrunt
	* @param variables - Optional terraform variables
	*/
	static plan(workingDir, variables) {
		const builder = TerragruntBuilder.forPlan().withWorkingDirectory(workingDir).withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt run-all plan service
	* @param workingDir - Working directory for terragrunt
	* @param variables - Optional terraform variables
	*/
	static runAllPlan(workingDir, variables) {
		const builder = TerragruntBuilder.forRunAllPlan().withWorkingDirectory(workingDir).withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt plan service with output file
	* @param workingDir - Working directory for terragrunt
	* @param outFile - Path to save the plan file
	* @param variables - Optional terraform variables
	*/
	static planWithOutput(workingDir, outFile, variables) {
		const builder = TerragruntBuilder.forPlan().withWorkingDirectory(workingDir).withOutFile(outFile).withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt plan service with targets
	* @param workingDir - Working directory for terragrunt
	* @param targets - Resource addresses to target
	* @param variables - Optional terraform variables
	*/
	static planWithTargets(workingDir, targets, variables) {
		const builder = TerragruntBuilder.forPlan().withWorkingDirectory(workingDir).withTargets(targets).withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt apply service with auto-approve
	* @param workingDir - Working directory for terragrunt
	* @param variables - Optional terraform variables
	*/
	static apply(workingDir, variables) {
		const builder = TerragruntBuilder.forApply().withWorkingDirectory(workingDir).withAutoApprove().withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt run-all apply service with auto-approve
	* @param workingDir - Working directory for terragrunt
	* @param variables - Optional terraform variables
	*/
	static runAllApply(workingDir, variables) {
		const builder = TerragruntBuilder.forRunAllApply().withWorkingDirectory(workingDir).withAutoApprove().withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt apply service from a plan file
	* @param workingDir - Working directory for terragrunt
	* @param planFile - Path to the plan file
	*/
	static applyPlan(workingDir, planFile) {
		return TerragruntBuilder.forApply().withWorkingDirectory(workingDir).withPlanFile(planFile).withAutoApprove().withNonInteractive().build();
	}
	/**
	* Create a terragrunt apply service with targets
	* @param workingDir - Working directory for terragrunt
	* @param targets - Resource addresses to target
	* @param variables - Optional terraform variables
	*/
	static applyWithTargets(workingDir, targets, variables) {
		const builder = TerragruntBuilder.forApply().withWorkingDirectory(workingDir).withTargets(targets).withAutoApprove().withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt destroy service with auto-approve
	* @param workingDir - Working directory for terragrunt
	* @param variables - Optional terraform variables
	*/
	static destroy(workingDir, variables) {
		const builder = TerragruntBuilder.forDestroy().withWorkingDirectory(workingDir).withAutoApprove().withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt run-all destroy service with auto-approve
	* @param workingDir - Working directory for terragrunt
	* @param variables - Optional terraform variables
	*/
	static runAllDestroy(workingDir, variables) {
		const builder = TerragruntBuilder.forRunAllDestroy().withWorkingDirectory(workingDir).withAutoApprove().withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt destroy service with targets
	* @param workingDir - Working directory for terragrunt
	* @param targets - Resource addresses to target
	* @param variables - Optional terraform variables
	*/
	static destroyWithTargets(workingDir, targets, variables) {
		const builder = TerragruntBuilder.forDestroy().withWorkingDirectory(workingDir).withTargets(targets).withAutoApprove().withNonInteractive();
		if (variables) builder.withVariables(variables);
		return builder.build();
	}
	/**
	* Create a terragrunt output service
	* @param workingDir - Working directory for terragrunt
	*/
	static output(workingDir) {
		return TerragruntBuilder.forOutput().withWorkingDirectory(workingDir).build();
	}
	/**
	* Create a terragrunt graph-dependencies service
	* @param workingDir - Working directory for terragrunt
	*/
	static graphDependencies(workingDir) {
		return TerragruntBuilder.forGraphDependencies().withWorkingDirectory(workingDir).build();
	}
	/**
	* Create a terragrunt validate-inputs service
	* @param workingDir - Working directory for terragrunt
	*/
	static validateInputs(workingDir) {
		return TerragruntBuilder.forValidateInputs().withWorkingDirectory(workingDir).build();
	}
});
//#endregion
//#region src/tools/terragrunt/settings.ts
/**
* Validates that a raw string is a valid TerragruntCommand
*/
function validateTerragruntCommand(input) {
	if (!TERRAGRUNT_COMMANDS.includes(input)) throw new Error(`Invalid terragrunt command: "${input}". Valid commands: ${TERRAGRUNT_COMMANDS.join(", ")}`);
	return input;
}
/**
* Get Terragrunt settings from agent inputs
*/
function getSettings(agent) {
	return {
		command: validateTerragruntCommand(agent.getInput("command", true)),
		workingDirectory: agent.getInput("working-directory") || ".",
		terraformVersion: agent.getInput("terraform-version"),
		terraformVersionFile: agent.getInput("terraform-version-file") || ".terraform-version",
		terragruntVersion: agent.getInput("terragrunt-version"),
		terragruntVersionFile: agent.getInput("terragrunt-version-file") || ".terragrunt-version",
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
//#endregion
//#region src/tools/terragrunt/runner.ts
var fileReader = new VersionFileReader();
var tfResolver = new TerraformVersionResolver(fileReader);
var tfInstaller = new TerraformVersionInstaller();
var tgResolver = new TerragruntVersionResolver(fileReader);
var tgInstaller = new TerragruntVersionInstaller();
/**
* Terragrunt runner
* Handles command generation and execution for Terragrunt operations
*/
var TerragruntRunner = class extends RunnerBase {
	name = "terragrunt";
	steps = new Map([["execute", this.runExecute.bind(this)]]);
	constructor() {
		super();
	}
	/**
	* Execute step: Build and run the Terragrunt command.
	* All command execution goes through IAgent (not child_process).
	*/
	async runExecute(agent) {
		try {
			const settings = getSettings(agent);
			const modeLabel = settings.runAll ? "run-all " : "";
			agent.info(`Starting Terragrunt ${modeLabel}${settings.command} action...`);
			await setupToolVersion(agent, "Terraform", settings.terraformVersion, settings.terraformVersionFile, settings.workingDirectory, tfResolver, tfInstaller);
			const tgMajor = await this.setupTerragruntVersion(agent, settings);
			const service = this.buildService(settings, tgMajor);
			return await executeIacCommand(agent, `Terragrunt ${modeLabel}${settings.command}`, service, settings, this.success.bind(this), this.failure.bind(this));
		} catch (error) {
			return this.failure(error instanceof Error ? error : new Error(String(error)));
		}
	}
	/**
	* Resolve and optionally install the requested Terragrunt version.
	* After installation, detects the major version for v0/v1 flag selection.
	* @returns The detected major version number (0 for v0.x, 1 for v1.x+)
	*/
	async setupTerragruntVersion(agent, settings) {
		agent.startGroup("Terragrunt version setup");
		try {
			const spec = await tgResolver.resolve(settings.terragruntVersion, settings.terragruntVersionFile, settings.workingDirectory);
			if (spec) {
				agent.info(`Terragrunt version: ${spec.resolved} (source: ${spec.source})`);
				const cacheDir = await tgInstaller.install(spec.resolved, agent);
				agent.addPath(cacheDir);
			} else agent.info("Terragrunt version: skip (using existing PATH binary)");
			const detected = await detectTerragruntVersion(agent);
			const majorLabel = isV1OrLater(detected) ? "v1.x+ (new CLI)" : "v0.x (classic CLI)";
			agent.info(`Detected Terragrunt ${detected.raw} — ${majorLabel}`);
			return detected.major;
		} finally {
			agent.endGroup();
		}
	}
	/**
	* Build the Terragrunt service from settings
	*/
	buildService(settings, terragruntMajorVersion) {
		const builder = TerragruntBuilder.create(settings.command);
		builder.withWorkingDirectory(settings.workingDirectory);
		builder.withTerragruntMajorVersion(terragruntMajorVersion);
		configureSharedIacBuilder(builder, settings);
		if (settings.runAll) builder.withRunAll();
		if (settings.terragruntConfig) builder.withTerragruntConfig(settings.terragruntConfig);
		if (settings.terragruntWorkingDir) builder.withTerragruntWorkingDir(settings.terragruntWorkingDir);
		if (settings.nonInteractive) builder.withNonInteractive();
		if (settings.noAutoInit) builder.withNoAutoInit();
		if (settings.noAutoRetry) builder.withNoAutoRetry();
		if (settings.terragruntParallelism) {
			const value = parseInt(settings.terragruntParallelism, 10);
			if (!isNaN(value)) builder.withTerragruntParallelism(value);
		}
		if (settings.includeDirs.length > 0) builder.withIncludeDirs(settings.includeDirs);
		if (settings.excludeDirs.length > 0) builder.withExcludeDirs(settings.excludeDirs);
		if (settings.ignoreDependencyErrors) builder.withIgnoreDependencyErrors();
		if (settings.ignoreExternalDependencies) builder.withIgnoreExternalDependencies();
		if (settings.includeExternalDependencies) builder.withIncludeExternalDependencies();
		if (settings.terragruntSource) builder.withTerragruntSource(settings.terragruntSource);
		if (Object.keys(settings.sourceMap).length > 0) builder.withSourceMaps(settings.sourceMap);
		if (settings.downloadDir) builder.withDownloadDir(settings.downloadDir);
		if (settings.iamRole) if (settings.iamRoleSessionName) builder.withIamRoleAndSession(settings.iamRole, settings.iamRoleSessionName);
		else builder.withIamRole(settings.iamRole);
		if (settings.strictInclude) builder.withStrictInclude();
		return builder.build();
	}
};
/**
* Factory function to create a Terragrunt runner
*/
function createTerragruntRunner() {
	return new TerragruntRunner();
}
//#endregion
export { createTerragruntRunner as t };

//# sourceMappingURL=terragrunt.mjs.map