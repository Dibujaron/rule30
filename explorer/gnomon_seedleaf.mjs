// Gnomon — where in the forest does the seed sit?
// (a) is 1 a Garden-of-Eden state (no preimage) of T mod 2^n?
// (b) how deep is 1 in its tree, against the deepest leaf?
// (c) which state is the deepest leaf?

function build(n) {
  const N = 1 << n, mask = N - 1;
  const next = new Int32Array(N);
  for (let x = 0; x < N; x++) next[x] = ((4 * x) ^ ((2 * x) | x)) & mask;
  const indeg = new Int32Array(N);
  for (let x = 0; x < N; x++) indeg[next[x]]++;
  const stack = new Int32Array(N); let sp = 0;
  for (let x = 0; x < N; x++) if (indeg[x] === 0) stack[sp++] = x;
  const gardenOfEden = sp;
  const seedIsGoE = indeg[1] === 0;
  const ind2 = indeg.slice();
  const removed = new Uint8Array(N);
  while (sp > 0) { const x = stack[--sp]; removed[x] = 1; if (--ind2[next[x]] === 0) stack[sp++] = next[x]; }
  const depth = new Int32Array(N).fill(-1);
  for (let x = 0; x < N; x++) if (!removed[x]) depth[x] = 0;
  const path = new Int32Array(N); let maxDepth = 0, argmax = -1;
  for (let x0 = 0; x0 < N; x0++) {
    if (depth[x0] >= 0) continue;
    let len = 0, x = x0;
    while (depth[x] < 0) { path[len++] = x; x = next[x]; }
    let d = depth[x];
    while (len > 0) { d++; depth[path[--len]] = d; }
    if (d > maxDepth) { maxDepth = d; argmax = x0; }
  }
  return { N, gardenOfEden, seedIsGoE, tail1: depth[1], maxDepth, argmax };
}

console.log(" n   |Q|      GoE states   GoE fraction   1 is GoE   tail(1)   max tail   deepest leaf");
for (let n = 4; n <= 22; n++) {
  const r = build(n);
  console.log(
    `${String(n).padStart(2)} ${String(r.N).padStart(9)} ${String(r.gardenOfEden).padStart(12)} ` +
    `${(r.gardenOfEden / r.N).toFixed(4).padStart(14)} ${String(r.seedIsGoE).padStart(10)} ` +
    `${String(r.tail1).padStart(9)} ${String(r.maxDepth).padStart(10)} ${String(r.argmax).padStart(14)}`);
}
console.log("\nBy hand, and this is why: bit0(T r) = bit0(r), and bit1(T r) = bit0(r) OR bit1(r).");
console.log("T(r) = 1 needs bit0 = 1 and bit1 = 0, but bit0 = 1 forces bit1(T r) = 1. So 1 has no preimage.");
