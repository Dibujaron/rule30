/**
 * halfcheck_verify.cjs -- robustness checks on the two facts the verdict rests
 * on: that the generic-period code is the same machine as the uint32 code, and
 * that the p = 32 excess is not an artefact of one pseudo-random seed source.
 *
 *   node explorer/halfcheck_verify.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');
const dump = JSON.parse(fs.readFileSync(process.env.HC_JSON || path.join(__dirname, 'halfcheck_words.json'), 'utf8'));

// ---- generic-period recurrence (the ensemble's) ---------------------------
function nextWordP(A, B, C, p) {
  let j0 = 0; while (B[j0] === 0) j0++;
  let jp = j0 + 1; if (jp === p) jp = 0;
  let prev = A[jp] ^ 1;
  C[j0] = prev;
  let j = j0;
  for (let m = 1; m < p; m++) {
    j++; if (j === p) j = 0;
    let j1 = j + 1; if (j1 === p) j1 = 0;
    prev = A[j1] ^ (B[j] | prev);
    C[j] = prev;
  }
}

// ---- check 1: generic code reproduces the picture's own settled words ------
{
  const seed = dump.seeds.find((s) => s.k === 87868);
  const p = 32;
  const expand = (arr) => { const w = new Uint8Array(p); for (let j = 0; j < p; j++) w[j] = arr[j % arr.length]; return w; };
  let A = expand(seed.wordA), B = expand(seed.wordB), C = new Uint8Array(p);
  let k = 87869;
  const want = new Map(dump.spot.filter((s) => s.k > 87869).map((s) => [s.k, expand(s.word)]));
  let checked = 0, bad = 0, maxK = Math.max(...want.keys());
  while (k < maxK) {
    nextWordP(A, B, C, p);
    const t = A; A = B; B = C; C = t; k++;
    if (want.has(k)) {
      checked++;
      const w = want.get(k);
      let ok = true; for (let j = 0; j < p; j++) if (B[j] !== w[j]) ok = false;
      if (!ok) bad++;
      console.log(`   k=${k}: generic-period recurrence vs picture ${ok ? 'MATCH' : 'MISMATCH'}`);
    }
  }
  console.log(`check 1 -- generic recurrence against rule 30's own picture: ${checked} words, ${bad} mismatches`);
}

// ---- check 2: p = 32 excess under three different seed sources -------------
function runOrbit(p, A, B, r, nDiag, burn) {
  let C = new Uint8Array(p), adv = 0, diag = 0;
  for (let n = 0; n < nDiag + burn; n++) {
    let g = 0, q = r;
    while (B[q] === 0) { g++; q++; if (q === p) q = 0; if (g >= p) return null; }
    r = q;
    if (n >= burn) { adv += g; diag++; }
    nextWordP(A, B, C, p);
    const t = A; A = B; B = C; C = t;
  }
  return { adv, diag };
}
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0); }; }
function xorshift(seed) { let a = seed | 0 || 1, b = 362436069, c = 521288629, d = 88675123; return function () { const t = a ^ (a << 11); a = b; b = c; c = d; d = (d ^ (d >>> 19)) ^ (t ^ (t >>> 8)); return d >>> 0; }; }

function sweep(label, rng, bitPos, p, norb, per, burn) {
  let adv = 0, diag = 0, esc = 0;
  const sps = [];
  for (let o = 0; o < norb; o++) {
    const A = new Uint8Array(p), B = new Uint8Array(p);
    let any = false;
    for (let j = 0; j < p; j++) { A[j] = (rng() >>> bitPos) & 1; B[j] = (rng() >>> bitPos) & 1; if (B[j]) any = true; }
    if (!any) { o--; continue; }
    const r = runOrbit(p, A, B, rng() % p, per, burn);
    if (!r) { esc++; continue; }
    adv += r.adv; diag += r.diag; sps.push(r.adv / (r.adv + r.diag));
  }
  const sp = adv / (adv + diag);
  const m = sps.reduce((a, b) => a + b, 0) / sps.length;
  const sd = Math.sqrt(sps.reduce((a, b) => a + (b - m) * (b - m), 0) / (sps.length - 1));
  console.log(`  ${label}: p=${p}, ${sps.length} orbits x ${per} diagonals, speed ${sp.toFixed(7)}, excess ${(sp - 0.5).toExponential(3)}, sem ${(sd / Math.sqrt(sps.length)).toExponential(3)}${esc ? ` (${esc} escapes)` : ''}`);
}

console.log('\ncheck 2 -- the p = 32 excess under different seed sources and burn-ins:');
sweep('xorshift  low bit,  burn 4096 ', xorshift(0x1234567 + 32 * 7919), 0, 32, 64, 976563, 4096);
sweep('xorshift  bit 17,   burn 4096 ', xorshift(0xdeadbeef), 17, 32, 64, 976563, 4096);
sweep('mulberry32 low bit, burn 4096 ', mulberry32(20260908), 0, 32, 64, 976563, 4096);
sweep('mulberry32 low bit, burn 0    ', mulberry32(777), 0, 32, 64, 976563, 0);
sweep('mulberry32 low bit, burn 1e6  ', mulberry32(31337), 0, 32, 64, 976563, 1000000);
console.log('  (rule 30\'s own p = 32 background, 1.42e9 diagonals: excess 1.128e-3 +/- 1.0e-5)');

console.log('\ncheck 3 -- the same three seed sources at p = 64:');
sweep('xorshift  low bit,  burn 4096 ', xorshift(0x1234567 + 64 * 7919), 0, 64, 64, 488281, 4096);
sweep('mulberry32 low bit, burn 4096 ', mulberry32(20260908), 0, 64, 64, 488281, 4096);
sweep('xorshift  bit 17,   burn 4096 ', xorshift(0xfeedface), 17, 64, 64, 488281, 4096);
