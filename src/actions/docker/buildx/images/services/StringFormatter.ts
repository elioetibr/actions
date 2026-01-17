import { IMetaDataManager, IStringFormatter } from '../interfaces';

/**
 * Handles string formatting for Docker BuildX Image Tools
 * Following Single Responsibility Principle
 */
export class StringFormatter implements IStringFormatter {
  constructor(
    private readonly className: string,
    private readonly command: string,
    private readonly executor: string,
    private readonly subCommands: string[],
    private readonly useStringList: boolean,
    private readonly metaDataManager: IMetaDataManager
  ) {}

  /**
   * Convert the instance to a readable string representation
   * @returns Formatted string representation of the instance
   */
  toString(): string {
    const metaDataStr = this.formatMetaData();
    
    return `${this.className} {
  command: ${this.escapeString(this.command)}
  executor: ${this.escapeString(this.executor)}
  subCommands: [${this.formatStringArray(this.subCommands)}]
  useStringList: ${this.useStringList}
  metaData: ${metaDataStr}
}`;
  }

  /**
   * Format metadata for string representation
   * @private
   */
  private formatMetaData(): string {
    if (this.metaDataManager.getSize() === 0) {
      return 'Map(0) {}';
    }

    const entries = Array.from(this.metaDataManager.entries())
      .map(([key, values]) => {
        const displayKey = key === '' ? '(empty)' : key;
        const valueStr = values.length === 1 
          ? this.escapeString(values[0] ?? '')
          : `[${this.formatStringArray(values)}]`;
        return `    ${this.escapeString(displayKey)} => ${valueStr}`;
      })
      .join('\n');

    return `Map(${this.metaDataManager.getSize()}) {\n${entries}\n  }`;
  }

  /**
   * Escape and format a string for display
   * @param str - String to escape
   * @returns Escaped string with quotes
   */
  private escapeString(str: string): string {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  /**
   * Format an array of strings for display
   * @param arr - Array of strings to format
   * @returns Comma-separated formatted string
   */
  private formatStringArray(arr: string[]): string {
    return arr.map(item => this.escapeString(item)).join(', ');
  }
}