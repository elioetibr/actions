/**
 * Interface for metadata management operations
 * Following Dependency Inversion Principle
 */
export interface IMetaDataManager {
  /**
   * Add a single key-value pair to metadata
   */
  addMetaData(key: string, value: string): this;

  /**
   * Set metadata for a key, replacing any existing values
   */
  setMetaData(key: string, values: string | string[]): this;

  /**
   * Get all values for a metadata key
   */
  getMetaData(key: string): string[];

  /**
   * Get the first value for a metadata key
   */
  getFirstMetaData(key: string): string | undefined;

  /**
   * Remove all values for a metadata key
   */
  removeMetaData(key: string): this;

  /**
   * Clear all metadata
   */
  clearMetaData(): this;

  /**
   * Get all metadata entries
   */
  getAllMetaData(): Map<string, string[]>;

  /**
   * Get metadata size
   */
  getSize(): number;

  /**
   * Get metadata entries iterator
   */
  entries(): IterableIterator<[string, string[]]>;
}