/**
 * Search the diagonals of the Rule 30 light cone for periodicity.
 *
 *   node explorer/diagonalscan.mjs [N] [options]
 *
 * Options:
 *   --depth=K      how many diagonals in from each edge (default 24)
 *   --side=both    left | right | both (default both)
 *   --terms=T      how many leading terms to print per diagonal (default 12)
 *
 * ## What a diagonal is
 *
 * The pattern grows by one cell in each direction per step, so the cell at
 * position -t after t steps is the leftmost cell that exists at all: the left
 * edge. The k-th diagonal in from that edge is the sequence
 *
 *     d_k(j) = evolve (j + k) (-j)     for j = 0, 1, 2, ...
 *
 * which is exactly the shape of the statements already proved in
 * `Rule30/Statements.lean`: `evolve_left_edge` is k=0, `evolve_left_second_
 * diagonal` is k=1, `evolve_left_third_diagonal` is k=2. The right-hand
 * family is the mirror index, r_k(j) = evolve (j + k) (+j), and is NOT the
 * mirror sequence — Rule 30 is asymmetric, which is the entire reason the
 * center column is interesting.
 *
 * ## What this can and cannot conclude
 *
 * The same limit that governs `periodscan.mjs` governs this file: a period
 * that holds over a computed prefix is a candidate, never a proof, and the
 * pattern is free to break at the first term we did not compute.
 *
 * There is one difference, and it is the reason this script is worth having.
 * `periodscan.mjs` searches the center column, where a candidate period would
 * contradict a conjecture nobody can prove and so is almost certainly an
 * artefact. Here a candidate period sits in a region where periodicity is
 * already proved for k=0,1,2 by ordinary induction on the light cone. So a
 * candidate here is a *statement worth seeding into the DAG* — the finite
 * evidence says what to write down, and the Lean proof, if it lands, is what
 * makes it true. This script chooses the conjecture; it never establishes one.
 *
 * ## Self-check
 *
 * Before reporting anything, the scan reproduces the three diagonals that are
 * already proved in Lean: k=0 all black, k=1 all black, k=2 all white. If the
 * extraction disagrees with a theorem, the extraction is wrong, and every
 * number below it would be wrong in the same way. It exits non-zero rather
 * than print a conjecture built on a broken coordinate convention.
 */

import { centerBitIndex, rows } from './rule30.mjs';

/** Read the cell at `offset` from the center of one row. */
function cellAt(row, generations, offset) {
  return Number((row >> BigInt(centerBitIndex(generations) + offset)) & 1n);
}

/**
 * Extract the diagonals in from one edge.
 *
 * @param {number} generations
 * @param {number} depth how many diagonals, k = 0 .. depth-1
 * @param {1|-1} dir -1 for the left edge, +1 for the right
 * @returns {Uint8Array[]} index k holds d_k, length generations - k
 */
function diagonals(generations, depth, dir) {
  const out = [];
  for (let k = 0; k < depth; k++) out.push(new Uint8Array(generations - k));
  let t = 0;
  for (const row of rows(generations)) {
    // At time t, diagonal k is at position dir * (t - k), for t >= k.
    for (let k = 0; k < depth && k <= t; k++) {
      out[k][t - k] = cellAt(row, generations, dir * (t - k));
    }
    t++;
  }
  return out;
}

/**
 * The smallest period that holds over a long enough tail of `a`.
 *
 * For each candidate p, the last index where a[i] !== a[i-p] fixes the onset:
 * everything after it is p-periodic. A period is only reported when its
 * periodic tail is both long in absolute terms and long relative to p, so
 * that a short run of coincidence at the end cannot pass for structure.
 *
 * @returns {{period: number, onset: number, tail: number} | null}
 */
function smallestPeriod(a, { maxPeriod, minCycles = 6, minTail = 24 }) {
  const L = a.length;
  for (let p = 1; p <= maxPeriod; p++) {
    let lastBreak = -1;
    for (let i = p; i < L; i++) if (a[i] !== a[i - p]) lastBreak = i;
    const onset = lastBreak < 0 ? 0 : lastBreak - p + 1;
    const tail = L - onset;
    if (tail >= minTail && tail >= minCycles * p) return { period: p, onset, tail };
  }
  return null;
}

const flag = (name, fallback) => {
  const hit = process.argv.slice(2).find((s) => s.startsWith(`--${name}=`));
  return hit === undefined ? fallback : hit.slice(name.length + 3);
};

const N = Number(process.argv.slice(2).find((s) => !s.startsWith('--')) ?? 4000);
const depth = Number(flag('depth', 24));
const side = flag('side', 'both');
const terms = Number(flag('terms', 12));

const left = diagonals(N, depth, -1);

// Self-check against the three theorems already closed in Rule30/Proofs/.
const proved = [
  ['evolve_left_edge', 0, 1],
  ['evolve_left_second_diagonal', 1, 1],
  ['evolve_left_third_diagonal', 2, 0],
];
for (const [name, k, expected] of proved) {
  const bad = left[k].findIndex((b) => b !== expected);
  if (bad !== -1) {
    console.error(
      `self-check FAILED: ${name} says diagonal k=${k} is constant ${expected}, ` +
        `but extraction gives ${left[k][bad]} at j=${bad}. The coordinate ` +
        `convention is wrong; no conjecture below would be trustworthy.`,
    );
    process.exit(1);
  }
}
console.log(`self-check ok: k=0,1,2 match the three proved theorems over ${N} generations\n`);

const show = (a) => Array.from(a.slice(0, terms)).join('');

for (const [label, dir, ds] of [
  ['LEFT', -1, left],
  ['RIGHT', 1, side === 'left' ? null : diagonals(N, depth, 1)],
]) {
  if (ds === null || (side === 'right' && label === 'LEFT')) continue;
  console.log(`${label} diagonals, N=${N}`);
  console.log('   k  period  onset  tail    first terms');
  for (let k = 0; k < depth; k++) {
    const a = ds[k];
    const found = smallestPeriod(a, { maxPeriod: Math.floor(a.length / 8) });
    const cell = found
      ? `${String(found.period).padStart(7)}${String(found.onset).padStart(7)}${String(found.tail).padStart(6)}`
      : `${'none'.padStart(7)}${'-'.padStart(7)}${'-'.padStart(6)}`;
    console.log(`  ${String(k).padStart(2)}${cell}    ${show(a)}`);
  }
  console.log('');
}
console.log('A period here is a candidate over a finite prefix, not a proof.');
