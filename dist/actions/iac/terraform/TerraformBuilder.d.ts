import { ITerraformBuilder, ITerraformService, TerraformCommand } from './interfaces';
/**
 * Fluent builder for constructing Terraform service instances
 * Provides a type-safe API for configuring Terraform commands
 */
export declare class TerraformBuilder implements ITerraformBuilder {
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
    /**
     * Private constructor - use static factory methods
     */
    private constructor();
    /**
     * Create a new TerraformBuilder instance
     * @param command - Optional initial command
     */
    static create(command?: TerraformCommand): TerraformBuilder;
    /**
     * Create a builder for terraform init
     */
    static forInit(): TerraformBuilder;
    /**
     * Create a builder for terraform validate
     */
    static forValidate(): TerraformBuilder;
    /**
     * Create a builder for terraform fmt
     */
    static forFmt(): TerraformBuilder;
    /**
     * Create a builder for terraform plan
     */
    static forPlan(): TerraformBuilder;
    /**
     * Create a builder for terraform apply
     */
    static forApply(): TerraformBuilder;
    /**
     * Create a builder for terraform destroy
     */
    static forDestroy(): TerraformBuilder;
    /**
     * Create a builder for terraform output
     */
    static forOutput(): TerraformBuilder;
    /**
     * Create a builder for terraform show
     */
    static forShow(): TerraformBuilder;
    withCommand(command: TerraformCommand): this;
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
    reset(): this;
    build(): ITerraformService;
    /**
     * Validate that a command is a valid Terraform command
     */
    private validateCommand;
}
//# sourceMappingURL=TerraformBuilder.d.ts.map