/**
 * The settled picture is the rule 30 evolution of the settled configuration,
 * checked deeper than settledpicture.mjs and without reading the seed at all.
 *
 *   node explorer/settledorbit.mjs
 *
 * The settled words S_k come from the recurrence alone (settledwords.mjs F),
 * with the seed's branch bits at the eventually-white diagonals below 40000
 * written in from explorer/settledcenter.mjs (k = 3, 8, 29, 400: branches
 * 1, 1, 0, 0). Sigma(x) = S_x(-x) for 0 <= x <= X, white elsewhere, is grown
 * with the BigInt engine for T steps, and every cell (t, x) with -t <= x and
 * t + x <= X is compared with S_{t+x}(-x). Cells with t + x > X are outside
 * the cone of the known part of Sigma and are not compared.
 *
 * What a mismatch would mean: the recurrence-defined words do not form a rule
 * 30 orbit, i.e. the claim "S(t, x) = S_{t+x}(-x) is evolveFrom Sigma" fails.
 * Nothing here is a proof. See explorer/README.md.
 */

import { step } from './rule30.mjs';
import { F, at } from './settledwords.mjs';

const X = 30000;
const T = 10000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0]]);

const t0 = Date.now();
const K = X + 1;
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= K; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
console.log(`settled words to k = ${K} from the recurrence (${Date.now() - t0} ms)`);

const base = T + 2;
let row = 0n;
for (let x = 0; x <= X; x++) if (at(S[x], -x) === 1) row |= 1n << BigInt(base + x);

let cells = 0, mism = 0, first = null;
const popcount = (b) => { let n = 0; for (const ch of b.toString(2)) if (ch === '1') n++; return n; };
for (let t = 0; t <= T; t++) {
  // predicted cells x in [-t, X - t] as a bit string, high position first
  const lo = -t, hi = X - t;
  let str = '';
  for (let x = hi; x >= lo; x--) str += at(S[t + x], -x) === 1 ? '1' : '0';
  const pred = BigInt('0b' + str) << BigInt(base + lo);
  const width = hi - lo + 1;
  const mask = ((1n << BigInt(width)) - 1n) << BigInt(base + lo);
  const diff = (row & mask) ^ pred;
  cells += width;
  if (diff !== 0n) { const m = popcount(diff); mism += m; if (!first) first = t; }
  row = step(row);
}
console.log(`rule 30 from Sigma vs S_{t+x}(-x): ${cells} cells, t <= ${T}, cone of [0, ${X}]: ${mism} mismatches${first !== null ? ' (first in row ' + first + ')' : ''} (${Date.now() - t0} ms)`);
