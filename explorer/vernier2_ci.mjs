// Vernier, 2026-09-12. The cryptographic Boolean-function profile of rule 30 and of
// its depth-t composition, in the vocabulary the small-bias / stream-cipher literature
// uses: Walsh-Hadamard spectrum, balancedness, nonlinearity, correlation immunity,
// resiliency, algebraic degree, permutivity on each side.
//
// Why these: the field's sufficient conditions for a nonlinear generator to have small
// bias are (i) resiliency of order m (balanced + correlation-immune of order m) and
// (ii) high nonlinearity. Leporati and Mariot's theorem gives (i) with m = 1 for
// BIPERMUTIVE rules. The question this script answers is which of those rule 30 has.

const f30 = (l, c, r) => (l ^ (c | r)) & 1;

// ---- 1. the local rule as a 3-variable Boolean function ----------------------
// variable order (x0,x1,x2) = (left, centre, right); index = x0 + 2*x1 + 4*x2
function truthTable(rule) {
  const tt = [];
  for (let i = 0; i < 8; i++) {
    const l = i & 1, c = (i >> 1) & 1, r = (i >> 2) & 1;
    tt.push((rule >> (4 * l + 2 * c + r)) & 1);   // Wolfram numbering: l high bit
  }
  return tt;
}

function walsh(tt) {
  const n = tt.length;
  const f = tt.map((b) => (b ? -1 : 1));
  for (let len = 1; len < n; len <<= 1)
    for (let i = 0; i < n; i += len << 1)
      for (let j = i; j < i + len; j++) {
        const a = f[j], b = f[j + len];
        f[j] = a + b; f[j + len] = a - b;
      }
  return f;   // f[w] = sum_x (-1)^{f(x) + w.x}
}

function anf(tt) {
  const n = tt.length, a = tt.slice();
  for (let len = 1; len < n; len <<= 1)
    for (let i = 0; i < n; i += len << 1)
      for (let j = i; j < i + len; j++) a[j + len] ^= a[j];
  return a;   // Mobius transform: a[S] = coefficient of monomial S
}

function popc(x) { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; }

function profile(rule, nvars = 3) {
  const tt = truthTable(rule);
  const W = walsh(tt);
  const size = tt.length;
  const ones = tt.reduce((s, b) => s + b, 0);
  const balanced = ones * 2 === size;
  // nonlinearity = 2^{n-1} - (1/2) max_{w} |W(w)|
  let maxW = 0;
  for (let w = 0; w < size; w++) maxW = Math.max(maxW, Math.abs(W[w]));
  const nonlinearity = size / 2 - maxW / 2;
  // correlation immunity order: largest m with W(w) = 0 for all 1 <= |w| <= m
  let ci = 0;
  for (let m = 1; m <= nvars; m++) {
    let ok = true;
    for (let w = 1; w < size; w++) if (popc(w) <= m && W[w] !== 0) { ok = false; break; }
    if (ok) ci = m; else break;
  }
  const resiliency = balanced ? ci : -1;
  const A = anf(tt);
  let deg = 0;
  for (let s = 0; s < size; s++) if (A[s]) deg = Math.max(deg, popc(s));
  // permutivity: is f(x0,..) = x0 XOR g(rest)? and likewise in the last variable?
  let leftPerm = true, rightPerm = true;
  for (let i = 0; i < size; i++) {
    if ((i & 1) === 0 && tt[i] === tt[i | 1]) leftPerm = false;             // flip x0
    const top = 1 << (nvars - 1);
    if ((i & top) === 0 && tt[i] === tt[i | top]) rightPerm = false;        // flip x_{n-1}
  }
  // per-variable correlation: |W(e_i)| / 2^n
  const corr = [];
  for (let i = 0; i < nvars; i++) corr.push(Math.abs(W[1 << i]) / size);
  return { rule, balanced, nonlinearity, ci, resiliency, degree: deg,
           leftPermutive: leftPerm, rightPermutive: rightPerm,
           corrWithEachInput: corr, anfMonomials: A.map((v, s) => v ? s : -1).filter((s) => s >= 0) };
}

console.log('--- local rules, variable order (left, centre, right) ---');
for (const r of [30, 86, 90, 150, 60, 45, 106, 105]) console.log(JSON.stringify(profile(r)));

// ---- 2. the depth-t map, as a function of the configuration bits --------------
// Configuration: cells 0..m-1, cell 0 black, cells 1..m-1 free (n = m-1 variables).
// Output studied: the centre cell at time t, which is the cell at position 0, i.e.
// bit t of the packed row -- the coordinate Prize 1 and Prize 2 are about.
function rowAt(cfg, t) {
  let r = cfg;
  for (let s = 0; s < t; s++) r = (4n * r) ^ ((2n * r) | r);
  return r;
}

function centreBitFunction(t) {
  // cell at position 0 at time t depends on config cells 0..t only (cells < 0 white,
  // and cells > t cannot reach position 0 in t steps). Cell 0 is black, so the free
  // variables are cells 1..t: n = t variables.
  const n = t;
  const size = 1 << n;
  const tt = new Array(size);
  for (let u = 0; u < size; u++) {
    const cfg = 1n | (BigInt(u) << 1n);
    tt[u] = Number((rowAt(cfg, t) >> BigInt(t)) & 1n);
  }
  return tt;
}

console.log('--- the centre cell at time t as a Boolean function of config cells 1..t ---');
console.log('(family: leftmost black cell pinned at the origin; the single seed is u = 0)');
for (let t = 1; t <= 22; t++) {
  const tt = centreBitFunction(t);
  const size = tt.length;
  const ones = tt.reduce((s, b) => s + b, 0);
  const bias = Math.abs(2 * ones - size) / size;
  const W = walsh(tt);
  let maxW = 0, argm = 0;
  for (let w = 1; w < size; w++) if (Math.abs(W[w]) > maxW) { maxW = Math.abs(W[w]); argm = w; }
  const nonlinearity = size / 2 - Math.max(maxW, Math.abs(W[0])) / 2;
  const A = anf(tt);
  let deg = 0;
  for (let s = 0; s < size; s++) if (A[s]) deg = Math.max(deg, popc(s));
  const nmon = A.reduce((s, v) => s + v, 0);
  let ci = 0;
  for (let m = 1; m <= t; m++) {
    let ok = true;
    for (let w = 1; w < size; w++) if (popc(w) <= m && W[w] !== 0) { ok = false; break; }
    if (ok) ci = m; else break;
  }
  console.log(JSON.stringify({
    t, nvars: t, blackFraction: ones / size, bias: +bias.toFixed(6),
    degree: deg, anfDensity: +(nmon / size).toFixed(4),
    maxWalshFrac: +(maxW / size).toFixed(4), argmaxWeight: popc(argm),
    ci, nonlinearityFrac: +(nonlinearity / (size / 2)).toFixed(4),
    seedValue: tt[0],
  }));
}
