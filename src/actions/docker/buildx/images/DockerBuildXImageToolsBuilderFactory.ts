import { IDockerBuildXImageTools } from './interfaces';
import { DockerBuildXImageToolsBuilder } from './DockerBuildXImageToolsBuilder';

// Convenience factory functions
export class DockerBuildXImageToolsFactory {
  /**
   * Create a new services for Docker buildx imagetools operations
   * @param command - Optional initial command
   * @returns New services instance
   */
  static builder(command?: string): DockerBuildXImageToolsBuilder {
    return DockerBuildXImageToolsBuilder.create(command);
  }

  /**
   * Create a pre-configured instance for creating multi-platform manifests
   * @param tag - The tag for the manifest
   * @param sources - Source images to include in the manifest
   * @returns Configured DockerBuildXImageToolsService instance
   */
  static createManifest(tag: string, sources: string[]): IDockerBuildXImageTools {
    return DockerBuildXImageToolsBuilder.forCreate().withTag(tag).withSources(sources).build();
  }

  /**
   * Create a pre-configured instance for inspecting images
   * @param image - The image to inspect
   * @returns Configured DockerBuildXImageToolsService instance
   */
  static inspectImage(image: string): IDockerBuildXImageTools {
    return DockerBuildXImageToolsBuilder.forInspect().withSource(image).build();
  }

  /**
   * Create a pre-configured instance for pruning build cache
   * @returns Configured DockerBuildXImageToolsService instance
   */
  static pruneCache(): IDockerBuildXImageTools {
    return DockerBuildXImageToolsBuilder.forPrune().build();
  }
}
