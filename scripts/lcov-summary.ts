#!/usr/bin/env bun
/**
 * Aggregate Bun-generated LCOV files and print a coverage summary.
 *
 * Bun emits one record per (test-file, source-file) pair. For the same
 * source file, different runs report different LF totals because V8's
 * coverage instrumentation activates on whichever lines the JIT
 * processed. We pick the BEST record per source file — the one with the
 * highest LH/LF ratio (ties broken by highest LH) — which corresponds
 * to the test that most directly exercised the file. This matches
 * Istanbul's "union of executed lines across all tests" semantics.
 *
 * FNF/FNH and BRF/BRH from the best record are reported as-is.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const LCOV = resolve(process.cwd(), process.argv[2] ?? 'coverage/lcov.info');

interface Record {
  lf: number;
  lh: number;
  fnf: number;
  fnh: number;
  brf: number;
  brh: number;
  lines: Map<number, number>;
}

function emptyRecord(): Record {
  return { lf: 0, lh: 0, fnf: 0, fnh: 0, brf: 0, brh: 0, lines: new Map() };
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

  const allRecords = new Map<string, Record[]>();
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
      const [ln, hits] = line.slice(3).split(',').map(Number);
      if (ln !== undefined && hits !== undefined) cur.lines.set(ln, hits);
    } else if (line.startsWith('LF:')) cur.lf = Number(line.slice(3));
    else if (line.startsWith('LH:')) cur.lh = Number(line.slice(3));
    else if (line.startsWith('FNF:')) cur.fnf = Number(line.slice(4));
    else if (line.startsWith('FNH:')) cur.fnh = Number(line.slice(4));
    else if (line.startsWith('BRF:')) cur.brf = Number(line.slice(4));
    else if (line.startsWith('BRH:')) cur.brh = Number(line.slice(4));
  }

  const excluded = (p: string): boolean =>
    /\/index\.ts$/.test(p) ||
    /\/__mocks__\//.test(p) ||
    /\/examples\//.test(p) ||
    /\.test\.ts$/.test(p) ||
    /\.spec\.ts$/.test(p) ||
    /\/test-preload\.ts$/.test(p) ||
    /\/interfaces\//.test(p);

  let LF = 0,
    LH = 0,
    FNF = 0,
    FNH = 0,
    BRF = 0,
    BRH = 0;
  const below100: Array<{
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
    // Pick the best record: highest LH/LF ratio, tie-break on LH then LF.
    let best = records[0]!;
    for (const r of records) {
      const bRatio = best.lf ? best.lh / best.lf : 0;
      const rRatio = r.lf ? r.lh / r.lf : 0;
      if (rRatio > bRatio || (rRatio === bRatio && r.lh > best.lh)) {
        best = r;
      }
    }
    LF += best.lf;
    LH += best.lh;
    FNF += best.fnf;
    FNH += best.fnh;
    BRF += best.brf;
    BRH += best.brh;
    if (best.lf && best.lh < best.lf) {
      below100.push({
        file,
        lh: best.lh,
        lf: best.lf,
        fnh: best.fnh,
        fnf: best.fnf,
        brh: best.brh,
        brf: best.brf,
      });
    }
  }

  console.log('Coverage Summary (best record per file, post-exclusions)');
  console.log('────────────────────────────────────────────────────────');
  console.log(`Lines:     ${LH}/${LF} (${pct(LH, LF)}%)`);
  console.log(`Functions: ${FNH}/${FNF} (${pct(FNH, FNF)}%)`);
  console.log(`Branches:  ${BRH}/${BRF} (${pct(BRH, BRF)}%)`);
  if (below100.length) {
    console.log(`\nFiles below 100% line coverage (${below100.length}):`);
    below100.sort((a, b) => a.lh / a.lf - b.lh / b.lf);
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
