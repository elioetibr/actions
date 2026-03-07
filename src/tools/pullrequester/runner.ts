import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from '../common/runner-base';
import { Octokit } from '@octokit/rest';
import { PullRequesterBuilder } from '../../actions/pullrequester/PullRequesterBuilder';
import { GitService } from '../../actions/pullrequester/services/GitService';
import { TrackerFactory } from '../../actions/pullrequester/trackers/TrackerFactory';
import { getSettings } from './settings';
import * as fs from 'fs';

/**
 * PullRequester runner
 * Creates or updates pull requests with issue tracker integration.
 */
export class PullRequesterRunner extends RunnerBase {
  readonly name = 'pullrequester';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['execute', this.runExecute.bind(this)],
  ]);

  private async runExecute(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      // Resolve repository from environment
      const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || '';
      const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

      if (!repoOwner || !repoName) {
        return this.failure(new Error('Could not determine repository from environment'));
      }

      // Read body from file if body-path is set and body is empty
      let body = settings.body;
      if (settings.bodyPath && !body) {
        try {
          body = fs.readFileSync(settings.bodyPath, 'utf-8');
        } catch (err) {
          return this.failure(
            new Error(
              `Cannot read body-path "${settings.bodyPath}": ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        }
      }

      // Create Octokit client
      const octokit = new Octokit({ auth: settings.token });

      // Create Git service
      const git = new GitService(agent);

      // Create tracker (if project management is configured)
      const trackerType = settings.projectManagement;
      let tracker;

      if (trackerType === 'linear' && settings.linearApiKey) {
        const { LinearClient } = await import('@linear/sdk');
        const linearClient = new LinearClient({ apiKey: settings.linearApiKey });

        tracker = TrackerFactory.create(
          {
            type: 'linear',
            linearApiKey: settings.linearApiKey,
            linearTeamKey: settings.linearTeamKey,
          },
          { linearClient },
        );
      } else if (trackerType === 'jira' && settings.jiraBaseUrl) {
        const { Version3Client } = await import('jira.js');
        const jiraClient = new Version3Client({
          host: settings.jiraBaseUrl,
          authentication: {
            basic: {
              email: settings.jiraUserEmail,
              apiToken: settings.jiraApiToken,
            },
          },
        });

        tracker = TrackerFactory.create(
          {
            type: 'jira',
            jiraBaseUrl: settings.jiraBaseUrl,
            jiraUserEmail: settings.jiraUserEmail,
            jiraApiToken: settings.jiraApiToken,
          },
          { jiraClient },
        );
      } else if (trackerType === 'github') {
        tracker = TrackerFactory.create(
          {
            type: 'github',
            token: settings.token,
            owner: repoOwner,
            repo: repoName,
          },
          { octokit },
        );
      }

      // Build the service via fluent builder
      const builder = PullRequesterBuilder.create()
        .withToken(settings.token)
        .withBranch(settings.branch)
        .withBase(settings.base)
        .withTitle(settings.title)
        .withBody(body)
        .withBodyPath(settings.bodyPath)
        .withBodyTemplate(settings.bodyTemplate)
        .withCommitMessage(settings.commitMessage)
        .withAuthor(settings.author)
        .withCommitter(settings.committer)
        .withSignoff(settings.signoff)
        .withSignCommits(settings.signCommits)
        .withLabels(settings.labels)
        .withAssignees(settings.assignees)
        .withReviewers(settings.reviewers)
        .withTeamReviewers(settings.teamReviewers)
        .withMilestone(settings.milestone)
        .withDraft(settings.draft)
        .withAddPaths(settings.addPaths)
        .withDeleteBranch(settings.deleteBranch)
        .withMaintainerCanModify(settings.maintainerCanModify)
        .withSkipOnCollaboratorCommits(settings.skipOnCollaboratorCommits)
        .withAutoBody(settings.autoBody)
        .withConflictLabel(settings.conflictLabel)
        .withAutoLabelFromIssue(settings.autoLabelFromIssue)
        .withCommentMarkerId(settings.commentMarkerId)
        .withProjectManagement(trackerType)
        .withIssueKeySource(settings.issueKeySource)
        .withIssueLinkPr(settings.issueLinkPr)
        .withIssueAddComment(settings.issueAddComment)
        .withIssueTransitionState(settings.issueTransitionState)
        .withLinearApiKey(settings.linearApiKey)
        .withLinearTeamKey(settings.linearTeamKey)
        .withJiraBaseUrl(settings.jiraBaseUrl)
        .withJiraUserEmail(settings.jiraUserEmail)
        .withJiraApiToken(settings.jiraApiToken)
        .withGitService(git)
        .withOctokit(octokit)
        .withOwner(repoOwner)
        .withRepo(repoName);

      if (tracker) {
        builder.withTracker(tracker);
      }

      const service = builder.build();

      agent.info('Executing PullRequester...');
      const result = await service.execute();

      // Build outputs
      const outputs: Record<string, string | number | boolean> = {
        operation: result.operation,
        'pull-request-branch': result.pullRequestBranch,
        'has-conflicts': result.hasConflicts,
        'comment-updated': result.commentUpdated,
      };

      if (result.pullRequestNumber !== undefined) {
        outputs['pull-request-number'] = result.pullRequestNumber;
      }
      if (result.pullRequestUrl !== undefined) {
        outputs['pull-request-url'] = result.pullRequestUrl;
      }
      if (result.headSha !== undefined) {
        outputs['head-sha'] = result.headSha;
      }
      if (result.issuesLinked.length > 0) {
        outputs['issues-linked'] = result.issuesLinked.map(k => k.raw).join(',');
      }
      if (result.labelsFromIssue.length > 0) {
        outputs['labels-from-issue'] = result.labelsFromIssue.join(',');
      }

      agent.info(`PullRequester completed: ${result.operation}`);
      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Factory function to create a PullRequester runner
 */
export function createPullRequesterRunner(): PullRequesterRunner {
  return new PullRequesterRunner();
}
