/**
 * Meridian C — the centre column generated left to right by a constraint, with
 * no two-dimensional evolution from the seed.
 *
 * The board's `leftSolve` rebuilds the whole left half of the picture from
 * columns 0 and 1 alone (`sideways_inverse`), and column 1 is itself a function
 * of column 0 (the right half-line `evolveHalfRight` started all white). So
 * everything to the left of the origin is a function of the centre column
 * alone. Row 0 of the seed is white at every x < 0. That gives a generating
 * rule for the centre column with no picture in it:
 *
 *   c(0) = 1, and for k >= 1, c(k) is the unique bit for which the rebuilt
 *   initial row is WHITE at position -k.
 *
 * "The rebuilt initial row is white" is the infinite repetition 0^inf; the rule
 * is "never break it". That is the shape a repetition-defined sequence has.
 *
 * Tests:
 *   A. the choice is forced — L(k,0) really does depend on c(k) affinely, so
 *      exactly one of the two bits satisfies the constraint at every k;
 *   B. the generated sequence is the centre column (A051023);
 *   C. how far ahead the constraint at index k reaches: which c(j) it reads.
 *
 * Cost is O(T^2). Nothing here proves anything.
 */

const T = 3000;

// c[0..T] chosen as we go; d[t] = column 1 at time t; L is the solve triangle,
// stored as L[m][t] for m + t <= T.
const c = new Uint8Array(T + 1);
const d = new Uint8Array(T + 1);

// right half-line: cur[x] = cell at position x+1 of the current row (x >= 0)
let half = new Uint8Array(T + 3);
let halfNext = new Uint8Array(T + 3);

// solve triangle: L[m] is a row array indexed by t
const L = [];
for (let m = 0; m <= T; m++) L.push(new Uint8Array(T + 2 - m));

/** advance the right half-line one step, using boundary bit b = c(t). */
function advanceHalf(b) {
  const n = half.length;
  halfNext[0] = b ^ (half[0] | half[1]);
  for (let x = 1; x < n - 1; x++) halfNext[x] = half[x - 1] ^ (half[x] | half[x + 1]);
  halfNext[n - 1] = 0;
  const tmp = half;
  half = halfNext;
  halfNext = tmp;
}

/**
 * Fill the diagonal { L[m][k-m] : 0 <= m <= k } given c[0..k] and d[0..k-1].
 * Returns L[k][0].
 */
function fillDiagonal(k) {
  L[0][k] = c[k];
  if (k >= 1) L[1][k - 1] = c[k] ^ (c[k - 1] | d[k - 1]);
  for (let m = 2; m <= k; m++) {
    const t = k - m;
    L[m][t] = L[m - 1][t + 1] ^ (L[m - 1][t] | L[m - 2][t]);
  }
  return k >= 1 ? L[k][0] : L[0][k];
}

c[0] = 1;
d[0] = 0; // column 1 at time 0 is white
fillDiagonal(0);
advanceHalf(c[0]); // now `half` is row 1 of the right half-line
d[1] = half[0];

let forcedFailures = 0;
for (let k = 1; k <= T; k++) {
  // branch on c[k]
  c[k] = 0;
  const v0 = fillDiagonal(k);
  c[k] = 1;
  const v1 = fillDiagonal(k);
  if (v0 === v1) forcedFailures++;
  c[k] = v0 === 0 ? 0 : 1; // pick the branch giving L(k,0) = 0
  fillDiagonal(k);
  if (L[k][0] !== 0) throw new Error(`constraint not satisfied at k=${k}`);
  if (k < T) {
    advanceHalf(c[k]);
    d[k + 1] = half[0];
  }
}

console.log(`A constraint forced at every k: failures ${forcedFailures} of ${T}`);

// B: compare with the true centre column
const stepB = (x) => (x << 1n) ^ (x | (x >> 1n));
const off = BigInt(T + 4);
let row = 1n << off;
let bad = -1;
for (let t = 0; t <= T; t++) {
  const truth = Number((row >> off) & 1n);
  if (truth !== c[t] && bad < 0) bad = t;
  row = stepB(row);
}
console.log(`B generated sequence vs the centre column: first disagreement at t = ${bad}`);
console.log(`   generated[0..40] = ${Array.from(c.slice(0, 41)).join('')}`);

// C: reach of the constraint
console.log(
  `C the constraint at index k reads c(0..k) and nothing beyond: by construction, ` +
    `L(k,0) is built from the diagonal { L(m, k-m) }, whose only inputs are ` +
    `c(0..k) and d(0..k-1), and d(j) depends on c(0..j-1).`,
);
