/**
 * Rosetta, 2026-09-12 — Hochman/Shmerkin vantage.
 *
 * The one computation the vantage asks for: do the centre column's empirical
 * BLOCK MEASURES satisfy a non-concentration bound at the scales this board
 * has, and how does the entropy deficit compare with a coin's own?
 *
 * Hochman's non-concentration hypothesis, translated: the measure does not sit
 * on a bounded number of cells at scale 2^-m. For a single sequence the only
 * measure available is the empirical block measure
 *
 *     mu_N^(m) = (1/(N-m+1)) sum_{t < N-m+1} delta_{c[t, t+m)}
 *
 * and "non-concentration at scale m" is H(mu_N^(m)) >= (1-eps) m bits.
 *
 * WHY IT MATTERS FOR P2, and this is the point of the script: Shannon
 * subadditivity plus concavity of H2 turns a block-entropy lower bound into a
 * BALANCE bound, in one line:
 *
 *     H(mu^(m)) <= sum_{i<m} H2(p_i)  <= m * H2(pbar)   [subadditivity, then
 *                                                        concavity of H2]
 *
 * where p_i is the density of the i-th coordinate of the window, i.e. the
 * density of c over [i, N-m+1+i), and pbar their average. So
 *
 *     H(mu^(m))/m >= 1 - eps   =>   H2(pbar) >= 1 - eps   =>   |pbar - 1/2| small.
 *
 * That is the bridge. This script measures both ends of it.
 *
 * Nothing here proves anything.
 */

import { centerColumnBits } from './rule30.mjs';
import { randomFillSync } from 'node:crypto';

const N = 4_000_000;
const MMAX = 24;

// ---------------------------------------------------------------------------
// engine + validation
// ---------------------------------------------------------------------------

function log2(x) { return Math.log(x) / Math.LN2; }

/** Binary entropy in bits. */
function H2(p) {
  if (p <= 0 || p >= 1) return 0;
  return -(p * log2(p) + (1 - p) * log2(1 - p));
}

/**
 * Empirical block entropy, in bits, of the length-m windows of `bits` that
 * start at 0 .. n-m. Counts into a typed array of size 2^m; m <= 24.
 */
function blockEntropy(bits, n, m) {
  const size = 1 << m;
  const counts = new Int32Array(size);
  const mask = size - 1;
  let w = 0;
  for (let i = 0; i < m - 1; i++) w = ((w << 1) | bits[i]) & mask;
  let total = 0;
  for (let i = m - 1; i < n; i++) {
    w = ((w << 1) | bits[i]) & mask;
    counts[w]++;
    total++;
  }
  let h = 0;
  let support = 0;
  let maxc = 0;
  for (let k = 0; k < size; k++) {
    const c = counts[k];
    if (c === 0) continue;
    support++;
    if (c > maxc) maxc = c;
    const p = c / total;
    h -= p * log2(p);
  }
  return { h, support, total, maxc };
}

/**
 * A coin word from the OS CSPRNG. My notebook records an LCG whose low bit
 * alternated and faked a whole run; a hand-rolled xorshift in the first version
 * of THIS script gave coin entropy deficits 30x the column's, which read as
 * "rule 30 is more uniform than a coin" and was the generator. So the control
 * is now `node:crypto`, which shares nothing with anything here.
 */
function coinBits(n) {
  const bytes = new Uint8Array(Math.ceil(n / 8));
  // randomFillSync caps at 65536 bytes per call.
  for (let off = 0; off < bytes.length; off += 65536) {
    randomFillSync(bytes, off, Math.min(65536, bytes.length - off));
  }
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (bytes[i >> 3] >> (i & 7)) & 1;
  return out;
}

// ---------------------------------------------------------------------------

console.log(`# Rosetta 13 — block entropy of the centre column`);
console.log(`N = ${N}, m up to ${MMAX}`);

const t0 = Date.now();
const c = centerColumnBits(N);
console.log(`centre column generated in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// validation against the OEIS prefix held in the engine module
const A051023_PREFIX = [
  1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0,
  0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0,
];
let bad = 0;
for (let i = 0; i < A051023_PREFIX.length; i++) if (c[i] !== A051023_PREFIX[i]) bad++;
console.log(`validation against A051023 prefix: ${bad} mismatches of ${A051023_PREFIX.length}`);

// density and excess
let count = 0;
for (let i = 0; i < N; i++) count += c[i];
const p = count / N;
const excess = 2 * count - N;
console.log(`black count ${count}, density ${p.toFixed(8)}, excess E(N) = ${excess} = ${(excess / Math.sqrt(N)).toFixed(4)} sqrt(N)`);
console.log(`H2(density) = ${H2(p).toFixed(10)} bits;  1 - H2 = ${(1 - H2(p)).toExponential(3)}`);

// ---------------------------------------------------------------------------
// the table
// ---------------------------------------------------------------------------

const coins = [coinBits(N), coinBits(N), coinBits(N)];
for (let j = 0; j < coins.length; j++) {
  let cc = 0;
  for (let i = 0; i < N; i++) cc += coins[j][i];
  console.log(`coin ${j}: density ${(cc / N).toFixed(8)}, excess ${2 * cc - N} = ${((2 * cc - N) / Math.sqrt(N)).toFixed(4)} sqrt(N)`);
}

console.log('');
console.log('  m |      H_c(m) |  m - H_c(m) |   h_m = dH |   support |  maxc | iid-predicted support | coin: m-H (3 draws)');
console.log('----+-------------+-------------+------------+-----------+-------+-----------------------+---------------------------');

let prev = 0;
const rows = [];
for (let m = 1; m <= MMAX; m++) {
  const r = blockEntropy(c, N, m);
  const coinDef = coins.map((b) => {
    const rr = blockEntropy(b, N, m);
    return m - rr.h;
  });
  const dh = r.h - prev;
  prev = r.h;
  // expected number of distinct words if the r.total windows were iid uniform
  const size = Math.pow(2, m);
  const predicted = size * (1 - Math.exp(-r.total / size));
  rows.push({ m, h: r.h, support: r.support, maxc: r.maxc, dh, coinDef });
  console.log(
    `${String(m).padStart(3)} | ${r.h.toFixed(8).padStart(11)} | ${(m - r.h).toExponential(3).padStart(11)} | ${dh.toFixed(7).padStart(10)} | ${String(r.support).padStart(9)} | ${String(r.maxc).padStart(5)} | ${predicted.toFixed(1).padStart(21)} | ${coinDef.map((d) => d.toExponential(2)).join(' ')}`,
  );
}

// ---------------------------------------------------------------------------
// The bridge: what does H(m)/m >= 1-eps buy for the excess?
// ---------------------------------------------------------------------------

console.log('');
console.log('# The subadditivity bridge, evaluated at the measured entropies.');
console.log('# eps_m := 1 - H_c(m)/m.  Then H2(pbar) >= 1 - eps_m, hence');
console.log('#   |pbar - 1/2| <= d(eps_m) where H2(1/2 + d) = 1 - eps_m.');
console.log('# Compare with the true |p - 1/2|.');
console.log('');
console.log('  m |      eps_m |  implied |p-1/2| <= |   true |p-1/2| | implied |E(N)| <=  | true |E(N)|');
console.log('----+------------+----------------------+---------------+-------------------+------------');

function dFromEntropy(target) {
  // largest d with H2(1/2 + d) >= target
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (H2(0.5 + mid) >= target) lo = mid; else hi = mid;
  }
  return lo;
}

for (const r of rows) {
  const eps = 1 - r.h / r.m;
  const d = dFromEntropy(1 - eps);
  console.log(
    `${String(r.m).padStart(3)} | ${eps.toExponential(3).padStart(10)} | ${d.toExponential(4).padStart(20)} | ${Math.abs(p - 0.5).toExponential(4).padStart(13)} | ${(2 * d * N).toExponential(3).padStart(17)} | ${Math.abs(excess)}`,
  );
}

console.log('');
console.log('# Board comparison: centerColumnCount_ge_of_pow gives |E(N)| <= N - 2 log_5 N.');
console.log(`#   N - 2 log_5 N = ${(N - 2 * Math.log(N) / Math.log(5)).toFixed(0)}   (true |E| = ${Math.abs(excess)})`);
console.log(`# Saturation: the empirical block entropy cannot exceed log2(N-m+1) = ${log2(N).toFixed(3)} bits,`);
console.log(`# so for m > ${Math.floor(log2(N))} the statistic measures N and not the column.`);
console.log(`total time ${((Date.now() - t0) / 1000).toFixed(1)}s`);
