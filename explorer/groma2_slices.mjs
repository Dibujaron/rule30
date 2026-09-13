// Groma, 2026-09-13. The left-diagonal array read both ways, and the null.
//
// A(k, j) = leftDiagonal k j = evolve (j+k) (-j)  (Basic.lean:88).
//   ROWS   of A  (k fixed, j varying) are the left diagonals: eventually periodic.
//   SLICES of A  (j fixed, k varying) are the columns x = -j: A(k,j) = column(-j) at time k+j.
// The centre column is the j = 0 slice, not a row. This measures both readings on
// the same pass, so the brief's control can be stated without conflating them.
//
// Also: the coupon-collector null for every distinct-factor count this board has
// published, because none of them is quoted against one.

const T = 200000;
const words = ((2 * T + 2) >> 5) + 2;
const a = new Uint32Array(words);
a[0] = 1;
const XMIN = -8, XMAX = 8;
const cols = {};
for (let x = XMIN; x <= XMAX; x++) cols[x] = new Uint8Array(T + 1);
const KD = 40;
const rows = [];
for (let k = 0; k <= KD; k++) rows.push(new Uint8Array(T + 1));
let top = 0;
const bit = (b) => (b < 0 ? 0 : (a[b >>> 5] >>> (b & 31)) & 1);
for (let t = 0; t <= T; t++) {
  for (let x = XMIN; x <= XMAX; x++) cols[x][t] = t + x >= 0 ? bit(t + x) : 0;
  for (let k = 0; k <= KD; k++) if (t >= k) rows[k][t - k] = bit(k);
  if (t === T) break;
  const nt = ((2 * (t + 1)) >>> 5) + 1;
  if (nt > top) top = Math.min(nt, words - 1);
  for (let i = top; i >= 0; i--) {
    const cur = a[i], lo = i > 0 ? a[i - 1] : 0;
    const s1 = ((cur << 1) | (lo >>> 31)) >>> 0;
    const s2 = ((cur << 2) | (lo >>> 30)) >>> 0;
    a[i] = (s2 ^ (s1 | cur)) >>> 0;
  }
}

function distinct(seq, from, to, n) {
  const set = new Set();
  let code = 0n;
  const mask = (1n << BigInt(n)) - 1n;
  for (let i = from; i < to; i++) {
    code = ((code << 1n) | BigInt(seq[i])) & mask;
    if (i - from >= n - 1) set.add(code);
  }
  return set.size;
}
function nullE(M, n) {
  const N = Math.pow(2, n);
  if (n > 60) return M; // N astronomically larger than M
  return N * (1 - Math.exp(-M / N));
}

const FROM = T >> 1, TO = T;
const M = TO - FROM;
console.log(`# T = ${T}; complexity on rows [${FROM}, ${TO}]`);
console.log('\nSLICES of the array (fixed j; the column at x = -j), p(n) and ratio to the null');
console.log('   x    p(8)   p(12)   p(16)   p(20)   ratio at n=20');
for (let x = XMIN; x <= XMAX; x++) {
  const p8 = distinct(cols[x], FROM, TO, 8), p12 = distinct(cols[x], FROM, TO, 12);
  const p16 = distinct(cols[x], FROM, TO, 16), p20 = distinct(cols[x], FROM, TO, 20);
  console.log(`  ${String(x).padStart(3)}  ${String(p8).padStart(6)}  ${String(p12).padStart(6)}  ${String(p16).padStart(6)}  ${String(p20).padStart(6)}   ${(p20 / nullE(M - 19, 20)).toFixed(4)}`);
}

console.log('\nROWS of the array (fixed k; left diagonal k), p(n) at n = 1..6');
const stat = [];
for (let k = 0; k <= KD; k++) {
  const p = [];
  for (let n = 1; n <= 6; n++) p.push(distinct(rows[k], FROM, TO - KD, n));
  stat.push(`k=${k}:[${p.join(',')}]`);
}
console.log('  ' + stat.join(' '));
console.log(`  max p(6) over the first ${KD + 1} rows: ${Math.max(...stat.map((s) => Number(s.split(',').pop().replace(']', ''))))}`);

console.log('\n[null] the coupon-collector expectation for counts already on this board');
const cases = [
  ['seed centre column, length 32, tail 5e5 (obstruction 9)', 499949, 500000, 32],
  ['X_{(10)^inf} column 1, length 32, tail 1e6 (obstruction 9)', 48, 1000000, 32],
  ['X_{(10)^inf} column 1, length 1024, tail 1e6 (obstruction 9)', 998977, 1000000, 1024],
  ['size-5 ring phase trace, length 32, tail 1.6e6 (Talus)', 3500, 1600000, 32],
  ['1010001001 at 1e6 rows, length 32 (Talus calibration)', 525, 1000000, 32],
];
for (const [name, got, tail, n] of cases) {
  const E = nullE(tail - n + 1, n);
  console.log(`  ${name}\n     measured ${got}   null ${E.toFixed(1)}   ratio ${(got / E).toExponential(3)}`);
}
