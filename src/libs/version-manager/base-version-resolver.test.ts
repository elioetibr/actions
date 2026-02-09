import type { IVersionFileReader } from './interfaces';
import { BaseVersionResolver, SEMVER_REGEX } from './base-version-resolver';

/**
 * Concrete test subclass that exposes a mock-able fetchLatestVersion.
 */
class TestResolver extends BaseVersionResolver {
  public readonly mockFetchLatest: jest.Mock<Promise<string>>;

  constructor(fileReader: IVersionFileReader, toolName = 'testtool') {
    super(fileReader, toolName);
    this.mockFetchLatest = jest.fn<Promise<string>, []>().mockResolvedValue('9.9.9');
  }

  protected fetchLatestVersion(): Promise<string> {
    return this.mockFetchLatest();
  }
}

function createMockFileReader(): jest.Mocked<IVersionFileReader> {
  return {
    read: jest.fn(),
  };
}

describe('SEMVER_REGEX', () => {
  it('should match x.y.z versions', () => {
    expect(SEMVER_REGEX.test('1.2.3')).toBe(true);
    expect(SEMVER_REGEX.test('0.0.0')).toBe(true);
    expect(SEMVER_REGEX.test('10.20.30')).toBe(true);
  });

  it('should not match prerelease or invalid versions', () => {
    expect(SEMVER_REGEX.test('1.2.3-alpha')).toBe(false);
    expect(SEMVER_REGEX.test('v1.2.3')).toBe(false);
    expect(SEMVER_REGEX.test('1.2')).toBe(false);
    expect(SEMVER_REGEX.test('latest')).toBe(false);
    expect(SEMVER_REGEX.test('')).toBe(false);
  });
});

describe('BaseVersionResolver', () => {
  let resolver: TestResolver;
  let mockFileReader: jest.Mocked<IVersionFileReader>;

  beforeEach(() => {
    mockFileReader = createMockFileReader();
    resolver = new TestResolver(mockFileReader);
  });

  describe('resolve', () => {
    it('should return undefined for "skip"', async () => {
      const result = await resolver.resolve('skip', '.tool-version', '/app');
      expect(result).toBeUndefined();
      expect(resolver.mockFetchLatest).not.toHaveBeenCalled();
    });

    it('should return undefined for " skip " (with whitespace)', async () => {
      const result = await resolver.resolve(' skip ', '.tool-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should return exact version from input', async () => {
      const result = await resolver.resolve('1.2.3', '.tool-version', '/app');
      expect(result).toEqual({
        input: '1.2.3',
        resolved: '1.2.3',
        source: 'input',
      });
      expect(resolver.mockFetchLatest).not.toHaveBeenCalled();
    });

    it('should trim whitespace from exact version', async () => {
      const result = await resolver.resolve('  4.5.6  ', '.tool-version', '/app');
      expect(result).toEqual({
        input: '4.5.6',
        resolved: '4.5.6',
        source: 'input',
      });
    });

    it('should resolve "latest" via fetchLatestVersion', async () => {
      resolver.mockFetchLatest.mockResolvedValue('8.0.1');

      const result = await resolver.resolve('latest', '.tool-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '8.0.1',
        source: 'latest',
      });
      expect(resolver.mockFetchLatest).toHaveBeenCalledTimes(1);
    });

    it('should read from version file when version is empty', async () => {
      mockFileReader.read.mockResolvedValue('2.3.4');

      const result = await resolver.resolve('', '.tool-version', '/app');
      expect(result).toEqual({
        input: '2.3.4',
        resolved: '2.3.4',
        source: 'file',
      });
      expect(mockFileReader.read).toHaveBeenCalledWith('/app', '.tool-version');
    });

    it('should fall back to latest when no version file exists', async () => {
      mockFileReader.read.mockResolvedValue(undefined);
      resolver.mockFetchLatest.mockResolvedValue('7.7.7');

      const result = await resolver.resolve('', '.tool-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '7.7.7',
        source: 'latest',
      });
    });

    it('should resolve "skip" from version file', async () => {
      mockFileReader.read.mockResolvedValue('skip');

      const result = await resolver.resolve('', '.tool-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should resolve "latest" from version file', async () => {
      mockFileReader.read.mockResolvedValue('latest');
      resolver.mockFetchLatest.mockResolvedValue('5.5.5');

      const result = await resolver.resolve('', '.tool-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '5.5.5',
        source: 'file',
      });
    });

    it('should throw for invalid version spec', async () => {
      await expect(resolver.resolve('v1.2.3', '.tool-version', '/app')).rejects.toThrow(
        "Invalid testtool version spec: 'v1.2.3'",
      );
    });

    it('should throw for invalid version in file', async () => {
      mockFileReader.read.mockResolvedValue('not-a-version');

      await expect(resolver.resolve('', '.tool-version', '/app')).rejects.toThrow(
        "Invalid version in .tool-version: 'not-a-version'",
      );
    });

    it('should use toolName in error messages', async () => {
      const customResolver = new TestResolver(mockFileReader, 'mytool');

      await expect(customResolver.resolve('bad', '.mytool-version', '/app')).rejects.toThrow(
        "Invalid mytool version spec: 'bad'",
      );
    });
  });
});
