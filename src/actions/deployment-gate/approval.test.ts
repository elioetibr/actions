import {
  DEFAULT_APPROVED_WORDS,
  DEFAULT_DENIED_WORDS,
  evaluateComments,
  matchesKeyword,
} from './approval';
import { ApprovalStatus } from './interfaces';
import { IIssueComment } from './interfaces/IDeploymentGateService';

describe('matchesKeyword', () => {
  const approvedWords = DEFAULT_APPROVED_WORDS;

  it('matches exact keyword', () => {
    expect(matchesKeyword('approved', approvedWords)).toBe(true);
    expect(matchesKeyword('approve', approvedWords)).toBe(true);
    expect(matchesKeyword('lgtm', approvedWords)).toBe(true);
    expect(matchesKeyword('yes', approvedWords)).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(matchesKeyword('APPROVED', approvedWords)).toBe(true);
    expect(matchesKeyword('Approved', approvedWords)).toBe(true);
    expect(matchesKeyword('LGTM', approvedWords)).toBe(true);
    expect(matchesKeyword('Yes', approvedWords)).toBe(true);
  });

  it('matches with trailing periods and exclamation marks', () => {
    expect(matchesKeyword('approved!', approvedWords)).toBe(true);
    expect(matchesKeyword('approved.', approvedWords)).toBe(true);
    expect(matchesKeyword('approved!!', approvedWords)).toBe(true);
    expect(matchesKeyword('approved...', approvedWords)).toBe(true);
    expect(matchesKeyword('lgtm!.', approvedWords)).toBe(true);
  });

  it('matches with trailing whitespace and newlines', () => {
    expect(matchesKeyword('approved  ', approvedWords)).toBe(true);
    expect(matchesKeyword('approved\n', approvedWords)).toBe(true);
    expect(matchesKeyword('approved \n ', approvedWords)).toBe(true);
  });

  it('matches with leading whitespace (trimmed)', () => {
    expect(matchesKeyword('  approved', approvedWords)).toBe(true);
    expect(matchesKeyword('\napproved', approvedWords)).toBe(true);
  });

  it('does not match words embedded in sentences', () => {
    expect(matchesKeyword('I approved this', approvedWords)).toBe(false);
    expect(matchesKeyword('not approved', approvedWords)).toBe(false);
    expect(matchesKeyword('approved but needs changes', approvedWords)).toBe(false);
  });

  it('does not match with question marks', () => {
    expect(matchesKeyword('approved?', approvedWords)).toBe(false);
  });

  it('does not match empty string', () => {
    expect(matchesKeyword('', approvedWords)).toBe(false);
  });

  it('does not match unrelated text', () => {
    expect(matchesKeyword('looks good to me', approvedWords)).toBe(false);
    expect(matchesKeyword('ship it', approvedWords)).toBe(false);
  });

  it('handles custom keywords', () => {
    const custom = ['ship-it', '+1'];
    expect(matchesKeyword('ship-it', custom)).toBe(true);
    expect(matchesKeyword('+1', custom)).toBe(true);
    expect(matchesKeyword('SHIP-IT!', custom)).toBe(true);
  });

  it('escapes regex special characters in keywords', () => {
    const specialWords = ['approve+', 'ok(fine)'];
    expect(matchesKeyword('approve+', specialWords)).toBe(true);
    expect(matchesKeyword('ok(fine)', specialWords)).toBe(true);
    expect(matchesKeyword('approveX', specialWords)).toBe(false);
  });
});

describe('evaluateComments', () => {
  const approvers = ['alice', 'bob', 'charlie'];
  const approvedWords = DEFAULT_APPROVED_WORDS;
  const deniedWords = DEFAULT_DENIED_WORDS;

  function comment(user: string, body: string): IIssueComment {
    return { user, body };
  }

  describe('basic approval', () => {
    it('returns Approved when all approvers approve (minimumApprovals=0)', () => {
      const comments = [
        comment('alice', 'approved'),
        comment('bob', 'lgtm'),
        comment('charlie', 'yes'),
      ];
      const result = evaluateComments(comments, approvers, 0, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
      expect(result.approvedBy).toEqual(['alice', 'bob', 'charlie']);
    });

    it('returns Approved when minimum approvals met', () => {
      const comments = [comment('alice', 'approved'), comment('bob', 'approved')];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
      expect(result.approvedBy).toEqual(['alice', 'bob']);
    });

    it('returns Pending when not enough approvals', () => {
      const comments = [comment('alice', 'approved')];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Pending);
      expect(result.approvedBy).toEqual(['alice']);
    });

    it('returns Pending with no comments', () => {
      const result = evaluateComments([], approvers, 1, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Pending);
      expect(result.approvedBy).toEqual([]);
    });
  });

  describe('denial', () => {
    it('returns Denied on first denial', () => {
      const comments = [comment('alice', 'approved'), comment('bob', 'denied')];
      const result = evaluateComments(comments, approvers, 0, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Denied);
      expect(result.deniedBy).toBe('bob');
      expect(result.approvedBy).toEqual(['alice']);
    });

    it('first denial wins even if enough approvals exist after', () => {
      const comments = [
        comment('alice', 'denied'),
        comment('bob', 'approved'),
        comment('charlie', 'approved'),
      ];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Denied);
      expect(result.deniedBy).toBe('alice');
    });
  });

  describe('non-approver comments', () => {
    it('ignores comments from non-approvers', () => {
      const comments = [comment('stranger', 'approved'), comment('alice', 'approved')];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Pending);
      expect(result.approvedBy).toEqual(['alice']);
    });

    it('ignores denial from non-approvers', () => {
      const comments = [
        comment('stranger', 'denied'),
        comment('alice', 'approved'),
        comment('bob', 'approved'),
      ];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
      expect(result.approvedBy).toEqual(['alice', 'bob']);
    });
  });

  describe('case insensitivity', () => {
    it('matches approver usernames case-insensitively', () => {
      const comments = [comment('Alice', 'approved'), comment('BOB', 'approved')];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
      expect(result.approvedBy).toEqual(['Alice', 'BOB']);
    });
  });

  describe('deduplication', () => {
    it('counts each approver only once', () => {
      const comments = [
        comment('alice', 'approved'),
        comment('alice', 'approved'),
        comment('alice', 'lgtm'),
      ];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Pending);
      expect(result.approvedBy).toEqual(['alice']);
    });

    it('deduplicates case-insensitively', () => {
      const comments = [comment('Alice', 'approved'), comment('ALICE', 'approved')];
      const result = evaluateComments(comments, approvers, 2, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Pending);
      expect(result.approvedBy).toEqual(['Alice']);
    });
  });

  describe('irrelevant comments', () => {
    it('ignores comments that match no keyword', () => {
      const comments = [
        comment('alice', 'looks good'),
        comment('bob', 'what about this?'),
        comment('charlie', 'approved'),
      ];
      const result = evaluateComments(comments, approvers, 1, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
      expect(result.approvedBy).toEqual(['charlie']);
    });
  });

  describe('custom keywords', () => {
    it('supports additional approved words', () => {
      const customApproved = [...approvedWords, 'ship-it'];
      const comments = [comment('alice', 'ship-it')];
      const result = evaluateComments(comments, approvers, 1, customApproved, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
    });

    it('supports additional denied words', () => {
      const customDenied = [...deniedWords, 'nope'];
      const comments = [comment('alice', 'nope')];
      const result = evaluateComments(comments, approvers, 1, approvedWords, customDenied);
      expect(result.status).toBe(ApprovalStatus.Denied);
      expect(result.deniedBy).toBe('alice');
    });
  });

  describe('single approver', () => {
    it('approves with one approver and minimumApprovals=0', () => {
      const comments = [comment('alice', 'approved')];
      const result = evaluateComments(comments, ['alice'], 0, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
    });

    it('approves with one approver and minimumApprovals=1', () => {
      const comments = [comment('alice', 'approved')];
      const result = evaluateComments(comments, ['alice'], 1, approvedWords, deniedWords);
      expect(result.status).toBe(ApprovalStatus.Approved);
    });
  });
});
