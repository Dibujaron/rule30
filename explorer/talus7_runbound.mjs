/**
 * Talus, 2026-09-10. The one cone-based mechanism that constrains the centre
 * column's runs, and therefore its excess.
 *
 * Derivation, from board nodes only. Suppose the centre column is BLACK at
 * every time in [a, a+L). Then column_succ_of_black gives cell(t,-1) = !c(t+1)
 * = 0 for t in [a, a+L-1). Feed that into evolve_sub_one_eq_xor,
 *     cell(t, i-1) = cell(t+1, i) XOR (cell(t, i) OR cell(t, i+1)),
 * at i = -1: cell(t,-2) = cell(t+1,-1) XOR (cell(t,-1) OR cell(t,0))
 *                       = 0 XOR (0 OR 1) = 1,
 * and again at i = -2: cell(t,-3) = 1 XOR (1 OR 0) = 0, and so on: the
 * checkerboard is forced leftward, one column per time step of the run. So
 *
 *     cell(a, -j) = 1 if j even, 0 if j odd,  for 0 <= j <= L - 1.
 *
 * The cone stops it. evolve_left_edge and evolve_left_second_diagonal put two
 * ADJACENT black cells at positions -a and -a+1 of row a, which the
 * checkerboard forbids. So the alternation cannot reach position -a, i.e.
 *
 *     L <= a + 1     (a maximal black run is no longer than its start time).
 *
 * The white case runs the same way through col_one_of_white and
 * white_run_monotone and lands on the same bound.
 *
 * Three things measured here, all on the real picture:
 *  (1) the forced alternation, at every maximal black run;
 *  (2) the run bound L <= a + 1, at every maximal run of either colour;
 *  (3) how far the bound is from the truth -- max(L)/max(a) -- because a bound
 *      that is true and a factor N/log N loose is a fence, not a tool.
 */

const N = 1_000_000;

// Full packed rows: cell(t, x) = bit (x + t) of rowNat t.
const WORDS = ((2 * N + 96) >> 5) + 2;
const r = new Uint32Array(WORDS);
r[0] = 1;

const c = new Uint8Array(N);
// keep the rows we will need to re-read: only the rows that START a run, and
// only their left half out to the run's length. Collect run starts in a first
// pass by streaming, checking the alternation as we go on a rolling copy.
// Simpler and exact: keep the last row in `r` and check the alternation at the
// moment the run's start row is current -- which needs to know the run length
// in advance, so instead record the left words of every row whose centre cell
// starts a run, capped at CAP cells.
const CAP = 64;
const leftOfRunStart = new Map(); // t -> Uint8Array of cell(t,-j), j < CAP

let prevBit = -1;
for (let t = 0; t < N; t++) {
  const bit = (i) => (i < 0 ? 0 : (r[i >> 5] >>> (i & 31)) & 1);
  const b = bit(t);
  c[t] = b;
  if (b !== prevBit) {
    const arr = new Uint8Array(CAP);
    for (let j = 0; j < CAP; j++) arr[j] = bit(t - j);
    leftOfRunStart.set(t, arr);
    prevBit = b;
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

const A = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1];
let badA = 0;
for (let k = 0; k < A.length; k++) if (c[k] !== A[k]) badA++;
console.log(`check: A051023 prefix mismatches ${badA}`);

// walk the maximal runs
let alternationTested = 0, alternationBad = 0, firstAltBad = -1;
let boundTested = 0, boundBad = 0, worstSlack = Infinity, worstAt = -1;
let maxL = 0, maxLat = 0, maxLcolour = -1;
let cappedRuns = 0;
let i = 0;
while (i < N) {
  const col = c[i];
  let j = i;
  while (j < N && c[j] === col) j++;
  const L = j - i, a = i;
  if (j < N) { // complete run
    if (L > maxL) { maxL = L; maxLat = a; maxLcolour = col; }
    boundTested++;
    if (L > a + 1) { boundBad++; if (worstAt < 0) worstAt = a; }
    worstSlack = Math.min(worstSlack, a + 1 - L);
    if (col === 1 && a > 0) {
      const arr = leftOfRunStart.get(a);
      if (arr) {
        const reach = Math.min(L - 1, CAP - 1, a);
        for (let k = 0; k <= reach; k++) {
          alternationTested++;
          const want = k % 2 === 0 ? 1 : 0;
          if (arr[k] !== want) { alternationBad++; if (firstAltBad < 0) firstAltBad = a; }
        }
        if (L - 1 > CAP - 1) cappedRuns++;
      }
    }
  }
  i = j;
}

console.log(`\n(1) forced alternation left of a black run:`);
console.log(`    ${alternationBad} failures in ${alternationTested} cells tested, ` +
  `over every maximal black run below N=${N}; first failure at run start ${firstAltBad}`);
console.log(`    (runs longer than the ${CAP}-cell window: ${cappedRuns})`);
console.log(`\n(2) the run bound L <= a + 1:`);
console.log(`    ${boundBad} violations in ${boundTested} maximal runs; tightest margin ` +
  `a+1-L = ${worstSlack}${worstAt >= 0 ? ` (first violation at a=${worstAt})` : ''}`);
console.log(`\n(3) how loose it is:`);
console.log(`    longest run below N: L=${maxL} (colour ${maxLcolour}) starting at a=${maxLat}; ` +
  `bound allows ${maxLat + 1}, so the bound is loose by a factor ${((maxLat + 1) / maxL).toFixed(0)}`);
console.log(`    log2(N) = ${Math.log2(N).toFixed(2)}, so the true longest run tracks log2 N ` +
  `and the provable bound tracks N`);

// what the run bound buys for the excess, run by run: a_{k+1} <= 2 a_k + 1,
// so the number of maximal runs below N is at least log2(N) - O(1).
let runsBelow = 0;
{
  let k = 0;
  while (k < N) { const col = c[k]; let m = k; while (m < N && c[m] === col) m++; runsBelow++; k = m; }
}
console.log(`\n    maximal runs below N: ${runsBelow}; the bound only forces >= ` +
  `${Math.floor(Math.log2(N))}, giving |E(N)| <= N - ${Math.floor(Math.log2(N))}`);
