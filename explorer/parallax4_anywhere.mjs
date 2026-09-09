/**
 * Parallax, session 4 — near-repetition ANYWHERE, not just at the start.
 *
 * explorer/parallax4_skeleton.mjs measures W(p) = how long the sequence agrees
 * with its own shift by p starting from index 0. Aperiodicity is a statement
 * about every onset, so the honest version is
 *
 *     M(p) = max over n of the length of the longest interval on which
 *            a(m + p) = a(m) holds continuously
 *
 * -- the longest stretch anywhere in the sequence on which p really is a
 * period. For a fair coin M(p) ~ log2(N). For a sequence with a proof in
 * print, M(p) is a positive fraction of N at the structured lags.
 *
 * Nothing here proves anything.
 */

import { centerColumnBits } from './rule30.mjs';

const N = 1 << 20;   // 1,048,576
const P = 1500;      // lags

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
function fibonacciWord(n) {
  let s = [0];
  while (s.length < n) {
    const t = [];
    for (const c of s) { if (c === 0) t.push(0, 1); else t.push(0); }
    s = t;
  }
  return Uint8Array.from(s.slice(0, n));
}
function xorshift(n, seed = 0x2f4b7c1) {
  const a = new Uint8Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    a[i] = s & 1;
  }
  return a;
}

/** M(p) and where it happens, for p = 1..P. */
function anywhere(a, maxP) {
  const n = a.length;
  const best = new Int32Array(maxP + 1);
  const at = new Int32Array(maxP + 1);
  for (let p = 1; p <= maxP; p++) {
    let run = 0, b = 0, ba = 0;
    for (let i = p; i < n; i++) {
      if (a[i] === a[i - p]) { run++; if (run > b) { b = run; ba = i - run; } }
      else run = 0;
    }
    best[p] = b; at[p] = ba;
  }
  return { best, at };
}

function report(name, a) {
  const { best, at } = anywhere(a, P);
  const idx = [];
  for (let p = 1; p <= P; p++) idx.push(p);
  idx.sort((u, v) => best[v] - best[u]);
  const top = idx.slice(0, 8);
  let sum = 0, over1000 = 0;
  for (let p = 1; p <= P; p++) { sum += best[p]; if (best[p] > 1000) over1000++; }
  console.log(`\n=== ${name} ===`);
  console.log(`  mean M ${(sum / P).toFixed(2)}   #{M>1000} ${over1000}   log2(N)=${Math.log2(a.length).toFixed(1)}`);
  console.log(`  top: ${top.map(p => `p=${p} M=${best[p]} (M/p=${(best[p] / p).toFixed(2)}, at n=${at[p]})`).join('\n       ')}`);
}

console.log(`length ${N}, lags 1..${P}`);
console.log('building rule 30 centre column ...');
const c30 = centerColumnBits(N);
report('rule 30 centre column', c30);
report('Thue-Morse', thueMorse(N));
report('Rudin-Shapiro', rudinShapiro(N));
report('Fibonacci word (Sturmian)', fibonacciWord(N));
report('xorshift (null)', xorshift(N));
