// Vernier / connector, 2026-09-09.
// Same measurement as vernier_maxtail.mjs, pushed to n = 30, and reading the
// attractor's cycle lengths out.  The prediction under test: the project's
// doubling positions k = 3, 8, 29, 400, 53208 (NKS p. 871) are exactly the k at
// which T mod 2^(k+1) first acquires a cycle of the next power-of-two length.
// So a cycle of length 8 should appear for the first time at n = 30.

function run(n) {
  const size = 2 ** n, mask = size - 1;
  const words = size / 32;
  let cur = new Uint32Array(words).fill(0xffffffff);
  let curCount = size, m = 0;
  const step = (r) => (((4 * r) ^ ((2 * r) | r)) >>> 0) & mask;
  for (;;) {
    const next = new Uint32Array(words);
    for (let w = 0; w < words; w++) {
      let bits = cur[w];
      while (bits) {
        const lsb = bits & -bits;
        const idx = 31 - Math.clz32(lsb);
        bits ^= lsb;
        const y = step((w * 32) + idx);
        next[y >>> 5] |= 1 << (y & 31);
      }
    }
    let cnt = 0;
    for (let w = 0; w < words; w++) cnt += popcnt(next[w]);
    m++;
    if (cnt === curCount) break;
    cur = next; curCount = cnt;
  }
  // extract the attractor and read off its cycle lengths
  const states = [];
  for (let w = 0; w < words; w++) {
    let bits = cur[w];
    while (bits) { const lsb = bits & -bits; const idx = 31 - Math.clz32(lsb); bits ^= lsb; states.push((w * 32) + idx); }
  }
  const seen = new Set();
  const lens = new Map();
  for (const s of states) {
    if (seen.has(s)) continue;
    let x = s, l = 0;
    const local = [];
    do { local.push(x); seen.add(x); x = step(x); l++; } while (x !== s);
    lens.set(l, (lens.get(l) || 0) + 1);
  }
  // tail of the seed's own orbit
  let r = 1, t = 0;
  const inAttr = (v) => (cur[v >>> 5] >>> (v & 31)) & 1;
  while (!inAttr(r)) { r = step(r); t++; }
  return { n, maxTail: m - 1, attractor: states.length, lens: [...lens.entries()].sort((a, b) => a[0] - b[0]), tail1: t };
}
function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

for (const n of [28, 29, 30]) {
  const t0 = Date.now();
  const a = run(n);
  console.log(`n=${a.n}  maxTail=${a.maxTail}  (bound 2(n-1)=${2 * (n - 1)})  tail(1)=${a.tail1}  |attractor|=${a.attractor} (4n-18=${4 * n - 18})  cycles: ${a.lens.map(([l, c]) => `${l}x${c}`).join(' ')}   [${((Date.now() - t0) / 1000).toFixed(1)}s]`);
}
