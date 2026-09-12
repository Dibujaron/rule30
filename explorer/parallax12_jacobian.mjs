// Parallax 12 / B. The multiplier.
//
// Every cycle-exclusion argument in arithmetic dynamics runs on a MULTIPLIER:
// the derivative of the map along the orbit. For the 3x+1 shortcut map the
// derivative on each branch is the scalar 3/2 or 1/2, so the derivative of the
// s-fold composite of a cycle with r odd steps is exactly 3^r / 2^s -- ONE
// monomial in two fixed numbers, which is what makes the return condition a
// linear form in two logarithms and Baker's theorem applicable.
//
// This script computes the analogue for a cellular automaton read as a map on
// n-bit words: the Jacobian over F_2 of the row map, at a point, and the
// Jacobian of the t-fold composite along the seed's own orbit.
//
// For an elementary rule with bit i of f(r) = R(r_{i-2}, r_{i-1}, r_i), the
// partial derivatives are the discrete derivatives of R, evaluated at the point.
// Everything is exact F_2 linear algebra; nothing is sampled.

// ------------------------------------------------------------------ rule tables
// Wolfram numbering: index = 4*left + 2*centre + 1*right, and in the packed row
// bit i's left neighbour is bit i-2, centre bit i-1, right bit i.  (Rule 30's
// row map is (4r) XOR ((2r) OR r): bit i = r_{i-2} XOR (r_{i-1} OR r_i).)
const table = (rule) => {
  const t = [];
  for (let k = 0; k < 8; k++) t.push((rule >> k) & 1);
  return t; // t[4l+2c+r]
};
const apply = (tb, l, c, r) => tb[4 * l + 2 * c + r];

// discrete partials of R at (l,c,r): d/dl, d/dc, d/dr, each in F_2
const partials = (tb, l, c, r) => {
  const v = apply(tb, l, c, r);
  return [
    v ^ apply(tb, l ^ 1, c, r),
    v ^ apply(tb, l, c ^ 1, r),
    v ^ apply(tb, l, c, r ^ 1),
  ];
};

// ------------------------------------------------------- engine on n-bit words
const bitsOf = (r, n) => {
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = Number((r >> BigInt(i)) & 1n);
  return b;
};
const rowStepBig = (r) => (4n * r) ^ ((2n * r) | r);
function stepBits(tb, b) {
  const n = b.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = i >= 2 ? b[i - 2] : 0, c = i >= 1 ? b[i - 1] : 0, rr = b[i];
    o[i] = apply(tb, l, c, rr);
  }
  return o;
}

// ------------------------------------------------------------- F_2 matrix tools
// rows as arrays of BigInt bitmasks over n columns
function jacobian(tb, b) {
  const n = b.length;
  const J = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) {
    const l = i >= 2 ? b[i - 2] : 0, c = i >= 1 ? b[i - 1] : 0, rr = b[i];
    const [dl, dc, dr] = partials(tb, l, c, rr);
    let row = 0n;
    if (dl && i >= 2) row ^= 1n << BigInt(i - 2);
    if (dc && i >= 1) row ^= 1n << BigInt(i - 1);
    if (dr) row ^= 1n << BigInt(i);
    J[i] = row;
  }
  return J;
}
function matmul(A, B, n) { // (A.B)_{ij} = sum_k A_ik B_kj ; A,B row-mask form
  const out = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) {
    let acc = 0n, a = A[i];
    for (let k = 0; k < n; k++) if ((a >> BigInt(k)) & 1n) acc ^= B[k];
    out[i] = acc;
  }
  return out;
}
function rank(M, n) {
  const rows = M.slice();
  let r = 0;
  for (let col = 0; col < n && r < rows.length; col++) {
    let piv = -1;
    for (let i = r; i < rows.length; i++) if ((rows[i] >> BigInt(col)) & 1n) { piv = i; break; }
    if (piv < 0) continue;
    [rows[r], rows[piv]] = [rows[piv], rows[r]];
    for (let i = 0; i < rows.length; i++) if (i !== r && ((rows[i] >> BigInt(col)) & 1n)) rows[i] ^= rows[r];
    r++;
  }
  return r;
}

// ============================================================ B1. one-step
const RULES = [
  [30, "rule 30 (the object)"],
  [90, "rule 90  = left XOR right          [linear control]"],
  [150, "rule 150 = left XOR centre XOR right [linear control]"],
  [60, "rule 60  = left XOR centre         [linear control]"],
  [110, "rule 110 (nonlinear control)"],
  [86, "rule 86  (rule 30's mirror)"],
];

console.log("== B1  one-step Jacobian over F_2 at the seed's own rows, n = 32 ==");
console.log("    det J is 1 iff J is invertible over F_2 (the only unit).");
{
  const n = 32;
  for (const [rule, name] of RULES) {
    const tb = table(rule);
    let b = bitsOf(1n, n);
    let invertible = 0, ranks = [];
    for (let t = 0; t < 200; t++) {
      const J = jacobian(tb, b);
      const rk = rank(J, n);
      ranks.push(rk);
      if (rk === n) invertible++;
      b = stepBits(tb, b);
    }
    const mn = Math.min(...ranks), mx = Math.max(...ranks);
    const av = (ranks.reduce((a, x) => a + x, 0) / ranks.length).toFixed(2);
    console.log(
      `  ${name.padEnd(38)} rank J in [${mn},${mx}] mean ${av} of ${n}; invertible at ${invertible}/200 rows`
    );
  }
}

// =========================================== B2. the composite's multiplier
// The multiplier of a would-be cycle is the product of the Jacobians along it.
// In the 3x+1 case that product is the scalar 3^r/2^s, never zero.
console.log("\n== B2  Jacobian of the t-fold composite along the seed's orbit, n = 32 ==");
{
  const n = 32;
  for (const [rule, name] of RULES) {
    const tb = table(rule);
    let b = bitsOf(1n, n);
    let P = new Array(n).fill(0n);
    for (let i = 0; i < n; i++) P[i] = 1n << BigInt(i); // identity
    const trace = [];
    let firstZero = -1;
    for (let t = 1; t <= 64; t++) {
      const J = jacobian(tb, b);
      P = matmul(J, P, n); // D(f^t) = Df(x_{t-1}) . D(f^{t-1})
      b = stepBits(tb, b);
      const rk = rank(P, n);
      if (rk === 0 && firstZero < 0) firstZero = t;
      if ([1, 2, 4, 8, 16, 32, 64].includes(t)) trace.push(`t=${t}:${rk}`);
    }
    console.log(
      `  ${name.padEnd(38)} rank D(f^t): ${trace.join(" ")}   first rank 0 at t=${firstZero < 0 ? "never (<=64)" : firstZero}`
    );
  }
}

// ============================== B3. is the rank deficit a cone artefact?
// A rank-0 composite derivative could be an artefact of the truncation (bits
// leaving the window). Repeat at several widths and print the rank at t = n/2,
// which is inside the cone at every width.
console.log("\n== B3  the same, at several widths, read at t = n/4 (well inside the window) ==");
{
  for (const n of [16, 32, 64, 96, 128]) {
    const out = [];
    for (const [rule, name] of RULES) {
      const tb = table(rule);
      let b = bitsOf(1n, n);
      let P = new Array(n).fill(0n);
      for (let i = 0; i < n; i++) P[i] = 1n << BigInt(i);
      const T = Math.floor(n / 4);
      for (let t = 1; t <= T; t++) { P = matmul(jacobian(tb, b), P, n); b = stepBits(tb, b); }
      out.push(`${rule}:${rank(P, n)}`);
    }
    console.log(`  n=${String(n).padStart(4)} t=${String(Math.floor(n / 4)).padStart(3)}  rank D(f^t) by rule  ${out.join("  ")}`);
  }
}

// =============== B4. the control that matters: is rule 30's T_n a bijection?
// A linear invertible row map has pure cycles and no tails at all, which is the
// setting cycle exclusion lives in. Count the image size.
console.log("\n== B4  image size of the truncated row map (a bijection has no tails) ==");
{
  for (const n of [8, 12, 16]) {
    const out = [];
    for (const [rule, name] of RULES) {
      const tb = table(rule);
      const seen = new Set();
      for (let r = 0; r < (1 << n); r++) {
        const b = bitsOf(BigInt(r), n);
        const o = stepBits(tb, b);
        let v = 0;
        for (let i = n - 1; i >= 0; i--) v = v * 2 + o[i];
        seen.add(v);
      }
      out.push(`${rule}:2^${(Math.log2(seen.size)).toFixed(2)}`);
    }
    console.log(`  n=${n}  |image| = ${out.join("  ")}   (2^${n} states)`);
  }
}

// ============ B5. cross-check the Jacobian against a brute-force difference
console.log("\n== B5  cross-check: Jacobian column j vs flipping bit j (exact, all points) ==");
{
  const n = 10;
  let bad = 0, tested = 0;
  for (const [rule] of RULES) {
    const tb = table(rule);
    for (let r = 0; r < (1 << n); r++) {
      const b = bitsOf(BigInt(r), n);
      const base = stepBits(tb, b);
      const J = jacobian(tb, b);
      for (let j = 0; j < n; j++) {
        const b2 = b.slice(); b2[j] ^= 1;
        const alt = stepBits(tb, b2);
        for (let i = 0; i < n; i++) {
          const brute = base[i] ^ alt[i];
          const lin = Number((J[i] >> BigInt(j)) & 1n);
          tested++;
          if (brute !== lin) bad++;
        }
      }
    }
  }
  console.log(`  ${tested} (rule, point, i, j) comparisons, ${bad} disagreements`);
  console.log(`  (a disagreement is impossible: over F_2 a single-variable flip IS the partial)`);
}
