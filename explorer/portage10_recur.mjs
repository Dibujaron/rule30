// Portage, 2026-09-12.  Does m(t) — the number of distinct sections of E^t,
// equivalently obstruction 21's reachable-row automaton size — satisfy a
// linear recurrence with constant coefficients?  Exact rational elimination,
// then the recurrence is CHECKED on terms it was not fitted to.

const m = [3, 7, 16, 35, 71, 141, 272, 517, 971, 1792, 3263, 5873, 10483, 18619, 32885, 57741, 100901, 175680, 304714, 526563];

// exact rational arithmetic on BigInt fractions
const g = (a, b) => (b ? g(b, a % b) : (a < 0n ? -a : a));
function red([n, d]) { if (d < 0n) { n = -n; d = -d; } const k = g(n < 0n ? -n : n, d) || 1n; return [n / k, d / k]; }
const add = (x, y) => red([x[0] * y[1] + y[0] * x[1], x[1] * y[1]]);
const sub = (x, y) => red([x[0] * y[1] - y[0] * x[1], x[1] * y[1]]);
const mulr = (x, y) => red([x[0] * y[0], x[1] * y[1]]);
const divr = (x, y) => red([x[0] * y[1], x[1] * y[0]]);
const isZero = x => x[0] === 0n;

// solve for c_1..c_k with m[n] = sum c_i m[n-i], fitted on the first FIT terms
function findRecurrence(k, fitTerms) {
  const rowsA = [], rhs = [];
  for (let n = k; n < fitTerms; n++) {
    rowsA.push(Array.from({ length: k }, (_, i) => [BigInt(m[n - 1 - i]), 1n]));
    rhs.push([BigInt(m[n]), 1n]);
  }
  if (rowsA.length < k) return null;
  // gaussian elimination
  const A = rowsA.map((r, i) => [...r, rhs[i]]);
  let row = 0;
  const piv = [];
  for (let col = 0; col < k && row < A.length; col++) {
    let p = -1;
    for (let r = row; r < A.length; r++) if (!isZero(A[r][col])) { p = r; break; }
    if (p < 0) continue;
    [A[row], A[p]] = [A[p], A[row]];
    const inv = A[row][col];
    for (let c = col; c <= k; c++) A[row][c] = divr(A[row][c], inv);
    for (let r = 0; r < A.length; r++) if (r !== row && !isZero(A[r][col])) {
      const f = A[r][col];
      for (let c = col; c <= k; c++) A[r][c] = sub(A[r][c], mulr(f, A[row][c]));
    }
    piv.push(col); row++;
  }
  for (let r = row; r < A.length; r++) if (!isZero(A[r][k])) return null;   // inconsistent
  if (piv.length < k) return null;                                          // underdetermined
  const c = new Array(k);
  for (let i = 0; i < k; i++) c[piv[i]] = A[i][k];
  return c;
}

console.log('searching for a linear recurrence for m(t) = 3,7,16,35,71,141,...');
for (let k = 1; k <= 8; k++) {
  const fit = Math.min(2 * k + 2, m.length);
  const c = findRecurrence(k, fit);
  if (!c) { console.log(`  order ${k}: no consistent solution fitted on the first ${fit} terms`); continue; }
  // verify on ALL terms
  let bad = 0, checked = 0;
  for (let n = k; n < m.length; n++) {
    let s = [0n, 1n];
    for (let i = 0; i < k; i++) s = add(s, mulr(c[i], [BigInt(m[n - 1 - i]), 1n]));
    checked++;
    if (s[1] !== 1n || s[0] !== BigInt(m[n])) bad++;
  }
  const cs = c.map(x => x[1] === 1n ? `${x[0]}` : `${x[0]}/${x[1]}`).join(', ');
  console.log(`  order ${k}: fitted on ${fit} terms, coefficients [${cs}] -> ${bad} failures over ${checked} terms (${bad === 0 ? 'HOLDS on all 20' : 'fails'})`);
}

// growth constant
console.log(`\nratios m(t)/m(t-1) for the last few t: ${m.slice(-6).map((v, i, a) => i ? (v / a[i - 1]).toFixed(5) : '').filter(Boolean).join(' ')}`);
