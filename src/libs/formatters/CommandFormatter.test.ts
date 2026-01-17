import { CommandFormatter } from './CommandFormatter';
import { IDockerBuildXImageToolsProvider } from '../../actions/docker/buildx/images';
import { IStringListProvider } from '../providers';

// Mock implementations for testing
class MockDockerProvider implements IDockerBuildXImageToolsProvider {
  command: string;
  executor: string;
  subCommands: string[];
  metaData: Map<string, string[]>;

  constructor(
    command: string = 'inspect',
    executor: string = 'docker',
    subCommands: string[] = ['buildx', 'imagetools'],
    metaData: Map<string, string[]> = new Map(),
  ) {
    this.command = command;
    this.executor = executor;
    this.subCommands = subCommands;
    this.metaData = metaData;
  }
}

class MockStringListProvider implements IStringListProvider {
  constructor(public readonly useStringList: boolean = false) {}
}

describe('CommandFormatter', () => {
  let mockDockerProvider: MockDockerProvider;
  let mockStringListProvider: MockStringListProvider;
  let formatter: CommandFormatter;

  beforeEach(() => {
    mockDockerProvider = new MockDockerProvider();
    mockStringListProvider = new MockStringListProvider();
    formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);
  });

  describe('Constructor', () => {
    it('should initialize with provided providers', () => {
      expect(formatter.dockerProvider).toBe(mockDockerProvider);
      expect(formatter.stringListProvider).toBe(mockStringListProvider);
    });

    it('should implement ICommandFormatter interface', () => {
      expect(typeof formatter.toStringMultiLineCommand).toBe('function');
    });

    it('should implement ICommandFormatterProvider interface', () => {
      expect(formatter).toHaveProperty('dockerProvider');
      expect(formatter).toHaveProperty('stringListProvider');
    });
  });

  describe('toStringMultiLineCommand', () => {
    describe('with useStringList = false (multi-line mode)', () => {
      beforeEach(() => {
        mockStringListProvider = new MockStringListProvider(false);
        formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);
      });

      it('should return multi-line command with newlines', () => {
        const result = formatter.toStringMultiLineCommand();
        expect(result).toContain('\n');
        expect(result).toContain('docker\\');
        expect(result).toContain('  buildx\\');
        expect(result).toContain('  imagetools\\');
        expect(result).toContain('  inspect\\');
      });

      it('should join lines with newlines', () => {
        const result = formatter.toStringMultiLineCommand();
        const lines = result.split('\n');
        expect(lines.length).toBeGreaterThan(1);
      });
    });

    describe('with useStringList = true (single-line mode)', () => {
      beforeEach(() => {
        mockStringListProvider = new MockStringListProvider(true);
        formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);
      });

      it('should return single-line command with spaces', () => {
        const result = formatter.toStringMultiLineCommand();
        expect(result).not.toContain('\n');
        expect(result).not.toContain('\\');
        expect(result).toContain('docker buildx imagetools inspect');
      });

      it('should join lines with spaces', () => {
        const result = formatter.toStringMultiLineCommand();
        expect(result.split(' ').length).toBeGreaterThan(1);
      });
    });
  });

  describe('buildAllLines', () => {
    it('should return array with all command components', () => {
      const lines = formatter.buildAllLines();
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should include executor, subcommands, main command, and metadata', () => {
      mockDockerProvider.metaData.set('--tag', ['my-image:latest']);
      const lines = formatter.buildAllLines();

      // Should have at least: executor + 2 subcommands + main command + 1 metadata
      expect(lines.length).toBeGreaterThanOrEqual(5);
    });

    it('should maintain correct order of components', () => {
      const lines = formatter.buildAllLines();
      expect(lines[0]).toContain('docker'); // executor first
      expect(lines[1]).toContain('buildx'); // first subcommand
      expect(lines[2]).toContain('imagetools'); // second subcommand
      expect(lines[3]).toContain('inspect'); // main command
    });

    it('should handle empty metadata', () => {
      const lines = formatter.buildAllLines();
      expect(lines.length).toBe(4); // executor + 2 subcommands + main command
    });

    it('should include metadata lines when present', () => {
      mockDockerProvider.metaData.set('--tag', ['image:latest']);
      const lines = formatter.buildAllLines();
      expect(lines.length).toBe(5); // 4 base + 1 metadata
    });
  });

  describe('buildExecutorLine', () => {
    it('should return executor with backslash when useStringList is false', () => {
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildExecutorLine();
      expect(result).toBe('docker\\');
    });

    it('should return executor without backslash when useStringList is true', () => {
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildExecutorLine();
      expect(result).toBe('docker');
    });

    it('should handle different executor names', () => {
      mockDockerProvider.executor = 'podman';
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildExecutorLine();
      expect(result).toBe('podman\\');
    });
  });

  describe('buildSubCommandLines', () => {
    it('should return array of subcommands with backslashes when useStringList is false', () => {
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildSubCommandLines();
      expect(result).toEqual(['  buildx\\', '  imagetools\\']);
    });

    it('should return array of subcommands without backslashes when useStringList is true', () => {
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildSubCommandLines();
      expect(result).toEqual(['buildx', 'imagetools']);
    });

    it('should handle empty subcommands array', () => {
      mockDockerProvider.subCommands = [];
      const result = formatter.buildSubCommandLines();
      expect(result).toEqual([]);
    });

    it('should handle single subcommand', () => {
      mockDockerProvider.subCommands = ['build'];
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildSubCommandLines();
      expect(result).toEqual(['  build\\']);
    });

    it('should handle multiple subcommands', () => {
      mockDockerProvider.subCommands = ['buildx', 'imagetools', 'create'];
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildSubCommandLines();
      expect(result).toEqual(['buildx', 'imagetools', 'create']);
    });
  });

  describe('buildMainCommandLine', () => {
    it('should return command with backslash when useStringList is false', () => {
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMainCommandLine();
      expect(result).toBe('  inspect\\');
    });

    it('should return command without backslash when useStringList is true', () => {
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMainCommandLine();
      expect(result).toBe('inspect');
    });

    it('should handle different command names', () => {
      mockDockerProvider.command = 'push';
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMainCommandLine();
      expect(result).toBe('  push\\');
    });
  });

  describe('buildMetaDataLines', () => {
    it('should return empty array when no metadata', () => {
      const result = formatter.buildMetaDataLines();
      expect(result).toEqual([]);
    });

    it('should handle keyed metadata', () => {
      mockDockerProvider.metaData.set('--tag', ['image:latest']);
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMetaDataLines();
      expect(result).toEqual(['  --tag image:latest\\']);
    });

    it('should handle unkeyed metadata (empty key)', () => {
      mockDockerProvider.metaData.set('', ['some-value']);
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMetaDataLines();
      expect(result).toEqual(['  some-value\\']);
    });

    it('should handle mixed keyed and unkeyed metadata', () => {
      mockDockerProvider.metaData.set('--tag', ['image:latest']);
      mockDockerProvider.metaData.set('', ['positional-arg']);
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMetaDataLines();
      expect(result).toContain('  --tag image:latest\\');
      expect(result).toContain('  positional-arg\\');
    });

    it('should handle multiple metadata entries', () => {
      mockDockerProvider.metaData.set('--tag', ['image1:latest', 'image2:latest']);
      mockDockerProvider.metaData.set('--platform', ['linux/amd64']);
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildMetaDataLines();
      expect(result.length).toBe(3); // 2 tags + 1 platform
    });

    it('should maintain insertion order of metadata', () => {
      mockDockerProvider.metaData.set('--first', ['value1']);
      mockDockerProvider.metaData.set('--second', ['value2']);
      mockDockerProvider.metaData.set('--third', ['value3']);

      const result = formatter.buildMetaDataLines();
      expect(result[0]).toContain('--first');
      expect(result[1]).toContain('--second');
      expect(result[2]).toContain('--third');
    });
  });

  describe('buildUnkeyedMetaData', () => {
    it('should return values with backslashes when useStringList is false', () => {
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildUnkeyedMetaData(['value1', 'value2']);
      expect(result).toEqual(['  value1\\', '  value2\\']);
    });

    it('should return values without backslashes when useStringList is true', () => {
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildUnkeyedMetaData(['value1', 'value2']);
      expect(result).toEqual(['value1', 'value2']);
    });

    it('should handle empty values array', () => {
      const result = formatter.buildUnkeyedMetaData([]);
      expect(result).toEqual([]);
    });

    it('should handle single value', () => {
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildUnkeyedMetaData(['single-value']);
      expect(result).toEqual(['  single-value\\']);
    });

    it('should handle values with spaces', () => {
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildUnkeyedMetaData(['value with spaces']);
      expect(result).toEqual(['value with spaces']);
    });
  });

  describe('buildKeyedMetaData', () => {
    describe('with useStringList = false (multi-line mode)', () => {
      beforeEach(() => {
        mockStringListProvider = new MockStringListProvider(false);
        formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);
      });

      it('should return key-value pairs with backslashes', () => {
        const result = formatter.buildKeyedMetaData('--tag', ['image:latest']);
        expect(result).toEqual(['  --tag image:latest\\']);
      });

      it('should handle multiple values for same key', () => {
        const result = formatter.buildKeyedMetaData('--tag', ['image1:latest', 'image2:latest']);
        expect(result).toEqual(['  --tag image1:latest\\', '  --tag image2:latest\\']);
      });

      it('should handle empty values array', () => {
        const result = formatter.buildKeyedMetaData('--tag', []);
        expect(result).toEqual([]);
      });

      it('should handle keys with special characters', () => {
        const result = formatter.buildKeyedMetaData('--build-arg', ['ENV=production']);
        expect(result).toEqual(['  --build-arg ENV=production\\']);
      });
    });

    describe('with useStringList = true (single-line mode)', () => {
      beforeEach(() => {
        mockStringListProvider = new MockStringListProvider(true);
        formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);
      });

      it('should return single key=values string', () => {
        const result = formatter.buildKeyedMetaData('--tag', ['image:latest']);
        expect(result).toEqual(['--tag=image:latest']);
      });

      it('should join multiple values with commas', () => {
        const result = formatter.buildKeyedMetaData('--tag', ['image1:latest', 'image2:latest']);
        expect(result).toEqual(['--tag=image1:latest,image2:latest']);
      });

      it('should handle empty values array', () => {
        const result = formatter.buildKeyedMetaData('--tag', []);
        expect(result).toEqual(['--tag=']);
      });

      it('should handle single value', () => {
        const result = formatter.buildKeyedMetaData('--platform', ['linux/amd64']);
        expect(result).toEqual(['--platform=linux/amd64']);
      });

      it('should handle values with commas', () => {
        const result = formatter.buildKeyedMetaData('--label', ['version=1.0', 'env=prod,test']);
        expect(result).toEqual(['--label=version=1.0,env=prod,test']);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex metadata with both keyed and unkeyed values', () => {
      mockDockerProvider.metaData.set('--tag', ['image1:latest', 'image2:latest']);
      mockDockerProvider.metaData.set('--platform', ['linux/amd64']);
      mockDockerProvider.metaData.set('', ['positional-arg1', 'positional-arg2']);
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('docker\\');
      expect(result).toContain('  buildx\\');
      expect(result).toContain('  imagetools\\');
      expect(result).toContain('  inspect\\');
      expect(result).toContain('  --tag image1:latest\\');
      expect(result).toContain('  --tag image2:latest\\');
      expect(result).toContain('  --platform linux/amd64\\');
      expect(result).toContain('  positional-arg1\\');
      expect(result).toContain('  positional-arg2\\');
    });

    it('should produce valid single-line command with complex metadata', () => {
      mockDockerProvider.metaData.set('--tag', ['image1:latest', 'image2:latest']);
      mockDockerProvider.metaData.set('--platform', ['linux/amd64']);
      mockDockerProvider.metaData.set('', ['positional-arg']);
      mockStringListProvider = new MockStringListProvider(true);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.toStringMultiLineCommand();
      expect(result).toBe(
        'docker buildx imagetools inspect --tag=image1:latest,image2:latest --platform=linux/amd64 positional-arg',
      );
    });

    it('should handle empty providers gracefully', () => {
      const emptyDockerProvider = new MockDockerProvider('', '', [], new Map());
      formatter = new CommandFormatter(emptyDockerProvider, mockStringListProvider);

      const result = formatter.toStringMultiLineCommand();
      expect(result).toBe('\\\n  \\');
    });

    it('should maintain consistency between modes', () => {
      mockDockerProvider.metaData.set('--tag', ['image:latest']);

      // Test multi-line mode
      const multiLineFormatter = new CommandFormatter(
        mockDockerProvider,
        new MockStringListProvider(false),
      );
      const multiLineResult = multiLineFormatter.buildAllLines();

      // Test single-line mode
      const singleLineFormatter = new CommandFormatter(
        mockDockerProvider,
        new MockStringListProvider(true),
      );
      const singleLineResult = singleLineFormatter.buildAllLines();

      // Both should have the same number of logical components
      expect(multiLineResult.length).toBe(singleLineResult.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle metadata with empty string values', () => {
      mockDockerProvider.metaData.set('--tag', ['']);
      const result = formatter.buildMetaDataLines();
      expect(result.length).toBe(1);
    });

    it('should handle metadata keys with spaces', () => {
      mockDockerProvider.metaData.set('--build arg', ['value']);
      mockStringListProvider = new MockStringListProvider(false);
      formatter = new CommandFormatter(mockDockerProvider, mockStringListProvider);

      const result = formatter.buildKeyedMetaData('--build arg', ['value']);
      expect(result).toEqual(['  --build arg value\\']);
    });

    it('should handle very long command structures', () => {
      const longSubCommands = Array.from({ length: 10 }, (_, i) => `subcmd${i}`);
      mockDockerProvider.subCommands = longSubCommands;

      for (let i = 0; i < 5; i++) {
        mockDockerProvider.metaData.set(`--option${i}`, [`value${i}`]);
      }

      const result = formatter.buildAllLines();
      expect(result.length).toBe(1 + 10 + 1 + 5); // executor + subcommands + main + metadata
    });

    it('should handle special characters in all components', () => {
      mockDockerProvider.executor = 'my-docker';
      mockDockerProvider.command = 'build-image';
      mockDockerProvider.subCommands = ['build-x', 'image-tools'];
      mockDockerProvider.metaData.set('--build-arg', ['KEY=VALUE']);

      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('my-docker');
      expect(result).toContain('build-x');
      expect(result).toContain('image-tools');
      expect(result).toContain('build-image');
      expect(result).toContain('--build-arg KEY=VALUE');
    });
  });

  describe('Interface Compliance', () => {
    it('should implement all ICommandFormatter methods', () => {
      expect(typeof formatter.toStringMultiLineCommand).toBe('function');
    });

    it('should implement all ICommandFormatterProvider properties', () => {
      expect(formatter).toHaveProperty('dockerProvider');
      expect(formatter).toHaveProperty('stringListProvider');
      expect(formatter.dockerProvider).toBe(mockDockerProvider);
      expect(formatter.stringListProvider).toBe(mockStringListProvider);
    });

    it('should work with different provider implementations', () => {
      const alternativeDockerProvider = new MockDockerProvider('test', 'podman', ['build']);
      const alternativeStringProvider = new MockStringListProvider(true);

      const alternativeFormatter = new CommandFormatter(
        alternativeDockerProvider,
        alternativeStringProvider,
      );

      expect(alternativeFormatter.dockerProvider).toBe(alternativeDockerProvider);
      expect(alternativeFormatter.stringListProvider).toBe(alternativeStringProvider);

      const result = alternativeFormatter.toStringMultiLineCommand();
      expect(result).toContain('podman');
      expect(result).toContain('build');
      expect(result).toContain('test');
    });
  });
});
