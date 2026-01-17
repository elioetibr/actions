/**
 * Maximum character length allowed for input strings.
 * Used to prevent denial of service attacks by limiting large inputs during parsing.
 */
export declare const MAX_INPUT_SIZE = 10000;
/**
 * Maximum length allowed for semantic version strings.
 * Used to validate and limit input sizes for version strings.
 */
export declare const MAX_SEMVER_LENGTH = 256;
/**
 * Regular expression for validating semantic version strings.
 * Matches standard semver format with optional 'v' prefix, required major.minor.patch numbers,
 * and optional prerelease and build metadata components.
 */
export declare const SIMPLE_SEMVER_REGEX: RegExp;
/**
 * Basic sanitization to avoid command injection.
 * Remove any shell control characters
 */
export declare const SANITIZER: RegExp;
export declare const CONTROL_CHAR_REGEX: RegExp;
//# sourceMappingURL=constants.d.ts.map