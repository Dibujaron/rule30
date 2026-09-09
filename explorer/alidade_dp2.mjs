/**
 * The background-only ceiling under both laws, on a channel-free stretch.
 *
 *   node explorer/alidade_dp2.mjs
 *
 * explorer/alidade_dp.mjs computes the leftmost trajectory the settled words
 * allow under the advance law and the survival law together, but it starts at
 * row 1000 and both it and Rosetta's walker G escape onto the infinite white
 * channel at diagonal 53,208 after about 107,000 rows, after which every step is
 * a free advance and the measured speed is meaningless. The eventually-white
 * diagonals below 10^9 are 3, 8, 29, 400, 53208, 58287, 87867 and then
 * 1,420,878,968, so the stretch from diagonal 87,868 up is channel-free -- the
 * same stretch Rosetta measured G on, getting 0.50106 over 2*10^8 rows.
 *
 * This script runs the DP there, with no engine at all: the settled words are
 * generated on the fly into a rolling buffer, so the run costs O(rows) rather
 * than O(rows^2). The number it reports is the honest comparison with 0.50106.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF } from './settledwords.mjs';

const KSTART = 100000;      // the diagonal the walkers start on (past the last channel below 10^9)
const ROWS = 4000000;       // rows to run
const WIN = 256;            // offsets scanned above the minimum each row
const BUF = 4096;           // rolling buffer of settled words, indexed by k mod BUF
const BLOCK = 500000;
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
const sat = (k) => { const s = buf[k % BUF]; if (!s) throw new Error(`word ${k} fell out of the buffer`); return s; };
const spix = (t, x) => { const k = t + x, s = sat(k), p = s.p, j = -x; return s.word[((j % p) + p) % p]; };

// start: put the walkers on diagonal KSTART. Any (t, x) with t + x = KSTART does;
// take x = -KSTART/3 so the geometry resembles the real front's.
let t = Math.round(KSTART * 4 / 3);
const x0 = KSTART - t;
ensure(t + x0 + WIN + 4);
console.log(`start: t = ${t}, x = ${x0}, diagonal ${t + x0}; running ${ROWS} rows (${Date.now() - t0} ms)`);

let m = x0, G = x0;
let pts = new Uint8Array(WIN); pts[0] = 1;
let rayFrom = 0;
let overWindow = 0;
const marks = [];
const mStart = m, gStart = G, tStart = t;
for (let step = 0; step < ROWS; step++) {
  ensure(t + m + WIN + 4);
  const reachable = (o) => (o >= rayFrom) || pts[o] === 1;
  let rayNew = Infinity;
  const ptsNew = [];
  for (let o = 0; o < WIN; o++) {
    if (!reachable(o)) continue;
    const x = m + o;
    const L = spix(t, x - 1), C = spix(t, x), R = spix(t, x + 1);
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
  G = spix(t, G - 1) === 0 ? G - 1 : G;
  t++;
  if ((step + 1) % BLOCK === 0) marks.push([step + 1, m, G]);
}
console.log(`\nrows where the window was too small: ${overWindow} (must be 0)`);
console.log(`   steps        DP min      speed      G           speed`);
let lastM = mStart, lastG = gStart, lastS = 0;
for (const [s, mm, gg] of marks) {
  console.log(`${String(s).padStart(9)}  ${String(mm).padStart(12)}  ${(-(mm - mStart) / s).toFixed(5)}  ${String(gg).padStart(10)}  ${(-(gg - gStart) / s).toFixed(5)}    [block: DP ${(-(mm - lastM) / (s - lastS)).toFixed(5)}, G ${(-(gg - lastG) / (s - lastS)).toFixed(5)}]`);
  lastM = mm; lastG = gg; lastS = s;
}
const dp = -(m - mStart) / ROWS, g = -(G - gStart) / ROWS;
console.log(`\nbackground-only ceiling under the advance law ALONE (Rosetta's G): ${g.toFixed(5)}`);
console.log(`background-only ceiling under BOTH laws (this DP):                ${dp.toFixed(5)}   ${dp < 0.5 ? '*** BELOW 1/2 ***' : '(still above 1/2)'}`);
console.log(`diagonals covered: ${tStart + mStart} .. ${t + m}`);
console.log(`(${Date.now() - t0} ms)`);
