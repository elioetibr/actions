/**
 * Interface for command building operations
 * Following Dependency Inversion Principle
 */
export interface ICommandBuilder {
  /**
   * Convert metadata to command-line arguments
   */
  toCommandArgs(): string[];

  /**
   * Build the complete command array
   */
  buildCommand(): string[];
}