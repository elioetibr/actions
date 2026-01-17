import { ITerragruntBuilder, ITerragruntService, TerragruntCommand } from './interfaces';
/**
 * Fluent builder for constructing Terragrunt service instances
 * Provides a type-safe API for configuring Terragrunt commands
 */
export declare class TerragruntBuilder implements ITerragruntBuilder {
    private _command;
    private _workingDirectory;
    private readonly _environment;
    private readonly _variables;
    private readonly _varFiles;
    private readonly _backendConfig;
    private readonly _targets;
    private _autoApprove;
    private _dryRun;
    private _noColor;
    private _compactWarnings;
    private _refresh;
    private _reconfigure;
    private _migrateState;
    private _planFile;
    private _outFile;
    private _parallelism;
    private _lockTimeout;
    private _terragruntConfig;
    private _terragruntWorkingDir;
    private _runAll;
    private _noAutoInit;
    private _noAutoRetry;
    private _nonInteractive;
    private _terragruntParallelism;
    private readonly _includeDirs;
    private readonly _excludeDirs;
    private _ignoreDependencyErrors;
    private _ignoreExternalDependencies;
    private _includeExternalDependencies;
    private _terragruntSource;
    private readonly _sourceMap;
    private _downloadDir;
    private _iamRole;
    private _iamRoleSessionName;
    private _strictInclude;
    /**
     * Private constructor - use static factory methods
     */
    private constructor();
    /**
     * Create a new TerragruntBuilder instance
     * @param command - Optional initial command
     */
    static create(command?: TerragruntCommand): TerragruntBuilder;
    /**
     * Create a builder for terragrunt init
     */
    static forInit(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt validate
     */
    static forValidate(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt fmt
     */
    static forFmt(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt hclfmt
     */
    static forHclFmt(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt plan
     */
    static forPlan(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt apply
     */
    static forApply(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt destroy
     */
    static forDestroy(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt output
     */
    static forOutput(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt run-all plan
     */
    static forRunAllPlan(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt run-all apply
     */
    static forRunAllApply(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt run-all destroy
     */
    static forRunAllDestroy(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt graph-dependencies
     */
    static forGraphDependencies(): TerragruntBuilder;
    /**
     * Create a builder for terragrunt validate-inputs
     */
    static forValidateInputs(): TerragruntBuilder;
    withCommand(command: TerragruntCommand): this;
    withWorkingDirectory(directory: string): this;
    withEnvironmentVariable(key: string, value: string): this;
    withEnvironmentVariables(variables: Record<string, string>): this;
    withVariable(key: string, value: string): this;
    withVariables(variables: Record<string, string>): this;
    withVarFile(filePath: string): this;
    withVarFiles(filePaths: string[]): this;
    withBackendConfig(key: string, value: string): this;
    withBackendConfigs(config: Record<string, string>): this;
    withTarget(target: string): this;
    withTargets(targets: string[]): this;
    withAutoApprove(): this;
    withDryRun(): this;
    withPlanFile(filePath: string): this;
    withOutFile(filePath: string): this;
    withNoColor(): this;
    withCompactWarnings(): this;
    withParallelism(level: number): this;
    withLockTimeout(timeout: string): this;
    withRefresh(): this;
    withoutRefresh(): this;
    withReconfigure(): this;
    withMigrateState(): this;
    withTerragruntConfig(configPath: string): this;
    withTerragruntWorkingDir(directory: string): this;
    withRunAll(): this;
    withNoAutoInit(): this;
    withNoAutoRetry(): this;
    withNonInteractive(): this;
    withTerragruntParallelism(level: number): this;
    withIncludeDir(directory: string): this;
    withIncludeDirs(directories: string[]): this;
    withExcludeDir(directory: string): this;
    withExcludeDirs(directories: string[]): this;
    withIgnoreDependencyErrors(): this;
    withIgnoreExternalDependencies(): this;
    withIncludeExternalDependencies(): this;
    withTerragruntSource(source: string): this;
    withSourceMap(originalSource: string, newSource: string): this;
    withSourceMaps(sourceMap: Record<string, string>): this;
    withDownloadDir(directory: string): this;
    withIamRole(role: string): this;
    withIamRoleAndSession(role: string, sessionName: string): this;
    withStrictInclude(): this;
    reset(): this;
    build(): ITerragruntService;
    /**
     * Validate that a command is a valid Terragrunt command
     */
    private validateCommand;
}
//# sourceMappingURL=TerragruntBuilder.d.ts.map