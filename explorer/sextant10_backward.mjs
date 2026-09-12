// Sextant, 2026-09-12.  Running the right-diagonal recurrence BACKWARDS.
//
// rightDiagonal k j = evolve (j+k) j is defined down to j = -k, where it reads
// the initial row at position -k.  The forward recurrence
//     R_k(i+1) = R_k(i) XOR g_k(i),   g_k(i) = R_{k-1}(i+1) | R_{k-2}(i+2)
// is invertible in the first argument, so the whole tower runs backwards, and
// the backward run of level k needs exactly the full backward range of levels
// k-1 and k-2 (indices >= -(k-1) and >= -(k-2)).  No extra data.
//
// Six things measured here:
//  (A) the backward recurrence holds at every negative index down to j = -k;
//  (B) periodicity extends BACKWARDS: R_k(j + 2^k) = R_k(j) for every j >= -k;
//  (C) so the cone condition R_k(-k) = false is, at NON-negative index,
//      R_k(2^k - k) = false -- no new definition needed;
//  (D) the telescoped identity  centerColumn k = XOR_{j=1..k} g_k(-j);
//  (E) what that identity is in picture coordinates: a parity of adjacent-pair
//      ORs along the line x = t - (k-1), read from the initial row to time k-1;
//  (F) the flat-tower witness ...10101|000 fails (C) at k = 2 and fails (D).

// ---------------------------------------------------------------- engine

function stepArr(row, lpad) {
  // row[i] is the cell at position i - lpad ; grow by one cell each side
  const n = row.length;
  const out = new Uint8Array(n + 2);
  const get = (k) => (k < 0 || k >= n) ? 0 : row[k];
  // out index j corresponds to old index j - 1
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return out;
}

// ASYMMETRIC self-check: rule 30 and its mirror rule 86 agree on every
// left/right-symmetric statistic, so check something chiral.  Rule 30's first
// three LEFT diagonals are black, black, white and its first two RIGHT
// diagonals are black, alternating; the mirror swaps them.  Also row 3 read
// left to right is 1101111, whose reverse 1111011 it is not.
{
  let r = Uint8Array.from([1]);
  const rowsC = [r];
  for (let s = 0; s < 6; s++) { r = stepArr(r); rowsC.push(r); }
  const w3 = Array.from(rowsC[3]).join('');
  const cellC = (t, x) => { const a = rowsC[t]; const i = x + t; return (i < 0 || i >= a.length) ? 0 : a[i]; };
  const L0 = [0, 1, 2, 3, 4, 5, 6].map((t) => cellC(t, -t)).join('');
  const L2 = [0, 1, 2, 3, 4].map((t) => cellC(t + 2, -t)).join('');
  const R1 = [0, 1, 2, 3, 4].map((t) => cellC(t + 1, t)).join('');
  const ok = w3 === '1101111' && L0 === '1111111' && L2 === '00000' && R1 === '10101';
  console.log(`engine self-check: row3=${w3} leftEdge=${L0} left3rd=${L2} right2nd=${R1} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

// ---------------------------------------------------------------- the picture

const T = 3000;                       // rows 0..T of the seed's picture
const rows = [];
{
  let cur = new Uint8Array(1); cur[0] = 1;
  rows.push(cur);
  for (let t = 1; t <= T; t++) rows.push(stepArr(rows[t - 1]));
}
// rows[t][i] is the cell at position i - t
const cell = (t, x) => {
  if (t < 0 || t > T) return null;
  const i = x + t;
  const a = rows[t];
  return (i < 0 || i >= a.length) ? 0 : a[i];
};
const c = (k) => cell(k, 0);                   // centerColumn
const rd = (k, j) => cell(j + k, j);           // rightDiagonal k j, any j >= -k

// ---------------------------------------------------------------- (A)

{
  let bad = 0, tested = 0, badNeg = 0, testedNeg = 0;
  for (let k = 2; k <= 1200; k++) {
    for (let j = -k; j <= 600; j++) {
      const a = rd(k, j), b = rd(k, j + 1), d = rd(k - 1, j + 1), e = rd(k - 2, j + 2);
      if (a === null || b === null || d === null || e === null) continue;
      tested++; if (j < 0) testedNeg++;
      if (b !== (a ^ (d | e))) { bad++; if (j < 0) badNeg++; }
    }
  }
  console.log(`\n(A) recurrence R_k(j+1) = R_k(j) XOR (R_{k-1}(j+1) | R_{k-2}(j+2))`);
  console.log(`    ${tested} instances, ${bad} failures; of these ${testedNeg} at NEGATIVE j, ${badNeg} failures`);
}

// ---------------------------------------------------------------- the tower

// Build the tower forward from R_0, R_1 and the free bits R_k(0) = c(k).
// Two rolling arrays over indices [0, L).
// Only three levels are ever live, so each level is handed to `visit` and then
// dropped -- storing all of them at L = 2^24 would be 400 MB.
function buildTower(L, KMAX, freeBit, visit) {
  let prev2 = new Uint8Array(L);   // R_{k-2}
  let prev1 = new Uint8Array(L);   // R_{k-1}
  let spare = new Uint8Array(L);
  for (let k = 0; k <= KMAX; k++) {
    let cur = spare;
    if (k === 0) { cur.fill(1); }
    else if (k === 1) { for (let j = 0; j < L; j++) cur[j] = (j % 2 === 0) ? 1 : 0; }
    else {
      cur[0] = freeBit(k);
      for (let i = 0; i + 2 < L; i++) cur[i + 1] = cur[i] ^ (prev1[i + 1] | prev2[i + 2]);
      cur[L - 1] = 0;                                  // never read
    }
    visit(k, cur);
    spare = prev2; prev2 = prev1; prev1 = cur;
  }
}

// validate the tower against the picture, then (B) and (C)
{
  const KMAX = 24;
  // SLACK: cur[L-1] has no honest driver, and the corruption creeps one index
  // left per level, so the last ~2*KMAX indices are mine and not the tower's.
  // The first version of this script used L = 2^KMAX + 4 and reported six
  // "backward periodicity failures" at k = 24, all of them inside that zone.
  const L = (1 << KMAX) + 8 * KMAX + 16;
  console.log(`\nbuilding the tower to level ${KMAX} over indices [0, ${L}) ...`);
  let bad = 0, tested = 0, bBad = 0, bTested = 0;
  const firstBad = [];
  const vals = [];
  buildTower(L, KMAX, c, (k, cur) => {
    for (let j = 0; j <= 400; j++) {
      const v = rd(k, j); if (v === null) continue;
      tested++; if (v !== cur[j]) bad++;
    }
    for (let i = 1; i <= k; i++) {
      const lhs = rd(k, -i), rhs = cur[(1 << k) - i];
      bTested++;
      if (lhs !== rhs) { bBad++; if (firstBad.length < 5) firstBad.push(`k=${k}, i=${i}: ${lhs} vs ${rhs}`); }
    }
    if (k >= 1) vals.push(cur[(1 << k) - k]);
  });
  console.log(`    tower vs picture at non-negative indices: ${tested} cells, ${bad} mismatches`);

  console.log(`\n(B) does periodicity 2^k extend to negative indices?  R_k(-i) vs R_k(2^k - i)`);
  console.log(`    ${bTested} pairs (k <= ${KMAX}, 1 <= i <= k): ${bBad} mismatches ${firstBad.join('; ')}`);

  console.log(`\n(C) the cone condition at non-negative index: R_k(2^k - k) for k = 1..${KMAX}`);
  console.log(`    ${vals.join('')}   (all-zero wanted; R_k(-k) = initialConfig(-k) = 0)`);
  // and the direct reading of the picture near row 2^k, for the small k we hold
  const direct = [];
  for (let k = 1; k <= 11; k++) { const v = rd(k, (1 << k) - k); direct.push(v === null ? '?' : v); }
  console.log(`    same cells read straight out of the picture, k = 1..11: ${direct.join('')}`);
}

// ---------------------------------------------------------------- (D), (E)

// g_k(-j) = R_{k-1}(-j+1) | R_{k-2}(-j+2) = cell(k-j, 1-j) | cell(k-j, 2-j)
{
  let bad = 0, tested = 0;
  const KD = 2500;
  for (let k = 1; k <= KD; k++) {
    let acc = 0;
    for (let j = 1; j <= k; j++) {
      const s = k - j;
      acc ^= (cell(s, s - k + 1) | cell(s, s - k + 2));
    }
    tested++;
    if (acc !== c(k)) bad++;
  }
  console.log(`\n(D)/(E) centerColumn k = XOR_{s<k} [ evolve s (s-k+1) OR evolve s (s-k+2) ]`);
  console.log(`    k = 1..${KD}: ${tested} levels, ${bad} failures`);
}

// the white-pair form: each term is 1 unless BOTH cells are white, so
//   c(k) = (k + #{white pairs}) mod 2, and the pairs entirely outside the cone
//   are forced white.  Count how many terms are forced.
{
  const out = [];
  for (const k of [4, 8, 16, 32, 64, 128, 1024, 2048]) {
    let forced = 0, whitePairs = 0;
    for (let s = 0; s < k; s++) {
      const outside = (s - k + 2) < -s;         // both positions left of the cone
      if (outside) forced++;
      if (cell(s, s - k + 1) === 0 && cell(s, s - k + 2) === 0) whitePairs++;
    }
    out.push(`k=${k}: forced-outside ${forced}, white pairs ${whitePairs}, (k+wp)%2=${(k + whitePairs) % 2}, c=${c(k)}`);
  }
  console.log(`\n    white-pair form:`);
  for (const l of out) console.log('      ' + l);
}

// ---------------------------------------------------------------- (F)

{
  // the flat-tower witness ...10101 | 000 : black at 0,-2,-4,...
  const M = 4000;                       // positions -M..M, left tail continued by formula
  const W = 2 * M + 1;
  let cur = new Uint8Array(W);
  for (let x = -M; x <= 0; x++) if (((-x) % 2) === 0) cur[x + M] = 1;
  const rowsF = [cur];
  const TF = 600;
  for (let t = 1; t <= TF; t++) {
    const prev = rowsF[t - 1];
    const nxt = new Uint8Array(W);
    for (let i = 0; i < W; i++) {
      // the left neighbour outside the stored window: the fixed point (01)^Z
      // is invariant, so position x < -M holds 1 iff x is even
      const l = i - 1 >= 0 ? prev[i - 1] : ((((M + 1) % 2) === 0) ? 1 : 0);
      const r = i + 1 <= 2 * M ? prev[i + 1] : 0;
      nxt[i] = l ^ (prev[i] | r);
    }
    rowsF.push(nxt);
  }
  const cellF = (t, x) => (t < 0 || t > TF || x < -M || x > M) ? null : rowsF[t][x + M];
  const rdF = (k, j) => cellF(j + k, j);
  // is it really a rule 30 picture with the flat tower?
  const r1 = []; for (let j = 0; j < 12; j++) r1.push(rdF(1, j));
  const r7 = []; for (let j = 0; j < 12; j++) r7.push(rdF(7, j));
  console.log(`\n(F) the flat-tower witness ...10101|000`);
  console.log(`    its rightDiagonal 1 = ${r1.join('')}, rightDiagonal 7 = ${r7.join('')}`);
  const bvals = []; for (let k = 0; k <= 14; k++) bvals.push(rdF(k, -k));
  console.log(`    boundary R_k(-k) for k = 0..14: ${bvals.join('')}   (seed: 1 then all 0)`);
  // the cone condition at non-negative index, for the witness's own tower
  const L = (1 << 15) + 8 * 15 + 16;
  const cv = [];
  buildTower(L, 15, (k) => cellF(k, 0), (k, cur) => { if (k >= 1 && k <= 15) cv.push(cur[(1 << k) - k]); });
  console.log(`    R_k(2^k - k) for k = 1..15: ${cv.join('')}   (first failure at k = ${cv.indexOf(1) + 1})`);
  // and the telescoped identity, which must also fail
  let idBad = [];
  for (let k = 1; k <= 40; k++) {
    let acc = 0;
    for (let j = 1; j <= k; j++) { const s = k - j; acc ^= (cellF(s, s - k + 1) | cellF(s, s - k + 2)); }
    if (acc !== cellF(k, 0)) idBad.push(k);
  }
  console.log(`    telescoped identity (D) fails for the witness at k = ${idBad.slice(0, 8).join(',')}${idBad.length > 8 ? ' ...' : ''} (${idBad.length} of 40)`);
}
