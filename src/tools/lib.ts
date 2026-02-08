import type { IAgent, IRunner, IRunnerResult, AgentFactory, RunnerFactory } from '../agents/interfaces';
import { createGitHubActionsAgent } from '../agents/github/agent';
import { createDockerImageToolsRunner } from './docker/imagetools/runner';
import { createTerraformRunner } from './terraform/runner';
import { createTerragruntRunner } from './terragrunt/runner';

/**
 * Registry of available agents
 */
const agents: Map<string, AgentFactory> = new Map([
  ['github', createGitHubActionsAgent],
]);

/**
 * Registry of available runners
 */
const runners: Map<string, RunnerFactory> = new Map([
  ['docker/imagetools', createDockerImageToolsRunner],
  ['terraform', createTerraformRunner],
  ['terragrunt', createTerragruntRunner],
]);

/**
 * Get an agent by name
 * @param name - The agent name (e.g., 'github')
 */
export function getAgent(name: string): IAgent {
  const factory = agents.get(name);
  if (!factory) {
    const available = Array.from(agents.keys()).join(', ');
    throw new Error(`Unknown agent '${name}'. Available agents: ${available}`);
  }
  return factory();
}

/**
 * Get a runner by name
 * @param name - The runner name (e.g., 'docker/imagetools')
 */
export function getRunner(name: string): IRunner {
  const factory = runners.get(name);
  if (!factory) {
    const available = Array.from(runners.keys()).join(', ');
    throw new Error(`Unknown runner '${name}'. Available runners: ${available}`);
  }
  return factory();
}

/**
 * Main entry point for running a tool step
 * @param agentName - The agent to use (e.g., 'github')
 * @param runnerName - The runner to use (e.g., 'docker/imagetools')
 * @param step - The step to run (e.g., 'setup', 'command', 'execute')
 * @returns Promise with the runner result
 *
 * @example
 * // In a sub-action's main.mjs:
 * import { run } from '../../../dist/tools/lib.mjs';
 * await run('github', 'docker/imagetools', 'setup');
 */
export async function run(
  agentName: string,
  runnerName: string,
  step: string,
): Promise<IRunnerResult> {
  const agent = getAgent(agentName);
  const runner = getRunner(runnerName);

  agent.debug(`Running ${runnerName}:${step}`);

  const result = await runner.run(agent, step);

  // Set outputs on the agent
  for (const [key, value] of Object.entries(result.outputs)) {
    agent.setOutput(key, value);
  }

  // Handle errors
  if (!result.success && result.error) {
    agent.setFailed(result.error);
  }

  return result;
}

// Export types and utilities
export type { IAgent, IRunner, IRunnerResult, AgentFactory, RunnerFactory } from '../agents/interfaces';
export { RunnerBase } from './common/runner-base';
