'use strict';
// Diagnostics on the rule-30 right-edge group G = <a,b,c>:
//   a = (a,b) id,  b = (c,b) swap,  c = (a,b) swap.
// (1) activity growth of the automaton;
// (2) state-count spectrum of the forced nucleus subset, round by round;
// (3) a search inside G for the lamplighter automaton pattern
//        X = (X,Y) id,  Y = (X,Y) swap
//     -- a section-closed 2-generated subgroup.  A self-similar subgroup of a
//     contracting group is contracting, so finding a known non-contracting one
//     inside G would settle the question.

const L = require('./nucleus_lib.cjs');
const { forcedRounds } = require('./nucleus_forced.cjs');

const perm4 = [0, 1, 1, 1];
const tr4 = [[0, 2], [0, 2], [1, 3], [1, 3]];
const gens = [0, 1, 2].map(s => L.build(perm4, tr4, s));
const [a, b, c] = [L.build(perm4, tr4, 0), L.build(perm4, tr4, 2), L.build(perm4, tr4, 1)];

// ---- (1) activity: number of level-n sections that are non-trivial
console.log('activity of the rule-30 automaton (states that are non-trivial):');
console.log('  no state of the minimised automaton is the identity:',
  gens.every(g => g.key !== L.ID.key));
console.log('  => every one of the 2^n level-n sections of a generator is non-trivial:');
console.log('     activity alpha_n = 2^n (EXPONENTIAL activity, like the lamplighter;');
console.log('     the adding machine and Grigorchuk automata are bounded, alpha_n = O(1)).');

// ---- (2) state-count spectrum of the forced set
for (const rounds of [1, 2]) {
  const r = forcedRounds(gens, rounds);
  const spectrum = new Map();
  let maxStates = 0;
  for (const g of r.F.values()) {
    spectrum.set(g.perm.length, (spectrum.get(g.perm.length) || 0) + 1);
    if (g.perm.length > maxStates) maxStates = g.perm.length;
  }
  const s = [...spectrum.entries()].sort((x, y) => x[0] - y[0])
    .map(([k, v]) => `${k}st:${v}`).join(' ');
  console.log(`\nforced set after ${rounds} round(s): |F| = ${r.F.size}, max states ${maxStates}`);
  console.log('  state-count spectrum: ' + s);
}

// ---- (3) search G for the lamplighter pattern
// canonical keys of the two lamplighter states
const lampX = L.build([0, 1], [[0, 1], [0, 1]], 0);
const lampY = L.build([0, 1], [[0, 1], [0, 1]], 1);
console.log(`\nsearching G for the lamplighter states  X.key=${lampX.key}  Y.key=${lampY.key}`);
const seeds = [];
for (const g of gens) { seeds.push(g, L.invert(g)); }
const seen = new Map([[L.ID.key, L.ID]]);
let frontier = [L.ID];
let found = null;
const MAXSTATES = 8, CAP = 400000;
for (let len = 1; len <= 14 && !found && seen.size < CAP; len++) {
  const next = [];
  for (const g of frontier) {
    for (const s of seeds) {
      const p = L.compose(g, s);
      if (p.perm.length > MAXSTATES) continue;
      if (seen.has(p.key)) continue;
      seen.set(p.key, p);
      next.push(p);
      if (p.key === lampX.key || p.key === lampY.key) { found = p; break; }
    }
    if (found) break;
    if (seen.size > CAP) break;
  }
  console.log(`  words of length <= ${len}: ${seen.size} distinct elements with <= ${MAXSTATES} states`);
  frontier = next;
  if (!next.length) { console.log('  (search space closed)'); break; }
}
console.log('  lamplighter pattern found in G:', found ? 'YES' : 'no (within the search bounds above)');
