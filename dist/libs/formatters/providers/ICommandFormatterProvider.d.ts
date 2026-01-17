import { IDockerBuildXImageToolsProvider } from '../../../actions/docker/buildx/images';
import { IStringListProvider } from '../../providers';
export interface ICommandFormatterProvider {
    readonly dockerProvider: IDockerBuildXImageToolsProvider;
    readonly stringListProvider: IStringListProvider;
}
//# sourceMappingURL=ICommandFormatterProvider.d.ts.map