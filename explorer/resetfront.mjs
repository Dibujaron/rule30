/**
 * The reset front: an onset bound computable from the settled words alone.
 *
 *   node explorer/resetfront.mjs
 *
 * leftDiagonal_periodicFrom_step_of_black says: if diagonals m and m+1 are
 * periodic with period q from N, and diagonal m+1 is black at index j+1 with
 * j >= N, then diagonal m+2 is periodic with period q from j+1. And
 * leftDiagonal_periodicFrom_step says that with no black cell available the
 * period doubles and the onset moves by one period. So define, from the
 * settled words S_k of the recurrence (settledwords.mjs, seed's branch bits
 * from settledcenter.mjs),
 *
 *   R_0 = R_1 = 0,
 *   R_k = the least j+1 with j >= max(R_{k-1}, R_{k-2}) and S_{k-1}(j+1) = 1,
 *         if S_{k-1} is not white; else max(R_{k-1}, R_{k-2}) + period(S_{k-2}).
 *
 * Then the onset o_k of the seed's diagonal k (the least index from which it
 * agrees with S_k) should satisfy o_k <= R_k, by induction on the board's two
 * lemmas — provided the induction hypothesis is that the diagonals agree with
 * the settled words from R on, which is what the lemmas give. This script
 * computes R_k to K_R from the recurrence, o_k to K_O from the picture, and
 * reports violations of o_k <= R_k, the ratio R_k / k, and how often the two
 * coincide (they should at the eventually-white diagonals, whose seam is the
 * last reset).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F, at, isWhite } from './settledwords.mjs';

const K_R = 240000;
const K_O = 60000;
const T = 90000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= K_R; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const R = new Int32Array(K_R + 1);
for (let k = 2; k <= K_R; k++) {
  const M = Math.max(R[k - 1], R[k - 2]);
  const b = S[k - 1];
  if (isWhite(b)) { R[k] = M + S[k - 2].p; continue; }
  let j = M;
  while (at(b, j + 1) !== 1) j++;
  R[k] = j + 1;
}
let maxRatio = 0, sumInc = 0;
for (let k = 1000; k <= K_R; k++) { if (R[k] / k > maxRatio) maxRatio = R[k] / k; sumInc += R[k] - Math.max(R[k - 1], R[k - 2]); }
console.log(`reset front from the recurrence to k = ${K_R} (${Date.now() - t0} ms): R_k / k at k = 1000, 10000, 50000, 100000, 200000, 240000: ${[1000, 10000, 50000, 100000, 200000, 240000].map((k) => (R[k] / k).toFixed(4)).join(' ')}; max R_k / k over k >= 1000: ${maxRatio.toFixed(4)}`);
console.log(`R at the eventually-white diagonals' successors k = 53208, 58287, 87867: ${[53208, 58287, 87867].map((k) => `${k}:${R[k]} (R_{k-1} = ${R[k - 1]})`).join(' ')}; increments R_k - max(R_{k-1}, R_{k-2}) over k in [1000, ${K_R}]: mean ${(sumInc / (K_R - 999)).toFixed(4)}`);

// onsets of the seed's diagonals from the picture: last index j < 0.6k+64 where D_k(j) != S_k(j), plus one
const last = new Int32Array(K_O + 1).fill(-1);
const base = centerBitIndex(T);
{
  let t = 0;
  for (const row of rows(T)) {
    // cells (t, -j) with k = t - j <= K_O and j <= 0.6k + 64  <=>  k >= (t - 64) / 1.6
    const kLo = Math.max(0, Math.ceil((t - 64) / 1.6)), kHi = Math.min(K_O, t);
    if (kLo <= kHi) {
      const jHi = t - kLo, jLo = t - kHi;                  // j in [jLo, jHi], position base - j
      const width = jHi - jLo + 1;
      const str = ((row >> BigInt(base - jHi)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
      for (let k = kLo; k <= kHi; k++) {
        const j = t - k;
        const bit = str.charCodeAt(width - 1 - (jHi - j)) === 49 ? 1 : 0;
        if (bit !== at(S[k], j)) last[k] = j;
      }
    }
    t++;
  }
}
let viol = 0, firstViol = -1, equal = 0, sumRatio = 0, cnt = 0, maxGap = 0;
for (let k = 2; k <= K_O; k++) {
  const o = last[k] + 1;
  if (o > R[k]) { viol++; if (firstViol < 0) firstViol = k; }
  if (o === R[k]) equal++;
  if (k >= 1000) { sumRatio += o / k; cnt++; if (R[k] - o > maxGap) maxGap = R[k] - o; }
}
console.log(`seed's onsets o_k for k <= ${K_O} from ${T} rows (${Date.now() - t0} ms): violations of o_k <= R_k: ${viol}${firstViol >= 0 ? ' (first at k = ' + firstViol + ')' : ''}; o_k = R_k for ${equal} of ${K_O - 1} diagonals; mean o_k / k over k >= 1000: ${(sumRatio / cnt).toFixed(4)}; largest R_k - o_k: ${maxGap}`);
console.log(`at the eventually-white diagonals 53207, 58286: o = ${last[53207] + 1}, ${last[58286] + 1}; R = ${R[53207]}, ${R[58286]}`);
console.log(`o_k and R_k at k = 1000, 10000, 30000, 53207, 60000: ${[1000, 10000, 30000, 53207, 60000].map((k) => `${k}: o ${last[k] + 1}, R ${R[k]}`).join('; ')}`);
