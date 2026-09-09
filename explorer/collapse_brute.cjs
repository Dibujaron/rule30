// EXHAUSTIVE image-shrink for T(r) = (4r XOR (2r OR r)) mod 2^n.
//
// Measures, over ALL 2^n starts (no sampling):
//   |T^k(Z/2^n)| for every k, the eventual image size (= number of cyclic
//   states = the "attractor"), and maxTail(n) = least k with T^k = T^(k+1)
//   as SETS.  The chain T^k(Z/2^n) is decreasing, so equal cardinality at
//   consecutive k implies equal sets -- that is the stabilisation criterion.
//
// maxTail(n) so defined is exactly max_r (steps for r to reach a cycle).
//
// usage: node collapse_brute.cjs [nmax]   (default 28)
const { makeStep32, popcnt } = require('./collapse_lib.cjs');

function run(n) {
  const size = 2 ** n;
  const words = size / 32 < 1 ? 1 : size / 32;
  const step = makeStep32(n);
  let cur = new Uint32Array(words);
  if (size >= 32) cur.fill(0xffffffff); else cur[0] = (size === 32 ? -1 : (2 ** size - 1));
  let curCount = size;
  const sizes = [size];
  let m = 0;
  for (;;) {
    const next = new Uint32Array(words);
    for (let w = 0; w < words; w++) {
      let bits = cur[w];
      while (bits) {
        const lsb = bits & -bits;
        const idx = 31 - Math.clz32(lsb);
        bits ^= lsb;
        const y = step(w * 32 + idx);
        next[y >>> 5] |= 1 << (y & 31);
      }
    }
    let cnt = 0;
    for (let w = 0; w < words; w++) cnt += popcnt(next[w]);
    m++;
    sizes.push(cnt);
    if (cnt === curCount) return { maxTail: m - 1, attractor: cnt, sizes, cur };
    cur = next; curCount = cnt;
  }
}

const nmax = Number(process.argv[2] || 28);
const nmin = Number(process.argv[3] || 1);
console.log('exhaustive over all 2^n starts; stabilisation = |T^k(S)| == |T^(k+1)(S)| (decreasing chain => sets equal)');
console.log(' n  maxTail   2(n-1)  |attractor|  4n-18  maxTail/n   |A|/n   sqrt(2^n)   ms');
for (let n = Math.max(1, nmin); n <= nmax; n++) {
  const t0 = Date.now();
  const { maxTail: mt, attractor, sizes } = run(n);
  console.log(
    [String(n).padStart(2), String(mt).padStart(8), String(2 * (n - 1)).padStart(8),
     String(attractor).padStart(12), String(4 * n - 18).padStart(6),
     (mt / n).toFixed(4).padStart(9), (attractor / n).toFixed(3).padStart(8),
     Math.sqrt(2 ** n).toFixed(0).padStart(10), String(Date.now() - t0).padStart(7)].join(' ')
  );
  if (process.env.SIZES) console.log('    sizes:', sizes.join(','));
}
