#!/usr/bin/env bun
/**
 * For every uncovered line across the LCOV, classify it as either a real
 * source line (code/comment) or a whitespace-only line. Whitespace-only
 * uncovered lines are V8 instrumentation artifacts that no test can hit.
 *
 * Output:
 *   counts of real vs blank uncovered lines
 *   list of files with any real uncovered lines
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const LCOV = 'coverage/lcov.info';
if (!existsSync(LCOV)) {
  console.error(`LCOV not found`);
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
    if (Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      cur.lines.set(parts[0]!, Math.max(cur.lines.get(parts[0]!) ?? 0, parts[1]!));
    }
  }
}

const excluded = (p: string): boolean =>
  /\/index\.ts$/.test(p) ||
  /\/__mocks__\//.test(p) ||
  /\/examples\//.test(p) ||
  /\.test\.ts$/.test(p) ||
  /\/test-preload\.ts$/.test(p) ||
  /\/interfaces\//.test(p) ||
  /^src\/agents\//.test(p);

let blankUncov = 0;
let realUncov = 0;
const filesWithReal: Array<{ file: string; real: number; blank: number }> = [];

for (const file of records.keys()) {
  if (excluded(file)) continue;
  const recs = records.get(file)!;
  const u = new Map<number, number>();
  for (const r of recs) for (const [l, h] of r.lines) u.set(l, Math.max(u.get(l) ?? 0, h));
  const uncov = [...u.entries()].filter(([, h]) => h === 0).map(([l]) => l);
  if (uncov.length === 0) continue;

  const src = (await readFile(file, 'utf8')).split('\n');
  let real = 0;
  let blank = 0;
  for (const n of uncov) {
    const ln = src[n - 1] ?? '';
    if (ln.trim() === '') blank++;
    else real++;
  }
  blankUncov += blank;
  realUncov += real;
  if (real > 0) filesWithReal.push({ file, real, blank });
}

console.log(`Real uncovered:    ${realUncov}`);
console.log(`Blank uncovered:   ${blankUncov}`);
console.log(`Files with REAL gaps (${filesWithReal.length}):`);
filesWithReal.sort((a, b) => b.real - a.real);
for (const f of filesWithReal) {
  console.log(
    `  ${f.real.toString().padStart(4)} real  ${f.blank.toString().padStart(3)} blank  ${f.file}`,
  );
}
