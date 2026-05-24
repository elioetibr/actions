#!/usr/bin/env bun
/**
 * Per-file isolated bun test runner.
 *
 * Why: Bun's `mock.module()` registers into a process-global registry with
 * no per-file teardown hook in 1.3.x. Suites that share a process leak
 * mocks across files (e.g. the Builder tests mock the Service, and that
 * mock persists into the Service's own test file). Running each test file
 * in its own bun process guarantees isolation at the cost of N startup
 * overheads (~10–50ms per file).
 *
 * Modes:
 *   bun scripts/test-isolated.ts                # plain run
 *   bun scripts/test-isolated.ts --coverage     # per-file coverage, merged LCOV
 *   bun scripts/test-isolated.ts --watch        # not supported (just runs once)
 *
 * Coverage merge: each per-file invocation writes `coverage/lcov.info` for
 * itself; we append into `coverage/lcov.combined.info`, then move that to
 * `coverage/lcov.info` at the end so downstream consumers see one file.
 */
import { Glob } from 'bun';
import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const COVERAGE_DIR = join(ROOT, 'coverage');
const COMBINED_LCOV = join(COVERAGE_DIR, 'lcov.info');

const args = process.argv.slice(2);
const withCoverage = args.includes('--coverage');

interface FileResult {
  file: string;
  exitCode: number;
  durationMs: number;
}

async function findTestFiles(): Promise<string[]> {
  const glob = new Glob('src/**/*.test.ts');
  const files: string[] = [];
  for await (const f of glob.scan({ cwd: ROOT, absolute: false })) {
    files.push(f);
  }
  files.sort();
  return files;
}

function runFile(file: string, coverageDir: string | null): Promise<FileResult> {
  return new Promise(resolvePromise => {
    const cmd = ['test', file];
    if (coverageDir) {
      cmd.push('--coverage', '--coverage-reporter=lcov', `--coverage-dir=${coverageDir}`);
    }
    const start = performance.now();
    const child = spawn('bun', cmd, {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', code => {
      resolvePromise({
        file,
        exitCode: code ?? 1,
        durationMs: performance.now() - start,
      });
    });
  });
}

async function appendLcov(perFileLcov: string, combined: string): Promise<void> {
  if (!existsSync(perFileLcov)) return;
  const data = await readFile(perFileLcov, 'utf8');
  await writeFile(combined, data, { flag: 'a' });
}

async function main(): Promise<void> {
  if (withCoverage) {
    await rm(COVERAGE_DIR, { recursive: true, force: true });
    await mkdir(COVERAGE_DIR, { recursive: true });
    await writeFile(COMBINED_LCOV, '');
  }

  const files = await findTestFiles();
  console.log(
    `Running ${files.length} test files in isolation${withCoverage ? ' (with coverage)' : ''}`,
  );

  const results: FileResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const tag = `[${i + 1}/${files.length}]`;
    console.log(`\n${tag} ${file}`);
    const coverageDir = withCoverage ? join(COVERAGE_DIR, `f${i}`) : null;
    if (coverageDir) await mkdir(coverageDir, { recursive: true });
    const result = await runFile(file, coverageDir);
    results.push(result);
    if (coverageDir) {
      await appendLcov(join(coverageDir, 'lcov.info'), COMBINED_LCOV);
      await rm(coverageDir, { recursive: true, force: true });
    }
  }

  const failed = results.filter(r => r.exitCode !== 0);
  const totalMs = results.reduce((s, r) => s + r.durationMs, 0);
  console.log(
    `\n──────────────────────────────────────────────────────────────────────\n` +
      `Files: ${results.length}  Passed: ${results.length - failed.length}  Failed: ${failed.length}  Wall: ${(totalMs / 1000).toFixed(1)}s`,
  );
  if (failed.length) {
    console.log('\nFailed files:');
    for (const f of failed) console.log(`  - ${f.file} (exit ${f.exitCode})`);
    process.exit(1);
  }
}

await main();
