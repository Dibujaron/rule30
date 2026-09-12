/**
 * Rosetta, 2026-09-12 — the null for the one gap the big run showed.
 *
 * At N = 4e6 the centre column's block entropy deficit m - H(m) sat 1-4% ABOVE
 * all three crypto coin draws for every m from 13 to 21 (e.g. m = 14: 3.050e-3
 * against 2.87, 2.92, 2.93e-3). Three draws cannot tell me whether 4% is inside
 * the null's own scatter. This script puts twelve draws around it and reports a
 * z-score, at N = 1e6 where the run is affordable.
 *
 * A larger deficit means MORE repeated windows, i.e. slightly more
 * concentration. If real, it would be the first block statistic separating the
 * centre column from a coin. My notebook says the number I like most is the one
 * to control first, so this runs before anything is written down.
 */

import { centerColumnBits } from './rule30.mjs';
import { randomFillSync } from 'node:crypto';

const N = 1_000_000;
const MS = [10, 12, 14, 16, 18, 20];
const DRAWS = 12;

function log2(x) { return Math.log(x) / Math.LN2; }

function deficit(bits, n, m) {
  const size = 1 << m;
  const counts = new Int32Array(size);
  const mask = size - 1;
  let w = 0;
  for (let i = 0; i < m - 1; i++) w = ((w << 1) | bits[i]) & mask;
  let total = 0;
  for (let i = m - 1; i < n; i++) { w = ((w << 1) | bits[i]) & mask; counts[w]++; total++; }
  let h = 0, support = 0;
  for (let k = 0; k < size; k++) {
    const cnt = counts[k];
    if (cnt === 0) continue;
    support++;
    const p = cnt / total;
    h -= p * log2(p);
  }
  return { def: m - h, support };
}

function coin(n) {
  const bytes = new Uint8Array(Math.ceil(n / 8));
  for (let off = 0; off < bytes.length; off += 65536) randomFillSync(bytes, off, Math.min(65536, bytes.length - off));
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (bytes[i >> 3] >> (i & 7)) & 1;
  return out;
}

const t0 = Date.now();
const c = centerColumnBits(N);
console.log(`# column generated in ${((Date.now() - t0) / 1000).toFixed(0)}s; N = ${N}, ${DRAWS} crypto draws`);

// A second, structurally different sequence with the SAME provenance as the
// column: the column of the picture grown from the configuration {0, 2}, which
// by the shield obstruction has a different column but the same rule. It is a
// second rule-30 column, so if the gap is a property of rule 30 rather than of
// this one orbit, it should show there too.
// The window management is rule30.mjs's `centerColumn` replicated exactly --
// `pad` counts the dead low bits and is what the left edge eats, one per step;
// the first version of this tracked `centre` instead of `pad`, lost the left
// edge at t = 4, and produced a near-constant column (deficit ~ m) that also
// failed the shield check below. See section 4 of the sighting.
function columnOfConfig(n, extra) {
  const PAD = 512, PAD_BIG = 512n, TRIM = 4096;
  const last = n - 1;
  let pad = PAD;
  let centre = PAD_BIG;
  let x = 1n << centre;
  for (const e of extra) x |= 1n << (centre + BigInt(e));
  const out = new Uint8Array(n);
  for (let t = 0; t < n; t++) {
    out[t] = Number((x >> centre) & 1n);
    if (t === last) break;
    x = (x << 1n) ^ (x | (x >> 1n));
    if (--pad === 0) { x <<= PAD_BIG; centre += PAD_BIG; pad = PAD; }
    const gen = t + 1;
    if (gen % TRIM === 0) {
      const radius = last - gen;
      if (radius < gen) {
        const r = BigInt(radius);
        x &= ((1n << (2n * r + 1n)) - 1n) << (centre - r);
        const shift = Number(centre) - radius - PAD;
        if (shift > 0) { x >>= BigInt(shift); centre -= BigInt(shift); pad = PAD; }
      }
    }
  }
  return out;
}

const rows = [];
for (const m of MS) {
  const col = deficit(c, N, m);
  const ds = [], sups = [];
  for (let i = 0; i < DRAWS; i++) { const r = deficit(coin(N), N, m); ds.push(r.def); sups.push(r.support); }
  const mean = ds.reduce((a, b) => a + b, 0) / DRAWS;
  const sd = Math.sqrt(ds.reduce((a, b) => a + (b - mean) ** 2, 0) / (DRAWS - 1));
  const smean = sups.reduce((a, b) => a + b, 0) / DRAWS;
  const ssd = Math.sqrt(sups.reduce((a, b) => a + (b - smean) ** 2, 0) / (DRAWS - 1));
  const above = ds.filter((d) => d >= col.def).length;
  rows.push({ m, col, mean, sd, z: (col.def - mean) / sd, above, smean, ssd });
}

console.log('');
console.log('  m |   column def |    null mean |     null sd |      z |  draws >= col | col support | null support mean (sd)');
for (const r of rows) {
  console.log(
    `${String(r.m).padStart(3)} | ${r.col.def.toExponential(5)} | ${r.mean.toExponential(5)} | ${r.sd.toExponential(4)} | ${r.z.toFixed(2).padStart(6)} | ${String(r.above).padStart(5)} of ${DRAWS} | ${String(r.col.support).padStart(11)} | ${r.smean.toFixed(1)} (${r.ssd.toFixed(1)})`,
  );
}

console.log('');
console.log('# A second rule-30 column, from the configuration {0, 2} (the shield chain:');
console.log('# a DIFFERENT finite configuration, same rule). If the gap is rule 30 rather');
console.log('# than this orbit, it should appear here too.');
const c2 = columnOfConfig(N, [2]);
const c3 = columnOfConfig(N, [3]);
let same = 0, same3 = 0;
for (let i = 0; i < 400; i++) { if (c2[i] === c[i]) same++; if (c3[i] === c[i]) same3++; }
console.log(`#   validation: {0,2} agrees with the seed's column on ${same} of the first 400.`);
console.log(`#   The shield obstruction says a cell at r+2 past an isolated right edge leaves`);
console.log(`#   the column unchanged, so 400 is the right answer -- and it also says r+3 does`);
console.log(`#   NOT, so {0,3} must disagree: it agrees on ${same3} of 400. Both checks are`);
console.log(`#   asymmetric, so a mirrored or mis-padded engine fails them.`);
if (same === 400) console.log('#   {0,2} has the SEED\'S column exactly, so it is not an independent orbit;');
if (same === 400) console.log('#   the independent one is {0,3}, used for the z-scores below.');
for (const m of MS) {
  const r = deficit(c3, N, m);
  const row = rows.find((q) => q.m === m);
  console.log(`   m=${String(m).padStart(2)}: {0,3} def ${r.def.toExponential(5)}, z vs null = ${((r.def - row.mean) / row.sd).toFixed(2)} (seed's z was ${row.z.toFixed(2)})`);
}
console.log(`total ${((Date.now() - t0) / 1000).toFixed(0)}s`);
