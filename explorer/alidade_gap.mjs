/**
 * Does the settled phase forbid any word that the band allows?
 *
 *   node explorer/alidade_gap.mjs
 *
 * explorer/alidade_domain.mjs found all 2^14 words of length 14 in rows of the
 * settled picture but only 32761 of 32768 at length 15, from 7e6 cells -- a
 * shortfall far too large for coupon-collecting at 214 expected occurrences per
 * word. If those seven words are genuinely absent from the settled phase and
 * present in the band, then the two phases have different row languages and a
 * Crutchfield-Hanson domain filter could in principle find the seam. This script
 * samples the settled phase ten times harder, lists the missing words, and looks
 * for each of them in the band.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 60000;
const NMAX = 18;
const BAND_SPAN = 8000;
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 8; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
const spix = (t, x) => sat(t + x, -x);

const seen = [];
for (let n = 1; n <= NMAX; n++) seen.push(new Uint8Array(1 << n));
let cells = 0;
for (let t = 20000; t < T; t += 4) {
  const x1 = -Math.floor(0.55 * t), x0 = -Math.floor(0.95 * t);
  let acc = 0, len = 0;
  for (let x = x0; x <= x1; x++) {
    acc = ((acc << 1) | spix(t, x)) >>> 0; len++; cells++;
    for (let n = 1; n <= NMAX && len >= n; n++) seen[n - 1][acc & ((1 << n) - 1)] = 1;
  }
}
console.log(`settled phase: ${cells} cells sampled (${Date.now() - t0} ms)`);
const missing = [];
for (let n = 1; n <= NMAX; n++) {
  const a = seen[n - 1];
  let k = 0;
  for (let i = 0; i < a.length; i++) k += a[i];
  console.log(`   n = ${String(n).padStart(2)}: ${k} of ${1 << n}${k === (1 << n) ? '  complete' : `  (${(1 << n) - k} missing, ${(cells / (1 << n)).toFixed(0)} expected occurrences each)`}`);
  if (k < (1 << n) && (1 << n) - k <= 40) {
    const ws = [];
    for (let i = 0; i < a.length; i++) if (!a[i]) ws.push(i.toString(2).padStart(n, '0'));
    console.log(`      missing: ${ws.join(' ')}`);
    if (n <= 16) missing.push({ n, ws });
  }
}

// look for the missing words in the band
if (missing.length === 0) { console.log('nothing missing to look for'); }
else {
  const base = centerBitIndex(T);
  const found = new Map();
  for (const { n, ws } of missing) for (const w of ws) found.set(`${n}:${w}`, 0);
  let t = 0, brows = 0;
  for (const row of rows(T)) {
    if (t >= 30000 && t % 5 === 0) {
      const lo = -BAND_SPAN, hi = 0, width = hi - lo + 1;
      const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
      for (const { n, ws } of missing) for (const w of ws) {
        let idx = str.indexOf(w), c = 0;
        while (idx >= 0) { c++; idx = str.indexOf(w, idx + 1); }
        if (c) found.set(`${n}:${w}`, found.get(`${n}:${w}`) + c);
      }
      brows++;
    }
    t++;
  }
  console.log(`\nthose words inside the band (${brows} rows x ${BAND_SPAN + 1} cells ending at the origin):`);
  for (const [k, v] of found) console.log(`   ${k}: ${v} occurrences`);
}
console.log(`(${Date.now() - t0} ms)`);
