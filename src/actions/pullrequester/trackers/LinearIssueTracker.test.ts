import type { LinearClient } from '@linear/sdk';
import { LinearIssueTracker } from './LinearIssueTracker';
import type { IIssueKey } from '../interfaces';

const TEST_KEY: IIssueKey = { tracker: 'linear', project: 'ENG', number: 123, raw: 'ENG-123' };

function createMockIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'issue-id-1',
    title: 'Add OAuth support',
    url: 'https://linear.app/team/issue/ENG-123',
    state: Promise.resolve({ name: 'In Progress', id: 'state-1' }),
    team: Promise.resolve({
      states: jest.fn().mockResolvedValue({
        nodes: [
          { name: 'Backlog', id: 'state-backlog' },
          { name: 'In Progress', id: 'state-progress' },
          { name: 'In Review', id: 'state-review' },
          { name: 'Done', id: 'state-done' },
        ],
      }),
    }),
    labels: jest.fn().mockResolvedValue({
      nodes: [{ name: 'feature' }, { name: 'auth' }],
    }),
    comments: jest.fn().mockResolvedValue({
      nodes: [],
    }),
    update: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function createMockClient(issue = createMockIssue()) {
  return {
    issue: jest.fn().mockResolvedValue(issue),
    createAttachment: jest.fn().mockResolvedValue({}),
    createComment: jest.fn().mockResolvedValue({}),
  };
}

describe('LinearIssueTracker', () => {
  let client: ReturnType<typeof createMockClient>;
  let tracker: LinearIssueTracker;

  beforeEach(() => {
    client = createMockClient();
    tracker = new LinearIssueTracker(client as unknown as LinearClient);
  });

  it('should have type "linear"', () => {
    expect(tracker.type).toBe('linear');
  });

  describe('findIssue', () => {
    it('should find issue by team key and number', async () => {
      const result = await tracker.findIssue(TEST_KEY);
      expect(client.issue).toHaveBeenCalledWith('ENG-123');
      expect(result).toEqual({
        key: 'ENG-123',
        title: 'Add OAuth support',
        status: 'In Progress',
        url: 'https://linear.app/team/issue/ENG-123',
        labels: ['feature', 'auth'],
      });
    });

    it('should return undefined when client resolves to null', async () => {
      client.issue.mockResolvedValue(null);
      const result = await tracker.findIssue(TEST_KEY);
      expect(result).toBeUndefined();
    });

    it('should return undefined on error', async () => {
      client.issue.mockRejectedValue(new Error('Not found'));
      const result = await tracker.findIssue(TEST_KEY);
      expect(result).toBeUndefined();
    });

    it('should handle issue with no state', async () => {
      const issue = createMockIssue({ state: Promise.resolve(null) });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.status).toBe('Unknown');
    });

    it('should handle issue with undefined state', async () => {
      const issue = createMockIssue({ state: Promise.resolve(undefined) });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.status).toBe('Unknown');
    });

    it('should handle issue with no labels', async () => {
      const issue = createMockIssue({
        labels: jest.fn().mockResolvedValue({ nodes: [] }),
      });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.labels).toEqual([]);
    });
  });

  describe('linkPullRequest', () => {
    it('should create attachment on the issue', async () => {
      await tracker.linkPullRequest(TEST_KEY, 'https://github.com/pr/1', 'PR #1: feat', 1);
      expect(client.issue).toHaveBeenCalledWith('ENG-123');
      expect(client.createAttachment).toHaveBeenCalledWith({
        issueId: 'issue-id-1',
        url: 'https://github.com/pr/1',
        title: 'PR #1: feat',
        subtitle: 'Pull Request',
        iconUrl: 'https://github.com/favicon.ico',
      });
    });

    it('should throw when issue is null', async () => {
      client.issue.mockResolvedValue(null);
      await expect(
        tracker.linkPullRequest(TEST_KEY, 'https://github.com/pr/1', 'PR #1', 1),
      ).rejects.toThrow('Linear issue ENG-123 not found');
    });
  });

  describe('upsertComment', () => {
    it('should create new comment when none exists', async () => {
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'test-marker');
      expect(result).toBe(false);
      expect(client.createComment).toHaveBeenCalledWith({
        issueId: 'issue-id-1',
        body: expect.stringContaining('Hello'),
      });
    });

    it('should include marker in new comment body', async () => {
      await tracker.upsertComment(TEST_KEY, 'Content here', 'my-id');
      expect(client.createComment).toHaveBeenCalledWith({
        issueId: 'issue-id-1',
        body: '<!-- pullrequester-id: my-id -->\nContent here',
      });
    });

    it('should update existing comment with matching marker', async () => {
      const existingComment = {
        body: '<!-- pullrequester-id: test-marker -->\nOld content',
        update: jest.fn().mockResolvedValue({}),
      };
      const issue = createMockIssue({
        comments: jest.fn().mockResolvedValue({ nodes: [existingComment] }),
      });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);

      const result = await tracker.upsertComment(TEST_KEY, 'New content', 'test-marker');
      expect(result).toBe(true);
      expect(existingComment.update).toHaveBeenCalledWith({
        body: expect.stringContaining('New content'),
      });
      expect(client.createComment).not.toHaveBeenCalled();
    });

    it('should include marker in updated comment body', async () => {
      const existingComment = {
        body: '<!-- pullrequester-id: my-id -->\nOld',
        update: jest.fn().mockResolvedValue({}),
      };
      const issue = createMockIssue({
        comments: jest.fn().mockResolvedValue({ nodes: [existingComment] }),
      });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);

      await tracker.upsertComment(TEST_KEY, 'Updated', 'my-id');
      expect(existingComment.update).toHaveBeenCalledWith({
        body: '<!-- pullrequester-id: my-id -->\nUpdated',
      });
    });

    it('should not match comments with different marker', async () => {
      const otherComment = {
        body: '<!-- pullrequester-id: other-marker -->\nOld',
        update: jest.fn(),
      };
      const issue = createMockIssue({
        comments: jest.fn().mockResolvedValue({ nodes: [otherComment] }),
      });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);

      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'test-marker');
      expect(result).toBe(false);
      expect(client.createComment).toHaveBeenCalled();
      expect(otherComment.update).not.toHaveBeenCalled();
    });

    it('should handle comments with no body', async () => {
      const commentWithNoBody = {
        body: undefined,
        update: jest.fn(),
      };
      const issue = createMockIssue({
        comments: jest.fn().mockResolvedValue({ nodes: [commentWithNoBody] }),
      });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);

      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'test-marker');
      expect(result).toBe(false);
      expect(client.createComment).toHaveBeenCalled();
    });
  });

  describe('transitionIssue', () => {
    it('should transition to matching state', async () => {
      const issue = createMockIssue();
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);

      await tracker.transitionIssue(TEST_KEY, 'In Review');
      expect(issue.update).toHaveBeenCalledWith({ stateId: 'state-review' });
    });

    it('should match state case-insensitively', async () => {
      const issue = createMockIssue();
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);

      await tracker.transitionIssue(TEST_KEY, 'in review');
      expect(issue.update).toHaveBeenCalledWith({ stateId: 'state-review' });
    });

    it('should throw when state not found', async () => {
      await expect(tracker.transitionIssue(TEST_KEY, 'Nonexistent')).rejects.toThrow(
        /Cannot transition ENG-123 to "Nonexistent": state not found/,
      );
    });

    it('should list available states in error message', async () => {
      await expect(tracker.transitionIssue(TEST_KEY, 'Nonexistent')).rejects.toThrow(
        /Available: Backlog, In Progress, In Review, Done/,
      );
    });

    it('should throw when issue has no team', async () => {
      const issue = createMockIssue({ team: Promise.resolve(null) });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);
      await expect(tracker.transitionIssue(TEST_KEY, 'Done')).rejects.toThrow(
        /Cannot transition ENG-123: issue has no team/,
      );
    });

    it('should throw when issue has undefined team', async () => {
      const issue = createMockIssue({ team: Promise.resolve(undefined) });
      client = createMockClient(issue);
      tracker = new LinearIssueTracker(client as unknown as LinearClient);
      await expect(tracker.transitionIssue(TEST_KEY, 'Done')).rejects.toThrow(/has no team/);
    });
  });

  describe('getLabels', () => {
    it('should return labels from issue', async () => {
      const labels = await tracker.getLabels(TEST_KEY);
      expect(labels).toEqual(['feature', 'auth']);
    });

    it('should return empty array when issue not found', async () => {
      client.issue.mockRejectedValue(new Error('Not found'));
      const labels = await tracker.getLabels(TEST_KEY);
      expect(labels).toEqual([]);
    });
  });
});
