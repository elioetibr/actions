import { existsSync } from 'node:fs';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type {
  IToolAgent,
  IVersionFileReader,
  IVersionInstaller,
  IVersionResolver,
  VersionSpec,
} from './interfaces';
import { getCacheDir, getPlatform } from './platform';

/** Matches an exact semver version without prerelease suffix */
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/** GitHub Releases API endpoint for Terragrunt */
const TERRAGRUNT_LATEST_URL =
  'https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest';

/** GitHub Releases download base URL */
const TERRAGRUNT_DOWNLOAD_URL = 'https://github.com/gruntwork-io/terragrunt/releases/download';

/**
 * Resolves a Terragrunt version spec to a concrete version string.
 *
 * Resolution priority:
 * 1. `version` is 'skip' → return undefined (do not install)
 * 2. `version` is 'x.y.z' → return as-is
 * 3. `version` is 'latest' → fetch from GitHub Releases API
 * 4. `version` is empty → read version file → resolve from file or latest
 *
 * Compatible with tgenv `.terragrunt-version` file conventions.
 */
export class TerragruntVersionResolver implements IVersionResolver {
  constructor(private readonly fileReader: IVersionFileReader) {}

  async resolve(
    version: string,
    versionFile: string,
    workingDirectory: string,
  ): Promise<VersionSpec | undefined> {
    const trimmed = version.trim();

    // Skip installation
    if (trimmed === 'skip') {
      return undefined;
    }

    // Exact version from input
    if (VERSION_REGEX.test(trimmed)) {
      return { input: trimmed, resolved: trimmed, source: 'input' };
    }

    // Explicit latest
    if (trimmed === 'latest') {
      const latest = await this.fetchLatestVersion();
      return { input: trimmed, resolved: latest, source: 'latest' };
    }

    // Empty: try version file, then fall back to latest
    if (trimmed === '') {
      const fileVersion = await this.fileReader.read(workingDirectory, versionFile);
      if (fileVersion) {
        return this.resolveFileVersion(fileVersion, versionFile);
      }
      // No file found → latest
      const latest = await this.fetchLatestVersion();
      return { input: 'latest', resolved: latest, source: 'latest' };
    }

    // Unknown spec
    throw new Error(
      `Invalid terragrunt version spec: '${trimmed}'. ` + "Use 'x.y.z', 'latest', or 'skip'.",
    );
  }

  /**
   * Resolve a version string read from a version file.
   * Supports: 'skip', 'latest', and exact 'x.y.z' specs.
   */
  private async resolveFileVersion(
    fileVersion: string,
    versionFile: string,
  ): Promise<VersionSpec | undefined> {
    if (fileVersion === 'skip') {
      return undefined;
    }

    if (fileVersion === 'latest') {
      const latest = await this.fetchLatestVersion();
      return { input: fileVersion, resolved: latest, source: 'file' };
    }

    if (VERSION_REGEX.test(fileVersion)) {
      return { input: fileVersion, resolved: fileVersion, source: 'file' };
    }

    throw new Error(
      `Invalid version in ${versionFile}: '${fileVersion}'. ` + "Use 'x.y.z', 'latest', or 'skip'.",
    );
  }

  /**
   * Fetch the latest stable Terragrunt version from the GitHub Releases API.
   * Strips the 'v' prefix from the tag name.
   *
   * Note: GitHub API has a 60 req/hour rate limit for unauthenticated calls.
   * If you hit rate limits in CI, set the GITHUB_TOKEN environment variable
   * or pre-specify an exact version.
   */
  private async fetchLatestVersion(): Promise<string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'elioetibr/actions',
    };

    // Use GITHUB_TOKEN if available to avoid rate limits
    const token = process.env['GITHUB_TOKEN'];
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(TERRAGRUNT_LATEST_URL, { headers });
    if (!response.ok) {
      const hint =
        response.status === 403
          ? ' (GitHub API rate limit — set GITHUB_TOKEN to increase the limit)'
          : '';
      throw new Error(
        `Failed to fetch latest Terragrunt version: ` +
          `${response.status} ${response.statusText}${hint}`,
      );
    }

    const data = (await response.json()) as { tag_name: string };
    const tag = data.tag_name;

    // Strip 'v' prefix: "v1.2.3" → "1.2.3"
    const version = tag.startsWith('v') ? tag.slice(1) : tag;

    if (!VERSION_REGEX.test(version)) {
      throw new Error(`Unexpected Terragrunt latest version format: '${tag}'`);
    }

    return version;
  }
}

/**
 * Downloads and installs Terragrunt binaries from GitHub Releases.
 *
 * Terragrunt releases are standalone binaries (no archive extraction needed).
 * The binary is downloaded directly and made executable.
 *
 * Uses the GitHub Actions tool cache directory ($RUNNER_TOOL_CACHE) when
 * available, with a fallback to $HOME/.tool-versions for local development.
 */
export class TerragruntVersionInstaller implements IVersionInstaller {
  async isInstalled(version: string): Promise<boolean> {
    const dir = getCacheDir('terragrunt', version);
    const binaryName = getPlatform().os === 'windows' ? 'terragrunt.exe' : 'terragrunt';
    return existsSync(join(dir, binaryName));
  }

  async install(version: string, agent: IToolAgent): Promise<string> {
    const cacheDir = getCacheDir('terragrunt', version);

    if (await this.isInstalled(version)) {
      agent.info(`Terragrunt ${version} already cached at ${cacheDir}`);
      return cacheDir;
    }

    const { os, arch } = getPlatform();
    const binaryName = os === 'windows' ? 'terragrunt.exe' : 'terragrunt';
    const downloadName = `terragrunt_${os}_${arch}`;
    const url = `${TERRAGRUNT_DOWNLOAD_URL}/v${version}/${downloadName}`;

    agent.info(`Downloading Terragrunt ${version} from ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download Terragrunt ${version}: ` + `${response.status} ${response.statusText}`,
      );
    }

    // Create cache directory
    await mkdir(cacheDir, { recursive: true });

    // Write binary directly (Terragrunt is a standalone binary, no extraction)
    const binaryPath = join(cacheDir, binaryName);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(binaryPath, buffer);

    // Make binary executable
    await chmod(binaryPath, 0o755);

    agent.info(`Terragrunt ${version} installed to ${cacheDir}`);
    return cacheDir;
  }
}
