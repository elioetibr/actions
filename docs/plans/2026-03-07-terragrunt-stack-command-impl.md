# Terragrunt Stack Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Add `stack` as a first-class Terragrunt command with raw pass-through
execution and version validation (>= 0.71.3).

**Architecture:** Add `'stack'` to the command union, handle it as a raw
pass-through in the argument builder (no flags injected), and add a version gate
in the runner that validates the detected Terragrunt version before execution.
The `extra-args` input provides full user control over subcommands.

**Tech Stack:** TypeScript, Jest, GitHub Actions YAML

---

### Task 1: Add `'stack'` to TerragruntCommand Union and Validation Array

**Files:**

- Modify: `src/actions/iac/terragrunt/interfaces/ITerragruntProvider.ts:78-115`

**Step 1: Add `'stack'` to the union type**

In `ITerragruntProvider.ts`, add `'stack'` to the `TerragruntCommand` union at
line 86:

```typescript
export type TerragruntCommand =
  | TerraformCommand
  | 'run-all'
  | 'graph-dependencies'
  | 'hclfmt'
  | 'aws-provider-patch'
  | 'render-json'
  | 'output-module-groups'
  | 'validate-inputs'
  | 'stack';
```

And add `'stack'` to the `TERRAGRUNT_COMMANDS` array at line 114:

```typescript
  'validate-inputs',
  'stack',
] as const;
```

**Step 2: Run typecheck**

Run: `pnpm run typecheck` Expected: PASS (adding to union is additive)

**Step 3: Commit**

```bash
git add src/actions/iac/terragrunt/interfaces/ITerragruntProvider.ts
git commit -S -m "feat(terragrunt): add stack to TerragruntCommand union type"
```

---

### Task 2: Add Version Gate Utility

**Files:**

- Modify: `src/libs/version-manager/version-detector.ts`
- Test: `src/libs/version-manager/version-detector.test.ts`

**Step 1: Write the failing tests**

Add to the existing version-detector test file:

```typescript
describe('isStackSupported', () => {
  it('should return false for 0.71.2', () => {
    expect(
      isStackSupported({ major: 0, minor: 71, patch: 2, raw: '0.71.2' }),
    ).toBe(false);
  });

  it('should return true for 0.71.3', () => {
    expect(
      isStackSupported({ major: 0, minor: 71, patch: 3, raw: '0.71.3' }),
    ).toBe(true);
  });

  it('should return true for 0.72.0', () => {
    expect(
      isStackSupported({ major: 0, minor: 72, patch: 0, raw: '0.72.0' }),
    ).toBe(true);
  });

  it('should return true for 1.0.0', () => {
    expect(
      isStackSupported({ major: 1, minor: 0, patch: 0, raw: '1.0.0' }),
    ).toBe(true);
  });

  it('should return false for 0.70.9', () => {
    expect(
      isStackSupported({ major: 0, minor: 70, patch: 9, raw: '0.70.9' }),
    ).toBe(false);
  });

  it('should return true for 0.77.13', () => {
    expect(
      isStackSupported({ major: 0, minor: 77, patch: 13, raw: '0.77.13' }),
    ).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run:
`pnpm exec jest --config jest.config.cjs -- version-detector.test.ts -t "isStackSupported"`
Expected: FAIL — `isStackSupported` is not defined

**Step 3: Implement `isStackSupported`**

Add to `src/libs/version-manager/version-detector.ts` after `isV1OrLater`:

```typescript
/**
 * Check if the detected version supports stack commands (>= 0.71.3).
 */
export function isStackSupported(version: SemVer): boolean {
  if (version.major >= 1) return true;
  if (version.minor > 71) return true;
  if (version.minor === 71 && version.patch >= 3) return true;
  return false;
}
```

Export it from the version-manager barrel file.

**Step 4: Run tests to verify they pass**

Run:
`pnpm exec jest --config jest.config.cjs -- version-detector.test.ts -t "isStackSupported"`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add src/libs/version-manager/version-detector.ts src/libs/version-manager/version-detector.test.ts src/libs/version-manager/index.ts
git commit -S -m "feat(version-manager): add isStackSupported version check"
```

---

### Task 3: Handle `stack` as Raw Pass-Through in ArgumentBuilder

**Files:**

- Modify:
  `src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.ts:48-76`
- Test: `src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.test.ts`

**Step 1: Write the failing tests**

Add a new `describe('stack command')` block to the ArgumentBuilder test file:

```typescript
describe('stack command', () => {
  it('should produce terragrunt stack with no args when no extra-args', () => {
    const provider = createMockProvider({ command: 'stack' });
    const builder = new TerragruntArgumentBuilder(provider);
    const cmd = builder.buildCommand();

    expect(cmd).toEqual(['terragrunt', 'stack']);
  });

  it('should append extra-args after stack', () => {
    const provider = createMockProvider({
      command: 'stack',
      extraArgs: ['generate'],
    });
    const builder = new TerragruntArgumentBuilder(provider);
    const cmd = builder.buildCommand();

    expect(cmd).toEqual(['terragrunt', 'stack', 'generate']);
  });

  it('should pass through complex extra-args for stack run', () => {
    const provider = createMockProvider({
      command: 'stack',
      extraArgs: ['run', 'apply', '--no-color'],
    });
    const builder = new TerragruntArgumentBuilder(provider);
    const cmd = builder.buildCommand();

    expect(cmd).toEqual(['terragrunt', 'stack', 'run', 'apply', '--no-color']);
  });

  it('should not inject any builder flags for stack command', () => {
    const provider = createMockProvider({
      command: 'stack',
      terragruntConfig: '/path/to/terragrunt.hcl',
      nonInteractive: true,
      noAutoInit: true,
      terragruntParallelism: 4,
      includeDirs: ['/mod-a'],
      excludeDirs: ['/mod-b'],
      extraArgs: ['output'],
    });
    const builder = new TerragruntArgumentBuilder(provider);
    const cmd = builder.buildCommand();

    // Only terragrunt + stack + extra-args, no flags
    expect(cmd).toEqual(['terragrunt', 'stack', 'output']);
  });

  it('should ignore run-all flag when command is stack', () => {
    const provider = createMockProvider({
      command: 'stack',
      runAll: true,
      extraArgs: ['generate'],
    });
    const builder = new TerragruntArgumentBuilder(provider);
    const cmd = builder.buildCommand();

    expect(cmd).toEqual(['terragrunt', 'stack', 'generate']);
  });

  it('should work the same in v0 and v1 mode', () => {
    const v0 = createMockProvider({
      command: 'stack',
      extraArgs: ['clean'],
      terragruntMajorVersion: 0,
    });
    const v1 = createMockProvider({
      command: 'stack',
      extraArgs: ['clean'],
      terragruntMajorVersion: 1,
    });

    const cmdV0 = new TerragruntArgumentBuilder(v0).buildCommand();
    const cmdV1 = new TerragruntArgumentBuilder(v1).buildCommand();

    expect(cmdV0).toEqual(['terragrunt', 'stack', 'clean']);
    expect(cmdV1).toEqual(['terragrunt', 'stack', 'clean']);
  });
});
```

**Step 2: Run tests to verify they fail**

Run:
`pnpm exec jest --config jest.config.cjs -- TerragruntArgumentBuilder.test.ts -t "stack command"`
Expected: FAIL — `stack` falls through to the standard command path and injects
builder flags

**Step 3: Implement stack handling in `buildCommand()`**

In `TerragruntArgumentBuilder.ts`, add a new early-return block at line 52
(after `const args = this.toCommandArgs();` on line 51). Actually, the stack
handler must come BEFORE `toCommandArgs()` since we want zero flags. Add it as
the first check in `buildCommand()`:

```typescript
buildCommand(): string[] {
    const command = this.provider.command;
    const isV1 = this.provider.terragruntMajorVersion >= 1;

    // Stack is a raw pass-through — no builder flags, only extra-args
    if (command === 'stack') {
      const extraArgs = this.provider.extraArgs ?? [];
      return [this.provider.executor, 'stack', ...extraArgs];
    }

    const args = this.toCommandArgs();
    // ... rest of existing code unchanged
```

Note: Check how `extraArgs` is accessed on the provider. Look at how it's used
elsewhere in the builder or check the `ITerragruntProvider` interface for the
exact property name.

**Step 4: Run tests to verify they pass**

Run:
`pnpm exec jest --config jest.config.cjs -- TerragruntArgumentBuilder.test.ts -t "stack command"`
Expected: PASS (6 tests)

**Step 5: Run full ArgumentBuilder test suite**

Run:
`pnpm exec jest --config jest.config.cjs -- TerragruntArgumentBuilder.test.ts`
Expected: All existing tests still PASS

**Step 6: Commit**

```bash
git add src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.ts src/actions/iac/terragrunt/services/TerragruntArgumentBuilder.test.ts
git commit -S -m "feat(terragrunt): handle stack as raw pass-through in argument builder"
```

---

### Task 4: Add Version Gate in Runner

**Files:**

- Modify: `src/tools/terragrunt/runner.ts:42-76`
- Test: `src/tools/terragrunt/runner.test.ts` (if exists, or create)

**Step 1: Write the failing test**

The version gate should be in the runner's `runExecute` method, after version
detection and before building the service. Add tests that verify:

```typescript
describe('stack version gate', () => {
  it('should throw when command is stack and version < 0.71.3', async () => {
    // Mock detectTerragruntVersion to return 0.70.0
    // Mock getSettings to return command: 'stack'
    // Expect: error containing "stack" and ">= 0.71.3"
  });

  it('should not throw when command is stack and version >= 0.71.3', async () => {
    // Mock detectTerragruntVersion to return 0.77.13
    // Mock getSettings to return command: 'stack'
    // Expect: no version error (may fail on later steps, but not version gate)
  });

  it('should skip version gate when terragrunt-version is skip', async () => {
    // When tgResolver.resolve returns undefined (skip),
    // detectTerragruntVersion is still called on the PATH binary.
    // If that binary is old, it should still gate.
    // But if detection fails entirely, skip the gate with warning.
  });
});
```

The exact test structure depends on how the runner test file is organized. Check
existing patterns. The key assertion: when `settings.command === 'stack'` and
the detected `SemVer` fails `isStackSupported()`, the runner throws:

```
"stack" commands require Terragrunt >= 0.71.3 (detected v0.70.0). Set "terragrunt-version: 0.77.13" or later to use stack commands.
```

**Step 2: Implement the version gate**

In `runner.ts`, modify `runExecute()` after
`const tgMajor = await this.setupTerragruntVersion(agent, settings)`:

```typescript
// Version gate for stack command
if (settings.command === 'stack') {
  this.validateStackVersion(agent, settings);
}
```

Add a private method that accesses the cached version:

```typescript
/**
 * Validate that the detected Terragrunt version supports stack commands.
 * Requires >= 0.71.3. Throws with version suggestion if too old.
 */
private validateStackVersion(agent: IAgent, settings: ITerragruntSettings): void {
  try {
    const detected = // get from cache or re-detect
    if (!isStackSupported(detected)) {
      throw new Error(
        `"stack" commands require Terragrunt >= 0.71.3 (detected v${detected.raw}). ` +
        `Set "terragrunt-version: 0.77.13" or later to use stack commands.`
      );
    }
  } catch (error) {
    // If version detection itself failed, we're already in the catch of runExecute
    // But if we get here from a non-detection error, re-throw
    if (error instanceof Error && error.message.includes('stack')) {
      throw error;
    }
    agent.warning('Could not detect Terragrunt version, skipping stack version check');
  }
}
```

Note: The `detectTerragruntVersion` function caches results, so calling it again
returns the cached value without re-executing. Import `isStackSupported` from
`version-manager`.

The simpler approach: `setupTerragruntVersion` already calls
`detectTerragruntVersion` and returns the major version. But we need minor+patch
too. Options:

1. Return the full `SemVer` from `setupTerragruntVersion` instead of just
   `major`
2. Call `detectTerragruntVersion` again (it's cached, no cost)

Option 2 is simpler — no API change.

```typescript
private async validateStackVersion(agent: IAgent): Promise<void> {
  try {
    const detected = await detectTerragruntVersion(agent);
    if (!isStackSupported(detected)) {
      throw new Error(
        `"stack" commands require Terragrunt >= 0.71.3 (detected v${detected.raw}). ` +
        `Set "terragrunt-version: 0.77.13" or later to use stack commands.`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('>= 0.71.3')) {
      throw error;
    }
    agent.warning('Could not detect Terragrunt version, skipping stack version check');
  }
}
```

In `runExecute()`, after version setup:

```typescript
const tgMajor = await this.setupTerragruntVersion(agent, settings);

// Version gate for stack command
if (settings.command === 'stack') {
  await this.validateStackVersion(agent);
}
```

**Step 3: Run tests**

Run: `pnpm exec jest --config jest.config.cjs -- terragrunt/runner` Expected:
PASS

**Step 4: Commit**

```bash
git add src/tools/terragrunt/runner.ts src/tools/terragrunt/runner.test.ts
git commit -S -m "feat(terragrunt): add version gate for stack command (>= 0.71.3)"
```

---

### Task 5: Add `'stack'` to Settings Validation

**Files:**

- Modify: `src/tools/terragrunt/settings.ts`
- Test: `src/tools/terragrunt/settings.test.ts`

**Step 1: Write the failing test**

Add to settings test file:

```typescript
it('should accept stack as a valid command', () => {
  mockAgent.getInput.mockImplementation((name: string) => {
    if (name === 'command') return 'stack';
    // ... return defaults for everything else
  });

  const settings = getSettings(mockAgent);
  expect(settings.command).toBe('stack');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec jest --config jest.config.cjs -- settings.test.ts -t "stack"`
Expected: FAIL — `validateTerragruntCommand` rejects `'stack'`

Note: If `settings.ts` uses the shared `TERRAGRUNT_COMMANDS` from
`ITerragruntProvider.ts`, it may already pass since Task 1 added `'stack'`
there. If it has its own validation array, add `'stack'` to it.

**Step 3: Verify or add `'stack'` to settings validation**

Check if `settings.ts` imports `TERRAGRUNT_COMMANDS` from the interfaces file or
has a local copy. If local, add `'stack'`.

**Step 4: Run tests**

Run: `pnpm exec jest --config jest.config.cjs -- settings.test.ts` Expected: All
PASS

**Step 5: Commit**

```bash
git add src/tools/terragrunt/settings.ts src/tools/terragrunt/settings.test.ts
git commit -S -m "feat(terragrunt): accept stack in settings validation"
```

---

### Task 6: Add run-all Warning for Stack Command in Runner

**Files:**

- Modify: `src/tools/terragrunt/runner.ts`

**Step 1: Write the failing test**

```typescript
it('should log warning when run-all is true and command is stack', async () => {
  // Mock settings with command: 'stack', runAll: true
  // Expect agent.warning called with message about run-all being ignored
});
```

**Step 2: Implement the warning**

In `runExecute()`, after settings parsing:

```typescript
if (settings.command === 'stack' && settings.runAll) {
  agent.warning(
    'run-all is ignored when command is "stack" — stack manages its own units',
  );
}
```

**Step 3: Run tests**

Run: `pnpm exec jest --config jest.config.cjs -- terragrunt/runner` Expected:
PASS

**Step 4: Commit**

```bash
git add src/tools/terragrunt/runner.ts src/tools/terragrunt/runner.test.ts
git commit -S -m "feat(terragrunt): warn when run-all used with stack command"
```

---

### Task 7: Update action.yml and README

**Files:**

- Modify: `iac/terragrunt/action.yml:9-11`
- Modify: `iac/terragrunt/README.md`

**Step 1: Update action.yml command description**

Add `stack` to the list of valid commands in the `command` input description.

**Step 2: Update README**

Add a new section documenting the stack command:

- Version requirement (>= 0.71.3)
- Usage examples (generate, run, output, clean)
- Note about raw pass-through (all flags via extra-args)
- Note about run-all being ignored

**Step 3: Commit**

```bash
git add iac/terragrunt/action.yml iac/terragrunt/README.md
git commit -S -m "docs(terragrunt): document stack command support"
```

---

### Task 8: Full Validation

**Step 1: Run typecheck**

Run: `pnpm run typecheck` Expected: PASS

**Step 2: Run lint**

Run: `pnpm run lint` Expected: PASS

**Step 3: Run full test suite with coverage**

Run: `pnpm run test:coverage` Expected: All tests PASS, 100% coverage maintained

**Step 4: Build dist**

Run: `pnpm run build` Expected: Build succeeds

**Step 5: Commit dist**

```bash
git add dist/
git commit -S -m "build(terragrunt): update compiled dist bundles for stack support"
```
