import { ISemanticVersionProvider } from './index';
/**
 * Extended interface that includes fluent methods for semantic version operations
 */
export interface IEnhancedSemanticVersionProvider extends ISemanticVersionProvider {
    isGreaterThan(other: IEnhancedSemanticVersionProvider | string): boolean;
    isLessThan(other: IEnhancedSemanticVersionProvider | string): boolean;
    isEqualTo(other: IEnhancedSemanticVersionProvider | string): boolean;
    isCompatibleWith(other: IEnhancedSemanticVersionProvider | string): boolean;
    incrementMajor(): IEnhancedSemanticVersionProvider;
    incrementMinor(): IEnhancedSemanticVersionProvider;
    incrementPatch(): IEnhancedSemanticVersionProvider;
    withSuffix(suffix: string): IEnhancedSemanticVersionProvider;
    withoutSuffix(): IEnhancedSemanticVersionProvider;
    isPrerelease(): boolean;
    hasBuildMetadata(): boolean;
    toString(): string;
    toJSON(): object;
}
//# sourceMappingURL=IEnhancedSemanticVersionProvider.d.ts.map