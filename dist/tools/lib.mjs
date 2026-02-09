import { d as createGitHubActionsAgent } from './libs/agents.mjs';
import { c as createDockerImageToolsRunner } from './libs/docker-buildx-images.mjs';
import { j as createTerraformRunner } from './libs/terraform.mjs';
import { c as createTerragruntRunner } from './libs/terragrunt.mjs';
export { R as RunnerBase } from './libs/tools.mjs';

const agents = /* @__PURE__ */ new Map([
  ["github", createGitHubActionsAgent]
]);
const runners = /* @__PURE__ */ new Map([
  ["docker/imagetools", createDockerImageToolsRunner],
  ["terraform", createTerraformRunner],
  ["terragrunt", createTerragruntRunner]
]);
function getAgent(name) {
  const factory = agents.get(name);
  if (!factory) {
    const available = Array.from(agents.keys()).join(", ");
    throw new Error(`Unknown agent '${name}'. Available agents: ${available}`);
  }
  return factory();
}
function getRunner(name) {
  const factory = runners.get(name);
  if (!factory) {
    const available = Array.from(runners.keys()).join(", ");
    throw new Error(`Unknown runner '${name}'. Available runners: ${available}`);
  }
  return factory();
}
async function run(agentName, runnerName, step) {
  const agent = getAgent(agentName);
  const runner = getRunner(runnerName);
  agent.debug(`Running ${runnerName}:${step}`);
  const result = await runner.run(agent, step);
  for (const [key, value] of Object.entries(result.outputs)) {
    agent.setOutput(key, value);
  }
  if (!result.success && result.error) {
    agent.setFailed(result.error);
  }
  return result;
}

export { getAgent, getRunner, run };
//# sourceMappingURL=lib.mjs.map
