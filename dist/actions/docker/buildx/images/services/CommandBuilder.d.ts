import { IMetaDataManager, ICommandBuilder } from '../interfaces';
/**
 * Builds Docker commands from metadata
 * Following Single Responsibility Principle
 */
export declare class CommandBuilder implements ICommandBuilder {
    private readonly executor;
    private readonly subCommands;
    private readonly command;
    private readonly metaDataManager;
    constructor(executor: string, subCommands: string[], command: string, metaDataManager: IMetaDataManager);
    /**
     * Convert metadata to command-line arguments
     * @returns Array of command-line arguments
     */
    toCommandArgs(): string[];
    /**
     * Build the complete command array
     * @returns Complete command array including executor, subcommands, and arguments
     */
    buildCommand(): string[];
}
//# sourceMappingURL=CommandBuilder.d.ts.map