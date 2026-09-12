// Talus, 2026-09-12.  A STUB.  This file is wrong twice and is kept only so the
// attack document's "claims that died" has its witness.  Use talus13_null3.mjs.
//
// DEFECT 1, the one that matters: it feeds the null the running maximum of the
// DEPENDENCE COUNT v(K) as "free bits available by column K".  That is the wrong
// quantity, and talus13_anf.mjs said so an hour earlier -- the constraint at
// column 7 is 1 + x_2, which depends on ONE bit but that bit is the THIRD, so
// three bits are available and the running max of the count says two.  The right
// quantity is the union of the dependence sets, which is ceil(K/3).
// DEFECT 2: it crashes on `1 << 31` at KMAX = 100, which is how defect 1 was
// found.  Nothing below this line ran to completion.
//
// talus13_control.mjs built the random map from a hash of (column, prefix) and
// got the SAME D(a) in all 40 draws, at every a.  Zero variance across 40 draws
// of a random object is a defect in the instrument, not a finding: the hash's
// low bit depended on the prefix's low bit almost alone.  This file replaces it
// with a genuine uniform random function -- an explicit table of bits, one per
// (column, prefix) pair, filled from a seeded PRNG -- and prints the survivor
// counts per column so the mechanism is visible rather than inferred.
//
// THE MODEL.  The cone map reads v(K) free bits at column K.  Replace its value
// there by an independent uniform bit for each (K, prefix).  Then D(a) is the
// deepest column the target word 0^(a-1) 1 0^... can be matched to.  If rule 30
// sits inside the spread of that null, the rung is true for the reason a random
// sparse image misses a point, and counting is the only mechanism there is.

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

// vmax(K): free bits readable at column K, measured, monotonised
function vmaxProfile(KMAX) {
  const M = 44;
  let s = 0x51ed2701 >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  const out = []; let run = 0;
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

const KMAX = 100;
const vmax = vmaxProfile(KMAX);
console.log(`[v] vmax(K), K=1..${KMAX}, for w = 011:`);
console.log(`    ${vmax.join(",")}`);
console.log(`    slope over K = 50..100: ${((vmax[99] - vmax[49]) / 50).toFixed(4)} bits per column`);

// a genuine uniform random function table, one bit per (K, prefix)
function makeTable(seed) {
  let s = seed >>> 0;
  const nxt = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  for (let i = 0; i < 20; i++) nxt();
  const tab = [];
  for (let K = 1; K <= KMAX; K++) {
    const n = 1 << vmax[K - 1];
    const bits = new Uint8Array(n);
    for (let i = 0; i < n; i++) bits[i] = nxt() & 1;
    tab.push(bits);
  }
  return tab;
}

function randomD(a, tab, trace) {
  let best = 0;
  const counts = new Array(KMAX + 2).fill(0);
  function rec(K, pref, nbits) {
    if (K - 1 > best) best = K - 1;
    counts[K - 1]++;
    if (K > KMAX) return;
    const need = vmax[K - 1], grow = need - nbits;
    for (let ext = 0; ext < (1 << grow); ext++) {
      const np = pref | (ext << nbits);
      const want = (K > a) ? 0 : (K === a ? 1 : -1);
      if (want >= 0 && tab[K - 1][np] !== want) continue;
      rec(K + 1, np, need);
    }
  }
  rec(1, 0, 0);
  if (trace) return { best, counts };
  return best;
}

// the survivor trace of one draw, so the mechanism is visible
{
  const tab = makeTable(0xc0ffee01);
  const { best, counts } = randomD(24, tab, true);
  console.log(`\n[t] one null draw at a = 24: survivors after the constraint at column K`);
  const parts = [];
  for (let K = 20; K <= Math.min(best + 3, KMAX); K++) parts.push(`${K}:${counts[K]}`);
  console.log(`    ${parts.join(" ")}   -> D = ${best}`);
}

console.log(`\n[R] rule 30's D(a) against 200 draws of the null.`);
console.log(`     a   rule30    null: min  p25  median  p75  max    draws >= rule30`);
for (const a of [10, 16, 20, 24, 28, 34, 40, 48]) {
  const real = coneDepth(a, 400, 1.2e9);
  const draws = [];
  for (let d = 0; d < 200; d++) draws.push(randomD(a, makeTable((0x9e3779b9 ^ (d * 2246822519 + 7)) >>> 0)));
  draws.sort((p, q) => p - q);
  const ge = draws.filter((v) => v >= real.best).length;
  console.log(`    ${String(a).padStart(2)}   ${String(real.status === "exact" ? real.best : real.status).padStart(6)}    ` +
    `${String(draws[0]).padStart(5)} ${String(draws[50]).padStart(4)} ${String(draws[100]).padStart(7)} ${String(draws[150]).padStart(4)} ${String(draws[199]).padStart(4)}    ${ge}/200`);
}

// --------------------------------------------------------------------------
// the domination control: f_w(a) <= D(a) + 1, against the exhaustive truth
// --------------------------------------------------------------------------
function dfsF(a, word, cap, budget) {
  const p = word.length;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
    return rdk[k - 1];
  }
  function rec(k) {
    if (k > cap) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
    const base = ldk[k - 1];
    for (const rc of [0, 1]) {
      const centre0 = base ^ (col[k - 1] | fillRD(k, rc));
      const rdk = RD[k];
      const cv = word[k % p];
      const lc = centre0 ^ cv;
      if (req[k] >= 0 && lc !== req[k]) continue;
      col[k] = cv;
      const flip = (lc === 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      ldk[k] = cv; rdk[k] = cv;
      if (k + 1 > best) best = k + 1;
      rec(k + 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
    }
  }
  try { col[0] = word[0]; LD[0][0] = word[0]; RD[0][0] = word[0]; best = 1; rec(1); }
  catch (e) { if (e !== AB) throw e; }
  return { best, status };
}
console.log(`\n[C] domination: the exhaustive f_011(a) against D(a) + 1.  A violation`);
console.log(`    would mean the left-only solver over-prunes.`);
let tot = 0, viol = 0, tight = 0, worst = -1, worstAt = 0;
for (let a = 1; a <= 22; a++) {
  const d = coneDepth(a, 400, 1.2e9);
  const f = dfsF(a, W, 90, 4e8);
  if (d.status !== "exact" || f.status !== "exact") { console.log(`    a=${a}: not exhaustive (${d.status}/${f.status})`); continue; }
  tot++;
  if (f.best > d.best + 1) { viol++; console.log(`    VIOLATION a=${a}: f=${f.best} > D+1=${d.best + 1}`); }
  else { const s = d.best + 1 - f.best; if (s === 0) tight++; if (s > worst) { worst = s; worstAt = a; } }
  if (a <= 12) console.log(`    a=${String(a).padStart(2)}  f=${String(f.best).padStart(3)}   D+1=${String(d.best + 1).padStart(3)}   slack ${d.best + 1 - f.best}`);
}
console.log(`    ${tot} cells exhaustive, ${viol} violations, tight at ${tight}, worst slack ${worst} at a=${worstAt}`);
