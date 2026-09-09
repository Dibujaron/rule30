// t62_vs_talus.cjs -- word-for-word comparison of my left-to-right enumeration
// against Talus's printed ring words (which are read LEFTWARD, w[k] = cell at
// x = -k, per talus2_scratch_rings.lean). If the only difference is a spatial
// reflection, reversing Talus's words must reproduce mine exactly.

const TALUS = {
  1: ['0', '01'],
  2: ['0', '01'],
  3: ['0', '000011111001', '01'],
  4: ['0', '0000001', '0010011', '01', '0000111', '0111111'],
  5: ['0', '000111100101101', '0000011011011111000101001', '01', '00111'],
  6: ['0', '000001001100111000111101110011010001000111010110111010010100100010111101111101100001', '01', '000011111001'],
  7: ['0', '001101011101111', '000001011000011', '000011101010001', '000000101111101', '001001010110111', '000110011001011', '000111111101001', '01'],
  8: ['0', '0000001', '00000001001111111101100100100010110110111010001010011011101011000100011000001111', '0000111', '0010011', '0111111', '01', '0111', '0001'],
  9: ['0', '000000010000011011111110111110001001001100100000111011000011111100110000001001000010111111011011110100100110001001101101100000111000101', '000000011101101', '000001001001011', '01', '000111111110011', '000011111001'],
  10: ['0',
    '00000010011011000111001010101001100100010111010111000101010001000001001101101101010010100100011010001011111110100001000001010100100110000011001110011010101',
    '00000001011001110001101011111101100010111001110101010110000111101001101001111010101110111110110001010001101101011011100011110100100101011110111110101011011',
    '000001110100011011110100010011010000110111110010101100110010000101001111011000100010111001',
    '000001111010011101111100110111000100110111011000111110001001011010100001011011110101100101',
    '000101100101011110001110100111', '0000011011011111000101001', '000011010010111001101100111101', '01',
    '000111100101101', '00111'],
};

function triStep(c) { return ((c << 1) ^ (c | (c >>> 1))) >>> 0; }
function triL(c, L) { let r = c >>> 0; for (let t = 0; t < L; t++) r = triStep(r); return r; }
function cyclesA(L) {
  const W = 2 * L, S = 1 << W, mask = S - 1;
  const next = new Int32Array(S), head = new Uint8Array(S);
  for (let s = 0; s < S; s++) {
    const target = (s >>> (L - 1)) & 1;
    const cj = ((triL((s << 1) >>> 0, L) >>> L) & 1) ^ target;
    head[s] = cj;
    next[s] = ((((s << 1) >>> 0) | cj) & mask) >>> 0;
  }
  const colour = new Uint8Array(S), out = [];
  for (let s0 = 0; s0 < S; s0++) {
    if (colour[s0]) continue;
    const path = []; let s = s0;
    while (colour[s] === 0) { colour[s] = 1; path.push(s); s = next[s]; }
    if (colour[s] === 1) out.push(path.slice(path.indexOf(s)).map((x) => head[x]).reverse().join(''));
    for (const x of path) colour[x] = 2;
  }
  return out;
}
function canon(s) { const n = s.length; let b = null; for (let r = 0; r < n; r++) { const x = s.slice(r) + s.slice(0, r); if (b === null || x < b) b = x; } return b; }
const rev = (s) => s.split('').reverse().join('');

let allSame = true, allRevSame = true;
for (let L = 1; L <= 10; L++) {
  const mine = new Set(cyclesA(L).map(canon));
  const theirsDirect = new Set(TALUS[L].map(canon));
  const theirsRev = new Set(TALUS[L].map((w) => canon(rev(w))));
  const same = mine.size === theirsDirect.size && [...mine].every((x) => theirsDirect.has(x));
  const sameRev = mine.size === theirsRev.size && [...mine].every((x) => theirsRev.has(x));
  if (!same) allSame = false;
  if (!sameRev) allRevSame = false;
  console.log(`L=${L}: ${mine.size} configs; Talus's words as-printed ${same ? 'IDENTICAL' : 'differ'}; Talus's words REVERSED ${sameRev ? 'IDENTICAL' : 'differ'}`);
}
console.log('');
console.log('as-printed identical at every L: ' + allSame);
console.log('reversed identical at every L:   ' + allRevSame);
