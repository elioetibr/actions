# Agent Context (Expanded Details)

This file provides expanded details for agents beyond what CLAUDE.md covers.
CLAUDE.md is auto-loaded and contains the canonical project config. This file
adds depth for agent-specific analysis.

## TypeScript Strict Flags (Full List)

- `strict: true`
- `noUnusedLocals` / `noUnusedParameters` - no dead code
- `noFallthroughCasesInSwitch` - explicit breaks required
- `noImplicitReturns` - all code paths must return
- `noImplicitOverride` - explicit override keyword
- `noPropertyAccessFromIndexSignature` - bracket notation for index signatures
- `noUncheckedIndexedAccess` - must handle `undefined` from index access
- `exactOptionalPropertyTypes` - `undefined` must be explicitly assigned

## Test Runner Details

### Vitest (Primary)

- Globals enabled (`describe`, `it`, `expect` available without import)
- DO import `vi` from `vitest` for mocking utilities
- Node environment, V8 coverage provider
- 30s test timeout, `restoreMocks: true`

### Jest (Secondary)

- `ts-jest` preset with `tsconfig.jest.json`
- Node environment, 30s test timeout
- `clearMocks: true`, `restoreMocks: true`

## SOLID Principles (Expanded)

- **Single Responsibility**: Each module/class/function should have one reason
  to change
- **Open/Closed**: Open for extension, closed for modification. Prefer
  polymorphism or strategy patterns over hardcoded conditionals
- **Liskov Substitution**: Subtypes must be substitutable for their base types
  without breaking behavior
- **Interface Segregation**: No client should be forced to depend on interfaces
  it does not use. Flag fat interfaces
- **Dependency Inversion**: High-level modules should not depend on low-level
  modules. Both should depend on abstractions

## DRY Methodology

- Flag duplicated logic (not just duplicated code - similar patterns that should
  be abstracted)
- Identify magic numbers and strings that should be constants
- Check for repeated error handling patterns that could be centralized

## KISS Methodology

- Flag over-engineered abstractions with no current justification
- Identify premature optimization
- Check for unnecessary complexity (nested ternaries, deep callback chains,
  excessive generics)

## Code Quality Thresholds

- Cyclomatic complexity: flag functions > 10
- Cognitive complexity: flag deeply nested logic
- Function length: flag > 30 lines
- File length: flag > 300 lines
- Parameter count: flag > 4 parameters (use options object)
- Import depth: flag circular dependencies

## CI Environment

Docker Compose exposes these env vars:

- `APP_ID`, `PRIVATE_KEY`, `WEBHOOK_SECRET`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
