import { IIacService } from '../../common/interfaces';
import { TerraformCommand } from './ITerraformProvider';

/**
 * Service interface for Terraform operations
 * Extends IIacService with Terraform-specific command type narrowing
 */
export interface ITerraformService extends IIacService {
  /** Narrowed command type */
  readonly command: TerraformCommand;

  /**
   * Set the terraform command
   * @param command - The terraform command (plan, apply, destroy, etc.)
   */
  setCommand(command: TerraformCommand): this;

  /**
   * Clone the service with current configuration
   * @returns New service instance with same configuration
   */
  clone(): ITerraformService;
}
