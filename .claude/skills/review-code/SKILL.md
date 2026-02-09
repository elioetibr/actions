---
name: review-code
description: >
  Use when the user asks to "review code", "check code quality", "review my
  changes", "find code smells", "review PR", or after implementing a feature.
  Performs comprehensive code review against SOLID/DRY/KISS principles,
  TypeScript strict mode, performance, and security.
---

# Code Review

Perform a comprehensive code review of the current codebase or specified files.

## Workflow

### 1. Scope Detection

Determine what to review:

- If the user specified files/paths, review those
- If there are uncommitted changes, review those: `git diff --name-only` and
  `git diff --cached --name-only`
- If on a feature branch, review changes from main:
  `git diff main...HEAD --name-only`
- Otherwise, review all TypeScript source files in `src/`

### 2. Pre-flight Checks

Run automated quality tools first to establish baseline:

- `pnpm typecheck` - TypeScript compilation errors
- `pnpm lint` - ESLint violations
- `pnpm format:check` - Prettier formatting issues

Report any failures as blockers before proceeding to manual review.

### 3. Deep Review

Use the `code-reviewer` agent to analyze the scoped files for:

- SOLID principle violations
- DRY violations (duplicated logic)
- KISS violations (unnecessary complexity)
- TypeScript strict mode bypasses
- Performance anti-patterns
- Security vulnerabilities

### 4. Summary Report

Present findings organized by severity (CRITICAL > HIGH > MEDIUM > LOW) with:

- Total issue count per severity
- Actionable fix for each finding
- Overall code health score (A-F grade)

## Quick Commands

- `/review-code` - Review uncommitted changes
- `/review-code src/services/` - Review specific directory
- `/review-code --full` - Review entire src/ directory
