/**
 * Rosetta, 2026-09-13. The Katai hypothesis is an ASYMPTOTIC statement, so a
 * correlation measured at one N says nothing about it. This script measures the
 * DECAY of the dilation correlations.
 *
 * The tell that forced this script: Thue-Morse -- 2-automatic, zero entropy,
 * and the one sequence near this problem whose Katai hypothesis is believed --
 * returns |z| = 75 at N = 1.3e6 where a coin returns 2.6. So |z| at one N does
 * not measure "satisfies the hypothesis"; it measures the RATE.
 *
 * For each sequence and each distinct prime pair we compute
 *   D_N(p,q) = (1/N) sum_{n<=N} a(pn) a(qn)
 * at a geometric ladder of N, pool |D_N| over the 55 pairs as an RMS, and fit
 * RMS|D_N| ~ N^{-beta}. A fair coin has beta = 1/2 exactly. Anything with
 * beta < 1/2 still satisfies the hypothesis but converges more slowly than a
 * coin; anything with beta = 0 fails it.
 *
 *   node explorer/rosetta_decay.mjs
 */

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const LEN = 10_000_000;
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
const PAIRS = [];
for (let i = 0; i < PRIMES.length; i++) for (let j = i + 1; j < PRIMES.length; j++) PAIRS.push([PRIMES[i], PRIMES[j]]);

const pm1 = (bits) => { const s = new Int8Array(bits.length); for (let i = 0; i < bits.length; i++) s[i] = 1 - 2 * bits[i]; return s; };

/** running partial sums of a(pn)a(qn) evaluated at the ladder of N. */
function ladder(s, p, q, Ns) {
  const out = [];
  let sum = 0, n = 1;
  for (const N of Ns) {
    for (; n <= N; n++) sum += s[p * n] * s[q * n];
    out.push(sum / N);
  }
  return out;
}

function profile(label, s, len) {
  const maxN = Math.floor((len - 1) / 31);
  const Ns = [];
  for (let N = 1000; N <= maxN; N = Math.round(N * Math.SQRT2)) Ns.push(N);
  Ns.push(maxN);
  const acc = Ns.map(() => ({ sq: 0, mx: 0, mxp: '' }));
  for (const [p, q] of PAIRS) {
    const ds = ladder(s, p, q, Ns);
    for (let i = 0; i < Ns.length; i++) {
      const d = Math.abs(ds[i]);
      acc[i].sq += d * d;
      if (d > acc[i].mx) { acc[i].mx = d; acc[i].mxp = `(${p},${q})`; }
    }
  }
  const rms = acc.map((a) => Math.sqrt(a.sq / PAIRS.length));
  // least squares fit of log rms against log N
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < Ns.length; i++) { const x = Math.log(Ns[i]), y = Math.log(rms[i]); sx += x; sy += y; sxx += x * x; sxy += x * y; }
  const k = Ns.length;
  const beta = -(k * sxy - sx * sy) / (k * sxx - sx * sx);
  console.log(`\n${label}`);
  console.log(`   N       : ${Ns.map((N) => String(N).padStart(8)).join('')}`);
  console.log(`   RMS|D|  : ${rms.map((r) => r.toExponential(2).padStart(8)).join('')}`);
  console.log(`   RMS|D|*sqrt(N): ${rms.map((r, i) => (r * Math.sqrt(Ns[i])).toFixed(2).padStart(8)).join('')}`);
  console.log(`   fitted decay exponent beta = ${beta.toFixed(4)}   (fair coin: 0.5000)`);
  console.log(`   worst pair at the largest N: ${acc[acc.length - 1].mxp} |D| = ${acc[acc.length - 1].mx.toExponential(3)}`);
  return beta;
}

// ------------------------------------------------------------------ sequences
const cbuf = readFileSync(new URL('./talus7_center10m.bin', import.meta.url));
profile('rule 30 centre column', pm1(cbuf), LEN);

for (let t = 0; t < 2; t++) {
  const bits = new Uint8Array(LEN);
  const CH = 1 << 20;
  for (let off = 0; off < LEN; off += CH) {
    const n = Math.min(CH, LEN - off);
    const b = randomBytes(n);
    for (let i = 0; i < n; i++) bits[off + i] = b[i] & 1;
  }
  profile(`fair coin ${t + 1} (node:crypto)`, pm1(bits), LEN);
}

{
  const bits = new Uint8Array(LEN);
  for (let i = 1; i < LEN; i++) bits[i] = bits[i >> 1] ^ (i & 1);
  profile('Thue-Morse', pm1(bits), LEN);
}
{
  const bits = new Uint8Array(LEN);
  for (let i = 1; i < LEN; i++) bits[i] = bits[i >> 1] ^ ((i & 3) === 3 ? 1 : 0);
  profile('Rudin-Shapiro', pm1(bits), LEN);
}
{
  const P = 64;
  const word = Array.from(randomBytes(P)).map((b) => b & 1);
  const bits = new Uint8Array(LEN);
  for (let i = 0; i < LEN; i++) bits[i] = word[i % P];
  profile(`purely periodic, period ${P} (must NOT decay)`, pm1(bits), LEN);
}

// ------------------------------------------- the 2-adic split the brief names
{
  const s = pm1(cbuf);
  const maxN = Math.floor((LEN - 1) / 31);
  let even = [], odd = [];
  for (const [p, q] of PAIRS) {
    const N = Math.floor((LEN - 1) / q);
    let sum = 0;
    for (let n = 1; n <= N; n++) sum += s[p * n] * s[q * n];
    const z = (sum / N) * Math.sqrt(N);
    (p === 2 ? even : odd).push(Math.abs(z));
  }
  const mean = (a) => a.reduce((u, v) => u + v, 0) / a.length;
  console.log(`\n2-adic split of the centre column's |z|:`);
  console.log(`   pairs containing 2 (${even.length}): mean|z| = ${mean(even).toFixed(2)}, max = ${Math.max(...even).toFixed(2)}`);
  console.log(`   odd prime pairs   (${odd.length}): mean|z| = ${mean(odd).toFixed(2)}, max = ${Math.max(...odd).toFixed(2)}`);
  // and the non-prime companion (1,q): does c correlate with its own dilate?
  const line = [];
  for (const q of PRIMES) {
    const N = Math.floor((LEN - 1) / q);
    let sum = 0;
    for (let n = 1; n <= N; n++) sum += s[n] * s[q * n];
    line.push(`(1,${q}) z=${((sum / N) * Math.sqrt(N)).toFixed(2)}`);
  }
  console.log(`   c against its own dilates: ${line.join(' ')}`);
  void maxN;
}
