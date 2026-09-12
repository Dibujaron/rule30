/**
 * Ephemeris, 2026-09-12, connector session on the vantage
 *   "the subshift of the centre column itself".
 *
 * Four questions, all about the orbit closure X_c of the centre column c under
 * the shift, and its omega-limit set Omega_c:
 *
 *  (A) Does the all-white point 0^inf lie in X_c?  Equivalently: are the white
 *      runs of c unbounded?  Measured as longest run inside [0, 10^k].
 *  (B) Is the language of Omega_c all of {0,1}^*?  Measured as: how many words
 *      of each length are MISSING from a tail of c, against the coupon-collector
 *      prediction for a fair coin of the same length.  A deficit matching the
 *      prediction is no evidence of any forbidden word.
 *  (C) Is X_c minimal (equivalently, is c uniformly recurrent)?  Measured as the
 *      largest gap between consecutive occurrences of a word, over words of a
 *      fixed length, in the first half against the second half: a gap that grows
 *      is evidence against uniform recurrence and so against minimality.
 *  (D) The two rungs of the occurrence ladder this session hands over:  how often
 *      do "11" and "00" occur, and what is the largest gap between occurrences?
 *      Plus a check of the one-line derivation behind the handoff: if the centre
 *      column had no "11" past some point, then at every black time t the cells
 *      at -1 and -2 would read 1 and 0.  At the black times that END a run
 *      (c(t)=1, c(t+1)=0) that prediction should already hold in the real
 *      picture; a failure would refute the derivation.
 *
 * Engine: the word-packed low-end row map, copied from talus7_center.mjs (bit b
 * of rowNat t is cell (t, b - t), and bit i of the next row reads only bits
 * i, i-1, i-2, so the low end is autonomous).  Revalidated here against the
 * repo's independent BigInt engine and against A051023's published prefix
 * before any large run.
 */

import { centerColumnBits, naiveCenterColumn, A051023_PREFIX } from './rule30.mjs';

const N = 300_000;

/** Centre column to depth n. */
function centerPacked(n) {
  const WORDS = (n >> 5) + 3;
  const r = new Uint32Array(WORDS);
  r[0] = 1;
  const out = new Uint8Array(n);
  for (let t = 0; t < n; t++) {
    out[t] = (r[t >> 5] >>> (t & 31)) & 1;
    const limit = Math.min(WORDS - 1, (t >> 4) + 1);
    let prev = 0;
    for (let j = 0; j <= limit; j++) {
      const cur = r[j];
      const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      r[j] = (s2 ^ (s1 | cur)) >>> 0;
      prev = cur;
    }
  }
  return out;
}

/** Cells at positions 0, -1, -2 of row t, for t < n: bits t, t-1, t-2. */
function nearOrigin(n) {
  const WORDS = (n >> 5) + 3;
  const r = new Uint32Array(WORDS);
  r[0] = 1;
  const c0 = new Uint8Array(n), c1 = new Uint8Array(n), c2 = new Uint8Array(n);
  const bit = (b) => (b < 0 ? 0 : (r[b >> 5] >>> (b & 31)) & 1);
  for (let t = 0; t < n; t++) {
    c0[t] = bit(t); c1[t] = bit(t - 1); c2[t] = bit(t - 2);
    const limit = Math.min(WORDS - 1, (t >> 4) + 1);
    let prev = 0;
    for (let j = 0; j <= limit; j++) {
      const cur = r[j];
      const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      r[j] = (s2 ^ (s1 | cur)) >>> 0;
      prev = cur;
    }
  }
  return { c0, c1, c2 };
}

function check() {
  const D = 4000;
  const mine = centerPacked(D);
  const big = centerColumnBits(D);
  let bad = 0;
  for (let i = 0; i < D; i++) if (mine[i] !== big[i]) bad++;
  const naive = naiveCenterColumn(30, 600);
  let badN = 0;
  for (let i = 0; i < 600; i++) if (mine[i] !== naive[i]) badN++;
  let badO = 0;
  for (let i = 0; i < A051023_PREFIX.length; i++) if (mine[i] !== A051023_PREFIX[i]) badO++;
  // the near-origin engine must agree with the column engine on column 0
  const no = nearOrigin(600);
  let badC = 0;
  for (let i = 0; i < 600; i++) if (no.c0[i] !== mine[i]) badC++;
  console.log(`engine vs BigInt (${D}): ${bad} mismatches; vs naive (600): ${badN}; ` +
    `vs A051023 (${A051023_PREFIX.length}): ${badO}; near-origin vs column (600): ${badC}`);
  if (bad || badN || badO || badC) throw new Error('engine disagrees');
}

/** xorshift32 fair-coin control. */
function coin(n, seed) {
  let x = seed | 0;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    out[i] = x & 1;
  }
  return out;
}

/** Longest run of `val`, and the start time of the longest, inside [0, hi). */
function longestRun(b, hi, val) {
  let best = 0, bestAt = -1, cur = 0, curAt = 0;
  for (let i = 0; i < hi; i++) {
    if (b[i] === val) { if (cur === 0) curAt = i; cur++; if (cur > best) { best = cur; bestAt = curAt; } }
    else cur = 0;
  }
  return { len: best, at: bestAt };
}

/** Distinct factors of length k inside b[lo..hi), as a count. */
function distinctFactors(b, lo, hi, k) {
  if (k > 26) throw new Error('k too large');
  const seen = new Uint8Array(1 << k);
  const mask = (1 << k) - 1;
  let w = 0, n = 0;
  for (let i = lo; i < hi; i++) {
    w = ((w << 1) | b[i]) & mask;
    if (i - lo >= k - 1) { if (!seen[w]) { seen[w] = 1; n++; } }
  }
  return n;
}

/** Largest gap between consecutive occurrences of each length-k word, over b[lo..hi). */
function maxRecurrenceGap(b, lo, hi, k) {
  const last = new Int32Array(1 << k).fill(-1);
  const mask = (1 << k) - 1;
  let w = 0, worst = 0, worstWord = -1, present = 0;
  for (let i = lo; i < hi; i++) {
    w = ((w << 1) | b[i]) & mask;
    if (i - lo >= k - 1) {
      if (last[w] >= 0) { const g = i - last[w]; if (g > worst) { worst = g; worstWord = w; } }
      else present++;
      last[w] = i;
    }
  }
  return { worst, worstWord, present };
}

check();
const t0 = Date.now();
const c = centerPacked(N);
console.log(`centre column: ${N} terms in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
const ctrl = coin(N, 0x1d872b41);

let ones = 0; for (let i = 0; i < N; i++) ones += c[i];
console.log(`density ${(ones / N).toFixed(7)}  excess ${2 * ones - N}`);

console.log('\n(A) longest runs inside [0, hi)   seed / coin control');
for (let hi = 100; hi <= N; hi *= 10) {
  const w = longestRun(c, hi, 0), b = longestRun(c, hi, 1);
  const wc = longestRun(ctrl, hi, 0), bc = longestRun(ctrl, hi, 1);
  console.log(`  hi=${String(hi).padStart(8)}  white ${String(w.len).padStart(2)} at a=${String(w.at).padStart(7)} ` +
    `(bound allows < 3a = ${3 * w.at})   black ${String(b.len).padStart(2)} at a=${String(b.at).padStart(7)} ` +
    `(bound allows < a = ${b.at})   coin ${wc.len}/${bc.len}   log2(hi)=${Math.log2(hi).toFixed(1)}`);
}

console.log('\n(B) words of length k MISSING from the tail [N/2, N)  — seed, coin, coupon-collector prediction');
const lo = N >> 1, M = N - lo;
for (let k = 1; k <= 22; k++) {
  const windows = M - k + 1;
  const seen = distinctFactors(c, lo, N, k);
  const seenC = distinctFactors(ctrl, lo, N, k);
  const tot = 2 ** k;
  const pred = tot * Math.exp(-windows / tot);
  console.log(`  k=${String(k).padStart(2)}  present ${String(seen).padStart(8)}/${String(tot).padStart(8)}  ` +
    `missing ${String(tot - seen).padStart(8)}   coin missing ${String(tot - seenC).padStart(8)}   ` +
    `predicted ${pred.toFixed(1)}`);
}

console.log('\n(C) largest recurrence gap for a word of length k, first half vs second half (minimality test)');
for (const k of [2, 4, 8, 12]) {
  const a = maxRecurrenceGap(c, 0, N >> 1, k);
  const b = maxRecurrenceGap(c, N >> 1, N, k);
  const ac = maxRecurrenceGap(ctrl, 0, N >> 1, k);
  const bc = maxRecurrenceGap(ctrl, N >> 1, N, k);
  console.log(`  k=${String(k).padStart(2)}  seed first ${String(a.worst).padStart(7)} (word ${a.worstWord.toString(2).padStart(k, '0')})` +
    `  second ${String(b.worst).padStart(7)} (word ${b.worstWord.toString(2).padStart(k, '0')})` +
    `   coin ${ac.worst}/${bc.worst}`);
}

console.log('\n(D) the two rungs: occurrences and gaps of 11 and 00 in [0, N)');
for (const [name, p, q] of [['11', 1, 1], ['00', 0, 0], ['10', 1, 0], ['01', 0, 1]]) {
  let n = 0, last = -1, worst = 0, worstAt = -1;
  for (let i = 0; i + 1 < N; i++) {
    if (c[i] === p && c[i + 1] === q) {
      n++;
      if (last >= 0 && i - last > worst) { worst = i - last; worstAt = last; }
      last = i;
    }
  }
  console.log(`  ${name}: ${n} occurrences (density ${(n / N).toFixed(5)}), largest gap ${worst} at t=${worstAt}`);
}

console.log('\n(D2) largest gap between consecutive occurrences of a 2-word inside [0, hi)');
for (let hi = 100; hi <= N; hi *= 10) {
  const row = [];
  for (const [name, p, q] of [['11', 1, 1], ['00', 0, 0], ['10', 1, 0], ['01', 0, 1]]) {
    let last = -1, worst = 0;
    for (let i = 0; i + 1 < hi; i++) if (c[i] === p && c[i + 1] === q) { if (last >= 0) worst = Math.max(worst, i - last); last = i; }
    row.push(`${name}:${worst}`);
  }
  let lastC = -1, worstC = 0;
  for (let i = 0; i + 1 < hi; i++) if (ctrl[i] === 1 && ctrl[i + 1] === 1) { if (lastC >= 0) worstC = Math.max(worstC, i - lastC); lastC = i; }
  console.log(`  hi=${String(hi).padStart(8)}  ${row.join('  ')}   coin 11:${worstC}   4*log2(hi)=${(4 * Math.log2(hi)).toFixed(0)}`);
}

const D2 = 200_000;
const { c0, c1, c2 } = nearOrigin(D2);
let ends = 0, pred1 = 0, pred0 = 0;
for (let t = 1; t + 1 < D2; t++) {
  if (c0[t] === 1 && c0[t + 1] === 0) { ends++; if (c1[t] === 1) pred1++; if (c2[t] === 0) pred0++; }
}
console.log(`\n(D') at the ${ends} black times t < ${D2} with c(t+1)=0: cell(-1,t)=1 in ${pred1}, ` +
  `cell(-2,t)=0 in ${pred0}  (the derivation predicts both at every such t)`);

let runs1 = 0, inside = 0;
for (let t = 1; t + 1 < D2; t++) if (c0[t] === 1 && c0[t + 1] === 1) { inside++; if (c1[t] === 1) runs1++; }
console.log(`at the ${inside} times with c(t)=c(t+1)=1: cell(-1,t)=1 in ${runs1}  (must be 0 in all: ` +
  `c(t+1) = cell(-1,t) XOR 1)`);
