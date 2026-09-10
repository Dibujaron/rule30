// Talus, 2026-09-10.  Is m(p) = a(ord2(p))?
//
// m(p) is the distance from the right edge of row p to the nearest black cell
// strictly left of it.  Crystal 12 / Rowland 2006 say the white void touching
// the right edge at row t is a function of ord2(t) alone.  If so, m(p) depends
// only on ord2(p) and is NOT growing with p -- m is 1 at every odd p however
// large.  That matters because I nearly wrote "m(p) grows like 2.4 log2 p",
// which is true only along the powers of two.

const PMAX = 65536;

function shiftUp(r, k, words) {
  const out = new Uint32Array(words);
  const w = k >> 5, b = k & 31;
  if (b === 0) { for (let i = r.length - 1; i >= 0; i--) if (i + w < words) out[i + w] = r[i]; }
  else for (let i = r.length - 1; i >= 0; i--) {
    const v = r[i];
    if (i + w < words) out[i + w] |= (v << b) >>> 0;
    if (i + w + 1 < words) out[i + w + 1] |= (v >>> (32 - b));
  }
  return out;
}
const bit = (r, i) => (r[i >> 5] >>> (i & 31)) & 1;

const a = [1,3,4,6,7,9,15,16,24,25,27,29,34,36,37,39,41,43,48,49,51,54,55,58,60,63,64,
           66,69,70,72,74,77,79,80,82,84,86,90,91,93];   // Rowland 2006, a(0..40)

let r = new Uint32Array(1); r[0] = 1;
let bad = 0, first = null, tested = 0;
const seen = new Map();
for (let t = 1; t <= PMAX; t++) {
  const words = ((2 * t) >> 5) + 1;
  const s2 = shiftUp(r, 2, words), s1 = shiftUp(r, 1, words);
  const o = new Uint32Array(words);
  for (let i = 0; i < words; i++) o[i] = (s2[i] ^ (s1[i] | (i < r.length ? r[i] : 0))) >>> 0;
  r = o;
  let b = 2 * t - 1;
  while (b >= 0 && !bit(r, b)) b--;
  const m = 2 * t - b;
  let n = 0, q = t; while (q % 2 === 0) { q >>= 1; n++; }
  if (!seen.has(n)) seen.set(n, m);
  tested++;
  if (m !== a[n]) { bad++; if (!first) first = { p: t, ord2: n, m, a: a[n] }; }
  if (seen.get(n) !== m) { bad++; if (!first) first = { p: t, ord2: n, m, seenBefore: seen.get(n) }; }
}
console.log(`m(p) = a(ord2(p)) for p = 1..${PMAX}: ${tested} tested, ${bad} failures`,
  first ? JSON.stringify(first) : '');
console.log('m by ord2:', Array.from(seen).sort((x, y) => x[0] - y[0]).map(([n, m]) => `${n}:${m}`).join(' '));
console.log('largest m over the range:', Math.max(...seen.values()));
console.log('a(n)/n for n = 1..16:',
  Array.from({ length: 16 }, (_, i) => (a[i + 1] / (i + 1)).toFixed(3)).join(','));
