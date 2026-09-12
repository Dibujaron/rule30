/**
 * Sextant, 2026-09-12. THE ONE HANDLE ON THE ROW COUNT THAT IS NOT LOCAL.
 *
 * Reading row t along the two diagonal families rather than across:
 *
 *   b(t) = SUM_{k=0}^{t} leftDiagonal k (t-k)
 *        + SUM_{k=0}^{t} rightDiagonal k (t-k)
 *        - centerColumn t
 *
 * (cell (t,-j) is leftDiagonal (t-j) j -- no: with k = t+x and j = -x, the
 * cell at x <= 0 is leftDiagonal (t+x) (-x); reindexing by k = -x gives
 * leftDiagonal (t-k) k. Both readings are checked below against the picture.)
 *
 * Why this matters. Every rightDiagonal k is EXACTLY periodic from index 0
 * with period dividing 2^k (rightDiagonal_periodicFrom_pow, proved), and every
 * leftDiagonal k is eventually periodic (proved). So b(t) is a sum of t+1
 * eventually periodic sequences read down an antidiagonal, and the density of
 * each one is an exact rational computable by a finite calculation -- unlike
 * the centre column, whose density is the prize. The row-balance question
 * becomes
 *
 *       is  (1/K) * SUM_{k<K} delta_k  ->  1/2 ?
 *
 * with delta_k = weight(R_k)/period(R_k), each an exact rational. This
 * measures delta_k, its partial sums, and the same for the left family.
 */

const T = 200_000;
const KMAX = 40;
const WORDS = ((2 * T + 160) >> 5) + 4;

const r = new Uint32Array(WORDS);
r[0] = 1;

// diag[k][j] as bit arrays
const Rbits = [], Lbits = [];
for (let k = 0; k <= KMAX; k++) {
  Rbits.push(new Uint8Array(T));
  Lbits.push(new Uint8Array(T));
}
let mismatch = 0;

for (let t = 0; t < T; t++) {
  const hi = Math.min(WORDS - 2, ((2 * t) >> 5) + 1);
  const cellAt = (x) => (x < -t || x > t) ? 0 : (r[(x + t) >> 5] >>> ((x + t) & 31)) & 1;
  for (let k = 0; k <= KMAX && k <= t; k++) {
    // rightDiagonal k j = evolve (j+k) j, so with t = j+k, j = t-k, cell x = t-k
    Rbits[k][t - k] = cellAt(t - k);
    // leftDiagonal k j = evolve (j+k) (-j), j = t-k, cell x = -(t-k)
    Lbits[k][t - k] = cellAt(-(t - k));
  }
  let p = 0;
  for (let m = 0; m <= hi + 1; m++) {
    const cur = r[m];
    const s2 = ((cur << 2) | (p >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (p >>> 31)) >>> 0;
    r[m] = (s2 ^ (s1 | cur)) >>> 0;
    p = cur;
  }
}

// sanity: R_0 always black, R_1 alternates, L_0 and L_1 always black, L_2 white
{
  let ok = true;
  for (let j = 0; j < 1000; j++) {
    if (Rbits[0][j] !== 1) ok = false;
    if (Rbits[1][j] !== (j % 2 === 0 ? 1 : 0)) ok = false;
    if (Lbits[0][j] !== 1) ok = false;
    if (Lbits[1][j] !== 1) ok = false;
    if (Lbits[2][j] !== 0) ok = false;
  }
  console.log(`edge checks (R0 black, R1 alternating, L0/L1 black, L2 white) over 1000 indices: ${ok ? 'pass' : 'FAIL'}`);
}

function minimalPeriodPow2(arr, len) {
  for (let a = 0; (1 << a) <= len >> 3; a++) {
    const p = 1 << a;
    let ok = true;
    for (let j = 0; j + p < len; j++) if (arr[j] !== arr[j + p]) { ok = false; break; }
    if (ok) return p;
  }
  return -1;
}

console.log('');
console.log('RIGHT diagonals: exactly periodic from index 0, period a power of two');
console.log(' k   P_k     weight   delta_k = w/P      2*delta_k-1     running SUM(2d-1)');
let run = 0;
const deltas = [];
for (let k = 0; k <= KMAX; k++) {
  const len = T - k;
  const P = minimalPeriodPow2(Rbits[k], len);
  if (P < 0) { console.log(` ${String(k).padStart(2)}  period > ${len >> 3} -- out of reach at T=${T}`); break; }
  let w = 0;
  for (let j = 0; j < P; j++) w += Rbits[k][j];
  const d = w / P;
  run += 2 * d - 1;
  deltas.push(d);
  console.log(` ${String(k).padStart(2)} ${String(P).padStart(6)} ${String(w).padStart(8)}   ${d.toFixed(6)}` +
    `        ${(2 * d - 1).toFixed(6).padStart(9)}      ${run.toFixed(6)}`);
}
console.log(`  mean delta over k=0..${deltas.length - 1}: ${(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(6)}`);
console.log(`  mean over k=1..${deltas.length - 1} (dropping the constant edge): ` +
  `${(deltas.slice(1).reduce((a, b) => a + b, 0) / (deltas.length - 1)).toFixed(6)}`);

console.log('');
console.log('LEFT diagonals: eventually periodic; density of the settled tail');
console.log(' k   P_k   onset   weight   dens      running SUM(2d-1)');
let runL = 0;
for (let k = 0; k <= KMAX; k++) {
  const len = T - k;
  // find the smallest power-of-two period valid from some onset <= 4k+8
  let P = -1, onset = -1;
  outer:
  for (let a = 0; a <= 8; a++) {
    const p = 1 << a;
    for (let o = 0; o <= 4 * k + 8; o++) {
      let ok = true;
      for (let j = o; j + p < len; j++) if (Lbits[k][j] !== Lbits[k][j + p]) { ok = false; break; }
      if (ok) { P = p; onset = o; break outer; }
    }
  }
  if (P < 0) { console.log(` ${String(k).padStart(2)} no power-of-two period with onset <= 4k+8`); continue; }
  let w = 0;
  for (let j = 0; j < P; j++) w += Lbits[k][onset + j];
  const d = w / P;
  runL += 2 * d - 1;
  console.log(` ${String(k).padStart(2)} ${String(P).padStart(5)} ${String(onset).padStart(7)} ${String(w).padStart(8)}   ` +
    `${d.toFixed(6)}   ${runL.toFixed(6)}`);
}
