// Talus, 2026-09-08. "Some OTHER column", both sides.
//
// The residual asks for *some* other eventually periodic column, not column 1.
// A boundary b of period p determines a whole configuration X_b: column 0 is b,
// row 0 is white at every x >= 1 (crystal 40 -- column 0 and the right half are
// free coordinates), the right half is the half-line automaton, and the left
// half is the sideways solve from columns 0 and 1 (leftSolve in Basic.lean,
// leftSolve_eq_column on the board).
//
// Two board theorems cut the check down to two columns. If column j is
// eventually periodic for some j >= 2, then column 0 and column j are, so
// evolve_isEventuallyPeriodic_of_between makes column 1 eventually periodic
// too; symmetrically for j <= -2 and column -1. So X_b has some other
// eventually periodic column exactly when column 1 or column -1 has one. The
// range -24..24 is computed anyway, as a cross-check on that reduction.

const T = 150000;
const QMAX = 20000;
const KMAX = 24;

function halfline(b, T, ncols) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const cols = [];
  for (let k = 0; k < ncols; k++) cols.push(new Uint8Array(T));
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < ncols; k++) {
      const x = k + 1;
      cols[k][t] = (r[x >> 5] >>> (x & 31)) & 1;
    }
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  return cols;
}

// columns -1 .. -kmax of X_b by the sideways solve; left[k-1] is column -k,
// valid for t < T - k.
function leftColumns(col0, col1, T, kmax) {
  const left = [];
  let prev = col0;      // column 0
  let cur = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) cur[t] = col0[t + 1] ^ (col0[t] | col1[t]); // column -1
  left.push(cur);
  for (let k = 2; k <= kmax; k++) {
    const next = new Uint8Array(T);
    for (let t = 0; t + 1 < T; t++) next[t] = cur[t + 1] ^ (cur[t] | prev[t]);
    left.push(next);
    prev = cur;
    cur = next;
  }
  return left;
}

function leastEventualPeriod(col, T, QMAX) {
  const lo = T >> 1;
  for (let q = 1; q <= QMAX; q++) {
    let ok = true;
    for (let t = lo; t + q < T; t++) if (col[t + q] !== col[t]) { ok = false; break; }
    if (ok) {
      let onset = 0;
      for (let t = lo - 1; t >= 0; t--) if (col[t + q] !== col[t]) { onset = t + 1; break; }
      return [q, onset];
    }
  }
  return [0, -1];
}

const cases = ['10', '110', '1010', '10000', '100000', '1000000', '100000000',
  '11100110', '01110011', '1000101111', '1000', '1000000000'];

console.log(`other columns of X_b: T=${T}, every lag q <= ${QMAX}, agreement over [T/2 - KMAX, T - KMAX)`);
console.log('the run is truncated by KMAX so the sideways solve is exact everywhere it is read');
console.log('');
console.log('b            col -1            col +1            any EP column in -24..24 other than 0');
for (const s of cases) {
  const b = s.split('').map(Number);
  const cols = halfline(b, T, KMAX + 1);
  const col0 = new Uint8Array(T);
  for (let t = 0; t < T; t++) col0[t] = b[t % b.length];
  const left = leftColumns(col0, cols[0], T, KMAX);
  const Teff = T - KMAX - 2;
  const named = [];
  for (let k = 1; k <= KMAX; k++) {
    const [q] = leastEventualPeriod(left[k - 1], Teff, QMAX);
    if (q > 0) named.push(`-${k}:${q}`);
  }
  for (let k = 1; k <= KMAX; k++) {
    const [q] = leastEventualPeriod(cols[k - 1], Teff, QMAX);
    if (q > 0) named.push(`+${k}:${q}`);
  }
  const m1 = leastEventualPeriod(left[0], Teff, QMAX);
  const p1 = leastEventualPeriod(cols[0], Teff, QMAX);
  console.log(
    `${s.padEnd(12)} ${(m1[0] ? `${m1[0]} (${m1[1]})` : 'none').padEnd(17)} ${(p1[0] ? `${p1[0]} (${p1[1]})` : 'none').padEnd(17)} ${named.length ? named.join(' ') : 'NONE'}`
  );
}
