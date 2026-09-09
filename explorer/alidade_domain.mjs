/**
 * Is the settled background a *regular domain* in Crutchfield and Hanson's
 * sense, and could any domain filter find the seam?
 *
 *   node explorer/alidade_domain.mjs
 *
 * Hanson & Crutchfield, Physica D 103 (1997) 169-189, define a regular domain as
 * a process language L with (i) a finite temporal period, Phi^p L = L, and
 * (ii) a strongly connected process graph; and a domain filter as a finite-state
 * transducer that reads a configuration LEFT TO RIGHT and writes one symbol per
 * site saying which domain or defect that site belongs to. Both halves are about
 * a *row*. So the question this script asks is the one that decides whether the
 * programme can start here at all:
 *
 *   does a row of the settled picture look different from a row of the band?
 *
 * It measures the factor complexity of both: the number of distinct words of
 * each length n that occur in rows of the settled picture S deep inside the
 * settled region, and in rows of the real picture deep inside the transient
 * band. If both are 2^n, the two phases have the same row language, the smallest
 * sofic shift containing either is the full shift, and no FST reading a row can
 * tell one from the other -- the filter flags either everything or nothing.
 *
 * It also reports the two phases' block entropies, which is what a shock
 * condition would need a jump in.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 60000;           // engine rows
const NMAX = 22;           // longest word length counted
const SETTLED_ROWS = 400;  // rows sampled for the settled phase
const SETTLED_SPAN = 40000;// cells per sampled settled row
const BAND_FROM = 30000;   // engine rows [BAND_FROM, T) sampled for the band
const BAND_SPAN = 4000;    // cells per sampled band row, ending at the origin
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + SETTLED_SPAN + 8; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
const spix = (t, x) => sat(t + x, -x);
console.log(`settled words ready (${Date.now() - t0} ms)`);

/** one bitset per word length, plus the block-entropy counts for n <= 16. */
function makeCounter() {
  const seen = [];
  for (let n = 1; n <= NMAX; n++) seen.push(new Uint8Array(1 << n));
  return { seen, total: 0, hist: new Map() };
}
const HIST_N = 12;
function feed(c, bit) {
  c.acc = (((c.acc || 0) << 1) | bit) >>> 0;
  c.len = (c.len || 0) + 1;
  for (let n = 1; n <= NMAX; n++) {
    if (c.len < n) break;
    const w = c.acc & ((1 << n) - 1);
    c.seen[n - 1][w] = 1;
  }
  if (c.len >= HIST_N) { const w = c.acc & ((1 << HIST_N) - 1); c.hist.set(w, (c.hist.get(w) || 0) + 1); c.total++; }
}
function reset(c) { c.acc = 0; c.len = 0; }
function report(name, c) {
  const lines = [];
  for (let n = 1; n <= NMAX; n++) {
    let k = 0;
    const a = c.seen[n - 1];
    for (let i = 0; i < a.length; i++) k += a[i];
    lines.push(`${n}:${k}${k === (1 << n) ? '=2^n' : '/' + (1 << n)}`);
  }
  console.log(`${name}: distinct factors  ${lines.join(' ')}`);
  let h = 0;
  for (const v of c.hist.values()) { const p = v / c.total; h -= p * Math.log2(p); }
  console.log(`${name}: block entropy H(${HIST_N})/${HIST_N} = ${(h / HIST_N).toFixed(5)} bits/cell over ${c.total} windows`);
}

// --- the settled phase: rows of S far left of the seam (x <= -0.6 t) ---
const settled = makeCounter();
let ones = 0, cells = 0;
for (let i = 0; i < SETTLED_ROWS; i++) {
  const t = T - 1 - i * 7;
  // x runs from -0.9t to -0.6t, so the diagonal index k = t + x runs over
  // [0.1t, 0.4t]: every cell is deep inside the settled region.
  const x1 = -Math.floor(0.6 * t), x0 = -Math.floor(0.9 * t);
  reset(settled);
  for (let x = x0; x <= x1; x++) { const b = spix(t, x); feed(settled, b); ones += b; cells++; }
}
console.log(`settled phase: ${cells} cells, black density ${(ones / cells).toFixed(5)} (${Date.now() - t0} ms)`);
report('settled', settled);

// --- the band phase: rows of the real picture near the origin ---
const band = makeCounter();
const base = centerBitIndex(T);
let bones = 0, bcells = 0, brows = 0;
let t = 0;
for (const row of rows(T)) {
  if (t >= BAND_FROM && t % 3 === 0) {
    const lo = -BAND_SPAN, hi = 0, width = hi - lo + 1;
    const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
    reset(band);
    for (let x = lo; x <= hi; x++) { const b = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0; feed(band, b); bones += b; bcells++; }
    brows++;
  }
  t++;
}
console.log(`band phase: ${brows} rows, ${bcells} cells, black density ${(bones / bcells).toFixed(5)} (${Date.now() - t0} ms)`);
report('band', band);

// --- the same question along a DIAGONAL, where the settled region does differ ---
// A settled word of period p has at most p distinct factors of each length, so
// the diagonal language of the settled region at depth k is finite of size p_k,
// while the band's is not. This is where the two phases separate.
const dperiods = new Map();
for (let k = 1000; k < 60000; k++) dperiods.set(periods[k], (dperiods.get(periods[k]) || 0) + 1);
console.log(`\nsettled-word periods over diagonals 1000..60000: ${[...dperiods.entries()].sort((a, b) => a[0] - b[0]).map(([p, n]) => `${p}:${n}`).join(' ')}`);
console.log(`   a period-p word has exactly p distinct factors of every length, so a filter reading a DIAGONAL needs >= p states; the periods are unbounded (leftDiagonal_period_unbounded).`);
console.log(`(${Date.now() - t0} ms)`);
