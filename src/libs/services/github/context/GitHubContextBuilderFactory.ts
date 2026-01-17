// noinspection JSUnusedGlobalSymbols

import { Context } from '@actions/github/lib/context';
import { GitHubContextBuilder, IGitHubContextBuilder } from './GitHubContextBuilder';

/**
 * Factory for creating GitHubContextBuilder instances
 * Follows the Factory pattern to provide various ways to initialize GitHubContextBuilder instances
 */
export class GitHubContextBuilderFactory {
  /**
   * Creates a new empty GitHubContextBuilder instance
   * @returns A new GitHubContextBuilder instance with default values
   */
  static create(): IGitHubContextBuilder {
    return new GitHubContextBuilder();
  }

  /**
   * Creates a GitHubContextBuilder initialized from GitHub Actions context
   * @param context - The GitHub Actions context object
   * @returns A GitHubContextBuilder pre-populated with values from the context
   */
  static createFromContext(context: Context): IGitHubContextBuilder {
    if (!context) {
      throw new Error('GitHub context is required');
    }

    const defaultBranch = context.payload?.repository?.['default_branch'] || 'main';

    return new GitHubContextBuilder()
      .withPayload(context.payload || {})
      .withEventName(context.eventName || '')
      .withSha(context.sha || '')
      .withRef(context.ref || '')
      .withWorkflow(context.workflow || '')
      .withAction(context.action || '')
      .withActor(context.actor || '')
      .withJob(context.job || '')
      .withRunAttempt(context.runAttempt || 1)
      .withRunNumber(context.runNumber || 0)
      .withRunId(context.runId || 0)
      .withApiUrl(context.apiUrl || '')
      .withServerUrl(context.serverUrl || '')
      .withGraphqlUrl(context.graphqlUrl || '')
      .withIssue(context.issue?.owner || '', context.issue?.repo || '', context.issue?.number || 0)
      .withRepo(context.repo?.owner || '', context.repo?.repo || '')
      .withDefaultBranch(defaultBranch);
  }
}

/**
 * Convenience function to create a GitHubContextBuilder
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export function createGitHubBuilder(): IGitHubContextBuilder {
  return GitHubContextBuilderFactory.create();
}

/**
 * Convenience function to create a GitHubContextBuilder from GitHub Actions context
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export function createGitHubBuilderFromContext(context: Context): IGitHubContextBuilder {
  return GitHubContextBuilderFactory.createFromContext(context);
}
