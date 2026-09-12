/**
 * Left-diagonal onsets and periods, and whether the onset function looks
 * like a finite-state (2-synchronized) function.
 *
 *   node explorer/waywiser_onset.mjs
 *
 * In the packed row `rowNat t`, bit b is the cell at x = b - t, so the left
 * diagonal `k` is just "bit k of the row, as t runs" (the board's
 * leftDiagonal_eq_rowNat_testBit). That makes the onsets cheap: stream the
 * rows, keep 32 bits of history per diagonal, and record for each candidate
 * power-of-two period p the last index at which the diagonal disagrees with
 * itself p places back.
 *
 * Three things are printed.
 *
 *   1. The onsets o(k) and minimal eventual periods P(k), and the doubling
 *      positions of P, which should reproduce NKS p. 871's 3, 8, 29, 400.
 *   2. The first differences d(k) = o(k+1) - o(k): their range, which decides
 *      whether d is a sequence over a finite alphabet at all.
 *   3. A 2-kernel saturation test on d. If o were 2-synchronized and d bounded,
 *      d would be a 2-automatic sequence and its 2-kernel
 *      { n -> d(2^e n + r) : e >= 0, r < 2^e } would be finite. Controls:
 *      Thue-Morse and the period-doubling sequence (kernels of size 2 and 3),
 *      the paperfolding sequence, and a xorshift coin (kernel grows with e).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';

const K_MAX = 8000;          // diagonals tracked
const TAIL_CYCLES = 8;       // cycles of tail required before a period is believed
const MARGIN = 600;          // indices past 0.6k that each diagonal is tracked for

// ---------------------------------------------------------------------------
// A packed rowNat engine: bit b of row t is the cell at x = b - t.
// ---------------------------------------------------------------------------

const T_MAX = Math.ceil(1.6 * K_MAX) + MARGIN + 4;
const WORDS = ((2 * T_MAX + 8) >> 5) + 4;

/** row <- (4*row) XOR ((2*row) OR row), on a little-endian Uint32Array. */
function stepPacked(src, dst, words) {
  let carry1 = 0, carry2 = 0;
  for (let i = 0; i < words; i++) {
    const w = src[i];
    const s1 = ((w << 1) | carry1) >>> 0;      // 2*row
    const s2 = ((w << 2) | carry2) >>> 0;      // 4*row
    carry1 = w >>> 31;
    carry2 = w >>> 30;
    dst[i] = (s2 ^ (s1 | w)) >>> 0;
  }
}

// ---------------------------------------------------------------------------
// Stream the rows, accumulating per-diagonal break positions.
// ---------------------------------------------------------------------------

const PS = [1, 2, 4, 8, 16, 32, 64];
const lastBreak = new Int32Array((K_MAX + 1) * PS.length).fill(-1);
const maxJ = new Int32Array(K_MAX + 1).fill(-1);
const hist = new Uint32Array(K_MAX + 1);      // bit 0 = value at j-1, bit i = value at j-1-i
const histHi = new Uint32Array(K_MAX + 1);    // bits 32..63

let cur = new Uint32Array(WORDS);
let nxt = new Uint32Array(WORDS);
cur[0] = 1;

function trackedUntil(k) { return Math.floor(0.6 * k) + MARGIN; }

const centre = new Int8Array(T_MAX + 1);   // the centre column, as a control

for (let t = 0; t <= T_MAX; t++) {
  centre[t] = (cur[t >>> 5] >>> (t & 31)) & 1;   // x = 0 is bit t of row t
  const kLo = Math.max(0, Math.floor((t - MARGIN) / 1.6) - 2);
  const kHi = Math.min(K_MAX, t);
  for (let k = kLo; k <= kHi; k++) {
    const j = t - k;
    if (j > trackedUntil(k)) continue;
    const v = (cur[k >>> 5] >>> (k & 31)) & 1;
    for (let i = 0; i < PS.length; i++) {
      const p = PS[i];
      if (j >= p) {
        const prev = p <= 32 ? (hist[k] >>> (p - 1)) & 1 : (histHi[k] >>> (p - 33)) & 1;
        if (prev !== v) lastBreak[k * PS.length + i] = j;
      }
    }
    histHi[k] = ((histHi[k] << 1) | (hist[k] >>> 31)) >>> 0;
    hist[k] = ((hist[k] << 1) | v) >>> 0;
    maxJ[k] = j;
  }
  stepPacked(cur, nxt, WORDS);
  const tmp = cur; cur = nxt; nxt = tmp;
}

// ---------------------------------------------------------------------------
// Cross-check the packed engine against the repo's BigInt engine.
// ---------------------------------------------------------------------------

{
  const CHECK = 200;
  let bad = 0, t = 0;
  let c = new Uint32Array(WORDS), n = new Uint32Array(WORDS);
  c[0] = 1;
  for (const row of rows(CHECK)) {
    const base = centerBitIndex(CHECK);
    for (let x = -t; x <= t; x++) {
      const a = Number((row >> BigInt(base + x)) & 1n);
      const b = (c[(x + t) >>> 5] >>> ((x + t) & 31)) & 1;
      if (a !== b) bad++;
    }
    stepPacked(c, n, WORDS);
    const tm = c; c = n; n = tm;
    t++;
  }
  console.log(`engine cross-check against explorer/rule30.mjs over ${CHECK} rows: ${bad} mismatches`);
}

// ---------------------------------------------------------------------------
// Onsets and periods.
// ---------------------------------------------------------------------------

// Two different quantities, and the walls want different ones.
//   period[k] = the minimal eventual period of diagonal k (leftDiagonal_period_le)
//   onset[k]  = min over ALL valid periods p of the first index from which the
//               diagonal is p-periodic (leftDiagonal_onset_le says "exists p,
//               exists N <= k", so the onset that matters is the smallest over
//               p, not the onset belonging to the smallest p).
const onset = new Int32Array(K_MAX + 1).fill(-1);
const period = new Int32Array(K_MAX + 1).fill(-1);
for (let k = 0; k <= K_MAX; k++) {
  let best = Infinity;
  for (let i = 0; i < PS.length; i++) {
    const p = PS[i];
    const lb = lastBreak[k * PS.length + i];
    const N = lb < 0 ? 0 : lb - p + 1;
    if (maxJ[k] - N < TAIL_CYCLES * p) continue;
    if (period[k] < 0) period[k] = p;
    if (N < best) best = N;
  }
  if (best < Infinity) onset[k] = best;
}

let firstUndecided = -1;
for (let k = 0; k <= K_MAX; k++) if (onset[k] < 0) { firstUndecided = k; break; }
const K = firstUndecided < 0 ? K_MAX : firstUndecided - 1;
console.log(`onsets decided for k = 0 .. ${K} (${TAIL_CYCLES} cycles of tail required)`);

// Individual diagonals can have a SMALLER minimal period than their
// predecessor (the eventually-constant ones have period 1), so the published
// doubling positions are the steps of the running maximum, not of P itself.
let run = 0;
const doublings = [];
for (let k = 0; k <= K; k++) if (period[k] > run) { run = period[k]; doublings.push(`${k}(P=${run})`); }
console.log(`steps of max_{j<=k} P(j) below ${K}: ${doublings.join(', ')}   (NKS p.871: 3, 8, 29, 400, 87867, 2107985255)`);
const rises = [];
const drops = [];
for (let k = 1; k <= K; k++) { if (period[k] > period[k - 1]) rises.push(k); if (period[k] < period[k - 1]) drops.push(k); }
console.log(`  for contrast, { k : P(k) > P(k-1) } has ${rises.length} elements below ${K} (${rises.slice(0, 8).join(', ')}, ...)`);
console.log(`  because P itself drops ${drops.length} times: the eventually-constant diagonals have minimal period 1 (${drops.slice(0, 8).join(', ')}, ...)`);

// h(p) = the first diagonal whose minimal eventual period exceeds p, for p a
// power of two. `leftDiagonal_period_le` is exactly "h(p) >= 2p - 1 for every
// power of two p": if some diagonal k had P(k) > k+1, take p = P(k)/2.
console.log(`h(p) = min { k : P(k) > p }, against the wall's demand h(p) >= 2p-1:`);
for (let p = 1; p <= 32; p *= 2) {
  let h = -1;
  for (let k = 0; k <= K; k++) if (period[k] > p) { h = k; break; }
  const known = { 1: 3, 2: 8, 4: 29, 8: 400, 16: 87867, 32: 2107985255 }[p];
  console.log(`  p=${String(p).padStart(3)}  h(p)=${h < 0 ? `> ${K}` : h}   NKS: ${known}   wall needs >= ${2 * p - 1}   h/p = ${(known / p).toFixed(2)}`);
}

let constCount = 0;
for (let k = 0; k <= K; k++) if (period[k] === 1) constCount++;
console.log(`eventually-constant diagonals (P(k) = 1) below ${K}: ${constCount}`);

let ratioMax = 0;
for (let k = 20; k <= K; k++) ratioMax = Math.max(ratioMax, onset[k] / k);
console.log(`onset/k at k = ${K}: ${(onset[K] / K).toFixed(4)}; worst over k >= 20: ${ratioMax.toFixed(4)}`);

// ---------------------------------------------------------------------------
// First differences of the onset.
// ---------------------------------------------------------------------------

const d = new Int32Array(K);
let dMin = 1e9, dMax = -1e9;
for (let k = 0; k < K; k++) { d[k] = onset[k + 1] - onset[k]; dMin = Math.min(dMin, d[k]); dMax = Math.max(dMax, d[k]); }
const counts = new Map();
for (let k = 0; k < K; k++) counts.set(d[k], (counts.get(d[k]) || 0) + 1);
const alphabet = [...counts.keys()].sort((a, b) => a - b);
console.log(`o(k+1) - o(k) over k < ${K}: range [${dMin}, ${dMax}], ${alphabet.length} distinct values`);
console.log(`  distribution: ${alphabet.map((v) => `${v}:${counts.get(v)}`).join('  ')}`);

// ---------------------------------------------------------------------------
// 2-kernel saturation test.
// ---------------------------------------------------------------------------

/**
 * Count the distinct subsequences n -> s(2^e n + r) for e <= eMax, r < 2^e,
 * each compared on its first `cmp` terms. A k-automatic sequence has a finite
 * 2-kernel, so this count saturates; a sequence with no finite-state
 * description keeps producing new ones.
 */
function kernelCounts(s, eMax, cmp) {
  const out = [];
  const seen = new Set();
  for (let e = 0; e <= eMax; e++) {
    for (let r = 0; r < (1 << e); r++) {
      const need = r + ((cmp - 1) << e);
      if (need >= s.length) return out.concat(Array(eMax - e + 1).fill(null));
      let key = '';
      for (let n = 0; n < cmp; n++) key += String(s[r + (n << e)]) + ',';
      seen.add(key);
    }
    out.push(seen.size);
  }
  return out;
}

function thueMorse(n) { const a = new Int8Array(n); for (let i = 1; i < n; i++) a[i] = a[i >> 1] ^ (i & 1); return a; }
function periodDoubling(n) { const tm = thueMorse(n * 2 + 2); const a = new Int8Array(n); for (let i = 0; i < n; i++) a[i] = tm[i] ^ tm[i + 1]; return a; }
function paperfolding(n) { const a = new Int8Array(n); for (let i = 1; i <= n; i++) { let m = i; while ((m & 1) === 0) m >>= 1; a[i - 1] = ((m & 3) === 1) ? 1 : 0; } return a; }
function coin(n, seed) { let x = seed >>> 0; const a = new Int8Array(n); for (let i = 0; i < n; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; a[i] = x & 1; } return a; }

const CMP = 40;
const E_MAX = 8;
const L = K;
console.log(`\n2-kernel saturation (distinct subsequences n -> s(2^e n + r), r < 2^e, compared on ${CMP} terms; prefix length ${L}):`);
const rowsOut = [
  ['rule 30 onset differences d(k)', Array.from(d)],
  // log2 P(k) capped at 4 is a definable function of the array with a FINITE
  // range, so it is a 2-automatic sequence outright if the array is automatic.
  // This test does not go through the doubling depths and needs no growth law.
  ['rule 30 min(log2 P(k), 4)', Array.from({ length: L }, (_, i) => Math.min(Math.log2(period[i]), 4))],
  ['rule 30 [P(k) = 1] (eventually constant)', Array.from({ length: L }, (_, i) => (period[i] === 1 ? 1 : 0))],
  ['Thue-Morse (kernel 2)', Array.from(thueMorse(L))],
  ['period-doubling (kernel 3)', Array.from(periodDoubling(L))],
  ['regular paperfolding (kernel 4)', Array.from(paperfolding(L))],
  ['xorshift coin', Array.from(coin(L, 0x9e3779b9))],
  ['rule 30 centre column', Array.from(centre.slice(0, L))],
];
// A saturating count means nothing on its own: a sequence that is nearly
// constant, or nearly all zero, collides with its own decimations for free.
// So every row is printed beside a SHUFFLE of itself - same letters, same
// multiplicities, no structure whatever - which is the only null that controls
// for the letter distribution.
function shuffled(seq, seed) {
  const a = seq.slice();
  let x = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    const j = x % (i + 1);
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

console.log(`  ${'sequence'.padEnd(40)} ${Array.from({ length: E_MAX + 1 }, (_, e) => `e<=${e}`.padStart(6)).join('')}`);
for (const [name, seq] of rowsOut) {
  const c = kernelCounts(seq, E_MAX, CMP);
  const n = kernelCounts(shuffled(seq, 0x12345678), E_MAX, CMP);
  console.log(`  ${name.padEnd(40)} ${c.map((v) => String(v === null ? '-' : v).padStart(6)).join('')}`);
  console.log(`  ${'  ^ shuffled (same letter multiset)'.padEnd(40)} ${n.map((v) => String(v === null ? '-' : v).padStart(6)).join('')}`);
}
