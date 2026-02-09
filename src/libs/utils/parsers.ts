import * as core from '@actions/core';
import { IStringParser } from '../interfaces';
import { limitInputSize, removeQuotes, sanitizeInput } from './common';

/**
 * Parses a comma-separated string into a trimmed, non-empty string array.
 * @param input - The comma-separated string to parse
 * @returns Array of trimmed, non-empty strings
 */
export function parseCommaSeparated(input: string): string[] {
  if (!input || input.trim() === '') {
    return [];
  }
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Parses a JSON string into a key-value object.
 * Logs a warning and returns an empty object on parse failure.
 * @param input - The JSON string to parse
 * @returns Parsed object or empty object on failure
 */
export function parseJsonObject(input: string): Record<string, string> {
  if (!input || input.trim() === '' || input.trim() === '{}') {
    return {};
  }
  try {
    return JSON.parse(input);
  } catch {
    core.warning(`Failed to parse JSON: ${input}`);
    return {};
  }
}

/**
 * Parses JSON array strings into string arrays.
 * Implements the IStringParser interface to handle JSON array formatted input.
 */
export class JsonArrayParser implements IStringParser {
  canParse(input: string): boolean {
    return /^\s*\[.*\]\s*$/.test(input);
  }

  parse(input: string): string[] {
    try {
      // Parse the JSON array
      const parsed = JSON.parse(input);

      if (Array.isArray(parsed)) {
        // Convert all items to strings and remove any quotes
        return parsed.map(item => removeQuotes(String(item)));
      }
    } catch {
      // Silent fail, will be handled by the fallback parser
    }
    return [];
  }
}

/**
 * Parses escaped JSON strings into string arrays.
 * Implements the IStringParser interface to handle escaped JSON formatted input.
 */
export class EscapedJsonParser implements IStringParser {
  canParse(input: string): boolean {
    return input.includes('\\"');
  }

  parse(input: string): string[] {
    try {
      // First unescape the string
      const unescaped = JSON.parse(`"${input.replace(/^"|"$/g, '')}"`);

      // If it's a JSON array string, parse it
      if (typeof unescaped === 'string' && unescaped.startsWith('[') && unescaped.endsWith(']')) {
        const parsed = JSON.parse(unescaped);

        if (Array.isArray(parsed)) {
          // Convert all items to strings and remove any quotes
          return parsed.map(item => {
            const str = String(item);
            // Remove quotes and escaped quotes
            return removeQuotes(str.replace(/\\"/g, '"'));
          });
        }
      }
    } catch {
      // Silent fail, will be handled by the fallback parser
    }
    return [];
  }
}

/**
 * Parses newline-separated values into string arrays.
 * Implements the IStringParser interface to handle multi-line input.
 */
export class NewlineParser implements IStringParser {
  canParse(input: string): boolean {
    return input.includes('\n');
  }

  parse(input: string): string[] {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('[') && !line.endsWith(']') && line !== ',')
      .map(removeQuotes);
  }
}

/**
 * Parses comma-separated values into string arrays.
 * Implements the IStringParser interface as a fallback parser.
 */
export class CommaParser implements IStringParser {
  canParse(_input: string): boolean {
    return true; // This is our fallback parser
  }

  parse(input: string): string[] {
    return input
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(removeQuotes);
  }
}

/**
 * Parses a JSON string into an object of type T.
 * @template T - The type to cast the parsed JSON to
 * @param jsonString - The JSON string to parse
 * @returns Parsed object of type T
 * @throws Error if the JSON is invalid
 */
export function parseJsonToObject<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    throw new Error(`Failed to parse JSON: ${jsonString}`);
  }
}

/**
 * Creates string parsers in order of precedence.
 * The parsers will be tried in sequence until one successfully parses the input.
 * @returns Array of IStringParser implementations to try
 */
function createParsers(): IStringParser[] {
  return [
    new JsonArrayParser(),
    new EscapedJsonParser(),
    new NewlineParser(),
    new CommaParser(), // Fallback parser
  ];
}

/**
 * Attempts to parse an input as a JSON array.
 * Returns an empty array if parsing fails or input is null/undefined.
 * @param input - The input to parse
 * @returns Parsed array or empty array if parsing fails
 */
function parseArrayFailFast(input: unknown): string[] {
  try {
    if (input === null || input === undefined) {
      return [];
    }
    return JSON.parse(String(input));
  } catch {
    core.warning(`Failed to parse JSON array: ${String(input)}`);
    return [];
  }
}

/**
 * Parses a formatted string or array input into a string array using various parsing strategies.
 * Handles multiple input formats including JSON arrays, escaped JSON, newline-separated, and comma-separated values.
 * @param input - A string, string array, or other input to parse
 * @returns Promise resolving to an array of strings
 */
export async function parseFormattedString(input: unknown): Promise<string[]> {
  const result: string[] = parseArrayFailFast(input);

  if (result.length > 0) {
    return result;
  }

  if (Array.isArray(input)) {
    return input.map(item => (typeof item === 'string' ? item : String(item)));
  }

  // Handle empty or non-string actions
  if (typeof input !== 'string' || input === null || input === undefined) {
    return [];
  }

  const trimmedInput = input.trim();
  if (trimmedInput === '') {
    return [];
  }

  // Sanitize and limit actions
  const cleanedInput = sanitizeInput(trimmedInput);
  const limitedInput = limitInputSize(cleanedInput);

  // Try each parser in order
  const parsers = createParsers();

  for (const parser of parsers) {
    if (parser.canParse(limitedInput)) {
      const result = parser.parse(limitedInput);
      if (result.length > 0) {
        return result;
      }
    }
  }

  // Return empty array if all parsers fail
  return [];
}

/**
 * Parses various input types into a boolean value.
 * Handles strings, numbers, booleans, and undefined values.
 * @param value - The value to parse as a boolean
 * @returns Promise resolving to the parsed boolean value
 */
export async function parseBoolean(value: string | number | boolean | undefined): Promise<boolean> {
  if (typeof value === 'undefined' || (typeof value === 'string' && value === '')) {
    return false;
  } else {
    // Handle actual boolean values
    if (typeof value === 'boolean') return value;

    // Handle numbers
    if (typeof value === 'number') return value !== 0;

    // Handle strings
    const normalizedValue = value.toLowerCase().trim();
    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'y'
    );
  }
}
