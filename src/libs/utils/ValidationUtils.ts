/**
 * Shared validation utilities.
 *
 * Exposed as a plain object (not a class) so V8 coverage doesn't track an
 * implicit default constructor that the codebase never instantiates.
 */
export const ValidationUtils = {
  /**
   * Check if a value is null or undefined.
   */
  isNullOrUndefined(input: unknown): input is null | undefined {
    return input === undefined || input === null;
  },

  /**
   * Validate that a string input is not null or undefined.
   * @throws Error if input is null or undefined
   */
  validateStringInput(input: string, fieldName: string = 'Input'): void {
    if (ValidationUtils.isNullOrUndefined(input)) {
      throw new Error(`${fieldName} cannot be null or undefined`);
    }
  },

  /**
   * Validate a metadata key-value pair.
   * @throws Error if key or value is invalid
   */
  validateMetaDataInput(key: string, value: string): void {
    ValidationUtils.validateStringInput(key, 'Metadata key');
    ValidationUtils.validateStringInput(value, 'Metadata value');
  },

  /**
   * Validate that a command string is not empty.
   * @throws Error if command is empty or null
   */
  validateCommand(command: string): void {
    if (!command || command.trim() === '') {
      throw new Error('Command cannot be empty or null');
    }
  },
} as const;
