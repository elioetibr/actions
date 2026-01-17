import { CommandBuilder } from './CommandBuilder';
import { MetaDataManager } from './MetaDataManager';

describe('CommandBuilder', () => {
  let metaDataManager: MetaDataManager;
  let commandBuilder: CommandBuilder;

  beforeEach(() => {
    metaDataManager = new MetaDataManager();
    commandBuilder = new CommandBuilder(
      'docker',
      ['buildx', 'imagetools'],
      'create',
      metaDataManager
    );
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(commandBuilder).toBeInstanceOf(CommandBuilder);
    });
  });

  describe('toCommandArgs', () => {
    it('should return empty array when no metadata', () => {
      expect(commandBuilder.toCommandArgs()).toEqual([]);
    });

    it('should handle keyed metadata', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('--output', 'docker.io');
      
      const args = commandBuilder.toCommandArgs();
      
      expect(args).toEqual(['--tag', 'latest', '--output', 'docker.io']);
    });

    it('should handle unkeyed metadata (empty key)', () => {
      metaDataManager.addMetaData('', 'source-image-1');
      metaDataManager.addMetaData('', 'source-image-2');
      
      const args = commandBuilder.toCommandArgs();
      
      expect(args).toEqual(['source-image-1', 'source-image-2']);
    });

    it('should handle multiple values for same key', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('--tag', 'v1.0.0');
      
      const args = commandBuilder.toCommandArgs();
      
      expect(args).toEqual(['--tag', 'latest', '--tag', 'v1.0.0']);
    });

    it('should handle mixed keyed and unkeyed metadata', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('', 'source-image');
      metaDataManager.addMetaData('--output', 'docker.io');
      
      const args = commandBuilder.toCommandArgs();
      
      expect(args).toEqual(['--tag', 'latest', 'source-image', '--output', 'docker.io']);
    });

    it('should maintain order of metadata insertion', () => {
      metaDataManager.addMetaData('--first', 'value1');
      metaDataManager.addMetaData('--second', 'value2');
      metaDataManager.addMetaData('--third', 'value3');
      
      const args = commandBuilder.toCommandArgs();
      
      expect(args).toEqual(['--first', 'value1', '--second', 'value2', '--third', 'value3']);
    });
  });

  describe('buildCommand', () => {
    it('should build complete command array with no metadata', () => {
      const command = commandBuilder.buildCommand();
      
      expect(command).toEqual(['docker', 'buildx', 'imagetools', 'create']);
    });

    it('should build complete command array with metadata', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('', 'source-image');
      
      const command = commandBuilder.buildCommand();
      
      expect(command).toEqual([
        'docker', 'buildx', 'imagetools', 'create',
        '--tag', 'latest', 'source-image'
      ]);
    });

    it('should handle complex metadata scenario', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('--tag', 'v1.0.0');
      metaDataManager.addMetaData('--annotation', 'key=value');
      metaDataManager.addMetaData('', 'registry.io/image:amd64');
      metaDataManager.addMetaData('', 'registry.io/image:arm64');
      metaDataManager.addMetaData('--dry-run', '');
      
      const command = commandBuilder.buildCommand();
      
      expect(command).toEqual([
        'docker', 'buildx', 'imagetools', 'create',
        '--tag', 'latest',
        '--tag', 'v1.0.0',
        '--annotation', 'key=value',
        'registry.io/image:amd64',
        'registry.io/image:arm64',
        '--dry-run', ''
      ]);
    });

    it('should work with different executor and subcommands', () => {
      const customBuilder = new CommandBuilder(
        'podman',
        ['manifest'],
        'create',
        metaDataManager
      );
      
      metaDataManager.addMetaData('--add', 'image');
      
      const command = customBuilder.buildCommand();
      
      expect(command).toEqual(['podman', 'manifest', 'create', '--add', 'image']);
    });

    it('should handle empty subcommands array', () => {
      const simpleBuilder = new CommandBuilder(
        'docker',
        [],
        'version',
        metaDataManager
      );
      
      const command = simpleBuilder.buildCommand();
      
      expect(command).toEqual(['docker', 'version']);
    });

    it('should handle single subcommand', () => {
      const singleSubBuilder = new CommandBuilder(
        'docker',
        ['images'],
        'ls',
        metaDataManager
      );
      
      const command = singleSubBuilder.buildCommand();
      
      expect(command).toEqual(['docker', 'images', 'ls']);
    });
  });

  describe('integration with MetaDataManager', () => {
    it('should reflect changes in metadata manager', () => {
      // Initial state
      expect(commandBuilder.toCommandArgs()).toEqual([]);
      
      // Add metadata
      metaDataManager.addMetaData('--tag', 'test');
      expect(commandBuilder.toCommandArgs()).toEqual(['--tag', 'test']);
      
      // Remove metadata
      metaDataManager.removeMetaData('--tag');
      expect(commandBuilder.toCommandArgs()).toEqual([]);
      
      // Clear all metadata
      metaDataManager.addMetaData('--tag', 'test1');
      metaDataManager.addMetaData('--output', 'test2');
      metaDataManager.clearMetaData();
      expect(commandBuilder.toCommandArgs()).toEqual([]);
    });
  });
});