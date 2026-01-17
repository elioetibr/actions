import { ValidationUtils } from '../../../../../libs';
import { IMetaDataManager } from '../interfaces';

/**
 * Manages metadata operations for Docker BuildX Image Tools
 * Following Single Responsibility Principle
 */
export class MetaDataManager implements IMetaDataManager {
  private readonly metaData: Map<string, string[]> = new Map();

  /**
   * Add a single key-value pair to metadata
   * @param key - The metadata key (defaults to empty string)
   * @param value - The metadata value
   * @returns this instance for method chaining
   * @throws Error if key or value is invalid
   */
  addMetaData(key: string = '', value: string): this {
    ValidationUtils.validateMetaDataInput(key, value);

    const existingValues = this.metaData.get(key) || [];
    existingValues.push(value);
    this.metaData.set(key, existingValues);
    return this;
  }

  /**
   * Set metadata for a key, replacing any existing values
   * @param key - The metadata key
   * @param values - The metadata values (can be single value or array)
   * @returns this instance for method chaining
   */
  setMetaData(key: string, values: string | string[]): this {
    const valueArray = Array.isArray(values) ? values : [values];
    valueArray.forEach(value => ValidationUtils.validateMetaDataInput(key, value));
    this.metaData.set(key, valueArray);
    return this;
  }

  /**
   * Get all values for a metadata key
   * @param key - The metadata key
   * @returns Array of values for the key, or empty array if key doesn't exist
   */
  getMetaData(key: string): string[] {
    return this.metaData.get(key) || [];
  }

  /**
   * Get the first value for a metadata key
   * @param key - The metadata key
   * @returns First value for the key, or undefined if key doesn't exist
   */
  getFirstMetaData(key: string): string | undefined {
    const values = this.metaData.get(key);
    return values && values.length > 0 ? values[0] : undefined;
  }

  /**
   * Remove all values for a metadata key
   * @param key - The metadata key
   * @returns this instance for method chaining
   */
  removeMetaData(key: string): this {
    this.metaData.delete(key);
    return this;
  }

  /**
   * Clear all metadata
   * @returns this instance for method chaining
   */
  clearMetaData(): this {
    this.metaData.clear();
    return this;
  }

  /**
   * Get all metadata entries
   * @returns Map of all metadata
   */
  getAllMetaData(): Map<string, string[]> {
    return new Map(this.metaData);
  }

  /**
   * Get metadata size
   * @returns Number of metadata entries
   */
  getSize(): number {
    return this.metaData.size;
  }

  /**
   * Get metadata entries iterator
   * @returns Iterator for [key, values] pairs
   */
  entries(): IterableIterator<[string, string[]]> {
    return this.metaData.entries();
  }
}