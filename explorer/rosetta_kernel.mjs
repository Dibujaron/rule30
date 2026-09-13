/**
 * Rosetta, 2026-09-13. Pricing my own next vantage before handing it on.
 *
 * The 2-kernel of a sequence u is { n -> u(2^i n + r) : i >= 0, 0 <= r < 2^i }.
 * u is 2-AUTOMATIC iff that set is FINITE (Eilenberg); u is 2-REGULAR over F_2
 * iff the F_2-span of that set is FINITELY GENERATED. The board has excluded the
 * first (crystal 73). The second is strictly weaker and nobody here has looked.
 *
 * This computes the F_2-rank of the span of all kernel elements of level <= L,
 * each truncated to T terms, and watches whether it saturates. Saturation is
 * evidence of regularity; rank tracking the number of kernel elements is
 * evidence against it. Neither is a proof -- truncation can only ever give an
 * upper bound on the rank of the untruncated span, so a rank that saturates
 * because T is too small is the failure mode, and the T-sweep below is the guard.
 *
 * Controls: Thue-Morse (2-automatic, kernel of size 2, so rank 2) and a
 * crypto coin (rank should be min(rows, T)).
 *
 *   node explorer/rosetta_kernel.mjs
 */
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

/** F_2 rank of rows given as arrays of Uint32 words, T bits each. */
function rank(rows, T) {
  const W = (T + 31) >> 5;
  const pivots = [];        // [pivotBit, row]
  let r = 0;
  for (const row0 of rows) {
    const row = row0.slice();
    for (const [pb, pr] of pivots) {
      if ((row[pb >> 5] >>> (pb & 31)) & 1) for (let w = 0; w < W; w++) row[w] ^= pr[w];
    }
    let lead = -1;
    for (let w = 0; w < W && lead < 0; w++) if (row[w]) { lead = (w << 5) + (31 - Math.clz32(row[w] & -row[w])); }
    if (lead >= 0) { pivots.push([lead, row]); r++; }
  }
  return r;
}

/** kernel elements of level <= L, truncated to T terms, as packed rows. */
function kernelRows(bits, L, T) {
  const out = [];
  for (let i = 0; i <= L; i++) {
    const step = 1 << i;
    for (let rr = 0; rr < step; rr++) {
      const W = (T + 31) >> 5;
      const row = new Uint32Array(W);
      for (let n = 0; n < T; n++) {
        const idx = step * n + rr;
        if (idx >= bits.length) throw new Error('sequence too short');
        if (bits[idx]) row[n >> 5] |= (1 << (n & 31));
      }
      out.push(row);
    }
  }
  return out;
}

function study(label, bits) {
  console.log(`\n${label}`);
  for (const T of [256, 1024, 4096]) {
    const line = [];
    for (const L of [2, 4, 6, 8, 10]) {
      const rows = kernelRows(bits, L, T);
      line.push(`L=${L}: ${rows.length} elems, rank ${rank(rows, T)}`);
    }
    console.log(`   T=${String(T).padStart(4)}  ${line.join('  |  ')}`);
  }
}

const cbuf = readFileSync(new URL('./talus7_center10m.bin', import.meta.url));
study('rule 30 centre column', cbuf);

{
  const N = 1 << 23;
  const tm = new Uint8Array(N);
  for (let i = 1; i < N; i++) tm[i] = tm[i >> 1] ^ (i & 1);
  study('Thue-Morse (2-automatic: 2-kernel has 2 elements)', tm);
}
{
  const N = 1 << 23;
  const b = new Uint8Array(N);
  const CH = 1 << 20;
  for (let off = 0; off < N; off += CH) { const r = randomBytes(CH); for (let i = 0; i < CH; i++) b[off + i] = r[i] & 1; }
  study('fair coin (node:crypto)', b);
}
