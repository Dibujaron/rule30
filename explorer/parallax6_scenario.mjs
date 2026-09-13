// Parallax, 2026-09-13.  Validate the scenario builder against the board's
// published f(a), then ask the first sheaf-theoretic question: is the family
// of local solution sets a COMPATIBLE family (i.e. locally consistent), or
// does forcing compatibility already empty a context?

import { buildScenario, longestAlternating, enforceCompatibility } from './parallax6_lib.mjs';

console.log('[A] f(a) for the alternating target, relaxed class (max over both phases)');
console.log('    board (obstruction 29/30): 8, 8, 8, 8, 9, 10, 10, 17, 17, 17, 17, 17');
{
  const got = [];
  for (let a = 1; a <= 12; a++) {
    const f = Math.max(longestAlternating({ rule: 30, a, phase: 0, cap: 40 }),
                       longestAlternating({ rule: 30, a, phase: 1, cap: 40 }));
    got.push(f);
  }
  console.log(`    mine                    : ${got.join(', ')}`);
  const want = [8, 8, 8, 8, 9, 10, 10, 17, 17, 17, 17, 17];
  console.log(`    agree on all 12: ${JSON.stringify(got) === JSON.stringify(want)}`);
}

console.log('');
console.log('[B] pinned class (cone edge black at row 0), per phase');
{
  const got = [];
  for (let a = 1; a <= 8; a++) {
    const f = Math.max(longestAlternating({ rule: 30, a, phase: 0, cap: 40, pinEdge: true }),
                       longestAlternating({ rule: 30, a, phase: 1, cap: 40, pinEdge: true }));
    got.push(f);
  }
  console.log(`    mine: ${got.join(', ')}   (Rowan reports 8, 7, 6, 5, 9, ...)`);
}

console.log('');
console.log('[C] f(a) for the control rules');
for (const rule of [120, 90, 150]) {
  const got = [];
  for (let a = 1; a <= 6; a++) {
    const f = Math.max(longestAlternating({ rule, a, phase: 0, cap: 60 }),
                       longestAlternating({ rule, a, phase: 1, cap: 60 }));
    got.push(f >= 60 ? 'cap' : f);
  }
  console.log(`    rule ${rule}: ${got.join(', ')}`);
}

console.log('');
console.log('[D] is the family compatible?  (forcing S(C)|_D = S(C\')|_D to a fixpoint)');
console.log('    a  L      contexts  |S(C)| before -> after    any context emptied?');
for (const a of [1, 2, 3, 4, 5, 6, 7, 8]) {
  const f = Math.max(longestAlternating({ rule: 30, a, phase: 0, cap: 40 }),
                     longestAlternating({ rule: 30, a, phase: 1, cap: 40 }));
  const L = f + 1; // the first unsatisfiable length
  for (const phase of [0, 1]) {
    const sc = buildScenario({ rule: 30, a, L, phase });
    const before = sc.contexts.reduce((s, c) => s + c.S.length, 0);
    const { ctxs, empty, rounds } = enforceCompatibility(sc);
    const after = ctxs.reduce((s, c) => s + c.S.length, 0);
    const minS = Math.min(...ctxs.map((c) => c.S.length));
    console.log(`    ${a}  ${L} p${phase}  ${String(sc.contexts.length).padStart(5)}      ` +
      `${String(before).padStart(5)} -> ${String(after).padStart(5)}   ` +
      `min |S(C)| = ${minS}   emptied: ${empty}   rounds: ${rounds}`);
  }
}
