jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('node:os', () => ({
  homedir: jest.fn(),
}));

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { VersionFileReader } from './version-file-reader';

const mockedReadFile = jest.mocked(readFile);
const mockedHomedir = jest.mocked(homedir);

describe('VersionFileReader', () => {
  let reader: VersionFileReader;

  beforeEach(() => {
    reader = new VersionFileReader();
    mockedHomedir.mockReturnValue('/home/user');
    // Default: all readFile calls throw (file not found)
    mockedReadFile.mockRejectedValue(new Error('ENOENT'));
  });

  describe('read', () => {
    it('should find version file in the start directory', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/projects/myapp/.terraform-version') {
          return '1.9.8\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/projects/myapp', '.terraform-version');
      expect(result).toBe('1.9.8');
    });

    it('should walk up to parent directory', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/projects/.terraform-version') {
          return '1.5.7\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/projects/myapp', '.terraform-version');
      expect(result).toBe('1.5.7');
    });

    it('should walk up to grandparent directory', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/opt/.terragrunt-version') {
          return '0.75.10\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/opt/data/app', '.terragrunt-version');
      expect(result).toBe('0.75.10');
    });

    it('should stop at home directory', async () => {
      const calls: string[] = [];
      mockedReadFile.mockImplementation(async (path: any) => {
        calls.push(String(path));
        throw new Error('ENOENT');
      });

      await reader.read('/home/user/projects/app', '.terraform-version');

      // Should check: /home/user/projects/app, /home/user/projects, /home/user
      // Then stop at home. Should NOT check /home or /
      expect(calls).toContain('/home/user/projects/app/.terraform-version');
      expect(calls).toContain('/home/user/projects/.terraform-version');
      expect(calls).toContain('/home/user/.terraform-version');
      expect(calls).not.toContain('/home/.terraform-version');
      expect(calls).not.toContain('/.terraform-version');
    });

    it('should check home directory as last resort when not starting from home', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/home/user/.terraform-version') {
          return 'latest\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/opt/data', '.terraform-version');
      expect(result).toBe('latest');
    });

    it('should check home in both walk-up and fallback when starting from home subtree', async () => {
      const calls: string[] = [];
      mockedReadFile.mockImplementation(async (path: any) => {
        calls.push(String(path));
        throw new Error('ENOENT');
      });

      await reader.read('/home/user/projects', '.terraform-version');

      // Home is checked during walk-up AND as a last-resort fallback
      // because resolve('/home/user/projects') !== '/home/user'
      const homeChecks = calls.filter(c => c === '/home/user/.terraform-version');
      expect(homeChecks.length).toBe(2);
    });

    it('should return undefined when file not found anywhere', async () => {
      const result = await reader.read('/some/path', '.terraform-version');
      expect(result).toBeUndefined();
    });

    it('should skip empty lines', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/app/.terraform-version') {
          return '\n\n1.9.8\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/app', '.terraform-version');
      expect(result).toBe('1.9.8');
    });

    it('should skip comment lines', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/app/.terraform-version') {
          return '# This is a comment\n1.5.7\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/app', '.terraform-version');
      expect(result).toBe('1.5.7');
    });

    it('should trim whitespace from version', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/app/.terraform-version') {
          return '  1.9.8  \n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/app', '.terraform-version');
      expect(result).toBe('1.9.8');
    });

    it('should return undefined for file with only comments and empty lines', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/app/.terraform-version') {
          return '# comment\n\n# another comment\n';
        }
        throw new Error('ENOENT');
      });

      // File exists but has no version → continue walking up
      // Since no other file is found, return undefined
      const result = await reader.read('/app', '.terraform-version');
      expect(result).toBeUndefined();
    });

    it('should handle "latest" as a valid version string', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/app/.terraform-version') {
          return 'latest\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/app', '.terraform-version');
      expect(result).toBe('latest');
    });

    it('should handle "skip" as a valid version string', async () => {
      mockedReadFile.mockImplementation(async (path: any) => {
        if (path === '/app/.terragrunt-version') {
          return 'skip\n';
        }
        throw new Error('ENOENT');
      });

      const result = await reader.read('/app', '.terragrunt-version');
      expect(result).toBe('skip');
    });

    it('should stop at filesystem root for non-home paths', async () => {
      mockedHomedir.mockReturnValue('/home/user');

      const calls: string[] = [];
      mockedReadFile.mockImplementation(async (path: any) => {
        calls.push(String(path));
        throw new Error('ENOENT');
      });

      await reader.read('/opt/data', '.terraform-version');

      // Should walk: /opt/data, /opt, /
      // Then stop at root (dirname('/') === '/')
      // Then check home as last resort
      expect(calls).toContain('/opt/data/.terraform-version');
      expect(calls).toContain('/opt/.terraform-version');
      expect(calls).toContain('/.terraform-version');
      expect(calls).toContain('/home/user/.terraform-version');
    });
  });
});
