# GitTools Pattern Restructure

Reorganize the monorepo to match the [GitTools/actions](https://github.com/GitTools/actions) pattern:
consumer-facing directories at root with thin ESM shims, Vite-bundled dist/ committed to repo,
GitVersion for semantic versioning, and floating version branches.

## Decisions

- **dist/ strategy**: Committed to repo, CI auto-commits changes
- **Build system**: Vite with ESM code splitting (replaces ncc)
- **Versioning**: GitVersion + floating major/minor branches (`v1`, `v1.2`)
- **Actions used**: `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `gittools/actions/gitversion/setup@v4`

## Target Structure

```
elioetibr/actions/
├── docker/buildx/images/          # Consumer: elioetibr/actions/docker/buildx/images@v1
│   ├── action.yml
│   ├── main.mjs                   # Thin shim → dist/tools/lib.mjs
│   └── README.md
├── iac/terraform/                 # Consumer: elioetibr/actions/iac/terraform@v1
│   ├── action.yml
│   ├── main.mjs
│   └── README.md
├── iac/terragrunt/                # Consumer: elioetibr/actions/iac/terragrunt@v1
│   ├── action.yml
│   ├── main.mjs
│   └── README.md
├── dist/                          # Compiled output (COMMITTED)
│   └── tools/
│       ├── lib.mjs                # Central run() dispatcher
│       ├── lib.mjs.map
│       ├── github/
│       │   └── agent.mjs          # GitHub Actions build agent
│       └── libs/
│           ├── docker-buildx-images.mjs
│           ├── terraform.mjs
│           ├── terragrunt.mjs
│           ├── tools.mjs          # Shared tool infrastructure
│           └── agents.mjs         # Shared agent code
├── src/                           # Development source
│   ├── actions/                   # Action implementations (builders, services, tests)
│   ├── agents/                    # Build agent abstraction
│   ├── tools/                     # Tool runners + lib.ts entry
│   └── libs/                      # Shared utilities
├── .github/workflows/
│   ├── ci.yml                     # Build + test + auto-commit dist/
│   └── release.yml                # GitVersion + floating branches
├── .gitattributes                 # dist/** linguist-generated
├── GitVersion.yml                 # Semantic versioning config
├── README.md
├── package.json
└── vite.config.mts
```

## Shim Pattern

Each consumer directory contains a 2-line `main.mjs` that delegates to compiled code:

```javascript
// docker/buildx/images/main.mjs
import { run } from '../../../dist/tools/lib.mjs'
await run('github', 'docker-buildx-images')
```

Each `action.yml` points to its co-located shim:

```yaml
runs:
  using: 'node20'
  main: 'main.mjs'
```

## Central Dispatcher

`src/tools/lib.ts` — the `run()` function dynamically imports agent + tool runner:

```typescript
export async function run(agent: string, tool: string): Promise<void> {
  const buildAgent = await getAgent(agent)
  const runner = await getToolRunner(tool)
  await runner.run(buildAgent)
}

async function getAgent(agent: string): Promise<IBuildAgent> {
  const module = await import(`./${agent}/agent.mjs`)
  return new module.BuildAgent()
}

async function getToolRunner(tool: string): Promise<IRunner> {
  const module = await import(`./libs/${tool}.mjs`)
  return new module.Runner()
}
```

## Build System

Replace 3 separate ncc builds with Vite code-split ESM output.

### Tools Build (`src/tools/vite.config.mts`)

- Entry: `src/tools/lib.ts`
- Manual chunks:
  - `docker-buildx-images` ← `src/tools/docker/imagetools/runner.ts`
  - `terraform` ← `src/tools/terraform/runner.ts`
  - `terragrunt` ← `src/tools/terragrunt/runner.ts`
  - `tools` ← `src/tools/common/*`
- Output: `dist/tools/lib.mjs` + `dist/tools/libs/*.mjs`

### Agents Build (`src/agents/vite.config.mts`)

- Entry: `src/agents/github/agent.ts` (parameterized by `--mode`)
- Manual chunks: `agents` ← `src/agents/common/*`
- Output: `dist/tools/github/agent.mjs`

### Package.json Scripts

```json
{
  "build": "run-p build:tools build:agents",
  "build:tools": "vite build --config src/tools/vite.config.mts",
  "build:agents": "vite build --config src/agents/vite.config.mts --mode github"
}
```

## Tool Runners

Each action needs a runner in `src/tools/` that wraps the existing builder logic:

| Runner | Source | Wraps |
|--------|--------|-------|
| `src/tools/docker/imagetools/runner.ts` | Already exists | `src/actions/docker/buildx/images/main.ts` |
| `src/tools/terraform/runner.ts` | **Create** | `src/actions/iac/terraform/main.ts` |
| `src/tools/terragrunt/runner.ts` | **Create** | `src/actions/iac/terragrunt/main.ts` |

Each runner implements `IRunner.run(agent: IBuildAgent)`.

## CI/CD Workflows

### CI (`.github/workflows/ci.yml`)

Trigger: push to main, PRs to main

Steps:
1. Checkout with `fetch-depth: 0` (full history for GitVersion)
2. `gittools/actions/gitversion/setup@v4` — install GitVersion 6.x
3. `gittools/actions/gitversion/execute@v4` — derive version
4. `pnpm/action-setup@v4` + `actions/setup-node@v4` — setup Node 20
5. `pnpm install --frozen-lockfile`
6. `pnpm run build`
7. `pnpm test`
8. `pnpm run lint`
9. Auto-commit dist/ on push to main

### Release (`.github/workflows/release.yml`)

Trigger: GitHub Release published

Steps:
1. Checkout with full history
2. GitVersion setup + execute
3. Force-push floating branches:
   - `v${major}` (e.g., `v1`)
   - `v${major}.${minor}` (e.g., `v1.2`)

## dist/ Management

### .gitignore Changes

Remove `dist/` from `.gitignore` (currently ignored).

### .gitattributes

```
dist/** linguist-generated
```

This hides dist/ from GitHub PR diffs while keeping it committed.

## Implementation Steps

### Step 1: Move consumer-facing files to root paths

- Move `src/actions/docker/buildx/images/action.yml` → `docker/buildx/images/action.yml`
- Move `src/actions/docker/buildx/images/README.md` → `docker/buildx/images/README.md`
- Move `src/actions/iac/terraform/action.yml` → `iac/terraform/action.yml`
- Move `src/actions/iac/terraform/README.md` → `iac/terraform/README.md`
- Move `src/actions/iac/terragrunt/action.yml` → `iac/terragrunt/action.yml`
- Move `src/actions/iac/terragrunt/README.md` → `iac/terragrunt/README.md`
- Update action.yml `runs.main` to `main.mjs`

### Step 2: Create thin shims

- Create `docker/buildx/images/main.mjs`
- Create `iac/terraform/main.mjs`
- Create `iac/terragrunt/main.mjs`

### Step 3: Create missing tool runners

- Create `src/tools/terraform/runner.ts` (wrap terraform main.ts logic)
- Create `src/tools/terragrunt/runner.ts` (wrap terragrunt main.ts logic)
- Verify `src/tools/docker/imagetools/runner.ts` aligns with IRunner interface

### Step 4: Refactor Vite configs

- Create `src/tools/vite.config.mts` for tool library build
- Refactor `src/agents/vite.config.mts` for agent builds
- Create shared `src/vite.common.config.mts`
- Add `npm-run-all` (or `run-p`) dependency

### Step 5: Replace ncc with Vite in package.json

- Remove ncc build scripts
- Add Vite-based build scripts
- Remove `@vercel/ncc` dependency

### Step 6: Commit dist/ to repo

- Remove `dist/` from `.gitignore`
- Create `.gitattributes` with `dist/** linguist-generated`
- Build and commit dist/

### Step 7: Create CI/CD workflows

- Create `.github/workflows/ci.yml`
- Create `.github/workflows/release.yml`
- Both use GitVersion for version derivation

### Step 8: Update documentation

- Update root README.md
- Update CLAUDE.md
- Verify per-action READMEs are accurate

### Step 9: Verify and test

- Run `pnpm run build` — verify dist/ output
- Run `pnpm test` — verify all tests pass
- Run `pnpm run lint` — verify lint passes
- Verify shims resolve: `node docker/buildx/images/main.mjs` (expect controlled failure outside GitHub Actions)
- Verify action.yml → main.mjs → dist/tools/lib.mjs chain
