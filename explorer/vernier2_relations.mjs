// Vernier, 2026-09-12.
// (a) Qualify the fetched claim "no elementary local rules are simultaneously
//     nonlinear and first-order correlation immune" -- print the counterexamples
//     with their balancedness, since 'resilient' = balanced + correlation immune.
// (b) The exact affine relations satisfied by every reachable row at depth t: which
//     coordinates of the code are constant, and whether there are relations beyond
//     those. (The dual of the affine hull.)
// (c) The linear complexity profile of the centre column by Berlekamp-Massey over
//     F_2 -- the field's own measure of "is this sequence LFSR-generated", which is
//     the hypothesis every Naor-Naor-lineage bias bound rests on.

function truthTable(rule) {
  const tt = [];
  for (let i = 0; i < 8; i++) {
    const l = i & 1, c = (i >> 1) & 1, r = (i >> 2) & 1;
    tt.push((rule >> (4 * l + 2 * c + r)) & 1);
  }
  return tt;
}
function walsh(tt) {
  const n = tt.length, f = tt.map((b) => (b ? -1 : 1));
  for (let len = 1; len < n; len <<= 1)
    for (let i = 0; i < n; i += len << 1)
      for (let j = i; j < i + len; j++) { const a = f[j], b = f[j + len]; f[j] = a + b; f[j + len] = a - b; }
  return f;
}

console.log('--- (a) nonlinear AND first-order correlation immune elementary rules ---');
for (let rule = 0; rule < 256; rule++) {
  const tt = truthTable(rule), W = walsh(tt);
  let maxW = 0; for (let w = 0; w < 8; w++) maxW = Math.max(maxW, Math.abs(W[w]));
  const nonlinearity = 4 - maxW / 2;
  const isCI1 = [1, 2, 4].every((w) => W[w] === 0);
  const ones = tt.reduce((s, b) => s + b, 0);
  if (nonlinearity > 0 && isCI1)
    console.log(JSON.stringify({ rule, nonlinearity, ci1: true, weight: ones, balanced: ones === 4 }));
}
console.log('--- the 4 bipermutive elementary rules ---');
for (let rule = 0; rule < 256; rule++) {
  const tt = truthTable(rule);
  let lp = true, rp = true;
  for (let i = 0; i < 8; i++) {
    if ((i & 1) === 0 && tt[i] === tt[i | 1]) lp = false;
    if ((i & 4) === 0 && tt[i] === tt[i | 4]) rp = false;
  }
  if (lp && rp) {
    const W = walsh(tt); let maxW = 0;
    for (let w = 0; w < 8; w++) maxW = Math.max(maxW, Math.abs(W[w]));
    console.log(JSON.stringify({ rule, nonlinearity: 4 - maxW / 2,
      ci1: [1, 2, 4].every((w) => W[w] === 0), balanced: tt.reduce((s, b) => s + b, 0) === 4 }));
  }
}

// ---------------- (b) the affine relations of the reachable set ----------------
function rowAt(cfg, t) { let r = cfg; for (let s = 0; s < t; s++) r = (4n * r) ^ ((2n * r) | r); return r; }

function relations(m, t) {
  const N = m + 2 * t, free = m - 1, nCfg = 1 << free;
  const rows = [];
  for (let u = 0; u < nCfg; u++) rows.push(rowAt(1n | (BigInt(u) << 1n), t));
  // find every gamma in F_2^N with gamma . row constant over all rows.
  // Solve: the space of gamma orthogonal to all (row XOR row0). Gaussian elimination
  // on the N x nCfg matrix of differences, working in the gamma space.
  const diffs = rows.slice(1).map((r) => r ^ rows[0]);
  // build a basis of the span of diffs
  const piv = new Map();
  const topBit = (v) => { let i = -1; while (v > 0n) { v >>= 1n; i++; } return i; };
  for (const d of diffs) {
    let v = d;
    while (v !== 0n) { const p = topBit(v); if (!piv.has(p)) { piv.set(p, v); break; } v ^= piv.get(p); }
  }
  // gamma is a relation iff gamma . b = 0 for every basis vector b. Solve the
  // linear system by brute force over gamma's coordinates using the pivot structure:
  // free coordinates are those not in piv.
  const pivots = [...piv.keys()].sort((a, b) => a - b);
  const nonPivots = [];
  for (let i = 0; i < N; i++) if (!piv.has(i)) nonPivots.push(i);
  // reduced row echelon of the basis
  const basis = pivots.map((p) => piv.get(p));
  for (let i = 0; i < basis.length; i++)
    for (let j = 0; j < basis.length; j++)
      if (i !== j && ((basis[j] >> BigInt(pivots[i])) & 1n) === 1n) basis[j] ^= basis[i];
  // relation space: dimension N - rank; one generator per non-pivot coordinate
  const rels = [];
  for (const f of nonPivots) {
    let g = 1n << BigInt(f);
    for (let i = 0; i < basis.length; i++)
      if (((basis[i] >> BigInt(f)) & 1n) === 1n) g |= 1n << BigInt(pivots[i]);
    rels.push(g);
  }
  const described = rels.map((g) => {
    const bits = []; let v = g, i = 0;
    while (v > 0n) { if (v & 1n) bits.push(i); v >>= 1n; i++; }
    let par = 0; for (const b of bits) par ^= Number((rows[0] >> BigInt(b)) & 1n);
    return { bits, value: par };
  });
  return { m, t, N, rank: basis.length, relationDim: N - basis.length, relations: described };
}

console.log('\n--- (b) the exact affine relations "sum of these row bits = value" ---');
for (const [m, t] of [[12, 1], [12, 2], [12, 3], [12, 4], [12, 5], [14, 6]])
  console.log(JSON.stringify(relations(m, t)));

// ---------------- (c) Berlekamp-Massey on the centre column ---------------------
function centreColumn(T) {
  let r = 1n; const out = [Number(r & 1n)];
  for (let t = 1; t <= T; t++) {
    r = (4n * r) ^ ((2n * r) | r);
    out.push(Number((r >> BigInt(t)) & 1n));
  }
  return out;
}
function berlekampMassey(s) {
  const n = s.length;
  let C = new Uint8Array(n + 1), B = new Uint8Array(n + 1);
  C[0] = 1; B[0] = 1;
  let L = 0, mm = 1;
  const profile = [];
  for (let N = 0; N < n; N++) {
    let d = s[N];
    for (let i = 1; i <= L; i++) d ^= C[i] & s[N - i];
    if (d === 1) {
      const T = C.slice();
      for (let i = 0; i + mm <= n; i++) C[i + mm] ^= B[i];
      if (2 * L <= N) { L = N + 1 - L; B = T; mm = 1; } else mm++;
    } else mm++;
    profile.push(L);
  }
  return { L, profile };
}
function xorshift32(seed) { let x = seed >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x & 1; }; }

console.log('\n--- (c) linear complexity (Berlekamp-Massey over F_2) ---');
const T = 4096;
const cc = centreColumn(T - 1);
const coin = (() => { const g = xorshift32(0x2545f491); return Array.from({ length: T }, g); })();
// rule 90 column 1: black exactly at t = 2^j - 1, j >= 1
const r90 = Array.from({ length: T }, (_, n) => (n >= 1 && ((n + 1) & n) === 0 ? 1 : 0));
// Thue-Morse
const tm = Array.from({ length: T }, (_, n) => { let p = 0, x = n; while (x) { p ^= x & 1; x >>= 1; } return p; });
// an eventually periodic control: period 37
const per = Array.from({ length: T }, (_, n) => (n % 37 < 19 ? 1 : 0));
for (const [name, s] of [['rule30 centreColumn', cc], ['xorshift coin', coin],
                         ['rule90 column1 (2^j-1)', r90], ['Thue-Morse', tm], ['period-37', per]]) {
  const { L, profile } = berlekampMassey(s);
  const ratios = [256, 512, 1024, 2048, 4096].map((N) => +(profile[N - 1] / (N / 2)).toFixed(4));
  console.log(JSON.stringify({ name, N: T, L, LoverHalfN: +(L / (T / 2)).toFixed(4), profileRatiosAt: ratios }));
}
