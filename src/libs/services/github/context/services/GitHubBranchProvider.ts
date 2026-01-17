// noinspection JSUnusedGlobalSymbols

import { IBranchProvider } from '../../../../providers';
import { IGitHubContextService } from '../../interfaces';

/**
 * Service that determines branch-related information from GitHub context
 * Following Single Responsibility Principle - this class only handles branch status information
 */
export class GitHubBranchProvider implements IBranchProvider {
  private readonly contextService: IGitHubContextService;

  /**
   * @param contextService - GitHub context service to use for branch information
   */
  constructor(contextService: IGitHubContextService) {
    if (!contextService) {
      throw new Error('GitHub context service is required');
    }
    this.contextService = contextService;
  }

  /**
   * Determines if the current branch is the default branch
   * Uses the context's isDefaultBranch property which compares refName with defaultBranch
   */
  get isDefaultBranch(): boolean {
    return this.contextService.context.isDefaultBranch;
  }
}

/**
 * Factory function to create a GitHubBranchProvider instance
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export function createGitHubBranchProvider(contextService: IGitHubContextService): IBranchProvider {
  return new GitHubBranchProvider(contextService);
}
