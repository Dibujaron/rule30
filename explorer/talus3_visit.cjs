/**
 * The absorbing diagonals, and whether the real front meets them.
 *
 * explorer/talus3_diag.cjs shows the reachable-set DP, started anywhere below
 * diagonal 400, is absorbed onto diagonal 400 and then advances at speed
 * EXACTLY 1 for ever, because the settled word of diagonal 399 is identically
 * white and the front advances exactly when the background cell on its left is
 * white.  The seed's settled words have such diagonals at 2, 7, 28, 399,
 * 53207, 58286, 87866 (obstruction 4).
 *
 * The real front cannot do that -- a front that rides diagonal k for ever means
 * diagonal k never settles, which `leftDiagonal_periodicFrom_pow` forbids.  So
 * this script asks the two questions that decide whether the DP route survives:
 *
 *   (1) which diagonals does the real front actually sit on, and does it avoid
 *       3, 8, 29 and 400 (the diagonals whose left neighbour is white)?
 *   (2) how close does it come, and does it ever advance by more than one cell
 *       in a row?
 *
 *   node explorer/talus3_visit.cjs
 *
 * Nothing here is a proof.
 */
'use strict';

const KMAX = 3000, TFRONT = 2600, J0 = 200000, PMAX = 64;
const early = new Array(TFRONT + 2);
const deep = new Map();
{
  let row = 1n;
  const need = J0 + 10 * PMAX + KMAX + 8;
  for (let t = 0; t <= need; t++) { if (t <= TFRONT + 1) early[t] = row; if (t >= J0) deep.set(t, row); row = (row << 2n) ^ ((row << 1n) | row); }
}
const seed = (t, x) => Number((early[t] >> BigInt(t + x)) & 1n);
const diagDeep = (k, j) => Number((deep.get(j + k) >> BigInt(k)) & 1n);
const S = [];
for (let k = 0; k <= KMAX; k++) {
  let p = 0;
  for (const cand of [1, 2, 4, 8, 16, 32, 64]) {
    let ok = true;
    for (let s = 0; s < 8 * PMAX && ok; s++) if (diagDeep(k, J0 + s) !== diagDeep(k, J0 + s + cand)) ok = false;
    if (ok) { p = cand; break; }
  }
  const w = new Uint8Array(p);
  for (let r = 0; r < p; r++) w[r] = diagDeep(k, J0 + ((r - J0) % p + p) % p);
  S.push(w);
}
const at = (w, j) => w[((j % w.length) + w.length) % w.length];
const settled = (t, x) => at(S[t + x], -x);
const whiteWord = (k) => { for (const b of S[k]) if (b) return false; return true; };
const whites = []; for (let k = 0; k <= KMAX; k++) if (whiteWord(k)) whites.push(k);
console.log(`identically white settled diagonals below ${KMAX}: ${whites.join(', ')}`);
console.log(`so the absorbing diagonals -- those whose LEFT neighbour word is white -- are ${whites.map((k) => k + 1).join(', ')}`);

const visited = new Set();
let F = null, maxStep = 0, rows = 0;
const kSeq = [];
for (let t = 0; t <= TFRONT; t++) {
  let f = null;
  for (let x = -t; x <= 0; x++) if (seed(t, x) !== settled(t, x)) { f = x; break; }
  if (f === null) continue;
  visited.add(t + f);
  kSeq.push(t + f);
  if (F !== null) { const d = F - f; if (d > maxStep) maxStep = d; rows++; }
  F = f;
}
const kMin = Math.min(...kSeq), kMax = Math.max(...kSeq);
console.log(`the real front sits on diagonals ${kMin} .. ${kMax} over t <= ${TFRONT}; it visits ${visited.size} of the ${kMax - kMin + 1} in that range`);
let monotone = true; for (let i = 1; i < kSeq.length; i++) if (kSeq[i] < kSeq[i - 1]) monotone = false;
console.log(`the front's diagonal is non-decreasing: ${monotone};  largest advance in one row: ${maxStep} cell(s)`);
for (const k of whites.map((k) => k + 1)) {
  if (k < kMin) { console.log(`  absorbing diagonal ${k}: below the front's first diagonal (${kMin}) -- never reachable`); continue; }
  if (k > kMax) { console.log(`  absorbing diagonal ${k}: above the range reached by t = ${TFRONT}`); continue; }
  const hit = visited.has(k);
  let before = -Infinity, after = Infinity;
  for (const v of visited) { if (v < k && v > before) before = v; if (v > k && v < after) after = v; }
  console.log(`  absorbing diagonal ${k}: visited by the real front? ${hit ? 'YES -- the theory is wrong' : 'no'}   (front skips from ${before} to ${after})`);
}

// how long could a front afford to ride?  the line j <= k allows the onset of
// diagonal k to be at most k; riding diagonal k for r rows costs r indices.
console.log('');
console.log('what riding costs: the wall allows the onset of diagonal k to be at most k, so a');
console.log('front that rides diagonal k for more than k rows breaks it outright.  The only');
console.log('bound on the board that makes the front leave is leftDiagonal_periodicFrom_pow,');
console.log('whose onset bound is 2^k:');
for (const k of [29, 400, 53208]) console.log(`  diagonal ${k}: the wall allows ${k} rows of riding; the available bound allows 2^${k} ~ 10^${Math.round(k * Math.log10(2))}`);
