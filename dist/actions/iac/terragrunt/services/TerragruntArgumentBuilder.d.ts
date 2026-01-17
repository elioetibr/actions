import { ITerragruntProvider } from '../interfaces';
/**
 * Builds command-line arguments for Terragrunt commands
 * Extends Terraform argument building with Terragrunt-specific options
 */
export declare class TerragruntArgumentBuilder {
    private readonly provider;
    constructor(provider: ITerragruntProvider);
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
     * Add terragrunt-specific global arguments
     */
    private addTerragruntGlobalArgs;
    /**
     * Add terraform-related arguments
     */
    private addTerraformArgs;
    /**
     * Add init-specific arguments
     */
    private addInitArguments;
    /**
     * Add variable-related arguments
     */
    private addVariableArguments;
    /**
     * Add target-related arguments
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
     * Add common arguments
     */
    private addCommonArguments;
    /**
     * Check if command is a terraform command
     */
    private isTerraformCommand;
    /**
     * Check if command supports variables
     */
    private supportsVariables;
    /**
     * Check if command supports targets
     */
    private supportsTargets;
    /**
     * Check if command supports auto-approve
     */
    private supportsAutoApprove;
}
//# sourceMappingURL=TerragruntArgumentBuilder.d.ts.map