import { IStringListProvider } from '../../../../../libs';
import { IDockerBuildXImageTools } from '../interfaces';
import { IDockerBuildXImageToolsProvider } from '../providers';
export declare class DockerBuildXImageToolsService implements IDockerBuildXImageTools, IDockerBuildXImageToolsProvider, IStringListProvider {
    readonly command: string;
    readonly executor: string;
    readonly subCommands: string[];
    private readonly _useStringList;
    private readonly metaDataManager;
    private readonly commandBuilder;
    private readonly stringFormatter;
    constructor(command: string, useStringList?: boolean);
    get useStringList(): boolean;
    get metaData(): Map<string, string[]>;
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
     * Convert the instance to a readable string representation
     * @returns Formatted string representation of the instance
     */
    toString(): string;
    /**
     * Generate command string with backslash line continuation
     * @returns Docker command formatted with backslashes
     */
    toStringMultiLineCommand(): string;
}
//# sourceMappingURL=DockerBuildXImageToolsService.d.ts.map