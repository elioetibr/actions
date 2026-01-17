import { IMetaDataManager, IStringFormatter } from '../interfaces';
/**
 * Handles string formatting for Docker BuildX Image Tools
 * Following Single Responsibility Principle
 */
export declare class StringFormatter implements IStringFormatter {
    private readonly className;
    private readonly command;
    private readonly executor;
    private readonly subCommands;
    private readonly useStringList;
    private readonly metaDataManager;
    constructor(className: string, command: string, executor: string, subCommands: string[], useStringList: boolean, metaDataManager: IMetaDataManager);
    /**
     * Convert the instance to a readable string representation
     * @returns Formatted string representation of the instance
     */
    toString(): string;
    /**
     * Format metadata for string representation
     * @private
     */
    private formatMetaData;
    /**
     * Escape and format a string for display
     * @param str - String to escape
     * @returns Escaped string with quotes
     */
    private escapeString;
    /**
     * Format an array of strings for display
     * @param arr - Array of strings to format
     * @returns Comma-separated formatted string
     */
    private formatStringArray;
}
//# sourceMappingURL=StringFormatter.d.ts.map