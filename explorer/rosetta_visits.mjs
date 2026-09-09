/**
 * Does the real left front ever ride a white channel? And how much of the
 * white run available to it does it actually use?
 *
 *   node explorer/rosetta_visits.mjs
 *
 * The front F(t) of E = picture xor S rides diagonal kappa = t + F(t) at speed
 * 1 while the settled word S_{kappa-1} is white at the indices it reads, and
 * leaves at that word's next black cell. Two consequences to measure:
 *
 *   1. If S_{kappa-1} is identically white the front can never leave kappa, so
 *      diagonal kappa would deviate from its own settled word at every index
 *      past that point -- impossible, since the diagonal is eventually periodic.
 *      So the front must SKIP every kappa whose neighbour word is white:
 *      kappa in {3, 8, 29, 400, 53208, 58287, 87867} below 10^5. This script
 *      checks that it does, and prints the jump that carries it over.
 *   2. Every speed-1 run is at most the white run of S_{kappa-1} from the
 *      arrival index, which is at most p_{kappa-1} - 1. This script compares
 *      the run the front achieves with the run available at its arrival phase
 *      and with the longest white run in the whole word.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF, at, isWhite } from './settledwords.mjs';

const T = 130000;
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
const whiteChannels = [];
for (let k = 0; k < S.length - 1; k++) if (isWhite(S[k])) whiteChannels.push(k + 1);
console.log(`settled words to k = ${T + 2 * SMALL} (${Date.now() - t0} ms); white channels kappa: ${whiteChannels.join(', ')}`);

/** Longest cyclic white run of a settled word (Infinity if all white). */
function maxWhiteRun(Sk) {
  const p = Sk.p, w = Sk.word;
  let any = false;
  for (let i = 0; i < p; i++) if (w[i]) any = true;
  if (!any) return Infinity;
  let best = 0, run = 0;
  for (let i = 0; i < 2 * p; i++) { if (w[i % p]) run = 0; else { run++; if (run > best) best = run; } }
  return best;
}
/** White run of S_k starting at index j and going up. */
function runFrom(k, j) { let n = 0; while (sat(k, j + n) === 0) { n++; if (n > 4 * S[k].p + 2) return Infinity; } return n; }

const base = centerBitIndex(T);
const NONE = 0x7fffffff;
const visited = new Set();
const jumps = [];
let Fp = NONE, kappaPrev = -1, arrivalIndex = 0, runNow = 0;
let runs = 0, sumRun = 0, sumAvail = 0, sumMax = 0, tight = 0, maxRunSeen = 0, maxRunAt = -1;
let availFail = 0, maxFail = 0;
const runHist = new Map();
let t = 0;
for (const row of rows(T)) {
  let lo, hi;
  if (t < SMALL) { lo = -t; hi = t + SMALL; } else { lo = Math.max(-t, Fp - 2); hi = 0; }
  const width = hi - lo + 1;
  const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  let Fn = NONE;
  for (let x = lo; x <= hi; x++) {
    const bit = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
    if (bit !== sat(t + x, -x)) { Fn = x; break; }
  }
  if (Fn !== NONE) {
    const kappa = t + Fn;
    visited.add(kappa);
    if (kappa !== kappaPrev) {
      if (kappaPrev >= 0) {                       // close the run just finished on kappaPrev
        runs++; sumRun += runNow; runHist.set(runNow, (runHist.get(runNow) || 0) + 1);
        // the first cell the front reads on kappaPrev is (t, F-1), i.e. index arrivalIndex + 1
        const avail = runFrom(kappaPrev - 1, arrivalIndex + 1), mx = maxWhiteRun(S[kappaPrev - 1]);
        sumAvail += avail; sumMax += mx;
        if (runNow !== avail) availFail++;
        if (runNow > mx) maxFail++;
        if (runNow === mx) tight++;
        if (runNow > maxRunSeen) { maxRunSeen = runNow; maxRunAt = kappaPrev; }
        if (kappa - kappaPrev > 1) jumps.push({ from: kappaPrev, to: kappa, t });
      }
      kappaPrev = kappa; arrivalIndex = -Fn; runNow = 0;
    } else runNow++;
  }
  Fp = Fn;
  t++;
}
console.log(`front tracked to t = ${T - 1} (${Date.now() - t0} ms); kappa reached ${kappaPrev}; diagonals visited ${visited.size}`);
console.log(`white channels the front VISITED: ${whiteChannels.filter((k) => visited.has(k)).join(', ') || 'none'}`);
console.log(`white channels below kappa_max: ${whiteChannels.filter((k) => k <= kappaPrev).join(', ')}`);
for (const c of whiteChannels.filter((k) => k <= kappaPrev)) {
  const j = jumps.find((x) => x.from < c && x.to > c);
  console.log(`   channel kappa = ${c}: ${visited.has(c) ? 'VISITED (the argument is wrong)' : `skipped by the jump ${j ? `${j.from} -> ${j.to} at t = ${j.t}` : '(no jump found -- before the front existed)'}`}`);
}
console.log(`speed-1 runs: ${runs}, mean achieved ${(sumRun / runs).toFixed(3)}, mean available at the arrival phase ${(sumAvail / runs).toFixed(3)}, mean longest in the word ${(sumMax / runs).toFixed(3)}`);
console.log(`   achieved != available: ${availFail} (must be 0); achieved > longest in word: ${maxFail} (must be 0); achieved = longest in word: ${tight} (${(tight / runs * 100).toFixed(1)}%)`);
console.log(`   longest achieved run ${maxRunSeen} on diagonal ${maxRunAt} (word S_${maxRunAt - 1}, period ${S[maxRunAt - 1].p}, longest white run ${maxWhiteRun(S[maxRunAt - 1])})`);
console.log(`   run histogram: ${[...runHist.entries()].sort((a, b) => a[0] - b[0]).map(([r, n]) => `${r}:${n}`).join(' ')}`);
console.log(`(${Date.now() - t0} ms)`);
