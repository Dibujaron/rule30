/**
 * halfcheck_p16.cjs -- the greedy walker on rule 30's own p = 16 regime, the
 * stretch rosetta_greedy.mjs measured at 0.5044, with an honest error bar.
 *
 *   node explorer/halfcheck_p16.cjs
 *
 * The p = 16 regime is k in [400, 87866], cut by eventually-white diagonals at
 * 53207 and 58286 (a walker that reaches one rides it for ever at speed 1, so
 * each piece must be measured separately). All three pieces together are 87000
 * diagonals -- 174000 steps -- against the 2.6e9 steps available in the p = 32
 * regime, so the question is entirely one of error bars.
 *
 * Every entry phase j0 mod 16 is run, because a single walk over 50000
 * diagonals is one sample and its start is arbitrary.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const dump = JSON.parse(fs.readFileSync(process.env.HC_JSON || path.join(__dirname, 'halfcheck_words.json'), 'utf8'));
const pack = (arr) => { const p = arr.length; let w = 0; for (let j = 0; j < 32; j++) if (arr[j % p]) w |= (1 << j); return w >>> 0; };
const bit = (w, j) => (w >>> (j & 31)) & 1;
const rotr = (w, s) => (s === 0 ? w >>> 0 : (((w >>> s) | (w << (32 - s))) >>> 0));
function nextWord32(A, B) {
  const D = rotr(A, 1);
  const j0 = 31 - Math.clz32(B & -B);
  let prev = bit(D, j0) ^ 1, C = prev << j0;
  for (let m = 1; m < 32; m++) { const j = (j0 + m) & 31; prev = bit(D, j) ^ (bit(B, j) | prev); C |= (prev << j); }
  return C >>> 0;
}

/** walk from (k0, j0) until the next white diagonal or nMax diagonals */
function walk(A0, B0, k0, j0, nMax) {
  let A = A0, B = B0, j = j0, adv = 0, diag = 0, k = k0;
  while (diag < nMax) {
    if (B === 0) break;
    const g = 31 - Math.clz32(rotr(B, j & 31) & -rotr(B, j & 31));
    adv += g; diag++; j += g;
    const C = nextWord32(A, B); A = B; B = C; k++;
  }
  return { adv, diag, endK: k };
}

function report(label, seedK, nMax, period) {
  const s = dump.seeds.find((x) => x.k === seedK);
  if (!s) { console.log(`  ${label}: no seed at k=${seedK}`); return null; }
  const A0 = pack(s.wordA), B0 = pack(s.wordB), k0 = seedK + 1;
  const rows = [];
  let tAdv = 0, tDiag = 0;
  for (let ph = 0; ph < period; ph++) {
    const r = walk(A0, B0, k0, 100000 + ph, nMax);
    rows.push(r.adv / (r.adv + r.diag));
    tAdv += r.adv; tDiag += r.diag;
  }
  const m = rows.reduce((a, b) => a + b, 0) / rows.length;
  const sd = Math.sqrt(rows.reduce((a, b) => a + (b - m) * (b - m), 0) / (rows.length - 1));
  const one = rows[0];
  console.log(`  ${label}: ${period} entry phases x ~${Math.round(tDiag / period)} diagonals`);
  console.log(`    per-phase speed: min ${Math.min(...rows).toFixed(5)}, max ${Math.max(...rows).toFixed(5)}, mean ${m.toFixed(6)}, sd across phases ${sd.toExponential(3)}`);
  console.log(`    pooled speed ${(tAdv / (tAdv + tDiag)).toFixed(6)}; a SINGLE arbitrary start would have reported ${one.toFixed(5)}`);
  return { tAdv, tDiag, rows };
}

console.log('rule 30 p = 16 regime (the stretch rosetta_greedy.mjs measured):');
const a = report('k in [1001..53206] (greedy.mjs stretch)', 1000, 52200, 16);
const b = report('k in [53211..58285]', 53210, 5070, 16);
const c = report('k in [58291..87865]', 58290, 29570, 16);
const d = report('k in [501..53206]', 500, 52700, 16);

{
  const tAdv = a.tAdv + b.tAdv + c.tAdv, tDiag = a.tDiag + b.tDiag + c.tDiag;
  const sp = tAdv / (tAdv + tDiag);
  // error bar: treat the three stretches' phase-pooled walks as ~ (tDiag/16) independent diagonals
  const nEff = tDiag / 16;
  const sem = 0.35 / Math.sqrt(nEff);
  console.log(`\n  ALL p=16 pieces pooled over all phases: ${tDiag} diagonal-visits, speed ${sp.toFixed(6)}`);
  console.log(`    effective independent diagonals ~ ${Math.round(nEff)} (the 16 phases share one background), sem ~ ${sem.toExponential(3)}`);
  console.log(`    excess ${(sp - 0.5).toExponential(3)} = ${((sp - 0.5) / sem).toFixed(2)} sem`);
}
void d;

console.log('\nfor scale, the same estimator on the p = 32 regime cut to the same length:');
report('k in [87869..140068] (52200 diagonals, p=32)', 87868, 52200, 32);
