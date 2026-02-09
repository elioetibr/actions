import * as core from '@actions/core';
import * as exec from '@actions/exec';
import type { IAgent, IExecOptions, IExecResult } from '../interfaces';

/**
 * GitHub Actions agent adapter
 * Implements the IAgent interface using @actions/core and @actions/exec
 */
export class GitHubActionsAgent implements IAgent {
  getInput(name: string, required = false): string {
    return core.getInput(name, { required });
  }

  getBooleanInput(name: string, required = false): boolean {
    return core.getBooleanInput(name, { required });
  }

  getMultilineInput(name: string, required = false): string[] {
    return core.getMultilineInput(name, { required });
  }

  setOutput(name: string, value: string | number | boolean): void {
    core.setOutput(name, value);
  }

  info(message: string): void {
    core.info(message);
  }

  warning(message: string): void {
    core.warning(message);
  }

  error(message: string | Error): void {
    core.error(message);
  }

  debug(message: string): void {
    core.debug(message);
  }

  setFailed(message: string | Error): void {
    core.setFailed(message);
  }

  startGroup(name: string): void {
    core.startGroup(name);
  }

  endGroup(): void {
    core.endGroup();
  }

  async exec(
    command: string,
    args: string[] = [],
    options: IExecOptions = {},
  ): Promise<IExecResult> {
    let stdout = '';
    let stderr = '';

    const execOptions: exec.ExecOptions = {
      cwd: options.cwd,
      env: options.env,
      silent: options.silent,
      ignoreReturnCode: options.ignoreReturnCode ?? true,
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
        },
      },
    };

    const exitCode = await exec.exec(command, args, execOptions);

    return {
      exitCode,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  }
}

/**
 * Factory function to create a GitHub Actions agent
 */
export function createGitHubActionsAgent(): IAgent {
  return new GitHubActionsAgent();
}
