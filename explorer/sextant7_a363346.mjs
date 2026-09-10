// sextant7_a363346.mjs   (Sextant, 2026-09-10)
//
// docs/sources.md offers the A363346 b-file as "the measured onsets that
// leftDiagonal_onset_le is about, as an independent computation to compare the
// engine against".  My own notebook (2026-09-07) records that it reads 83 at
// n = 100 against our 34 at k = 100 and that the indexing could not be settled.
// Settle it: compute our onsets, then test every plausible reindexing.

import { readFileSync } from 'node:fs';

const T = 12000, NB = 2 * T + 64, WORDS = (NB >>> 5) + 2;
function zero() { return new Uint32Array(WORDS); }
const s1 = zero(), s2 = zero();
function shl(d, s, k) { for (let i = WORDS - 1; i >= 0; i--) d[i] = ((s[i] << k) | (i > 0 ? (s[i - 1] >>> (32 - k)) : 0)) >>> 0; }
function step(d, s) { shl(s1, s, 2); shl(s2, s, 1); for (let i = 0; i < WORDS; i++) d[i] = (s1[i] ^ ((s2[i] | s[i]) >>> 0)) >>> 0; }
function bit(a, b) { return (b < 0 || b >= NB) ? 0 : (a[b >>> 5] >>> (b & 31)) & 1; }

const KMAX = 400;
// diag[k][j] = leftDiagonal k j = bit_k (rowNat (j+k))
const diag = [];
for (let k = 0; k <= KMAX; k++) diag.push([]);
{
  let R = zero(); R[0] = 1; const tmp = zero();
  for (let t = 0; t <= T; t++) {
    for (let k = 0; k <= Math.min(KMAX, t); k++) diag[k].push(bit(R, k));
    step(tmp, R); R.set(tmp);
  }
}
// onset with the MINIMAL power-of-two period, requiring >= 8 cycles of evidence
function onsetOf(u) {
  const S = u.length;
  for (let p = 1; p <= 1024; p *= 2) {
    let bad = -1;
    for (let i = S - p - 1; i >= 0; i--) if (u[i + p] !== u[i]) { bad = i; break; }
    const on = bad + 1;
    if (S - on >= 8 * p) return { p, on };
  }
  return null;
}
const onset = [], period = [];
for (let k = 0; k <= KMAX; k++) { const r = onsetOf(diag[k]); onset.push(r ? r.on : -1); period.push(r ? r.p : -1); }

// the b-file
const raw = readFileSync('sources/oeis-a363346-left-diagonal-transients.txt', 'utf8').trim().split('\n');
const a = new Map();
for (const line of raw) { const [n, v] = line.trim().split(/\s+/).map(Number); if (Number.isFinite(n)) a.set(n, v); }
const NS = [...a.keys()].sort((x, y) => x - y);
console.log(`b-file: ${NS.length} terms, n = ${NS[0]}..${NS[NS.length - 1]}`);
console.log(`our onsets: k = 0..${KMAX}, first nonzero at k = ${onset.findIndex(o => o > 0)}`);
console.log(`our onset(k) = 0 for every k <= ${(() => { let i = 0; while (onset[i] === 0) i++; return i - 1; })()}, and > 0 for every k above it up to ${KMAX}: ${onset.slice(18, KMAX + 1).every(o => o > 0)}`);

console.log('\nfirst 20 of each:');
console.log('  A363346(1..20) :', NS.slice(0, 20).map(n => a.get(n)).join(' '));
console.log('  our onset(1..20):', onset.slice(1, 21).join(' '));

// candidate reindexings / offsets
const cands = [
  ['onset(n)', (n) => onset[n]],
  ['onset(n-1)', (n) => onset[n - 1]],
  ['onset(n+1)', (n) => onset[n + 1]],
  ['floor(n/2) + onset(n)', (n) => Math.floor(n / 2) + onset[n]],
  ['ceil(n/2) + onset(n)', (n) => Math.ceil(n / 2) + onset[n]],
  ['floor((n-1)/2) + onset(n-1)', (n) => Math.floor((n - 1) / 2) + onset[n - 1]],
  ['onset(n) + period(n)', (n) => onset[n] + period[n]],
  ['onset(2n)', (n) => onset[2 * n]],
  ['onset(2n)/1 at 2n', (n) => onset[2 * n]],
  ['onset(round(2.5n))', (n) => onset[Math.round(2.5 * n)]],
  ['onset(3n)', (n) => onset[3 * n]],
];
console.log('\nfit over n = 1..100 (mismatches, and the first one):');
for (const [name, f] of cands) {
  let bad = 0, first = null;
  for (const n of NS) {
    if (n > 100) break;
    const v = f(n);
    if (v === undefined || v < 0) { bad++; if (!first) first = `n=${n}: ours undefined`; continue; }
    if (v !== a.get(n)) { bad++; if (!first) first = `n=${n}: A=${a.get(n)} vs ${v}`; }
  }
  console.log(`  ${name.padEnd(30)} ${bad} mismatches of 100   ${first ?? ''}`);
}

// the decisive structural test: is A363346 an INCREASING reindexing of ours at all?
console.log('\nstructural test: A363346 is nonzero at n = 3 while our onset(k) = 0 for every');
console.log('k <= 17 and is > 0 for every k >= 18 in range.  So no increasing map n -> k(n)');
console.log('can send 3 to a k with onset 1 and then 4..10 to larger k with onset 0.');
console.log(`  A363346(3) = ${a.get(3)};  A363346(4..10) = ${[4, 5, 6, 7, 8, 9, 10].map(n => a.get(n)).join(',')}`);
console.log(`  our onset(k) for k = 0..25: ${onset.slice(0, 26).join(',')}`);
console.log(`  values of k <= ${KMAX} with onset(k) = 0: ${onset.map((o, k) => o === 0 ? k : -1).filter(k => k >= 0).join(',')}`);
