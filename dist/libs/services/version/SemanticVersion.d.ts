import { IEnhancedSemanticVersionProvider, ISemVerProvider, ISemanticVersionProvider, IVersionProvider } from './providers';
import { IEnhancedSemanticVersionService, ISemanticVersionConfig } from './builders';
/**
 * Enhanced semantic version service with configurable validation
 */
export declare class SemanticVersionService implements ISemanticVersionProvider, IVersionProvider, ISemVerProvider, IEnhancedSemanticVersionService {
    private readonly versionProvider;
    private readonly config;
    private cachedSemVerInfo?;
    constructor(versionProvider: ISemVerProvider, config?: ISemanticVersionConfig);
    get semVerInfo(): IEnhancedSemanticVersionProvider;
    get version(): string;
    get semVer(): string;
    get major(): string;
    get majorMinor(): string;
    get majorMinorPatch(): string;
    get minor(): string;
    get patch(): string;
    get semVerSuffix(): string;
    /**
     * Parse a semantic version string into its components with configurable validation
     */
    private parseSemVer;
}
export declare function createSemVerService(versionProvider: ISemVerProvider): IEnhancedSemanticVersionService;
//# sourceMappingURL=SemanticVersion.d.ts.map