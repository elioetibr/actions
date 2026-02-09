import { existsSync } from 'node:fs';
import { chmod, mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { IToolAgent, IVersionFileReader, IVersionInstaller } from './interfaces';
import { BaseVersionResolver, SEMVER_REGEX } from './base-version-resolver';
import { getCacheDir, getPlatform } from './platform';

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
 * 1. `version` is 'skip' -> return undefined (do not install)
 * 2. `version` is 'x.y.z' -> return as-is
 * 3. `version` is 'latest' -> fetch from HashiCorp releases index
 * 4. `version` is empty -> read version file -> resolve from file or latest
 *
 * Compatible with tfenv `.terraform-version` file conventions.
 */
export class TerraformVersionResolver extends BaseVersionResolver {
  constructor(fileReader: IVersionFileReader) {
    super(fileReader, 'terraform');
  }

  /**
   * Fetch the latest stable Terraform version from the HashiCorp releases index.
   * Filters out prerelease versions (alpha, beta, rc).
   */
  protected async fetchLatestVersion(): Promise<string> {
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
      .filter(v => SEMVER_REGEX.test(v))
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
 * Cache location: `$RUNNER_TOOL_CACHE/terraform/<version>/` in CI,
 * `$HOME/.tool-versions/terraform/<version>/` locally.
 *
 * Cache lifetime: indefinite (content-addressed by version). Entries are
 * never evicted — runners are ephemeral and caches are per-runner.
 * For self-hosted runners, manually prune `$RUNNER_TOOL_CACHE` if disk space
 * is a concern.
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
