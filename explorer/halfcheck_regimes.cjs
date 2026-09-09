/**
 * halfcheck_regimes.cjs -- how far can the p = 32 regime run?
 *
 *   node explorer/halfcheck_regimes.cjs [maxDiagonals]
 *
 * The diagonal period doubles only at an eventually-white diagonal whose
 * PREDECESSOR word has odd weight; at an even-weight one the two branches are
 * complements and the period stays put. Rule 30's own background is forced up
 * to k = 1,420,878,967 and then branches, and the branch is decided by the real
 * picture at a row no simulation can reach -- so past there this is A valid
 * rule 30 left-region background, not necessarily THE one. It is run only to
 * see how the eventually-white diagonals and their parities are spaced, i.e.
 * how far a p = 32 regime typically runs before the period can grow.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const dump = JSON.parse(fs.readFileSync(process.env.HC_JSON || path.join(__dirname, 'halfcheck_words.json'), 'utf8'));
const seed = dump.seeds.find((s) => s.k === 87868);
const MAX = parseInt(process.argv[2] || '20000000000', 10);

const pack = (arr) => { const p = arr.length; let w = 0; for (let j = 0; j < 32; j++) if (arr[j % p]) w |= (1 << j); return w >>> 0; };
const bitOf = (w, j) => (w >>> (j & 31)) & 1;
const rotr = (w, s) => (s === 0 ? w >>> 0 : (((w >>> s) | (w << (32 - s))) >>> 0));
function nextWord32(A, B) {
  const D = rotr(A, 1);
  const j0 = 31 - Math.clz32(B & -B);
  let prev = bitOf(D, j0) ^ 1, C = prev << j0;
  for (let m = 1; m < 32; m++) { const j = (j0 + m) & 31; prev = bitOf(D, j) ^ (bitOf(B, j) | prev); C |= (prev << j); }
  return C >>> 0;
}
const popcount = (w) => { let c = 0; for (let i = 0; i < 32; i++) c += (w >>> i) & 1; return c; };

let A = pack(seed.wordA), B = pack(seed.wordB), k = 87869, j = 29290;
let adv = 0, diag = 0, segAdv = 0, segDiag = 0, segStart = k;
const t0 = Date.now();
const whites = [];
while (diag < MAX) {
  if (B === 0) {
    const w = popcount(A), odd = w % 2 === 1;
    const sp = segAdv / (segAdv + segDiag);
    console.log(`white diagonal k = ${k}; predecessor weight ${w} (${odd ? 'ODD -> period DOUBLES to 64' : 'even -> period stays 32'})`);
    console.log(`   segment ${segStart}..${k - 1}: ${segDiag} diagonals, speed ${sp.toFixed(7)}, excess ${(sp - 0.5).toExponential(3)}`);
    whites.push({ k, w, odd });
    if (odd) { console.log(`   STOP: the period leaves 32 here.`); break; }
    // even weight: two complementary period-32 solutions of C(j) = A(j+1) xor C(j-1).
    let C = 0, prev = 0;                       // branch C(0) = 0 (arbitrary; see the header)
    for (let i = 1; i < 32; i++) { prev = bitOf(A, (i + 1) & 31) ^ prev; C |= (prev << i); }
    A = B; B = C >>> 0; k++;
    segStart = k; segAdv = 0; segDiag = 0;
    if (B === 0) { console.log('   both branches white -- stopping'); break; }
    continue;
  }
  const Br = rotr(B, j & 31);
  const g = 31 - Math.clz32(Br & -Br);
  adv += g; diag++; j += g; segAdv += g; segDiag++;
  const C = nextWord32(A, B); A = B; B = C; k++;
}
console.log(`\nran to k = ${k} (${diag} diagonals, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log(`whites found past 87866: ${whites.map((x) => `${x.k}(w=${x.w}${x.odd ? ',ODD' : ''})`).join(', ') || 'none'}`);
console.log(`overall speed across the run: ${(adv / (adv + diag)).toFixed(7)} (excess ${(adv / (adv + diag) - 0.5).toExponential(3)}) over ${adv + diag} steps`);
