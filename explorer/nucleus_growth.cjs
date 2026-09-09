'use strict';
// A third, cheaper diagnostic of the same dichotomy, from a different angle.
//
// If G is contracting with nucleus N, then EVERY deep section of EVERY element
// of G lies in N, so the transducers of deep sections have at most
// max_{n in N} (#states of n) states -- a bound independent of the element.
// So: take random products of generators of length l, and record the largest
// deep section seen.  Bounded in l  <=>  consistent with contraction.

const L = require('./nucleus_lib.cjs');

const cases = {
  'adding machine': { perm: [1, 0], tr: [[1, 0], [1, 1]], gens: [0] },
  'Grigorchuk': { perm: [1, 0, 0, 0, 0], tr: [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]], gens: [0, 1, 2, 3] },
  'lamplighter': { perm: [0, 1], tr: [[0, 1], [0, 1]], gens: [0, 1] },
  'RULE 30 right edge': { perm: [0, 1, 1, 1], tr: [[0, 2], [0, 2], [1, 3], [1, 3]], gens: [0, 1, 2] },
};

let rng = 987654321;
const rnd = m => ((rng = (rng * 1103515245 + 12345) & 0x7fffffff) >>> 5) % m;

for (const [name, c] of Object.entries(cases)) {
  const gens = [];
  for (const s of c.gens) { const g = L.build(c.perm, c.tr, s); gens.push(g, L.invert(g)); }
  const row = [];
  const distinct = [];
  for (const len of [1, 2, 3, 4, 6, 8, 10, 12]) {
    let best = 0;
    const seen = new Set();
    for (let trial = 0; trial < 40; trial++) {
      let g = L.ID;
      let abort = false;
      for (let i = 0; i < len; i++) {
        g = L.compose(g, gens[rnd(gens.length)]);
        if (g.perm.length > 3000) { abort = true; break; } // guard: transducer blow-up
      }
      if (abort) continue;
      for (const e of L.deepSections(g).elems) {
        if (e.perm.length > best) best = e.perm.length;
        seen.add(e.key);
      }
    }
    row.push(`l=${len}:${best}`);
    distinct.push(`l=${len}:${seen.size}`);
  }
  console.log(`${name}`);
  console.log(`  largest deep section (states), 200 random words each: ${row.join('  ')}`);
  console.log(`  distinct deep sections seen                         : ${distinct.join('  ')}`);
}
