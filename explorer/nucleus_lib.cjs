'use strict';
// Representation A: initial Mealy automata (transducers) over the alphabet {0,1}.
//
// An element is a tree automorphism of {0,1}* given by a finite state machine:
//   state s acts by   g_s(a . w) = (a XOR perm[s]) . g_{tr[s][a]}(w)
// so perm[s] in {0,1} is the root permutation (0 = identity, 1 = swap) and
// tr[s][a] is the section (restriction) g_s|_a.
//
// Composition convention throughout: (g . h)(w) = g(h(w))  -- h applied first.
// Then  sigma_{gh} = sigma_g o sigma_h  and  (gh)|_a = g|_{sigma_h(a)} . h|_a.

// Minimize (Moore partition refinement) + trim + canonically relabel by BFS.
// Two elements are equal as tree automorphisms iff their canonical keys match.
function build(perm, tr, init) {
  const n = perm.length;
  let cls = perm.slice();
  let num = new Set(cls).size;
  for (;;) {
    const m = new Map();
    const next = new Array(n);
    let c = 0;
    for (let i = 0; i < n; i++) {
      const sig = cls[i] + ':' + cls[tr[i][0]] + ':' + cls[tr[i][1]];
      if (!m.has(sig)) m.set(sig, c++);
      next[i] = m.get(sig);
    }
    cls = next;
    if (c === num) break;
    num = c;
  }
  const rep = new Array(num).fill(-1);
  for (let i = 0; i < n; i++) if (rep[cls[i]] < 0) rep[cls[i]] = i;
  const qperm = rep.map(i => perm[i]);
  const qtr = rep.map(i => [cls[tr[i][0]], cls[tr[i][1]]]);
  const qinit = cls[init];

  const idx = new Map();
  const order = [];
  idx.set(qinit, 0);
  order.push(qinit);
  for (let p = 0; p < order.length; p++) {
    const s = order[p];
    for (const a of [0, 1]) {
      const t = qtr[s][a];
      if (!idx.has(t)) { idx.set(t, order.length); order.push(t); }
    }
  }
  const fperm = order.map(s => qperm[s]);
  const ftr = order.map(s => [idx.get(qtr[s][0]), idx.get(qtr[s][1])]);
  const key = fperm.map((p, i) => `${p}(${ftr[i][0]},${ftr[i][1]})`).join('|');
  return { perm: fperm, tr: ftr, init: 0, key };
}

const ID = build([0], [[0, 0]], 0);

function compose(g, h) { // g after h
  const idx = new Map();
  const order = [];
  idx.set(g.init + ',' + h.init, 0);
  order.push([g.init, h.init]);
  const perm = [], tr = [];
  for (let p = 0; p < order.length; p++) {
    const [i, j] = order[p];
    perm.push(g.perm[i] ^ h.perm[j]);
    const row = [];
    for (const a of [0, 1]) {
      const ni = g.tr[i][a ^ h.perm[j]];
      const nj = h.tr[j][a];
      const k = ni + ',' + nj;
      if (!idx.has(k)) { idx.set(k, order.length); order.push([ni, nj]); }
      row.push(idx.get(k));
    }
    tr.push(row);
  }
  return build(perm, tr, 0);
}

function invert(g) {
  const tr = g.tr.map((row, i) => [row[0 ^ g.perm[i]], row[1 ^ g.perm[i]]]);
  return build(g.perm.slice(), tr, g.init);
}

function section(g, a) { return build(g.perm, g.tr, g.tr[g.init][a]); }

// All sections at depth >= d for the least such d: iterate the set of reachable
// states level by level; the sequence of sets is eventually periodic, and the
// union over its cycle is exactly the set of "deep" sections.
function deepSections(g) {
  const seen = new Map();
  const seq = [];
  let cur = new Set([g.init]);
  for (;;) {
    const k = [...cur].sort((a, b) => a - b).join(',');
    if (seen.has(k)) {
      const start = seen.get(k);
      const union = new Set();
      for (let i = start; i < seq.length; i++) for (const s of seq[i]) union.add(s);
      return { depth: start, elems: [...union].map(s => build(g.perm, g.tr, s)) };
    }
    seen.set(k, seq.length);
    seq.push(cur);
    const nxt = new Set();
    for (const s of cur) { nxt.add(g.tr[s][0]); nxt.add(g.tr[s][1]); }
    cur = nxt;
  }
}

// Apply an element to a finite word (array of bits).
function apply(g, word) {
  let s = g.init;
  const out = [];
  for (const a of word) { out.push(a ^ g.perm[s]); s = g.tr[s][a]; }
  return out;
}

function describe(g) {
  return g.perm.map((p, i) =>
    `s${i} = ${p ? 'swap' : 'id'} (s${g.tr[i][0]}, s${g.tr[i][1]})`).join('; ');
}

module.exports = { build, ID, compose, invert, section, deepSections, apply, describe };
