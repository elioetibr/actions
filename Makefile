SHELL := /bin/bash
.DEFAULT_GOAL := help

# ─── Configuration ─────────────────────────────────────────────────────────────
GITHUB_USER ?= elioseverojunior
DRY_RUN     ?=

# ─── Tool checks ────────────────────────────────────────────────────────────────
GITVERSION := $(shell command -v gitversion 2>/dev/null)
GIT_CLIFF  := $(shell command -v git-cliff 2>/dev/null)
GH         := $(shell command -v gh 2>/dev/null)

define check_tool
	@if [ -z "$(1)" ]; then \
		echo "Error: $(2) is not installed. $(3)"; \
		exit 1; \
	fi
endef

# ─── Version file ───────────────────────────────────────────────────────────────
# .release-version is generated once by `calculate-version` and consumed by all
# subsequent release steps. This prevents version drift after commit-release adds
# a new commit.
RELEASE_VERSION_FILE := .release-version

define read_version_var
$(shell [ -f $(RELEASE_VERSION_FILE) ] && jq -r '.$(1)' $(RELEASE_VERSION_FILE) || echo "")
endef

# ─── Build ──────────────────────────────────────────────────────────────────────
.PHONY: build
build: ## Build dist/ with Vite
	pnpm run build

.PHONY: test
test: ## Run tests
	pnpm test

.PHONY: lint
lint: ## Run linter
	pnpm run lint

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	pnpm run typecheck

.PHONY: verify
verify: lint typecheck test build ## Run lint, typecheck, tests, and build

# ─── Version ────────────────────────────────────────────────────────────────────
.PHONY: version
version: ## Show the calculated semantic version from GitVersion
	$(call check_tool,$(GITVERSION),gitversion,Install: dotnet tool install -g GitVersion.Tool)
	@gitversion /output json | jq '{Branch: .BranchName, FullSemVer: .FullSemVer, MajorMinorPatch: .MajorMinorPatch, Major: .Major, Minor: .Minor, Patch: .Patch}'

.PHONY: calculate-version
calculate-version: ## Calculate and lock version into .release-version
	$(call check_tool,$(GITVERSION),gitversion,Install: dotnet tool install -g GitVersion.Tool)
	@echo "Calculating version with GitVersion..."
	@gitversion /output json > $(RELEASE_VERSION_FILE)
	@FULL=$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE)); \
	MAJOR=$$(jq -r '.Major' $(RELEASE_VERSION_FILE)); \
	MINOR=$$(jq -r '.Minor' $(RELEASE_VERSION_FILE)); \
	SEMVER=$$(jq -r '.FullSemVer' $(RELEASE_VERSION_FILE)); \
	echo "Locked version: v$$FULL ($$SEMVER)"; \
	echo "  Tags:     v$$FULL, v$$MAJOR.$$MINOR, v$$MAJOR"; \
	echo "  Branches: v$$MAJOR, v$$MAJOR.$$MINOR"

# ─── Change detection ───────────────────────────────────────────────────────────
.PHONY: check-changes
check-changes: ## Verify there are releasable changes since last tag
	@PREVIOUS_TAG=$$(git describe --tags --abbrev=0 2>/dev/null || echo ""); \
	if [ -z "$$PREVIOUS_TAG" ]; then \
		COMMIT_COUNT=$$(git rev-list --count HEAD); \
		echo "No previous tag found. $$COMMIT_COUNT commits to release."; \
	else \
		COMMIT_COUNT=$$(git rev-list --count "$$PREVIOUS_TAG"..HEAD); \
		if [ "$$COMMIT_COUNT" -eq 0 ]; then \
			echo "Error: No changes since $$PREVIOUS_TAG. Nothing to release."; \
			exit 1; \
		fi; \
		echo "$$COMMIT_COUNT commit(s) since $$PREVIOUS_TAG:"; \
		git log --oneline "$$PREVIOUS_TAG"..HEAD; \
	fi

# ─── Changelog ──────────────────────────────────────────────────────────────────
.PHONY: changelog
changelog: ## Generate CHANGELOG.md with git-cliff (requires .release-version)
	$(call check_tool,$(GIT_CLIFF),git-cliff,Install: cargo install git-cliff)
	@if [ ! -f $(RELEASE_VERSION_FILE) ]; then \
		echo "Error: $(RELEASE_VERSION_FILE) not found. Run 'make calculate-version' first."; \
		exit 1; \
	fi
	@VERSION="v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	PREVIOUS_TAG=$$(git describe --tags --abbrev=0 2>/dev/null || echo ""); \
	if [ -n "$$PREVIOUS_TAG" ]; then \
		echo "Generating changelog from $$PREVIOUS_TAG to HEAD"; \
		git-cliff "$$PREVIOUS_TAG"..HEAD --tag "$$VERSION" -o CHANGELOG.md; \
	else \
		echo "No previous tag found, generating full changelog"; \
		git-cliff --tag "$$VERSION" -o CHANGELOG.md; \
	fi; \
	echo "CHANGELOG.md generated for $$VERSION"

.PHONY: release-notes
release-notes: ## Generate RELEASE_NOTES.md (requires .release-version)
	$(call check_tool,$(GIT_CLIFF),git-cliff,Install: cargo install git-cliff)
	@if [ ! -f $(RELEASE_VERSION_FILE) ]; then \
		echo "Error: $(RELEASE_VERSION_FILE) not found. Run 'make calculate-version' first."; \
		exit 1; \
	fi
	@VERSION="v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	PREVIOUS_TAG=$$(git describe --tags --abbrev=0 2>/dev/null || echo ""); \
	if [ -n "$$PREVIOUS_TAG" ]; then \
		git-cliff "$$PREVIOUS_TAG"..HEAD --tag "$$VERSION" --strip header -o RELEASE_NOTES.md; \
	else \
		git-cliff --tag "$$VERSION" --strip all -o RELEASE_NOTES.md; \
	fi; \
	echo "RELEASE_NOTES.md generated for $$VERSION"; \
	cat RELEASE_NOTES.md

# ─── Release ────────────────────────────────────────────────────────────────────
.PHONY: release-branch
release-branch: ## Create a release branch (releases/vX.Y.Z) from main
	$(call check_tool,$(GH),gh,Install: brew install gh)
	@if [ ! -f $(RELEASE_VERSION_FILE) ]; then \
		echo "Error: $(RELEASE_VERSION_FILE) not found. Run 'make calculate-version' first."; \
		exit 1; \
	fi
	@BRANCH="releases/v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	CURRENT=$$(git branch --show-current); \
	if [ "$$CURRENT" != "main" ]; then \
		echo "Error: Must be on main branch (currently on $$CURRENT)"; \
		exit 1; \
	fi; \
	echo "Creating release branch: $$BRANCH"; \
	git checkout -b "$$BRANCH"; \
	git push -u origin "$$BRANCH"; \
	echo "Release branch $$BRANCH created and pushed"

.PHONY: commit-release
commit-release: ## Commit changelog and dist/ with [skip ci] (requires .release-version)
	@if [ ! -f $(RELEASE_VERSION_FILE) ]; then \
		echo "Error: $(RELEASE_VERSION_FILE) not found. Run 'make calculate-version' first."; \
		exit 1; \
	fi
	@VERSION="v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	if [ -n "$(DRY_RUN)" ]; then \
		echo "  [dry-run] git add CHANGELOG.md dist/"; \
		echo "  [dry-run] git commit -m \"chore(release): $$VERSION [skip ci]\""; \
		echo "  [dry-run] git push"; \
	else \
		git add CHANGELOG.md dist/; \
		if ! git diff --staged --quiet; then \
			git commit -m "chore(release): $$VERSION [skip ci]"; \
			git push; \
			echo "Committed release artifacts for $$VERSION"; \
		else \
			echo "No changes to commit"; \
		fi; \
	fi

.PHONY: tag
tag: ## Create version tags vX.Y.Z, vX.Y, vX (requires .release-version)
	$(call check_tool,$(GH),gh,Install: brew install gh)
	@gh auth switch -h github.com -u $(GITHUB_USER)
	@if [ ! -f $(RELEASE_VERSION_FILE) ]; then \
		echo "Error: $(RELEASE_VERSION_FILE) not found. Run 'make calculate-version' first."; \
		exit 1; \
	fi
	@_run() { if [ -n "$(DRY_RUN)" ]; then echo "  [dry-run] $$*"; else "$$@"; fi; }; \
	FULL="v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	MAJOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE))"; \
	MINOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE)).$$(jq -r '.Minor' $(RELEASE_VERSION_FILE))"; \
	echo "Tagging $$FULL (floating: $$MINOR, $$MAJOR)"; \
	for VERSION in $$FULL $$MINOR $$MAJOR; do \
		echo "──── Processing tag: $$VERSION"; \
		TAG_EXISTS=$$(git ls-remote --tags origin "refs/tags/$$VERSION" 2>/dev/null | wc -l | tr -d ' '); \
		if [ "$$TAG_EXISTS" -gt 0 ]; then \
			echo "  Removing existing tag $$VERSION"; \
			HAS_RELEASE=$$(gh release view "$$VERSION" --json tagName -q '.tagName' 2>/dev/null || echo ""); \
			if [ -n "$$HAS_RELEASE" ]; then \
				_run gh release delete --yes "$$VERSION"; \
			fi; \
			if [ -n "$(DRY_RUN)" ]; then \
				echo "  [dry-run] git push origin --delete $$VERSION"; \
				echo "  [dry-run] git tag -d $$VERSION"; \
			else \
				git push origin --delete "$$VERSION" 2>/dev/null || true; \
				git tag -d "$$VERSION" 2>/dev/null || true; \
			fi; \
		fi; \
		_run git tag -a "$$VERSION" -m "chore: Release $$VERSION"; \
		echo "  Created tag $$VERSION"; \
	done; \
	_run git push --tags --force; \
	echo "All tags pushed"

.PHONY: floating-branches
floating-branches: ## Update floating branches vX, vX.Y (requires .release-version)
	@if [ ! -f $(RELEASE_VERSION_FILE) ]; then \
		echo "Error: $(RELEASE_VERSION_FILE) not found. Run 'make calculate-version' first."; \
		exit 1; \
	fi
	@_run() { if [ -n "$(DRY_RUN)" ]; then echo "  [dry-run] $$*"; else "$$@"; fi; }; \
	MAJOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE))"; \
	MINOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE)).$$(jq -r '.Minor' $(RELEASE_VERSION_FILE))"; \
	echo "Updating floating branches: $$MAJOR, $$MINOR"; \
	_run git push origin HEAD:refs/heads/"$$MAJOR" --force; \
	_run git push origin HEAD:refs/heads/"$$MINOR" --force; \
	echo "Floating branches updated"

.PHONY: release
release: verify check-changes calculate-version changelog release-notes commit-release tag floating-branches ## Full release pipeline
	$(call check_tool,$(GH),gh,Install: brew install gh)
	@gh auth switch -h github.com -u $(GITHUB_USER)
	@_run() { if [ -n "$(DRY_RUN)" ]; then echo "  [dry-run] $$*"; else "$$@"; fi; }; \
	FULL="v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	MAJOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE))"; \
	MINOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE)).$$(jq -r '.Minor' $(RELEASE_VERSION_FILE))"; \
	echo "Creating GitHub release $$FULL"; \
	if [ -z "$(DRY_RUN)" ]; then \
		gh release list --json tagName,isDraft -q '.[] | select(.isDraft) | .tagName' 2>/dev/null | while read -r draft; do \
			echo "Removing draft release: $$draft"; \
			gh release delete --yes "$$draft"; \
		done; \
	fi; \
	_run gh release create "$$FULL" --notes-file RELEASE_NOTES.md --verify-tag --latest; \
	echo ""; \
	echo "Released $$FULL"; \
	echo "  Tag:      $$FULL"; \
	echo "  Floating: $$MINOR, $$MAJOR"; \
	if [ -z "$(DRY_RUN)" ]; then \
		echo "  URL:      $$(gh release view $$FULL --json url -q '.url')"; \
	fi; \
	if [ -n "$(DRY_RUN)" ]; then \
		git checkout CHANGELOG.md 2>/dev/null || true; \
		rm -f RELEASE_NOTES.md; \
	fi; \
	rm -f $(RELEASE_VERSION_FILE)

.PHONY: release-with-branch
release-with-branch: verify check-changes calculate-version release-branch changelog release-notes commit-release tag floating-branches ## Release with branch creation
	$(call check_tool,$(GH),gh,Install: brew install gh)
	@gh auth switch -h github.com -u $(GITHUB_USER)
	@_run() { if [ -n "$(DRY_RUN)" ]; then echo "  [dry-run] $$*"; else "$$@"; fi; }; \
	FULL="v$$(jq -r '.MajorMinorPatch' $(RELEASE_VERSION_FILE))"; \
	MAJOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE))"; \
	MINOR="v$$(jq -r '.Major' $(RELEASE_VERSION_FILE)).$$(jq -r '.Minor' $(RELEASE_VERSION_FILE))"; \
	echo "Creating GitHub release $$FULL"; \
	if [ -z "$(DRY_RUN)" ]; then \
		gh release list --json tagName,isDraft -q '.[] | select(.isDraft) | .tagName' 2>/dev/null | while read -r draft; do \
			echo "Removing draft release: $$draft"; \
			gh release delete --yes "$$draft"; \
		done; \
	fi; \
	_run gh release create "$$FULL" --notes-file RELEASE_NOTES.md --verify-tag --latest; \
	echo ""; \
	echo "Released $$FULL"; \
	echo "  Tag:      $$FULL"; \
	echo "  Floating: $$MINOR, $$MAJOR"; \
	if [ -z "$(DRY_RUN)" ]; then \
		echo "  URL:      $$(gh release view $$FULL --json url -q '.url')"; \
	fi; \
	if [ -n "$(DRY_RUN)" ]; then \
		git checkout CHANGELOG.md 2>/dev/null || true; \
		rm -f RELEASE_NOTES.md; \
	fi; \
	rm -f $(RELEASE_VERSION_FILE)

.PHONY: release-undo
release-undo: ## Undo the last release: delete GH release, tags, floating branches, reset commit
	$(call check_tool,$(GH),gh,Install: brew install gh)
	@gh auth switch -h github.com -u $(GITHUB_USER)
	@LATEST_TAG=$$(git describe --tags --abbrev=0 2>/dev/null || echo ""); \
	if [ -z "$$LATEST_TAG" ]; then \
		echo "Error: No tags found. Nothing to undo."; \
		exit 1; \
	fi; \
	CURRENT=$$(git branch --show-current); \
	if [ "$$CURRENT" != "main" ]; then \
		echo "Error: Must be on main branch (currently on $$CURRENT)"; \
		exit 1; \
	fi; \
	FULL="$$LATEST_TAG"; \
	RAW=$$(echo "$$FULL" | sed 's/^v//'); \
	MAJOR="v$$(echo "$$RAW" | cut -d. -f1)"; \
	MINOR="v$$(echo "$$RAW" | cut -d. -f1).$$(echo "$$RAW" | cut -d. -f2)"; \
	echo ""; \
	if [ -n "$(DRY_RUN)" ]; then \
		echo "DRY RUN: Preview of undoing release $$FULL:"; \
	else \
		echo "WARNING: This will undo release $$FULL:"; \
	fi; \
	echo "  - Delete GitHub release $$FULL"; \
	echo "  - Delete tags: $$FULL, $$MINOR, $$MAJOR (local + remote)"; \
	echo "  - Delete floating branches: $$MAJOR, $$MINOR (remote)"; \
	echo "  - Reset HEAD to previous commit and force-push main"; \
	echo ""; \
	if [ -z "$(DRY_RUN)" ]; then \
		read -p "Continue? [y/N] " CONFIRM; \
		if [ "$$CONFIRM" != "y" ] && [ "$$CONFIRM" != "Y" ]; then \
			echo "Aborted."; \
			exit 1; \
		fi; \
	fi; \
	echo ""; \
	echo "── Deleting GitHub release $$FULL"; \
	if [ -n "$(DRY_RUN)" ]; then \
		echo "  [dry-run] gh release delete --yes $$FULL"; \
	else \
		gh release delete --yes "$$FULL" 2>/dev/null && echo "  Deleted" || echo "  Not found (skipped)"; \
	fi; \
	echo "── Deleting tags"; \
	for TAG in $$FULL $$MINOR $$MAJOR; do \
		echo "  $$TAG:"; \
		if [ -n "$(DRY_RUN)" ]; then \
			echo "    [dry-run] git push origin --delete $$TAG"; \
			echo "    [dry-run] git tag -d $$TAG"; \
		else \
			git push origin --delete "$$TAG" 2>/dev/null && echo "    remote deleted" || echo "    remote not found"; \
			git tag -d "$$TAG" 2>/dev/null && echo "    local deleted" || echo "    local not found"; \
		fi; \
	done; \
	echo "── Deleting floating branches"; \
	for BRANCH in $$MAJOR $$MINOR; do \
		if [ -n "$(DRY_RUN)" ]; then \
			echo "  [dry-run] git push origin --delete $$BRANCH"; \
		else \
			git push origin --delete "$$BRANCH" 2>/dev/null && echo "  $$BRANCH deleted" || echo "  $$BRANCH not found"; \
		fi; \
	done; \
	echo "── Resetting release commit"; \
	LAST_MSG=$$(git log -1 --pretty=%s); \
	if echo "$$LAST_MSG" | grep -q 'chore(release):.*\[skip ci\]'; then \
		if [ -n "$(DRY_RUN)" ]; then \
			echo "  [dry-run] git reset --hard HEAD~1 (removing: $$LAST_MSG)"; \
			echo "  [dry-run] git push --force"; \
		else \
			echo "  Removing: $$LAST_MSG"; \
			git reset --hard HEAD~1; \
			git push --force; \
			echo "  Reset and force-pushed"; \
		fi; \
	else \
		echo "  Last commit doesn't appear to be a release commit:"; \
		echo "    $$LAST_MSG"; \
		echo "  Skipping reset."; \
	fi; \
	if [ -z "$(DRY_RUN)" ]; then \
		rm -f RELEASE_NOTES.md $(RELEASE_VERSION_FILE); \
	fi; \
	echo ""; \
	if [ -n "$(DRY_RUN)" ]; then \
		echo "Release $$FULL would be undone."; \
	else \
		echo "Release $$FULL undone. Run 'make release' to redo."; \
	fi

.PHONY: release-force
release-force: release-undo release ## Undo last release and redo it (destructive!)

# ─── E2E ─────────────────────────────────────────────────────────────────────────
ACT := $(shell command -v act 2>/dev/null)
# Auto-detect Docker socket from active context (supports Colima, Docker Desktop, etc.)
DOCKER_HOST ?= $(shell docker context inspect --format '{{.Endpoints.docker.Host}}' 2>/dev/null)
# Socket path inside the VM — act mounts this into containers
ACT_FLAGS := --container-daemon-socket /var/run/docker.sock

.PHONY: e2e
e2e: build ## Run all e2e tests locally with act
	$(call check_tool,$(ACT),act,Install: brew install act)
	DOCKER_HOST=$(DOCKER_HOST) act workflow_dispatch -W .github/workflows/tests/e2e-terraform.yml $(ACT_FLAGS)
	DOCKER_HOST=$(DOCKER_HOST) act workflow_dispatch -W .github/workflows/tests/e2e-terragrunt.yml $(ACT_FLAGS)

.PHONY: e2e-terraform
e2e-terraform: build ## Run Terraform e2e tests locally with act
	$(call check_tool,$(ACT),act,Install: brew install act)
	DOCKER_HOST=$(DOCKER_HOST) act workflow_dispatch -W .github/workflows/tests/e2e-terraform.yml $(ACT_FLAGS)

.PHONY: e2e-terragrunt
e2e-terragrunt: build ## Run Terragrunt e2e tests locally with act
	$(call check_tool,$(ACT),act,Install: brew install act)
	DOCKER_HOST=$(DOCKER_HOST) act workflow_dispatch -W .github/workflows/tests/e2e-terragrunt.yml $(ACT_FLAGS)

# ─── Cleanup ────────────────────────────────────────────────────────────────────
.PHONY: clean
clean: ## Remove dist/
	pnpm run clean

.PHONY: clean-all
clean-all: ## Remove dist/, coverage/, node_modules/
	pnpm run clean-all
	rm -f $(RELEASE_VERSION_FILE)

# ─── Help ───────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
