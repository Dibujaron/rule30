// Talus, 2026-09-08. Sub-question (c): for a good b, is the left half of X_b
// eventually SPATIALLY periodic, and with what period?
//
// The chain that makes this necessary is all board theorems:
//   good b  =>  column -1 e.p.  (sandwich lemma + evolve_period_sub_one)
//           =>  columns 0 and -1 share a period q and onset N
//           =>  evolve_period_sub: EVERY column x <= 0 is periodic with the
//               SAME q and the SAME N -- the left half of the picture is
//               eventually time-periodic as a whole
//           =>  crystal 24: F^q is left-permutive with radius q, so the row at
//               time N is determined leftward by any 2q consecutive cells,
//               hence eventually spatially periodic leftward with period
//               at most 2^(2q).
// The bound 2^(2q) is astronomical. This measures the truth.

const KCOLS = 3000;   // how far left to solve
const XPRINT = 26;

function col1of(b, T) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words), s = new Uint32Array(words);
  const out = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    out[t] = (r[0] >>> 1) & 1;
    const last = Math.min(words - 2, (t >> 5) + 1);
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
  return out;
}

// columns 0, -1, ..., -(K-1) as arrays over time, by the sideways solve
function leftColumns(b, K, T) {
  const c0 = new Uint8Array(T);
  for (let t = 0; t < T; t++) c0[t] = b[t % b.length];
  const c1 = col1of(b, T);
  const cols = [c0];
  const cm1 = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) cm1[t] = c0[t + 1] ^ (c0[t] | c1[t]);
  cols.push(cm1);
  for (let k = 2; k < K; k++) {
    const nx = new Uint8Array(T);
    for (let t = 0; t + 1 < T - k; t++) nx[t] = cols[k - 1][t + 1] ^ (cols[k - 1][t] | cols[k - 2][t]);
    cols.push(nx);
  }
  return { cols, c1 };
}

// least s such that w[i] = w[i+s] for every i >= from (w read leftward:
// w[k] is the cell at position -k)
function eventualSpatialPeriod(w, from, smax) {
  for (let s = 1; s <= smax; s++) {
    let ok = true;
    for (let i = from; i + s < w.length; i++) if (w[i + s] !== w[i]) { ok = false; break; }
    if (ok) {
      let onset = 0;
      for (let i = from - 1; i >= 0; i--) if (w[i + s] !== w[i]) { onset = i + 1; break; }
      return [s, onset];
    }
  }
  return [0, -1];
}

function temporalPeriodOfColumn(col, T, lo, qmax) {
  for (let q = 1; q <= qmax; q++) {
    let ok = true;
    for (let t = lo; t + q < T - 10; t++) if (col[t + q] !== col[t]) { ok = false; break; }
    if (ok) return q;
  }
  return 0;
}

console.log('=== the picture of X_b for b = 1 0^9, rows 0..44, x from -26 to 26 ===');
{
  const b = '1000000000'.split('').map(Number);
  const T = 200;
  const { cols } = leftColumns(b, 40, T);
  const c1 = col1of(b, T);
  // right half rows
  const p = b.length;
  const words = 20;
  let r = new Uint32Array(words), s = new Uint32Array(words);
  r[0] = b[0] & 1;
  const right = [];
  for (let t = 0; t < 48; t++) {
    const line = [];
    for (let x = 0; x <= XPRINT; x++) line.push((r[x >> 5] >>> (x & 31)) & 1);
    right.push(line);
    for (let i = 0; i < words - 1; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  for (let t = 0; t < 44; t++) {
    let line = '';
    for (let k = XPRINT; k >= 1; k--) line += cols[k] && k < 40 ? (cols[k][t] ? '#' : '.') : '?';
    line += '|';
    for (let x = 0; x <= XPRINT; x++) line += right[t][x] ? '#' : '.';
    console.log(String(t).padStart(3) + ' ' + line);
  }
}

console.log('');
console.log('=== spatial period of the left half, at a time past the onset ===');
console.log('b                temporal q of col -1   row read     least eventual spatial period leftward');
const cases = [
  ['1000000000', 400],
  ['10000000000', 400],
  ['100000000000', 400],
  ['1000', 400],
  ['10000000', 400],
  ['0111', 400],
  ['01111111', 400],
  ['0111111111', 400],
  ['1', 400],
  ['11', 400],
  ['1110011000', 4000],
  ['0011000111', 4000],
  ['10110101011', 4000],
  ['11111011110', 4000],
  ['1010100000', 4000],
  ['100', 4000],
];
for (const [s, t0] of cases) {
  const b = s.split('').map(Number);
  const T = t0 + KCOLS + 40;
  const { cols } = leftColumns(b, KCOLS, T);
  const q = temporalPeriodOfColumn(cols[1], T - KCOLS - 20, t0, 400);
  const row = new Uint8Array(KCOLS);
  for (let k = 0; k < KCOLS; k++) row[k] = cols[k][t0];
  const [sp, onset] = eventualSpatialPeriod(row, KCOLS >> 1, 600);
  console.log(
    `${s.padEnd(16)} ${String(q || '>400').padEnd(21)} t=${String(t0).padEnd(11)} ${sp === 0 ? 'none <= 600' : sp + '  (spatial onset ' + onset + ' cells left of origin)'}`
  );
}
