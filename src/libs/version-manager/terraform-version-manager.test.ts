jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  chmod: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./platform', () => ({
  getPlatform: jest.fn().mockReturnValue({ os: 'linux', arch: 'amd64' }),
  getCacheDir: jest.fn().mockReturnValue('/cache/terraform/1.9.8/amd64'),
}));

import { existsSync } from 'node:fs';
import { chmod, mkdir, unlink, writeFile } from 'node:fs/promises';
import type { IToolAgent, IVersionFileReader } from './interfaces';
import { getCacheDir, getPlatform } from './platform';
import { TerraformVersionInstaller, TerraformVersionResolver } from './terraform-version-manager';

const mockedExistsSync = jest.mocked(existsSync);
const mockedGetCacheDir = jest.mocked(getCacheDir);
const mockedGetPlatform = jest.mocked(getPlatform);
const mockedMkdir = jest.mocked(mkdir);
const mockedWriteFile = jest.mocked(writeFile);
const mockedChmod = jest.mocked(chmod);
const mockedUnlink = jest.mocked(unlink);

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

describe('TerraformVersionResolver', () => {
  let resolver: TerraformVersionResolver;
  let mockFileReader: jest.Mocked<IVersionFileReader>;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    mockFileReader = createMockFileReader();
    resolver = new TerraformVersionResolver(mockFileReader);
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('resolve', () => {
    it('should return undefined for "skip"', async () => {
      const result = await resolver.resolve('skip', '.terraform-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should return undefined for " skip " (with whitespace)', async () => {
      const result = await resolver.resolve(' skip ', '.terraform-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should return exact version from input', async () => {
      const result = await resolver.resolve('1.9.8', '.terraform-version', '/app');
      expect(result).toEqual({
        input: '1.9.8',
        resolved: '1.9.8',
        source: 'input',
      });
    });

    it('should trim whitespace from exact version', async () => {
      const result = await resolver.resolve('  1.5.7  ', '.terraform-version', '/app');
      expect(result).toEqual({
        input: '1.5.7',
        resolved: '1.5.7',
        source: 'input',
      });
    });

    it('should resolve "latest" from HashiCorp index', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          versions: {
            '1.9.8': {},
            '1.9.7': {},
            '1.10.0-alpha1': {},
            '1.8.5': {},
          },
        }),
      );

      const result = await resolver.resolve('latest', '.terraform-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '1.9.8',
        source: 'latest',
      });
    });

    it('should filter out prerelease versions when resolving latest', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          versions: {
            '1.10.0-beta1': {},
            '1.10.0-rc1': {},
            '1.9.8': {},
            '0.15.0': {},
          },
        }),
      );

      const result = await resolver.resolve('latest', '.terraform-version', '/app');
      expect(result?.resolved).toBe('1.9.8');
    });

    it('should sort versions correctly (highest first)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          versions: {
            '0.12.0': {},
            '1.9.8': {},
            '1.10.0': {},
            '2.0.0': {},
            '1.9.9': {},
          },
        }),
      );

      const result = await resolver.resolve('latest', '.terraform-version', '/app');
      expect(result?.resolved).toBe('2.0.0');
    });

    it('should read from version file when version is empty', async () => {
      mockFileReader.read.mockResolvedValue('1.5.7');

      const result = await resolver.resolve('', '.terraform-version', '/app');
      expect(result).toEqual({
        input: '1.5.7',
        resolved: '1.5.7',
        source: 'file',
      });
      expect(mockFileReader.read).toHaveBeenCalledWith('/app', '.terraform-version');
    });

    it('should resolve "latest" from version file', async () => {
      mockFileReader.read.mockResolvedValue('latest');
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ versions: { '1.9.8': {} } }),
      );

      const result = await resolver.resolve('', '.terraform-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '1.9.8',
        source: 'file',
      });
    });

    it('should return undefined when version file contains "skip"', async () => {
      mockFileReader.read.mockResolvedValue('skip');

      const result = await resolver.resolve('', '.terraform-version', '/app');
      expect(result).toBeUndefined();
    });

    it('should fall back to latest when no version file exists', async () => {
      mockFileReader.read.mockResolvedValue(undefined);
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ versions: { '1.9.8': {} } }),
      );

      const result = await resolver.resolve('', '.terraform-version', '/app');
      expect(result).toEqual({
        input: 'latest',
        resolved: '1.9.8',
        source: 'latest',
      });
    });

    it('should throw for invalid version spec', async () => {
      await expect(resolver.resolve('v1.9.8', '.terraform-version', '/app')).rejects.toThrow(
        "Invalid terraform version spec: 'v1.9.8'",
      );
    });

    it('should throw for invalid version in file', async () => {
      mockFileReader.read.mockResolvedValue('not-a-version');

      await expect(resolver.resolve('', '.terraform-version', '/app')).rejects.toThrow(
        "Invalid version in .terraform-version: 'not-a-version'",
      );
    });

    it('should throw when fetch fails for latest', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({}, 500));

      await expect(resolver.resolve('latest', '.terraform-version', '/app')).rejects.toThrow(
        'Failed to fetch Terraform version index: 500',
      );
    });

    it('should throw when no stable versions exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          versions: {
            '1.10.0-alpha1': {},
            '1.10.0-beta1': {},
          },
        }),
      );

      await expect(resolver.resolve('latest', '.terraform-version', '/app')).rejects.toThrow(
        'No stable Terraform versions found',
      );
    });
  });
});

describe('TerraformVersionInstaller', () => {
  let installer: TerraformVersionInstaller;
  let mockAgent: jest.Mocked<IToolAgent>;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    installer = new TerraformVersionInstaller();
    mockAgent = createMockAgent();
    originalFetch = global.fetch;
    global.fetch = jest.fn();

    mockedGetPlatform.mockReturnValue({ os: 'linux', arch: 'amd64' });
    mockedGetCacheDir.mockReturnValue('/cache/terraform/1.9.8/amd64');
    mockedExistsSync.mockReturnValue(false);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('isInstalled', () => {
    it('should return true when binary exists in cache', async () => {
      mockedExistsSync.mockReturnValue(true);

      const result = await installer.isInstalled('1.9.8');
      expect(result).toBe(true);
      expect(mockedExistsSync).toHaveBeenCalledWith('/cache/terraform/1.9.8/amd64/terraform');
    });

    it('should return false when binary does not exist', async () => {
      mockedExistsSync.mockReturnValue(false);

      const result = await installer.isInstalled('1.9.8');
      expect(result).toBe(false);
    });

    it('should check for terraform.exe on Windows', async () => {
      mockedGetPlatform.mockReturnValue({ os: 'windows', arch: 'amd64' });
      mockedExistsSync.mockReturnValue(true);

      await installer.isInstalled('1.9.8');
      expect(mockedExistsSync).toHaveBeenCalledWith('/cache/terraform/1.9.8/amd64/terraform.exe');
    });
  });

  describe('install', () => {
    it('should skip download when already installed', async () => {
      mockedExistsSync.mockReturnValue(true);

      const result = await installer.install('1.9.8', mockAgent);
      expect(result).toBe('/cache/terraform/1.9.8/amd64');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockAgent.info).toHaveBeenCalledWith(expect.stringContaining('already cached'));
    });

    it('should download and extract terraform binary', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      const result = await installer.install('1.9.8', mockAgent);

      expect(result).toBe('/cache/terraform/1.9.8/amd64');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://releases.hashicorp.com/terraform/1.9.8/terraform_1.9.8_linux_amd64.zip',
      );
      expect(mockedMkdir).toHaveBeenCalledWith('/cache/terraform/1.9.8/amd64', { recursive: true });
      expect(mockedWriteFile).toHaveBeenCalled();
      expect(mockAgent.exec).toHaveBeenCalledWith(
        'unzip',
        [
          '-o',
          '/cache/terraform/1.9.8/amd64/terraform_1.9.8_linux_amd64.zip',
          '-d',
          '/cache/terraform/1.9.8/amd64',
        ],
        { silent: true },
      );
      expect(mockedUnlink).toHaveBeenCalled();
      expect(mockedChmod).toHaveBeenCalledWith('/cache/terraform/1.9.8/amd64/terraform', 0o755);
    });

    it('should use correct URL for darwin/arm64', async () => {
      mockedGetPlatform.mockReturnValue({ os: 'darwin', arch: 'arm64' });
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      await installer.install('1.9.8', mockAgent);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://releases.hashicorp.com/terraform/1.9.8/terraform_1.9.8_darwin_arm64.zip',
      );
    });

    it('should throw when download fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 404));

      await expect(installer.install('99.99.99', mockAgent)).rejects.toThrow(
        'Failed to download Terraform 99.99.99: 404',
      );
    });

    it('should throw when extraction fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));
      (mockAgent.exec as jest.Mock).mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'unzip: cannot open',
      });

      await expect(installer.install('1.9.8', mockAgent)).rejects.toThrow(
        'Failed to extract Terraform 1.9.8: unzip: cannot open',
      );
    });

    it('should log download and install messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      await installer.install('1.9.8', mockAgent);

      expect(mockAgent.info).toHaveBeenCalledWith(
        expect.stringContaining('Downloading Terraform 1.9.8'),
      );
      expect(mockAgent.info).toHaveBeenCalledWith(expect.stringContaining('installed to'));
    });

    it('should use terraform.exe as binary name on Windows', async () => {
      mockedGetPlatform.mockReturnValue({ os: 'windows', arch: 'amd64' });
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(null, 200));

      await installer.install('1.9.8', mockAgent);

      expect(mockedChmod).toHaveBeenCalledWith(expect.stringContaining('terraform.exe'), 0o755);
    });
  });
});
