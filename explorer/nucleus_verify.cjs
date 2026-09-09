'use strict';
// The headline lower bound rests on "distinct states of a minimal transducer
// are distinct tree automorphisms", i.e. on the Moore minimization in
// nucleus_lib.  This checks that claim by a different code path: take the deep
// sections of one element and separate them by DIRECTLY SIMULATING each one on
// a fixed batch of random deep words.  Two elements with different signatures
// are certainly different, so a full set of distinct signatures certifies the
// count from below with no appeal to minimization at all.

const L = require('./nucleus_lib.cjs');
const crypto = require('crypto');

const perm = [0, 1, 1, 1], tr = [[0, 2], [0, 2], [1, 3], [1, 3]];
const gens = [];
for (const s of [0, 1, 2]) { const g = L.build(perm, tr, s); gens.push(g, L.invert(g)); }

let rng = 777777;
const rnd = m => ((rng = (rng * 1103515245 + 12345) & 0x7fffffff) >>> 5) % m;

// fixed batch of random test words, long enough to separate deep elements
const NTEST = 400, TESTLEN = 60;
const tests = [];
for (let i = 0; i < NTEST; i++)
  tests.push(Array.from({ length: TESTLEN }, () => rnd(2)));

for (const len of [4, 8, 12]) {
  let g = L.ID;
  for (let i = 0; i < len; i++) g = L.compose(g, gens[rnd(gens.length)]);
  const ds = L.deepSections(g);
  const sigs = new Set();
  for (const e of ds.elems) {
    const h = crypto.createHash('sha1');
    for (const t of tests) h.update(Buffer.from(L.apply(e, t)));
    sigs.add(h.digest('base64'));
  }
  console.log(`word length ${len}: transducer ${g.perm.length} states; ` +
    `deep sections claimed by minimization: ${ds.elems.length}; ` +
    `distinct signatures under direct simulation (${NTEST} random words of length ${TESTLEN}): ${sigs.size}` +
    `  => ${sigs.size === ds.elems.length ? 'CONFIRMED' : 'MISMATCH'}`);
  console.log(`  (all sections at depth >= ${ds.depth} lie in this set)`);
}
