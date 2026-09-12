// Rosetta, 2026-09-12. The reachable set of rows at depth t, as a subset of
// F_2^N, and its additive statistics: doubling, symmetry group, Fourier bias,
// additive energy, weight distribution.
//
// A_t(m) = { Phi_t(c) : c in F_2^m } embedded in F_2^(m+2t), where Phi_t is
// t-fold application of the packed row map. Pre-injectivity => |A| = 2^m, so
// the density is exactly 4^-t.
//
// Rules are given as the packed one-step map. Orientation convention: bit i of
// the new word is (left neighbour) OP (centre, right), i.e. new_i reads
// r_{i-2}, r_{i-1}, r_i, which in cell coordinates (cell x = bit - t at row t)
// is cell(x-1), cell(x), cell(x+1). Validated below against the board's own
// centre column and row weights.

const STEP = {
  // rule 30: left XOR (centre OR right)
  30: (r) => (4 * r) ^ ((2 * r) | r),
  // rule 86, rule 30's mirror: (left OR centre) XOR right
  86: (r) => ((4 * r) | (2 * r)) ^ r,
  // rule 90: left XOR right
  90: (r) => (4 * r) ^ r,
  // rule 150: left XOR centre XOR right
  150: (r) => (4 * r) ^ (2 * r) ^ r,
};

function popcount(x) {
  let c = 0;
  while (x) { x &= x - 1; c++; }
  return c;
}

// ---------------------------------------------------------------- validation

function validate() {
  console.log('=== engine validation (double-sided) ===');
  // 1. row weights of rule 30 from the single seed: the board's A070952 prefix
  let r = 1;
  const w = [];
  const col = [];
  for (let t = 0; t <= 10; t++) {
    w.push(popcount(r));
    // centre cell at row t is bit t
    col.push((r >> t) & 1);
    r = STEP[30](r);
  }
  console.log('  rule 30 row weights t=0..10 :', w.join(','));
  console.log('    board says 1,3,3,6,4 for t=0..4 ->',
    w.slice(0, 5).join(',') === '1,3,3,6,4' ? 'MATCH' : 'MISMATCH');
  console.log('  centre column t=0..10       :', col.join(''));
  console.log('    Basic.lean settledCenter prefix 11011100110 ->',
    col.join('') === '11011100110' ? 'MATCH' : 'MISMATCH');
  // 2. asymmetric check: the mirror must FAIL the centre column, and must
  //    agree on row weights (density is mirror-invariant), so passing the
  //    weight check alone would be no evidence at all.
  let rm = 1; const colm = []; const wm = [];
  for (let t = 0; t <= 10; t++) {
    wm.push(popcount(rm));
    colm.push((rm >> t) & 1);
    rm = STEP[86](rm);
  }
  console.log('  mirror (86) row weights     :', wm.join(','),
    wm.join(',') === w.join(',') ? '(same as 30, as expected)' : '(DIFFERENT - check)');
  console.log('  mirror (86) centre column   :', colm.join(''),
    colm.join('') !== col.join('') ? '(differs from 30, as required)' : '(SAME - ORIENTATION BUG)');
  // 3. rule 90 must be the Sierpinski triangle: weight 2^s2(t)
  let r9 = 1; let ok = true;
  for (let t = 0; t <= 12; t++) {
    const s2 = popcount(t);
    if (popcount(r9) !== 2 ** s2) ok = false;
    r9 = STEP[90](r9);
  }
  console.log('  rule 90 weight = 2^s2(t)    :', ok ? 'MATCH (t<=12)' : 'MISMATCH');
  console.log();
}

// ---------------------------------------------------------- the set and stats

function buildSet(rule, m, t) {
  const step = STEP[rule];
  const N = m + 2 * t;
  const size = 1 << N;
  const ind = new Int32Array(size);
  const members = new Int32Array(1 << m);
  for (let c = 0; c < (1 << m); c++) {
    let r = c;
    for (let s = 0; s < t; s++) r = step(r);
    members[c] = r;
    ind[r] = 1;
  }
  let K = 0;
  for (let i = 0; i < size; i++) K += ind[i];
  return { N, size, ind, members, K };
}

function wht(a) { // in-place Walsh-Hadamard on Float64Array of length 2^N
  const n = a.length;
  for (let len = 1; len < n; len <<= 1) {
    for (let i = 0; i < n; i += len << 1) {
      for (let j = i; j < i + len; j++) {
        const u = a[j], v = a[j + len];
        a[j] = u + v; a[j + len] = u - v;
      }
    }
  }
}

function stats(label, { N, size, ind, members, K }) {
  // Fourier transform of the indicator
  const f = new Float64Array(size);
  for (let i = 0; i < size; i++) f[i] = ind[i];
  wht(f);
  let maxF = 0, maxFat = -1;
  for (let g = 1; g < size; g++) {
    const v = Math.abs(f[g]);
    if (v > maxF) { maxF = v; maxFat = g; }
  }
  // autocorrelation  corr(h) = |A cap (A+h)|  via inverse WHT of f^2
  const c = new Float64Array(size);
  for (let i = 0; i < size; i++) c[i] = f[i] * f[i];
  wht(c);
  let maxC = 0, maxCat = -1, sym = 0, energy = 0;
  for (let h = 0; h < size; h++) {
    const v = c[h] / size;
    energy += v * v;
    if (h === 0) continue;
    if (Math.round(v) === K) sym++;
    if (v > maxC) { maxC = v; maxCat = h; }
  }
  // sumset size
  const hit = new Uint8Array(size);
  for (let i = 0; i < members.length; i++) {
    const a = members[i];
    for (let j = i; j < members.length; j++) hit[a ^ members[j]] = 1;
  }
  let sumset = 0;
  for (let i = 0; i < size; i++) sumset += hit[i];
  // weight distribution of the members
  let wmin = 1e9, wmax = -1, wsum = 0;
  for (const a of members) { const w = popcount(a); if (w < wmin) wmin = w; if (w > wmax) wmax = w; wsum += w; }
  const rnd = K * K / size; // random-set autocorrelation level
  console.log(`${label}  N=${N} |A|=${K} density=${(K / size).toExponential(3)}`);
  console.log(`   |A+A|/|A|        = ${(sumset / K).toFixed(4)}   (|A+A|=${sumset}, subspace would be 1, full group ${(size / K).toFixed(0)})`);
  console.log(`   |Sym(A)|         = ${sym + 1}   (subspace would be ${K})`);
  console.log(`   max_{h!=0} |A n (A+h)|/|A| = ${(maxC / K).toFixed(6)}  at h=${maxCat}  (random level ${(rnd / K).toExponential(2)}, subspace 1)`);
  console.log(`   max_{g!=0} |A^(g)|/|A|     = ${(maxF / K).toFixed(6)}  at g=${maxFat}  (subspace 1, random ~${(Math.sqrt(2 * N * K) / K).toFixed(4)})`);
  console.log(`   additive energy E(A)/|A|^3 = ${(energy / K ** 3).toExponential(3)}  (subspace 1, random ~${((K * K + K ** 4 / size) / K ** 3).toExponential(2)})`);
  console.log(`   member weights: min=${wmin} max=${wmax} mean=${(wsum / K).toFixed(3)}  of N=${N}  (mean/N=${(wsum / K / N).toFixed(4)})`);
  console.log();
  return { sumset, sym: sym + 1, maxC, maxF, K, N, size, wmax, wmin };
}

function randomSet(N, K, seed) {
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const size = 1 << N;
  const ind = new Int32Array(size);
  const members = new Int32Array(K);
  let n = 0;
  while (n < K) {
    const x = Math.floor(rnd() * size);
    if (!ind[x]) { ind[x] = 1; members[n++] = x; }
  }
  return { N, size, ind, members, K };
}

// ------------------------------------------------------------------- driver

validate();

console.log('=== A_t(m): reachable rows at depth t from a window of length m ===');
console.log('(ambient F_2^N, N = m + 2t; density 4^-t by pre-injectivity)\n');

for (const [m, t] of [[10, 5], [12, 4], [14, 3], [16, 2], [8, 6]]) {
  for (const rule of [30, 90, 150, 86]) {
    stats(`rule ${rule}  m=${m} t=${t}`, buildSet(rule, m, t));
  }
  const N = m + 2 * t;
  stats(`RANDOM    m=${m} t=${t}`, randomSet(N, 1 << m, 12345 + m));
  console.log('-----------------------------------------------------------\n');
}
