// noinspection JSUnusedGlobalSymbols

import { Context } from '@actions/github/lib/context';
import { IGitHubContext, IGitHubContextService } from '../../interfaces';

/**
 * Service that provides GitHub context information
 * Following Single Responsibility Principle - this class only handles context information
 */
export class GitHubContextService implements IGitHubContextService {
  readonly context: IGitHubContext;

  /**
   * @param context - GitHub action context
   */
  constructor(context: Context) {
    if (!context) {
      throw new Error('GitHub context is required');
    }
    this.context = this.buildContext(context);
  }

  /**
   * Builds a standardized context object from GitHub action context
   * @param context - Original GitHub action context
   * @returns Standardized GitHub context with additional properties
   */
  private buildContext(context: Context): IGitHubContext {
    // Validate required properties
    if (!context.ref || !context.sha) {
      throw new Error('Invalid GitHub context: missing ref or sha');
    }

    const defaultBranch = context.payload?.repository?.['default_branch'] || 'main';
    const ref = context.ref || '';
    const refName = ref.replace(/^refs\/(heads\/|tags\/|pull\/)?/, '');

    return {
      payload: context.payload,
      eventName: context.eventName,
      sha: context.sha,
      ref: context.ref,
      workflow: context.workflow || '',
      action: context.action || '',
      actor: context.actor || '',
      job: context.job || '',
      runAttempt: context.runAttempt || 1,
      runNumber: context.runNumber || 0,
      runId: context.runId || 0,
      apiUrl: context.apiUrl || '',
      serverUrl: context.serverUrl || '',
      graphqlUrl: context.graphqlUrl || '',
      issue: context.issue,
      repo: context.repo,
      defaultBranch,
      isDefaultBranch: refName === defaultBranch,
      isPullRequest: ref.startsWith('refs/pull/'),
      isTag: ref.startsWith('refs/tags/'),
      refName,
      shaShort: context.sha.substring(0, 7),
    };
  }
}

/**
 * Factory function to create a GitHubContextService instance
 * This follows the Dependency Inversion principle by allowing for easier mocking/testing
 */
export function createGitHubContextService(context: Context): IGitHubContextService {
  return new GitHubContextService(context);
}
