'use strict';
// How big does the rigorous nucleus lower bound get, as a function of the
// compute budget?  Every element counted here is provably in any nucleus, so
// each row is a theorem of the form |nucleus| >= K -- and a nucleus that is
// finite of size m would force this loop to stabilise at |F| <= m.

const L = require('./nucleus_lib.cjs');
const { forcedLowerBound } = require('./nucleus_forced.cjs');

const cases = {
  'Grigorchuk (contracting, |N|=5)': { perm: [1, 0, 0, 0, 0], tr: [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]], gens: [0, 1, 2, 3] },
  'lamplighter (not contracting)': { perm: [0, 1], tr: [[0, 1], [0, 1]], gens: [0, 1] },
  'RULE 30 right edge': { perm: [0, 1, 1, 1], tr: [[0, 2], [0, 2], [1, 3], [1, 3]], gens: [0, 1, 2] },
};
const budgets = [5, 15, 45, 135, 405];
for (const [name, c] of Object.entries(cases)) {
  console.log(`\n${name}`);
  const gens = c.gens.map(s => L.build(c.perm, c.tr, s));
  for (const secs of budgets) {
    const r = forcedLowerBound(gens, { seconds: secs });
    console.log(`  budget ${String(secs).padStart(4)}s -> |F| = ${String(r.size).padStart(7)}` +
      `   stabilised: ${r.stabilised}` +
      (r.stabilised ? '   (F IS the nucleus)' : '   (|nucleus| >= ' + r.size + ')'));
    if (r.stabilised) break;
  }
}
