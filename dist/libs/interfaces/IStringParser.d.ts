/**
 * Interface for string parsers following the Single Responsibility Principle
 */
export interface IStringParser {
    canParse(input: string): boolean;
    parse(input: string): string[];
}
//# sourceMappingURL=IStringParser.d.ts.map