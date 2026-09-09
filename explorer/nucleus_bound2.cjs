'use strict';
// A cheaper sweep for the same rigorous lower bound.  Instead of all pairs from
// F (quadratic), multiply each known forced element by the generators only:
//   F <- F union deepSections(g s) union deepSections(s g)  for g in F, s in S.
// Every element found is still a deep section of an element of G, hence in any
// nucleus, so |N| >= |F| remains a theorem; and a finite nucleus of size m would
// force this BFS to close with |F| <= m.

const L = require('./nucleus_lib.cjs');

function sweep(perm, tr, gs, seconds, cap) {
  const S = [];
  for (const s of gs) { const g = L.build(perm, tr, s); S.push(g, L.invert(g)); }
  const F = new Map([[L.ID.key, L.ID]]);
  const queue = [];
  for (const s of S) for (const e of L.deepSections(s).elems)
    if (!F.has(e.key)) { F.set(e.key, e); queue.push(e); }
  const t0 = Date.now();
  let head = 0, closed = true, marks = [];
  let nextMark = 1;
  while (head < queue.length) {
    const g = queue[head++];
    for (const s of S) {
      for (const p of [L.compose(g, s), L.compose(s, g)]) {
        if (p.perm.length > cap) continue;
        for (const e of L.deepSections(p).elems)
          if (!F.has(e.key)) { F.set(e.key, e); queue.push(e); }
      }
    }
    const el = (Date.now() - t0) / 1000;
    if (el > nextMark) { marks.push(`${nextMark}s:${F.size}`); nextMark *= 3; }
    if (el > seconds) { closed = false; break; }
  }
  return { size: F.size, closed, marks, processed: head, queued: queue.length };
}

const cases = {
  'adding machine': { perm: [1, 0], tr: [[1, 0], [1, 1]], gens: [0] },
  'Grigorchuk': { perm: [1, 0, 0, 0, 0], tr: [[4, 4], [0, 2], [0, 3], [4, 1], [4, 4]], gens: [0, 1, 2, 3] },
  'lamplighter (not contracting)': { perm: [0, 1], tr: [[0, 1], [0, 1]], gens: [0, 1] },
  'RULE 30 right edge': { perm: [0, 1, 1, 1], tr: [[0, 2], [0, 2], [1, 3], [1, 3]], gens: [0, 1, 2] },
};
const secs = Number(process.argv[2] || 120);
const cap = Number(process.argv[3] || 4000);
console.log(`generator sweep, ${secs}s budget each, skipping products whose minimal transducer exceeds ${cap} states\n`);
for (const [name, c] of Object.entries(cases)) {
  const r = sweep(c.perm, c.tr, c.gens, secs, cap);
  console.log(name);
  console.log(`  |F| = ${r.size}   closed: ${r.closed}   (processed ${r.processed} of ${r.queued} queued)`);
  console.log(`  |F| over time: ${r.marks.join('  ')}`);
  console.log(`  => ${r.closed ? 'F is a section-closed forced set that CLOSED: nucleus has at least these ' + r.size
    : '|nucleus| >= ' + r.size + ', still growing'}`);
}
