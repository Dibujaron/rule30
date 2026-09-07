/**
 * The damage front against the seam, row by row.
 *
 *   node explorer/frontmargin.mjs
 *
 * For a configuration X white on x < 0 and black at 0, leftsides.mjs and
 * translated.mjs find an integer N such that X's picture equals the seed's
 * translated by (t, x) -> (t + N, x - N) on the region left of a front, and
 * that the seam of diagonal 53207 (the last black cell of that eventually-
 * white diagonal) lies inside that region, which is why the complement-type
 * branch at 53208 is inherited from the seed. This script asks whether that
 * is a margin or a law: for every row t it computes
 *
 *   x_f(t): the leftmost x with X(t, x) != P(t - N, x + N)   (the damage front)
 *   x_s(t): the leftmost x with P(t - N, x + N) != S(t - N, x + N), i.e. the
 *           seed's own transient front (its picture against its settled
 *           picture S(t, x) = S_{t+x}(-x)), translated by N
 *
 * and reports the margin x_f(t) - x_s(t) in cells: positive means the damage
 * from the right has not reached the seed's transient front in that row, so
 * everything left of the seed's seam, including the seam itself, is the
 * seed's. N is read off the seam of diagonal 53207. The settled words come
 * from the recurrence with the seed's branch bits (settledcenter.mjs).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { step } from './rule30.mjs';
import { F, at } from './settledwords.mjs';

const T = 80000;
const KE = 53207;
const JSEED = 17908;          // the seed's j* at diagonal 53207 (leftsides.mjs)
const SAMPLES = [5000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 79000];
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1]]);
const HIST = 200;             // rows of the seed kept behind the current row (|N| must be below this)

let xs = 88172645;
const rnd = () => { xs ^= xs << 13; xs >>>= 0; xs ^= xs >>> 17; xs ^= xs << 5; xs >>>= 0; return xs; };
const configs = [
  { name: 'cells 0..2999 black', cells: Array.from({ length: 3000 }, (_, i) => i) },
  { name: 'cells 0..99 black', cells: Array.from({ length: 100 }, (_, i) => i) },
  { name: 'seed + cell 7', cells: [0, 7] },
  { name: '(1000)^750', cells: Array.from({ length: 750 }, (_, i) => 4 * i) },
];
for (let r = 0; r < 3; r++) { const cells = [0]; for (let x = 1; x < 3000; x++) if (rnd() & 1) cells.push(x); configs.push({ name: `random right half #${r + 1} (width 3000)`, cells }); }

const t0 = Date.now();
// settled words to T
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 1; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
// the seed's rows and its transient front per row: leftmost x with P(t, x) != S_{t+x}(-x), searched on -0.5t <= x <= -0.1t
const base = T + 2;
const seedRows = new Array(T + 1);
const seamX = new Int32Array(T + 1);
{
  let p = 1n << BigInt(base);
  for (let t = 0; t <= T; t++) {
    seedRows[t] = p;
    if (t >= 200) {
      const lo = -Math.floor(0.5 * t), hi = -Math.floor(0.1 * t);
      const width = hi - lo + 1;
      const str = ((p >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
      let found = hi + 1;
      for (let x = lo; x <= hi; x++) {
        const bit = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
        if (bit !== at(S[t + x], -x)) { found = x; break; }
      }
      seamX[t] = found;
    }
    p = step(p);
  }
}
console.log(`seed: ${T} rows, settled words and transient front per row (${Date.now() - t0} ms); seed's transient front at sampled rows: ${SAMPLES.map((t) => `${t}:${(-seamX[t] / t).toFixed(3)}t`).join(' ')}`);

const lowestBit = (d) => { const low = d & -d; return low.toString(2).length - 1; };
for (const cfg of configs) {
  const t1 = Date.now();
  let row = 0n;
  for (const x of cfg.cells) row |= 1n << BigInt(base + x);
  const dE = new Uint8Array(30000);
  const rowsX = [];
  for (let t = 0; t <= T; t++) {
    rowsX.push(t >= KE ? null : null);
    if (t >= KE && t - KE < 30000) dE[t - KE] = Number((row >> BigInt(base - (t - KE))) & 1n);
    if (t < T) row = step(row);
  }
  // N from the seam
  let jstar = -1;
  for (let j = 29999; j >= 0; j--) if (dE[j] === 1) { jstar = j; break; }
  const N = jstar - JSEED;
  if (Math.abs(N) >= HIST) { console.log(`${cfg.name}: N = ${N}, beyond HIST; skipped`); continue; }
  // second pass: the damage front per row against tau_N P
  row = 0n;
  for (const x of cfg.cells) row |= 1n << BigInt(base + x);
  let minMargin = Infinity, minAt = -1, negRows = 0, rowsChecked = 0;
  const samples = [];
  for (let t = 0; t <= T; t++) {
    const tp = t - N;
    if (tp >= 200 && tp <= T && t >= 200) {
      const P = seedRows[tp];
      const shifted = N >= 0 ? P >> BigInt(N) : P << BigInt(-N);
      const mask = ((1n << BigInt(2 * t + 1)) - 1n) << BigInt(base - t);
      const d = (row ^ shifted) & mask;
      const xf = d === 0n ? t + 1 : lowestBit(d) - base;
      const xsm = seamX[tp] - N;       // the seed's seam in X's coordinates
      const margin = xf - xsm;
      rowsChecked++;
      if (margin < minMargin) { minMargin = margin; minAt = t; }
      if (margin < 0) negRows++;
      if (SAMPLES.includes(t)) samples.push(`${t}: front ${(-xf / t).toFixed(3)}t, seam ${(-xsm / t).toFixed(3)}t, margin ${margin}`);
    }
    if (t < T) row = step(row);
  }
  console.log(`${cfg.name}: N = ${N}; rows checked ${rowsChecked}; rows with the damage front left of the seed's seam: ${negRows}; smallest margin ${minMargin} cells at row ${minAt} (${Date.now() - t1} ms)`);
  for (const s of samples) console.log('   ' + s);
}
