import type { IAgent, IExecResult } from '../../../agents';
import { CommitLogParser } from '../parsers/CommitLogParser';
import type { ICommitEntry } from '../parsers/CommitLogParser';

/**
 * Interface for git operations needed by PullRequester.
 */
export interface IGitService {
  /** Check if working tree has uncommitted changes */
  hasChanges(): Promise<boolean>;
  /** Get list of changed files, optionally filtered by paths */
  getChangedFiles(addPaths?: string[]): Promise<string[]>;
  /** Create and checkout a new branch */
  createBranch(name: string, base?: string): Promise<void>;
  /** Stage and commit changes, returns the commit SHA */
  commitChanges(message: string, author?: string, signoff?: boolean): Promise<string>;
  /** Push a branch to the remote */
  pushBranch(branch: string, force?: boolean): Promise<void>;
  /** Check if branch has diff compared to base */
  hasDiffWithBase(branch: string, base: string): Promise<boolean>;
  /** Check if collaborators (non-bot) have pushed commits to the branch */
  hasCollaboratorCommits(branch: string, base: string, botEmail: string): Promise<boolean>;
  /** Check if merging branch into base would produce conflicts (read-only) */
  hasConflictsWithBase(branch: string, base: string): Promise<boolean>;
  /** Get commit log between base and head */
  getCommitLog(base: string, head?: string): Promise<ICommitEntry[]>;
  /** Configure git credentials for push */
  configureCredentials(token: string): Promise<void>;
  /** Configure git user for commits */
  configureUser(name: string, email: string): Promise<void>;
}

/**
 * Git operations service using IAgent for command execution.
 */
export class GitService implements IGitService {
  constructor(private readonly agent: IAgent) {}

  /**
   * Run a git command and return the structured result.
   * Uses IAgent.exec which delegates to @actions/exec (execFile, not shell).
   */
  private async git(args: string[]): Promise<IExecResult> {
    // IAgent.exec — safe via @actions/exec (execFile, not shell)
    return this.agent.exec('git', args, {
      silent: true,
      ignoreReturnCode: true,
    });
  }

  async hasChanges(): Promise<boolean> {
    const result = await this.git(['status', '--porcelain']);
    return result.stdout.length > 0;
  }

  async getChangedFiles(addPaths?: string[]): Promise<string[]> {
    const result = await this.git(['status', '--porcelain']);
    if (!result.stdout) return [];

    let files = result.stdout
      .split('\n')
      .map(line => line.substring(3).trim())
      .filter(f => f.length > 0);

    if (addPaths && addPaths.length > 0) {
      files = files.filter(f => addPaths.some(p => f.startsWith(p) || f === p));
    }

    return files;
  }

  async createBranch(name: string, base?: string): Promise<void> {
    if (base) {
      await this.git(['checkout', '-B', name, base]);
    } else {
      await this.git(['checkout', '-B', name]);
    }
  }

  async commitChanges(message: string, author?: string, signoff?: boolean): Promise<string> {
    await this.git(['add', '-A']);

    const args = ['commit', '-m', message];
    if (author) args.push('--author', author);
    if (signoff) args.push('--signoff');

    await this.git(args);

    // Return the SHA of the new commit
    const result = await this.git(['rev-parse', 'HEAD']);
    return result.stdout;
  }

  async pushBranch(branch: string, force?: boolean): Promise<void> {
    const args = ['push', 'origin', branch];
    if (force) args.push('--force-with-lease');
    await this.git(args);
  }

  async hasDiffWithBase(branch: string, base: string): Promise<boolean> {
    const result = await this.git(['diff', `${base}...${branch}`, '--name-only']);
    return result.stdout.length > 0;
  }

  async hasCollaboratorCommits(branch: string, base: string, botEmail: string): Promise<boolean> {
    // Get all commit author emails on the branch since it diverged from base
    const result = await this.git(['log', `${base}..${branch}`, '--format=%ae']);
    if (!result.stdout) return false;

    const authors = result.stdout
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0);
    // If any author is not the bot, there are collaborator commits
    return authors.some(email => email !== botEmail);
  }

  async hasConflictsWithBase(branch: string, base: string): Promise<boolean> {
    // git merge-tree --write-tree is read-only (git 2.38+)
    // Exit code 0 = clean merge, exit code 1 = conflicts
    const result = await this.git(['merge-tree', '--write-tree', base, branch]);
    return result.exitCode !== 0;
  }

  async getCommitLog(base: string, head?: string): Promise<ICommitEntry[]> {
    const range = head ? `${base}..${head}` : `${base}..HEAD`;
    const result = await this.git(['log', range, '--format=%H%x00%s%x00%b%x00']);
    return CommitLogParser.parseRawLog(result.stdout);
  }

  async configureCredentials(token: string): Promise<void> {
    const encodedToken = Buffer.from(`x-access-token:${token}`).toString('base64');
    await this.git([
      'config',
      '--local',
      'http.https://github.com/.extraheader',
      `AUTHORIZATION: basic ${encodedToken}`,
    ]);
  }

  async configureUser(name: string, email: string): Promise<void> {
    await this.git(['config', '--local', 'user.name', name]);
    await this.git(['config', '--local', 'user.email', email]);
  }
}
