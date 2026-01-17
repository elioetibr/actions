import { IDockerBuildXImageTools } from './interfaces';
import { DockerBuildXImageToolsBuilder } from './DockerBuildXImageToolsBuilder';
export declare class DockerBuildXImageToolsFactory {
    /**
     * Create a new services for Docker buildx imagetools operations
     * @param command - Optional initial command
     * @returns New services instance
     */
    static builder(command?: string): DockerBuildXImageToolsBuilder;
    /**
     * Create a pre-configured instance for creating multi-platform manifests
     * @param tag - The tag for the manifest
     * @param sources - Source images to include in the manifest
     * @returns Configured DockerBuildXImageToolsService instance
     */
    static createManifest(tag: string, sources: string[]): IDockerBuildXImageTools;
    /**
     * Create a pre-configured instance for inspecting images
     * @param image - The image to inspect
     * @returns Configured DockerBuildXImageToolsService instance
     */
    static inspectImage(image: string): IDockerBuildXImageTools;
    /**
     * Create a pre-configured instance for pruning build cache
     * @returns Configured DockerBuildXImageToolsService instance
     */
    static pruneCache(): IDockerBuildXImageTools;
}
//# sourceMappingURL=DockerBuildXImageToolsBuilderFactory.d.ts.map