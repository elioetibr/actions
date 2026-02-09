---
name: generate-tests
description: >
  Use when the user asks to "generate tests", "write tests", "add test
  coverage", "create unit tests", "test this", or when new code needs test
  coverage. Generates comprehensive Vitest tests targeting 90%+ coverage with
  proper mocking and edge cases.
---

# Test Generation

Generate comprehensive unit tests for TypeScript source files.

## Workflow

### 1. Target Selection

Determine what needs tests:

- If the user specified files, generate tests for those
- If there are new/modified files without tests, target those
- Run `pnpm test:coverage` to identify files below 90% threshold

### 2. Source Analysis

For each target file:

- Read the source completely
- Identify exported API surface
- Map dependencies and side effects
- Count branch points for coverage planning

### 3. Test Generation

Use the `test-generator` agent to create tests following:

- **Arrange-Act-Assert** pattern
- Nested `describe` blocks for organization
- Happy path, edge cases, error cases, and branch coverage
- Proper mocking at module boundaries

### 4. Verification

After generating tests:

- Run `pnpm test` to verify all tests pass
- Run `pnpm test:coverage` to verify coverage meets 90% thresholds
- Run `pnpm typecheck` to verify test files are type-safe
- Fix any failures before presenting results

### 5. Coverage Report

Present:

- Per-file coverage breakdown (branches, functions, lines, statements)
- Files still below threshold with explanation
- Total coverage delta (before vs after)

## Quick Commands

- `/generate-tests` - Generate tests for files missing coverage
- `/generate-tests src/services/auth.ts` - Generate tests for specific file
- `/generate-tests --coverage-report` - Show current coverage gaps only
