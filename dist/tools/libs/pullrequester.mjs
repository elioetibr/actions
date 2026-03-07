import { R as RunnerBase } from './tools.mjs';
import { O as Octokit } from './deployment-gate.mjs';
import { a as assertNever } from './summarize.mjs';
import { p as parseCommaSeparated } from './docker-buildx-images.mjs';
import './agents.mjs';
import * as require$$1 from 'fs';

class IssueKeyParser {
  /** GitHub: #123, GH-123, owner/repo#123 */
  static GITHUB_PATTERN = /(?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+))?#(\d+)/g;
  /** Jira/Linear: PROJ-123 (1-10 uppercase letters + dash + number) */
  static PROJECT_KEY_PATTERN = /\b([A-Z]{1,10})-(\d+)\b/g;
  /**
   * Extract issue keys from a branch name.
   * Strips common prefixes (feature/, fix/, bugfix/, etc.) before parsing.
   * @param branch - Git branch name (e.g., "feature/PROJ-123-add-login")
   * @param trackerType - The active tracker type
   */
  static extractFromBranch(branch, trackerType) {
    return IssueKeyParser.extractFromText(branch, trackerType);
  }
  /**
   * Extract issue keys from arbitrary text (commit messages, PR titles, etc.).
   * @param text - The text to scan for issue keys
   * @param trackerType - The active tracker type
   */
  static extractFromText(text, trackerType) {
    if (!text || text.trim() === "") return [];
    switch (trackerType) {
      case "github":
        return IssueKeyParser.extractGitHubKeys(text);
      case "linear":
      case "jira":
        return IssueKeyParser.extractProjectKeys(text, trackerType);
      default:
        return assertNever(trackerType);
    }
  }
  static extractGitHubKeys(text) {
    const keys = [];
    const seen = /* @__PURE__ */ new Set();
    const regex = new RegExp(IssueKeyParser.GITHUB_PATTERN.source, "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0];
      const project = match[1] ?? "";
      const num = Number(match[2]);
      if (!Number.isInteger(num) || num <= 0) continue;
      if (!seen.has(raw)) {
        seen.add(raw);
        keys.push({ tracker: "github", project, number: num, raw });
      }
    }
    return keys;
  }
  static extractProjectKeys(text, trackerType) {
    const keys = [];
    const seen = /* @__PURE__ */ new Set();
    const regex = new RegExp(IssueKeyParser.PROJECT_KEY_PATTERN.source, "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0];
      const project = match[1];
      const num = Number(match[2]);
      if (!Number.isInteger(num) || num <= 0) continue;
      if (!seen.has(raw)) {
        seen.add(raw);
        keys.push({ tracker: trackerType, project, number: num, raw });
      }
    }
    return keys;
  }
}

const TYPE_HEADINGS = {
  feat: "Features",
  fix: "Bug Fixes",
  docs: "Documentation",
  style: "Styles",
  refactor: "Code Refactoring",
  perf: "Performance Improvements",
  test: "Tests",
  build: "Build System",
  ci: "Continuous Integration",
  chore: "Chores",
  revert: "Reverts"
};
class CommitLogParser {
  /**
   * Regex for conventional commits: type(scope)!: subject
   * Groups: [1]=type, [2]=scope (optional), [3]=! (optional), [4]=subject
   */
  static CONVENTIONAL_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?\s*:\s*(.+)$/;
  /**
   * Parse a raw git log output (null-delimited format) into commit entries.
   * Expected format from: git log --format='%H%x00%s%x00%b%x00'
   * Each commit is: SHA\0subject\0body\0
   * @param rawLog - The raw git log output
   */
  static parseRawLog(rawLog) {
    if (!rawLog || rawLog.trim() === "") return [];
    const entries = [];
    const parts = rawLog.split("\0");
    for (let i = 0; i < parts.length; i += 3) {
      const sha = parts[i].trim();
      const subject = parts[i + 1]?.trim();
      const body = parts[i + 2]?.trim() ?? "";
      if (!sha || !subject) continue;
      const match = CommitLogParser.CONVENTIONAL_REGEX.exec(subject);
      const isBreaking = match?.[3] === "!" || body.includes("BREAKING CHANGE:") || body.includes("BREAKING-CHANGE:");
      entries.push({
        sha,
        subject: match?.[4] ?? subject,
        body,
        isBreaking,
        ...match?.[1] ? { type: match[1].toLowerCase() } : {},
        ...match?.[2] ? { scope: match[2] } : {}
      });
    }
    return entries;
  }
  /**
   * Parse a single commit subject line into its conventional commit parts.
   * Useful for testing without full git log output.
   * @param subject - A single commit subject line
   * @param sha - Optional SHA (defaults to empty)
   */
  static parseSubject(subject, sha = "") {
    const match = CommitLogParser.CONVENTIONAL_REGEX.exec(subject);
    const isBreaking = match?.[3] === "!";
    return {
      sha,
      subject: match?.[4] ?? subject,
      body: "",
      isBreaking,
      ...match?.[1] ? { type: match[1].toLowerCase() } : {},
      ...match?.[2] ? { scope: match[2] } : {}
    };
  }
  /**
   * Group commit entries by conventional commit type.
   * Non-conventional commits go under "Other Changes".
   * @param entries - Parsed commit entries
   */
  static groupByType(entries) {
    const groups = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const key = entry.type ?? "other";
      const existing = groups.get(key) ?? [];
      existing.push(entry);
      groups.set(key, existing);
    }
    const result = [];
    for (const [type, heading] of Object.entries(TYPE_HEADINGS)) {
      const commits = groups.get(type);
      if (commits && commits.length > 0) {
        result.push({ heading, commits });
        groups.delete(type);
      }
    }
    const otherCommits = [];
    for (const [, commits] of groups) {
      otherCommits.push(...commits);
    }
    if (otherCommits.length > 0) {
      result.push({ heading: "Other Changes", commits: otherCommits });
    }
    return result;
  }
  /**
   * Render grouped commits as Markdown.
   * Output format:
   * ### Features
   * - **scope**: subject (sha7)
   * - subject without scope (sha7)
   *
   * ### Bug Fixes
   * - **scope**: subject (sha7)
   */
  static renderMarkdown(groups) {
    const lines = [];
    for (const group of groups) {
      lines.push(`### ${group.heading}`);
      lines.push("");
      for (const commit of group.commits) {
        const sha7 = commit.sha.substring(0, 7);
        const breaking = commit.isBreaking ? "**BREAKING** " : "";
        const scope = commit.scope ? `**${commit.scope}**: ` : "";
        const shaRef = sha7 ? ` (${sha7})` : "";
        lines.push(`- ${breaking}${scope}${commit.subject}${shaRef}`);
      }
      lines.push("");
    }
    return lines.join("\n").trimEnd();
  }
  /**
   * Convenience: parse raw log -> group -> render as Markdown.
   * @param rawLog - Raw git log output
   */
  static generateChangelog(rawLog) {
    const entries = CommitLogParser.parseRawLog(rawLog);
    const groups = CommitLogParser.groupByType(entries);
    return CommitLogParser.renderMarkdown(groups);
  }
}

const GITHUB_MAX_BODY_LENGTH = 65536;
const AUTHOR_EMAIL_REGEX = /<([^>]+)>/;
const AUTHOR_NAME_REGEX = /^([^<]+)/;
class PullRequesterService {
  constructor(config, git, octokit, tracker, owner, repo) {
    this.config = config;
    this.git = git;
    this.octokit = octokit;
    this.tracker = tracker;
    this.owner = owner;
    this.repo = repo;
  }
  // --- Execution ---
  async execute() {
    const committerName = PullRequesterService.extractName(this.config.committer);
    const committerEmail = PullRequesterService.extractEmail(this.config.committer);
    await this.git.configureCredentials(this.config.token);
    await this.git.configureUser(committerName, committerEmail);
    const hasChanges = await this.git.hasChanges();
    const existingPrs = await this.findExistingPr();
    const existingPr = existingPrs.length > 0 ? existingPrs[0] : void 0;
    if (!hasChanges && !existingPr) {
      return this.buildResult("skipped");
    }
    await this.git.createBranch(this.config.branch, this.config.base);
    const botEmail = PullRequesterService.extractEmail(this.config.author);
    if (existingPr && this.config.skipOnCollaboratorCommits) {
      const hasCollabs = await this.git.hasCollaboratorCommits(
        this.config.branch,
        this.config.base,
        botEmail
      );
      if (hasCollabs) {
        return this.buildResult("skipped-collaborator");
      }
    }
    const hasConflicts = await this.git.hasConflictsWithBase(this.config.branch, this.config.base);
    let headSha;
    if (hasChanges) {
      headSha = await this.git.commitChanges(
        this.config.commitMessage,
        this.config.author,
        this.config.signoff
      );
    }
    const hasDiff = await this.git.hasDiffWithBase(this.config.branch, this.config.base);
    if (!hasDiff && existingPr) {
      return this.buildResult("closed", {
        pullRequestNumber: existingPr.number,
        pullRequestUrl: existingPr.html_url
      });
    }
    const isUpdate = existingPr !== void 0;
    await this.git.pushBranch(this.config.branch, isUpdate);
    const issueKeys = this.extractIssueKeys();
    const commitEntries = await this.git.getCommitLog(this.config.base);
    const commitLog = CommitLogParser.renderMarkdown(CommitLogParser.groupByType(commitEntries));
    const firstEntry = commitEntries[0];
    const commitSummary = firstEntry ? firstEntry.subject : "";
    const labelsFromIssue = await this.fetchIssueLabels(issueKeys);
    const prBody = this.buildPrBody(issueKeys, commitLog, commitSummary, hasConflicts);
    const truncatedBody = PullRequesterService.truncateBody(prBody);
    const isDraft = this.resolveDraftMode(existingPr?.draft);
    let prNumber;
    let prUrl;
    let operation;
    if (existingPr) {
      const updated = await this.updatePr(existingPr.number, truncatedBody, isDraft);
      prNumber = updated.number;
      prUrl = updated.html_url;
      operation = "updated";
    } else {
      const created = await this.createPr(truncatedBody, isDraft);
      prNumber = created.number;
      prUrl = created.html_url;
      operation = "created";
    }
    await this.applyPrMetadata(prNumber, labelsFromIssue, hasConflicts);
    const commentUpdated = await this.linkIssues(issueKeys, prUrl, prNumber);
    return this.buildResult(operation, {
      pullRequestNumber: prNumber,
      pullRequestUrl: prUrl,
      ...headSha ? { headSha } : {},
      issuesLinked: issueKeys,
      hasConflicts,
      labelsFromIssue,
      commentUpdated
    });
  }
  // --- Private helpers ---
  /**
   * Extract name from "Name <email>" format.
   * Uses RegExp pattern matching — not child_process.
   */
  static extractName(authorStr) {
    const match = AUTHOR_NAME_REGEX.exec(authorStr);
    return match?.[1] ? match[1].trim() : authorStr.trim();
  }
  /**
   * Extract email from "Name <email>" format.
   * Uses RegExp pattern matching — not child_process.
   */
  static extractEmail(authorStr) {
    const match = AUTHOR_EMAIL_REGEX.exec(authorStr);
    return match?.[1] ?? "";
  }
  /**
   * Truncate body to GitHub's maximum allowed length.
   * Appends a truncation notice if the body is too long.
   */
  static truncateBody(body) {
    if (body.length <= GITHUB_MAX_BODY_LENGTH) return body;
    const notice = "\n\n---\n*Body truncated due to GitHub character limit.*";
    return body.substring(0, GITHUB_MAX_BODY_LENGTH - notice.length) + notice;
  }
  /**
   * Find existing open PR for this branch->base combination.
   */
  async findExistingPr() {
    const response = await this.octokit.rest.pulls.list({
      owner: this.owner,
      repo: this.repo,
      head: `${this.owner}:${this.config.branch}`,
      base: this.config.base,
      state: "open"
    });
    return response.data;
  }
  /**
   * Extract issue keys based on the configured source.
   */
  extractIssueKeys() {
    const keys = [];
    const seen = /* @__PURE__ */ new Set();
    const addKeys = (newKeys) => {
      for (const key of newKeys) {
        if (!seen.has(key.raw)) {
          seen.add(key.raw);
          keys.push(key);
        }
      }
    };
    const source = this.config.issueKeySource;
    if (source === "branch" || source === "both") {
      addKeys(IssueKeyParser.extractFromBranch(this.config.branch, this.config.projectManagement));
    }
    if (source === "commits" || source === "both") {
      addKeys(
        IssueKeyParser.extractFromText(this.config.commitMessage, this.config.projectManagement)
      );
    }
    return keys;
  }
  /**
   * Fetch labels from the issue tracker for auto-labeling.
   */
  async fetchIssueLabels(issueKeys) {
    if (!this.config.autoLabelFromIssue || !this.tracker || issueKeys.length === 0) {
      return [];
    }
    const allLabels = /* @__PURE__ */ new Set();
    for (const key of issueKeys) {
      try {
        const labels = await this.tracker.getLabels(key);
        for (const label of labels) {
          allLabels.add(label);
        }
      } catch {
      }
    }
    return [...allLabels];
  }
  /**
   * Build the PR body from template, autoBody, or raw body.
   */
  buildPrBody(issueKeys, commitLog, commitSummary, hasConflicts) {
    const vars = {
      issue_keys: issueKeys.map((k) => k.raw).join(", "),
      issue_links: issueKeys.map((k) => this.formatIssueLink(k)).join(", "),
      branch_name: this.config.branch,
      commit_summary: commitSummary,
      commit_log: commitLog,
      body: this.config.body,
      conflicts: hasConflicts ? "Has merge conflicts with base branch" : "No conflicts"
    };
    if (this.config.bodyTemplate) {
      return PullRequesterService.renderTemplate(this.config.bodyTemplate, vars);
    }
    if (this.config.autoBody) {
      return this.generateAutoBody(issueKeys, commitLog, hasConflicts);
    }
    return this.config.body;
  }
  /**
   * Auto-generate PR body from commit log and issue keys.
   */
  generateAutoBody(issueKeys, commitLog, hasConflicts) {
    const parts = [];
    if (issueKeys.length > 0) {
      const links = issueKeys.map((k) => this.formatIssueLink(k)).join(", ");
      parts.push(`## Linked Issues

${links}`);
    }
    if (commitLog) {
      parts.push(`## Changes

${commitLog}`);
    }
    if (hasConflicts) {
      parts.push("> **Warning**: This branch has merge conflicts with the base branch.");
    }
    return parts.join("\n\n");
  }
  /**
   * Format an issue key as a Markdown link.
   */
  formatIssueLink(key) {
    switch (key.tracker) {
      case "github":
        return key.project ? `[${key.raw}](https://github.com/${key.project}/issues/${key.number})` : `#${key.number}`;
      case "linear":
        return `[${key.raw}](https://linear.app/issue/${key.raw})`;
      case "jira":
        return this.config.jiraBaseUrl ? `[${key.raw}](${this.config.jiraBaseUrl}/browse/${key.raw})` : key.raw;
    }
  }
  /**
   * Render a template string by replacing {{key}} placeholders.
   */
  static renderTemplate(template, vars) {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }
  /**
   * Resolve the draft mode for the PR.
   * - "true": create as draft, preserve existing state on update
   * - "false": never draft
   * - "always-true": always set draft=true on create and update
   */
  resolveDraftMode(existingDraft) {
    const mode = this.config.draft;
    switch (mode) {
      case "true":
        return existingDraft !== void 0 ? existingDraft : true;
      case "always-true":
        return true;
      case "false":
        return false;
      default:
        return assertNever(mode);
    }
  }
  /**
   * Create a new pull request.
   */
  async createPr(body, isDraft) {
    const response = await this.octokit.rest.pulls.create({
      owner: this.owner,
      repo: this.repo,
      head: this.config.branch,
      base: this.config.base,
      title: this.config.title,
      body,
      draft: isDraft,
      maintainer_can_modify: this.config.maintainerCanModify
    });
    return response.data;
  }
  /**
   * Update an existing pull request.
   */
  async updatePr(prNumber, body, isDraft) {
    const response = await this.octokit.rest.pulls.update({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      title: this.config.title,
      body,
      draft: isDraft
    });
    return response.data;
  }
  /**
   * Apply labels, assignees, reviewers, and milestone to the PR.
   */
  async applyPrMetadata(prNumber, labelsFromIssue, hasConflicts) {
    const allLabels = [...this.config.labels, ...labelsFromIssue];
    if (hasConflicts && this.config.conflictLabel) {
      allLabels.push(this.config.conflictLabel);
    }
    if (allLabels.length > 0) {
      await this.octokit.rest.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        labels: allLabels
      });
    }
    if (this.config.assignees.length > 0) {
      await this.octokit.rest.issues.addAssignees({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        assignees: this.config.assignees
      });
    }
    if (this.config.reviewers.length > 0 || this.config.teamReviewers.length > 0) {
      await this.octokit.rest.pulls.requestReviewers({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        ...this.config.reviewers.length > 0 ? { reviewers: this.config.reviewers } : {},
        ...this.config.teamReviewers.length > 0 ? { team_reviewers: this.config.teamReviewers } : {}
      });
    }
    if (this.config.milestone > 0) {
      await this.octokit.rest.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        milestone: this.config.milestone
      });
    }
  }
  /**
   * Link issues to the PR via the tracker.
   * Returns whether an existing comment was updated.
   */
  async linkIssues(issueKeys, prUrl, prNumber) {
    if (!this.tracker || issueKeys.length === 0) return false;
    let anyCommentUpdated = false;
    for (const key of issueKeys) {
      try {
        if (this.config.issueLinkPr) {
          await this.tracker.linkPullRequest(key, prUrl, this.config.title, prNumber);
        }
        if (this.config.issueAddComment && this.config.commentMarkerId) {
          const comment = this.buildIssueComment(prUrl, prNumber);
          const updated = await this.tracker.upsertComment(
            key,
            comment,
            this.config.commentMarkerId
          );
          if (updated) anyCommentUpdated = true;
        }
        if (this.config.issueTransitionState) {
          await this.tracker.transitionIssue(key, this.config.issueTransitionState);
        }
      } catch {
      }
    }
    return anyCommentUpdated;
  }
  /**
   * Build the comment body to post on linked issues.
   */
  buildIssueComment(prUrl, prNumber) {
    return [
      `## Pull Request #${prNumber}`,
      "",
      `**Title:** ${this.config.title}`,
      `**URL:** ${prUrl}`,
      `**Branch:** \`${this.config.branch}\` -> \`${this.config.base}\``,
      "",
      `<!-- pullrequester:${this.config.commentMarkerId} -->`
    ].join("\n");
  }
  /**
   * Build the result object with sensible defaults for optional fields.
   */
  buildResult(operation, overrides = {}) {
    return {
      operation,
      pullRequestBranch: this.config.branch,
      issuesLinked: [],
      hasConflicts: false,
      labelsFromIssue: [],
      commentUpdated: false,
      ...overrides
    };
  }
}

class PullRequesterBuilder {
  // --- Core PR settings ---
  _token = "";
  _branch = "pullrequester/patch";
  _base = "";
  _title = "Automated changes";
  _body = "";
  _bodyPath = "";
  _bodyTemplate = "";
  _commitMessage = "Automated changes";
  _author = "github-actions[bot] <github-actions[bot]@users.noreply.github.com>";
  _committer = "github-actions[bot] <github-actions[bot]@users.noreply.github.com>";
  _signoff = false;
  _signCommits = false;
  _labels = [];
  _assignees = [];
  _reviewers = [];
  _teamReviewers = [];
  _milestone = 0;
  _draft = "false";
  _addPaths = [];
  _deleteBranch = false;
  _maintainerCanModify = true;
  _skipOnCollaboratorCommits = true;
  // --- Smart features ---
  _autoBody = false;
  _conflictLabel = "";
  _autoLabelFromIssue = false;
  _commentMarkerId = "pullrequester";
  // --- Project Management ---
  _projectManagement = "github";
  _issueKeySource = "both";
  _issueLinkPr = false;
  _issueAddComment = false;
  _issueTransitionState = "";
  // --- Linear credentials ---
  _linearApiKey = "";
  _linearTeamKey = "";
  // --- Jira credentials ---
  _jiraBaseUrl = "";
  _jiraUserEmail = "";
  _jiraApiToken = "";
  // --- Dependencies ---
  _git;
  _octokit;
  _tracker;
  _owner = "";
  _repo = "";
  constructor() {
  }
  static create() {
    return new PullRequesterBuilder();
  }
  // --- Core PR settings ---
  withToken(token) {
    this._token = token;
    return this;
  }
  withBranch(branch) {
    this._branch = branch;
    return this;
  }
  withBase(base) {
    this._base = base;
    return this;
  }
  withTitle(title) {
    this._title = title;
    return this;
  }
  withBody(body) {
    this._body = body;
    return this;
  }
  withBodyPath(bodyPath) {
    this._bodyPath = bodyPath;
    return this;
  }
  withBodyTemplate(bodyTemplate) {
    this._bodyTemplate = bodyTemplate;
    return this;
  }
  withCommitMessage(commitMessage) {
    this._commitMessage = commitMessage;
    return this;
  }
  withAuthor(author) {
    this._author = author;
    return this;
  }
  withCommitter(committer) {
    this._committer = committer;
    return this;
  }
  withSignoff(signoff) {
    this._signoff = signoff;
    return this;
  }
  withSignCommits(signCommits) {
    this._signCommits = signCommits;
    return this;
  }
  withLabels(labels) {
    this._labels = [...labels];
    return this;
  }
  withAssignees(assignees) {
    this._assignees = [...assignees];
    return this;
  }
  withReviewers(reviewers) {
    this._reviewers = [...reviewers];
    return this;
  }
  withTeamReviewers(teamReviewers) {
    this._teamReviewers = [...teamReviewers];
    return this;
  }
  withMilestone(milestone) {
    this._milestone = milestone;
    return this;
  }
  withDraft(draft) {
    this._draft = draft;
    return this;
  }
  withAddPaths(addPaths) {
    this._addPaths = [...addPaths];
    return this;
  }
  withDeleteBranch(deleteBranch) {
    this._deleteBranch = deleteBranch;
    return this;
  }
  withMaintainerCanModify(maintainerCanModify) {
    this._maintainerCanModify = maintainerCanModify;
    return this;
  }
  withSkipOnCollaboratorCommits(skip) {
    this._skipOnCollaboratorCommits = skip;
    return this;
  }
  // --- Smart features ---
  withAutoBody(autoBody) {
    this._autoBody = autoBody;
    return this;
  }
  withConflictLabel(conflictLabel) {
    this._conflictLabel = conflictLabel;
    return this;
  }
  withAutoLabelFromIssue(autoLabel) {
    this._autoLabelFromIssue = autoLabel;
    return this;
  }
  withCommentMarkerId(markerId) {
    this._commentMarkerId = markerId;
    return this;
  }
  // --- Project Management ---
  withProjectManagement(pm) {
    this._projectManagement = pm;
    return this;
  }
  withIssueKeySource(source) {
    this._issueKeySource = source;
    return this;
  }
  withIssueLinkPr(link) {
    this._issueLinkPr = link;
    return this;
  }
  withIssueAddComment(addComment) {
    this._issueAddComment = addComment;
    return this;
  }
  withIssueTransitionState(state) {
    this._issueTransitionState = state;
    return this;
  }
  // --- Linear credentials ---
  withLinearApiKey(key) {
    this._linearApiKey = key;
    return this;
  }
  withLinearTeamKey(key) {
    this._linearTeamKey = key;
    return this;
  }
  // --- Jira credentials ---
  withJiraBaseUrl(url) {
    this._jiraBaseUrl = url;
    return this;
  }
  withJiraUserEmail(email) {
    this._jiraUserEmail = email;
    return this;
  }
  withJiraApiToken(token) {
    this._jiraApiToken = token;
    return this;
  }
  // --- Dependencies ---
  withGitService(git) {
    this._git = git;
    return this;
  }
  withOctokit(octokit) {
    this._octokit = octokit;
    return this;
  }
  withTracker(tracker) {
    this._tracker = tracker;
    return this;
  }
  withOwner(owner) {
    this._owner = owner;
    return this;
  }
  withRepo(repo) {
    this._repo = repo;
    return this;
  }
  // --- Build ---
  build() {
    if (!this._token) throw new Error("Token is required");
    if (!this._git) throw new Error("GitService is required");
    if (!this._octokit) throw new Error("Octokit is required");
    if (!this._owner) throw new Error("Owner is required");
    if (!this._repo) throw new Error("Repo is required");
    if (!this._base) throw new Error("Base branch is required");
    return new PullRequesterService(
      {
        token: this._token,
        branch: this._branch,
        base: this._base,
        title: this._title,
        body: this._body,
        bodyPath: this._bodyPath,
        bodyTemplate: this._bodyTemplate,
        commitMessage: this._commitMessage,
        author: this._author,
        committer: this._committer,
        signoff: this._signoff,
        signCommits: this._signCommits,
        labels: this._labels,
        assignees: this._assignees,
        reviewers: this._reviewers,
        teamReviewers: this._teamReviewers,
        milestone: this._milestone,
        draft: this._draft,
        addPaths: this._addPaths,
        deleteBranch: this._deleteBranch,
        maintainerCanModify: this._maintainerCanModify,
        skipOnCollaboratorCommits: this._skipOnCollaboratorCommits,
        autoBody: this._autoBody,
        conflictLabel: this._conflictLabel,
        autoLabelFromIssue: this._autoLabelFromIssue,
        commentMarkerId: this._commentMarkerId,
        projectManagement: this._projectManagement,
        issueKeySource: this._issueKeySource,
        issueLinkPr: this._issueLinkPr,
        issueAddComment: this._issueAddComment,
        issueTransitionState: this._issueTransitionState,
        linearApiKey: this._linearApiKey,
        linearTeamKey: this._linearTeamKey,
        jiraBaseUrl: this._jiraBaseUrl,
        jiraUserEmail: this._jiraUserEmail,
        jiraApiToken: this._jiraApiToken
      },
      this._git,
      this._octokit,
      this._tracker,
      this._owner,
      this._repo
    );
  }
}

class GitService {
  constructor(agent) {
    this.agent = agent;
  }
  /**
   * Run a git command and return the structured result.
   * Uses IAgent.exec which delegates to @actions/exec (execFile, not shell).
   */
  async git(args) {
    return this.agent.exec("git", args, {
      silent: true,
      ignoreReturnCode: true
    });
  }
  async hasChanges() {
    const result = await this.git(["status", "--porcelain"]);
    return result.stdout.length > 0;
  }
  async getChangedFiles(addPaths) {
    const result = await this.git(["status", "--porcelain"]);
    if (!result.stdout) return [];
    let files = result.stdout.split("\n").map((line) => line.substring(3).trim()).filter((f) => f.length > 0);
    if (addPaths && addPaths.length > 0) {
      files = files.filter((f) => addPaths.some((p) => f.startsWith(p) || f === p));
    }
    return files;
  }
  async createBranch(name, base) {
    if (base) {
      await this.git(["checkout", "-B", name, base]);
    } else {
      await this.git(["checkout", "-B", name]);
    }
  }
  async commitChanges(message, author, signoff) {
    await this.git(["add", "-A"]);
    const args = ["commit", "-m", message];
    if (author) args.push("--author", author);
    if (signoff) args.push("--signoff");
    await this.git(args);
    const result = await this.git(["rev-parse", "HEAD"]);
    return result.stdout;
  }
  async pushBranch(branch, force) {
    const args = ["push", "origin", branch];
    if (force) args.push("--force-with-lease");
    await this.git(args);
  }
  async hasDiffWithBase(branch, base) {
    const result = await this.git(["diff", `${base}...${branch}`, "--name-only"]);
    return result.stdout.length > 0;
  }
  async hasCollaboratorCommits(branch, base, botEmail) {
    const result = await this.git(["log", `${base}..${branch}`, "--format=%ae"]);
    if (!result.stdout) return false;
    const authors = result.stdout.split("\n").map((e) => e.trim()).filter((e) => e.length > 0);
    return authors.some((email) => email !== botEmail);
  }
  async hasConflictsWithBase(branch, base) {
    const result = await this.git(["merge-tree", "--write-tree", base, branch]);
    return result.exitCode !== 0;
  }
  async getCommitLog(base, head) {
    const range = head ? `${base}..${head}` : `${base}..HEAD`;
    const result = await this.git(["log", range, "--format=%H%x00%s%x00%b%x00"]);
    return CommitLogParser.parseRawLog(result.stdout);
  }
  async configureCredentials(token) {
    const encodedToken = Buffer.from(`x-access-token:${token}`).toString("base64");
    await this.git([
      "config",
      "--local",
      "http.https://github.com/.extraheader",
      `AUTHORIZATION: basic ${encodedToken}`
    ]);
  }
  async configureUser(name, email) {
    await this.git(["config", "--local", "user.name", name]);
    await this.git(["config", "--local", "user.email", email]);
  }
}

const COMMENT_MARKER_PREFIX = "<!-- pullrequester-id:";
const COMMENT_MARKER_SUFFIX = "-->";
function buildMarker(markerId) {
  return `${COMMENT_MARKER_PREFIX} ${markerId} ${COMMENT_MARKER_SUFFIX}`;
}

class GitHubIssueTracker {
  constructor(octokit, owner, repo) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
  }
  type = "github";
  async findIssue(key) {
    try {
      const { data } = await this.octokit.rest.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: key.number
      });
      return {
        key: `#${data.number}`,
        title: data.title,
        status: data.state,
        url: data.html_url,
        labels: data.labels.map((l) => typeof l === "string" ? l : l.name ?? "").filter((name) => name.length > 0)
      };
    } catch (error) {
      if (isHttpError(error) && error.status === 404) return void 0;
      throw error;
    }
  }
  async linkPullRequest(key, _prUrl, _prTitle, prNumber) {
    const { data: pr } = await this.octokit.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber
    });
    const closesRef = `Closes #${key.number}`;
    const currentBody = pr.body ?? "";
    if (!currentBody.includes(closesRef)) {
      const newBody = currentBody.length > 0 ? `${currentBody}

${closesRef}` : closesRef;
      await this.octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: newBody
      });
    }
  }
  async upsertComment(key, comment, markerId) {
    const marker = buildMarker(markerId);
    const fullComment = `${marker}
${comment}`;
    const { data: comments } = await this.octokit.rest.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: key.number
    });
    const existing = comments.find((c) => c.body?.includes(marker));
    if (existing) {
      await this.octokit.rest.issues.updateComment({
        owner: this.owner,
        repo: this.repo,
        comment_id: existing.id,
        body: fullComment
      });
      return true;
    }
    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: key.number,
      body: fullComment
    });
    return false;
  }
  async transitionIssue(key, targetState) {
    const state = targetState.toLowerCase() === "closed" ? "closed" : "open";
    await this.octokit.rest.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: key.number,
      state
    });
  }
  async getLabels(key) {
    const issue = await this.findIssue(key);
    return issue ? [...issue.labels] : [];
  }
}
function isHttpError(error) {
  return typeof error === "object" && error !== null && "status" in error;
}

class LinearIssueTracker {
  constructor(client) {
    this.client = client;
  }
  type = "linear";
  async findIssue(key) {
    try {
      const identifier = `${key.project}-${key.number}`;
      const issue = await this.client.issue(identifier);
      if (!issue) return void 0;
      const state = await issue.state;
      const labelsConnection = await issue.labels();
      const labels = labelsConnection.nodes.map((l) => l.name);
      return {
        key: identifier,
        title: issue.title,
        status: state?.name ?? "Unknown",
        url: issue.url,
        labels
      };
    } catch {
      return void 0;
    }
  }
  async linkPullRequest(key, prUrl, prTitle, _prNumber) {
    const identifier = `${key.project}-${key.number}`;
    const issue = await this.client.issue(identifier);
    if (!issue) {
      throw new Error(`Linear issue ${identifier} not found`);
    }
    await this.client.createAttachment({
      issueId: issue.id,
      url: prUrl,
      title: prTitle,
      subtitle: "Pull Request",
      iconUrl: "https://github.com/favicon.ico"
    });
  }
  async upsertComment(key, comment, markerId) {
    const marker = buildMarker(markerId);
    const fullComment = `${marker}
${comment}`;
    const identifier = `${key.project}-${key.number}`;
    const issue = await this.client.issue(identifier);
    const commentsConnection = await issue.comments();
    const existingComment = commentsConnection.nodes.find((c) => c.body?.includes(marker));
    if (existingComment) {
      await existingComment.update({ body: fullComment });
      return true;
    }
    await this.client.createComment({
      issueId: issue.id,
      body: fullComment
    });
    return false;
  }
  async transitionIssue(key, targetState) {
    const identifier = `${key.project}-${key.number}`;
    const issue = await this.client.issue(identifier);
    const team = await issue.team;
    if (!team) {
      throw new Error(`Cannot transition ${identifier}: issue has no team`);
    }
    const statesConnection = await team.states();
    const matchingState = statesConnection.nodes.find(
      (s) => s.name.toLowerCase() === targetState.toLowerCase()
    );
    if (!matchingState) {
      const available = statesConnection.nodes.map((s) => s.name).join(", ");
      throw new Error(
        `Cannot transition ${identifier} to "${targetState}": state not found. Available: ${available}`
      );
    }
    await issue.update({ stateId: matchingState.id });
  }
  async getLabels(key) {
    const issue = await this.findIssue(key);
    return issue ? [...issue.labels] : [];
  }
}

function toADF(text) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }]
      }
    ]
  };
}
function fromADF(adf) {
  if (!adf || typeof adf !== "object") return "";
  const doc = adf;
  return doc.content?.flatMap((block) => block.content?.map((inline) => inline.text ?? "") ?? []).join("") ?? "";
}
class JiraIssueTracker {
  constructor(client, baseUrl) {
    this.client = client;
    this.baseUrl = baseUrl;
  }
  type = "jira";
  async findIssue(key) {
    try {
      const response = await this.client.issues.getIssue({
        issueIdOrKey: key.raw,
        fields: ["summary", "status", "labels"]
      });
      const rawLabels = response.fields?.labels;
      const labels = Array.isArray(rawLabels) ? rawLabels : [];
      return {
        key: key.raw,
        title: response.fields?.summary ?? "",
        status: response.fields?.status?.name ?? "Unknown",
        url: `${this.baseUrl}/browse/${key.raw}`,
        labels
      };
    } catch (error) {
      if (isJiraNotFound(error)) return void 0;
      throw error;
    }
  }
  async linkPullRequest(key, prUrl, prTitle, prNumber) {
    await this.client.issueRemoteLinks.createOrUpdateRemoteIssueLink({
      issueIdOrKey: key.raw,
      globalId: `github-pr-${prNumber}`,
      object: {
        url: prUrl,
        title: prTitle,
        icon: {
          url16x16: "https://github.com/favicon.ico",
          title: "GitHub"
        }
      }
    });
  }
  async upsertComment(key, comment, markerId) {
    const marker = buildMarker(markerId);
    const fullText = `${marker}
${comment}`;
    const response = await this.client.issueComments.getComments({
      issueIdOrKey: key.raw
    });
    const comments = response.comments ?? [];
    const existing = comments.find((c) => {
      const body = fromADF(c.body);
      return body.includes(marker);
    });
    if (existing?.id) {
      await this.client.issueComments.updateComment({
        issueIdOrKey: key.raw,
        id: existing.id,
        body: toADF(fullText)
      });
      return true;
    }
    await this.client.issueComments.addComment({
      issueIdOrKey: key.raw,
      comment: toADF(fullText)
    });
    return false;
  }
  async transitionIssue(key, targetState) {
    const response = await this.client.issues.getTransitions({
      issueIdOrKey: key.raw
    });
    const transitions = response.transitions ?? [];
    const matching = transitions.find((t) => t.name?.toLowerCase() === targetState.toLowerCase());
    if (!matching?.id) {
      const available = transitions.map((t) => t.name).join(", ");
      throw new Error(
        `Cannot transition ${key.raw} to "${targetState}": transition not found. Available: ${available}`
      );
    }
    await this.client.issues.doTransition({
      issueIdOrKey: key.raw,
      transition: { id: matching.id }
    });
  }
  async getLabels(key) {
    const issue = await this.findIssue(key);
    return issue ? [...issue.labels] : [];
  }
}
function isJiraNotFound(error) {
  if (typeof error === "object" && error !== null && "status" in error) {
    return error.status === 404;
  }
  return false;
}

class TrackerFactory {
  /**
   * Validate that required credentials are present for the chosen tracker type.
   * @throws Error with descriptive message if credentials are missing
   */
  static validateCredentials(credentials) {
    switch (credentials.type) {
      case "github":
        if (!credentials.token) throw new Error("GitHub tracker requires a token");
        if (!credentials.owner) throw new Error("GitHub tracker requires an owner");
        if (!credentials.repo) throw new Error("GitHub tracker requires a repo");
        break;
      case "linear":
        if (!credentials.linearApiKey) throw new Error("Linear tracker requires linear-api-key");
        break;
      case "jira":
        if (!credentials.jiraBaseUrl) throw new Error("Jira tracker requires jira-base-url");
        if (!credentials.jiraUserEmail) throw new Error("Jira tracker requires jira-user-email");
        if (!credentials.jiraApiToken) throw new Error("Jira tracker requires jira-api-token");
        break;
      default:
        assertNever(credentials);
    }
  }
  /**
   * Create a tracker instance for the given type.
   * Validates credentials before creating.
   * @param credentials - Discriminated credentials (type field determines which tracker)
   * @param clients - Pre-built SDK clients (injected for testability)
   */
  static create(credentials, clients) {
    TrackerFactory.validateCredentials(credentials);
    switch (credentials.type) {
      case "github": {
        if (!clients.octokit) throw new Error("GitHub tracker requires an Octokit instance");
        return new GitHubIssueTracker(clients.octokit, credentials.owner, credentials.repo);
      }
      case "linear": {
        if (!clients.linearClient)
          throw new Error("Linear tracker requires a LinearClient instance");
        return new LinearIssueTracker(clients.linearClient);
      }
      case "jira": {
        if (!clients.jiraClient) throw new Error("Jira tracker requires a Version3Client instance");
        return new JiraIssueTracker(clients.jiraClient, credentials.jiraBaseUrl);
      }
      default:
        return assertNever(credentials);
    }
  }
}

const VALID_TRACKER_TYPES = ["github", "linear", "jira"];
const VALID_KEY_SOURCES = ["branch", "commits", "both"];
const VALID_DRAFT_MODES = ["true", "false", "always-true"];
function parseTrackerType(raw) {
  const value = raw || "github";
  if (VALID_TRACKER_TYPES.includes(value)) {
    return value;
  }
  throw new Error(
    `Invalid project-management value "${value}". Must be one of: ${VALID_TRACKER_TYPES.join(", ")}`
  );
}
function parseIssueKeySource(raw) {
  const value = raw || "both";
  if (VALID_KEY_SOURCES.includes(value)) {
    return value;
  }
  throw new Error(
    `Invalid issue-key-source value "${value}". Must be one of: ${VALID_KEY_SOURCES.join(", ")}`
  );
}
function parseDraftMode(raw) {
  const value = raw || "false";
  if (VALID_DRAFT_MODES.includes(value)) {
    return value;
  }
  throw new Error(
    `Invalid draft value "${value}". Must be one of: ${VALID_DRAFT_MODES.join(", ")}`
  );
}
function parseMilestone(raw) {
  if (!raw) return 0;
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid milestone value "${raw}". Must be a non-negative integer.`);
  }
  return parsed;
}
function getSettings(agent) {
  const bodyPath = agent.getInput("body-path");
  return {
    token: agent.getInput("token", true),
    branch: agent.getInput("branch") || "pullrequester/patch",
    base: agent.getInput("base") || process.env.GITHUB_REF_NAME || "",
    title: agent.getInput("title") || "Automated changes",
    body: agent.getInput("body") || "",
    bodyPath,
    bodyTemplate: agent.getInput("body-template") || "",
    commitMessage: agent.getInput("commit-message") || "[pullrequester] automated change",
    author: agent.getInput("author") || "github-actions[bot] <github-actions[bot]@users.noreply.github.com>",
    committer: agent.getInput("committer") || "github-actions[bot] <github-actions[bot]@users.noreply.github.com>",
    signoff: agent.getBooleanInput("signoff"),
    signCommits: agent.getBooleanInput("sign-commits"),
    labels: parseCommaSeparated(agent.getInput("labels")),
    assignees: parseCommaSeparated(agent.getInput("assignees")),
    reviewers: parseCommaSeparated(agent.getInput("reviewers")),
    teamReviewers: parseCommaSeparated(agent.getInput("team-reviewers")),
    milestone: parseMilestone(agent.getInput("milestone")),
    draft: parseDraftMode(agent.getInput("draft")),
    addPaths: parseCommaSeparated(agent.getInput("add-paths")),
    deleteBranch: agent.getBooleanInput("delete-branch"),
    maintainerCanModify: agent.getBooleanInput("maintainer-can-modify"),
    skipOnCollaboratorCommits: agent.getBooleanInput("skip-on-collaborator-commits"),
    autoBody: agent.getBooleanInput("auto-body"),
    conflictLabel: agent.getInput("conflict-label") || "",
    autoLabelFromIssue: agent.getBooleanInput("auto-label-from-issue"),
    commentMarkerId: agent.getInput("comment-marker-id") || "pullrequester",
    projectManagement: parseTrackerType(agent.getInput("project-management")),
    issueKeySource: parseIssueKeySource(agent.getInput("issue-key-source")),
    issueLinkPr: agent.getBooleanInput("issue-link-pr"),
    issueAddComment: agent.getBooleanInput("issue-add-comment"),
    issueTransitionState: agent.getInput("issue-transition-state") || "",
    linearApiKey: agent.getInput("linear-api-key") || "",
    linearTeamKey: agent.getInput("linear-team-key") || "",
    jiraBaseUrl: agent.getInput("jira-base-url") || "",
    jiraUserEmail: agent.getInput("jira-user-email") || "",
    jiraApiToken: agent.getInput("jira-api-token") || ""
  };
}

class PullRequesterRunner extends RunnerBase {
  name = "pullrequester";
  steps = /* @__PURE__ */ new Map([
    ["execute", this.runExecute.bind(this)]
  ]);
  async runExecute(agent) {
    try {
      const settings = getSettings(agent);
      const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || "";
      const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
      if (!repoOwner || !repoName) {
        return this.failure(new Error("Could not determine repository from environment"));
      }
      let body = settings.body;
      if (settings.bodyPath && !body) {
        try {
          body = require$$1.readFileSync(settings.bodyPath, "utf-8");
        } catch (err) {
          return this.failure(
            new Error(
              `Cannot read body-path "${settings.bodyPath}": ${err instanceof Error ? err.message : String(err)}`
            )
          );
        }
      }
      const octokit = new Octokit({ auth: settings.token });
      const git = new GitService(agent);
      const trackerType = settings.projectManagement;
      let tracker;
      if (trackerType === "linear" && settings.linearApiKey) {
        const { LinearClient } = await import('./index.mjs');
        const linearClient = new LinearClient({ apiKey: settings.linearApiKey });
        tracker = TrackerFactory.create(
          {
            type: "linear",
            linearApiKey: settings.linearApiKey,
            linearTeamKey: settings.linearTeamKey
          },
          { linearClient }
        );
      } else if (trackerType === "jira" && settings.jiraBaseUrl) {
        const { Version3Client } = await import('./index2.mjs');
        const jiraClient = new Version3Client({
          host: settings.jiraBaseUrl,
          authentication: {
            basic: {
              email: settings.jiraUserEmail,
              apiToken: settings.jiraApiToken
            }
          }
        });
        tracker = TrackerFactory.create(
          {
            type: "jira",
            jiraBaseUrl: settings.jiraBaseUrl,
            jiraUserEmail: settings.jiraUserEmail,
            jiraApiToken: settings.jiraApiToken
          },
          { jiraClient }
        );
      } else if (trackerType === "github") {
        tracker = TrackerFactory.create(
          {
            type: "github",
            token: settings.token,
            owner: repoOwner,
            repo: repoName
          },
          { octokit }
        );
      }
      const builder = PullRequesterBuilder.create().withToken(settings.token).withBranch(settings.branch).withBase(settings.base).withTitle(settings.title).withBody(body).withBodyPath(settings.bodyPath).withBodyTemplate(settings.bodyTemplate).withCommitMessage(settings.commitMessage).withAuthor(settings.author).withCommitter(settings.committer).withSignoff(settings.signoff).withSignCommits(settings.signCommits).withLabels(settings.labels).withAssignees(settings.assignees).withReviewers(settings.reviewers).withTeamReviewers(settings.teamReviewers).withMilestone(settings.milestone).withDraft(settings.draft).withAddPaths(settings.addPaths).withDeleteBranch(settings.deleteBranch).withMaintainerCanModify(settings.maintainerCanModify).withSkipOnCollaboratorCommits(settings.skipOnCollaboratorCommits).withAutoBody(settings.autoBody).withConflictLabel(settings.conflictLabel).withAutoLabelFromIssue(settings.autoLabelFromIssue).withCommentMarkerId(settings.commentMarkerId).withProjectManagement(trackerType).withIssueKeySource(settings.issueKeySource).withIssueLinkPr(settings.issueLinkPr).withIssueAddComment(settings.issueAddComment).withIssueTransitionState(settings.issueTransitionState).withLinearApiKey(settings.linearApiKey).withLinearTeamKey(settings.linearTeamKey).withJiraBaseUrl(settings.jiraBaseUrl).withJiraUserEmail(settings.jiraUserEmail).withJiraApiToken(settings.jiraApiToken).withGitService(git).withOctokit(octokit).withOwner(repoOwner).withRepo(repoName);
      if (tracker) {
        builder.withTracker(tracker);
      }
      const service = builder.build();
      agent.info("Executing PullRequester...");
      const result = await service.execute();
      const outputs = {
        operation: result.operation,
        "pull-request-branch": result.pullRequestBranch,
        "has-conflicts": result.hasConflicts,
        "comment-updated": result.commentUpdated
      };
      if (result.pullRequestNumber !== void 0) {
        outputs["pull-request-number"] = result.pullRequestNumber;
      }
      if (result.pullRequestUrl !== void 0) {
        outputs["pull-request-url"] = result.pullRequestUrl;
      }
      if (result.headSha !== void 0) {
        outputs["head-sha"] = result.headSha;
      }
      if (result.issuesLinked.length > 0) {
        outputs["issues-linked"] = result.issuesLinked.map((k) => k.raw).join(",");
      }
      if (result.labelsFromIssue.length > 0) {
        outputs["labels-from-issue"] = result.labelsFromIssue.join(",");
      }
      agent.info(`PullRequester completed: ${result.operation}`);
      return this.success(outputs);
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
function createPullRequesterRunner() {
  return new PullRequesterRunner();
}

export { createPullRequesterRunner as c };
//# sourceMappingURL=pullrequester.mjs.map
