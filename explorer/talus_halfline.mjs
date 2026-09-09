// Talus, 2026-09-08.
//
// The right half-line of rule 30 driven by a PERIODIC boundary.
//
// A cell at x >= 1 reads only x-1, x, x+1, all >= 0, so the strip x >= 1,
// started all white, is a deterministic function of column 0 alone. For the
// seed, column 0 is the centre column and the strip is the seed's right half.
// Here column 0 is instead a chosen periodic sequence b.
//
// Question (C1 of the attack document): if b is periodic, is column 1 of the
// resulting half-line eventually periodic? That is the residual of P1 stated
// about an arbitrary periodic boundary instead of the seed's own.
//
// Reduction used for the test: if column 0 has period p and column 1 has
// eventual period q, then lcm(p, q) is an eventual period of column 1 and is a
// multiple of p. So "column 1 is eventually periodic" is equivalent to
// "column 1 is eventually m*p-periodic for some m >= 1", and testing multiples
// of p is complete, not a shortcut.

const T = 4000; // rows in the sweep
const MAXMULT = 16; // test eventual periods p, 2p, ..., MAXMULT*p
const NCOLS = 6; // columns 1..NCOLS
const PMAX = 10;

// ---------------------------------------------------------------- engine
// Bit-packed rule 30 on the half-line x >= 0, position x is bit x.
// Position 0 is pinned to the boundary at every step; positions x >= 1 read
// only x-1, x, x+1, all >= 0, so nothing outside the half-line is consulted.
// The array is wide enough for the whole cone, so no truncation error.
function halfline(b, T, ncols) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const cols = [];
  for (let k = 0; k < ncols; k++) cols.push(new Uint8Array(T));
  r[0] = b[0] & 1; // row 0: cell 0 = b(0), all of x >= 1 white
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
    // pin position 0 to the boundary at time t+1
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r;
    r = s;
    s = tmp;
  }
  return cols;
}

// ------------------------------------------------------------- periodicity
// last index t <= T-q-1 with col[t+q] != col[t]; -1 if none.
function lastFailure(col, q, T) {
  for (let t = T - q - 1; t >= 0; t--) {
    if (col[t + q] !== col[t]) return t;
  }
  return -1;
}

// smallest tested eventual period (a multiple of p) whose last failure sits in
// the first quarter of the run; 0 if none.
function eventualPeriod(col, p, T) {
  for (let m = 1; m <= MAXMULT; m++) {
    const q = m * p;
    if (q * 4 > T) break;
    const lf = lastFailure(col, q, T);
    if (lf < T / 4) return q;
  }
  return 0;
}

function bits(n, p) {
  const a = [];
  for (let i = 0; i < p; i++) a.push((n >> i) & 1);
  return a;
}

// -------------------------------------------------------------- the sweep
console.log(`half-line under a periodic boundary: T=${T}, periods tested up to ${MAXMULT}p`);
console.log('p   #b    col1-EP   all-6-EP   first non-EP boundaries');
const survivors = [];
for (let p = 1; p <= PMAX; p++) {
  let ep1 = 0;
  let epAll = 0;
  const bad = [];
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const cols = halfline(b, T, NCOLS);
    const q1 = eventualPeriod(cols[0], p, T);
    if (q1 > 0) {
      ep1++;
      let all = true;
      for (let k = 1; k < NCOLS; k++) {
        if (eventualPeriod(cols[k], p, T) === 0) { all = false; break; }
      }
      if (all) epAll++;
      survivors.push([p, b.join(''), q1]);
    } else if (bad.length < 3) {
      bad.push(b.join(''));
    }
  }
  console.log(
    `${String(p).padEnd(3)} ${String(1 << p).padEnd(5)} ${String(ep1).padEnd(9)} ${String(epAll).padEnd(10)} ${bad.join(' ')}`
  );
}

console.log('');
console.log('boundaries whose column 1 is eventually periodic (b, eventual period of col 1):');
for (const [p, s, q] of survivors) console.log(`  p=${p}  b=${s}  q=${q}`);
