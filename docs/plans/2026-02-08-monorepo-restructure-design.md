# Monorepo Restructure: Independent Actions with Documentation

## Goal

Make each GitHub Action independently invocable with clean consumer paths, proper documentation, and SOLID/DRY/KISS compliance. Follow the GitTools/actions pattern where top-level directories are consumer-facing and `src/` is development-only.

## Consumer Experience

```yaml
# Docker BuildX ImageTools
uses: elioetibr/actions/docker/buildx/images@v1

# Terraform
uses: elioetibr/actions/iac/terraform@v1

# Terragrunt
uses: elioetibr/actions/iac/terragrunt@v1
```

## Repository Layout

```
elioetibr/actions/
├── docker/
│   └── buildx/
│       └── images/
│           ├── action.yml
│           ├── README.md
│           └── dist/
│               └── index.js
├── iac/
│   ├── terraform/
│   │   ├── action.yml
│   │   ├── README.md
│   │   └── dist/
│   │       └── index.js
│   └── terragrunt/
│       ├── action.yml
│       ├── README.md
│       └── dist/
│           └── index.js
├── src/
│   ├── actions/
│   │   ├── docker/buildx/images/
│   │   └── iac/
│   │       ├── terraform/
│   │       └── terragrunt/
│   ├── libs/
│   └── index.ts
├── README.md
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Changes

### 1. Create Top-Level Action Directories

Create `docker/buildx/images/`, `iac/terraform/`, `iac/terragrunt/` at the repo root. Each contains an `action.yml` with `main: 'dist/index.js'` (relative to itself).

Move existing `action.yml` files from `src/actions/iac/terraform/action.yml` and `src/actions/iac/terragrunt/action.yml` to the top-level dirs. Move the root `action.yml` to `docker/buildx/images/action.yml`.

### 2. DRY Fix: Extract Shared Parsers

`parseCommaSeparated()` and `parseJsonObject()` are duplicated in both `src/actions/iac/terraform/main.ts` and `src/actions/iac/terragrunt/main.ts`.

Move them to `src/libs/utils/parsers.ts` and update both `main.ts` files to import from there.

### 3. Create Docker BuildX Images Entry Point

Create `src/actions/docker/buildx/images/main.ts` that:

- Reads GitHub Action inputs via `@actions/core`
- Calls `DockerBuildXImageToolsBuilderFactory` to build the service
- Executes the command or dry-runs
- Sets outputs via `core.setOutput()`

### 4. Multi-Target Build

Update `package.json` build scripts:

```json
"build": "tsc --build --clean && yarn build:docker-buildx-images && yarn build:terraform && yarn build:terragrunt",
"build:docker-buildx-images": "ncc build --source-map --out ./docker/buildx/images/dist ./src/actions/docker/buildx/images/main.ts",
"build:terraform": "ncc build --source-map --out ./iac/terraform/dist ./src/actions/iac/terraform/main.ts",
"build:terragrunt": "ncc build --source-map --out ./iac/terragrunt/dist ./src/actions/iac/terragrunt/main.ts"
```

### 5. Documentation

**Root README.md**: Slim hub with overview, quick-reference table linking to each action, development commands, architecture overview.

**Per-action README.md**: Each action gets its own README with inputs/outputs tables, GitHub workflow examples, builder API examples, and builder methods reference. Content migrated from the current monolithic root README.

### 6. Cleanup

- Remove empty placeholder directories: `src/actions/docker/tags/`, `src/actions/docker/buildx/build/`
- Remove old root `dist/` directory
- Remove old root `action.yml`
- Remove old `src/actions/iac/terraform/action.yml` and `src/actions/iac/terragrunt/action.yml`

### 7. Update CLAUDE.md

Reflect new structure, consumer paths, and build commands.

## Implementation Order

1. DRY fix (extract parsers) - unblocks clean main.ts files
2. Create Docker BuildX Images main.ts
3. Create top-level action directories with action.yml files
4. Update build scripts in package.json
5. Build and verify all targets compile
6. Write per-action READMEs
7. Write slim root README
8. Cleanup old files
9. Update CLAUDE.md
10. Run tests and lint
