import { CommandFormatter } from '../../../../../libs';
import { DockerBuildXImageToolsService } from './DockerBuildXImageToolsService';

// Mock the CommandFormatter
jest.mock('../../../../../libs/formatters', () => ({
  CommandFormatter: jest.fn().mockImplementation(() => ({
    toStringMultiLineCommand: jest.fn().mockReturnValue('mocked multi-line command'),
  })),
}));

describe('DockerBuildXImageToolsService', () => {
  let dockerTools: DockerBuildXImageToolsService;

  beforeEach(() => {
    dockerTools = new DockerBuildXImageToolsService('inspect');
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default useStringList as false', () => {
      const tools = new DockerBuildXImageToolsService('test-command');
      expect(tools.command).toBe('test-command');
      expect(tools.useStringList).toBe(false);
      expect(tools.executor).toBe('docker');
      expect(tools.subCommands).toEqual(['buildx', 'imagetools']);
      expect(tools.metaData).toBeInstanceOf(Map);
      expect(tools.metaData.size).toBe(0);
    });

    it('should initialize with useStringList as true when specified', () => {
      const tools = new DockerBuildXImageToolsService('test-command', true);
      expect(tools.useStringList).toBe(true);
    });

    it('should initialize with useStringList as false when explicitly set', () => {
      const tools = new DockerBuildXImageToolsService('test-command', false);
      expect(tools.useStringList).toBe(false);
    });
  });

  describe('addMetaData', () => {
    it('should add metadata with key and value', () => {
      const result = dockerTools.addMetaData('--tag', 'my-image:latest');
      expect(result).toBe(dockerTools); // Test method chaining
      expect(dockerTools.getMetaData('--tag')).toEqual(['my-image:latest']);
    });

    it('should add metadata with empty key (default parameter)', () => {
      const result = dockerTools.addMetaData(undefined as any, 'value-without-key');
      expect(result).toBe(dockerTools);
      expect(dockerTools.getMetaData('')).toEqual(['value-without-key']);
    });

    it('should add metadata with empty string key explicitly', () => {
      dockerTools.addMetaData('', 'another-value');
      expect(dockerTools.getMetaData('')).toEqual(['another-value']);
    });

    it('should append to existing values for the same key', () => {
      dockerTools.addMetaData('--tag', 'image1:v1');
      dockerTools.addMetaData('--tag', 'image2:v2');
      expect(dockerTools.getMetaData('--tag')).toEqual(['image1:v1', 'image2:v2']);
    });

    it('should throw error when value is null', () => {
      expect(() => dockerTools.addMetaData('key', null as any)).toThrow(
        'Metadata value cannot be null or undefined',
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => dockerTools.addMetaData('key', undefined as any)).toThrow(
        'Metadata value cannot be null or undefined',
      );
    });
  });

  describe('setMetaData', () => {
    it('should set metadata with single string value', () => {
      const result = dockerTools.setMetaData('--platform', 'linux/amd64');
      expect(result).toBe(dockerTools); // Test method chaining
      expect(dockerTools.getMetaData('--platform')).toEqual(['linux/amd64']);
    });

    it('should set metadata with array of values', () => {
      dockerTools.setMetaData('--tag', ['image1:v1', 'image2:v2']);
      expect(dockerTools.getMetaData('--tag')).toEqual(['image1:v1', 'image2:v2']);
    });

    it('should replace existing values', () => {
      dockerTools.addMetaData('--tag', 'old-value');
      dockerTools.setMetaData('--tag', 'new-value');
      expect(dockerTools.getMetaData('--tag')).toEqual(['new-value']);
    });

    it('should validate all values in array', () => {
      expect(() => dockerTools.setMetaData('key', ['valid', null as any])).toThrow(
        'Metadata value cannot be null or undefined',
      );
      expect(() => dockerTools.setMetaData('key', ['valid', undefined as any])).toThrow(
        'Metadata value cannot be null or undefined',
      );
    });

    it('should throw error when key is null', () => {
      expect(() => dockerTools.setMetaData(null as any, 'value')).toThrow(
        'Metadata key cannot be null or undefined',
      );
    });

    it('should throw error when key is undefined', () => {
      expect(() => dockerTools.setMetaData(undefined as any, 'value')).toThrow(
        'Metadata key cannot be null or undefined',
      );
    });
  });

  describe('getMetaData', () => {
    it('should return array of values for existing key', () => {
      dockerTools.addMetaData('--tag', 'value1');
      dockerTools.addMetaData('--tag', 'value2');
      expect(dockerTools.getMetaData('--tag')).toEqual(['value1', 'value2']);
    });

    it('should return empty array for non-existing key', () => {
      expect(dockerTools.getMetaData('non-existing')).toEqual([]);
    });
  });

  describe('getFirstMetaData', () => {
    it('should return first value for existing key with values', () => {
      dockerTools.addMetaData('--tag', 'first-value');
      dockerTools.addMetaData('--tag', 'second-value');
      expect(dockerTools.getFirstMetaData('--tag')).toBe('first-value');
    });

    it('should return undefined for non-existing key', () => {
      expect(dockerTools.getFirstMetaData('non-existing')).toBeUndefined();
    });

    it('should return undefined for existing key with empty array', () => {
      dockerTools.metaData.set('empty-key', []);
      expect(dockerTools.getFirstMetaData('empty-key')).toBeUndefined();
    });
  });

  describe('removeMetaData', () => {
    it('should remove metadata for existing key', () => {
      dockerTools.addMetaData('--tag', 'value');
      const result = dockerTools.removeMetaData('--tag');
      expect(result).toBe(dockerTools); // Test method chaining
      expect(dockerTools.getMetaData('--tag')).toEqual([]);
    });

    it('should not throw error when removing non-existing key', () => {
      expect(() => dockerTools.removeMetaData('non-existing')).not.toThrow();
    });
  });

  describe('clearMetaData', () => {
    it('should clear all metadata', () => {
      dockerTools.addMetaData('--tag', 'value1');
      dockerTools.addMetaData('--platform', 'value2');
      const result = dockerTools.clearMetaData();
      expect(result).toBe(dockerTools); // Test method chaining
      expect(dockerTools.metaData.size).toBe(0);
    });

    it('should work when metadata is already empty', () => {
      expect(() => dockerTools.clearMetaData()).not.toThrow();
      expect(dockerTools.metaData.size).toBe(0);
    });
  });

  describe('toCommandArgs', () => {
    it('should return empty array when no metadata', () => {
      expect(dockerTools.toCommandArgs()).toEqual([]);
    });

    it('should format args with key-value pairs', () => {
      dockerTools.addMetaData('--tag', 'my-image');
      dockerTools.addMetaData('--platform', 'linux/amd64');
      const args = dockerTools.toCommandArgs();
      expect(args).toContain('--tag');
      expect(args).toContain('my-image');
      expect(args).toContain('--platform');
      expect(args).toContain('linux/amd64');
    });

    it('should handle multiple values for same key', () => {
      dockerTools.addMetaData('--tag', 'image1');
      dockerTools.addMetaData('--tag', 'image2');
      const args = dockerTools.toCommandArgs();
      expect(args).toEqual(['--tag', 'image1', '--tag', 'image2']);
    });

    it('should handle empty key (add values directly)', () => {
      dockerTools.addMetaData('', 'direct-value');
      dockerTools.addMetaData('', 'another-direct');
      const args = dockerTools.toCommandArgs();
      expect(args).toEqual(['direct-value', 'another-direct']);
    });

    it('should handle mixed empty and non-empty keys', () => {
      dockerTools.addMetaData('', 'direct-value');
      dockerTools.addMetaData('--tag', 'tagged-value');
      const args = dockerTools.toCommandArgs();
      expect(args).toContain('direct-value');
      expect(args).toContain('--tag');
      expect(args).toContain('tagged-value');
    });
  });

  describe('buildCommand', () => {
    it('should build complete command array', () => {
      dockerTools.addMetaData('--tag', 'my-image');
      const command = dockerTools.buildCommand();
      expect(command[0]).toBe('docker');
      expect(command[1]).toBe('buildx');
      expect(command[2]).toBe('imagetools');
      expect(command[3]).toBe('inspect');
      expect(command.slice(4)).toContain('--tag');
      expect(command.slice(4)).toContain('my-image');
    });

    it('should build command without metadata', () => {
      const command = dockerTools.buildCommand();
      expect(command).toEqual(['docker', 'buildx', 'imagetools', 'inspect']);
    });
  });

  describe('toString', () => {
    it('should format instance with no metadata', () => {
      const str = dockerTools.toString();
      expect(str).toContain('DockerBuildXImageToolsService {');
      expect(str).toContain('command: "inspect"');
      expect(str).toContain('executor: "docker"');
      expect(str).toContain('subCommands: ["buildx", "imagetools"]');
      expect(str).toContain('useStringList: false');
      expect(str).toContain('metaData: Map(0) {}');
      expect(str).toContain('}');
    });

    it('should format instance with single value metadata', () => {
      dockerTools.addMetaData('--tag', 'my-image');
      const str = dockerTools.toString();
      expect(str).toContain('metaData: Map(1) {');
      expect(str).toContain('"--tag" => "my-image"');
    });

    it('should format instance with multiple values for same key', () => {
      dockerTools.addMetaData('--tag', 'image1');
      dockerTools.addMetaData('--tag', 'image2');
      const str = dockerTools.toString();
      expect(str).toContain('metaData: Map(1) {');
      expect(str).toContain('"--tag" => ["image1", "image2"]');
    });

    it('should format instance with empty key', () => {
      dockerTools.addMetaData('', 'direct-value');
      const str = dockerTools.toString();
      expect(str).toContain('"(empty)" => "direct-value"');
    });

    it('should escape special characters in strings', () => {
      dockerTools.addMetaData('key"with"quotes', 'value\\with\\backslashes');
      const str = dockerTools.toString();
      expect(str).toContain('"key\\"with\\"quotes"');
      expect(str).toContain('"value\\\\with\\\\backslashes"');
    });

    it('should show useStringList as true when set', () => {
      const tools = new DockerBuildXImageToolsService('test', true);
      const str = tools.toString();
      expect(str).toContain('useStringList: true');
    });

    it('should handle multiple metadata entries efficiently', () => {
      dockerTools.addMetaData('--tag', 'image1');
      dockerTools.addMetaData('--platform', 'linux/amd64');
      dockerTools.addMetaData('--output', 'type=registry');
      const str = dockerTools.toString();
      expect(str).toContain('metaData: Map(3) {');
      expect(str).toContain('"--tag"');
      expect(str).toContain('"--platform"');
      expect(str).toContain('"--output"');
    });
  });

  describe('toStringMultiLineCommand', () => {
    it('should delegate to CommandFormatter', () => {
      const result = dockerTools.toStringMultiLineCommand();
      expect(CommandFormatter).toHaveBeenCalledWith(dockerTools, dockerTools);
      expect(result).toBe('mocked multi-line command');
    });
  });

  describe('Private methods (tested through public interface)', () => {
    describe('escapeString', () => {
      it('should escape quotes and backslashes in toString output', () => {
        dockerTools.addMetaData('key"test', 'value\\test"end');
        const str = dockerTools.toString();
        expect(str).toContain('\\"');
        expect(str).toContain('\\\\');
      });
    });

    describe('formatStringArray', () => {
      it('should format array with escaped strings in toString output', () => {
        dockerTools.setMetaData('--tag', ['image"1', 'image\\2']);
        const str = dockerTools.toString();
        expect(str).toContain('["image\\"1", "image\\\\2"]');
      });
    });

    describe('validateMetaDataInput', () => {
      it('should validate through addMetaData and setMetaData', () => {
        // Already tested through addMetaData and setMetaData methods
        expect(() => dockerTools.addMetaData(null as any, 'value')).toThrow();
        expect(() => dockerTools.setMetaData('key', null as any)).toThrow();
      });
    });

    describe('isNullOrUndefined', () => {
      it('should detect null and undefined values through validation', () => {
        // Tested through validation in addMetaData and setMetaData
        expect(() => dockerTools.addMetaData('key', null as any)).toThrow();
        expect(() => dockerTools.addMetaData('key', undefined as any)).toThrow();
      });
    });
  });

  describe('Interface compliance', () => {
    it('should implement all required properties and methods', () => {
      // Test that the class implements the expected interfaces
      expect(dockerTools).toHaveProperty('command');
      expect(dockerTools).toHaveProperty('executor');
      expect(dockerTools).toHaveProperty('subCommands');
      expect(dockerTools).toHaveProperty('metaData');
      expect(dockerTools).toHaveProperty('useStringList');

      // Test method existence
      expect(typeof dockerTools.addMetaData).toBe('function');
      expect(typeof dockerTools.setMetaData).toBe('function');
      expect(typeof dockerTools.getMetaData).toBe('function');
      expect(typeof dockerTools.getFirstMetaData).toBe('function');
      expect(typeof dockerTools.removeMetaData).toBe('function');
      expect(typeof dockerTools.clearMetaData).toBe('function');
      expect(typeof dockerTools.toCommandArgs).toBe('function');
      expect(typeof dockerTools.buildCommand).toBe('function');
      expect(typeof dockerTools.toString).toBe('function');
      expect(typeof dockerTools.toStringMultiLineCommand).toBe('function');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle empty string values', () => {
      dockerTools.addMetaData('--tag', '');
      expect(dockerTools.getMetaData('--tag')).toEqual(['']);
    });

    it('should handle whitespace-only values', () => {
      dockerTools.addMetaData('--tag', '   ');
      expect(dockerTools.getMetaData('--tag')).toEqual(['   ']);
    });

    it('should handle special characters in keys and values', () => {
      dockerTools.addMetaData('--tag=special', 'value@#$%');
      expect(dockerTools.getMetaData('--tag=special')).toEqual(['value@#$%']);
    });

    it('should maintain insertion order for different keys', () => {
      dockerTools.addMetaData('--tag', 'value1');
      dockerTools.addMetaData('--platform', 'value2');
      dockerTools.addMetaData('--output', 'value3');

      const entries = Array.from(dockerTools.metaData.entries());
      expect(entries[0][0]).toBe('--tag');
      expect(entries[1][0]).toBe('--platform');
      expect(entries[2][0]).toBe('--output');
    });
  });
});
