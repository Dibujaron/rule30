// Parallax, 2026-09-13.  How far is the rung-2 family from having a global
// section?  Every sheaf-theoretic grading of that distance is one of these:
//   - the contextual fraction CF (a linear program).  By Abramsky-Barbosa-
//     Mansfield it is 1 for every strongly contextual model, so it is 1 here
//     at every a and carries no information.  Not computed; it is a theorem.
//   - the DELETION DISTANCE: the least number of contexts that must be removed
//     from the cover before a global section exists.  That is the combinatorial
//     grading the contextual fraction saturates away, it is the MAX-CSP
//     optimum, and it is what Rowan's "two random interior defects repair the
//     alternation about half the time" measures from the random side.
// This script computes the deletion distance EXACTLY, and the exact fraction
// of single contexts whose removal repairs the family.

import { ruleFn } from './parallax6_lib.mjs';

function firstUnsat(rule, a, phase, cap = 30) {
  const R = ruleFn(rule);
  for (let L = 1; L <= cap; L++) if (!sat(R, a, L, phase, null)) return L;
  return null;
}

// satisfiable with at most one freed cell (freed = [t,x] or null)
function sat(R, a, L, phase, freed) {
  const lo = -(a + L), top = L;
  const nFree = a + L - 1;              // row 0 at x in [-a, L-1], x = 0 pinned
  const extra = freed ? 2 : 1;
  for (let m = 0; m < (1 << nFree); m++) {
    for (let e = 0; e < extra; e++) {
      let cur = new Uint8Array(top - lo + 1);
      let bit = 0;
      for (let x = -a; x <= L - 1; x++) {
        const v = (x === 0) ? phase % 2 : (m >> bit) & 1;
        if (x !== 0) bit++;
        cur[x - lo] = v;
      }
      let ok = true;
      for (let t = 0; t < L; t++) {
        if (freed && freed[0] === t) cur[freed[1] - lo] = e;
        if (cur[0 - lo] !== (t + phase) % 2) { ok = false; break; }
        const next = new Uint8Array(cur.length);
        for (let x = lo + 1; x < top; x++) next[x - lo] = R(cur[x - 1 - lo], cur[x - lo], cur[x + 1 - lo]);
        cur = next;
      }
      if (ok) return true;
    }
  }
  return false;
}

console.log('[A] deletion distance of the rung-2 family at its first UNSAT length');
console.log('    a   L   contexts   single deletions that repair   deletion distance');
for (const rule of [30, 120]) {
  console.log(`  rule ${rule}:`);
  for (let a = 1; a <= 5; a++) {
    const R = ruleFn(rule);
    let L = null, phase = 0;
    for (const p of [0, 1]) { const k = firstUnsat(rule, a, p); if (k !== null && (L === null || k > L)) { L = k; phase = p; } }
    if (L === null) { console.log(`    ${a}   -   family satisfiable at every L <= 30`); continue; }
    // contexts: one per cell (t+1,x) inside the triangle
    const XL = (t) => -(a + t), XR = (t) => L - 1 - t;
    let total = 0, repair = 0;
    for (let t = 0; t + 1 < L; t++)
      for (let x = XL(t + 1); x <= XR(t + 1); x++) {
        total++;
        if (sat(R, a, L, phase, [t + 1, x])) repair++;
      }
    console.log(`    ${a}   ${String(L).padStart(2)}   ${String(total).padStart(5)}      ` +
      `${String(repair).padStart(5)}  (${(100 * repair / total).toFixed(1)}%)             ` +
      `${repair > 0 ? 1 : '>1'}`);
  }
}
