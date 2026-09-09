/**
 * What the retreats are made of: the band's leftmost block, and the front's
 * own view of the background.
 *
 *   node explorer/rosetta_band.mjs
 *
 * The optimistic front (rosetta_greedy2.mjs) shows that the settled background
 * alone accounts for a speed of 0.50106 -- every one of the remaining 0.25 has
 * to come from the retreats, which are not a function of the background at all.
 * This script looks at the retreats from the inside. At every row it reads the
 * deviation pattern E = picture xor S in a window right of the front and records
 *
 *   b(t)  the length of the leftmost solid block of deviations, starting at F(t);
 *   d(t)  the density of deviations in the first WIN cells right of the front;
 *   r(t)  the next row's move, F(t+1) - F(t) (-1 advance, 0 stay, >0 retreat);
 *
 * and reports the joint law of (b, r), whether r is a function of b, and the
 * front's own view of the background -- the fraction of rows on which the cell
 * left of the front is white, which for the never-retreating front is 0.50106.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF, at } from './settledwords.mjs';

const T = 200000;
const SMALL = 40;
const WIN = 64;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 2 * SMALL + WIN; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const sat = (k, j) => at(S[k], j);

const base = centerBitIndex(T);
const NONE = 0x7fffffff;
let Fp = NONE, bPrev = -1, dPrev = -1;
let whiteAhead = 0, seen = 0;
const joint = new Map();               // "b,r" -> count
const byB = new Map();                 // b -> {n, sumR, retreats}
let sumD = 0, nD = 0, sumDret = 0, nDret = 0;
let t = 0;
for (const row of rows(T)) {
  const lo = t < SMALL ? -t : Math.max(-t, Fp - 2);
  const hi = t < SMALL ? t + SMALL : Math.min(0, lo + WIN + 4);
  const width = hi - lo + 1;
  const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  const bitAt = (x) => str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
  let Fn = NONE, b = 0, dev = 0;
  for (let x = lo; x <= hi; x++) {
    const e = bitAt(x) !== sat(t + x, -x) ? 1 : 0;
    if (e && Fn === NONE) Fn = x;
    if (Fn !== NONE) {
      if (x - Fn < WIN) dev += e;
      if (e && x - Fn === b) b++;
    }
  }
  if (t >= 1 && Fp !== NONE && Fn !== NONE && bPrev > 0) {
    const r = Fn - Fp;
    const key = `${bPrev},${r}`;
    joint.set(key, (joint.get(key) || 0) + 1);
    const rec = byB.get(bPrev) || { n: 0, sumR: 0, retreats: 0 };
    rec.n++; rec.sumR += r; if (r > 0) rec.retreats++;
    byB.set(bPrev, rec);
    if (r === -1) whiteAhead++;
    seen++;
    sumD += dPrev; nD++;
    if (r > 0) { sumDret += dPrev; nDret++; }
  }
  Fp = Fn; bPrev = b; dPrev = dev / WIN;
  t++;
}
console.log(`rows ${T}, window ${WIN} (${Date.now() - t0} ms)`);
console.log(`the front's own view of the background: the cell left of it is white on ${(whiteAhead / seen).toFixed(5)} of rows`);
console.log(`   (the never-retreating front on the same background reads white on 0.50106 -- rosetta_greedy2.mjs)`);
console.log(`mean deviation density in the ${WIN} cells right of the front: ${(sumD / nD).toFixed(4)}; on rows followed by a retreat: ${(sumDret / nDret).toFixed(4)}`);
console.log(`leftmost block length b -> next move r (-1 advance, 0 stay, >0 retreat):`);
for (const [b, rec] of [...byB.entries()].sort((a, b2) => a[0] - b2[0]).slice(0, 10)) {
  const line = [...joint.entries()].filter(([k]) => k.startsWith(`${b},`))
    .map(([k, n]) => [Number(k.split(',')[1]), n]).sort((a, b2) => a[0] - b2[0])
    .map(([r, n]) => `${r}:${(n / rec.n * 100).toFixed(1)}%`).join(' ');
  console.log(`   b = ${String(b).padStart(2)} (${String(rec.n).padStart(6)} rows, retreat on ${(rec.retreats / rec.n * 100).toFixed(1)}%): ${line}`);
}
const retreatRows = [...joint.entries()].filter(([k]) => Number(k.split(',')[1]) > 0);
const rEqB = retreatRows.filter(([k]) => Number(k.split(',')[0]) === Number(k.split(',')[1])).reduce((a, [, n]) => a + n, 0);
const rTot = retreatRows.reduce((a, [, n]) => a + n, 0);
console.log(`retreat rows ${rTot}; of them r = b on ${rEqB} (${(rEqB / rTot * 100).toFixed(1)}%)`);
console.log(`(${Date.now() - t0} ms)`);
