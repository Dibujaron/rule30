/**
 * Four checks for the tier proposed on 2026-09-09, all on the left diagonals.
 *
 *   node explorer/seed_whitegaps.mjs [K] [J]
 *
 * The diagonals are read from the packed row model, which is the board's
 * `rowNat`: row 0 is 1, row t+1 is (4r) XOR ((2r) OR r), and
 * `leftDiagonal k j = bit k of row (j + k)` (leftDiagonal_eq_rowNat_testBit).
 *
 *  1. The longest FINITE white run in any left diagonal -- the constant C of
 *     the proposed conditional `leftDiagonal_onset_le_of_white_gap`. A run of
 *     whites that never ends again is not counted; that is exactly what the
 *     hypothesis permits.
 *  2. Rowland's non-doubling criterion on the left: with diagonals m, m+1 both
 *     q-periodic from N and m+1 white from N+1 on, diagonal m+2 is q-periodic
 *     from N exactly when one period of diagonal m has an even number of black
 *     cells.
 *  3. No two consecutive diagonals are both eventually white.
 *  4. The number of period doublings below k never exceeds the number of
 *     eventually-white diagonals below k.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const K = 400;
const J = 3000;

// rows 0 .. K + J, as BigInt, bit b = cell at position b - t.
const rows = [1n];
for (let t = 0; t < K + J + 4; t++) {
  const r = rows[t];
  rows.push((4n * r) ^ ((2n * r) | r));
}
const bit = (t, k) => Number((rows[t] >> BigInt(k)) & 1n);
/** leftDiagonal k j */
const D = (k, j) => bit(j + k, k);

// ---------------------------------------------------------------------------
// period and onset of each diagonal, from the tail of the data
// ---------------------------------------------------------------------------
const MIN_CYCLES = 8;
const info = [];
for (let k = 0; k <= K; k++) {
  const a = new Uint8Array(J);
  for (let j = 0; j < J; j++) a[j] = D(k, j);
  let found = null;
  for (let p = 1; p * MIN_CYCLES <= J; p *= 2) {
    let lastBreak = -1;
    for (let i = p; i < J; i++) if (a[i] !== a[i - p]) lastBreak = i;
    const onset = lastBreak < 0 ? 0 : lastBreak - p + 1;
    if (J - onset >= MIN_CYCLES * p) { found = { p, onset }; break; }
  }
  // eventually white: the settled word is all zero
  let ew = null;
  if (found) {
    ew = true;
    for (let i = found.onset; i < found.onset + found.p; i++) if (a[i]) { ew = false; break; }
  }
  info.push({ k, a, ...found, ew });
}

// ---------------------------------------------------------------------------
// 1. the longest finite white run
// ---------------------------------------------------------------------------
let worst = { len: 0, k: -1, j: -1 };
for (let k = 0; k <= K; k++) {
  const a = info[k].a;
  let run = 0, start = 0;
  for (let j = 0; j < J; j++) {
    if (a[j] === 0) { if (run === 0) start = j; run++; }
    else { if (run > worst.len) worst = { len: run, k, j: start }; run = 0; }
  }
  // a trailing run is not known to be finite; not counted
}
console.log(`1. longest FINITE white run over k <= ${K}, j < ${J}: ${worst.len} (diagonal ${worst.k}, from index ${worst.j})`);

// distribution of finite run lengths
const hist = new Map();
for (let k = 0; k <= K; k++) {
  const a = info[k].a;
  let run = 0;
  for (let j = 0; j < J; j++) {
    if (a[j] === 0) run++;
    else { if (run) hist.set(run, (hist.get(run) ?? 0) + 1); run = 0; }
  }
}
console.log('   finite white-run lengths:', [...hist.entries()].sort((x, y) => x[0] - y[0]).map(([l, n]) => `${l}:${n}`).join(' '));

// ---------------------------------------------------------------------------
// 2. Rowland's non-doubling criterion, left side
// ---------------------------------------------------------------------------
let tested = 0, agreed = 0, counter = [];
for (let m = 0; m + 2 <= K; m++) {
  const A = info[m], B = info[m + 1], C2 = info[m + 2];
  if (!A.p || !B.p || !C2.p) continue;
  const q = Math.max(A.p, B.p);
  const N = Math.max(A.onset, B.onset);
  if (N + q + 4 >= J) continue;
  // both m and m+1 are q-periodic from N (q is a multiple of each period)
  // is m+1 white from N+1 on (within the data)?
  let white = true;
  for (let j = N + 1; j < J; j++) if (B.a[j]) { white = false; break; }
  if (!white) continue;
  // parity of one period of diagonal m, starting at N+2
  let ones = 0;
  for (let j = 0; j < q; j++) ones += A.a[N + 2 + j];
  const even = ones % 2 === 0;
  // is m+2 q-periodic from N?
  let qper = true;
  for (let j = N; j + q < J; j++) if (C2.a[j + q] !== C2.a[j]) { qper = false; break; }
  tested++;
  if (even === qper) agreed++; else counter.push({ m, q, N, ones, qper });
}
console.log(`2. Rowland non-doubling, left: ${agreed}/${tested} cases agree (even parity <-> period preserved); counterexamples ${counter.length}`);
if (counter.length) console.log('   ', counter.slice(0, 5));

// ---------------------------------------------------------------------------
// 3. no two consecutive eventually-white diagonals
// ---------------------------------------------------------------------------
const ews = info.filter((x) => x.ew).map((x) => x.k);
console.log(`3. eventually-white diagonals below ${K}: [${ews.join(', ')}]`);
const adj = ews.filter((k) => ews.includes(k + 1));
console.log(`   consecutive pairs among them: ${adj.length === 0 ? 'none' : adj.join(', ')}`);

// ---------------------------------------------------------------------------
// 4. doublings vs whites
// ---------------------------------------------------------------------------
// The invariant the proposed induction carries is a period SHARED by the pair
// (k, k+1). Per-diagonal periods are not monotone in k; the pair period is.
const Q = [];
for (let k = 0; k + 1 <= K; k++) Q.push(info[k].p && info[k + 1].p ? Math.max(info[k].p, info[k + 1].p) : null);
let nonMono = [], jumps = [], notWhite = [];
for (let k = 1; k < Q.length; k++) {
  if (Q[k] === null || Q[k - 1] === null) continue;
  if (Q[k] < Q[k - 1]) nonMono.push(k);
  if (Q[k] > Q[k - 1]) {
    jumps.push(k);
    if (Q[k] !== 2 * Q[k - 1]) jumps[jumps.length - 1] = `${k}(x${Q[k] / Q[k - 1]})`;
    if (!info[k].ew) notWhite.push(k);
  }
}
console.log(`4. pair period Q(k) = max(period k, period k+1): monotone? ${nonMono.length === 0 ? 'yes' : 'NO at ' + nonMono.slice(0, 5)}`);
console.log(`   Q increases at k = [${jumps.join(', ')}]; of those, diagonals not eventually white: ${notWhite.length === 0 ? 'none' : notWhite.join(', ')}`);
console.log(`   Q(${K - 1}) = ${Q[K - 1]}, whites below = ${ews.filter((w) => w < K).length}, 2^whites = ${2 ** ews.filter((w) => w < K).length}`);
let badA = [];
for (let k = 0; k < Q.length; k++) {
  if (Q[k] === null) continue;
  const w = ews.filter((x) => x < k + 1).length;
  if (Q[k] > 2 ** w) badA.push({ k, Q: Q[k], w });
}
console.log(`   A: Q(k) <= 2^(#eventually-white below k+1) for every k <= ${K - 1}: ${badA.length === 0 ? 'holds' : 'FAILS ' + JSON.stringify(badA.slice(0, 5))}`);
// every eventually-white diagonal is followed by a doubling (parity odd there)
console.log(`   every eventually-white k has Q(k) = 2*Q(k-1): ${ews.filter((k) => k >= 1 && Q[k] !== null && Q[k - 1] !== null && Q[k] !== 2 * Q[k - 1]).length === 0 ? 'yes' : 'no'}`);
