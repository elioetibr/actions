/**
 * Shared validation utilities to eliminate code duplication
 */
export declare class ValidationUtils {
    /**
     * Check if a value is null or undefined
     * @param input - The value to check
     * @returns true if the value is null or undefined
     */
    static isNullOrUndefined(input: any): boolean;
    /**
     * Validate that a string input is not null or undefined
     * @param input - The input to validate
     * @param fieldName - The name of the field for error messages
     * @throws Error if input is null or undefined
     */
    static validateStringInput(input: string, fieldName?: string): void;
    /**
     * Validate metadata key-value pair
     * @param key - The metadata key
     * @param value - The metadata value
     * @throws Error if key or value is invalid
     */
    static validateMetaDataInput(key: string, value: string): void;
    /**
     * Validate that a command is not empty or null
     * @param command - The command to validate
     * @throws Error if command is empty or null
     */
    static validateCommand(command: string): void;
}
//# sourceMappingURL=ValidationUtils.d.ts.map