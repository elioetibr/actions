import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';

import type { IVersionFileReader } from './interfaces';

/**
 * Reads version files (e.g., .terraform-version, .terragrunt-version)
 * by walking up the directory tree from the starting directory.
 *
 * Compatible with tfenv and tgenv version file conventions.
 */
export class VersionFileReader implements IVersionFileReader {
  /**
   * Walk from startDir upward looking for the version file.
   * Stops at the filesystem root or $HOME.
   *
   * @param startDir - Directory to start searching from
   * @param fileName - Version file name (e.g., '.terraform-version')
   * @returns The version string from the file, or undefined if not found
   */
  async read(startDir: string, fileName: string): Promise<string | undefined> {
    const home = homedir();
    let currentDir = resolve(startDir);

    // Walk upward through parent directories

    while (true) {
      const filePath = join(currentDir, fileName);

      try {
        const content = await readFile(filePath, 'utf-8');
        const version = this.parseVersionFile(content);
        if (version) {
          return version;
        }
      } catch {
        // File doesn't exist at this level, continue walking up
      }

      // Stop conditions: reached home directory or filesystem root
      const parentDir = dirname(currentDir);
      if (currentDir === home || parentDir === currentDir) {
        break;
      }

      currentDir = parentDir;
    }

    // Also check home directory as a last resort (tfenv convention)
    if (resolve(startDir) !== home) {
      const homeFilePath = join(home, fileName);
      try {
        const content = await readFile(homeFilePath, 'utf-8');
        return this.parseVersionFile(content);
      } catch {
        // Not found in home either
      }
    }

    return undefined;
  }

  /**
   * Parse the version file content.
   * Returns the first non-empty, non-comment line, trimmed.
   */
  private parseVersionFile(content: string): string | undefined {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed;
      }
    }
    return undefined;
  }
}
