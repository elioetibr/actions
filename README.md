# GitHub Actions

A monorepo of independently invocable GitHub Actions for Docker manifest creation and Infrastructure as Code (IaC) operations.

## Available Actions

| Action | Description | Usage |
|--------|-------------|-------|
| [Docker BuildX ImageTools](./docker/buildx/images/README.md) | Create multi-architecture Docker manifests | `elioetibr/actions/docker/buildx/images@v1` |
| [Terraform](./iac/terraform/README.md) | Execute Terraform commands with a fluent builder API | `elioetibr/actions/iac/terraform@v1` |
| [Terragrunt](./iac/terragrunt/README.md) | Execute Terragrunt commands with run-all support | `elioetibr/actions/iac/terragrunt@v1` |

## Quick Start

```yaml
# Docker BuildX ImageTools
- uses: elioetibr/actions/docker/buildx/images@v1
  with:
    ecrRegistry: ${{ steps.ecr-login.outputs.registry }}
    ecrRepository: my-app
    semVer: '1.0.0'

# Terraform
- uses: elioetibr/actions/iac/terraform@v1
  with:
    command: plan
    working-directory: ./infrastructure

# Terragrunt
- uses: elioetibr/actions/iac/terragrunt@v1
  with:
    command: plan
    working-directory: ./infrastructure
    run-all: 'true'
```

## Architecture

Follows the [GitTools/actions](https://github.com/GitTools/actions) monorepo pattern: each action has a thin `main.mjs` shim that imports from a shared compiled library.

```
elioetibr/actions/
├── docker/buildx/images/     # Consumer-facing action
│   ├── action.yml            # GitHub Action definition
│   ├── main.mjs              # Thin shim → dist/tools/lib.mjs
│   └── README.md
├── iac/terraform/            # Consumer-facing action
│   ├── action.yml
│   ├── main.mjs
│   └── README.md
├── iac/terragrunt/           # Consumer-facing action
│   ├── action.yml
│   ├── main.mjs
│   └── README.md
├── dist/tools/               # Compiled bundles (Vite, committed)
│   ├── lib.mjs               # Central run() dispatcher
│   └── libs/                 # Code-split chunks (agents, runners)
└── src/                      # Development source
    ├── actions/              # Builder/service implementations
    ├── agents/               # CI/CD agent abstraction (GitHub Actions)
    ├── tools/                # Tool runners + lib.ts entry
    └── libs/                 # Shared utilities, formatters, services
```

## Versioning

Uses [GitVersion](https://gitversion.net/) with conventional commits for semantic versioning. Pin at any granularity:

```yaml
uses: elioetibr/actions/iac/terraform@v1       # Latest v1.x.x
uses: elioetibr/actions/iac/terraform@v1.2     # Latest v1.2.x
uses: elioetibr/actions/iac/terraform@v1.2.3   # Exact version
```

## Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm

### Commands

```bash
# Build (Vite → dist/tools/)
pnpm run build

# Testing
pnpm test
pnpm run test:coverage
pnpm run test:watch

# Code Quality
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run typecheck
```

### Design Principles

- **SOLID** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY** - Shared parsers and utilities in `src/libs/`
- **KISS** - Each action is a focused, single-purpose entry point
- **Builder + Factory** - Fluent API for command construction
- **Agent Abstraction** - `IAgent` interface decouples tool logic from CI/CD platform
- **Layered Architecture** - Clear separation between builders, services, and interfaces
