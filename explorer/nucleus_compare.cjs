'use strict';
// Cross-check implementation A (transducer algebra, exact equality) against
// implementation B (words + wreath-recursion sections, equality by simulating
// the action on all words of length D).  Both run the SAME strict-round
// recursion  F_{k+1} = F_k u deepSections(gh) for g,h in F_k, so they must
// produce identical sets of tree automorphisms round by round.

const L = require('./nucleus_lib.cjs');
const { forcedRounds } = require('./nucleus_forced.cjs');
const B = require('./nucleus_b.cjs');

const D = Number(process.env.DEPTH || 12);

function keyA(g) { // depth-D action key of a transducer element, via A's apply
  const n = 1 << D;
  const img = new Uint32Array(n);
  const bits = new Array(D);
  for (let x = 0; x < n; x++) {
    for (let i = 0; i < D; i++) bits[i] = (x >> (D - 1 - i)) & 1;
    const out = L.apply(g, bits);
    let y = 0;
    for (let i = 0; i < D; i++) y = (y << 1) | out[i];
    img[x] = y;
  }
  return Buffer.from(img.buffer).toString('base64');
}

const cases = {
  'adding machine': { perm: [1, 0], tr: [[1, 0], [1, 1]], gens: [0], rounds: 3 },
  'Grigorchuk': { perm: [1, 0, 0, 0, 0], tr: [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]], gens: [0, 1, 2, 3], rounds: 3 },
  'lamplighter': { perm: [0, 1], tr: [[0, 1], [0, 1]], gens: [0, 1], rounds: 2 },
  'RULE 30 right edge': { perm: [0, 1, 1, 1], tr: [[0, 2], [0, 2], [1, 3], [1, 3]], gens: [0, 1, 2, 3], rounds: 2 },
};

console.log(`cross-check at tree depth D = ${D} (B decides equality by the action on all ${1 << D} words of that length)\n`);
let allAgree = true;
for (const [name, c] of Object.entries(cases)) {
  const t0 = Date.now();
  const gens = c.gens.map(s => L.build(c.perm, c.tr, s));
  const ra = forcedRounds(gens, c.rounds);
  const rb = B.forcedRoundsB(c.perm, c.tr, c.gens, { D, rounds: c.rounds });

  const setA = new Set();
  let collision = 0;
  for (const g of ra.F.values()) { const k = keyA(g); if (setA.has(k)) collision++; setA.add(k); }
  const setB = new Set(rb.F.keys());
  const onlyA = [...setA].filter(k => !setB.has(k)).length;
  const onlyB = [...setB].filter(k => !setA.has(k)).length;
  const agree = onlyA === 0 && onlyB === 0 && collision === 0 &&
    ra.history.join() === rb.history.join();
  if (!agree) allAgree = false;
  console.log(`${name}   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  console.log(`  A |F_k| by round: ${ra.history.join(' -> ')}   (stabilised: ${ra.stabilised})`);
  console.log(`  B |F_k| by round: ${rb.history.join(' -> ')}   (stabilised: ${rb.stabilised})`);
  console.log(`  distinct A-elements that collapse at depth ${D}: ${collision}` +
    `   in A only: ${onlyA}   in B only: ${onlyB}   => ${agree ? 'AGREE' : 'DISAGREE'}`);
}
console.log(`\nall cases agree: ${allAgree}`);
