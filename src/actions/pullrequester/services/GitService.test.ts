import type { IAgent, IExecResult } from '../../../agents';
import { GitService } from './GitService';

/**
 * Create a mock IAgent with only the exec method needed by GitService.
 */
function createMockAgent(): jest.Mocked<Pick<IAgent, 'exec'>> {
  return {
    // IAgent.exec — safe via @actions/exec (execFile, not shell)
    exec: jest.fn<Promise<IExecResult>, Parameters<IAgent['exec']>>(),
  };
}

/**
 * Helper to configure exec mock responses based on git argument patterns.
 * Each entry maps a substring that must appear in the joined args to an IExecResult.
 */
function setupExecResponses(
  agent: ReturnType<typeof createMockAgent>,
  responses: Map<string, Partial<IExecResult>>,
): void {
  agent.exec.mockImplementation(async (_cmd, args) => {
    const key = (args ?? []).join(' ');
    for (const [pattern, partial] of responses) {
      if (key.includes(pattern)) {
        return {
          exitCode: partial.exitCode ?? 0,
          stdout: partial.stdout ?? '',
          stderr: partial.stderr ?? '',
        };
      }
    }
    return { exitCode: 0, stdout: '', stderr: '' };
  });
}

/** Shorthand for a successful exec result with given stdout. */
function okResult(stdout: string): IExecResult {
  return { exitCode: 0, stdout, stderr: '' };
}

/** Shorthand for an exec result with specific exit code. */
function exitResult(exitCode: number): IExecResult {
  return { exitCode, stdout: '', stderr: '' };
}

describe('GitService', () => {
  let agent: ReturnType<typeof createMockAgent>;
  let service: GitService;

  beforeEach(() => {
    agent = createMockAgent();
    service = new GitService(agent as unknown as IAgent);
    // Default: all exec calls succeed with empty output
    agent.exec.mockResolvedValue(okResult(''));
  });

  describe('hasChanges', () => {
    it('should return true when porcelain output is non-empty', async () => {
      agent.exec.mockResolvedValue(okResult(' M src/index.ts'));
      const result = await service.hasChanges();
      expect(result).toBe(true);
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['status', '--porcelain'],
        expect.objectContaining({ silent: true, ignoreReturnCode: true }),
      );
    });

    it('should return false when porcelain output is empty', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      const result = await service.hasChanges();
      expect(result).toBe(false);
    });
  });

  describe('getChangedFiles', () => {
    it('should parse porcelain output into file paths', async () => {
      agent.exec.mockResolvedValue(okResult(' M src/index.ts\n?? src/new-file.ts\n M README.md'));
      const files = await service.getChangedFiles();
      expect(files).toEqual(['src/index.ts', 'src/new-file.ts', 'README.md']);
    });

    it('should return empty array when no changes', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      const files = await service.getChangedFiles();
      expect(files).toEqual([]);
    });

    it('should filter files by addPaths when provided', async () => {
      agent.exec.mockResolvedValue(okResult(' M src/index.ts\n M docs/guide.md\n?? src/utils.ts'));
      const files = await service.getChangedFiles(['src/']);
      expect(files).toEqual(['src/index.ts', 'src/utils.ts']);
    });

    it('should match exact file paths in addPaths', async () => {
      agent.exec.mockResolvedValue(okResult(' M package.json\n M src/index.ts'));
      const files = await service.getChangedFiles(['package.json']);
      expect(files).toEqual(['package.json']);
    });

    it('should return empty array when addPaths filters everything out', async () => {
      agent.exec.mockResolvedValue(okResult(' M src/index.ts'));
      const files = await service.getChangedFiles(['docs/']);
      expect(files).toEqual([]);
    });

    it('should return all files when addPaths is empty array', async () => {
      agent.exec.mockResolvedValue(okResult(' M src/index.ts\n M docs/guide.md'));
      const files = await service.getChangedFiles([]);
      expect(files).toEqual(['src/index.ts', 'docs/guide.md']);
    });

    it('should handle lines with only whitespace after status columns', async () => {
      agent.exec.mockResolvedValue(okResult(' M src/index.ts\n   \n M docs/guide.md'));
      const files = await service.getChangedFiles();
      expect(files).toEqual(['src/index.ts', 'docs/guide.md']);
    });
  });

  describe('createBranch', () => {
    it('should create branch without base', async () => {
      await service.createBranch('feature/new');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['checkout', '-B', 'feature/new'],
        expect.objectContaining({ silent: true }),
      );
    });

    it('should create branch with base', async () => {
      await service.createBranch('feature/new', 'origin/main');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['checkout', '-B', 'feature/new', 'origin/main'],
        expect.objectContaining({ silent: true }),
      );
    });
  });

  describe('commitChanges', () => {
    it('should stage all changes and commit with message', async () => {
      setupExecResponses(agent, new Map([['rev-parse HEAD', { stdout: 'abc1234567890' }]]));

      const sha = await service.commitChanges('fix: correct typo');

      expect(agent.exec).toHaveBeenCalledWith('git', ['add', '-A'], expect.anything());
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'fix: correct typo'],
        expect.anything(),
      );
      expect(sha).toBe('abc1234567890');
    });

    it('should include author when provided', async () => {
      setupExecResponses(agent, new Map([['rev-parse HEAD', { stdout: 'def456' }]]));

      await service.commitChanges('feat: add feature', 'Bot <bot@test.com>');

      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'feat: add feature', '--author', 'Bot <bot@test.com>'],
        expect.anything(),
      );
    });

    it('should include signoff when true', async () => {
      setupExecResponses(agent, new Map([['rev-parse HEAD', { stdout: 'aaa111' }]]));

      await service.commitChanges('chore: update deps', undefined, true);

      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'chore: update deps', '--signoff'],
        expect.anything(),
      );
    });

    it('should include both author and signoff when both provided', async () => {
      setupExecResponses(agent, new Map([['rev-parse HEAD', { stdout: 'bbb222' }]]));

      await service.commitChanges('docs: update', 'Bot <bot@x.com>', true);

      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'docs: update', '--author', 'Bot <bot@x.com>', '--signoff'],
        expect.anything(),
      );
    });

    it('should not include signoff when false', async () => {
      setupExecResponses(agent, new Map([['rev-parse HEAD', { stdout: 'ccc333' }]]));

      await service.commitChanges('test: add tests', undefined, false);

      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'test: add tests'],
        expect.anything(),
      );
    });
  });

  describe('pushBranch', () => {
    it('should push branch to origin', async () => {
      await service.pushBranch('feature/new');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['push', 'origin', 'feature/new'],
        expect.anything(),
      );
    });

    it('should push with force-with-lease when force is true', async () => {
      await service.pushBranch('feature/new', true);
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['push', 'origin', 'feature/new', '--force-with-lease'],
        expect.anything(),
      );
    });

    it('should not add force flag when force is false', async () => {
      await service.pushBranch('feature/new', false);
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['push', 'origin', 'feature/new'],
        expect.anything(),
      );
    });
  });

  describe('hasDiffWithBase', () => {
    it('should return true when diff output is non-empty', async () => {
      agent.exec.mockResolvedValue(okResult('src/index.ts\nsrc/utils.ts'));
      const result = await service.hasDiffWithBase('feature/x', 'main');
      expect(result).toBe(true);
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['diff', 'main...feature/x', '--name-only'],
        expect.anything(),
      );
    });

    it('should return false when diff output is empty', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      const result = await service.hasDiffWithBase('feature/x', 'main');
      expect(result).toBe(false);
    });
  });

  describe('hasCollaboratorCommits', () => {
    it('should return false when all commits are by the bot', async () => {
      agent.exec.mockResolvedValue(okResult('bot@example.com\nbot@example.com\nbot@example.com'));
      const result = await service.hasCollaboratorCommits('feature/x', 'main', 'bot@example.com');
      expect(result).toBe(false);
    });

    it('should return true when a non-bot author is present', async () => {
      agent.exec.mockResolvedValue(okResult('bot@example.com\nhuman@example.com\nbot@example.com'));
      const result = await service.hasCollaboratorCommits('feature/x', 'main', 'bot@example.com');
      expect(result).toBe(true);
    });

    it('should return false when there are no commits', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      const result = await service.hasCollaboratorCommits('feature/x', 'main', 'bot@example.com');
      expect(result).toBe(false);
    });

    it('should use correct git log range', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      await service.hasCollaboratorCommits('feature/pr', 'origin/main', 'bot@x.com');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['log', 'origin/main..feature/pr', '--format=%ae'],
        expect.anything(),
      );
    });

    it('should handle single non-bot author', async () => {
      agent.exec.mockResolvedValue(okResult('human@example.com'));
      const result = await service.hasCollaboratorCommits('feature/x', 'main', 'bot@example.com');
      expect(result).toBe(true);
    });

    it('should handle single bot author', async () => {
      agent.exec.mockResolvedValue(okResult('bot@example.com'));
      const result = await service.hasCollaboratorCommits('feature/x', 'main', 'bot@example.com');
      expect(result).toBe(false);
    });
  });

  describe('hasConflictsWithBase', () => {
    it('should return false when merge-tree exit code is 0 (clean merge)', async () => {
      agent.exec.mockResolvedValue(exitResult(0));
      const result = await service.hasConflictsWithBase('feature/x', 'main');
      expect(result).toBe(false);
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['merge-tree', '--write-tree', 'main', 'feature/x'],
        expect.anything(),
      );
    });

    it('should return true when merge-tree exit code is 1 (conflicts)', async () => {
      agent.exec.mockResolvedValue(exitResult(1));
      const result = await service.hasConflictsWithBase('feature/x', 'main');
      expect(result).toBe(true);
    });

    it('should return true for any non-zero exit code', async () => {
      agent.exec.mockResolvedValue(exitResult(128));
      const result = await service.hasConflictsWithBase('feature/x', 'main');
      expect(result).toBe(true);
    });
  });

  describe('getCommitLog', () => {
    it('should return parsed commit entries using CommitLogParser', async () => {
      const rawLog = 'abc1234\0feat: add feature\0Some body\0def5678\0fix: bug fix\0\0';
      agent.exec.mockResolvedValue(okResult(rawLog));

      const entries = await service.getCommitLog('main', 'HEAD');

      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(
        expect.objectContaining({ sha: 'abc1234', subject: 'add feature', type: 'feat' }),
      );
      expect(entries[1]).toEqual(
        expect.objectContaining({ sha: 'def5678', subject: 'bug fix', type: 'fix' }),
      );
    });

    it('should use base..head range when head is provided', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      await service.getCommitLog('main', 'feature/x');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['log', 'main..feature/x', '--format=%H%x00%s%x00%b%x00'],
        expect.anything(),
      );
    });

    it('should use base..HEAD range when head is not provided', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      await service.getCommitLog('main');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['log', 'main..HEAD', '--format=%H%x00%s%x00%b%x00'],
        expect.anything(),
      );
    });

    it('should return empty array when no commits in range', async () => {
      agent.exec.mockResolvedValue(okResult(''));
      const entries = await service.getCommitLog('main');
      expect(entries).toEqual([]);
    });
  });

  describe('configureCredentials', () => {
    it('should set extraheader with base64 encoded token', async () => {
      await service.configureCredentials('ghp_test123');

      const expectedToken = Buffer.from('x-access-token:ghp_test123').toString('base64');
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        [
          'config',
          '--local',
          'http.https://github.com/.extraheader',
          `AUTHORIZATION: basic ${expectedToken}`,
        ],
        expect.anything(),
      );
    });

    it('should correctly encode different tokens', async () => {
      await service.configureCredentials('my-secret-token');

      const expectedToken = Buffer.from('x-access-token:my-secret-token').toString('base64');
      const callArgs = agent.exec.mock.calls[0][1] as string[];
      expect(callArgs[3]).toBe(`AUTHORIZATION: basic ${expectedToken}`);
    });
  });

  describe('configureUser', () => {
    it('should set user.name and user.email', async () => {
      await service.configureUser('Bot User', 'bot@example.com');

      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['config', '--local', 'user.name', 'Bot User'],
        expect.anything(),
      );
      expect(agent.exec).toHaveBeenCalledWith(
        'git',
        ['config', '--local', 'user.email', 'bot@example.com'],
        expect.anything(),
      );
    });

    it('should make two separate exec calls', async () => {
      await service.configureUser('Test', 'test@test.com');
      expect(agent.exec).toHaveBeenCalledTimes(2);
    });
  });

  describe('private git method behavior', () => {
    it('should always pass silent and ignoreReturnCode options', async () => {
      await service.hasChanges();
      expect(agent.exec).toHaveBeenCalledWith('git', expect.any(Array), {
        silent: true,
        ignoreReturnCode: true,
      });
    });
  });
});
