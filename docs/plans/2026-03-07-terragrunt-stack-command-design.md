# Terragrunt `stack` Command Support

**Date:** 2026-03-07 **Status:** Approved

## Goal

Add `stack` as a first-class command value in the Terragrunt GitHub Action with
raw pass-through execution and version validation.

## Background

Terragrunt introduced `stack` commands (`generate`, `run`, `output`, `clean`) in
v0.71.3 as part of the road to 1.0. Stacks are collections of units defined in
`terragrunt.stack.hcl` files. The original design doc
(`2026-02-08-terragrunt-compat-and-version-managers.md`) listed stack commands
as non-goals, but they are now needed for production workflows.

## Design Decisions

### Execution Model: Raw Pass-Through

`terragrunt stack <extra-args>` with no builder flags injected.

```yaml
# Stack generate
- uses: elioetibr/actions/iac/terragrunt@v1
  with:
    command: stack
    extra-args: 'generate'

# Stack run apply
- uses: elioetibr/actions/iac/terragrunt@v1
  with:
    command: stack
    extra-args: 'run apply --no-color'

# Stack output
- uses: elioetibr/actions/iac/terragrunt@v1
  with:
    command: stack
    extra-args: 'output'

# Stack clean
- uses: elioetibr/actions/iac/terragrunt@v1
  with:
    command: stack
    extra-args: 'clean'
```

**Rationale:** Stack commands have their own subcommand structure. Injecting
builder flags (include-dirs, parallelism, etc.) would conflict with stack-native
behavior. Users control everything via `extra-args`.

### Version Gate: Hard Fail with Suggestion

Minimum Terragrunt version: **0.71.3**

When the detected version is below the minimum:

```
Error: "stack" commands require Terragrunt >= 0.71.3 (detected v0.68.0).
Set "terragrunt-version: 0.77.13" or later to use stack commands.
```

Version comparison logic:

```typescript
function isStackSupported(version: SemVer): boolean {
  if (version.major >= 1) return true;
  if (version.minor > 71) return true;
  if (version.minor === 71 && version.patch >= 3) return true;
  return false;
}
```

### Version Gate Bypasses

| Scenario                   | Behavior                        |
| -------------------------- | ------------------------------- |
| `terragrunt-version: skip` | Skip gate (user manages binary) |
| Version detection fails    | Skip gate with warning log      |

### Edge Cases

| Scenario                              | Behavior                                                       |
| ------------------------------------- | -------------------------------------------------------------- |
| `command: stack` with no `extra-args` | Run `terragrunt stack`, let Terragrunt show its own help/error |
| `command: stack` with `run-all: true` | Ignore `run-all`, log warning                                  |
| `command: stack` with builder flags   | Silently ignore all builder flags                              |

## Files Modified

| File                                                               | Change                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| `src/actions/iac/terragrunt/interfaces/ITerragruntProvider.ts`     | Add `'stack'` to `TerragruntCommand` union                   |
| `src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.ts` | Handle `stack` as raw pass-through in `buildCommand()`       |
| `src/actions/iac/terragrunt/services/TerragruntService.ts`         | Version gate before execution                                |
| `src/tools/terragrunt/settings.ts`                                 | Add `'stack'` to `TERRAGRUNT_COMMANDS` validation            |
| `iac/terragrunt/action.yml`                                        | Update `command` input description                           |
| `iac/terragrunt/README.md`                                         | Document stack command with examples and version requirement |

## Files NOT Modified

| File                          | Reason                                |
| ----------------------------- | ------------------------------------- |
| `TerragruntBuilder.ts`        | No new builder methods (pass-through) |
| `TerragruntFlagMapping.ts`    | No flag injection for stack           |
| `TerragruntBuilderFactory.ts` | No `forStack*()` convenience methods  |

## Test Coverage

- **ArgumentBuilder:** `stack` + extra-args produces correct array with zero
  builder flags
- **Version gate:** Fails for `0.71.2`, passes for `0.71.3`, `0.72.0`, `1.0.0`
- **Settings:** Accepts `'stack'` as valid command value
- **Edge cases:** `run-all` ignored with warning, version `skip` bypasses gate,
  detection failure bypasses gate with warning

## No New Outputs

Existing outputs (`stdout`, `stderr`, `exitcode`) capture whatever
`terragrunt stack <subcommand>` produces.
