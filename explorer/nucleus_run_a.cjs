'use strict';
// Run implementation A on the controls (adding machine, Grigorchuk group,
// lamplighter) and then on the rule-30 right-edge automaton.

const L = require('./nucleus_lib.cjs');
const A = require('./nucleus_a.cjs');

function run(name, perm, tr, genStates, cap, expect) {
  const gens = genStates.map(s => L.build(perm, tr, s));
  console.log(`\n=== ${name} ===`);
  console.log('  generators:');
  for (const g of gens) console.log('    ' + L.describe(g));
  const up = A.nucleusUpper(gens, cap, m => console.log(m));
  if (!up.ok) {
    console.log(`  BLOW-UP: |N| exceeded cap ${cap}; sizes by round: ${up.history.join(' -> ')}`);
    return { name, contracting: false, sizes: up.history };
  }
  const cd = A.contractionDepth(up.N);
  const nuc = A.nucleusShrink(up.N);
  console.log(`  stabilised: |N_upper| = ${up.N.size} after ${up.round} rounds; ` +
    `sizes ${up.history.join(' -> ')}`);
  console.log(`  criterion (iii) holds with n = ${cd.n}; all deep sections inside N: ${cd.allInside}`);
  console.log(`  NUCLEUS |N| = ${nuc.size}`);
  for (const g of nuc.values()) console.log('    ' + L.describe(g));
  if (expect !== undefined) console.log(`  expected nucleus size ${expect}: ${nuc.size === expect ? 'MATCH' : 'MISMATCH'}`);
  return { name, contracting: true, nucleus: [...nuc.keys()].sort(), size: nuc.size, n: cd.n, upper: up.N.size };
}

const results = {};

// ---- control 1: binary adding machine (odometer).  a: 0w -> 1w, 1w -> 0 a(w)
// state 0 = a, state 1 = e.   expected nucleus {e, a, a^-1}, size 3.
results.adding = run('adding machine (odometer)', [1, 0], [[1, 0], [1, 1]], [0], 500, 3);

// ---- control 2: Grigorchuk group.  a = swap(e,e); b = (a,c); c = (a,d); d = (e,b)
// states: 0=a 1=b 2=c 3=d 4=e.  expected nucleus {1,a,b,c,d}, size 5.
results.grigorchuk = run('Grigorchuk group',
  [1, 0, 0, 0, 0],
  [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]],
  [0, 1, 2, 3], 500, 5);

// ---- control 3 (negative): lamplighter Z/2 wr Z, known NOT contracting.
// two states with identical sections (l0,l1), one trivial and one swapping.
results.lamplighter = run('lamplighter (negative control)',
  [0, 1], [[0, 1], [0, 1]], [0, 1], 400);

// ---- the object of study: rule 30's right-edge automaton (derived in
// nucleus_derive.cjs).  states (c,r) = (x_i, x_{i+1}), index 2c+r.
const perm4 = [0, 1, 1, 1];
const tr4 = [[0, 2], [0, 2], [1, 3], [1, 3]];
results.rule30 = run('RULE 30 right-edge automaton', perm4, tr4, [0, 1, 2, 3], 4000);

console.log('\n--- summary (implementation A) ---');
for (const k of Object.keys(results)) {
  const r = results[k];
  console.log(`  ${r.name}: ${r.contracting ? `contracting, nucleus size ${r.size}, n=${r.n}, upper=${r.upper}` : 'BLOW-UP: ' + r.sizes.join(' -> ')}`);
}
require('fs').writeFileSync(__dirname + '/nucleus_results_a.json', JSON.stringify(results, null, 2));
