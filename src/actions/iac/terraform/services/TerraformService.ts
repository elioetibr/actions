import { BaseIacService } from '../../common/services/BaseIacService';
import { ITerraformService, TerraformCommand } from '../interfaces';
import { TerraformArgumentBuilder } from './TerraformArgumentBuilder';
import { TerraformStringFormatter } from './TerraformStringFormatter';

/**
 * Main service implementation for Terraform operations
 * Extends BaseIacService with Terraform-specific factory methods
 */
export class TerraformService extends BaseIacService implements ITerraformService {
  constructor(command: TerraformCommand, workingDirectory: string = '.') {
    super(command, 'terraform', workingDirectory);
  }

  // ============ Type-Narrowed Accessors ============

  override get command(): TerraformCommand {
    return super.command as TerraformCommand;
  }

  override setCommand(command: TerraformCommand): this {
    return super.setCommand(command);
  }

  // ============ Factory Method Implementations ============

  protected createArgumentBuilder(): TerraformArgumentBuilder {
    return new TerraformArgumentBuilder(this);
  }

  protected createStringFormatter(): TerraformStringFormatter {
    return new TerraformStringFormatter(this);
  }

  protected resetSpecific(): void {
    // No additional state to reset for Terraform
  }

  protected cloneSpecific(_target: this): void {
    // No additional state to clone for Terraform
  }

  protected createEmptyClone(): this {
    return new TerraformService(this.command, this.workingDirectory) as this;
  }

  // ============ Clone Override for Return Type ============

  override clone(): ITerraformService {
    return super.clone() as ITerraformService;
  }
}
