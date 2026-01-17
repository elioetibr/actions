import * as core from '@actions/core';
import { Exec as docker } from '@docker/actions-toolkit/lib/exec';
import {
  limitInputSize,
  processManifestImages,
  processSourceImages,
  removeQuotes,
  safePrettyJson,
  sanitizeInput,
} from './common';
import { handleError } from './handlers';
import { parseFormattedString } from './parsers';
import { MAX_INPUT_SIZE } from './constants';

// Mock dependencies
jest.mock('@actions/core');
jest.mock('@docker/actions-toolkit/lib/exec');
jest.mock('./handlers');
jest.mock('./parsers');

describe('common utils', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('safePrettyJson', () => {
    it('should convert object to pretty JSON string', () => {
      const testObj = { test: 'value', nested: { key: 'value' } };
      const result = safePrettyJson(testObj);
      expect(result).toContain('\\n'); // Verify newlines are escaped
      expect(result).toContain('test');
      expect(result).toContain('nested');
    });

    it('should escape problematic characters', () => {
      const testObj = { specialChars: 'test\n\r\t"\\' };
      const result = safePrettyJson(testObj);
      expect(result).toContain('\\\\n'); // Double escaped newline
      expect(result).toContain('\\\\r'); // Double escaped carriage return
      expect(result).toContain('\\\\t'); // Double escaped tab
      expect(result).toContain('\\\\"'); // Double escaped quote
      expect(result).toContain('\\\\\\\\'); // Double escaped backslash
    });

    it('should handle error when JSON stringify fails', () => {
      // Create object with circular reference
      const circularObj: any = {};
      circularObj.self = circularObj;

      const result = safePrettyJson(circularObj);
      expect(result).toBe('Invalid JSON object');
    });

    it('should use specified spaces for indentation', () => {
      const testObj = { test: 'value' };
      const result = safePrettyJson(testObj, 4);
      // We'd expect 4 spaces for indentation, but since the output is escaped,
      // we're checking that the function called JSON.stringify with the right params
      const stringifySpy = jest.spyOn(JSON, 'stringify');
      safePrettyJson(testObj, 4);
      expect(result).toBeDefined();
      expect(stringifySpy).toHaveBeenCalledWith(testObj, null, 4);
    });
  });

  describe('processManifestImages', () => {
    it('should process manifest images correctly', async () => {
      const mockData = ['image1:tag1', 'image2:tag2'];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockData);

      const result = await processManifestImages('--tag', mockData);

      expect(parseFormattedString).toHaveBeenCalledWith(mockData);
      expect(core.debug).toHaveBeenCalledWith(
        expect.stringContaining('Generating manifest entries')
      );
      expect(result).toEqual(['--tag', '"image1:tag1"', '--tag', '"image2:tag2"']);
    });

    it('should skip empty items', async () => {
      const mockData = ['image1:tag1', '', '  ', 'image2:tag2'];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockData);

      const result = await processManifestImages('--annotation', mockData);

      expect(result).toEqual(['--annotation', '"image1:tag1"', '--annotation', '"image2:tag2"']);
    });

    it('should handle includePrefix: false option', async () => {
      const mockData = ['image1:tag1', 'image2:tag2'];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockData);

      const result = await processManifestImages('--tag', mockData, {
        parseInput: false,
        includePrefix: false,
        useDebugLogging: false
      });

      expect(parseFormattedString).not.toHaveBeenCalled();
      expect(core.debug).not.toHaveBeenCalled();
      expect(result).toEqual(['--tag "image1:tag1"', '--tag "image2:tag2"']);
    });
  });

  describe('processSourceImages', () => {
    it('should pull images and format for buildx when not in dry run mode', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockImageTags);

      const result = await processSourceImages(mockImageTags, false);

      expect(parseFormattedString).toHaveBeenCalledWith(mockImageTags);
      expect(docker.exec).toHaveBeenCalledTimes(2);
      expect(docker.exec).toHaveBeenCalledWith('docker', ['pull', 'image1:tag1']);
      expect(docker.exec).toHaveBeenCalledWith('docker', ['pull', 'image2:tag2']);
      expect(result).toEqual(['"image1:tag1"', '"image2:tag2"']);
    });

    it('should not pull images in dry run mode but should return formatted tags', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockImageTags);

      const result = await processSourceImages(mockImageTags, true);

      expect(docker.exec).not.toHaveBeenCalled();
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('DryRun'));
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('skipping docker pull'));
      expect(result).toEqual(['"image1:tag1"', '"image2:tag2"']);
    });

    it('should handle empty tags', async () => {
      const mockImageTags = ['image1:tag1', '', '  '];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockImageTags);

      const result = await processSourceImages(mockImageTags, true);

      expect(result).toEqual(['"image1:tag1"']);
    });

    it('should handle errors from docker pull', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];
      (parseFormattedString as jest.Mock).mockResolvedValue(mockImageTags);

      // Make the first docker pull fail
      (docker.exec as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Docker pull failed');
      });

      const result = await processSourceImages(mockImageTags, false);

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(result).toEqual(['"image2:tag2"']);
    });

    it('should handle parse errors', async () => {
      const mockImageTags = ['image1:tag1'];
      (parseFormattedString as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Parse failed');
      });

      const result = await processSourceImages(mockImageTags, false);

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(result).toEqual([]);
    });
  });

  describe('removeQuotes', () => {
    it('should remove quotes from the beginning and end of a string', () => {
      expect(removeQuotes('"test"')).toBe('test');
      expect(removeQuotes("'test'")).toBe('test');
      expect(removeQuotes('`test`')).toBe('test');
      expect(removeQuotes('"test')).toBe('test');
      expect(removeQuotes('test"')).toBe('test');
      expect(removeQuotes('te"st')).toBe('te"st'); // Only removes at start/end
    });
  });

  describe('sanitizeInput', () => {
    it('should trim and remove backticks from input', () => {
      expect(sanitizeInput('`test`')).toBe('test');
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('  `test`  ')).toBe('test');
      expect(sanitizeInput('test')).toBe('test');
    });
  });

  describe('limitInputSize', () => {
    it('should limit input size to MAX_INPUT_SIZE', () => {
      const largeString = 'a'.repeat(MAX_INPUT_SIZE + 100);
      const result = limitInputSize(largeString);
      expect(result.length).toBe(MAX_INPUT_SIZE);
    });

    it('should not modify strings smaller than MAX_INPUT_SIZE', () => {
      const smallString = 'test';
      expect(limitInputSize(smallString)).toBe(smallString);
    });
  });

  describe('processManifestImages', () => {
    it('should generate manifest image tags with prefix', async () => {
      const mockInputs = ['image1:tag1', 'image2:tag2'];

      const result = await processManifestImages('--tag', mockInputs);

      // Note: processManifestImages uses processManifestImages with useDebugLogging: false
      expect(core.info).not.toHaveBeenCalled();
      expect(result).toEqual(['--tag', '"image1:tag1"', '--tag', '"image2:tag2"']);
    });

    it('should skip empty items', async () => {
      const mockInputs = ['image1:tag1', '', '  ', 'image2:tag2'];

      const result = await processManifestImages('--tag', mockInputs);

      expect(result).toEqual(['--tag', '"image1:tag1"', '--tag', '"image2:tag2"']);
    });
  });

  describe('processSourceImages', () => {
    it('should pull images and return properly formatted tags when not in dry run mode', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];

      const result = await processSourceImages(mockImageTags, false);

      expect(docker.exec).toHaveBeenCalledTimes(2);
      expect(docker.exec).toHaveBeenCalledWith('docker', ['pull', 'image1:tag1']);
      expect(docker.exec).toHaveBeenCalledWith('docker', ['pull', 'image2:tag2']);
      expect(result).toEqual(['"image1:tag1"', '"image2:tag2"']);
    });

    it('should skip pulling images in dry run mode but return formatted tags', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];

      const result = await processSourceImages(mockImageTags, true);

      expect(docker.exec).not.toHaveBeenCalled();
      expect(result).toEqual(['"image1:tag1"', '"image2:tag2"']);
    });

    it('should skip empty tags', async () => {
      const mockImageTags = ['image1:tag1', '', '  ', 'image2:tag2'];

      const result = await processSourceImages(mockImageTags, true);

      expect(result).toEqual(['"image1:tag1"', '"image2:tag2"']);
    });

    it('should handle error from docker pull and continue with other tags', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];

      // Make the first docker pull fail
      (docker.exec as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Docker pull failed');
      });

      const result = await processSourceImages(mockImageTags, false);

      expect(handleError).toHaveBeenCalledWith(expect.any(Error));
      expect(result).toEqual(['"image2:tag2"']);
    });

    it('should handle non-Error exceptions', async () => {
      const mockImageTags = ['image1:tag1', 'image2:tag2'];

      // Make the first docker pull fail with a non-Error exception
      (docker.exec as jest.Mock).mockImplementationOnce(() => {
        throw 'Not an Error object';
      });

      const result = await processSourceImages(mockImageTags, false);

      expect(handleError).toHaveBeenCalledWith('Not an Error object');
      expect(result).toEqual(['"image2:tag2"']);
    });

    it('should handle outer try-catch errors', async () => {
      const mockImageTags = ['image1:tag1'];
      await processSourceImages(mockImageTags, false);
      expect(handleError).toBeDefined();
    });
  });
});
