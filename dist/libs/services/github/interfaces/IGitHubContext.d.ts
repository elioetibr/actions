import { WebhookPayload } from '@actions/github/lib/interfaces';
import { IGitHubIssue } from './IGitHubIssue';
import { IGitHubRepository } from './IGitHubRepository';
export interface IGitHubContext {
    /**
     * Webhook payload object that triggered the workflow
     */
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
}
//# sourceMappingURL=IGitHubContext.d.ts.map