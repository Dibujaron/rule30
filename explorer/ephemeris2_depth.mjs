/** Ephemeris, 2026-09-12. Earliest depth at which every word of length k occurs
 * in the centre column, for small k -- the depth a kernel `decide` needs. */
import { centerColumnBits } from './rule30.mjs';

const c = centerColumnBits(4000);
for (let k = 1; k <= 10; k++) {
  const seen = new Set();
  let at = -1;
  for (let t = 0; t + k <= c.length; t++) {
    let w = 0;
    for (let j = 0; j < k; j++) w = (w << 1) | c[t + j];
    seen.add(w);
    if (seen.size === 1 << k) { at = t + k; break; }
  }
  console.log(`k=${k}: all ${1 << k} words present once the first ${at} terms are read`);
}
const pre = [];
for (let i = 0; i < 24; i++) pre.push(c[i]);
console.log('prefix: ' + pre.join(''));
let run = 0, best = 0, bestAt = -1;
for (let t = 0; t < 300; t++) {
  if (c[t]) { if (run === 0) var s = t; run++; if (run > best) { best = run; bestAt = s; } } else run = 0;
}
console.log(`longest black run below 300: ${best} starting at ${bestAt}`);
