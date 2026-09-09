// Vernier / connector, 2026-09-09.
// The worst-case tail (pre-period) of T(r) = 4r XOR (2r OR r) on n-bit words,
// computed WITHOUT a per-state array: maxTail(n) is the least m with
// |T^m(Z/2^n)| = |attractor|, and the images shrink geometrically, so after the
// first sweep the work is proportional to the surviving set.
//
// The onset wall, restated, is  tail_n(1) <= 2(n-1).  This script measures the
// much stronger  maxTail(n) <= 2(n-1),  quantified over every start.

function maxTail(n) {
  const size = 1 << n, mask = size - 1;
  const words = size >>> 5;
  let cur = new Uint32Array(words).fill(0xffffffff);
  let curCount = size;
  let m = 0;
  const sizes = [size];
  for (;;) {
    const next = new Uint32Array(words);
    let list = [];
    // walk the current set
    for (let w = 0; w < words; w++) {
      let bits = cur[w];
      while (bits) {
        const b = 31 - Math.clz32(bits & -bits) + 0;
        const lsb = bits & -bits;
        const idx = 31 - Math.clz32(lsb);
        bits ^= lsb;
        const r = (w << 5) | idx;
        const y = (((4 * r) ^ ((2 * r) | r)) & mask) >>> 0;
        next[y >>> 5] |= 1 << (y & 31);
        void b;
      }
    }
    let cnt = 0;
    for (let w = 0; w < words; w++) cnt += popcnt(next[w]);
    m++;
    sizes.push(cnt);
    if (cnt === curCount) return { maxTail: m - 1, attractor: cnt, sizes };
    cur = next; curCount = cnt;
    void list;
  }
}
function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

console.log(' n   maxTail   2(n-1)   |attractor|   4n-18   maxTail/n   image density after 1 step');
for (let n = 4; n <= 28; n++) {
  const t0 = Date.now();
  const { maxTail: mt, attractor, sizes } = maxTail(n);
  console.log(
    `${String(n).padStart(2)}  ${String(mt).padStart(7)}  ${String(2 * (n - 1)).padStart(7)}  ${String(attractor).padStart(11)}  ${String(4 * n - 18).padStart(6)}  ${(mt / n).toFixed(3).padStart(9)}   ${(sizes[1] / sizes[0]).toFixed(5)}   (${Date.now() - t0} ms)`
  );
}
