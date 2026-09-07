/**
 * The settled words and transients of the left diagonals under other
 * boundaries: periodic, random, degenerate.
 *
 *   node explorer/boundarysettled.mjs
 *
 * The half-line x <= -1 is grown from a left word w with boundary column c
 * (halfLineDiagonals in settledwords.mjs); its diagonals D_k(j) = cell (j+k, -j)
 * obey the same recurrence as the seed's, with D_k(0) = c(k). For each
 * boundary the script settles every diagonal and reports
 *
 *   - whether S_k = F(S_{k-2}, S_{k-1}) holds at every non-branch step;
 *   - the branch points (eventually-white diagonals) and the branch taken;
 *   - the relation of S_k to the seed's S_k: equal, a shift along the
 *     diagonal by some sigma, or neither, and the first k where they part;
 *   - onsets: the largest onset/k, the mean onset/k over the top half of the
 *     scan, and whether any onset exceeds k (the wall leftDiagonal_onset_le
 *     for this boundary);
 *   - periods: the largest, and whether any exceeds k + 1.
 *
 * The seed's own centre column through the half-line model is the control:
 * it must reproduce seedDiagonals exactly.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerColumnBits } from './rule30.mjs';
import { seedDiagonals, halfLineDiagonals, settle, F, same, at, isWhite } from './settledwords.mjs';

const N = 6000;
const K = 2400;

function xorshift(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
}
const randomBoundary = (seed) => { const r = xorshift(seed); const bits = Uint8Array.from({ length: N + 2 }, () => r() & 1); bits[0] = 1; return (t) => bits[t]; };
const periodicBoundary = (pat) => (t) => pat[t % pat.length];
const randomPattern = (p, seed) => { const r = xorshift(seed); const pat = Array.from({ length: p }, () => r() & 1); pat[0] = 1; return pat; };
const pulse = (p) => Array.from({ length: p }, (_, i) => (i === 0 ? 1 : 0));

const trueColumn = centerColumnBits(N + 2);

const boundaries = [
  ['seed column, w = [] (control)', (t) => trueColumn[t], []],
  ['seed column, w = [1]', (t) => trueColumn[t], [1]],
  ['seed column with c(100) flipped', (t) => (t === 100 ? 1 - trueColumn[t] : trueColumn[t]), []],
  ['random #1', randomBoundary(0x9e3779b9), []],
  ['random #2', randomBoundary(12345), []],
  ['random #3', randomBoundary(777), []],
  ['c = 1 forever', periodicBoundary([1]), []],
  ['c = 1 then white', (t) => (t === 0 ? 1 : 0), []],
  ['(10)^inf', periodicBoundary([1, 0]), []],
  ['(110)^inf', periodicBoundary([1, 1, 0]), []],
  ['(1100)^inf', periodicBoundary([1, 1, 0, 0]), []],
  ['(10110)^inf', periodicBoundary([1, 0, 1, 1, 0]), []],
  ['pulse p = 7', periodicBoundary(pulse(7)), []],
  ['pulse p = 31', periodicBoundary(pulse(31)), []],
  ['pulse p = 155, w = 11001', periodicBoundary(pulse(155)), [1, 1, 0, 0, 1]],
  ['random pattern p = 17', periodicBoundary(randomPattern(17, 3)), []],
  ['random pattern p = 23', periodicBoundary(randomPattern(23, 5)), []],
  ['random pattern p = 64', periodicBoundary(randomPattern(64, 8)), []],
  ['random pattern p = 100', periodicBoundary(randomPattern(100, 13)), []],
  ['random pattern p = 1000', periodicBoundary(randomPattern(1000, 21)), []],
];

const seedDiag = seedDiagonals(N, K);
const seedS = seedDiag.map((d) => settle(d));

function analyse(label, c, w) {
  const diag = halfLineDiagonals(c, w, N, K);
  const S = diag.map((d) => settle(d));
  const unsettled = S.filter((s) => !s).length;
  let agree = 0, disagree = 0, firstBad = -1;
  const branches = [];
  for (let k = 2; k <= K; k++) {
    if (!S[k] || !S[k - 1] || !S[k - 2]) continue;
    const sols = F(S[k - 2], S[k - 1]);
    const which = sols.findIndex((x) => same(x, S[k]));
    if (which >= 0) agree++; else { disagree++; if (firstBad < 0) firstBad = k; }
    if (sols.length === 2) branches.push(`${k}${which < 0 ? '?' : ':' + which}${S[k].p > S[k - 2].p ? 's' : 'c'}`);
  }
  // relation to the seed's settled words: a shift along the diagonal
  let firstDiff = -1, shifts = [];
  let curShift = 0, lastRel = 'equal';
  const rel = [];
  for (let k = 0; k <= K; k++) {
    if (!S[k] || !seedS[k]) continue;
    const q = Math.max(S[k].p, seedS[k].p);
    let found = -1;
    for (let s = 0; s < q; s++) {
      let ok = true;
      for (let j = 0; j < q; j++) if (at(S[k], j) !== at(seedS[k], j + s)) { ok = false; break; }
      if (ok) { found = s; break; }
    }
    if (found < 0) { if (firstDiff < 0) firstDiff = k; rel.push('X'); }
    else if (found !== curShift % q && found !== 0) { curShift = found; }
    if (found >= 0 && found % q !== curShift % q && q > 1) { /* shift changed */ }
    if (found >= 0 && q === 16 && shifts[shifts.length - 1] !== found) shifts.push(found);
  }
  const onsets = [];
  let maxRatio = 0, maxK = -1, over = 0, sum = 0, cnt = 0, pmax = 0, pover = 0;
  for (let k = 1; k <= K; k++) {
    if (!S[k]) continue;
    const r = S[k].onset / k;
    if (r > maxRatio) { maxRatio = r; maxK = k; }
    if (S[k].onset > k) over++;
    if (k >= K / 2) { sum += r; cnt++; }
    if (S[k].p > pmax) pmax = S[k].p;
    if (S[k].p > k + 1) pover++;
  }
  // deviation at the centre and at column -1 against this half-line's own settled picture
  let e0 = 0, tot = 0, e1black = 0, blacks = 0;
  for (let t = 1; t < K; t++) {
    if (!S[t] || !S[t - 1]) continue;
    tot++;
    if ((c(t) ^ at(S[t], 0)) === 1) e0++;
    if (c(t) === 1) { blacks++; if ((diag[t - 1][1] ^ at(S[t - 1], 1)) === 1) e1black++; }
  }
  console.log(`\n${label}`);
  console.log(`   settled ${K + 1 - unsettled}/${K + 1}; recurrence: ${agree} agree, ${disagree} disagree${disagree ? ' (first k = ' + firstBad + ')' : ''}`);
  console.log(`   branch points (k:branch, s = shift-type, c = complement-type): ${branches.join(' ')}`);
  console.log(`   vs seed: ${firstDiff < 0 ? 'every S_k is the seed\'s S_k up to a shift' : 'first S_k that is not a shift of the seed\'s: k = ' + firstDiff}; shifts seen at period 16: ${shifts.join(',') || '(none)'}`);
  console.log(`   onset: max onset/k = ${maxRatio.toFixed(3)} at k = ${maxK} (onset ${maxK >= 0 ? S[maxK].onset : '-'}); onsets exceeding k: ${over}; mean onset/k on [${K / 2}, ${K}]: ${(sum / cnt).toFixed(3)}`);
  console.log(`   period: max ${pmax}; periods exceeding k+1: ${pover}`);
  console.log(`   deviation from own settled picture: centre ${(e0 / tot).toFixed(3)}, column -1 at black times ${blacks ? (e1black / blacks).toFixed(3) : '-'} (${blacks} black times)`);
  return { S, diag };
}

const control = analyse(...boundaries[0]);
let mismatch = 0;
for (let k = 0; k <= K; k++) for (let j = 0; j < control.diag[k].length; j++) if (control.diag[k][j] !== seedDiag[k][j]) mismatch++;
console.log(`   control: ${mismatch} cells of the half-line model disagree with the engine's diagonals`);
for (const b of boundaries.slice(1)) analyse(...b);
