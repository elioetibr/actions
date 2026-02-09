import { BaseIacArgumentBuilder } from '../../common/services/BaseIacArgumentBuilder';
import { ITerraformProvider } from '../interfaces';

/**
 * Builds command-line arguments for Terraform commands
 * Extends BaseIacArgumentBuilder with Terraform-specific command assembly
 */
export class TerraformArgumentBuilder extends BaseIacArgumentBuilder {
  protected override readonly provider: ITerraformProvider;

  constructor(provider: ITerraformProvider) {
    super(provider);
    this.provider = provider;
  }

  /**
   * Generate command arguments based on provider configuration
   * @returns Array of command-line arguments
   */
  toCommandArgs(): string[] {
    const args: string[] = [];
    this.addAllSharedArguments(args, this.provider.command);
    return args;
  }

  /**
   * Generate full command array including executor and command
   * @returns Full command array ready for execution
   */
  buildCommand(): string[] {
    return [this.provider.executor, this.provider.command, ...this.toCommandArgs()];
  }
}
