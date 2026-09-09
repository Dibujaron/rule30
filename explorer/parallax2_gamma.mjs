/**
 * The temporal autocorrelation of the centre column, and the corrected
 * density of the quadratic correction term.
 *
 * WHY THE AUTOCORRELATION. Put u(t) = (-1)^{c(t)}. Then
 *
 *   gamma(r) = lim_N (1/N) sum_{t<N} u(t) u(t+r)
 *
 * carries both prizes at once. If c is eventually p-periodic then
 * gamma(p) = 1 exactly, so a proof that gamma(r) < 1 for every r >= 1 is
 * Prize 1. And van der Corput's inequality bounds |(1/N) sum u| in terms of
 * the average of |gamma(r)| over r < R, so a proof that those averages tend
 * to 0 is Prize 2. This is the object the Mauduit-Rivat machinery estimates
 * for digit sums, and it is the one place where the two prizes are the same
 * question asked at two moments.
 *
 * Also here: the density of the block `11` in the seed's picture, done with a
 * real (untruncated) picture. The BigInt version in parallax2_linear.mjs let
 * the left half of the cone fall off bit 0 and reported 0.000025, which is
 * wrong; the exactly-0.2500 cell density beside it was the tell.
 */

import { centerColumnBits } from './rule30.mjs';

// --------------------------------------------------------------------------
// the corrected block density, on a real picture
// --------------------------------------------------------------------------

console.log('density of 1s and of the correction block `11` in the seed\'s picture');
console.log('(cells counted over the light cone only; row t has 2t+1 of them)\n');
{
  const ROWS = 8000;
  const W = 2 * ROWS + 3;
  const O = ROWS + 1; // array index of cell 0
  let cur = new Uint8Array(W);
  let nxt = new Uint8Array(W);
  cur[O] = 1;
  let ones = 0;
  let fire = 0;
  let cells = 0;
  for (let t = 0; t < ROWS; t++) {
    for (let i = O - t; i <= O + t; i++) {
      if (cur[i]) {
        ones++;
        if (cur[i + 1]) fire++;
      }
    }
    cells += 2 * t + 1;
    for (let i = O - t - 1; i <= O + t + 1; i++) {
      nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    }
    const tmp = cur;
    cur = nxt;
    nxt = tmp;
    if ((t + 1) % 2000 === 0) {
      console.log(
        `  rows <= ${String(t + 1).padStart(5)}   cells ${String(cells).padStart(9)}   ` +
          `density of 1s ${(ones / cells).toFixed(6)}   density of block 11 ${(fire / cells).toFixed(6)}`,
      );
    }
  }
}

// --------------------------------------------------------------------------
// the centre column and its autocorrelations
// --------------------------------------------------------------------------

const N = 400_000;
console.log(`\ncentre column to N = ${N}\n`);
const bits = centerColumnBits(N);

for (const m of [1000, 10_000, 100_000, 200_000, 400_000]) {
  let s = 0;
  for (let t = 0; t < m; t++) s += bits[t];
  console.log(
    `  density of 1s over the first ${String(m).padStart(7)} terms = ${(s / m).toFixed(6)}` +
      `   |sum u| / m = ${(Math.abs(m - 2 * s) / m).toFixed(6)}`,
  );
}

const RMAX = 4096;
const gamma = new Float64Array(RMAX + 1);
for (let r = 1; r <= RMAX; r++) {
  const M = N - r;
  let agree = 0;
  for (let t = 0; t < M; t++) if (bits[t] === bits[t + r]) agree++;
  gamma[r] = (2 * agree - M) / M;
}

let maxAbs = 0;
let argmax = 0;
let maxG = -2;
let argmaxG = 0;
for (let r = 1; r <= RMAX; r++) {
  if (Math.abs(gamma[r]) > maxAbs) {
    maxAbs = Math.abs(gamma[r]);
    argmax = r;
  }
  if (gamma[r] > maxG) {
    maxG = gamma[r];
    argmaxG = r;
  }
}

console.log(`\nautocorrelations gamma(r) for 1 <= r <= ${RMAX}, at N = ${N}`);
console.log(`  noise floor 1/sqrt(N) = ${(1 / Math.sqrt(N)).toFixed(6)}\n`);
console.log('    r      gamma(r)');
for (const r of [1, 2, 3, 4, 5, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]) {
  console.log(`  ${String(r).padStart(5)}   ${gamma[r].toFixed(6).padStart(10)}`);
}
console.log(
  `\n  max |gamma(r)| = ${maxAbs.toFixed(6)} at r = ${argmax}` +
    `   (that is ${(maxAbs * Math.sqrt(N)).toFixed(2)} noise units)`,
);
console.log(
  `  max  gamma(r)  = ${maxG.toFixed(6)} at r = ${argmaxG}` +
    `   -- Prize 1 needs this to stay below 1 for EVERY r`,
);

console.log('\n  Cesaro averages of |gamma(r)| -- Prize 2 needs these to tend to 0:');
for (const R of [64, 256, 1024, 4096]) {
  let s = 0;
  for (let r = 1; r <= R; r++) s += Math.abs(gamma[r]);
  console.log(
    `    (1/R) sum_{r<=R} |gamma(r)| = ${(s / R).toFixed(6)}   at R = ${String(R).padStart(4)}` +
      `   (noise floor ${(1 / Math.sqrt(N)).toFixed(6)})`,
  );
}

// --------------------------------------------------------------------------
// block frequencies -- the stronger reading of Prize 2
// --------------------------------------------------------------------------

console.log('\nblock frequencies: |freq(v) - 2^-k| for all blocks v of length k, at N = 400000\n');
for (let k = 1; k <= 12; k++) {
  const counts = new Float64Array(2 ** k);
  const M = N - k + 1;
  let w = 0;
  for (let t = 0; t < k - 1; t++) w = (w << 1) | bits[t];
  for (let t = k - 1; t < N; t++) {
    w = ((w << 1) | bits[t]) & (2 ** k - 1);
    counts[w]++;
  }
  let maxDev = 0;
  let missing = 0;
  for (let v = 0; v < 2 ** k; v++) {
    if (counts[v] === 0) missing++;
    const dev = Math.abs(counts[v] / M - 2 ** -k);
    if (dev > maxDev) maxDev = dev;
  }
  console.log(
    `  k = ${String(k).padStart(2)}   blocks ${String(2 ** k).padStart(5)}   ` +
      `max |freq - 2^-k| = ${maxDev.toExponential(3)}   relative ${(maxDev * 2 ** k).toFixed(4)}   never seen: ${missing}`,
  );
}
