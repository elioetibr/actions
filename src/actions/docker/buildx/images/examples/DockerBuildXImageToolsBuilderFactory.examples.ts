// Example usage and demonstration
import { IDockerBuildXImageTools } from '../interfaces';
import { DockerBuildXImageToolsFactory } from '../DockerBuildXImageToolsBuilderFactory';

export class DockerBuildXImageToolsBuilderFactoryExamples {
  /**
   * Example: Creating a multi-platform manifest
   */
  static createMultiPlatformManifest(): IDockerBuildXImageTools {
    return DockerBuildXImageToolsFactory.builder('create')
      .withTag('myapp:latest')
      .withSources(['myapp:linux-amd64', 'myapp:linux-arm64', 'myapp:linux-arm'])
      .withAnnotations({
        'org.opencontainers.image.title': 'My Application',
        'org.opencontainers.image.description': 'A sample multi-platform application',
      })
      .withStringListOutput(true)
      .withVerbose()
      .build();
  }

  /**
   * Example: Inspecting an image with verbose output
   */
  static inspectImageVerbose(): IDockerBuildXImageTools {
    return DockerBuildXImageToolsFactory.builder('inspect')
      .withSource('nginx:latest')
      .withVerbose()
      .build();
  }

  /**
   * Example: Creating manifest with custom metadata
   */
  static createWithMetadata(): IDockerBuildXImageTools {
    return DockerBuildXImageToolsFactory.builder('create')
      .withTag('myapp:v1.0.0')
      .withSources(['myapp:amd64', 'myapp:arm64'])
      .withMetaData({
        '--annotation': ['index:org.opencontainers.image.version=1.0.0'],
        '--file': ['manifest.yaml'],
      })
      .withPlatforms(['linux/amd64', 'linux/arm64'])
      .build();
  }

  /**
   * Example: Dry run creation
   */
  static dryRunCreate(): IDockerBuildXImageTools {
    return DockerBuildXImageToolsFactory.builder('create')
      .withTag('test:latest')
      .withSource('test:base')
      .withDryRun()
      .build();
  }
}
