/**
 * Meridian E2 — is the black density of the rebuilt initial row bounded away
 * from zero, at a depth where Talus's calibration bites?
 *
 * Meridian E measured, over all 8,178 purely periodic boundaries of period at
 * most 12, a minimum black density of 0.1400 in the rebuilt initial row
 * rowzero(b), against a mean of 0.4997 and a floor of 0 attained only by the
 * all-white boundary. The candidate lemma is that the floor is positive for
 * every eventually periodic b other than 0^inf; it implies Prize 1, because the
 * seed's own boundary gives rowzero = 0^inf.
 *
 * The worry is Talus's: the "good" boundaries (those whose X_b has another
 * eventually periodic column, hence an eventually spatially periodic row) can
 * have onsets in the hundreds of thousands, so a shallow measurement can be
 * unrepresentative. So: re-measure the lowest-density words at depth 4,000, and
 * include the words Talus named as good with large onsets.
 *
 * Nothing here proves anything.
 */

function rowZero(b, K) {
  const n = K + 2;
  const d = new Uint8Array(n);
  let half = new Uint8Array(n + 2);
  let next = new Uint8Array(n + 2);
  for (let t = 0; t + 1 < n; t++) {
    const m = half.length;
    next[0] = b[t] ^ (half[0] | half[1]);
    for (let x = 1; x < m - 1; x++) next[x] = half[x - 1] ^ (half[x] | half[x + 1]);
    next[m - 1] = 0;
    const tmp = half; half = next; next = tmp;
    d[t + 1] = half[0];
  }
  const L = [];
  for (let m = 0; m <= K + 1; m++) L.push(new Uint8Array(K + 2 - m));
  for (let t = 0; t <= K + 1; t++) L[0][t] = b[t];
  for (let t = 0; t + 1 <= K + 1; t++) L[1][t] = b[t + 1] ^ (b[t] | d[t]);
  for (let m = 2; m <= K + 1; m++) {
    for (let t = 0; t + m <= K + 1; t++) {
      L[m][t] = L[m - 1][t + 1] ^ (L[m - 1][t] | L[m - 2][t]);
    }
  }
  const out = new Uint8Array(K);
  for (let k = 1; k <= K; k++) out[k - 1] = L[k][0];
  return out;
}

const rep = (w, len) => {
  const b = new Uint8Array(len);
  for (let i = 0; i < len; i++) b[i] = w[i % w.length];
  return b;
};

function density(w, K) {
  const r = rowZero(rep(w, K + 2), K);
  let ones = 0;
  for (const z of r) ones += z;
  return ones / K;
}

/** tail density: ignore the first half, in case of a long onset */
function tailDensity(w, K) {
  const r = rowZero(rep(w, K + 2), K);
  let ones = 0;
  const start = K >> 1;
  for (let i = start; i < K; i++) ones += r[i];
  return ones / (K - start);
}

// 1. the lowest-density words of period <= 12, re-measured deep
const shallow = [];
for (let p = 1; p <= 12; p++) {
  for (let v = 0; v < (1 << p); v++) {
    const w = [];
    for (let i = 0; i < p; i++) w.push((v >> (p - 1 - i)) & 1);
    if (w.every((z) => z === 0)) continue;
    shallow.push([density(w, 200), w]);
  }
}
shallow.sort((a, b) => a[0] - b[0]);
const K = 4000;
let worst = 2, worstW = null, worstTail = 2, worstTailW = null;
for (const [, w] of shallow.slice(0, 120)) {
  const dd = density(w, K);
  const td = tailDensity(w, K);
  if (dd < worst) { worst = dd; worstW = w.join(''); }
  if (td < worstTail) { worstTail = td; worstTailW = w.join(''); }
}
console.log(
  `120 lowest-density words of period <= 12, at depth ${K}: ` +
    `min density ${worst.toFixed(4)} (b = ${worstW}), ` +
    `min tail density ${worstTail.toFixed(4)} (b = ${worstTailW})`,
);

// 2. the words Talus named, whose "good" verdicts needed 10^5-10^6 rows
const named = [
  '1101011000', '1001101000', '1010001001', '1010000111', '1111010000',
  '11111110', '10000000', '100000000', '1000000000', '01011', '01101',
  '10101', '10110', '11010',
];
for (const s of named) {
  const w = [...s].map(Number);
  console.log(
    `  b = (${s})^inf : density ${density(w, K).toFixed(4)}, ` +
      `tail density ${tailDensity(w, K).toFixed(4)}`,
  );
}

// 3. a random sample of longer periods
let seed = 12345 >>> 0;
const rnd = () => ((seed ^= seed << 13), (seed ^= seed >>> 17), (seed ^= seed << 5), (seed >>> 0));
let minRand = 2, minRandW = null;
for (let i = 0; i < 300; i++) {
  const p = 13 + (rnd() % 20);
  const w = [];
  for (let j = 0; j < p; j++) w.push(rnd() & 1);
  if (w.every((z) => z === 0)) continue;
  const dd = density(w, 1500);
  if (dd < minRand) { minRand = dd; minRandW = w.join(''); }
}
console.log(`300 random words of period 13..32, at depth 1500: min density ${minRand.toFixed(4)} (b = ${minRandW})`);
