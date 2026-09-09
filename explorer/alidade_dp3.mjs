/**
 * Controls for the background-only ceiling of explorer/alidade_dp2.mjs.
 *
 *   node explorer/alidade_dp3.mjs
 *
 * dp2 measures 0.45310 for the leftmost trajectory the settled words allow under
 * the advance law and the survival law together, against 0.50125 for the advance
 * law alone. A number below 1/2 is exactly what the onset wall needs and what
 * crystals A3 says is not available, so it has to be controlled before it is
 * believed. Three backgrounds through the same code path:
 *
 *   real       the settled words, as dp2
 *   random     pseudo-random bits of density 1/2
 *   phase      the real settled words with each diagonal's phase randomised
 *
 * If the random control also lands near 0.453, the bound is a property of the
 * two LAWS rather than of rule 30's background -- which would be a stronger
 * statement, not a weaker one, since it would hold for any 1/2-dense
 * background. If the random control lands at 1/2 or above, the excess is
 * structural and the estimator needs looking at.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF } from './settledwords.mjs';

const KSTART = 100000;
const ROWS = 2000000;
const WIN = 256;
const BUF = 4096;
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

/** a deterministic 32-bit hash, used for the two controls. */
function hash(a, b) {
  let h = (a * 0x9e3779b1) ^ (b * 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h ^= h >>> 12;
  h = Math.imul(h ^ (h >>> 16), 0x297a2d39); h ^= h >>> 15;
  return h >>> 0;
}

function run(mode) {
  let t = Math.round(KSTART * 4 / 3);
  const x0 = KSTART - t;
  ensure(t + x0 + WIN + 4);
  const cell = (tt, x) => {
    const k = tt + x, j = -x;
    if (mode === 'random') return hash(k, j) & 1;
    const s = buf[k % BUF];
    if (!s) throw new Error(`word ${k} out of buffer`);
    const p = s.p;
    const shift = mode === 'phase' ? hash(k, 0) % p : 0;
    return s.word[(((j + shift) % p) + p) % p];
  };
  let m = x0, G = x0;
  let pts = new Uint8Array(WIN); pts[0] = 1;
  let rayFrom = 0, overWindow = 0;
  const mStart = m, gStart = G;
  const blocks = [];
  let lastM = m, lastS = 0;
  for (let step = 0; step < ROWS; step++) {
    ensure(t + m + WIN + 4);
    let rayNew = Infinity;
    const ptsNew = [];
    for (let o = 0; o < WIN; o++) {
      if (!(o >= rayFrom || pts[o] === 1)) continue;
      const x = m + o;
      const L = cell(t, x - 1), C = cell(t, x), R = cell(t, x + 1);
      if (L === 0) ptsNew.push(x - 1);
      else if (C === 0 && R === 0) ptsNew.push(x);
      else if (C === 0 && R === 1) { if (x + 1 < rayNew) rayNew = x + 1; }
      else { if (x < rayNew) rayNew = x; }
      if (rayNew < Infinity && x > rayNew + 1) break;
    }
    if (rayNew === Infinity) { overWindow++; rayNew = m + WIN; }
    let mNew = rayNew;
    for (const v of ptsNew) if (v < mNew) mNew = v;
    const nextPts = new Uint8Array(WIN);
    for (const v of ptsNew) { if (v >= rayNew) continue; const o = v - mNew; if (o >= 0 && o < WIN) nextPts[o] = 1; }
    const nextRay = rayNew - mNew;
    if (nextRay >= WIN) overWindow++;
    m = mNew; pts = nextPts; rayFrom = Math.min(nextRay, WIN);
    G = cell(t, G - 1) === 0 ? G - 1 : G;
    t++;
    if ((step + 1) % 250000 === 0) { blocks.push(-(m - lastM) / (step + 1 - lastS)); lastM = m; lastS = step + 1; }
  }
  return { dp: -(m - mStart) / ROWS, g: -(G - gStart) / ROWS, overWindow, blocks };
}

for (const mode of ['real', 'random', 'phase']) {
  const r = run(mode);
  console.log(`${mode.padEnd(7)}: DP ${r.dp.toFixed(5)} ${r.dp < 0.5 ? '(below 1/2)' : '(at or above 1/2)'}, G ${r.g.toFixed(5)}, window overflows ${r.overWindow}`);
  console.log(`          DP over blocks of 250000: ${r.blocks.map((b) => b.toFixed(5)).join(' ')}`);
}
console.log(`(${Date.now() - t0} ms)`);
