import { IMetaDataManager } from '../interfaces';
/**
 * Manages metadata operations for Docker BuildX Image Tools
 * Following Single Responsibility Principle
 */
export declare class MetaDataManager implements IMetaDataManager {
    private readonly metaData;
    /**
     * Add a single key-value pair to metadata
     * @param key - The metadata key (defaults to empty string)
     * @param value - The metadata value
     * @returns this instance for method chaining
     * @throws Error if key or value is invalid
     */
    addMetaData(key: string | undefined, value: string): this;
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
     * Get all metadata entries
     * @returns Map of all metadata
     */
    getAllMetaData(): Map<string, string[]>;
    /**
     * Get metadata size
     * @returns Number of metadata entries
     */
    getSize(): number;
    /**
     * Get metadata entries iterator
     * @returns Iterator for [key, values] pairs
     */
    entries(): IterableIterator<[string, string[]]>;
}
//# sourceMappingURL=MetaDataManager.d.ts.map