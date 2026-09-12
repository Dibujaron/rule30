// Talus, 2026-09-12.  Controls for the left-only reduction at w = 011.
//
// [G] Is the cone map's image LOCALLY constrained anywhere past column 6?
//     The kernel file talus13_scratch_cone.lean proves the image satisfies
//     exactly three affine relations on columns 1..6.  If every short window
//     further out is FULL -- every pattern occurs -- then there is no local
//     obstruction at all past column 6 and the rung is a purely global fact.
// [R] THE NULL IN THIS FILE IS BROKEN AND ITS OUTPUT MUST NOT BE USED.  The
//     working one is talus13_null3.mjs.  Two defects.  It builds the random map
//     from a hash of (column, prefix) whose low bit is nearly a function of the
//     prefix's low bit, and it returns the SAME D(a) in all 40 draws at every a
//     -- zero variance across 40 draws of a random object is a broken
//     instrument, not a finding.  And its "bits available by column K" is the
//     running maximum of the DEPENDENCE COUNT, which is the wrong quantity: the
//     constraint at column 7 is 1 + x_2, one bit but the third of them.  The
//     other blocks of this file, [X] and [G] and [E], are sound and are cited.
// [E] D(a) for w = 011 out to a = 60, against the null's own prediction.

const W = [0, 1, 1];

function coneWord(xs, K) {
  const p = 3, T = 3 * (xs.length + 2) + 4;
  const C = [];
  for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 3));
  for (let t = 0; t <= T + 2; t++) C[0][t] = W[t % p];
  for (let t = 0; t + 1 <= T + 1; t++) {
    let r = 0;
    if (W[t % p] === 0) { const m = (t / p) | 0; r = m < xs.length ? xs[m] : 0; }
    C[1][t] = C[0][(t + 1) % p] ^ (C[0][t % p] | r);
  }
  for (let k = 2; k <= K; k++) for (let t = 0; t + k <= T + 1; t++) C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
  const out = []; for (let k = 1; k <= K; k++) out.push(C[k][0]);
  return out;
}

// cross-check against the kernel file's closed form, at columns 1..6
{
  let bad = 0;
  for (let v = 0; v < 4; v++) {
    // p = column1 at t=0, q = column1 at t=3 ; x_m = NOT r(3m)
    const p = v & 1, q = (v >> 1) & 1;
    const w = coneWord([p, 0, q, 0, 0, 0, 0, 0], 6);   // x_0 = r(0)?  see below
    void w;
  }
  // the script's free bit is r(3m) itself; the Lean file's p,q are r(0), r(3).
  for (const p of [0, 1]) for (const q of [0, 1]) {
    const w = coneWord([p, q, 0, 0, 0, 0, 0, 0], 6);
    const np = 1 ^ p, nq = 1 ^ q;
    const want = [np, np, np, q ^ np, (q ^ np) | np, (1 ^ q) ^ ((q ^ np) | np)];
    for (let i = 0; i < 6; i++) if (w[i] !== want[i]) bad++;
  }
  console.log(`[X] engine vs the kernel file's closed form on columns 1..6, all four`);
  console.log(`    (p,q): ${bad} mismatches`);
}

// --------------------------------------------------------------------------
// [G] local fullness of the image
// --------------------------------------------------------------------------
console.log(`\n[G] every window of the achievable rows, by start column and length.`);
console.log(`    "full" = all 2^L patterns occur.  A window that is not full is a`);
console.log(`    local obstruction; the three proved relations live at columns 1..6.`);
{
  const M = 16, K = 3 * M - 4;
  const rows = [];
  for (let v = 0; v < (1 << M); v++) {
    const x = []; for (let i = 0; i < M; i++) x.push((v >> i) & 1);
    rows.push(coneWord(x, K));
  }
  for (const L of [3, 4, 6, 8]) {
    const notFull = [];
    for (let s = 1; s + L - 1 <= K; s++) {
      const seen = new Set();
      for (const w of rows) { let v = 0; for (let i = 0; i < L; i++) v = v * 2 + w[s - 1 + i]; seen.add(v); }
      if (seen.size < (1 << L)) notFull.push(`${s}:${seen.size}/${1 << L}`);
    }
    console.log(`    L=${L}: windows that are NOT full, by start column -> ${notFull.length ? notFull.join(" ") : "(none)"}`);
  }
}

// --------------------------------------------------------------------------
// the real D(a)
// --------------------------------------------------------------------------
function coneDepth(a, JMAX, budget) {
  const p = 3;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = W[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {
    if (j > best) best = j;
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const branch = W[j % p] === 0 ? [0, 1] : [0];
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ (C[0][j % p] | b);
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status };
}

// --------------------------------------------------------------------------
// [R] the null: a random map with the same free-bit arrival profile
// --------------------------------------------------------------------------
// vmax(K) = the number of free bits the constraint at column K can read.
// Measured for w = 011 in talus13_null.mjs; recomputed here from the same
// dependence test so the two files do not share a constant.
function vmaxProfile(KMAX) {
  const M = 40;
  let s = 0x51ed2701 >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  const out = [];
  let run = 0;
  for (let K = 1; K <= KMAX; K++) {
    const dep = new Array(M).fill(false);
    for (let tr = 0; tr < 40; tr++) {
      const x = []; for (let i = 0; i < M; i++) x.push(rnd());
      const base = coneWord(x, K)[K - 1];
      for (let i = 0; i < M; i++) {
        if (dep[i]) continue;
        x[i] ^= 1; if (coneWord(x, K)[K - 1] !== base) dep[i] = true; x[i] ^= 1;
      }
    }
    const v = dep.filter(Boolean).length;
    if (v > run) run = v;
    out.push(run);
  }
  return out;
}
const KMAX = 110;
const vmax = vmaxProfile(KMAX);
console.log(`\n[R] vmax(K) for w = 011, K = 1..${KMAX}: ${vmax.slice(0, 45).join(",")} ...`);
console.log(`    slope over K = 60..110: ${((vmax[109] - vmax[59]) / 50).toFixed(4)} free bits per column`);

// a random map with the same profile: W_K = h(K, x_0..x_{vmax(K)-1}), h uniform
function randomD(a, seedBase) {
  // DFS over x bits as they become available
  let best = 0;
  const H = (K, pref) => {
    // xorshift hash of (seedBase, K, pref)
    let h = (seedBase ^ (K * 2654435761) ^ (pref * 40503)) >>> 0;
    h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    return h & 1;
  };
  const stack = [[1, 0]];      // [K, prefix-as-int over vmax(K-1) bits]
  // iterative DFS, but the branching factor is 1 or 2 per column
  function rec(K, pref, nbits) {
    if (K - 1 > best) best = K - 1;
    if (K > KMAX) return;
    const need = vmax[K - 1];
    const grow = need - nbits;
    for (let ext = 0; ext < (1 << grow); ext++) {
      const np = pref | (ext << nbits);
      const want = (K > a) ? 0 : (K === a ? 1 : -1);
      if (want >= 0 && H(K, np) !== want) continue;
      rec(K + 1, np, need);
    }
  }
  void stack;
  rec(1, 0, 0);
  return best;
}
console.log(`\n[R] D(a): rule 30 against 40 draws of a random map with the same profile.`);
console.log(`    a    rule30    null draws: min  median  max   #draws >= rule30`);
for (const a of [10, 16, 20, 24, 28, 34, 40]) {
  const real = coneDepth(a, 300, 8e8);
  const draws = [];
  for (let d = 0; d < 40; d++) draws.push(randomD(a, (0x9e3779b9 ^ (d * 2246822519)) >>> 0));
  draws.sort((p, q) => p - q);
  const ge = draws.filter((v) => v >= real.best).length;
  console.log(`   ${String(a).padStart(2)}    ${String(real.status === "exact" ? real.best : real.status).padStart(6)}    ` +
    `${String(draws[0]).padStart(3)}  ${String(draws[20]).padStart(6)}  ${String(draws[39]).padStart(3)}   ${ge}/40`);
}

// --------------------------------------------------------------------------
// [E] D(a) out to a = 60
// --------------------------------------------------------------------------
console.log(`\n[E] D(a) for w = 011, a = 41..60 (a = 1..40 in talus13_image.mjs).`);
{
  const row = [];
  for (let a = 41; a <= 60; a++) {
    const r = coneDepth(a, 400, 1.2e9);
    row.push(r.status === "exact" ? r.best : r.status);
  }
  console.log(`    ${row.map((v) => String(v).padStart(5)).join("")}`);
  let worst = 0, at = 0;
  for (let i = 0; i < row.length; i++) if (typeof row[i] === "number" && row[i] / (41 + i) > worst) { worst = row[i] / (41 + i); at = 41 + i; }
  console.log(`    worst D(a)/a on this range: ${worst.toFixed(3)} at a=${at}`);
}
