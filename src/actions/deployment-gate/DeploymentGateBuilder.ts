import { IBuilder } from '../../libs/services/types/interfaces/IBuilder';

import { IDeploymentGateService } from './interfaces';
import { DeploymentGateService } from './services';

/**
 * Fluent builder for constructing DeploymentGateService instances.
 *
 * Uses a standalone builder pattern (not extending BaseIacBuilder)
 * because deployment gates make GitHub API calls rather than
 * executing CLI commands.
 */
export class DeploymentGateBuilder implements IBuilder<IDeploymentGateService> {
  private _token?: string;
  private _owner?: string;
  private _repo?: string;
  private _approvers: string[] = [];
  private _minimumApprovals = 0;
  private _issueTitle = '';
  private _issueBody = '';
  private _pollingIntervalSeconds = 10;
  private _failOnDenial = true;
  private _excludeWorkflowInitiator = false;
  private _additionalApprovedWords: string[] = [];
  private _additionalDeniedWords: string[] = [];

  private constructor() {}

  static create(): DeploymentGateBuilder {
    return new DeploymentGateBuilder();
  }

  withToken(token: string): this {
    this._token = token;
    return this;
  }

  withOwner(owner: string): this {
    this._owner = owner;
    return this;
  }

  withRepo(repo: string): this {
    this._repo = repo;
    return this;
  }

  withApprovers(approvers: string[]): this {
    this._approvers = [...approvers];
    return this;
  }

  withMinimumApprovals(count: number): this {
    this._minimumApprovals = count;
    return this;
  }

  withIssueTitle(title: string): this {
    this._issueTitle = title;
    return this;
  }

  withIssueBody(body: string): this {
    this._issueBody = body;
    return this;
  }

  withPollingIntervalSeconds(seconds: number): this {
    this._pollingIntervalSeconds = seconds;
    return this;
  }

  withFailOnDenial(fail: boolean): this {
    this._failOnDenial = fail;
    return this;
  }

  withExcludeWorkflowInitiator(exclude: boolean): this {
    this._excludeWorkflowInitiator = exclude;
    return this;
  }

  withAdditionalApprovedWords(words: string[]): this {
    this._additionalApprovedWords = [...words];
    return this;
  }

  withAdditionalDeniedWords(words: string[]): this {
    this._additionalDeniedWords = [...words];
    return this;
  }

  build(): IDeploymentGateService {
    if (!this._token) {
      throw new Error('Token is required');
    }
    if (!this._owner) {
      throw new Error('Owner is required');
    }
    if (!this._repo) {
      throw new Error('Repo is required');
    }
    if (this._approvers.length === 0) {
      throw new Error('At least one approver is required');
    }
    if (this._minimumApprovals > this._approvers.length) {
      throw new Error(
        `Minimum approvals (${this._minimumApprovals}) exceeds approver count (${this._approvers.length})`,
      );
    }

    return new DeploymentGateService(
      this._token,
      this._owner,
      this._repo,
      this._approvers,
      this._minimumApprovals,
      this._issueTitle,
      this._issueBody,
      this._pollingIntervalSeconds,
      this._failOnDenial,
      this._excludeWorkflowInitiator,
      this._additionalApprovedWords,
      this._additionalDeniedWords,
    );
  }
}
