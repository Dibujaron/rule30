/**
 * halfcheck_picture.cjs -- independent rule 30 picture, independent settled
 * words, independent greedy walker.
 *
 *   node explorer/halfcheck_picture.cjs [rows] [tailRows] [outJson]
 *
 * Nothing here imports any other explorer script. Rule 30 is simulated with a
 * packed bitboard from the single seed; the greedy walker is run against the
 * REAL cells while the rows go past (no settled-word machinery at all); and the
 * settled words S_k are recovered afterwards from the last `tailRows` rows by
 * period detection, so the branch choices at eventually-white diagonals are
 * read off the picture rather than taken from anybody's table.
 *
 * Greedy walker, as defined in rosetta_greedy.mjs / rosetta_control.mjs:
 *   state x <= 0 at row t; read cell (t, x-1); if white x -= 1, else x stays;
 *   t += 1 either way.  speed = advances / steps.
 */
'use strict';
const fs = require('fs');

const N = parseInt(process.argv[2] || '260000', 10);
const TAIL = parseInt(process.argv[3] || '1200', 10);
const OUT = process.argv[4] || null;

const OFF = N + 2;                    // column x  ->  bit index i = x + OFF
const NBITS = 2 * N + 5;
const W = ((NBITS + 31) >>> 5) + 2;
const LW = ((OFF + 1 + 31) >>> 5) + 1;  // words covering columns <= 0

let a = new Uint32Array(W), b = new Uint32Array(W);
a[OFF >>> 5] = (a[OFF >>> 5] | (1 << (OFF & 31))) >>> 0;   // row 0: single black cell at x = 0

const ring = new Uint32Array(TAIL * LW);
const getBit = (arr, off, i) => (arr[off + (i >>> 5)] >>> (i & 31)) & 1;

// ---- greedy walkers run against the live picture -------------------------
const BLOCK = parseInt(process.env.HC_BLOCK || '10000', 10);
function mkWalker(t0, x0, label) {
  return { t0, x0, label, x: x0, adv: 0, steps: 0, blocks: [], blockAdv: 0, dead: false, minMargin: Infinity };
}
const walkers = [
  mkWalker(1000, -220, 'picture t0=1000 x0=-220 (Rosetta greedy.mjs start)'),
  mkWalker(1000, -100, 'picture t0=1000 x0=-100'),
  mkWalker(1000, 0, 'picture t0=1000 x0=0'),
  mkWalker(20000, -5024, 'picture t0=20000 x0=-5024'),
  mkWalker(117157, -29289, 'picture t0=117157 x0=-29289 (greedy2 start, kappa=87868)'),
  mkWalker(117162, -29291, 'picture t0=117162 x0=-29291 (== diagonal k=87870, index j=29292)'),
];
const CKPTS = [1000, 10000, 100000, 200000, 250000];

const t00 = Date.now();
let lo = OFF >>> 5, hi = OFF >>> 5;
for (let t = 0; t < N; t++) {
  // record left half of row t
  const slot = (t % TAIL) * LW;
  for (let w = 0; w < LW; w++) ring[slot + w] = a[w];

  // step every live walker on row t: it reads cell (t, x-1)
  for (const g of walkers) {
    if (t < g.t0 || g.dead) continue;
    const i = g.x - 1 + OFF;
    if (g.x - 1 < -t) { g.dead = true; continue; }
    const bit = (a[i >>> 5] >>> (i & 31)) & 1;
    if (bit === 0) { g.x -= 1; g.adv++; g.blockAdv++; }
    g.steps++;
    const margin = 2 * g.x + t;
    if (margin < g.minMargin) g.minMargin = margin;
    if (g.steps % BLOCK === 0) { g.blocks.push(g.blockAdv / BLOCK); g.blockAdv = 0; }
    if (CKPTS.includes(g.steps)) { (g.ck || (g.ck = [])).push(`${g.steps}:${g.adv}`); }
  }

  // one rule 30 step
  const nlo = Math.max(0, ((OFF - t - 2) < 0 ? 0 : (OFF - t - 2) >>> 5));
  const nhi = Math.min(W - 2, (OFF + t + 2) >>> 5);
  if (nlo > 0) b[nlo - 1] = 0;
  b[nhi + 1] = 0;
  for (let w = nlo; w <= nhi; w++) {
    const cur = a[w] >>> 0, prev = w > 0 ? a[w - 1] >>> 0 : 0, nxt = a[w + 1] >>> 0;
    const P = ((cur << 1) | (prev >>> 31)) >>> 0;   // cell at index i-1
    const Q = ((cur >>> 1) | (nxt << 31)) >>> 0;    // cell at index i+1
    b[w] = (P ^ (cur | Q)) >>> 0;
  }
  lo = nlo; hi = nhi;
  const tmp = a; a = b; b = tmp;
}
const simMs = Date.now() - t00;

// ---- settled words from the tail rows ------------------------------------
const MAXP = 512;
const KMAX = N - TAIL - 1;
const samples = new Uint8Array(TAIL);
const periods = new Int16Array(KMAX + 1);
const wordOff = new Int32Array(KMAX + 2);
const wordPool = [];
let poolLen = 0;
const whites = [];
let unsettled = 0;
const t01 = Date.now();
for (let k = 0; k <= KMAX; k++) {
  for (let m = 0; m < TAIL; m++) {
    const t = N - TAIL + m;
    const i = OFF + k - t;                 // column -(t-k)
    const slot = (t % TAIL) * LW;
    samples[m] = getBit(ring, slot, i);
  }
  let p = -1;
  for (let q = 1; q <= MAXP; q *= 2) {
    let ok = true;
    for (let m = q; m < TAIL; m++) if (samples[m] !== samples[m - q]) { ok = false; break; }
    if (ok && TAIL >= 4 * q) { p = q; break; }
  }
  if (p < 0) { periods[k] = -1; unsettled++; wordOff[k] = poolLen; continue; }
  periods[k] = p;
  wordOff[k] = poolLen;
  const j0 = N - TAIL - k;                 // j of samples[0]
  const w = new Uint8Array(p);
  for (let m = 0; m < p; m++) w[(((j0 + m) % p) + p) % p] = samples[m];
  let allZero = true;
  for (let m = 0; m < p; m++) if (w[m]) { allZero = false; break; }
  if (allZero) whites.push(k);
  wordPool.push(w); poolLen += p;
}
wordOff[KMAX + 1] = poolLen;
const settleMs = Date.now() - t01;

const at = (k, j) => { const p = periods[k]; return wordPool[k][(((j % p) + p) % p)]; };

// ---- check the diagonal recurrence on the recovered words ----------------
// S_{k+1}(j) = S_{k-1}(j+1) xor (S_k(j) or S_{k+1}(j-1))
let recOk = 0, recBad = 0; const badAt = [];
for (let k = 1; k + 1 <= KMAX; k++) {
  if (periods[k - 1] < 0 || periods[k] < 0 || periods[k + 1] < 0) continue;
  const q = Math.max(periods[k - 1], periods[k], periods[k + 1]) * 2;
  let ok = true;
  for (let j = 0; j < q; j++) if (at(k + 1, j) !== (at(k - 1, j + 1) ^ (at(k, j) | at(k + 1, j - 1)))) { ok = false; break; }
  if (ok) recOk++; else { recBad++; if (badAt.length < 6) badAt.push(k + 1); }
}

// ---- word statistics ------------------------------------------------------
// density of ones; R_k = mean gap from a uniform start = (sum g^2 - p) / (2p)
function wordStats(k) {
  const p = periods[k], w = wordPool[k];
  let ones = 0; for (let j = 0; j < p; j++) ones += w[j];
  if (ones === 0) return { p, ones, R: Infinity };
  let sumg2 = 0, prev = -1, first = -1;
  for (let j = 0; j < p; j++) if (w[j]) { if (prev < 0) first = j; else sumg2 += (j - prev) * (j - prev); prev = j; }
  const wrap = (first + p) - prev; sumg2 += wrap * wrap;
  return { p, ones, R: (sumg2 - p) / (2 * p) };
}

const t02 = Date.now();
console.log(`rule 30 picture: ${N} rows (${simMs} ms sim, ${settleMs} ms settle)`);
console.log(`settled diagonals 0..${KMAX}: ${KMAX + 1 - unsettled} settled, ${unsettled} unsettled (tail ${TAIL}, max period ${MAXP})`);
console.log(`recurrence S_{k+1}(j) = S_{k-1}(j+1) xor (S_k(j) or S_{k+1}(j-1)): ${recOk} agree, ${recBad} disagree${badAt.length ? ' (first ' + badAt.join(',') + ')' : ''}`);
console.log(`eventually-white diagonals k <= ${KMAX}: ${whites.join(', ')}`);

// period regimes
const regimes = [];
{
  let start = 0, cur = periods[0];
  for (let k = 1; k <= KMAX; k++) {
    if (periods[k] !== cur) { regimes.push({ from: start, to: k - 1, p: cur }); start = k; cur = periods[k]; }
  }
  regimes.push({ from: start, to: KMAX, p: cur });
}
{
  const hist = new Map();
  for (let k = 0; k <= KMAX; k++) hist.set(periods[k], (hist.get(periods[k]) || 0) + 1);
  console.log(`minimal-period histogram over k in [0..${KMAX}]: ${[...hist.entries()].sort((a, b) => a[0] - b[0]).map(([p, c]) => `${p}:${c}`).join(' ')}`);
  // running max of the minimal period = the "regime" period q_k
  let mx = 0; const jumps = [];
  for (let k = 0; k <= KMAX; k++) if (periods[k] > mx) { mx = periods[k]; jumps.push(`${mx}@k=${k}`); }
  console.log(`running max of minimal period (period regime boundaries): ${jumps.join(' ')}`);
  console.log(`long period regimes (len >= 200): ${regimes.filter((r) => r.to - r.from >= 199).map((r) => `[${r.from}..${r.to}]=${r.p}`).slice(0, 40).join(' ')}`);
}

// word statistics over k-windows: black density and R (uniform-start mean gap)
function statWindow(from, to) {
  let sumOnes = 0, sumP = 0, sumR = 0, n = 0, inf = 0, maxp = 0;
  for (let k = from; k <= to && k <= KMAX; k++) {
    if (periods[k] < 0) continue;
    const s = wordStats(k);
    maxp = Math.max(maxp, s.p);
    if (!isFinite(s.R)) { inf++; continue; }
    sumOnes += s.ones; sumP += s.p; sumR += s.R; n++;
  }
  if (!n) return null;
  const R = sumR / n;
  return { from, to, n, maxp, dens: sumOnes / sumP, R, sp: R / (1 + R), inf };
}
console.log('\nsettled-word statistics by k-window (black density; R = mean gap from a UNIFORM start):');
const wins = [[400, 3000], [3000, 10000], [10000, 53206], [53208, 58285], [58287, 87865], [87868, 150000], [150000, 250000], [250000, KMAX]];
for (const [f, t] of wins) {
  const s = statWindow(f, t);
  if (!s) continue;
  console.log(`  k in [${s.from}..${s.to}] n=${s.n} maxMinPeriod=${s.maxp}: density ${s.dens.toFixed(6)}, R ${s.R.toFixed(6)} -> uniform-entry speed ${s.sp.toFixed(6)}`);
}

// ---- walker results -------------------------------------------------------
console.log('\ngreedy walker run directly on the real picture cells:');
for (const g of walkers) {
  if (g.steps === 0) { console.log(`  ${g.label}: no steps`); continue; }
  const sp = g.adv / g.steps;
  const bl = g.blocks;
  const mean = bl.length ? bl.reduce((s, v) => s + v, 0) / bl.length : NaN;
  const sd = bl.length > 1 ? Math.sqrt(bl.reduce((s, v) => s + (v - mean) * (v - mean), 0) / (bl.length - 1)) : NaN;
  const sem = sd / Math.sqrt(bl.length);
  console.log(`  ${g.label}`);
  console.log(`    steps ${g.steps} (rows ${g.t0}..${g.t0 + g.steps - 1}), advances ${g.adv}, final x ${g.x}, kappa ${g.t0 + g.steps - 1 + g.x}`);
  console.log(`    speed ${sp.toFixed(6)}; blocks of ${BLOCK}: n=${bl.length} mean ${mean.toFixed(6)} sd ${sd.toFixed(6)} sem ${sem.toFixed(6)}  -> (speed-0.5)/sem = ${((sp - 0.5) / sem).toFixed(2)}`);
  console.log(`    min 2x+t over the run: ${g.minMargin}${g.dead ? '  [WALKER LEFT THE CONE]' : ''}`);
  if (g.ck) console.log(`    advances at checkpoints (steps:advances) ${g.ck.join(' ')}`);
}

// coalescence: do the three t0=1000 walkers end at the same x?
console.log(`\ncoalescence check at row ${N - 1}: x = ${walkers.slice(0, 3).map((g) => g.x).join(', ')} for starts x0 = -220, -100, 0`);

if (OUT) {
  // dump consecutive settled-word pairs to seed long recurrence runs
  const seeds = [];
  for (const K0 of [500, 1000, 20000, 53210, 58290, 87868, 120000, 200000, 300000]) {
    if (K0 + 1 > KMAX || periods[K0] < 0 || periods[K0 + 1] < 0) continue;
    seeds.push({ k: K0, wordA: Array.from(wordPool[K0]), wordB: Array.from(wordPool[K0 + 1]) });
  }
  // also dump a sample of individual words for spot-checking the recurrence run
  const spot = [];
  for (const k of [1500, 5000, 40000, 53000, 90000, 150000, 250000, 380000]) {
    if (k <= KMAX && periods[k] > 0) spot.push({ k, word: Array.from(wordPool[k]) });
  }
  const dump = { rows: N, tail: TAIL, kmax: KMAX, whites, seeds, spot };
  fs.writeFileSync(OUT, JSON.stringify(dump));
  console.log(`\nwrote ${OUT}: seeds at k = ${seeds.map((s) => s.k).join(', ')}; spot words at k = ${spot.map((s) => s.k).join(', ')}`);
}
console.log(`(report ${Date.now() - t02} ms)`);
