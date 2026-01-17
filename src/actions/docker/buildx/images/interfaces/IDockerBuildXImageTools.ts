import { IDockerBuildXImageToolsProvider } from '../providers';
import { IStringListProvider } from '../../../../../libs';

export interface IDockerBuildXImageTools
  extends IDockerBuildXImageToolsProvider,
    IStringListProvider {
  /**
   * Add a single key-value pair to metadata
   * @param key - The metadata key
   * @param value - The metadata value
   * @returns this instance for method chaining
   * @throws Error if key or value is invalid
   */
  addMetaData(key: string, value: string): this;

  /**
   * Set metadata for a key, replacing any existing values
   * @param key - The metadata key
   * @param values - The metadata values (can be single value or array)
   * @returns this instance for method chaining
   */
  setMetaData(key: string, values: string | string[]): this;

  /**
   * Get all values for a metadata key
   * @param key - The metadata key
   * @returns Array of values for the key, or empty array if key doesn't exist
   */
  getMetaData(key: string): string[];

  /**
   * Get the first value for a metadata key
   * @param key - The metadata key
   * @returns First value for the key, or undefined if key doesn't exist
   */
  getFirstMetaData(key: string): string | undefined;

  /**
   * Remove all values for a metadata key
   * @param key - The metadata key
   * @returns this instance for method chaining
   */
  removeMetaData(key: string): this;

  /**
   * Clear all metadata
   * @returns this instance for method chaining
   */
  clearMetaData(): this;

  /**
   * Convert metadata to command-line arguments
   * @returns Array of command-line arguments
   */
  toCommandArgs(): string[];

  /**
   * Build the complete command array
   * @returns Complete command array including executor, subcommands, and arguments
   */
  buildCommand(): string[];

  /**
   * Convert the Class to String
   */
  toString(): string;

  /**
   * Generate command string with backslash line continuation
   * @returns Docker command formatted with backslashes
   */
  toStringMultiLineCommand(): string;
}
