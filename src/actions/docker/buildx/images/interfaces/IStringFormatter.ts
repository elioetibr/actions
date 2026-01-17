/**
 * Interface for string formatting operations
 * Following Dependency Inversion Principle and Strategy Pattern
 */
export interface IStringFormatter {
  /**
   * Convert the instance to a readable string representation
   */
  toString(): string;
}