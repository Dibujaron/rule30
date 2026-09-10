/**
 * Talus, 2026-09-10. The only exact-balance mechanism rule 30 supplies.
 *
 * A right diagonal is exactly periodic from index 0 with period dividing 2^k
 * (rightDiagonal_periodicFrom_pow). For a periodic sequence the excess over M
 * terms is bounded in M if and only if its weight over one period is exactly
 * half the period. The board's rightDiagonal_antiperiodic_of_odd_driver gives
 * that outright at every depth right after a doubling: R(j+L) = !R(j), so the
 * weight over 2L is exactly L and the excess never leaves [-L, L].
 *
 * This script asks how far that goes: is EVERY right diagonal exactly
 * balanced, or only the ones the antiperiodic branch reaches? It reads the
 * diagonals off the real picture, computes each minimal period and its weight,
 * and reports the exact rational weight/period and the excess bound.
 *
 * Coordinates: cell(t, x) = bit (x + t) of rowNat t, so
 * rightDiagonal k j = cell(k + j, j) = bit (2j + k) of rowNat (k + j).
 */

const KMAX = 30;
const ROWS = 40_000; // enough for k + 2*P_k at every k reported

const WORDS = ((2 * ROWS + 96) >> 5) + 2;
const r = new Uint32Array(WORDS);
r[0] = 1;
// rowNat t, kept as a list of the bits we need: for each t store nothing, but
// read the diagonals on the fly.
const diag = [];
for (let k = 0; k <= KMAX; k++) diag.push(new Uint8Array(ROWS));

for (let t = 0; t < ROWS; t++) {
  const bit = (i) => (r[i >> 5] >>> (i & 31)) & 1;
  // every (k, j) with k + j = t and 0 <= k <= KMAX
  for (let k = 0; k <= Math.min(KMAX, t); k++) {
    const j = t - k;
    if (j < ROWS) diag[k][j] = bit(2 * j + k);
  }
  const limit = Math.min(WORDS - 1, (t >> 4) + 1);
  let prev = 0;
  for (let m = 0; m <= limit; m++) {
    const cur = r[m];
    const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
    r[m] = (s2 ^ (s1 | cur)) >>> 0;
    prev = cur;
  }
}

// sanity: rightDiagonal 0 is the right edge, always black; rightDiagonal 1
// alternates starting black (evolve_right_edge, evolve_right_second_diagonal).
{
  let bad0 = 0, bad1 = 0;
  const M = ROWS - KMAX - 1;
  for (let j = 0; j < M; j++) {
    if (diag[0][j] !== 1) bad0++;
    if (diag[1][j] !== (j % 2 === 0 ? 1 : 0)) bad1++;
  }
  console.log(`check: R_0 non-black ${bad0} of ${M}; R_1 off the alternation ${bad1} of ${M}`);
  // and centerColumn k = rightDiagonal k 0
  const A = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1];
  let badC = 0;
  for (let k = 0; k <= KMAX; k++) if (diag[k][0] !== A[k]) badC++;
  console.log(`check: centerColumn k = rightDiagonal k 0 fails ${badC} of ${KMAX + 1}`);
}

function minimalPeriod(a, len) {
  for (let p = 1; p <= len >> 1; p++) {
    let ok = true;
    for (let j = 0; j + p < len; j++) if (a[j] !== a[j + p]) { ok = false; break; }
    if (ok) return p;
  }
  return -1;
}

console.log('\n  k   P_k    weight  2w-P   excess bound over any window');
for (let k = 0; k <= KMAX; k++) {
  const len = ROWS - k - 1;
  const P = minimalPeriod(diag[k], Math.min(len, 20000));
  if (P < 0) { console.log(`  ${k}  period > 10000 in the window`); continue; }
  let w = 0;
  for (let j = 0; j < P; j++) w += diag[k][j];
  // worst |E| over any prefix, computed exactly over 4 periods
  let E = 0, worst = 0;
  for (let j = 0; j < 4 * P; j++) { E += diag[k][j % P] ? 1 : -1; worst = Math.max(worst, Math.abs(E)); }
  console.log(`  ${String(k).padStart(2)}  ${String(P).padStart(5)}  ${String(w).padStart(6)}  ` +
    `${String(2 * w - P).padStart(4)}   ${2 * w - P === 0 ? `bounded, |E| <= ${worst}` : `LINEAR, rate ${((2 * w - P) / P).toFixed(4)}`}`);
}
