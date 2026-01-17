import { ITerraformProvider } from '../interfaces';
import { TerraformArgumentBuilder } from './TerraformArgumentBuilder';

/**
 * Formats Terraform commands as strings for display and debugging
 * Follows single responsibility principle - only handles string formatting
 */
export class TerraformStringFormatter {
  private readonly argumentBuilder: TerraformArgumentBuilder;

  constructor(provider: ITerraformProvider) {
    this.argumentBuilder = new TerraformArgumentBuilder(provider);
  }

  /**
   * Generate command as a single-line string
   * @returns Space-separated command string
   */
  toString(): string {
    const command = this.argumentBuilder.buildCommand();
    return command.map((arg) => this.escapeArg(arg)).join(' ');
  }

  /**
   * Generate command as multi-line string with backslash continuations
   * Suitable for shell scripts and documentation
   * @returns Multi-line command string
   */
  toStringMultiLineCommand(): string {
    const command = this.argumentBuilder.buildCommand();
    if (command.length === 0) return '';

    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < command.length; i++) {
      const currentArg = command[i]!;
      const arg = this.escapeArg(currentArg);
      const isLast = i === command.length - 1;

      // Check if this is a flag with a value
      const nextArg = command[i + 1];
      if (arg.startsWith('-') && !isLast && nextArg && !nextArg.startsWith('-')) {
        // Flag with value - keep them together
        currentLine = `  ${arg} ${this.escapeArg(nextArg)}`;
        lines.push(currentLine + (i + 1 === command.length - 1 ? '' : ' \\'));
        i++; // Skip the value in next iteration
      } else if (i === 0) {
        // Executor (terraform)
        lines.push(arg + ' \\');
      } else if (i === 1) {
        // Command (plan, apply, etc.)
        lines.push(`  ${arg}` + (isLast ? '' : ' \\'));
      } else {
        // Standalone argument
        lines.push(`  ${arg}` + (isLast ? '' : ' \\'));
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate a string list (space-separated with equals for key-value pairs)
   * @returns Array of strings suitable for StringListProvider
   */
  toStringList(): string[] {
    return this.argumentBuilder.buildCommand();
  }

  /**
   * Escape an argument for shell safety
   * @param arg - Argument to escape
   * @returns Escaped argument
   */
  private escapeArg(arg: string): string {
    // If arg contains spaces, quotes, or special chars, wrap in quotes
    if (/[\s"'\\$`]/.test(arg)) {
      // Escape existing quotes and wrap in double quotes
      return `"${arg.replace(/"/g, '\\"')}"`;
    }
    return arg;
  }
}
