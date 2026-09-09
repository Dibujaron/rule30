/**
 * The optimistic front's asymptotic speed on the long channel-free stretch.
 *
 *   node explorer/rosetta_greedy2.mjs
 *
 * rosetta_greedy.mjs measures the never-retreating comparison front G over the
 * stretch of diagonals 780..53206, which carries no eventually-white word, and
 * gets speed 0.5044 from three starts. The next white diagonal after 87866 is
 * at 1,420,878,968 (Rowan, explorer/orbit32.mjs), so the stretch 87868..10^7 is
 * channel-free and 10^7 diagonals long: this script runs G across it, with the
 * settled words generated lazily by the recurrence (constant memory), and
 * reports the speed and the margin 2 G(t) + t, which is the onset wall's
 * threshold in front form (obstruction 6: the wall holds iff 2 F(t) + t >= 1).
 *
 * The number that matters is whether the speed is above or below 1/2: G is an
 * upper bound for the real front (see rosetta_greedy.mjs), so a G below 1/2
 * over a stretch would mean the settled background alone carries the wall
 * there, and a G above 1/2 means no argument that drops the retreats can.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF, at, isWhite } from './settledwords.mjs';

const KAPPA0 = 87868;          // the first diagonal past the white channel at 87867
const KAPPA1 = 100000000;      // stop well before the next white diagonal, 1,420,878,968
const BLOCK = 10000000;        // report the speed within each block, not only cumulative
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

// lazy settled words: keep only the last two, hand out S_k for non-decreasing k
let kA = 0, A = { p: 1, onset: 0, word: Uint8Array.of(1) }, B = { p: 1, onset: 0, word: Uint8Array.of(1) };
let whiteSeen = [];
function advanceTo(k) {                       // make B = S_k
  while (kA + 1 < k) {
    const sols = solveF(A, B);
    let S;
    if (sols.length === 1) S = sols[0];
    else { if (!BRANCH.has(kA + 2)) throw new Error(`unexpected branch at k = ${kA + 2}`); S = sols[BRANCH.get(kA + 2)]; }
    if (isWhite(S)) whiteSeen.push(kA + 2);
    A = B; B = S; kA++;
  }
  return B;
}

const t0 = Date.now();
// start on the real front's trajectory shape: kappa = KAPPA0 at t with x = -(t - kappa)
// any start works; take t so that -x/t is about 0.25, the real front's speed
let t = Math.round(KAPPA0 / 0.75), x = KAPPA0 - t;
const tStart = t, xStart = x;
let advances = 0, stalls = 0, minMargin = Infinity, minMarginAt = -1, lastAdv = 0;
const marks = [];
while (t + x < KAPPA1) {
  const w = advanceTo(t + x - 1);
  if (at(w, 1 - x) === 0) { x -= 1; advances++; } else stalls++;
  t++;
  const margin = 2 * x + t;
  if (margin < minMargin) { minMargin = margin; minMarginAt = t; }
  const steps = advances + stalls;
  if (steps % BLOCK === 0) {
    marks.push(`${steps / 1e6}M steps: cumulative speed ${(advances / steps).toFixed(5)}, this block ${((advances - lastAdv) / BLOCK).toFixed(5)}, -x/t ${(-x / t).toFixed(5)}, kappa ${t + x}`);
    lastAdv = advances;
  }
}
const steps = advances + stalls;
console.log(`optimistic front over diagonals ${KAPPA0}..${KAPPA1} (${Date.now() - t0} ms)`);
console.log(`start (t=${tStart}, x=${xStart}); ${steps} steps; advances ${advances}, stalls ${stalls}`);
console.log(`speed over the stretch: ${(advances / steps).toFixed(5)}  (1/2 is the onset wall's threshold)`);
console.log(`-G(t)/t at the end: ${(-x / t).toFixed(5)}; min of 2G(t)+t: ${minMargin} at t = ${minMarginAt}; final margin ${2 * x + t}`);
console.log(`eventually-white diagonals met on the way: ${whiteSeen.filter((k) => k >= KAPPA0).join(', ') || 'none'}`);
console.log(marks.join('\n'));
