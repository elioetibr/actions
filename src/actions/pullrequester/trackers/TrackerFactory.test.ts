import type { Octokit } from '@octokit/rest';
import type { LinearClient } from '@linear/sdk';
import type { Version3Client } from 'jira.js';
import { TrackerFactory } from './TrackerFactory';
import { GitHubIssueTracker } from './GitHubIssueTracker';
import { LinearIssueTracker } from './LinearIssueTracker';
import { JiraIssueTracker } from './JiraIssueTracker';
import type { TrackerCredentials } from '../interfaces';

describe('TrackerFactory', () => {
  describe('validateCredentials', () => {
    it('should pass for github with all required fields', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'github',
          token: 'tok',
          owner: 'o',
          repo: 'r',
        }),
      ).not.toThrow();
    });

    it('should throw for github without token', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'github',
          token: '',
          owner: 'o',
          repo: 'r',
        }),
      ).toThrow('requires a token');
    });

    it('should throw for github without owner', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'github',
          token: 'tok',
          owner: '',
          repo: 'r',
        }),
      ).toThrow('requires an owner');
    });

    it('should throw for github without repo', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'github',
          token: 'tok',
          owner: 'o',
          repo: '',
        }),
      ).toThrow('requires a repo');
    });

    it('should pass for linear with api key', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'linear',
          linearApiKey: 'key',
          linearTeamKey: 'team',
        }),
      ).not.toThrow();
    });

    it('should throw for linear without api key', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'linear',
          linearApiKey: '',
          linearTeamKey: 'team',
        }),
      ).toThrow('requires linear-api-key');
    });

    it('should pass for jira with all required fields', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'jira',
          jiraBaseUrl: 'https://test.atlassian.net',
          jiraUserEmail: 'user@test.com',
          jiraApiToken: 'token',
        }),
      ).not.toThrow();
    });

    it('should throw for jira without base url', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'jira',
          jiraBaseUrl: '',
          jiraUserEmail: 'user@test.com',
          jiraApiToken: 'token',
        }),
      ).toThrow('requires jira-base-url');
    });

    it('should throw for jira without email', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'jira',
          jiraBaseUrl: 'https://test.atlassian.net',
          jiraUserEmail: '',
          jiraApiToken: 'token',
        }),
      ).toThrow('requires jira-user-email');
    });

    it('should throw for jira without api token', () => {
      expect(() =>
        TrackerFactory.validateCredentials({
          type: 'jira',
          jiraBaseUrl: 'https://test.atlassian.net',
          jiraUserEmail: 'user@test.com',
          jiraApiToken: '',
        }),
      ).toThrow('requires jira-api-token');
    });

    it('should throw for unknown tracker type via assertNever', () => {
      const badCredentials = { type: 'unknown' } as unknown as TrackerCredentials;
      expect(() => TrackerFactory.validateCredentials(badCredentials)).toThrow(/Unexpected value/);
    });
  });

  describe('create', () => {
    const mockOctokit = { rest: {} } as unknown as Octokit;
    const mockLinearClient = {} as unknown as LinearClient;
    const mockJiraClient = {} as unknown as Version3Client;

    it('should create GitHubIssueTracker', () => {
      const tracker = TrackerFactory.create(
        { type: 'github', token: 'tok', owner: 'o', repo: 'r' },
        { octokit: mockOctokit },
      );
      expect(tracker).toBeInstanceOf(GitHubIssueTracker);
      expect(tracker.type).toBe('github');
    });

    it('should create LinearIssueTracker', () => {
      const tracker = TrackerFactory.create(
        { type: 'linear', linearApiKey: 'key', linearTeamKey: 'team' },
        { linearClient: mockLinearClient },
      );
      expect(tracker).toBeInstanceOf(LinearIssueTracker);
      expect(tracker.type).toBe('linear');
    });

    it('should create JiraIssueTracker', () => {
      const tracker = TrackerFactory.create(
        {
          type: 'jira',
          jiraBaseUrl: 'https://test.atlassian.net',
          jiraUserEmail: 'u',
          jiraApiToken: 't',
        },
        { jiraClient: mockJiraClient },
      );
      expect(tracker).toBeInstanceOf(JiraIssueTracker);
      expect(tracker.type).toBe('jira');
    });

    it('should throw when github octokit is missing', () => {
      expect(() =>
        TrackerFactory.create({ type: 'github', token: 'tok', owner: 'o', repo: 'r' }, {}),
      ).toThrow('requires an Octokit instance');
    });

    it('should throw when linear client is missing', () => {
      expect(() =>
        TrackerFactory.create({ type: 'linear', linearApiKey: 'key', linearTeamKey: 'team' }, {}),
      ).toThrow('requires a LinearClient instance');
    });

    it('should throw when jira client is missing', () => {
      expect(() =>
        TrackerFactory.create(
          {
            type: 'jira',
            jiraBaseUrl: 'https://t.net',
            jiraUserEmail: 'u',
            jiraApiToken: 't',
          },
          {},
        ),
      ).toThrow('requires a Version3Client instance');
    });

    it('should throw for unknown tracker type via assertNever in create switch', () => {
      // Mock validateCredentials to pass so we reach the create switch's default branch
      const spy = jest.spyOn(TrackerFactory, 'validateCredentials').mockImplementation(() => {});
      const badCredentials = { type: 'unknown' } as unknown as TrackerCredentials;
      expect(() => TrackerFactory.create(badCredentials, {})).toThrow(/Unexpected value/);
      spy.mockRestore();
    });
  });
});
