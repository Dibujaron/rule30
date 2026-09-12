/**
 * Rosetta, 2026-09-12 — the control for the one number I liked.
 *
 * The first run of rosetta13_entropy.mjs reported the centre column's block
 * entropy DEFICIT as one to three orders of magnitude below three "coin"
 * words' at every block length. That would be a finding. My notebook says the
 * number I like most is the one to control first, so this script isolates the
 * control: the same measurement with the coin drawn four different ways.
 *
 *   A. the hand-rolled 32-bit xorshift the first run used, sliced 32 bits per
 *      output  (the suspect)
 *   B. the same xorshift, one bit per output, top bit only
 *   C. node:crypto randomFillSync  (a CSPRNG; shares nothing with anything here)
 *   D. Math.random()               (V8's xorshift128+, a second independent source)
 *
 * If the column's deficit stays below C and D, the finding survives. If C and
 * D sit level with the column, the finding was A.
 */

import { centerColumnBits } from './rule30.mjs';
import { randomFillSync } from 'node:crypto';

const N = 300_000;
const MMAX = 16;

function log2(x) { return Math.log(x) / Math.LN2; }

function blockEntropy(bits, n, m) {
  const size = 1 << m;
  const counts = new Int32Array(size);
  const mask = size - 1;
  let w = 0;
  for (let i = 0; i < m - 1; i++) w = ((w << 1) | bits[i]) & mask;
  let total = 0;
  for (let i = m - 1; i < n; i++) { w = ((w << 1) | bits[i]) & mask; counts[w]++; total++; }
  let h = 0;
  for (let k = 0; k < size; k++) {
    const cnt = counts[k];
    if (cnt === 0) continue;
    const p = cnt / total;
    h -= p * log2(p);
  }
  return h;
}

function makeXorshift(seedA, seedB) {
  let s0 = seedA >>> 0, s1 = seedB >>> 0;
  return function next() {
    let x = s0; const y = s1;
    s0 = y;
    x ^= x << 23; x >>>= 0;
    x ^= x >>> 17;
    x ^= y ^ (y >>> 26);
    s1 = x >>> 0;
    return (s0 + s1) >>> 0;
  };
}

function coinA(n, a, b) {                     // 32 bits per output — the suspect
  const rng = makeXorshift(a, b);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i += 32) {
    const r = rng();
    for (let j = 0; j < 32 && i + j < n; j++) out[i + j] = (r >>> j) & 1;
  }
  return out;
}
function coinB(n, a, b) {                     // 1 bit per output, top bit
  const rng = makeXorshift(a, b);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = rng() >>> 31;
  return out;
}
function coinC(n) {                           // node:crypto
  const bytes = new Uint8Array(Math.ceil(n / 8));
  for (let off = 0; off < bytes.length; off += 65536) {
    randomFillSync(bytes, off, Math.min(65536, bytes.length - off));
  }
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (bytes[i >> 3] >> (i & 7)) & 1;
  return out;
}
function coinD(n) {                           // Math.random
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.random() < 0.5 ? 0 : 1;
  return out;
}

const c = centerColumnBits(N);
const sources = [
  ['column   ', c],
  ['A xs32   ', coinA(N, 0x12345678, 0x9abcdef0)],
  ['A xs32 b ', coinA(N, 0xdeadbeef, 0x0badf00d)],
  ['B xs-top ', coinB(N, 0x12345678, 0x9abcdef0)],
  ['C crypto ', coinC(N)],
  ['C crypto2', coinC(N)],
  ['C crypto3', coinC(N)],
  ['D random ', coinD(N)],
  ['D random2', coinD(N)],
];

console.log(`# Rosetta 13 control — block entropy deficit m - H(m), N = ${N}`);
console.log('# source    | excess/sqrt(N) |' + [1, 2, 4, 8, 12, 16].map((m) => `  m=${String(m).padStart(2)}`).join('   |'));
for (const [name, bits] of sources) {
  let cnt = 0;
  for (let i = 0; i < N; i++) cnt += bits[i];
  const exc = (2 * cnt - N) / Math.sqrt(N);
  const cells = [1, 2, 4, 8, 12, 16].map((m) => (m - blockEntropy(bits, N, m)).toExponential(2));
  console.log(`# ${name} | ${exc.toFixed(4).padStart(14)} | ${cells.join(' | ')}`);
}
console.log('');
console.log('# Read the m=1 column against the excess: m - H(1) = 1 - H2(p) ~ 2 d^2 / ln2');
console.log('# with d = excess/(2N), so a large m=1 deficit IS a large excess and nothing else.');
