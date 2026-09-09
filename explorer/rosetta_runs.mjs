/**
 * White runs in the settled words: the background statistic that bounds the
 * left damage front's speed-1 runs.
 *
 *   node explorer/rosetta_runs.mjs
 *
 * The left front F(t) of E = picture xor S obeys (crystals A2)
 *
 *   F(t+1) = F(t) - 1  iff  the cell (t, F(t)-1) is white,
 *
 * and that cell is settled: it is S_{kappa-1}(1 - F(t)) with kappa = t + F(t).
 * So while the front rides diagonal kappa at speed 1 it is reading consecutive
 * cells of ONE settled word, and the ride ends at that word's next black cell.
 * Hence every maximal speed-1 run has length at most the longest run of whites
 * in S_{kappa-1} -- and a periodic word of period p that is not identically
 * white has no white run of length p (a white run of length p forces the whole
 * word white). So:
 *
 *   run <= p_{kappa-1} - 1,  and the front's speed is at most M / (M + 1)
 *   where M is the longest white run of any settled word it visits.
 *
 * This script computes, from the settled-word recurrence ALONE (no picture, no
 * engine), for every diagonal k up to K:
 *
 *   1. the period p_k, the black density of S_k, and the longest cyclic run of
 *      whites W_k (Infinity for the eventually-white diagonals);
 *   2. the running maximum and the mean of W_k, the histogram of W_k, and the
 *      largest ratio W_k / p_k;
 *   3. the resulting speed bounds max/(max+1) and mean/(mean+1);
 *   4. where each new record W_k is set, and the periods at those places.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F, isWhite } from './settledwords.mjs';

const K = 2000000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);
const CHECKPOINTS = [1000, 10000, 100000, 1000000, 3000000, 10000000];

/** Longest run of whites in the periodic word, read cyclically; Infinity if all white. */
function whiteRun(S) {
  const p = S.p, w = S.word;
  let ones = 0;
  for (let i = 0; i < p; i++) if (w[i]) ones++;
  if (ones === 0) return Infinity;
  let best = 0, run = 0;
  for (let i = 0; i < 2 * p; i++) {   // two laps so a run wrapping the seam is seen
    if (w[i % p]) run = 0; else { run++; if (run > best) best = run; }
  }
  return Math.min(best, p);           // a run of length p would mean all white
}

const t0 = Date.now();
let A = { p: 1, onset: 0, word: Uint8Array.of(1) };   // S_0
let B = { p: 1, onset: 0, word: Uint8Array.of(1) };   // S_1
const hist = new Map();
let maxRun = 0, maxAt = -1, sumRun = 0, cnt = 0, whites = [];
let maxRatio = 0, maxRatioAt = -1;
const records = [];
const periodFirst = new Map();
let sumDensity = 0;
for (let k = 2; k <= K; k++) {
  const sols = F(A, B);
  let S;
  if (sols.length === 1) S = sols[0];
  else {
    if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`);
    S = sols[BRANCH.get(k)];
  }
  if (!periodFirst.has(S.p)) periodFirst.set(S.p, k);
  if (isWhite(S)) whites.push(k);
  else {
    const W = whiteRun(S);
    hist.set(W, (hist.get(W) || 0) + 1);
    sumRun += W; cnt++;
    let ones = 0;
    for (let i = 0; i < S.p; i++) if (S.word[i]) ones++;
    sumDensity += ones / S.p;
    if (W > maxRun) { maxRun = W; maxAt = k; records.push({ k, W, p: S.p }); }
    if (W / S.p > maxRatio) { maxRatio = W / S.p; maxRatioAt = k; }
  }
  A = B; B = S;
  if (CHECKPOINTS.includes(k)) {
    console.log(`k = ${k}: max white run so far ${maxRun} (at k = ${maxAt}), mean ${(sumRun / cnt).toFixed(4)}, ` +
      `mean black density ${(sumDensity / cnt).toFixed(4)}, largest period so far ${Math.max(...periodFirst.keys())} ` +
      `-> speed bounds max ${(maxRun / (maxRun + 1)).toFixed(4)}, mean ${(sumRun / cnt / (sumRun / cnt + 1)).toFixed(4)} (${Date.now() - t0} ms)`);
  }
}
console.log(`\ndiagonals 2..${K} from the recurrence alone (${Date.now() - t0} ms)`);
console.log(`eventually-white diagonals (W = infinity): ${whites.join(', ')}`);
console.log(`first appearance of each period: ${[...periodFirst.entries()].sort((a, b) => a[0] - b[0]).map(([p, k]) => `${p}@${k}`).join(' ')}`);
console.log(`longest white run over all non-white settled words: ${maxRun} at k = ${maxAt}; largest W_k/p_k = ${maxRatio.toFixed(4)} at k = ${maxRatioAt}`);
console.log(`records: ${records.map((r) => `W=${r.W} at k=${r.k} (p=${r.p})`).join('; ')}`);
console.log(`histogram of W_k: ${[...hist.entries()].sort((a, b) => a[0] - b[0]).map(([w, n]) => `${w}:${n}`).join(' ')}`);
console.log(`mean W_k = ${(sumRun / cnt).toFixed(4)} over ${cnt} words; mean black density ${(sumDensity / cnt).toFixed(4)}`);
console.log(`speed bound from the uniform max: ${maxRun}/${maxRun + 1} = ${(maxRun / (maxRun + 1)).toFixed(4)}`);
