import { ITerragruntProvider } from '../interfaces';
/**
 * Formats Terragrunt commands as strings for display and debugging
 */
export declare class TerragruntStringFormatter {
    private readonly argumentBuilder;
    constructor(provider: ITerragruntProvider);
    /**
     * Generate command as a single-line string
     * @returns Space-separated command string
     */
    toString(): string;
    /**
     * Generate command as multi-line string with backslash continuations
     * @returns Multi-line command string
     */
    toStringMultiLineCommand(): string;
    /**
     * Generate a string list
     * @returns Array of strings suitable for StringListProvider
     */
    toStringList(): string[];
    /**
     * Escape an argument for shell safety
     * @param arg - Argument to escape
     * @returns Escaped argument
     */
    private escapeArg;
}
//# sourceMappingURL=TerragruntStringFormatter.d.ts.map