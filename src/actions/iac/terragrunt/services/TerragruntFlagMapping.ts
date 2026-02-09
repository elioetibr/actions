/**
 * Terragrunt v0.x / v1.x CLI flag and command mapping tables.
 *
 * Terragrunt v1.x (CLI redesign) renamed all `--terragrunt-*` flags
 * and several commands. This module provides lookup tables so the
 * TerragruntArgumentBuilder can emit the correct syntax for both versions.
 *
 * @see https://terragrunt.gruntwork.io/docs/migrate/cli-redesign/
 */

export interface FlagMapping {
  readonly v0: string;
  readonly v1: string;
}

/**
 * Maps semantic flag names to their v0.x and v1.x CLI representations.
 * Only includes flags currently used by the action.
 */
export const TERRAGRUNT_FLAG_MAP: Readonly<Record<string, FlagMapping>> = {
  config: { v0: '--terragrunt-config', v1: '--config' },
  workingDir: { v0: '--terragrunt-working-dir', v1: '--working-dir' },
  noAutoInit: { v0: '--terragrunt-no-auto-init', v1: '--no-auto-init' },
  noAutoRetry: { v0: '--terragrunt-no-auto-retry', v1: '--no-auto-retry' },
  nonInteractive: {
    v0: '--terragrunt-non-interactive',
    v1: '--non-interactive',
  },
  parallelism: { v0: '--terragrunt-parallelism', v1: '--parallelism' },
  includeDir: { v0: '--terragrunt-include-dir', v1: '--queue-include-dir' },
  excludeDir: { v0: '--terragrunt-exclude-dir', v1: '--queue-exclude-dir' },
  ignoreDependencyErrors: {
    v0: '--terragrunt-ignore-dependency-errors',
    v1: '--queue-ignore-errors',
  },
  ignoreExternalDeps: {
    v0: '--terragrunt-ignore-external-dependencies',
    v1: '--queue-exclude-external',
  },
  includeExternalDeps: {
    v0: '--terragrunt-include-external-dependencies',
    v1: '--queue-include-external',
  },
  source: { v0: '--terragrunt-source', v1: '--source' },
  sourceMap: { v0: '--terragrunt-source-map', v1: '--source-map' },
  downloadDir: { v0: '--terragrunt-download-dir', v1: '--download-dir' },
  iamRole: { v0: '--terragrunt-iam-role', v1: '--iam-role' },
  iamRoleSessionName: {
    v0: '--terragrunt-iam-role-session-name',
    v1: '--iam-role-session-name',
  },
  strictInclude: {
    v0: '--terragrunt-strict-include',
    v1: '--queue-strict-include',
  },
} as const;

/**
 * Maps v0.x command names to their v1.x multi-word equivalents.
 * Each entry is an array of tokens for the v1.x command.
 */
export const TERRAGRUNT_COMMAND_MAP: Readonly<Record<string, readonly string[]>> = {
  'run-all': ['run', '--all'],
  'graph-dependencies': ['dag', 'graph'],
  hclfmt: ['hcl', 'fmt'],
  'render-json': ['render', '--json', '-w'],
  'output-module-groups': ['find', '--dag', '--json'],
  'validate-inputs': ['validate', 'inputs'],
} as const;

/** Commands removed in v1.x with no equivalent */
export const REMOVED_V1_COMMANDS: readonly string[] = ['aws-provider-patch'] as const;

/**
 * Select the correct flag string based on the Terragrunt major version.
 *
 * @param flagKey - Semantic key from TERRAGRUNT_FLAG_MAP (e.g., 'config', 'workingDir')
 * @param majorVersion - Detected Terragrunt major version (0 for legacy, 1+ for CLI redesign)
 * @returns The correct CLI flag string for the given version
 * @throws Error if the flag key is not found in the mapping table
 */
export function selectFlag(flagKey: string, majorVersion: number): string {
  const mapping = TERRAGRUNT_FLAG_MAP[flagKey];
  if (!mapping) {
    throw new Error(`Unknown Terragrunt flag key: ${flagKey}`);
  }
  return majorVersion >= 1 ? mapping.v1 : mapping.v0;
}
