/**
 * Interface for CI/CD agent adapters (GitHub Actions, GitLab CI, etc.)
 */
export interface IAgent {
  /**
   * Get an input value
   * @param name - The input name
   * @param required - Whether the input is required
   */
  getInput(name: string, required?: boolean): string;

  /**
   * Get a boolean input value
   * @param name - The input name
   * @param required - Whether the input is required
   */
  getBooleanInput(name: string, required?: boolean): boolean;

  /**
   * Get a multiline input value
   * @param name - The input name
   * @param required - Whether the input is required
   */
  getMultilineInput(name: string, required?: boolean): string[];

  /**
   * Set an output value
   * @param name - The output name
   * @param value - The output value
   */
  setOutput(name: string, value: string | number | boolean): void;

  /**
   * Log an info message
   * @param message - The message to log
   */
  info(message: string): void;

  /**
   * Log a warning message
   * @param message - The message to log
   */
  warning(message: string): void;

  /**
   * Log an error message
   * @param message - The message or error to log
   */
  error(message: string | Error): void;

  /**
   * Log a debug message
   * @param message - The message to log
   */
  debug(message: string): void;

  /**
   * Mark the action as failed
   * @param message - The failure message or error
   */
  setFailed(message: string | Error): void;

  /**
   * Start a log group
   * @param name - The group name
   */
  startGroup(name: string): void;

  /**
   * End a log group
   */
  endGroup(): void;

  /**
   * Execute a command
   * @param command - The command to execute
   * @param args - Command arguments
   * @param options - Execution options
   * @returns Promise with exit code and output
   */
  exec(
    command: string,
    args?: string[],
    options?: IExecOptions,
  ): Promise<IExecResult>;
}

/**
 * Options for command execution
 */
export interface IExecOptions {
  cwd?: string;
  env?: Record<string, string>;
  silent?: boolean;
  ignoreReturnCode?: boolean;
}

/**
 * Result of command execution
 */
export interface IExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Result of a runner operation
 */
export interface IRunnerResult {
  success: boolean;
  outputs: Record<string, string | number | boolean>;
  error?: Error;
}

/**
 * Interface for tool runners
 */
export interface IRunner {
  /**
   * The name of the tool
   */
  readonly name: string;

  /**
   * Run a specific step of the tool
   * @param agent - The CI/CD agent
   * @param step - The step to run (e.g., 'setup', 'command', 'execute')
   * @returns Promise with the runner result
   */
  run(agent: IAgent, step: string): Promise<IRunnerResult>;
}

/**
 * Factory function type for creating agents
 */
export type AgentFactory = () => IAgent;

/**
 * Factory function type for creating runners
 */
export type RunnerFactory = () => IRunner;

/**
 * Registry for agents and runners
 */
export interface IRegistry {
  agents: Map<string, AgentFactory>;
  runners: Map<string, RunnerFactory>;
}
