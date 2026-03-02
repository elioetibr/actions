import { ApprovalStatus, IApprovalResult } from './interfaces';
import { IIssueComment } from './interfaces/IDeploymentGateService';

/**
 * Default words that count as approval
 */
export const DEFAULT_APPROVED_WORDS: readonly string[] = ['approved', 'approve', 'lgtm', 'yes'];

/**
 * Default words that count as denial
 */
export const DEFAULT_DENIED_WORDS: readonly string[] = ['denied', 'deny', 'no'];

/**
 * Check if a comment body matches any keyword in the list.
 * Matching rules (from the original manual-approval action):
 * - Case insensitive
 * - Must be the entire comment body (not embedded in a sentence)
 * - Allows trailing periods, exclamation marks, whitespace, and newlines
 *
 * @param body - The comment body text
 * @param words - Keywords to match against
 * @returns true if the body matches any keyword
 */
export function matchesKeyword(body: string, words: readonly string[]): boolean {
  return words.some(word => {
    const pattern = new RegExp(`^${escapeRegExp(word)}[.!]*\\s*$`, 'i');
    return pattern.test(body.trim());
  });
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Evaluate issue comments to determine the approval status.
 *
 * Algorithm:
 * - Only comments from authorized approvers are considered (case-insensitive username match)
 * - First denial from any approver immediately denies the entire request
 * - Approvals accumulate until minimumApprovals is reached
 * - If minimumApprovals is 0, ALL approvers must approve
 * - Comments that don't match any keyword are ignored
 *
 * @param comments - Issue comments in chronological order
 * @param approvers - List of authorized approver usernames
 * @param minimumApprovals - Required approval count (0 = all approvers)
 * @param approvedWords - Words that count as approval
 * @param deniedWords - Words that count as denial
 * @returns Approval result with status and who approved/denied
 */
export function evaluateComments(
  comments: IIssueComment[],
  approvers: readonly string[],
  minimumApprovals: number,
  approvedWords: readonly string[],
  deniedWords: readonly string[],
): IApprovalResult {
  const requiredApprovals = minimumApprovals > 0 ? minimumApprovals : approvers.length;
  const approvedBy: string[] = [];

  for (const comment of comments) {
    const isApprover = approvers.some(
      approver => approver.toLowerCase() === comment.user.toLowerCase(),
    );

    if (!isApprover) {
      continue;
    }

    if (matchesKeyword(comment.body, deniedWords)) {
      return { status: ApprovalStatus.Denied, approvedBy, deniedBy: comment.user };
    }

    if (matchesKeyword(comment.body, approvedWords)) {
      if (!approvedBy.some(u => u.toLowerCase() === comment.user.toLowerCase())) {
        approvedBy.push(comment.user);
      }

      if (approvedBy.length >= requiredApprovals) {
        return { status: ApprovalStatus.Approved, approvedBy };
      }
    }
  }

  return { status: ApprovalStatus.Pending, approvedBy };
}
