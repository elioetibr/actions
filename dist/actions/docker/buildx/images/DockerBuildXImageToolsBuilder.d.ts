import { IDockerBuildXImageTools, IDockerBuildXImageToolsBuilder } from './interfaces';
export declare class DockerBuildXImageToolsBuilder implements IDockerBuildXImageToolsBuilder {
    private command;
    private useStringList;
    private metadata;
    /**
     * Create a new services instance
     * @param command - Optional initial command
     * @returns New services instance
     */
    static create(command?: string): DockerBuildXImageToolsBuilder;
    /**
     * Create a services pre-configured for the 'create' command
     * @returns Builder instance configured for create operations
     */
    static forCreate(): DockerBuildXImageToolsBuilder;
    /**
     * Create a services pre-configured for the 'inspect' command
     * @returns Builder instance configured for inspect operations
     */
    static forInspect(): DockerBuildXImageToolsBuilder;
    /**
     * Create a services pre-configured for the 'prune' command
     * @returns Builder instance configured for prune operations
     */
    static forPrune(): DockerBuildXImageToolsBuilder;
    withCommand(command: string): this;
    withStringListOutput(useStringList: boolean): this;
    addMetaData(key: string | undefined, value: string): this;
    setMetaData(key: string, values: string | string[]): this;
    withMetaData(metadata: Record<string, string | string[]>): this;
    withTag(tag: string): this;
    withTags(tags: string[]): this;
    withFile(file: string): this;
    withOutput(output: string): this;
    withPlatform(platform: string): this;
    withPlatforms(platforms: string[]): this;
    withAnnotation(key: string, value: string): this;
    withAnnotations(annotations: Record<string, string>): this;
    withSource(source: string): this;
    withSources(sources: string[]): this;
    withDryRun(): this;
    withVerbose(): this;
    reset(): this;
    build(): IDockerBuildXImageTools;
}
//# sourceMappingURL=DockerBuildXImageToolsBuilder.d.ts.map