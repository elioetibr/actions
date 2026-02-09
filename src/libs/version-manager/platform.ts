/**
 * Platform detection for binary downloads.
 * Maps Node.js process.platform/arch to the naming conventions used by
 * HashiCorp (Terraform) and Gruntwork (Terragrunt) release artifacts.
 */

export interface PlatformInfo {
  readonly os: 'linux' | 'darwin' | 'windows';
  readonly arch: 'amd64' | 'arm64';
}

const SUPPORTED_PLATFORMS: ReadonlySet<string> = new Set(['linux', 'darwin', 'win32']);

const SUPPORTED_ARCHES: ReadonlySet<string> = new Set(['x64', 'arm64']);

/**
 * Detect the current platform and architecture.
 * Throws if the platform is unsupported.
 */
export function getPlatform(): PlatformInfo {
  if (!SUPPORTED_PLATFORMS.has(process.platform)) {
    throw new Error(
      `Unsupported platform: ${process.platform}. Supported: linux, darwin, windows.`,
    );
  }
  if (!SUPPORTED_ARCHES.has(process.arch)) {
    throw new Error(`Unsupported architecture: ${process.arch}. Supported: x64 (amd64), arm64.`);
  }

  const os = process.platform === 'win32' ? 'windows' : (process.platform as 'linux' | 'darwin');
  const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';

  return { os, arch };
}

/**
 * Get the cache directory for tool installations.
 * Prefers $RUNNER_TOOL_CACHE (GitHub Actions) with fallback to $HOME.
 */
export function getCacheDir(toolName: string, version: string): string {
  const base =
    process.env['RUNNER_TOOL_CACHE'] || `${process.env['HOME'] ?? '/tmp'}/.tool-versions`;
  const { arch } = getPlatform();
  return `${base}/${toolName}/${version}/${arch}`;
}
