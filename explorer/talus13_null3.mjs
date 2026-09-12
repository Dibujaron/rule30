// Talus, 2026-09-12.  The null for D(a), third attempt, and the reason the
// second was wrong.
//
// talus13_null.mjs measured v(K) = the NUMBER of free bits the constraint at
// column K depends on, and talus13_null2.mjs fed its running maximum to the null
// as "the bits available by column K".  That is the wrong quantity and the ANF
// says so outright: the constraint at column 7 is 1 + x_2, which depends on ONE
// bit but that bit is the THIRD, so three bits are available by column 7 and the
// running max of the count says two.  The right quantity is
//     n(K) = | union over k <= K of { m : column k's cell depends on x_m } |,
// and it is checkable against the exhaustive image count: |image_K| = 2^n(K) iff
// the cone map is injective on the bits that matter, which is what this file
// tests before using n(K) for anything.

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

// ---- n(K), the union of the dependence sets -------------------------------
// KMAX is capped at 66 so that n(K) <= 22 and the random-function table can be
// indexed exactly, with no hashing and no masking.  talus13_null2.mjs crashed on
// `1 << 31` at KMAX = 100, and talus13_control.mjs's hashed version silently gave
// the SAME D(a) in all 40 draws -- a null with no spread measures nothing.
const KMAX = 66, MBITS = 30;
function profile() {
  let s = 0x51ed2701 >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  const seen = new Array(MBITS).fill(false);
  const out = [];
  for (let K = 1; K <= KMAX; K++) {
    for (let tr = 0; tr < 40; tr++) {
      const x = []; for (let i = 0; i < MBITS; i++) x.push(rnd());
      const base = coneWord(x, K)[K - 1];
      for (let i = 0; i < MBITS; i++) {
        if (seen[i]) continue;
        x[i] ^= 1; if (coneWord(x, K)[K - 1] !== base) seen[i] = true; x[i] ^= 1;
      }
    }
    out.push(seen.filter(Boolean).length);
  }
  return out;
}
const n = profile();
console.log(`[n] n(K) = bits available by column K, K = 1..45:`);
console.log(`    ${n.slice(0, 45).join(",")}`);
console.log(`    n(K) vs ceil(K/3): ` +
  (n.slice(0, 45).every((v, i) => v === Math.ceil((i + 1) / 3)) ? "EQUAL at every K <= 45" : "differ somewhere"));
console.log(`    n(${KMAX}) = ${n[KMAX - 1]}, ceil(${KMAX}/3) = ${Math.ceil(KMAX / 3)}`);

// ---- CONTROL: |image_K| = 2^n(K)?  exhaustive to K = 33 -------------------
{
  const M = 12;
  const rows = [];
  for (let v = 0; v < (1 << M); v++) {
    const x = []; for (let i = 0; i < M; i++) x.push((v >> i) & 1);
    rows.push(coneWord(x, 33).join(""));
  }
  let bad = 0;
  for (let K = 1; K <= 33; K++) {
    const s = new Set(rows.map((w) => w.slice(0, K)));
    if (n[K - 1] <= M && s.size !== 2 ** n[K - 1]) { bad++; console.log(`    MISMATCH K=${K}: |image|=${s.size}, 2^n=${2 ** n[K - 1]}`); }
  }
  console.log(`    |image_K| = 2^n(K) at every K <= 33 with n(K) <= ${M}: ${bad === 0 ? "YES" : bad + " mismatches"}`);
  console.log(`    (so the cone map is injective on the bits that matter)`);
}

// ---- the real D(a) --------------------------------------------------------
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

// ---- the null: a uniform random bit per (column, prefix) ------------------
function makeTable(seed) {
  let s = seed >>> 0;
  const nxt = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  for (let i = 0; i < 20; i++) nxt();
  const tab = [];
  for (let K = 1; K <= KMAX; K++) {
    const sz = 1 << n[K - 1];
    const bits = new Uint8Array(sz);
    for (let i = 0; i < sz; i++) bits[i] = nxt() & 1;
    tab.push(bits);
  }
  return tab;
}
function randomD(a, tab) {
  let best = 0;
  function rec(K, pref, nbits) {
    if (K - 1 > best) best = K - 1;
    if (K > KMAX) return;
    const need = n[K - 1], grow = need - nbits;
    for (let ext = 0; ext < (1 << grow); ext++) {
      const np = pref | (ext << nbits);
      const want = (K > a) ? 0 : (K === a ? 1 : -1);
      if (want >= 0 && tab[K - 1][np] !== want) continue;
      rec(K + 1, np, need);
    }
  }
  rec(1, 0, 0);
  return best;
}
// CONTROL on the null itself: does it have any spread at all?
{
  const d = [];
  for (let i = 0; i < 200; i++) d.push(randomD(24, makeTable((0xabcdef ^ (i * 2654435761 + 13)) >>> 0)));
  const u = new Set(d);
  console.log(`\n[c] the null at a = 24 over 200 draws takes ${u.size} distinct values ` +
    `${[...u].sort((p, q) => p - q).join(",")} -- a null with one value is a broken instrument.`);
}

console.log(`\n[R] rule 30's D(a) against 200 draws of the null.`);
console.log(`     a   rule30    null: min  p25  median  p75  max    draws >= rule30`);
for (const a of [10, 16, 20, 24, 28, 34, 40]) {
  const real = coneDepth(a, 400, 1.5e9);
  const draws = [];
  for (let d = 0; d < 200; d++) draws.push(randomD(a, makeTable((0x9e3779b9 ^ (d * 2246822519 + 7)) >>> 0)));
  draws.sort((p, q) => p - q);
  const ge = draws.filter((v) => v >= real.best).length;
  console.log(`    ${String(a).padStart(2)}   ${String(real.status === "exact" ? real.best : real.status).padStart(6)}    ` +
    `${String(draws[0]).padStart(5)} ${String(draws[50]).padStart(4)} ${String(draws[100]).padStart(7)} ${String(draws[150]).padStart(4)} ${String(draws[199]).padStart(4)}    ${ge}/200`);
}
