/**
 * The front's survival law, and how much of the front's death rate the settled
 * background alone decides.
 *
 *   node explorer/alidade_survival.mjs
 *
 * Setting (same as explorer/maskfront.mjs). S is the settled picture,
 * S(t, x) = S_{t+x}(-x) from the settled words of the left diagonals;
 * E = picture xor S is the transient band; F(t) = min { x : E(t, x) = 1 } is its
 * left front. Crystals A2 gives the *advance*: F(t+1) = F(t) - 1 exactly when
 * S(t, F(t) - 1) is white.
 *
 * This script is about the other half — whether the front, having failed to
 * advance, stays or retreats. Writing C = cell (t, F), R = cell (t, F+1) of the
 * picture and Cs, Rs for the settled values, and using that the cell left of the
 * front agrees (it is left of the leftmost deviation) while C = !Cs:
 *
 *   E(t+1, F) = rule30(picture)(F) xor rule30(S)(F)
 *             = (C || R) xor (Cs || Rs)                       [the left cells cancel]
 *
 *   Cs = 0:  C = 1, so (C || R) = 1 and E(t+1, F) = !Rs        -- the DOMAIN decides
 *   Cs = 1:  C = 0, so (Cs || Rs) = 1 and E(t+1, F) = !R       -- the PICTURE decides
 *
 * and in one line, with e = E(t, F+1),
 *
 *   E(t+1, F) = !Rs xor (Cs && e).                                          (*)
 *
 * Two consequences the script measures. When e = 0 — the leading block of the
 * band has length one — (*) collapses to E(t+1, F) = !Rs whatever Cs is, so the
 * leading cell's survival is decided by the background alone. And the domain
 * triple (S(t,F-1), S(t,F), S(t,F+1)) = (1, 0, 1) forces both "no advance" and
 * "leading cell dies", i.e. it forces a RETREAT, with no reference to the band.
 * So, writing w for the fraction of rows the front sees a white settled cell on
 * its left and d for the fraction on which it sees that triple,
 *
 *   -F(T)/T  <=  w - d,
 *
 * because every row contributes at most one cell of advance and every triple row
 * contributes at least one cell of retreat. The wall needs 1/2; the previous
 * sighting's background-only ceiling was 0.50106, and it used only w.
 *
 * Also measured: the deviation-density profile right of the front (how wide the
 * wall is), the leading block length, and whether the domain-driven walker K
 * that advances on white, retreats by one on the forcing triple and otherwise
 * stays, actually stays left of the real front.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 1000000;         // rows
const BLOCK = 100000;      // the bound is reported over blocks of this many rows
const PROFILE = 96;        // cells right of the front in the density profile
const SMALL = 40;          // rows scanned in full over the whole cone
const KSTART = 1000;       // row at which the comparison walker K is started
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 2 * SMALL + PROFILE; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
/** the settled picture at (t, x), written in diagonal coordinates k = t + x, j = -x. */
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
const spix = (t, x) => sat(t + x, -x);
console.log(`settled words to k = ${T + 2 * SMALL + PROFILE} (${Date.now() - t0} ms)`);

const base = centerBitIndex(T);
const NONE = 0x7fffffff;

let advances = 0, stays = 0, retreats = 0, retreatSum = 0, steps = 0;
let lawFail = 0, firstLawFail = -1, lawChecked = 0;
// the domain triple (S(t,F-1), S(t,F), S(t,F+1)) against the outcome
const tripleOutcome = new Map();   // "abc" -> [advance, stay, retreat]
let forcedRetreat = 0, forcedStay = 0, undecided = 0;
// of the domain-forced retreats, how many have E(t, F+1) = 1 -- i.e. lie outside
// the case crystal 50(b) already covers, where the cell right of the front is settled
let forcedRetreatE1 = 0;
let blockOne = 0, blockSum = 0, blockRows = 0;
const blockHist = new Map();
const profHit = new Float64Array(PROFILE), profRows = new Float64Array(PROFILE);
// domain-only decidability of the leading cell's fate
let leadDomainDecided = 0, leadRows = 0;

// the comparison walker K
let K = NONE, kViolations = 0, firstKViolation = -1, kAdv = 0, kStay = 0, kRet = 0;
// per-block counts of advances (blkW), forced retreats (blkD) and rows (blkN)
const NB = Math.ceil(T / BLOCK);
const blkW = new Float64Array(NB), blkD = new Float64Array(NB), blkN = new Float64Array(NB);

let Fp = NONE;
let prevRow = null, prevLo = 0, prevWidth = 0, prevStr = '';
let t = 0;
for (const row of rows(T)) {
  let lo, hi;
  if (t < SMALL) { lo = -t; hi = Math.min(t + SMALL, t); }
  else { lo = Math.max(-t, Fp - 2); hi = Math.min(0, Fp + PROFILE + 2); }
  const width = hi - lo + 1;
  const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  const bitAt = (x) => (x < lo || x > hi ? -1 : (str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0));
  const dev = (x) => { const b = bitAt(x); return b < 0 ? -1 : (b !== spix(t, x) ? 1 : 0); };

  let Fn = NONE;
  for (let x = lo; x <= hi; x++) { if (dev(x) === 1) { Fn = x; break; } }
  if (t >= SMALL && Fn === NONE) throw new Error(`no deviation found at t = ${t}`);

  if (t >= SMALL && Fp !== NONE) {
    steps++;
    if (Fn === Fp - 1) advances++;
    else if (Fn === Fp) stays++;
    else { retreats++; retreatSum += Fn - Fp; }

    // (*) checked against the real picture, using row t-1's cells at Fp, Fp+1
    const Cs = spix(t - 1, Fp), Rs = spix(t - 1, Fp + 1);
    const e = prevStr === '' ? -1 : (() => {
      const x = Fp + 1;
      if (x < prevLo || x > prevLo + prevWidth - 1) return -1;
      const b = prevStr.charCodeAt(prevWidth - 1 - (x - prevLo)) === 49 ? 1 : 0;
      return b !== spix(t - 1, x) ? 1 : 0;
    })();
    if (e >= 0) {
      const predicted = ((Rs ? 0 : 1) ^ (Cs && e ? 1 : 0)) === 1;
      const actual = dev(Fp) === 1;
      lawChecked++;
      if (predicted !== actual) { lawFail++; if (firstLawFail < 0) firstLawFail = t; }
    }

    // the domain triple read on row t-1 at the front's position
    const L = spix(t - 1, Fp - 1);
    const key = `${L}${Cs}${Rs}`;
    let row3 = tripleOutcome.get(key);
    if (!row3) { row3 = [0, 0, 0]; tripleOutcome.set(key, row3); }
    row3[Fn === Fp - 1 ? 0 : Fn === Fp ? 1 : 2]++;
    if (L === 1) {
      if (Cs === 0 && Rs === 1) { forcedRetreat++; blkD[Math.floor(t / BLOCK)]++; if (e === 1) forcedRetreatE1++; }
      else if (Cs === 0 && Rs === 0) forcedStay++;
      else undecided++;
    } else blkW[Math.floor(t / BLOCK)]++;
    blkN[Math.floor(t / BLOCK)]++;
    // how often is the leading cell's fate decided by the background alone?
    leadRows++;
    if (Cs === 0 || e === 0) leadDomainDecided++;
  }

  if (t >= SMALL && Fn !== NONE) {
    // leading block length
    let b = 0;
    while (Fn + b <= hi && dev(Fn + b) === 1) b++;
    blockRows++; blockSum += b; if (b === 1) blockOne++;
    blockHist.set(Math.min(b, 12), (blockHist.get(Math.min(b, 12)) || 0) + 1);
    // deviation density profile
    if (Fn + PROFILE <= hi) for (let d = 0; d < PROFILE; d++) { profRows[d]++; if (dev(Fn + d) === 1) profHit[d]++; }
    // the comparison walker
    if (t === KSTART) K = Fn;
    else if (K !== NONE) {
      const kl = spix(t, K - 1), kc = spix(t, K), kr = spix(t, K + 1);
      if (kl === 0) { K = K - 1; kAdv++; }
      else if (kc === 0 && kr === 1) { K = K + 1; kRet++; }
      else kStay++;
      if (K > Fn) { kViolations++; if (firstKViolation < 0) firstKViolation = t; }
    }
  }

  prevLo = lo; prevWidth = width; prevStr = str;
  Fp = Fn;
  t++;
}

const Tend = T - 1;
console.log(`front to t = ${Tend}: F = ${Fp} (${(-Fp / Tend).toFixed(5)} t)  (${Date.now() - t0} ms)`);
console.log(`steps ${steps}: advances ${advances} (${(advances / steps).toFixed(5)}), stays ${stays} (${(stays / steps).toFixed(5)}), retreats ${retreats} (${(retreats / steps).toFixed(5)}) summing ${retreatSum} (mean per row ${(retreatSum / steps).toFixed(5)})`);
console.log(`the survival law E(t+1,F) = !Rs xor (Cs && E(t,F+1)): checked ${lawChecked} rows, ${lawFail} failures${firstLawFail >= 0 ? ' (first t = ' + firstLawFail + ')' : ''}`);

const w = advances / steps;
const d = forcedRetreat / steps;
console.log(`\nwhen the front cannot advance (L = 1): domain-FORCED retreat (1,0,1) ${forcedRetreat} (${(forcedRetreat / steps).toFixed(5)} of all rows), domain-forced stay (1,0,0) ${forcedStay} (${(forcedStay / steps).toFixed(5)}), band-decided (1,1,*) ${undecided} (${(undecided / steps).toFixed(5)})`);
console.log(`w = ${w.toFixed(5)}, d = ${d.toFixed(5)}, the domain-only bound w - d = ${(w - d).toFixed(5)}  ${w - d < 0.5 ? '< 1/2  *** BELOW THE WALL ***' : '>= 1/2'}`);
console.log(`   (true speed ${(-Fp / Tend).toFixed(5)}; the retreat count alone is ${retreats} of which ${forcedRetreat} are domain-forced, ${(forcedRetreat / retreats * 100).toFixed(1)}%)`);
console.log(`   of the ${forcedRetreat} domain-forced retreats, ${forcedRetreatE1} (${(forcedRetreatE1 / forcedRetreat * 100).toFixed(1)}%) have E(t, F+1) = 1, so they lie outside the case crystal 50(b) covers`);
console.log(`the leading cell's fate is decided by the background alone on ${leadDomainDecided} of ${leadRows} rows (${(leadDomainDecided / leadRows).toFixed(4)})`);
console.log(`\nthe bound w - d over blocks of ${BLOCK} rows (the number that must stay below 1/2):`);
for (let i = 0; i < NB; i++) {
  if (blkN[i] < BLOCK / 2) continue;
  const bw = blkW[i] / blkN[i], bd = blkD[i] / blkN[i];
  console.log(`   rows ${String(i * BLOCK).padStart(8)}..${String((i + 1) * BLOCK - 1).padStart(8)}: w = ${bw.toFixed(5)}, d = ${bd.toFixed(5)}, w - d = ${(bw - bd).toFixed(5)}${bw - bd >= 0.5 ? '   *** ABOVE 1/2 ***' : ''}`);
}

console.log(`\ndomain triple (S(t,F-1) S(t,F) S(t,F+1)) -> outcome [advance stay retreat]`);
for (const key of [...tripleOutcome.keys()].sort()) {
  const [a, s, r] = tripleOutcome.get(key);
  const n = a + s + r;
  console.log(`   ${key}: n = ${String(n).padStart(7)} (${(n / steps).toFixed(4)})  advance ${(a / n).toFixed(4)}  stay ${(s / n).toFixed(4)}  retreat ${(r / n).toFixed(4)}`);
}

console.log(`\nleading block length: mean ${(blockSum / blockRows).toFixed(4)}, length 1 on ${blockOne} of ${blockRows} rows (${(blockOne / blockRows).toFixed(4)})`);
console.log(`   histogram ${[...blockHist.entries()].sort((a, b) => a[0] - b[0]).map(([b, n]) => `${b}${b === 12 ? '+' : ''}:${(n / blockRows).toFixed(4)}`).join(' ')}`);

console.log(`\ndeviation density right of the front, d = 0 .. ${PROFILE - 1} (over ${profRows[0]} rows):`);
for (let i = 0; i < PROFILE; i += 1) {
  if (i < 16 || i % 16 === 0) console.log(`   d = ${String(i).padStart(2)}: ${(profHit[i] / profRows[i]).toFixed(5)}`);
}
let tail = 0, tailN = 0;
for (let i = 16; i < PROFILE; i++) { tail += profHit[i]; tailN += profRows[i]; }
console.log(`   mean over d in [16, ${PROFILE}): ${(tail / tailN).toFixed(5)}`);

console.log(`\nthe domain-driven walker K from t = ${KSTART}: advances ${kAdv}, stays ${kStay}, retreats ${kRet}; speed ${((kAdv - kRet) / (kAdv + kStay + kRet)).toFixed(5)}`);
console.log(`   rows with K > F (domination violated): ${kViolations}${firstKViolation >= 0 ? ' (first t = ' + firstKViolation + ')' : ''}`);
console.log(`(${Date.now() - t0} ms)`);
