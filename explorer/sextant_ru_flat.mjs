/**
 * Sextant (theorist, 2026-09-08): the flat right-diagonal tower is not an
 * abstract solution of the recurrence — it is an actual rule 30 picture.
 *
 *   node explorer/sextant_ru_flat.mjs
 *
 * Last session's C5 exhibited a tower with period 2 at every depth by choosing
 * all the constants of integration black, and could say only that it solves
 * the recurrence. Here it is identified: it is the picture of
 *
 *     X = ... 1 0 1 0 1 | 0 0 0 ...        X(x) = [x even] for x <= 0, white for x >= 1
 *
 * the (01)^Z fixed point meeting white at the origin — the same configuration
 * that killed the sequence-level residual in the second entry of
 * docs/obstructions.md. Three checks:
 *
 *   A. its right diagonals are exactly R_0 = 1^inf and R_k = (10)^inf, k >= 1;
 *   B. its picture is a travelling wave: cell(t+p, x+p) = cell(t, x) for every
 *      even p, over a wide region and many rows — so no p ever fails, and the
 *      argument of the attack document must not apply to it;
 *   C. which hypothesis of that argument fails: it has no leftmost black cell,
 *      so the row at time p slid left by p agrees with row 0 everywhere,
 *      instead of disagreeing at the leftmost black cell as a finite
 *      configuration's does.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const T = 3000, LEFT = 9000;
const OFF = LEFT + 4, W = OFF + T + 8;
let a = new Uint8Array(W), b = new Uint8Array(W);
a[OFF] = 1;
for (let j = 1; j <= LEFT; j++) a[OFF - j] = j % 2 === 0 ? 1 : 0;
const rows = [];
for (let t = 0; t < T; t++) {
  rows.push(a.slice());
  for (let i = 1; i < W - 1; i++) b[i] = a[i - 1] ^ (a[i] | a[i + 1]);
  const tmp = a; a = b; b = tmp;
}
const cell = (t, x) => rows[t][OFF + x];

// A. the tower
{
  let fail0 = 0, failk = 0;
  for (let j = 0; j < 1500; j++) if (cell(j, j) !== 1) fail0++;
  for (let k = 1; k <= 200; k++) for (let j = 0; j < 1000; j++)
    if (cell(j + k, j) !== (j % 2 === 0 ? 1 : 0)) failk++;
  console.log('A. the flat tower, realised:');
  console.log(`   R_0 = 1^inf over 1500 terms: ${fail0} failures`);
  console.log(`   R_k = (10)^inf for 1 <= k <= 200, 1000 terms each: ${failk} failures`);
  const show = (k) => Array.from({ length: 16 }, (_, j) => cell(j + k, j)).join('');
  console.log(`   R_0 = ${show(0)}  R_1 = ${show(1)}  R_2 = ${show(2)}  R_17 = ${show(17)}`);
}

// B. the travelling wave
{
  console.log('\nB. cell(t+p, x+p) = cell(t, x): a travelling wave of speed 1');
  for (const p of [2, 4, 6, 16, 64, 512]) {
    let fail = 0, tested = 0;
    for (let t = 0; t + p < T; t += 7) {
      for (let x = -(LEFT - T - 20); x <= t + 3; x += 13) {
        if (cell(t + p, x + p) !== cell(t, x)) fail++;
        tested++;
      }
    }
    console.log(`   p = ${p}: ${fail} failures over ${tested} cells`);
  }
  let oddFail = 0;
  for (let t = 0; t + 1 < T; t++) if (cell(t + 1, 1) !== cell(t, 0)) oddFail++;
  console.log(`   p = 1 (odd): ${oddFail} failures of ${T - 1} — odd p does fail, as for the seed`);
}

// C. why the argument does not reach it
{
  console.log('\nC. the hypothesis that fails');
  let firstDiff = -1;
  for (let d = 1; d <= LEFT - T - 20; d++) if (cell(2, 2 - d) !== cell(0, -d)) { firstDiff = d; break; }
  console.log(`   row 2 slid left by 2, against row 0: first disagreement at depth ${firstDiff < 0 ? 'none found' : firstDiff}` +
    ` (searched ${LEFT - T - 20} cells)`);
  console.log('   leftmost black cell of row 0: none — the tail is (10)^inf.');
  console.log('   For the single seed the same slide disagrees at the leftmost black cell,');
  console.log('   which has moved 2p further left; that is the whole contradiction.');
}
