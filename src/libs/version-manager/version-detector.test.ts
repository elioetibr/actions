import type { IToolAgent } from './interfaces';
import {
  detectTerraformVersion,
  detectTerragruntVersion,
  isV1OrLater,
  clearVersionCache,
} from './version-detector';

/** Mock agent implementing IToolAgent for testing */
function createMockAgent(overrides: Partial<IToolAgent> = {}): jest.Mocked<IToolAgent> {
  return {
    exec: jest.fn(),
    addPath: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    debug: jest.fn(),
    ...overrides,
  } as jest.Mocked<IToolAgent>;
}

describe('version-detector', () => {
  beforeEach(() => {
    clearVersionCache();
  });

  describe('detectTerraformVersion', () => {
    it('should parse Terraform version output', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'Terraform v1.9.8\non linux_amd64\n',
        stderr: '',
      });

      const result = await detectTerraformVersion(agent);
      expect(result).toEqual({
        major: 1,
        minor: 9,
        patch: 8,
        raw: '1.9.8',
      });
    });

    it('should parse Terraform version with extra text', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout:
          'Terraform v1.5.7\non darwin_arm64\n+ provider registry.terraform.io/hashicorp/aws v5.0.0\n',
        stderr: '',
      });

      const result = await detectTerraformVersion(agent);
      expect(result).toEqual({
        major: 1,
        minor: 5,
        patch: 7,
        raw: '1.5.7',
      });
    });

    it('should cache the result after first call', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'Terraform v1.9.8\non linux_amd64\n',
        stderr: '',
      });

      await detectTerraformVersion(agent);
      await detectTerraformVersion(agent);

      // exec should only be called once due to caching
      expect(agent.exec).toHaveBeenCalledTimes(1);
    });

    it('should throw when terraform --version fails', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'terraform: command not found',
      });

      await expect(detectTerraformVersion(agent)).rejects.toThrow(
        'terraform --version failed (exit 1): terraform: command not found',
      );
    });

    it('should throw when output is unparseable', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'some unexpected output',
        stderr: '',
      });

      await expect(detectTerraformVersion(agent)).rejects.toThrow(
        'Failed to parse Terraform version from output',
      );
    });

    it('should call terraform with correct arguments', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'Terraform v1.0.0\n',
        stderr: '',
      });

      await detectTerraformVersion(agent);

      expect(agent.exec).toHaveBeenCalledWith('terraform', ['--version'], {
        silent: true,
        ignoreReturnCode: true,
      });
    });
  });

  describe('detectTerragruntVersion', () => {
    it('should parse Terragrunt version output', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'terragrunt version v0.75.10\n',
        stderr: '',
      });

      const result = await detectTerragruntVersion(agent);
      expect(result).toEqual({
        major: 0,
        minor: 75,
        patch: 10,
        raw: '0.75.10',
      });
    });

    it('should parse Terragrunt v1.x version output', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'terragrunt version v1.0.0\n',
        stderr: '',
      });

      const result = await detectTerragruntVersion(agent);
      expect(result).toEqual({
        major: 1,
        minor: 0,
        patch: 0,
        raw: '1.0.0',
      });
    });

    it('should be case-insensitive', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'Terragrunt Version v0.50.0\n',
        stderr: '',
      });

      const result = await detectTerragruntVersion(agent);
      expect(result).toEqual({
        major: 0,
        minor: 50,
        patch: 0,
        raw: '0.50.0',
      });
    });

    it('should cache the result after first call', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'terragrunt version v0.75.10\n',
        stderr: '',
      });

      await detectTerragruntVersion(agent);
      await detectTerragruntVersion(agent);

      expect(agent.exec).toHaveBeenCalledTimes(1);
    });

    it('should throw when terragrunt --version fails', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 127,
        stdout: '',
        stderr: 'terragrunt: command not found',
      });

      await expect(detectTerragruntVersion(agent)).rejects.toThrow(
        'terragrunt --version failed (exit 127)',
      );
    });

    it('should throw when output is unparseable', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'unknown format 1.0.0',
        stderr: '',
      });

      await expect(detectTerragruntVersion(agent)).rejects.toThrow(
        'Failed to parse Terragrunt version from output',
      );
    });

    it('should call terragrunt with correct arguments', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'terragrunt version v1.0.0\n',
        stderr: '',
      });

      await detectTerragruntVersion(agent);

      expect(agent.exec).toHaveBeenCalledWith('terragrunt', ['--version'], {
        silent: true,
        ignoreReturnCode: true,
      });
    });
  });

  describe('isV1OrLater', () => {
    it('should return true for major version 1', () => {
      expect(isV1OrLater({ major: 1, minor: 0, patch: 0, raw: '1.0.0' })).toBe(true);
    });

    it('should return true for major version 2', () => {
      expect(isV1OrLater({ major: 2, minor: 0, patch: 0, raw: '2.0.0' })).toBe(true);
    });

    it('should return false for major version 0', () => {
      expect(isV1OrLater({ major: 0, minor: 75, patch: 10, raw: '0.75.10' })).toBe(false);
    });

    it('should return false for v0.99.99', () => {
      expect(isV1OrLater({ major: 0, minor: 99, patch: 99, raw: '0.99.99' })).toBe(false);
    });
  });

  describe('clearVersionCache', () => {
    it('should clear cached versions so next call re-fetches', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock).mockResolvedValue({
        exitCode: 0,
        stdout: 'Terraform v1.9.8\n',
        stderr: '',
      });

      await detectTerraformVersion(agent);
      expect(agent.exec).toHaveBeenCalledTimes(1);

      clearVersionCache();

      await detectTerraformVersion(agent);
      expect(agent.exec).toHaveBeenCalledTimes(2);
    });

    it('should clear both terraform and terragrunt caches', async () => {
      const agent = createMockAgent();
      (agent.exec as jest.Mock)
        .mockResolvedValueOnce({
          exitCode: 0,
          stdout: 'Terraform v1.0.0\n',
          stderr: '',
        })
        .mockResolvedValueOnce({
          exitCode: 0,
          stdout: 'terragrunt version v0.75.10\n',
          stderr: '',
        });

      await detectTerraformVersion(agent);
      await detectTerragruntVersion(agent);
      expect(agent.exec).toHaveBeenCalledTimes(2);

      clearVersionCache();

      (agent.exec as jest.Mock)
        .mockResolvedValueOnce({
          exitCode: 0,
          stdout: 'Terraform v1.0.0\n',
          stderr: '',
        })
        .mockResolvedValueOnce({
          exitCode: 0,
          stdout: 'terragrunt version v0.75.10\n',
          stderr: '',
        });

      await detectTerraformVersion(agent);
      await detectTerragruntVersion(agent);
      expect(agent.exec).toHaveBeenCalledTimes(4);
    });
  });
});
