import { DockerBuildXImageToolsBuilder } from './DockerBuildXImageToolsBuilder';
import { DockerBuildXImageToolsFactory } from './DockerBuildXImageToolsBuilderFactory';
import { DockerBuildXImageToolsService } from './services';
// import { DockerBuildXImageToolsServiceMock as DockerBuildXImageToolsService } from './__mocks__';

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

describe('DockerImageToolsFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('builder', () => {
    it('should create new services instance without command', () => {
      const builder = DockerBuildXImageToolsFactory.builder();
      expect(builder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
      expect(builder['command']).toBe('');
    });

    it('should create new services instance with command', () => {
      const builder = DockerBuildXImageToolsFactory.builder('test-command');
      expect(builder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
      expect(builder['command']).toBe('test-command');
    });

    it('should return different instances on multiple calls', () => {
      const builder1 = DockerBuildXImageToolsFactory.builder();
      const builder2 = DockerBuildXImageToolsFactory.builder();
      expect(builder1).not.toBe(builder2);
    });

    it('should handle undefined command parameter', () => {
      const builder = DockerBuildXImageToolsFactory.builder(undefined);
      expect(builder).toBeInstanceOf(DockerBuildXImageToolsBuilder);
      expect(builder['command']).toBe('');
    });
  });

  describe('createManifest', () => {
    it('should create configured instance for manifest creation', () => {
      const tag = 'my-image:latest';
      const sources = ['source1:latest', 'source2:latest'];

      const result = DockerBuildXImageToolsFactory.createManifest(tag, sources);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('create', false);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('command');
      expect(result).toHaveProperty('setMetaData');
    });

    it('should handle empty sources array', () => {
      const tag = 'my-image:latest';
      const sources: string[] = [];

      const result = DockerBuildXImageToolsFactory.createManifest(tag, sources);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('create', false);
      expect(result).toBeDefined();
    });

    it('should handle multiple sources', () => {
      const tag = 'my-image:latest';
      const sources = ['source1:latest', 'source2:latest', 'source3:latest'];

      const result = DockerBuildXImageToolsFactory.createManifest(tag, sources);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('create', false);
      expect(result).toBeDefined();
    });

    it('should handle complex tag names', () => {
      const tag = 'registry.example.com/namespace/image:v1.0.0';
      const sources = ['source:latest'];

      const result = DockerBuildXImageToolsFactory.createManifest(tag, sources);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('create', false);
      expect(result).toBeDefined();
    });

    it('should return IDockerBuildXImageTools interface', () => {
      const tag = 'image:latest';
      const sources = ['source:latest'];

      const result = DockerBuildXImageToolsFactory.createManifest(tag, sources);

      expect(typeof result.setMetaData).toBe('function');
    });
  });

  describe('inspectImage', () => {
    it('should create configured instance for image inspection', () => {
      const image = 'image-to-inspect:latest';

      const result = DockerBuildXImageToolsFactory.inspectImage(image);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('inspect', false);
      expect(result).toBeDefined();
    });

    it('should handle image names with special characters', () => {
      const image = 'registry.example.com/namespace/image:tag@sha256:abc123';

      const result = DockerBuildXImageToolsFactory.inspectImage(image);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('inspect', false);
      expect(result).toBeDefined();
    });

    it('should handle simple image names', () => {
      const image = 'nginx';

      const result = DockerBuildXImageToolsFactory.inspectImage(image);

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('inspect', false);
      expect(result).toBeDefined();
    });

    it('should return IDockerBuildXImageTools interface', () => {
      const image = 'image:latest';

      const result = DockerBuildXImageToolsFactory.inspectImage(image);

      expect(typeof result.setMetaData).toBe('function');
      expect(typeof result.command).toBe('string');
    });
  });

  describe('pruneCache', () => {
    it('should create configured instance for cache pruning', () => {
      const result = DockerBuildXImageToolsFactory.pruneCache();

      expect(DockerBuildXImageToolsService).toHaveBeenCalledWith('prune', false);
      expect(result).toBeDefined();
    });

    it('should not require any parameters', () => {
      expect(() => DockerBuildXImageToolsFactory.pruneCache()).not.toThrow();
    });

    it('should return IDockerBuildXImageTools interface', () => {
      const result = DockerBuildXImageToolsFactory.pruneCache();

      expect(typeof result.setMetaData).toBe('function');
      expect(typeof result.command).toBe('string');
    });
  });

  describe('Factory integration', () => {
    it('should create different instances for different factory methods', () => {
      const manifest = DockerBuildXImageToolsFactory.createManifest('tag', ['source']);
      const inspect = DockerBuildXImageToolsFactory.inspectImage('image');
      const prune = DockerBuildXImageToolsFactory.pruneCache();

      // Use the variables to verify they're different instances
      expect(manifest).toBeDefined();
      expect(inspect).toBeDefined();
      expect(prune).toBeDefined();

      // Each should create new instances
      expect(DockerBuildXImageToolsService).toHaveBeenCalledTimes(3);
      expect(DockerBuildXImageToolsService).toHaveBeenNthCalledWith(1, 'create', false);
      expect(DockerBuildXImageToolsService).toHaveBeenNthCalledWith(2, 'inspect', false);
      expect(DockerBuildXImageToolsService).toHaveBeenNthCalledWith(3, 'prune', false);
    });

    it('should work independently from services instances', () => {
      const builderInstance = DockerBuildXImageToolsFactory.builder('custom');
      const factoryInstance = DockerBuildXImageToolsFactory.createManifest('tag', ['source']);

      expect(builderInstance).toBeInstanceOf(DockerBuildXImageToolsBuilder);
      expect(factoryInstance).not.toBeInstanceOf(DockerBuildXImageToolsBuilder);
      expect(DockerBuildXImageToolsService).toHaveBeenCalledTimes(1); // Only factory method creates instance
    });
  });
});
