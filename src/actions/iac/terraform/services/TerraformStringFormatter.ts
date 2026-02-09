import { BaseIacStringFormatter } from '../../common/services/BaseIacStringFormatter';
import { ITerraformProvider } from '../interfaces';
import { TerraformArgumentBuilder } from './TerraformArgumentBuilder';

/**
 * Formats Terraform commands as strings for display and debugging
 * Delegates to BaseIacStringFormatter with a TerraformArgumentBuilder
 */
export class TerraformStringFormatter extends BaseIacStringFormatter {
  constructor(provider: ITerraformProvider) {
    super(new TerraformArgumentBuilder(provider));
  }
}
