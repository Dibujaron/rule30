/**
 * Talus, 2026-09-10. The deep run: centre column to 10^7 terms.
 *
 * Same engine as talus7_center.mjs (validated there against the repo's BigInt
 * engine, the naive rule-table implementation and A051023's prefix); this file
 * only changes the depth and the output name. Cost is quadratic, about half an
 * hour at this depth.
 *
 * Writes explorer/talus7_center10m.bin and prints, as it goes, the running
 * excess E(N) = 2*count(N) - N together with the running minimum and maximum
 * of E and the first N at which E is negative, so the survival or death of
 * "E(N) >= 0" is settled by the generating run itself and not by a later pass.
 */

import { writeFileSync } from 'node:fs';

const N = 10_000_000;
const OUT = new URL('./talus7_center10m.bin', import.meta.url);

const WORDS = (N >> 5) + 3;
const r = new Uint32Array(WORDS);
r[0] = 1;
const out = new Uint8Array(N);

let excess = 0;
let minE = 0;
let minAt = 0;
let maxE = 0;
let maxAt = 0;
let firstNeg = -1;
const t0 = Date.now();

for (let t = 0; t < N; t++) {
  const bit = (r[t >> 5] >>> (t & 31)) & 1;
  out[t] = bit;
  excess += bit ? 1 : -1; // E(t+1)
  if (excess < minE) { minE = excess; minAt = t + 1; }
  if (excess > maxE) { maxE = excess; maxAt = t + 1; }
  if (firstNeg < 0 && excess < 0) firstNeg = t + 1;
  if ((t & 0xfffff) === 0xfffff) {
    console.log(
      `t=${t + 1} E=${excess} min=${minE}@${minAt} max=${maxE}@${maxAt} ` +
      `E/sqrtN=${(excess / Math.sqrt(t + 1)).toFixed(3)} ` +
      `${((Date.now() - t0) / 1000).toFixed(0)}s`,
    );
  }
  const limit = Math.min(WORDS - 1, (t >> 4) + 1);
  let prev = 0;
  for (let j = 0; j <= limit; j++) {
    const cur = r[j];
    const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
    r[j] = (s2 ^ (s1 | cur)) >>> 0;
    prev = cur;
  }
}

console.log(`FINAL N=${N} E=${excess} min=${minE}@${minAt} max=${maxE}@${maxAt} firstNeg=${firstNeg}`);
writeFileSync(OUT, out);
console.log('wrote talus7_center10m.bin');
