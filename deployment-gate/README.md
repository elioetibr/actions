# Deployment Gate Action

A manual approval gate for deployment workflows. Creates a GitHub issue and
waits for authorized approvers to respond before continuing.

## Usage

```yaml
- uses: elioetibr/actions/deployment-gate@v1
  with:
    approvers: alice,bob,charlie
    secret: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input                                    | Required | Default        | Description                                                |
| ---------------------------------------- | -------- | -------------- | ---------------------------------------------------------- |
| `approvers`                              | Yes      | -              | Comma-delimited list of GitHub usernames or org team slugs |
| `secret`                                 | Yes      | -              | GitHub token with issues write permission                  |
| `minimum-approvals`                      | No       | `0`            | Minimum approvals needed (0 = all must approve)            |
| `issue-title`                            | No       | Auto-generated | Custom title for the approval issue                        |
| `issue-body`                             | No       | `""`           | Custom body posted as a comment on the issue               |
| `polling-interval-seconds`               | No       | `10`           | Seconds between polling for comments                       |
| `exclude-workflow-initiator-as-approver` | No       | `false`        | Remove workflow initiator from approvers                   |
| `additional-approved-words`              | No       | `""`           | Extra comma-separated approval keywords                    |
| `additional-denied-words`                | No       | `""`           | Extra comma-separated denial keywords                      |
| `target-repository-owner`                | No       | Current repo   | Create issue in a different repo (owner)                   |
| `target-repository`                      | No       | Current repo   | Create issue in a different repo (name)                    |
| `fail-on-denial`                         | No       | `true`         | Fail the action on denial (false = exit 0)                 |

## Outputs

| Output            | Description                        |
| ----------------- | ---------------------------------- |
| `issue-number`    | The created approval issue number  |
| `issue-url`       | The HTML URL of the approval issue |
| `approval-status` | `approved` or `denied`             |

## How It Works

1. Resolves the approvers list (expands org team slugs into individual
   usernames)
2. Creates a GitHub issue assigned to the approvers with instructions
3. Polls the issue comments at the configured interval
4. When an authorized approver comments with an approval or denial keyword, the
   action resolves
5. The issue is closed with a status comment

### Approval Keywords

Default approved: `approved`, `approve`, `lgtm`, `yes`

Default denied: `denied`, `deny`, `no`

Keywords are case-insensitive and allow trailing punctuation (e.g., `Approved!`,
`LGTM.`).

### Denial Behavior

- **First denial wins**: Any single denial immediately denies the request
- Use `fail-on-denial: false` to continue the workflow after denial (check
  `approval-status` output)

## Examples

### Basic approval gate

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: elioetibr/actions/deployment-gate@v1
        with:
          approvers: team-lead,security-reviewer
          secret: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy
        run: ./deploy.sh
```

### Require minimum approvals

```yaml
- uses: elioetibr/actions/deployment-gate@v1
  with:
    approvers: alice,bob,charlie,dave
    secret: ${{ secrets.GITHUB_TOKEN }}
    minimum-approvals: '2'
```

### Continue on denial

```yaml
- uses: elioetibr/actions/deployment-gate@v1
  id: gate
  with:
    approvers: alice,bob
    secret: ${{ secrets.GITHUB_TOKEN }}
    fail-on-denial: 'false'

- name: Handle result
  run: |
    if [ "${{ steps.gate.outputs.approval-status }}" = "denied" ]; then
      echo "Deployment was denied, running rollback..."
    fi
```

### Use org team as approvers

```yaml
- uses: elioetibr/actions/deployment-gate@v1
  with:
    approvers: my-org/platform-team
    secret: ${{ secrets.GITHUB_TOKEN }}
```
