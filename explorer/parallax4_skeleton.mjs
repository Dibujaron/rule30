/**
 * Parallax, session 4 — the near-repetition skeleton.
 *
 * Every proof in print that an explicit sequence is not eventually periodic
 * works from a NEAR-repetition: the sequence almost repeats at a structured
 * set of lags (powers of k for automatic words, Fibonacci numbers for the
 * Fibonacci word), and the proof is an induction on the controlled failure.
 *
 * Measure that skeleton. For each candidate period p, let
 *
 *     W(p) = min { n >= 0 : a(n + p) != a(n) }
 *
 * -- how far the sequence gets before period p is refuted. For a coin,
 * W(p) is geometric with mean 1. For a structured word, W(p) is huge at the
 * structured lags. The question for rule 30 is whether ANY set of lags stands
 * out, and in particular whether the lags that stand out are recognisable
 * (powers of two, Rowland's doubling positions, ...).
 *
 * Nothing here proves anything.
 */

import { centerColumnBits } from './rule30.mjs';

const N = 1 << 21;          // 2,097,152 terms
const P = 200000;           // lags tested

function thueMorse(n) {
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) a[i] = a[i >> 1] ^ (i & 1);
  return a;
}

function rudinShapiro(n) {
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) a[i] = (i & 1 && i & 2) ? a[i >> 1] ^ 1 : a[i >> 1];
  return a;
}

function paperfolding(n) {
  // regular paperfolding: a(n) depends on n = m * 2^k with m odd -> (m mod 4 == 1)
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) {
    let m = i;
    while ((m & 1) === 0) m >>= 1;
    a[i] = (m & 3) === 1 ? 1 : 0;
  }
  return a;
}

function fibonacciWord(n) {
  // Sturmian: fixed point of 0 -> 01, 1 -> 0
  let s = [0];
  while (s.length < n) {
    const t = [];
    for (const c of s) { if (c === 0) { t.push(0, 1); } else t.push(0); }
    s = t;
  }
  return Uint8Array.from(s.slice(0, n));
}

function sturmianRotation(n, alpha) {
  // a(k) = floor((k+1)alpha) - floor(k alpha)
  const a = new Uint8Array(n);
  for (let k = 0; k < n; k++) a[k] = Math.floor((k + 1) * alpha) - Math.floor(k * alpha);
  return a;
}

function xorshift(n, seed = 0x2f4b7c1) {
  const a = new Uint8Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    a[i] = s & 1;
  }
  return a;
}

/** W(p) for p = 1..P. */
function skeleton(a, maxP) {
  const w = new Int32Array(maxP + 1);
  for (let p = 1; p <= maxP; p++) {
    let n = 0;
    while (n + p < a.length && a[n + p] === a[n]) n++;
    w[p] = n;
  }
  return w;
}

function describe(p) {
  const bits = [];
  if ((p & (p - 1)) === 0) bits.push(`2^${Math.log2(p)}`);
  // Fibonacci?
  let x = 1, y = 2;
  while (y < p) { const z = x + y; x = y; y = z; }
  if (y === p || x === p) bits.push('Fibonacci');
  return bits.length ? ` <- ${bits.join(', ')}` : '';
}

function report(name, a) {
  const w = skeleton(a, P);
  const idx = [];
  for (let p = 1; p <= P; p++) idx.push(p);
  idx.sort((u, v) => w[v] - w[u]);
  const top = idx.slice(0, 12);
  let sum = 0, over100 = 0, over1000 = 0;
  for (let p = 1; p <= P; p++) { sum += w[p]; if (w[p] > 100) over100++; if (w[p] > 1000) over1000++; }
  console.log(`\n=== ${name} ===`);
  console.log(`  mean W ${(sum / P).toFixed(3)}   #{W>100} ${over100}   #{W>1000} ${over1000}`);
  console.log(`  top lags: ${top.map(p => `p=${p} W=${w[p]}${describe(p)}`).join('\n            ')}`);
}

console.log(`length ${N}, lags 1..${P}`);
console.log('building rule 30 centre column ...');
const c30 = centerColumnBits(N);
report('rule 30 centre column', c30);
report('Thue-Morse', thueMorse(N));
report('Rudin-Shapiro', rudinShapiro(N));
report('regular paperfolding', paperfolding(N));
report('Fibonacci word (Sturmian)', fibonacciWord(N));
report('Sturmian, alpha = sqrt(2)-1', sturmianRotation(N, Math.SQRT2 - 1));
report('xorshift (null)', xorshift(N));
