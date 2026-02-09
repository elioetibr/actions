class RunnerBase {
  /**
   * Run a specific step of the tool
   * @param agent - The CI/CD agent
   * @param step - The step to run
   * @returns Promise with the runner result
   */
  async run(agent, step) {
    const stepFn = this.steps.get(step);
    if (!stepFn) {
      const availableSteps = Array.from(this.steps.keys()).join(", ");
      const error = new Error(
        `Unknown step '${step}' for runner '${this.name}'. Available steps: ${availableSteps}`
      );
      return {
        success: false,
        outputs: {},
        error
      };
    }
    try {
      return await stepFn(agent);
    } catch (error) {
      return {
        success: false,
        outputs: {},
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  /**
   * Helper to create a successful result
   * @param outputs - The outputs to include
   */
  success(outputs) {
    return {
      success: true,
      outputs
    };
  }
  /**
   * Helper to create a failed result
   * @param error - The error that caused the failure
   * @param outputs - Optional partial outputs
   */
  failure(error, outputs = {}) {
    return {
      success: false,
      outputs,
      error: error instanceof Error ? error : new Error(error)
    };
  }
}

export { RunnerBase as R };
//# sourceMappingURL=tools.mjs.map
