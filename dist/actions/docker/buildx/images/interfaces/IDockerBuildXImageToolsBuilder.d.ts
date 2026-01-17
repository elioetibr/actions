import { IDockerBuildXImageTools } from './IDockerBuildXImageTools';
export interface IDockerBuildXImageToolsBuilder {
    /**
     * Set the main command for the Docker buildx imagetools operation
     * @param command - The main command (e.g., 'create', 'inspect', 'prune')
     * @returns Builder instance for method chaining
     */
    withCommand(command: string): this;
    /**
     * Enable or disable string list output format
     * @param useStringList - Whether to use string list format
     * @returns Builder instance for method chaining
     */
    withStringListOutput(useStringList: boolean): this;
    /**
     * Add a single metadata entry
     * @param key - The metadata key
     * @param value - The metadata value
     * @returns Builder instance for method chaining
     */
    addMetaData(key: string, value: string): this;
    /**
     * Set metadata for a key (replaces existing values)
     * @param key - The metadata key
     * @param values - The metadata values
     * @returns Builder instance for method chaining
     */
    setMetaData(key: string, values: string | string[]): this;
    /**
     * Add multiple metadata entries from an object
     * @param metadata - Object containing key-value pairs
     * @returns Builder instance for method chaining
     */
    withMetaData(metadata: Record<string, string | string[]>): this;
    /**
     * Add tag metadata (common Docker operation)
     * @param tag - The tag value
     * @returns Builder instance for method chaining
     */
    withTag(tag: string): this;
    /**
     * Add multiple tags
     * @param tags - Array of tag values
     * @returns Builder instance for method chaining
     */
    withTags(tags: string[]): this;
    /**
     * Add file metadata (for Docker operations)
     * @param file - The file path
     * @returns Builder instance for method chaining
     */
    withFile(file: string): this;
    /**
     * Add output metadata (for Docker operations)
     * @param output - The output specification
     * @returns Builder instance for method chaining
     */
    withOutput(output: string): this;
    /**
     * Add platform metadata (for multi-platform builds)
     * @param platform - The platform specification
     * @returns Builder instance for method chaining
     */
    withPlatform(platform: string): this;
    /**
     * Add multiple platforms
     * @param platforms - Array of platform specifications
     * @returns Builder instance for method chaining
     */
    withPlatforms(platforms: string[]): this;
    /**
     * Add annotation metadata
     * @param key - The annotation key
     * @param value - The annotation value
     * @returns Builder instance for method chaining
     */
    withAnnotation(key: string, value: string): this;
    /**
     * Add multiple annotations from an object
     * @param annotations - Object containing annotation key-value pairs
     * @returns Builder instance for method chaining
     */
    withAnnotations(annotations: Record<string, string>): this;
    /**
     * Add a source image for operations like create
     * @param source - The source image specification
     * @returns Builder instance for method chaining
     */
    withSource(source: string): this;
    /**
     * Add multiple source images
     * @param sources - Array of source image specifications
     * @returns Builder instance for method chaining
     */
    withSources(sources: string[]): this;
    /**
     * Enable dry-run mode (adds --dry-run flag)
     * @returns Builder instance for method chaining
     */
    withDryRun(): this;
    /**
     * Enable verbose output (adds --verbose flag)
     * @returns Builder instance for method chaining
     */
    withVerbose(): this;
    /**
     * Reset the services to initial state
     * @returns Builder instance for method chaining
     */
    reset(): this;
    /**
     * Build and return the configured DockerBuildXImageToolsService instance
     * @returns Configured DockerBuildXImageToolsService instance
     * @throws Error if required configuration is missing
     */
    build(): IDockerBuildXImageTools;
}
//# sourceMappingURL=IDockerBuildXImageToolsBuilder.d.ts.map