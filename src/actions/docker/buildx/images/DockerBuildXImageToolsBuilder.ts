import { IDockerBuildXImageTools, IDockerBuildXImageToolsBuilder } from './interfaces';
import { DockerBuildXImageToolsService } from './index';
import { ValidationUtils } from '../../../../libs';

export class DockerBuildXImageToolsBuilder implements IDockerBuildXImageToolsBuilder {
  private command: string = '';
  private useStringList: boolean = false;
  private metadata: Map<string, string[]> = new Map();

  /**
   * Create a new services instance
   * @param command - Optional initial command
   * @returns New services instance
   */
  static create(command?: string): DockerBuildXImageToolsBuilder {
    const builder = new DockerBuildXImageToolsBuilder();
    if (command) {
      builder.withCommand(command);
    }
    return builder;
  }

  /**
   * Create a services pre-configured for the 'create' command
   * @returns Builder instance configured for create operations
   */
  static forCreate(): DockerBuildXImageToolsBuilder {
    return this.create('create');
  }

  /**
   * Create a services pre-configured for the 'inspect' command
   * @returns Builder instance configured for inspect operations
   */
  static forInspect(): DockerBuildXImageToolsBuilder {
    return this.create('inspect');
  }

  /**
   * Create a services pre-configured for the 'prune' command
   * @returns Builder instance configured for prune operations
   */
  static forPrune(): DockerBuildXImageToolsBuilder {
    return this.create('prune');
  }

  withCommand(command: string): this {
    ValidationUtils.validateCommand(command);
    this.command = command.trim();
    return this;
  }

  withStringListOutput(useStringList: boolean): this {
    this.useStringList = useStringList;
    return this;
  }

  addMetaData(key: string = '', value: string): this {
    ValidationUtils.validateMetaDataInput(key, value);

    const existingValues = this.metadata.get(key) || [];
    existingValues.push(value);
    this.metadata.set(key, existingValues);

    return this;
  }

  setMetaData(key: string, values: string | string[]): this {
    const valueArray = Array.isArray(values) ? values : [values];
    valueArray.forEach(value => ValidationUtils.validateMetaDataInput(key, value));
    this.metadata.set(key, [...valueArray]);

    return this;
  }

  withMetaData(metadata: Record<string, string | string[]>): this {
    for (const [key, values] of Object.entries(metadata)) {
      this.setMetaData(key, values);
    }
    return this;
  }

  withTag(tag: string): this {
    return this.addMetaData('--tag', tag);
  }

  withTags(tags: string[]): this {
    tags.forEach(tag => this.withTag(tag));
    return this;
  }

  withFile(file: string): this {
    return this.addMetaData('--file', file);
  }

  withOutput(output: string): this {
    return this.addMetaData('--output', output);
  }

  withPlatform(platform: string): this {
    return this.addMetaData('--platform', platform);
  }

  withPlatforms(platforms: string[]): this {
    platforms.forEach(platform => this.withPlatform(platform));
    return this;
  }

  withAnnotation(key: string, value: string): this {
    return this.addMetaData('--annotation', `${key}=${value}`);
  }

  withAnnotations(annotations: Record<string, string>): this {
    for (const [key, value] of Object.entries(annotations)) {
      this.withAnnotation(key, value);
    }
    return this;
  }

  withSource(source: string): this {
    return this.addMetaData('', source);
  }

  withSources(sources: string[]): this {
    sources.forEach(source => this.withSource(source));
    return this;
  }

  withDryRun(): this {
    return this.addMetaData('--dry-run', '');
  }

  withVerbose(): this {
    return this.addMetaData('--verbose', '');
  }

  reset(): this {
    this.command = '';
    this.useStringList = false;
    this.metadata.clear();
    return this;
  }

  build(): IDockerBuildXImageTools {
    if (!this.command) {
      throw new Error('Command is required. Use withCommand() to set it.');
    }

    const instance = new DockerBuildXImageToolsService(this.command, this.useStringList);

    // Transfer all metadata to the instance
    for (const [key, values] of this.metadata.entries()) {
      instance.setMetaData(key, values);
    }

    return instance;
  }

}
