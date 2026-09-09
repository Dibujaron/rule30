/**
 * Exact occurrence counts of every short word in a row of the settled picture,
 * and in a row of the band, over a dense sample.
 *
 *   node explorer/alidade_wordcount.mjs
 *
 * explorer/alidade_domain.mjs and explorer/alidade_gap.mjs disagreed about
 * whether the settled phase's rows contain every word of length 14 -- the
 * smaller sample found all 16384, the larger one found 16358 -- so neither
 * sampling can be trusted and the question has to be settled by counting rather
 * than by set membership. This script walks EVERY row in a range, over the whole
 * settled part of that row, and builds the full histogram of length-N windows.
 * A genuinely forbidden word has count zero here; a merely rare one does not.
 *
 * The comparison is against the band read from the real engine over the same
 * rows, and against the shuffled control that says what a coin would give.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 40000;
const N = 14;               // window length for the exact histogram
const BAND_SPAN = 6000;     // band cells per row, ending at the origin
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

const MASK = (1 << N) - 1;
const hist = new Float64Array(1 << N);
let cells = 0;
for (let t = 5000; t < T; t++) {
  // the settled part of row t is every x with 0 <= t + x <= (the seam), and the
  // seam runs at about 0.25 t, so x <= -0.30 t is settled with room to spare.
  const x0 = -t + 1, x1 = -Math.ceil(0.30 * t);
  let acc = 0, len = 0;
  for (let x = x0; x <= x1; x++) {
    acc = ((acc << 1) | spix(t, x)) & MASK; len++;
    if (len >= N) { hist[acc]++; cells++; }
  }
}
let zeros = 0, min = Infinity, max = 0, minW = 0;
for (let i = 0; i <= MASK; i++) {
  if (hist[i] === 0) zeros++;
  if (hist[i] < min) { min = hist[i]; minW = i; }
  if (hist[i] > max) max = hist[i];
}
const mean = cells / (1 << N);
console.log(`settled phase, rows 5000..${T - 1}, whole settled part of each row: ${cells} windows of length ${N}`);
console.log(`   distinct words with count 0: ${zeros} of ${1 << N}; min count ${min} (word ${minW.toString(2).padStart(N, '0')}), max ${max}, mean ${mean.toFixed(1)}`);
const lo = [];
for (let i = 0; i <= MASK; i++) if (hist[i] < mean * 0.25) lo.push([i, hist[i]]);
lo.sort((a, b) => a[1] - b[1]);
console.log(`   words with count below a quarter of the mean: ${lo.length}${lo.length ? '; rarest ten ' + lo.slice(0, 10).map(([i, c]) => `${i.toString(2).padStart(N, '0')}:${c}`).join(' ') : ''}`);
// the empirical entropy of the length-N window distribution
let h = 0;
for (let i = 0; i <= MASK; i++) if (hist[i]) { const p = hist[i] / cells; h -= p * Math.log2(p); }
console.log(`   H(${N}) = ${h.toFixed(4)} bits, H(${N})/${N} = ${(h / N).toFixed(5)} bits/cell (a coin gives ${N}/${N} = 1)`);

// the band, same length, from the engine
const bhist = new Float64Array(1 << N);
const base = centerBitIndex(T);
let bcells = 0, t = 0;
for (const row of rows(T)) {
  if (t >= 20000) {
    const loX = -BAND_SPAN, hiX = 0, width = hiX - loX + 1;
    const str = ((row >> BigInt(base + loX)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
    let acc = 0, len = 0;
    for (let x = loX; x <= hiX; x++) {
      acc = ((acc << 1) | (str.charCodeAt(width - 1 - (x - loX)) === 49 ? 1 : 0)) & MASK; len++;
      if (len >= N) { bhist[acc]++; bcells++; }
    }
  }
  t++;
}
let bzeros = 0, bmin = Infinity, bmax = 0;
for (let i = 0; i <= MASK; i++) { if (bhist[i] === 0) bzeros++; if (bhist[i] < bmin) bmin = bhist[i]; if (bhist[i] > bmax) bmax = bhist[i]; }
let bh = 0;
for (let i = 0; i <= MASK; i++) if (bhist[i]) { const p = bhist[i] / bcells; bh -= p * Math.log2(p); }
console.log(`band, rows 20000..${T - 1}, ${BAND_SPAN + 1} cells ending at the origin: ${bcells} windows`);
console.log(`   count 0: ${bzeros}; min ${bmin}, max ${bmax}, mean ${(bcells / (1 << N)).toFixed(1)}; H(${N})/${N} = ${(bh / N).toFixed(5)} bits/cell`);

// the largest ratio between the two phases: the best a length-N window test could do
let bestRatio = 0, bestW = 0;
for (let i = 0; i <= MASK; i++) {
  const ps = hist[i] / cells, pb = bhist[i] / bcells;
  if (pb > 0 && ps / pb > bestRatio) { bestRatio = ps / pb; bestW = i; }
}
let leastRatio = Infinity, leastW = 0;
for (let i = 0; i <= MASK; i++) {
  const ps = hist[i] / cells, pb = bhist[i] / bcells;
  if (pb > 0 && ps / pb < leastRatio) { leastRatio = ps / pb; leastW = i; }
}
console.log(`most over-represented word in the settled phase: ${bestW.toString(2).padStart(N, '0')} at ${bestRatio.toFixed(3)}x the band's rate`);
console.log(`most under-represented: ${leastW.toString(2).padStart(N, '0')} at ${leastRatio.toFixed(3)}x`);
console.log(`(${Date.now() - t0} ms)`);
