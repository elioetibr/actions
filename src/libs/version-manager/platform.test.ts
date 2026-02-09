import { getPlatform, getCacheDir } from './platform';

describe('getPlatform', () => {
  const originalPlatform = process.platform;
  const originalArch = process.arch;

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: originalArch,
      configurable: true,
    });
  });

  it('should detect linux/amd64', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });
    expect(getPlatform()).toEqual({ os: 'linux', arch: 'amd64' });
  });

  it('should detect darwin/arm64', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'arm64',
      configurable: true,
    });
    expect(getPlatform()).toEqual({ os: 'darwin', arch: 'arm64' });
  });

  it('should detect darwin/amd64', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });
    expect(getPlatform()).toEqual({ os: 'darwin', arch: 'amd64' });
  });

  it('should map win32 to windows', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });
    expect(getPlatform()).toEqual({ os: 'windows', arch: 'amd64' });
  });

  it('should detect linux/arm64', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'arm64',
      configurable: true,
    });
    expect(getPlatform()).toEqual({ os: 'linux', arch: 'arm64' });
  });

  it('should throw on unsupported platform', () => {
    Object.defineProperty(process, 'platform', {
      value: 'freebsd',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });
    expect(() => getPlatform()).toThrow(
      'Unsupported platform: freebsd. Supported: linux, darwin, windows.',
    );
  });

  it('should throw on unsupported architecture', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: 'ia32',
      configurable: true,
    });
    expect(() => getPlatform()).toThrow(
      'Unsupported architecture: ia32. Supported: x64 (amd64), arm64.',
    );
  });
});

describe('getCacheDir', () => {
  const originalEnv = { ...process.env };
  const originalPlatform = process.platform;
  const originalArch = process.arch;

  beforeEach(() => {
    // Ensure valid platform for getCacheDir (it calls getPlatform internally)
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
    Object.defineProperty(process, 'arch', {
      value: originalArch,
      configurable: true,
    });
  });

  it('should use RUNNER_TOOL_CACHE when available', () => {
    process.env['RUNNER_TOOL_CACHE'] = '/opt/hostedtoolcache';
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });

    expect(getCacheDir('terraform', '1.9.8')).toBe('/opt/hostedtoolcache/terraform/1.9.8/amd64');
  });

  it('should fall back to HOME/.tool-versions', () => {
    delete process.env['RUNNER_TOOL_CACHE'];
    process.env['HOME'] = '/home/runner';
    Object.defineProperty(process, 'arch', {
      value: 'arm64',
      configurable: true,
    });

    expect(getCacheDir('terragrunt', '0.75.10')).toBe(
      '/home/runner/.tool-versions/terragrunt/0.75.10/arm64',
    );
  });

  it('should fall back to /tmp/.tool-versions when HOME is not set', () => {
    delete process.env['RUNNER_TOOL_CACHE'];
    delete process.env['HOME'];
    Object.defineProperty(process, 'arch', {
      value: 'x64',
      configurable: true,
    });

    expect(getCacheDir('terraform', '1.0.0')).toBe('/tmp/.tool-versions/terraform/1.0.0/amd64');
  });

  it('should include arch in path', () => {
    process.env['RUNNER_TOOL_CACHE'] = '/cache';
    Object.defineProperty(process, 'arch', {
      value: 'arm64',
      configurable: true,
    });

    expect(getCacheDir('terraform', '1.5.0')).toContain('/arm64');
  });
});
