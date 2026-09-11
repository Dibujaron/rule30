/**
 * P2 seeding check: the mechanism behind the white-run bound.
 *
 * Inside a maximal white run of the centre column [a, a+L], column -1 is
 * monotone (white_run_forbidden, closed on the board). Let t0 be the first
 * row of the run where column -1 is black (or a+L+1 if there is none). The
 * claim being checked, case by case:
 *
 *   (A) on [a, t0) the centre and column -1 are both white, which forces an
 *       all-white triangle: evolve a (-j) = false for j <= t0 - a;
 *   (B) from t0 on, column -1 is black, which forces the checkerboard with
 *       the opposite phase to a black run's: evolve t0 (-j) = (j odd).
 *
 * Each is stopped by the cone's two black leftmost cells, giving t0 < 2a in
 * case A and L < 3a overall.
 *
 * Empirical only. See explorer/README.md.
 */

import { rows } from './rule30.mjs';

const N = 30000;
const CENTER = N + 2;

// Full rows, as bit arrays indexed by offset from the centre.
const cell = [];
{
  let t = 0;
  for (const row of rows(N)) {
    cell.push(row);
    t++;
  }
}

const at = (t, x) => Number((cell[t] >> BigInt(CENTER + x)) & 1n);

// Maximal white runs of the centre column.
const runs = [];
{
  let start = null;
  for (let t = 0; t < N; t++) {
    const c = at(t, 0);
    if (c === 0 && start === null) start = t;
    if (c === 1 && start !== null) {
      runs.push({ a: start, L: t - start - 1 });
      start = null;
    }
  }
}

let failA = 0;
let failB = 0;
let failT0 = 0;
let fail3a = 0;
let worstT0 = 0;
let worst3a = 0;

for (const { a, L } of runs) {
  if (a < 1) continue;
  const end = a + L;
  let t0 = end + 1;
  for (let t = a; t <= end; t++) {
    if (at(t, -1) === 1) { t0 = t; break; }
  }

  // Case A: the all-white triangle at row a, to depth min(t0 - a, a).
  const depthA = Math.min(t0 - a, a);
  for (let j = 0; j <= depthA; j++) {
    if (j === a) { if (at(a, -j) !== 1) failA++; continue; } // cone edge, black
    if (at(a, -j) !== 0) failA++;
  }
  if (t0 <= end && t0 >= 2 * a) failT0++;
  worstT0 = Math.max(worstT0, t0 <= end ? t0 / a : 0);

  // Case B: the opposite-phase checkerboard at row t0, to depth end - t0 - 1.
  if (t0 <= end) {
    const depthB = Math.min(end - t0 - 1, t0 - 1);
    for (let j = 0; j <= depthB; j++) {
      if (at(t0, -j) !== (j % 2)) failB++;
    }
  }

  if (L >= 3 * a) fail3a++;
  worst3a = Math.max(worst3a, L / a);
}

console.log(`rows ${N}, maximal white runs with a >= 1: ${runs.length - 1}`);
console.log(`(A) all-white triangle at row a, to depth min(t0-a, a): ${failA} failures`);
console.log(`(B) opposite-phase checkerboard at row t0: ${failB} failures`);
console.log(`t0 < 2a: ${failT0} violations, worst t0/a = ${worstT0.toFixed(4)}`);
console.log(`L < 3a:  ${fail3a} violations, worst L/a  = ${worst3a.toFixed(4)}`);
