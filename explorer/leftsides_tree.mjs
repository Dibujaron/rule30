/**
 * The tree of left sides, from the recurrence alone.
 *
 *   node explorer/leftsides_tree.mjs
 *
 * From the seed's settled words up to diagonal 53207 (branch bits 1, 1, 0, 0
 * at 3, 8, 29, 400, from settledcenter.mjs), take both candidates at the
 * complement-type branch point 53208 and follow every path of the recurrence
 * (settledwords.mjs F) to K_MAX, forking at every eventually-white diagonal,
 * so that the branch points of every possible left side below K_MAX are
 * listed. Rowland 2006 §5 says the two candidates at his 53209 lead to
 * branch points at his 58288 and 72577 respectively; leftsides.mjs saw
 * 58287 (ours) on both paths. This lists what the recurrence says, and, for
 * each path, whether the two candidate words at a complement-type branch are
 * cyclic shifts of each other (in which case the two left sides are the same
 * up to a shift along the diagonals, and Rowland's "two possible periods"
 * would be one cyclic word).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F, at, key } from './settledwords.mjs';

const K_MAX = 100000;
const SEED_BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0]]);

const cyclicShift = (A, B) => {
  const q = Math.max(A.p, B.p);
  for (let d = 0; d < q; d++) { let ok = true; for (let j = 0; j < q; j++) if (at(A, j) !== at(B, j + d)) { ok = false; break; } if (ok) return d; }
  return -1;
};

const paths = [];
function run(S, k, label) {
  for (; k <= K_MAX; k++) {
    const sols = F(S[k - 2], S[k - 1]);
    if (sols.length === 1) { S.push(sols[0]); continue; }
    if (SEED_BRANCH.has(k)) { S.push(sols[SEED_BRANCH.get(k)]); continue; }
    const type = sols[0].p > S[k - 2].p ? 'shift' : 'complement';
    const d = cyclicShift(sols[0], sols[1]);
    const note = `${k}:${type[0]}${d >= 0 ? '(shift by ' + d + ')' : '(not shifts)'}`;
    // fork: continue path 0 here, path 1 on a copy
    const S1 = S.slice(); S1.push(sols[1]);
    S.push(sols[0]);
    run(S1, k + 1, label + ' ' + note + '->1');
    label = label + ' ' + note + '->0';
  }
  paths.push(label);
}
run([{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }], 2, '');
console.log(`paths below ${K_MAX} (each branch point as k:type(relation)->branch):`);
for (const p of paths.sort()) console.log('  ' + p.trim());
