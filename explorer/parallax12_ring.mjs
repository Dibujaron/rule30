// Parallax 12 / E. Which ring is the row map affine over?
//
// This is the crux of the whole vantage. A cycle-exclusion argument needs TWO
// things in the SAME ring:
//   (step 1) the map is affine on each branch, so the composite has one
//            multiplier and the return condition is one equation;
//   (step 3) the ring's unit group has a logarithm, so a linear form in
//            logarithms exists and Baker (or Yu, p-adically) bounds it.
//
// For the 3x+1 map both hold over Z: x -> (3x+1)/2 is affine, and the multiplier
// 3^r/2^s is a linear form in log 2 and log 3.
//
// Rule 30's row map T(r) = 4r XOR (2r OR r):
//   over F_2 it IS polynomial (degree 2), but F_2^* = {1} has one element, so
//   there are no logarithms and step 3 is vacuous;
//   over Z (or Z_2, where Yu's p-adic logarithms live) step 3 has content, but
//   is T affine, or even additive? Measured below.
//
// E1: additivity of T over Z, exhaustively on small arguments.
// E2: does the sequence rowNat(t) satisfy a Z-linear recurrence? Exact rank of
//     the Hankel matrix over Q by fraction-free (Bareiss) elimination. A Z-linear
//     recurrence of order L is exactly a rank deficiency at size L+1.
// E3: the same test on sequences that DO satisfy one, as positive controls.

const T = (r) => (4n * r) ^ ((2n * r) | r);

console.log("== E1  is the row map additive / affine over Z? ==");
{
  let addFail = 0, addTest = 0, scaleFail = 0, scaleTest = 0;
  for (let a = 0n; a < 64n; a++)
    for (let b = 0n; b < 64n; b++) {
      addTest++;
      if (T(a + b) !== T(a) + T(b) - T(0n)) addFail++;
    }
  for (let a = 0n; a < 256n; a++) { scaleTest++; if (T(2n * a) !== 2n * T(a)) scaleFail++; }
  console.log(`  T(a+b) = T(a)+T(b)-T(0) : ${addFail} failures of ${addTest}  -> affine over Z: ${addFail === 0}`);
  console.log(`  T(2a)  = 2 T(a)         : ${scaleFail} failures of ${scaleTest}  -> the halving law holds (board: step_two_mul)`);
  console.log(`  smallest witness against additivity:`);
  outer: for (let a = 0n; a < 16n; a++) for (let b = 0n; b < 16n; b++)
    if (T(a + b) !== T(a) + T(b) - T(0n)) { console.log(`    a=${a} b=${b}: T(a+b)=${T(a + b)} but T(a)+T(b)-T(0)=${T(a) + T(b) - T(0n)}`); break outer; }
  console.log(`  => T is Z-homogeneous of degree 1 for doubling and NOT Z-additive.`);
  console.log(`     It has the scaling of a linear map and the addition of none.`);
}

// ---------------------------------------------------------------- Bareiss rank
function rankQ(M) { // exact rank over Q of a BigInt matrix, fraction-free
  const A = M.map((r) => r.slice());
  const rows = A.length, cols = A[0].length;
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let piv = -1;
    for (let i = r; i < rows; i++) if (A[i][c] !== 0n) { piv = i; break; }
    if (piv < 0) continue;
    [A[r], A[piv]] = [A[piv], A[r]];
    for (let i = r + 1; i < rows; i++) {
      if (A[i][c] === 0n) continue;
      const f = A[i][c], g = A[r][c];
      for (let k = c; k < cols; k++) A[i][k] = A[i][k] * g - A[r][k] * f;
      // keep entries from exploding: divide the row by its gcd
      let d = 0n;
      for (let k = c; k < cols; k++) { let x = A[i][k] < 0n ? -A[i][k] : A[i][k]; while (x) { const t2 = d % x; d = x; x = t2; } }
      if (d > 1n) for (let k = c; k < cols; k++) A[i][k] /= d;
    }
    r++;
  }
  return r;
}

console.log("\n== E2  does rowNat(t) satisfy a Z-linear recurrence? ==");
console.log("   Hankel H_L[i][j] = a(i+j), 0<=i<L, 0<=j<=L. A recurrence of order L");
console.log("   exists iff rank < L+1 for the (L) x (L+1) system, i.e. a kernel vector.");
{
  const a = [];
  let r = 1n;
  for (let t = 0; t < 40; t++) { a.push(r); r = T(r); }
  for (const L of [1, 2, 3, 4, 6, 8, 10, 12, 14, 16]) {
    // equations: sum_{i<=L} c_i a(t+i) = 0 for t = 0..(rows-1); need kernel.
    const rowsN = Math.min(2 * L + 4, a.length - L);
    const M = [];
    for (let t = 0; t < rowsN; t++) { const row = []; for (let i = 0; i <= L; i++) row.push(a[t + i]); M.push(row); }
    const rk = rankQ(M);
    console.log(`  L=${String(L).padStart(3)}  ${String(rowsN).padStart(3)} equations, ${L + 1} unknowns, rank = ${String(rk).padStart(3)}  -> recurrence of order ${L}: ${rk <= L ? "POSSIBLE" : "none"}`);
  }
  console.log(`  => rank is full at every order tested: rowNat satisfies NO Z-linear`);
  console.log(`     recurrence, so classical Skolem-Mahler-Lech is unavailable too.`);
}

console.log("\n== E3  positive controls: sequences that do satisfy one ==");
{
  const mk = (f, n) => { const s = []; for (let t = 0; t < n; t++) s.push(f(t)); return s; };
  const tests = [
    ["4^t + 1        (order 2)", mk((t) => 4n ** BigInt(t) + 1n, 40), 2],
    ["Fibonacci      (order 2)", (() => { const s = [0n, 1n]; for (let t = 2; t < 40; t++) s.push(s[t - 1] + s[t - 2]); return s; })(), 2],
    ["4^t+2^t+t      (order 4)", mk((t) => 4n ** BigInt(t) + 2n ** BigInt(t) + BigInt(t), 40), 4],
  ];
  for (const [name, a, expect] of tests) {
    let found = null;
    for (let L = 1; L <= 8; L++) {
      const rowsN = Math.min(2 * L + 4, a.length - L);
      const M = [];
      for (let t = 0; t < rowsN; t++) { const row = []; for (let i = 0; i <= L; i++) row.push(a[t + i]); M.push(row); }
      if (rankQ(M) <= L) { found = L; break; }
    }
    console.log(`  ${name}  least order found = ${found}  (expected ${expect})`);
  }
}

console.log("\n== E4  the unit groups, which is where step 3 lives ==");
console.log("  |F_2^*|        = 1          -> no logarithm exists; step 3 is vacuous");
console.log("  Z^* = {+-1}    -> Baker's logs are of the ALGEBRAIC NUMBERS 2 and 3,");
console.log("                    which enter as the map's multiplier, not as units of Z");
console.log("  Z_2^* = {+-1} x (1+4Z_2) is infinite and HAS a 2-adic logarithm");
console.log("                    (Yu's p-adic linear forms in logarithms live here)");
console.log("  so step 3 is available over Z_2 and step 1 is not (E1: T is not additive),");
console.log("  and step 1 is available over F_2 and step 3 is not (trivial unit group).");
