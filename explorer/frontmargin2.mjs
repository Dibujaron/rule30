/**
 * The translation N across a period doubling: rows to 200,000.
 *
 *   node explorer/frontmargin2.mjs
 *
 * frontmargin.mjs measures, to row 80,000, the damage front between a
 * configuration X and the seed's picture translated by the integer N read off
 * X's seam at diagonal 53207. Those rows all have their settled region in
 * level 4 (periods dividing 16). The doubling to period 32 is at diagonal
 * 87867, whose settled part begins near row 117,000, so this script runs
 * three configurations with N = -58, -47, -32 to row 200,000 and reports the
 * damage front against tau_N P every 1000 rows, together with the seed's own
 * transient front (sampled) and the margin. If N were only a 2-adic phase
 * rather than an integer, the agreement with the single translate tau_N P
 * would collapse past the doubling.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { step } from './rule30.mjs';
import { F, at } from './settledwords.mjs';

const T = 200000;
const AHEAD = 200;
const EVERY = 1000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

let xs = 88172645;
const rnd = () => { xs ^= xs << 13; xs >>>= 0; xs ^= xs >>> 17; xs ^= xs << 5; xs >>>= 0; return xs; };
const randomCells = () => { const cells = [0]; for (let x = 1; x < 3000; x++) if (rnd() & 1) cells.push(x); return cells; };
const r1 = randomCells(), r2 = randomCells(), r3 = randomCells();
const configs = [
  { name: 'seed + cell 7', cells: [0, 7], N: -58 },
  { name: 'random right half #2 (width 3000)', cells: r2, N: -47 },
  { name: 'random right half #3 (width 3000)', cells: r3, N: -32 },
];

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 1; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const base = T + 2;
const lowestBit = (d) => { const low = d & -d; return low.toString(2).length - 1; };
const seamOf = (p, t) => {
  const lo = -Math.floor(0.4 * t), hi = -Math.floor(0.15 * t);
  const width = hi - lo + 1;
  const str = ((p >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  for (let x = lo; x <= hi; x++) if ((str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0) !== at(S[t + x], -x)) return x;
  return hi + 1;
};

for (const cfg of configs) {
  const t1 = Date.now();
  const N = cfg.N;
  // the seed, run AHEAD rows ahead, kept in a rolling array indexed by row
  const seed = new Map();
  let ps = 1n << BigInt(base), pt = 0;
  const seedRow = (t) => { while (pt <= t) { seed.set(pt, ps); ps = step(ps); pt++; } return seed.get(t); };
  let row = 0n;
  for (const x of cfg.cells) row |= 1n << BigInt(base + x);
  let minMargin = Infinity, minAt = -1, neg = 0, checked = 0;
  const lines = [];
  for (let t = 0; t <= T; t++) {
    if (t % EVERY === 0 && t >= 2000) {
      const tp = t - N;
      const P = seedRow(tp);
      for (const k of [...seed.keys()]) if (k < tp - AHEAD) seed.delete(k);
      const shifted = N >= 0 ? P >> BigInt(N) : P << BigInt(-N);
      const mask = ((1n << BigInt(2 * t + 1)) - 1n) << BigInt(base - t);
      const d = (row ^ shifted) & mask;
      const xf = d === 0n ? t + 1 : lowestBit(d) - base;
      const xsm = seamOf(P, tp) - N;
      const margin = xf - xsm;
      checked++;
      if (margin < minMargin) { minMargin = margin; minAt = t; }
      if (margin < 0) neg++;
      if (t % 20000 === 0) lines.push(`   ${t}: front ${(-xf / t).toFixed(3)}t, seam ${(-xsm / t).toFixed(3)}t, margin ${margin}`);
    }
    if (t < T) row = step(row);
  }
  console.log(`${cfg.name}: N = ${N}; ${checked} sampled rows to ${T}; rows with the front left of the seam: ${neg}; smallest margin ${minMargin} at row ${minAt} (${Date.now() - t1} ms)`);
  for (const l of lines) console.log(l);
}
console.log(`(${Date.now() - t0} ms)`);
