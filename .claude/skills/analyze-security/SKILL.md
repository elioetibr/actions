---
name: analyze-security
description: >
  Use when the user asks to "check security", "audit security", "find
  vulnerabilities", "security scan", "analyze dependencies", "check for CVEs",
  "OWASP check", or before deploying to production. Performs defense-in-depth
  security analysis across all layers.
---

# Security Analysis

Perform defense-in-depth security analysis across all application layers.

## Workflow

### 1. Supply Chain Scan

Start with the dependency layer:

- Run `pnpm audit` for known vulnerabilities
- Check lockfile integrity
- Identify unmaintained dependencies

### 2. Configuration Audit

Scan project configuration:

- Verify `.gitignore` covers sensitive files
- Check for secrets in git history
- Audit Dockerfile security posture
- Review Docker Compose for exposure risks
- Verify TypeScript strict mode enforcement

### 3. Application Security Scan

Use the `security-analyzer` agent for deep analysis:

- OWASP Top 10 vulnerability scan
- TypeScript-specific vulnerability patterns
- Input validation gaps
- Authentication/authorization weaknesses
- Data protection issues

### 4. Risk Report

Present an executive summary with:

- Overall risk level (CRITICAL/HIGH/MEDIUM/LOW)
- Findings organized by defense layer
- Remediation priority matrix (impact vs effort)
- Concrete fix for each vulnerability

## Quick Commands

- `/analyze-security` - Full security audit
- `/analyze-security --deps-only` - Dependency audit only
- `/analyze-security --docker` - Container security only
- `/analyze-security --owasp` - OWASP Top 10 focused scan
