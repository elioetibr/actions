import { StringFormatter } from './StringFormatter';
import { MetaDataManager } from './MetaDataManager';

describe('StringFormatter', () => {
  let metaDataManager: MetaDataManager;
  let stringFormatter: StringFormatter;

  beforeEach(() => {
    metaDataManager = new MetaDataManager();
    stringFormatter = new StringFormatter(
      'TestClass',
      'create',
      'docker',
      ['buildx', 'imagetools'],
      false,
      metaDataManager
    );
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(stringFormatter).toBeInstanceOf(StringFormatter);
    });
  });

  describe('toString', () => {
    it('should format basic object without metadata', () => {
      const result = stringFormatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: false
  metaData: Map(0) {}
}`);
    });

    it('should format object with single metadata entry', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      
      const result = stringFormatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: false
  metaData: Map(1) {
    "--tag" => "latest"
  }
}`);
    });

    it('should format object with multiple values for same key', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('--tag', 'v1.0.0');
      
      const result = stringFormatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: false
  metaData: Map(1) {
    "--tag" => ["latest", "v1.0.0"]
  }
}`);
    });

    it('should format object with multiple metadata entries', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('--output', 'docker.io');
      
      const result = stringFormatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: false
  metaData: Map(2) {
    "--tag" => "latest"
    "--output" => "docker.io"
  }
}`);
    });

    it('should handle empty key as "(empty)"', () => {
      metaDataManager.addMetaData('', 'source-image');
      
      const result = stringFormatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: false
  metaData: Map(1) {
    "(empty)" => "source-image"
  }
}`);
    });

    it('should handle useStringList true', () => {
      const formatter = new StringFormatter(
        'TestClass',
        'create',
        'docker',
        ['buildx', 'imagetools'],
        true,
        metaDataManager
      );
      
      const result = formatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: true
  metaData: Map(0) {}
}`);
    });

    it('should escape special characters in strings', () => {
      const formatter = new StringFormatter(
        'TestClass',
        'create "with quotes"',
        'docker\\path',
        ['buildx\\tools', 'imagetools'],
        false,
        metaDataManager
      );
      
      metaDataManager.addMetaData('--tag', 'latest "version"');
      
      const result = formatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create \\"with quotes\\""
  executor: "docker\\\\path"
  subCommands: ["buildx\\\\tools", "imagetools"]
  useStringList: false
  metaData: Map(1) {
    "--tag" => "latest \\"version\\""
  }
}`);
    });

    it('should handle complex metadata scenario', () => {
      metaDataManager.addMetaData('--tag', 'latest');
      metaDataManager.addMetaData('--tag', 'v1.0.0');
      metaDataManager.addMetaData('--annotation', 'key=value');
      metaDataManager.addMetaData('', 'source-image');
      
      const result = stringFormatter.toString();
      
      expect(result).toBe(`TestClass {
  command: "create"
  executor: "docker"
  subCommands: ["buildx", "imagetools"]
  useStringList: false
  metaData: Map(3) {
    "--tag" => ["latest", "v1.0.0"]
    "--annotation" => "key=value"
    "(empty)" => "source-image"
  }
}`);
    });

    it('should handle different class names', () => {
      const formatter = new StringFormatter(
        'CustomDockerService',
        'inspect',
        'podman',
        ['manifest'],
        false,
        metaDataManager
      );
      
      const result = formatter.toString();
      
      expect(result).toBe(`CustomDockerService {
  command: "inspect"
  executor: "podman"
  subCommands: ["manifest"]
  useStringList: false
  metaData: Map(0) {}
}`);
    });

    it('should handle empty subcommands array', () => {
      const formatter = new StringFormatter(
        'SimpleCommand',
        'version',
        'docker',
        [],
        false,
        metaDataManager
      );
      
      const result = formatter.toString();
      
      expect(result).toBe(`SimpleCommand {
  command: "version"
  executor: "docker"
  subCommands: []
  useStringList: false
  metaData: Map(0) {}
}`);
    });

    it('should handle single subcommand', () => {
      const formatter = new StringFormatter(
        'SingleSubCommand',
        'ls',
        'docker',
        ['images'],
        false,
        metaDataManager
      );
      
      const result = formatter.toString();
      
      expect(result).toBe(`SingleSubCommand {
  command: "ls"
  executor: "docker"
  subCommands: ["images"]
  useStringList: false
  metaData: Map(0) {}
}`);
    });
  });

  describe('integration with MetaDataManager', () => {
    it('should reflect changes in metadata manager', () => {
      // Initial state
      expect(stringFormatter.toString()).toContain('metaData: Map(0) {}');
      
      // Add metadata
      metaDataManager.addMetaData('--tag', 'test');
      expect(stringFormatter.toString()).toContain('metaData: Map(1) {');
      expect(stringFormatter.toString()).toContain('"--tag" => "test"');
      
      // Add more metadata
      metaDataManager.addMetaData('--output', 'test2');
      expect(stringFormatter.toString()).toContain('metaData: Map(2) {');
      
      // Clear metadata
      metaDataManager.clearMetaData();
      expect(stringFormatter.toString()).toContain('metaData: Map(0) {}');
    });
  });

  describe('edge cases', () => {
    it('should handle values with newlines', () => {
      metaDataManager.addMetaData('--tag', 'value\\nwith\\nnewlines');
      
      const result = stringFormatter.toString();
      
      expect(result).toContain('"--tag" => "value\\\\nwith\\\\nnewlines"');
    });

    it('should handle values with tabs', () => {
      metaDataManager.addMetaData('--tag', 'value\\twith\\ttabs');
      
      const result = stringFormatter.toString();
      
      expect(result).toContain('"--tag" => "value\\\\twith\\\\ttabs"');
    });

    it('should handle empty string values', () => {
      metaDataManager.addMetaData('--dry-run', '');
      
      const result = stringFormatter.toString();
      
      expect(result).toContain('"--dry-run" => ""');
    });

    it('should handle values with only whitespace', () => {
      metaDataManager.addMetaData('--spaces', '   ');

      const result = stringFormatter.toString();

      expect(result).toContain('"--spaces" => "   "');
    });

    it('should handle single undefined value in metadata via nullish coalescing', () => {
      // Create a mock metadata manager that returns [undefined] to exercise ?? '' branch
      const mockManager = {
        addMetaData: jest.fn().mockReturnThis(),
        setMetaData: jest.fn().mockReturnThis(),
        getMetaData: jest.fn().mockReturnValue([]),
        getFirstMetaData: jest.fn().mockReturnValue(undefined),
        removeMetaData: jest.fn().mockReturnThis(),
        clearMetaData: jest.fn().mockReturnThis(),
        getAllMetaData: jest.fn().mockReturnValue(new Map([['--tag', [undefined as unknown as string]]])),
        getSize: jest.fn().mockReturnValue(1),
        entries: jest.fn().mockReturnValue(new Map([['--tag', [undefined as unknown as string]]]).entries()),
      };

      const formatter = new StringFormatter(
        'TestClass', 'create', 'docker', ['buildx', 'imagetools'], false, mockManager
      );

      const result = formatter.toString();
      expect(result).toContain('"--tag" => ""');
    });
  });
});