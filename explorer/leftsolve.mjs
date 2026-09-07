/**
 * The sideways solve and the column-0 / right-half bijection.
 *
 *   node explorer/leftsolve.mjs
 *
 * Three checks, parameters in the file:
 *
 *  1. leftSolve. From the true columns 0 and 1 of the single seed, solve
 *     leftward with the sideways inverse
 *         L[k+1](t) = L[k](t+1) xor (L[k](t) or L[k-1](t)),   L[0] = c, L[-1] = d
 *     and compare every cell with the engine's row. Then read off the
 *     time-0 form of the cone constraint: L[k](0) = 0 for every k >= 1.
 *
 *  2. Bijection. For a sequence b and a right half Y (cells 1, 2, ...),
 *     construct the unique configuration X with X|_{x>=1} = Y and column 0
 *     equal to b: run the half-line x >= 1 forward from Y with boundary b to
 *     get column 1, then solve leftward to get X on x <= -1. Evolve X with a
 *     plain per-cell rule-30 loop and check its column 0 really is b.
 *
 *  3. Exact counts. For t <= TMAX, every column word c(0..t) is realised by
 *     exactly 2^t windows X(-t..t); and among windows white on x < 0 the
 *     number of realisations of a column word is 0, 1, 2, ... with a
 *     distribution that is printed.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerBitIndex, rows } from './rule30.mjs';

const T_SOLVE = 3000;   // rows of the true picture for check 1
const K_SOLVE = 1500;   // how many columns leftward to solve
const T_BIJ = 400;      // depth of the bijection check
const TRIALS = 12;      // random (b, Y) pairs
const TMAX = 10;        // exact counts up to this t

const cellAt = (row, gens, off) => Number((row >> BigInt(centerBitIndex(gens) + off)) & 1n);

// --- 1. leftSolve on the true columns --------------------------------------

{
  const c = new Uint8Array(T_SOLVE), d = new Uint8Array(T_SOLVE);
  const left = [];  // left[k][t] = cell(t, -k) from the engine, k <= K_SOLVE
  for (let k = 0; k <= K_SOLVE; k++) left.push(new Uint8Array(T_SOLVE));
  let t = 0;
  for (const row of rows(T_SOLVE)) {
    c[t] = cellAt(row, T_SOLVE, 0);
    d[t] = cellAt(row, T_SOLVE, 1);
    for (let k = 0; k <= K_SOLVE && k <= t; k++) left[k][t] = cellAt(row, T_SOLVE, -k);
    t++;
  }
  // L[k] defined for t < T_SOLVE - k
  let prev = d, cur = c, mismatches = 0, nonwhiteAtZero = 0;
  for (let k = 1; k <= K_SOLVE; k++) {
    const next = new Uint8Array(T_SOLVE - k);
    for (let s = 0; s < T_SOLVE - k; s++) next[s] = cur[s + 1] ^ (cur[s] | prev[s]);
    for (let s = 0; s < T_SOLVE - k; s++) if (next[s] !== left[k][s]) mismatches++;
    if (next[0] !== 0) nonwhiteAtZero++;
    prev = cur; cur = next;
  }
  console.log(`1. leftSolve from the true (column 0, column 1), ${T_SOLVE} rows, ${K_SOLVE} columns leftward:`);
  console.log(`   cells disagreeing with the engine: ${mismatches}`);
  console.log(`   k in 1..${K_SOLVE} with L[k](0) != 0 (cone at time 0): ${nonwhiteAtZero}`);
}

// --- 2. the bijection -------------------------------------------------------

/** Column 1 of the half-line x >= 1, started from Y (Y[0] is cell 1), driven by boundary b. */
function halfLineColumn1(b, Y, T) {
  const W = T + Y.length + 2;
  let row = new Uint8Array(W + 2); // row[x] = cell x, x >= 1; row[0] is the boundary
  for (let i = 0; i < Y.length; i++) row[i + 1] = Y[i];
  const R = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    R[t] = row[1];
    const cur = row.slice(); cur[0] = b[t];
    for (let x = 1; x <= W; x++) row[x] = cur[x - 1] ^ (cur[x] | cur[x + 1]);
  }
  return R;
}

/** The sideways solve at time 0: returns X(-1), X(-2), ..., X(-(K)) given c(0..K), d(0..K-1). */
function leftAtTimeZero(c, d, K) {
  let prev = d, cur = c;
  const out = new Uint8Array(K + 1); // out[k] = L[k](0), out[0] = c[0]
  out[0] = c[0];
  for (let k = 1; k <= K; k++) {
    const len = cur.length - 1;
    const next = new Uint8Array(len);
    for (let s = 0; s < len; s++) next[s] = cur[s + 1] ^ (cur[s] | prev[s]);
    out[k] = next[0];
    prev = cur; cur = next;
  }
  return out;
}

/** Plain evolution of a finite row (white outside), returning column at index `at` for T steps. */
function columnOf(cells, at, T) {
  let cur = Uint8Array.from(cells), nxt = new Uint8Array(cells.length);
  const out = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    out[t] = cur[at];
    for (let i = 0; i < cur.length; i++) {
      const l = i > 0 ? cur[i - 1] : 0, r = i + 1 < cur.length ? cur[i + 1] : 0;
      nxt[i] = l ^ (cur[i] | r);
    }
    [cur, nxt] = [nxt, cur];
  }
  return out;
}

{
  // deterministic PRNG so the run is reproducible
  let seed = 0x5eed | 0;
  const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) & 1; }; // xorshift32
  const cases = [];
  for (let i = 0; i < TRIALS; i++) {
    cases.push([`random #${i}`, Uint8Array.from({ length: T_BIJ + 1 }, rnd), Uint8Array.from({ length: T_BIJ }, rnd)]);
  }
  cases.push(['b = 1^inf, Y white', new Uint8Array(T_BIJ + 1).fill(1), new Uint8Array(T_BIJ)]);
  cases.push(['b = (10)^inf, Y white', Uint8Array.from({ length: T_BIJ + 1 }, (_, i) => 1 - (i % 2)), new Uint8Array(T_BIJ)]);
  cases.push(['b = (1100)^inf, Y random', Uint8Array.from({ length: T_BIJ + 1 }, (_, i) => (i % 4) < 2 ? 1 : 0), Uint8Array.from({ length: T_BIJ }, rnd)]);
  console.log(`\n2. bijection check, depth ${T_BIJ}: build X from (b, Y), evolve, compare column 0 with b`);
  let allOk = true;
  for (const [name, b, Y] of cases) {
    const K = T_BIJ;                       // solve K cells leftward; valid since c(0..K), d(0..K-1) known
    const R = halfLineColumn1(b, Y, T_BIJ + 1);
    const Lz = leftAtTimeZero(b, R, K);
    // assemble X on positions -K .. T_BIJ
    const cells = new Uint8Array(K + 1 + T_BIJ);
    for (let k = 1; k <= K; k++) cells[K - k] = Lz[k];
    cells[K] = b[0];
    for (let i = 0; i < Y.length && i < T_BIJ; i++) cells[K + 1 + i] = Y[i];
    const depth = Math.floor(K / 2);       // column 0 at time t needs X(-t..t); solve only trusted where the half-line is
    const col = columnOf(cells, K, depth);
    let firstBad = -1;
    for (let t = 0; t < depth; t++) if (col[t] !== b[t]) { firstBad = t; break; }
    const nonwhite = Lz.slice(1).reduce((a, v) => a + v, 0);
    console.log(`   ${name.padEnd(26)} column 0 = b to depth ${depth}: ${firstBad < 0 ? 'yes' : 'NO, first difference at t=' + firstBad}; left cells black: ${nonwhite} of ${K}`);
    if (firstBad >= 0) allOk = false;
  }
  console.log(`   ${allOk ? 'every case agrees' : 'SOME CASE FAILED'}`);
}

// --- 3. exact counts ---------------------------------------------------------

{
  console.log(`\n3. windows X(-t..t) per column word c(0..t), t <= ${TMAX}`);
  console.log('    t   windows   words  min/max per word   white-left: words with 0,1,2,3,4+ realisations   unrealised periodic words (p<=t)');
  for (let t = 1; t <= TMAX; t++) {
    const W = 2 * t + 1, nWin = 1 << W, nWord = 1 << (t + 1);
    const count = new Uint32Array(nWord), countWL = new Uint32Array(nWord);
    const cells = new Uint8Array(W);
    for (let w = 0; w < nWin; w++) {
      for (let i = 0; i < W; i++) cells[i] = (w >> i) & 1;   // bit i = position i - t
      const col = columnOf(cells, t, t + 1);
      let word = 0;
      for (let s = 0; s <= t; s++) word |= col[s] << s;
      count[word]++;
      if ((w & ((1 << t) - 1)) === 0) countWL[word]++;         // positions -t..-1 white
    }
    let mn = Infinity, mx = 0;
    for (let i = 0; i < nWord; i++) { mn = Math.min(mn, count[i]); mx = Math.max(mx, count[i]); }
    const hist = [0, 0, 0, 0, 0];
    for (let i = 0; i < nWord; i++) hist[Math.min(countWL[i], 4)]++;
    // periodic words: c(s) = c(s mod p) for some p <= t, not realised by any white-left window
    let unrealisedPeriodic = 0, periodicWords = 0;
    for (let word = 0; word < nWord; word++) {
      let periodic = false;
      for (let p = 1; p <= t && !periodic; p++) {
        let ok = true;
        for (let s = p; s <= t; s++) if (((word >> s) & 1) !== ((word >> (s - p)) & 1)) { ok = false; break; }
        periodic = ok;
      }
      if (periodic) { periodicWords++; if (countWL[word] === 0) unrealisedPeriodic++; }
    }
    console.log(`   ${String(t).padStart(2)} ${String(nWin).padStart(9)} ${String(nWord).padStart(7)}   ${String(mn).padStart(5)}/${String(mx).padEnd(5)} (2^t=${1 << t})   ${hist.join(',').padEnd(30)} ${unrealisedPeriodic} of ${periodicWords}`);
  }
}
