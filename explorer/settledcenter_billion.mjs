/**
 * The settled centre column s(k) = S_k(0) to one billion terms, and its statistics.
 *
 *   node explorer/settledcenter_billion.mjs
 *
 * s(k) is the centre of the settled picture: S_k is the settled word of left
 * diagonal k of the seed (settledwords.mjs), the periodic function on Z that
 * D_k(j) = evolve (j+k) (-j) agrees with from its onset on, in absolute phase,
 * and s(k) = S_k(0). settledcenter.mjs reaches k = 240,000 by reading the
 * picture; this script reaches 10^9 by the observation of the C4 attack
 * (docs/attacks/2026-09-08-leftdiagonal-period-...): from diagonal 87,867 on
 * the settled words have period 32, so a settled word is a machine integer and
 * the periodic solution of the diagonal recurrence
 *
 *     S_{k}(i+1) = S_{k-2}(i+2) xor (S_{k-1}(i+1) or S_{k}(i))
 *
 * is the fixed point of a four-instruction bit-parallel map on 32-bit words.
 *
 * Method, in two halves.
 *
 *   k <= 240,000: the forbit-style orbit. S_k = F(S_{k-2}, S_{k-1}) from
 *   settledwords.mjs, single-valued except at the eventually-white diagonals,
 *   where the branch is chosen by matching a 64-cell window of the seed's own
 *   diagonal read from the BigInt engine (rows to 372,100). This is exactly
 *   what settledcenter.mjs and forbit.mjs do, and no number here is taken on
 *   trust from them.
 *
 *   240,000 < k < 10^9: the bit-parallel step alone, started from the words
 *   S_199999 and S_200000 of that orbit. No picture is consulted; the next
 *   eventually-white diagonal after 87,866 is at 1,420,878,968 (C4), past the
 *   end of this run, so no branch decision arises and the orbit is forced.
 *
 * Validation, all of it printed below before any statistic:
 *
 *   1. s(0..10) = 11011100110, the kernel-checked prefix.
 *   2. s(k) = evolve (N + k) (-N) with N = 2^17 for every k <= 240,000, the
 *      seed's column -N read downward from the left edge. This is check 1 of
 *      settledcenter.mjs, reproduced here; N = 2^17 is a multiple of every
 *      period below the first period-64 diagonal and past every onset in range.
 *   3. The bit-parallel step reproduces the slow orbit's word at every
 *      k in 87,868..240,000, and agrees with a bit-serial solve of the
 *      recurrence on 200,000 random pairs.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { centerBitIndex, rows } from './rule30.mjs';
import { F, at } from './settledwords.mjs';

// --- parameters (no command-line arguments; edit here)
const N_TERMS = 1_000_000_000;     // s(0 .. N_TERMS - 1)
const K_SLOW = 240_000;            // slow orbit and engine validation to here
const K_HANDOFF = 200_000;         // bit-parallel orbit starts from S_{K_HANDOFF-1}, S_{K_HANDOFF}
const N_COL = 1 << 17;             // 131072: the column read downward for validation
const T_ROWS = 372_100;            // engine rows
const WIN = 64;                    // cells per diagonal window
const j0 = (k) => Math.ceil(0.55 * k) + 16;
const TAIL_BITS = 1 << 20;         // periodicity scan window
const MAX_LAG = 1 << 19;
const N_AUTO = 100_000_000;        // autocorrelation sample
const NMAX_FACTOR = 24;            // factor lengths 1..24
const BALANCE_AT = [1_000_000, 10_000_000, 100_000_000, 1_000_000_000];

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'settledcenter_billion.txt');
writeFileSync(OUT, '');
const out = (line = '') => { console.log(line); appendFileSync(OUT, line + '\n'); };
const t00 = Date.now();
const ms = () => `${((Date.now() - t00) / 1000).toFixed(1)} s`;
const mem = () => `${(process.memoryUsage().rss / 2 ** 20).toFixed(0)} MB rss`;

out('# The settled centre column s(k) = S_k(0) of rule 30, k = 0 .. 10^9 - 1');
out('#');
out('# Method: k <= 240,000 by the forbit-style orbit of the diagonal recurrence,');
out('#   branch bits at the eventually-white diagonals read from the BigInt engine');
out('#   (372,100 rows); k > 240,000 by the period-32 bit-parallel step alone,');
out('#   started from the settled words S_199999, S_200000 of that orbit.');
out('# Validation: the kernel prefix s(0..10); the seed\'s column -2^17 read');
out('#   downward for every k <= 240,000 (check 1 of explorer/settledcenter.mjs);');
out('#   the bit-parallel step against the slow orbit on 87,868..240,000 and');
out('#   against a bit-serial solve on 200,000 random pairs.');
out('# Command: node explorer/settledcenter_billion.mjs');
out(`# Node ${process.version}, run ${new Date().toISOString()}`);
out('');

// ---------------------------------------------------------------------------
// Stage A. The engine: the column -N_COL, and windows on the diagonals we
// need in order to pick a branch or to spot-check the orbit.
// ---------------------------------------------------------------------------

const BRANCH_K = [3, 8, 29, 400, 53208, 58287, 87867];   // k where S_{k-1} is white
const SPOT_K = [2400, 53210, 87868, 100000, 150000, K_HANDOFF, K_SLOW];
const wantK = [...new Set([...BRANCH_K, ...SPOT_K])].sort((a, b) => a - b);

const col = new Uint8Array(T_ROWS);          // col[t] = cell (t, -N_COL)
const win = new Map();                       // k -> D_k(j0(k) .. j0(k)+WIN-1)
for (const k of wantK) win.set(k, new Uint8Array(WIN));
{
  const base = centerBitIndex(T_ROWS);
  const posCol = BigInt(base - N_COL);
  const wk = wantK, wa = wantK.map((k) => win.get(k)), wj = wantK.map(j0);
  let t = 0;
  for (const row of rows(T_ROWS)) {
    if (t >= N_COL) col[t] = Number((row >> posCol) & 1n);
    for (let i = 0; i < wk.length; i++) {
      const m = t - wk[i] - wj[i];
      if (m >= 0 && m < WIN) wa[i][m] = Number((row >> BigInt(base - (t - wk[i]))) & 1n);
    }
    t++;
  }
}
out(`engine: ${T_ROWS} rows; column -${N_COL} and ${wantK.length} diagonal windows read (${ms()}, ${mem()})`);

const matches = (S, k) => { const w = win.get(k); for (let m = 0; m < WIN; m++) if (at(S, j0(k) + m) !== w[m]) return false; return true; };

// ---------------------------------------------------------------------------
// Stage B. The slow orbit to K_SLOW, branch bits from those windows.
// ---------------------------------------------------------------------------

const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
const whitesSlow = [];
const branchTaken = [];
for (let k = 2; k <= K_SLOW; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  let s;
  if (sols.length === 1) s = sols[0];
  else {
    whitesSlow.push(k - 1);
    if (!win.has(k)) throw new Error(`unexpected eventually-white diagonal at k-1 = ${k - 1}: no engine window`);
    const ok = sols.map((x) => matches(x, k));
    const which = ok[0] && !ok[1] ? 0 : ok[1] && !ok[0] ? 1 : -1;
    if (which < 0) throw new Error(`branch at k = ${k}: engine window matches ${ok.filter(Boolean).length} candidates`);
    branchTaken.push(`${k}:${which}${sols[0].p > S[k - 2].p ? 'd' : 'c'}`);
    s = sols[which];
  }
  S.push(s);
  if (win.has(k) && !matches(s, k)) throw new Error(`orbit disagrees with the engine at k = ${k}`);
}
out(`slow orbit to k = ${K_SLOW}: eventually-white diagonals ${whitesSlow.join(', ')}`);
out(`   branch taken (k:index, d = period doubles, c = complement type): ${branchTaken.join(' ')}`);
out(`   engine window agrees with the orbit at k = ${SPOT_K.join(', ')}`);
out(`   period of S_k for k = ${K_HANDOFF - 1}, ${K_HANDOFF}, ${K_SLOW}: ${S[K_HANDOFF - 1].p}, ${S[K_HANDOFF].p}, ${S[K_SLOW].p} (${ms()})`);

// ---------------------------------------------------------------------------
// Stage C. The bit-parallel step, checked, then run to 10^9.
// ---------------------------------------------------------------------------

const L = 32;
const toInt = (s) => { let x = 0; for (let i = 0; i < L; i++) x = (x | (at(s, i) << i)) >>> 0; return x; };
const rotr1 = (x) => ((x >>> 1) | (x << 31)) >>> 0;
const rotl1 = (x) => ((x << 1) | (x >>> 31)) >>> 0;
/** The unique 32-periodic solution of c(i) = a(i+1) xor (b(i) || c(i-1)), b != 0. */
function stepFast(a, b) {
  const d = rotr1(a);
  let c = d;
  for (let n = 0; n < 64; n++) {
    const nx = (d ^ (b | rotl1(c))) >>> 0;
    if (nx === c) return c;
    c = nx;
  }
  throw new Error('stepFast: no fixed point');
}
{
  let a = toInt(S[87866]), b = toInt(S[87867]), bad = 0, tested = 0;
  if (a !== 0) throw new Error('S_87866 is not white');
  for (let k = 87868; k <= K_SLOW; k++) {
    tested++;
    const c = stepFast(a, b);
    if (c !== toInt(S[k])) { bad++; if (bad === 1) out(`   FIRST DISAGREEMENT at k = ${k}`); }
    a = b; b = c;
  }
  let x = 123456789;
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
  let rtested = 0, rbad = 0;
  for (let n = 0; n < 200000; n++) {
    const aa = rnd(), bb = rnd(); if (bb === 0) continue;
    let i0 = -1; for (let i = 0; i < L; i++) if ((bb >>> i) & 1) { i0 = i; break; }
    let c = 0, prev = 0;
    for (let m = 0; m < L; m++) { const i = (i0 + m) % L; const v = ((aa >>> ((i + 1) % L)) & 1) ^ (((bb >>> i) & 1) | prev); c = (c | (v << i)) >>> 0; prev = v; }
    rtested++; if (c !== stepFast(aa, bb)) rbad++;
  }
  out(`bit-parallel step: ${tested} words of the slow orbit (k = 87,868..${K_SLOW}) reproduced, ${bad} disagreements;`);
  out(`   ${rtested} random pairs against the bit-serial solve, ${rbad} disagreements (${ms()})`);
}

// s as a bit-packed Uint32Array: bit k is s(k).
const WORDS = N_TERMS >>> 5;                 // 31,250,000; N_TERMS is a multiple of 32
const bits = new Uint32Array(WORDS);
const getBit = (k) => (bits[k >>> 5] >>> (k & 31)) & 1;
for (let k = 0; k <= K_HANDOFF; k++) if (at(S[k], 0)) bits[k >>> 5] |= 1 << (k & 31);
{
  const tC = Date.now();
  let a = toInt(S[K_HANDOFF - 1]), b = toInt(S[K_HANDOFF]);
  let whiteAt = -1;
  for (let k = K_HANDOFF + 1; k < N_TERMS; k++) {
    if (b === 0) { whiteAt = k - 1; break; }
    const d = ((a >>> 1) | (a << 31)) >>> 0;
    let c = d;
    for (;;) {
      const nx = (d ^ (b | (((c << 1) | (c >>> 31)) >>> 0))) >>> 0;
      if (nx === c) break;
      c = nx;
    }
    if (c & 1) bits[k >>> 5] |= 1 << (k & 31);
    a = b; b = c;
  }
  out(`bit-parallel orbit ${K_HANDOFF + 1} .. ${N_TERMS - 1}: ${((Date.now() - tC) / 1000).toFixed(1)} s, ` +
      `${((Date.now() - tC) * 1e6 / (N_TERMS - K_HANDOFF)).toFixed(1)} ns/diagonal`);
  out(`   eventually-white diagonal encountered below 10^9: ${whiteAt < 0 ? 'none (the attack document puts the next at 1,420,878,968)' : whiteAt}`);
  if (whiteAt >= 0) throw new Error(`unexpected white at ${whiteAt}: the run is incomplete`);
}
out(`(${ms()}, ${mem()})`);
out('');

// ---------------------------------------------------------------------------
// 1. Validation.
// ---------------------------------------------------------------------------

out('## 1. Validation');
out('');
const prefix = Array.from({ length: 11 }, (_, k) => getBit(k)).join('');
out(`s(0..10)      = ${prefix}   expected 11011100110   ${prefix === '11011100110' ? 'OK' : 'MISMATCH'}`);
if (prefix !== '11011100110') throw new Error('kernel prefix mismatch');
out(`s(0..119)     = ${Array.from({ length: 120 }, (_, k) => getBit(k)).join('')}`);
{
  let agree = 0, tested = 0, first = -1;
  for (let k = 0; k <= K_SLOW; k++) {
    tested++;
    if (getBit(k) === col[N_COL + k]) agree++; else if (first < 0) first = k;
  }
  out(`s(k) vs the seed's column -${N_COL} read downward, k = 0..${K_SLOW}:`);
  out(`   ${agree} of ${tested} terms agree, ${tested - agree} disagree${first >= 0 ? ` (first at k = ${first})` : ''}`);
  if (agree !== tested) throw new Error('engine column disagrees with the orbit');
}
out(`(this reproduces check 1 of explorer/settledcenter.mjs, whose K_MAX is also ${K_SLOW})`);
out('');

// ---------------------------------------------------------------------------
// 2. Balance.
// ---------------------------------------------------------------------------

function popcnt(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return (Math.imul(x, 0x01010101) >>> 24);
}
out('## 2. Balance: black cells among the first N terms');
out('');
out('             N        black          white     excess 2*black - N   black/N');
{
  const tB = Date.now();
  let black = 0, next = 0;
  for (let j = 0; j < WORDS; j++) {
    black += popcnt(bits[j]);
    const upTo = (j + 1) * 32;
    while (next < BALANCE_AT.length && BALANCE_AT[next] === upTo) {
      const N = BALANCE_AT[next];
      out(`${String(N).padStart(14)} ${String(black).padStart(12)} ${String(N - black).padStart(14)} ${String(2 * black - N).padStart(18)}   ${(black / N).toFixed(8)}`);
      next++;
    }
  }
  out(`(${((Date.now() - tB) / 1000).toFixed(1)} s)`);
}
out('');

// ---------------------------------------------------------------------------
// 3. Eventual periodicity over the final 2^20 terms.
// ---------------------------------------------------------------------------

out(`## 3. Eventual periodicity: lags 1..${MAX_LAG} over the final ${TAIL_BITS} terms`);
out('');
out(`   For each lag p, the longest suffix of the window on which s(t) = s(t - p).`);
out(`   Window: terms ${N_TERMS - TAIL_BITS} .. ${N_TERMS - 1}. A true eventual period p`);
out(`   would show a suffix of length ${TAIL_BITS} - p, i.e. the whole window.`);
out('');

const WW = TAIL_BITS >>> 5;
const window0 = (N_TERMS - TAIL_BITS) >>> 5;   // word-aligned: (10^9 - 2^20) % 32 == 0
const winArr = bits.slice(window0, window0 + WW);

/** Longest suffix T of `w` (a WW-word, 32*WW-bit array) with b[i] = b[i-p] for the last T indices. */
function tailAt(w, p) {
  const W = w.length * 32;
  const q = p >>> 5, r = p & 31;
  const jmin = r === 0 ? q : q + 1;
  for (let j = w.length - 1; j >= jmin; j--) {
    const jq = j - q;
    const sh = r === 0 ? w[jq] : (((w[jq] << r) | (w[jq - 1] >>> (32 - r))) >>> 0);
    const x = (w[j] ^ sh) >>> 0;
    if (x !== 0) {
      const h = 31 - Math.clz32(x);            // highest disagreeing bit in this word
      return (w.length - 1 - j) * 32 + (31 - h);
    }
  }
  // every full word agreed; finish bit by bit below 32*jmin
  const bitOf = (i) => (w[i >>> 5] >>> (i & 31)) & 1;
  let i = 32 * jmin - 1;
  while (i >= p && bitOf(i) === bitOf(i - p)) i--;
  return W - 1 - i;
}
function scan(w, maxLag, label) {
  const t0 = Date.now();
  let best = 0, bestP = 0;
  const ratios = [];
  for (let p = 1; p <= maxLag; p++) {
    const t = tailAt(w, p);
    if (t > best) { best = t; bestP = p; }
    ratios.push([t / p, p, t]);
  }
  ratios.sort((u, v) => v[0] - u[0]);
  out(`${label}:`);
  out(`   longest agreeing suffix ${best} terms, at lag ${bestP}`);
  out(`   best suffix/lag ratios: ${ratios.slice(0, 3).map(([r, p, t]) => `${r.toFixed(3)} (lag ${p}, suffix ${t})`).join('; ')}`);
  out(`   (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  return { best, bestP };
}
{
  // cross-check tailAt against a bit-level scan on the first 400 lags
  const bitOf = (i) => (winArr[i >>> 5] >>> (i & 31)) & 1;
  let bad = 0;
  for (let p = 1; p <= 400; p++) {
    let i = TAIL_BITS - 1;
    while (i >= p && bitOf(i) === bitOf(i - p)) i--;
    if (TAIL_BITS - 1 - i !== tailAt(winArr, p)) bad++;
  }
  out(`   word-level scan cross-checked against a bit-level scan on lags 1..400: ${bad} disagreements`);
}
const real = scan(winArr, MAX_LAG, 's, final 2^20 terms');
out('');
{
  // positive control: the same window with a period of 1237 injected from offset 300000
  const P = 1237, OFF = Math.floor(TAIL_BITS * 0.3);
  const ctl = winArr.slice();
  const bitOf = (a, i) => (a[i >>> 5] >>> (i & 31)) & 1;
  for (let i = OFF; i < TAIL_BITS; i++) {
    const v = bitOf(ctl, i - P);
    if (v) ctl[i >>> 5] |= 1 << (i & 31); else ctl[i >>> 5] &= ~(1 << (i & 31));
  }
  const c = scan(ctl, MAX_LAG, `control (period ${P} injected from index ${OFF} of the same window)`);
  out(`   expected: lag ${P}, suffix at least ${TAIL_BITS - OFF} — found lag ${c.bestP}, suffix ${c.best}: ${c.bestP === P && c.best >= TAIL_BITS - OFF ? 'OK' : 'MISMATCH'}`);
}
out('');
out(`verdict: no lag below ${MAX_LAG} agrees on more than ${real.best} of the final ${TAIL_BITS} terms,`);
out(`   against ${TAIL_BITS} required for an eventual period. s shows no eventual periodicity here.`);
out('');

// ---------------------------------------------------------------------------
// 4. Factor counts.
// ---------------------------------------------------------------------------

out(`## 4. Distinct factors (words) of length n occurring in s(0 .. ${N_TERMS - 1})`);
out('');
{
  const tF = Date.now();
  const present = new Uint8Array(1 << NMAX_FACTOR);
  const MASK = (1 << NMAX_FACTOR) - 1;
  let w24 = 0;
  // first word: fill the window, only start marking once NMAX_FACTOR bits are in
  {
    const word = bits[0];
    for (let m = 0; m < 32; m++) {
      w24 = ((w24 << 1) | ((word >>> m) & 1)) & MASK;
      if (m >= NMAX_FACTOR - 1) present[w24] = 1;
    }
  }
  for (let j = 1; j < WORDS; j++) {
    const word = bits[j];
    for (let m = 0; m < 32; m++) {
      w24 = ((w24 << 1) | ((word >>> m) & 1)) & MASK;
      present[w24] = 1;
    }
  }
  out(`   one pass over ${N_TERMS} terms, ${(1 << NMAX_FACTOR)}-entry presence table (${((Date.now() - tF) / 1000).toFixed(1)} s)`);
  // factors of length n ending at t < NMAX_FACTOR - 1 are not covered by the pass
  const edge = [];
  for (let n = 1; n <= NMAX_FACTOR; n++) {
    const vals = [];
    for (let t = n - 1; t < NMAX_FACTOR - 1; t++) {
      let v = 0;
      for (let i = t - n + 1; i <= t; i++) v = (v << 1) | getBit(i);
      vals.push(v >>> 0);
    }
    edge[n] = vals;
  }
  const counts = new Array(NMAX_FACTOR + 1).fill(0);
  for (let n = NMAX_FACTOR; n >= 1; n--) {
    const size = 1 << n;
    if (n < NMAX_FACTOR) for (let u = 0; u < size; u++) present[u] |= present[u + size];
    for (const v of edge[n]) present[v] = 1;
    let c = 0;
    for (let u = 0; u < size; u++) c += present[u];
    counts[n] = c;
  }
  out('');
  out('    n   distinct factors        2^n    missing');
  for (let n = 1; n <= NMAX_FACTOR; n++) {
    const max = 2 ** n;
    out(`   ${String(n).padStart(2)} ${String(counts[n]).padStart(18)} ${String(max).padStart(10)} ${String(max - counts[n]).padStart(10)}`);
  }
  const firstShort = counts.findIndex((c, n) => n >= 1 && c < 2 ** n);
  out('');
  out(firstShort < 0
    ? `   every word of length up to ${NMAX_FACTOR} occurs.`
    : `   first length at which some word does not occur: n = ${firstShort} (${2 ** firstShort - counts[firstShort]} missing).`);
  out(`   (${((Date.now() - tF) / 1000).toFixed(1)} s)`);
}
out('');

// ---------------------------------------------------------------------------
// 5. Autocorrelation.
// ---------------------------------------------------------------------------

out(`## 5. Autocorrelation: P(s(t) = s(t+d)) over the first ${N_AUTO} terms`);
out('');
{
  const tA = Date.now();
  const MA = N_AUTO >>> 5;
  out('    d   P(s(t) = s(t+d))       equal pairs of        pairs');
  for (let d = 1; d <= 32; d++) {
    const q = d >>> 5, r = d & 31;
    let eq = 0;
    for (let j = 0; j < MA; j++) {
      const sh = r === 0 ? bits[j + q] : (((bits[j + q] >>> r) | (bits[j + q + 1] << (32 - r))) >>> 0);
      eq += 32 - popcnt((bits[j] ^ sh) >>> 0);
    }
    // the word loop counted t in [N_AUTO - d, N_AUTO), which is outside the sample
    for (let t = N_AUTO - d; t < N_AUTO; t++) if (getBit(t) === getBit(t + d)) eq--;
    const n = N_AUTO - d;
    out(`   ${String(d).padStart(2)}   ${(eq / n).toFixed(6)}    ${String(eq).padStart(12)} of ${String(n).padStart(11)}`);
  }
  out(`   (${((Date.now() - tA) / 1000).toFixed(1)} s)`);
}
out('');

out('## 6. Cost');
out('');
out(`   total ${ms()}, peak ${mem()}`);
out(`   s stored as a Uint32Array of ${WORDS} words = ${(WORDS * 4 / 2 ** 20).toFixed(0)} MiB (one bit per term)`);
out(`   command: node explorer/settledcenter_billion.mjs`);
out(`   output: explorer/settledcenter_billion.txt`);
