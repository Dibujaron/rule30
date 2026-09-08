/**
 * Sextant (theorist, 2026-09-08): what the right-diagonal driver g_k really is,
 * and whether the recurrence alone forbids a period collapse.
 *
 *   node explorer/sextant_rightdriver.mjs
 *
 * Three tests.
 *
 * A. The driver is a pair of adjacent cells in one row. g_k(j) = R_{k-1}(j) OR
 *    R_{k-2}(j+1), and both of those cells sit in row t = j + k - 1, at
 *    positions j and j+1. So g_k(j) = 0 exactly when row j+k-1 has a white
 *    pair "00" at positions j, j+1, and the doubling criterion reads: the
 *    period doubles at depth k iff the number of white pairs along that
 *    diagonal in one period is odd (L is even, so odd weight of g is the same
 *    as an odd count of zeros). Checked against a real triangle, cell by cell.
 *
 * B. Does the recurrence alone forbid a collapse? The criterion's "the period
 *    stays L" clause is a statement about the MINIMAL period, and it is
 *    equivalent to the driver g_k having minimal period exactly L. So the
 *    question is whether a pair of words (u, v) = (R_{k-2}, R_{k-1}) with v of
 *    exact period L can have v OR shift(u) of period < L, and whether the
 *    integrated word can then have minimal period < L. Exhaustive for
 *    L = 2, 4, 8, sampled for L = 16, 32, 64.
 *
 * C. Is the period tower a function of the recurrence alone? The right
 *    diagonals are not determined by the recurrence: integrating g_k fixes
 *    R_k only up to a constant, and that constant is R_k(0) = the centre
 *    column at time k. So run the abstract tower with the seed's constants
 *    (read from the picture) and with other constant sequences, and compare
 *    the period towers.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const t0 = Date.now();

// ------------------------------------------------------------- the picture
const NROW = 1 << 20;
const WD = 64;
const lo = new Uint32Array(NROW), hi = new Uint32Array(NROW);
{
  let l = 1 >>> 0, h = 0 >>> 0;
  for (let t = 0; t < NROW; t++) {
    lo[t] = l; hi[t] = h;
    const l1 = (l << 1) >>> 0, h1 = ((h << 1) | (l >>> 31)) >>> 0;
    const l2 = (l << 2) >>> 0, h2 = ((h << 2) | (l >>> 30)) >>> 0;
    const nl = (l ^ (l1 | l2)) >>> 0, nh = (h ^ (h1 | h2)) >>> 0;
    l = nl; h = nh;
  }
}
const bitOf = (t, d) => (d < 32 ? (lo[t] >>> d) & 1 : (hi[t] >>> (d - 32)) & 1);
const R = (k, j) => bitOf(j + k, k);

// ------------------------------- A. the driver as a white pair in a real row
{
  const T = 3000, off = T + 3, w = 2 * T + 7;
  let row = new Uint8Array(w), nr = new Uint8Array(w);
  const rows = [];
  row[off] = 1;
  for (let t = 0; t < T; t++) {
    rows.push(row.slice());
    for (let i = 1; i < w - 1; i++) nr[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    [row, nr] = [nr, row];
  }
  let badWindow = 0, badPair = 0, cells = 0, zeros = 0;
  for (let k = 2; k < WD; k++) {
    for (let j = 0; j + k < T; j++) {
      const t = j + k;
      if (rows[t][j + off] !== R(k, j)) badWindow++;
      // board form: R_k(j+1) = R_k(j) ^ (R_{k-1}(j+1) | R_{k-2}(j+2)), and both
      // of those cells sit in row j+k at positions j+1, j+2 -- the two cells
      // immediately right of the diagonal's own cell (j+k, j).
      const g = R(k - 1, j + 1) | R(k - 2, j + 2);
      const pair = rows[t][j + 1 + off] | rows[t][j + 2 + off];
      if (g !== pair) badPair++;
      if (!g) zeros++;
      cells++;
    }
  }
  console.log(`A  window vs real triangle: ${badWindow} disagreements on ${cells} diagonal cells`);
  console.log(`A  g_k(j) = "row j+k-1 is not white at both j and j+1": ${badPair} disagreements on ${cells} cells`);
  console.log(`A  density of white pairs along the diagonals: ${(zeros / cells).toFixed(4)} (a random row would give 0.25)`);
}

// ------------------------------------------------- minimal period of a word
const minPeriod = (a) => {
  const n = a.length;
  for (let p = 1; p <= n; p *= 2) {
    if (n % p) continue;
    let ok = true;
    for (let j = 0; j + p < n; j++) if (a[j] !== a[j + p]) { ok = false; break; }
    if (ok) return p;
  }
  return n;
};

// ------------------- B. can the recurrence alone drop the period? (abstract)
{
  const trial = (u, v, L) => {
    // v = R_{k-1} of exact period L, u = R_{k-2} of period dividing L
    const g = new Uint8Array(2 * L);
    for (let j = 0; j < 2 * L; j++) g[j] = v[(j + 1) % L] | u[(j + 2) % L];
    const mg = minPeriod(g.subarray(0, L));
    // integrate with constant 0; the constant does not change the period
    const len = 2 * L;
    const x = new Uint8Array(len);
    for (let j = 0; j + 1 < len; j++) x[j + 1] = x[j] ^ g[j];
    const mx = minPeriod(x);
    return { mg, mx };
  };
  const report = [];
  for (const L of [2, 4, 8]) {
    let pairs = 0, dropG = 0, dropX = 0;
    const ex = [];
    for (let U = 0; U < 1 << L; U++) {
      const u = new Uint8Array(L);
      for (let j = 0; j < L; j++) u[j] = (U >> j) & 1;
      for (let V = 0; V < 1 << L; V++) {
        const v = new Uint8Array(L);
        for (let j = 0; j < L; j++) v[j] = (V >> j) & 1;
        if (minPeriod(v) !== L) continue;      // v must have exact period L
        pairs++;
        const { mg, mx } = trial(u, v, L);
        if (mg < L) dropG++;
        if (mx < L) { dropX++; if (ex.length < 3) ex.push(`u=${[...u].join('')} v=${[...v].join('')} -> period ${mx}`); }
      }
    }
    report.push(`L=${L}: ${pairs} pairs, driver period < L in ${dropG} (${(dropG / pairs).toFixed(4)}), new diagonal period < L in ${dropX} (${(dropX / pairs).toFixed(4)})${ex.length ? '  e.g. ' + ex.join('; ') : ''}`);
  }
  // sampled for larger L
  let seed = 0x2545f491;
  const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed; };
  for (const L of [16, 32, 64]) {
    const SAMP = 400000;
    let pairs = 0, dropG = 0, dropX = 0;
    for (let s = 0; s < SAMP; s++) {
      const u = new Uint8Array(L), v = new Uint8Array(L);
      for (let j = 0; j < L; j++) { u[j] = rnd() & 1; v[j] = rnd() & 1; }
      if (minPeriod(v) !== L) continue;
      pairs++;
      const { mg, mx } = trial(u, v, L);
      if (mg < L) dropG++;
      if (mx < L) dropX++;
    }
    report.push(`L=${L}: ${pairs} random pairs, driver period < L in ${dropG}, new diagonal period < L in ${dropX}`);
  }
  console.log(`B  collapse in the abstract system (v of exact period L, u any):`);
  for (const r of report) console.log(`   ${r}`);
}

// ---------------- C. does the period tower depend on the constants (centre column)?
{
  const tower = (constants, KMAX, CAP) => {
    // words indexed by absolute j, each of length = its own minimal period
    let prev2 = new Uint8Array([1]);              // R_0 = all black
    let prev1 = new Uint8Array([1, 0]);           // R_1 alternates
    const per = [1, 2];
    for (let k = 2; k < KMAX; k++) {
      const L = Math.max(prev1.length, prev2.length);
      if (2 * L > CAP) break;
      const g = new Uint8Array(2 * L);
      for (let j = 0; j < 2 * L; j++) g[j] = prev1[(j + 1) % prev1.length] | prev2[(j + 2) % prev2.length];
      const x = new Uint8Array(2 * L);
      x[0] = constants(k);
      for (let j = 0; j + 1 < 2 * L; j++) x[j + 1] = x[j] ^ g[j];
      const p = minPeriod(x);
      per.push(p);
      prev2 = prev1;
      prev1 = x.subarray(0, p);
    }
    return per;
  };
  const KMAX = 60, CAP = 1 << 22;
  const seedTower = tower((k) => R(k, 0), KMAX, CAP);
  console.log(`C  tower with the seed's own constants c(k) = R_k(0):`);
  console.log(`   ${seedTower.join(' ')}`);
  // check it against the picture
  let mismatch = 0;
  for (let k = 0; k < seedTower.length; k++) {
    const p = seedTower[k];
    for (let j = 0; j + p + k < NROW && j < 4 * p; j++) if (R(k, j) !== R(k, j + p)) { mismatch++; break; }
  }
  console.log(`C  depths where that period fails against the picture: ${mismatch}`);

  const doubl = (per) => per.map((p, k) => (k && p > per[k - 1] ? k : -1)).filter((k) => k > 0);
  console.log(`C  seed doublings: ${doubl(seedTower).join(', ')}`);
  let seed2 = 0x9e3779b9;
  const rnd2 = () => { seed2 ^= seed2 << 13; seed2 >>>= 0; seed2 ^= seed2 >>> 17; seed2 ^= seed2 << 5; seed2 >>>= 0; return seed2; };
  for (const name of ['all zero', 'all one', 'alternating', 'random A', 'random B']) {
    const f = name === 'all zero' ? () => 0
      : name === 'all one' ? () => 1
        : name === 'alternating' ? (k) => k & 1
          : (k) => rnd2() & 1;
    const p = tower(f, KMAX, CAP);
    console.log(`C  ${name.padEnd(11)}: len ${p.length}, last ${p[p.length - 1]}, doublings ${doubl(p).join(',')}`);
  }
  // one-bit counterfactual: the seed's constants with c(k0) flipped
  for (const k0 of [5, 10, 20, 30]) {
    const p = tower((k) => (k === k0 ? 1 - R(k, 0) : R(k, 0)), KMAX, CAP);
    const d = doubl(p);
    console.log(`C  seed constants, c(${k0}) flipped: len ${p.length}, doublings ${d.join(',')}`);
  }
}

console.log(`(${Date.now() - t0} ms)`);
