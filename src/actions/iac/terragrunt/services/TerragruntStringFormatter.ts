import { BaseIacStringFormatter } from '../../common/services/BaseIacStringFormatter';
import { ITerragruntProvider } from '../interfaces';
import { TerragruntArgumentBuilder } from './TerragruntArgumentBuilder';

/**
 * Formats Terragrunt commands as strings for display and debugging
 * Delegates to BaseIacStringFormatter with a TerragruntArgumentBuilder
 */
export class TerragruntStringFormatter extends BaseIacStringFormatter {
  constructor(provider: ITerragruntProvider) {
    super(new TerragruntArgumentBuilder(provider));
  }
}
