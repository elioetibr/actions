/**
 * Read-only provider interface for deployment gate configuration
 */
export interface IDeploymentGateProvider {
  /** GitHub token for API access */
  readonly token: string;

  /** Repository owner */
  readonly owner: string;

  /** Repository name */
  readonly repo: string;

  /** List of resolved approver usernames */
  readonly approvers: readonly string[];

  /** Minimum number of approvals required (0 = all approvers) */
  readonly minimumApprovals: number;

  /** Title for the approval issue */
  readonly issueTitle: string;

  /** Body content for the approval issue */
  readonly issueBody: string;

  /** Seconds between polling for comments */
  readonly pollingIntervalSeconds: number;

  /** Whether to fail the action on denial */
  readonly failOnDenial: boolean;

  /** Whether to exclude the workflow initiator from approvers */
  readonly excludeWorkflowInitiator: boolean;

  /** Additional words that count as approval */
  readonly additionalApprovedWords: readonly string[];

  /** Additional words that count as denial */
  readonly additionalDeniedWords: readonly string[];
}
