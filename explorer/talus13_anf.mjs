// Talus, 2026-09-12.  The algebraic structure of the w = 011 cone constraints.
//
// Variables: x_m := the meaningful free bit of column +1 at the white time 3m.
//   C_1[3m] = x_m,  C_1[3m+1] = 0,  C_1[3m+2] = 1.
// Constraint at column k is the single bit  C_k[0],  a polynomial over GF(2) in
// x_0 .. x_{ceil(k/3)}.  This file reads that polynomial exactly, by Moebius
// transform over every assignment, and asks three things:
//   (a) how complicated is it (degree, monomial count)?
//   (b) is the k = 3j+1 family affine, as the C_1 -> C_4 step suggests?
//   (c) is the solution set of the first K constraints an affine subspace?

const W = [0, 1, 1];
const P = 3;

// C_k[0] for a given assignment x_0..x_{M-1}.
function coneBits(x, K) {
  const T = 3 * x.length + 2;
  const C = [];
  for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 2));
  for (let t = 0; t <= T + 1; t++) C[0][t] = W[t % P];
  for (let t = 0; t + 1 <= T; t++) {
    const r = (t % P === 0) ? (1 ^ x[(t / P) | 0]) : 0;   // x_m = NOT r(3m)
    C[1][t] = C[0][(t + 1) % P] ^ (C[0][t % P] | r);
  }
  for (let k = 2; k <= K; k++)
    for (let t = 0; t + k <= T; t++) C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
  const out = [];
  for (let k = 1; k <= K; k++) out.push(C[k][0]);
  return out;
}

// sanity: C_1[0] = x_0, C_2[0] = x_0, C_3[0] = x_0, C_4[0] = x_0 xor x_1 xor 1
{
  let ok = true;
  for (let v = 0; v < 16; v++) {
    const x = [v & 1, (v >> 1) & 1, (v >> 2) & 1, (v >> 3) & 1];
    const c = coneBits(x, 4);
    if (c[0] !== x[0] || c[1] !== x[0] || c[2] !== x[0] || c[3] !== (x[0] ^ x[1] ^ 1)) ok = false;
  }
  console.log(`[S] hand-derived C_1..C_4 at [0] agree with the engine: ${ok}`);
}

const M = 12;                   // 12 variables cover k up to 3*11+1 = 34
const N = 1 << M;
const KMAX = 32;
// truth tables
const tt = [];
for (let k = 0; k < KMAX; k++) tt.push(new Uint8Array(N));
for (let v = 0; v < N; v++) {
  const x = [];
  for (let i = 0; i < M; i++) x.push((v >> i) & 1);
  const c = coneBits(x, KMAX);
  for (let k = 0; k < KMAX; k++) tt[k][v] = c[k];
}
// Moebius
function anf(f) {
  const g = Uint8Array.from(f);
  for (let i = 0; i < M; i++) for (let v = 0; v < N; v++) if (v & (1 << i)) g[v] ^= g[v ^ (1 << i)];
  return g;
}
console.log(`\n[A] the constraint polynomial C_k[0] over GF(2) in x_0..x_${M - 1}.`);
console.log(`    k   deg  #monomials   vars used   affine?`);
const affineK = [];
for (let k = 1; k <= KMAX; k++) {
  const g = anf(tt[k - 1]);
  let deg = 0, mon = 0, used = 0;
  for (let v = 0; v < N; v++) if (g[v]) {
    mon++; used |= v;
    let pc = 0; for (let i = 0; i < M; i++) if (v & (1 << i)) pc++;
    if (pc > deg) deg = pc;
  }
  const isAff = deg <= 1;
  if (isAff) affineK.push(k);
  let nv = 0; for (let i = 0; i < M; i++) if (used & (1 << i)) nv++;
  let lin = "";
  if (isAff) {
    const parts = [];
    if (g[0]) parts.push("1");
    for (let i = 0; i < M; i++) if (g[1 << i]) parts.push(`x${i}`);
    lin = "  = " + (parts.length ? parts.join(" + ") : "0");
  }
  console.log(`   ${String(k).padStart(2)}  ${String(deg).padStart(3)}  ${String(mon).padStart(10)}  ${String(nv).padStart(9)}   ${isAff ? "YES" : "no "}${lin}`);
}
console.log(`    affine at k = ${affineK.join(", ")}`);

// ---------------------------------------------------------------------------
// [B] is the solution set of the first K constraints an affine subspace?
// ---------------------------------------------------------------------------
console.log(`\n[B] the solution set of "C_k[0] = 0 for 1 <= k <= K" inside {0,1}^${M}.`);
console.log(`    An affine subspace of dimension d has size 2^d and is closed under`);
console.log(`    u + v + w.  K   size   log2   affine-subspace?`);
for (let K = 1; K <= 20; K++) {
  const sol = [];
  for (let v = 0; v < N; v++) {
    let ok = true;
    for (let k = 1; k <= K; k++) if (tt[k - 1][v]) { ok = false; break; }
    if (ok) sol.push(v);
  }
  let aff = "n/a";
  if (sol.length > 0) {
    const set = new Set(sol);
    let good = true;
    for (let i = 0; good && i < sol.length && i < 60; i++)
      for (let j = 0; good && j < sol.length && j < 60; j++)
        for (let l = 0; good && l < sol.length && l < 60; l++)
          if (!set.has(sol[i] ^ sol[j] ^ sol[l])) good = false;
    aff = good ? "YES" : "no";
  }
  const lg = sol.length > 0 && (sol.length & (sol.length - 1)) === 0 ? Math.log2(sol.length).toFixed(0) : "-";
  console.log(`    ${String(K).padStart(2)}  ${String(sol.length).padStart(6)}  ${String(lg).padStart(4)}   ${aff}`);
}
