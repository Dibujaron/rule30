'use strict';
// Largest rigorous lower bound on |nucleus|, from a SINGLE group element.
//
// In a MINIMAL transducer distinct states are distinct tree automorphisms.  So
// for one element g, the number of states lying in the eventually-periodic part
// of its level-set iteration is exactly the number of distinct deep sections of
// g -- and every one of them must lie in the nucleus.  No cross-element
// deduplication and no sub-transducer copies are needed, so this scales.

const L = require('./nucleus_lib.cjs');

function deepCount(g) { // number of distinct deep sections of g
  const seen = new Map(); const seq = [];
  let cur = new Set([g.init]);
  for (; ;) {
    const k = [...cur].sort((a, b) => a - b).join(',');
    if (seen.has(k)) {
      const start = seen.get(k);
      const u = new Set();
      for (let i = start; i < seq.length; i++) for (const s of seq[i]) u.add(s);
      return u.size;
    }
    seen.set(k, seq.length); seq.push(cur);
    const n = new Set();
    for (const s of cur) { n.add(g.tr[s][0]); n.add(g.tr[s][1]); }
    cur = n;
  }
}

const cases = {
  'adding machine (contracting, |N|=3)': { perm: [1, 0], tr: [[1, 0], [1, 1]], gens: [0] },
  'Grigorchuk (contracting, |N|=5)': { perm: [1, 0, 0, 0, 0], tr: [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]], gens: [0, 1, 2, 3] },
  'lamplighter (not contracting)': { perm: [0, 1], tr: [[0, 1], [0, 1]], gens: [0, 1] },
  'RULE 30 right edge': { perm: [0, 1, 1, 1], tr: [[0, 2], [0, 2], [1, 3], [1, 3]], gens: [0, 1, 2] },
};
let rng = 20260908;
const rnd = m => ((rng = (rng * 1103515245 + 12345) & 0x7fffffff) >>> 5) % m;
const LENS = [4, 8, 12, 16, 18, 20];
const TRIALS = 12;
const GUARD = Number(process.argv[2] || 300000); // abandon a word whose minimal transducer exceeds this

console.log('best (over 12 random words of each length) number of distinct DEEP SECTIONS');
console.log('of a single element -- each one is provably in the nucleus\n');
for (const [name, c] of Object.entries(cases)) {
  const gens = [];
  for (const s of c.gens) { const g = L.build(c.perm, c.tr, s); gens.push(g, L.invert(g)); }
  const row = [];
  let best = 0;
  for (const len of LENS) {
    let bl = 0, bstates = 0;
    for (let t = 0; t < TRIALS; t++) {
      let g = L.ID, abort = false;
      for (let i = 0; i < len; i++) {
        g = L.compose(g, gens[rnd(gens.length)]);
        if (g.perm.length > GUARD) { abort = true; break; }
      }
      if (abort) continue;
      const d = deepCount(g);
      if (d > bl) { bl = d; bstates = g.perm.length; }
    }
    row.push(`len ${String(len).padStart(2)}: ${String(bl).padStart(7)} deep sections (transducer ${bstates} states)`);
    if (bl > best) best = bl;
  }
  console.log(name);
  for (const r of row) console.log('  ' + r);
  console.log(`  => |nucleus| >= ${best}\n`);
}
