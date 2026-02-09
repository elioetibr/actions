# Release Process

Step-by-step guide for releasing new versions of elioetibr/actions.

## Prerequisites

Install the required tools:

```bash
# GitVersion — calculates semantic version from git history
dotnet tool install -g GitVersion.Tool

# git-cliff — generates changelog from conventional commits
cargo install git-cliff
# or: brew install git-cliff

# GitHub CLI — creates releases and manages tags
brew install gh
gh auth login

# jq — JSON processor (used by Makefile)
brew install jq
```

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) for GitVersion and git-cliff to work correctly.

| Prefix | Version Bump | Example |
|--------|-------------|---------|
| `feat:` | Minor | `feat: add terraform output parsing` |
| `fix:` | Patch | `fix: handle empty ECR repository` |
| `feat!:` or `BREAKING CHANGE:` | Major | `feat!: rename action inputs` |
| `docs:`, `style:`, `refactor:`, `test:`, `ci:`, `chore:` | None | `docs: update README examples` |

## Quick Release

Run the full release pipeline with a single command:

```bash
make release
```

This executes the following steps automatically:

1. **Verify** — lint, typecheck, test, build
2. **Check Changes** — verify there are commits since the last tag
3. **Calculate Version** — lock the version into `.release-version`
4. **Changelog** — generate CHANGELOG.md
5. **Release Notes** — generate RELEASE_NOTES.md (ephemeral, gitignored)
6. **Commit** — commit CHANGELOG.md + dist/ with `[skip ci]`
7. **Tag** — create vX.Y.Z, vX.Y, vX tags
8. **Floating Branches** — force-push vX and vX.Y branches
9. **GitHub Release** — create release with changelog body
10. **Cleanup** — remove `.release-version`

## Step-by-Step (Manual)

### Step 1: Verify the build

```bash
make verify
```

Runs in order:

1. `pnpm run lint` — ESLint
2. `pnpm run typecheck` — TypeScript compiler checks
3. `pnpm test` — Jest test suite
4. `pnpm run build` — Vite build to dist/

All four must pass before proceeding.

### Step 2: Check for releasable changes

```bash
make check-changes
```

Verifies there are commits since the last tag. If no changes exist, the command fails with an error — there's nothing to release.

Output:

```
3 commit(s) since v0.1.0:
abc1234 feat: add terraform output parsing
def5678 fix: handle empty ECR repository
ghi9012 docs: update README
```

### Step 3: Calculate and lock the version

```bash
make calculate-version
```

Runs GitVersion once and writes the full JSON output to `.release-version`. All subsequent steps read from this file instead of re-running GitVersion. This prevents version drift after `commit-release` adds a new commit.

Output:

```
Calculating version with GitVersion...
Locked version: v1.2.0 (1.2.0)
  Tags:     v1.2.0, v1.2, v1
  Branches: v1, v1.2
```

> **Why this matters:** Without locking, GitVersion recalculates on every step.
> After `commit-release` adds the `chore(release): ...` commit, GitVersion could
> produce a different version, causing the tags to mismatch the changelog.

### Step 4: Generate the changelog

```bash
make changelog
```

Requires `.release-version` from Step 3.

Generates `CHANGELOG.md` using git-cliff with the commit parsers defined in `cliff.toml`. Groups commits by type (Features, Bug Fixes, Refactoring, etc.) with links to PRs and authors.

### Step 5: Generate release notes

```bash
make release-notes
```

Requires `.release-version` from Step 3.

Generates `RELEASE_NOTES.md` containing only the changes for this version (no header). This file is gitignored — it's used as the body for the GitHub release.

### Step 6: Commit release artifacts

```bash
make commit-release
```

Requires `.release-version` from Step 3.

Stages `CHANGELOG.md` and `dist/`, then commits with:

```
chore(release): v1.2.0 [skip ci]
```

The `[skip ci]` prevents this commit from triggering another CI run. Pushes to origin automatically.

### Step 7: Create tags

```bash
make tag
```

Requires `.release-version` from Step 3.

Creates three annotated tags:

| Tag | Purpose | Example |
|-----|---------|---------|
| `vX.Y.Z` | Exact version | `v1.2.0` |
| `vX.Y` | Floating minor (moves with each patch) | `v1.2` |
| `vX` | Floating major (moves with each minor/patch) | `v1` |

If a tag already exists, it deletes the old tag and its associated GitHub release first, then recreates it.

### Step 8: Update floating branches

```bash
make floating-branches
```

Requires `.release-version` from Step 3.

Force-pushes two branches so they point to HEAD:

- `v1` — consumers using `@v1` get the latest
- `v1.2` — consumers using `@v1.2` get the latest patch

### Step 9: Create GitHub release

This is the final step in `make release`. It:

1. Cleans up any draft releases
2. Creates a new release for the `vX.Y.Z` tag
3. Uses `RELEASE_NOTES.md` as the release body
4. Marks it as `--latest`
5. Removes `.release-version` (cleanup)

## Alternative: Release with Branch

```bash
make release-with-branch
```

Same as `make release` but creates a `releases/vX.Y.Z` branch from main before generating the changelog. Useful when you want a release branch for hotfixes.

## Pipeline Diagram

```
make release
│
├─ verify
│  ├─ lint
│  ├─ typecheck
│  ├─ test
│  └─ build
│
├─ check-changes ── Are there commits since last tag?
│                   ├─ YES → continue
│                   └─ NO  → exit 1
│
├─ calculate-version ── gitversion → .release-version (locked)
│
├─ changelog ── git-cliff → CHANGELOG.md (using locked version)
│
├─ release-notes ── git-cliff → RELEASE_NOTES.md (using locked version)
│
├─ commit-release ── git add + commit [skip ci] + push
│                    (version read from .release-version, not recalculated)
│
├─ tag ── vX.Y.Z + vX.Y + vX (using locked version)
│
├─ floating-branches ── force-push vX, vX.Y
│
├─ gh release create ── with RELEASE_NOTES.md body
│
└─ cleanup ── rm .release-version
```

## Consumer Pinning

After release, consumers can pin at any granularity:

```yaml
# Always get latest v1.x.x (recommended)
uses: elioetibr/actions/iac/terraform@v1

# Pin to minor — get patches only
uses: elioetibr/actions/iac/terraform@v1.2

# Pin to exact version
uses: elioetibr/actions/iac/terraform@v1.2.0
```

## Version Lifecycle

```
main ──●──●──●──●──●──●──●──
       │        │        │
       v0.0.1   v0.1.0   v1.0.0
       │        │        │
       v0.0     v0.1     v1.0    (floating minor tags)
       v0       v0       v1      (floating major tags)
```

Each release moves the floating tags and branches forward so consumers on `@v1` always get the latest stable release.

## Makefile Reference

```bash
make help
```

| Target | Description |
|--------|-------------|
| `build` | Build dist/ with Vite |
| `test` | Run tests |
| `lint` | Run linter |
| `typecheck` | Run TypeScript type checking |
| `verify` | Run lint, typecheck, tests, and build |
| `version` | Show the calculated semantic version (live) |
| `check-changes` | Verify there are releasable changes since last tag |
| `calculate-version` | Calculate and lock version into `.release-version` |
| `changelog` | Generate CHANGELOG.md with git-cliff |
| `release-notes` | Generate RELEASE_NOTES.md for the current version |
| `release-branch` | Create a release branch (releases/vX.Y.Z) from main |
| `commit-release` | Commit changelog and dist/ with [skip ci] |
| `tag` | Create version tags (vX.Y.Z, vX.Y, vX) |
| `floating-branches` | Update floating branches (vX, vX.Y) to point to HEAD |
| `release` | Full release pipeline |
| `release-with-branch` | Release with branch creation |
| `clean` | Remove dist/ |
| `clean-all` | Remove dist/, coverage/, node_modules/ |

## Troubleshooting

### GitVersion returns unexpected version

```bash
# Check what GitVersion sees
gitversion /output json | jq .
```

Verify your branch matches a pattern in `GitVersion.yml`. The `no-bump-message` pattern means commits like `docs:`, `refactor:`, `test:` don't increment the version.

### git-cliff generates empty changelog

Ensure commits follow conventional commit format. Check `cliff.toml` for the `commit_parsers` patterns.

### "Error: .release-version not found"

Run `make calculate-version` before running individual release steps. The `make release` target handles this automatically.

### Tags fail to push

Floating tags (`vX`, `vX.Y`) use `--force` since they must move. If you get permission errors, check your GitHub token has `contents: write` permission.

### `[skip ci]` not working

GitHub Actions recognizes `[skip ci]` in the commit message. Ensure the commit message contains it exactly — the Makefile includes it in the `commit-release` target automatically.

### Version drift after commit-release

This was the reason for the `.release-version` file. If you see different versions in tags vs changelog, ensure you're using `make release` (which locks the version) rather than running individual steps with `make version` variables.
