// Talus, 2026-09-08. The separating boundaries, checked a second way.
//
// talus_pm1.mjs found eight boundaries of period 8 -- the eight words with a
// single white cell -- whose column -1 is exactly 8-periodic from index 0 while
// column +1 is not eventually periodic at all. An onset of exactly 0 is the
// shape of a bug, so column -1 is recomputed here without the sideways-solve
// formula: X_b is built as an actual row and run through the ordinary full-line
// rule 30 engine, and column -1 is read straight off the picture.
//
// The mechanism, if the finding is real: at every black time of the boundary
// the cell at x = 0 saturates the OR in the rule at x = 0, so column -1 there
// is the complement of the next boundary cell and column 1 drops out
// (crystal 39 / column_succ_of_black, both proved on the board). A boundary
// with a single white cell per period leaves exactly one residue class mod p
// on which column -1 can see column 1 at all.

const K = 6000;
const T = 5200;
const CHECK = 4800;

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

function leftRow(col0, col1, K) {
  const row = new Uint8Array(K + 1);
  let prev = col0;
  let cur = new Uint8Array(col0.length);
  for (let t = 0; t + 1 < col0.length; t++) cur[t] = col0[t + 1] ^ (col0[t] | col1[t]);
  row[0] = col0[0];
  row[1] = cur[0];
  for (let k = 2; k <= K; k++) {
    const next = new Uint8Array(col0.length);
    for (let t = 0; t + 1 < col0.length - k; t++) next[t] = cur[t + 1] ^ (cur[t] | prev[t]);
    row[k] = next[0];
    prev = cur; cur = next;
  }
  return row;
}

// full-line BigInt engine; returns columns -2, -1, 0, 1, 2 of the picture
function runFull(row0, K, T) {
  let r = 0n;
  for (let k = K; k >= 0; k--) if (row0[k]) r |= 1n << BigInt(K - k);
  const out = [[], [], [], [], []];
  for (let t = 0; t < T; t++) {
    for (let j = 0; j < 5; j++) out[j].push(Number((r >> BigInt(K + t + j - 2)) & 1n));
    r = (r << 2n) ^ ((r << 1n) | r);
  }
  return out.map((a) => Uint8Array.from(a));
}

function ep(col, T, QMAX, lo) {
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

const cases = ['11111110', '10111111', '11111111', '11111100', '10'];
console.log('columns read off a real picture (full-line BigInt engine), not off the solve');
console.log(`left tail K=${K}, ${T} rows, periodicity over t in [${CHECK / 2}, ${CHECK})`);
console.log('b          col -2        col -1        col 0         col +1        col +2');
for (const s of cases) {
  const b = s.split('').map(Number);
  const cols = halflineCols(b, T + K + 8, 1);
  const col0 = new Uint8Array(T + K + 8);
  for (let t = 0; t < col0.length; t++) col0[t] = b[t % b.length];
  const row0 = leftRow(col0, cols[0], K);
  const got = runFull(row0, K, T);
  const cells = got.map((c) => {
    const [q, o] = ep(c, CHECK, 600, CHECK >> 1);
    return q ? `${q} (${o})` : 'none';
  });
  console.log(`${s.padEnd(10)} ${cells.map((c) => c.padEnd(13)).join('')}`);
  // agreement of the full-line column 1 with the half-line's, as a guard
  let bad = 0;
  for (let t = 0; t < CHECK; t++) if (got[3][t] !== cols[0][t]) bad++;
  console.log(`           full-line vs half-line column 1 mismatches over ${CHECK} rows: ${bad}`);
}

console.log('');
console.log('mechanism for b = 11111110 (white only at t = 7 mod 8):');
{
  const s = '11111110';
  const b = s.split('').map(Number);
  const N = 40000;
  const cols = halflineCols(b, N, 1);
  const c1 = cols[0];
  for (let r = 0; r < 8; r++) {
    let ones = 0, n = 0;
    for (let t = r; t < N; t += 8) { ones += c1[t]; n++; }
    console.log(`  column 1 on t = ${r} mod 8: black ${ones} of ${n}  (${(ones / n).toFixed(4)})`);
  }
  console.log(`  column 1, first 48 values: ${Array.from(c1.slice(0, 48)).join('')}`);
}
