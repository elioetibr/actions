import { IMetaDataManager, ICommandBuilder } from '../interfaces';

/**
 * Builds Docker commands from metadata
 * Following Single Responsibility Principle
 */
export class CommandBuilder implements ICommandBuilder {
  constructor(
    private readonly executor: string,
    private readonly subCommands: string[],
    private readonly command: string,
    private readonly metaDataManager: IMetaDataManager
  ) {}

  /**
   * Convert metadata to command-line arguments
   * @returns Array of command-line arguments
   */
  toCommandArgs(): string[] {
    const args: string[] = [];

    for (const [key, values] of this.metaDataManager.entries()) {
      if (key === '') {
        // For empty keys, add values directly without key
        args.push(...values);
      } else {
        // For non-empty keys, add key-value pairs
        for (const value of values) {
          args.push(key, value);
        }
      }
    }

    return args;
  }

  /**
   * Build the complete command array
   * @returns Complete command array including executor, subcommands, and arguments
   */
  buildCommand(): string[] {
    return [this.executor, ...this.subCommands, this.command, ...this.toCommandArgs()];
  }
}