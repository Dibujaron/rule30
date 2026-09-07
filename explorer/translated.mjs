/**
 * Where a configuration's picture is the seed's, and where it is the seed's
 * translated along the left edge.
 *
 *   node explorer/translated.mjs
 *
 * branch53208.mjs found the picture of "cells 0..2999 black" near the seam
 * of diagonal 53207 equal to the seed's picture translated by (t, x) ->
 * (t + 1, x - 1), and a random right half equal to the seed's translated by
 * (2, -2). For each such X this script grows X and the seed side by side and,
 * at sampled rows t, reports for each candidate translation N in -3..3 the
 * rightmost x such that X(t, x') = P(t - N, x' + N) for all x' <= x inside the
 * cone (P the seed's picture), as a fraction of t. N = 0 is the ordinary damage
 * front. The question is whether X = tau_N P holds on a region that reaches
 * further right than X = P does, and how the two fronts move.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { step } from './rule30.mjs';

const T = 72000;
const SAMPLES = [2000, 5000, 10000, 20000, 30000, 40000, 50000, 60000, 71000];
const NS = [-3, -2, -1, 0, 1, 2, 3];
const HIST = 4;   // rows of the seed kept behind

let xs = 88172645;
const rnd = () => { xs ^= xs << 13; xs >>>= 0; xs ^= xs >>> 17; xs ^= xs << 5; xs >>>= 0; return xs; };
const configs = [
  { name: 'cells 0..2999 black', cells: Array.from({ length: 3000 }, (_, i) => i) },
  { name: 'cells 0..99 black', cells: Array.from({ length: 100 }, (_, i) => i) },
  { name: 'seed + cell 1', cells: [0, 1] },
  { name: 'seed + cell 7', cells: [0, 7] },
];
{ const cells = [0]; for (let x = 1; x < 3000; x++) if (rnd() & 1) cells.push(x); configs.push({ name: 'random right half (width 3000)', cells }); }

const base = T + 2;
// the seed's rows, with HIST rows of history
const seedRows = [];
{
  let p = 1n << BigInt(base);
  for (let t = 0; t < T; t++) { seedRows.push(t <= SAMPLES[SAMPLES.length - 1] + HIST ? p : null); p = step(p); }
}
// keep only the rows needed: samples and their HIST predecessors
const needed = new Set();
for (const t of SAMPLES) for (let d = -HIST; d <= HIST; d++) needed.add(t - d);
for (let t = 0; t < T; t++) if (!needed.has(t)) seedRows[t] = null;

// rightmost x such that A and B agree on all cells <= x within [lo, hi]; returns lo - 1 if they differ at lo
function agreeFront(A, B, lo, hi) {
  // scan by comparing xor; find the lowest set bit of the xor above position lo
  const mask = (((1n << BigInt(hi - lo + 1)) - 1n) << BigInt(base + lo));
  const d = (A ^ B) & mask;
  if (d === 0n) return hi;
  // lowest set bit
  const low = d & -d;
  const pos = low.toString(2).length - 1;
  return pos - base - 1;
}

for (const cfg of configs) {
  let row = 0n;
  for (const x of cfg.cells) row |= 1n << BigInt(base + x);
  const lines = [];
  for (let t = 0; t < T; t++) {
    if (SAMPLES.includes(t)) {
      const parts = [];
      for (const N of NS) {
        const P = seedRows[t - N];
        // X(t, x) = P(t - N, x + N): shift P's row down by N bits (x + N at bit base + x + N -> compare X bit base + x)
        const shifted = N >= 0 ? P >> BigInt(N) : P << BigInt(-N);
        const front = agreeFront(row, shifted, -t, t);
        parts.push(`N=${N}: ${(-front / t).toFixed(3)}`);
      }
      lines.push(`   t = ${String(t).padStart(6)}: agreement with tau_N P reaches x = -(fraction of t) ... ${parts.join(', ')}`);
    }
    row = step(row);
  }
  console.log(`${cfg.name}:\n${lines.join('\n')}`);
}
