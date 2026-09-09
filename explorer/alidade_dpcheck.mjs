/**
 * An independent, deliberately stupid implementation of the reachable set, to
 * check the ray bookkeeping in explorer/alidade_dp2.mjs.
 *
 *   node explorer/alidade_dpcheck.mjs
 *
 * dp2 carries the reachable set as "a finite set of isolated points plus an
 * upward ray", which is the only clever thing in it and therefore the only place
 * a bug could hide and still produce a plausible number. This script carries the
 * set as a plain boolean array over a bounded horizon instead -- every position
 * from the minimum out to HORIZON, updated cell by cell with no ray and no early
 * exit -- and compares the two minima row by row. Truncating the set at HORIZON
 * can only remove reachable positions, and removing positions can only raise the
 * minimum, so a disagreement in which the naive minimum is LOWER is a real bug
 * in dp2; a disagreement the other way would be the horizon biting.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF } from './settledwords.mjs';

const KSTART = 100000;
const ROWS = 200000;
const WIN = 256;        // dp2's window
const HORIZON = 3000;   // the naive implementation's bounded set
const BUF = 8192;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const buf = new Array(BUF);
let prev2 = { p: 1, onset: 0, word: Uint8Array.of(1) }, prev1 = { p: 1, onset: 0, word: Uint8Array.of(1) };
buf[0 % BUF] = prev2; buf[1 % BUF] = prev1;
let kMade = 1;
function ensure(k) {
  while (kMade < k) {
    const next = kMade + 1;
    const sols = solveF(prev2, prev1);
    let s;
    if (sols.length === 1) s = sols[0];
    else { if (!BRANCH.has(next)) throw new Error(`unexpected branch at k = ${next}`); s = sols[BRANCH.get(next)]; }
    prev2 = prev1; prev1 = s; kMade = next; buf[next % BUF] = s;
  }
}
const spix = (t, x) => { const k = t + x, s = buf[k % BUF], p = s.p, j = -x; return s.word[((j % p) + p) % p]; };

let t = Math.round(KSTART * 4 / 3);
const x0 = KSTART - t;
ensure(t + x0 + HORIZON + 8);

// --- implementation A: dp2's points-plus-ray ---
let mA = x0, ptsA = new Uint8Array(WIN), rayA = 0;
ptsA[0] = 1;
// --- implementation B: a plain boolean array over [mB, mB + HORIZON) ---
let mB = x0;
let setB = new Uint8Array(HORIZON).fill(1);   // the start is the whole ray, truncated

let disagree = 0, firstDisagree = -1, bLower = 0;
for (let step = 0; step < ROWS; step++) {
  ensure(t + Math.min(mA, mB) + HORIZON + 8);
  // A
  {
    let rayNew = Infinity;
    const ptsNew = [];
    for (let o = 0; o < WIN; o++) {
      if (!(o >= rayA || ptsA[o] === 1)) continue;
      const x = mA + o;
      const L = spix(t, x - 1), C = spix(t, x), R = spix(t, x + 1);
      if (L === 0) ptsNew.push(x - 1);
      else if (C === 0 && R === 0) ptsNew.push(x);
      else if (C === 0 && R === 1) { if (x + 1 < rayNew) rayNew = x + 1; }
      else { if (x < rayNew) rayNew = x; }
      if (rayNew < Infinity && x > rayNew + 1) break;
    }
    if (rayNew === Infinity) rayNew = mA + WIN;
    let mNew = rayNew;
    for (const v of ptsNew) if (v < mNew) mNew = v;
    const nextPts = new Uint8Array(WIN);
    for (const v of ptsNew) { if (v >= rayNew) continue; const o = v - mNew; if (o >= 0 && o < WIN) nextPts[o] = 1; }
    mA = mNew; ptsA = nextPts; rayA = Math.min(rayNew - mNew, WIN);
  }
  // B: no ray, no early exit, explicit positions only
  {
    const out = new Uint8Array(HORIZON);
    let mNew = Infinity;
    for (let o = 0; o < HORIZON; o++) {
      if (setB[o] !== 1) continue;
      const x = mB + o;
      const L = spix(t, x - 1), C = spix(t, x), R = spix(t, x + 1);
      let lo, hi;
      if (L === 0) { lo = x - 1; hi = x - 1; }
      else if (C === 0 && R === 0) { lo = x; hi = x; }
      else if (C === 0 && R === 1) { lo = x + 1; hi = mB + HORIZON; }
      else { lo = x; hi = mB + HORIZON; }
      if (lo < mNew) mNew = lo;
      // record into a temporary absolute window based at mB - 1
      for (let v = lo; v <= hi; v++) { const oo = v - (mB - 1); if (oo >= 0 && oo < HORIZON) out[oo] = 1; }
    }
    const shift = mNew - (mB - 1);
    const nxt = new Uint8Array(HORIZON);
    for (let o = 0; o + shift < HORIZON; o++) nxt[o] = out[o + shift];
    mB = mNew; setB = nxt;
  }
  t++;
  if (mA !== mB) {
    disagree++;
    if (firstDisagree < 0) firstDisagree = step;
    if (mB < mA) bLower++;
  }
}
console.log(`${ROWS} rows compared, horizon ${HORIZON}, window ${WIN}`);
console.log(`   minima disagree on ${disagree} rows${firstDisagree >= 0 ? ' (first at step ' + firstDisagree + ')' : ''}; of those, the naive one was LOWER on ${bLower} (any such row is a bug in dp2)`);
console.log(`   final: dp2's minimum ${mA} (speed ${(-(mA - x0) / ROWS).toFixed(5)}), naive minimum ${mB} (speed ${(-(mB - x0) / ROWS).toFixed(5)})`);
console.log(`(${Date.now() - t0} ms)`);
