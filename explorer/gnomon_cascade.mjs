// Gnomon — the cascade bound, and why every reset-style induction lands on the
// wall's own budget rather than below it.
//
// Read rule 30's row map as a Boolean network on the bits of rowNat:
//   bit_i(T r) = bit_{i-2}(r) XOR (bit_{i-1}(r) OR bit_i(r)).
// bit i depends on ITSELF exactly when bit_{i-1}(r) = 0. So the local
// interaction graph has a positive loop at i precisely when the bit below is
// white, and the loop is CUT exactly when it is black. That cut is the
// project's reset lemma; Robert's theorem says a network whose interaction
// graph is acyclic is nilpotent of class at most n, and the loops are the whole
// gap between rule 30 and that hypothesis.
//
// The cascade bound: once bits 0..k-1 have settled at time C_k, bit k must
// settle by the first later time at which its loop is cut, plus one:
//   C_{k+1} = 1 + min { t >= C_k : bit_{k-1}(row_t) = 1 }.
// If the loop at k is NEVER cut after C_k -- i.e. bit_{k-1} is eventually white
// -- then bit k is a pure XOR accumulator, b(t+1) = b(t) XOR bit_{k-2}(t), and
// a XOR accumulator driven by an eventually periodic sequence settles at the
// same time as its driver: increment 0, and the period may double. Those are
// exactly the eventually-white diagonals.
//
// Under any model where the control bit is a fair coin, E[increment] = 2, so
// C_n ~ 2n. The wall's budget is 2n - 2. This script measures both.

const K = 600;                 // levels
const T = 2600;                // rows
const WIN = 400;               // window for declaring a level an accumulator

const rows = new Array(T);
{
  let r = 1n;
  for (let t = 0; t < T; t++) { rows[t] = r; r = (4n * r) ^ ((2n * r) | r); }
}
const bit = (t, i) => (t < 0 || t >= T) ? -1 : Number((rows[t] >> BigInt(i)) & 1n);

function trueTail(k) {
  const mask = (1n << BigInt(k)) - 1n;
  const seen = new Map();
  for (let t = 0; t < T; t++) {
    const key = (rows[t] & mask).toString(36);
    if (seen.has(key)) return { tail: seen.get(key), cycle: t - seen.get(key) };
    seen.set(key, t);
  }
  return { tail: -1, cycle: -1 };
}

const tails = new Array(K + 2).fill(-1);
const cycles = new Array(K + 2).fill(-1);
for (let k = 1; k <= K; k++) { const r = trueTail(k); tails[k] = r.tail; cycles[k] = r.cycle; }

const C = new Array(K + 2).fill(0);
C[1] = 0;
let incSum = 0, incN = 0, maxInc = 0;
const incHist = new Map();
const accumulators = [];
for (let k = 1; k < K; k++) {
  let t = C[k], found = -1;
  const lim = Math.min(T, C[k] + WIN);
  while (t < lim) { if (bit(t, k - 1) === 1) { found = t; break; } t++; }
  let inc;
  if (found < 0) { inc = 0; accumulators.push(k); } else { inc = found - C[k] + 1; }
  C[k + 1] = C[k] + inc;
  incSum += inc; incN++;
  if (inc > maxInc) maxInc = inc;
  incHist.set(inc, (incHist.get(inc) || 0) + 1);
}

console.log("    k   trueTail  trueTail/k    cascade  cascade/k   budget 2k-2   cycle");
for (const k of [10, 25, 50, 100, 200, 300, 400, 500, 599]) {
  console.log(
    `${String(k).padStart(5)} ${String(tails[k]).padStart(10)} ${(tails[k] / k).toFixed(4).padStart(11)} ` +
    `${String(C[k]).padStart(10)} ${(C[k] / k).toFixed(4).padStart(10)} ${String(2 * k - 2).padStart(13)} ${String(cycles[k]).padStart(7)}`);
}

console.log(`\ncascade mean increment = ${(incSum / incN).toFixed(4)}   max increment = ${maxInc}`);
console.log("increment histogram (inc:count):",
  [...incHist.entries()].sort((a, b) => a[0] - b[0]).map(([a, b]) => `${a}:${b}`).join("  "));
console.log(`accumulator levels (loop never cut within ${WIN} rows): k = ${accumulators.join(", ")}`);
console.log("  -- these are the levels k whose control diagonal k-1 is eventually white,");
console.log("     i.e. the project's eventually-white diagonals 2, 7, 28, 399, ... shifted by one.");

let early = 0, late = 0, eq = 0;
for (let k = 2; k <= K; k++) { if (tails[k] < C[k]) early++; else if (tails[k] > C[k]) late++; else eq++; }
console.log(`\nlevels settling strictly before the cascade bound: ${early} of ${K - 1}; equal ${eq}; after ${late}`);

let worst = 0, worstK = 0;
for (let k = 2; k <= K; k++) { const r = tails[k] / (2 * k - 2); if (r > worst) { worst = r; worstK = k; } }
console.log(`worst trueTail/(2k-2) = ${worst.toFixed(4)} at k = ${worstK}   (the wall's own margin)`);
let wc = 0, wck = 0;
for (let k = 20; k <= K; k++) { const r = C[k] / (2 * k - 2); if (r > wc) { wc = r; wck = k; } }
console.log(`worst  cascade/(2k-2) = ${wc.toFixed(4)} at k = ${wck}   (>1 means the cascade bound alone cannot close the wall)`);
console.log(`cascade slope over k in [100,${K}): ${((C[K - 1] - C[100]) / (K - 1 - 100)).toFixed(4)} per level`);
console.log(`trueTail slope over k in [100,${K}]: ${((tails[K] - tails[100]) / (K - 100)).toFixed(4)} per level`);

{
  let ones = 0, tot = 0;
  for (let k = 100; k < K; k++) {
    for (let t = C[k]; t < Math.min(T, C[k] + 8); t++) { const b = bit(t, k - 1); if (b >= 0) { ones += b; tot++; } }
  }
  console.log(`black density of the control bit in the 8 rows after each cascade arrival, k in [100,${K}): ${(ones / tot).toFixed(4)} over ${tot} reads`);
}
