/**
 * Rosetta / connect: how fast do the right-diagonal periods really grow?
 *
 * The board carries the figure `P_k = 2^(0.41 k)` for the minimal period of the
 * k-th right diagonal, measured to k = 40. The vantage asks me to relate that
 * exponent to the two other measured slopes (the seam at 0.25t, the damage
 * front at 0.24t), so the first thing to know is whether 0.41 is an asymptote
 * or a finite-size number on its way to 1/2 (which is what a coin would give,
 * since the period doubles exactly when a driver word has odd weight).
 *
 * Method. Write R_k(j) = cell(j + k, j) for the k-th right diagonal. Setting
 * t + 1 = j + k, x = j in `rule30_eq` gives
 *
 *     R_k(j) = R_k(j-1) XOR ( R_(k-1)(j) OR R_(k-2)(j+1) ),      R_k(0) = c(k),
 *
 * so each diagonal is a running XOR ("integral") of a driver built from the two
 * diagonals outside it, with the centre column as its constant of integration.
 * If L is a common period of R_(k-1) and R_(k-2) then the driver has period L,
 * and R_k has period L iff the driver has even weight over [1, L], else 2L.
 * So the whole tower can be run from R_0, R_1 and the centre column alone, with
 * no triangle: one array per diagonal, one pass per level.
 *
 * Section A checks the integrator against a real triangle. Section B runs it as
 * deep as the memory cap allows and reports the doubling positions and the
 * running estimate of the exponent.
 *
 * Nothing here proves anything.
 */

import { rows } from './rule30.mjs';

const CAP_LOG2 = 26;              // largest common period we will hold, 2^26 cells
const CHECK_ROWS = 3000;          // rows of real triangle for the agreement check
const CHECK_DEPTH = 60;           // diagonals compared against it

// --------------------------------------------------------------------------
// A real triangle, for the check and for the centre column.
// --------------------------------------------------------------------------
function triangle(n) {
  const out = [];
  let i = 0;
  for (const r of rows(n)) out.push(r);
  return { rowsOf: out, centre: BigInt(n + 2) };
}

const tri = triangle(CHECK_ROWS);
/** cell(t, x) of the real single-seed picture, |x| <= t < CHECK_ROWS. */
function cell(t, x) {
  const b = tri.centre + BigInt(x);
  if (b < 0n) return 0;
  return Number((tri.rowsOf[t] >> b) & 1n);
}
/** The centre column, from the same triangle. */
const c = (t) => cell(t, 0);

// --------------------------------------------------------------------------
// The integrator.
//
// `A` is R_(k-2), `B` is R_(k-1), each a Uint8Array of length `Q`, the common
// period, holding one full period from index 0. Indices are taken mod Q, which
// is legitimate exactly because both are periodic from index 0 with period Q
// (`rightDiagonal_periodicFrom_pow` on the board: no transient on the right).
// --------------------------------------------------------------------------

/** One period of R_0 and R_1: R_0 is the right edge, R_1 the cells inside it. */
function seedDiagonals() {
  // R_0(j) = cell(j, j) = 1 for all j; R_1(j) = cell(j+1, j).
  const A = new Uint8Array(1); A[0] = cell(0, 0);            // R_0, period 1
  const B = new Uint8Array(2); B[0] = cell(1, 0); B[1] = cell(2, 1); // R_1, period 2
  return { A, B, Q: 2 };
}

/** Repeat `a` (period `q`) up to length `Q`, a multiple of `q`. */
function extend(a, q, Q) {
  const out = new Uint8Array(Q);
  for (let i = 0; i < Q; i++) out[i] = a[i % q];
  return out;
}

console.log('=== A. the integrator against a real triangle ===');
{
  let { A, B, Q } = seedDiagonals();
  let qa = 1, qb = 2;
  let bad = 0, n = 0;
  for (let k = 2; k <= CHECK_DEPTH; k++) {
    const Qc = Math.max(qa, qb);
    const a = extend(A, qa, Qc), b = extend(B, qb, Qc);
    // driver g(j) = b(j) OR a(j+1), weight over j = 1..Qc
    let w = 0;
    for (let j = 1; j <= Qc; j++) w ^= (b[j % Qc] | a[(j + 1) % Qc]);
    const Qn = w ? 2 * Qc : Qc;
    const a2 = extend(A, qa, Qn), b2 = extend(B, qb, Qn);
    const R = new Uint8Array(Qn);
    R[0] = c(k);
    for (let j = 1; j < Qn; j++) R[j] = R[j - 1] ^ (b2[j % Qn] | a2[(j + 1) % Qn]);
    // compare with the real triangle
    for (let j = 0; j < 400 && j + k < CHECK_ROWS; j++) {
      n++;
      if (R[j % Qn] !== cell(j + k, j)) bad++;
    }
    A = b2; qa = Qn; B = R; qb = Qn;
    // note: A must be R_(k-1) at its own period; using Qn is a multiple of it
    if (Qn > 1 << 20) break;
  }
  console.log(`  ${n} diagonal cells compared, ${bad} disagreements`);
}

// --------------------------------------------------------------------------
console.log();
console.log(`=== B. minimal periods and doubling positions, cap 2^${CAP_LOG2} ===`);
{
  let { A, B, Q } = seedDiagonals();
  let qa = 1, qb = 2;
  const doublings = [];
  const periods = [1, 2];
  let k = 2;
  for (;;) {
    const Qc = Math.max(qa, qb);
    if (Qc > (1 << CAP_LOG2)) break;
    const a = qa === Qc ? A : extend(A, qa, Qc);
    const b = qb === Qc ? B : extend(B, qb, Qc);
    let w = 0;
    for (let j = 1; j <= Qc; j++) w ^= (b[j % Qc] | a[(j + 1) % Qc]);
    const Qn = w ? 2 * Qc : Qc;
    if (Qn > (1 << CAP_LOG2)) break;
    const a2 = Qn === Qc ? a : extend(a, Qc, Qn);
    const b2 = Qn === Qc ? b : extend(b, Qc, Qn);
    const R = new Uint8Array(Qn);
    R[0] = c(k);
    for (let j = 1; j < Qn; j++) R[j] = R[j - 1] ^ (b2[j % Qn] | a2[(j + 1) % Qn]);
    // minimal period of R: the least divisor-of-Qn power of two that works
    let p = 1;
    while (p < Qn) {
      let ok = true;
      for (let j = 0; j < Qn; j++) if (R[j] !== R[(j + p) % Qn]) { ok = false; break; }
      if (ok) break;
      p *= 2;
    }
    periods.push(p);
    if (w) doublings.push(k);
    A = b2; qa = Qn;
    B = R; qb = Qn;
    if (k % 5 === 0 || Qn >= (1 << 22)) {
      const nd = doublings.length + 1; // + the doubling from R_0 to R_1
      console.log(`  k=${String(k).padStart(3)}  Q=2^${Math.log2(Qn).toFixed(0)}  minperiod(R_k)=2^${Math.log2(p).toFixed(0)}  doublings<=k: ${nd}  exponent=${(Math.log2(Qn) / k).toFixed(4)}`);
    }
    k++;
  }
  console.log();
  console.log(`  minimal periods (log2), k = 0..${periods.length - 1}:`);
  console.log(`    ${periods.map((x) => Math.log2(x)).join(' ')}`);
  console.log(`  doubling positions k (where the common period doubled): ${doublings.join(' ')}`);
  const K = periods.length - 1;
  console.log(`  reached k = ${K}; log2(Q_K)/K = ${(Math.log2(Math.max(...periods)) / K).toFixed(4)}`);
  // the exponent measured on the second half only, to see any drift
  for (const frac of [0.25, 0.5, 0.75, 1.0]) {
    const kk = Math.floor(K * frac);
    if (kk < 4) continue;
    let d = 0;
    for (const x of doublings) if (x <= kk) d++;
    console.log(`    doublings up to k=${kk}: ${d + 1}  density=${((d + 1) / kk).toFixed(4)}`);
  }
}
