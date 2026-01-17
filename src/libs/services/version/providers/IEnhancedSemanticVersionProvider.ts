import { ISemanticVersionProvider } from './index';

/**
 * Extended interface that includes fluent methods for semantic version operations
 */
export interface IEnhancedSemanticVersionProvider extends ISemanticVersionProvider {
  // Comparison methods
  isGreaterThan(other: IEnhancedSemanticVersionProvider | string): boolean;

  isLessThan(other: IEnhancedSemanticVersionProvider | string): boolean;

  isEqualTo(other: IEnhancedSemanticVersionProvider | string): boolean;

  isCompatibleWith(other: IEnhancedSemanticVersionProvider | string): boolean;

  // Manipulation methods (return new instances)
  incrementMajor(): IEnhancedSemanticVersionProvider;

  incrementMinor(): IEnhancedSemanticVersionProvider;

  incrementPatch(): IEnhancedSemanticVersionProvider;

  withSuffix(suffix: string): IEnhancedSemanticVersionProvider;

  withoutSuffix(): IEnhancedSemanticVersionProvider;

  // Utility methods
  isPrerelease(): boolean;

  hasBuildMetadata(): boolean;

  toString(): string;

  toJSON(): object;
}
