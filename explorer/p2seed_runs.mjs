/**
 * P2 seeding check: maximal runs of the centre column against their start time.
 *
 * Talus's C1 (docs/attacks/2026-09-10-prize-2-s-residual-...) says a maximal
 * BLACK run beginning at time a >= 1 has length at most a, because while the
 * centre stays black the cells to its left are forced to alternate, and the
 * cone's two leftmost cells are both black. This script re-measures that
 * independently, measures the same ratio for WHITE runs (where the bound is
 * only sketched), and computes the counting consequence: how many cells of
 * each colour appear below 2^n.
 *
 * Empirical only. See explorer/README.md.
 */

import { centerColumnBits } from './rule30.mjs';

const N = Number(process.argv[2] ?? 2_000_000);

const bits = centerColumnBits(N);

// Maximal runs. A run is maximal when it is bounded by the opposite colour on
// both sides; the final partial run is dropped because its length is truncated.
const runs = [];
let start = 0;
for (let i = 1; i <= N; i++) {
  if (i === N || bits[i] !== bits[start]) {
    if (i < N) runs.push({ a: start, colour: bits[start], len: i - start });
    start = i;
  }
}

let worstBlack = null;
let worstWhite = null;
let blackViolations = 0;
let whiteViolations1 = 0;
let whiteViolations2 = 0;
let longest = { black: 0, white: 0 };

for (const r of runs) {
  if (r.len > longest[r.colour ? 'black' : 'white']) {
    longest[r.colour ? 'black' : 'white'] = r.len;
  }
  if (r.a < 1) continue;
  const ratio = r.len / r.a;
  if (r.colour === 1) {
    if (r.len > r.a) blackViolations++;
    if (!worstBlack || ratio > worstBlack.ratio) worstBlack = { ...r, ratio };
  } else {
    if (r.len > r.a) whiteViolations1++;
    if (r.len > 2 * r.a) whiteViolations2++;
    if (!worstWhite || ratio > worstWhite.ratio) worstWhite = { ...r, ratio };
  }
}

console.log(`centre column to N = ${N}, ${runs.length} maximal runs`);
console.log(`longest black run ${longest.black}, longest white run ${longest.white}`);
console.log('');
console.log(`BLACK  len <= a   violations (a>=1): ${blackViolations}`);
console.log(`  worst ratio ${worstBlack.ratio.toFixed(6)} at a=${worstBlack.a} len=${worstBlack.len}`);
console.log(`WHITE  len <= a   violations (a>=1): ${whiteViolations1}`);
console.log(`WHITE  len <= 2a  violations (a>=1): ${whiteViolations2}`);
console.log(`  worst ratio ${worstWhite.ratio.toFixed(6)} at a=${worstWhite.a} len=${worstWhite.len}`);
console.log('');

// The a = 0 run, which the bound must exclude.
const first = runs[0];
console.log(`first run: a=${first.a} colour=${first.colour} len=${first.len}`);

// Counting consequence: cells of each colour below 2^n.
console.log('');
console.log('   n      2^n    black<2^n   white<2^n');
let black = 0;
let white = 0;
let next = 1;
let n = 0;
for (let i = 0; i < N; i++) {
  while (i === next && n <= 21) {
    console.log(
      `${String(n).padStart(4)} ${String(next).padStart(8)} ${String(black).padStart(12)} ${String(white).padStart(11)}`,
    );
    next *= 2;
    n++;
  }
  if (bits[i]) black++;
  else white++;
}
