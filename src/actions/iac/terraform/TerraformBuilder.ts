import { BaseIacBuilder } from '../common/BaseIacBuilder';
import {
  ITerraformBuilder,
  ITerraformService,
  TERRAFORM_COMMANDS,
  TerraformCommand,
} from './interfaces';
import { TerraformService } from './services';

/**
 * Fluent builder for constructing Terraform service instances
 * Extends BaseIacBuilder — only contains static factories and build()
 */
export class TerraformBuilder
  extends BaseIacBuilder<TerraformCommand, ITerraformService>
  implements ITerraformBuilder
{
  /**
   * Private constructor - use static factory methods
   */
  private constructor() {
    super();
  }

  // ============ Static Factory Methods ============

  static create(command?: TerraformCommand): TerraformBuilder {
    const builder = new TerraformBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }

  static forInit(): TerraformBuilder {
    return TerraformBuilder.create('init');
  }

  static forValidate(): TerraformBuilder {
    return TerraformBuilder.create('validate');
  }

  static forFmt(): TerraformBuilder {
    return TerraformBuilder.create('fmt');
  }

  static forPlan(): TerraformBuilder {
    return TerraformBuilder.create('plan');
  }

  static forApply(): TerraformBuilder {
    return TerraformBuilder.create('apply');
  }

  static forDestroy(): TerraformBuilder {
    return TerraformBuilder.create('destroy');
  }

  static forOutput(): TerraformBuilder {
    return TerraformBuilder.create('output');
  }

  static forShow(): TerraformBuilder {
    return TerraformBuilder.create('show');
  }

  // ============ Build ============

  build(): ITerraformService {
    if (!this._command) {
      throw new Error(
        'Terraform command is required. Use withCommand() or a static factory method.',
      );
    }

    const service = new TerraformService(this._command, this._workingDirectory);
    this.transferSharedState(service);
    return service;
  }

  // ============ Protected Overrides ============

  protected resetSpecific(): void {
    // No additional state to reset for Terraform
  }

  protected validateCommand(command: string): void {
    if (!TERRAFORM_COMMANDS.includes(command as TerraformCommand)) {
      throw new Error(
        `Invalid Terraform command: ${command}. Valid commands are: ${TERRAFORM_COMMANDS.join(', ')}`,
      );
    }
  }
}
