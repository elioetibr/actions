# PullRequester

A powerful GitHub Action for creating and updating pull requests with native
issue tracker integration.

[![GitHub Action](https://img.shields.io/badge/GitHub-Action-blue)](https://github.com/elioetibr/actions)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## Feature Highlights

PullRequester goes beyond basic PR creation. Here is how it compares to the most
widely used alternative:

| Feature                        | peter-evans/create-pull-request                                                                  | PullRequester                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Create / Update PRs            | Yes                                                                                              | Yes                                  |
| Collaborator commit protection | No (force pushes, [issue #4161](https://github.com/peter-evans/create-pull-request/issues/4161)) | Yes (`skip-on-collaborator-commits`) |
| GitHub Issues integration      | No                                                                                               | Yes (zero-config)                    |
| Linear integration             | No                                                                                               | Yes (API key)                        |
| Jira integration               | No                                                                                               | Yes (API token)                      |
| Upsert comments (no spam)      | No                                                                                               | Yes (hidden marker)                  |
| Auto-generate PR body          | No                                                                                               | Yes (conventional commits)           |
| Merge conflict detection       | No                                                                                               | Yes (`git merge-tree`)               |
| Auto-label from issue tracker  | No                                                                                               | Yes                                  |
| PR body templates              | No                                                                                               | Yes (7 variables)                    |
| Issue state transitions        | No                                                                                               | Yes (per tracker)                    |

## Quick Start

Three copy-paste examples -- one per tracker.

### GitHub Issues (zero-config default)

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    title: 'chore: update dependencies'
    branch: 'deps/update'
```

### Linear

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    project-management: linear
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    title: 'feat: add OAuth support'
    branch: 'eng-123-oauth'
    issue-transition-state: 'In Review'
```

### Jira

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    project-management: jira
    jira-base-url: ${{ secrets.JIRA_BASE_URL }}
    jira-user-email: ${{ secrets.JIRA_USER_EMAIL }}
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    title: 'fix: resolve login timeout'
    branch: 'feature/PROJ-456-fix-login'
    issue-transition-state: 'In Review'
```

## Input Reference

All inputs are optional unless noted otherwise. They are grouped by category for
easier navigation.

### Core PR Inputs

| Name                    | Type    | Required | Default                            | Description                                                             |
| ----------------------- | ------- | -------- | ---------------------------------- | ----------------------------------------------------------------------- |
| `token`                 | string  | No       | `${{ github.token }}`              | GitHub token for API access                                             |
| `branch`                | string  | No       | `pullrequester/patch`              | The branch name for the pull request head                               |
| `base`                  | string  | No       | current branch                     | The base branch to merge into                                           |
| `title`                 | string  | No       | `Automated changes`                | Pull request title                                                      |
| `body`                  | string  | No       | `''`                               | Pull request body content                                               |
| `body-path`             | string  | No       | `''`                               | Path to a file containing the PR body                                   |
| `body-template`         | string  | No       | `''`                               | Template string for the PR body (supports placeholders)                 |
| `commit-message`        | string  | No       | `[pullrequester] automated change` | Commit message for the automated commit                                 |
| `author`                | string  | No       | `github-actions[bot] <...>`        | Git author in `Name <email>` format                                     |
| `committer`             | string  | No       | `github-actions[bot] <...>`        | Git committer in `Name <email>` format                                  |
| `signoff`               | boolean | No       | `false`                            | Whether to add `Signed-off-by` trailer to the commit                    |
| `sign-commits`          | boolean | No       | `false`                            | Whether to GPG-sign the commits                                         |
| `labels`                | string  | No       | `''`                               | Comma-separated list of labels to apply to the PR                       |
| `assignees`             | string  | No       | `''`                               | Comma-separated list of GitHub usernames to assign                      |
| `reviewers`             | string  | No       | `''`                               | Comma-separated list of GitHub usernames to request review from         |
| `team-reviewers`        | string  | No       | `''`                               | Comma-separated list of GitHub team slugs to request review from        |
| `milestone`             | number  | No       | `''`                               | Milestone number to associate with the PR                               |
| `draft`                 | string  | No       | `false`                            | Draft mode: `true`, `false`, or `always-true`                           |
| `add-paths`             | string  | No       | `''`                               | Comma-separated list of file paths to add to the commit (glob patterns) |
| `delete-branch`         | boolean | No       | `false`                            | Whether to delete the head branch after merge                           |
| `maintainer-can-modify` | boolean | No       | `true`                             | Whether maintainers can push to the head branch                         |

### Smart Features

| Name                           | Type    | Required | Default         | Description                                                            |
| ------------------------------ | ------- | -------- | --------------- | ---------------------------------------------------------------------- |
| `skip-on-collaborator-commits` | boolean | No       | `true`          | Skip when collaborator (non-bot) commits are detected on the PR branch |
| `auto-body`                    | boolean | No       | `false`         | Auto-generate the PR body from conventional commit log                 |
| `conflict-label`               | string  | No       | `''`            | Label to apply when merge conflicts are detected                       |
| `auto-label-from-issue`        | boolean | No       | `false`         | Mirror labels from the linked issue to the PR                          |
| `comment-marker-id`            | string  | No       | `pullrequester` | Hidden marker ID for upsert-based commenting on issues                 |

### Project Management

| Name                 | Type   | Required | Default  | Description                                   |
| -------------------- | ------ | -------- | -------- | --------------------------------------------- |
| `project-management` | string | No       | `github` | Tracker to use: `github`, `linear`, or `jira` |

### Issue Tracker

| Name                     | Type    | Required | Default | Description                                                      |
| ------------------------ | ------- | -------- | ------- | ---------------------------------------------------------------- |
| `issue-key-source`       | string  | No       | `both`  | Where to extract issue keys from: `branch`, `commits`, or `both` |
| `issue-link-pr`          | boolean | No       | `false` | Link the PR to the issue in the tracker                          |
| `issue-add-comment`      | boolean | No       | `false` | Add or update a comment on the linked issue                      |
| `issue-transition-state` | string  | No       | `''`    | Target state to transition the issue to (empty = no transition)  |

### Linear Inputs

| Name              | Type   | Required    | Default | Description                                                                        |
| ----------------- | ------ | ----------- | ------- | ---------------------------------------------------------------------------------- |
| `linear-api-key`  | string | Conditional | `''`    | Linear API key for authentication. Required when `project-management` is `linear`. |
| `linear-team-key` | string | No          | `''`    | Linear team key (optional; auto-detected from issue key)                           |

### Jira Inputs

| Name              | Type   | Required    | Default | Description                                                                                                |
| ----------------- | ------ | ----------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `jira-base-url`   | string | Conditional | `''`    | Jira instance base URL (e.g. `https://myorg.atlassian.net`). Required when `project-management` is `jira`. |
| `jira-user-email` | string | Conditional | `''`    | Jira user email for authentication. Required when `project-management` is `jira`.                          |
| `jira-api-token`  | string | Conditional | `''`    | Jira API token for authentication. Required when `project-management` is `jira`.                           |

## Output Reference

| Output                | Type    | Description                                                                 |
| --------------------- | ------- | --------------------------------------------------------------------------- |
| `operation`           | string  | `created`, `updated`, `skipped`, `skipped-collaborator`, or `closed`        |
| `pull-request-number` | number  | PR number (empty if skipped)                                                |
| `pull-request-url`    | string  | Full PR URL (empty if skipped)                                              |
| `pull-request-branch` | string  | Branch name used for the PR                                                 |
| `head-sha`            | string  | HEAD commit SHA after push (empty if skipped)                               |
| `has-conflicts`       | boolean | Whether merge conflicts exist with the base branch                          |
| `issues-linked`       | string  | Comma-separated linked issue keys                                           |
| `labels-from-issue`   | string  | Comma-separated labels mirrored from the tracker                            |
| `comment-updated`     | boolean | `true` if an existing comment was updated; `false` if a new one was created |

## Feature Deep-Dives

### Issue Tracker Integration

PullRequester extracts issue keys from branch names and/or commit messages
depending on the `issue-key-source` setting, then performs tracker-specific
operations.

**Key extraction patterns per tracker:**

| Tracker | Pattern                                             | Example                      |
| ------- | --------------------------------------------------- | ---------------------------- |
| GitHub  | `#N`, `GH-N`, `owner/repo#N`                        | `feature/#42-login`          |
| Linear  | `ENG-123` (1-10 uppercase letters + dash + number)  | `eng-123-oauth-support`      |
| Jira    | `PROJ-123` (1-10 uppercase letters + dash + number) | `feature/PROJ-456-fix-login` |

**Linking behavior per tracker:**

- **GitHub**: Appends `Closes #N` to the PR body, which triggers GitHub's
  built-in auto-close on merge.
- **Linear**: Creates an attachment on the Linear issue that links back to the
  PR.
- **Jira**: Creates or updates a remote issue link on the Jira issue with a
  GitHub favicon.

**State transitions per tracker:**

- **GitHub**: Supports `open` and `closed` states only.
- **Linear**: Queries the team's workflow states and finds the matching state by
  name (case-insensitive). Throws with available states if the target is not
  found.
- **Jira**: Fetches available transitions dynamically from the Jira REST API.
  Transition names must match exactly (case-insensitive comparison). Throws with
  available transitions if the target is not found.

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    project-management: linear
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    branch: 'eng-789-add-sso'
    issue-link-pr: true
    issue-add-comment: true
    issue-transition-state: 'In Review'
```

### Upsert Comments (No Spam)

Every comment PullRequester posts on an issue contains a hidden HTML marker:

```html
<!-- pullrequester-id: pullrequester -->
```

On subsequent runs, PullRequester searches existing comments for this marker. If
found, it **updates** the comment in place rather than creating a new one. This
prevents the comment section from being flooded across CI runs.

You can use different `comment-marker-id` values for different jobs, so each job
manages its own comment independently:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
      - uses: elioetibr/actions/pullrequester@v1
        with:
          branch: 'ci/test-results'
          issue-add-comment: true
          comment-marker-id: 'test-results'
          body: 'All tests passed.'

  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh
      - uses: elioetibr/actions/pullrequester@v1
        with:
          branch: 'ci/deploy-status'
          issue-add-comment: true
          comment-marker-id: 'deploy-status'
          body: 'Deployed to staging.'
```

Each job's comment is tracked separately. Re-running the workflow updates each
comment in place.

### Auto-Generate PR Body

When `auto-body: true` is set, PullRequester parses commits between the base and
head branches using the conventional commit format (`type(scope): subject`) and
generates a structured Markdown body.

**Commit type grouping:**

| Type       | Heading                  |
| ---------- | ------------------------ |
| `feat`     | Features                 |
| `fix`      | Bug Fixes                |
| `docs`     | Documentation            |
| `style`    | Styles                   |
| `refactor` | Code Refactoring         |
| `perf`     | Performance Improvements |
| `test`     | Tests                    |
| `build`    | Build System             |
| `ci`       | Continuous Integration   |
| `chore`    | Chores                   |
| `revert`   | Reverts                  |
| (other)    | Other Changes            |

**Breaking change detection**: Commits with `!` after the type or scope (e.g.,
`feat!: remove legacy API`) or with a `BREAKING CHANGE:` footer are prefixed
with **BREAKING** in the output.

**Example generated body:**

```markdown
## Linked Issues

#42

## Changes

### Features

- **auth**: add OAuth2 support (a1b2c3d)
- **BREAKING** **api**: remove legacy endpoint (d4e5f6a)

### Bug Fixes

- **auth**: fix token refresh race condition (b7c8d9e)
```

The `{{commit_log}}` template variable contains only the `### Features` /
`### Bug Fixes` section, which lets you embed the changelog inside a custom
template.

### Merge Conflict Detection

PullRequester uses `git merge-tree --write-tree` (Git 2.38+) to perform a
**read-only** merge simulation. No working tree files are modified.

- If conflicts are detected, `has-conflicts` is set to `true`.
- If `conflict-label` is configured, that label is automatically applied to the
  PR.

Use `has-conflicts` in downstream steps to gate deployments:

```yaml
- uses: elioetibr/actions/pullrequester@v1
  id: pr
  with:
    branch: 'release/v2.0'
    conflict-label: 'has-conflicts'

- name: Block deploy on conflicts
  if: steps.pr.outputs.has-conflicts == 'true'
  run: |
    echo "Merge conflicts detected. Resolve before deploying."
    exit 1
```

### Auto-Label from Issue Tracker

When `auto-label-from-issue: true` is enabled, PullRequester fetches labels from
the linked issue(s) in the configured tracker and mirrors them onto the PR.

**How it works per tracker:**

- **GitHub**: Reads labels from the `GET /repos/{owner}/{repo}/issues/{number}`
  response.
- **Linear**: Reads label names from the issue's `labels` connection via the
  Linear SDK.
- **Jira**: Reads the `labels` field from the `GET /rest/api/3/issue/{key}`
  response.

Labels are merged with any labels specified in the `labels` input. Duplicates
are removed.

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    branch: 'feature/PROJ-100-new-dashboard'
    project-management: jira
    jira-base-url: ${{ secrets.JIRA_BASE_URL }}
    jira-user-email: ${{ secrets.JIRA_USER_EMAIL }}
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    auto-label-from-issue: true
    labels: 'automated'
```

If the Jira issue `PROJ-100` has labels `frontend` and `priority-high`, the PR
will receive labels: `automated`, `frontend`, `priority-high`.

### Collaborator Commit Protection

**The problem**: `peter-evans/create-pull-request` force-pushes to the PR branch
on every run. If a human collaborator pushes commits to the same branch between
workflow runs, those commits are overwritten
([issue #4161](https://github.com/peter-evans/create-pull-request/issues/4161)).

**The solution**: PullRequester checks `git log base..branch --format=%ae` for
author emails that do not match the bot email. If any non-bot commits are found,
the action outputs `operation: skipped-collaborator` and exits without pushing.

This is enabled by default (`skip-on-collaborator-commits: true`). Set it to
`false` only if you intentionally want the action to overwrite collaborator
commits.

```yaml
- uses: elioetibr/actions/pullrequester@v1
  id: pr
  with:
    branch: 'auto/update-deps'
    skip-on-collaborator-commits: true

- name: Notify if skipped
  if: steps.pr.outputs.operation == 'skipped-collaborator'
  run: echo "Skipped because a collaborator has pushed to this branch."
```

### PR Body Templates

PullRequester supports a template system for full control over the PR body.
Templates use `{{variable}}` placeholders.

**Available variables:**

| Variable             | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `{{issue_keys}}`     | Comma-separated raw issue keys (e.g., `PROJ-123, PROJ-456`) |
| `{{issue_links}}`    | Comma-separated Markdown links to issues                    |
| `{{branch_name}}`    | The PR head branch name                                     |
| `{{commit_summary}}` | Subject line of the first commit                            |
| `{{commit_log}}`     | Full conventional-commit changelog in Markdown              |
| `{{body}}`           | The raw `body` input value                                  |
| `{{conflicts}}`      | `Has merge conflicts with base branch` or `No conflicts`    |

**Priority order**: `body-template` > `body-path` > `body` > `auto-body`. The
first non-empty source wins.

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    branch: 'release/v3.0'
    auto-body: false
    body-template: |
      ## Release {{branch_name}}

      ### Issues
      {{issue_links}}

      ### Changelog
      {{commit_log}}

      ### Conflict Status
      {{conflicts}}

      ---
      _Automated by PullRequester_
```

## Advanced Examples

### 1. Scheduled Dependency Updates

```yaml
name: Update Dependencies

on:
  schedule:
    - cron: '0 6 * * 1'

jobs:
  update-deps:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - name: Update npm dependencies
        run: |
          npm update
          npm audit fix || true

      - uses: elioetibr/actions/pullrequester@v1
        with:
          title: 'chore(deps): weekly dependency update'
          branch: 'deps/weekly-update'
          commit-message: 'chore(deps): update dependencies'
          auto-body: true
          labels: 'dependencies,automated'
          reviewers: 'team-lead'
```

### 2. Release PR with Changelog

```yaml
name: Prepare Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g. v2.1.0)'
        required: true

jobs:
  release-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Bump version
        run: npm version ${{ github.event.inputs.version }} --no-git-tag-version

      - uses: elioetibr/actions/pullrequester@v1
        with:
          title: 'release: ${{ github.event.inputs.version }}'
          branch: 'release/${{ github.event.inputs.version }}'
          commit-message: 'release: ${{ github.event.inputs.version }}'
          body-template: |
            ## Release ${{ github.event.inputs.version }}

            ### What Changed
            {{commit_log}}

            ### Linked Issues
            {{issue_links}}

            ---
            _Review and merge to publish the release._
          labels: 'release'
          team-reviewers: 'engineering'
```

### 3. Jira-Linked Feature Branch

```yaml
name: Feature PR

on:
  push:
    branches:
      - 'feature/PROJ-*'

jobs:
  create-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: elioetibr/actions/pullrequester@v1
        with:
          token: ${{ secrets.PAT_TOKEN }}
          project-management: jira
          jira-base-url: ${{ secrets.JIRA_BASE_URL }}
          jira-user-email: ${{ secrets.JIRA_USER_EMAIL }}
          jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
          branch: ${{ github.ref_name }}
          base: main
          title: 'feat: ${{ github.ref_name }}'
          auto-body: true
          auto-label-from-issue: true
          issue-link-pr: true
          issue-add-comment: true
          issue-transition-state: 'In Review'
```

### 4. Multi-Job with Upsert Comments

```yaml
name: CI Pipeline

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        id: tests
        run: |
          npm test 2>&1 | tee test-output.txt
          echo "result=passed" >> "$GITHUB_OUTPUT"

      - uses: elioetibr/actions/pullrequester@v1
        with:
          branch: ${{ github.head_ref }}
          issue-add-comment: true
          comment-marker-id: 'ci-tests'
          body: |
            ### Test Results
            Status: ${{ steps.tests.outputs.result }}

  security-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4

      - name: Run security scan
        id: scan
        run: |
          npm audit --json > audit.json || true
          echo "vulnerabilities=0" >> "$GITHUB_OUTPUT"

      - uses: elioetibr/actions/pullrequester@v1
        with:
          branch: ${{ github.head_ref }}
          issue-add-comment: true
          comment-marker-id: 'ci-security'
          body: |
            ### Security Scan
            Vulnerabilities found: ${{ steps.scan.outputs.vulnerabilities }}
```

### 5. Conflict-Aware Deploy Gate

```yaml
name: Deploy Gate

on:
  push:
    branches:
      - main

jobs:
  check-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: elioetibr/actions/pullrequester@v1
        id: pr
        with:
          branch: 'release/next'
          base: 'production'
          title: 'deploy: release to production'
          auto-body: true
          conflict-label: 'has-conflicts'
          labels: 'deploy'

      - name: Gate deployment
        if: steps.pr.outputs.has-conflicts == 'true'
        run: |
          echo "::error::Release branch has merge conflicts with production."
          echo "Resolve conflicts before deploying."
          exit 1

      - name: Deploy
        if: steps.pr.outputs.has-conflicts == 'false'
        run: echo "Deploying to production..."
```

## Migration from peter-evans/create-pull-request

PullRequester is designed as a drop-in replacement. Most inputs map 1:1.

### Input Compatibility

| peter-evans input       | PullRequester input            | Notes                                             |
| ----------------------- | ------------------------------ | ------------------------------------------------- |
| `token`                 | `token`                        | Identical                                         |
| `branch`                | `branch`                       | Identical                                         |
| `base`                  | `base`                         | Identical                                         |
| `title`                 | `title`                        | Identical                                         |
| `body`                  | `body`                         | Identical                                         |
| `body-path`             | `body-path`                    | Identical                                         |
| `commit-message`        | `commit-message`               | Identical                                         |
| `author`                | `author`                       | Identical                                         |
| `committer`             | `committer`                    | Identical                                         |
| `signoff`               | `signoff`                      | Identical                                         |
| `sign-commits`          | `sign-commits`                 | Identical                                         |
| `labels`                | `labels`                       | Identical                                         |
| `assignees`             | `assignees`                    | Identical                                         |
| `reviewers`             | `reviewers`                    | Identical                                         |
| `team-reviewers`        | `team-reviewers`               | Identical                                         |
| `milestone`             | `milestone`                    | Identical                                         |
| `draft`                 | `draft`                        | Identical, plus `always-true`                     |
| `add-paths`             | `add-paths`                    | Identical                                         |
| `delete-branch`         | `delete-branch`                | Identical                                         |
| `maintainer-can-modify` | `maintainer-can-modify`        | Identical                                         |
| (not available)         | `skip-on-collaborator-commits` | **New** -- prevents force-push over human commits |
| (not available)         | `auto-body`                    | **New** -- auto-generate body from commits        |
| (not available)         | `conflict-label`               | **New** -- label PRs with merge conflicts         |
| (not available)         | `auto-label-from-issue`        | **New** -- mirror labels from tracker             |
| (not available)         | `body-template`                | **New** -- template-based PR body                 |
| (not available)         | `project-management`           | **New** -- tracker selection                      |
| (not available)         | `issue-*`                      | **New** -- all issue tracker inputs               |
| (not available)         | `linear-*`                     | **New** -- Linear integration                     |
| (not available)         | `jira-*`                       | **New** -- Jira integration                       |

### Drop-In Replacement

Replace the `uses` line and you are done. No input changes required for basic
usage:

```yaml
# Before
- uses: peter-evans/create-pull-request@v7
  with:
    title: 'chore: update config'
    branch: 'auto/update-config'
    labels: 'automated'

# After
- uses: elioetibr/actions/pullrequester@v1
  with:
    title: 'chore: update config'
    branch: 'auto/update-config'
    labels: 'automated'
```

### Gradual Adoption Path

1. **Week 1**: Swap `uses:` line. All existing inputs work unchanged.
   `skip-on-collaborator-commits` is on by default, giving you immediate
   protection.
2. **Week 2**: Add `auto-body: true` to get structured PR descriptions from
   commit history.
3. **Week 3**: Enable `conflict-label: 'has-conflicts'` to surface merge issues.
4. **Week 4**: Connect your issue tracker (`project-management: linear` or
   `jira`) with `issue-link-pr: true` and `issue-add-comment: true`.

## Troubleshooting

### `GITHUB_TOKEN` does not trigger downstream workflows

GitHub Actions workflows triggered by the default `GITHUB_TOKEN` will not
trigger further workflow runs. This is a GitHub platform limitation to prevent
infinite loops.

**Fix**: Use a Personal Access Token (PAT) or a GitHub App installation token:

```yaml
- uses: elioetibr/actions/pullrequester@v1
  with:
    token: ${{ secrets.PAT_TOKEN }}
```

### Jira transition fails

Jira transitions are fetched dynamically. The `issue-transition-state` value
must match an available transition name exactly (comparison is
case-insensitive).

**Fix**: Check available transitions for your issue:

```bash
curl -u user@example.com:API_TOKEN \
  https://myorg.atlassian.net/rest/api/3/issue/PROJ-123/transitions
```

Use the exact `name` value from the response.

### Linear API key permissions

The Linear API key requires the following scopes:

- Read and write issues
- Read and write comments
- Create attachments

**Fix**: Generate a new API key at
[linear.app/settings/api](https://linear.app/settings/api) with the required
permissions.

### Issue key not extracted

Issue keys are extracted based on the `project-management` setting and
`issue-key-source`:

- **GitHub**: Looks for `#N` or `GH-N` patterns.
- **Linear / Jira**: Looks for `UPPERCASEPROJECT-123` patterns (1-10 uppercase
  letters, dash, number).

**Fix**: Verify your branch name or commit message contains the expected
pattern. For example, `feature/proj-123` will not match because the project
prefix must be uppercase (`PROJ-123`).

### Comment not upserted

The `comment-marker-id` must be identical between runs for upsert to work. The
marker is embedded as `<!-- pullrequester-id: {markerId} -->` in the comment
body.

**Fix**: Ensure `comment-marker-id` is the same value across all workflow runs
that should share the same comment. The default is `pullrequester`.

### `actions/checkout` auth conflict

When using a PAT with PullRequester, the default `actions/checkout` persists its
own credentials, which can conflict with PullRequester's git configuration.

**Fix**: Disable credential persistence in the checkout step:

```yaml
- uses: actions/checkout@v4
  with:
    persist-credentials: false

- uses: elioetibr/actions/pullrequester@v1
  with:
    token: ${{ secrets.PAT_TOKEN }}
```

## Full Comparison Table

An expanded feature matrix comparing PullRequester to
peter-evans/create-pull-request:

| Category    | Feature                                 | peter-evans/create-pull-request | PullRequester                     |
| ----------- | --------------------------------------- | ------------------------------- | --------------------------------- |
| **Core**    | Create pull requests                    | Yes                             | Yes                               |
| **Core**    | Update existing pull requests           | Yes                             | Yes                               |
| **Core**    | Custom commit message                   | Yes                             | Yes                               |
| **Core**    | Custom author / committer               | Yes                             | Yes                               |
| **Core**    | Signoff / GPG signing                   | Yes                             | Yes                               |
| **Core**    | Labels, assignees, reviewers            | Yes                             | Yes                               |
| **Core**    | Draft PR support                        | `true` / `false`                | `true` / `false` / `always-true`  |
| **Core**    | Milestone support                       | Yes                             | Yes                               |
| **Core**    | Selective file staging (`add-paths`)    | Yes                             | Yes                               |
| **Core**    | Delete branch after merge               | Yes                             | Yes                               |
| **Safety**  | Collaborator commit protection          | No                              | Yes (default on)                  |
| **Safety**  | Merge conflict detection                | No                              | Yes (`git merge-tree`)            |
| **Safety**  | Conflict labeling                       | No                              | Yes                               |
| **Body**    | Static body                             | Yes                             | Yes                               |
| **Body**    | Body from file (`body-path`)            | Yes                             | Yes                               |
| **Body**    | Body templates with variables           | No                              | Yes (7 variables)                 |
| **Body**    | Auto-generated body from commits        | No                              | Yes (conventional commit parsing) |
| **Tracker** | GitHub Issues integration               | No                              | Yes (zero-config)                 |
| **Tracker** | Linear integration                      | No                              | Yes                               |
| **Tracker** | Jira integration                        | No                              | Yes                               |
| **Tracker** | Issue key extraction (branch + commits) | No                              | Yes                               |
| **Tracker** | Issue linking (PR to issue)             | No                              | Yes                               |
| **Tracker** | Upsert comments (no spam)               | No                              | Yes                               |
| **Tracker** | Issue state transitions                 | No                              | Yes                               |
| **Tracker** | Auto-label from issue                   | No                              | Yes                               |
