// t62_orient.cjs -- the only word in Wolfram 1986 Table 6.2 that can detect a
// left/right reflection is the length-12 period-3 element. This decides which
// way it points.
//
// rule 30 : new(i) = C(i-1) XOR (C(i) OR C(i+1))        [the project's rule]
// rule 86 : new(i) = C(i+1) XOR (C(i) OR C(i-1))        [its mirror image]

function step(w, mirror) {
  const n = w.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = w[(i - 1 + n) % n], c = w[i], r = w[(i + 1) % n];
    o[i] = mirror ? (r ^ (c | l)) & 1 : (l ^ (c | r)) & 1;
  }
  return o;
}
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const toArr = (s) => Uint8Array.from(s.split('').map(Number));
const toStr = (a) => Array.from(a).join('');
function period(w, mirror, cap = 4096) {
  let v = w;
  for (let t = 1; t <= cap; t++) { v = step(v, mirror); if (eq(v, w)) return t; }
  return -1;
}
function canon(s) {
  const n = s.length; let best = null;
  for (let r = 0; r < n; r++) { const x = s.slice(r) + s.slice(0, r); if (best === null || x < best) best = x; }
  return best;
}
const rev = (s) => s.split('').reverse().join('');

const W = '000011111001';   // as printed in sources/wolfram-1986-...txt, TABLE 6.2
console.log('Wolfram 1986 Table 6.2, period-3 element, as printed: ' + W);
console.log('  under rule 30 (project orientation), minimal temporal period: ' + period(toArr(W), false));
console.log('  under rule 86 (mirror),              minimal temporal period: ' + period(toArr(W), true));
console.log('reversed word ' + rev(W) + ' (canon ' + canon(rev(W)) + '):');
console.log('  under rule 30, minimal temporal period: ' + period(toArr(rev(W)), false));
console.log('  under rule 86, minimal temporal period: ' + period(toArr(rev(W)), true));
console.log('');

// exhaustive: every length-12 necklace with temporal period exactly 3
for (const mirror of [false, true]) {
  const hits = new Set();
  for (let x = 0; x < (1 << 12); x++) {
    const s = Array.from({ length: 12 }, (_, i) => (x >> i) & 1).join('');
    const a = toArr(s);
    if (period(a, mirror, 12) === 3) hits.add(canon(s));
  }
  console.log(`every length-12 necklace of minimal temporal period 3 under rule ${mirror ? 86 : 30}: ` +
    Array.from(hits).sort().join(', ') + `   (measured over all 4096 words)`);
}
console.log('');

// the period-4 words: can they detect a reflection at all?
console.log('Table 6.2 period-4 words -- reversal-symmetric as necklaces?');
for (const w of ['0000001', '0000111', '0010011', '0111111']) {
  console.log(`  ${w}: canon=${canon(w)}  canon(reverse)=${canon(rev(w))}  ${canon(w) === canon(rev(w)) ? 'SYMMETRIC (cannot detect reflection)' : 'asymmetric'}`);
}
console.log('  and 0 / 01 are trivially symmetric.');
console.log('');

// sanity: does the project rule give the standard rule-30 picture (regular left edge)?
{
  const N = 41;
  let row = new Uint8Array(N); row[20] = 1;
  const lines = [];
  for (let t = 0; t < 12; t++) {
    lines.push(Array.from(row).map((b) => (b ? '#' : '.')).join(''));
    const o = new Uint8Array(N);
    for (let i = 1; i + 1 < N; i++) o[i] = (row[i - 1] ^ (row[i] | row[i + 1])) & 1;
    row = o;
  }
  console.log('rule 30 from a single cell under the project orientation (regular side should be LEFT):');
  for (const l of lines) console.log('  ' + l);
}
