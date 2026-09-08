/**
 * The pair graph of the recurrence at period L: why the average gap between
 * white diagonals is 2^L, exactly as an upper bound.
 *
 *   node explorer/meansum.mjs
 *
 * Nodes: pairs (a, b) of words of period dividing L (4^L of them). Edges:
 * (a, b) -> (b, c) with c the periodic solution of the recurrence; unique
 * when b has a black cell, two (complements) when b is white. Every node has
 * at most one predecessor (the recurrence solves backwards: a is a function
 * of (b, c)), so the segments that run from each start (0, w) to the next
 * white pair (., 0) are pairwise disjoint, and the sum of their lengths
 * h(w) over all nonconstant w is at most 4^L: the mean gap from a white to
 * the next is at most 4^L / (2^L - 2), about 2^L. This script checks the
 * in-degree claim by building the graph for L <= 8, sums h(w) exactly for
 * L = 2, 4, 8, 16 against 4^L (16-bit words with a bit-parallel step), and
 * counts the odd- and even-parity words of exact period L (the graph
 * argument predicts odd minus even = 2^(L/2)).
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { stepF, exactPeriod } from './hitting.mjs';

const popcount = (x) => { let n = 0; while (x) { n += x & 1; x >>>= 1; } return n; };

// --- the graph for L <= 8: in-degrees
for (const L of [2, 4, 8]) {
  const N = 2 ** L, mask = N - 1;
  const indeg = new Uint8Array(N * N);
  let edges = 0, twoOut = 0;
  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
    if (b !== 0) { const c = stepF(a, b, L); indeg[b * N + c]++; edges++; }
    else {
      // running xor: w(i+1) = a(i+2) xor w(i); the two solutions are complements; only period-L solutions count (even parity)
      if (popcount(a) & 1) continue;   // period doubles: leaves the period-L system
      let w0 = 0, prev = 0;
      for (let i = 0; i < L; i++) { w0 |= prev << i; prev ^= (a >>> ((i + 2) % L)) & 1; }
      indeg[0 * N + w0]++; indeg[0 * N + ((~w0) & mask)]++; edges += 2; twoOut++;
    }
  }
  let maxIn = 0, zeroIn = 0;
  for (let i = 0; i < N * N; i++) { if (indeg[i] > maxIn) maxIn = indeg[i]; if (indeg[i] === 0) zeroIn++; }
  console.log(`L = ${L}: ${N * N} pairs, ${edges} edges within period L, max in-degree ${maxIn}, nodes with no predecessor ${zeroIn} (entry points from period L/2 and pairs whose predecessor left the system)`);
}

// --- exact sum of h(w) over all nonconstant w, L = 2, 4, 8, 16
function stepFastL(a, b, L) {
  const m = (2 ** L) - 1;
  const d = ((a >>> 1) | ((a & 1) << (L - 1))) & m;         // d(i) = a(i+1)
  let c = d;
  for (let n = 0; n < L + 2; n++) {
    const rl = ((c << 1) | (c >>> (L - 1))) & m;             // rl(i) = c(i-1)
    const nx = (d ^ (b | rl)) & m;
    if (nx === c) return c;
    c = nx;
  }
  throw new Error('no fixed point');
}
for (const L of [2, 4, 8, 16]) {
  const N = 2 ** L;
  let sum = 0, maxH = 0, count = 0;
  const t0 = Date.now();
  for (let w = 1; w < N - 1; w++) {
    let a = 0, b = w, h = 1;
    for (;;) { const c = stepFastL(a, b, L); h++; if (c === 0) break; a = b; b = c; }
    sum += h; count++; if (h > maxH) maxH = h;
  }
  console.log(`L = ${L}: sum of h over ${count} nonconstant words = ${sum} vs 4^L = ${N * N} (${(sum / (N * N) * 100).toFixed(2)} % of all pairs lie on a segment from a white to the next); mean ${(sum / count).toFixed(1)} = ${(sum / count / N).toFixed(3)} * 2^L; max ${maxH} (${Date.now() - t0} ms)`);
}

// --- odd minus even parity among words of exact period L
for (const L of [2, 4, 8, 16]) {
  let odd = 0, even = 0;
  for (let w = 0; w < 2 ** L; w++) if (exactPeriod(w, L) === L) { if (popcount(w) & 1) odd++; else even++; }
  console.log(`L = ${L}: words of exact period L: odd parity ${odd}, even parity ${even}, difference ${odd - even} (2^(L/2) = ${2 ** (L / 2)})`);
}
