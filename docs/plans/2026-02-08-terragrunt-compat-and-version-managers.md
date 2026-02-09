# Terragrunt Backward Compatibility + Version Manager Integration

Support both Terragrunt v0.x (pre-CLI-redesign) and v1.x (post-CLI-redesign) in
a single action. Integrate tfenv/tgenv-style version file detection into the
Terraform and Terragrunt actions.

## Decisions

- **Version detection strategy**: Auto-detect Terragrunt version at runtime via
  `terragrunt --version` (cached per run). Use version boundaries to select v0.x
  or v1.x flag format.
- **CLI redesign boundary**: Terragrunt v0.88.0 introduced the CLI redesign.
  v1.0.0 removed legacy flags entirely. Our boundary is `>= 1.0.0` for the new
  format (v0.88.x-v0.99.x supported both).
- **No new action inputs for version detection**: The action auto-detects the
  installed Terragrunt version. Users do not need to specify it.
- **Version file convention**: `.terraform-version` for Terraform,
  `.terragrunt-version` for Terragrunt (same format as tfenv/tgenv).
- **Version management is opt-in**: New `terraform-version` /
  `terragrunt-version` action inputs. If empty (default), the action uses
  whatever binary is on PATH. If set to a version string or `file`, the action
  resolves and installs the binary.
- **No shell dependency**: tfenv/tgenv are bash-based tools. We implement
  version resolution in TypeScript directly, downloading binaries from official
  sources (HashiCorp for Terraform, gruntwork-io for Terragrunt) without
  requiring tfenv/tgenv to be installed.
- **action.yml backward compatibility**: All existing inputs retain their names
  and defaults. New inputs are additive. No breaking changes for consumers.

## Background: Terragrunt CLI Redesign

### Flag Renames (v0.x to v1.x)

| v0.x Flag                                    | v1.x Flag                          |
| -------------------------------------------- | ---------------------------------- |
| `--terragrunt-config`                        | `--config`                         |
| `--terragrunt-working-dir`                   | `--working-dir`                    |
| `--terragrunt-no-auto-init`                  | `--no-auto-init`                   |
| `--terragrunt-no-auto-retry`                 | `--no-auto-retry`                  |
| `--terragrunt-non-interactive`               | `--non-interactive`                |
| `--terragrunt-parallelism`                   | `--parallelism` (terragrunt-level) |
| `--terragrunt-include-dir`                   | `--queue-include-dir`              |
| `--terragrunt-exclude-dir`                   | `--queue-exclude-dir`              |
| `--terragrunt-ignore-dependency-errors`      | `--queue-ignore-errors`            |
| `--terragrunt-ignore-external-dependencies`  | `--queue-exclude-external`         |
| `--terragrunt-include-external-dependencies` | `--queue-include-external`         |
| `--terragrunt-source`                        | `--source`                         |
| `--terragrunt-source-map`                    | `--source-map`                     |
| `--terragrunt-download-dir`                  | `--download-dir`                   |
| `--terragrunt-iam-role`                      | `--iam-role`                       |
| `--terragrunt-iam-role-session-name`         | `--iam-role-session-name`          |
| `--terragrunt-strict-include`                | `--queue-strict-include`           |

### Command Renames (v0.x to v1.x)

| v0.x Command           | v1.x Command         |
| ---------------------- | -------------------- |
| `run-all <cmd>`        | `run --all <cmd>`    |
| `graph-dependencies`   | `graph dependencies` |
| `hclfmt`               | `hcl fmt`            |
| `render-json`          | `render --json -w`   |
| `output-module-groups` | `output groups`      |
| `validate-inputs`      | `validate inputs`    |
| `aws-provider-patch`   | removed              |

### Environment Variable Renames (v0.x to v1.x)

| v0.x Env Var                 | v1.x Env Var         |
| ---------------------------- | -------------------- |
| `TERRAGRUNT_*`               | `TG_*`               |
| `TERRAGRUNT_NON_INTERACTIVE` | `TG_NON_INTERACTIVE` |
| `TERRAGRUNT_PARALLELISM`     | `TG_PARALLELISM`     |

## Target Structure

```
src/
  actions/iac/
    terraform/
      (no changes to existing files)
    terragrunt/
      interfaces/
        ITerragruntProvider.ts    # Updated: TerragruntCommand type adds v1.x commands
      services/
        TerragruntArgumentBuilder.ts  # Updated: version-aware flag generation
  libs/
    version-manager/
      index.ts                      # Barrel
      interfaces.ts                 # IVersionResolver, IVersionInstaller
      terraform-resolver.ts         # .terraform-version detection + download
      terragrunt-resolver.ts        # .terragrunt-version detection + download
      version-detector.ts           # terragrunt --version parsing + caching
  tools/
    terraform/
      runner.ts                     # Updated: version resolution step
      settings.ts                   # Updated: terraform-version input
    terragrunt/
      runner.ts                     # Updated: version resolution + detection step
      settings.ts                   # Updated: terragrunt-version input

iac/
  terraform/
    action.yml                        # Updated: terraform-version input
  terragrunt/
    action.yml                        # Updated: terragrunt-version input

e2e/
  terraform/
    .terraform-version                # Test fixture
  terragrunt/
    live/
      .terragrunt-version           # Test fixture
```

## Implementation Steps

### Step 1: Create version detection utility

Create `src/libs/version-manager/version-detector.ts`:

- Parse `terragrunt --version` output to a semver triple
- Export `TerragruntVersion` type:
  `{ major: number; minor: number; patch: number }`
- Export `detectTerragruntVersion(agent: IAgent): Promise<TerragruntVersion>`
- Export `isV1OrLater(version: TerragruntVersion): boolean` returning `true` if
  `major >= 1`
- Cache result in a module-level variable (one `--version` call per action run)

Also create `detectTerraformVersion(agent: IAgent)` with the same pattern for
future use.

### Step 2: Make TerragruntArgumentBuilder version-aware

Modify `src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.ts`:

1. Add a `terragruntMajorVersion` field to `ITerragruntProvider` (or pass it via
   constructor)
2. In `addTerragruntGlobalArgs()`, branch on version:
   - v0.x: emit `--terragrunt-config`, `--terragrunt-working-dir`, etc. (current
     behavior)
   - v1.x: emit `--config`, `--working-dir`, etc. (new flag names)
3. In `buildCommand()`, branch on version for `run-all`:
   - v0.x: `['terragrunt', 'run-all', '<cmd>', ...args]`
   - v1.x: `['terragrunt', 'run', '--all', '<cmd>', ...args]`

Key mapping (implemented as a static lookup, not a runtime string replacement):

```typescript
interface FlagMapping {
  readonly v0: string;
  readonly v1: string;
}

const TERRAGRUNT_FLAGS: Record<string, FlagMapping> = {
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
};
```

### Step 3: Update TerragruntCommand type and TERRAGRUNT_COMMANDS

Modify `src/actions/iac/terragrunt/interfaces/ITerragruntProvider.ts`:

```typescript
// v0.x-only commands (deprecated in v1.x)
export type TerragruntLegacyCommand =
  | 'run-all'
  | 'graph-dependencies'
  | 'hclfmt'
  | 'aws-provider-patch'
  | 'render-json'
  | 'output-module-groups'
  | 'validate-inputs';

// v1.x equivalent commands (multi-word, resolved at build time)
export type TerragruntV1Command =
  | 'graph dependencies'
  | 'hcl fmt'
  | 'validate inputs'
  | 'output groups';

export type TerragruntCommand = TerraformCommand | TerragruntLegacyCommand;
```

The `TerragruntArgumentBuilder` handles the translation internally. Consumers
still pass legacy command names (e.g., `hclfmt`), and the builder emits the
correct v1.x multi-word form when needed.

### Step 4: Add `terragruntVersion` to ITerragruntProvider

Add to `ITerragruntProvider`:

```typescript
/** Detected Terragrunt major version (0 for legacy, 1+ for CLI redesign) */
readonly terragruntMajorVersion: number;
```

Update `TerragruntBuilder`:

- Add `withTerragruntMajorVersion(major: number)` fluent method
- Pass through to the built provider

### Step 5: Update the Terragrunt runner for version detection

Modify `src/tools/terragrunt/runner.ts`:

1. Before building the service, call `detectTerragruntVersion(agent)`
2. Pass the detected major version to the builder:
   `builder.withTerragruntMajorVersion(version.major)`
3. Log the detected version:
   `agent.info('Detected Terragrunt v${version.major}.${version.minor}.${version.patch}')`

### Step 6: Create version resolution infrastructure

Create `src/libs/version-manager/interfaces.ts`:

```typescript
export interface VersionSpec {
  /** Raw version string from input or file (e.g., 'latest', '1.9.8', 'file') */
  readonly raw: string;
  /** Resolved exact version (e.g., '1.9.8') */
  readonly resolved: string;
}

export interface IVersionResolver {
  /** Resolve a version spec to an exact version. Returns undefined if not applicable. */
  resolve(
    spec: string,
    workingDirectory: string,
  ): Promise<VersionSpec | undefined>;
}

export interface IVersionInstaller {
  /** Install a specific version. Returns path to the binary. */
  install(version: string, agent: IAgent): Promise<string>;
  /** Check if a version is already installed */
  isInstalled(version: string): Promise<boolean>;
}
```

### Step 7: Implement Terraform version resolver

Create `src/libs/version-manager/terraform-resolver.ts`:

- `resolveTerraformVersion(spec, workingDir)`:
  - `''` (empty): skip, use whatever is on PATH
  - `'file'`: walk from `workingDir` upward looking for `.terraform-version`,
    read first line
  - `'latest'`: fetch latest release tag from
    `releases.hashicorp.com/terraform/index.json`
  - `'x.y.z'`: use as-is
- `installTerraform(version, agent)`:
  - Download from
    `releases.hashicorp.com/terraform/${version}/terraform_${version}_${os}_${arch}.zip`
  - Extract to `$RUNNER_TOOL_CACHE/terraform/${version}` (or
    `$HOME/.terraform.versions/`)
  - Add to PATH via `agent.addPath()`

### Step 8: Implement Terragrunt version resolver

Create `src/libs/version-manager/terragrunt-resolver.ts`:

- `resolveTerragruntVersion(spec, workingDir)`:
  - `''` (empty): skip
  - `'file'`: walk from `workingDir` upward looking for `.terragrunt-version`,
    read first line
  - `'latest'`: fetch latest release from GitHub API
    (`gruntwork-io/terragrunt/releases/latest`)
  - `'x.y.z'`: use as-is
- `installTerragrunt(version, agent)`:
  - Download from GitHub Releases for gruntwork-io/terragrunt
  - Make executable, place in `$RUNNER_TOOL_CACHE/terragrunt/${version}`
  - Add to PATH via `agent.addPath()`

### Step 9: Add action.yml inputs for version management

`iac/terraform/action.yml` add:

```yaml
terraform-version:
  description: >
    Terraform version to install. Options: - '' (empty, default): Use existing
    terraform on PATH - 'file': Read from .terraform-version file in working
    directory (walks parent dirs) - 'latest': Install the latest stable release
    - 'x.y.z': Install a specific version (e.g., '1.9.8')
  required: false
  default: ''
```

`iac/terragrunt/action.yml` add:

```yaml
terragrunt-version:
  description: >
    Terragrunt version to install. Options: - '' (empty, default): Use existing
    terragrunt on PATH - 'file': Read from .terragrunt-version file in working
    directory (walks parent dirs) - 'latest': Install the latest stable release
    - 'x.y.z': Install a specific version (e.g., '0.75.10')
  required: false
  default: ''
```

### Step 10: Update runners for version resolution

Modify `src/tools/terraform/runner.ts` to add version resolution before command
build.

Same pattern for `src/tools/terragrunt/runner.ts`, adding version resolution
before the existing `detectTerragruntVersion` call.

### Step 11: Update settings for new inputs

`src/tools/terraform/settings.ts` add `terraformVersion: string` to interface
and `agent.getInput('terraform-version')` to getSettings().

`src/tools/terragrunt/settings.ts` add `terragruntVersion: string` to interface
and `agent.getInput('terragrunt-version')` to getSettings().

### Step 12: Update E2E tests

- Create `.terraform-version` in `e2e/terraform/` containing `1.9.8`
- Create `.terragrunt-version` in `e2e/terragrunt/live/` containing `0.75.10`
- Add a new E2E workflow job that tests version-file resolution:
  - Set `terraform-version: 'file'` and verify the correct version is installed
  - Set `terragrunt-version: 'file'` and verify the correct version is installed
- Update existing E2E workflows to optionally pin versions via the new inputs

### Step 13: Write unit tests

For each new module:

- `version-detector.test.ts`: mock agent with sample `terragrunt --version`
  output for v0.75.10, v1.0.0, v1.2.3
- `terraform-resolver.test.ts`: mock file system reads for `.terraform-version`,
  mock HTTP for latest
- `terragrunt-resolver.test.ts`: same pattern
- `TerragruntArgumentBuilder.test.ts` existing tests plus new test cases:
  - v0.x: flags emit `--terragrunt-*` prefix (regression test for current
    behavior)
  - v1.x: flags emit short names (`--config`, `--working-dir`, etc.)
  - v0.x: `run-all` emits `['terragrunt', 'run-all', 'plan', ...]`
  - v1.x: `run-all` emits `['terragrunt', 'run', '--all', 'plan', ...]`
  - v0.x: `hclfmt` emits `['terragrunt', 'hclfmt']`
  - v1.x: `hclfmt` emits `['terragrunt', 'hcl', 'fmt']`

### Step 14: Rebuild and verify

- `pnpm run build` clean build
- `pnpm test` all tests pass (existing + new)
- `make e2e-terraform` Terraform lifecycle green
- `make e2e-terragrunt` Terragrunt (v0.75.10) lifecycle green
- Optionally test with Terragrunt v1.x by changing e2e workflow version

## Migration Path for Consumers

**No action required.** Existing consumers using
`elioetibr/actions/iac/terragrunt@v1` with Terragrunt v0.x will continue to work
without changes. Consumers upgrading to Terragrunt v1.x just need to install the
new Terragrunt binary. The action auto-detects the version and emits the correct
flags.

New version management inputs are opt-in with empty defaults. Zero impact on
existing workflows.

## Risk Assessment

| Risk                                                   | Mitigation                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `terragrunt --version` output format changes           | Parse with regex, test against known output formats                                        |
| Terragrunt v2.x introduces further changes             | Version detector is extensible, add new branch                                             |
| Network failure downloading binaries                   | Fail fast with clear error message, suggest setup-terraform / setup-terragrunt as fallback |
| `.terraform-version` / `.terragrunt-version` not found | Return undefined, fall through to PATH binary                                              |
| Mixed v0.x/v1.x flags in same CI matrix                | Each job detects independently, no cross-contamination                                     |
