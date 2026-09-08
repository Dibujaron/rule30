/**
 * How a settled diagonal stays settled past a transient driver.
 *
 *   node explorer/maskabsorb.mjs
 *
 * maskfront.mjs classifies what kills the *last* transient of a diagonal.
 * This script asks the complementary question of the topic: when diagonal
 * k+1 is settled for good at index i (i >= its onset) while its driver,
 * diagonal k at the same index i, is still transient, what absorbed the
 * driver's deviation? In row coordinates the driver cell is C = (t, x) with
 * the settled cell directly below it, (t+1, x), reading L = (t, x-1),
 * C, R = (t, x+1). With C deviating, the cell below agrees with S iff
 *
 *   A  L, R agree, R black          (the diagonal's own black cell masks C:
 *                                    the mechanism the notebook proposed)
 *   B  L agrees, R deviates, C != R (two deviations saturate the ||)
 *   C  L deviates, R agrees, R white (the two deviations cancel in the xor)
 *   D  L, C, R all deviate, C = R
 *
 * Two passes over the picture: the first records every onset N_k (k <= K_O)
 * as maskfront.mjs does, the second counts the absorptions at cells (t+1, x)
 * with -x >= N_{t+x+1}, by type, to T rows. Every absorption at all (whether
 * or not the cell below is past its onset) is counted alongside.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 160000;
const K_O = 110000;
const SMALL = 40;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 2 * SMALL; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
const base = centerBitIndex(T);
const NONE = 0x7fffffff;

/** One pass: calls visit(t, lo, E, bits) with E and bits indexed by x - lo over the band [lo, hi]. */
function pass(visit) {
  let Fp = NONE, t = 0;
  for (const row of rows(T)) {
    let lo, hi;
    if (t < SMALL) { lo = -t; hi = t + SMALL; } else { lo = Math.max(-t, Fp - 2); hi = 0; }
    const width = hi - lo + 1;
    const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
    const E = new Uint8Array(width), bits = new Uint8Array(width);
    let Fn = NONE;
    for (let x = lo; x <= hi; x++) {
      const bit = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
      bits[x - lo] = bit;
      if (bit !== sat(t + x, -x)) { E[x - lo] = 1; if (Fn === NONE) Fn = x; }
    }
    visit(t, lo, hi, E, bits);
    Fp = Fn;
    t++;
  }
}

// pass 1: onsets
const last = new Int32Array(K_O + 1).fill(-1);
pass((t, lo, hi, E) => {
  for (let x = lo; x <= hi; x++) if (E[x - lo]) { const k = t + x, j = -x; if (k <= K_O && j > last[k]) last[k] = j; }
});
console.log(`pass 1: onsets for k <= ${K_O} from ${T} rows (${Date.now() - t0} ms)`);

// pass 2: absorptions
const allT = [0, 0, 0, 0], goodT = [0, 0, 0, 0];   // A, B, C, D
let allN = 0, goodN = 0, goodDiag = new Set(), carried = 0, prev = null;
pass((t, lo, hi, E, bits) => {
  if (prev) {
    const { lo: plo, hi: phi, E: pE, bits: pb } = prev;
    // cells (t-1, x) deviating whose cell below (t, x) agrees
    for (let x = Math.max(plo, lo); x <= Math.min(phi, hi); x++) {
      if (!pE[x - plo] || E[x - lo]) continue;
      const eL = x - 1 >= plo ? pE[x - 1 - plo] : 0, eR = x + 1 <= phi ? pE[x + 1 - plo] : -1;
      if (eR < 0) { carried++; continue; }          // right neighbour outside the recorded band (the centre column, whose neighbour is column 1)
      const bC = pb[x - plo], bR = x + 1 <= phi ? pb[x + 1 - plo] : 0;
      let type;
      if (!eL && !eR) type = 0; else if (!eL && eR) type = 1; else if (eL && !eR) type = 2; else type = 3;
      // sanity: the classification predicts agreement
      const agrees = type === 0 ? bR === 1 : type === 1 ? bC !== bR : type === 2 ? bR === 0 : bC === bR;
      if (!agrees) throw new Error(`classification wrong at t = ${t - 1}, x = ${x}`);
      allN++; allT[type]++;
      const kBelow = t + x;                          // diagonal of (t, x)
      if (kBelow <= K_O && -x >= last[kBelow] + 1) { goodN++; goodT[type]++; goodDiag.add(kBelow); }
    }
  }
  prev = { lo, hi, E, bits };
});
const names = ['A own black cell masks', 'B two deviations saturate the ||', 'C two deviations cancel in the xor', 'D all three deviate'];
console.log(`pass 2 (${Date.now() - t0} ms): deviating cells whose cell below agrees: ${allN} (skipped at the band edge: ${carried})`);
console.log(`   all such cells: ${allT.map((n, i) => `${names[i]} ${n} (${(n / allN).toFixed(3)})`).join('; ')}`);
console.log(`   cells below already past their diagonal's onset (a settled diagonal absorbing a transient driver): ${goodN} on ${goodDiag.size} diagonals <= ${K_O}`);
console.log(`   ${goodT.map((n, i) => `${names[i]} ${n} (${(n / goodN).toFixed(3)})`).join('; ')}`);
