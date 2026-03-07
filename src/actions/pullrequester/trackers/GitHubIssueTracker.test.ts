import type { Octokit } from '@octokit/rest';
import { GitHubIssueTracker } from './GitHubIssueTracker';
import type { IIssueKey } from '../interfaces';

// Mock Octokit structure
function createMockOctokit() {
  return {
    rest: {
      issues: {
        get: jest.fn(),
        listComments: jest.fn(),
        createComment: jest.fn(),
        updateComment: jest.fn(),
        update: jest.fn(),
      },
      pulls: {
        get: jest.fn(),
        update: jest.fn(),
      },
    },
  };
}

const TEST_KEY: IIssueKey = { tracker: 'github', project: '', number: 42, raw: '#42' };

describe('GitHubIssueTracker', () => {
  let octokit: ReturnType<typeof createMockOctokit>;
  let tracker: GitHubIssueTracker;

  beforeEach(() => {
    octokit = createMockOctokit();
    tracker = new GitHubIssueTracker(octokit as unknown as Octokit, 'owner', 'repo');
  });

  it('should have type "github"', () => {
    expect(tracker.type).toBe('github');
  });

  describe('findIssue', () => {
    it('should return issue when found', async () => {
      octokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'Fix bug',
          state: 'open',
          html_url: 'https://github.com/owner/repo/issues/42',
          labels: [{ name: 'bug' }, { name: 'priority-high' }],
        },
      });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result).toEqual({
        key: '#42',
        title: 'Fix bug',
        status: 'open',
        url: 'https://github.com/owner/repo/issues/42',
        labels: ['bug', 'priority-high'],
      });
      expect(octokit.rest.issues.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 42,
      });
    });

    it('should return undefined when issue not found (404)', async () => {
      octokit.rest.issues.get.mockRejectedValue({ status: 404 });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result).toBeUndefined();
    });

    it('should re-throw non-404 errors', async () => {
      const serverError = { status: 500, message: 'Internal Server Error' };
      octokit.rest.issues.get.mockRejectedValue(serverError);
      await expect(tracker.findIssue(TEST_KEY)).rejects.toEqual(serverError);
    });

    it('should re-throw errors without status property', async () => {
      const plainError = new Error('Network failure');
      octokit.rest.issues.get.mockRejectedValue(plainError);
      await expect(tracker.findIssue(TEST_KEY)).rejects.toThrow('Network failure');
    });

    it('should handle string labels', async () => {
      octokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'test',
          state: 'open',
          html_url: 'https://example.com',
          labels: ['bug', 'high'],
        },
      });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.labels).toEqual(['bug', 'high']);
    });

    it('should filter out labels with empty names', async () => {
      octokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'test',
          state: 'open',
          html_url: 'https://example.com',
          labels: [{ name: 'bug' }, { name: '' }, { name: undefined }],
        },
      });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.labels).toEqual(['bug']);
    });

    it('should handle labels with no name property', async () => {
      octokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'test',
          state: 'open',
          html_url: 'https://example.com',
          labels: [{ id: 1 }],
        },
      });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.labels).toEqual([]);
    });
  });

  describe('linkPullRequest', () => {
    it('should append Closes #N to PR body', async () => {
      octokit.rest.pulls.get.mockResolvedValue({ data: { body: 'Initial body' } });
      await tracker.linkPullRequest(TEST_KEY, 'https://pr', 'PR title', 1);
      expect(octokit.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        body: 'Initial body\n\nCloses #42',
      });
    });

    it('should handle null PR body', async () => {
      octokit.rest.pulls.get.mockResolvedValue({ data: { body: null } });
      await tracker.linkPullRequest(TEST_KEY, 'https://pr', 'PR title', 1);
      expect(octokit.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        body: 'Closes #42',
      });
    });

    it('should handle empty string PR body', async () => {
      octokit.rest.pulls.get.mockResolvedValue({ data: { body: '' } });
      await tracker.linkPullRequest(TEST_KEY, 'https://pr', 'PR title', 1);
      expect(octokit.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        body: 'Closes #42',
      });
    });

    it('should not duplicate Closes #N if already present', async () => {
      octokit.rest.pulls.get.mockResolvedValue({ data: { body: 'Closes #42' } });
      await tracker.linkPullRequest(TEST_KEY, 'https://pr', 'PR title', 1);
      expect(octokit.rest.pulls.update).not.toHaveBeenCalled();
    });

    it('should not duplicate when Closes #N is embedded in longer body', async () => {
      octokit.rest.pulls.get.mockResolvedValue({
        data: { body: 'Some description\n\nCloses #42\nMore text' },
      });
      await tracker.linkPullRequest(TEST_KEY, 'https://pr', 'PR title', 1);
      expect(octokit.rest.pulls.update).not.toHaveBeenCalled();
    });
  });

  describe('upsertComment', () => {
    it('should create new comment when none exists', async () => {
      octokit.rest.issues.listComments.mockResolvedValue({ data: [] });
      const updated = await tracker.upsertComment(TEST_KEY, 'Hello', 'test-marker');
      expect(updated).toBe(false);
      expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 42,
        body: expect.stringContaining('Hello'),
      });
      expect(octokit.rest.issues.createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('<!-- pullrequester-id: test-marker -->'),
        }),
      );
    });

    it('should update existing comment with matching marker', async () => {
      octokit.rest.issues.listComments.mockResolvedValue({
        data: [{ id: 99, body: '<!-- pullrequester-id: test-marker -->\nOld content' }],
      });
      const updated = await tracker.upsertComment(TEST_KEY, 'New content', 'test-marker');
      expect(updated).toBe(true);
      expect(octokit.rest.issues.updateComment).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        comment_id: 99,
        body: expect.stringContaining('New content'),
      });
      expect(octokit.rest.issues.createComment).not.toHaveBeenCalled();
    });

    it('should not match comments with different marker', async () => {
      octokit.rest.issues.listComments.mockResolvedValue({
        data: [{ id: 99, body: '<!-- pullrequester-id: other-marker -->\nOld' }],
      });
      const updated = await tracker.upsertComment(TEST_KEY, 'Hello', 'test-marker');
      expect(updated).toBe(false);
      expect(octokit.rest.issues.createComment).toHaveBeenCalled();
    });

    it('should handle comments with no body', async () => {
      octokit.rest.issues.listComments.mockResolvedValue({
        data: [{ id: 50, body: undefined }],
      });
      const updated = await tracker.upsertComment(TEST_KEY, 'Hello', 'test-marker');
      expect(updated).toBe(false);
      expect(octokit.rest.issues.createComment).toHaveBeenCalled();
    });

    it('should include marker in the comment body when creating', async () => {
      octokit.rest.issues.listComments.mockResolvedValue({ data: [] });
      await tracker.upsertComment(TEST_KEY, 'Content here', 'my-id');
      const createdBody = octokit.rest.issues.createComment.mock.calls[0][0].body as string;
      expect(createdBody).toBe('<!-- pullrequester-id: my-id -->\nContent here');
    });

    it('should include marker in the comment body when updating', async () => {
      octokit.rest.issues.listComments.mockResolvedValue({
        data: [{ id: 10, body: '<!-- pullrequester-id: my-id -->\nOld' }],
      });
      await tracker.upsertComment(TEST_KEY, 'Updated', 'my-id');
      const updatedBody = octokit.rest.issues.updateComment.mock.calls[0][0].body as string;
      expect(updatedBody).toBe('<!-- pullrequester-id: my-id -->\nUpdated');
    });
  });

  describe('transitionIssue', () => {
    it('should close issue when target is "closed"', async () => {
      await tracker.transitionIssue(TEST_KEY, 'closed');
      expect(octokit.rest.issues.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 42,
        state: 'closed',
      });
    });

    it('should close issue when target is "Closed" (case-insensitive)', async () => {
      await tracker.transitionIssue(TEST_KEY, 'Closed');
      expect(octokit.rest.issues.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 42,
        state: 'closed',
      });
    });

    it('should open issue for any other state', async () => {
      await tracker.transitionIssue(TEST_KEY, 'In Review');
      expect(octokit.rest.issues.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 42,
        state: 'open',
      });
    });

    it('should open issue for "open" state', async () => {
      await tracker.transitionIssue(TEST_KEY, 'open');
      expect(octokit.rest.issues.update).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 42,
        state: 'open',
      });
    });
  });

  describe('getLabels', () => {
    it('should return labels from issue', async () => {
      octokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'test',
          state: 'open',
          html_url: 'https://example.com',
          labels: [{ name: 'bug' }],
        },
      });
      const labels = await tracker.getLabels(TEST_KEY);
      expect(labels).toEqual(['bug']);
    });

    it('should return empty array when issue not found (404)', async () => {
      octokit.rest.issues.get.mockRejectedValue({ status: 404 });
      const labels = await tracker.getLabels(TEST_KEY);
      expect(labels).toEqual([]);
    });

    it('should return multiple labels', async () => {
      octokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 42,
          title: 'test',
          state: 'open',
          html_url: 'https://example.com',
          labels: [{ name: 'bug' }, { name: 'enhancement' }, { name: 'docs' }],
        },
      });
      const labels = await tracker.getLabels(TEST_KEY);
      expect(labels).toEqual(['bug', 'enhancement', 'docs']);
    });
  });
});
