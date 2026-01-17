import { IBranchProvider } from '../../../../providers';
import { IGitHubContextService } from '../../interfaces';
/**
 * Service that determines branch-related information from GitHub context
 * Following Single Responsibility Principle - this class only handles branch status information
 */
export declare class GitHubBranchProvider implements IBranchProvider {
    private readonly contextService;
    /**
     * @param contextService - GitHub context service to use for branch information
     */
    constructor(contextService: IGitHubContextService);
    /**
     * Determines if the current branch is the default branch
     * Uses the context's isDefaultBranch property which compares refName with defaultBranch
     */
    get isDefaultBranch(): boolean;
}
/**
 * Factory function to create a GitHubBranchProvider instance
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export declare function createGitHubBranchProvider(contextService: IGitHubContextService): IBranchProvider;
//# sourceMappingURL=GitHubBranchProvider.d.ts.map