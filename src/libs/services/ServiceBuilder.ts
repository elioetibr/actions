import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { createGitHubContextService } from './github/context/services';
import { IGitHubContextService } from './github';
import { ISemanticVersionService } from './version';

interface IBuildingServiceContainer {
  githubContextService?: IGitHubContextService;
  // actionInputsService?: IActionInputsService;
  // actionOutputsService?: IActionOutputsService;
  semanticVersionService?: ISemanticVersionService;
  // dockerImageUriService?: IDockerImageUriService;
  // dockerManifestIndexService?: IDockerManifestIndexService;
  // dockerManifestHandler?: IDockerManifestHandlerService;
}

// Update your IServiceContainer interface to include:
export interface IServiceContainer {
  readonly githubContextService: IGitHubContextService;
  // readonly actionInputsService: IActionInputsService;
  // readonly actionOutputsService: IActionOutputsService;
  readonly semanticVersionService: ISemanticVersionService;
  // readonly dockerImageUriService: IDockerImageUriService;
  // readonly dockerManifestIndexService: IDockerManifestIndexService;
  // readonly dockerManifestHandler: IDockerManifestHandlerService;
}

export class ServiceBuilder {
  private readonly context: Context;
  private services: IBuildingServiceContainer = {};

  constructor(context: Context = github.context) {
    this.context = context;
  }

  withGitHubContext(): this {
    this.services.githubContextService = createGitHubContextService(this.context);
    return this;
  }

  // Build all services in correct order
  buildAll(): IServiceContainer {
    return this.withGitHubContext().build();
  }

  build(): IServiceContainer {
    const required: (keyof IBuildingServiceContainer)[] = [
      'githubContextService',
      'semanticVersionService',
    ];

    const missing = required.filter(service => !this.services[service]);

    if (missing.length > 0) {
      throw new Error(`Missing required services: ${missing.join(', ')}`);
    }

    // Type assertion is safe here because we've validated all required services exist
    return this.services as IServiceContainer;
  }
}

// Usage
export function createServices(context: Context = github.context): IServiceContainer {
  return new ServiceBuilder(context).buildAll();
}
