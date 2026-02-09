# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-09

### 🎉 Initialization

- Initial Commit by @elioseverojunior

### 🐛 Bug Fixes

- Add empty-command guards and parseInt NaN validation by @elioseverojunior
- Unify JSON parsing error handling to consistent patterns by @elioseverojunior

### 📚 Documentation

- Add JSDoc to ISharedIacSettings and BaseIacService by @elioseverojunior
- Add code review fixes implementation plan by @elioseverojunior

### 📦 Build

- Update compiled dist bundles by @elioseverojunior
- Update compiled dist bundles by @elioseverojunior
- Update compiled dist bundles by @elioseverojunior
- Update compiled dist bundles by @elioseverojunior

### 🔧 Refactoring

- Extract shared array utilities from IaC builders by @elioseverojunior
- Remove dead code, merge identical branches, fix naming by @elioseverojunior
- Extract shared IaC runner helpers to reduce duplication by @elioseverojunior
- Replace require-based mock access with typed imports in runner tests by
  @elioseverojunior
- Remove deprecated catchErrorAndSetFailed and errorHandler by @elioseverojunior
- Narrow ValidationUtils.isNullOrUndefined from any to unknown by
  @elioseverojunior
- Extract BaseVersionResolver to eliminate resolver duplication by
  @elioseverojunior

### 🔨 Miscellaneous

- Add tsconfig for src/tools to fix IDE type resolution by @elioseverojunior

### 🚀 Features

- Add Terragrunt v0/v1 backward compatibility and native version management by
  @elioseverojunior

### 🧪 Testing

- Fill coverage gaps across IaC and utility modules by @elioseverojunior
- Add Docker BuildX main orchestrator unit tests by @elioseverojunior
- Add empty-command guard tests for 100% coverage by @elioseverojunior

[1.0.0]: https://github.com/elioetibr/actions/compare/v0.0.1...v1.0.0
