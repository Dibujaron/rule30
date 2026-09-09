/**
 * Direct check of the comparison lemma G <= F against the real picture.
 *
 *   node explorer/rosetta_compare.mjs
 *
 * rosetta_greedy2.mjs bounds the real front's speed by the never-retreating
 * front G, on the strength of a two-case induction. An induction is exactly the
 * kind of thing that survives an off-by-one in the index convention, so this
 * script runs both at once: F from the engine's own rows, G from the settled
 * words alone, started at G(t0) = F(t0), and reports every row on which
 * G(t) > F(t) -- there must be none -- together with the gap F - G, which is the
 * slack the bound is throwing away.
 *
 * It also reports the two speeds over the same rows, so the 0.501 against 0.2497
 * is measured on one run rather than assembled from two.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF, at, isWhite } from './settledwords.mjs';

const T = 130000;
const T0 = 1000;               // start the comparison here
const SMALL = 40;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 2 * SMALL; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const sat = (k, j) => at(S[k], j);

const base = centerBitIndex(T);
const NONE = 0x7fffffff;
let Fp = NONE, G = NONE, started = false;
let violations = 0, firstViolation = -1, maxGap = 0, maxGapAt = -1;
let gAdv = 0, gSteps = 0, escapes = [], escape0 = null;
let F0 = 0, G0 = 0;
let t = 0;
for (const row of rows(T)) {
  const lo = t < SMALL ? -t : Math.max(-t, Fp - 2);
  const hi = t < SMALL ? t + SMALL : 0;
  const width = hi - lo + 1;
  const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  let Fn = NONE;
  for (let x = lo; x <= hi; x++) {
    if ((str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0) !== sat(t + x, -x)) { Fn = x; break; }
  }
  if (t === T0) { G = Fn; started = true; F0 = Fn; G0 = Fn; }
  if (started && t > T0) {
    if (G > Fn) { violations++; if (firstViolation < 0) firstViolation = t; }
    if (Fn - G > maxGap) { maxGap = Fn - G; maxGapAt = t; }
  }
  if (started) {                                  // step G on the settled words alone
    const k = t + G - 1;
    if (isWhite(S[k])) { if (escapes.length === 0) escape0 = { t, kappa: t + G, G, F: Fn }; escapes.push({ t, kappa: t + G }); }
    if (sat(k, 1 - G) === 0) { G -= 1; gAdv++; }
    gSteps++;
  }
  Fp = Fn; t++;
}
console.log(`rows ${T0}..${T - 1} (${Date.now() - t0} ms); start F(${T0}) = G(${T0}) = ${F0}`);
console.log(`G(t) > F(t) on ${violations} rows${firstViolation >= 0 ? ` (first at t = ${firstViolation})` : ' -- the comparison holds at every row'}`);
console.log(`final: F = ${Fp}, G = ${G}, gap F - G = ${Fp - G}; largest gap ${maxGap} at t = ${maxGapAt}`);
console.log(`speeds over these rows: real front ${((F0 - Fp) / (T - 1 - T0)).toFixed(5)}, comparison front ${((G0 - G) / (T - 1 - T0)).toFixed(5)} (advance fraction ${(gAdv / gSteps).toFixed(5)})`);
if (escape0) {
  console.log(`G reached a white channel at t = ${escape0.t}, kappa = ${escape0.kappa} (the real front was at F = ${escape0.F}, kappa = ${escape0.t + escape0.F}, and had already stepped over it)`);
  console.log(`   G's speed BEFORE the escape: ${((G0 - escape0.G) / (escape0.t - T0)).toFixed(5)} over ${escape0.t - T0} rows; AFTER: ${((escape0.G - G) / (T - 1 - escape0.t)).toFixed(5)} over ${T - 1 - escape0.t} rows`);
  console.log(`   it rode that one channel for ${escapes.length} rows and never stalled again`);
} else console.log('G never met an eventually-white neighbour word');
