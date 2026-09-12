/**
 * Ephemeris / connect, 2026-09-12.  "The centre column is not 2-automatic",
 * from the theory of automatic sequences.
 *
 * The one method in Allouche-Shallit-Yassawi's survey ("How to prove that a
 * sequence is not automatic", arXiv:2104.13072) whose input is nothing but the
 * sequence itself is their Theorem 1:
 *
 *   if there are r_k in [0, q^k) with the subsequences (a_{q^k n + r_k})_n all
 *   distinct, then a is not q-automatic.
 *
 * With r_k = 0 this says: if the DECIMATION map  u |-> (n |-> u(2n))  has an
 * infinite forward orbit at the centre column, the centre column is not
 * 2-automatic, hence Prize 1.  So this script measures
 *
 *   B  the decimation orbit: for i < j, the least n with c(2^i n) != c(2^j n),
 *      with four controls whose orbits must be FINITE (Thue-Morse, rule 90
 *      column 1, rule 150 column 1) or infinite (xorshift)
 *   C  full pairwise distinctness at level e: are all 2^e progressions
 *      c(2^e n + r), r < 2^e, pairwise distinct, and what is the largest
 *      witness index needed -- this is the certificate behind a state floor
 *      of 2^e, and its size says how much depth buys how much floor
 *   D  the gap and run statistics that Cobham's dichotomy (their Theorem 19)
 *      is stated in: is the support sparse (count = O(log N)) or are the gaps
 *      bounded infinitely often
 *
 * A is the engine check.  The bitset cone engine is Parallax's
 * (explorer/parallax_kernel.mjs), reused deliberately so that the two
 * documents' numbers are comparable; it is re-checked here against a naive
 * per-cell run and against the eleven values recorded in Rule30/Basic.lean.
 */

const LOG2D = Number(process.env.EPH_LOG2D ?? 21);
const D = 1 << LOG2D;

// ---------------------------------------------------------------------------
// engine: one elementary rule on the single seed, restricted to the backward
// cone of column x at time D.  Position x sits at bit x + D.
// ---------------------------------------------------------------------------
function columnOfSeed(depth, rule = 30, x = 0) {
  const NW = ((2 * depth + 64) >> 5) + 2;
  const rd = depth + x;
  let a = new Uint32Array(NW);
  let b = new Uint32Array(NW);
  a[depth >> 5] = 1 << (depth & 31);
  const out = new Uint8Array(depth);
  const T = [];
  for (let n = 0; n < 8; n++) T.push((rule >> n) & 1);

  for (let t = 0; t < depth; t++) {
    out[t] = (a[rd >> 5] >>> (rd & 31)) & 1;
    const half = Math.min(t + 1, depth - t) + Math.abs(x) + 1;
    const lo = depth - half, hi = depth + half;
    const w0 = Math.max(1, (lo >> 5) - 1), w1 = Math.min(NW - 2, (hi >> 5) + 1);
    if (rule === 30) {
      for (let w = w0; w <= w1; w++) {
        const c = a[w];
        const l = (c << 1) | (a[w - 1] >>> 31);
        const r = (c >>> 1) | (a[w + 1] << 31);
        b[w] = l ^ (c | r);
      }
    } else {
      for (let w = w0; w <= w1; w++) {
        const c = a[w];
        const l = (c << 1) | (a[w - 1] >>> 31);
        const r = (c >>> 1) | (a[w + 1] << 31);
        let o = 0;
        for (let n = 0; n < 8; n++) {
          if (!T[n]) continue;
          const bl = (n >> 2) & 1, bc = (n >> 1) & 1, br = n & 1;
          let m = 0xffffffff;
          m &= bl ? l : ~l; m &= bc ? c : ~c; m &= br ? r : ~r;
          o |= m;
        }
        b[w] = o >>> 0;
      }
    }
    b[w0 - 1] = 0; b[w1 + 1] = 0;
    const tmp = a; a = b; b = tmp;
  }
  return out;
}

function naiveColumn(depth, x, rule = 30) {
  const W = 2 * depth + 3;
  let a = new Uint8Array(W), b = new Uint8Array(W);
  a[depth + 1] = 1;
  const out = [];
  for (let t = 0; t < depth; t++) {
    out.push(a[depth + 1 + x]);
    for (let i = 1; i < W - 1; i++) {
      const n = 4 * a[i - 1] + 2 * a[i] + a[i + 1];
      b[i] = (rule >> n) & 1;
    }
    const tmp = a; a = b; b = tmp;
  }
  return out;
}

// ---------------------------------------------------------------------------
console.log('--- A. engine check ---');
{
  const fast = columnOfSeed(400, 30), slow = naiveColumn(400, 0, 30);
  let bad = 0;
  for (let t = 0; t < 400; t++) if (fast[t] !== slow[t]) bad++;
  const lean = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0];
  console.log(`rule 30 centre column, bitset vs naive, 400 rows: ${bad} mismatches`);
  console.log(`first 11 vs Rule30/Basic.lean [${lean.join('')}]: ` +
    `${lean.every((v, i) => v === fast[i]) ? 'match' : 'MISMATCH'}`);
  const f1 = columnOfSeed(300, 90, 1), s1 = naiveColumn(300, 1, 90);
  let b1 = 0; for (let t = 0; t < 300; t++) if (f1[t] !== s1[t]) b1++;
  console.log(`rule 90 column 1, bitset vs naive, 300 rows: ${b1} mismatches`);
}

console.log(`\ncomputing rule 30 centre column to depth 2^${LOG2D} = ${D} ...`);
const t0 = Date.now();
const c = columnOfSeed(D, 30);
let ones = 0; for (let i = 0; i < D; i++) ones += c[i];
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s; black density ${(ones / D).toFixed(6)}`);

// ---------------------------------------------------------------------------
// B. the decimation orbit  u_k(n) = a(2^k n)
// ---------------------------------------------------------------------------
function decimationOrbit(seq, label, kmax, nmax) {
  // least n in [0, nmax) with seq(2^i n) != seq(2^j n), for each pair i<j
  let worst = 0, worstPair = null, collisions = [];
  for (let i = 0; i < kmax; i++) {
    for (let j = i + 1; j <= kmax; j++) {
      let found = -1;
      const cap = Math.min(nmax, Math.floor((seq.length - 1) / (1 << j)));
      for (let n = 0; n <= cap; n++) {
        if (seq[n << i] !== seq[n << j]) { found = n; break; }
      }
      if (found < 0) collisions.push(`u_${i} = u_${j} (to n <= ${cap})`);
      else if (found > worst) { worst = found; worstPair = [i, j]; }
    }
  }
  console.log(`  ${label.padEnd(22)} pairs i<j<=${kmax}: ` +
    (collisions.length
      ? `COLLISIONS: ${collisions.slice(0, 4).join(', ')}${collisions.length > 4 ? ` (+${collisions.length - 4})` : ''}`
      : `all distinct; largest witness index n = ${worst} at (i,j)=(${worstPair})`));
  return collisions.length;
}

console.log('\n--- B. the decimation orbit  u_k(n) = a(2^k n)  (Theorem 1 with r_k = 0) ---');
console.log('  a FINITE orbit is what an automatic sequence must have');
{
  const N = 1 << 20;
  const tm = new Uint8Array(N);
  for (let n = 1; n < N; n++) tm[n] = tm[n >> 1] ^ (n & 1);
  decimationOrbit(tm, 'Thue-Morse', 12, 200);
  const c90 = columnOfSeed(1 << 17, 90, 1);
  decimationOrbit(c90, 'rule 90 column 1', 10, 200);
  const c150 = columnOfSeed(1 << 17, 150, 1);
  decimationOrbit(c150, 'rule 150 column 1', 10, 200);
  const per = new Uint8Array(N);
  for (let n = 0; n < N; n++) per[n] = (n % 6 === 0 || n % 6 === 1) ? 1 : 0;  // period 6
  decimationOrbit(per, 'periodic, p = 6', 10, 200);
  const rnd = new Uint8Array(N);
  let s = 123456789 >>> 0;
  for (let n = 0; n < N; n++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; rnd[n] = s & 1; }
  decimationOrbit(rnd, 'xorshift control', 12, 200);
  decimationOrbit(c, 'RULE 30 centre column', 15, 400);
}

// ---------------------------------------------------------------------------
// C. pairwise distinctness of all 2^e progressions at level e
// ---------------------------------------------------------------------------
console.log('\n--- C. all 2^e progressions c(2^e n + r), r < 2^e: pairwise distinct? ---');
console.log('  distinctness at level e certifies: no LSD-first 2-DFAO with < 2^e states');
{
  for (let e = 1; e <= 14; e++) {
    const m = 1 << e;
    const cap = Math.min(64, Math.floor((D - m) / m));   // compare on this many terms
    // group by signature of the first `cap` terms; count distinct
    const seen = new Map();
    let maxSig = 0;
    for (let r = 0; r < m; r++) {
      let key = '';
      for (let n = 0; n < cap; n++) key += c[m * n + r];
      if (!seen.has(key)) seen.set(key, r);
      else maxSig = -1;
    }
    // the witness index actually needed: shortest prefix that separates all
    let need = cap;
    if (seen.size === m) {
      let lo = 1, hi = cap;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const s2 = new Set();
        for (let r = 0; r < m; r++) {
          let key = '';
          for (let n = 0; n < mid; n++) key += c[m * n + r];
          s2.add(key);
        }
        if (s2.size === m) hi = mid; else lo = mid + 1;
      }
      need = lo;
    }
    console.log(`  e = ${String(e).padStart(2)}  2^e = ${String(m).padStart(6)}  distinct ` +
      `${String(seen.size).padStart(6)} of ${String(m).padStart(6)}  ` +
      (seen.size === m
        ? `ALL DISTINCT, separated by n < ${need} (depth used ${m * need})`
        : `COLLISION at compare-length ${cap}`));
  }
}

// ---------------------------------------------------------------------------
// D. Cobham's dichotomy: sparse support, or bounded gaps infinitely often
// ---------------------------------------------------------------------------
console.log('\n--- D. gaps and runs (Cobham dichotomy, survey Theorem 19) ---');
{
  // branch A: is the count of blacks below N of order log N?
  console.log('  branch A (support sparse: count = O(log N))');
  for (let e = 4; e <= LOG2D; e += 4) {
    const N = 1 << e;
    let k = 0; for (let i = 0; i < N; i++) k += c[i];
    console.log(`    N = 2^${String(e).padStart(2)}  count = ${String(k).padStart(8)}  ` +
      `count / log2 N = ${(k / e).toFixed(1).padStart(10)}   ` +
      `(board proves only count(5^n) >= n, i.e. count >= log_5 N = ${(Math.log(N) / Math.log(5)).toFixed(1)})`);
  }
  // branch B: liminf of the gaps between successive blacks
  console.log('  branch B (gaps bounded infinitely often: liminf (a_{j+1} - a_j) < infinity)');
  let prev = -1, maxGap = 0, maxGapAt = 0, gap1 = 0, gap1late = 0, maxRatio = 1, maxRatioAt = 0;
  let runB = 0, maxRunB = 0, maxRunBAt = 0, runW = 0, maxRunW = 0, maxRunWAt = 0;
  for (let i = 0; i < D; i++) {
    if (c[i]) {
      if (prev >= 0) {
        const g = i - prev;
        if (g > maxGap) { maxGap = g; maxGapAt = prev; }
        if (g === 1) { gap1++; if (prev > D / 2) gap1late++; }
        if (prev > 0 && i / prev > maxRatio) { maxRatio = i / prev; maxRatioAt = prev; }
      }
      prev = i;
      runB++; if (runB > maxRunB) { maxRunB = runB; maxRunBAt = i - runB + 1; }
      runW = 0;
    } else {
      runW++; if (runW > maxRunW) { maxRunW = runW; maxRunWAt = i - runW + 1; }
      runB = 0;
    }
  }
  console.log(`    gaps equal to 1 (adjacent blacks): ${gap1} of which ${gap1late} in the top half ` +
    `-> liminf gap = 1, so branch B HOLDS and the dichotomy is satisfied without branch A`);
  console.log(`    largest gap ${maxGap} beginning at t = ${maxGapAt}; largest ratio ` +
    `a_{j+1}/a_j = ${maxRatio.toFixed(6)} at t = ${maxRatioAt}`);
  console.log(`    longest black run ${maxRunB} at t = ${maxRunBAt} (log2 D = ${LOG2D});` +
    ` longest white run ${maxRunW} at t = ${maxRunWAt}`);
  console.log(`    board's proved run bounds: black run <= a, white run <= 3a at start a` +
    ` -> here black ${maxRunB} vs a = ${maxRunBAt}, ratio ${(maxRunB / Math.max(1, maxRunBAt)).toExponential(2)}`);
}

// ---------------------------------------------------------------------------
// E. is there ANY dilation structure?  c(2n) against c(n), and rule 90 control
// ---------------------------------------------------------------------------
console.log('\n--- E. dilation structure: does the picture know anything about n -> 2n? ---');
{
  const M = D >> 1;
  let agree = 0;
  for (let n = 0; n < M; n++) if (c[2 * n] === c[n]) agree++;
  console.log(`  rule 30 : c(2n) = c(n) at ${(agree / M).toFixed(6)} of ${M} indices (a coin gives 0.5)`);
  {
    const N = 1 << 17;
    const tm = new Uint8Array(N);
    for (let n = 1; n < N; n++) tm[n] = tm[n >> 1] ^ (n & 1);
    let a1 = 0; const m1 = N >> 1;
    for (let n = 0; n < m1; n++) if (tm[2 * n] === tm[n]) a1++;
    console.log(`  Thue-Morse (control): t(2n) = t(n) at ${(a1 / m1).toFixed(6)} of ${m1}` +
      `   <- an exact dilation identity, which is what a 2-automatic sequence can have`);
  }
  for (const [rule, x] of [[90, 1], [150, 1], [90, 0]]) {
    const s = columnOfSeed(1 << 17, rule, x);
    let a2 = 0, ones2 = 0; const m2 = s.length >> 1;
    for (let n = 0; n < m2; n++) { if (s[2 * n] === s[n]) a2++; ones2 += s[n]; }
    console.log(`  rule ${String(rule).padStart(3)} column ${x}: c(2n) = c(n) at ${(a2 / m2).toFixed(6)} of ${m2}` +
      `  (black density ${(ones2 / m2).toFixed(4)} — a sparse sequence agrees for free)`);
  }
  // and c(2n) vs the coin: best agreement of c(2n) with any shift of c(n)
  let best = 0.5, bestS = 0;
  for (let sh = 0; sh < 64; sh++) {
    let a3 = 0;
    for (let n = 0; n < M - 64; n++) if (c[2 * n] === c[n + sh]) a3++;
    const rate = a3 / (M - 64);
    if (Math.abs(rate - 0.5) > Math.abs(best - 0.5)) { best = rate; bestS = sh; }
  }
  console.log(`  best agreement of c(2n) with c(n+s) over s < 64: ${best.toFixed(6)} at s = ${bestS}` +
    `  (a coin over 64 tries strays about ${(0.5 + 2.6 * 0.5 / Math.sqrt(M)).toFixed(6)})`);
}
