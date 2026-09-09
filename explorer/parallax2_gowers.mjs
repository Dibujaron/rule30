/**
 * The Fourier profile and the U^2 Gowers norm of the centre column, against
 * the sequences the analytic number theory of digital sequences can actually
 * handle.
 *
 * In the Z/N model, for u : Z/N -> {-1,+1} with
 *   uhat(k) = (1/N) sum_t u(t) e(-2 pi i k t / N),
 * the second Gowers norm is  ||u||_{U^2}^4 = sum_k |uhat(k)|^4,  and
 *   max_k |uhat(k)|  is the largest correlation with any linear phase.
 *
 * Two things this buys.
 *
 * PRIZE 2 is  |uhat(0)| = o(1);  it is one entry of the same table.
 *
 * PRIZE 1 gets a certificate. If u is eventually p-periodic with onset N0,
 * the tail is an exact p-periodic word w, whose own DFT satisfies
 * max_k |W(k)| >= sqrt(p) because sum_k |W(k)|^2 = p^2. So the whole sum
 * has a frequency where it is at least (N - N0)/sqrt(p) - N0 in size, giving
 *   max_k |uhat(k)|  >=  (1 - N0/N)/sqrt(p) - N0/N,
 * i.e. a measured maximum S excludes every period below roughly 1/S^2. That
 * is the Wiener/Fourier form of a period scan: one transform covers all
 * periods at once.
 *
 * CONTROLS, and they are the point. Thue-Morse and Rudin-Shapiro are the
 * field's flagships -- the sequences Mauduit-Rivat and Konieczny can prove
 * theorems about. Their Fourier maxima are far ABOVE the square-root-random
 * floor (Gelfond's exponent for Thue-Morse), because they are structured
 * enough to be provable. A xorshift stream gives the floor.
 */

import { centerColumnBits } from './rule30.mjs';

const LOGN = 19;
const N = 1 << LOGN;

// --------------------------------------------------------------------------
// an iterative radix-2 FFT
// --------------------------------------------------------------------------

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i];
      re[i] = re[j];
      re[j] = t;
      t = im[i];
      im[i] = im[j];
      im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k];
        const ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr;
        im[i + k + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
}

function profile(name, bits) {
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let t = 0; t < N; t++) re[t] = bits[t] ? -1 : 1;
  fft(re, im);
  let maxAbs = 0;
  let argmax = 0;
  let u2 = 0;
  let zero = 0;
  for (let k = 0; k < N; k++) {
    const m2 = (re[k] * re[k] + im[k] * im[k]) / (N * N);
    u2 += m2 * m2;
    const m = Math.sqrt(m2);
    if (k === 0) zero = m;
    if (m > maxAbs) {
      maxAbs = m;
      argmax = k;
    }
  }
  const gowers = Math.pow(u2, 0.25);
  const periodBound = maxAbs > 0 ? 1 / (maxAbs * maxAbs) : Infinity;
  console.log(
    `  ${name.padEnd(24)} |uhat(0)| ${zero.toExponential(3)}   ` +
      `max|uhat| ${maxAbs.toExponential(3)} at k=${String(argmax).padStart(7)}   ` +
      `||u||_{U^2} ${gowers.toFixed(5)}   period floor ${periodBound < 1e9 ? Math.round(periodBound) : '-'}`,
  );
}

console.log(`Fourier profile in Z/N, N = 2^${LOGN} = ${N}`);
console.log(`square-root-random floor for max|uhat| is about sqrt(ln N / N) = ${Math.sqrt(Math.log(N) / N).toExponential(3)}`);
console.log(`random ||u||_{U^2} is about (2/N)^{1/4} = ${Math.pow(2 / N, 0.25).toFixed(5)}\n`);

// rule 30's centre column
profile('rule 30 centre column', centerColumnBits(N));

// Thue-Morse: parity of the binary digit sum
{
  const b = new Uint8Array(N);
  for (let n = 1; n < N; n++) b[n] = b[n >> 1] ^ (n & 1);
  profile('Thue-Morse', b);
}

// Rudin-Shapiro: parity of the number of `11` blocks in binary
{
  const b = new Uint8Array(N);
  for (let n = 1; n < N; n++) b[n] = b[n >> 1] ^ ((n & 3) === 3 ? 1 : 0);
  profile('Rudin-Shapiro', b);
}

// rule 150's centre column, the F_2-linear rule from the same single seed
{
  const b = new Uint8Array(N);
  const centre = BigInt(N + 2);
  let x = 1n << centre;
  for (let t = 0; t < N; t++) {
    b[t] = Number((x >> centre) & 1n);
    x = (x << 1n) ^ x ^ (x >> 1n);
    if (t > 4000) break; // it is constant; no need to run the whole way
  }
  for (let t = 4001; t < N; t++) b[t] = b[4000];
  profile('rule 150 centre column', b);
}

// a xorshift stream, as the floor
{
  const b = new Uint8Array(N);
  let s = 0x9e3779b9;
  for (let t = 0; t < N; t++) {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    b[t] = s & 1;
  }
  profile('xorshift', b);
}

// (10)^N, to show what an eventually periodic sequence looks like here
{
  const b = new Uint8Array(N);
  for (let t = 0; t < N; t++) b[t] = t & 1;
  profile('(10)^inf', b);
}

// period 1009 random word repeated -- the shape Prize 1 must exclude
{
  const p = 1009;
  const w = new Uint8Array(p);
  let s = 12345;
  for (let i = 0; i < p; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    w[i] = (s >>> 16) & 1;
  }
  const b = new Uint8Array(N);
  for (let t = 0; t < N; t++) b[t] = w[t % p];
  profile(`random word of period ${p}`, b);
}
