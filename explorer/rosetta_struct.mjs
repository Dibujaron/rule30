/**
 * Rosetta, 2026-09-13. Four structural measurements around the Katai vantage.
 *
 * [A] THE BRIEF'S 2-ADIC PREMISE, CHECKED RATHER THAN ACCEPTED.
 *     The board's one proved arithmetic in the TIME index is the right-edge
 *     gap: the distance from row t's right edge to the nearest black cell is
 *     min { d : P_d does not divide t } with P_d the right diagonals' minimal
 *     periods, all powers of two -- so it is a function of ord_2(t) alone.
 *     The brief says an odd dilation "preserves that valuation exactly, so odd
 *     dilations should resample the same structure rather than align with it."
 *     Preserving the valuation exactly means g(pn) = g(n) IDENTICALLY for odd
 *     p, which is alignment, not resampling. Measured here both ways.
 *
 * [B] THE ANNEALED HYPOTHESIS. Under the UNIFORM measure on windows of width
 *     2s+1, is the centre cell after s steps correlated with the centre cell of
 *     the window? Left-permutivity predicts exactly zero, for every coordinate
 *     but the leftmost. Exhaustive check, plus the same for rules 90 and 150.
 *
 * [C] THE ENTROPY OF THE CENTRE COLUMN, for the Sarnak-conjecture row: distinct
 *     factors up to length 24 in 10^7 terms.
 *
 * [D] THE INSTRUMENT ON THE BRIEF'S NAMED CONTROL: the left diagonals, which
 *     are eventually periodic and must fail the hypothesis outright.
 *     leftDiagonal k j = bit k of rowNat (j+k), so a fixed k needs only the low
 *     k+1 bits of the row, which are autonomous.
 *
 *   node explorer/rosetta_struct.mjs
 */

import { readFileSync } from 'node:fs';
import { centerBitIndex, rows, naiveStep, ruleTable } from './rule30.mjs';

// ============================================================ [A] right edge
{
  const T = 12000;
  const base = centerBitIndex(T);
  const g = new Int32Array(T + 1);
  let t = 0;
  for (const row of rows(T)) {
    if (t >= 1) {
      // right edge at x = t, i.e. bit base + t; walk inward for the first black
      let d = 1;
      for (; d <= 2 * t; d++) if (((row >> BigInt(base + t - d)) & 1n) === 1n) break;
      g[t] = d;
    }
    t++;
    if (t > T) break;
  }
  const ord2 = (n) => { let v = 0; while ((n & 1) === 0) { n >>= 1; v++; } return v; };
  // is g a function of ord_2(t)?
  const byOrd = new Map();
  let clash = 0;
  for (let n = 1; n <= T; n++) {
    const v = ord2(n);
    if (!byOrd.has(v)) byOrd.set(v, g[n]);
    else if (byOrd.get(v) !== g[n]) clash++;
  }
  const table = [...byOrd.entries()].sort((a, b) => a[0] - b[0]).map(([v, x]) => `v=${v}:${x}`).join(' ');
  console.log(`[A] right-edge gap over t = 1..${T}`);
  console.log(`    g(t) as a function of ord_2(t): ${clash} clashes; table ${table}`);
  // the dilation question
  for (const p of [3, 5, 7, 9, 15, 2, 4, 6]) {
    let same = 0, n = 0;
    for (let m = 1; p * m <= T; m++) { n++; if (g[p * m] === g[m]) same++; }
    console.log(`    g(${p}n) = g(n) for n = 1..${Math.floor(T / p)}: ${same}/${n}`);
  }
  // and does the right-edge gap know anything about the centre column?
  const cbuf = readFileSync(new URL('./talus7_center10m.bin', import.meta.url));
  let s1 = 0, s2 = 0, nn = 0;
  for (let n = 1; n <= T; n++) { const a = 1 - 2 * cbuf[n]; s1 += a * g[n]; s2 += g[n]; nn++; }
  console.log(`    E[a(n) g(n)] = ${(s1 / nn).toFixed(5)}, E[g(n)] = ${(s2 / nn).toFixed(5)}  (decoupled iff the first is ~0)`);
}

// ======================================================== [B] annealed version
{
  console.log(`\n[B] the annealed hypothesis: uniform measure on windows of width 2s+1`);
  for (const rule of [30, 90, 150]) {
    const table = ruleTable(rule);
    const out = [];
    for (let s = 1; s <= 10; s++) {
      const W = 2 * s + 1;
      const total = 1 << W;
      let e0 = 0;          // sum of the output, +-1
      const ej = new Int32Array(W); // sum of output * coordinate j, +-1
      const cells = new Uint8Array(W + 2 * s);
      const next = new Uint8Array(cells.length);
      for (let m = 0; m < total; m++) {
        // window sits in the middle, padded white by s on each side
        cells.fill(0);
        for (let i = 0; i < W; i++) cells[s + i] = (m >> i) & 1;
        let a = cells, b = next;
        for (let step = 0; step < s; step++) { naiveStep(a, table, b); const tmp = a; a = b; b = tmp; }
        const y = 1 - 2 * a[s + s]; // centre of the window = index s+s in the padded array
        e0 += y;
        for (let i = 0; i < W; i++) ej[i] += y * (1 - 2 * ((m >> i) & 1));
      }
      const mx = Math.max(...Array.from(ej).map((v, i) => (i === 0 ? -1 : Math.abs(v))));
      out.push(`s=${s}: E[out]=${(e0 / total).toFixed(3)} E[out*w_left]=${(ej[0] / total).toFixed(3)} E[out*w_centre]=${(ej[s] / total).toFixed(3)} max|E[out*w_j]| over j!=left = ${(mx / total).toFixed(3)}`);
    }
    console.log(`  rule ${rule}:`);
    for (const line of out) console.log(`    ${line}`);
  }
}

// =============================================================== [C] entropy
{
  const cbuf = readFileSync(new URL('./talus7_center10m.bin', import.meta.url));
  const N = cbuf.length;
  const counts = [];
  for (let n = 1; n <= 24; n++) {
    const bits = new Uint8Array(1 << Math.max(0, n - 3));
    let w = 0; const mask = n >= 32 ? -1 : (1 << n) - 1;
    let seen = 0;
    for (let i = 0; i < N; i++) {
      w = ((w << 1) | cbuf[i]) & mask;
      if (i >= n - 1) { const byte = w >> 3, bit = 1 << (w & 7); if (!(bits[byte] & bit)) { bits[byte] |= bit; seen++; } }
    }
    counts.push(seen);
  }
  console.log(`\n[C] distinct factors of the centre column, lengths 1..24 in 10^7 terms:`);
  console.log(`    ${counts.join(' ')}`);
  console.log(`    2^n:  ${counts.map((_, i) => 2 ** (i + 1)).join(' ')}`);
  const n = 24;
  console.log(`    at n = ${n}: ${counts[n - 1]} of ${2 ** n} (${(counts[n - 1] / 2 ** n * 100).toFixed(2)}%), so block entropy per symbol >= ${(Math.log2(counts[n - 1]) / n).toFixed(4)}`);
}

// ========================================== [D] the left diagonals as control
{
  console.log(`\n[D] the brief's named control: left diagonal k, which is eventually periodic`);
  const J = 400_000;
  const PRIMES = [3, 5, 7, 11, 13];
  for (const k of [4, 8, 12, 20, 28, 40]) {
    // bit k of rowNat t, t = 0..J+k ; low bits are autonomous so k+2 words suffice
    const WORDS = (k >> 5) + 3;
    const r = new Uint32Array(WORDS);
    r[0] = 1;
    const d = new Int8Array(J + 1);
    let ones = 0;
    for (let t = 0; t <= J + k; t++) {
      if (t >= k) { const b = (r[k >> 5] >>> (k & 31)) & 1; d[t - k] = 1 - 2 * b; ones += b; }
      let prev = 0;
      for (let j = 0; j < WORDS; j++) {
        const cur = r[j];
        const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
        const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
        r[j] = (s2 ^ (s1 | cur)) >>> 0;
        prev = cur;
      }
    }
    const line = [];
    for (let i = 0; i < PRIMES.length; i++) for (let j = i + 1; j < PRIMES.length; j++) {
      const p = PRIMES[i], q = PRIMES[j];
      const N = Math.floor(J / q);
      let sum = 0;
      for (let n = 1; n <= N; n++) sum += d[p * n] * d[q * n];
      line.push(`(${p},${q})=${(sum / N).toFixed(3)}`);
    }
    console.log(`    k=${String(k).padStart(2)} density ${(ones / (J + 1)).toFixed(4)}  D: ${line.join(' ')}`);
  }
}
