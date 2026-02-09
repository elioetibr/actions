// src/services/version/SemanticVersion.ts
import {
  IEnhancedSemanticVersionProvider,
  ISemVerProvider,
  ISemanticVersionProvider,
  IVersionProvider,
} from './providers';
import {
  IEnhancedSemanticVersionService,
  ISemanticVersionConfig,
  SemanticVersionBuilder,
  SemanticVersionInfo,
} from './builders';
import { MAX_SEMVER_LENGTH, SIMPLE_SEMVER_REGEX } from '../../utils';

/**
 * Enhanced semantic version service with configurable validation
 */
export class SemanticVersionService
  implements
    ISemanticVersionProvider,
    IVersionProvider,
    ISemVerProvider,
    IEnhancedSemanticVersionService
{
  private cachedSemVerInfo?: IEnhancedSemanticVersionProvider;

  constructor(
    private readonly versionProvider: ISemVerProvider,
    private readonly config: ISemanticVersionConfig = {},
  ) {
    // Validate immediately upon construction
    this.parseSemVer();
  }

  get semVerInfo(): IEnhancedSemanticVersionProvider {
    if (!this.cachedSemVerInfo) {
      this.cachedSemVerInfo = this.parseSemVer();
    }
    return this.cachedSemVerInfo;
  }

  // Delegate all properties to semVerInfo for easier implementation
  get version(): string {
    return this.semVerInfo.version;
  }

  get semVer(): string {
    return this.semVerInfo.semVer;
  }

  get major(): string {
    return this.semVerInfo.major;
  }

  get majorMinor(): string {
    return this.semVerInfo.majorMinor;
  }

  get majorMinorPatch(): string {
    return this.semVerInfo.majorMinorPatch;
  }

  get minor(): string {
    return this.semVerInfo.minor;
  }

  get patch(): string {
    return this.semVerInfo.patch;
  }

  get semVerSuffix(): string {
    return this.semVerInfo.semVerSuffix;
  }

  /**
   * Parse a semantic version string into its components with configurable validation
   */
  private parseSemVer(): IEnhancedSemanticVersionProvider {
    const versionString = this.versionProvider.version;

    // Input validation - check for null, undefined, empty string
    if (versionString === null || versionString === undefined || versionString === '') {
      throw new Error('Semantic version string cannot be empty');
    }

    // Convert to string
    const stringInput = String(versionString);

    // Control character validation (if not allowed) - check before trimming
    if (!this.config.allowControlCharacters && /[\x00-\x1f\x7f-\x9f]/.test(stringInput)) {
      throw new Error('Given Semantic Version is not valid');
    }

    // Trim the input
    const trimmedInput = stringInput.trim();

    // Check if trimmed input is empty (whitespace only)
    if (trimmedInput.length === 0) {
      throw new Error('Semantic version string cannot be empty');
    }

    // Length validation
    const maxLength = this.config.maxLength || MAX_SEMVER_LENGTH;
    if (trimmedInput.length > maxLength) {
      throw new Error('Given Semantic Version is not valid');
    }

    // Additional safety checks for malicious inputs
    // Check for suspicious patterns that shouldn't be in version strings
    // noinspection RegExpRedundantEscape
    const suspiciousPatterns = [
      /\0/, // null bytes
      /[\r\n]/, // CRLF injection
      /<script/i, // XSS attempts
      /\.\./, // path traversal
      /['";]/, // SQL injection attempts
      /\${/, // JNDI injection attempts
      /^\d+$/, // plain numbers (not valid semver)
      /^[a-zA-Z]+$/, // plain strings (platform/arch strings)
      /[^\w.\-+]/, // special characters not allowed in semver
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedInput)) {
        throw new Error('Given Semantic Version is not valid');
      }
    }

    // Clean the input - remove 'v' prefix if present
    const cleanInput = trimmedInput.replace(/^v/, '');

    // Regex validation
    const regex = this.config.customRegex || SIMPLE_SEMVER_REGEX;
    const match = regex.exec(cleanInput);

    if (!match) {
      throw new Error('Given Semantic Version is not valid');
    }

    // Extract components from regex capture groups
    const majorStr = match[1] || '';
    const minorStr = match[2] || '';
    const patchStr = match[3] || '';
    const suffix = match[4] || '';

    // Validate that we have all required components
    if (!majorStr || !minorStr || !patchStr) {
      throw new Error('Given Semantic Version is not valid');
    }

    // Additional validation: ensure components are purely numeric
    if (!/^\d+$/.test(majorStr) || !/^\d+$/.test(minorStr) || !/^\d+$/.test(patchStr)) {
      throw new Error('Given Semantic Version is not valid');
    }

    // Parse version numbers and validate they are valid integers
    const major = parseInt(majorStr, 10);
    const minor = parseInt(minorStr, 10);
    const patch = parseInt(patchStr, 10);

    // Check for NaN values
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw new Error('Given Semantic Version is not valid');
    }

    // Bounds checking
    const maxVersionNumber = this.config.maxVersionNumber || 999999;
    if (
      major < 0 ||
      major > maxVersionNumber ||
      minor < 0 ||
      minor > maxVersionNumber ||
      patch < 0 ||
      patch > maxVersionNumber
    ) {
      throw new Error('Given Semantic Version is not valid');
    }

    const version = `${major}.${minor}.${patch}`;
    const majorMinor = `${major}.${minor}`;
    const semVer = `${version}${suffix}`;

    return new SemanticVersionInfo(
      semVer,
      major.toString(),
      minor.toString(),
      patch.toString(),
      version,
      majorMinor,
      version, // majorMinorPatch is same as version
      suffix,
    );
  }
}

// Legacy factory function for backward compatibility
export function createSemVerService(
  versionProvider: ISemVerProvider,
): IEnhancedSemanticVersionService {
  return SemanticVersionBuilder.fromProvider(versionProvider).build();
}
