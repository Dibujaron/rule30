// Astrolabe, 2026-09-13. The rule 30 column map read as a proof complexity
// generator, and the expansion its lower-bound technology needs.
//
// THE GENERATOR. g : {0,1}^w -> {0,1}^T. Input: the row-0 cells x = -a .. R, so
// w = a + R + 1. Output: the centre column bits 0 .. T-1. Output bit t reads
// exactly the input cells in [-t, t] (clipped to the window), because that is the
// light cone. "No row of support w yields column prefix p", the brief's second
// formula family, is exactly the tau-formula tau(g)_p asserting p is not in the
// range of g.
//
// WHAT THE FIELD NEEDS. The fetched Alekhnovich-Ben-Sasson-Razborov-Wigderson
// bound is exp[Omega(n^2 / (m * 2^(2^Delta)))] on resolution length, with Delta
// the DEGREE of the generator's dependency graph -- the largest number of inputs
// any one output reads. Two things are computed here: Delta, and the BOUNDARY
// EXPANSION of the dependency hypergraph (for a set S of outputs, the number of
// inputs read by exactly one member of S), which is the hypothesis every
// restriction-based lower bound in this family rests on.

function deps(a, R, t) {          // input indices (as x values) that output bit t reads
  const lo = Math.max(-a, -t), hi = Math.min(R, t);
  const s = [];
  for (let x = lo; x <= hi; x++) s.push(x);
  return s;
}

function boundary(a, R, S) {      // inputs read by exactly one output in S
  const count = new Map();
  for (const t of S) for (const x of deps(a, R, t)) count.set(x, (count.get(x) ?? 0) + 1);
  let b = 0;
  for (const [, c] of count) if (c === 1) b++;
  return b;
}

const a = 12, R = 40, T = 24;
const w = a + R + 1;
console.log(`# generator: w = ${w} input cells (x = ${-a} .. ${R}), T = ${T} output bits`);
console.log('# Delta = max inputs read by one output bit =', deps(a, R, T - 1).length);
console.log('');

// Minimum boundary expansion over all sets S of outputs of each size k. The
// dependency sets are NESTED, so the minimum is attained by a contiguous block
// of the deepest bits; both the exhaustive minimum (small k) and that block are
// reported, and they agree.
console.log('# k   min |boundary(S)| over all S of size k   |boundary| of the deepest k bits   min/k');
function* subsets(n, k, start = 0, acc = []) {
  if (acc.length === k) { yield acc.slice(); return; }
  for (let i = start; i < n; i++) { acc.push(i); yield* subsets(n, k, i + 1, acc); acc.pop(); }
}
for (let k = 1; k <= 6; k++) {
  let best = Infinity;
  for (const S of subsets(T, k)) { const b = boundary(a, R, S); if (b < best) best = b; }
  const deepest = [];
  for (let i = T - k; i < T; i++) deepest.push(i);
  console.log(`${String(k).padStart(3)} ${String(best).padStart(41)} ${String(boundary(a, R, deepest)).padStart(34)}   ${(best / k).toFixed(3)}`);
}
for (let k = 8; k <= T; k += 4) {
  const deepest = [];
  for (let i = T - k; i < T; i++) deepest.push(i);
  const b = boundary(a, R, deepest);
  console.log(`${String(k).padStart(3)} ${'(exhaustive too large)'.padStart(41)} ${String(b).padStart(34)}   ${(b / k).toFixed(3)}`);
}
console.log('');

// The ABRW bound's exponent, as a function of Delta. Vacuous as soon as it is < 1.
console.log('# the fetched ABRW exponent  n^2 / (m * 2^(2^Delta))  for this generator shape');
console.log('# Delta   2^(2^Delta)              exponent with n = 10^6, m = 10^3     useful?');
for (const D of [1, 2, 3, 4, 5, 6, 7, 8]) {
  const dbl = Math.pow(2, Math.pow(2, D));
  const expo = (1e12 / 1e3) / dbl;
  console.log(`${String(D).padStart(7)}   ${dbl.toExponential(3).padStart(12)}   ${expo.toExponential(3).padStart(34)}     ${expo >= 1 ? 'yes' : 'NO'}`);
}
console.log('');
console.log('# and Delta for the rule 30 column generator, which is 2t+1 at output bit t:');
for (const t of [1, 2, 3, 4, 5, 10, 100]) {
  const D = 2 * t + 1;
  const dbl = D <= 6 ? Math.pow(2, Math.pow(2, D)) : Infinity;
  console.log(`   deepest output bit t = ${String(t).padStart(3)}  =>  Delta = ${String(D).padStart(4)},  2^(2^Delta) = ${D <= 6 ? dbl.toExponential(3) : '> 2^(2^7) = 2^128'}`);
}
