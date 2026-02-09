import { ITerraformService } from './interfaces';
import { TerraformBuilder } from './TerraformBuilder';

/**
 * Factory class providing convenience methods for common Terraform operations
 * Provides pre-configured builder instances for typical use cases
 */
export class TerraformBuilderFactory {
  // ============ Builder Access ============

  /**
   * Get a new TerraformBuilder instance
   * @param command - Optional initial command
   */
  static builder(command?: string): TerraformBuilder {
    return TerraformBuilder.create(
      command as Parameters<typeof TerraformBuilder.create>[0]
    );
  }

  // ============ Init Operations ============

  /**
   * Create a terraform init service
   * @param workingDir - Working directory for terraform
   * @param backendConfig - Optional backend configuration
   */
  static init(
    workingDir: string,
    backendConfig?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forInit().withWorkingDirectory(workingDir);

    if (backendConfig) {
      builder.withBackendConfigs(backendConfig);
    }

    return builder.build();
  }

  /**
   * Create a terraform init service with reconfigure
   * @param workingDir - Working directory for terraform
   */
  static initWithReconfigure(workingDir: string): ITerraformService {
    return TerraformBuilder.forInit()
      .withWorkingDirectory(workingDir)
      .withReconfigure()
      .build();
  }

  /**
   * Create a terraform init service with state migration
   * @param workingDir - Working directory for terraform
   */
  static initWithMigrateState(workingDir: string): ITerraformService {
    return TerraformBuilder.forInit()
      .withWorkingDirectory(workingDir)
      .withMigrateState()
      .build();
  }

  // ============ Validate and Format Operations ============

  /**
   * Create a terraform validate service
   * @param workingDir - Working directory for terraform
   */
  static validate(workingDir: string): ITerraformService {
    return TerraformBuilder.forValidate()
      .withWorkingDirectory(workingDir)
      .build();
  }

  /**
   * Create a terraform fmt service
   * @param workingDir - Working directory for terraform
   */
  static fmt(workingDir: string): ITerraformService {
    return TerraformBuilder.forFmt().withWorkingDirectory(workingDir).build();
  }

  // ============ Plan Operations ============

  /**
   * Create a terraform plan service
   * @param workingDir - Working directory for terraform
   * @param variables - Optional terraform variables
   */
  static plan(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forPlan().withWorkingDirectory(workingDir);

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terraform plan service with output file
   * @param workingDir - Working directory for terraform
   * @param outFile - Path to save the plan file
   * @param variables - Optional terraform variables
   */
  static planWithOutput(
    workingDir: string,
    outFile: string,
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forPlan()
      .withWorkingDirectory(workingDir)
      .withOutFile(outFile);

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terraform plan service with targets
   * @param workingDir - Working directory for terraform
   * @param targets - Resource addresses to target
   * @param variables - Optional terraform variables
   */
  static planWithTargets(
    workingDir: string,
    targets: string[],
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forPlan()
      .withWorkingDirectory(workingDir)
      .withTargets(targets);

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  // ============ Apply Operations ============

  /**
   * Create a terraform apply service (interactive)
   * @param workingDir - Working directory for terraform
   * @param variables - Optional terraform variables
   */
  static apply(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forApply().withWorkingDirectory(workingDir);

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terraform apply service with auto-approve
   * @param workingDir - Working directory for terraform
   * @param variables - Optional terraform variables
   */
  static applyWithAutoApprove(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forApply()
      .withWorkingDirectory(workingDir)
      .withAutoApprove();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terraform apply service from a plan file
   * @param workingDir - Working directory for terraform
   * @param planFile - Path to the plan file
   */
  static applyPlan(workingDir: string, planFile: string): ITerraformService {
    return TerraformBuilder.forApply()
      .withWorkingDirectory(workingDir)
      .withPlanFile(planFile)
      .withAutoApprove()
      .build();
  }

  /**
   * Create a terraform apply service with targets
   * @param workingDir - Working directory for terraform
   * @param targets - Resource addresses to target
   * @param variables - Optional terraform variables
   */
  static applyWithTargets(
    workingDir: string,
    targets: string[],
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forApply()
      .withWorkingDirectory(workingDir)
      .withTargets(targets)
      .withAutoApprove();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  // ============ Destroy Operations ============

  /**
   * Create a terraform destroy service (interactive)
   * @param workingDir - Working directory for terraform
   * @param variables - Optional terraform variables
   */
  static destroy(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forDestroy().withWorkingDirectory(
      workingDir
    );

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terraform destroy service with auto-approve
   * @param workingDir - Working directory for terraform
   * @param variables - Optional terraform variables
   */
  static destroyWithAutoApprove(
    workingDir: string,
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forDestroy()
      .withWorkingDirectory(workingDir)
      .withAutoApprove();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  /**
   * Create a terraform destroy service with targets
   * @param workingDir - Working directory for terraform
   * @param targets - Resource addresses to target
   * @param variables - Optional terraform variables
   */
  static destroyWithTargets(
    workingDir: string,
    targets: string[],
    variables?: Record<string, string>
  ): ITerraformService {
    const builder = TerraformBuilder.forDestroy()
      .withWorkingDirectory(workingDir)
      .withTargets(targets)
      .withAutoApprove();

    if (variables) {
      builder.withVariables(variables);
    }

    return builder.build();
  }

  // ============ Other Operations ============

  /**
   * Create a terraform output service
   * @param workingDir - Working directory for terraform
   */
  static output(workingDir: string): ITerraformService {
    return TerraformBuilder.forOutput().withWorkingDirectory(workingDir).build();
  }

  /**
   * Create a terraform show service
   * @param workingDir - Working directory for terraform
   * @param planFile - Optional plan file to show
   */
  static show(workingDir: string, planFile?: string): ITerraformService {
    const builder = TerraformBuilder.forShow().withWorkingDirectory(workingDir);

    if (planFile) {
      builder.withPlanFile(planFile);
    }

    return builder.build();
  }
}
