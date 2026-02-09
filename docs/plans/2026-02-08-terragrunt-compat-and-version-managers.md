# Terragrunt v0.x/v1.x Compatibility + Native Version Manager

**Date:** 2026-02-08 **Status:** COMPLETED **Scope:**
`src/actions/iac/terragrunt/`, `src/libs/version-manager/`, `src/tools/`,
`src/agents/`, `iac/terraform/action.yml`, `iac/terragrunt/action.yml`

**Prerequisites:** Common base classes (`src/actions/iac/common/`) are already
extracted and implemented per `2026-02-08-iac-common-base-classes.md`.

## Summary

Two features in a single plan:

1. **Terragrunt v0.x/v1.x backward compatibility** — auto-detect the installed
   Terragrunt version and emit the correct CLI flags and command syntax for both
   the legacy (v0.x) and redesigned (v1.x) CLI.
2. **Native version manager** — tfenv/tgenv-compatible version resolution and
   binary installation implemented entirely in TypeScript (no shell tools
   required). Two inputs per tool: `terraform-version` /
   `terraform-version-file` and `terragrunt-version` /
   `terragrunt-version-file`.

## Decisions

- **Version detection strategy**: Auto-detect Terragrunt version at runtime via
  `terragrunt --version` (cached per action run). Use the detected major version
  to select v0.x or v1.x flag format.
- **CLI redesign boundary**: `major >= 1` uses the new CLI. v0.88.0-v0.99.x
  supported both old and new flags (deprecation warnings only), so v0.x flags
  are safe until v1.0.0.
- **Version inputs — two per tool**:
  - `terraform-version`: Explicit version string (`1.9.8`, `latest`, `skip`).
    Default: `''` (empty — triggers auto-detect from version file).
  - `terraform-version-file`: Version file name to search for. Default:
    `.terraform-version`. Only consulted when `terraform-version` is empty.
  - Same pattern for `terragrunt-version` / `terragrunt-version-file`.
- **Resolution priority**:
  1. `terraform-version` is `'skip'` → do not install, use PATH binary
  2. `terraform-version` is `'x.y.z'` → install that exact version
  3. `terraform-version` is `'latest'` → fetch + install latest stable
  4. `terraform-version` is empty (default) → search for version file in project
     (walk up from working directory) → if found, use it → if not found, install
     latest stable
- **Strict stable-only**: Only versions matching `\d+\.\d+\.\d+` are accepted.
  Pre-release versions (e.g., `1.10.0-rc1`, `0.76.0-alpha`) are never installed.
- **No shell dependency**: Version resolution, binary download, and extraction
  are all native TypeScript using Node.js `fetch` and `node:fs`/`node:zlib`.
  tfenv/tgenv do NOT need to be installed.
- **IAgent extension**: Add `addPath(inputPath: string): void` and
  `exportVariable(name: string, value: string): void` to `IAgent`. Required for
  the version installer to make binaries available to subsequent steps.
- **action.yml backward compatibility**: All existing inputs retain their names
  and defaults. New inputs are additive.
- **Default is empty (auto-detect)**: When no version input is provided, the
  action auto-detects by searching for a version file (`.terraform-version` /
  `.terragrunt-version`) in the project tree. If no file is found, it installs
  the latest stable version. Consumers who want to skip installation can set
  `terraform-version: 'skip'`.
- **Consumers still pass v0.x command names**: The `command` action input
  accepts the same values as before (`hclfmt`, `run-all`, `validate-inputs`).
  The `TerragruntArgumentBuilder` handles translation to v1.x syntax internally.
  This is transparent to consumers.

## Background: Terragrunt CLI Redesign

Sources:

- <https://terragrunt.gruntwork.io/docs/migrate/cli-redesign/>
- <https://terragrunt.gruntwork.io/docs/migrate/deprecated-attributes/>
- <https://terragrunt.gruntwork.io/docs/migrate/upgrading_to_terragrunt_0.19.x/>

### Flag Renames (v0.x to v1.x)

All `--terragrunt-*` prefixed flags had the prefix removed or were renamed:

| v0.x Flag                                         | v1.x Flag                               | Used by Action |
| ------------------------------------------------- | --------------------------------------- | -------------- |
| `--terragrunt-config`                             | `--config`                              | Yes            |
| `--terragrunt-working-dir`                        | `--working-dir`                         | Yes            |
| `--terragrunt-no-auto-init`                       | `--no-auto-init`                        | Yes            |
| `--terragrunt-no-auto-retry`                      | `--no-auto-retry`                       | Yes            |
| `--terragrunt-non-interactive`                    | `--non-interactive`                     | Yes            |
| `--terragrunt-parallelism`                        | `--parallelism` (terragrunt-level)      | Yes            |
| `--terragrunt-include-dir`                        | `--queue-include-dir`                   | Yes            |
| `--terragrunt-exclude-dir`                        | `--queue-exclude-dir`                   | Yes            |
| `--terragrunt-ignore-dependency-errors`           | `--queue-ignore-errors`                 | Yes            |
| `--terragrunt-ignore-external-dependencies`       | `--queue-exclude-external`              | Yes            |
| `--terragrunt-include-external-dependencies`      | `--queue-include-external`              | Yes            |
| `--terragrunt-source`                             | `--source`                              | Yes            |
| `--terragrunt-source-map`                         | `--source-map`                          | Yes            |
| `--terragrunt-download-dir`                       | `--download-dir`                        | Yes            |
| `--terragrunt-iam-role`                           | `--iam-role`                            | Yes            |
| `--terragrunt-iam-role-session-name`              | `--iam-role-session-name`               | Yes            |
| `--terragrunt-strict-include`                     | `--queue-strict-include`                | Yes            |
| `--terragrunt-no-color`                           | `--no-color`                            | No (future)    |
| `--terragrunt-debug`                              | `--inputs-debug`                        | No (future)    |
| `--terragrunt-log-format`                         | `--log-format`                          | No (future)    |
| `--terragrunt-ignore-dependency-order`            | `--queue-ignore-dag-order`              | No (future)    |
| `--terragrunt-modules-that-include`               | `--units-that-include`                  | No (future)    |
| `--terragrunt-fetch-dependency-output-from-state` | `--dependency-fetch-output-from-state`  | No (future)    |
| `--terragrunt-fail-on-state-bucket-creation`      | removed (backend bootstrap is explicit) | No             |

### Command Renames (v0.x to v1.x)

| v0.x Command           | v1.x Equivalent     | Notes                             |
| ---------------------- | ------------------- | --------------------------------- |
| `run-all <cmd>`        | `run --all <cmd>`   | `run-all` becomes a flag on `run` |
| `graph-dependencies`   | `dag graph`         | Moved under `dag` sub-command     |
| `hclfmt`               | `hcl fmt`           | Moved under `hcl` sub-command     |
| `render-json`          | `render --json -w`  | Now flags on `render`             |
| `output-module-groups` | `find --dag --json` | Replaced by `find` command        |
| `validate-inputs`      | `validate inputs`   | Moved under `validate`            |
| `aws-provider-patch`   | removed             | No v1.x equivalent                |

### New v1.x Commands (not in v0.x)

| Command                    | Purpose                                |
| -------------------------- | -------------------------------------- |
| `run`                      | Explicit OpenTofu/Terraform run        |
| `backend bootstrap`        | Explicit backend resource provisioning |
| `backend migrate`          | Backend migration                      |
| `backend delete`           | Backend resource cleanup               |
| `stack generate/run/clean` | Stack-level operations                 |
| `find`                     | Programmatic unit discovery            |
| `list`                     | Visual unit listing                    |
| `scaffold`                 | Project scaffolding                    |

### Environment Variable Prefix Change (v0.x to v1.x)

| v0.x Env Var                 | v1.x Env Var         |
| ---------------------------- | -------------------- |
| `TERRAGRUNT_*`               | `TG_*`               |
| `TERRAGRUNT_NON_INTERACTIVE` | `TG_NON_INTERACTIVE` |
| `TERRAGRUNT_PARALLELISM`     | `TG_PARALLELISM`     |

### Deprecated HCL Attributes (v1.x)

| Deprecated Attribute       | Replacement             |
| -------------------------- | ----------------------- |
| `skip = true`              | `exclude { if = true }` |
| `retryable_errors`         | `errors { retry { } }`  |
| `retry_max_attempts`       | `errors { retry { } }`  |
| `retry_sleep_interval_sec` | `errors { retry { } }`  |

### Key Behavioral Change (v0.88.0+)

Terragrunt v0.88.0+ no longer forwards unknown commands to OpenTofu/Terraform by
default. Consumers must use `terragrunt run -- <command>` for non-shortcut
commands. However, shortcut commands (`plan`, `apply`, `destroy`, `init`,
`validate`, `fmt`, `output`, `show`) continue to work directly.

## Background: tfenv / tgenv Version File Conventions

Sources:

- <https://github.com/tfutils/tfenv>
- <https://github.com/tgenv/tgenv>

### `.terraform-version` (tfenv)

- **Location**: Project root or any ancestor directory (walks upward)
- **Format**: Single line containing a version spec
- **Specs**: `x.y.z` (exact), `latest`, `latest:<regex>`, `min-required`
- **Precedence**: `TFENV_TERRAFORM_VERSION` env var > `.terraform-version` file
- **Download**:
  `https://releases.hashicorp.com/terraform/${version}/terraform_${version}_${os}_${arch}.zip`
- **Version index**: `https://releases.hashicorp.com/terraform/index.json`

### `.terragrunt-version` (tgenv)

- **Location**: Project root (does not walk upward)
- **Format**: Single line containing a version spec
- **Specs**: `x.y.z` (exact), `latest`, `latest:<regex>`
- **Download**: GitHub Releases for `gruntwork-io/terragrunt`
- **Latest API**:
  `https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest`

### Our Implementation Scope

Supported version specs (MVP):

- `x.y.z` — exact version
- `latest` — latest stable release
- `skip` — do not install, use whatever is on PATH

Deferred (post-MVP):

- `latest:<regex>` — latest matching pattern
- `min-required` — parse Terraform files for `required_version`

## Target Structure

```
src/
  agents/
    interfaces.ts                   # Updated: +addPath(), +exportVariable()
    github/agent.ts                 # Updated: implement new IAgent methods

  actions/iac/
    terragrunt/
      interfaces/
        ITerragruntProvider.ts      # Updated: +terragruntMajorVersion
        ITerragruntService.ts       # Updated: +setTerragruntMajorVersion()
        ITerragruntBuilder.ts       # Updated: +withTerragruntMajorVersion()
      services/
        TerragruntFlagMapping.ts    # NEW: flag/command mapping tables
        TerragruntArgumentBuilder.ts # Updated: version-aware flag/command gen
        TerragruntService.ts        # Updated: terragruntMajorVersion state
      TerragruntBuilder.ts          # Updated: _terragruntMajorVersion field

  libs/
    version-manager/
      index.ts                      # Barrel
      interfaces.ts                 # IVersionResolver, IVersionInstaller, types
      version-detector.ts           # Parse terraform/terragrunt --version output
      version-file-reader.ts        # Walk dirs, read .terraform-version / .terragrunt-version
      terraform-version-manager.ts  # Resolve + install Terraform binaries
      terragrunt-version-manager.ts # Resolve + install Terragrunt binaries
      platform.ts                   # OS/arch detection helpers
      version-detector.test.ts
      version-file-reader.test.ts
      terraform-version-manager.test.ts
      terragrunt-version-manager.test.ts

  tools/
    terraform/
      runner.ts                     # Updated: version resolution step before command
      settings.ts                   # Updated: +terraformVersion, +terraformVersionFile
    terragrunt/
      runner.ts                     # Updated: version resolution + version detection
      settings.ts                   # Updated: +terragruntVersion, +terragruntVersionFile

iac/
  terraform/
    action.yml                      # Updated: +terraform-version, +terraform-version-file
  terragrunt/
    action.yml                      # Updated: +terragrunt-version, +terragrunt-version-file
```

## Implementation Steps

### Phase 1: Infrastructure ✅ COMPLETED

#### Step 1: Extend IAgent interface

Modify `src/agents/interfaces.ts` — add two methods:

```typescript
/** Prepend a path to the system PATH for this and subsequent steps */
addPath(inputPath: string): void;

/** Export an environment variable for this and subsequent steps */
exportVariable(name: string, value: string): void;
```

Implement in `src/agents/github/agent.ts` using `core.addPath()` and
`core.exportVariable()`.

Update existing IAgent tests to cover the new methods.

#### Step 2: Create version-manager module structure

Create `src/libs/version-manager/` with:

**`interfaces.ts`**:

```typescript
import type { IAgent } from '../../agents/interfaces';

export interface SemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly raw: string;
}

export interface VersionSpec {
  /** Original input (e.g., 'latest', '1.9.8', 'skip') */
  readonly input: string;
  /** Resolved exact version (e.g., '1.9.8') */
  readonly resolved: string;
  /** Source of resolution ('input' | 'file' | 'latest') */
  readonly source: 'input' | 'file' | 'latest';
}

export interface IVersionDetector {
  detect(agent: IAgent): Promise<SemVer>;
}

export interface IVersionFileReader {
  /** Walk from startDir upward looking for the version file */
  read(startDir: string, fileName: string): Promise<string | undefined>;
}

export interface IVersionResolver {
  /**
   * Resolve a version spec.
   * @param version - Explicit version ('1.9.8', 'latest', 'skip', or empty)
   * @param versionFile - Path to version file (default: .terraform-version)
   * @param workingDirectory - Starting directory for file search
   * @returns Resolved version spec, or undefined if 'skip'
   */
  resolve(
    version: string,
    versionFile: string,
    workingDirectory: string,
  ): Promise<VersionSpec | undefined>;
}

export interface IVersionInstaller {
  /** Install a specific version. Returns path to the installed binary dir. */
  install(version: string, agent: IAgent): Promise<string>;
  /** Check if a version is already installed */
  isInstalled(version: string): Promise<boolean>;
}
```

**`platform.ts`**:

```typescript
export interface PlatformInfo {
  readonly os: 'linux' | 'darwin' | 'windows';
  readonly arch: 'amd64' | 'arm64';
}

export function getPlatform(): PlatformInfo {
  const os =
    process.platform === 'win32'
      ? 'windows'
      : process.platform === 'darwin'
        ? 'darwin'
        : 'linux';
  const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';
  return { os, arch };
}
```

#### Step 3: Implement version detection

Create `src/libs/version-manager/version-detector.ts`:

- Parse `terraform --version` output: regex `Terraform v(\d+)\.(\d+)\.(\d+)`
- Parse `terragrunt --version` output: regex
  `terragrunt version v(\d+)\.(\d+)\.(\d+)`
- Module-level cache per tool name (one `--version` call per action run)
- Export `detectTerraformVersion(agent): Promise<SemVer>`
- Export `detectTerragruntVersion(agent): Promise<SemVer>`
- Export `isV1OrLater(version: SemVer): boolean` returns `version.major >= 1`
- Uses `agent.run()` — the IAgent interface method for safe command invocation
  (NOT child_process — this is the adapter pattern defined in `src/agents/`)

#### Step 4: Implement version file reader

Create `src/libs/version-manager/version-file-reader.ts`:

- Walk from `startDir` upward through parent directories
- Look for the specified file name (e.g., `.terraform-version`)
- Read the first non-empty, non-comment line
- Trim whitespace
- Return `undefined` if file not found in any ancestor
- Stop at filesystem root or `$HOME`

#### Step 5: Implement Terraform version manager

Create `src/libs/version-manager/terraform-version-manager.ts`:

**Resolution** (`TerraformVersionResolver implements IVersionResolver`):

1. If `version` is `'skip'` then return `undefined`
2. If `version` matches `x.y.z` then return as-is with `source: 'input'`
3. If `version` is empty then read `versionFile` via `IVersionFileReader`:
   - If file found then return with `source: 'file'`
   - If file not found then resolve `latest`
4. If `version` is `'latest'` then fetch latest from
   `https://releases.hashicorp.com/terraform/index.json` (parse JSON, find
   highest non-prerelease version), return with `source: 'latest'`

**Installation** (`TerraformVersionInstaller implements IVersionInstaller`):

- Download URL:
  `https://releases.hashicorp.com/terraform/${version}/terraform_${version}_${os}_${arch}.zip`
- Download with native `fetch` (Node 24 has stable `fetch`)
- Extract zip using `node:zlib` and `node:fs`
- Cache directory: `$RUNNER_TOOL_CACHE/terraform/${version}/${arch}` (GitHub
  Actions convention) or `$HOME/.terraform.versions/${version}` as fallback
- Check `isInstalled()` by looking for the cached binary
- `install()` returns the directory path; caller uses `agent.addPath()`

#### Step 6: Implement Terragrunt version manager

Create `src/libs/version-manager/terragrunt-version-manager.ts`:

**Resolution** (`TerragruntVersionResolver implements IVersionResolver`):

Same pattern as Terraform. For `latest`, fetch from:
`https://api.github.com/repos/gruntwork-io/terragrunt/releases/latest` (parse
JSON, extract `tag_name`, strip `v` prefix).

**Installation** (`TerragruntVersionInstaller implements IVersionInstaller`):

- Download URL:
  `https://github.com/gruntwork-io/terragrunt/releases/download/v${version}/terragrunt_${os}_${arch}`
- Terragrunt releases are standalone binaries (no zip extraction needed)
- Make binary executable with `fs.chmod(path, 0o755)`
- Cache directory: `$RUNNER_TOOL_CACHE/terragrunt/${version}/${arch}` or
  `$HOME/.terragrunt.versions/${version}` as fallback

### Phase 2: Terragrunt v0.x/v1.x Compatibility ✅ COMPLETED

#### Step 7: Create flag and command mapping tables

Create `src/actions/iac/terragrunt/services/TerragruntFlagMapping.ts`:

```typescript
export interface FlagMapping {
  readonly v0: string;
  readonly v1: string;
}

/**
 * Maps semantic flag names to their v0.x and v1.x CLI representations.
 * Only includes flags currently used by the action.
 */
export const TERRAGRUNT_FLAG_MAP: Readonly<Record<string, FlagMapping>> = {
  config: { v0: '--terragrunt-config', v1: '--config' },
  workingDir: { v0: '--terragrunt-working-dir', v1: '--working-dir' },
  noAutoInit: { v0: '--terragrunt-no-auto-init', v1: '--no-auto-init' },
  noAutoRetry: { v0: '--terragrunt-no-auto-retry', v1: '--no-auto-retry' },
  nonInteractive: {
    v0: '--terragrunt-non-interactive',
    v1: '--non-interactive',
  },
  parallelism: { v0: '--terragrunt-parallelism', v1: '--parallelism' },
  includeDir: { v0: '--terragrunt-include-dir', v1: '--queue-include-dir' },
  excludeDir: { v0: '--terragrunt-exclude-dir', v1: '--queue-exclude-dir' },
  ignoreDependencyErrors: {
    v0: '--terragrunt-ignore-dependency-errors',
    v1: '--queue-ignore-errors',
  },
  ignoreExternalDeps: {
    v0: '--terragrunt-ignore-external-dependencies',
    v1: '--queue-exclude-external',
  },
  includeExternalDeps: {
    v0: '--terragrunt-include-external-dependencies',
    v1: '--queue-include-external',
  },
  source: { v0: '--terragrunt-source', v1: '--source' },
  sourceMap: { v0: '--terragrunt-source-map', v1: '--source-map' },
  downloadDir: { v0: '--terragrunt-download-dir', v1: '--download-dir' },
  iamRole: { v0: '--terragrunt-iam-role', v1: '--iam-role' },
  iamRoleSessionName: {
    v0: '--terragrunt-iam-role-session-name',
    v1: '--iam-role-session-name',
  },
  strictInclude: {
    v0: '--terragrunt-strict-include',
    v1: '--queue-strict-include',
  },
} as const;

/**
 * Maps v0.x command names to their v1.x multi-word equivalents.
 * Each entry is an array of tokens for the v1.x command.
 */
export const TERRAGRUNT_COMMAND_MAP: Readonly<
  Record<string, readonly string[]>
> = {
  'run-all': ['run', '--all'],
  'graph-dependencies': ['dag', 'graph'],
  hclfmt: ['hcl', 'fmt'],
  'render-json': ['render', '--json', '-w'],
  'output-module-groups': ['find', '--dag', '--json'],
  'validate-inputs': ['validate', 'inputs'],
} as const;

/** Commands removed in v1.x with no equivalent */
export const REMOVED_V1_COMMANDS: readonly string[] = [
  'aws-provider-patch',
] as const;

/** Helper: select the correct flag string based on major version */
export function selectFlag(flagKey: string, majorVersion: number): string {
  const mapping = TERRAGRUNT_FLAG_MAP[flagKey];
  if (!mapping) {
    throw new Error(`Unknown Terragrunt flag key: ${flagKey}`);
  }
  return majorVersion >= 1 ? mapping.v1 : mapping.v0;
}
```

#### Step 8: Add `terragruntMajorVersion` to ITerragruntProvider

Modify `src/actions/iac/terragrunt/interfaces/ITerragruntProvider.ts`:

```typescript
/** Detected Terragrunt major version (0 for legacy, 1+ for CLI redesign) */
readonly terragruntMajorVersion: number;
```

Default to `0` (legacy behavior) so existing code and tests remain green before
version detection is wired in.

Update `ITerragruntService` to add:

```typescript
setTerragruntMajorVersion(version: number): void;
```

Update `ITerragruntBuilder` to add:

```typescript
withTerragruntMajorVersion(major: number): this;
```

#### Step 9: Update TerragruntBuilder and TerragruntService

**TerragruntBuilder** (`src/actions/iac/terragrunt/TerragruntBuilder.ts`):

- Add `private _terragruntMajorVersion: number = 0;`
- Add fluent method `withTerragruntMajorVersion(major: number): this`
- In `build()`, call
  `service.setTerragruntMajorVersion(this._terragruntMajorVersion)`
- In `resetSpecific()`, reset to `0`

**TerragruntService**
(`src/actions/iac/terragrunt/services/TerragruntService.ts`):

- Add `private _terragruntMajorVersion: number = 0;`
- Add getter `get terragruntMajorVersion(): number`
- Add setter `setTerragruntMajorVersion(version: number): void`
- Update `cloneSpecific()` to copy the field
- Update `resetSpecific()` to reset to `0`

#### Step 10: Make TerragruntArgumentBuilder version-aware

Rewrite `src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.ts`:

**`addTerragruntGlobalArgs(args)`**: Replace hard-coded flag strings with
`selectFlag()` calls. Each flag emission becomes:

```typescript
// Before (v0.x only):
if (this.provider.terragruntConfig) {
  args.push('--terragrunt-config', this.provider.terragruntConfig);
}

// After (version-aware):
if (this.provider.terragruntConfig) {
  args.push(
    selectFlag('config', this.provider.terragruntMajorVersion),
    this.provider.terragruntConfig,
  );
}
```

Apply this pattern to all 17 flags in `addTerragruntGlobalArgs()`.

**`buildCommand()`**: Handle command translation:

```typescript
buildCommand(): string[] {
  const command = this.provider.command;
  const isV1 = this.provider.terragruntMajorVersion >= 1;
  const args = this.toCommandArgs();

  // Handle run-all mode
  if (this.provider.runAll && this.isTerraformCommand(command)) {
    if (isV1) {
      return [this.provider.executor, 'run', '--all', command, ...args];
    }
    return [this.provider.executor, 'run-all', command, ...args];
  }

  // Handle terragrunt-native commands that were renamed in v1.x
  if (isV1 && command in TERRAGRUNT_COMMAND_MAP) {
    const v1Tokens = TERRAGRUNT_COMMAND_MAP[command]!;
    return [this.provider.executor, ...v1Tokens, ...args];
  }

  // Handle removed commands
  if (isV1 && REMOVED_V1_COMMANDS.includes(command)) {
    throw new Error(
      `Command '${command}' was removed in Terragrunt v1.x and has no equivalent.`,
    );
  }

  return [this.provider.executor, command, ...args];
}
```

### Phase 3: Wire Version Management into Runners ✅ COMPLETED

#### Step 11: Add action.yml inputs

**`iac/terraform/action.yml`** — add before `dry-run`:

```yaml
terraform-version:
  description: >
    Terraform version to install. Use 'x.y.z' for a specific stable version,
    'latest' for the latest stable release, or 'skip' to use whatever terraform
    binary is already on PATH. When empty (default), searches for a
    terraform-version-file in the project tree, falling back to 'latest'.
    Pre-release versions are not supported.
  required: false
  default: ''
terraform-version-file:
  description: >
    Version file name to search for (tfenv-compatible). Only used when
    terraform-version is empty. Searched from working-directory upward through
    parent directories. The file should contain a single line with a stable
    version string (e.g., '1.9.8').
  required: false
  default: '.terraform-version'
```

**`iac/terragrunt/action.yml`** — add before `dry-run`:

```yaml
terragrunt-version:
  description: >
    Terragrunt version to install. Use 'x.y.z' for a specific stable version,
    'latest' for the latest stable release, or 'skip' to use whatever terragrunt
    binary is already on PATH. When empty (default), searches for a
    terragrunt-version-file in the project tree, falling back to 'latest'.
    Pre-release versions are not supported.
  required: false
  default: ''
terragrunt-version-file:
  description: >
    Version file name to search for (tgenv-compatible). Only used when
    terragrunt-version is empty. Searched from working-directory upward through
    parent directories. The file should contain a single line with a stable
    version string (e.g., '0.75.10').
  required: false
  default: '.terragrunt-version'
```

#### Step 12: Update settings

**`src/tools/terraform/settings.ts`** — add to `ITerraformSettings`:

```typescript
terraformVersion: string;
terraformVersionFile: string;
```

Add to `getSettings()`:

```typescript
terraformVersion: agent.getInput('terraform-version'),
terraformVersionFile: agent.getInput('terraform-version-file') || '.terraform-version',
```

**`src/tools/terragrunt/settings.ts`** — add to `ITerragruntSettings`:

```typescript
terragruntVersion: string;
terragruntVersionFile: string;
```

Add to `getSettings()`:

```typescript
terragruntVersion: agent.getInput('terragrunt-version'),
terragruntVersionFile: agent.getInput('terragrunt-version-file') || '.terragrunt-version',
```

#### Step 13: Update Terraform runner

Modify `src/tools/terraform/runner.ts`:

Add a version resolution step before command build:

```typescript
private async run(agent: IAgent): Promise<IRunnerResult> {
  try {
    const settings = getSettings(agent);

    // --- NEW: Version resolution + installation ---
    agent.startGroup('Terraform version setup');
    const versionSpec = await terraformResolver.resolve(
      settings.terraformVersion,
      settings.terraformVersionFile,
      settings.workingDirectory,
    );
    if (versionSpec) {
      agent.info(`Resolved Terraform version: ${versionSpec.resolved} (source: ${versionSpec.source})`);
      if (!await terraformInstaller.isInstalled(versionSpec.resolved)) {
        const binDir = await terraformInstaller.install(versionSpec.resolved, agent);
        agent.addPath(binDir);
      }
    } else {
      agent.info('Terraform version management: skip (using PATH binary)');
    }
    agent.endGroup();

    // --- Existing code continues unchanged ---
    agent.info(`Starting Terraform ${settings.command} action...`);
    // ...
  }
}
```

#### Step 14: Update Terragrunt runner

Modify `src/tools/terragrunt/runner.ts`:

Add both version resolution AND version detection:

```typescript
private async run(agent: IAgent): Promise<IRunnerResult> {
  try {
    const settings = getSettings(agent);

    // --- NEW: Version resolution + installation ---
    agent.startGroup('Terragrunt version setup');
    const versionSpec = await terragruntResolver.resolve(
      settings.terragruntVersion,
      settings.terragruntVersionFile,
      settings.workingDirectory,
    );
    if (versionSpec) {
      agent.info(`Resolved Terragrunt version: ${versionSpec.resolved} (source: ${versionSpec.source})`);
      if (!await terragruntInstaller.isInstalled(versionSpec.resolved)) {
        const binDir = await terragruntInstaller.install(versionSpec.resolved, agent);
        agent.addPath(binDir);
      }
    } else {
      agent.info('Terragrunt version management: skip (using PATH binary)');
    }
    agent.endGroup();

    // --- NEW: Detect installed version for CLI compatibility ---
    agent.startGroup('Terragrunt version detection');
    const detectedVersion = await detectTerragruntVersion(agent);
    const isV1 = isV1OrLater(detectedVersion);
    agent.info(
      `Detected Terragrunt v${detectedVersion.major}.${detectedVersion.minor}.${detectedVersion.patch}` +
      ` (using ${isV1 ? 'v1.x' : 'v0.x'} CLI syntax)`,
    );
    agent.endGroup();

    const modeLabel = settings.runAll ? 'run-all ' : '';
    agent.info(`Starting Terragrunt ${modeLabel}${settings.command} action...`);

    // Build the service WITH major version
    const service = this.buildService(settings, detectedVersion.major);
    // --- Existing code continues unchanged ---
  }
}

private buildService(settings: ITerragruntSettings, terragruntMajorVersion: number) {
  const builder = TerragruntBuilder.create(settings.command)
    .withWorkingDirectory(settings.workingDirectory)
    .withTerragruntMajorVersion(terragruntMajorVersion);

  // ... rest of existing builder configuration unchanged ...
}
```

### Phase 4: Tests ✅ COMPLETED

#### Step 15: Unit tests for version-manager module

**`version-detector.test.ts`**:

- Mock `agent` with `terragrunt --version` returning
  `terragrunt version v0.75.10` and assert `{ major: 0, minor: 75, patch: 10 }`
- Mock returning `terragrunt version v1.0.0` and assert
  `{ major: 1, minor: 0, patch: 0 }`
- Mock returning `Terraform v1.9.8 on linux_amd64\n` and assert
  `{ major: 1, minor: 9, patch: 8 }`
- Test caching: second call does not invoke agent method again
- Test `isV1OrLater()`: `{ major: 0 }` returns false, `{ major: 1 }` returns
  true

**`version-file-reader.test.ts`**:

- Mock filesystem with `.terraform-version` at various ancestor levels
- Test upward-walk finds file in parent directory
- Test returns `undefined` when file not found
- Test reads first non-empty line, trims whitespace
- Test stops at home directory

**`terraform-version-manager.test.ts`**:

- Mock fetch for `releases.hashicorp.com/terraform/index.json`
- Test `resolve('1.9.8', ...)` returns `{ resolved: '1.9.8', source: 'input' }`
- Test `resolve('latest', ...)` returns latest from index, `source: 'latest'`
- Test `resolve('skip', ...)` returns `undefined`
- Test `resolve('', '.terraform-version', dir)` with file present returns
  `source: 'file'`
- Test `resolve('', '.terraform-version', dir)` without file returns
  `source: 'latest'`
- Test `install()` downloads, extracts, returns cache path
- Test `isInstalled()` checks cache directory

**`terragrunt-version-manager.test.ts`**:

- Same pattern, mock GitHub API response

#### Step 16: Unit tests for Terragrunt v1.x compatibility

**Update existing `TerragruntArgumentBuilder.test.ts`**:

Add test groups for version-aware behavior:

```
describe('v0.x flag generation (legacy)')
  - Each flag emits --terragrunt-* prefix (regression tests for current behavior)
  - run-all emits ['terragrunt', 'run-all', 'plan', ...]
  - hclfmt emits ['terragrunt', 'hclfmt']
  - graph-dependencies emits ['terragrunt', 'graph-dependencies']

describe('v1.x flag generation (CLI redesign)')
  - Each flag emits short name (--config, --working-dir, etc.)
  - run-all emits ['terragrunt', 'run', '--all', 'plan', ...]
  - hclfmt emits ['terragrunt', 'hcl', 'fmt']
  - graph-dependencies emits ['terragrunt', 'dag', 'graph']
  - validate-inputs emits ['terragrunt', 'validate', 'inputs']
  - aws-provider-patch throws Error with clear message
```

**`TerragruntFlagMapping.test.ts`**:

- Test `selectFlag()` for each key with v0 and v1 major versions
- Test unknown key throws

**Update `TerragruntBuilder.test.ts`**:

- Test `withTerragruntMajorVersion()` passes through to service
- Test default major version is `0`

**Update `TerragruntService.test.ts`**:

- Test getter/setter for `terragruntMajorVersion`
- Test `clone()` copies the field
- Test `reset()` resets to `0`

#### Step 17: Update runner tests

**Update `src/tools/terraform/runner.test.ts`**:

- Mock version resolver and installer
- Test that version resolution runs before command invocation
- Test `skip` mode does not install
- Test `latest` mode calls installer
- Test version file resolution when version input is empty

**Update `src/tools/terragrunt/runner.test.ts`**:

- Same as Terraform plus:
- Mock `detectTerragruntVersion()` returning v0 and v1 versions
- Test that major version is passed to builder
- Test v1 detection causes v1 flag generation (integration)

### Phase 5: Build and Verify ✅ COMPLETED

#### Step 18: Rebuild and verify

- `pnpm run lint:fix` — fix any lint issues
- `pnpm run typecheck` — TypeScript compilation check
- `pnpm run build` — clean Vite build
- `pnpm test` — all tests pass (existing + new)
- `pnpm run test:coverage` — verify 90% thresholds maintained
- Update `vite.config.mts` `manualChunks` if version-manager needs its own chunk

#### Step 19: E2E testing

- Create `.terraform-version` in `e2e/terraform/` containing `1.9.8`
- Create `.terragrunt-version` in `e2e/terragrunt/live/` containing `0.75.10`
- Add E2E workflow job testing version-file resolution
- Test with Terragrunt v0.75.10 (v0.x flags)
- Optionally test with Terragrunt v1.x (v1.x flags)
- Verify `make e2e-terraform` and `make e2e-terragrunt` pass

## Migration Path for Consumers

### Terragrunt v0.x/v1.x Compatibility

**No action required.** Existing consumers using
`elioetibr/actions/iac/terragrunt@v1` with Terragrunt v0.x continue to work
without changes. Consumers upgrading to Terragrunt v1.x just need to install the
new binary — the action auto-detects the version and emits correct flags.

### Version Management

**Behavioral change:** When no version input is provided, the action now
auto-detects by searching for `.terraform-version` / `.terragrunt-version` files
in the project tree. If no version file is found, it installs the latest stable
release. This differs from the previous behavior where the action used whatever
was on PATH.

To preserve the old behavior (use PATH binary), set:

```yaml
- uses: elioetibr/actions/iac/terraform@v1
  with:
    command: plan
    terraform-version: skip
```

All existing action inputs retain their names and defaults. The new inputs are
additive.

## Risk Assessment

| Risk                                                     | Mitigation                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `terragrunt --version` output format changes             | Parse with regex, test against known formats for v0.75.x, v1.0.x, v1.2.x                      |
| Terragrunt v2.x introduces further changes               | Version detector is extensible; add new branch for `major >= 2`                               |
| Network failure downloading binaries                     | Fail fast with clear error. Suggest `skip` + `setup-terraform`/`setup-terragrunt` as fallback |
| `.terraform-version` not found                           | Falls through to `latest` resolution                                                          |
| Mixed v0.x/v1.x flags in same CI matrix                  | Each job detects independently, no cross-contamination                                        |
| `aws-provider-patch` with v1.x Terragrunt                | Throw clear error: command removed in v1.x                                                    |
| Default `latest` changes behavior for existing consumers | Document in release notes; `skip` opt-out is trivial                                          |
| GitHub API rate limiting for Terragrunt latest           | Use conditional requests (If-None-Match), fall back to cached version                         |
| `releases.hashicorp.com` schema change                   | Index.json schema is stable; version-specific URL pattern is documented                       |
| Zip extraction failure on non-standard platform          | Support linux/darwin amd64/arm64 only; clear error for unsupported platforms                  |

## Non-Goals

- Changing the external API surface (action.yml input names) of existing inputs
- Supporting `latest:<regex>` or `min-required` version specs (post-MVP)
- Adding Terragrunt v1.x-only commands to the `command` input (`find`, `list`,
  `scaffold`, `stack`, `backend`) — consumers can invoke these directly since
  they are not part of the builder pattern
- Changing runner or settings logic beyond what is needed for version management
  and version detection
- Supporting OpenTofu as an alternative to Terraform (future feature)
