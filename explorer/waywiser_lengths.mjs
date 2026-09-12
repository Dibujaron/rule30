/**
 * The length-set test: is the set of period-doubling depths 2-recognizable?
 *
 *   node explorer/waywiser_lengths.mjs
 *
 * For any regular language L the set of lengths of its words is an ultimately
 * periodic subset of N (project L onto a one-letter alphabet; unary regular
 * languages are ultimately periodic). So if a set S of naturals is
 * 2-recognizable and infinite, and s_1 < s_2 < ... enumerates it, then the
 * bit-lengths |s_n| have eventually bounded gaps, and therefore
 *
 *      limsup s_{n+1} / s_n  <  infinity.
 *
 * (If |s_{n+1}| - |s_n| <= q then s_{n+1} < 2^(|s_n|+q) <= 2^(q+1) s_n.)
 *
 * This is the criterion Cobham's gap theorem does NOT supply for a sparse set:
 * the gap theorem's first branch, "the count in a prefix is O(log n)", is
 * satisfied by any set this sparse, so it says nothing. The length-set argument
 * is what bites.
 *
 * Printed: the bit-length sets and consecutive ratios for rule 30's left-diagonal
 * period-doubling depths and its eventually-white left diagonals, beside four
 * controls whose recognizability is known.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const bits = (n) => BigInt(n).toString(2).length;

function report(name, xs, note) {
  const lens = xs.map(bits);
  const lenGaps = lens.slice(1).map((v, i) => v - lens[i]);
  const ratios = xs.slice(1).map((v, i) => Number(v) / Number(xs[i]));
  console.log(`\n${name}`);
  console.log(`  elements      ${xs.join(', ')}`);
  console.log(`  bit lengths   ${lens.join(', ')}`);
  console.log(`  length gaps   ${lenGaps.join(', ')}`);
  console.log(`  ratios        ${ratios.map((r) => (r < 1000 ? r.toFixed(2) : r.toExponential(2))).join(', ')}`);
  console.log(`  ${note}`);
}

console.log('A 2-recognizable infinite set has bounded consecutive ratios; see the header.');

report(
  'rule 30: left-diagonal period-doubling depths (NKS p.871; 3,8,29,400 reproduced in waywiser_onset.mjs)',
  [3, 8, 29, 400, 87867, 2107985255],
  'ratios grow by four orders of magnitude over six terms: the criterion fails on the measured data.',
);

report(
  'rule 30: eventually-white left diagonals (obstruction 4, explorer/forbit.mjs)',
  [2, 7, 28, 399, 53207, 58286, 87866, 1420878968],
  'not monotone in the ratio, but the limsup over seven ratios is 1.6e4 and rising.',
);

report(
  'control: the powers of two {2^n} (2-recognizable: the language 10*)',
  [1, 2, 4, 8, 16, 32, 64, 128, 256],
  'ratio exactly 2, length gaps exactly 1 - ultimately periodic, as it must be.',
);

report(
  'control: {2^(n^2)} (NOT 2-recognizable; the classical witness)',
  [1, 2, 16, 512, 65536, 33554432],
  'length gaps 1,3,5,7,9 grow: the length set {n^2+1} is not ultimately periodic.',
);

report(
  'control: {n : n = 0 mod 3} (2-recognizable: Presburger)',
  [3, 6, 9, 12, 15, 18, 21, 24],
  'ratio -> 1, length gaps 0 or 1.',
);

report(
  'control: rule 30 right-diagonal period-doubling depths a(n) (obstruction 20, P_k list)',
  [1, 3, 4, 6, 7, 9, 15, 16],
  'ratio -> 1 and the length set hits every length: this criterion does NOT refute a(n).',
);

// Rowland's a(n), the right-diagonal doubling depths, from his published table
// (sources/rowland-2006-local-nested-structure.txt, lines 128-130).
const rowland = [1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36, 37, 39, 41, 43, 48, 49, 51, 54, 55,
  58, 60, 63, 64, 66, 69, 70, 72, 74, 77, 79, 80, 82, 84, 86, 90, 91, 93];
const rGaps = rowland.slice(1).map((v, i) => v - rowland[i]);
console.log('\nRowland a(0..40), the right-diagonal period-doubling depths:');
console.log(`  gaps          ${rGaps.join(', ')}`);
console.log(`  gap range     [${Math.min(...rGaps)}, ${Math.max(...rGaps)}]   liminf gap is finite, so Cobham's gap theorem is satisfied`);
console.log(`  count to N=93 is 41, i.e. linear density ${(41 / 93).toFixed(3)}: the growth dichotomy is satisfied too`);
console.log('  so no criterion available refutes automaticity of a(n) - and 41 terms is all there will');
console.log('  ever be cheaply: Rowland got them "up to row 2^40" (his line 136), i.e. exponential cost per term.');

// The one thing a finite table can honestly say about ultimate periodicity.
console.log('\nWhat six terms can and cannot show:');
const doub = [3, 8, 29, 400, 87867, 2107985255];
const lg = doub.map(bits);
const gaps = lg.slice(1).map((v, i) => v - lg[i]);
console.log(`  the length gaps so far are ${gaps.join(', ')}; an ultimately periodic length set with period q >= ${Math.max(...gaps)}`);
console.log('  is still consistent with every term listed, so the finite table alone refutes nothing.');
console.log('  What refutes it is the growth law: obstruction 7 measures the gap to the next');
console.log('  eventually-white diagonal at 1.000 * 2^L for the current period L, so a(n) ~ 2^(2^(n-1)),');
console.log('  and then the bit lengths are ~2^(n-1) and their gaps double for ever.');
const model = [0, 1, 2, 3, 4, 5, 6, 7].map((n) => 2 ** (2 ** Math.max(n - 1, 0)));
console.log(`  that model gives lengths ${model.map(bits).join(', ')} - gaps ${model.map(bits).slice(1).map((v, i) => v - model.map(bits)[i]).join(', ')}`);
console.log(`  against the measured lengths ${lg.join(', ')}.`);
