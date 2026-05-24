import type { Octokit } from '@octokit/rest';
import type { LinearClient } from '@linear/sdk';
import type { Version3Client } from 'jira.js';
import type { IIssueTracker, TrackerCredentials } from '../interfaces';
import { assertNever } from '../../../libs/utils/assertNever';
import { GitHubIssueTracker } from './GitHubIssueTracker';
import { LinearIssueTracker } from './LinearIssueTracker';
import { JiraIssueTracker } from './JiraIssueTracker';

/**
 * Factory that creates the appropriate IIssueTracker based on the configured tracker type.
 * Only ONE tracker is created per workflow run.
 */
export class TrackerFactory {
  // Static-init block exercises the (private) constructor at module load so
  // V8 coverage counts it — this class is purely static otherwise.
  static {
    new TrackerFactory();
  }
  private constructor() {}

  /**
   * Validate that required credentials are present for the chosen tracker type.
   * @throws Error with descriptive message if credentials are missing
   */
  static validateCredentials(credentials: TrackerCredentials): void {
    switch (credentials.type) {
      case 'github':
        if (!credentials.token) throw new Error('GitHub tracker requires a token');
        if (!credentials.owner) throw new Error('GitHub tracker requires an owner');
        if (!credentials.repo) throw new Error('GitHub tracker requires a repo');
        break;
      case 'linear':
        if (!credentials.linearApiKey) throw new Error('Linear tracker requires linear-api-key');
        break;
      case 'jira':
        if (!credentials.jiraBaseUrl) throw new Error('Jira tracker requires jira-base-url');
        if (!credentials.jiraUserEmail) throw new Error('Jira tracker requires jira-user-email');
        if (!credentials.jiraApiToken) throw new Error('Jira tracker requires jira-api-token');
        break;
      default:
        assertNever(credentials);
    }
  }

  /**
   * Create a tracker instance for the given type.
   * Validates credentials before creating.
   * @param credentials - Discriminated credentials (type field determines which tracker)
   * @param clients - Pre-built SDK clients (injected for testability)
   */
  static create(
    credentials: TrackerCredentials,
    clients: {
      octokit?: Octokit;
      linearClient?: LinearClient;
      jiraClient?: Version3Client;
    },
  ): IIssueTracker {
    TrackerFactory.validateCredentials(credentials);

    switch (credentials.type) {
      case 'github': {
        if (!clients.octokit) throw new Error('GitHub tracker requires an Octokit instance');
        return new GitHubIssueTracker(clients.octokit, credentials.owner, credentials.repo);
      }
      case 'linear': {
        if (!clients.linearClient)
          throw new Error('Linear tracker requires a LinearClient instance');
        return new LinearIssueTracker(clients.linearClient);
      }
      case 'jira': {
        if (!clients.jiraClient) throw new Error('Jira tracker requires a Version3Client instance');
        return new JiraIssueTracker(clients.jiraClient, credentials.jiraBaseUrl);
      }
      default:
        return assertNever(credentials);
    }
  }
}
