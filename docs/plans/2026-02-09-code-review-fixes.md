# Code Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Fix all 13 remaining findings (3 HIGH, 5 MEDIUM, 5 LOW) from the A-
code review.

**Architecture:** Deprecation removal (H3) must happen before JSON parsing
unification (H2) because H2 replaces `catchErrorAndSetFailed` callers.
BaseIacService (H1) is independent. Medium and Low findings are leaf changes
with no inter-dependencies.

**Tech Stack:** TypeScript, Jest, pnpm, Vite

---

## Finding Summary

| ID  | Severity | Title                                                 | Files                                               |
| --- | -------- | ----------------------------------------------------- | --------------------------------------------------- |
| H1  | HIGH     | BaseIacService.ts 392 lines — cognitive load          | `src/actions/iac/common/services/BaseIacService.ts` |
| H2  | HIGH     | 3 inconsistent JSON parsing error patterns            | `src/libs/utils/parsers.ts`                         |
| H3  | HIGH     | Deprecated functions still exported/used              | `src/libs/utils/handlers.ts`, 5 callers             |
| M1  | MEDIUM   | Version resolver duplication (Terraform/Terragrunt)   | `src/libs/version-manager/*.ts`                     |
| M2  | MEDIUM   | Unsafe type assertion in `parseJsonToObject<T>`       | `src/libs/utils/parsers.ts:143`                     |
| M3  | MEDIUM   | `parseArrayFailFast` accepts `any`, calls `setFailed` | `src/libs/utils/parsers.ts:170`                     |
| M4  | MEDIUM   | Late command validation (after build)                 | `src/tools/common/iac-helpers.ts:163`               |
| M5  | MEDIUM   | Long `buildService()` in terragrunt runner            | `src/tools/terragrunt/runner.ts:118-187`            |
| L1  | LOW      | `ValidationUtils.isNullOrUndefined` uses `any`        | `src/libs/utils/ValidationUtils.ts:10`              |
| L2  | LOW      | Magic strings in version managers                     | `src/libs/version-manager/*.ts`                     |
| L3  | LOW      | Missing JSDoc on `ISharedIacSettings` fields          | `src/tools/common/iac-helpers.ts:11-28`             |
| L4  | LOW      | No cache lifetime/eviction docs on version installers | `src/libs/version-manager/*.ts`                     |
| L5  | LOW      | Redundant array copies in service getters             | `src/actions/iac/common/services/BaseIacService.ts` |

---

## Task 1: Remove deprecated `catchErrorAndSetFailed` and `errorHandler` (H3)

**Why first:** 5 callers import this function. Removing it before H2 avoids
refactoring code that will be deleted anyway.

**Files:**

- Modify: `src/libs/utils/handlers.ts:71-82` — remove both functions
- Modify: `src/libs/utils/handlers.test.ts:105-152` — remove tests for both
- Modify: `src/actions/iac/terraform/main.ts:5,154` — replace import + call
- Modify: `src/actions/iac/terragrunt/main.ts:5,252` — replace import + call
- Modify: `src/actions/docker/buildx/images/main.ts:5,148` — replace import +
  call
- Modify: `src/libs/services/github/main.ts:5,31` — replace import + call
- Modify: `src/libs/utils/parsers.ts:2,145,177` — replace import + calls (will
  be further refactored in Task 2)

**Step 1: Replace all callers**

In each caller file, replace:

```typescript
// Before
import { catchErrorAndSetFailed, ... } from '...';
// ...
catchErrorAndSetFailed(error);

// After
import { handleError, ... } from '...';
// ...
handleError(error);
```

Callers and their replacement:

| File                                       | Line        | Old                             | New                  |
| ------------------------------------------ | ----------- | ------------------------------- | -------------------- |
| `src/actions/iac/terraform/main.ts`        | 5, 154      | `catchErrorAndSetFailed(error)` | `handleError(error)` |
| `src/actions/iac/terragrunt/main.ts`       | 5, 252      | `catchErrorAndSetFailed(error)` | `handleError(error)` |
| `src/actions/docker/buildx/images/main.ts` | 5, 148      | `catchErrorAndSetFailed(error)` | `handleError(error)` |
| `src/libs/services/github/main.ts`         | 5, 31       | `catchErrorAndSetFailed(error)` | `handleError(error)` |
| `src/libs/utils/parsers.ts`                | 2, 145, 177 | `catchErrorAndSetFailed(error)` | `handleError(error)` |

**Step 2: Remove deprecated functions from handlers.ts**

Delete lines 66-82 in `src/libs/utils/handlers.ts` (the `catchErrorAndSetFailed`
and `errorHandler` exports).

**Step 3: Remove deprecated tests from handlers.test.ts**

Delete the `describe('catchErrorAndSetFailed (deprecated)')` and
`describe('errorHandler (deprecated)')` blocks (lines ~105-152).

**Step 4: Update test files that mock `catchErrorAndSetFailed`**

- `src/libs/utils/parser.test.ts` — change mock references from
  `handlers.catchErrorAndSetFailed` to `handlers.handleError`
- `src/libs/services/github/main.test.ts` — replace all `catchErrorAndSetFailed`
  mock references with `handleError`

**Step 5: Run tests**

```bash
pnpm test
```

Expected: All tests pass. No references to `catchErrorAndSetFailed` or
`errorHandler` remain in `src/`.

**Step 6: Commit**

```bash
git add src/libs/utils/handlers.ts src/libs/utils/handlers.test.ts \
  src/libs/utils/parsers.ts src/libs/utils/parser.test.ts \
  src/actions/iac/terraform/main.ts src/actions/iac/terragrunt/main.ts \
  src/actions/docker/buildx/images/main.ts \
  src/libs/services/github/main.ts src/libs/services/github/main.test.ts
git commit -m "refactor: remove deprecated catchErrorAndSetFailed and errorHandler"
```

---

## Task 2: Unify JSON parsing error handling (H2)

**Context:** Three different JSON parsing patterns exist in `parsers.ts`:

1. `parseJsonObject()` — catches, logs warning, returns `{}`
2. `parseJsonToObject<T>()` — catches, calls `handleError`, AND throws
3. `parseArrayFailFast()` — catches, calls `handleError`, returns `[]`

The `handleError` calls in #2 and #3 invoke `core.setFailed()`, which marks the
entire GitHub Action as failed — too harsh for a JSON parse failure in a helper
function.

**Files:**

- Modify: `src/libs/utils/parsers.ts:141-148,170-180`
- Modify: `src/libs/utils/parser.test.ts` — update expectations

**Step 1: Fix `parseJsonToObject` — remove `handleError`, just throw**

```typescript
// Before (lines 141-148)
export function parseJsonToObject<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    handleError(error);
    throw new Error('Invalid JSON string');
  }
}

// After
export function parseJsonToObject<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    throw new Error(`Failed to parse JSON: ${jsonString}`);
  }
}
```

**Step 2: Fix `parseArrayFailFast` — use `core.warning` like `parseJsonObject`**

```typescript
// Before (lines 170-180)
function parseArrayFailFast(input: any): string[] {
  try {
    if (input === null || input === undefined) {
      return [];
    }
    return JSON.parse(input);
  } catch (error) {
    handleError(error);
    return [];
  }
}

// After
function parseArrayFailFast(input: unknown): string[] {
  try {
    if (input === null || input === undefined) {
      return [];
    }
    return JSON.parse(String(input));
  } catch {
    core.warning(`Failed to parse JSON array: ${String(input)}`);
    return [];
  }
}
```

This also fixes M3 (`any` → `unknown`) and replaces the `handleError` call.

**Step 3: Remove `handleError` import if no longer needed**

Check if `parsers.ts` still imports `handleError`. After the above changes it
should not — remove the import line.

**Step 4: Update parser tests**

In `src/libs/utils/parser.test.ts`:

- `parseJsonToObject` error test: expect `throw` with message
  `'Failed to parse JSON: invalid json'`, remove
  `handlers.catchErrorAndSetFailed` assertion
- `parseArrayFailFast` error test: expect `core.warning` call instead of
  `handlers.catchErrorAndSetFailed`

**Step 5: Run tests**

```bash
pnpm test -- --testPathPattern='parser'
```

Expected: All parser tests pass.

**Step 6: Commit**

```bash
git add src/libs/utils/parsers.ts src/libs/utils/parser.test.ts
git commit -m "fix: unify JSON parsing error handling to consistent warn-and-fallback pattern"
```

---

## Task 3: Type-narrow `parseFormattedString` and `ValidationUtils` (M2, M3, L1)

**Files:**

- Modify: `src/libs/utils/parsers.ts:207` — `input: any` → `input: unknown`
- Modify: `src/libs/utils/ValidationUtils.ts:10` — `input: any` →
  `input: unknown`

**Step 1: Narrow `parseFormattedString` signature**

```typescript
// Before (line 207)
export async function parseFormattedString(input: any): Promise<string[]> {

// After
export async function parseFormattedString(input: unknown): Promise<string[]> {
```

This also requires the `Array.isArray(input)` check (line 214) to work with
`unknown` — it already does since `Array.isArray` is a type guard.

**Step 2: Narrow `ValidationUtils.isNullOrUndefined`**

```typescript
// Before (line 10)
static isNullOrUndefined(input: any): boolean {

// After
static isNullOrUndefined(input: unknown): input is null | undefined {
```

This makes it a type guard, which is more useful to callers.

**Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass — no runtime change, only type narrowing.

**Step 4: Commit**

```bash
git add src/libs/utils/parsers.ts src/libs/utils/ValidationUtils.ts
git commit -m "refactor: replace any with unknown in parser and validation utilities"
```

---

## Task 4: Extract version resolver base class (M1)

**Context:** `TerraformVersionResolver` and `TerragruntVersionResolver` share
~60 identical lines: `resolve()`, `resolveFileVersion()`. Only
`fetchLatestVersion()` and the error message tool name differ.

**Files:**

- Create: `src/libs/version-manager/base-version-resolver.ts`
- Modify: `src/libs/version-manager/terraform-version-manager.ts` — extend base
- Modify: `src/libs/version-manager/terragrunt-version-manager.ts` — extend base
- Modify: `src/libs/version-manager/index.ts` — export base
- Create: `src/libs/version-manager/base-version-resolver.test.ts`

**Step 1: Create `base-version-resolver.ts`**

```typescript
import type {
  IVersionFileReader,
  IVersionResolver,
  VersionSpec,
} from './interfaces';

/** Matches an exact semver version without prerelease suffix */
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Abstract base for version resolvers.
 * Subclasses provide the tool name (for error messages) and fetchLatestVersion().
 */
export abstract class BaseVersionResolver implements IVersionResolver {
  constructor(
    protected readonly fileReader: IVersionFileReader,
    protected readonly toolName: string,
  ) {}

  async resolve(
    version: string,
    versionFile: string,
    workingDirectory: string,
  ): Promise<VersionSpec | undefined> {
    const trimmed = version.trim();

    if (trimmed === 'skip') {
      return undefined;
    }

    if (VERSION_REGEX.test(trimmed)) {
      return { input: trimmed, resolved: trimmed, source: 'input' };
    }

    if (trimmed === 'latest') {
      const latest = await this.fetchLatestVersion();
      return { input: trimmed, resolved: latest, source: 'latest' };
    }

    if (trimmed === '') {
      const fileVersion = await this.fileReader.read(
        workingDirectory,
        versionFile,
      );
      if (fileVersion) {
        return this.resolveFileVersion(fileVersion, versionFile);
      }
      const latest = await this.fetchLatestVersion();
      return { input: 'latest', resolved: latest, source: 'latest' };
    }

    throw new Error(
      `Invalid ${this.toolName} version spec: '${trimmed}'. Use 'x.y.z', 'latest', or 'skip'.`,
    );
  }

  private async resolveFileVersion(
    fileVersion: string,
    versionFile: string,
  ): Promise<VersionSpec | undefined> {
    if (fileVersion === 'skip') {
      return undefined;
    }

    if (fileVersion === 'latest') {
      const latest = await this.fetchLatestVersion();
      return { input: fileVersion, resolved: latest, source: 'file' };
    }

    if (VERSION_REGEX.test(fileVersion)) {
      return { input: fileVersion, resolved: fileVersion, source: 'file' };
    }

    throw new Error(
      `Invalid version in ${versionFile}: '${fileVersion}'. Use 'x.y.z', 'latest', or 'skip'.`,
    );
  }

  protected abstract fetchLatestVersion(): Promise<string>;
}
```

**Step 2: Simplify `TerraformVersionResolver`**

```typescript
import { BaseVersionResolver } from './base-version-resolver';
import type { IVersionFileReader } from './interfaces';

const HASHICORP_RELEASES_URL = 'https://releases.hashicorp.com/terraform';
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

function compareSemverDesc(a: string, b: string): number {
  const ap = a.split('.').map(Number);
  const bp = b.split('.').map(Number);
  return bp[0]! - ap[0]! || bp[1]! - ap[1]! || bp[2]! - ap[2]!;
}

export class TerraformVersionResolver extends BaseVersionResolver {
  constructor(fileReader: IVersionFileReader) {
    super(fileReader, 'terraform');
  }

  protected async fetchLatestVersion(): Promise<string> {
    const response = await fetch(`${HASHICORP_RELEASES_URL}/index.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Terraform version index: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      versions: Record<string, unknown>;
    };
    const versions = Object.keys(data.versions)
      .filter(v => VERSION_REGEX.test(v))
      .sort(compareSemverDesc);

    if (versions.length === 0) {
      throw new Error(
        'No stable Terraform versions found in the version index',
      );
    }

    return versions[0]!;
  }
}
```

**Step 3: Simplify `TerragruntVersionResolver`**

```typescript
import { BaseVersionResolver } from './base-version-resolver';
import type { IVersionFileReader } from './interfaces';

const TERRAGRUNT_LATEST_URL =
  'https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest';
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

export class TerragruntVersionResolver extends BaseVersionResolver {
  constructor(fileReader: IVersionFileReader) {
    super(fileReader, 'terragrunt');
  }

  protected async fetchLatestVersion(): Promise<string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'elioetibr/actions',
    };

    const token = process.env['GITHUB_TOKEN'];
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(TERRAGRUNT_LATEST_URL, { headers });
    if (!response.ok) {
      const hint =
        response.status === 403
          ? ' (GitHub API rate limit — set GITHUB_TOKEN to increase the limit)'
          : '';
      throw new Error(
        `Failed to fetch latest Terragrunt version: ${response.status} ${response.statusText}${hint}`,
      );
    }

    const data = (await response.json()) as { tag_name: string };
    const tag = data.tag_name;
    const version = tag.startsWith('v') ? tag.slice(1) : tag;

    if (!VERSION_REGEX.test(version)) {
      throw new Error(`Unexpected Terragrunt latest version format: '${tag}'`);
    }

    return version;
  }
}
```

**Step 4: Write base resolver tests**

Create `src/libs/version-manager/base-version-resolver.test.ts` with a concrete
test subclass:

```typescript
import { BaseVersionResolver } from './base-version-resolver';
import type { IVersionFileReader, VersionSpec } from './interfaces';

class TestResolver extends BaseVersionResolver {
  latestVersion = '1.0.0';

  constructor(fileReader: IVersionFileReader) {
    super(fileReader, 'test-tool');
  }

  protected async fetchLatestVersion(): Promise<string> {
    return this.latestVersion;
  }
}

describe('BaseVersionResolver', () => {
  const mockFileReader: IVersionFileReader = {
    read: jest.fn(),
  };

  let resolver: TestResolver;

  beforeEach(() => {
    resolver = new TestResolver(mockFileReader);
    jest.resetAllMocks();
  });

  test('skip returns undefined', async () => {
    const result = await resolver.resolve('skip', '', '.');
    expect(result).toBeUndefined();
  });

  test('exact version returns as-is', async () => {
    const result = await resolver.resolve('1.2.3', '', '.');
    expect(result).toEqual({
      input: '1.2.3',
      resolved: '1.2.3',
      source: 'input',
    });
  });

  test('latest resolves via fetchLatestVersion', async () => {
    resolver.latestVersion = '2.0.0';
    const result = await resolver.resolve('latest', '', '.');
    expect(result).toEqual({
      input: 'latest',
      resolved: '2.0.0',
      source: 'latest',
    });
  });

  test('empty reads version file', async () => {
    (mockFileReader.read as jest.Mock).mockResolvedValue('1.5.0');
    const result = await resolver.resolve('', '.tool-version', '/project');
    expect(result).toEqual({
      input: '1.5.0',
      resolved: '1.5.0',
      source: 'file',
    });
  });

  test('empty falls back to latest when no file', async () => {
    (mockFileReader.read as jest.Mock).mockResolvedValue(undefined);
    resolver.latestVersion = '3.0.0';
    const result = await resolver.resolve('', '.tool-version', '/project');
    expect(result).toEqual({
      input: 'latest',
      resolved: '3.0.0',
      source: 'latest',
    });
  });

  test('file with skip returns undefined', async () => {
    (mockFileReader.read as jest.Mock).mockResolvedValue('skip');
    const result = await resolver.resolve('', '.tool-version', '/project');
    expect(result).toBeUndefined();
  });

  test('file with latest resolves', async () => {
    (mockFileReader.read as jest.Mock).mockResolvedValue('latest');
    resolver.latestVersion = '4.0.0';
    const result = await resolver.resolve('', '.tool-version', '/project');
    expect(result).toEqual({
      input: 'latest',
      resolved: '4.0.0',
      source: 'file',
    });
  });

  test('invalid spec throws', async () => {
    await expect(resolver.resolve('abc', '', '.')).rejects.toThrow(
      "Invalid test-tool version spec: 'abc'",
    );
  });

  test('invalid file version throws', async () => {
    (mockFileReader.read as jest.Mock).mockResolvedValue('abc');
    await expect(resolver.resolve('', '.tool-version', '.')).rejects.toThrow(
      "Invalid version in .tool-version: 'abc'",
    );
  });
});
```

**Step 5: Update barrel**

Add to `src/libs/version-manager/index.ts`:

```typescript
export * from './base-version-resolver';
```

**Step 6: Run tests**

```bash
pnpm test
```

Expected: All existing version resolver tests still pass. New base tests pass.

**Step 7: Commit**

```bash
git add src/libs/version-manager/
git commit -m "refactor: extract BaseVersionResolver to eliminate resolver duplication"
```

---

## Task 5: Add JSDoc to `ISharedIacSettings` (L3)

**Files:**

- Modify: `src/tools/common/iac-helpers.ts:11-28`

**Step 1: Add field-level JSDoc**

```typescript
export interface ISharedIacSettings {
  /** IaC subcommand to execute (e.g. 'plan', 'apply', 'destroy', 'init') */
  readonly command: string;
  /** Directory containing the IaC configuration files */
  readonly workingDirectory: string;
  /** Key-value variable overrides passed via -var flags */
  readonly variables: Record<string, string>;
  /** Paths to .tfvars files passed via -var-file flags */
  readonly varFiles: string[];
  /** Key-value backend configuration overrides for init -backend-config */
  readonly backendConfig: Record<string, string>;
  /** Resource addresses to target via -target flags */
  readonly targets: string[];
  /** Auto-approve apply/destroy without prompting */
  readonly autoApprove: boolean;
  /** Path to a plan file (input for apply, output for plan -out) */
  readonly planFile: string;
  /** Disable color output */
  readonly noColor: boolean;
  /** Reduce warning verbosity */
  readonly compactWarnings: boolean;
  /** Max concurrent operations (-parallelism); empty string means default */
  readonly parallelism: string;
  /** Duration to wait for state lock (e.g. '30s') */
  readonly lockTimeout: string;
  /** 'false' disables resource refresh during plan/apply */
  readonly refresh: string;
  /** Reconfigure backend during init, ignoring saved config */
  readonly reconfigure: boolean;
  /** Migrate state to new backend during init */
  readonly migrateState: boolean;
  /** Log the command without executing it */
  readonly dryRun: boolean;
}
```

**Step 2: Run typecheck**

```bash
pnpm run build
```

Expected: Build succeeds (src/tools is Vite-only, no tsc typecheck).

**Step 3: Commit**

```bash
git add src/tools/common/iac-helpers.ts
git commit -m "docs: add JSDoc to ISharedIacSettings interface fields"
```

---

## Task 6: Add cache lifetime JSDoc to version installers (L4)

**Files:**

- Modify: `src/libs/version-manager/terraform-version-manager.ts:147` — class
  JSDoc
- Modify: `src/libs/version-manager/terragrunt-version-manager.ts:159` — class
  JSDoc

**Step 1: Enhance installer class JSDoc**

For `TerraformVersionInstaller`:

```typescript
/**
 * Downloads and installs Terraform binaries from HashiCorp releases.
 *
 * Cache location: `$RUNNER_TOOL_CACHE/terraform/<version>/` in CI,
 * `$HOME/.tool-versions/terraform/<version>/` locally.
 *
 * Cache lifetime: indefinite (content-addressed by version). Entries are
 * never evicted — runners are ephemeral and caches are per-runner.
 * For self-hosted runners, manually prune `$RUNNER_TOOL_CACHE` if disk space
 * is a concern.
 */
```

For `TerragruntVersionInstaller`:

```typescript
/**
 * Downloads and installs Terragrunt binaries from GitHub Releases.
 *
 * Cache location: `$RUNNER_TOOL_CACHE/terragrunt/<version>/` in CI,
 * `$HOME/.tool-versions/terragrunt/<version>/` locally.
 *
 * Cache lifetime: indefinite (content-addressed by version). See
 * TerraformVersionInstaller for eviction notes.
 */
```

**Step 2: Run tests**

```bash
pnpm test
```

Expected: Pass (no runtime changes).

**Step 3: Commit**

```bash
git add src/libs/version-manager/terraform-version-manager.ts \
  src/libs/version-manager/terragrunt-version-manager.ts
git commit -m "docs: add cache lifetime documentation to version installers"
```

---

## Task 7: Remove redundant array copies in getters (L5)

**Context:** `BaseIacService` getters `varFiles` and `targets` return
`[...this._varFiles]` (defensive copy). The arrays are `readonly string[]` in
the interface — callers shouldn't mutate. The defensive copies add noise.
However, since these are on an `implements IIacService` path and `readonly` only
means "no mutation methods available" (not truly immutable), this is a judgment
call.

**Decision:** Keep the defensive copies as-is. They are a one-liner per getter,
the cost is negligible, and they protect against accidental mutation by callers
who use `as`. The cognitive load argument doesn't apply to 2-line getters.
**Skip this finding.**

Similarly for `TerragruntService` `includeDirs` and `excludeDirs`.

---

## Task 8: Add early command validation (M4)

**Context:** Command args are validated after building the full command
(`if (!cmd)` after destructuring). The reviewer suggested validating `command`
input earlier. However, the builder pattern already validates commands via the
typed `TerraformCommand`/`TerragruntCommand` union types — the `!cmd` guard is
purely a "paranoid" runtime safety net for the impossible case of
`buildCommand()` returning `[]`.

**Decision:** The current guard is sufficient. Moving validation earlier would
be redundant with the type system. **Skip this finding — already addressed by
type safety.**

---

## Task 9: BaseIacService cognitive load reduction (H1)

**Context:** `BaseIacService.ts` is 392 lines. The reviewer flagged this as high
cognitive load. Analyzing the structure:

- Lines 1-47: constructor + fields (17 private fields) — inherent complexity
- Lines 49-71: lazy accessors (2 factory methods) — small
- Lines 73-159: read-only getters (18 getters) — mechanical, one pattern
- Lines 161-301: mutators (24 setters) — mechanical, one pattern
- Lines 303-392: command generation + utility (clone, reset) — actual logic

The class has high line count but low cognitive complexity per method (every
method is 1-3 lines). Splitting into multiple classes would add indirection
without reducing actual complexity.

**Decision:** Add region separators (already present) and a class-level JSDoc
explaining the structure. Do NOT split the class — it follows the Template
Method pattern correctly and each section is self-contained.

**Files:**

- Modify: `src/actions/iac/common/services/BaseIacService.ts:6-10` — enhance
  JSDoc

**Step 1: Enhance class JSDoc**

```typescript
/**
 * Abstract base service implementation for IaC operations.
 *
 * This class is intentionally large (~390 lines) because it consolidates all
 * 17 shared IaC fields into a single Template Method hierarchy. Each section
 * is a mechanical pattern:
 *
 * - Read-only getters (18): one-liner property accessors
 * - Mutators (24): one-liner setters returning `this` for chaining
 * - Utility methods: clone() and reset() for lifecycle management
 *
 * Subclasses (TerraformService, TerragruntService) only implement factory
 * methods and tool-specific state. Splitting this class would scatter
 * related state without reducing actual complexity.
 */
```

**Step 2: Commit**

```bash
git add src/actions/iac/common/services/BaseIacService.ts
git commit -m "docs: add architectural rationale JSDoc to BaseIacService"
```

---

## Task 10: Magic strings in version managers (L2)

**Context:** After Task 4 extracts `BaseVersionResolver`, the `VERSION_REGEX`
constant is duplicated in 3 files (base, terraform, terragrunt). The tool name
strings are already parameterized.

**Files:**

- Modify: `src/libs/version-manager/base-version-resolver.ts` — export
  `VERSION_REGEX`
- Modify: `src/libs/version-manager/terraform-version-manager.ts` — import from
  base
- Modify: `src/libs/version-manager/terragrunt-version-manager.ts` — import from
  base

**Step 1: Export constant from base**

In `base-version-resolver.ts`, export the regex:

```typescript
/** Matches an exact semver version without prerelease suffix (x.y.z) */
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
```

**Step 2: Replace in terraform-version-manager.ts and
terragrunt-version-manager.ts**

```typescript
import { SEMVER_REGEX } from './base-version-resolver';
// Remove local VERSION_REGEX
```

**Step 3: Run tests**

```bash
pnpm test
```

Expected: All pass.

**Step 4: Commit**

```bash
git add src/libs/version-manager/
git commit -m "refactor: consolidate VERSION_REGEX into shared SEMVER_REGEX constant"
```

---

## Task 11: Simplify terragrunt runner `buildService` (M5)

**Context:** After the Phase A refactoring, `buildService()` in
`src/tools/terragrunt/runner.ts:118-187` is 70 lines of if-then builder calls.
The shared settings are already handled by `configureSharedIacBuilder()`, but
the terragrunt-specific settings (13 fields) are individually configured.

**Decision:** The method is repetitive but each line is a simple conditional.
Extracting it further would create a helper that's called from exactly one place
— violating YAGNI. The code is clear and maintainable as-is. **Skip this
finding.**

---

## Task 12: Final verification

**Step 1: Run full test suite with coverage**

```bash
pnpm test:coverage
```

Expected: All thresholds >= 90%, all tests pass.

**Step 2: Build**

```bash
pnpm run build
```

Expected: Vite build succeeds with all chunks.

**Step 3: Lint + typecheck**

```bash
pnpm run lint:fix && pnpm run typecheck
```

Expected: No errors.

**Step 4: Commit dist if changed**

```bash
git add dist/
git commit -m "build: update compiled dist bundles"
```

---

## Files Modified (Summary)

| Task | New Files                          | Modified Files                                | Deleted Code                             |
| ---- | ---------------------------------- | --------------------------------------------- | ---------------------------------------- |
| 1    | —                                  | 9 files (handlers, parsers, 4 mains, 3 tests) | ~30 lines (deprecated functions + tests) |
| 2    | —                                  | 2 files (parsers.ts, parser.test.ts)          | ~10 lines                                |
| 3    | —                                  | 2 files (parsers.ts, ValidationUtils.ts)      | 0 (type-only)                            |
| 4    | 2 (base-version-resolver.ts, test) | 3 files (tf, tg managers, barrel)             | ~60 lines duplicate                      |
| 5    | —                                  | 1 file (iac-helpers.ts)                       | 0 (JSDoc only)                           |
| 6    | —                                  | 2 files (installers)                          | 0 (JSDoc only)                           |
| 9    | —                                  | 1 file (BaseIacService.ts)                    | 0 (JSDoc only)                           |
| 10   | —                                  | 3 files (version managers)                    | ~4 lines (duplicate regex)               |
| 12   | —                                  | dist/                                         | —                                        |

**Skipped findings (with rationale):**

- L5: Defensive copies are cheap and protect against mutation — keep
- M4: Type system already validates commands — guard is intentional safety net
- M5: YAGNI — single-call helper adds indirection without benefit

**Net effect:** ~100 lines removed, ~70 lines added (base resolver + tests +
JSDoc). 3 `any` types eliminated. 2 deprecated functions removed. JSON error
handling unified.
