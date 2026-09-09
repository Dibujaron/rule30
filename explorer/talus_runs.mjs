// Talus, 2026-09-08. What produced the 289-term agreement?
//
// talus_witness.mjs reported that column 1 of X_{(10)^inf} has no eventual
// period q <= 10^5, and that the longest agreement with any shift, measured
// from a fixed start, was 289 terms at q = 5606. For an unbiased coin the
// expected maximum over 10^5 lags is about log2(10^5) ~ 17, so 289 wants an
// explanation before the non-periodicity is believed.
//
// This script prints the whole distribution of those run lengths, the top ten
// lags, and the same statistic for two controls: the seed's own centre column
// (known aperiodic to every depth anyone has looked) and a fair coin. If 289 is
// the tail of a distribution the controls also have, it is not evidence of
// structure; if the controls stop at 20 it is, and the claim needs re-reading.

const T = 400000;
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

function seedCentre(T) {
  const c = new Uint8Array(T);
  const W = ((2 * T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  r[0] = 1; // bit i is position i - t
  for (let t = 0; t < T; t++) {
    c[t] = (r[t >> 5] >>> (t & 31)) & 1;
    const last = Math.min(W - 2, (2 * t >> 5) + 1);
    for (let i = last; i >= 0; i--) {
      const cur = r[i];
      const d1 = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const d2 = (cur << 2) | (i > 0 ? r[i - 1] >>> 30 : 0);
      s[i] = d2 ^ (d1 | cur);
    }
    s[last + 1] = 0;
    const tmp = r; r = s; s = tmp;
  }
  return c;
}

function runProfile(name, col, T, QMAX) {
  const lo = T >> 1;
  const runs = new Int32Array(QMAX + 1);
  for (let q = 1; q <= QMAX; q++) {
    let t = lo;
    for (; t + q < T; t++) if (col[t + q] !== col[t]) break;
    runs[q] = t - lo;
  }
  const sorted = [...runs.slice(1)].map((v, i) => [i + 1, v]).sort((a, c) => c[1] - a[1]);
  let sum = 0, over20 = 0, over60 = 0;
  for (let q = 1; q <= QMAX; q++) { sum += runs[q]; if (runs[q] > 20) over20++; if (runs[q] > 60) over60++; }
  console.log(`  ${name}: mean run ${(sum / QMAX).toFixed(2)}, lags with run > 20: ${over20}, > 60: ${over60}`);
  console.log(`    top ten (lag:run) ${sorted.slice(0, 10).map(([q, v]) => `${q}:${v}`).join(' ')}`);
  return sorted[0];
}

console.log(`run profile: T=${T}, lags 1..${QMAX}, agreement measured from t = ${T >> 1}`);
const c1 = halfline([1, 0], T, 1)[0];
runProfile('X_{(10)^inf} column 1', c1, T, QMAX);
const seed = seedCentre(T);
runProfile('the seed centre column', seed, T, QMAX);
const coin = new Uint8Array(T);
let x = 123456789;
for (let t = 0; t < T; t++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; coin[t] = x & 1; }
runProfile('a fair coin           ', coin, T, QMAX);

console.log('');
console.log('the same three, as a control on the bias: black density and the rate at');
console.log('which each disagrees with its own shift by 2');
for (const [name, col] of [['X_{(10)^inf} column 1', c1], ['the seed centre column', seed], ['a fair coin           ', coin]]) {
  let ones = 0, d2 = 0;
  for (let t = T >> 1; t < T - 2; t++) { ones += col[t]; if (col[t] !== col[t + 2]) d2++; }
  const n = T - 2 - (T >> 1);
  console.log(`  ${name}: density ${(ones / n).toFixed(4)}, disagreement with shift 2 ${(d2 / n).toFixed(4)}`);
}
