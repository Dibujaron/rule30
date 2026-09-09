/**
 * The coboundary sweep, deep and wide: is any difference
 *
 *     d_{j,x}(t) = centerColumn t XOR cell(t + j, x)
 *
 * eventually periodic? Portage (connector, 2026-09-08) ran 1,616 pairs,
 * |x| <= 24, j in [-8, 24], p <= 4096, on t in [20,000, 60,000). This widens
 * the range and deepens the window, and adds three things his sweep did not
 * have:
 *
 *   1. the length of the d = 0 PREFIX for every pair, which is the eventually
 *      zero family: d = 0 on [0, m) says the seed's picture agrees with its own
 *      (j, x)-shift down the centre column for m rows, and the pair (j, x) with
 *      the largest m is the nearest thing to a witness the picture holds;
 *   2. the diagonal family x = j = L for every L <= 320, not only powers of two;
 *   3. a xorshift32 control through the identical code path, so the survival
 *      numbers are read against a coin rather than against nothing.
 *
 * Nothing here is a proof. See explorer/README.md.
 *
 *   node explorer/sextant_diffsweep.mjs
 */

import { rows, centerBitIndex } from './rule30.mjs';

const T = 400000;              // rows grown
const W = 200;                 // columns kept: x in [-W, W]
const XSWEEP = 150;            // full (x, j) sweep for |x| <= XSWEEP
const JMIN = -32, JMAX = 96;   // time offsets in the full sweep
const PMAX = 16384;            // periods tested
const T0 = 200000;             // periodicity must hold from here ...
const T1 = T - JMAX - 8;       // ... to here
const CONSTSCAN = 20000;       // longest-constant-run scan window

const t0 = Date.now();
const center = centerBitIndex(T);

// ---------------------------------------------------------------------------
// columns, extracted one 32-bit word at a time from a window of the row
// ---------------------------------------------------------------------------

const WBITS = 2 * W + 1;
const NWORDS = Math.ceil(WBITS / 32);
const MASK = (1n << BigInt(WBITS)) - 1n;
const M32 = 0xffffffffn;
const LOSHIFT = BigInt(center - W);

/** cols[x + W] is column x as a Uint8Array of length T. */
const cols = [];
for (let k = 0; k < WBITS; k++) cols.push(new Uint8Array(T));

{
  let t = 0;
  const w32 = new Uint32Array(NWORDS);
  for (const row of rows(T)) {
    let w = (row >> LOSHIFT) & MASK;
    for (let k = 0; k < NWORDS; k++) { w32[k] = Number(w & M32); w >>= 32n; }
    for (let b = 0; b < WBITS; b++) {
      cols[b][t] = (w32[b >> 5] >>> (b & 31)) & 1;
    }
    t++;
  }
}
const col = (x) => cols[x + W];
const c0 = col(0);
console.log(`grown ${T} rows, ${WBITS} columns, ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// sanity checks on the extraction
{
  const head = Array.from(c0.slice(0, 21)).join('');
  const want = '110111001100010110010';
  console.log(`column 0 head ${head} ${head === want ? 'OK (A051023)' : 'MISMATCH want ' + want}`);
  let coneBad = 0;
  for (let x = -W; x <= W; x++) {
    const a = Math.abs(x), c = col(x);
    for (let t = 0; t < a; t++) if (c[t] !== 0) coneBad++;   // outside the cone
    if (c[a] !== 1) coneBad++;                               // the two edges are black
  }
  console.log(`cone check (white before |x|, black at |x|, all ${WBITS} columns): ${coneBad} violations`);
}

// ---------------------------------------------------------------------------
// statistics of one difference sequence
// ---------------------------------------------------------------------------

/** how long d stays 0 from its first defined index. */
function zeroPrefix(d, lo, hi) {
  let t = lo;
  while (t < hi && d[t] === 0) t++;
  return t - lo;
}

/** longest run of a constant value, scanning [lo, hi). */
function constRun(d, lo, hi) {
  let best = 0, bestAt = -1, run = 1;
  for (let t = lo + 1; t < hi; t++) {
    if (d[t] === d[t - 1]) run++;
    else { if (run > best) { best = run; bestAt = t - run; } run = 1; }
  }
  if (run > best) { best = run; bestAt = hi - run; }
  return [best, bestAt];
}

/** for each p <= PMAX, how far past `lo` does p-periodicity of d survive? */
function bestPeriodRun(d, lo, hi) {
  let best = -1, bestP = 0;
  for (let p = 1; p <= PMAX; p++) {
    let t = lo;
    while (t + p < hi && d[t + p] === d[t]) t++;
    if (t + p >= hi) return [Infinity, p];   // survived the whole window
    const run = t - lo;
    if (run > best) { best = run; bestP = p; }
  }
  return [best, bestP];
}

function diff(colx, j, out) {
  const lo = Math.max(0, -j), hi = T - Math.max(0, j);
  for (let t = lo; t < hi; t++) out[t] = c0[t] ^ colx[t + j];
  return [lo, hi];
}

// ---------------------------------------------------------------------------
// the full sweep
// ---------------------------------------------------------------------------

function sweep(colOf, label) {
  const d = new Uint8Array(T);
  let survivors = 0, pairs = 0;
  let bestRun = -1, bestRunAt = null;
  let bestConst = -1, bestConstAt = null;
  let bestZero = -1, bestZeroAt = null;
  for (let x = -XSWEEP; x <= XSWEEP; x++) {
    if (x === 0) continue;
    const cx = colOf(x);
    for (let j = JMIN; j <= JMAX; j++) {
      pairs++;
      const [lo, hi] = diff(cx, j, d);

      const z = zeroPrefix(d, lo, hi);
      if (z > bestZero) { bestZero = z; bestZeroAt = [x, j]; }

      const [cr, crAt] = constRun(d, lo, Math.min(hi, CONSTSCAN));
      if (cr > bestConst) { bestConst = cr; bestConstAt = [x, j, crAt]; }

      const [run, p] = bestPeriodRun(d, T0, Math.min(hi, T1));
      if (run === Infinity) { survivors++; console.log(`  SURVIVOR ${label} x=${x} j=${j} p=${p}`); }
      else if (run > bestRun) { bestRun = run; bestRunAt = [x, j, p]; }
    }
  }
  console.log(`${label}: ${pairs} pairs (|x| <= ${XSWEEP}, ${JMIN} <= j <= ${JMAX}), p <= ${PMAX} on [${T0}, ${T1})`);
  console.log(`  survivors: ${survivors}`);
  console.log(`  longest partial period run past t=${T0}: ${bestRun} at x=${bestRunAt[0]} j=${bestRunAt[1]} p=${bestRunAt[2]}`);
  console.log(`  longest constant run of d in [0, ${CONSTSCAN}): ${bestConst} at x=${bestConstAt[0]} j=${bestConstAt[1]} from t=${bestConstAt[2]}`);
  console.log(`  longest d = 0 prefix: ${bestZero} at x=${bestZeroAt[0]} j=${bestZeroAt[1]}`);
}

sweep(col, 'seed');

// ---------------------------------------------------------------------------
// the diagonal family x = j = L: d_L(t) = c(t) xor cell(t + L, L), a Birkhoff
// sum of the level cocycle over a window of fixed length L (Portage 3.2).
// d_L = 0 while every right diagonal shallower than t has a period dividing L.
// ---------------------------------------------------------------------------

console.log('\ndiagonal family x = j = L:');
{
  const d = new Uint8Array(T);
  let bestZero = -1, bestZeroAt = -1, survivors = 0;
  const notable = [];
  for (let L = 1; L <= W; L++) {
    const [lo, hi] = diff(col(L), L, d);
    const z = zeroPrefix(d, lo, hi);
    if (z > bestZero) { bestZero = z; bestZeroAt = L; }
    const [run, p] = bestPeriodRun(d, T0, Math.min(hi, T1));
    if (run === Infinity) { survivors++; console.log(`  SURVIVOR L=${L} p=${p}`); }
    if ((L & (L - 1)) === 0 || z >= 8) {
      let ones = 0;
      for (let t = T0; t < T1; t++) ones += d[t];
      notable.push(`  L=${L}: d = 0 on [0, ${z}), density ${(ones / (T1 - T0)).toFixed(4)}, longest partial run ${run} at p=${p}`);
    }
  }
  for (const s of notable) console.log(s);
  console.log(`  survivors: ${survivors}; longest d = 0 prefix over L <= ${W}: ${bestZero} at L=${bestZeroAt}`);
}

// ---------------------------------------------------------------------------
// the control
// ---------------------------------------------------------------------------

console.log('');
{
  let s = 0x9e3779b9;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  const fake = [];
  for (let x = -XSWEEP; x <= XSWEEP; x++) {
    const a = new Uint8Array(T);
    for (let t = 0; t < T; t++) a[t] = rnd();
    fake.push(a);
  }
  sweep((x) => fake[x + XSWEEP], 'xorshift control');
}

console.log(`\ntotal ${((Date.now() - t0) / 1000).toFixed(1)}s`);
