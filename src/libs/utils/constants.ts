// noinspection JSUnusedGlobalSymbols

/**
 * Maximum character length allowed for input strings.
 * Used to prevent denial of service attacks by limiting large inputs during parsing.
 */
export const MAX_INPUT_SIZE = 10000;

/**
 * Maximum length allowed for semantic version strings.
 * Used to validate and limit input sizes for version strings.
 */
export const MAX_SEMVER_LENGTH = 256;

/**
 * Regular expression for validating semantic version strings.
 * Matches standard semver format with optional 'v' prefix, required major.minor.patch numbers,
 * and optional prerelease and build metadata components.
 */
export const SIMPLE_SEMVER_REGEX =
  /^v?(\d+)\.(\d+)\.(\d+)((?:-[a-zA-Z0-9\-\\.]+)?(?:\+[a-zA-Z0-9\-\\.+]+)?)?$/;

/**
 * Basic sanitization to avoid command injection.
 * Remove any shell control characters
 */
export const SANITIZER = /[;&|<>$`]/g;

export const CONTROL_CHAR_REGEX = /[\x00-\x1F\x7F]/g;
