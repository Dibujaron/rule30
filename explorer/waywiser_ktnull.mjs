/**
 * Waywiser, connector, 2026-09-12. A null, and a calibration, for the order-k
 * finite-state gambler measurement in explorer/waywiser_gamblers.mjs.
 *
 * That script reported log2 capital for rule 30 and two coin draws. Two draws
 * is not a null. Here: 12 draws at k = 4 and k = 8, rule 30's rank among them,
 * and — the part that matters more — the *calibration*, i.e. at which k the
 * instrument stops being able to see a win at all. The capped-at-8 control has
 * bounded black runs and so is maximally non-normal, yet its log2 capital goes
 * negative from k = 12 on, because the Krichevsky-Trofimov model with 2^k
 * states pays about (2^k / 2) * log2(N) bits to learn its own parameters and
 * that swamps the signal. So a negative reading at large k is a fact about the
 * instrument and not about the sequence, and the table must say where the
 * instrument's range ends.
 */

import { readFileSync } from 'node:fs';
import { A051023_PREFIX } from './rule30.mjs';

const bits = new Uint8Array(readFileSync(new URL('./talus7_center10m.bin', import.meta.url)));
const N = bits.length;
let bad = 0;
for (let i = 0; i < A051023_PREFIX.length; i++) if (bits[i] !== A051023_PREFIX[i]) bad++;
if (bad) throw new Error('bin is not the centre column');

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
function capped(src, cap) {
  const out = new Uint8Array(src.length);
  let run = 0;
  for (let i = 0; i < src.length; i++) {
    const b = run >= cap ? 0 : src[i];
    out[i] = b;
    run = b ? run + 1 : 0;
  }
  return out;
}
function ktLogCapital(x, k) {
  const S = 1 << k, mask = S - 1;
  const c0 = new Float64Array(S), c1 = new Float64Array(S);
  let state = 0, lg = 0;
  for (let i = 0; i < k; i++) state = ((state << 1) | x[i]) & mask;
  for (let i = k; i < x.length; i++) {
    const b = x[i], n0 = c0[state], n1 = c1[state];
    const p = b ? (n1 + 0.5) / (n0 + n1 + 1) : (n0 + 0.5) / (n0 + n1 + 1);
    lg += Math.log2(2 * p);
    if (b) c1[state] = n1 + 1; else c0[state] = n0 + 1;
    state = ((state << 1) | b) & mask;
  }
  return lg;
}

const DRAWS = 12;
for (const k of [4, 8]) {
  const r30 = ktLogCapital(bits, k);
  const cs = [];
  for (let d = 0; d < DRAWS; d++) cs.push(ktLogCapital(coin(N, 0x2545f491 + d * 2654435761), k));
  cs.sort((a, b) => a - b);
  const below = cs.filter((v) => v <= r30).length;
  console.log(`k=${k}: rule 30 log2 capital ${r30.toFixed(1)}; ` +
    `${DRAWS} coin draws ${cs[0].toFixed(1)} .. ${cs[DRAWS - 1].toFixed(1)}, ` +
    `median ${cs[DRAWS >> 1].toFixed(1)}; coins at or below rule 30: ${below}/${DRAWS}`);
}

console.log('\ncalibration: the capped-at-8 control, which has bounded black runs');
console.log('   k | capped-at-8  | rule 30      | KT model cost ~ (2^k/2)*log2(N)');
const cap8 = capped(bits, 8);
for (const k of [1, 2, 4, 6, 8, 10, 12, 14]) {
  const cost = (Math.pow(2, k) / 2) * Math.log2(N);
  console.log(`  ${String(k).padStart(2)} | ${ktLogCapital(cap8, k).toFixed(1).padStart(12)} | ` +
    `${ktLogCapital(bits, k).toFixed(1).padStart(12)} | ${cost.toExponential(2)}`);
}
