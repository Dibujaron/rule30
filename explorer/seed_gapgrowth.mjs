/**
 * Does the longest FINITE white run in a left diagonal stay bounded?
 *
 *   node explorer/seed_gapgrowth.mjs
 *
 * This is the constant C of the proposed conditional
 * `leftDiagonal_onset_le_of_white_gap`: no left diagonal has a finite white
 * run longer than C. (A white run that never ends is not a finite run, and
 * the hypothesis says nothing about it -- those are the eventually-white
 * diagonals, four of them below 400.)
 *
 * Diagonals are read from the packed row model, `leftDiagonal k j = bit k of
 * row (j + k)`. Reported per depth band so growth, if any, is visible.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const K = 3000;
const J = 4000;

const rows = [1n];
for (let t = 0; t < K + J + 4; t++) {
  const r = rows[t];
  rows.push((4n * r) ^ ((2n * r) | r));
}
const D = (k, j) => Number((rows[j + k] >> BigInt(k)) & 1n);

const bands = [[0, 100], [100, 400], [400, 1000], [1000, 2000], [2000, 3000]];
console.log(`longest finite white run in leftDiagonal k, over j < ${J}`);
console.log('   band            max run   where            mean gap between blacks');
for (const [lo, hi] of bands) {
  let max = 0, where = null, gaps = 0, blacks = 0;
  for (let k = lo; k < hi; k++) {
    let run = 0, start = 0, seen = 0;
    for (let j = 0; j < J; j++) {
      if (D(k, j) === 0) { if (run === 0) start = j; run++; }
      else {
        seen++;
        if (run > max) { max = run; where = `k=${k}, j=${start}`; }
        run = 0;
      }
    }
    blacks += seen;
    gaps += J;
  }
  console.log(`   ${String(lo).padStart(4)}..${String(hi).padStart(4)}  ${String(max).padStart(9)}   ${String(where).padEnd(16)} ${(gaps / Math.max(blacks, 1)).toFixed(3)}`);
}

// the sum of first-black gaps along the ladder, which is what the onset bound
// really needs: starting from index 0, the gap on diagonal k is the distance
// from the running onset to the next black cell of diagonal k.
let N = 0, sum = 0;
const marks = new Set([10, 50, 100, 500, 1000, 2000, 2999]);
console.log('\nladder: onset N after stepping diagonals 1..k, taking the next black cell each time');
for (let k = 1; k < K; k++) {
  let j = N;
  while (j < J && D(k, j) === 0) j++;
  if (j >= J) { console.log(`   k=${k}: no black cell below j=${J} (eventually white); onset advances by 1`); N = N + 1; continue; }
  sum += j - N;
  N = j + 1;
  if (marks.has(k)) console.log(`   k=${String(k).padStart(4)}   N=${String(N).padStart(6)}   N/k=${(N / k).toFixed(3)}   mean gap=${(sum / k).toFixed(3)}`);
}
