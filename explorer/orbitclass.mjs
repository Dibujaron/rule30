/**
 * The half-shift symmetry class of the settled words along the seed's orbit.
 *
 *   node explorer/orbitclass.mjs
 *
 * After a doubling to period L = 2M the new word w is antiperiodic: shifting
 * by M complements it. hitting3.mjs found that the orbit from such a word
 * reaches no white diagonal for a long time (at least 0.1 * 2^L at L = 16,
 * where a random start would often do so within 2^L / 256). This script
 * classifies every settled word S_k of the seed's orbit within each
 * period-L stretch by its behaviour under the half shift tau = shift by M:
 * white, black, tau-invariant (period M), antiperiodic (tau S = not S), or
 * none of these, and reports the counts per stretch, the length of the
 * initial run of symmetric words after each doubling, and the first 80
 * classes after each doubling.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F, at, isWhite } from './settledwords.mjs';

const BRANCHES = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);
const K_MAX = 200000;
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= K_MAX; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  S.push(sols.length === 1 ? sols[0] : sols[BRANCHES.get(k)]);
}

function cls(s, L) {
  const M = L / 2;
  if (isWhite(s)) return 'W';
  if (s.word.every((v) => v === 1)) return 'B';
  let inv = true, anti = true;
  for (let i = 0; i < L; i++) { const x = at(s, i), y = at(s, i + M); if (x !== y) inv = false; if (x === y) anti = false; }
  if (inv) return 'I';
  if (anti) return 'A';
  return '.';
}

const stretches = [[3, 7, 2], [8, 28, 4], [29, 399, 8], [400, 87866, 16], [87867, K_MAX, 32]];
for (const [k0, k1, L] of stretches) {
  const counts = { W: 0, B: 0, I: 0, A: 0, '.': 0 };
  let seq = '';
  let run = -1;
  for (let k = k0; k <= k1; k++) {
    const c = cls(S[k], L);
    counts[c]++;
    if (k - k0 < 80) seq += c;
    if (run < 0 && c === '.') run = k - k0;
  }
  const n = k1 - k0 + 1;
  console.log(`period ${L} stretch k = ${k0}..${k1} (${n} diagonals): white ${counts.W}, black ${counts.B}, tau-invariant ${counts.I}, antiperiodic ${counts.A}, none ${counts['.']}; random expectation for invariant or antiperiodic: ${(n * 2 / 2 ** (L / 2)).toFixed(1)}`);
  console.log(`   first unsymmetric word at offset ${run}; classes from the doubling: ${seq}`);
}
