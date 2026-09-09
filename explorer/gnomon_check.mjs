// Gnomon — pin down the two exact numbers the sighting document quotes:
//   (1) the least k at which the cascade bound C_k exceeds the wall's budget 2k-2
//   (2) the least K0 such that tail_k >= k for every k in [K0, 600]

const K = 600, T = 2600, WIN = 400;
const rows = new Array(T);
{ let r = 1n; for (let t = 0; t < T; t++) { rows[t] = r; r = (4n * r) ^ ((2n * r) | r); } }
const bit = (t, i) => (t < 0 || t >= T) ? -1 : Number((rows[t] >> BigInt(i)) & 1n);

const tails = new Array(K + 2).fill(-1);
for (let k = 1; k <= K; k++) {
  const mask = (1n << BigInt(k)) - 1n;
  const seen = new Map();
  for (let t = 0; t < T; t++) {
    const key = (rows[t] & mask).toString(36);
    if (seen.has(key)) { tails[k] = seen.get(key); break; }
    seen.set(key, t);
  }
}
const C = new Array(K + 2).fill(0);
C[1] = 0;
for (let k = 1; k < K; k++) {
  let t = C[k], found = -1;
  const lim = Math.min(T, C[k] + WIN);
  while (t < lim) { if (bit(t, k - 1) === 1) { found = t; break; } t++; }
  C[k + 1] = found < 0 ? C[k] : found + 1;
}

let first = -1;
for (let k = 2; k < K; k++) if (C[k] > 2 * k - 2) { first = k; break; }
console.log(`(1) least k with C_k > 2k-2 : k = ${first}, C_k = ${C[first]}, budget = ${2 * first - 2}`);
const viol = [];
for (let k = 2; k < K; k++) if (C[k] > 2 * k - 2) viol.push(k);
console.log(`    total k < ${K} with C_k > 2k-2 : ${viol.length}   first few: ${viol.slice(0, 12).join(",")}`);

let K0 = -1;
for (let k = K; k >= 1; k--) { if (tails[k] < k) { K0 = k + 1; break; } }
console.log(`(2) tail_k >= k for every k in [${K0}, ${K}]; the last k with tail_k < k is ${K0 - 1} (tail = ${tails[K0 - 1]})`);
let minR = Infinity, minK = 0;
for (let k = 100; k <= K; k++) { const r = tails[k] / k; if (r < minR) { minR = r; minK = k; } }
console.log(`    min tail_k / k over [100,${K}] = ${minR.toFixed(4)} at k = ${minK}`);
let maxR = 0, maxK = 0;
for (let k = 100; k <= K; k++) { const r = tails[k] / k; if (r > maxR) { maxR = r; maxK = k; } }
console.log(`    max tail_k / k over [100,${K}] = ${maxR.toFixed(4)} at k = ${maxK}`);
