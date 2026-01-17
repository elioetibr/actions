import { CommandFormatter, IStringListProvider } from '../../../../../libs';
import { IDockerBuildXImageTools } from '../interfaces';
import { IDockerBuildXImageToolsProvider } from '../providers';
import { MetaDataManager } from './MetaDataManager';
import { CommandBuilder } from './CommandBuilder';
import { StringFormatter } from './StringFormatter';

export class DockerBuildXImageToolsService
  implements IDockerBuildXImageTools, IDockerBuildXImageToolsProvider, IStringListProvider
{
  readonly command: string;
  readonly executor: string = 'docker';
  readonly subCommands: string[] = ['buildx', 'imagetools'];
  private readonly _useStringList: boolean = false;
  private readonly metaDataManager: MetaDataManager;
  private readonly commandBuilder: CommandBuilder;
  private readonly stringFormatter: StringFormatter;

  constructor(command: string, useStringList: boolean = false) {
    this.command = command;
    this._useStringList = useStringList;
    this.metaDataManager = new MetaDataManager();
    this.commandBuilder = new CommandBuilder(this.executor, this.subCommands, this.command, this.metaDataManager);
    this.stringFormatter = new StringFormatter(
      this.constructor.name,
      this.command,
      this.executor,
      this.subCommands,
      this._useStringList,
      this.metaDataManager
    );
  }

  get useStringList(): boolean {
    return this._useStringList;
  }

  get metaData(): Map<string, string[]> {
    return this.metaDataManager.getAllMetaData();
  }

  /**
   * Add a single key-value pair to metadata
   * @param key - The metadata key (defaults to empty string)
   * @param value - The metadata value
   * @returns this instance for method chaining
   * @throws Error if key or value is invalid
   */
  addMetaData(key: string = '', value: string): this {
    this.metaDataManager.addMetaData(key, value);
    return this;
  }

  /**
   * Set metadata for a key, replacing any existing values
   * @param key - The metadata key
   * @param values - The metadata values (can be single value or array)
   * @returns this instance for method chaining
   */
  setMetaData(key: string, values: string | string[]): this {
    this.metaDataManager.setMetaData(key, values);
    return this;
  }

  /**
   * Get all values for a metadata key
   * @param key - The metadata key
   * @returns Array of values for the key, or empty array if key doesn't exist
   */
  getMetaData(key: string): string[] {
    return this.metaDataManager.getMetaData(key);
  }

  /**
   * Get the first value for a metadata key
   * @param key - The metadata key
   * @returns First value for the key, or undefined if key doesn't exist
   */
  getFirstMetaData(key: string): string | undefined {
    return this.metaDataManager.getFirstMetaData(key);
  }

  /**
   * Remove all values for a metadata key
   * @param key - The metadata key
   * @returns this instance for method chaining
   */
  removeMetaData(key: string): this {
    this.metaDataManager.removeMetaData(key);
    return this;
  }

  /**
   * Clear all metadata
   * @returns this instance for method chaining
   */
  clearMetaData(): this {
    this.metaDataManager.clearMetaData();
    return this;
  }

  /**
   * Convert metadata to command-line arguments
   * @returns Array of command-line arguments
   */
  toCommandArgs(): string[] {
    return this.commandBuilder.toCommandArgs();
  }

  /**
   * Build the complete command array
   * @returns Complete command array including executor, subcommands, and arguments
   */
  buildCommand(): string[] {
    return this.commandBuilder.buildCommand();
  }

  /**
   * Convert the instance to a readable string representation
   * @returns Formatted string representation of the instance
   */
  toString(): string {
    return this.stringFormatter.toString();
  }

  /**
   * Generate command string with backslash line continuation
   * @returns Docker command formatted with backslashes
   */
  toStringMultiLineCommand(): string {
    return new CommandFormatter(this, this).toStringMultiLineCommand();
  }

}
