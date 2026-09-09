/**
 * Does every settled word have exactly half its period black?
 *
 *   node explorer/alidade_density.mjs
 *
 * Every argument in the 2026-09-09 computational-mechanics sighting rests on the
 * settled background being half black, and both that sighting and the percolation
 * one before it only measured an average. The sharper statement -- that the
 * settled word of every left diagonal of period p has exactly p/2 black cells --
 * is either true, in which case it is a hypothesis a theorist can carry into the
 * reachable-set bound, or false, in which case the sighting should say so. This
 * script counts.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { F as solveF } from './settledwords.mjs';

const K = 2000000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
let prev2 = { p: 1, onset: 0, word: Uint8Array.of(1) }, prev1 = { p: 1, onset: 0, word: Uint8Array.of(1) };
const byPeriod = new Map();   // p -> Map(blackCount -> howMany)
let exact = 0, total = 0, ones = 0, cells = 0;
const note = (s) => {
  let b = 0;
  for (let i = 0; i < s.p; i++) b += s.word[i];
  ones += b; cells += s.p;
  let m = byPeriod.get(s.p);
  if (!m) { m = new Map(); byPeriod.set(s.p, m); }
  m.set(b, (m.get(b) || 0) + 1);
  total++;
  if (s.p % 2 === 0 && b * 2 === s.p) exact++;
};
note(prev2); note(prev1);
for (let k = 2; k <= K; k++) {
  const sols = solveF(prev2, prev1);
  let s;
  if (sols.length === 1) s = sols[0];
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); s = sols[BRANCH.get(k)]; }
  note(s);
  prev2 = prev1; prev1 = s;
}
console.log(`settled words for diagonals 0..${K} (${Date.now() - t0} ms)`);
console.log(`overall black density over the periods: ${(ones / cells).toFixed(6)}`);
console.log(`words of even period with exactly half black: ${exact} of ${total}`);
for (const p of [...byPeriod.keys()].sort((a, b) => a - b)) {
  const m = byPeriod.get(p);
  const rows = [...m.entries()].sort((a, b) => a[0] - b[0]).map(([b, n]) => `${b}:${n}`);
  console.log(`   period ${String(p).padStart(2)}: ${[...m.values()].reduce((a, b) => a + b, 0)} words; black-cell counts ${rows.join(' ')}`);
}
console.log(`(${Date.now() - t0} ms)`);
