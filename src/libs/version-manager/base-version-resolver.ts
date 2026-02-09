import type { IVersionFileReader, IVersionResolver, VersionSpec } from './interfaces';

/** Matches an exact semver version without prerelease suffix */
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Abstract base class for version resolvers.
 *
 * Encapsulates the shared resolution logic used by all tool-specific resolvers.
 * Subclasses only need to implement `fetchLatestVersion()`.
 *
 * Resolution priority:
 * 1. `version` is 'skip' -> return undefined (do not install)
 * 2. `version` is 'x.y.z' -> return as-is
 * 3. `version` is 'latest' -> fetch from upstream
 * 4. `version` is empty -> read version file -> resolve from file or latest
 */
export abstract class BaseVersionResolver implements IVersionResolver {
  constructor(
    protected readonly fileReader: IVersionFileReader,
    protected readonly toolName: string,
  ) {}

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
    if (SEMVER_REGEX.test(trimmed)) {
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
      // No file found -> latest
      const latest = await this.fetchLatestVersion();
      return { input: 'latest', resolved: latest, source: 'latest' };
    }

    // Unknown spec
    throw new Error(
      `Invalid ${this.toolName} version spec: '${trimmed}'. ` + "Use 'x.y.z', 'latest', or 'skip'.",
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

    if (SEMVER_REGEX.test(fileVersion)) {
      return { input: fileVersion, resolved: fileVersion, source: 'file' };
    }

    throw new Error(
      `Invalid version in ${versionFile}: '${fileVersion}'. ` + "Use 'x.y.z', 'latest', or 'skip'.",
    );
  }

  /**
   * Fetch the latest stable version from the tool's upstream source.
   * Each tool implements its own fetching strategy.
   */
  protected abstract fetchLatestVersion(): Promise<string>;
}
