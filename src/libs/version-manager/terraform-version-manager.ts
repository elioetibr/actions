import { existsSync } from 'node:fs';
import { chmod, mkdir, unlink, writeFile } from 'node:fs/promises';
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

/** HashiCorp Terraform releases base URL */
const HASHICORP_RELEASES_URL = 'https://releases.hashicorp.com/terraform';

/**
 * Compare two semver version strings in descending order.
 * Both strings must be in x.y.z format (validated before calling).
 */
function compareSemverDesc(a: string, b: string): number {
  const ap = a.split('.').map(Number);
  const bp = b.split('.').map(Number);
  return bp[0]! - ap[0]! || bp[1]! - ap[1]! || bp[2]! - ap[2]!;
}

/**
 * Resolves a Terraform version spec to a concrete version string.
 *
 * Resolution priority:
 * 1. `version` is 'skip' → return undefined (do not install)
 * 2. `version` is 'x.y.z' → return as-is
 * 3. `version` is 'latest' → fetch from HashiCorp releases index
 * 4. `version` is empty → read version file → resolve from file or latest
 *
 * Compatible with tfenv `.terraform-version` file conventions.
 */
export class TerraformVersionResolver implements IVersionResolver {
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
      `Invalid terraform version spec: '${trimmed}'. ` + "Use 'x.y.z', 'latest', or 'skip'.",
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
   * Fetch the latest stable Terraform version from the HashiCorp releases index.
   * Filters out prerelease versions (alpha, beta, rc).
   */
  private async fetchLatestVersion(): Promise<string> {
    const response = await fetch(`${HASHICORP_RELEASES_URL}/index.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Terraform version index: ` + `${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      versions: Record<string, unknown>;
    };

    const versions = Object.keys(data.versions)
      .filter(v => VERSION_REGEX.test(v))
      .sort(compareSemverDesc);

    if (versions.length === 0) {
      throw new Error('No stable Terraform versions found in the version index');
    }

    return versions[0]!;
  }
}

/**
 * Downloads and installs Terraform binaries from HashiCorp releases.
 *
 * Uses the GitHub Actions tool cache directory ($RUNNER_TOOL_CACHE) when
 * available, with a fallback to $HOME/.tool-versions for local development.
 *
 * Extraction uses the `unzip` command via agent's IToolAgent adapter
 * method — NOT child_process. This is safe execFile-based invocation.
 */
export class TerraformVersionInstaller implements IVersionInstaller {
  async isInstalled(version: string): Promise<boolean> {
    const dir = getCacheDir('terraform', version);
    const binaryName = getPlatform().os === 'windows' ? 'terraform.exe' : 'terraform';
    return existsSync(join(dir, binaryName));
  }

  async install(version: string, agent: IToolAgent): Promise<string> {
    const cacheDir = getCacheDir('terraform', version);

    if (await this.isInstalled(version)) {
      agent.info(`Terraform ${version} already cached at ${cacheDir}`);
      return cacheDir;
    }

    const { os, arch } = getPlatform();
    const zipName = `terraform_${version}_${os}_${arch}.zip`;
    const url = `${HASHICORP_RELEASES_URL}/${version}/${zipName}`;

    agent.info(`Downloading Terraform ${version} from ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download Terraform ${version}: ` + `${response.status} ${response.statusText}`,
      );
    }

    // Create cache directory
    await mkdir(cacheDir, { recursive: true });

    // Write zip to temporary location in the cache directory
    const zipPath = join(cacheDir, zipName);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(zipPath, buffer);

    // Extract zip — uses the IToolAgent adapter (execFile-based, not shell)
    const result = await agent.exec('unzip', ['-o', zipPath, '-d', cacheDir], {
      silent: true,
    });

    if (result.exitCode !== 0) {
      throw new Error(`Failed to extract Terraform ${version}: ${result.stderr}`);
    }

    // Clean up zip file
    await unlink(zipPath);

    // Ensure binary is executable
    const binaryName = os === 'windows' ? 'terraform.exe' : 'terraform';
    await chmod(join(cacheDir, binaryName), 0o755);

    agent.info(`Terraform ${version} installed to ${cacheDir}`);
    return cacheDir;
  }
}
