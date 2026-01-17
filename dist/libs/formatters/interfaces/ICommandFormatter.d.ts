import { ICommandFormatterProvider } from '../providers';
export interface ICommandFormatter extends ICommandFormatterProvider {
    toStringMultiLineCommand(): string;
    buildAllLines(): string[];
    buildExecutorLine(): string;
    buildSubCommandLines(): string[];
    buildMainCommandLine(): string;
    buildMetaDataLines(): string[];
    buildUnkeyedMetaData(values: string[]): string[];
    buildKeyedMetaData(key: string, values: string[]): string[];
}
//# sourceMappingURL=ICommandFormatter.d.ts.map