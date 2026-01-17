import { Context } from '@actions/github/lib/context';
import { IServiceContainer } from '../ServiceBuilder';
export declare class ActionRunner {
    private readonly services;
    constructor(services: IServiceContainer);
    run(): Promise<void>;
}
export declare function run(context?: Context, servicesContainer?: IServiceContainer): Promise<void>;
//# sourceMappingURL=main.d.ts.map