// EXHAUSTIVE image-shrink for 32 < n <= 36, using two-word arithmetic and a
// bitset indexed by (hi,lo).  Same criterion as collapse_brute.cjs:
// maxTail(n) = least k with |T^k(Z/2^n)| == |T^(k+1)(Z/2^n)|.
// Its only purpose is to check the sampler of collapse_sample.cjs above the
// range where a 32-bit bitset fits.
//
// usage: node --max-old-space-size=32000 collapse_brute64.cjs <n>
const n = Number(process.argv[2]);
if (!(n > 32 && n <= 36)) throw new Error('n must be 33..36');
const hiBits = n - 32;
const hiMask = (2 ** hiBits) - 1;
const WPH = 134217728; // 2^32 / 32 words per hi-half
const words = WPH * (hiMask + 1);
const size = 2 ** n;

function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

let cur = new Uint32Array(words).fill(0xffffffff);
let curCount = size, m = 0;
const sizes = [size];
const t0 = Date.now();
for (;;) {
  const next = new Uint32Array(words);
  for (let w = 0; w < words; w++) {
    let bits = cur[w];
    if (bits === 0) continue;
    const xh = (w / WPH) | 0;
    const loBase = ((w % WPH) << 5) >>> 0;
    while (bits) {
      const lsb = bits & -bits;
      const idx = 31 - Math.clz32(lsb);
      bits ^= lsb;
      const xl = (loBase | idx) >>> 0;
      const a = (xl << 2) >>> 0, ah = (((xh << 2) | (xl >>> 30)) >>> 0);
      const b = (xl << 1) >>> 0, bh = (((xh << 1) | (xl >>> 31)) >>> 0);
      const yl = ((a ^ (b | xl))) >>> 0;
      const yh = ((ah ^ (bh | xh)) & hiMask) >>> 0;
      const wi = yh * WPH + (yl >>> 5);
      next[wi] |= 1 << (yl & 31);
    }
  }
  let cnt = 0;
  for (let w = 0; w < words; w++) cnt += popcnt(next[w]);
  m++;
  sizes.push(cnt);
  if (cnt === curCount) break;
  cur = next; curCount = cnt;
}
console.log(`n=${n}  maxTail=${m - 1}  |attractor|=${curCount}  maxTail-n=${m - 1 - n}  ratio=${((m - 1) / n).toFixed(4)}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
console.log('image sizes: ' + sizes.join(','));
