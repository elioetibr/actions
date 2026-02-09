jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  chmod: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./platform', () => ({
  getPlatform: jest.fn().mockReturnValue({ os: 'linux', arch: 'amd64' }),
  getCacheDir: jest.fn().mockReturnValue('/cache/terragrunt/0.75.10/amd64'),
}));

import { existsSync } from 'node:fs';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import type { IToolAgent, IVersionFileReader } from './interfaces';
import { getCacheDir, getPlatform } from './platform';
import {
  TerragruntVersionInstaller,
  TerragruntVersionResolver,
} from './terragrunt-version-manager';

const mockedExistsSync = jest.mocked(existsSync);
const mockedGetCacheDir = jest.mocked(getCacheDir);
const mockedGetPlatform = jest.mocked(getPlatform);
const mockedMkdir = jest.mocked(mkdir);
const mockedWriteFile = jest.mocked(writeFile);
const mockedChmod = jest.mocked(chmod);

function createMockAgent(): jest.Mocked<IToolAgent> {
  return {
    exec: jest.fn().mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' }),
    addPath: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    debug: jest.fn(),
  };
}

function createMockFileReader(): jest.Mocked<IVersionFileReader> {
  return {
    read: jest.fn(),
  };
}

function mockFetchResponse(body: unknown, status = 200): Partial<Response> {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValue(body),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
  };
}

describe('TerragruntVersionResolver', () => {
  let resolver: TerragruntVersionResolver;
  let mockFileReader: jest.Mocked<IVersionFileReader>;
  let originalFetch: typeof global.fetch;
  let originalEnv: typeof process.env;

  beforeEach(() => {
    mockFileReader = createMockFileReader();
    resolver = new TerragruntVersionResolver(mockFileReader);
    originalFetch = global.fetch;
    originalEnv = { ...process.env };
    global.fetch = jest.fn();
    delete process.env['GITHUB_TOKEN'];
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  describe('resolve', () => {
    it('should return undefined for "skip"', async () => {
      const result = await resolver.resolve('skip', '.terragrunt-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should return exact version from input', async () => {
      const result = await resolver.resolve('0.75.10', '.terragrunt-version', '/app');
      expect(result).toEqual({
        input: '0.75.10',
        resolved: '0.75.10',
        source: 'input',
      });
    });

    it('should resolve v1.x exact versions', async () => {
      const result = await resolver.resolve('1.0.0', '.terragrunt-version', '/app');
      expect(result).toEqual({
        input: '1.0.0',
        resolved: '1.0.0',
        source: 'input',
      });
    });

    it('should resolve "latest" from GitHub API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v1.0.3' }));

      const result = await resolver.resolve('latest', '.terragrunt-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '1.0.3',
        source: 'latest',
      });
    });

    it('should strip v prefix from GitHub tag', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v0.75.10' }));

      const result = await resolver.resolve('latest', '.terragrunt-version', '/app');
      expect(result?.resolved).toBe('0.75.10');
    });

    it('should handle tag without v prefix', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: '1.0.0' }));

      const result = await resolver.resolve('latest', '.terragrunt-version', '/app');
      expect(result?.resolved).toBe('1.0.0');
    });

    it('should read from version file when version is empty', async () => {
      mockFileReader.read.mockResolvedValue('0.75.10');

      const result = await resolver.resolve('', '.terragrunt-version', '/app');
      expect(result).toEqual({
        input: '0.75.10',
        resolved: '0.75.10',
        source: 'file',
      });
    });

    it('should resolve "latest" from version file', async () => {
      mockFileReader.read.mockResolvedValue('latest');
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v1.0.3' }));

      const result = await resolver.resolve('', '.terragrunt-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '1.0.3',
        source: 'file',
      });
    });

    it('should return undefined when version file contains "skip"', async () => {
      mockFileReader.read.mockResolvedValue('skip');

      const result = await resolver.resolve('', '.terragrunt-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should fall back to latest when no version file exists', async () => {
      mockFileReader.read.mockResolvedValue(undefined);
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v1.0.3' }));

      const result = await resolver.resolve('', '.terragrunt-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '1.0.3',
        source: 'latest',
      });
    });

    it('should throw for invalid version spec', async () => {
      await expect(resolver.resolve('v0.75.10', '.terragrunt-version', '/app')).rejects.toThrow(
        "Invalid terragrunt version spec: 'v0.75.10'",
      );
    });

    it('should throw for invalid version in file', async () => {
      mockFileReader.read.mockResolvedValue('bad-version');

      await expect(resolver.resolve('', '.terragrunt-version', '/app')).rejects.toThrow(
        "Invalid version in .terragrunt-version: 'bad-version'",
      );
    });

    it('should throw when GitHub API returns error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({}, 500));

      await expect(resolver.resolve('latest', '.terragrunt-version', '/app')).rejects.toThrow(
        'Failed to fetch latest Terragrunt version: 500',
      );
    });

    it('should include rate limit hint for 403 errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({}, 403));

      await expect(resolver.resolve('latest', '.terragrunt-version', '/app')).rejects.toThrow(
        'rate limit',
      );
    });

    it('should throw for unexpected tag format', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ tag_name: 'release-candidate-1' }),
      );

      await expect(resolver.resolve('latest', '.terragrunt-version', '/app')).rejects.toThrow(
        'Unexpected Terragrunt latest version format',
      );
    });

    it('should use GITHUB_TOKEN when available', async () => {
      process.env['GITHUB_TOKEN'] = 'ghp_test123';
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v1.0.0' }));

      await resolver.resolve('latest', '.terragrunt-version', '/app');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer ghp_test123',
          }),
        }),
      );
    });

    it('should not include Authorization header without GITHUB_TOKEN', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v1.0.0' }));

      await resolver.resolve('latest', '.terragrunt-version', '/app');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should send correct User-Agent header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ tag_name: 'v1.0.0' }));

      await resolver.resolve('latest', '.terragrunt-version', '/app');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'elioetibr/actions',
          }),
        }),
      );
    });
  });
});

describe('TerragruntVersionInstaller', () => {
  let installer: TerragruntVersionInstaller;
  let mockAgent: jest.Mocked<IToolAgent>;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    installer = new TerragruntVersionInstaller();
    mockAgent = createMockAgent();
    originalFetch = global.fetch;
    global.fetch = jest.fn();

    mockedGetPlatform.mockReturnValue({ os: 'linux', arch: 'amd64' });
    mockedGetCacheDir.mockReturnValue('/cache/terragrunt/0.75.10/amd64');
    mockedExistsSync.mockReturnValue(false);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('isInstalled', () => {
    it('should return true when binary exists in cache', async () => {
      mockedExistsSync.mockReturnValue(true);

      const result = await installer.isInstalled('0.75.10');
      expect(result).toBe(true);
      expect(mockedExistsSync).toHaveBeenCalledWith('/cache/terragrunt/0.75.10/amd64/terragrunt');
    });

    it('should return false when binary does not exist', async () => {
      mockedExistsSync.mockReturnValue(false);

      const result = await installer.isInstalled('0.75.10');
      expect(result).toBe(false);
    });

    it('should check for terragrunt.exe on Windows', async () => {
      mockedGetPlatform.mockReturnValue({ os: 'windows', arch: 'amd64' });
      mockedExistsSync.mockReturnValue(true);

      await installer.isInstalled('0.75.10');
      expect(mockedExistsSync).toHaveBeenCalledWith(
        '/cache/terragrunt/0.75.10/amd64/terragrunt.exe',
      );
    });
  });

  describe('install', () => {
    it('should skip download when already installed', async () => {
      mockedExistsSync.mockReturnValue(true);

      const result = await installer.install('0.75.10', mockAgent);
      expect(result).toBe('/cache/terragrunt/0.75.10/amd64');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockAgent.info).toHaveBeenCalledWith(expect.stringContaining('already cached'));
    });

    it('should download standalone binary (no zip extraction)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      const result = await installer.install('0.75.10', mockAgent);

      expect(result).toBe('/cache/terragrunt/0.75.10/amd64');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://github.com/gruntwork-io/terragrunt/releases/download/v0.75.10/terragrunt_linux_amd64',
      );
      expect(mockedMkdir).toHaveBeenCalledWith('/cache/terragrunt/0.75.10/amd64', {
        recursive: true,
      });
      expect(mockedWriteFile).toHaveBeenCalled();
      expect(mockedChmod).toHaveBeenCalledWith('/cache/terragrunt/0.75.10/amd64/terragrunt', 0o755);
      // Should NOT call unzip (no archive extraction for terragrunt)
      expect(mockAgent.exec).not.toHaveBeenCalled();
    });

    it('should use correct URL for darwin/arm64', async () => {
      mockedGetPlatform.mockReturnValue({ os: 'darwin', arch: 'arm64' });
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      await installer.install('0.75.10', mockAgent);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://github.com/gruntwork-io/terragrunt/releases/download/v0.75.10/terragrunt_darwin_arm64',
      );
    });

    it('should throw when download fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 404));

      await expect(installer.install('99.99.99', mockAgent)).rejects.toThrow(
        'Failed to download Terragrunt 99.99.99: 404',
      );
    });

    it('should log download and install messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      await installer.install('0.75.10', mockAgent);

      expect(mockAgent.info).toHaveBeenCalledWith(
        expect.stringContaining('Downloading Terragrunt 0.75.10'),
      );
      expect(mockAgent.info).toHaveBeenCalledWith(expect.stringContaining('installed to'));
    });

    it('should use terragrunt.exe as binary name on Windows', async () => {
      mockedGetPlatform.mockReturnValue({ os: 'windows', arch: 'amd64' });
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      await installer.install('0.75.10', mockAgent);

      expect(mockedChmod).toHaveBeenCalledWith(expect.stringContaining('terragrunt.exe'), 0o755);
    });
  });
});
