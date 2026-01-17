import { ITerraformProvider } from '../interfaces';
/**
 * Builds command-line arguments for Terraform commands
 * Follows single responsibility principle - only handles argument construction
 */
export declare class TerraformArgumentBuilder {
    private readonly provider;
    constructor(provider: ITerraformProvider);
    /**
     * Generate command arguments based on provider configuration
     * @returns Array of command-line arguments
     */
    toCommandArgs(): string[];
    /**
     * Generate full command array including executor and command
     * @returns Full command array ready for execution
     */
    buildCommand(): string[];
    /**
     * Add init-specific arguments
     */
    private addInitArguments;
    /**
     * Add variable-related arguments (-var, -var-file)
     */
    private addVariableArguments;
    /**
     * Add target-related arguments (-target)
     */
    private addTargetArguments;
    /**
     * Add plan-specific arguments
     */
    private addPlanArguments;
    /**
     * Add apply/destroy-specific arguments
     */
    private addApplyArguments;
    /**
     * Add common arguments applicable to multiple commands
     */
    private addCommonArguments;
    /**
     * Check if command supports -var and -var-file flags
     */
    private supportsVariables;
    /**
     * Check if command supports -target flag
     */
    private supportsTargets;
    /**
     * Check if command supports -auto-approve flag
     */
    private supportsAutoApprove;
}
//# sourceMappingURL=TerraformArgumentBuilder.d.ts.map