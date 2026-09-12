// Parallax 12 / B'. What the multiplier actually is, once rank is ruled out.
//
// B1/B2 showed rank(D f^t) separates rule 30 from rules 90/150/86 but NOT
// linear from nonlinear: rule 86 (rule 30's mirror, equally nonlinear) is
// full rank at every t, and rule 60 (linear) collapses to rank 0. So rank is a
// permutivity-orientation statistic, not a linearity one, and the document must
// not claim otherwise.
//
// The statistic Baker's method actually needs is different and sharper: the
// composite derivative must be ONE FIXED algebraic object. For the 3x+1 map the
// derivative is the scalar 3/2 or 1/2 depending only on the branch, so D(f^s)
// along a cycle is 3^r/2^s -- a monomial in two fixed numbers. That happens
// exactly when the Jacobian does not depend on the point.
//
// Measured here: (i) the number of distinct Jacobians over all 2^n points;
// (ii) the corank growth rate of the composite derivative.

const table = (rule) => { const t = []; for (let k = 0; k < 8; k++) t.push((rule >> k) & 1); return t; };
const apply = (tb, l, c, r) => tb[4 * l + 2 * c + r];
const partials = (tb, l, c, r) => {
  const v = apply(tb, l, c, r);
  return [v ^ apply(tb, l ^ 1, c, r), v ^ apply(tb, l, c ^ 1, r), v ^ apply(tb, l, c, r ^ 1)];
};
const bitsOf = (r, n) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = Number((r >> BigInt(i)) & 1n); return b; };
function stepBits(tb, b) {
  const n = b.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) o[i] = apply(tb, i >= 2 ? b[i - 2] : 0, i >= 1 ? b[i - 1] : 0, b[i]);
  return o;
}
function jacobian(tb, b) {
  const n = b.length, J = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) {
    const [dl, dc, dr] = partials(tb, i >= 2 ? b[i - 2] : 0, i >= 1 ? b[i - 1] : 0, b[i]);
    let row = 0n;
    if (dl && i >= 2) row ^= 1n << BigInt(i - 2);
    if (dc && i >= 1) row ^= 1n << BigInt(i - 1);
    if (dr) row ^= 1n << BigInt(i);
    J[i] = row;
  }
  return J;
}
function matmul(A, B, n) {
  const out = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) { let acc = 0n; const a = A[i]; for (let k = 0; k < n; k++) if ((a >> BigInt(k)) & 1n) acc ^= B[k]; out[i] = acc; }
  return out;
}
function rank(M, n) {
  const rows = M.slice(); let r = 0;
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

const RULES = [[30, "rule 30"], [90, "rule 90  [linear]"], [150, "rule 150 [linear]"],
               [60, "rule 60  [linear]"], [110, "rule 110"], [86, "rule 86 (mirror of 30)"]];

// ============================================ B6. is the Jacobian constant?
// Exhaustive over all 2^n points. A constant Jacobian is exactly the case where
// D(f^t) is a single matrix power -- the "one monomial in fixed numbers" that
// makes a linear form in logarithms available.
console.log("== B6  number of DISTINCT Jacobians over all 2^n points (exhaustive) ==");
for (const n of [6, 10, 14, 18]) {
  const out = [];
  for (const [rule, name] of RULES) {
    const tb = table(rule);
    const seen = new Set();
    for (let r = 0; r < (1 << n); r++) seen.add(jacobian(tb, bitsOf(BigInt(r), n)).join(","));
    out.push(`${rule}:${seen.size}`);
  }
  console.log(`  n=${String(n).padStart(3)} (2^${n} points)   ${out.join("  ")}`);
}
console.log("  => exactly 1 for every linear rule, at every width: the derivative is");
console.log("     a fixed matrix and D(f^t) = J^t. Rule 30's count grows with 2^n.");

// ================================= B7. corank growth rate of the composite
console.log("\n== B7  corank of D(f^t) along the seed's orbit: rate per step ==");
for (const n of [64, 128, 192, 256]) {
  const out = [];
  for (const [rule, name] of RULES) {
    const tb = table(rule);
    let b = bitsOf(1n, n);
    let P = new Array(n).fill(0n);
    for (let i = 0; i < n; i++) P[i] = 1n << BigInt(i);
    const T = Math.floor(n / 4);
    for (let t = 1; t <= T; t++) { P = matmul(jacobian(tb, b), P, n); b = stepBits(tb, b); }
    const co = n - rank(P, n);
    out.push(`${rule}:${(co / T).toFixed(4)}`);
  }
  console.log(`  n=${String(n).padStart(4)} t=${String(Math.floor(n / 4)).padStart(3)}  corank/t   ${out.join("  ")}`);
}
console.log("  (rule 60 is the exact control: its corank is t exactly, rate 1.0000)");

// ==================================== B8. the corank rate, read more finely
console.log("\n== B8  rule 30's corank(D f^t) as a function of t, n = 512 ==");
{
  const n = 512, tb = table(30);
  let b = bitsOf(1n, n);
  let P = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) P[i] = 1n << BigInt(i);
  const marks = [8, 16, 32, 48, 64, 80, 96, 112, 128];
  for (let t = 1; t <= 128; t++) {
    P = matmul(jacobian(tb, b), P, n); b = stepBits(tb, b);
    if (marks.includes(t)) {
      const co = n - rank(P, n);
      console.log(`  t=${String(t).padStart(4)}  rank=${String(rank(P, n)).padStart(4)}  corank=${String(co).padStart(4)}  corank/t=${(co / t).toFixed(4)}`);
    }
  }
}
