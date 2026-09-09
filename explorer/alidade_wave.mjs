/**
 * The settled background is a travelling wave, and its period is the wall.
 *
 *   node explorer/alidade_wave.mjs
 *
 * Hanson & Crutchfield's rule 54 domain is described as "spatio-temporally
 * periodic, with periodicity 4 in both space and time ... the same pattern is
 * repeated after two iterations, spatially shifted by two cells". The settled
 * picture of rule 30 has exactly that shape, one level at a time. Since
 * S(t, x) = S_{t+x}(-x) and the settled word of diagonal k has period p_k,
 *
 *   S(t + P, x - P) = S_{t+x}(P - x) = S(t, x)   whenever p_{t+x} divides P,
 *
 * so on the wedge of cells whose diagonal index k = t + x has p_k | 2^n, the
 * settled picture is a travelling wave of temporal period 2^n and spatial shift
 * 2^n -- a regular domain in the paper's sense, with a finite temporal period.
 * The catch is that 2^n is not one number: the periods double at diagonals
 * 3, 8, 29, 400, 87867, 2107985255, ... (crystals 14, NKS p. 871), so the wedge
 * on which any fixed period works is bounded, and the front leaves it.
 *
 * This script checks the identity where it should hold and where it should fail,
 * finds the exact diagonal at which each period first appears, and reports when
 * the front crosses out of each domain.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF } from './settledwords.mjs';

const K = 200000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= K; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
const spix = (t, x) => sat(t + x, -x);

// where each period first appears, and the largest diagonal below which every
// period divides 2^n
const firstAt = new Map();
for (let k = 0; k <= K; k++) if (!firstAt.has(periods[k])) firstAt.set(periods[k], k);
console.log(`first diagonal with each settled period: ${[...firstAt.entries()].sort((a, b) => a[0] - b[0]).map(([p, k]) => `${p}@${k}`).join(' ')}`);
const ceiling = new Map();
for (const [p, k] of firstAt) if (p > 1) ceiling.set(p / 2, k);
console.log(`so every diagonal k < K_n has period dividing 2^n, with K_n = ${[...ceiling.entries()].sort((a, b) => a[0] - b[0]).map(([p, k]) => `2^${Math.log2(p)}:${k}`).join(' ')}`);

// the travelling-wave identity, inside the wedge and outside it
for (const P of [2, 4, 8, 16, 32]) {
  const bound = ceiling.get(P) ?? K;
  let inOk = 0, inBad = 0, outOk = 0, outBad = 0;
  for (let i = 0; i < 200000; i++) {
    const t = 50 + ((i * 7919) % (2 * K));
    const kk = 1 + ((i * 104729) % (K - P - 2));
    const x = kk - t;                       // so that t + x = kk
    if (t + x < 1 || t + x > K - 1) continue;
    const a = spix(t, x), b = spix(t + P, x - P);
    if (kk < bound) { if (a === b) inOk++; else inBad++; }
    else { if (a === b) outOk++; else outBad++; }
  }
  console.log(`P = ${String(P).padStart(2)}: inside the wedge k < ${bound}: ${inOk} agree, ${inBad} DISAGREE; outside: ${outOk} agree, ${outBad} disagree (${(outBad / Math.max(1, outOk + outBad) * 100).toFixed(1)}% broken)`);
}

// when does the front leave each domain? kappa(t) = t + F(t) grows at about
// 1 - 0.243 = 0.757 cells per row, so the front reaches diagonal k at about
// t = k / 0.757.
console.log(`\nthe front sits on diagonal kappa(t) = t + F(t), which grows at about 0.757 per row, so it leaves`);
for (const [p, k] of [...ceiling.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`   the period-${p} domain at diagonal ${k}, around row ${Math.round(k / 0.757)}`);
}
console.log(`   the period-32 domain at diagonal 2107985255 (NKS p. 871), around row ${Math.round(2107985255 / 0.757).toExponential(3)}`);
console.log(`the domain's period is 2^n where n is the number of doublings below t, and the doubling diagonals grow roughly as squares (5, 21, 371, 87467, 2.1e9), so the period the filter must carry grows like log t.`);
console.log(`(${Date.now() - t0} ms)`);
