import { Context } from '@actions/github/lib/context';
import { IGitHubContextBuilder } from './GitHubContextBuilder';
/**
 * Factory for creating GitHubContextBuilder instances
 * Follows the Factory pattern to provide various ways to initialize GitHubContextBuilder instances
 */
export declare class GitHubContextBuilderFactory {
    /**
     * Creates a new empty GitHubContextBuilder instance
     * @returns A new GitHubContextBuilder instance with default values
     */
    static create(): IGitHubContextBuilder;
    /**
     * Creates a GitHubContextBuilder initialized from GitHub Actions context
     * @param context - The GitHub Actions context object
     * @returns A GitHubContextBuilder pre-populated with values from the context
     */
    static createFromContext(context: Context): IGitHubContextBuilder;
}
/**
 * Convenience function to create a GitHubContextBuilder
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export declare function createGitHubBuilder(): IGitHubContextBuilder;
/**
 * Convenience function to create a GitHubContextBuilder from GitHub Actions context
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export declare function createGitHubBuilderFromContext(context: Context): IGitHubContextBuilder;
//# sourceMappingURL=GitHubContextBuilderFactory.d.ts.map