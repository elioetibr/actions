import type { IPullRequesterResult } from './IPullRequesterResult';

/**
 * Service interface for the PullRequester action.
 * Decoupled from IPullRequesterProvider — consumers depend only on execute().
 */
export interface IPullRequesterService {
  /**
   * Execute the PullRequester action.
   * Creates or updates a PR, links issues, transitions states.
   * @returns The result of the execution
   */
  execute(): Promise<IPullRequesterResult>;
}
