import { ICommandFormatter } from './interfaces';
import { ICommandFormatterProvider } from './providers';
import { IDockerBuildXImageToolsProvider } from '../../actions/docker/buildx/images';
import { IStringListProvider } from '../providers';
export declare class CommandFormatter implements ICommandFormatter, ICommandFormatterProvider {
    readonly dockerProvider: IDockerBuildXImageToolsProvider;
    readonly stringListProvider: IStringListProvider;
    constructor(dockerProvider: IDockerBuildXImageToolsProvider, stringListProvider: IStringListProvider);
    toStringMultiLineCommand(): string;
    buildAllLines(): string[];
    buildExecutorLine(): string;
    buildSubCommandLines(): string[];
    buildMainCommandLine(): string;
    buildMetaDataLines(): string[];
    buildUnkeyedMetaData(values: string[]): string[];
    buildKeyedMetaData(key: string, values: string[]): string[];
}
//# sourceMappingURL=CommandFormatter.d.ts.map