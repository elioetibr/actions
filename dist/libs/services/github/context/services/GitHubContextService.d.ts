import { Context } from '@actions/github/lib/context';
import { IGitHubContext, IGitHubContextService } from '../../interfaces';
/**
 * Service that provides GitHub context information
 * Following Single Responsibility Principle - this class only handles context information
 */
export declare class GitHubContextService implements IGitHubContextService {
    readonly context: IGitHubContext;
    /**
     * @param context - GitHub action context
     */
    constructor(context: Context);
    /**
     * Builds a standardized context object from GitHub action context
     * @param context - Original GitHub action context
     * @returns Standardized GitHub context with additional properties
     */
    private buildContext;
}
/**
 * Factory function to create a GitHubContextService instance
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export declare function createGitHubContextService(context: Context): IGitHubContextService;
//# sourceMappingURL=GitHubContextService.d.ts.map