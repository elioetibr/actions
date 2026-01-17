import { ITerragruntProvider } from '../interfaces';
import { TerragruntArgumentBuilder } from './TerragruntArgumentBuilder';

/**
 * Formats Terragrunt commands as strings for display and debugging
 */
export class TerragruntStringFormatter {
  private readonly argumentBuilder: TerragruntArgumentBuilder;

  constructor(provider: ITerragruntProvider) {
    this.argumentBuilder = new TerragruntArgumentBuilder(provider);
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
   * @returns Multi-line command string
   */
  toStringMultiLineCommand(): string {
    const command = this.argumentBuilder.buildCommand();
    if (command.length === 0) return '';

    const lines: string[] = [];

    for (let i = 0; i < command.length; i++) {
      const currentArg = command[i]!;
      const arg = this.escapeArg(currentArg);
      const isLast = i === command.length - 1;

      // Check if this is a flag with a value
      const nextArg = command[i + 1];
      if (
        arg.startsWith('-') &&
        !isLast &&
        nextArg &&
        !nextArg.startsWith('-')
      ) {
        // Flag with value - keep them together
        const value = this.escapeArg(nextArg);
        lines.push(`  ${arg} ${value}` + (i + 1 === command.length - 1 ? '' : ' \\'));
        i++; // Skip the value in next iteration
      } else if (i === 0) {
        // Executor (terragrunt)
        lines.push(arg + ' \\');
      } else if (i === 1) {
        // Command or run-all
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
    return this.argumentBuilder.buildCommand();
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
