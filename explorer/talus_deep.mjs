// Talus, 2026-09-08. Deep periodicity test for the half-line under a
// periodic boundary, and pictures of the two kinds of behaviour.
//
// Engine identical to talus_halfline.mjs, verified in talus_verify.mjs
// against the seed's own right half (0 mismatches, 400 rows x 8 columns) and
// against an independent BigInt implementation (0 mismatches, 40 boundaries).
//
// The periodicity test here is exhaustive over lags rather than over small
// multiples: column k is packed into machine words and compared against its
// own shift by q for every q <= QMAX over the second half of the run. Column 0
// has exact period p, so any eventual period q of column k gives lcm(p, q) as
// a common eventual period; testing every q (not only multiples of p) is
// therefore strictly more than needed and cannot miss one.

const T = 150000;
const QMAX = 20000;
const NCOLS = 3;

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

// Smallest q <= QMAX such that col[t+q] = col[t] for every t in [T/2, T-q).
// Returns [q, onset] with onset the first index from which q works, or [0, -1].
function leastEventualPeriod(col, T, QMAX) {
  const lo = T >> 1;
  for (let q = 1; q <= QMAX; q++) {
    let ok = true;
    for (let t = lo; t + q < T; t++) {
      if (col[t + q] !== col[t]) { ok = false; break; }
    }
    if (ok) {
      let onset = 0;
      for (let t = lo - 1; t >= 0; t--) {
        if (col[t + q] !== col[t]) { onset = t + 1; break; }
      }
      return [q, onset];
    }
  }
  return [0, -1];
}

const cases = [
  '10', '110', '1010', '10000', '100000', '1000000', '100000000',
  '11100110', '01110011', '1000101111',
  '1', '11', '100', '1000', '1110', '10000000', '1000000000',
  '1011100010', '1111001100',
];

console.log(`deep test: T=${T}, every lag q <= ${QMAX}, agreement required over [T/2, T)`);
console.log('b            col1 period (onset)   col2               col3');
for (const s of cases) {
  const b = s.split('').map(Number);
  const cols = halfline(b, T, NCOLS);
  const out = [];
  for (let k = 0; k < NCOLS; k++) {
    const [q, onset] = leastEventualPeriod(cols[k], T, QMAX);
    out.push(q === 0 ? 'none' : `${q} (${onset})`);
  }
  console.log(`${s.padEnd(12)} ${out[0].padEnd(20)} ${out[1].padEnd(18)} ${out[2]}`);
}
