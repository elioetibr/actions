import { WebhookPayload } from '@actions/github/lib/interfaces';
import { IGitHubContext, IGitHubIssue, IGitHubRepository } from '../interfaces';

export interface IGitHubContextBuilder extends IGitHubContext {
  /**
   * Sets the webhook payload
   */
  withPayload(payload: WebhookPayload): GitHubContextBuilder;

  /**
   * Sets the event name
   */
  withEventName(eventName: string): GitHubContextBuilder;

  /**
   * Sets the SHA
   */
  withSha(sha: string): GitHubContextBuilder;

  /**
   * Sets the ref
   */
  withRef(ref: string): GitHubContextBuilder;

  /**
   * Sets the workflow name
   */
  withWorkflow(workflow: string): GitHubContextBuilder;

  /**
   * Sets the action name
   */
  withAction(action: string): GitHubContextBuilder;

  /**
   * Sets the actor (user) who triggered the workflow
   */
  withActor(actor: string): GitHubContextBuilder;

  /**
   * Sets the job name
   */
  withJob(job: string): GitHubContextBuilder;

  /**
   * Sets the run attempt number
   */
  withRunAttempt(runAttempt: number): GitHubContextBuilder;

  /**
   * Sets the run number
   */
  withRunNumber(runNumber: number): GitHubContextBuilder;

  /**
   * Sets the run ID
   */
  withRunId(runId: number): GitHubContextBuilder;

  /**
   * Sets the GitHub API URL
   */
  withApiUrl(apiUrl: string): GitHubContextBuilder;

  /**
   * Sets the GitHub server URL
   */
  withServerUrl(serverUrl: string): GitHubContextBuilder;

  /**
   * Sets the GitHub GraphQL URL
   */
  withGraphqlUrl(graphqlUrl: string): GitHubContextBuilder;

  /**
   * Sets the issue information
   */
  withIssue(owner: string, repo: string, number: number): GitHubContextBuilder;

  /**
   * Sets the repository information
   */
  withRepo(owner: string, repo: string): GitHubContextBuilder;

  /**
   * Sets the default branch
   */
  withDefaultBranch(defaultBranch: string): GitHubContextBuilder;

  /**
   * Builds and returns the GitHub context object
   * @returns The fully constructed GitHub context
   */
  build(): IGitHubContext;
}

/**
 * Builder for creating GitHub context objects
 * Follows the Builder pattern to create complex IGitHubContext objects with a fluent interface
 */
export class GitHubContextBuilder implements IGitHubContextBuilder {
  payload: WebhookPayload = {};
  eventName: string = '';
  sha: string = '';
  ref: string = '';
  workflow: string = '';
  action: string = '';
  actor: string = '';
  job: string = '';
  runAttempt: number = 1;
  runNumber: number = 0;
  runId: number = 0;
  apiUrl: string = '';
  serverUrl: string = '';
  graphqlUrl: string = '';
  issue: IGitHubIssue = { owner: '', repo: '', number: 0 };
  repo: IGitHubRepository = { owner: '', repo: '' };
  defaultBranch: string = 'main';
  isDefaultBranch: boolean = false;
  isPullRequest: boolean = false;
  isTag: boolean = false;
  refName: string = '';
  shaShort: string = '';

  /**
   * Sets the webhook payload
   */
  withPayload(payload: WebhookPayload): IGitHubContextBuilder {
    this.payload = payload;
    return this;
  }

  /**
   * Sets the event name
   */
  withEventName(eventName: string): IGitHubContextBuilder {
    this.eventName = eventName;
    return this;
  }

  /**
   * Sets the SHA
   */
  withSha(sha: string): IGitHubContextBuilder {
    this.sha = sha;
    this.shaShort = sha.substring(0, 7);
    return this;
  }

  /**
   * Sets the ref
   */
  withRef(ref: string): IGitHubContextBuilder {
    this.ref = ref;
    // Update derived properties
    this.refName = ref.replace(/^refs\/(heads\/|tags\/|pull\/)?/, '');
    this.isPullRequest = ref.startsWith('refs/pull/');
    this.isTag = ref.startsWith('refs/tags/');

    // Update isDefaultBranch if defaultBranch is already set
    this.isDefaultBranch = this.refName === this.defaultBranch;
    return this;
  }

  /**
   * Sets the workflow name
   */
  withWorkflow(workflow: string): IGitHubContextBuilder {
    this.workflow = workflow;
    return this;
  }

  /**
   * Sets the action name
   */
  withAction(action: string): IGitHubContextBuilder {
    this.action = action;
    return this;
  }

  /**
   * Sets the actor (user) who triggered the workflow
   */
  withActor(actor: string): IGitHubContextBuilder {
    this.actor = actor;
    return this;
  }

  /**
   * Sets the job name
   */
  withJob(job: string): IGitHubContextBuilder {
    this.job = job;
    return this;
  }

  /**
   * Sets the run attempt number
   */
  withRunAttempt(runAttempt: number): IGitHubContextBuilder {
    this.runAttempt = runAttempt;
    return this;
  }

  /**
   * Sets the run number
   */
  withRunNumber(runNumber: number): IGitHubContextBuilder {
    this.runNumber = runNumber;
    return this;
  }

  /**
   * Sets the run ID
   */
  withRunId(runId: number): IGitHubContextBuilder {
    this.runId = runId;
    return this;
  }

  /**
   * Sets the GitHub API URL
   */
  withApiUrl(apiUrl: string): IGitHubContextBuilder {
    this.apiUrl = apiUrl;
    return this;
  }

  /**
   * Sets the GitHub server URL
   */
  withServerUrl(serverUrl: string): IGitHubContextBuilder {
    this.serverUrl = serverUrl;
    return this;
  }

  /**
   * Sets the GitHub GraphQL URL
   */
  withGraphqlUrl(graphqlUrl: string): IGitHubContextBuilder {
    this.graphqlUrl = graphqlUrl;
    return this;
  }

  /**
   * Sets the issue information
   */
  withIssue(owner: string, repo: string, number: number): IGitHubContextBuilder {
    this.issue = { owner, repo, number };
    return this;
  }

  /**
   * Sets the repository information
   */
  withRepo(owner: string, repo: string): IGitHubContextBuilder {
    this.repo = { owner, repo };
    return this;
  }

  /**
   * Sets the default branch
   */
  withDefaultBranch(defaultBranch: string): IGitHubContextBuilder {
    this.defaultBranch = defaultBranch;
    // Update isDefaultBranch if refName is already set
    this.isDefaultBranch = this.refName === defaultBranch;
    return this;
  }

  /**
   * Builds and returns the GitHub context object
   * @returns The fully constructed GitHub context
   */
  build(): IGitHubContext {
    if (!this.sha || !this.ref) {
      throw new Error('Invalid GitHub context: missing ref or sha');
    }

    return {
      payload: this.payload,
      eventName: this.eventName,
      sha: this.sha,
      ref: this.ref,
      workflow: this.workflow,
      action: this.action,
      actor: this.actor,
      job: this.job,
      runAttempt: this.runAttempt,
      runNumber: this.runNumber,
      runId: this.runId,
      apiUrl: this.apiUrl,
      serverUrl: this.serverUrl,
      graphqlUrl: this.graphqlUrl,
      issue: this.issue,
      repo: this.repo,
      defaultBranch: this.defaultBranch,
      isDefaultBranch: this.isDefaultBranch,
      isPullRequest: this.isPullRequest,
      isTag: this.isTag,
      refName: this.refName,
      shaShort: this.shaShort,
    };
  }
}
