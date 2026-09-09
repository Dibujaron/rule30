// Parallax, 2026-09-09. Does rule 30 conserve any additive quantity?
//
// Kari & Taati (arXiv:1311.2319) prove that the simplex of shift-invariant
// Gibbs measures for a Hamiltonian is invariant under a surjective CA iff the
// CA conserves that Hamiltonian. Rule 30 is surjective, so the question "is
// rule 30's picture a Gibbs state for a Holder potential?" reduces to "which
// additive quantities does rule 30 conserve?".
//
// An additive quantity of range n is phi : {0,1}^n -> Q, summed cyclically over
// a ring. It is conserved iff sum phi(windows of F x) = sum phi(windows of x)
// for every ring configuration x. That is a linear condition on phi, so the
// conserved quantities form a vector space, computed here exactly (rank over
// a prime field, run twice with different primes as a control).
//
// TRIVIAL conserved quantities, which every rule has:
//   - constants (dimension 1),
//   - "coboundaries" phi(w) = psi(w[0..n-2]) - psi(w[1..n-1]) (dimension
//     2^(n-1) - 1), which telescope to zero on any ring and so are the zero
//     functional.
// Together they span a space of dimension exactly 2^(n-1). So:
//     dim(conserved) == 2^(n-1)   <=>   NO non-trivial conservation law of range n.
//
// Controls: the same computation is run on rule 184 (traffic rule, conserves
// the number of black cells -- range 1, one non-trivial law) and rule 90
// (linear, conserves nothing beyond the trivial? -- reported, not assumed).

const RULES = [30, 184, 90, 150, 204];
const NMAX = 8;
const LEXH = 13;          // rings up to this size, exhaustively
const LRAND = [14, 16, 18, 20, 22];
const NRAND = 4000;
const PRIMES = [1000003, 999983];

function stepRing(rule, x, L) {
  const y = new Uint8Array(L);
  for (let i = 0; i < L; i++) {
    const l = x[(i - 1 + L) % L], c = x[i], r = x[(i + 1) % L];
    y[i] = (rule >> (4 * l + 2 * c + r)) & 1;
  }
  return y;
}

// vector of window-count differences, length 2^n
function rowFor(rule, x, L, n) {
  const v = new Int32Array(1 << n);
  const y = stepRing(rule, x, L);
  for (let i = 0; i < L; i++) {
    let a = 0, b = 0;
    for (let k = 0; k < n; k++) { a |= x[(i + k) % L] << k; b |= y[(i + k) % L] << k; }
    v[b]++; v[a]--;
  }
  return v;
}

function rankModP(rows, ncols, p) {
  const basis = new Array(ncols).fill(null);   // basis[pivot] = reduced row
  let rank = 0;
  for (const raw of rows) {
    const r = new Int32Array(ncols);
    for (let i = 0; i < ncols; i++) r[i] = ((raw[i] % p) + p) % p;
    for (let c = 0; c < ncols; c++) {
      if (r[c] === 0) continue;
      if (basis[c] === null) {
        // normalise
        const inv = modInv(r[c], p);
        for (let i = c; i < ncols; i++) r[i] = (r[i] * inv) % p;
        basis[c] = r; rank++; break;
      }
      const f = r[c], b = basis[c];
      for (let i = c; i < ncols; i++) r[i] = (r[i] - f * b[i]) % p, r[i] = (r[i] + p) % p;
    }
  }
  return rank;
}

function modInv(a, p) {
  let [old_r, r] = [a, p], [old_s, s] = [1, 0];
  while (r !== 0) { const q = Math.floor(old_r / r); [old_r, r] = [r, old_r - q * r]; [old_s, s] = [s, old_s - q * s]; }
  return ((old_s % p) + p) % p;
}

function randRing(L) {
  const x = new Uint8Array(L);
  for (let i = 0; i < L; i++) x[i] = (Math.random() < 0.5) ? 0 : 1;
  return x;
}

for (const rule of RULES) {
  console.log(`\n=== rule ${rule} ===`);
  console.log('n   dim(conserved)  trivial=2^(n-1)  non-trivial laws');
  for (let n = 1; n <= NMAX; n++) {
    const ncols = 1 << n;
    const rows = [];
    for (let L = Math.max(n + 1, 3); L <= LEXH; L++)
      for (let m = 0; m < (1 << L); m++) {
        const x = new Uint8Array(L);
        for (let i = 0; i < L; i++) x[i] = (m >> i) & 1;
        rows.push(rowFor(rule, x, L, n));
      }
    for (const L of LRAND)
      for (let s = 0; s < NRAND; s++) rows.push(rowFor(rule, randRing(L), L, n));

    const ranks = PRIMES.map(p => rankModP(rows, ncols, p));
    const rank = ranks[0];
    const dim = ncols - rank;
    const trivial = 1 << (n - 1);
    console.log(
      String(n).padEnd(3), String(dim).padEnd(15), String(trivial).padEnd(16),
      dim - trivial, ranks[0] === ranks[1] ? '' : `  (PRIME DISAGREEMENT ${ranks})`);
  }
}
