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
  // @ts-ignore
  private required: (keyof IBuildingServiceContainer)[] = [];
  private services: IBuildingServiceContainer = {};

  constructor(context: Context = github.context) {
    this.context = context;
  }

  withGitHubContext(): this {
    this.services.githubContextService = createGitHubContextService(this.context);
    return this;
  }

  // withActionInputs(): this {
  //     this.services.actionInputsService = createActionInputsService();
  //     return this;
  // }
  //
  // withSemanticVersion(): this {
  //     // Ensure actionInputsService exists and can be used as ISemVerProvider
  //     if (!this.services.actionInputsService) {
  //         throw new Error('Inputs must be built before SemanticVersionService');
  //     }
  //
  //     // Cast to Inputs since we know it implements ISemVerProvider
  //     const semVerProvider = this.services.actionInputsService as ActionInputsService;
  //     this.services.semanticVersionService = createSemVerService(semVerProvider);
  //     return this;
  // }
  //
  // withDockerImageUri(): this {
  //     if (
  //         !this.services.githubContextService ||
  //         !this.services.actionInputsService ||
  //         !this.services.semanticVersionService
  //     ) {
  //         throw new Error(
  //             'Docker Image URI service requires GitHub context, action inputs, and semantic version services'
  //         );
  //     }
  //
  //     // Cast to concrete types that implement the required interfaces
  //     const branchProvider = this.services.githubContextService as GithubContext;
  //     const ecrProvider = this.services.actionInputsService as ActionInputsService;
  //     const versionProvider = this.services.semanticVersionService as SemanticVersionService;
  //
  //     this.services.dockerImageUriService = createDockerImageUriService(
  //         ecrProvider,
  //         branchProvider,
  //         versionProvider
  //     );
  //     return this;
  // }
  //
  // withManifestIndex(): this {
  //     if (
  //         !this.services.actionInputsService ||
  //         !this.services.semanticVersionService ||
  //         !this.services.dockerImageUriService
  //     ) {
  //         throw new Error(
  //             'Manifest Index service requires action inputs, semantic version, and docker image URI services'
  //         );
  //     }
  //
  //     // Cast to concrete types that implement the required interfaces
  //     const inputsProvider = this.services.actionInputsService as ActionInputsService;
  //     const versionProvider = this.services.semanticVersionService as SemanticVersionService;
  //     const imageUriProvider = this.services.dockerImageUriService as DockerImageService;
  //
  //     this.services.dockerManifestIndexService = createDockerManifestIndexService(
  //         inputsProvider,
  //         versionProvider,
  //         imageUriProvider
  //     );
  //     return this;
  // }
  //
  // withDockerManifestHandler(): this {
  //     if (!this.services.dockerManifestIndexService) {
  //         throw new Error('Docker Manifest Handler requires Manifest Index service');
  //     }
  //
  //     // Cast to ManifestIndex since we know it implements IDockerManifestProvider
  //     const inputsProvider = this.services.actionInputsService as ActionInputsService;
  //     const manifestProvider = this.services.dockerManifestIndexService
  //         .manifestIndex as DockerManifestIndex;
  //     this.services.dockerManifestHandler = createDockerManifestHandlerService(
  //         manifestProvider,
  //         inputsProvider
  //     );
  //     return this;
  // }
  //
  // withActionOutputs(): this {
  //     // Fixed: Added missing ! operator for dockerImageUriService
  //     if (
  //         !this.services.actionInputsService ||
  //         !this.services.dockerManifestIndexService ||
  //         !this.services.semanticVersionService ||
  //         !this.services.dockerImageUriService
  //     ) {
  //         throw new Error(
  //             'Action Outputs service requires all prerequisite services: inputs, manifest index, semantic version, and docker image URI'
  //         );
  //     }
  //
  //     // Get the required providers
  //     const inputsProvider = this.services.actionInputsService as ActionInputsService;
  //     const versionProvider = this.services.semanticVersionService as SemanticVersionService;
  //     const imageUriProvider = this.services.dockerImageUriService as DockerImageService;
  //     const manifestProvider = this.services.dockerManifestIndexService
  //         .manifestIndex as DockerManifestIndex;
  //
  //     // Fixed: Corrected parameter order to match createActionOutputsService signature
  //     // Based on your original output.ts: (inputsProvider, versionProvider, imageUriProvider, manifestProvider)
  //     this.services.actionOutputsService = createActionOutputsService(
  //         inputsProvider,
  //         versionProvider,
  //         imageUriProvider,
  //         manifestProvider
  //     );
  //     return this;
  // }

  // Build all services in correct order
  buildAll(): IServiceContainer {
    return (
      this.withGitHubContext()
        // .withActionInputs()
        // .withSemanticVersion()
        // .withDockerImageUri()
        // .withManifestIndex()
        // .withDockerManifestHandler()
        // .withActionOutputs()
        .build()
    );
  }

  build(): IServiceContainer {
    const required: (keyof IBuildingServiceContainer)[] = [
      'githubContextService',
      // 'actionInputsService',
      // 'actionOutputsService',
      'semanticVersionService',
      // 'dockerImageUriService',
      // 'dockerManifestIndexService',
      // 'dockerManifestHandler'
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
