import { ITerragruntService } from './interfaces';
import { TerragruntBuilder } from './TerragruntBuilder';
/**
 * Factory class providing convenience methods for common Terragrunt operations
 * Provides pre-configured builder instances for typical use cases
 */
export declare class TerragruntBuilderFactory {
    /**
     * Get a new TerragruntBuilder instance
     * @param command - Optional initial command
     */
    static builder(command?: string): TerragruntBuilder;
    /**
     * Create a terragrunt init service
     * @param workingDir - Working directory for terragrunt
     */
    static init(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt run-all init service
     * @param workingDir - Working directory for terragrunt
     */
    static runAllInit(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt validate service
     * @param workingDir - Working directory for terragrunt
     */
    static validate(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt run-all validate service
     * @param workingDir - Working directory for terragrunt
     */
    static runAllValidate(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt fmt service
     * @param workingDir - Working directory for terragrunt
     */
    static fmt(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt hclfmt service
     * @param workingDir - Working directory for terragrunt
     */
    static hclFmt(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt plan service
     * @param workingDir - Working directory for terragrunt
     * @param variables - Optional terraform variables
     */
    static plan(workingDir: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt run-all plan service
     * @param workingDir - Working directory for terragrunt
     * @param variables - Optional terraform variables
     */
    static runAllPlan(workingDir: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt plan service with output file
     * @param workingDir - Working directory for terragrunt
     * @param outFile - Path to save the plan file
     * @param variables - Optional terraform variables
     */
    static planWithOutput(workingDir: string, outFile: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt plan service with targets
     * @param workingDir - Working directory for terragrunt
     * @param targets - Resource addresses to target
     * @param variables - Optional terraform variables
     */
    static planWithTargets(workingDir: string, targets: string[], variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt apply service with auto-approve
     * @param workingDir - Working directory for terragrunt
     * @param variables - Optional terraform variables
     */
    static apply(workingDir: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt run-all apply service with auto-approve
     * @param workingDir - Working directory for terragrunt
     * @param variables - Optional terraform variables
     */
    static runAllApply(workingDir: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt apply service from a plan file
     * @param workingDir - Working directory for terragrunt
     * @param planFile - Path to the plan file
     */
    static applyPlan(workingDir: string, planFile: string): ITerragruntService;
    /**
     * Create a terragrunt apply service with targets
     * @param workingDir - Working directory for terragrunt
     * @param targets - Resource addresses to target
     * @param variables - Optional terraform variables
     */
    static applyWithTargets(workingDir: string, targets: string[], variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt destroy service with auto-approve
     * @param workingDir - Working directory for terragrunt
     * @param variables - Optional terraform variables
     */
    static destroy(workingDir: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt run-all destroy service with auto-approve
     * @param workingDir - Working directory for terragrunt
     * @param variables - Optional terraform variables
     */
    static runAllDestroy(workingDir: string, variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt destroy service with targets
     * @param workingDir - Working directory for terragrunt
     * @param targets - Resource addresses to target
     * @param variables - Optional terraform variables
     */
    static destroyWithTargets(workingDir: string, targets: string[], variables?: Record<string, string>): ITerragruntService;
    /**
     * Create a terragrunt output service
     * @param workingDir - Working directory for terragrunt
     */
    static output(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt graph-dependencies service
     * @param workingDir - Working directory for terragrunt
     */
    static graphDependencies(workingDir: string): ITerragruntService;
    /**
     * Create a terragrunt validate-inputs service
     * @param workingDir - Working directory for terragrunt
     */
    static validateInputs(workingDir: string): ITerragruntService;
}
//# sourceMappingURL=TerragruntBuilderFactory.d.ts.map