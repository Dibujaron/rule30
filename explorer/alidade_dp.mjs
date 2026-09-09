/**
 * The leftmost trajectory the settled background allows, under the advance law
 * AND the survival law together.
 *
 *   node explorer/alidade_dp.mjs
 *
 * Rosetta's greedy walker G uses one law: the front advances exactly when the
 * settled cell on its left is white, and otherwise it may wait. Its speed,
 * 0.50106, is an upper bound for the front's, and Rosetta called it the exact
 * ceiling of what the local law and the background can prove together.
 *
 * There is a second law, and it is also a consequence of rule30_eq and the
 * background alone (explorer/alidade_scratch_survival.lean, kernel-checked).
 * With L, C, R the settled cells at F-1, F, F+1:
 *
 *   L = 0                 the front advances, F -> F - 1              (exactly)
 *   L = 1, C = 0, R = 0   the front's cell survives, F -> F           (exactly)
 *   L = 1, C = 0, R = 1   the front's cell dies, F -> anything > F    (a RETREAT is forced)
 *   L = 1, C = 1          the band decides, F -> F or anything > F
 *
 * So the admissible trajectories form a smaller set than G's, and the leftmost
 * point any of them can reach is a smaller (better) bound. This script computes
 * that leftmost point exactly. The reachable set at each row is a finite set of
 * isolated points together with an upward ray, because "retreat by any amount"
 * generates a ray; the script carries both and reports min(reachable) against
 * time, against G, and against the real front.
 *
 * The question it answers: is the background-only ceiling still above 1/2?
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 300000;
const WIN = 192;           // offsets scanned above the minimum each row
const START = 1000;        // row at which the DP and G are started from the real front
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + WIN + 8; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
const spix = (t, x) => sat(t + x, -x);

// the real front, for the sanity check m(t) <= F(t)
const front = new Int32Array(T).fill(0x7fffffff);
{
  const base = centerBitIndex(T);
  let Fp = 0x7fffffff, t = 0;
  for (const row of rows(T)) {
    let lo, hi;
    if (t < 40) { lo = -t; hi = 0; } else { lo = Math.max(-t, Fp - 2); hi = 0; }
    const width = hi - lo + 1;
    const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
    let Fn = 0x7fffffff;
    for (let x = lo; x <= hi; x++) {
      const b = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
      if (b !== spix(t, x)) { Fn = x; break; }
    }
    front[t] = Fn; Fp = Fn; t++;
  }
  console.log(`real front to t = ${T - 1}: F = ${front[T - 1]} (${(-front[T - 1] / (T - 1)).toFixed(5)} t)  (${Date.now() - t0} ms)`);
}

// --- the DP ---
// reachable set = { m + o : pts[o] } union [m + rayFrom, infinity)
let m = front[START];
let pts = new Uint8Array(WIN); pts[0] = 1;
let rayFrom = 0;                       // the start is a single point, so the ray starts there too
let G = front[START];                  // Rosetta's walker, for comparison
let overWindow = 0, dominationFail = 0, firstDominationFail = -1;
const marks = [];
for (let t = START; t < T - 1; t++) {
  const reachable = (o) => (o >= rayFrom) || (o < WIN && pts[o] === 1);
  let rayNew = Infinity;
  const ptsNew = [];
  let scanned = 0;
  for (let o = 0; o < WIN; o++) {
    if (!reachable(o)) continue;
    scanned++;
    const x = m + o;
    const L = spix(t, x - 1), C = spix(t, x), R = spix(t, x + 1);
    if (L === 0) ptsNew.push(x - 1);                       // advance, exactly
    else if (C === 0 && R === 0) ptsNew.push(x);           // stay, exactly
    else if (C === 0 && R === 1) { if (x + 1 < rayNew) rayNew = x + 1; }   // retreat forced
    else { if (x < rayNew) rayNew = x; }                   // stay or retreat
    if (rayNew < Infinity && x > rayNew + 1) break;        // nothing further can lower the minimum
  }
  if (rayNew === Infinity) { overWindow++; rayNew = m + WIN; }
  const keep = ptsNew.filter((v) => v < rayNew);
  const mNew = keep.length ? Math.min(rayNew, Math.min(...keep)) : rayNew;
  const nextPts = new Uint8Array(WIN);
  for (const v of keep) { const o = v - mNew; if (o >= 0 && o < WIN) nextPts[o] = 1; }
  const nextRay = rayNew - mNew;
  if (nextRay >= WIN) overWindow++;
  m = mNew; pts = nextPts; rayFrom = Math.min(nextRay, WIN);
  // Rosetta's walker on the same background
  G = spix(t, G - 1) === 0 ? G - 1 : G;
  if (m < front[t + 1] - 0) { /* m may be left of F; that is the point */ }
  if (front[t + 1] < m) { dominationFail++; if (firstDominationFail < 0) firstDominationFail = t + 1; }
  if ((t + 1) % 50000 === 0 || t + 1 === T - 1) marks.push([t + 1, m, G, front[t + 1]]);
}
console.log(`\nrows scanned outside the window: ${overWindow} (a nonzero count means WIN = ${WIN} is too small)`);
console.log(`rows where the real front was LEFT of the DP minimum (would break the bound): ${dominationFail}${firstDominationFail >= 0 ? ' (first t = ' + firstDominationFail + ')' : ''}`);
console.log(`\n     t        DP min m(t)   speed      G(t)     speed      real F(t)   speed`);
for (const [t, mm, gg, ff] of marks) {
  const n = t - START;
  console.log(`${String(t).padStart(7)}  ${String(mm).padStart(11)}  ${(-(mm - front[START]) / n).toFixed(5)}  ${String(gg).padStart(8)}  ${(-(gg - front[START]) / n).toFixed(5)}  ${String(ff).padStart(10)}  ${(-(ff - front[START]) / n).toFixed(5)}`);
}
const nn = T - 2 - START;
console.log(`\nbackground-only ceiling under BOTH laws: ${(-(m - front[START]) / nn).toFixed(5)}   ${-(m - front[START]) / nn < 0.5 ? '*** BELOW 1/2 ***' : '(still above 1/2)'}`);
console.log(`background-only ceiling under the advance law alone (Rosetta's G): ${(-(G - front[START]) / nn).toFixed(5)}`);
console.log(`(${Date.now() - t0} ms)`);
