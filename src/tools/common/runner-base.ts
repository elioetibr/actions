import type { IAgent, IRunner, IRunnerResult } from '../../agents/interfaces';

/**
 * Abstract base class for tool runners
 * Provides common functionality and enforces the runner contract
 */
export abstract class RunnerBase implements IRunner {
  abstract readonly name: string;

  /**
   * Map of available steps and their implementations
   */
  protected abstract readonly steps: Map<string, (agent: IAgent) => Promise<IRunnerResult>>;

  /**
   * Run a specific step of the tool
   * @param agent - The CI/CD agent
   * @param step - The step to run
   * @returns Promise with the runner result
   */
  async run(agent: IAgent, step: string): Promise<IRunnerResult> {
    const stepFn = this.steps.get(step);

    if (!stepFn) {
      const availableSteps = Array.from(this.steps.keys()).join(', ');
      const error = new Error(
        `Unknown step '${step}' for runner '${this.name}'. Available steps: ${availableSteps}`,
      );
      return {
        success: false,
        outputs: {},
        error,
      };
    }

    try {
      return await stepFn(agent);
    } catch (error) {
      return {
        success: false,
        outputs: {},
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Helper to create a successful result
   * @param outputs - The outputs to include
   */
  protected success(outputs: Record<string, string | number | boolean>): IRunnerResult {
    return {
      success: true,
      outputs,
    };
  }

  /**
   * Helper to create a failed result
   * @param error - The error that caused the failure
   * @param outputs - Optional partial outputs
   */
  protected failure(
    error: Error | string,
    outputs: Record<string, string | number | boolean> = {},
  ): IRunnerResult {
    return {
      success: false,
      outputs,
      error: error instanceof Error ? error : new Error(error),
    };
  }
}
