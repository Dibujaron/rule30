/**
 * Rosetta, 2026-09-13. The Katai / Bourgain-Sarnak-Ziegler orthogonality
 * criterion, measured on rule 30's centre column.
 *
 * Katai's criterion (arXiv:1705.07322 Thm 1.2): if a : N -> C is bounded and
 *
 *     sum_{n <= x} a(pn) conj(a(qn)) = o(x)      for all distinct primes p, q,
 *
 * then sum_{n <= x} f(n) a(n) = o(x) for EVERY multiplicative f with |f| <= 1.
 * The constant function 1 is such an f, so the conclusion at f = 1 is exactly
 * Prize 2 for a(n) = (-1)^{centerColumn n}.
 *
 * This script measures the HYPOTHESIS: D(p,q) = (1/N) sum_{n<=N} a(pn) a(qn),
 * with N = floor(LEN / max(p,q)) so every index read exists.
 *
 * Instrument validation is three-sided, because a one-sided check on a
 * correlation statistic is worth nothing:
 *   (+) constant sequences must return D = 1 exactly  (rules 90 and 150);
 *   (+) a purely periodic sequence must return the exact rational its period
 *       predicts, computed independently from the period alone;
 *   (-) fair coins must return |D| ~ 1/sqrt(N) with the right scatter.
 * The coin is node:crypto, not a hand-rolled PRNG.
 *
 *   node explorer/rosetta_katai.mjs
 */

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { naiveCenterColumn } from './rule30.mjs';

const LEN = 10_000_000;
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];

// ---------------------------------------------------------------- the column
const cbuf = readFileSync(new URL('./talus7_center10m.bin', import.meta.url));
if (cbuf.length !== LEN) throw new Error(`centre column file is ${cbuf.length} bytes`);
{
  // cross-check the file against a freshly generated prefix AND against a
  // published deep statistic this session did not produce (obstruction 20:
  // E = 4440 at N = 10^7).
  const small = readFileSync(new URL('./talus7_center.bin', import.meta.url));
  let bad = 0;
  for (let i = 0; i < small.length; i++) if (small[i] !== cbuf[i]) bad++;
  let count = 0;
  for (let i = 0; i < LEN; i++) count += cbuf[i];
  console.log(`centre column: ${LEN} terms; vs freshly generated 200k prefix: ${bad} mismatches`);
  console.log(`  count=${count}  E(N)=${2 * count - LEN}  (obstruction 20 publishes E = 4440 at 10^7)`);
  if (bad) throw new Error('the 10M file disagrees with the engine');
}

/** +-1 form of a 0/1 array. */
const pm1 = (bits) => { const s = new Int8Array(bits.length); for (let i = 0; i < bits.length; i++) s[i] = 1 - 2 * bits[i]; return s; };

// ------------------------------------------------------------- the statistic
/** D(p,q) over n = 1..N, N = floor(len / max(p,q)). Returns {D, N, z}. */
function dilationCorr(s, p, q, len = s.length) {
  const N = Math.floor((len - 1) / Math.max(p, q));
  let sum = 0;
  for (let n = 1; n <= N; n++) sum += s[p * n] * s[q * n];
  const D = sum / N;
  return { D, N, z: D * Math.sqrt(N) };
}

/** max |z| and the pair attaining it, over all distinct prime pairs. */
function sweep(s, len, primes = PRIMES) {
  const rows = [];
  for (let i = 0; i < primes.length; i++)
    for (let j = i + 1; j < primes.length; j++) {
      const r = dilationCorr(s, primes[i], primes[j], len);
      rows.push({ p: primes[i], q: primes[j], ...r });
    }
  rows.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  return rows;
}

const fmt = (rows, k = 5) => rows.slice(0, k).map((r) => `(${r.p},${r.q}) D=${r.D.toFixed(6)} z=${r.z.toFixed(2)}`).join('  ');
function report(label, s, len = s.length) {
  const rows = sweep(s, len);
  const zs = rows.map((r) => Math.abs(r.z));
  const mean = zs.reduce((a, b) => a + b, 0) / zs.length;
  const over2 = zs.filter((z) => z > 2).length;
  console.log(`${label}`);
  console.log(`   ${rows.length} prime pairs; max|z| = ${zs[0].toFixed(2)}; mean|z| = ${mean.toFixed(2)}; ${over2} pairs with |z| > 2`);
  console.log(`   worst: ${fmt(rows)}`);
  return rows;
}

console.log('\n=== 1. rule 30 centre column ===');
const sC = pm1(cbuf);
const rowsC = report('centre column c, 10^7 terms', sC);

console.log('\n=== 2. fair coins (node:crypto), same lengths ===');
for (let trial = 0; trial < 3; trial++) {
  const bits = new Uint8Array(LEN);
  // fill from crypto in chunks
  const CH = 1 << 20;
  for (let off = 0; off < LEN; off += CH) {
    const n = Math.min(CH, LEN - off);
    const bytes = randomBytes(n);
    for (let i = 0; i < n; i++) bits[off + i] = bytes[i] & 1;
  }
  report(`coin ${trial + 1}`, pm1(bits));
}

console.log('\n=== 3. positive controls: the instrument must SEE structure ===');
// 3a. constant sequences: rule 90 and rule 150 centre columns.
{
  const D = 20000;
  for (const rule of [90, 150]) {
    const bits = naiveCenterColumn(rule, D);
    const dens = bits.reduce((a, b) => a + b, 0) / D;
    const r = dilationCorr(pm1(bits), 3, 5, D);
    console.log(`   rule ${rule} centre column (density ${dens.toFixed(4)}): D(3,5) = ${r.D.toFixed(6)} over N = ${r.N}`);
  }
}
// 3b. a purely periodic sequence: the measured D must equal the exact rational
//     the period alone predicts.
{
  const P = 32;
  const word = Array.from(randomBytes(P)).map((b) => b & 1);
  const D = 2_000_000;
  const bits = new Uint8Array(D);
  for (let i = 0; i < D; i++) bits[i] = word[i % P];
  const s = pm1(bits);
  for (const [p, q] of [[3, 5], [7, 11], [2, 3]]) {
    const r = dilationCorr(s, p, q, D);
    // exact prediction: average over one period of n, since p*n mod P and
    // q*n mod P are both periodic in n with period P.
    let ex = 0;
    for (let n = 1; n <= P; n++) ex += (1 - 2 * word[(p * n) % P]) * (1 - 2 * word[(q * n) % P]);
    ex /= P;
    console.log(`   period-${P} word: D(${p},${q}) measured ${r.D.toFixed(6)}, predicted from the period alone ${ex.toFixed(6)}`);
  }
}

console.log('\n=== 4. negative controls: deterministic, zero-entropy, coin-like ===');
// 4a. Thue-Morse: 2-automatic, entropy 0, proved orthogonal to mu in print.
{
  const D = 4_000_000;
  const bits = new Uint8Array(D);
  for (let i = 1; i < D; i++) bits[i] = bits[i >> 1] ^ (i & 1);
  report('   Thue-Morse (2-automatic, zero entropy)', pm1(bits), D);
}
// 4b. Rudin-Shapiro: 2-automatic, entropy 0.
{
  const D = 4_000_000;
  const bits = new Uint8Array(D);
  // number of (occurrences of 11) in binary expansion, mod 2
  for (let i = 1; i < D; i++) bits[i] = bits[i >> 1] ^ ((i & 3) === 3 ? 1 : 0);
  report('   Rudin-Shapiro (2-automatic, zero entropy)', pm1(bits), D);
}
