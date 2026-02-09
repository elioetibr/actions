import { IIacBuilder } from '../../common/interfaces';
import { ITerraformService } from './ITerraformService';
import { TerraformCommand } from './ITerraformProvider';

/**
 * Fluent builder interface for constructing Terraform service instances
 * Extends IIacBuilder with Terraform-specific command type narrowing
 */
export interface ITerraformBuilder extends IIacBuilder<ITerraformService> {
  /**
   * Set the terraform command to execute
   * @param command - The terraform command (plan, apply, destroy, etc.)
   */
  withCommand(command: TerraformCommand): this;

  /**
   * Build the Terraform service instance
   * @throws Error if required configuration is missing
   */
  build(): ITerraformService;
}
