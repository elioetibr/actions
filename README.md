# GitHub Actions Library

A comprehensive TypeScript library of GitHub Actions for Docker manifest creation and Infrastructure as Code (IaC) operations with Terraform and Terragrunt.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Available Actions](#available-actions)
  - [Docker BuildX ImageTools](#docker-buildx-imagetools)
  - [Docker Tag Generator](#docker-tag-generator)
  - [Terraform](#terraform)
  - [Terragrunt](#terragrunt)
- [Architecture](#architecture)
- [Development](#development)

## Overview

This repository provides reusable GitHub Actions workflows for:

- **Docker BuildX ImageTools**: Create multi-architecture Docker manifests using buildx imagetools
- **Docker Tag Generator**: Generate semantic version-based Docker tags
- **Terraform**: Execute Terraform commands with a fluent builder API
- **Terragrunt**: Execute Terragrunt commands with run-all support

## Installation

```bash
yarn install
yarn build
```

## Available Actions

### Docker BuildX ImageTools

Creates multi-architecture Docker image manifests using Docker BuildX ImageTools.

#### Inputs

| Name                      | Description                                 | Required | Default |
|---------------------------|---------------------------------------------|----------|---------|
| `ecrRegistry`             | ECR registry name                           | Yes      | N/A     |
| `ecrRepository`           | ECR repository name                         | Yes      | N/A     |
| `amd64MetaTags`           | AMD64 image tags to include in the manifest | Yes      | N/A     |
| `arm64MetaTags`           | ARM64 image tags to include in the manifest | Yes      | N/A     |
| `manifestMetaTags`        | Image tags for the manifest                 | Yes      | N/A     |
| `manifestMetaAnnotations` | Image annotations for the manifest          | Yes      | N/A     |
| `semVer`                  | Semantic version for the final image        | Yes      | N/A     |
| `dryRun`                  | Dry Run Mode                                | No       | false   |

#### Outputs

| Name                              | Description                                 |
|-----------------------------------|---------------------------------------------|
| `manifestIndexFullCommand`        | Full command for Docker manifest creation   |
| `manifestIndexBuildXArgs`         | BuildX arguments for manifest creation      |
| `manifestIndexInspectFullCommand` | Full command for Docker manifest inspection |
| `manifestIndexInspectBuildXArgs`  | BuildX arguments for manifest inspection    |

#### Usage Example

```typescript
import { DockerBuildXImageToolsBuilderFactory } from './actions/docker/buildx/images';

// Create a manifest using the factory
const service = DockerBuildXImageToolsBuilderFactory.create()
  .withEcrRegistry('123456789.dkr.ecr.us-east-1.amazonaws.com')
  .withEcrRepository('my-app')
  .withSemVer('1.2.3')
  .withAmd64Tags(['my-app:1.2.3-amd64'])
  .withArm64Tags(['my-app:1.2.3-arm64'])
  .build();

// Execute the manifest creation
await service.execute();
```

### Docker Tag Generator

Generates Docker tags based on semantic versioning and platform information.

#### Inputs

| Name            | Description                                | Required | Default |
|-----------------|--------------------------------------------|----------|---------|
| `semVer`        | Semantic version to use for tag generation | Yes      | N/A     |
| `platform`      | Architecture prefix for Docker tags        | No       | ""      |
| `buildDateTime` | Suffix to append to certain tags           | No       | ""      |

#### Outputs

| Name                 | Description                        |
|----------------------|------------------------------------|
| `semVer`             | The semantic version               |
| `semVerSuffix`       | Semantic version suffix            |
| `platform`           | Platform identifier                |
| `buildDatetime`      | Build datetime stamp               |
| `architecture`       | Architecture type                  |
| `architecturePrefix` | Architecture prefix for tags       |
| `defaultBranch`      | Default branch name                |
| `refName`            | Git reference name                 |
| `runAttempt`         | GitHub Actions run attempt         |
| `sha`                | Full commit SHA                    |
| `shaShort`           | Short commit SHA                   |
| `tags`               | Generated tags (newline separated) |
| `tagsList`           | Generated tags as list             |
| `tagsStringfied`     | Generated tags as JSON string      |

#### GitHub Workflow Example

```yaml
steps:
  - name: Generate Docker Tags
    id: tags
    uses: viafoura/docker-tag-generator@v1
    with:
      semVer: "1.0.0"
      platform: "linux/amd64"
      buildDateTime: ""

  - name: Use Generated Tags
    run: |
      echo "Tags: ${{ steps.tags.outputs.tags }}"
```

### Terraform

Execute Terraform commands using a fluent builder pattern.

#### Supported Commands

- `init` - Initialize Terraform working directory
- `validate` - Validate Terraform configuration
- `fmt` - Format Terraform files
- `plan` - Create execution plan
- `apply` - Apply changes
- `destroy` - Destroy infrastructure
- `output` - Show output values
- `show` - Show state or plan

#### Using the Builder

```typescript
import { TerraformBuilder } from './actions/iac/terraform';

// Basic plan
const planService = TerraformBuilder.forPlan()
  .withWorkingDirectory('./infrastructure')
  .withVariables({ environment: 'production' })
  .withNoColor()
  .build();

// Get command string
console.log(planService.toString());
// Output: terraform plan -var="environment=production" -no-color

// Plan with output file
const planWithOutput = TerraformBuilder.forPlan()
  .withWorkingDirectory('./infrastructure')
  .withOutFile('plan.tfplan')
  .build();

// Apply with auto-approve
const applyService = TerraformBuilder.forApply()
  .withWorkingDirectory('./infrastructure')
  .withAutoApprove()
  .withVariables({ environment: 'production' })
  .build();

// Destroy specific targets
const destroyService = TerraformBuilder.forDestroy()
  .withWorkingDirectory('./infrastructure')
  .withTargets(['aws_instance.web', 'aws_security_group.allow_http'])
  .withAutoApprove()
  .build();
```

#### Using the Factory

```typescript
import { TerraformBuilderFactory } from './actions/iac/terraform';

// Quick init
const initService = TerraformBuilderFactory.init('./infrastructure');

// Init with backend configuration
const initWithBackend = TerraformBuilderFactory.init('./infrastructure', {
  bucket: 'my-terraform-state',
  key: 'prod/terraform.tfstate',
  region: 'us-east-1'
});

// Validate
const validateService = TerraformBuilderFactory.validate('./infrastructure');

// Plan
const planService = TerraformBuilderFactory.plan('./infrastructure', {
  environment: 'production'
});

// Plan with output
const planOutput = TerraformBuilderFactory.planWithOutput(
  './infrastructure',
  'plan.tfplan',
  { environment: 'production' }
);

// Apply with auto-approve
const applyService = TerraformBuilderFactory.applyWithAutoApprove(
  './infrastructure',
  { environment: 'production' }
);

// Apply from plan file
const applyPlan = TerraformBuilderFactory.applyPlan(
  './infrastructure',
  'plan.tfplan'
);

// Apply with targets
const applyTargeted = TerraformBuilderFactory.applyWithTargets(
  './infrastructure',
  ['aws_instance.web'],
  { environment: 'production' }
);

// Destroy with auto-approve
const destroyService = TerraformBuilderFactory.destroyWithAutoApprove(
  './infrastructure',
  { environment: 'production' }
);

// Destroy with targets
const destroyTargeted = TerraformBuilderFactory.destroyWithTargets(
  './infrastructure',
  ['aws_instance.web'],
  { environment: 'production' }
);
```

#### Available Builder Methods

| Method                      | Description                              |
|-----------------------------|------------------------------------------|
| `withCommand(command)`      | Set the Terraform command                |
| `withWorkingDirectory(dir)` | Set working directory                    |
| `withVariable(key, value)`  | Add a single variable                    |
| `withVariables(vars)`       | Add multiple variables                   |
| `withVarFile(path)`         | Add a variable file                      |
| `withVarFiles(paths)`       | Add multiple variable files              |
| `withBackendConfig(k, v)`   | Add backend configuration                |
| `withTarget(target)`        | Add a target resource                    |
| `withTargets(targets)`      | Add multiple target resources            |
| `withAutoApprove()`         | Enable auto-approve flag                 |
| `withDryRun()`              | Enable dry-run mode                      |
| `withPlanFile(path)`        | Set plan file for apply                  |
| `withOutFile(path)`         | Set output file for plan                 |
| `withNoColor()`             | Disable colored output                   |
| `withCompactWarnings()`     | Enable compact warnings                  |
| `withParallelism(n)`        | Set parallelism level                    |
| `withLockTimeout(timeout)`  | Set lock timeout                         |
| `withRefresh()`             | Enable state refresh                     |
| `withoutRefresh()`          | Disable state refresh                    |
| `withReconfigure()`         | Enable backend reconfiguration           |
| `withMigrateState()`        | Enable state migration                   |

#### GitHub Actions Workflow Examples

##### Using the Terraform Action

```yaml
name: Terraform Plan

on:
  pull_request:
    paths:
      - 'infrastructure/**'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  terraform-plan:
    name: Terraform Plan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0

      - name: Terraform Init
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: init
          working-directory: ./infrastructure

      - name: Terraform Validate
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: validate
          working-directory: ./infrastructure

      - name: Terraform Plan
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: plan
          working-directory: ./infrastructure
          variables: '{"environment": "staging"}'
          plan-file: tfplan
```

##### Terraform Apply with Auto-Approve

```yaml
name: Terraform Apply

on:
  push:
    branches:
      - main
    paths:
      - 'infrastructure/**'

permissions:
  id-token: write
  contents: read

jobs:
  terraform-apply:
    name: Terraform Apply
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: init
          working-directory: ./infrastructure

      - name: Terraform Apply
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: apply
          working-directory: ./infrastructure
          variables: '{"environment": "production"}'
          auto-approve: 'true'
```

##### Terraform Destroy with Targets

```yaml
name: Terraform Destroy Targeted

on:
  workflow_dispatch:
    inputs:
      targets:
        description: 'Comma-separated list of resources to destroy'
        required: true
        type: string
      environment:
        description: 'Environment'
        required: true
        type: choice
        options:
          - staging
          - production

permissions:
  id-token: write
  contents: read

jobs:
  terraform-destroy:
    name: Terraform Destroy
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: init
          working-directory: ./infrastructure

      - name: Terraform Destroy
        uses: elioetibr/actions/dist/actions/iac/terraform@v1
        with:
          command: destroy
          working-directory: ./infrastructure
          variables: '{"environment": "${{ github.event.inputs.environment }}"}'
          targets: ${{ github.event.inputs.targets }}
          auto-approve: 'true'
```

##### Dry Run Mode (Preview Command)

```yaml
- name: Preview Terraform Command
  id: preview
  uses: elioetibr/actions/dist/actions/iac/terraform@v1
  with:
    command: plan
    working-directory: ./infrastructure
    variables: '{"environment": "production", "region": "us-east-1"}'
    targets: 'aws_instance.web,aws_security_group.allow_http'
    dry-run: 'true'

- name: Show Command
  run: |
    echo "Command: ${{ steps.preview.outputs.command-string }}"
    echo "Args: ${{ steps.preview.outputs.command-args }}"
```

### Terragrunt

Execute Terragrunt commands with support for run-all operations across multiple modules.

#### Supported Commands

- `init` - Initialize Terragrunt/Terraform
- `validate` - Validate configuration
- `fmt` - Format Terraform files
- `hclfmt` - Format HCL files
- `plan` - Create execution plan
- `apply` - Apply changes
- `destroy` - Destroy infrastructure
- `output` - Show output values
- `graph-dependencies` - Show dependency graph
- `validate-inputs` - Validate inputs

#### Using the Builder

```typescript
import { TerragruntBuilder } from './actions/iac/terragrunt';

// Basic plan
const planService = TerragruntBuilder.forPlan()
  .withWorkingDirectory('./infrastructure')
  .withNonInteractive()
  .build();

// Run-all plan across all modules
const runAllPlan = TerragruntBuilder.forRunAllPlan()
  .withWorkingDirectory('./infrastructure')
  .withNonInteractive()
  .withTerragruntParallelism(4)
  .build();

// Run-all apply with exclusions
const runAllApply = TerragruntBuilder.forRunAllApply()
  .withWorkingDirectory('./infrastructure')
  .withAutoApprove()
  .withNonInteractive()
  .withExcludeDirs(['./infrastructure/legacy', './infrastructure/deprecated'])
  .build();

// Destroy with targets
const destroyService = TerragruntBuilder.forDestroy()
  .withWorkingDirectory('./infrastructure/app')
  .withTargets(['aws_instance.web'])
  .withAutoApprove()
  .withNonInteractive()
  .build();

// With IAM role assumption
const withRole = TerragruntBuilder.forPlan()
  .withWorkingDirectory('./infrastructure')
  .withIamRole('arn:aws:iam::123456789:role/TerraformRole')
  .withNonInteractive()
  .build();
```

#### Using the Factory

```typescript
import { TerragruntBuilderFactory } from './actions/iac/terragrunt';

// Quick init
const initService = TerragruntBuilderFactory.init('./infrastructure');

// Run-all init
const runAllInit = TerragruntBuilderFactory.runAllInit('./infrastructure');

// Validate
const validateService = TerragruntBuilderFactory.validate('./infrastructure');

// Run-all validate
const runAllValidate = TerragruntBuilderFactory.runAllValidate('./infrastructure');

// HCL format
const hclFmt = TerragruntBuilderFactory.hclFmt('./infrastructure');

// Plan
const planService = TerragruntBuilderFactory.plan('./infrastructure', {
  environment: 'production'
});

// Run-all plan
const runAllPlan = TerragruntBuilderFactory.runAllPlan('./infrastructure', {
  environment: 'production'
});

// Apply
const applyService = TerragruntBuilderFactory.apply('./infrastructure', {
  environment: 'production'
});

// Run-all apply
const runAllApply = TerragruntBuilderFactory.runAllApply('./infrastructure', {
  environment: 'production'
});

// Apply with targets
const applyTargeted = TerragruntBuilderFactory.applyWithTargets(
  './infrastructure',
  ['aws_instance.web'],
  { environment: 'production' }
);

// Destroy
const destroyService = TerragruntBuilderFactory.destroy('./infrastructure', {
  environment: 'production'
});

// Run-all destroy
const runAllDestroy = TerragruntBuilderFactory.runAllDestroy('./infrastructure', {
  environment: 'production'
});

// Destroy with targets
const destroyTargeted = TerragruntBuilderFactory.destroyWithTargets(
  './infrastructure',
  ['aws_instance.web'],
  { environment: 'production' }
);

// Graph dependencies
const graph = TerragruntBuilderFactory.graphDependencies('./infrastructure');

// Validate inputs
const validateInputs = TerragruntBuilderFactory.validateInputs('./infrastructure');
```

#### Terragrunt-Specific Builder Methods

| Method                              | Description                              |
|-------------------------------------|------------------------------------------|
| `withRunAll()`                      | Enable run-all mode                      |
| `withNonInteractive()`              | Enable non-interactive mode              |
| `withNoAutoInit()`                  | Disable auto-init                        |
| `withNoAutoRetry()`                 | Disable auto-retry                       |
| `withTerragruntConfig(path)`        | Set terragrunt.hcl path                  |
| `withTerragruntWorkingDir(dir)`     | Set terragrunt working directory         |
| `withTerragruntParallelism(n)`      | Set run-all parallelism                  |
| `withIncludeDir(dir)`               | Add include directory for run-all        |
| `withIncludeDirs(dirs)`             | Add multiple include directories         |
| `withExcludeDir(dir)`               | Add exclude directory for run-all        |
| `withExcludeDirs(dirs)`             | Add multiple exclude directories         |
| `withIgnoreDependencyErrors()`      | Ignore dependency errors                 |
| `withIgnoreExternalDependencies()`  | Ignore external dependencies             |
| `withIncludeExternalDependencies()` | Include external dependencies            |
| `withTerragruntSource(source)`      | Set source override                      |
| `withSourceMap(orig, new)`          | Add source map entry                     |
| `withSourceMaps(map)`               | Add multiple source map entries          |
| `withDownloadDir(dir)`              | Set download directory                   |
| `withIamRole(role)`                 | Set IAM role to assume                   |
| `withIamRoleAndSession(role, name)` | Set IAM role with session name           |
| `withStrictInclude()`               | Enable strict include mode               |

#### GitHub Actions Workflow Examples

##### Using the Terragrunt Action - Run-All Plan

```yaml
name: Terragrunt Plan

on:
  pull_request:
    paths:
      - 'infrastructure/**'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  terragrunt-plan:
    name: Terragrunt Plan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0
          terraform_wrapper: false

      - name: Setup Terragrunt
        uses: autero1/action-terragrunt@v3
        with:
          terragrunt-version: 0.54.0

      - name: Terragrunt Run-All Init
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: init
          working-directory: ./infrastructure
          run-all: 'true'

      - name: Terragrunt Run-All Validate
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: validate
          working-directory: ./infrastructure
          run-all: 'true'

      - name: Terragrunt Run-All Plan
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: plan
          working-directory: ./infrastructure
          run-all: 'true'
          terragrunt-parallelism: '4'
```

##### Terragrunt Run-All Apply on Merge

```yaml
name: Terragrunt Apply

on:
  push:
    branches:
      - main
    paths:
      - 'infrastructure/**'

permissions:
  id-token: write
  contents: read

jobs:
  terragrunt-apply:
    name: Terragrunt Apply
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_wrapper: false

      - name: Setup Terragrunt
        uses: autero1/action-terragrunt@v3

      - name: Terragrunt Run-All Init
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: init
          working-directory: ./infrastructure
          run-all: 'true'

      - name: Terragrunt Run-All Apply
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: apply
          working-directory: ./infrastructure
          run-all: 'true'
          auto-approve: 'true'
          terragrunt-parallelism: '4'
```

##### Terragrunt Single Module with Targets

```yaml
name: Terragrunt Module Deploy

on:
  workflow_dispatch:
    inputs:
      module_path:
        description: 'Path to the Terragrunt module'
        required: true
        type: string
        default: 'infrastructure/app'
      action:
        description: 'Action to perform'
        required: true
        type: choice
        options:
          - plan
          - apply
          - destroy
      targets:
        description: 'Comma-separated list of resources to target (optional)'
        required: false
        type: string

permissions:
  id-token: write
  contents: read

jobs:
  terragrunt-module:
    name: Terragrunt ${{ github.event.inputs.action }}
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.action == 'destroy' && 'production' || 'staging' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_wrapper: false

      - name: Setup Terragrunt
        uses: autero1/action-terragrunt@v3

      - name: Terragrunt Init
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: init
          working-directory: ${{ github.event.inputs.module_path }}

      - name: Terragrunt Plan
        if: github.event.inputs.action == 'plan'
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: plan
          working-directory: ${{ github.event.inputs.module_path }}
          targets: ${{ github.event.inputs.targets }}

      - name: Terragrunt Apply
        if: github.event.inputs.action == 'apply'
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: apply
          working-directory: ${{ github.event.inputs.module_path }}
          targets: ${{ github.event.inputs.targets }}
          auto-approve: 'true'

      - name: Terragrunt Destroy
        if: github.event.inputs.action == 'destroy'
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: destroy
          working-directory: ${{ github.event.inputs.module_path }}
          targets: ${{ github.event.inputs.targets }}
          auto-approve: 'true'
```

##### Terragrunt Run-All with Exclusions

```yaml
name: Terragrunt Selective Deploy

on:
  workflow_dispatch:
    inputs:
      exclude_dirs:
        description: 'Comma-separated directories to exclude'
        required: false
        type: string
        default: 'infrastructure/legacy,infrastructure/deprecated'
      parallelism:
        description: 'Parallelism level'
        required: false
        type: number
        default: 4

permissions:
  id-token: write
  contents: read

jobs:
  terragrunt-selective:
    name: Terragrunt Selective Apply
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_wrapper: false

      - name: Setup Terragrunt
        uses: autero1/action-terragrunt@v3

      - name: Terragrunt Run-All Apply with Exclusions
        uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
        with:
          command: apply
          working-directory: ./infrastructure
          run-all: 'true'
          auto-approve: 'true'
          exclude-dirs: ${{ github.event.inputs.exclude_dirs }}
          terragrunt-parallelism: ${{ github.event.inputs.parallelism }}
```

##### Terragrunt with IAM Role Assumption

```yaml
- name: Terragrunt Plan with IAM Role
  uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
  with:
    command: plan
    working-directory: ./infrastructure
    run-all: 'true'
    iam-role: 'arn:aws:iam::123456789:role/TerraformRole'
    iam-role-session-name: 'github-actions-terragrunt'
```

##### Dry Run Mode (Preview Command)

```yaml
- name: Preview Terragrunt Command
  id: preview
  uses: elioetibr/actions/dist/actions/iac/terragrunt@v1
  with:
    command: apply
    working-directory: ./infrastructure
    run-all: 'true'
    auto-approve: 'true'
    exclude-dirs: 'legacy,deprecated'
    terragrunt-parallelism: '4'
    dry-run: 'true'

- name: Show Command
  run: |
    echo "Command: ${{ steps.preview.outputs.command-string }}"
    echo "Exit Code: ${{ steps.preview.outputs.exit-code }}"
```

## Architecture

This library follows these architectural principles:

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Builder Pattern**: Fluent API with method chaining for command construction
- **Factory Pattern**: Convenience methods for common operations
- **Interface Segregation**: Provider interfaces for read-only access, Service interfaces for mutations
- **Layered Architecture**: Clear separation between builders, services, and interfaces

### Directory Structure

```
src/
├── actions/
│   ├── docker/
│   │   ├── buildx/
│   │   │   └── images/          # Docker BuildX ImageTools
│   │   └── tags/                # Docker Tag Generator
│   └── iac/
│       ├── terraform/           # Terraform action
│       │   ├── interfaces/      # ITerraformBuilder, ITerraformService, ITerraformProvider
│       │   ├── services/        # TerraformService, TerraformArgumentBuilder
│       │   ├── TerraformBuilder.ts
│       │   └── TerraformBuilderFactory.ts
│       └── terragrunt/          # Terragrunt action
│           ├── interfaces/      # ITerragruntBuilder, ITerragruntService, ITerragruntProvider
│           ├── services/        # TerragruntService, TerragruntArgumentBuilder
│           ├── TerragruntBuilder.ts
│           └── TerragruntBuilderFactory.ts
└── libs/
    ├── services/                # Shared services
    ├── formatters/              # Command formatters
    └── utils/                   # Utilities, parsers, handlers
```

## Development

### Commands

```bash
# Build
yarn build              # Clean build and compile to ./dist
yarn development        # Watch mode development build

# Testing
yarn test               # Run Jest tests
yarn test:coverage      # Run tests with coverage
yarn test:watch         # Run tests in watch mode
yarn report-coverage    # Generate coverage summary

# Code Quality
yarn lint               # Run ESLint
yarn lint-fix           # Run ESLint with auto-fix
yarn lint:tsc           # TypeScript compiler checks
yarn format             # Format code with Prettier
yarn format-check       # Check code formatting
```

### GitHub Workflow Example

```yaml
name: CI/CD

on:
  workflow_dispatch:
    inputs:
      semVer:
        description: 'Semantic Version'
        required: true
      platform:
        description: 'Platform'
        required: false

permissions:
  id-token: write
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Docker Tags
        id: tags
        uses: viafoura/docker-tag-generator@v1
        with:
          semVer: ${{ github.event.inputs.semVer }}
          platform: ${{ github.event.inputs.platform }}

      - name: Check Generated Tags
        run: |
          echo 'semVer: ${{ steps.tags.outputs.semVer }}'
          echo 'tags: ${{ steps.tags.outputs.tags }}'
          echo 'shaShort: ${{ steps.tags.outputs.shaShort }}'

      - name: Docker Meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: my-app
          tags: |
            ${{ steps.tags.outputs.tags }}
          flavor: |
            latest=${{ github.ref_name == github.event.repository.default_branch }}
```
