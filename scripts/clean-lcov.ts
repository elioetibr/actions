#!/usr/bin/env bun
/**
 * Post-process Bun-generated LCOV to drop DA entries that point to
 * non-executable source lines. Bun's V8 coverage instrumentation
 * emits `DA:N,0` for source positions that don't correspond to
 * runnable statements — blank lines between statements, comment lines,
 * and lines that contain only structural punctuation (closing braces).
 * Those are not reachable by any test and otherwise show as permanent
 * uncovered lines on Codecov / lcov reports.
 *
 * Lines we treat as non-executable:
 *   - whitespace-only
 *   - single-line // comments (after trimming)
 *   - lines starting with `*` (inside a JSDoc block) or `*` followed by `/`
 *   - whole-line `/* ... *\/`
 *   - structural-only lines: `{`, `}`, `};`, `},`, `})`, `});`, `}),`,
 *     `]`, `];`, `],`, `])`, `]);`, `]),`, `)`, `);`, `),`
 *
 * Also adjusts LH (lines hit) and LF (lines found) counts in each
 * `end_of_record` block so the file-level totals stay consistent.
 *
 * Usage:
 *   bun scripts/clean-lcov.ts                     # rewrite coverage/lcov.info in place
 *   bun scripts/clean-lcov.ts in.lcov out.lcov    # explicit paths
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
const input = resolve(cwd, process.argv[2] ?? 'coverage/lcov.info');
const output = resolve(cwd, process.argv[3] ?? input);

if (!existsSync(input)) {
  console.error(`LCOV not found: ${input}`);
  process.exit(1);
}

const raw = await readFile(input, 'utf8');
const lines = raw.split('\n');

const sourceCache = new Map<string, string[]>();
async function srcFor(file: string): Promise<string[] | null> {
  if (sourceCache.has(file)) return sourceCache.get(file)!;
  const abs = resolve(cwd, file);
  if (!existsSync(abs)) {
    sourceCache.set(file, []);
    return null;
  }
  const arr = (await readFile(abs, 'utf8')).split('\n');
  sourceCache.set(file, arr);
  return arr;
}

let curFile: string | null = null;
let curSrc: string[] | null = null;
let recordBuf: string[] = [];
let droppedDA = 0;
let totalDA = 0;
const out: string[] = [];

function flushRecord(): void {
  // Recompute LF / LH from surviving DA entries.
  let lf = 0;
  let lh = 0;
  for (const ln of recordBuf) {
    if (ln.startsWith('DA:')) {
      const parts = ln.slice(3).split(',').map(Number);
      if (Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
        lf++;
        if (parts[1]! > 0) lh++;
      }
    }
  }
  for (const ln of recordBuf) {
    if (ln.startsWith('LF:')) out.push(`LF:${lf}`);
    else if (ln.startsWith('LH:')) out.push(`LH:${lh}`);
    else out.push(ln);
  }
}

/**
 * Returns true when the given source line has no executable content.
 */
function isNonExecutable(srcLine: string): boolean {
  const trimmed = srcLine.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('//')) return true;
  // JSDoc / block-comment continuation: lines like ` * foo` or ` */`
  if (/^\*(\s|\/|$)/.test(trimmed)) return true;
  // Whole-line block comment: `/* ... */`
  if (/^\/\*.*\*\/$/.test(trimmed)) return true;
  // Opening of a block comment with no code on the line: `/**` or `/*` ...
  if (/^\/\*/.test(trimmed)) return true;
  // Structural-only punctuation lines.
  if (/^[)\]}](?:[)\]};,]?\s*)*$/.test(trimmed)) return true;
  if (trimmed === '{') return true;
  // TypeScript: switch `default:` labels (effectively unreachable when followed
  // by assertNever, throw, etc.; the label itself is not an executable statement).
  if (/^default:\s*$/.test(trimmed)) return true;
  // TypeScript: abstract method/property declarations have no body — type-only.
  if (/^(public\s+|private\s+|protected\s+|readonly\s+)*abstract\s+\w/.test(trimmed)) return true;
  // TypeScript: inline optional property declarations inside type/interface blocks.
  // Matches `name?: type;` (the `?` after the name guarantees it's a type position).
  if (/^[a-zA-Z_$][\w$]*\?:\s+\S.*[;,]?\s*$/.test(trimmed)) return true;
  // TypeScript: continuation of a generic return-type / Promise<...> on its own line.
  // Examples: `Array<{ ... }>`, `>`,  `> {`.
  if (
    /^(Array|Record|Promise|Map|Set|Awaited|ReturnType|Partial|Required|Readonly|Pick|Omit|Exclude|Extract)</.test(
      trimmed,
    )
  )
    return true;
  if (/^>\s*\{?\s*$/.test(trimmed)) return true;
  return false;
}

for (const line of lines) {
  if (line.startsWith('SF:')) {
    curFile = line.slice(3);
    curSrc = await srcFor(curFile);
    recordBuf = [line];
  } else if (line === 'end_of_record') {
    recordBuf.push(line);
    flushRecord();
    curFile = null;
    curSrc = null;
    recordBuf = [];
  } else if (line.startsWith('DA:')) {
    totalDA++;
    const parts = line.slice(3).split(',').map(Number);
    const n = parts[0];
    const h = parts[1];
    if (
      curSrc &&
      Number.isFinite(n) &&
      Number.isFinite(h) &&
      h === 0 &&
      n! >= 1 &&
      n! <= curSrc.length &&
      isNonExecutable(curSrc[n! - 1] ?? '')
    ) {
      // Drop this DA — it points to a non-executable source line.
      droppedDA++;
    } else {
      recordBuf.push(line);
    }
  } else if (curFile !== null) {
    recordBuf.push(line);
  } else {
    out.push(line);
  }
}

await writeFile(output, out.join('\n'));
console.log(`clean-lcov: dropped ${droppedDA}/${totalDA} blank-line DA entries`);
console.log(`wrote ${output}`);
