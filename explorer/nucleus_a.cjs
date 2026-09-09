'use strict';
// Nucleus computation, implementation A: exact transducer algebra.
//
// Elements are minimal initial Mealy automata; equality is exact (canonical key).
//
// Criterion used.  If a finite set N of elements satisfies
//   (i)   1 in N and every generator and inverse generator is in N,
//   (ii)  N is closed under taking sections,
//   (iii) there is n such that for all g,h in N and all words |v| >= n,
//         (gh)|_v is in N,
// then the group is contracting with nucleus contained in N.  Proof: for any
// g = s_1...s_k, (s_1...s_k)|_v = s_1|_v . s_2|_{s_1(v)} . ... (each factor in N
// by (ii)), and (iii) collapses a product of k elements of N into N at depth
// (k-1)n.  So a stabilised N is a *proof* of contraction, not merely evidence,
// modulo correctness of this code.

const L = require('./nucleus_lib.cjs');

function sectionClosure(map) {
  const queue = [...map.values()];
  while (queue.length) {
    const g = queue.pop();
    for (const a of [0, 1]) {
      const s = L.section(g, a);
      if (!map.has(s.key)) { map.set(s.key, s); queue.push(s); }
    }
  }
  return map;
}

// Grow a candidate nucleus upward to a fixed point (or blow up past `cap`).
function nucleusUpper(gens, cap, log) {
  const N = new Map();
  N.set(L.ID.key, L.ID);
  for (const g of gens) {
    N.set(g.key, g);
    const gi = L.invert(g);
    N.set(gi.key, gi);
  }
  sectionClosure(N);
  const history = [N.size];
  let round = 0;
  let maxDepth = 0;
  for (;;) {
    round++;
    const before = N.size;
    const elems = [...N.values()];
    for (const g of elems) {
      for (const h of elems) {
        const ds = L.deepSections(L.compose(g, h));
        if (ds.depth > maxDepth) maxDepth = ds.depth;
        for (const e of ds.elems) if (!N.has(e.key)) N.set(e.key, e);
        if (N.size > cap) {
          history.push(N.size);
          return { ok: false, N, history, round, maxDepth };
        }
      }
    }
    sectionClosure(N);
    history.push(N.size);
    if (log) log(`  round ${round}: |N| ${before} -> ${N.size}`);
    if (N.size === before) return { ok: true, N, history, round, maxDepth };
    if (N.size > cap) return { ok: false, N, history, round, maxDepth };
  }
}

// Shrink to the actual nucleus: repeatedly replace N by the deep sections of
// products of its own elements (plus the identity) until it stops shrinking.
function nucleusShrink(N) {
  let cur = new Map(N);
  for (let iter = 0; iter < 50; iter++) {
    const next = new Map();
    next.set(L.ID.key, L.ID);
    const elems = [...cur.values()];
    for (const g of elems) for (const h of elems) {
      for (const e of L.deepSections(L.compose(g, h)).elems) next.set(e.key, e);
    }
    if (next.size === cur.size) return cur;
    cur = next;
  }
  return cur;
}

// Uniform contraction depth: max over pairs of the level from which all
// sections of gh already lie inside N.
function contractionDepth(N) {
  const elems = [...N.values()];
  let n = 0;
  let allInside = true;
  for (const g of elems) for (const h of elems) {
    const ds = L.deepSections(L.compose(g, h));
    if (ds.depth > n) n = ds.depth;
    for (const e of ds.elems) if (!N.has(e.key)) allInside = false;
  }
  return { n, allInside };
}

module.exports = { nucleusUpper, nucleusShrink, contractionDepth, sectionClosure };
