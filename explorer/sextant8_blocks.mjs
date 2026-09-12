/**
 * Sextant, 2026-09-12. IS A RULE 30 ROW LOCALLY DISTINGUISHABLE FROM A COIN?
 *
 * The fence says no local-statistics argument can prove row balance, because
 * an inequality on block frequencies holds of every configuration and the ring
 * 10011 has density 3/5. This is the measurement behind the "why": the seed's
 * own rows have the k-block frequencies of a fair coin, so there is no local
 * statistic to build a rule-30-specific argument out of in the first place.
 *
 * For each k, every one of the 2^k blocks is counted in row t of the seed and
 * the chi-square against the uniform 2^-k is compared with the same statistic
 * for a coin word of the same length. Blocks overlap, so the chi-square is not
 * distributed as chi-square; the coin column is there to supply the scale,
 * which is the whole point -- a number without its null is not a measurement.
 *
 * Also: the number of DISTINCT k-blocks occurring in the row, against 2^k.
 */

const T = 200_000;
const KS = [1, 2, 3, 4, 6, 8, 10, 12, 14, 16];
const WORDS = ((2 * T + 160) >> 5) + 4;

const r = new Uint32Array(WORDS);
r[0] = 1;
for (let t = 0; t < T; t++) {
  const hi = Math.min(WORDS - 2, ((2 * t) >> 5) + 1);
  let p = 0;
  for (let m = 0; m <= hi + 1; m++) {
    const cur = r[m];
    const s2 = ((cur << 2) | (p >>> 30)) >>> 0;
    const s1 = ((cur << 1) | (p >>> 31)) >>> 0;
    r[m] = (s2 ^ (s1 | cur)) >>> 0;
    p = cur;
  }
}
const n = 2 * T + 1;
const bit = (arr, i) => (arr[i >> 5] >>> (i & 31)) & 1;

// a coin word of the same length
const coin = new Uint32Array(WORDS);
{
  let x = 0x9e3779b9 >>> 0;
  for (let m = 0; m < WORDS; m++) {
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    coin[m] = x;
  }
}

function stats(arr, k) {
  const counts = new Float64Array(1 << k);
  let v = 0;
  const mask = k === 32 ? 0xffffffff : ((1 << k) - 1);
  for (let i = 0; i < k - 1; i++) v = ((v << 1) | bit(arr, i)) & mask;
  let total = 0;
  for (let i = k - 1; i < n; i++) {
    v = ((v << 1) | bit(arr, i)) & mask;
    counts[v]++; total++;
  }
  const exp = total / (1 << k);
  let chi = 0, distinct = 0;
  for (let j = 0; j < (1 << k); j++) {
    const d = counts[j] - exp;
    chi += d * d / exp;
    if (counts[j] > 0) distinct++;
  }
  return { chi, distinct, total, dof: (1 << k) - 1 };
}

console.log(`row ${T} of the seed, ${n} cells; coin word of the same length beside it`);
console.log(' k    dof      chi2 (rule 30)   chi2 (coin)    distinct blocks / 2^k (rule 30, coin)');
for (const k of KS) {
  const a = stats(r, k), b = stats(coin, k);
  console.log(
    `${String(k).padStart(2)} ${String(a.dof).padStart(6)}   ` +
    `${a.chi.toFixed(1).padStart(14)} ${b.chi.toFixed(1).padStart(13)}    ` +
    `${a.distinct}/${1 << k}, ${b.distinct}/${1 << k}`);
}

// the same for the run-length distribution of one row
console.log('');
console.log('run lengths in row', T, '(black runs), against the geometric 2^-L');
{
  const tally = (arr) => {
    const c = new Map();
    let L = 0;
    for (let i = 0; i < n; i++) {
      if (bit(arr, i)) L++;
      else { if (L > 0) c.set(L, (c.get(L) || 0) + 1); L = 0; }
    }
    if (L > 0) c.set(L, (c.get(L) || 0) + 1);
    return c;
  };
  const a = tally(r), b = tally(coin);
  const tot = [...a.values()].reduce((x, y) => x + y, 0);
  const totb = [...b.values()].reduce((x, y) => x + y, 0);
  console.log(' L   rule 30 count   expected      coin count');
  for (let L = 1; L <= 12; L++) {
    console.log(`${String(L).padStart(2)} ${String(a.get(L) || 0).padStart(14)} ` +
      `${(tot / (1 << L)).toFixed(1).padStart(12)} ${String(b.get(L) || 0).padStart(15)}`);
  }
  const mean = [...a.entries()].reduce((s, [L, c]) => s + L * c, 0) / tot;
  const meanb = [...b.entries()].reduce((s, [L, c]) => s + L * c, 0) / totb;
  console.log(`  mean black run: rule 30 ${mean.toFixed(5)}, coin ${meanb.toFixed(5)}, geometric 2`);
  console.log(`  longest black run: rule 30 ${Math.max(...a.keys())}, coin ${Math.max(...b.keys())}`);
}
