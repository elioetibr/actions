# Terraform Action

Execute Terraform commands with a fluent builder API.

## Supported Commands

- `init` - Initialize Terraform working directory
- `validate` - Validate Terraform configuration
- `fmt` - Format Terraform files
- `plan` - Create execution plan
- `apply` - Apply changes
- `destroy` - Destroy infrastructure
- `output` - Show output values
- `show` - Show state or plan

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `command` | Terraform command to execute (init, validate, fmt, plan, apply, destroy, output, show) | Yes | - |
| `working-directory` | Working directory for Terraform operations | No | `.` |
| `variables` | Terraform variables as JSON object (e.g., `{"environment": "production"}`) | No | `{}` |
| `var-files` | Comma-separated list of variable files (.tfvars) | No | `''` |
| `backend-config` | Backend configuration as JSON object | No | `{}` |
| `targets` | Comma-separated list of resource addresses to target | No | `''` |
| `auto-approve` | Enable auto-approve for apply/destroy commands | No | `false` |
| `plan-file` | Path to plan file (for apply) or output file (for plan -out) | No | `''` |
| `no-color` | Disable colored output | No | `true` |
| `compact-warnings` | Enable compact warnings | No | `false` |
| `parallelism` | Number of parallel operations | No | `''` |
| `lock-timeout` | Lock timeout duration | No | `''` |
| `refresh` | Enable/disable state refresh (true/false) | No | `true` |
| `reconfigure` | Enable backend reconfiguration for init | No | `false` |
| `migrate-state` | Enable state migration for init | No | `false` |
| `dry-run` | Dry run mode - only output command without executing | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `command` | The Terraform command that was executed |
| `command-args` | The command arguments as a JSON array |
| `command-string` | The full command as a string |
| `exit-code` | Exit code of the Terraform command |
| `stdout` | Standard output from the command |
| `stderr` | Standard error from the command |

## Usage Examples

### Terraform Plan on PR

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
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: init
          working-directory: ./infrastructure

      - name: Terraform Validate
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: validate
          working-directory: ./infrastructure

      - name: Terraform Plan
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: plan
          working-directory: ./infrastructure
          variables: '{"environment": "staging"}'
          plan-file: tfplan
```

### Terraform Apply with Auto-Approve

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
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: init
          working-directory: ./infrastructure

      - name: Terraform Apply
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: apply
          working-directory: ./infrastructure
          variables: '{"environment": "production"}'
          auto-approve: 'true'
```

### Terraform Destroy with Targets

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
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: init
          working-directory: ./infrastructure

      - name: Terraform Destroy
        uses: elioetibr/actions/iac/terraform@v1
        with:
          command: destroy
          working-directory: ./infrastructure
          variables: '{"environment": "${{ github.event.inputs.environment }}"}'
          targets: ${{ github.event.inputs.targets }}
          auto-approve: 'true'
```

### Dry Run Mode

Preview the Terraform command without executing it.

```yaml
- name: Preview Terraform Command
  id: preview
  uses: elioetibr/actions/iac/terraform@v1
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

## Builder API

The Terraform action also exposes a TypeScript builder API for library consumers.

### TerraformBuilder

Fluent API for constructing Terraform commands.

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

### TerraformBuilderFactory

Convenience factory methods for common operations.

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

## Builder Methods

| Method | Description |
|--------|-------------|
| `withCommand(command)` | Set the Terraform command |
| `withWorkingDirectory(dir)` | Set working directory |
| `withVariable(key, value)` | Add a single variable |
| `withVariables(vars)` | Add multiple variables |
| `withVarFile(path)` | Add a variable file |
| `withVarFiles(paths)` | Add multiple variable files |
| `withBackendConfig(k, v)` | Add backend configuration |
| `withTarget(target)` | Add a target resource |
| `withTargets(targets)` | Add multiple target resources |
| `withAutoApprove()` | Enable auto-approve flag |
| `withDryRun()` | Enable dry-run mode |
| `withPlanFile(path)` | Set plan file for apply |
| `withOutFile(path)` | Set output file for plan |
| `withNoColor()` | Disable colored output |
| `withCompactWarnings()` | Enable compact warnings |
| `withParallelism(n)` | Set parallelism level |
| `withLockTimeout(timeout)` | Set lock timeout |
| `withRefresh()` | Enable state refresh |
| `withoutRefresh()` | Disable state refresh |
| `withReconfigure()` | Enable backend reconfiguration |
| `withMigrateState()` | Enable state migration |
