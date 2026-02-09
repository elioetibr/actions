// src/services/version/services/SemanticVersionBuilder.ts
import { IEnhancedSemanticVersionProvider, ISemVerProvider } from '../providers';
import { ISemanticVersionService } from '../interfaces';
import { SemanticVersionService } from '../SemanticVersion';
import { CONTROL_CHAR_REGEX, MAX_SEMVER_LENGTH, SIMPLE_SEMVER_REGEX } from '../../../utils';

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
export class SemanticVersionInfo implements IEnhancedSemanticVersionProvider {
  constructor(
    public readonly semVer: string,
    public readonly major: string,
    public readonly minor: string,
    public readonly patch: string,
    public readonly version: string,
    public readonly majorMinor: string,
    public readonly majorMinorPatch: string,
    public readonly semVerSuffix: string,
  ) {}

  // Fluent comparison methods
  isGreaterThan(other: IEnhancedSemanticVersionProvider | string): boolean {
    const otherInfo =
      typeof other === 'string'
        ? (SemanticVersionBuilder.fromVersion(other).build().semVerInfo as SemanticVersionInfo)
        : other;

    const [thisMajor, thisMinor, thisPatch] = [+this.major, +this.minor, +this.patch];
    const [otherMajor, otherMinor, otherPatch] = [
      +otherInfo.major,
      +otherInfo.minor,
      +otherInfo.patch,
    ];

    if (thisMajor !== otherMajor) return thisMajor > otherMajor;
    if (thisMinor !== otherMinor) return thisMinor > otherMinor;
    return thisPatch > otherPatch;
  }

  isLessThan(other: IEnhancedSemanticVersionProvider | string): boolean {
    const otherInfo =
      typeof other === 'string'
        ? (SemanticVersionBuilder.fromVersion(other).build().semVerInfo as SemanticVersionInfo)
        : other;
    return otherInfo.isGreaterThan(this);
  }

  isEqualTo(other: IEnhancedSemanticVersionProvider | string): boolean {
    const otherInfo =
      typeof other === 'string'
        ? (SemanticVersionBuilder.fromVersion(other).build().semVerInfo as SemanticVersionInfo)
        : other;
    return this.version === otherInfo.version;
  }

  isCompatibleWith(other: IEnhancedSemanticVersionProvider | string): boolean {
    const otherInfo =
      typeof other === 'string'
        ? (SemanticVersionBuilder.fromVersion(other).build().semVerInfo as SemanticVersionInfo)
        : other;
    return this.major === otherInfo.major;
  }

  // Fluent manipulation methods (return new instances)
  incrementMajor(): IEnhancedSemanticVersionProvider {
    const newMajor = (+this.major + 1).toString();
    return SemanticVersionBuilder.fromVersion(`${newMajor}.0.0${this.semVerSuffix}`).build()
      .semVerInfo;
  }

  incrementMinor(): IEnhancedSemanticVersionProvider {
    const newMinor = (+this.minor + 1).toString();
    return SemanticVersionBuilder.fromVersion(
      `${this.major}.${newMinor}.0${this.semVerSuffix}`,
    ).build().semVerInfo;
  }

  incrementPatch(): IEnhancedSemanticVersionProvider {
    const newPatch = (+this.patch + 1).toString();
    return SemanticVersionBuilder.fromVersion(
      `${this.major}.${this.minor}.${newPatch}${this.semVerSuffix}`,
    ).build().semVerInfo;
  }

  withSuffix(suffix: string): IEnhancedSemanticVersionProvider {
    const normalizedSuffix =
      suffix.startsWith('-') || suffix.startsWith('+') ? suffix : `-${suffix}`;
    return SemanticVersionBuilder.fromVersion(`${this.version}${normalizedSuffix}`).build()
      .semVerInfo;
  }

  withoutSuffix(): IEnhancedSemanticVersionProvider {
    return SemanticVersionBuilder.fromVersion(this.version).build().semVerInfo;
  }

  // Utility methods
  isPrerelease(): boolean {
    return this.semVerSuffix.includes('-') && !this.semVerSuffix.startsWith('+');
  }

  hasBuildMetadata(): boolean {
    return this.semVerSuffix.includes('+');
  }

  toString(): string {
    return this.semVer;
  }

  toJSON() {
    return {
      semVer: this.semVer,
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      version: this.version,
      majorMinor: this.majorMinor,
      majorMinorPatch: this.majorMinorPatch,
      semVerSuffix: this.semVerSuffix,
    };
  }
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
export class SemanticVersionBuilder {
  private versionProvider?: ISemVerProvider;
  private config: ISemanticVersionConfig = {
    maxLength: MAX_SEMVER_LENGTH,
    allowControlCharacters: false,
    maxVersionNumber: 999999,
    customRegex: SIMPLE_SEMVER_REGEX,
  };

  /**
   * Static factory method to start building
   */
  static create(): SemanticVersionBuilder {
    return new SemanticVersionBuilder();
  }

  /**
   * Static convenience method for quick creation with version string
   */
  static fromVersion(version: string): SemanticVersionBuilder {
    return new SemanticVersionBuilder().withVersion(version);
  }

  /**
   * Static convenience method for creation with provider
   */
  static fromProvider(provider: ISemVerProvider): SemanticVersionBuilder {
    return new SemanticVersionBuilder().withVersionProvider(provider);
  }

  /**
   * Set the version provider
   */
  withVersionProvider(provider: ISemVerProvider): SemanticVersionBuilder {
    this.versionProvider = provider;
    return this;
  }

  /**
   * Set the version string directly
   */
  withVersion(version: string): SemanticVersionBuilder {
    this.versionProvider = { version };
    return this;
  }

  /**
   * Configure maximum allowed length for version strings
   */
  withMaxLength(maxLength: number): SemanticVersionBuilder {
    this.config.maxLength = maxLength;
    return this;
  }

  /**
   * Configure whether to allow control characters
   */
  withControlCharacters(allow: boolean): SemanticVersionBuilder {
    this.config.allowControlCharacters = allow;
    return this;
  }

  /**
   * Configure maximum version number for major/minor/patch
   */
  withMaxVersionNumber(max: number): SemanticVersionBuilder {
    this.config.maxVersionNumber = max;
    return this;
  }

  /**
   * Use a custom regex for version validation
   */
  withCustomRegex(regex: RegExp): SemanticVersionBuilder {
    this.config.customRegex = regex;
    return this;
  }

  /**
   * Apply a configuration object
   */
  withConfig(config: Partial<ISemanticVersionConfig>): SemanticVersionBuilder {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Build the semantic version service
   */
  build(): IEnhancedSemanticVersionService {
    if (!this.versionProvider) {
      throw new Error('Version provider is required. Use withVersionProvider() or withVersion()');
    }

    if (this.versionProvider.version === '') {
      throw new Error('Semantic version string cannot be empty');
    }

    // Add control character validation
    if (!this.config.allowControlCharacters && this.versionProvider.version) {
      if (CONTROL_CHAR_REGEX.test(this.versionProvider.version)) {
        throw new Error('Given Semantic Version is not valid');
      }
    }

    return new SemanticVersionService(this.versionProvider, this.config);
  }
}

// Legacy factory function for backward compatibility - EXPORTED
export function createSemVerService(
  versionProvider: ISemVerProvider,
): IEnhancedSemanticVersionService {
  return SemanticVersionBuilder.fromProvider(versionProvider).build();
}
