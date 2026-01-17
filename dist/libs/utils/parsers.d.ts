import { IStringParser } from '../interfaces';
/**
 * Parses JSON array strings into string arrays.
 * Implements the IStringParser interface to handle JSON array formatted input.
 */
export declare class JsonArrayParser implements IStringParser {
    canParse(input: string): boolean;
    parse(input: string): string[];
}
/**
 * Parses escaped JSON strings into string arrays.
 * Implements the IStringParser interface to handle escaped JSON formatted input.
 */
export declare class EscapedJsonParser implements IStringParser {
    canParse(input: string): boolean;
    parse(input: string): string[];
}
/**
 * Parses newline-separated values into string arrays.
 * Implements the IStringParser interface to handle multi-line input.
 */
export declare class NewlineParser implements IStringParser {
    canParse(input: string): boolean;
    parse(input: string): string[];
}
/**
 * Parses comma-separated values into string arrays.
 * Implements the IStringParser interface as a fallback parser.
 */
export declare class CommaParser implements IStringParser {
    canParse(_input: string): boolean;
    parse(input: string): string[];
}
/**
 * Parses a JSON string into an object of type T.
 * @template T - The type to cast the parsed JSON to
 * @param jsonString - The JSON string to parse
 * @returns Parsed object of type T
 * @throws Error if the JSON is invalid
 */
export declare function parseJsonToObject<T>(jsonString: string): T;
/**
 * Parses a formatted string actions into a string array
 * Following SOLID principles:
 * - Single Responsibility: Each parser class has one job
 * - Open/Closed: New parsers can be added without modifying existing code
 * - Liskov Substitution: All parsers implement the StringParser interface
 * - Interface Segregation: Lean interfaces with only needed methods
 * - Dependency Inversion: High-level parseFormattedString doesn't depend on parser details
 *
 * And KISS principles:
 * - Each parser does one simple thing
 * - Clear control flow with early returns
 * - No deep nesting of conditionals
 * - Descriptive naming
 * - Helper function for common tasks
 *
 * @param input - A string or string array to parse
 * @returns An array of strings
 */
/**
 * Parses a formatted string or array input into a string array using various parsing strategies.
 * Handles multiple input formats including JSON arrays, escaped JSON, newline-separated, and comma-separated values.
 * @param input - A string, string array, or any other input to parse
 * @returns Promise resolving to an array of strings
 */
export declare function parseFormattedString(input: any): Promise<string[]>;
/**
 * Parses various input types into a boolean value.
 * Handles strings, numbers, booleans, and undefined values.
 * @param value - The value to parse as a boolean
 * @returns Promise resolving to the parsed boolean value
 */
export declare function parseBoolean(value: string | number | boolean | undefined): Promise<boolean>;
//# sourceMappingURL=parsers.d.ts.map