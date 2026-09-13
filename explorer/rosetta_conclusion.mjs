/**
 * Rosetta, 2026-09-13. What the Katai/BSZ conclusion actually asserts about the
 * centre column, measured -- because the conclusion is far stronger than Prize 2
 * and a route that asks for a false thing is not a route.
 *
 * The conclusion is: sum_{n<=x} f(n) a(n) = o(x) for EVERY multiplicative f with
 * |f| <= 1, where a(n) = (-1)^{centerColumn n}. That contains
 *   f = 1            -> Prize 2;
 *   f = mu           -> the centre column is Mobius-orthogonal (Sarnak-shaped);
 *   f = a Dirichlet character -> mean zero along every residue class.
 *
 * Also: [E] the one clash in the right-edge table, named rather than shrugged at;
 *       [F] a direction check on the implication, using a biased sequence whose
 *           mean is NOT zero -- its hypothesis must fail, or I have read the
 *           theorem backwards.
 *
 *   node explorer/rosetta_conclusion.mjs
 */

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { centerBitIndex, rows } from './rule30.mjs';

const cbuf = readFileSync(new URL('./talus7_center10m.bin', import.meta.url));
const LEN = cbuf.length;
const a = new Int8Array(LEN);
for (let i = 0; i < LEN; i++) a[i] = 1 - 2 * cbuf[i];

// ------------------------------------------------- mu, by a linear sieve
console.log('[1] the full conclusion at f = mu (Mobius orthogonality)');
{
  const mu = new Int8Array(LEN);
  const primes = [];
  const spf = new Int32Array(LEN);
  mu[1] = 1;
  for (let i = 2; i < LEN; i++) {
    if (spf[i] === 0) { spf[i] = i; primes.push(i); mu[i] = -1; }
    for (const p of primes) {
      if (p > spf[i] || p * i >= LEN) break;
      spf[p * i] = p;
      mu[p * i] = p === spf[i] ? 0 : -mu[i];
    }
  }
  // sanity: mu(1..12) = 1 -1 -1 0 -1 1 -1 0 0 1 -1 0
  console.log(`    mu(1..12) = ${Array.from(mu.slice(1, 13)).join(' ')}  (must be 1 -1 -1 0 -1 1 -1 0 0 1 -1 0)`);
  const Ns = [1e4, 1e5, 1e6, 1e7].map(Math.round);
  let sum = 0, n = 1;
  const line = [];
  for (const N of Ns) {
    for (; n < N; n++) sum += mu[n] * a[n];
    // the natural null for a mu-twisted sum has variance ~ (6/pi^2) N
    line.push(`N=${N}: S=${sum} S/sqrt(N)=${(sum / Math.sqrt(N)).toFixed(2)} S/(N*6/pi^2)=${(sum / (N * 6 / Math.PI ** 2)).toFixed(4)}`);
  }
  for (const l of line) console.log(`    ${l}`);
  // control: the same twist against three coins
  for (let t = 0; t < 3; t++) {
    const b = new Int8Array(LEN);
    const CH = 1 << 20;
    for (let off = 0; off < LEN; off += CH) {
      const m = Math.min(CH, LEN - off); const r = randomBytes(m);
      for (let i = 0; i < m; i++) b[off + i] = 1 - 2 * (r[i] & 1);
    }
    let s2 = 0; for (let i = 1; i < LEN; i++) s2 += mu[i] * b[i];
    console.log(`    coin ${t + 1}: S=${s2} S/sqrt(N)=${(s2 / Math.sqrt(LEN)).toFixed(2)}`);
  }
  // and at f = a Dirichlet character: mean along residue classes mod k
  for (const k of [3, 4, 5, 8]) {
    const cnt = new Float64Array(k), tot = new Float64Array(k);
    for (let i = 1; i < LEN; i++) { cnt[i % k] += a[i]; tot[i % k]++; }
    const zs = Array.from({ length: k }, (_, r) => (cnt[r] / Math.sqrt(tot[r])).toFixed(2));
    console.log(`    mean of a along residues mod ${k}, as z-scores: ${zs.join(' ')}`);
  }
}

// --------------------------------------------- [E] the clash in the edge table
console.log('\n[E] the exceptional t in the right-edge table');
{
  const T = 12000;
  const base = centerBitIndex(T);
  const g = new Int32Array(T + 1);
  let t = 0;
  for (const row of rows(T)) {
    if (t >= 1) { let d = 1; for (; d <= 2 * t; d++) if (((row >> BigInt(base + t - d)) & 1n) === 1n) break; g[t] = d; }
    t++; if (t > T) break;
  }
  const ord2 = (n) => { let v = 0; while ((n & 1) === 0) { n >>= 1; v++; } return v; };
  const first = new Map(), bad = [];
  for (let n = 1; n <= T; n++) {
    const v = ord2(n);
    if (!first.has(v)) first.set(v, [n, g[n]]);
    else if (first.get(v)[1] !== g[n]) bad.push([n, v, g[n], first.get(v)]);
  }
  console.log(`    exceptions: ${bad.length}`);
  for (const [n, v, gn, [n0, g0]] of bad) console.log(`      t=${n} (ord_2=${v}) has g=${gn}; first t with that valuation was t=${n0} with g=${g0}`);
  console.log(`    g(1..24) = ${Array.from(g.slice(1, 25)).join(' ')}`);
}

// -------------------------------------- [F] direction check on the implication
console.log('\n[F] direction check: a sequence with mean != 0 must FAIL the hypothesis');
{
  const N = 2_000_000;
  const b = new Int8Array(N);
  const r = randomBytes(N);
  for (let i = 0; i < N; i++) b[i] = (r[i] & 3) === 0 ? -1 : 1;   // mean 1/2
  let m = 0; for (let i = 1; i < N; i++) m += b[i];
  const pairs = [[3, 5], [7, 11], [2, 13]];
  const ds = pairs.map(([p, q]) => {
    const M = Math.floor((N - 1) / q); let s = 0;
    for (let n = 1; n <= M; n++) s += b[p * n] * b[q * n];
    return `D(${p},${q})=${(s / M).toFixed(4)}`;
  });
  console.log(`    biased sequence, mean = ${(m / N).toFixed(4)}: ${ds.join(' ')}  (all must be ~mean^2 = ${(0.25).toFixed(4)}, not 0)`);
}
