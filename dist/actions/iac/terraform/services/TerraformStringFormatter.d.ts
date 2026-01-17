import { ITerraformProvider } from '../interfaces';
/**
 * Formats Terraform commands as strings for display and debugging
 * Follows single responsibility principle - only handles string formatting
 */
export declare class TerraformStringFormatter {
    private readonly argumentBuilder;
    constructor(provider: ITerraformProvider);
    /**
     * Generate command as a single-line string
     * @returns Space-separated command string
     */
    toString(): string;
    /**
     * Generate command as multi-line string with backslash continuations
     * Suitable for shell scripts and documentation
     * @returns Multi-line command string
     */
    toStringMultiLineCommand(): string;
    /**
     * Generate a string list (space-separated with equals for key-value pairs)
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
//# sourceMappingURL=TerraformStringFormatter.d.ts.map