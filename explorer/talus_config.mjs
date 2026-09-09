// Talus, 2026-09-08. End-to-end check of the configuration X_b.
//
// Everything so far was computed with half-line and sideways-solve models. This
// script leaves those models behind: it builds an actual row of cells from them,
// runs the ordinary full-line rule 30 on it with a completely separate BigInt
// engine, and asks whether the resulting picture's column 0 really is b and its
// column 1 really is what the half-line said.
//
// X_b is white at every x >= 1 at time 0 and has column 0 equal to b (crystal
// 40: column 0 and the right half are free coordinates). Its cells at x <= -1
// come from leftSolve, which leftSolve_eq_column (proved, on the board) ties to
// the real columns. Truncating the left tail at -K makes the reconstruction
// exact only while the truncation's damage, which moves right at speed exactly
// 1 (rightmost_difference_moves_right), has not reached the origin: t < K.

const K = 4000;   // left tail kept
const T = 3600;   // rows run; must be < K
const CHECK = 3000;

function halflineCols(b, T, ncols) {
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

// row 0 of X_b at positions -K..0, by the sideways solve.
function leftRow(col0, col1, K) {
  const row = new Uint8Array(K + 1); // row[k] = cell (0, -k)
  let prev = col0;
  let cur = new Uint8Array(col0.length);
  for (let t = 0; t + 1 < col0.length; t++) cur[t] = col0[t + 1] ^ (col0[t] | col1[t]);
  row[0] = col0[0];
  row[1] = cur[0];
  for (let k = 2; k <= K; k++) {
    const next = new Uint8Array(col0.length);
    for (let t = 0; t + 1 < col0.length - k; t++) next[t] = cur[t + 1] ^ (cur[t] | prev[t]);
    row[k] = next[0];
    prev = cur;
    cur = next;
  }
  return row;
}

// independent full-line engine: bit i of the BigInt is position i - K, so the
// row runs from -K rightwards; it grows one cell each side per step, and the
// frame is re-based each step so bit i is always position i - K - t.
function runFull(row0, K, T) {
  let r = 0n;
  for (let k = K; k >= 0; k--) if (row0[k]) r |= 1n << BigInt(K - k);
  const col0 = new Uint8Array(T);
  const col1 = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    col0[t] = Number((r >> BigInt(K + t)) & 1n);
    col1[t] = Number((r >> BigInt(K + t + 1)) & 1n);
    r = (r << 2n) ^ ((r << 1n) | r);
  }
  return { col0, col1 };
}

const cases = ['10', '110', '1010', '100000', '11100110', '1000', '1000000000'];
console.log(`X_b rebuilt as a real row and evolved by a separate full-line engine`);
console.log(`left tail K=${K}, ${T} rows run, agreement checked on t < ${CHECK}`);
console.log('b            col0 mismatches vs b   col1 mismatches vs half-line   row 0 near the origin (x = -20..0)');
for (const s of cases) {
  const b = s.split('').map(Number);
  const cols = halflineCols(b, T + K + 8, 2);
  const col0 = new Uint8Array(T + K + 8);
  for (let t = 0; t < col0.length; t++) col0[t] = b[t % b.length];
  const row0 = leftRow(col0, cols[0], K);
  const got = runFull(row0, K, T);
  let bad0 = 0, bad1 = 0;
  for (let t = 0; t < CHECK; t++) {
    if (got.col0[t] !== col0[t]) bad0++;
    if (got.col1[t] !== cols[0][t]) bad1++;
  }
  let near = '';
  for (let k = 20; k >= 0; k--) near += row0[k] ? '#' : '.';
  console.log(`${s.padEnd(12)} ${String(bad0).padEnd(21)} ${String(bad1).padEnd(30)} ${near}`);
}
