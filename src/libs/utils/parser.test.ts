import {
  CommaParser,
  EscapedJsonParser,
  JsonArrayParser,
  NewlineParser,
  parseBoolean,
  parseFormattedString,
  parseJsonToObject,
} from './parsers';
import * as core from '@actions/core';
import * as common from './common';

// Mock dependencies
jest.mock('@actions/core');
jest.mock('./common');

describe('Parsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    (common.removeQuotes as jest.Mock).mockImplementation(str => str);
    (common.sanitizeInput as jest.Mock).mockImplementation(str => str);
    (common.limitInputSize as jest.Mock).mockImplementation(str => str);
  });

  describe('JsonArrayParser', () => {
    const parser = new JsonArrayParser();

    test('canParse identifies valid JSON arrays', () => {
      expect(parser.canParse('[]')).toBe(true);
      expect(parser.canParse('[1, 2, 3]')).toBe(true);
      expect(parser.canParse(' ["a", "b"] ')).toBe(true);
      expect(parser.canParse('not an array')).toBe(false);
      expect(parser.canParse('[ incomplete')).toBe(false);
    });

    test('parse handles valid JSON arrays', () => {
      expect(parser.parse('[1, "two", 3]')).toEqual(['1', 'two', '3']);
      expect(parser.parse('[]')).toEqual([]);
    });

    test('parse returns empty array on invalid input', () => {
      expect(parser.parse('invalid json')).toEqual([]);
    });

    test('parse calls removeQuotes on each item', () => {
      parser.parse('["test"]');
      expect(common.removeQuotes).toHaveBeenCalledWith('test');
    });
  });

  describe('EscapedJsonParser', () => {
    const parser = new EscapedJsonParser();

    test('canParse identifies escaped JSON strings', () => {
      expect(parser.canParse('string with \\"escaped quotes\\"')).toBe(true);
      expect(parser.canParse('regular string')).toBe(false);
    });

    test('parse handles valid escaped JSON', () => {
      const mockJsonParse = jest.spyOn(JSON, 'parse');
      mockJsonParse
        .mockImplementationOnce(() => '[1,"two",3]') // First call for unescaping
        .mockImplementationOnce(() => [1, 'two', 3]); // Second call for parsing the array

      expect(parser.parse('\\"[1,\\"two\\",3]\\"')).toEqual(['1', 'two', '3']);

      mockJsonParse.mockRestore();
    });

    test("parse handles unescaped string that isn't a JSON array", () => {
      const mockJsonParse = jest.spyOn(JSON, 'parse');
      mockJsonParse
        .mockImplementationOnce(() => 'not an array')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      expect(parser.parse('\\"not an array\\"')).toEqual([]);

      mockJsonParse.mockRestore();
    });

    test('parse returns empty array on parsing error', () => {
      const mockJsonParse = jest.spyOn(JSON, 'parse');
      mockJsonParse.mockImplementation(() => {
        throw new Error();
      });

      expect(parser.parse('invalid')).toEqual([]);

      mockJsonParse.mockRestore();
    });

    test('parse removes quotes and handles escaped quotes', () => {
      const mockJsonParse = jest.spyOn(JSON, 'parse');
      mockJsonParse
        .mockImplementationOnce(() => '["\\"quoted\\""]')
        .mockImplementationOnce(() => ['"quoted"']);

      parser.parse('\\"[\\"\\\\\\"quoted\\\\\\"\\"]\\"');
      expect(common.removeQuotes).toHaveBeenCalledWith('"quoted"');

      mockJsonParse.mockRestore();
    });
  });

  describe('NewlineParser', () => {
    const parser = new NewlineParser();

    test('canParse identifies newline-separated values', () => {
      expect(parser.canParse('line1\nline2')).toBe(true);
      expect(parser.canParse('no newlines')).toBe(false);
    });

    test('parse handles newline-separated values', () => {
      expect(parser.parse('line1\nline2\nline3')).toEqual(['line1', 'line2', 'line3']);
    });

    test('parse trims whitespace', () => {
      expect(parser.parse(' line1 \n  line2  ')).toEqual(['line1', 'line2']);
    });

    test('parse filters empty lines', () => {
      expect(parser.parse('line1\n\nline2')).toEqual(['line1', 'line2']);
    });

    test('parse filters array brackets and commas', () => {
      expect(parser.parse('[\nline1\n,\nline2\n]')).toEqual(['line1', 'line2']);
    });
    test('parse calls removeQuotes on each line', () => {
      parser.parse('line1\nline2');
      expect(common.removeQuotes).toHaveBeenCalledTimes(2);
      expect(common.removeQuotes).toHaveBeenNthCalledWith(1, 'line1', 0, ['line1', 'line2']);
      expect(common.removeQuotes).toHaveBeenNthCalledWith(2, 'line2', 1, ['line1', 'line2']);
    });
  });

  describe('CommaParser', () => {
    const parser = new CommaParser();

    test('canParse always returns true', () => {
      expect(parser.canParse('any string')).toBe(true);
      expect(parser.canParse('')).toBe(true);
    });

    test('parse handles comma-separated values', () => {
      expect(parser.parse('one,two,three')).toEqual(['one', 'two', 'three']);
    });

    test('parse trims whitespace', () => {
      expect(parser.parse(' one , two , three ')).toEqual(['one', 'two', 'three']);
    });

    test('parse filters empty items', () => {
      expect(parser.parse('one,,three')).toEqual(['one', 'three']);
    });

    test('parse calls removeQuotes on each item', () => {
      parser.parse('one,two');
      expect(common.removeQuotes).toHaveBeenCalledTimes(2);
      expect(common.removeQuotes).toHaveBeenNthCalledWith(1, 'one', 0, ['one', 'two']);
      expect(common.removeQuotes).toHaveBeenNthCalledWith(2, 'two', 1, ['one', 'two']);
    });
  });

  describe('parseJsonToObject', () => {
    test('parses valid JSON', () => {
      const result = parseJsonToObject<{ key: string }>('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    test('throws error on invalid JSON', () => {
      expect(() => {
        parseJsonToObject<Record<string, unknown>>('invalid json');
      }).toThrow('Failed to parse JSON: invalid json');
    });
  });

  describe('parseFormattedString', () => {
    test('handles null/undefined input', async () => {
      expect(await parseFormattedString(null)).toEqual([]);
      expect(await parseFormattedString(undefined)).toEqual([]);
    });

    test('handles empty string input', async () => {
      expect(await parseFormattedString('')).toEqual([]);
      expect(await parseFormattedString('   ')).toEqual([]);
    });

    test('handles direct array input', async () => {
      expect(await parseFormattedString([1, 'two', true])).toEqual(['1', 'two', 'true']);
    });

    test('handles valid JSON array string', async () => {
      const result = await parseFormattedString('[1, "two", 3]');
      expect(result).toEqual([1, 'two', 3]); // Numbers remain as numbers, strings remain as strings
    });

    test('handles escaped JSON string', async () => {
      const result = await parseFormattedString('\\"[1, \\"two\\", 3]\\"');
      expect(result).toEqual(['\\"[1', '\\"two\\"', '3]\\"']); // Parsed as comma-separated, not JSON
    });

    test('handles newline-separated values', async () => {
      const result = await parseFormattedString('one\ntwo\nthree');
      expect(result).toEqual(['one', 'two', 'three']);
    });

    test('handles comma-separated values as fallback', async () => {
      const result = await parseFormattedString('one, two, three');
      expect(result).toEqual(['one', 'two', 'three']);
    });

    test('applies input sanitization and limits', async () => {
      await parseFormattedString('input');
      expect(common.sanitizeInput).toHaveBeenCalledWith('input');
      expect(common.limitInputSize).toHaveBeenCalled();
    });

    test('uses parseArrayFailFast successfully', async () => {
      const mockJsonParse = jest.spyOn(JSON, 'parse');
      mockJsonParse.mockImplementationOnce(() => ['array', 'result']);

      const result = await parseFormattedString('jsonString');
      expect(result).toEqual(['array', 'result']);

      mockJsonParse.mockRestore();
    });

    test('parseArrayFailFast handles errors', async () => {
      const mockJsonParse = jest.spyOn(JSON, 'parse');
      mockJsonParse.mockImplementationOnce(() => {
        throw new Error('Parse error');
      });

      // This should fall through to the parser chain
      const spy = jest.spyOn(CommaParser.prototype, 'parse');
      spy.mockReturnValueOnce(['fallback', 'result']);

      const result = await parseFormattedString('unparseable');
      expect(core.warning).toHaveBeenCalled();
      expect(result).toEqual(['fallback', 'result']);

      mockJsonParse.mockRestore();
      spy.mockRestore();
    });

    test('returns empty array if all parsers fail', async () => {
      // Mock all parsers to return empty arrays
      jest.spyOn(JsonArrayParser.prototype, 'parse').mockReturnValueOnce([]);
      jest.spyOn(EscapedJsonParser.prototype, 'parse').mockReturnValueOnce([]);
      jest.spyOn(NewlineParser.prototype, 'parse').mockReturnValueOnce([]);
      jest.spyOn(CommaParser.prototype, 'parse').mockReturnValueOnce([]);

      const result = await parseFormattedString('unparseable input');
      expect(result).toEqual([]);
    });
  });

  describe('parseBoolean', () => {
    test('handles undefined and empty string', async () => {
      expect(await parseBoolean(undefined)).toBe(false);
      expect(await parseBoolean('')).toBe(false);
    });

    test('handles boolean values', async () => {
      expect(await parseBoolean(true)).toBe(true);
      expect(await parseBoolean(false)).toBe(false);
    });

    test('handles number values', async () => {
      expect(await parseBoolean(1)).toBe(true);
      expect(await parseBoolean(42)).toBe(true);
      expect(await parseBoolean(0)).toBe(false);
    });

    test('handles string values', async () => {
      expect(await parseBoolean('true')).toBe(true);
      expect(await parseBoolean('TRUE')).toBe(true);
      expect(await parseBoolean(' True ')).toBe(true);
      expect(await parseBoolean('1')).toBe(true);
      expect(await parseBoolean('yes')).toBe(true);
      expect(await parseBoolean('y')).toBe(true);

      expect(await parseBoolean('false')).toBe(false);
      expect(await parseBoolean('0')).toBe(false);
      expect(await parseBoolean('no')).toBe(false);
      expect(await parseBoolean('random string')).toBe(false);
    });
  });
});
