import { IEnhancedSemanticVersionProvider, ISemVerProvider } from '../providers';
import { ISemanticVersionService } from '../interfaces';
/**
 * Configuration options for the semantic version services
 */
export interface ISemanticVersionConfig {
    maxLength?: number;
    allowControlCharacters?: boolean;
    maxVersionNumber?: number;
    customRegex?: RegExp;
}
/**
 * Enhanced semantic version info with fluent comparison and manipulation methods
 */
export declare class SemanticVersionInfo implements IEnhancedSemanticVersionProvider {
    readonly semVer: string;
    readonly major: string;
    readonly minor: string;
    readonly patch: string;
    readonly version: string;
    readonly majorMinor: string;
    readonly majorMinorPatch: string;
    readonly semVerSuffix: string;
    constructor(semVer: string, major: string, minor: string, patch: string, version: string, majorMinor: string, majorMinorPatch: string, semVerSuffix: string);
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
    toJSON(): {
        semVer: string;
        major: string;
        minor: string;
        patch: string;
        version: string;
        majorMinor: string;
        majorMinorPatch: string;
        semVerSuffix: string;
    };
}
/**
 * Enhanced interface for semantic version service that returns enhanced semVerInfo
 */
export interface IEnhancedSemanticVersionService extends ISemanticVersionService {
    readonly semVerInfo: IEnhancedSemanticVersionProvider;
}
/**
 * Fluent services for creating semantic version services
 */
export declare class SemanticVersionBuilder {
    private versionProvider?;
    private config;
    /**
     * Static factory method to start building
     */
    static create(): SemanticVersionBuilder;
    /**
     * Static convenience method for quick creation with version string
     */
    static fromVersion(version: string): SemanticVersionBuilder;
    /**
     * Static convenience method for creation with provider
     */
    static fromProvider(provider: ISemVerProvider): SemanticVersionBuilder;
    /**
     * Set the version provider
     */
    withVersionProvider(provider: ISemVerProvider): SemanticVersionBuilder;
    /**
     * Set the version string directly
     */
    withVersion(version: string): SemanticVersionBuilder;
    /**
     * Configure maximum allowed length for version strings
     */
    withMaxLength(maxLength: number): SemanticVersionBuilder;
    /**
     * Configure whether to allow control characters
     */
    withControlCharacters(allow: boolean): SemanticVersionBuilder;
    /**
     * Configure maximum version number for major/minor/patch
     */
    withMaxVersionNumber(max: number): SemanticVersionBuilder;
    /**
     * Use a custom regex for version validation
     */
    withCustomRegex(regex: RegExp): SemanticVersionBuilder;
    /**
     * Apply a configuration object
     */
    withConfig(config: Partial<ISemanticVersionConfig>): SemanticVersionBuilder;
    /**
     * Build the semantic version service
     */
    build(): IEnhancedSemanticVersionService;
}
export declare function createSemVerService(versionProvider: ISemVerProvider): IEnhancedSemanticVersionService;
//# sourceMappingURL=SemanticVersionBuilder.d.ts.map