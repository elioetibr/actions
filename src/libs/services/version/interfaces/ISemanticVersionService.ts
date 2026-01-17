import { ISemanticVersionProvider } from '../providers';

/**
 * Semantic Version
 */
export interface ISemanticVersionService {
  readonly semVerInfo: ISemanticVersionProvider;
}
