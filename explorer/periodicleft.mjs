/**
 * Periodic boundaries against the left half-line: the black-time test.
 *
 *   node explorer/periodicleft.mjs
 *
 * For a configuration white beyond -m on the left with column 0 equal to c,
 * the rule at position 0 reads c(t+1) = L(t) xor (c(t) or R(t)), where L is
 * column -1 and R is column 1. At a black time (c(t) = 1) this forces
 *     c(t+1) = not L(t),
 * and L is column -1 of the half-line x <= -1 started from the left word w
 * and driven by c alone. So a periodic c can be column 0 of a configuration
 * white far to the left only if it passes this test at every black time,
 * for some finite w -- a necessary condition that never looks at the right
 * half. This script runs the test for every periodic pattern of period
 * p <= P_MAX and every left word of length m <= M_MAX, records how deep each
 * survives, and hands any survivor past the threshold to the full right-side
 * search in whiteleft.mjs.
 *
 * Heuristic to compare against: each black time is a fair coin, so the
 * deepest survivor among 2^(p+m) candidates should be near 2(p+m) + m.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { whiteLeftCount } from './whiteleft.mjs';

const P_MAX = 16;
const M_MAX = 4;
const DEPTH_CAP = 4000;         // stop the left test here and call it a survivor
const REPORT_TOP = 3;           // deepest survivors printed per (p, m)

/** First time t at which the black-time test fails for periodic pattern `pat`, left word w; -1 if none before cap. */
function leftTest(pat, w, cap) {
  const p = pat.length;
  const c = (t) => pat[t % p];
  const W = cap + w.length + 2;
  let row = new Uint8Array(W + 2);
  for (let i = 0; i < w.length; i++) row[i + 1] = w[i];
  for (let t = 0; t < cap; t++) {
    const L = row[1];
    if (c(t) === 1 && c(t + 1) !== (1 - L)) return t;
    const cur = row.slice(); cur[0] = c(t);
    // only cells that can be nonwhite matter: k <= t + w.length + 1
    const lim = Math.min(W, t + w.length + 2);
    for (let k = 1; k <= lim; k++) row[k] = cur[k + 1] ^ (cur[k] | cur[k - 1]);
  }
  return -1;
}

const survivors = [];
console.log(`black-time test, periods 1..${P_MAX}, left words up to length ${M_MAX}, cap ${DEPTH_CAP}`);
console.log('   p   m  candidates   deepest failure t   (2(p+m)+m)   #past 2(p+m)+m+16   deepest patterns');
for (let p = 1; p <= P_MAX; p++) {
  for (let m = 0; m <= M_MAX; m++) {
    let deepest = -1, deepestList = [], past = 0;
    const thresh = 2 * (p + m) + m + 16;
    for (let code = 0; code < (1 << p); code++) {
      const pat = Array.from({ length: p }, (_, i) => (code >> i) & 1);
      // skip patterns whose minimal period is smaller (already covered)
      let minimal = true;
      for (let q = 1; q < p && minimal; q++) if (p % q === 0) {
        let ok = true;
        for (let i = q; i < p; i++) if (pat[i] !== pat[i - q]) { ok = false; break; }
        if (ok) minimal = false;
      }
      if (!minimal) continue;
      for (let wc = 0; wc < (1 << m); wc++) {
        const w = Array.from({ length: m }, (_, i) => (wc >> i) & 1);
        const fail = leftTest(pat, w, DEPTH_CAP);
        const depth = fail < 0 ? DEPTH_CAP : fail;
        if (depth > thresh) past++;
        if (depth > deepest) { deepest = depth; deepestList = [[pat.join(''), w.join('')]]; }
        else if (depth === deepest && deepestList.length < REPORT_TOP) deepestList.push([pat.join(''), w.join('')]);
        if (fail < 0) survivors.push({ p, m, pat, w });
      }
    }
    const shown = deepestList.map(([a, b]) => `${a}${b ? '|' + b : ''}`).join(' ');
    console.log(`  ${String(p).padStart(2)}  ${String(m).padStart(2)}  ${String((1 << p) * (1 << m)).padStart(10)}   ${String(deepest).padStart(17)}   ${String(2 * (p + m) + m).padStart(10)}   ${String(past).padStart(18)}   ${shown}`);
  }
}

console.log(`\nsurvivors of the left test to the cap: ${survivors.length}`);
for (const s of survivors.slice(0, 20)) {
  const c = Uint8Array.from({ length: 3002 }, (_, i) => s.pat[i % s.p]);
  const r = whiteLeftCount(c, s.w, 3000);
  console.log(`   p=${s.p} pattern ${s.pat.join('')} w=${s.w.join('') || '(none)'}: right-side search died at ${r.died}, max S_T ${Math.max(...r.counts)}, capped ${r.capped}`);
}
