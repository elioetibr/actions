/**
 * Interface for argument builders that can produce command arrays
 */
export interface ICommandBuilder {
  buildCommand(): string[];
}

/**
 * Base string formatter for IaC commands
 * Formats command arrays as single-line, multi-line, or string list representations
 */
export class BaseIacStringFormatter {
  constructor(private readonly commandBuilder: ICommandBuilder) {}

  /**
   * Generate command as a single-line string
   * @returns Space-separated command string
   */
  toString(): string {
    const command = this.commandBuilder.buildCommand();
    return command.map(arg => this.escapeArg(arg)).join(' ');
  }

  /**
   * Generate command as multi-line string with backslash continuations
   * Suitable for shell scripts and documentation
   * @returns Multi-line command string
   */
  toStringMultiLineCommand(): string {
    const command = this.commandBuilder.buildCommand();
    if (command.length === 0) return '';

    const lines: string[] = [];

    for (let i = 0; i < command.length; i++) {
      const currentArg = command[i]!;
      const arg = this.escapeArg(currentArg);
      const isLast = i === command.length - 1;

      // Check if this is a flag with a value
      const nextArg = command[i + 1];
      if (arg.startsWith('-') && !isLast && nextArg && !nextArg.startsWith('-')) {
        // Flag with value - keep them together
        const value = this.escapeArg(nextArg);
        lines.push(`  ${arg} ${value}` + (i + 1 === command.length - 1 ? '' : ' \\'));
        i++; // Skip the value in next iteration
      } else if (i === 0) {
        // Executor
        lines.push(arg + ' \\');
      } else if (i === 1) {
        // Command
        lines.push(`  ${arg}` + (isLast ? '' : ' \\'));
      } else {
        // Standalone argument
        lines.push(`  ${arg}` + (isLast ? '' : ' \\'));
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate a string list
   * @returns Array of strings suitable for StringListProvider
   */
  toStringList(): string[] {
    return this.commandBuilder.buildCommand();
  }

  /**
   * Escape an argument for shell safety
   * @param arg - Argument to escape
   * @returns Escaped argument
   */
  private escapeArg(arg: string): string {
    if (/[\s"'\\$`]/.test(arg)) {
      return `"${arg.replace(/"/g, '\\"')}"`;
    }
    return arg;
  }
}
