// Checking a cold subagent's DERIVED claim (it flagged it as unverified, so it gets checked).
//
// CLAIM. Let F be rule 30 and sigma the shift. Put H = sigma . F, i.e. H(x)_i = x_i XOR (x_{i+1} OR x_{i+2}).
// Re-index by digit_j := cell(-j). Then:
//   (a) digit_j(Hx) depends only on digits j, j-1, j-2  -- a T-function, 1-Lipschitz on Z_2;
//   (b) digit_j(H^t x) = a_{t-j}(t), the cell j steps in from the RIGHT edge of the cone at time t;
//   (c) c(t) = a_0(t) = digit_t(H^t x)  -- the centre column is the DIAGONAL of the array A[t][j];
//   (d) row j of that array is PURELY periodic in t with period dividing 2^j.
// If all four hold, P1 reads: "the diagonal of an array whose row j has period dividing 2^j is not
// eventually periodic" -- which would say why every bounded-window argument must fail.

const T = 600, R = T + 40, N = 2 * R + 1, O = R;
const stepF = a => { const b = new Uint8Array(N);
  for (let i = 1; i < N - 1; i++) b[i] = (a[i - 1] ^ (a[i] | a[i + 1])) & 1; return b; };
const stepH = a => { const b = new Uint8Array(N);
  for (let i = 0; i < N - 2; i++) b[i] = (a[i] ^ (a[i + 1] | a[i + 2])) & 1; return b; };

let xF = new Uint8Array(N); xF[O] = 1;
let xH = new Uint8Array(N); xH[O] = 1;
const digit = (a, j) => a[O - j];

let okB = true, okC = true, firstBadB = null, firstBadC = null;
const A = [];                                   // A[t][j] = digit_j(H^t x)
for (let t = 0; t <= T; t++) {
  const row = new Uint8Array(T + 1);
  for (let j = 0; j <= T; j++) row[j] = digit(xH, j);
  A.push(row);
  // (b) digit_j(H^t x) =?= a_{t-j}(t)   for 0 <= j <= t
  for (let j = 0; j <= t && j <= 60; j++) {
    const lhs = digit(xH, j), rhs = xF[O + (t - j)];
    if (lhs !== rhs) { okB = false; if (!firstBadB) firstBadB = { t, j, lhs, rhs }; }
  }
  // (c) c(t) =?= digit_t(H^t x)
  if (xF[O] !== digit(xH, t)) { okC = false; if (!firstBadC) firstBadC = { t }; }
  xF = stepF(xF); xH = stepH(xH);
}
console.log("(b) digit_j(H^t x) = a_{t-j}(t)  for all t <= " + T + ", j <= min(t,60):");
console.log("    " + (okB ? "HOLDS" : "*** FAILS *** first at " + JSON.stringify(firstBadB)));
console.log("(c) c(t) = digit_t(H^t x)  for all t <= " + T + ":");
console.log("    " + (okC ? "HOLDS" : "*** FAILS *** first at " + JSON.stringify(firstBadC)));

// (d) row j purely periodic in t with period dividing 2^j
console.log("\n(d) row j of A, as a sequence in t: purely periodic? minimal period? divides 2^j?");
console.log("     j   minimal period   2^j   divides?   purely periodic from t=0?");
for (let j = 0; j <= 9; j++) {
  const col = A.map(r => r[j]);
  let p = 0;
  for (let q = 1; q <= 512; q++) { let ok = true;
    for (let t = 0; t + q < col.length; t++) if (col[t] !== col[t + q]) { ok = false; break; }
    if (ok) { p = q; break; } }
  const pow = 2 ** j;
  console.log(`  ${String(j).padStart(6)}   ${String(p || ">512").padStart(13)}   ${String(pow).padStart(4)}   ${p && pow % p === 0 ? "yes" : "NO"}        ${p ? "yes" : "no"}`);
}
// and the diagonal really is the centre column
console.log("\n  diagonal A[t][t], t=0..11: " + A.slice(0, 12).map((r, t) => r[t]).join("") + "   (centre column is 110111001100)");
