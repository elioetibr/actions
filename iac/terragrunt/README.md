# Terragrunt Action

Execute Terragrunt commands with run-all support and fluent builder API.

## Supported Commands

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

## Inputs

### Core Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `command` | Terragrunt command (init, validate, fmt, hclfmt, plan, apply, destroy, output, graph-dependencies, validate-inputs) | Yes | |
| `working-directory` | Working directory for Terragrunt operations | No | `.` |
| `run-all` | Enable run-all mode to execute across all modules | No | `false` |
| `variables` | Terraform variables as JSON object (e.g., `{"environment": "production"}`) | No | `{}` |
| `var-files` | Comma-separated list of variable files (.tfvars) | No | |
| `backend-config` | Backend configuration as JSON object | No | `{}` |
| `targets` | Comma-separated list of resource addresses to target | No | |
| `auto-approve` | Enable auto-approve for apply/destroy commands | No | `false` |
| `plan-file` | Path to plan file (for apply) or output file (for plan -out) | No | |
| `no-color` | Disable colored output | No | `true` |
| `compact-warnings` | Enable compact warnings | No | `false` |
| `parallelism` | Number of parallel Terraform operations | No | |
| `lock-timeout` | Lock timeout duration | No | |
| `refresh` | Enable/disable state refresh | No | `true` |
| `reconfigure` | Enable backend reconfiguration for init | No | `false` |
| `migrate-state` | Enable state migration for init | No | `false` |
| `dry-run` | Dry run mode - only output command without executing | No | `false` |

### Terragrunt-Specific Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `terragrunt-config` | Path to terragrunt.hcl configuration file | No | |
| `terragrunt-working-dir` | Terragrunt working directory | No | |
| `non-interactive` | Enable non-interactive mode | No | `true` |
| `no-auto-init` | Disable auto-init | No | `false` |
| `no-auto-retry` | Disable auto-retry | No | `false` |
| `terragrunt-parallelism` | Number of parallel modules for run-all | No | |
| `include-dirs` | Comma-separated list of directories to include in run-all | No | |
| `exclude-dirs` | Comma-separated list of directories to exclude from run-all | No | |
| `ignore-dependency-errors` | Ignore dependency errors during run-all | No | `false` |
| `ignore-external-dependencies` | Ignore external dependencies | No | `false` |
| `include-external-dependencies` | Include external dependencies | No | `false` |
| `terragrunt-source` | Override source for Terraform modules | No | |
| `source-map` | Source map as JSON object (e.g., `{"git::https://orig": "git::https://new"}`) | No | `{}` |
| `download-dir` | Directory for downloaded modules | No | |
| `iam-role` | IAM role ARN to assume | No | |
| `iam-role-session-name` | Session name for assumed IAM role | No | |
| `strict-include` | Enable strict include mode | No | `false` |

## Outputs

| Name | Description |
|------|-------------|
| `command` | The Terragrunt command that was executed |
| `command-args` | The command arguments as a JSON array |
| `command-string` | The full command as a string |
| `exit-code` | Exit code of the Terragrunt command |
| `stdout` | Standard output from the command |
| `stderr` | Standard error from the command |

## Usage Examples

### Run-All Plan on PR

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
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: init
          working-directory: ./infrastructure
          run-all: 'true'

      - name: Terragrunt Run-All Validate
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: validate
          working-directory: ./infrastructure
          run-all: 'true'

      - name: Terragrunt Run-All Plan
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: plan
          working-directory: ./infrastructure
          run-all: 'true'
          terragrunt-parallelism: '4'
```

### Run-All Apply on Merge

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
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: init
          working-directory: ./infrastructure
          run-all: 'true'

      - name: Terragrunt Run-All Apply
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: apply
          working-directory: ./infrastructure
          run-all: 'true'
          auto-approve: 'true'
          terragrunt-parallelism: '4'
```

### Single Module with Targets

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
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: init
          working-directory: ${{ github.event.inputs.module_path }}

      - name: Terragrunt Plan
        if: github.event.inputs.action == 'plan'
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: plan
          working-directory: ${{ github.event.inputs.module_path }}
          targets: ${{ github.event.inputs.targets }}

      - name: Terragrunt Apply
        if: github.event.inputs.action == 'apply'
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: apply
          working-directory: ${{ github.event.inputs.module_path }}
          targets: ${{ github.event.inputs.targets }}
          auto-approve: 'true'

      - name: Terragrunt Destroy
        if: github.event.inputs.action == 'destroy'
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: destroy
          working-directory: ${{ github.event.inputs.module_path }}
          targets: ${{ github.event.inputs.targets }}
          auto-approve: 'true'
```

### Run-All with Exclusions

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
        uses: elioetibr/actions/iac/terragrunt@v1
        with:
          command: apply
          working-directory: ./infrastructure
          run-all: 'true'
          auto-approve: 'true'
          exclude-dirs: ${{ github.event.inputs.exclude_dirs }}
          terragrunt-parallelism: ${{ github.event.inputs.parallelism }}
```

### IAM Role Assumption

```yaml
- name: Terragrunt Plan with IAM Role
  uses: elioetibr/actions/iac/terragrunt@v1
  with:
    command: plan
    working-directory: ./infrastructure
    run-all: 'true'
    iam-role: 'arn:aws:iam::123456789:role/TerraformRole'
    iam-role-session-name: 'github-actions-terragrunt'
```

### Dry Run Mode

```yaml
- name: Preview Terragrunt Command
  id: preview
  uses: elioetibr/actions/iac/terragrunt@v1
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

## Builder API

For TypeScript library consumers, the action exposes a fluent builder API.

### TerragruntBuilder

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

### TerragruntBuilderFactory

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

## Terragrunt-Specific Builder Methods

| Method | Description |
|--------|-------------|
| `withRunAll()` | Enable run-all mode |
| `withNonInteractive()` | Enable non-interactive mode |
| `withNoAutoInit()` | Disable auto-init |
| `withNoAutoRetry()` | Disable auto-retry |
| `withTerragruntConfig(path)` | Set terragrunt.hcl path |
| `withTerragruntWorkingDir(dir)` | Set terragrunt working directory |
| `withTerragruntParallelism(n)` | Set run-all parallelism |
| `withIncludeDir(dir)` | Add include directory for run-all |
| `withIncludeDirs(dirs)` | Add multiple include directories |
| `withExcludeDir(dir)` | Add exclude directory for run-all |
| `withExcludeDirs(dirs)` | Add multiple exclude directories |
| `withIgnoreDependencyErrors()` | Ignore dependency errors |
| `withIgnoreExternalDependencies()` | Ignore external dependencies |
| `withIncludeExternalDependencies()` | Include external dependencies |
| `withTerragruntSource(source)` | Set source override |
| `withSourceMap(orig, new)` | Add source map entry |
| `withSourceMaps(map)` | Add multiple source map entries |
| `withDownloadDir(dir)` | Set download directory |
| `withIamRole(role)` | Set IAM role to assume |
| `withIamRoleAndSession(role, name)` | Set IAM role with session name |
| `withStrictInclude()` | Enable strict include mode |
