/**
 * Shared validation utilities to eliminate code duplication
 */
export class ValidationUtils {
  /**
   * Check if a value is null or undefined
   * @param input - The value to check
   * @returns true if the value is null or undefined
   */
  static isNullOrUndefined(input: unknown): input is null | undefined {
    return input === undefined || input === null;
  }

  /**
   * Validate that a string input is not null or undefined
   * @param input - The input to validate
   * @param fieldName - The name of the field for error messages
   * @throws Error if input is null or undefined
   */
  static validateStringInput(input: string, fieldName: string = 'Input'): void {
    if (this.isNullOrUndefined(input)) {
      throw new Error(`${fieldName} cannot be null or undefined`);
    }
  }

  /**
   * Validate metadata key-value pair
   * @param key - The metadata key
   * @param value - The metadata value
   * @throws Error if key or value is invalid
   */
  static validateMetaDataInput(key: string, value: string): void {
    this.validateStringInput(key, 'Metadata key');
    this.validateStringInput(value, 'Metadata value');
  }

  /**
   * Validate that a command is not empty or null
   * @param command - The command to validate
   * @throws Error if command is empty or null
   */
  static validateCommand(command: string): void {
    if (!command || command.trim() === '') {
      throw new Error('Command cannot be empty or null');
    }
  }
}
