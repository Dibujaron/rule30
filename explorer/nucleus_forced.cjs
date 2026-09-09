'use strict';
// Rigorous lower bound on the nucleus (implementation A machinery).
//
// FACT 1. If G is contracting with nucleus N then for every g in G,
//   deepSections(g) is a subset of N.
//   (Every element of deepSections(g) equals g|_v for words v of unbounded
//    length, because the level-sets of g's minimal transducer are eventually
//    periodic and every state in the cycle recurs at arbitrarily deep levels.)
// FACT 2. G is a group closed under sections, so any product of elements
//   already known to lie in G is again in G.
//
// Hence the following set F is contained in N, exactly:
//   F_0 = {1} union deepSections(s) for each generator s and inverse generator;
//   F_{k+1} = F_k union deepSections(g h) for all g, h in F_k.
// Each F_k is section-closed (a deepSections set is), so |N| >= |F_k| for
// every k.  A stabilised F is the nucleus; an F that keeps growing is a
// growing rigorous lower bound on |N|.

const L = require('./nucleus_lib.cjs');

function forcedLowerBound(gens, { cap = 1e9, seconds = 60, label = '', rounds = 1e9 } = {}) {
  const t0 = Date.now();
  const F = new Map();
  F.set(L.ID.key, L.ID);
  const seed = [];
  for (const g of gens) { seed.push(g, L.invert(g)); }
  for (const g of seed) for (const e of L.deepSections(g).elems) F.set(e.key, e);
  const elems = [...F.values()];
  const history = [F.size];
  let done = 0; // number of elements whose pairs against everything are done
  let stabilised = false;
  for (let r = 0; r < rounds; r++) {
    const before = elems.length;
    // all pairs (i,j) with max(i,j) >= done
    outer:
    for (let i = 0; i < elems.length; i++) {
      for (let j = (i < done ? done : 0); j < elems.length; j++) {
        const p = L.compose(elems[i], elems[j]);
        for (const e of L.deepSections(p).elems) {
          if (!F.has(e.key)) { F.set(e.key, e); elems.push(e); }
        }
        if (F.size > cap || (Date.now() - t0) / 1000 > seconds) break outer;
      }
    }
    done = before;
    history.push(F.size);
    if (F.size === before) { stabilised = true; break; }
    if (F.size > cap || (Date.now() - t0) / 1000 > seconds) break;
  }
  return { F, size: F.size, history, stabilised, secs: (Date.now() - t0) / 1000, label };
}

// Strict rounds: F_{k+1} = F_k union deepSections(gh) over g,h in F_k, with no
// mid-round appending.  Deterministic, so implementations A and B must agree
// set-for-set at every round.  (forcedLowerBound above is the greedy variant --
// it appends during the sweep, which finds a bigger subset of N faster but
// makes "round" implementation-dependent.)
function forcedRounds(gens, rounds) {
  const F = new Map();
  F.set(L.ID.key, L.ID);
  for (const g of gens) for (const x of [g, L.invert(g)])
    for (const e of L.deepSections(x).elems) F.set(e.key, e);
  const history = [F.size];
  for (let r = 0; r < rounds; r++) {
    const elems = [...F.values()];
    const add = new Map(); // dedup as we go; a plain array runs out of heap
    for (const g of elems) for (const h of elems)
      for (const e of L.deepSections(L.compose(g, h)).elems)
        if (!F.has(e.key) && !add.has(e.key)) add.set(e.key, e);
    for (const [k, e] of add) F.set(k, e);
    history.push(F.size);
    if (F.size === elems.length) return { F, history, stabilised: true };
  }
  return { F, history, stabilised: false };
}

module.exports = { forcedLowerBound, forcedRounds };

if (require.main === module) {
  const cases = {
    'adding machine': { perm: [1, 0], tr: [[1, 0], [1, 1]], gens: [0] },
    'Grigorchuk': { perm: [1, 0, 0, 0, 0], tr: [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]], gens: [0, 1, 2, 3] },
    'lamplighter (known NOT contracting)': { perm: [0, 1], tr: [[0, 1], [0, 1]], gens: [0, 1] },
    'RULE 30 right edge': { perm: [0, 1, 1, 1], tr: [[0, 2], [0, 2], [1, 3], [1, 3]], gens: [0, 1, 2, 3] },
  };
  const secs = Number(process.argv[2] || 60);
  for (const [name, c] of Object.entries(cases)) {
    const gens = c.gens.map(s => L.build(c.perm, c.tr, s));
    const r = forcedLowerBound(gens, { seconds: secs, label: name });
    console.log(`\n${name}`);
    console.log(`  forced-set sizes by round: ${r.history.join(' -> ')}`);
    console.log(`  stabilised: ${r.stabilised}   |F| = ${r.size}   (${r.secs.toFixed(1)}s)`);
    console.log(`  => |nucleus| >= ${r.size}${r.stabilised ? '  and F is exactly the nucleus' : '  (still growing when the budget ran out)'}`);
    if (r.stabilised && r.size <= 12) for (const g of r.F.values()) console.log('    ' + L.describe(g));
  }
}
