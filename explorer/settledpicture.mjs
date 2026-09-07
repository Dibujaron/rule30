/**
 * The settled picture is a rule 30 evolution, and the seed's picture agrees
 * with it exactly on the settled cells.
 *
 *   node explorer/settledpicture.mjs
 *
 * Put S(t, x) = S_{t+x}(-x), the settled word of diagonal t + x read at the
 * diagonal index of position x (settledwords.mjs). Every S_k is periodic on
 * all of Z, so S is defined on the whole cone x >= -t, including x > 0. The
 * claim: S is the rule 30 evolution of its own row 0, the "settled
 * configuration" Sigma(x) = S_x(-x) for x >= 0, white on x < 0. Checked here
 * by growing Sigma with the BigInt engine and comparing every cell inside the
 * cone of the known part of Sigma. Then the seed's picture is compared with
 * S: they must agree at every (t, x) whose diagonal index -x is at or past
 * the onset of diagonal t + x, and the disagreement E = picture xor S is
 * the transient region.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { step, rows, centerBitIndex } from './rule30.mjs';
import { seedDiagonals, settle, F, same, at } from './settledwords.mjs';

const N = 6000;      // engine rows for the seed's diagonals
const K = 2400;      // diagonals settled from the engine
const X = 2000;      // Sigma known on [0, X]
const T = 1000;      // steps to grow Sigma

const t0 = Date.now();
const diag = seedDiagonals(N, K);
const S = diag.map((d) => settle(d));
// sanity: the recurrence holds (settledwords.mjs checks this too)
let bad = 0;
for (let k = 2; k <= K; k++) if (!F(S[k - 2], S[k - 1]).some((x) => same(x, S[k]))) bad++;
console.log(`settled ${K + 1} diagonals, recurrence failures ${bad} (${Date.now() - t0} ms)`);

// Sigma as a BigInt row: bit (base + x) = Sigma(x)
const base = T + 2;   // room for the picture to grow left to -T
let row = 0n;
for (let x = 0; x <= X; x++) if (at(S[x], -x) === 1) row |= 1n << BigInt(base + x);
const sigmaBits = Array.from({ length: 40 }, (_, x) => at(S[x], -x)).join('');
console.log(`Sigma(0..39) = ${sigmaBits}`);

let cells = 0, mism = 0, firstMism = null;
for (let t = 0; t <= T; t++) {
  // compare cells x in [-t, X - t] (inside the cone of the known part of Sigma), with t + x <= K
  const s = row.toString(2), len = s.length;
  for (let x = -t; x <= X - t && t + x <= K; x++) {
    const pos = base + x;
    const bit = pos >= 0 && pos < len ? (s.charCodeAt(len - 1 - pos) === 49 ? 1 : 0) : 0;
    const pred = at(S[t + x], -x);
    cells++;
    if (bit !== pred) { mism++; if (!firstMism) firstMism = { t, x }; }
  }
  row = step(row);
}
console.log(`rule 30 from Sigma vs S on ${cells} cells (t <= ${T}, cone of [0, ${X}]): ${mism} mismatches${firstMism ? ' (first at t=' + firstMism.t + ', x=' + firstMism.x : ''}`);

// the seed's picture against S: agreement on settled cells, disagreement pattern elsewhere
let settledCells = 0, settledAgree = 0, transientCells = 0, transientAgree = 0;
const frontier = [];   // per row t (sampled): the largest x with picture != S, and the onset-based boundary
for (let t = 0; t <= 2000; t++) {
  let maxDev = -Infinity;
  for (let j = 0; j <= t; j++) {
    const k = t - j;
    const actual = diag[k][j], pred = at(S[k], j);
    if (j >= S[k].onset) { settledCells++; if (actual === pred) settledAgree++; }
    else { transientCells++; if (actual === pred) transientAgree++; }
    if (actual !== pred && -j > maxDev) maxDev = -j;
    if (actual !== pred) { /* the leftmost deviation in this row */ }
  }
  if (t % 250 === 0 && t > 0) {
    let minX = 0;
    for (let j = t; j >= 0; j--) { const k = t - j; if (diag[k][j] !== at(S[k], j)) { minX = -j; break; } }
    frontier.push(`t=${t}: leftmost deviation at x=${minX} (${(-minX / t).toFixed(3)} t)`);
  }
}
console.log(`seed picture vs S, t <= 2000: settled cells ${settledCells}, agreeing ${settledAgree}; transient cells ${transientCells}, agreeing ${transientAgree} (${(transientAgree / transientCells).toFixed(3)})`);
for (const f of frontier) console.log('   ' + f);
console.log(`(${Date.now() - t0} ms)`);
