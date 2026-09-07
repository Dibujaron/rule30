/**
 * How many configurations white on x <= -1 share a given column 0?
 *
 *   node explorer/whiteleft.mjs
 *
 * For a column sequence c, count the windows Y = X(1..T) such that the
 * configuration (white on x <= -1, X(0) = c(0), X(1..T) = Y) has column 0
 * equal to c at times 0..T. The count S_T(c) is followed as T grows by a
 * population search: every survivor at depth T is extended by both values
 * of X(T+1) and kept if c(T+1) still comes out right.
 *
 * The left half-line x <= -1 is driven by c alone, so it is shared by all
 * survivors; each survivor carries only its two outermost right diagonals,
 * D_T(s) = cell(s, T-s) and D_{T-1}(s) = cell(s, T-1-s), and the extension
 * by X(T+1) = y is the right-diagonal recurrence
 *     D_{T+1}(0) = y,  D_{T+1}(s+1) = D_{T-1}(s) xor (D_T(s) or D_{T+1}(s)),
 * with D_{T-1}(T) = cell(T, -1) read from the shared left half-line, and
 * D_{T+1}(T+1) = cell(T+1, 0) the new centre cell to compare with c(T+1).
 *
 * An optional left word w (cells -1, -2, ..., -m at time 0) replaces the
 * white left half for the tests of configurations white only beyond -m.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerBitIndex, rows } from './rule30.mjs';

const T_TRUE = 3000;        // depth for the true centre column
const POP_CAP = 200000;     // stop a run when the population exceeds this
const CHECKPOINTS = [10, 20, 50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000];

/** Column -1 of the half-line x <= -1 started from left word w (w[0] = cell -1), driven by c. */
export function halfLineLeftColumn(c, w, T) {
  const W = T + w.length + 2;
  let row = new Uint8Array(W + 2);      // row[k] = cell -k, k >= 1; row[0] is the boundary
  for (let i = 0; i < w.length; i++) row[i + 1] = w[i];
  const L = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    L[t] = row[1];
    const cur = row.slice(); cur[0] = c[t];
    for (let k = 1; k <= W; k++) row[k] = cur[k + 1] ^ (cur[k] | cur[k - 1]);
  }
  return L;
}

/**
 * Population search. Returns {counts, died, capped} where counts[T] = S_T(c)
 * for T = 0..depth (counts[T] is the number of Y(1..T) consistent with c(0..T)).
 */
export function whiteLeftCount(c, w, depth, popCap = POP_CAP, onCheckpoint = null) {
  const Lm1 = halfLineLeftColumn(c, w, depth + 2);
  // state: [Dprev (length T), Dcur (length T+1)] with Dcur[T] = c[T]
  let pop = [[new Uint8Array(0), Uint8Array.of(c[0])]];
  const counts = [1];
  let died = -1, capped = false;
  for (let T = 0; T < depth; T++) {
    const next = [];
    const lm1 = Lm1[T];
    for (const [Dprev, Dcur] of pop) {
      for (let y = 0; y <= 1; y++) {
        const D = new Uint8Array(T + 2);
        D[0] = y;
        for (let s = 0; s < T; s++) D[s + 1] = Dprev[s] ^ (Dcur[s] | D[s]);
        D[T + 1] = lm1 ^ (Dcur[T] | D[T]);           // cell(T+1, 0)
        if (D[T + 1] === c[T + 1]) next.push([Dcur, D]);
      }
    }
    pop = next;
    counts.push(pop.length);
    if (onCheckpoint) onCheckpoint(T + 1, pop.length);
    if (pop.length === 0) { died = T + 1; break; }
    if (pop.length > popCap) { capped = true; break; }
  }
  return { counts, died, capped };
}

const cellAt = (row, gens, off) => Number((row >> BigInt(centerBitIndex(gens) + off)) & 1n);

if (process.argv[1] && process.argv[1].endsWith('whiteleft.mjs')) {
  // --- the true centre column ---
  const c = new Uint8Array(T_TRUE + 2);
  let t = 0;
  for (const row of rows(T_TRUE + 2)) c[t++] = cellAt(row, T_TRUE + 2, 0);

  console.log(`S_T(true centre column), white on x <= -1, to depth ${T_TRUE} (population cap ${POP_CAP}):`);
  let maxPop = 0, maxAt = 0, onesAt = [];
  const { counts, died, capped } = whiteLeftCount(c, [], T_TRUE, POP_CAP, (T, n) => {
    if (n > maxPop) { maxPop = n; maxAt = T; }
    if (n === 1) onesAt.push(T);
    if (CHECKPOINTS.includes(T)) console.log(`   T=${String(T).padStart(6)}  S_T=${n}`);
  });
  console.log(`   max S_T = ${maxPop} at T=${maxAt}; died: ${died}; capped: ${capped}`);
  console.log(`   depths with S_T = 1 (only the seed): ${onesAt.length} of ${counts.length - 1}; last such depth ${onesAt.length ? onesAt[onesAt.length - 1] : 'none'}`);
  const first20 = counts.slice(0, 41).join(' ');
  console.log(`   S_0..S_40: ${first20}`);

  // --- a few random columns and periodic columns, shallow ---
  let seed = 0xbeef | 0;
  const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) & 1; }; // xorshift32
  console.log(`\nS_T for other columns (white on x <= -1):`);
  const cases = [];
  for (let i = 0; i < 6; i++) cases.push([`random #${i}`, Uint8Array.from({ length: 3002 }, rnd)]);
  for (const pat of ['1', '10', '110', '1000', '11010', '1101110011']) {
    cases.push([`periodic (${pat})`, Uint8Array.from({ length: 3002 }, (_, i) => Number(pat[i % pat.length]))]);
  }
  for (const [name, cc] of cases) {
    const r = whiteLeftCount(cc, [], 3000);
    const mx = Math.max(...r.counts);
    console.log(`   ${name.padEnd(26)} died at T=${r.died < 0 ? 'survived ' + (r.counts.length - 1) : r.died}; max S_T=${mx}; counts: ${r.counts.slice(0, 25).join(' ')}${r.counts.length > 25 ? ' ...' : ''}`);
  }
}
