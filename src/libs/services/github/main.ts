// main.ts
import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { catchErrorAndSetFailed } from '../../utils';
import { IServiceContainer, createServices } from '../ServiceBuilder';

// Main action runner with Single Responsibility
export class ActionRunner {
  constructor(private readonly services: IServiceContainer) {}

  async run(): Promise<void> {
    try {
      core.info('⭐ Starting Action Runner...');
      core.info(`❓ Debug is Enabled: ${JSON.stringify(core.isDebug())}`);
      core.info(`❓ Debug is Enabled: ${JSON.stringify(this.services, null, 2)}`);

      // const dockerService = this.services.dockerManifestHandler;
      //
      // // Execute docker operations
      // await dockerService.showImages();
      // await dockerService.removeManifestIfExists();
      // await dockerService.pullImages();
      // await dockerService.createManifestIndex();
      // await dockerService.inspectManifest();
      //
      // // Future: Add output service here
      // const outputsService = this.services.actionOutputsService;
      // outputsService.setOutputs();
    } catch (error) {
      catchErrorAndSetFailed(error);
    }
  }
}

// Application entry point with dependency injection using ServiceBuilder
export function run(
  context: Context = github.context,
  servicesContainer?: IServiceContainer,
): Promise<void> {
  // Use provided services or create new ones with ServiceBuilder
  const services = servicesContainer || createServices(context);

  const runner = new ActionRunner(services);
  return runner.run();
}
