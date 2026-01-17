import { ITerragruntService } from './interfaces';
import { TerragruntBuilder } from './TerragruntBuilder';

/**
 * Factory class providing convenience methods for common Terragrunt operations
 * Provides pre-configured builder instances for typical use cases
 */
export class TerragruntBuilderFactory {
  // ============ Builder Access ============

  /**
   * Get a new TerragruntBuilder instance
   * @param command - Optional initial command
   */
  static builder(command?: string): TerragruntBuilder {
    return TerragruntBuilder.create(
      command as Parameters<typeof TerragruntBuilder.create>[0]
    );
  }

  // ============ Init Operations ============

  /**
   * Create a terragrunt init service
   * @param workingDir - Working directory for terragrunt
   */
  static init(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forInit()
      .withWorkingDirectory(workingDir)
      .withNonInteractive()
      .build();
  }

  /**
   * Create a terragrunt run-all init service
   * @param workingDir - Working directory for terragrunt
   */
  static runAllInit(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forInit()
      .withWorkingDirectory(workingDir)
      .withRunAll()
      .withNonInteractive()
      .build();
  }

  // ============ Validate and Format Operations ============

  /**
   * Create a terragrunt validate service
   * @param workingDir - Working directory for terragrunt
   */
  static validate(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forValidate()
      .withWorkingDirectory(workingDir)
      .build();
  }

  /**
   * Create a terragrunt run-all validate service
   * @param workingDir - Working directory for terragrunt
   */
  static runAllValidate(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forValidate()
      .withWorkingDirectory(workingDir)
      .withRunAll()
      .build();
  }

  /**
   * Create a terragrunt fmt service
   * @param workingDir - Working directory for terragrunt
   */
  static fmt(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forFmt().withWorkingDirectory(workingDir).build();
  }

  /**
   * Create a terragrunt hclfmt service
   * @param workingDir - Working directory for terragrunt
   */
  static hclFmt(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forHclFmt()
      .withWorkingDirectory(workingDir)
      .build();
  }

  // ============ Plan Operations ============

  /**
   * Create a terragrunt plan service
   * @param workingDir - Working directory for terragrunt
   * @param variables - Optional terraform variables
   */
  static plan(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forPlan()
      .withWorkingDirectory(workingDir)
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt run-all plan service
   * @param workingDir - Working directory for terragrunt
   * @param variables - Optional terraform variables
   */
  static runAllPlan(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forRunAllPlan()
      .withWorkingDirectory(workingDir)
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt plan service with output file
   * @param workingDir - Working directory for terragrunt
   * @param outFile - Path to save the plan file
   * @param variables - Optional terraform variables
   */
  static planWithOutput(
    workingDir: string,
    outFile: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forPlan()
      .withWorkingDirectory(workingDir)
      .withOutFile(outFile)
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt plan service with targets
   * @param workingDir - Working directory for terragrunt
   * @param targets - Resource addresses to target
   * @param variables - Optional terraform variables
   */
  static planWithTargets(
    workingDir: string,
    targets: string[],
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forPlan()
      .withWorkingDirectory(workingDir)
      .withTargets(targets)
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  // ============ Apply Operations ============

  /**
   * Create a terragrunt apply service with auto-approve
   * @param workingDir - Working directory for terragrunt
   * @param variables - Optional terraform variables
   */
  static apply(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forApply()
      .withWorkingDirectory(workingDir)
      .withAutoApprove()
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt run-all apply service with auto-approve
   * @param workingDir - Working directory for terragrunt
   * @param variables - Optional terraform variables
   */
  static runAllApply(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forRunAllApply()
      .withWorkingDirectory(workingDir)
      .withAutoApprove()
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt apply service from a plan file
   * @param workingDir - Working directory for terragrunt
   * @param planFile - Path to the plan file
   */
  static applyPlan(workingDir: string, planFile: string): ITerragruntService {
    return TerragruntBuilder.forApply()
      .withWorkingDirectory(workingDir)
      .withPlanFile(planFile)
      .withAutoApprove()
      .withNonInteractive()
      .build();
  }

  /**
   * Create a terragrunt apply service with targets
   * @param workingDir - Working directory for terragrunt
   * @param targets - Resource addresses to target
   * @param variables - Optional terraform variables
   */
  static applyWithTargets(
    workingDir: string,
    targets: string[],
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forApply()
      .withWorkingDirectory(workingDir)
      .withTargets(targets)
      .withAutoApprove()
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  // ============ Destroy Operations ============

  /**
   * Create a terragrunt destroy service with auto-approve
   * @param workingDir - Working directory for terragrunt
   * @param variables - Optional terraform variables
   */
  static destroy(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forDestroy()
      .withWorkingDirectory(workingDir)
      .withAutoApprove()
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt run-all destroy service with auto-approve
   * @param workingDir - Working directory for terragrunt
   * @param variables - Optional terraform variables
   */
  static runAllDestroy(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forRunAllDestroy()
      .withWorkingDirectory(workingDir)
      .withAutoApprove()
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terragrunt destroy service with targets
   * @param workingDir - Working directory for terragrunt
   * @param targets - Resource addresses to target
   * @param variables - Optional terraform variables
   */
  static destroyWithTargets(
    workingDir: string,
    targets: string[],
    variables?: Record<string, string>
  ): ITerragruntService {
    const builder = TerragruntBuilder.forDestroy()
      .withWorkingDirectory(workingDir)
      .withTargets(targets)
      .withAutoApprove()
      .withNonInteractive();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  // ============ Other Operations ============

  /**
   * Create a terragrunt output service
   * @param workingDir - Working directory for terragrunt
   */
  static output(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forOutput()
      .withWorkingDirectory(workingDir)
      .build();
  }

  /**
   * Create a terragrunt graph-dependencies service
   * @param workingDir - Working directory for terragrunt
   */
  static graphDependencies(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forGraphDependencies()
      .withWorkingDirectory(workingDir)
      .build();
  }

  /**
   * Create a terragrunt validate-inputs service
   * @param workingDir - Working directory for terragrunt
   */
  static validateInputs(workingDir: string): ITerragruntService {
    return TerragruntBuilder.forValidateInputs()
      .withWorkingDirectory(workingDir)
      .build();
  }
}
