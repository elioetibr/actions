import { t as createGitHubActionsAgent } from "./libs/agents.mjs";
import { p as RunnerBase, t as createDeploymentGateRunner } from "./libs/deployment-gate.mjs";
import { t as createDockerImageToolsRunner } from "./libs/docker-buildx-images.mjs";
import { t as createTerraformRunner } from "./libs/terraform.mjs";
import { t as createTerragruntRunner } from "./libs/terragrunt.mjs";
import { t as createPullRequesterRunner } from "./libs/pullrequester.mjs";
import { t as createSummarizeRunner } from "./libs/summarize.mjs";
//#region src/tools/lib.ts
/**
* Registry of available agents
*/
var agents = new Map([["github", createGitHubActionsAgent]]);
/**
* Registry of available runners
*/
var runners = new Map([
	["docker/imagetools", createDockerImageToolsRunner],
	["terraform", createTerraformRunner],
	["terragrunt", createTerragruntRunner],
	["deployment-gate", createDeploymentGateRunner],
	["summarize", createSummarizeRunner],
	["pullrequester", createPullRequesterRunner]
]);
/**
* Get an agent by name
* @param name - The agent name (e.g., 'github')
*/
function getAgent(name) {
	const factory = agents.get(name);
	if (!factory) {
		const available = Array.from(agents.keys()).join(", ");
		throw new Error(`Unknown agent '${name}'. Available agents: ${available}`);
	}
	return factory();
}
/**
* Get a runner by name
* @param name - The runner name (e.g., 'docker/imagetools')
*/
function getRunner(name) {
	const factory = runners.get(name);
	if (!factory) {
		const available = Array.from(runners.keys()).join(", ");
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
async function run(agentName, runnerName, step) {
	const agent = getAgent(agentName);
	const runner = getRunner(runnerName);
	agent.debug(`Running ${runnerName}:${step}`);
	const result = await runner.run(agent, step);
	for (const [key, value] of Object.entries(result.outputs)) agent.setOutput(key, value);
	if (!result.success && result.error) agent.setFailed(result.error);
	return result;
}
//#endregion
export { RunnerBase, getAgent, getRunner, run };

//# sourceMappingURL=lib.mjs.map