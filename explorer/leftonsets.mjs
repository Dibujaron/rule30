/**
 * Onsets of the left diagonals, recounted against OEIS A363346.
 *
 *   node explorer/leftonsets.mjs
 *
 * For k <= K_MAX, the left diagonal leftDiagonal k j = evolve (j+k) (-j) is
 * read from N rows. Its period is a power of two dividing 2^k
 * (leftDiagonal_periodicFrom_pow), so only p = 1, 2, 4, ... are tried; the
 * minimal such p with a tail of at least MIN_CYCLES cycles is reported with
 * its onset, the first index from which leftDiagonal k (j + p) = leftDiagonal k j
 * holds for every j. The b-file sources/oeis-a363346-left-diagonal-transients.txt
 * is printed beside it under the two plausible index alignments (n = k and
 * n = k + 1), so the reader can see which definition, if either, it matches.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { readFileSync } from 'node:fs';
import { centerBitIndex, rows } from './rule30.mjs';

const N = 12000;
const K_MAX = 100;
const MIN_CYCLES = 8;

const diag = [];
for (let k = 0; k <= K_MAX; k++) diag.push(new Uint8Array(N - k));
let t = 0;
for (const row of rows(N)) {
  const base = centerBitIndex(N);
  for (let k = 0; k <= K_MAX && k <= t; k++) diag[k][t - k] = Number((row >> BigInt(base - (t - k))) & 1n);
  t++;
}

let oeis = new Map();
try {
  for (const line of readFileSync(new URL('../sources/oeis-a363346-left-diagonal-transients.txt', import.meta.url), 'utf8').split('\n')) {
    const m = line.trim().match(/^(\d+)\s+(\d+)$/);
    if (m) oeis.set(Number(m[1]), Number(m[2]));
  }
} catch { oeis = null; }

console.log(`left diagonals from ${N} rows; minimal power-of-two period with >= ${MIN_CYCLES} cycles of tail`);
console.log('   k   period   onset   onset/k   A363346(n=k)  A363346(n=k+1)   first 24 terms');
for (let k = 0; k <= K_MAX; k++) {
  const a = diag[k];
  let found = null;
  for (let p = 1; p * MIN_CYCLES <= a.length; p *= 2) {
    let lastBreak = -1;
    for (let i = p; i < a.length; i++) if (a[i] !== a[i - p]) lastBreak = i;
    const onset = lastBreak < 0 ? 0 : lastBreak - p + 1;
    if (a.length - onset >= MIN_CYCLES * p) { found = { p, onset }; break; }
  }
  const o1 = oeis && oeis.has(k) ? oeis.get(k) : '-', o2 = oeis && oeis.has(k + 1) ? oeis.get(k + 1) : '-';
  const cell = found ? `${String(found.p).padStart(7)} ${String(found.onset).padStart(7)}   ${(found.onset / Math.max(k, 1)).toFixed(3)}` : `${'none'.padStart(7)} ${'-'.padStart(7)}   -    `;
  console.log(`  ${String(k).padStart(3)} ${cell}   ${String(o1).padStart(12)}  ${String(o2).padStart(14)}   ${Array.from(a.slice(0, 24)).join('')}`);
}
