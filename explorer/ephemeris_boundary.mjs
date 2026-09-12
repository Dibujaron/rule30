/**
 * Ephemeris / connect, 2026-09-12.  The automatic analogue of the wall
 * `centerColumn_other_isEventuallyPeriodic_of_center`.
 *
 * Obstruction 9 (Talus) kills the wall's SEQUENCE-LEVEL form with the periodic
 * boundary (10)^inf: X_b, the configuration white at every x >= 1 at time 0
 * with centre column b (crystal 40), has no other eventually periodic column.
 * Every eventually periodic sequence is 2-automatic, so that witness is also an
 * automatic one -- but it is a degenerate automatic sequence, and the natural
 * question is what a GENUINELY aperiodic automatic boundary does.  This script
 * runs X_b for four automatic boundaries and measures whether any other column
 * looks automatic.
 *
 * The instrument is the 2-kernel, not the factor count: a sequence is
 * 2-automatic iff its 2-kernel {n |-> u(2^e n + r)} is finite (Eilenberg), and
 * the number of pairwise distinct kernel elements found is a certified LOWER
 * BOUND on the state count of any DFAO producing it.  No finite computation can
 * prove automaticity or its negation; the numbers below are floors.
 *
 * Engine.  X_b restricted to x >= 0 is a rule 30 evolution of the half-line in
 * which position 0 is OVERWRITTEN by b(t) at every step -- that is exactly
 * `evolveHalfRight` of Rule30/Basic.lean with row 0 white.  Column -1 is then
 * the board's `leftSolve` at k = 1:  col(-1)(t) = b(t+1) XOR (b(t) OR col1(t)).
 *
 * Section A validates both against the seed: feeding the seed's own centre
 * column as b must reproduce the seed's columns 1, 2, 3 and -1 exactly.
 */

const LOG2T = Number(process.env.EPH_LOG2T ?? 18);
const T = 1 << LOG2T;

// ---------------------------------------------------------------------------
// the seed's own picture, naive, for validation
// ---------------------------------------------------------------------------
function naiveSeedColumns(depth, xs) {
  const W = 2 * depth + 3;
  let a = new Uint8Array(W), b = new Uint8Array(W);
  a[depth + 1] = 1;
  const out = xs.map(() => []);
  for (let t = 0; t < depth; t++) {
    xs.forEach((x, i) => out[i].push(a[depth + 1 + x]));
    for (let i = 1; i < W - 1; i++) {
      const n = 4 * a[i - 1] + 2 * a[i] + a[i + 1];
      b[i] = (30 >> n) & 1;
    }
    const tmp = a; a = b; b = tmp;
  }
  return out;
}

// ---------------------------------------------------------------------------
// X_b: bit p of the row is the cell at position p >= 0; position 0 is forced
// to b(t) at every step.  Cells at position > t are white, so the loop only
// touches the words below (t+2)/32.
// ---------------------------------------------------------------------------
function halfRight(b, depth, xs) {
  const NW = ((depth + 96) >> 5) + 2;
  let a = new Uint32Array(NW), n2 = new Uint32Array(NW);
  const out = xs.map(() => new Uint8Array(depth));
  if (b[0]) a[0] = 1;
  for (let t = 0; t < depth; t++) {
    xs.forEach((x, i) => { out[i][t] = (a[x >> 5] >>> (x & 31)) & 1; });
    const w1 = Math.min(NW - 2, ((t + 2) >> 5) + 1);
    for (let w = 0; w <= w1; w++) {
      const cc = a[w];
      const l = (cc << 1) | (w > 0 ? a[w - 1] >>> 31 : 0);
      const r = (cc >>> 1) | (a[w + 1] << 31);
      n2[w] = l ^ (cc | r);
    }
    n2[w1 + 1] = 0;
    // force position 0 to the boundary value
    if (b[t + 1]) n2[0] |= 1; else n2[0] &= ~1;
    const tmp = a; a = n2; n2 = tmp;
  }
  return out;
}

/** column -1 of X_b, by the board's leftSolve at k = 1 */
function colMinusOne(b, col1) {
  const n = col1.length - 1;
  const out = new Uint8Array(n);
  for (let t = 0; t < n; t++) out[t] = (b[t + 1] ^ (b[t] | col1[t])) & 1;
  return out;
}

// ---------------------------------------------------------------------------
// kernel instruments
// ---------------------------------------------------------------------------
/** cumulative distinct 2-kernel elements for e = 0..emax, compared on `prefix` terms */
function kernelProfile(seq, emax, prefix) {
  const seen = new Set();
  const cum = [];
  for (let e = 0; e <= emax; e++) {
    const ke = 1 << e;
    for (let r = 0; r < ke; r++) {
      let s = '';
      for (let n = 0; n < prefix; n++) {
        const i = ke * n + r;
        if (i >= seq.length) return cum;
        s += seq[i];
      }
      seen.add(s);
    }
    cum.push(seen.size);
  }
  return cum;
}

/** largest e <= emax at which all 2^e progressions are pairwise distinct */
function distinctLevels(seq, emax, prefix) {
  let best = 0;
  for (let e = 1; e <= emax; e++) {
    const m = 1 << e;
    if (m * prefix >= seq.length) break;
    const s = new Set();
    for (let r = 0; r < m; r++) {
      let k = '';
      for (let n = 0; n < prefix; n++) k += seq[m * n + r];
      s.add(k);
    }
    if (s.size === m) best = e; else break;
  }
  return best;
}

function factors(seq, n, limit) {
  const seen = new Set();
  let v = 0n; const mask = (1n << BigInt(n)) - 1n;
  const end = Math.min(seq.length, limit);
  for (let i = 0; i < end; i++) {
    v = ((v << 1n) | BigInt(seq[i])) & mask;
    if (i >= n - 1) seen.add(v);
  }
  return seen.size;
}

// ---------------------------------------------------------------------------
console.log('--- A. engine check: b = the seed\'s own centre column must rebuild the seed ---');
{
  const dep = 600;
  const [c0, c1, c2, c3, cm1] = naiveSeedColumns(dep + 2, [0, 1, 2, 3, -1]);
  const b = Uint8Array.from(c0);
  const [h1, h2, h3] = halfRight(b, dep, [1, 2, 3]);
  let bad = 0;
  for (let t = 0; t < dep; t++) {
    if (h1[t] !== c1[t]) bad++;
    if (h2[t] !== c2[t]) bad++;
    if (h3[t] !== c3[t]) bad++;
  }
  console.log(`  X_b columns 1,2,3 vs the seed's, ${3 * dep} cells: ${bad} mismatches`);
  const m1 = colMinusOne(b, h1);
  let bad2 = 0;
  for (let t = 0; t < dep - 1; t++) if (m1[t] !== cm1[t]) bad2++;
  console.log(`  leftSolve column -1 vs the seed's, ${dep - 1} cells: ${bad2} mismatches`);
  // and the kernel instruments against sequences of known state count
  const N = 1 << 16;
  const tm = new Uint8Array(N);
  for (let n = 1; n < N; n++) tm[n] = tm[n >> 1] ^ (n & 1);
  console.log(`  kernel of Thue-Morse, e<=9, prefix 24: [${kernelProfile(tm, 9, 24).join(' ')}]` +
    `  (must saturate at 2); all-distinct up to e = ${distinctLevels(tm, 9, 24)}`);
  const pf = new Uint8Array(N);            // regular paperfolding sequence
  for (let n = 1; n < N; n++) { let m = n; while (m % 2 === 0) m /= 2; pf[n] = ((m % 4) === 1) ? 1 : 0; }
  console.log(`  kernel of paperfolding, e<=9, prefix 24: [${kernelProfile(pf, 9, 24).join(' ')}]` +
    `  (must saturate); all-distinct up to e = ${distinctLevels(pf, 9, 24)}`);
}

// ---------------------------------------------------------------------------
console.log(`\n--- B. X_b for automatic boundaries b, depth 2^${LOG2T} = ${T} ---`);

function boundary(name, f) {
  const b = new Uint8Array(T + 2);
  for (let t = 0; t < T + 2; t++) b[t] = f(t) & 1;
  return { name, b };
}

const N2 = T + 2;
const tmArr = new Uint8Array(N2);
for (let n = 1; n < N2; n++) tmArr[n] = tmArr[n >> 1] ^ (n & 1);

const boundaries = [
  boundary('1^inf  (periodic; obstruction 2 says cols 1,2 go constant)', () => 1),
  boundary('(10)^inf  (periodic; obstruction 9\'s witness)', t => (t + 1) % 2),
  boundary('Thue-Morse  (automatic, aperiodic)', t => tmArr[t]),
  boundary('paperfolding  (automatic, aperiodic)', t => { if (t === 0) return 0; let m = t; while (m % 2 === 0) m /= 2; return (m % 4) === 1 ? 1 : 0; }),
  boundary('period-doubling  (automatic, aperiodic)', t => { let m = t + 1, e = 0; while (m % 2 === 0) { m /= 2; e++; } return e % 2; }),
];

const EMAX = LOG2T - 6;
for (const { name, b } of boundaries) {
  const t1 = Date.now();
  const [c1, c2, c3, c5] = halfRight(b, T, [1, 2, 3, 5]);
  const cm1 = colMinusOne(b, c1);
  console.log(`\n  b = ${name}   (${((Date.now() - t1) / 1000).toFixed(1)} s)`);
  const bSeq = b.subarray(0, T);
  for (const [lbl, seq] of [['b = column  0', bSeq], ['column  1', c1], ['column  2', c2],
  ['column  3', c3], ['column  5', c5], ['column -1', cm1]]) {
    const cum = kernelProfile(seq, EMAX, 24);
    const lev = distinctLevels(seq, EMAX, 24);
    let ones = 0; for (let i = 0; i < seq.length; i++) ones += seq[i];
    console.log(`    ${lbl}  density ${(ones / seq.length).toFixed(4)}  ` +
      `kernel(e<=${EMAX}) ${String(cum[cum.length - 1]).padStart(6)} of ${(1 << (EMAX + 1)) - 1}  ` +
      `all-distinct to e = ${String(lev).padStart(2)} (floor ${1 << lev} states)  ` +
      `p(32) >= ${factors(seq, 32, 1 << 17)}`);
  }
}

// ---------------------------------------------------------------------------
console.log('\n--- C. the seed itself, same instruments, same depth, for comparison ---');
{
  const dep = T;
  const W = 2 * dep + 3;
  // cone-restricted naive is too slow here; reuse the half-line engine with the
  // seed's own centre column as boundary, which section A validated
  const [c0] = (() => {
    // the seed's centre column via the packed row (bit x+t of rowNat t)
    const NWd = ((2 * dep + 64) >> 5) + 2;
    let a = new Uint32Array(NWd), n2 = new Uint32Array(NWd);
    a[dep >> 5] = 1 << (dep & 31);
    const out = new Uint8Array(dep);
    for (let t = 0; t < dep; t++) {
      out[t] = (a[dep >> 5] >>> (dep & 31)) & 1;
      const half = Math.min(t + 1, dep - t) + 1;
      const w0 = Math.max(1, ((dep - half) >> 5) - 1), w1 = Math.min(NWd - 2, ((dep + half) >> 5) + 1);
      for (let w = w0; w <= w1; w++) {
        const cc = a[w];
        const l = (cc << 1) | (a[w - 1] >>> 31);
        const r = (cc >>> 1) | (a[w + 1] << 31);
        n2[w] = l ^ (cc | r);
      }
      n2[w0 - 1] = 0; n2[w1 + 1] = 0;
      const tmp = a; a = n2; n2 = tmp;
    }
    return [out];
  })();
  const b = new Uint8Array(T + 2);
  b.set(c0.subarray(0, Math.min(c0.length, T + 2)));
  const [c1, c2, c3, c5] = halfRight(b, T, [1, 2, 3, 5]);
  const cm1 = colMinusOne(b, c1);
  for (const [lbl, seq] of [['centre column', c0], ['column  1', c1], ['column  2', c2],
  ['column  3', c3], ['column  5', c5], ['column -1', cm1]]) {
    const cum = kernelProfile(seq, EMAX, 24);
    const lev = distinctLevels(seq, EMAX, 24);
    let ones = 0; for (let i = 0; i < seq.length; i++) ones += seq[i];
    console.log(`    ${lbl}  density ${(ones / seq.length).toFixed(4)}  ` +
      `kernel(e<=${EMAX}) ${String(cum[cum.length - 1]).padStart(6)} of ${(1 << (EMAX + 1)) - 1}  ` +
      `all-distinct to e = ${String(lev).padStart(2)} (floor ${1 << lev} states)  ` +
      `p(32) >= ${factors(seq, 32, 1 << 17)}`);
  }
}
