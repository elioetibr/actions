import type { IToolAgent, SemVer } from './interfaces';

/**
 * Module-level cache: one --version call per tool per action run.
 * Safe because a GitHub Actions step runs in a single process.
 */
const versionCache = new Map<string, SemVer>();

/** Regex for Terraform version output: "Terraform v1.9.8 on linux_amd64" */
const TERRAFORM_VERSION_RE = /Terraform\s+v(\d+)\.(\d+)\.(\d+)/;

/** Regex for Terragrunt version output: "terragrunt version v0.75.10" */
const TERRAGRUNT_VERSION_RE = /terragrunt\s+version\s+v(\d+)\.(\d+)\.(\d+)/i;

/**
 * Parse a version string from CLI output using the given regex.
 * @returns SemVer or throws if the output doesn't match.
 */
function parseVersion(output: string, pattern: RegExp, toolName: string): SemVer {
  const match = pattern.exec(output);
  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error(`Failed to parse ${toolName} version from output: ${output.slice(0, 200)}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    raw: `${match[1]}.${match[2]}.${match[3]}`,
  };
}

/**
 * Detect the installed Terraform version.
 * Result is cached per action run (one --version invocation per tool).
 *
 * Uses agent.exec() — the IToolAgent adapter method,
 * NOT child_process. This is safe execFile-based execution.
 */
export async function detectTerraformVersion(agent: IToolAgent): Promise<SemVer> {
  const cached = versionCache.get('terraform');
  if (cached) {
    return cached;
  }

  const result = await agent.exec('terraform', ['--version'], {
    silent: true,
    ignoreReturnCode: true,
  });

  if (result.exitCode !== 0) {
    throw new Error(`terraform --version failed (exit ${result.exitCode}): ${result.stderr}`);
  }

  const version = parseVersion(result.stdout, TERRAFORM_VERSION_RE, 'Terraform');
  versionCache.set('terraform', version);
  return version;
}

/**
 * Detect the installed Terragrunt version.
 * Result is cached per action run (one --version invocation per tool).
 *
 * Uses agent.exec() — the IToolAgent adapter method,
 * NOT child_process. This is safe execFile-based execution.
 */
export async function detectTerragruntVersion(agent: IToolAgent): Promise<SemVer> {
  const cached = versionCache.get('terragrunt');
  if (cached) {
    return cached;
  }

  const result = await agent.exec('terragrunt', ['--version'], {
    silent: true,
    ignoreReturnCode: true,
  });

  if (result.exitCode !== 0) {
    throw new Error(`terragrunt --version failed (exit ${result.exitCode}): ${result.stderr}`);
  }

  const version = parseVersion(result.stdout, TERRAGRUNT_VERSION_RE, 'Terragrunt');
  versionCache.set('terragrunt', version);
  return version;
}

/**
 * Check if the detected version is Terragrunt v1.x or later (CLI redesign).
 */
export function isV1OrLater(version: SemVer): boolean {
  return version.major >= 1;
}

/**
 * Clear the version cache. Primarily for testing.
 */
export function clearVersionCache(): void {
  versionCache.clear();
}
