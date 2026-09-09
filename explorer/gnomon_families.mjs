// Gnomon — the three theorem families that DO bound the transient of a finite
// dynamical system by a polynomial in n = log2 |states|, and where rule 30's row
// map falls out of each hypothesis.
//
//   linear over F2   : Fitting/nilpotency index -> transient <= n
//   monotone (AND/OR): Boolean matrix exponent, Wielandt -> transient = O(n^2)
//   acyclic graph    : Robert's theorem -> nilpotent of class at most n
//
// Rule 30 is none of the three. This script checks that mechanically and
// measures the depth of the truncated functional graph for each family.

function analyse(step, n) {
  const N = 1 << n;
  const next = new Int32Array(N);
  for (let x = 0; x < N; x++) next[x] = step(x);
  const indeg = new Int32Array(N);
  for (let x = 0; x < N; x++) indeg[next[x]]++;
  const stack = new Int32Array(N); let sp = 0;
  for (let x = 0; x < N; x++) if (indeg[x] === 0) stack[sp++] = x;
  const removed = new Uint8Array(N);
  while (sp > 0) { const x = stack[--sp]; removed[x] = 1; if (--indeg[next[x]] === 0) stack[sp++] = next[x]; }
  let attractor = 0; for (let x = 0; x < N; x++) if (!removed[x]) attractor++;
  const depth = new Int32Array(N).fill(-1);
  for (let x = 0; x < N; x++) if (!removed[x]) depth[x] = 0;
  const path = new Int32Array(N); let maxDepth = 0;
  for (let x0 = 0; x0 < N; x0++) {
    if (depth[x0] >= 0) continue;
    let len = 0, x = x0;
    while (depth[x] < 0) { path[len++] = x; x = next[x]; }
    let d = depth[x];
    while (len > 0) { d++; depth[path[--len]] = d; }
    if (d > maxDepth) maxDepth = d;
  }
  return { tail1: depth[1], depth: maxDepth, attractor };
}
function makeEcaStep(bits, n) {
  const mask = (1 << n) - 1;
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const b0 = i >= 2 ? (r >>> (i - 2)) & 1 : 0;
      const b1 = i >= 1 ? (r >>> (i - 1)) & 1 : 0;
      const b2 = (r >>> i) & 1;
      if (bits[(b0 << 2) | (b1 << 1) | b2]) out |= 1 << i;
    }
    return out & mask;
  };
}
const tableOf = (R) => { const b = []; for (let k = 0; k < 8; k++) b.push((R >>> k) & 1); return b; };
const at = (b, l, c, r) => b[(l << 2) | (c << 1) | r];

function isAffine(b) {
  const a0 = at(b, 0, 0, 0), a1 = at(b, 1, 0, 0) ^ a0, a2 = at(b, 0, 1, 0) ^ a0, a3 = at(b, 0, 0, 1) ^ a0;
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++)
    if (at(b, l, c, r) !== (a0 ^ (a1 & l ? 1 : 0) ^ (a2 & c ? 1 : 0) ^ (a3 & r ? 1 : 0))) return false;
  return true;
}
function monotoneWitness(b) { // null if monotone, else a concrete violating pair
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
    if (l === 0 && at(b, 1, c, r) < at(b, 0, c, r)) return `f(0,${c},${r})=1 > f(1,${c},${r})=0`;
    if (c === 0 && at(b, l, 1, r) < at(b, l, 0, r)) return `f(${l},0,${r})=1 > f(${l},1,${r})=0`;
    if (r === 0 && at(b, l, c, 1) < at(b, l, c, 0)) return `f(${l},${c},0)=1 > f(${l},${c},1)=0`;
  }
  return null;
}
const isMonotone = (b) => monotoneWitness(b) === null;
// bit i of the output depends on bit i of the input (a self-loop in the local
// interaction graph at this state) iff flipping bit i changes the output bit.
function selfLoopCondition(b) {
  const out = [];
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++)
    if (at(b, l, c, 0) !== at(b, l, c, 1)) out.push(`(left=${l},centre=${c})`);
  return out;
}

const b30 = tableOf(30);
console.log("rule 30's local function f(left,centre,right) = left XOR (centre OR right)");
console.log(`  affine over F2 (linear network)? ${isAffine(b30)}`);
console.log(`  monotone (conjunctive/disjunctive network)? ${isMonotone(b30)}   witness: ${monotoneWitness(b30)}`);
console.log(`  self-loop at bit i present for (bit_{i-2},bit_{i-1}) in: ${selfLoopCondition(b30).join(" ")}`);
console.log("  -> the loop at i is present exactly when bit_{i-1} = 0, and absent exactly when it is 1.");
console.log("  -> the interaction graph is acyclic only at states whose bits 0..n-2 are ALL black.");

const N = 18, BUDGET = 2 * (N - 1);
const lin = [], mon = [], oth = [];
for (let R = 0; R < 256; R++) {
  const b = tableOf(R);
  const d = analyse(makeEcaStep(b, N), N).depth;
  const rec = { R, d };
  if (isAffine(b)) lin.push(rec); else if (isMonotone(b)) mon.push(rec); else oth.push(rec);
}
const mx = (a) => a.reduce((m, x) => Math.max(m, x.d), 0);
const mean = (a) => (a.reduce((s, x) => s + x.d, 0) / a.length).toFixed(2);
console.log(`\nat n = ${N} (budget 2(n-1) = ${BUDGET}):`);
console.log(`  affine rules      : ${lin.length} of 256, max depth ${mx(lin)}, mean ${mean(lin)}   [Fitting predicts <= n = ${N}]`);
console.log(`    ${lin.map((x) => x.R + ":" + x.d).join("  ")}`);
console.log(`  monotone, non-affine: ${mon.length} of 256, max depth ${mx(mon)}, mean ${mean(mon)}`);
console.log(`    ${mon.map((x) => x.R + ":" + x.d).join("  ")}`);
console.log(`  neither           : ${oth.length} of 256, max depth ${mx(oth)}, mean ${mean(oth)}`);
console.log(`  rule 30 is in "neither"; its depth is ${oth.find((x) => x.R === 30).d}`);

console.log("\naffine rules across n (Fitting: depth <= n):");
for (const R of lin.map((x) => x.R)) {
  const row = [];
  for (const n of [8, 12, 16, 20]) row.push(analyse(makeEcaStep(tableOf(R), n), n).depth);
  console.log(`  rule ${String(R).padStart(3)}: depth at n=8,12,16,20 = ${row.join(", ")}`);
}
console.log("\nmonotone non-affine rules across n:");
for (const R of mon.map((x) => x.R)) {
  const row = [];
  for (const n of [8, 12, 16, 20]) row.push(analyse(makeEcaStep(tableOf(R), n), n).depth);
  console.log(`  rule ${String(R).padStart(3)}: depth at n=8,12,16,20 = ${row.join(", ")}`);
}
console.log("\nrule 30 across n for comparison:");
{
  const row = [];
  for (const n of [8, 12, 16, 20]) row.push(analyse(makeEcaStep(b30, n), n).depth);
  console.log(`  rule  30: depth at n=8,12,16,20 = ${row.join(", ")}`);
}
