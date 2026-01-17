import { Context } from '@actions/github/lib/context';
import { IGitHubContextService } from './github';
import { ISemanticVersionService } from './version';
export interface IServiceContainer {
    readonly githubContextService: IGitHubContextService;
    readonly semanticVersionService: ISemanticVersionService;
}
export declare class ServiceBuilder {
    private readonly context;
    private required;
    private services;
    constructor(context?: Context);
    withGitHubContext(): this;
    buildAll(): IServiceContainer;
    build(): IServiceContainer;
}
export declare function createServices(context?: Context): IServiceContainer;
//# sourceMappingURL=ServiceBuilder.d.ts.map