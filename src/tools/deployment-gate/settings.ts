import type { IAgent } from '../../agents/interfaces';
import { parseCommaSeparated } from '../../libs/utils';

/**
 * Input settings for deployment gate operations
 */
export interface IDeploymentGateSettings {
  approvers: string[];
  secret: string;
  minimumApprovals: number;
  issueTitle: string;
  issueBody: string;
  pollingIntervalSeconds: number;
  excludeWorkflowInitiator: boolean;
  additionalApprovedWords: string[];
  additionalDeniedWords: string[];
  targetRepositoryOwner: string;
  targetRepository: string;
  failOnDenial: boolean;
}

/**
 * Get deployment gate settings from agent inputs
 */
export function getSettings(agent: IAgent): IDeploymentGateSettings {
  const minimumApprovalsRaw = agent.getInput('minimum-approvals');

  return {
    approvers: parseCommaSeparated(agent.getInput('approvers', true)),
    secret: agent.getInput('secret', true),
    minimumApprovals: minimumApprovalsRaw ? parseInt(minimumApprovalsRaw, 10) : 0,
    issueTitle: agent.getInput('issue-title'),
    issueBody: agent.getInput('issue-body'),
    pollingIntervalSeconds: parseInt(agent.getInput('polling-interval-seconds') || '10', 10),
    excludeWorkflowInitiator: agent.getBooleanInput('exclude-workflow-initiator-as-approver'),
    additionalApprovedWords: parseCommaSeparated(agent.getInput('additional-approved-words')),
    additionalDeniedWords: parseCommaSeparated(agent.getInput('additional-denied-words')),
    targetRepositoryOwner: agent.getInput('target-repository-owner'),
    targetRepository: agent.getInput('target-repository'),
    failOnDenial: agent.getBooleanInput('fail-on-denial'),
  };
}
