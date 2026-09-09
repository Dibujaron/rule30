// Vernier / connector, 2026-09-09.  The attractor of T mod 2^31.
// Prediction from n <= 30: after the unique 8-cycle appears at n = 30, the
// count of 8-cycles should grow by one per level while the 4-cycle count stays
// at 21, so |attractor| = 4 + 10 + 84 + 8*2 = 114 at n = 31.
const n = 31;
const size = 2 ** n, mask = size - 1, words = size / 32;
const step = (r) => ((((4 * r) ^ ((2 * r) | r)) >>> 0) & mask) >>> 0;
let cur = new Uint32Array(words).fill(0xffffffff);
let curCount = size, m = 0;
function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}
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
  if (cnt === curCount) break;
  cur = next; curCount = cnt;
}
const states = [];
for (let w = 0; w < words; w++) {
  let bits = cur[w];
  while (bits) { const lsb = bits & -bits; const idx = 31 - Math.clz32(lsb); bits ^= lsb; states.push(w * 32 + idx); }
}
const seen = new Set(); const lens = new Map();
for (const s of states) {
  if (seen.has(s)) continue;
  let x = s, l = 0;
  do { seen.add(x); x = step(x); l++; } while (x !== s);
  lens.set(l, (lens.get(l) || 0) + 1);
}
let r = 1, t = 0;
const inAttr = (v) => (cur[v >>> 5] >>> (v & 31)) & 1;
while (!inAttr(r)) { r = step(r); t++; }
let cl = 0, x = r; do { x = step(x); cl++; } while (x !== r);
console.log(`n=${n}  maxTail=${m - 1}  (bound 2(n-1)=${2 * (n - 1)})  tail(1)=${t}  cycleLen(1)=${cl}`);
console.log(`|attractor|=${states.length}  cycles: ${[...lens.entries()].sort((a, b) => a[0] - b[0]).map(([l, c]) => `${l}x${c}`).join(' ')}`);
