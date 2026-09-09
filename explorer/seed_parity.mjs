/**
 * The exact identity behind the proposed `leftDiagonal_step_of_white`, and the
 * centre-column dictionary entry.
 *
 *   node explorer/seed_parity.mjs
 *
 * (a) Past a white diagonal m+1, the recurrence collapses to a running XOR:
 *     leftDiagonal (m+2) (n+q) = leftDiagonal (m+2) n  XOR  parity of
 *     { leftDiagonal m (n+j+2) : j < q }.  Checked for every m with an
 *     eventually-white neighbour, every n past the white onset, and every q.
 *     A window off by one would show up here even where the parity happens to
 *     come out right on the four real cases.
 *
 * (b) centerColumn t = bit t of row t, checked against OEIS A051023.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { A051023_PREFIX } from './rule30.mjs';

const K = 420;
const J = 3000;

const rows = [1n];
for (let t = 0; t < K + J + 4; t++) {
  const r = rows[t];
  rows.push((4n * r) ^ ((2n * r) | r));
}
const D = (k, j) => Number((rows[j + k] >> BigInt(k)) & 1n);

// (a) find the diagonals that look eventually white, then test the identity
const whiteFrom = [];
for (let k = 0; k <= K; k++) {
  let last = -1;
  for (let j = 0; j < J; j++) if (D(k, j)) last = j;
  if (last < J - 500) whiteFrom.push({ k, from: last + 1 });
}
console.log('(a) diagonals white from an index onward (within j <', J, '):', whiteFrom.map((w) => `${w.k}@${w.from}`).join(' '));

let tests = 0, fails = [];
for (const { k, from } of whiteFrom) {
  const m = k - 1; // diagonal m+1 = k is the white one
  if (m < 0) continue;
  const N = Math.max(from - 1, 0); // white from N+1 on
  for (let q = 1; q <= 64; q *= 2) {
    for (let n = N; n + q + 4 < J && n < N + 400; n++) {
      let ones = 0;
      for (let j = 0; j < q; j++) ones += D(m, n + j + 2);
      const lhs = D(m + 2, n + q);
      const rhs = D(m + 2, n) ^ (ones % 2);
      tests++;
      if (lhs !== rhs) fails.push({ m, q, n });
    }
  }
}
console.log(`    running-XOR identity: ${tests - fails.length}/${tests} hold; failures ${fails.length}`);
if (fails.length) console.log('    first failures:', fails.slice(0, 5));

// the four real cases, with their parity, at the pair onset
console.log('    parity of one period at each white diagonal (q = the pair period):');
for (const { k, from } of whiteFrom) {
  const m = k - 1;
  if (m < 0) continue;
  const N = Math.max(from - 1, 0);
  for (const q of [1, 2, 4, 8, 16]) {
    let ones = 0;
    for (let j = 0; j < q; j++) ones += D(m, N + j + 2);
    if (q === 16) console.log(`      white diagonal ${k}: N=${N}, parity over q=16 is ${ones % 2 ? 'odd' : 'even'}`);
  }
}

// (b) the centre-column dictionary
let ok = true;
for (let t = 0; t < A051023_PREFIX.length; t++) {
  if (Number((rows[t] >> BigInt(t)) & 1n) !== A051023_PREFIX[t]) { ok = false; console.log('    mismatch at t =', t); }
}
console.log(`(b) centerColumn t = bit t of row t, against A051023 for t < ${A051023_PREFIX.length}: ${ok ? 'agrees' : 'DISAGREES'}`);
