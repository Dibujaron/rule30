/**
 * Waywiser, connector, 2026-09-12. A null for one number out of
 * explorer/waywiser_gamblers.mjs that I did not believe.
 *
 * That script reports the bankruptcy index of the cap-L gambler — the first
 * black run of length L+1 — and at L = 20 rule 30 broke at t = 37,280 while the
 * eight coin draws ran from 413,029 to 3,516,300. Eleven times below the
 * minimum of eight draws is either a finding or a multiple-comparisons
 * artefact, and eight draws over 23 values of L cannot tell the two apart.
 *
 * So: compute T(L), the first index at which a black (and separately a white)
 * run of length exactly >= L completes, for L = 1..26; score each against the
 * coin's own law, which is available in closed form (the first run of length L
 * arrives at an approximately exponential time of mean 2^(L+1), so
 * p_L = 1 - exp(-T(L)/2^(L+1)) is uniform on [0,1] under the null); and then
 * run the *whole procedure* on 300 coin draws to see where rule 30's most
 * extreme p_L sits among 300 draws' most extreme p_L. That last step is the
 * one the eight-draw table could not do, and it is the multiple-comparisons
 * correction done empirically rather than by a Bonferroni guess.
 */

import { readFileSync } from 'node:fs';
import { A051023_PREFIX } from './rule30.mjs';

const bits = new Uint8Array(readFileSync(new URL('./talus7_center10m.bin', import.meta.url)));
const N = bits.length;
let bad = 0;
for (let i = 0; i < A051023_PREFIX.length; i++) if (bits[i] !== A051023_PREFIX[i]) bad++;
if (bad) throw new Error('bin is not the centre column');

const LMAX = 26;

/** T[L] = index at which the first run of value v of length >= L completes. */
function firstRunTimes(x, v, lmax) {
  const T = new Array(lmax + 1).fill(Infinity);
  let run = 0;
  for (let i = 0; i < x.length; i++) {
    if (x[i] === v) {
      run++;
      if (run <= lmax && T[run] === Infinity) T[run] = i;
    } else run = 0;
  }
  return T;
}

/** p-value of an observed first-arrival time under the coin: mean 2^(L+1). */
function pOf(T, L, n) {
  const mean = Math.pow(2, L + 1);
  if (T === Infinity) return 1 - (1 - Math.exp(-n / mean)); // = exp(-n/mean), prob of "not yet"
  return 1 - Math.exp(-T / mean);
}

/** The procedure's summary statistic: the most extreme p over L = LO..LMAX,
 *  two-sided, reported as min(p, 1-p) with the side. */
const LO = 4; // below this the exponential approximation is poor
function extreme(T, n) {
  let best = 1, bestL = 0, side = '';
  for (let L = LO; L <= LMAX; L++) {
    const p = pOf(T[L], L, n);
    const two = Math.min(p, 1 - p);
    if (two < best) { best = two; bestL = L; side = p < 0.5 ? 'early' : 'late'; }
  }
  return { p: best, L: bestL, side };
}

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

const Tb = firstRunTimes(bits, 1, LMAX);
const Tw = firstRunTimes(bits, 0, LMAX);

console.log(`rule 30 centre column, ${N} terms.`);
console.log('first arrival of a run of length L, against the coin mean 2^(L+1):');
console.log('   L | black T(L)   | white T(L)   | coin mean    | p(black) | p(white)');
for (let L = 4; L <= LMAX; L++) {
  const f = (v) => (v === Infinity ? '     --' : String(v)).padStart(12);
  const mean = Math.pow(2, L + 1);
  console.log(`  ${String(L).padStart(2)} | ${f(Tb[L])} | ${f(Tw[L])} | ` +
    `${mean.toExponential(2).padStart(12)} | ${pOf(Tb[L], L, N).toFixed(4)}   | ${pOf(Tw[L], L, N).toFixed(4)}`);
}

const eb = extreme(Tb, N);
const ew = extreme(Tw, N);
console.log(`\nmost extreme black: L=${eb.L} ${eb.side}, two-sided p = ${eb.p.toFixed(5)}`);
console.log(`most extreme white: L=${ew.L} ${ew.side}, two-sided p = ${ew.p.toFixed(5)}`);

const DRAWS = 300;
console.log(`\nthe same procedure on ${DRAWS} coin draws of the same length:`);
const exb = [], exw = [];
for (let d = 0; d < DRAWS; d++) {
  const c = coin(N, 0x5bf03635 + d * 2654435761);
  exb.push(extreme(firstRunTimes(c, 1, LMAX), N).p);
  exw.push(extreme(firstRunTimes(c, 0, LMAX), N).p);
}
exb.sort((a, b) => a - b); exw.sort((a, b) => a - b);
const q = (a, p) => a[Math.floor(p * (a.length - 1))];
console.log(`  coin most-extreme-p (black runs): min ${exb[0].toFixed(5)} q10 ${q(exb, 0.1).toFixed(5)} ` +
  `median ${q(exb, 0.5).toFixed(5)} q90 ${q(exb, 0.9).toFixed(5)}`);
console.log(`  coin most-extreme-p (white runs): min ${exw[0].toFixed(5)} q10 ${q(exw, 0.1).toFixed(5)} ` +
  `median ${q(exw, 0.5).toFixed(5)} q90 ${q(exw, 0.9).toFixed(5)}`);
const rankB = exb.filter((v) => v <= eb.p).length;
const rankW = exw.filter((v) => v <= ew.p).length;
console.log(`\n  coin draws at least as extreme as rule 30 (black): ${rankB} of ${DRAWS}`);
console.log(`  coin draws at least as extreme as rule 30 (white): ${rankW} of ${DRAWS}`);
