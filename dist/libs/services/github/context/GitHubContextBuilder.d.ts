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
export declare class GitHubContextBuilder implements IGitHubContextBuilder {
    payload: WebhookPayload;
    eventName: string;
    sha: string;
    ref: string;
    workflow: string;
    action: string;
    actor: string;
    job: string;
    runAttempt: number;
    runNumber: number;
    runId: number;
    apiUrl: string;
    serverUrl: string;
    graphqlUrl: string;
    issue: IGitHubIssue;
    repo: IGitHubRepository;
    defaultBranch: string;
    isDefaultBranch: boolean;
    isPullRequest: boolean;
    isTag: boolean;
    refName: string;
    shaShort: string;
    /**
     * Sets the webhook payload
     */
    withPayload(payload: WebhookPayload): IGitHubContextBuilder;
    /**
     * Sets the event name
     */
    withEventName(eventName: string): IGitHubContextBuilder;
    /**
     * Sets the SHA
     */
    withSha(sha: string): IGitHubContextBuilder;
    /**
     * Sets the ref
     */
    withRef(ref: string): IGitHubContextBuilder;
    /**
     * Sets the workflow name
     */
    withWorkflow(workflow: string): IGitHubContextBuilder;
    /**
     * Sets the action name
     */
    withAction(action: string): IGitHubContextBuilder;
    /**
     * Sets the actor (user) who triggered the workflow
     */
    withActor(actor: string): IGitHubContextBuilder;
    /**
     * Sets the job name
     */
    withJob(job: string): IGitHubContextBuilder;
    /**
     * Sets the run attempt number
     */
    withRunAttempt(runAttempt: number): IGitHubContextBuilder;
    /**
     * Sets the run number
     */
    withRunNumber(runNumber: number): IGitHubContextBuilder;
    /**
     * Sets the run ID
     */
    withRunId(runId: number): IGitHubContextBuilder;
    /**
     * Sets the GitHub API URL
     */
    withApiUrl(apiUrl: string): IGitHubContextBuilder;
    /**
     * Sets the GitHub server URL
     */
    withServerUrl(serverUrl: string): IGitHubContextBuilder;
    /**
     * Sets the GitHub GraphQL URL
     */
    withGraphqlUrl(graphqlUrl: string): IGitHubContextBuilder;
    /**
     * Sets the issue information
     */
    withIssue(owner: string, repo: string, number: number): IGitHubContextBuilder;
    /**
     * Sets the repository information
     */
    withRepo(owner: string, repo: string): IGitHubContextBuilder;
    /**
     * Sets the default branch
     */
    withDefaultBranch(defaultBranch: string): IGitHubContextBuilder;
    /**
     * Builds and returns the GitHub context object
     * @returns The fully constructed GitHub context
     */
    build(): IGitHubContext;
}
//# sourceMappingURL=GitHubContextBuilder.d.ts.map