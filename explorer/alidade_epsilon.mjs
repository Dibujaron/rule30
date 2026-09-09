/**
 * The residual in computational mechanics' own coordinates: where the centre
 * column sits in the complexity-entropy plane.
 *
 *   node explorer/alidade_epsilon.mjs
 *
 * Computational mechanics scores a process by two numbers: the entropy rate h
 * (how much new information each symbol carries) and the statistical complexity
 * C_mu = log2 of the number of causal states (how much of the past the future
 * needs). An eventually periodic sequence of period p sits at h = 0, C_mu =
 * log2 p. A fair coin sits at h = 1, C_mu = 0. The residual -- "the centre
 * column is not eventually periodic" -- is the statement that the centre column
 * is not at h = 0.
 *
 * This script measures h from block entropies, h(n) = H(n) - H(n-1), and
 * counts the distinct causal states at horizon L: two length-L pasts are in the
 * same state when they are followed by the same set of length-F futures. On a
 * single deterministic orbit there is no ensemble and no conditional
 * distribution, so "the same set of futures" is the honest finite surrogate,
 * and it is the same object crystal 21 uses.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerColumnBits } from './rule30.mjs';

const T = 600000;
const t0 = Date.now();
const c = centerColumnBits(T);
console.log(`centre column: ${T} bits (${Date.now() - t0} ms), density of 1s ${(c.reduce((a, b) => a + b, 0) / T).toFixed(6)}`);

/** block entropy H(n) in bits, from the empirical histogram of length-n windows. */
function H(n) {
  const hist = new Map();
  let acc = 0, tot = 0;
  const mask = n >= 31 ? -1 : (1 << n) - 1;
  for (let i = 0; i < T; i++) {
    acc = ((acc << 1) | c[i]) & mask;
    if (i >= n - 1) { hist.set(acc, (hist.get(acc) || 0) + 1); tot++; }
  }
  let h = 0;
  for (const v of hist.values()) { const p = v / tot; h -= p * Math.log2(p); }
  return [h, hist.size];
}
let prev = 0;
console.log(`block entropies of the centre column (a fair coin gives H(n) = n and h(n) = 1):`);
for (let n = 1; n <= 22; n++) {
  const [h, k] = H(n);
  if (n >= 8) console.log(`   n = ${String(n).padStart(2)}: H(n) = ${h.toFixed(4)}, h(n) = H(n) - H(n-1) = ${(h - prev).toFixed(5)}, distinct words ${k} of ${2 ** n}`);
  prev = h;
}

// causal states at horizon L with futures of length F: group the length-L pasts
// that occur by the SET of length-F words that follow them.
for (const [L, F] of [[4, 8], [6, 8], [8, 8], [10, 6], [12, 4]]) {
  const follow = new Map();
  let win = 0;
  for (let j = 0; j < L + F - 1; j++) win = (win << 1) | c[j];
  for (let i = 0; i + L + F <= T; i++) {
    win = ((win << 1) | c[i + L + F - 1]) & ((1 << (L + F)) - 1);
    const p = win >> F, f = win & ((1 << F) - 1);
    let s = follow.get(p);
    if (!s) { s = new Set(); follow.set(p, s); }
    s.add(f);
  }
  const sigs = new Set();
  for (const s of follow.values()) sigs.add([...s].sort((a, b) => a - b).join(','));
  console.log(`causal states: pasts of length ${L} (${follow.size} occur), futures of length ${F}: ${sigs.size} distinct follower sets; every past is followed by all ${2 ** F} futures: ${[...follow.values()].every((s) => s.size === 2 ** F)}`);
}
console.log(`(${Date.now() - t0} ms)`);
