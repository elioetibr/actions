import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from '../common/runner-base';
import { DeploymentGateBuilder } from '../../actions/deployment-gate/DeploymentGateBuilder';
import { ApprovalStatus } from '../../actions/deployment-gate/interfaces';
import type { IDeploymentGateService } from '../../actions/deployment-gate/interfaces';
import { getSettings } from './settings';

/**
 * Deployment gate runner
 * Creates a GitHub issue for manual approval and polls for responses
 */
export class DeploymentGateRunner extends RunnerBase {
  readonly name = 'deployment-gate';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['approve', this.runApprove.bind(this)],
  ]);

  /**
   * Approve step: Create an approval issue, poll for responses, resolve.
   * All GitHub API calls go through IDeploymentGateService (not direct Octokit).
   */
  private async runApprove(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      // Resolve target repository (default to current repo from env)
      const repoOwner = settings.targetRepositoryOwner || process.env.GITHUB_REPOSITORY_OWNER || '';
      const repoName =
        settings.targetRepository || process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
      const runId = process.env.GITHUB_RUN_ID || '';

      if (!repoOwner || !repoName) {
        return this.failure(new Error('Could not determine target repository'));
      }

      // Default issue title includes run ID for traceability
      const issueTitle =
        settings.issueTitle || `Manual approval required for workflow run ${runId}`;

      agent.info('Starting deployment gate approval process...');

      // Build the service
      const service = DeploymentGateBuilder.create()
        .withToken(settings.secret)
        .withOwner(repoOwner)
        .withRepo(repoName)
        .withApprovers(settings.approvers)
        .withMinimumApprovals(settings.minimumApprovals)
        .withIssueTitle(issueTitle)
        .withIssueBody(settings.issueBody)
        .withPollingIntervalSeconds(settings.pollingIntervalSeconds)
        .withFailOnDenial(settings.failOnDenial)
        .withExcludeWorkflowInitiator(settings.excludeWorkflowInitiator)
        .withAdditionalApprovedWords(settings.additionalApprovedWords)
        .withAdditionalDeniedWords(settings.additionalDeniedWords)
        .build();

      // Resolve approvers (expand teams, exclude initiator)
      agent.startGroup('Resolving approvers');
      const actor = settings.excludeWorkflowInitiator ? process.env.GITHUB_ACTOR : undefined;
      const resolvedApprovers = await service.resolveApprovers(repoOwner, actor);
      agent.info(`Resolved approvers: ${resolvedApprovers.join(', ')}`);
      agent.endGroup();

      if (resolvedApprovers.length === 0) {
        return this.failure(new Error('No approvers remaining after resolution'));
      }

      // Create the approval issue
      agent.startGroup('Creating approval issue');
      const issue = await service.createApprovalIssue();
      agent.info(`Created issue #${issue.number}: ${issue.url}`);
      agent.endGroup();

      // Poll for approval
      const approvalStatus = await this.pollForApproval(agent, service, issue.number);

      // Build outputs
      const outputs: Record<string, string | number | boolean> = {
        'issue-number': issue.number,
        'issue-url': issue.url,
        'approval-status': approvalStatus,
      };

      if (approvalStatus === ApprovalStatus.Approved) {
        return this.success(outputs);
      }

      // Denied
      if (settings.failOnDenial) {
        return this.failure(new Error('Deployment approval was denied'), outputs);
      }

      // fail-on-denial=false: exit successfully but with denied status
      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Poll for approval on the issue.
   * Checks comments at the configured interval until approved or denied.
   */
  private async pollForApproval(
    agent: IAgent,
    service: IDeploymentGateService,
    issueNumber: number,
  ): Promise<ApprovalStatus> {
    const intervalMs = service.pollingIntervalSeconds * 1000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.sleep(intervalMs);

      agent.debug(`Polling issue #${issueNumber} for approval comments...`);

      const comments = await service.getIssueComments(issueNumber);
      const result = service.evaluateApproval(comments);

      if (result.status === ApprovalStatus.Approved) {
        const msg = `Approved by: ${result.approvedBy.join(', ')}`;
        agent.info(msg);
        await service.closeIssue(issueNumber, msg);
        return ApprovalStatus.Approved;
      }

      if (result.status === ApprovalStatus.Denied) {
        const msg = `Denied by: ${result.deniedBy}`;
        agent.warning(msg);
        await service.closeIssue(issueNumber, msg);
        return ApprovalStatus.Denied;
      }

      if (result.approvedBy.length > 0) {
        agent.info(
          `Waiting for more approvals (${result.approvedBy.length}/${service.minimumApprovals || service.approvers.length})...`,
        );
      }
    }
  }

  /**
   * Sleep for the given duration. Extracted for testability.
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms).unref());
  }
}

/**
 * Factory function to create a deployment gate runner
 */
export function createDeploymentGateRunner(): DeploymentGateRunner {
  return new DeploymentGateRunner();
}
