#!/usr/bin/env bun
/**
 * Print uncovered line numbers for a given source file from coverage/lcov.info.
 * Useful for targeting test writing precisely.
 *
 * Usage:
 *   bun scripts/uncovered-lines.ts src/libs/utils/parsers.ts
 *   bun scripts/uncovered-lines.ts                          # list all files with uncovered lines
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LCOV = resolve(process.cwd(), 'coverage/lcov.info');
const target = process.argv[2];

if (!existsSync(LCOV)) {
  console.error(`LCOV not found: ${LCOV}`);
  process.exit(1);
}
const data = await readFile(LCOV, 'utf8');

const records = new Map<string, { lines: Map<number, number> }[]>();
let curFile: string | null = null;
let cur: { lines: Map<number, number> } = { lines: new Map() };
for (const line of data.split('\n')) {
  if (line.startsWith('SF:')) {
    curFile = line.slice(3);
    cur = { lines: new Map() };
  } else if (!curFile) {
    continue;
  } else if (line === 'end_of_record') {
    const arr = records.get(curFile) ?? [];
    arr.push(cur);
    records.set(curFile, arr);
    curFile = null;
  } else if (line.startsWith('DA:')) {
    const parts = line.slice(3).split(',').map(Number);
    const ln = parts[0];
    const hits = parts[1];
    if (Number.isFinite(ln) && Number.isFinite(hits)) {
      cur.lines.set(ln!, Math.max(cur.lines.get(ln!) ?? 0, hits!));
    }
  }
}

function unionUncovered(file: string): { missing: number[]; total: number } {
  const recs = records.get(file)!;
  const u = new Map<number, number>();
  for (const r of recs) for (const [l, h] of r.lines) u.set(l, Math.max(u.get(l) ?? 0, h));
  const missing = [...u.entries()]
    .filter(([, h]) => h === 0)
    .map(([l]) => l)
    .sort((a, b) => a - b);
  return { missing, total: u.size };
}

if (target) {
  if (!records.has(target)) {
    console.error(`No coverage records for: ${target}`);
    process.exit(1);
  }
  const { missing, total } = unionUncovered(target);
  console.log(`${target}`);
  console.log(`Uncovered: ${missing.length}/${total} lines`);
  console.log(`Lines: ${missing.join(',')}`);
} else {
  const excluded = (p: string): boolean =>
    /\/index\.ts$/.test(p) ||
    /\/__mocks__\//.test(p) ||
    /\/examples\//.test(p) ||
    /\.test\.ts$/.test(p) ||
    /\/test-preload\.ts$/.test(p) ||
    /\/interfaces\//.test(p) ||
    /^src\/agents\//.test(p);
  const rows: Array<{ file: string; missing: number[]; total: number }> = [];
  for (const file of records.keys()) {
    if (excluded(file)) continue;
    const r = unionUncovered(file);
    if (r.missing.length > 0) rows.push({ file, ...r });
  }
  rows.sort((a, b) => b.missing.length - a.missing.length);
  for (const r of rows) {
    console.log(`${r.missing.length.toString().padStart(4)}  ${r.file}`);
  }
}
