/**
 * halfcheck_deep.cjs -- run rule 30's own settled background forward to the
 * next eventually-white diagonal, where the diagonal period doubles from 32 to
 * 64, and measure the greedy walker's speed on the far side of it.
 *
 *   node explorer/halfcheck_deep.cjs [nDiagAfter]
 *
 * The p = 32 regime runs from k = 87867 to the next eventually-white diagonal.
 * Every long measurement of the walker ever made sits inside that one regime.
 * This script finds the end of it from the recurrence alone (no table), reports
 * where it is, takes BOTH branches of the two-valued step there, and measures
 * the walker on each of the two p = 64 backgrounds that follow.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const NAFTER = parseInt(process.argv[2] || '30000000', 10);
const JSON_PATH = process.env.HC_JSON || path.join(__dirname, 'halfcheck_words.json');
const dump = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const seed = dump.seeds.find((s) => s.k === 87868);

function pack(arr) { const p = arr.length; let w = 0; for (let j = 0; j < 32; j++) if (arr[j % p]) w |= (1 << j); return w >>> 0; }
const bit = (w, j) => (w >>> (j & 31)) & 1;
const rotr = (w, s) => (s === 0 ? w >>> 0 : (((w >>> s) | (w << (32 - s))) >>> 0));

function nextWord32(A, B) {
  const D = rotr(A, 1);
  const j0 = 31 - Math.clz32(B & -B);
  let prev = bit(D, j0) ^ 1;
  let C = prev << j0;
  for (let m = 1; m < 32; m++) {
    const j = (j0 + m) & 31;
    prev = bit(D, j) ^ (bit(B, j) | prev);
    C |= (prev << j);
  }
  return C >>> 0;
}

// ---- phase 1: run the p = 32 regime to its end, walking as we go -----------
let A = pack(seed.wordA), B = pack(seed.wordB);
let k = 87869;                       // B = S_k
let j = 29292 - 2;                   // walker index; it enters diagonal k here
let adv = 0, diag = 0;
const t0 = Date.now();
let whiteK = -1;
const marks = [];
while (true) {
  if (B === 0) { whiteK = k; break; }
  const Br = rotr(B, j & 31);
  const g = 31 - Math.clz32(Br & -Br);
  adv += g; diag++; j += g;
  const C = nextWord32(A, B);
  A = B; B = C; k++;
  if (diag % 100000000 === 0) marks.push(`k=${k}: cumulative speed ${(adv / (adv + diag)).toFixed(7)}`);
  if (k > 3000000000) break;
}
console.log(`p = 32 regime: walked diagonals 87869..${k - 1} (${diag} of them, ${Date.now() - t0} ms)`);
console.log(`  first eventually-white diagonal past 87866: k = ${whiteK}${whiteK < 0 ? ' (none found below 3e9)' : ''}`);
console.log(`  speed over the WHOLE regime: ${(adv / (adv + diag)).toFixed(7)}  (excess ${(adv / (adv + diag) - 0.5).toExponential(3)}, steps ${adv + diag})`);
console.log(`  ${marks.join('\n  ')}`);
if (whiteK < 0) process.exit(0);

// A = S_{whiteK-1}, B = S_whiteK = 0. The next word solves C(j) = A(j+1) xor C(j-1).
let pc = 0; for (let i = 0; i < 32; i++) pc += bit(A, i);
console.log(`  S_${whiteK - 1} has weight ${pc} over its period 32 -> the next word has period ${pc % 2 ? 64 : 32}`);
const jWhite = j, kWhite = whiteK;

// ---- phase 2: build both branches as period-64 words and walk on each ------
const P2 = pc % 2 ? 64 : 32;
function nextWordP(Aa, Bb, Cc, p) {
  let j0 = 0; while (Bb[j0] === 0) j0++;
  let jp = j0 + 1; if (jp === p) jp = 0;
  let prev = Aa[jp] ^ 1;
  Cc[j0] = prev;
  let jj = j0;
  for (let m = 1; m < p; m++) {
    jj++; if (jj === p) jj = 0;
    let j1 = jj + 1; if (j1 === p) j1 = 0;
    prev = Aa[j1] ^ (Bb[jj] | prev);
    Cc[jj] = prev;
  }
}
const A64 = new Uint8Array(P2);
for (let i = 0; i < P2; i++) A64[i] = bit(A, i & 31);      // S_{whiteK-1}, period 32, viewed at period P2
const White = new Uint8Array(P2);                          // S_whiteK = 0

for (const branch of [0, 1]) {
  // C(j) = A(j+1) xor C(j-1), free choice of C(0)
  const C = new Uint8Array(P2);
  C[0] = branch;
  for (let i = 1; i < P2; i++) C[i] = A64[(i + 1) % P2] ^ C[i - 1];
  // consistency at the wrap
  const wrapOk = C[0] === (A64[1 % P2] ^ C[P2 - 1]);
  let Ai = White, Bi = C, Ci = new Uint8Array(P2);
  let jj = jWhite + 1;    // walker stalls on the white?  no: a white word never stalls
  // The walker is entering diagonal kWhite at index jWhite. S_kWhite is identically
  // white, so it would ride that diagonal for ever: this is the "escape". Measure
  // instead from the diagonal AFTER it, entering at the same index, which is what a
  // walker that had arrived one diagonal later would do.
  jj = jWhite;
  let a2 = 0, d2 = 0, escaped = false;
  const blocks = []; let bAdv = 0; const BLK = 1000000;
  for (let n = 0; n < NAFTER; n++) {
    let g = 0, q = ((jj % P2) + P2) % P2;
    while (Bi[q] === 0) { g++; q++; if (q === P2) q = 0; if (g >= P2) { escaped = true; break; } }
    if (escaped) break;
    a2 += g; d2++; jj += g; bAdv += g;
    nextWordP(Ai, Bi, Ci, P2);
    const t = Ai; Ai = Bi; Bi = Ci; Ci = t;
    if ((n + 1) % BLK === 0) { blocks.push(bAdv / (bAdv + BLK)); bAdv = 0; }
  }
  const sp = a2 / (a2 + d2);
  const m = blocks.reduce((s, v) => s + v, 0) / blocks.length;
  const sd = Math.sqrt(blocks.reduce((s, v) => s + (v - m) * (v - m), 0) / (blocks.length - 1));
  const sem = sd / Math.sqrt(blocks.length);
  console.log(`\nbranch ${branch} (C(0) = ${branch}; wrap-consistent: ${wrapOk}; period ${P2}):`);
  console.log(`  diagonals ${d2}, mean gap ${(a2 / d2).toFixed(6)}, speed ${sp.toFixed(7)}, excess ${(sp - 0.5).toExponential(3)}`);
  console.log(`  blocks of ${BLK}: n=${blocks.length}, sd ${sd.toExponential(3)}, sem ${sem.toExponential(3)}, z = ${((sp - 0.5) / sem).toFixed(2)}${escaped ? '  [escaped: white word]' : ''}`);
}
