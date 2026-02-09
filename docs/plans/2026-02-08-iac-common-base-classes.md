# Design: Extract Shared IaC Base Classes

**Date:** 2026-02-08 **Status:** Proposed **Scope:** `src/actions/iac/common/`,
`src/actions/iac/terraform/`, `src/actions/iac/terragrunt/`

## Problem

The Terraform and Terragrunt action implementations share ~1,400 lines of
duplicated code across 8 file pairs. The Terragrunt implementation is
essentially "Terraform + Terragrunt-specific features", with duplication ranging
from 70% (runners) to 96% (string formatters).

| File Pair          | Terraform LOC | Terragrunt LOC | Duplication % |
| ------------------ | ------------- | -------------- | ------------- |
| StringFormatters   | 85            | 85             | 96%           |
| Builder Interfaces | 161           | 282            | 92%           |
| Services           | 374           | 644            | 88%           |
| ArgumentBuilders   | 189           | 338            | 85%           |
| Settings           | 50            | 86             | 84%           |
| Builders           | 352           | 592            | 79%           |
| Factories          | 313           | 357            | 75%           |
| Runners            | 144           | 204            | 70%           |

This violates DRY and creates maintenance burden: every Terraform argument
change must be mirrored in Terragrunt.

## Solution

Extract shared Terraform logic into abstract base classes in
`src/actions/iac/common/`. Both Terraform and Terragrunt extend these bases and
only add their specific features.

### Approach: Abstract Base Classes with Template Methods

Chosen over composition (more boilerplate) and generic bases (overly complex
types). The inheritance approach is a natural fit because Terragrunt genuinely
"is-a" Terraform wrapper — it shares all Terraform state and adds
Terragrunt-specific state on top.

## Directory Structure

```
src/actions/iac/
├── common/                              # NEW — shared base classes
│   ├── interfaces/
│   │   ├── IIacProvider.ts              # Read-only state (17 properties)
│   │   ├── IIacService.ts              # Mutators + command generation
│   │   ├── IIacBuilder.ts              # Fluent builder methods
│   │   └── index.ts
│   ├── services/
│   │   ├── BaseIacService.ts           # Shared state + getters/setters
│   │   ├── BaseIacArgumentBuilder.ts   # Shared argument construction
│   │   ├── BaseIacStringFormatter.ts   # Command string formatting
│   │   └── index.ts
│   ├── BaseIacBuilder.ts               # Shared builder methods
│   └── index.ts
├── terraform/                           # SLIMMED — extends common/
│   ├── interfaces/                      # Thin extensions of IIac* interfaces
│   ├── services/                        # Extends Base* classes (minimal overrides)
│   ├── TerraformBuilder.ts             # Extends BaseIacBuilder (factories + build)
│   └── TerraformBuilderFactory.ts      # Unchanged (delegates to TerraformBuilder)
└── terragrunt/                          # SLIMMED — extends common/
    ├── interfaces/                      # Extends IIac* + 19 extra properties
    ├── services/                        # Extends Base* + terragrunt logic
    ├── TerragruntBuilder.ts            # Extends BaseIacBuilder + tg methods
    └── TerragruntBuilderFactory.ts     # Unchanged
```

## Interface Hierarchy

### IIacProvider (shared read-only state)

```typescript
// src/actions/iac/common/interfaces/IIacProvider.ts
export interface IIacProvider {
  readonly command: string;
  readonly executor: string;
  readonly workingDirectory: string;
  readonly environment: ReadonlyMap<string, string>;
  readonly variables: ReadonlyMap<string, string>;
  readonly varFiles: readonly string[];
  readonly backendConfig: ReadonlyMap<string, string>;
  readonly targets: readonly string[];
  readonly autoApprove: boolean;
  readonly dryRun: boolean;
  readonly planFile: string | undefined;
  readonly outFile: string | undefined;
  readonly noColor: boolean;
  readonly compactWarnings: boolean;
  readonly parallelism: number | undefined;
  readonly lockTimeout: string | undefined;
  readonly refresh: boolean;
  readonly reconfigure: boolean;
  readonly migrateState: boolean;
}
```

### Terraform narrows the command type

```typescript
export interface ITerraformProvider extends IIacProvider {
  readonly command: TerraformCommand; // narrows string → union type
}
```

### Terragrunt extends with 19 extra properties

```typescript
export interface ITerragruntProvider extends IIacProvider {
  readonly command: TerragruntCommand; // wider union
  readonly runAll: boolean;
  readonly terragruntConfig: string | undefined;
  readonly terragruntWorkingDir: string | undefined;
  readonly nonInteractive: boolean;
  readonly noAutoInit: boolean;
  readonly noAutoRetry: boolean;
  readonly terragruntParallelism: number | undefined;
  readonly includeDirs: readonly string[];
  readonly excludeDirs: readonly string[];
  readonly ignoreDependencyErrors: boolean;
  readonly ignoreExternalDependencies: boolean;
  readonly includeExternalDependencies: boolean;
  readonly terragruntSource: string | undefined;
  readonly sourceMap: ReadonlyMap<string, string>;
  readonly downloadDir: string | undefined;
  readonly iamRole: string | undefined;
  readonly iamRoleSessionName: string | undefined;
  readonly strictInclude: boolean;
}
```

## Base Class Design

### BaseIacBuilder<TCommand, TService>

```typescript
export abstract class BaseIacBuilder<TCommand extends string, TService>
    implements IIacBuilder<TService> {

  // ── Shared state (all protected for subclass access) ──
  protected _command: TCommand | undefined;
  protected _workingDirectory = '.';
  protected readonly _environment = new Map<string, string>();
  protected readonly _variables = new Map<string, string>();
  protected readonly _varFiles: string[] = [];
  protected readonly _backendConfig = new Map<string, string>();
  protected readonly _targets: string[] = [];
  protected _autoApprove = false;
  protected _dryRun = false;
  protected _noColor = false;
  protected _compactWarnings = false;
  protected _planFile: string | undefined;
  protected _outFile: string | undefined;
  protected _parallelism: number | undefined;
  protected _lockTimeout: string | undefined;
  protected _refresh = true;
  protected _reconfigure = false;
  protected _migrateState = false;

  // ── 24 shared fluent methods (return this) ──
  withWorkingDirectory(directory: string): this { ... }
  withVariable(key: string, value: string): this { ... }
  withVariables(variables: Record<string, string>): this { ... }
  withVarFile(filePath: string): this { ... }
  withVarFiles(filePaths: string[]): this { ... }
  withBackendConfig(key: string, value: string): this { ... }
  withBackendConfigs(configs: Record<string, string>): this { ... }
  withTarget(target: string): this { ... }
  withTargets(targets: string[]): this { ... }
  withAutoApprove(): this { ... }
  withDryRun(): this { ... }
  withPlanFile(filePath: string): this { ... }
  withOutFile(filePath: string): this { ... }
  withNoColor(): this { ... }
  withCompactWarnings(): this { ... }
  withParallelism(level: number): this { ... }
  withLockTimeout(timeout: string): this { ... }
  withRefresh(): this { ... }
  withoutRefresh(): this { ... }
  withReconfigure(): this { ... }
  withMigrateState(): this { ... }
  withEnvironmentVariable(key: string, value: string): this { ... }
  withEnvironmentVariables(env: Record<string, string>): this { ... }

  // ── Reset: clears shared state, then calls subclass hook ──
  reset(): this {
    // clear all shared state...
    this.resetSpecific();
    return this;
  }

  // ── Template methods for subclass customization ──
  abstract build(): TService;
  protected abstract resetSpecific(): void;
  protected abstract get validCommands(): readonly string[];
}
```

### BaseIacService<TCommand>

```typescript
export abstract class BaseIacService<
  TCommand extends string,
> implements IIacService {
  // ── Shared private state (same 17 fields) ──
  // ── Constructor initializes state from command + workingDirectory ──
  // ── 19 readonly getters ──
  // ── 24 mutator methods (setCommand, addVariable, etc.) ──

  // ── Command generation ──
  toCommandArgs(): string[] {
    return this.createArgumentBuilder().toCommandArgs();
  }
  buildCommand(): string[] {
    return this.createArgumentBuilder().buildCommand();
  }
  toString(): string {
    return this.createStringFormatter().toString();
  }
  toStringMultiLineCommand(): string {
    return this.createStringFormatter().toStringMultiLineCommand();
  }

  // ── Reset + Clone: shared logic + subclass hooks ──
  reset(): this {
    // reset shared state...
    return this.resetSpecific();
  }
  clone(): this {
    // clone shared state to new instance...
    this.cloneSpecific(target);
    return target;
  }

  // ── Template methods ──
  protected abstract createArgumentBuilder(): IIacArgumentBuilder;
  protected abstract createStringFormatter(): IIacStringFormatter;
  protected abstract resetSpecific(): this;
  protected abstract cloneSpecific(target: this): void;
  protected abstract createEmptyClone(): this;
}
```

### BaseIacArgumentBuilder

```typescript
export abstract class BaseIacArgumentBuilder {
  constructor(protected readonly provider: IIacProvider) {}

  // ── 9 shared private methods ──
  protected addInitArguments(args: string[]): void { ... }
  protected addVariableArguments(args: string[]): void { ... }
  protected addTargetArguments(args: string[]): void { ... }
  protected addPlanArguments(args: string[]): void { ... }
  protected addApplyArguments(args: string[]): void { ... }
  protected addCommonArguments(args: string[]): void { ... }
  protected supportsVariables(command: string): boolean { ... }
  protected supportsTargets(command: string): boolean { ... }
  protected supportsAutoApprove(command: string): boolean { ... }

  // ── Shared argument assembly ──
  protected addTerraformArguments(args: string[]): void {
    this.addInitArguments(args);
    this.addVariableArguments(args);
    this.addTargetArguments(args);
    this.addPlanArguments(args);
    this.addApplyArguments(args);
    this.addCommonArguments(args);
  }

  // ── Override points ──
  abstract toCommandArgs(): string[];
  abstract buildCommand(): string[];
}
```

### BaseIacStringFormatter

```typescript
export class BaseIacStringFormatter {
  constructor(protected readonly provider: IIacProvider) {}

  toString(): string { ... }
  toStringMultiLineCommand(): string { ... }
  protected toStringList(): string[] { ... }
  protected escapeArg(arg: string): string { ... }
}
```

This class is concrete (not abstract) — both tools can use it directly or extend
trivially.

## Migration Strategy

Each step leaves tests green and is independently committable.

### Step 1: Create Interfaces

Create `IIacProvider`, `IIacService`, `IIacBuilder` in `common/interfaces/`.
Make `ITerraformProvider extends IIacProvider` and
`ITerragruntProvider extends IIacProvider`. Compile-only change — all tests
pass.

### Step 2: Extract BaseIacStringFormatter

Extract the nearly identical formatter logic. Both `TerraformStringFormatter`
and `TerragruntStringFormatter` extend it with empty bodies. Run formatter tests
— pass immediately.

### Step 3: Extract BaseIacArgumentBuilder

Extract the 9 shared argument-building methods.
`TerraformArgumentBuilder extends BaseIacArgumentBuilder` (remove duplicated
methods). `TerragruntArgumentBuilder extends BaseIacArgumentBuilder`, keeps
`addTerragruntGlobalArgs()`, overrides `toCommandArgs()` to prepend Terragrunt
args then call `addTerraformArguments()`. Run tests.

### Step 4: Extract BaseIacService

The largest change. Extract 19 getters, 24 setters, command generation
delegation. Both services extend it. Template methods handle reset/clone/factory
creation. Run service tests.

### Step 5: Extract BaseIacBuilder

Extract 24 shared builder methods and shared state. Both builders extend it,
keeping only static factories, tool-specific methods, and `build()`. Run builder
tests.

### Step 6: Update Barrel Files

Update `index.ts` files to re-export from `common/`. Verify all existing imports
still work. Run full test suite.

## Expected Outcome

| Metric           | Before | After                                                      |
| ---------------- | ------ | ---------------------------------------------------------- |
| Duplicated lines | ~1,400 | ~0                                                         |
| New files        | 0      | ~9 (interfaces + base classes + barrels)                   |
| Net line change  | -      | Roughly even or slightly fewer                             |
| Test impact      | -      | Existing tests pass unchanged, 1 new base class test suite |

**Future benefit:** Adding a new IaC tool (Pulumi, OpenTofu) requires extending
the base classes, not copy-pasting 1,400 lines.

## Risks

- **TypeScript generics with fluent APIs:** The `this` return type on base class
  methods must be tested to ensure proper type narrowing in subclasses.
- **Protected field exposure:** Subclasses access base state via `protected`
  fields. This is intentional for the builder pattern but must be documented.
- **Circular imports:** Base classes must NOT import from `terraform/` or
  `terragrunt/`. Dependency flows one way: specific → common.

## Non-Goals

- Changing the external API (action.yml inputs/outputs) — fully backward
  compatible
- Changing runner or settings logic — those stay tool-specific
- Merging test suites — existing concrete class tests remain as integration
  validation
