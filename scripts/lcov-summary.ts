#!/usr/bin/env bun
/**
 * Aggregate Bun-generated LCOV files and print a coverage summary.
 *
 * Bun emits one record per (test-file, source-file) pair. For each source
 * file, we compute the UNION of executed lines across every record —
 * a line is "hit" if any test session reports it executed at least once.
 * Functions are unioned the same way (by function name, hit if any session
 * reports hits > 0). This matches Codecov / Istanbul / c8 semantics.
 *
 * Earlier versions of this script picked the "best" record per file by
 * LH/LF ratio, which over-counted coverage (~100% locally vs Codecov's
 * 90%). Fixed 2026-05-24 to compute proper union.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LCOV = resolve(process.cwd(), process.argv[2] ?? 'coverage/lcov.info');

interface RawRecord {
  /** line number → hit count for this single record */
  lines: Map<number, number>;
  /** function name → hit count for this single record */
  fns: Map<string, number>;
  /** branch key (BLOCK_LINE,BLOCK_ID,BRANCH_ID) → taken count */
  brs: Map<string, number>;
}

function emptyRecord(): RawRecord {
  return { lines: new Map(), fns: new Map(), brs: new Map() };
}

function pct(hit: number, total: number): string {
  if (!total) return '100.0';
  return ((hit / total) * 100).toFixed(2);
}

async function main(): Promise<void> {
  if (!existsSync(LCOV)) {
    console.error(`LCOV file not found: ${LCOV}`);
    process.exit(1);
  }
  const data = await readFile(LCOV, 'utf8');

  const allRecords = new Map<string, RawRecord[]>();
  let curFile: string | null = null;
  let cur = emptyRecord();
  for (const line of data.split('\n')) {
    if (line.startsWith('SF:')) {
      curFile = line.slice(3);
      cur = emptyRecord();
    } else if (!curFile) {
      continue;
    } else if (line === 'end_of_record') {
      let arr = allRecords.get(curFile);
      if (!arr) {
        arr = [];
        allRecords.set(curFile, arr);
      }
      arr.push(cur);
      curFile = null;
    } else if (line.startsWith('DA:')) {
      const parts = line.slice(3).split(',');
      const ln = Number(parts[0]);
      const hits = Number(parts[1]);
      if (Number.isFinite(ln) && Number.isFinite(hits)) {
        const prev = cur.lines.get(ln) ?? 0;
        // For multi-instrumentation records on the same line, take the max
        cur.lines.set(ln, Math.max(prev, hits));
      }
    } else if (line.startsWith('FNDA:')) {
      // FNDA:<hit-count>,<function-name>
      const parts = line.slice(5).split(',');
      const hits = Number(parts[0]);
      const name = parts.slice(1).join(',');
      if (name && Number.isFinite(hits)) {
        const prev = cur.fns.get(name) ?? 0;
        cur.fns.set(name, Math.max(prev, hits));
      }
    } else if (line.startsWith('FN:')) {
      // FN:<line>,<name> — declares a function; track with 0 hits if not seen
      const parts = line.slice(3).split(',');
      const name = parts.slice(1).join(',');
      if (name && !cur.fns.has(name)) cur.fns.set(name, 0);
    } else if (line.startsWith('BRDA:')) {
      // BRDA:<line>,<block>,<branch>,<taken|->
      const parts = line.slice(5).split(',');
      if (parts.length >= 4) {
        const key = `${parts[0]},${parts[1]},${parts[2]}`;
        const takenStr = parts[3];
        const taken = takenStr === '-' ? 0 : Number(takenStr);
        if (Number.isFinite(taken)) {
          const prev = cur.brs.get(key) ?? 0;
          cur.brs.set(key, Math.max(prev, taken));
        }
      }
    }
  }

  const excluded = (p: string): boolean =>
    /\/index\.ts$/.test(p) ||
    /\/__mocks__\//.test(p) ||
    /\/examples\//.test(p) ||
    /\.test\.ts$/.test(p) ||
    /\.spec\.ts$/.test(p) ||
    /\/test-preload\.ts$/.test(p) ||
    /\/interfaces\//.test(p) ||
    /^src\/agents\//.test(p);

  let LF = 0,
    LH = 0,
    FNF = 0,
    FNH = 0,
    BRF = 0,
    BRH = 0;
  const perFile: Array<{
    file: string;
    lh: number;
    lf: number;
    fnh: number;
    fnf: number;
    brh: number;
    brf: number;
  }> = [];

  for (const [file, records] of allRecords) {
    if (excluded(file)) continue;

    // Union across all records for this file.
    const unionLines = new Map<number, number>();
    const unionFns = new Map<string, number>();
    const unionBrs = new Map<string, number>();
    for (const r of records) {
      for (const [ln, h] of r.lines) {
        unionLines.set(ln, Math.max(unionLines.get(ln) ?? 0, h));
      }
      for (const [n, h] of r.fns) {
        unionFns.set(n, Math.max(unionFns.get(n) ?? 0, h));
      }
      for (const [k, t] of r.brs) {
        unionBrs.set(k, Math.max(unionBrs.get(k) ?? 0, t));
      }
    }

    const lf = unionLines.size;
    const lh = [...unionLines.values()].filter(h => h > 0).length;
    const fnf = unionFns.size;
    const fnh = [...unionFns.values()].filter(h => h > 0).length;
    const brf = unionBrs.size;
    const brh = [...unionBrs.values()].filter(t => t > 0).length;

    LF += lf;
    LH += lh;
    FNF += fnf;
    FNH += fnh;
    BRF += brf;
    BRH += brh;
    perFile.push({ file, lh, lf, fnh, fnf, brh, brf });
  }

  console.log('Coverage Summary (union across sessions, post-exclusions)');
  console.log('────────────────────────────────────────────────────────');
  console.log(`Lines:     ${LH}/${LF} (${pct(LH, LF)}%)`);
  console.log(`Functions: ${FNH}/${FNF} (${pct(FNH, FNF)}%)`);
  console.log(`Branches:  ${BRH}/${BRF} (${pct(BRH, BRF)}%)`);

  const below100 = perFile.filter(f => f.lf && f.lh < f.lf);
  if (below100.length) {
    below100.sort((a, b) => a.lh / a.lf - b.lh / b.lf);
    console.log(`\nFiles below 100% line coverage (${below100.length}):`);
    for (const f of below100) {
      console.log(`  ${f.file}`);
      console.log(
        `    lines=${f.lh}/${f.lf} (${pct(f.lh, f.lf)}%)  fns=${f.fnh}/${f.fnf}  brs=${f.brh}/${f.brf}`,
      );
    }
  } else {
    console.log('\nAll files at 100% line coverage.');
  }
}

await main();
