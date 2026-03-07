import { PullRequesterBuilder } from './PullRequesterBuilder';
import type { IIssueTracker, IPullRequesterProvider } from './interfaces';
import type { IGitService } from './services/GitService';
import type { IOctokitPRClient } from './services/PullRequesterService';

// --- Minimal mocks for dependencies ---

function mockGit(): IGitService {
  return {
    hasChanges: jest.fn(),
    getChangedFiles: jest.fn(),
    createBranch: jest.fn(),
    commitChanges: jest.fn(),
    pushBranch: jest.fn(),
    hasDiffWithBase: jest.fn(),
    hasCollaboratorCommits: jest.fn(),
    hasConflictsWithBase: jest.fn(),
    getCommitLog: jest.fn(),
    configureCredentials: jest.fn(),
    configureUser: jest.fn(),
  };
}

function mockOctokit(): IOctokitPRClient {
  return {
    rest: {
      pulls: {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        requestReviewers: jest.fn(),
      },
      issues: {
        addLabels: jest.fn(),
        addAssignees: jest.fn(),
        update: jest.fn(),
      },
    },
  };
}

function mockTracker(): IIssueTracker {
  return {
    type: 'github',
    findIssue: jest.fn(),
    linkPullRequest: jest.fn(),
    upsertComment: jest.fn(),
    transitionIssue: jest.fn(),
    getLabels: jest.fn(),
  };
}

/** Create a builder pre-filled with all required dependencies */
function validBuilder(): PullRequesterBuilder {
  return PullRequesterBuilder.create()
    .withToken('ghp_test-token')
    .withBase('main')
    .withGitService(mockGit())
    .withOctokit(mockOctokit())
    .withOwner('test-owner')
    .withRepo('test-repo');
}

/**
 * Extract the private config from the built service for assertion.
 * The builder creates a PullRequesterService whose config is a private field.
 * We access it via type assertion to verify the builder passed values correctly.
 */
function extractConfig(service: unknown): IPullRequesterProvider {
  return (service as { config: IPullRequesterProvider }).config;
}

describe('PullRequesterBuilder', () => {
  describe('create', () => {
    it('should return a new builder instance', () => {
      const builder = PullRequesterBuilder.create();
      expect(builder).toBeInstanceOf(PullRequesterBuilder);
    });
  });

  describe('fluent chaining', () => {
    it('should support method chaining for all setters', () => {
      const builder = PullRequesterBuilder.create()
        .withToken('tok')
        .withBranch('my-branch')
        .withBase('main')
        .withTitle('My PR')
        .withBody('body text')
        .withBodyPath('/path/to/body')
        .withBodyTemplate('{{body}}')
        .withCommitMessage('chore: update')
        .withAuthor('Author <a@b.com>')
        .withCommitter('Committer <c@d.com>')
        .withSignoff(true)
        .withSignCommits(true)
        .withLabels(['bug'])
        .withAssignees(['alice'])
        .withReviewers(['bob'])
        .withTeamReviewers(['team-a'])
        .withMilestone(5)
        .withDraft('true')
        .withAddPaths(['src/'])
        .withDeleteBranch(true)
        .withMaintainerCanModify(false)
        .withSkipOnCollaboratorCommits(false)
        .withAutoBody(true)
        .withConflictLabel('conflict')
        .withAutoLabelFromIssue(true)
        .withCommentMarkerId('marker-id')
        .withProjectManagement('jira')
        .withIssueKeySource('branch')
        .withIssueLinkPr(true)
        .withIssueAddComment(true)
        .withIssueTransitionState('In Review')
        .withLinearApiKey('lin-key')
        .withLinearTeamKey('ENG')
        .withJiraBaseUrl('https://jira.test.com')
        .withJiraUserEmail('user@test.com')
        .withJiraApiToken('jira-tok')
        .withGitService(mockGit())
        .withOctokit(mockOctokit())
        .withTracker(mockTracker())
        .withOwner('owner')
        .withRepo('repo');

      expect(builder).toBeInstanceOf(PullRequesterBuilder);
    });
  });

  describe('build', () => {
    it('should build a service with default values', () => {
      const service = validBuilder().build();
      const config = extractConfig(service);

      expect(config.branch).toBe('pullrequester/patch');
      expect(config.base).toBe('main');
      expect(config.title).toBe('Automated changes');
      expect(config.body).toBe('');
      expect(config.bodyPath).toBe('');
      expect(config.bodyTemplate).toBe('');
      expect(config.commitMessage).toBe('Automated changes');
      expect(config.author).toBe(
        'github-actions[bot] <github-actions[bot]@users.noreply.github.com>',
      );
      expect(config.committer).toBe(
        'github-actions[bot] <github-actions[bot]@users.noreply.github.com>',
      );
      expect(config.signoff).toBe(false);
      expect(config.signCommits).toBe(false);
      expect(config.labels).toEqual([]);
      expect(config.assignees).toEqual([]);
      expect(config.reviewers).toEqual([]);
      expect(config.teamReviewers).toEqual([]);
      expect(config.milestone).toBe(0);
      expect(config.draft).toBe('false');
      expect(config.addPaths).toEqual([]);
      expect(config.deleteBranch).toBe(false);
      expect(config.maintainerCanModify).toBe(true);
      expect(config.skipOnCollaboratorCommits).toBe(true);
      expect(config.autoBody).toBe(false);
      expect(config.conflictLabel).toBe('');
      expect(config.autoLabelFromIssue).toBe(false);
      expect(config.commentMarkerId).toBe('pullrequester');
      expect(config.projectManagement).toBe('github');
      expect(config.issueKeySource).toBe('both');
      expect(config.issueLinkPr).toBe(false);
      expect(config.issueAddComment).toBe(false);
      expect(config.issueTransitionState).toBe('');
      expect(config.linearApiKey).toBe('');
      expect(config.linearTeamKey).toBe('');
      expect(config.jiraBaseUrl).toBe('');
      expect(config.jiraUserEmail).toBe('');
      expect(config.jiraApiToken).toBe('');
    });

    it('should build a service with all custom values', () => {
      const service = validBuilder()
        .withBranch('custom-branch')
        .withTitle('Custom Title')
        .withBody('Custom body')
        .withBodyPath('/custom/path')
        .withBodyTemplate('Template: {{body}}')
        .withCommitMessage('fix: custom')
        .withAuthor('Custom Author <custom@test.com>')
        .withCommitter('Custom Committer <committer@test.com>')
        .withSignoff(true)
        .withSignCommits(true)
        .withLabels(['bug', 'urgent'])
        .withAssignees(['alice', 'bob'])
        .withReviewers(['charlie'])
        .withTeamReviewers(['team-x'])
        .withMilestone(10)
        .withDraft('always-true')
        .withAddPaths(['src/', 'lib/'])
        .withDeleteBranch(true)
        .withMaintainerCanModify(false)
        .withSkipOnCollaboratorCommits(false)
        .withAutoBody(true)
        .withConflictLabel('has-conflicts')
        .withAutoLabelFromIssue(true)
        .withCommentMarkerId('custom-marker')
        .withProjectManagement('linear')
        .withIssueKeySource('commits')
        .withIssueLinkPr(true)
        .withIssueAddComment(true)
        .withIssueTransitionState('Done')
        .withLinearApiKey('linear-key')
        .withLinearTeamKey('TEAM')
        .withJiraBaseUrl('https://jira.custom.com')
        .withJiraUserEmail('custom@jira.com')
        .withJiraApiToken('jira-custom-token')
        .build();

      const config = extractConfig(service);

      expect(config.token).toBe('ghp_test-token');
      expect(config.branch).toBe('custom-branch');
      expect(config.base).toBe('main');
      expect(config.title).toBe('Custom Title');
      expect(config.body).toBe('Custom body');
      expect(config.bodyPath).toBe('/custom/path');
      expect(config.bodyTemplate).toBe('Template: {{body}}');
      expect(config.commitMessage).toBe('fix: custom');
      expect(config.author).toBe('Custom Author <custom@test.com>');
      expect(config.committer).toBe('Custom Committer <committer@test.com>');
      expect(config.signoff).toBe(true);
      expect(config.signCommits).toBe(true);
      expect(config.labels).toEqual(['bug', 'urgent']);
      expect(config.assignees).toEqual(['alice', 'bob']);
      expect(config.reviewers).toEqual(['charlie']);
      expect(config.teamReviewers).toEqual(['team-x']);
      expect(config.milestone).toBe(10);
      expect(config.draft).toBe('always-true');
      expect(config.addPaths).toEqual(['src/', 'lib/']);
      expect(config.deleteBranch).toBe(true);
      expect(config.maintainerCanModify).toBe(false);
      expect(config.skipOnCollaboratorCommits).toBe(false);
      expect(config.autoBody).toBe(true);
      expect(config.conflictLabel).toBe('has-conflicts');
      expect(config.autoLabelFromIssue).toBe(true);
      expect(config.commentMarkerId).toBe('custom-marker');
      expect(config.projectManagement).toBe('linear');
      expect(config.issueKeySource).toBe('commits');
      expect(config.issueLinkPr).toBe(true);
      expect(config.issueAddComment).toBe(true);
      expect(config.issueTransitionState).toBe('Done');
      expect(config.linearApiKey).toBe('linear-key');
      expect(config.linearTeamKey).toBe('TEAM');
      expect(config.jiraBaseUrl).toBe('https://jira.custom.com');
      expect(config.jiraUserEmail).toBe('custom@jira.com');
      expect(config.jiraApiToken).toBe('jira-custom-token');
    });

    it('should build without tracker (tracker is optional)', () => {
      const service = validBuilder().build();
      // Service should be created without error; tracker is undefined
      expect(service).toBeDefined();
    });

    it('should build with tracker when provided', () => {
      const service = validBuilder().withTracker(mockTracker()).build();

      expect(service).toBeDefined();
    });

    it('should copy arrays defensively', () => {
      const labels = ['a', 'b'];
      const assignees = ['alice'];
      const reviewers = ['bob'];
      const teamReviewers = ['team'];
      const addPaths = ['src/'];

      const service = validBuilder()
        .withLabels(labels)
        .withAssignees(assignees)
        .withReviewers(reviewers)
        .withTeamReviewers(teamReviewers)
        .withAddPaths(addPaths)
        .build();

      // Mutate originals
      labels.push('c');
      assignees.push('eve');
      reviewers.push('charlie');
      teamReviewers.push('team-b');
      addPaths.push('lib/');

      // Service config arrays should not be affected
      const config = extractConfig(service);
      expect(config.labels).toEqual(['a', 'b']);
      expect(config.assignees).toEqual(['alice']);
      expect(config.reviewers).toEqual(['bob']);
      expect(config.teamReviewers).toEqual(['team']);
      expect(config.addPaths).toEqual(['src/']);
    });

    it('should return IPullRequesterService with only execute()', () => {
      const service = validBuilder().build();

      // The public interface only exposes execute()
      expect(typeof service.execute).toBe('function');
    });
  });

  describe('validation', () => {
    it('should throw when token is missing', () => {
      expect(() =>
        PullRequesterBuilder.create()
          .withBase('main')
          .withGitService(mockGit())
          .withOctokit(mockOctokit())
          .withOwner('owner')
          .withRepo('repo')
          .build(),
      ).toThrow('Token is required');
    });

    it('should throw when GitService is missing', () => {
      expect(() =>
        PullRequesterBuilder.create()
          .withToken('tok')
          .withBase('main')
          .withOctokit(mockOctokit())
          .withOwner('owner')
          .withRepo('repo')
          .build(),
      ).toThrow('GitService is required');
    });

    it('should throw when Octokit is missing', () => {
      expect(() =>
        PullRequesterBuilder.create()
          .withToken('tok')
          .withBase('main')
          .withGitService(mockGit())
          .withOwner('owner')
          .withRepo('repo')
          .build(),
      ).toThrow('Octokit is required');
    });

    it('should throw when owner is missing', () => {
      expect(() =>
        PullRequesterBuilder.create()
          .withToken('tok')
          .withBase('main')
          .withGitService(mockGit())
          .withOctokit(mockOctokit())
          .withRepo('repo')
          .build(),
      ).toThrow('Owner is required');
    });

    it('should throw when repo is missing', () => {
      expect(() =>
        PullRequesterBuilder.create()
          .withToken('tok')
          .withBase('main')
          .withGitService(mockGit())
          .withOctokit(mockOctokit())
          .withOwner('owner')
          .build(),
      ).toThrow('Repo is required');
    });

    it('should throw when base branch is missing', () => {
      expect(() =>
        PullRequesterBuilder.create()
          .withToken('tok')
          .withGitService(mockGit())
          .withOctokit(mockOctokit())
          .withOwner('owner')
          .withRepo('repo')
          .build(),
      ).toThrow('Base branch is required');
    });
  });
});
