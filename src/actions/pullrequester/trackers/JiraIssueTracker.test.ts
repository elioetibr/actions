import type { Version3Client } from 'jira.js';
import { JiraIssueTracker } from './JiraIssueTracker';
import type { IIssueKey } from '../interfaces';

const TEST_KEY: IIssueKey = { tracker: 'jira', project: 'PROJ', number: 123, raw: 'PROJ-123' };

function createMockClient() {
  return {
    issues: {
      getIssue: jest.fn(),
      getTransitions: jest.fn(),
      doTransition: jest.fn(),
    },
    issueComments: {
      getComments: jest.fn(),
      addComment: jest.fn(),
      updateComment: jest.fn(),
    },
    issueRemoteLinks: {
      createOrUpdateRemoteIssueLink: jest.fn(),
    },
  };
}

describe('JiraIssueTracker', () => {
  let client: ReturnType<typeof createMockClient>;
  let tracker: JiraIssueTracker;

  beforeEach(() => {
    client = createMockClient();
    tracker = new JiraIssueTracker(
      client as unknown as Version3Client,
      'https://test.atlassian.net',
    );
  });

  describe('type', () => {
    it('should be jira', () => {
      expect(tracker.type).toBe('jira');
    });
  });

  describe('findIssue', () => {
    it('should find issue by key', async () => {
      client.issues.getIssue.mockResolvedValue({
        fields: {
          summary: 'Fix login timeout',
          status: { name: 'In Progress' },
          labels: ['bug', 'critical'],
        },
      });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result).toEqual({
        key: 'PROJ-123',
        title: 'Fix login timeout',
        status: 'In Progress',
        url: 'https://test.atlassian.net/browse/PROJ-123',
        labels: ['bug', 'critical'],
      });
    });

    it('should return undefined on 404 error', async () => {
      client.issues.getIssue.mockRejectedValue({ status: 404 });
      expect(await tracker.findIssue(TEST_KEY)).toBeUndefined();
    });

    it('should re-throw non-404 errors', async () => {
      const serverError = { status: 500, message: 'Internal Server Error' };
      client.issues.getIssue.mockRejectedValue(serverError);
      await expect(tracker.findIssue(TEST_KEY)).rejects.toEqual(serverError);
    });

    it('should re-throw errors without status property', async () => {
      const plainError = new Error('Network failure');
      client.issues.getIssue.mockRejectedValue(plainError);
      await expect(tracker.findIssue(TEST_KEY)).rejects.toThrow('Network failure');
    });

    it('should handle missing fields', async () => {
      client.issues.getIssue.mockResolvedValue({ fields: {} });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.title).toBe('');
      expect(result?.status).toBe('Unknown');
      expect(result?.labels).toEqual([]);
    });

    it('should handle null status', async () => {
      client.issues.getIssue.mockResolvedValue({
        fields: { summary: 'test', status: null, labels: [] },
      });
      const result = await tracker.findIssue(TEST_KEY);
      expect(result?.status).toBe('Unknown');
    });
  });

  describe('linkPullRequest', () => {
    it('should create remote link with globalId', async () => {
      await tracker.linkPullRequest(TEST_KEY, 'https://github.com/pr/1', 'PR #1', 1);
      expect(client.issueRemoteLinks.createOrUpdateRemoteIssueLink).toHaveBeenCalledWith({
        issueIdOrKey: 'PROJ-123',
        globalId: 'github-pr-1',
        object: {
          url: 'https://github.com/pr/1',
          title: 'PR #1',
          icon: { url16x16: 'https://github.com/favicon.ico', title: 'GitHub' },
        },
      });
    });
  });

  describe('upsertComment', () => {
    it('should create new comment when none exists', async () => {
      client.issueComments.getComments.mockResolvedValue({ comments: [] });
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'marker');
      expect(result).toBe(false);
      expect(client.issueComments.addComment).toHaveBeenCalledWith({
        issueIdOrKey: 'PROJ-123',
        comment: expect.objectContaining({ type: 'doc', version: 1 }),
      });
    });

    it('should update existing comment with matching marker', async () => {
      client.issueComments.getComments.mockResolvedValue({
        comments: [
          {
            id: 'comment-1',
            body: {
              type: 'doc',
              version: 1,
              content: [{ content: [{ text: '<!-- pullrequester-id: marker -->\nOld' }] }],
            },
          },
        ],
      });
      const result = await tracker.upsertComment(TEST_KEY, 'New', 'marker');
      expect(result).toBe(true);
      expect(client.issueComments.updateComment).toHaveBeenCalledWith({
        issueIdOrKey: 'PROJ-123',
        id: 'comment-1',
        body: expect.objectContaining({ type: 'doc' }),
      });
    });

    it('should handle comments with no body', async () => {
      client.issueComments.getComments.mockResolvedValue({
        comments: [{ id: 'c1', body: null }],
      });
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'marker');
      expect(result).toBe(false);
    });

    it('should handle ADF body with no content array', async () => {
      client.issueComments.getComments.mockResolvedValue({
        comments: [{ id: 'c2', body: { type: 'doc', version: 1 } }],
      });
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'marker');
      expect(result).toBe(false);
    });

    it('should handle ADF blocks with no content array', async () => {
      client.issueComments.getComments.mockResolvedValue({
        comments: [{ id: 'c3', body: { type: 'doc', version: 1, content: [{}] } }],
      });
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'marker');
      expect(result).toBe(false);
    });

    it('should handle ADF inline nodes with undefined text', async () => {
      client.issueComments.getComments.mockResolvedValue({
        comments: [
          {
            id: 'c4',
            body: {
              type: 'doc',
              version: 1,
              content: [{ content: [{ type: 'hardBreak' }] }],
            },
          },
        ],
      });
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'marker');
      expect(result).toBe(false);
    });

    it('should handle null comments array', async () => {
      client.issueComments.getComments.mockResolvedValue({});
      const result = await tracker.upsertComment(TEST_KEY, 'Hello', 'marker');
      expect(result).toBe(false);
    });

    it('should handle existing comment without id', async () => {
      client.issueComments.getComments.mockResolvedValue({
        comments: [
          {
            body: {
              type: 'doc',
              version: 1,
              content: [{ content: [{ text: '<!-- pullrequester-id: marker -->\nOld' }] }],
            },
          },
        ],
      });
      const result = await tracker.upsertComment(TEST_KEY, 'New', 'marker');
      expect(result).toBe(false);
      expect(client.issueComments.addComment).toHaveBeenCalled();
    });
  });

  describe('transitionIssue', () => {
    it('should transition using dynamically fetched transition ID', async () => {
      client.issues.getTransitions.mockResolvedValue({
        transitions: [
          { id: '11', name: 'To Do' },
          { id: '21', name: 'In Review' },
          { id: '31', name: 'Done' },
        ],
      });
      await tracker.transitionIssue(TEST_KEY, 'In Review');
      expect(client.issues.doTransition).toHaveBeenCalledWith({
        issueIdOrKey: 'PROJ-123',
        transition: { id: '21' },
      });
    });

    it('should match transition name case-insensitively', async () => {
      client.issues.getTransitions.mockResolvedValue({
        transitions: [{ id: '21', name: 'In Review' }],
      });
      await tracker.transitionIssue(TEST_KEY, 'in review');
      expect(client.issues.doTransition).toHaveBeenCalledWith({
        issueIdOrKey: 'PROJ-123',
        transition: { id: '21' },
      });
    });

    it('should throw when transition not found', async () => {
      client.issues.getTransitions.mockResolvedValue({
        transitions: [{ id: '11', name: 'To Do' }],
      });
      await expect(tracker.transitionIssue(TEST_KEY, 'Nonexistent')).rejects.toThrow(
        /Cannot transition PROJ-123 to "Nonexistent"/,
      );
    });

    it('should throw with available transitions in error message', async () => {
      client.issues.getTransitions.mockResolvedValue({
        transitions: [
          { id: '11', name: 'To Do' },
          { id: '31', name: 'Done' },
        ],
      });
      await expect(tracker.transitionIssue(TEST_KEY, 'Nonexistent')).rejects.toThrow(
        /Available: To Do, Done/,
      );
    });

    it('should handle null transitions', async () => {
      client.issues.getTransitions.mockResolvedValue({});
      await expect(tracker.transitionIssue(TEST_KEY, 'Done')).rejects.toThrow(
        /transition not found/,
      );
    });
  });

  describe('getLabels', () => {
    it('should return labels from issue', async () => {
      client.issues.getIssue.mockResolvedValue({
        fields: { summary: 'test', status: { name: 'Open' }, labels: ['bug'] },
      });
      const labels = await tracker.getLabels(TEST_KEY);
      expect(labels).toEqual(['bug']);
    });

    it('should return empty array when issue not found (404)', async () => {
      client.issues.getIssue.mockRejectedValue({ status: 404 });
      expect(await tracker.getLabels(TEST_KEY)).toEqual([]);
    });
  });
});
