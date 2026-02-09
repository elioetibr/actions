/**
 * Minimal agent interface for version management operations.
 * Follows Interface Segregation: only the methods the version-manager needs.
 * IAgent satisfies this structurally (no explicit import needed).
 */
export interface IToolAgent {
  exec(
    command: string,
    args?: string[],
    options?: {
      cwd?: string;
      silent?: boolean;
      ignoreReturnCode?: boolean;
    },
  ): Promise<{ exitCode: number; stdout: string; stderr: string }>;
  addPath(inputPath: string): void;
  info(message: string): void;
  warning(message: string): void;
  debug(message: string): void;
}

/**
 * Parsed semantic version triple
 */
export interface SemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly raw: string;
}

/**
 * Result of version resolution
 */
export interface VersionSpec {
  /** Original input (e.g., 'latest', '1.9.8', 'skip') */
  readonly input: string;
  /** Resolved exact version (e.g., '1.9.8') */
  readonly resolved: string;
  /** Source of resolution */
  readonly source: 'input' | 'file' | 'latest';
}

/**
 * Detects the installed version of a tool by running its --version command
 */
export interface IVersionDetector {
  detect(agent: IToolAgent): Promise<SemVer>;
}

/**
 * Reads version files (e.g., .terraform-version) from the filesystem
 */
export interface IVersionFileReader {
  /**
   * Walk from startDir upward looking for the version file.
   * Returns the version string from the file, or undefined if not found.
   */
  read(startDir: string, fileName: string): Promise<string | undefined>;
}

/**
 * Resolves a version input to a concrete version string
 */
export interface IVersionResolver {
  /**
   * Resolve a version spec.
   * @param version - Explicit version ('1.9.8', 'latest', 'skip', or empty)
   * @param versionFile - Path to version file (e.g., '.terraform-version')
   * @param workingDirectory - Starting directory for file search
   * @returns Resolved version spec, or undefined if 'skip'
   */
  resolve(
    version: string,
    versionFile: string,
    workingDirectory: string,
  ): Promise<VersionSpec | undefined>;
}

/**
 * Downloads and installs a specific version of a tool
 */
export interface IVersionInstaller {
  /** Install a specific version. Returns path to the installed binary directory. */
  install(version: string, agent: IToolAgent): Promise<string>;
  /** Check if a version is already installed in the cache */
  isInstalled(version: string): Promise<boolean>;
}
