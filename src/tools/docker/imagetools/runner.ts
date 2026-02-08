import type { IAgent, IRunnerResult } from '../../../agents/interfaces';
import { RunnerBase } from '../../common/runner-base';
import { DockerBuildXImageToolsBuilder } from '../../../actions/docker/buildx/images/DockerBuildXImageToolsBuilder';
import { SemanticVersionBuilder } from '../../../libs/services/version/builders/SemanticVersionBuilder';
import {
  getSettings,
  buildImageUri,
  buildArchTags,
  type IImageToolsSettings,
  type IVersionInfo,
} from './settings';

/**
 * Docker BuildX ImageTools runner
 * Handles setup, command generation, and execution for creating multi-arch manifests
 */
export class DockerImageToolsRunner extends RunnerBase {
  readonly name = 'docker/imagetools';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['setup', this.setup.bind(this)],
    ['command', this.command.bind(this)],
    ['execute', this.execute.bind(this)],
  ]);

  /**
   * Setup step: Validate inputs and parse metadata
   * Outputs: validated, amd64Tags, arm64Tags, manifestTags, annotations, semVer components, imageUri
   */
  private async setup(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      // Parse semantic version
      const versionInfo = this.parseVersion(settings.semVer);

      // Build image URI
      const imageUri = buildImageUri(settings.ecrRegistry, settings.ecrRepository);

      // Build architecture tags
      const amd64Tags = buildArchTags(
        settings.ecrRegistry,
        settings.ecrRepository,
        settings.amd64MetaTags,
      );
      const arm64Tags = buildArchTags(
        settings.ecrRegistry,
        settings.ecrRepository,
        settings.arm64MetaTags,
      );
      const manifestTags = buildArchTags(
        settings.ecrRegistry,
        settings.ecrRepository,
        settings.manifestMetaTags,
      );

      // Convert annotations to string for output
      const annotationsStr = Object.entries(settings.manifestMetaAnnotations)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

      return this.success({
        validated: true,
        ecrRegistry: settings.ecrRegistry,
        ecrRepository: settings.ecrRepository,
        amd64Tags: amd64Tags.join(','),
        arm64Tags: arm64Tags.join(','),
        manifestTags: manifestTags.join(','),
        annotations: annotationsStr,
        imageUri,
        dryRun: settings.dryRun,
        // Version components
        fullVersion: versionInfo.semVer,
        version: versionInfo.version,
        major: versionInfo.major,
        minor: versionInfo.minor,
        patch: versionInfo.patch,
        versionSuffix: versionInfo.semVerSuffix,
      });
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Command step: Build the docker buildx imagetools command without executing
   * Outputs: command, commandArray, multilineCommand, buildXArgs
   */
  private async command(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      // Build the service
      const service = this.buildService(settings);

      // Get command components
      const commandArray = service.buildCommand();
      const command = commandArray.join(' ');
      const multilineCommand = service.toStringMultiLineCommand();
      const buildXArgs = service.toCommandArgs().join(' ');

      return this.success({
        command,
        commandArray: JSON.stringify(commandArray),
        multilineCommand,
        buildXArgs,
      });
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Execute step: Build and run the docker command
   * Outputs: exitCode, stdout, imageUri, command
   */
  private async execute(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      // Build the service
      const service = this.buildService(settings);

      // Get command components
      const commandArray = service.buildCommand();
      const [executable, ...args] = commandArray;

      if (!executable) {
        return this.failure('No executable found in command array');
      }

      // Log the command
      agent.startGroup('Docker BuildX ImageTools Command');
      agent.info(service.toStringMultiLineCommand());
      agent.endGroup();

      // Execute the command
      agent.info('Executing docker buildx imagetools create...');
      const result = await agent.exec(executable, args, {
        ignoreReturnCode: true,
      });

      // Build image URI
      const imageUri = buildImageUri(
        settings.ecrRegistry,
        settings.ecrRepository,
        settings.manifestMetaTags[0],
      );

      if (result.exitCode !== 0) {
        agent.error(`Command failed with exit code ${result.exitCode}`);
        if (result.stderr) {
          agent.error(result.stderr);
        }
        return this.failure(
          new Error(`Docker buildx imagetools failed with exit code ${result.exitCode}`),
          {
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
            imageUri,
            command: commandArray.join(' '),
          },
        );
      }

      agent.info('Docker buildx imagetools create completed successfully');

      return this.success({
        exitCode: result.exitCode,
        stdout: result.stdout,
        imageUri,
        command: commandArray.join(' '),
      });
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Parse version string into components
   */
  private parseVersion(semVer: string): IVersionInfo {
    const service = SemanticVersionBuilder.fromVersion(semVer).build();
    return {
      semVer: service.semVer,
      major: service.major,
      minor: service.minor,
      patch: service.patch,
      version: service.version,
      majorMinor: service.semVerInfo.majorMinor,
      majorMinorPatch: service.semVerInfo.majorMinorPatch,
      semVerSuffix: service.semVerSuffix,
    };
  }

  /**
   * Build the Docker BuildX ImageTools service
   */
  private buildService(settings: IImageToolsSettings) {
    const builder = DockerBuildXImageToolsBuilder.forCreate().withStringListOutput(true);

    // Add source images (AMD64 and ARM64)
    const amd64Tags = buildArchTags(
      settings.ecrRegistry,
      settings.ecrRepository,
      settings.amd64MetaTags,
    );
    const arm64Tags = buildArchTags(
      settings.ecrRegistry,
      settings.ecrRepository,
      settings.arm64MetaTags,
    );

    builder.withSources([...amd64Tags, ...arm64Tags]);

    // Add manifest tags
    const manifestTags = buildArchTags(
      settings.ecrRegistry,
      settings.ecrRepository,
      settings.manifestMetaTags,
    );
    builder.withTags(manifestTags);

    // Add annotations
    builder.withAnnotations(settings.manifestMetaAnnotations);

    // Add dry-run if enabled
    if (settings.dryRun) {
      builder.withDryRun();
    }

    return builder.build();
  }
}

/**
 * Factory function to create a Docker ImageTools runner
 */
export function createDockerImageToolsRunner(): DockerImageToolsRunner {
  return new DockerImageToolsRunner();
}
