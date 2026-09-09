/**
 * Parallax / connect: is the centre column 2-automatic?
 *
 * Christol's theorem: a sequence over F_q is q-automatic exactly when its
 * generating function is algebraic over F_q(x). Eilenberg's criterion: a
 * sequence u is k-automatic exactly when its k-KERNEL
 *
 *     K_k(u) = { n |-> u(k^e n + r) : e >= 0, 0 <= r < k^e }
 *
 * is finite, and the minimal LSD-first k-DFAO has exactly |K_k(u)| states.
 *
 * So: computing that many kernel elements are PAIRWISE DISTINCT is a certified
 * LOWER BOUND on the number of states of any automaton that produces the centre
 * column -- and, through Bridy's effective Christol bound, a lower bound on the
 * degree/height of any polynomial over F_2(x) annihilating its generating
 * function. It can never prove non-automaticity (any finite computation is
 * consistent with a bigger automaton); it can only push the bound.
 *
 * Sections
 *   A  engine check: the bitset engine against a naive per-cell run, and
 *      against the eleven values of the centre column recorded in Basic.lean
 *   B  controls: sequences that ARE 2-automatic must show a kernel that
 *      saturates (Thue-Morse; rule 150 column 1; rule 90 column 1), and a
 *      pseudorandom control must show a kernel that does not
 *   C  rule 30's centre column: distinct kernel elements by depth e
 *   D  factor complexity of the centre column, for the Cobham bound p(n)=O(n)
 */

const LOG2D = Number(process.env.PARALLAX_LOG2D ?? 21);
const D = 1 << LOG2D;          // centre column computed for t < D
const PREFIX = 24;             // kernel elements compared on this many terms
const EMAX = LOG2D - 5;        // kernel depths e = 0..EMAX  (2^e*(PREFIX-1) < D)

// ---------------------------------------------------------------------------
// A bitset engine for one elementary rule on the seed, restricted to the
// backward cone of the origin at time D: at time t only positions
// |x| <= min(t, D-t) can matter, so the total work is ~D^2/2 cells.
//
// Position x is stored at bit p = x + D of a Uint32Array; bit b of word w is
// position 32w+b. Left neighbour of p is p-1, right neighbour p+1.
// ---------------------------------------------------------------------------

function centreColumn(depth, rule = 30, x = 0) {
  const NW = ((2 * depth + 64) >> 5) + 2;
  const rd = depth + x;                       // bit read for the column
  let a = new Uint32Array(NW);
  let b = new Uint32Array(NW);
  a[depth >> 5] = 1 << (depth & 31);          // the single black cell at x=0
  const out = new Uint8Array(depth);
  // lookup table on (l,c,r) packed as 4l+2c+r
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
    // clear the shoulder words we did not write, then swap
    b[w0 - 1] = 0; b[w1 + 1] = 0;
    const tmp = a; a = b; b = tmp;
  }
  return out;
}

/** a column of the seed's picture, naive, cell by cell */
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
// Section A: engine check
// ---------------------------------------------------------------------------
console.log('--- A. engine check ---');
{
  const fast = centreColumn(400, 30);
  const slow = naiveColumn(400, 0, 30);
  let bad = 0;
  for (let t = 0; t < 400; t++) if (fast[t] !== slow[t]) bad++;
  console.log(`rule 30 centre column, bitset vs naive, 400 rows: ${bad} mismatches`);
  const lean = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0];  // Basic.lean's recorded values
  console.log(`first 11 vs Rule30/Basic.lean: [${[...fast.slice(0, 11)].join('')}] ` +
    `expected [${lean.join('')}] -> ${lean.every((v, i) => v === fast[i]) ? 'match' : 'MISMATCH'}`);
  for (const rule of [90, 150, 60, 102]) {
    const f = centreColumn(300, rule), s = naiveColumn(300, 0, rule);
    let m = 0; for (let t = 0; t < 300; t++) if (f[t] !== s[t]) m++;
    console.log(`rule ${rule} centre column, bitset vs naive, 300 rows: ${m} mismatches`);
  }
}

// ---------------------------------------------------------------------------
// kernel counting
// ---------------------------------------------------------------------------
/**
 * Distinct elements of the 2-kernel, compared on `prefix` terms.
 * Returns the cumulative count of distinct kernel elements for e = 0..emax.
 */
function kernelProfile(seq, emax, prefix, k = 2) {
  const seen = new Map();
  const cum = [];
  let total = 0;
  for (let e = 0; e <= emax; e++) {
    const ke = k ** e;
    for (let r = 0; r < ke; r++) {
      let s = '';
      let ok = true;
      for (let n = 0; n < prefix; n++) {
        const i = ke * n + r;
        if (i >= seq.length) { ok = false; break; }
        s += seq[i];
      }
      if (!ok) throw new Error(`sequence too short for e=${e}`);
      if (!seen.has(s)) { seen.set(s, true); total++; }
    }
    cum.push(total);
  }
  return cum;
}

// ---------------------------------------------------------------------------
// Section B: controls
// ---------------------------------------------------------------------------
console.log('\n--- B. controls (a 2-automatic sequence must SATURATE) ---');
{
  const N = 1 << 20;
  const tm = new Uint8Array(N);
  for (let n = 1; n < N; n++) tm[n] = tm[n >> 1] ^ (n & 1);
  console.log(`Thue-Morse            kernel by e=0..8: ${kernelProfile(tm, 8, PREFIX).join(' ')}`);

  // rule 150 column 1 and rule 90 column 1: Rosetta's two linear witnesses,
  // both of which ought to be 2-automatic if the vantage's chain is right
  const M = 1 << 18;
  const c150 = centreColumn(M, 150, 1), c90 = centreColumn(M, 90, 1);
  {
    const s150 = naiveColumn(300, 1, 150), s90 = naiveColumn(300, 1, 90);
    let m = 0;
    for (let t = 0; t < 300; t++) { if (c150[t] !== s150[t]) m++; if (c90[t] !== s90[t]) m++; }
    console.log(`  (columns x=1 of rules 150 and 90, bitset vs naive, 600 values: ${m} mismatches)`);
  }
  console.log(`rule 150 column 1     kernel by e=0..8: ${kernelProfile(c150, 8, PREFIX).join(' ')}`);
  console.log(`rule 90  column 1     kernel by e=0..8: ${kernelProfile(c90, 8, PREFIX).join(' ')}`);

  // a pseudorandom control: must NOT saturate
  const rnd = new Uint8Array(N);
  let s = 123456789 >>> 0;
  for (let n = 0; n < N; n++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; rnd[n] = s & 1; }
  console.log(`xorshift control      kernel by e=0..8: ${kernelProfile(rnd, 8, PREFIX).join(' ')}` +
    `   (max possible ${2 ** 9 - 1})`);
}

// ---------------------------------------------------------------------------
// Section C: rule 30
// ---------------------------------------------------------------------------
console.log(`\n--- C. rule 30 centre column, depth 2^${LOG2D} ---`);
const t0 = Date.now();
const c30 = centreColumn(D, 30);
console.log(`computed ${D} rows in ${((Date.now() - t0) / 1000).toFixed(1)} s; ` +
  `density of black = ${([...c30].reduce((a, b) => a + b, 0) / D).toFixed(6)}`);
{
  const cum = kernelProfile(c30, EMAX, PREFIX);
  console.log(`kernel elements (cumulative) by e=0..${EMAX}:`);
  for (let e = 0; e <= EMAX; e++) {
    console.log(`  e <= ${String(e).padStart(2)}   distinct ${String(cum[e]).padStart(7)}` +
      `   of ${String(2 ** (e + 1) - 1).padStart(7)} possible` +
      `   ${cum[e] === 2 ** (e + 1) - 1 ? 'ALL DISTINCT' : ''}`);
  }
  console.log(`\n=> any 2-DFAO (LSD-first) producing the centre column has at least ` +
    `${cum[EMAX]} states.`);
  // the collisions above are collisions of PREFIXES, so they may be artefacts:
  // compare on longer prefixes (which costs depth) and see whether they survive
  console.log('\n  prefix sweep (does a longer comparison separate the collisions?)');
  for (const pf of [24, 32, 48, 64, 96]) {
    let em = 0;
    while (2 ** (em + 1) * (pf - 1) < D) em++;
    const cu = kernelProfile(c30, em, pf);
    console.log(`    prefix ${String(pf).padStart(3)}  e <= ${String(em).padStart(2)}  ` +
      `distinct ${String(cu[em]).padStart(7)} of ${String(2 ** (em + 1) - 1).padStart(7)}` +
      `  ${cu[em] === 2 ** (em + 1) - 1 ? 'ALL DISTINCT' : ''}`);
  }
  // the same for k = 3 and k = 4
  for (const k of [3, 4]) {
    let emax = 0;
    while (k ** (emax + 1) * (PREFIX - 1) < D) emax++;
    const cu = kernelProfile(c30, emax, PREFIX, k);
    console.log(`=> k = ${k}: kernel e<=${emax} has ${cu[emax]} distinct of ` +
      `${(k ** (emax + 1) - 1) / (k - 1)} possible; so any ${k}-DFAO has >= ${cu[emax]} states.`);
  }
}

// ---------------------------------------------------------------------------
// Section D: factor complexity (Cobham's bound is p(n) = O(n))
// ---------------------------------------------------------------------------
console.log('\n--- D. factor complexity of the centre column ---');
{
  const window = Math.min(D, 1 << 20);
  for (const n of [8, 12, 16, 20, 24, 28, 32]) {
    const seen = new Set();
    let v = 0n;
    const mask = (1n << BigInt(n)) - 1n;
    for (let i = 0; i < window; i++) {
      v = ((v << 1n) | BigInt(c30[i])) & mask;
      if (i >= n - 1) seen.add(v);
    }
    console.log(`  p(${String(n).padStart(2)}) >= ${String(seen.size).padStart(7)} ` +
      `(of 2^${n} = ${2 ** n}; sample ${window} positions)  ratio p(n)/n = ${(seen.size / n).toFixed(0)}`);
  }
}
