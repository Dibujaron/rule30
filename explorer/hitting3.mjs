/**
 * Full hitting times from antiperiodic words: is there a structural floor,
 * or only the geometric law?
 *
 *   node explorer/hitting3.mjs
 *
 * hitting2.mjs found no antiperiodic word of period L = 4..32 whose orbit
 * reaches a white diagonal within 2L + 8 steps, where over all words of
 * period L the floor is 8. Two explanations: a structural floor for the
 * words a doubling produces, or the null model (hitting time geometric with
 * mean 2^L; the L shifts of a word share one hitting time, so there are
 * only 2^(L/2) / L independent classes and the minimum over them is near
 * L * 2^(L/2), far above 2L + 8 at L = 16 and 32). This script runs the
 * antiperiodic words uncapped at L = 8 and 16 and to a cap of 2^18 at
 * L = 32 (2048 classes; the null predicts a minimum near 2^21, so a hit
 * below the cap would be mild evidence against a floor and none is weak
 * evidence for one), and prints the smallest hitting times and the words
 * that achieve them, with the parity of the word before the white.
 * Verdict from the first run (cap 2^20 at L = 32, 22 minutes): the minima
 * 88 and 6343 at L = 8 and 16 are what 2 and 16 geometric samples give;
 * there is no evidence of a floor.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { hitting } from './hitting.mjs';

const popcount = (x) => { let n = 0; while (x) { n += x & 1; x >>>= 1; } return n; };
const bits = (x, L) => { let s = ''; for (let i = 0; i < L; i++) s += (x >>> i) & 1; return s; };
const rotr1 = (x) => ((x >>> 1) | (x << 31)) >>> 0;
const rotl1 = (x) => ((x << 1) | (x >>> 31)) >>> 0;
function stepFast32(a, b) {
  const d = rotr1(a);
  let c = d;
  for (let n = 0; n < 40; n++) { const nx = (d ^ (b | rotl1(c))) >>> 0; if (nx === c) return c; c = nx; }
  throw new Error('no fixed point');
}
function hitting32(w, cap) {
  let a = 0, b = w >>> 0;
  for (let j = 1; j <= cap; j++) { const c = stepFast32(a, b); if (c === 0) return { h: j + 1, u: a }; a = b; b = c; }
  return { h: Infinity, u: -1 };
}

const t0 = Date.now();
for (const L of [8, 16, 32]) {
  const half = L / 2, H = 2 ** half;
  const CAP = L === 32 ? 2 ** 18 : 2 ** 24;   // at L = 32 the null puts the minimum over 2048 classes near 2^21; the cap only looks for a floor
  const res = [];
  for (let lo = 0; lo < H; lo++) {
    const w = (lo | (((~lo) & (H - 1)) << half)) >>> 0;
    const r = L === 32 ? hitting32(w, CAP) : hitting(w, L, CAP);
    res.push({ w, ...r });
  }
  const fin = res.filter((r) => r.h !== Infinity).sort((a, b) => a.h - b.h);
  const mean = fin.reduce((s, r) => s + r.h, 0) / fin.length;
  // the L shifts of a word share its hitting time, so the independent samples are the shift classes, about H / L of them
  const C = H / L;
  console.log(`L = ${L}: ${H} antiperiodic words in about ${C} shift classes, cap ${CAP}: ${fin.length} words finished, min h ${fin.length ? fin[0].h : '-'} (null, ${C} geometric samples of mean 2^L: about ${Math.round(2 ** L / C)}), median ${fin.length ? fin[fin.length >> 1].h : '-'}, mean ${mean.toFixed(0)}, 2^L = ${2 ** L}`);
  const shown = new Set();
  let n = 0;
  for (const r of fin) {
    let canon = r.w; for (let s = 1; s < L; s++) { const rot = (((r.w >>> s) | (r.w << (L - s))) >>> 0) & (L === 32 ? 0xffffffff : (2 ** L) - 1); if (rot < canon) canon = rot; }
    if (shown.has(canon)) continue; shown.add(canon);
    console.log(`   h = ${r.h}: w = ${bits(r.w, L)}, white preceded by u of ${popcount(r.u) & 1 ? 'odd' : 'even'} parity`);
    if (++n >= 6) break;
  }
  // how many below L, 2L, 4L, 8L
  for (const m of [1, 2, 4, 8, 16]) console.log(`   classes with h <= ${m}L = ${m * L}: ${fin.filter((r) => r.h <= m * L).length / L} (null expects ${(C * m * L / 2 ** L).toFixed(3)})`);
  console.log(`   (${Date.now() - t0} ms)`);
}
