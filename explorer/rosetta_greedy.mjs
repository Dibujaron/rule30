/**
 * The optimistic front: the comparison process a percolation argument would
 * use, and the diagonal at which it escapes.
 *
 *   node explorer/rosetta_greedy.mjs
 *
 * The real left front F of E = picture xor S obeys (crystals A2)
 *
 *   F(t+1) = F(t) - 1  if the settled cell (t, F(t)-1) is white,
 *   F(t+1) >= F(t)     otherwise (it stays, or retreats by any amount).
 *
 * Define G by the same first clause and "stay" in place of "stays or retreats":
 *
 *   G(t+1) = G(t) - 1  if S_{t+G(t)-1}(1 - G(t)) = false, else G(t+1) = G(t).
 *
 * G is a function of the settled background ALONE -- it never looks at the
 * picture -- and G(t) <= F(t) for every t once they start together, by
 * induction: if G(t) < F(t) then G(t+1) <= G(t) <= F(t) - 1 <= F(t+1); if
 * G(t) = F(t) they read the same cell and either both advance or F stays or
 * retreats while G stays. So the speed of G bounds the speed of F from above,
 * and any bound below 1 for a monotone comparison front would give one for the
 * real one.
 *
 * This script runs G and reports where it goes. Because G never retreats, its
 * diagonal index kappa = t + G(t) increases by exactly one at every stall, so
 * G visits EVERY diagonal in turn -- including the eventually-white ones, whose
 * settled word is identically false. The first of those past G's start is a
 * white channel of infinite length and G rides it for ever at speed 1.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF, at, isWhite } from './settledwords.mjs';

const T = 3000;
const K = 200000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= K; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const whites = [];
for (let k = 0; k <= K; k++) if (isWhite(S[k])) whites.push(k);
console.log(`settled words to k = ${K}; eventually-white diagonals: ${whites.join(', ')}`);

/** Run the optimistic front from (t0, x0) and report its trajectory. */
function greedy(t0, x0, label) {
  let x = x0, stallRun = 0, kappaAt = t0 + x0, escapeAt = -1, escapeKappa = -1;
  const samples = [];
  let advances = 0, stalls = 0;
  for (let t = t0; t < T; t++) {
    const kappa = t + x;
    const k = kappa - 1;
    if (k > K) throw new Error('ran past the settled words');
    const white = at(S[k], 1 - x) === 0;
    if (white) {
      x -= 1; advances++;
      if (kappa === kappaAt) stallRun++; else { kappaAt = kappa; stallRun = 1; }
      if (stallRun > 400 && escapeAt < 0) { escapeAt = t; escapeKappa = kappa; }
    } else { x += 0; stalls++; kappaAt = kappa + 1; stallRun = 0; }
    if ([50, 100, 200, 400, 800, 1600, 2999].includes(t)) samples.push(`t=${t}: G=${x} (${(-x / t).toFixed(3)} t), kappa=${t + x}`);
  }
  console.log(`${label}: start (t=${t0}, x=${x0}); advances ${advances}, stalls ${stalls}; ` +
    (escapeAt >= 0
      ? `ESCAPED: rode diagonal ${escapeKappa} at speed 1 without a single stall from t = ${escapeAt - 400} on (neighbour word S_${escapeKappa - 1} is ${isWhite(S[escapeKappa - 1]) ? 'identically white' : 'NOT white -- check'})`
      : 'no escape within T'));
  console.log(`   ${samples.join('; ')}`);
  return { escapeKappa, escapeAt };
}

greedy(18, 0, 'from the real front\'s first row inside x <= 0');
greedy(500, -125, 'from a point on the real front\'s trajectory (t = 500)');
greedy(1000, -220, 'from a point on the real front\'s trajectory (t = 1000)');

/**
 * The long channel-free stretch. Between the white diagonals 399 and 53207 there
 * is no white channel at all, so the optimistic front runs there without escaping,
 * and its speed is a pure statistic of the settled words. The wall
 * leftDiagonal_onset_le is exactly "the front's speed is at most 1/2"
 * (obstruction 6: it holds for all k iff 2 F(t) + t >= 1 for all t), so the
 * question this measures is whether the background alone clears the wall.
 */
function greedyLong(t0, x0, stopKappa, label) {
  let x = x0, advances = 0, stalls = 0, t = t0;
  let minMargin = Infinity, minMarginAt = -1;
  const samples = [];
  while (t + x < stopKappa) {
    const k = t + x - 1;
    if (at(S[k], 1 - x) === 0) { x -= 1; advances++; } else stalls++;
    t++;
    const margin = 2 * x + t;                     // the onset wall in front form
    if (margin < minMargin) { minMargin = margin; minMarginAt = t; }
    if (advances + stalls === 1000 || (advances + stalls) % 25000 === 0) samples.push(`t=${t}: G=${x} (${(-x / t).toFixed(4)} t)`);
  }
  const steps = advances + stalls;
  console.log(`${label}: ${steps} steps from (t=${t0}, x=${x0}) to kappa = ${t + x}; advances ${advances} (${(advances / steps).toFixed(4)}), stalls ${stalls}`);
  console.log(`   speed over the stretch ${(advances / steps).toFixed(4)}; -G(t)/t at the end ${(-x / t).toFixed(4)}; min of 2G(t)+t over the stretch ${minMargin} at t = ${minMarginAt}`);
  console.log(`   ${samples.join('; ')}`);
}
greedyLong(1000, -220, 53207, 'optimistic front over the channel-free stretch 780..53206');
greedyLong(1000, -100, 53207, 'the same from a different start phase');
greedyLong(20000, -5024, 53207, 'the same started at t = 20000 on the real trajectory');

// The same statement without the simulation: for every eventually-white diagonal m,
// diagonal m+1 is a white channel -- any front that arrives at kappa = m+1 rides for ever.
console.log(`\nwhite channels (kappa whose neighbour word is identically white): ${whites.map((m) => m + 1).join(', ')}`);
console.log(`the real front's own diagonal kappa(t) = t + F(t) reaches ~0.75 t, so it passes every one of them.`);
