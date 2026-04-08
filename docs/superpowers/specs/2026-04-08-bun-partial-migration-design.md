# Partial Bun Migration Design

**Date:** 2026-04-08 **Scope:** Replace pnpm (package manager) and Jest (test
runner) with Bun. Vite build pipeline is unchanged. **Driver:**
`@actions/core@3`, `@actions/github@9`, `@actions/exec@3` became ESM-only,
breaking Jest's CJS mode.

---

## Context

The project is a Vite-built GitHub Actions monorepo. The dist/ bundles run on
`node24` via the action.yml `runs: using: node24` — GitHub Actions has no native
Bun runtime, so the build output must stay Node.js-compatible. Only the
development toolchain changes.

Bun 1.3.11 is already installed locally and `bun.lock` has been generated.

---

## Commit Structure

Two sequential commits to allow CI validation between layers.

### Commit 1 — `chore(toolchain): replace pnpm with bun`

### Commit 2 — `chore(toolchain): replace jest with bun test`

---

## Commit 1: Package Manager

### `package.json`

- `"packageManager"`: `"pnpm@10.33.0"` → `"bun@1.3.11"`
- Remove `"pnpm"` config block (`onlyBuiltDependencies`)
- All scripts: `pnpm run X` → `bun run X`, `pnpm exec` → `bunx`
- `report-coverage`: rewrite — `bun test --coverage --coverage-reporter=text`
  (Bun outputs coverage to stdout as a table; detailed lcov is handled by
  `test:coverage`)

### CI Workflow (`.github/workflows/ci.yml`)

Replace the Node/pnpm setup block with:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version-file: package.json
- run: bun install --frozen-lockfile
```

Remove: `actions/setup-node`, `corepack enable`,
`pnpm install --frozen-lockfile`.

### Husky Hooks (`.husky/pre-commit`)

- `pnpm lint-staged` → `bunx lint-staged`
- `pnpm typecheck` → `bun run typecheck`

### Files

- Delete: `pnpm-lock.yaml`
- Commit: `bun.lock`

---

## Commit 2: Test Runner

### Dependencies

Remove:

- `jest`
- `ts-jest`
- `@types/jest`

Add:

- `@types/bun` — provides `jest.*` global types (jest.fn, jest.mock,
  jest.Mock\<T\>, etc.), `bun:test` types, and replaces `@types/jest` entirely

### `tsconfig.json`

```json
"types": ["node", "bun-types"]
```

### Delete

`jest.config.cjs`

### Create `bunfig.toml`

```toml
[test]
coverage = true
coverageThreshold = { line = 95, function = 95, branch = 95 }
coverageSkipTestFiles = true
```

### `package.json` Scripts

```json
"test":           "bun test",
"test:coverage":  "bun test --coverage --coverage-reporter=lcov --coverage-reporter=text",
"test:watch":     "bun test --watch",
"report-coverage":"bun test --coverage --coverage-reporter=text"
```

`--coverage-reporter=lcov` writes `coverage/lcov.info` — the same path that
`codecov/codecov-action` reads in CI.

### CI Workflow

The test step becomes:

```yaml
- name: Run tests
  run: bun run test:coverage
```

The Codecov upload step is unchanged (`files: ./coverage/lcov.info`).

---

## Test File Compatibility

No test files change. Bun injects `jest.*` globals at test runtime (jest.fn,
jest.mock, jest.spyOn, jest.mocked, etc.). The `__mocks__/` directory convention
is respected by Bun's module resolver.

The 39 `jest.mock()` calls and 853 jest API usages across the test suite work
as-is.

### Coverage Behaviour Difference

Jest used an explicit `collectCoverageFrom` glob list to include/exclude files
from coverage. Bun derives coverage only from files actually imported by tests.
Practical effect: unreachable files (examples, barrel exports never imported by
tests) are excluded automatically. Coverage percentages may shift slightly —
expected upward.

---

## What Does Not Change

- `vite.config.mts` and the entire Vite build pipeline
- `src/` TypeScript source files
- `dist/` committed bundles
- All test files (`*.test.ts`)
- All `__mocks__/` files
- `.github/workflows/ci.yml` structure (only the setup/install/test steps
  change)
- `action.yml` files (still `runs: using: node24`)
