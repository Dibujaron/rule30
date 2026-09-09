// Talus, 2026-09-08. The witness, as deep as the session can afford, and the
// small table that ties this engine to the board's own definition.
//
// b = (10)^inf is the smallest non-constant periodic boundary. X_b is the
// configuration white at every x >= 1 at time 0 whose centre column is b.
// Claim under test: no column of X_b other than column 0 is eventually
// periodic. Columns 1 and -1 decide it (evolve_isEventuallyPeriodic_of_between
// walks any other column in to one of them), so those two are taken deep.

const T = 500000;
const QMAX = 100000;

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

function report(name, col, T, QMAX, lo) {
  let best = 0, bestQ = 0;
  for (let q = 1; q <= QMAX; q++) {
    let t = lo;
    for (; t + q < T; t++) if (col[t + q] !== col[t]) break;
    const run = t - lo;
    if (run > best) { best = run; bestQ = q; }
    if (t + q >= T) { console.log(`  ${name}: PERIODIC with q=${q}`); return; }
  }
  console.log(`  ${name}: no eventual period q <= ${QMAX} with onset <= ${lo}.`);
  console.log(`    longest agreement with any shift, starting at ${lo}: ${best} terms at q=${bestQ}`);
  let ones = 0;
  for (let t = lo; t < T; t++) ones += col[t];
  console.log(`    black density over [${lo}, ${T}): ${(ones / (T - lo)).toFixed(5)}`);
}

const b = [1, 0];
console.log(`b = (10)^inf, T=${T}, every lag q <= ${QMAX}, onset <= ${T >> 1}`);
const cols = halfline(b, T, 1);
const cm = new Uint8Array(T - 1);
for (let t = 0; t + 1 < T; t++) cm[t] = b[(t + 1) % 2] ^ (b[t % 2] | cols[0][t]);
report('column +1', cols[0], T, QMAX, T >> 1);
report('column -1', cm, T - 1, QMAX, T >> 1);

console.log('');
console.log('table for the kernel check: evolveHalfRight with boundary (10)^inf,');
console.log('white start, t = 0..8, k = 0..4  (k is position k+1)');
{
  const small = halfline(b, 16, 5);
  const rows = [];
  for (let t = 0; t <= 8; t++) {
    const r = [];
    for (let k = 0; k <= 4; k++) r.push(small[k][t] ? 'true' : 'false');
    rows.push('[' + r.join(', ') + ']');
  }
  console.log('  [' + rows.join(',\n   ') + ']');
}
