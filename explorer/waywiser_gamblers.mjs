/**
 * Waywiser, connector, 2026-09-12.
 *
 * The effective-randomness vantage's one testable dictionary row: by the
 * Schnorr-Stimm dichotomy, a sequence is normal exactly when no finite-state
 * gambler wins on it. So the P1 residual `..._of_long_black_runs` — black runs
 * of every length occur — is *exactly* the statement that a specific countable
 * family of finite-state gamblers all go bankrupt: the "cap-L" gambler, which
 * bets its whole capital on white after seeing L consecutive blacks, is right
 * for ever iff the column's black runs are bounded by L.
 *
 * Three things measured here, on the 10^7-term centre column the board already
 * holds (explorer/talus7_center10m.bin), each with a fair-coin null:
 *
 *  A. cap-L gamblers: the time each one goes bankrupt (= the first black run of
 *     length L+1), for L = 1 .. 25, on the column and on 8 coin draws. This is
 *     the residual instance by instance, and it is Sigma^0_1 and checkable.
 *  B. order-k Markov (KT) gamblers, k = 0 .. 16: log2 capital after 10^7 bits.
 *     These are the finite-state gamblers Schnorr-Stimm is about, in their
 *     universal form; a win means "not normal at block length k".
 *  C. A positive control that the instruments are not blind: the same two
 *     gambler families run against a sequence built to have bounded runs (the
 *     column with every black run truncated at 8), where both must win.
 *
 * The point of B is NOT to add a normality measurement — the board has several.
 * It is to locate the seed on the one rung of the effective-randomness ladder a
 * computable point can occupy at all.
 */

import { readFileSync } from 'node:fs';
import { A051023_PREFIX } from './rule30.mjs';

const BIN = new URL('./talus7_center10m.bin', import.meta.url);
const bits = new Uint8Array(readFileSync(BIN));
const N = bits.length;

// --- guard: the file is the centre column, not something else -------------
let bad = 0;
for (let i = 0; i < A051023_PREFIX.length; i++) if (bits[i] !== A051023_PREFIX[i]) bad++;
if (bad) throw new Error(`bin disagrees with A051023 prefix in ${bad} places`);
console.log(`loaded ${N} terms; A051023 prefix agrees on ${A051023_PREFIX.length}/${A051023_PREFIX.length}`);

function xs(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x; };
}
function coin(n, seed) {
  const g = xs(seed);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i += 32) {
    let w = g();
    const lim = Math.min(32, n - i);
    for (let j = 0; j < lim; j++) { out[i + j] = w & 1; w >>>= 1; }
  }
  return out;
}

/** Sequence with black runs capped at CAP: force a white after CAP blacks. */
function capped(src, cap) {
  const out = new Uint8Array(src.length);
  let run = 0;
  for (let i = 0; i < src.length; i++) {
    let b = src[i];
    if (run >= cap) { b = 0; }
    out[i] = b;
    run = b ? run + 1 : 0;
  }
  return out;
}

// --- A. cap-L gamblers ----------------------------------------------------
/** For each L, the index at which the cap-L gambler goes bankrupt, i.e. the
 *  end of the first black run of length L+1. Infinity if it never does. */
function bankruptcies(x, maxL) {
  const out = new Array(maxL + 1).fill(Infinity);
  let run = 0;
  for (let i = 0; i < x.length; i++) {
    if (x[i]) {
      run++;
      // a run of length `run` kills every cap-L gambler with L < run
      const L = run - 1;
      if (L >= 1 && L <= maxL && out[L] === Infinity) out[L] = i;
    } else run = 0;
  }
  return out;
}

const MAXL = 25;
const colB = bankruptcies(bits, MAXL);
const coinSeqs = [];
for (let d = 0; d < 8; d++) coinSeqs.push(coin(N, 0x9e3779b9 + d * 2654435761));
const coinB = coinSeqs.map((c) => bankruptcies(c, MAXL));

console.log('\nA. cap-L gambler: index of bankruptcy (first black run of length L+1)');
console.log('   L | rule 30      | 8 coin draws: min .. max        | alive at 10^7?');
for (let L = 1; L <= MAXL; L++) {
  const cs = coinB.map((b) => b[L]).sort((a, b) => a - b);
  const fmt = (v) => (v === Infinity ? 'ALIVE' : String(v));
  const nAlive = cs.filter((v) => v === Infinity).length;
  console.log(
    `  ${String(L).padStart(2)} | ${fmt(colB[L]).padStart(12)} | ` +
    `${fmt(cs[0]).padStart(12)} .. ${fmt(cs[7]).padStart(12)} | ` +
    `rule30 ${colB[L] === Infinity ? 'ALIVE' : 'broke'}, coins alive ${nAlive}/8`);
}

// --- B. order-k KT gamblers ----------------------------------------------
/** log2 capital of the order-k Krichevsky-Trofimov gambler after the whole
 *  sequence: sum over t of log2(2 * p_hat(x_t | last k bits)). This is the
 *  universal finite-state gambler of memory k; it wins (log2 capital grows
 *  linearly) exactly when the sequence fails to have uniform (k+1)-block
 *  frequencies, which is Schnorr-Stimm's condition at block length k+1. */
function ktLogCapital(x, k) {
  const S = 1 << k;
  const c0 = new Float64Array(S);
  const c1 = new Float64Array(S);
  let state = 0;
  const mask = S - 1;
  let lg = 0;
  // burn in the first k bits to set the state, no bets placed
  for (let i = 0; i < k && i < x.length; i++) state = ((state << 1) | x[i]) & mask;
  for (let i = k; i < x.length; i++) {
    const b = x[i];
    const n0 = c0[state], n1 = c1[state];
    const p = b ? (n1 + 0.5) / (n0 + n1 + 1) : (n0 + 0.5) / (n0 + n1 + 1);
    lg += Math.log2(2 * p);
    if (b) c1[state] = n1 + 1; else c0[state] = n0 + 1;
    state = ((state << 1) | b) & mask;
  }
  return lg;
}

console.log('\nB. order-k KT finite-state gambler: log2 capital after 10^7 bits');
console.log('   (positive and growing = a finite-state gambler wins = not normal at that block length)');
console.log('    k | rule 30      | coin draw 0  | coin draw 1  | capped-at-8 control');
const cap8 = capped(bits, 8);
for (const k of [0, 1, 2, 4, 8, 12, 16, 20]) {
  const a = ktLogCapital(bits, k);
  const b = ktLogCapital(coinSeqs[0], k);
  const c = ktLogCapital(coinSeqs[1], k);
  const d = ktLogCapital(cap8, k);
  const f = (v) => v.toFixed(1).padStart(12);
  console.log(`  ${String(k).padStart(3)} | ${f(a)} | ${f(b)} | ${f(c)} | ${f(d)}`);
}

// --- C. controls ----------------------------------------------------------
console.log('\nC. the instruments are not blind: the capped-at-8 sequence');
const capB = bankruptcies(cap8, MAXL);
console.log(`   cap-8 gambler on capped-at-8 sequence: bankrupt at ${capB[8] === Infinity ? 'ALIVE (never)' : capB[8]}`);
console.log(`   cap-8 gambler on rule 30             : bankrupt at ${colB[8]}`);
let capWins = 0;
{ // capital of the cap-8 gambler on the capped sequence: doubles at each 8-run
  let run = 0;
  for (let i = 0; i < cap8.length; i++) { if (cap8[i]) { run++; } else { if (run >= 8) capWins++; run = 0; } }
}
console.log(`   log2 capital of cap-8 gambler on capped-at-8 sequence = ${capWins} (doublings)`);

// longest run in each, for the record
function longestRun(x, v) {
  let best = 0, run = 0, at = -1;
  for (let i = 0; i < x.length; i++) {
    if (x[i] === v) { run++; if (run > best) { best = run; at = i - run + 1; } } else run = 0;
  }
  return [best, at];
}
const [lb, lbAt] = longestRun(bits, 1);
const [lw, lwAt] = longestRun(bits, 0);
console.log(`\n   rule 30 longest black run ${lb} (starts t=${lbAt}); longest white run ${lw} (starts t=${lwAt})`);
const coinLongest = coinSeqs.map((c) => longestRun(c, 1)[0]).sort((a, b) => a - b);
console.log(`   8 coin draws longest black run: ${coinLongest.join(' ')}  (log2 10^7 = ${Math.log2(N).toFixed(2)})`);
