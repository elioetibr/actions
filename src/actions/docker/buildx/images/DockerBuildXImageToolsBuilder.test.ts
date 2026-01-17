import { DockerBuildXImageToolsBuilder } from './DockerBuildXImageToolsBuilder';
import { DockerBuildXImageToolsService } from './services';
import { IDockerBuildXImageTools } from './interfaces';
import { DockerBuildXImageToolsFactory } from './DockerBuildXImageToolsBuilderFactory';

// Mock the DockerBuildXImageToolsService class
// noinspection DuplicatedCode
jest.mock('./services/DockerBuildXImageToolsService', () => ({
  DockerBuildXImageToolsService: jest
    .fn()
    .mockImplementation((command: string, useStringList: boolean) => ({
      command,
      executor: 'docker',
      subCommands: ['buildx', 'imagetools'],
      useStringList,
      metaData: new Map(),
      setMetaData: jest.fn().mockReturnThis(),
      addMetaData: jest.fn().mockReturnThis(),
      getMetaData: jest.fn().mockReturnValue([]),
      getFirstMetaData: jest.fn().mockReturnValue(undefined),
      removeMetaData: jest.fn().mockReturnThis(),
      clearMetaData: jest.fn().mockReturnThis(),
      toCommandArgs: jest.fn().mockReturnValue([]),
      buildCommand: jest.fn().mockReturnValue(['docker', 'buildx', 'imagetools']),
      toString: jest.fn().mockReturnValue('DockerBuildXImageToolsService'),
      toStringMultiLineCommand: jest.fn().mockReturnValue('docker buildx imagetools'),
    })),
}));

describe('DockerBuildXImageToolsBuilder', () => {
  let builder: DockerBuildXImageToolsBuilder;
  let mockDockerBuildXImageTools: jest.Mocked<IDockerBuildXImageTools>;

  beforeEach(() => {
    builder = new DockerBuildXImageToolsBuilder();
    jest.clearAllMocks();

    // Setup mock for DockerBuildXImageToolsService
    mockDockerBuildXImageTools = {
      command: '',
      executor: 'docker',
      subCommands: ['buildx', 'imagetools'],
      useStringList: false,
      metaData: new Map(),
      setMetaData: jest.fn().mockReturnThis(),
      addMetaData: jest.fn().mockReturnThis(),
      getMetaData: jest.fn().mockReturnValue([]),
      getFirstMetaData: jest.fn().mockReturnValue(undefined),
      removeMetaData: jest.fn().mockReturnThis(),
      clearMetaData: jest.fn().mockReturnThis(),
      toCommandArgs: jest.fn().mockReturnValue([]),
      buildCommand: jest.fn().mockReturnValue(['docker', 'buildx', 'imagetools']),
      toString: jest.fn().mockReturnValue('DockerBuildXImageToolsService'),
      toStringMultiLineCommand: jest.fn().mockReturnValue('docker buildx imagetools'),
    };

    (
      DockerBuildXImageToolsService as jest.MockedClass<typeof DockerBuildXImageToolsService>
    ).mockImplementation(() => mockDockerBuildXImageTools as any);
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(builder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
      expect(builder['command']).toBe('');
      expect(builder['useStringList']).toBe(false);
      expect(builder['metadata']).toBeInstanceOf(Map);
      expect(builder['metadata'].size).toBe(0);
    });

    it('should implement IDockerBuildXImageToolsBuilder interface', () => {
      expect(typeof builder.withCommand).toBe('function');
      expect(typeof builder.withStringListOutput).toBe('function');
      expect(typeof builder.addMetaData).toBe('function');
      expect(typeof builder.setMetaData).toBe('function');
      expect(typeof builder.withMetaData).toBe('function');
      expect(typeof builder.withTag).toBe('function');
      expect(typeof builder.withTags).toBe('function');
      expect(typeof builder.withFile).toBe('function');
      expect(typeof builder.withOutput).toBe('function');
      expect(typeof builder.withPlatform).toBe('function');
      expect(typeof builder.withPlatforms).toBe('function');
      expect(typeof builder.withAnnotation).toBe('function');
      expect(typeof builder.withAnnotations).toBe('function');
      expect(typeof builder.withSource).toBe('function');
      expect(typeof builder.withSources).toBe('function');
      expect(typeof builder.withDryRun).toBe('function');
      expect(typeof builder.withVerbose).toBe('function');
      expect(typeof builder.reset).toBe('function');
      expect(typeof builder.build).toBe('function');
    });
  });

  describe('Static factory methods', () => {
    describe('create', () => {
      it('should create new services instance without command', () => {
        const newBuilder = DockerBuildXImageToolsBuilder.create();
        expect(newBuilder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
        expect(newBuilder['command']).toBe('');
      });

      it('should create new services instance with command', () => {
        const newBuilder = DockerBuildXImageToolsBuilder.create('test-command');
        expect(newBuilder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
        expect(newBuilder['command']).toBe('test-command');
      });

      it('should return different instances on multiple calls', () => {
        const builder1 = DockerBuildXImageToolsBuilder.create();
        const builder2 = DockerBuildXImageToolsBuilder.create();
        expect(builder1).not.toBe(builder2);
      });

      it('should handle undefined command parameter', () => {
        const newBuilder = DockerBuildXImageToolsBuilder.create(undefined);
        expect(newBuilder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
        expect(newBuilder['command']).toBe('');
      });
    });

    describe('forCreate', () => {
      it('should create services with create command', () => {
        const createBuilder = DockerBuildXImageToolsBuilder.forCreate();
        expect(createBuilder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
        expect(createBuilder['command']).toBe('create');
      });
    });

    describe('forInspect', () => {
      it('should create services with inspect command', () => {
        const inspectBuilder = DockerBuildXImageToolsBuilder.forInspect();
        expect(inspectBuilder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
        expect(inspectBuilder['command']).toBe('inspect');
      });
    });

    describe('forPrune', () => {
      it('should create services with prune command', () => {
        const pruneBuilder = DockerBuildXImageToolsBuilder.forPrune();
        expect(pruneBuilder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
        expect(pruneBuilder['command']).toBe('prune');
      });
    });
  });

  describe('withCommand', () => {
    it('should set command and return self for chaining', () => {
      const result = builder.withCommand('test-command');
      expect(result).toBe(builder);
      expect(builder['command']).toBe('test-command');
    });

    it('should trim whitespace from command', () => {
      builder.withCommand('  test-command  ');
      expect(builder['command']).toBe('test-command');
    });

    it('should throw error for empty command', () => {
      expect(() => builder.withCommand('')).toThrow('Command cannot be empty or null');
    });

    it('should throw error for whitespace-only command', () => {
      expect(() => builder.withCommand('   ')).toThrow('Command cannot be empty or null');
    });

    it('should throw error for null command', () => {
      expect(() => builder.withCommand(null as any)).toThrow('Command cannot be empty or null');
    });

    it('should throw error for undefined command', () => {
      expect(() => builder.withCommand(undefined as any)).toThrow(
        'Command cannot be empty or null',
      );
    });

    it('should handle falsy values', () => {
      expect(() => builder.withCommand(0 as any)).toThrow('Command cannot be empty or null');
      expect(() => builder.withCommand(false as any)).toThrow('Command cannot be empty or null');
    });
  });

  describe('withStringListOutput', () => {
    it('should set useStringList to true and return self', () => {
      const result = builder.withStringListOutput(true);
      expect(result).toBe(builder);
      expect(builder['useStringList']).toBe(true);
    });

    it('should set useStringList to false and return self', () => {
      builder['useStringList'] = true; // Set to true first
      const result = builder.withStringListOutput(false);
      expect(result).toBe(builder);
      expect(builder['useStringList']).toBe(false);
    });
  });

  describe('addMetaData', () => {
    it('should add metadata with key and value', () => {
      const result = builder.addMetaData('--tag', 'my-image:latest');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--tag')).toEqual(['my-image:latest']);
    });

    it('should add metadata with empty key using default parameter', () => {
      const result = builder.addMetaData(undefined as any, 'positional-arg');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('')).toEqual(['positional-arg']);
    });

    it('should append to existing values for same key', () => {
      builder.addMetaData('--tag', 'image1:v1');
      builder.addMetaData('--tag', 'image2:v2');
      expect(builder['metadata'].get('--tag')).toEqual(['image1:v1', 'image2:v2']);
    });

    it('should throw error when value is null', () => {
      expect(() => builder.addMetaData('key', null as any)).toThrow(
        'Metadata value cannot be null or undefined',
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => builder.addMetaData('key', undefined as any)).toThrow(
        'Metadata value cannot be null or undefined',
      );
    });
  });

  describe('setMetaData', () => {
    it('should set metadata with single string value', () => {
      const result = builder.setMetaData('--platform', 'linux/amd64');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--platform')).toEqual(['linux/amd64']);
    });

    it('should set metadata with array of values', () => {
      const result = builder.setMetaData('--tag', ['image1:v1', 'image2:v2']);
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--tag')).toEqual(['image1:v1', 'image2:v2']);
    });

    it('should replace existing values', () => {
      builder.addMetaData('--tag', 'old-value');
      builder.setMetaData('--tag', 'new-value');
      expect(builder['metadata'].get('--tag')).toEqual(['new-value']);
    });

    it('should validate all values in array', () => {
      expect(() => builder.setMetaData('key', ['valid', null as any])).toThrow(
        'Metadata value cannot be null or undefined',
      );
      expect(() => builder.setMetaData('key', ['valid', undefined as any])).toThrow(
        'Metadata value cannot be null or undefined',
      );
    });

    it('should throw error when key is null', () => {
      expect(() => builder.setMetaData(null as any, 'value')).toThrow(
        'Metadata key cannot be null or undefined',
      );
    });

    it('should throw error when key is undefined', () => {
      expect(() => builder.setMetaData(undefined as any, 'value')).toThrow(
        'Metadata key cannot be null or undefined',
      );
    });

    it('should create independent copy of array', () => {
      const originalArray = ['value1', 'value2'];
      builder.setMetaData('--tag', originalArray);
      originalArray.push('value3');
      expect(builder['metadata'].get('--tag')).toEqual(['value1', 'value2']);
    });
  });

  describe('withMetaData', () => {
    it('should set multiple metadata entries from object', () => {
      const metadata = {
        '--tag': 'image:latest',
        '--platform': ['linux/amd64', 'linux/arm64'],
        '--output': 'type=registry',
      };

      const result = builder.withMetaData(metadata);
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--tag')).toEqual(['image:latest']);
      expect(builder['metadata'].get('--platform')).toEqual(['linux/amd64', 'linux/arm64']);
      expect(builder['metadata'].get('--output')).toEqual(['type=registry']);
    });

    it('should handle empty metadata object', () => {
      const result = builder.withMetaData({});
      expect(result).toBe(builder);
      expect(builder['metadata'].size).toBe(0);
    });

    it('should replace existing metadata', () => {
      builder.addMetaData('--tag', 'old-value');
      builder.withMetaData({ '--tag': 'new-value' });
      expect(builder['metadata'].get('--tag')).toEqual(['new-value']);
    });

    it('should handle mixed single values and arrays', () => {
      const metadata = {
        '--single': 'single-value',
        '--multiple': ['value1', 'value2'],
        '--empty': [],
      };

      builder.withMetaData(metadata);
      expect(builder['metadata'].get('--single')).toEqual(['single-value']);
      expect(builder['metadata'].get('--multiple')).toEqual(['value1', 'value2']);
      expect(builder['metadata'].get('--empty')).toEqual([]);
    });
  });

  describe('withTag', () => {
    it('should add tag metadata', () => {
      const result = builder.withTag('my-image:latest');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--tag')).toEqual(['my-image:latest']);
    });

    it('should append multiple tags', () => {
      builder.withTag('image1:v1');
      builder.withTag('image2:v2');
      expect(builder['metadata'].get('--tag')).toEqual(['image1:v1', 'image2:v2']);
    });
  });

  describe('withTags', () => {
    it('should add multiple tags', () => {
      const tags = ['image1:v1', 'image2:v2', 'image3:v3'];
      const result = builder.withTags(tags);
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--tag')).toEqual(tags);
    });

    it('should handle empty tags array', () => {
      const result = builder.withTags([]);
      expect(result).toBe(builder);
      expect(builder['metadata'].has('--tag')).toBe(false);
    });

    it('should append to existing tags', () => {
      builder.withTag('existing:tag');
      builder.withTags(['new1:tag', 'new2:tag']);
      expect(builder['metadata'].get('--tag')).toEqual(['existing:tag', 'new1:tag', 'new2:tag']);
    });
  });

  describe('withFile', () => {
    it('should add file metadata', () => {
      const result = builder.withFile('/path/to/file');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--file')).toEqual(['/path/to/file']);
    });

    it('should handle multiple files', () => {
      builder.withFile('/path/to/file1');
      builder.withFile('/path/to/file2');
      expect(builder['metadata'].get('--file')).toEqual(['/path/to/file1', '/path/to/file2']);
    });
  });

  describe('withOutput', () => {
    it('should add output metadata', () => {
      const result = builder.withOutput('type=registry');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--output')).toEqual(['type=registry']);
    });

    it('should handle multiple outputs', () => {
      builder.withOutput('type=registry');
      builder.withOutput('type=local,dest=./output');
      expect(builder['metadata'].get('--output')).toEqual([
        'type=registry',
        'type=local,dest=./output',
      ]);
    });
  });

  describe('withPlatform', () => {
    it('should add platform metadata', () => {
      const result = builder.withPlatform('linux/amd64');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--platform')).toEqual(['linux/amd64']);
    });

    it('should handle multiple platforms individually', () => {
      builder.withPlatform('linux/amd64');
      builder.withPlatform('linux/arm64');
      expect(builder['metadata'].get('--platform')).toEqual(['linux/amd64', 'linux/arm64']);
    });
  });

  describe('withPlatforms', () => {
    it('should add multiple platforms', () => {
      const platforms = ['linux/amd64', 'linux/arm64', 'windows/amd64'];
      const result = builder.withPlatforms(platforms);
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--platform')).toEqual(platforms);
    });

    it('should handle empty platforms array', () => {
      const result = builder.withPlatforms([]);
      expect(result).toBe(builder);
      expect(builder['metadata'].has('--platform')).toBe(false);
    });

    it('should append to existing platforms', () => {
      builder.withPlatform('linux/amd64');
      builder.withPlatforms(['linux/arm64', 'windows/amd64']);
      expect(builder['metadata'].get('--platform')).toEqual([
        'linux/amd64',
        'linux/arm64',
        'windows/amd64',
      ]);
    });
  });

  describe('withAnnotation', () => {
    it('should add annotation metadata in key=value format', () => {
      const result = builder.withAnnotation(
        'org.opencontainers.image.source',
        'https://github.com/example/repo',
      );
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--annotation')).toEqual([
        'org.opencontainers.image.source=https://github.com/example/repo',
      ]);
    });

    it('should handle multiple annotations', () => {
      builder.withAnnotation('key1', 'value1');
      builder.withAnnotation('key2', 'value2');
      expect(builder['metadata'].get('--annotation')).toEqual(['key1=value1', 'key2=value2']);
    });

    it('should handle special characters in annotations', () => {
      builder.withAnnotation('special/key', 'value=with=equals');
      expect(builder['metadata'].get('--annotation')).toEqual(['special/key=value=with=equals']);
    });
  });

  describe('withAnnotations', () => {
    it('should add multiple annotations from object', () => {
      const annotations = {
        'org.opencontainers.image.source': 'https://github.com/example/repo',
        'org.opencontainers.image.version': '1.0.0',
        'custom.annotation': 'custom-value',
      };

      const result = builder.withAnnotations(annotations);
      expect(result).toBe(builder);

      const annotationValues = builder['metadata'].get('--annotation');
      expect(annotationValues).toContain(
        'org.opencontainers.image.source=https://github.com/example/repo',
      );
      expect(annotationValues).toContain('org.opencontainers.image.version=1.0.0');
      expect(annotationValues).toContain('custom.annotation=custom-value');
    });

    it('should handle empty annotations object', () => {
      const result = builder.withAnnotations({});
      expect(result).toBe(builder);
      expect(builder['metadata'].has('--annotation')).toBe(false);
    });

    it('should append to existing annotations', () => {
      builder.withAnnotation('existing', 'value');
      builder.withAnnotations({ new: 'annotation' });
      expect(builder['metadata'].get('--annotation')).toEqual(['existing=value', 'new=annotation']);
    });
  });

  describe('withSource', () => {
    it('should add source as unkeyed metadata', () => {
      const result = builder.withSource('source-image:latest');
      expect(result).toBe(builder);
      expect(builder['metadata'].get('')).toEqual(['source-image:latest']);
    });

    it('should handle multiple sources individually', () => {
      builder.withSource('source1:latest');
      builder.withSource('source2:latest');
      expect(builder['metadata'].get('')).toEqual(['source1:latest', 'source2:latest']);
    });
  });

  describe('withSources', () => {
    it('should add multiple sources', () => {
      const sources = ['source1:latest', 'source2:latest', 'source3:latest'];
      const result = builder.withSources(sources);
      expect(result).toBe(builder);
      expect(builder['metadata'].get('')).toEqual(sources);
    });

    it('should handle empty sources array', () => {
      const result = builder.withSources([]);
      expect(result).toBe(builder);
      expect(builder['metadata'].has('')).toBe(false);
    });

    it('should append to existing sources', () => {
      builder.withSource('existing:source');
      builder.withSources(['new1:source', 'new2:source']);
      expect(builder['metadata'].get('')).toEqual([
        'existing:source',
        'new1:source',
        'new2:source',
      ]);
    });
  });

  describe('withDryRun', () => {
    it('should add dry-run flag with empty value', () => {
      const result = builder.withDryRun();
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--dry-run')).toEqual(['']);
    });

    it('should allow multiple dry-run calls', () => {
      builder.withDryRun();
      builder.withDryRun();
      expect(builder['metadata'].get('--dry-run')).toEqual(['', '']);
    });
  });

  describe('withVerbose', () => {
    it('should add verbose flag with empty value', () => {
      const result = builder.withVerbose();
      expect(result).toBe(builder);
      expect(builder['metadata'].get('--verbose')).toEqual(['']);
    });

    it('should allow multiple verbose calls', () => {
      builder.withVerbose();
      builder.withVerbose();
      expect(builder['metadata'].get('--verbose')).toEqual(['', '']);
    });
  });

  describe('reset', () => {
    it('should reset all services state and return self', () => {
      builder.withCommand('test-command');
      builder.withStringListOutput(true);
      builder.withTag('image:latest');
      builder.withPlatform('linux/amd64');

      const result = builder.reset();
      expect(result).toBe(builder);
      expect(builder['command']).toBe('');
      expect(builder['useStringList']).toBe(false);
      expect(builder['metadata'].size).toBe(0);
    });

    it('should work on already empty services', () => {
      const result = builder.reset();
      expect(result).toBe(builder);
      expect(builder['command']).toBe('');
      expect(builder['useStringList']).toBe(false);
      expect(builder['metadata'].size).toBe(0);
    });

    it('should allow services reuse after reset', () => {
      builder.withCommand('first');
      builder.withTag('first:tag');
      builder.reset();
      builder.withCommand('second');
      builder.withTag('second:tag');

      expect(builder['command']).toBe('second');
      expect(builder['metadata'].get('--tag')).toEqual(['second:tag']);
    });
  });

  describe('build', () => {
    it('should create DockerBuildXImageToolsService instance with command', () => {
      builder.withCommand('test-command');
      const result = builder.build();

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('test-command', false);
      expect(result).toBe(mockDockerBuildXImageTools);
    });

    it('should create instance with string list output enabled', () => {
      builder.withCommand('test-command').withStringListOutput(true);
      builder.build();

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('test-command', true);
    });

    it('should transfer all metadata to instance', () => {
      builder.withCommand('test-command');
      builder.withTag('image:latest');
      builder.withPlatform('linux/amd64');
      builder.withSource('source:image');

      builder.build();

      expect(mockDockerBuildXImageTools.setMetaData).toHaveBeenCalledWith('--tag', [
        'image:latest',
      ]);
      expect(mockDockerBuildXImageTools.setMetaData).toHaveBeenCalledWith('--platform', [
        'linux/amd64',
      ]);
      expect(mockDockerBuildXImageTools.setMetaData).toHaveBeenCalledWith('', ['source:image']);
      expect(mockDockerBuildXImageTools.setMetaData).toHaveBeenCalledTimes(3);
    });

    it('should throw error when command is not set', () => {
      expect(() => builder.build()).toThrow('Command is required. Use withCommand() to set it.');
    });

    it('should throw error when command is empty string', () => {
      builder['command'] = '';
      expect(() => builder.build()).toThrow('Command is required. Use withCommand() to set it.');
    });

    it('should work with empty metadata', () => {
      builder.withCommand('test-command');
      const result = builder.build();

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('test-command', false);
      expect(mockDockerBuildXImageTools.setMetaData).not.toHaveBeenCalled();
      expect(result).toBe(mockDockerBuildXImageTools);
    });

    it('should return IDockerBuildXImageTools interface', () => {
      builder.withCommand('test-command');
      const result = builder.build();

      // Verify the result implements the interface
      expect(typeof result.command).toBe('string');
      expect(typeof result.executor).toBe('string');
      expect(Array.isArray(result.subCommands)).toBe(true);
      expect(result.metaData).toBeInstanceOf(Map);
      expect(typeof result.useStringList).toBe('boolean');
      expect(typeof result.setMetaData).toBe('function');
      expect(typeof result.addMetaData).toBe('function');
      expect(typeof result.getMetaData).toBe('function');
      expect(typeof result.getFirstMetaData).toBe('function');
      expect(typeof result.removeMetaData).toBe('function');
      expect(typeof result.clearMetaData).toBe('function');
      expect(typeof result.toCommandArgs).toBe('function');
      expect(typeof result.buildCommand).toBe('function');
      expect(typeof result.toString).toBe('function');
      expect(typeof result.toStringMultiLineCommand).toBe('function');
    });
  });

  describe('Private methods', () => {
    describe('validateInput', () => {
      it('should be called by addMetaData and setMetaData', () => {
        // This is tested indirectly through the public methods
        expect(() => builder.addMetaData(null as any, 'value')).toThrow();
        expect(() => builder.setMetaData('key', null as any)).toThrow();
      });
    });

    describe('isNullOrUndefined', () => {
      it('should detect null and undefined values through validation', () => {
        // Tested through validation in addMetaData and setMetaData
        
        // null key should throw (explicit null)
        expect(() => builder.addMetaData(null as any, 'value')).toThrow('Metadata key cannot be null or undefined');
        
        // undefined key should NOT throw (uses default parameter value '')
        expect(() => builder.addMetaData(undefined as any, 'value')).not.toThrow();
        
        // null/undefined values should throw
        expect(() => builder.addMetaData('key', null as any)).toThrow('Metadata value cannot be null or undefined');
        expect(() => builder.addMetaData('key', undefined as any)).toThrow('Metadata value cannot be null or undefined');
      });
    });
  });

  describe('Method chaining', () => {
    it('should support complex chaining operations', () => {
      const result = builder
        .withCommand('create')
        .withStringListOutput(true)
        .withTag('my-image:latest')
        .withPlatforms(['linux/amd64', 'linux/arm64'])
        .withSource('source:image')
        .withAnnotation('version', '1.0.0')
        .withDryRun()
        .withVerbose();

      expect(result).toBe(builder);
      expect(builder['command']).toBe('create');
      expect(builder['useStringList']).toBe(true);
      expect(builder['metadata'].get('--tag')).toEqual(['my-image:latest']);
      expect(builder['metadata'].get('--platform')).toEqual(['linux/amd64', 'linux/arm64']);
      expect(builder['metadata'].get('')).toEqual(['source:image']);
      expect(builder['metadata'].get('--annotation')).toEqual(['version=1.0.0']);
      expect(builder['metadata'].get('--dry-run')).toEqual(['']);
      expect(builder['metadata'].get('--verbose')).toEqual(['']);
    });

    it('should maintain fluent interface with all methods', () => {
      const methods = [
        () => builder.withCommand('test'),
        () => builder.withStringListOutput(true),
        () => builder.addMetaData('key', 'value'),
        () => builder.setMetaData('key2', 'value2'),
        () => builder.withMetaData({ key3: 'value3' }),
        () => builder.withTag('tag'),
        () => builder.withTags(['tag1', 'tag2']),
        () => builder.withFile('file'),
        () => builder.withOutput('output'),
        () => builder.withPlatform('platform'),
        () => builder.withPlatforms(['platform1', 'platform2']),
        () => builder.withAnnotation('key', 'value'),
        () => builder.withAnnotations({ key: 'value' }),
        () => builder.withSource('source'),
        () => builder.withSources(['source1', 'source2']),
        () => builder.withDryRun(),
        () => builder.withVerbose(),
        () => builder.reset(),
      ];

      methods.forEach(method => {
        const result = method();
        expect(result).toBe(builder);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in metadata', () => {
      builder.withTag('image:latest@sha256:abc123');
      builder.withAnnotation('special/chars', 'value=with=equals');

      expect(builder['metadata'].get('--tag')).toEqual(['image:latest@sha256:abc123']);
      expect(builder['metadata'].get('--annotation')).toEqual(['special/chars=value=with=equals']);
    });

    it('should handle empty string values', () => {
      builder.addMetaData('--empty', '');
      expect(builder['metadata'].get('--empty')).toEqual(['']);
    });

    it('should handle whitespace values', () => {
      builder.addMetaData('--whitespace', '   ');
      expect(builder['metadata'].get('--whitespace')).toEqual(['   ']);
    });

    it('should handle unicode characters', () => {
      builder.withTag('image:测试');
      builder.withAnnotation('emoji', '🐳');

      expect(builder['metadata'].get('--tag')).toEqual(['image:测试']);
      expect(builder['metadata'].get('--annotation')).toEqual(['emoji=🐳']);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      builder.withTag(longString);
      expect(builder['metadata'].get('--tag')).toEqual([longString]);
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should demonstrate complete workflow with services pattern', () => {
    const builder = DockerBuildXImageToolsBuilder.forCreate()
      .withStringListOutput(true)
      .withTag('my-registry/my-image:latest')
      .withPlatforms(['linux/amd64', 'linux/arm64'])
      .withSources(['my-registry/my-image:linux-amd64', 'my-registry/my-image:linux-arm64'])
      .withAnnotations({
        'org.opencontainers.image.source': 'https://github.com/example/repo',
        'org.opencontainers.image.version': '1.0.0',
      })
      .withDryRun();

    const result = builder.build();

    expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('create', true);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('setMetaData');
  });

  it('should demonstrate factory convenience methods', () => {
    // Create manifest
    const manifest = DockerBuildXImageToolsFactory.createManifest('my-image:multi-platform', [
      'my-image:amd64',
      'my-image:arm64',
    ]);

    // Inspect image
    const inspect = DockerBuildXImageToolsFactory.inspectImage('my-image:latest');

    // Prune cache
    const prune = DockerBuildXImageToolsFactory.pruneCache();

    expect(DockerBuildXImageToolsService).toHaveBeenCalledTimes(3);
    expect(manifest).toBeDefined();
    expect(inspect).toBeDefined();
    expect(prune).toBeDefined();
  });

  it('should handle services reset and reuse', () => {
    const builder = DockerBuildXImageToolsBuilder.create()
      .withCommand('create')
      .withTag('image1:latest')
      .withSource('source1');

    const first = builder.build();
    expect(first).toBeDefined();

    builder.reset().withCommand('inspect').withSource('different-image');

    const second = builder.build();
    expect(second).toBeDefined();

    expect(DockerBuildXImageToolsService).toHaveBeenCalledTimes(2);
    expect(DockerBuildXImageToolsService).toHaveBeenNthCalledWith(1, 'create', false);
    expect(DockerBuildXImageToolsService).toHaveBeenNthCalledWith(2, 'inspect', false);
  });

  it('should demonstrate comprehensive services usage', () => {
    const complexBuilder = DockerBuildXImageToolsBuilder.create()
      .withCommand('create')
      .withStringListOutput(false)
      .withTag('registry.example.com/app:v1.0.0')
      .withTags(['registry.example.com/app:latest', 'registry.example.com/app:stable'])
      .withPlatforms(['linux/amd64', 'linux/arm64', 'windows/amd64'])
      .withSources([
        'registry.example.com/app:linux-amd64',
        'registry.example.com/app:linux-arm64',
        'registry.example.com/app:windows-amd64',
      ])
      .withAnnotations({
        'org.opencontainers.image.title': 'My Application',
        'org.opencontainers.image.description': 'A sample application',
        'org.opencontainers.image.version': '1.0.0',
        'org.opencontainers.image.source': 'https://github.com/example/app',
      })
      .withFile('./manifest.yaml')
      .withOutput('type=registry,push=true')
      .withDryRun()
      .withVerbose();

    const result = complexBuilder.build();

    expect(result).toBeDefined();
    expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('create', false);
  });

  it('should handle error scenarios gracefully', () => {
    const builder = DockerBuildXImageToolsBuilder.create();

    // Should throw when building without command
    expect(() => builder.build()).toThrow('Command is required');

    // Should throw when setting invalid command
    expect(() => builder.withCommand('')).toThrow('Command cannot be empty or null');

    // Should throw when adding invalid metadata
    expect(() => builder.addMetaData(null as any, 'value')).toThrow(
      'Metadata key cannot be null or undefined',
    );
  });

  it('should maintain immutability of services state during build', () => {
    const builder = DockerBuildXImageToolsBuilder.forCreate()
      .withTag('original:tag')
      .withSource('original:source');

    const instance1 = builder.build();

    // Modify services after build
    builder.withTag('modified:tag');
    const instance2 = builder.build();

    // Both instances should be created but first shouldn't be affected by changes
    expect(DockerBuildXImageToolsService).toHaveBeenCalledTimes(2);
    expect(instance1).toMatchObject(instance2);
  });
});
