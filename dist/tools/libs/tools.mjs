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

async function setupToolVersion(agent, toolName, version, versionFile, workingDirectory, resolver, installer) {
  agent.startGroup(`${toolName} version setup`);
  try {
    const spec = await resolver.resolve(
      version,
      versionFile,
      workingDirectory
    );
    if (!spec) {
      agent.info(`${toolName} version: skip (using existing PATH binary)`);
      return;
    }
    agent.info(`${toolName} version: ${spec.resolved} (source: ${spec.source})`);
    const cacheDir = await installer.install(spec.resolved, agent);
    agent.addPath(cacheDir);
  } finally {
    agent.endGroup();
  }
}
function configureSharedIacBuilder(builder, settings) {
  if (Object.keys(settings.variables).length > 0) {
    builder.withVariables(settings.variables);
  }
  if (settings.varFiles.length > 0) {
    builder.withVarFiles(settings.varFiles);
  }
  if (Object.keys(settings.backendConfig).length > 0) {
    builder.withBackendConfigs(settings.backendConfig);
  }
  if (settings.targets.length > 0) {
    builder.withTargets(settings.targets);
  }
  if (settings.autoApprove) {
    builder.withAutoApprove();
  }
  if (settings.planFile) {
    if (settings.command === "apply") {
      builder.withPlanFile(settings.planFile);
    } else if (settings.command === "plan") {
      builder.withOutFile(settings.planFile);
    }
  }
  if (settings.noColor) {
    builder.withNoColor();
  }
  if (settings.compactWarnings) {
    builder.withCompactWarnings();
  }
  if (settings.parallelism) {
    builder.withParallelism(parseInt(settings.parallelism, 10));
  }
  if (settings.lockTimeout) {
    builder.withLockTimeout(settings.lockTimeout);
  }
  if (settings.refresh === "false") {
    builder.withoutRefresh();
  }
  if (settings.reconfigure) {
    builder.withReconfigure();
  }
  if (settings.migrateState) {
    builder.withMigrateState();
  }
  if (settings.dryRun) {
    builder.withDryRun();
  }
  return builder;
}
async function executeIacCommand(agent, toolLabel, service, settings, successFn, failureFn) {
  const commandArgs = service.buildCommand();
  const commandString = service.toString();
  agent.info(`Command: ${commandString}`);
  const baseOutputs = {
    command: settings.command,
    "command-args": JSON.stringify(commandArgs),
    "command-string": commandString
  };
  if (settings.dryRun) {
    agent.info("Dry run mode - skipping execution");
    return successFn({
      ...baseOutputs,
      "exit-code": "0",
      stdout: "",
      stderr: ""
    });
  }
  const result = await agent.exec(commandArgs[0], commandArgs.slice(1), {
    cwd: settings.workingDirectory,
    ignoreReturnCode: true
  });
  const outputs = {
    ...baseOutputs,
    "exit-code": result.exitCode.toString(),
    stdout: result.stdout,
    stderr: result.stderr
  };
  if (result.exitCode !== 0) {
    return failureFn(
      new Error(`${toolLabel} failed with exit code ${result.exitCode}`),
      outputs
    );
  }
  return successFn(outputs);
}

export { RunnerBase as R, configureSharedIacBuilder as c, executeIacCommand as e, setupToolVersion as s };
//# sourceMappingURL=tools.mjs.map
