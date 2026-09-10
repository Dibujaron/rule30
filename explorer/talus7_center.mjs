/**
 * Talus, 2026-09-10. Prize 2 attack: the centre column engine.
 *
 * Computes the centre column of rule 30 to depth N with a word-packed
 * implementation of the packed-row map  r -> (4r XOR (2r OR r))  truncated to
 * the low bits, which is all the centre column needs: bit b of rowNat t is
 * cell (t, b - t), so centerColumn t = bit t of rowNat t, and bit i of the next
 * row reads only bits i, i-1, i-2 of this one (the low end is autonomous).
 *
 * Writes explorer/talus7_center.bin, one byte per term, so the analysis
 * scripts do not each pay for the evolution.
 *
 * Validated three ways before any large run:
 *   - against the repo's BigInt engine (explorer/rule30.mjs) term by term;
 *   - against A051023's published prefix;
 *   - against the naive per-cell rule-table implementation.
 */

import { writeFileSync } from 'node:fs';
import { centerColumnBits, naiveCenterColumn, A051023_PREFIX } from './rule30.mjs';

const N = 200_000;
const OUT = new URL('./talus7_center.bin', import.meta.url);

/** Centre column to depth n, word-packed low-end row map. */
export function centerPacked(n) {
  const WORDS = ((n + 34) >> 5) + 2;
  const r = new Uint32Array(WORDS);
  r[0] = 1; // rowNat 0 = 1
  const out = new Uint8Array(n);
  for (let t = 0; t < n; t++) {
    out[t] = (r[t >> 5] >>> (t & 31)) & 1;
    // one step, words 0 .. limit
    const limit = Math.min(WORDS - 1, ((t + 3) >> 5) + 1);
    let prev = 0;
    for (let j = 0; j <= limit; j++) {
      const cur = r[j];
      const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      r[j] = (s2 ^ (s1 | cur)) >>> 0;
      prev = cur;
    }
  }
  return out;
}

function check() {
  const D = 4000;
  const mine = centerPacked(D);
  const big = centerColumnBits(D);
  let bad = 0;
  for (let i = 0; i < D; i++) if (mine[i] !== big[i]) bad++;
  const naive = naiveCenterColumn(30, 600);
  let badN = 0;
  for (let i = 0; i < 600; i++) if (mine[i] !== naive[i]) badN++;
  let badO = 0;
  for (let i = 0; i < A051023_PREFIX.length; i++) if (mine[i] !== A051023_PREFIX[i]) badO++;
  console.log(`check vs BigInt engine, ${D} terms: ${bad} mismatches`);
  console.log(`check vs naive rule-table, 600 terms: ${badN} mismatches`);
  console.log(`check vs A051023 prefix, ${A051023_PREFIX.length} terms: ${badO} mismatches`);
  if (bad || badN || badO) throw new Error('engine disagrees');
}

check();
const t0 = Date.now();
const bits = centerPacked(N);
console.log(`generated ${N} terms in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
let count = 0;
for (let i = 0; i < N; i++) count += bits[i];
console.log(`count=${count}  E(N)=${2 * count - N}  density=${(count / N).toFixed(7)}`);
writeFileSync(OUT, bits);
console.log(`wrote ${OUT.pathname}`);
