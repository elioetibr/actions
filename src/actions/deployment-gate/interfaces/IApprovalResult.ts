/**
 * Status of an approval evaluation
 */
export enum ApprovalStatus {
  Approved = 'approved',
  Denied = 'denied',
  Pending = 'pending',
}

/**
 * Result of evaluating approval comments on an issue
 */
export interface IApprovalResult {
  /** Current approval status */
  readonly status: ApprovalStatus;

  /** Users who have approved so far */
  readonly approvedBy: string[];

  /** User who denied (first denial wins) */
  readonly deniedBy?: string;
}
