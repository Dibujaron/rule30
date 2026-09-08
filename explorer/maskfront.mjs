/**
 * The masking mechanism as a damage front: the seam of the transient band is
 * the left front of the difference between the seed's picture and the
 * settled picture, and it obeys the left local law cell for cell.
 *
 *   node explorer/maskfront.mjs
 *
 * S(t, x) = S_{t+x}(-x) is the settled picture (settledwords.mjs, the seed's
 * branch bits), a rule 30 evolution of the settled configuration Sigma
 * (settledpicture.mjs, settledorbit.mjs). E = picture xor S is the transient
 * band. Its left front F(t) = min { x : E(t, x) = 1 } is a damage front
 * between two configurations, so rule30_left_local_law (crystals A2) says
 *
 *   F(t+1) >= F(t) - 1, with equality iff the cell (t, F(t) - 1) is white.
 *
 * The cell (t, F(t) - 1) is the settled neighbour: diagonal t + F(t) - 1 at
 * index -F(t) + 1. So the front rides one diagonal kappa(t) = t + F(t) at
 * speed 1 exactly while the settled word of the diagonal beside it is white,
 * and leaves it for good at that word's next black cell. This script
 *
 *   1. tracks F(t) and kappa(t) to T rows, checks the law at every row and
 *      re-scans the whole row left of the front every FULLSCAN rows;
 *   2. records the onset N_k of every diagonal k <= K_O (last index where the
 *      picture deviates from S_k, plus one), from the band;
 *   3. checks, for every diagonal the front visits, that its onset is exactly
 *      the first black cell of S_{k-1} past the arrival index, and that it
 *      settles no earlier than its drivers; and that every diagonal which
 *      settles strictly before a driver is one the front never visits;
 *   4. reports the front's speed, the margin of the onset wall in front form
 *      (leftDiagonal_onset_le <=> 2 F(t) + t >= 1 for all t), the retreat and
 *      jump statistics, and the longest speed-1 run.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { rows, centerBitIndex } from './rule30.mjs';
import { F as solveF } from './settledwords.mjs';

const T = 160000;          // rows
const K_O = 110000;        // onsets reported for k <= K_O (must be < kappa(T))
const FULLSCAN = 500;      // full re-scan left of the front every this many rows
const SMALL = 40;          // rows scanned in full over the whole cone
const BRANCH = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
for (let k = 2; k <= T + 2 * SMALL; k++) {
  const sols = solveF(S[k - 2], S[k - 1]);
  if (sols.length === 1) S.push(sols[0]);
  else { if (!BRANCH.has(k)) throw new Error(`unexpected branch at k = ${k}`); S.push(sols[BRANCH.get(k)]); }
}
const words = S.map((s) => s.word), periods = S.map((s) => s.p);
const sat = (k, j) => { const p = periods[k]; return words[k][((j % p) + p) % p]; };
console.log(`settled words to k = ${T + 2 * SMALL} from the recurrence (${Date.now() - t0} ms)`);

// what kills a transient: the cell below-left (t+1, x-1) of a transient (t, x) reads L = (t, x-2),
// C = (t, x-1), R = (t, x); with R deviating it agrees with S iff one of four cases holds.
//   1 masked:    L, C agree, C black            (the || hides R behind C)
//   2 C-cancel:  L agrees, C deviates, C != R
//   3 L-cancel:  L deviates, C agrees, C white  (the two deviations cancel in the xor)
//   4 triple:    L, C, R all deviate, C = R
//   0 none:      the transient continues on the diagonal
const killType = (eL, eC, bitC, bitR) => {
  if (!eL && !eC) return bitC ? 1 : 0;
  if (!eL && eC) return bitC !== bitR ? 2 : 0;
  if (eL && !eC) return bitC ? 0 : 3;
  return bitC === bitR ? 4 : 0;
};
const kill = new Uint8Array(K_O + 1);

const base = centerBitIndex(T);
const NONE = 0x7fffffff;
const front = new Int32Array(T + 1).fill(NONE);
const last = new Int32Array(K_O + 1).fill(-1);
const arrival = new Int32Array(T + 2).fill(-1), depart = new Int32Array(T + 2).fill(-1);
let advances = 0, stays = 0, retreats = 0, retreatSum = 0, maxRetreat = 0, maxRetreatAt = -1;
const retreatHist = new Map(), jumpHist = new Map();
let lawFail = 0, firstLawFail = -1, fullscanFail = 0, firstFullscanFail = -1, fullscans = 0, kappaDecrease = 0;
let run = 0, maxRun = 0, maxRunAt = -1, runs = 0;
let minMargin = Infinity, minMarginAt = -1, maxSpeed = 0, maxSpeedAt = -1;
let firstDev = null;
let Fp = NONE, wPrev = -1, kappaPrev = -1;
let t = 0;
const samples = [];
for (const row of rows(T)) {
  let lo, hi;
  if (t < SMALL) { lo = -t; hi = t + SMALL; }   // the front sits right of the cone for t < 18
  else {
    if (Fp === NONE || Fp > 0) throw new Error(`front not in x <= 0 at t = ${t}: ${Fp}`);
    lo = Math.max(-t, Fp - 2); hi = 0;
  }
  const doFull = t >= SMALL && t % FULLSCAN === 0;
  if (doFull) lo = -t;
  const width = hi - lo + 1;
  const str = ((row >> BigInt(base + lo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
  let Fn = NONE;
  let eL = 0, eC = 0, bitC = 0;    // deviation flags and bits of the two cells left of x, carried along
  for (let x = lo; x <= hi; x++) {
    const bit = str.charCodeAt(width - 1 - (x - lo)) === 49 ? 1 : 0;
    const k = t + x, j = -x;
    const e = bit !== sat(k, j) ? 1 : 0;
    if (e) {
      if (Fn === NONE) Fn = x;
      if (k <= K_O && j > last[k]) { last[k] = j; kill[k] = killType(eL, eC, bitC, bit); }
    }
    eL = eC; eC = e; bitC = bit;
  }
  if (doFull) { fullscans++; if (Fn !== NONE && Fn < Fp - 1) { fullscanFail++; if (firstFullscanFail < 0) firstFullscanFail = t; } }
  if (Fn !== NONE && !firstDev && Fn <= 0) firstDev = { t, x: Fn };
  front[t] = Fn;
  // the law against the previous row
  if (t >= 1 && Fp !== NONE) {
    if (Fn === NONE) { lawFail++; if (firstLawFail < 0) firstLawFail = t; }
    else {
      const adv = Fn === Fp - 1;
      if (Fn < Fp - 1 || adv !== (wPrev === 0)) { lawFail++; if (firstLawFail < 0) firstLawFail = t; }
      if (adv) { advances++; run++; }
      else {
        if (run > 0) { runs++; if (run > maxRun) { maxRun = run; maxRunAt = t - 1; } run = 0; }
        if (Fn === Fp) stays++;
        else { retreats++; const r = Fn - Fp; retreatSum += r; retreatHist.set(r, (retreatHist.get(r) || 0) + 1); if (r > maxRetreat) { maxRetreat = r; maxRetreatAt = t; } }
      }
    }
  }
  if (Fn !== NONE) {
    const kappa = t + Fn;
    if (kappaPrev >= 0) {
      if (kappa < kappaPrev) kappaDecrease++;
      if (kappa !== kappaPrev) { depart[kappaPrev] = -Fp; arrival[kappa] = -Fn; const jmp = kappa - kappaPrev; jumpHist.set(jmp, (jumpHist.get(jmp) || 0) + 1); }
    } else arrival[kappa] = -Fn;
    kappaPrev = kappa;
    const margin = 2 * Fn + t;
    if (t >= 18 && margin < minMargin) { minMargin = margin; minMarginAt = t; }
    if (t >= 1000 && -Fn / t > maxSpeed) { maxSpeed = -Fn / t; maxSpeedAt = t; }
    // the settled neighbour for the next row's law check
    const xw = Fn - 1;
    wPrev = xw >= lo ? (str.charCodeAt(width - 1 - (xw - lo)) === 49 ? 1 : 0) : (xw < -t ? 0 : -1);
  } else wPrev = -1;
  if (t >= 18 && t <= 30) samples.push(`t=${t}: F=${Fn === NONE ? 'none' : Fn} kappa=${Fn === NONE ? '-' : t + Fn}`);
  Fp = Fn;
  t++;
}
const kappaT = T - 1 + front[T - 1];
console.log(`front tracked to t = ${T - 1} (${Date.now() - t0} ms); first deviation in x <= 0 at t = ${firstDev.t}, x = ${firstDev.x}; kappa(T-1) = ${kappaT} (K_O = ${K_O} ${kappaT > K_O ? 'is final' : 'IS NOT FINAL'})`);
console.log(`   ${samples.join('; ')}`);
console.log(`the law F(t+1) >= F(t) - 1 with equality iff cell (t, F(t)-1) white: ${lawFail} failures${firstLawFail >= 0 ? ' (first at t = ' + firstLawFail + ')' : ''}; full re-scans left of the front: ${fullscans}, deviations found left of F(t-1) - 1: ${fullscanFail}${firstFullscanFail >= 0 ? ' (first at t = ' + firstFullscanFail + ')' : ''}; kappa decreases: ${kappaDecrease}`);
const steps = advances + stays + retreats;
console.log(`steps ${steps}: advances ${advances} (${(advances / steps).toFixed(4)}), stays ${stays} (${(stays / steps).toFixed(4)}), retreats ${retreats} (${(retreats / steps).toFixed(4)}) summing to ${retreatSum}; net speed ${((advances - retreatSum) / steps).toFixed(4)}; F(T-1)/(T-1) = ${(front[T - 1] / (T - 1)).toFixed(4)}`);
console.log(`retreat sizes: ${[...retreatHist.entries()].sort((a, b) => a[0] - b[0]).map(([r, n]) => `${r}:${n}`).join(' ')}; largest ${maxRetreat} at t = ${maxRetreatAt}`);
console.log(`kappa jumps: ${[...jumpHist.entries()].sort((a, b) => a[0] - b[0]).slice(0, 12).map(([r, n]) => `${r}:${n}`).join(' ')}${jumpHist.size > 12 ? ' ...' : ''}`);
console.log(`speed-1 runs: ${runs}, mean length ${(advances / runs).toFixed(3)}, longest ${maxRun} ending at t = ${maxRunAt} (on diagonal ${maxRunAt + front[maxRunAt]}, neighbour word S_${maxRunAt + front[maxRunAt] - 1} of period ${periods[maxRunAt + front[maxRunAt] - 1]})`);
console.log(`onset wall in front form, min over t of 2 F(t) + t: ${minMargin} at t = ${minMarginAt}; max of -F(t)/t over t >= 1000: ${maxSpeed.toFixed(4)} at t = ${maxSpeedAt}`);
for (const tt of [1000, 10000, 50000, 100000, 150000]) console.log(`   t = ${tt}: F = ${front[tt]} (${(-front[tt] / tt).toFixed(4)} t), kappa = ${tt + front[tt]}`);

// 3. onsets against the front
let visited = 0, skipped = 0, identFail = 0, firstIdentFail = -1, lastFail = 0, firstLastFail = -1;
let vBefore1 = 0, vBefore2 = 0, sBefore1 = 0, sBefore2 = 0, sBeforeBoth = 0, vBefore2by1 = 0;
let maxOnsetRatio = 0, maxOnsetAt = -1, sumOnset = 0, cntOnset = 0, noTransient = 0;
const killV = [0, 0, 0, 0, 0], killS = [0, 0, 0, 0, 0], killSB = [0, 0, 0, 0, 0];
for (let k = 18; k <= K_O; k++) {
  const N = last[k] + 1, N1 = last[k - 1] + 1, N2 = last[k - 2] + 1;
  if (N === 0) { noTransient++; continue; }
  if (arrival[k] >= 0) killV[kill[k]]++; else { killS[kill[k]]++; if (N < N1) killSB[kill[k]]++; }
  if (k >= 1000) { sumOnset += N / k; cntOnset++; if (N / k > maxOnsetRatio) { maxOnsetRatio = N / k; maxOnsetAt = k; } }
  if (arrival[k] >= 0) {
    visited++;
    if (last[k] !== depart[k]) { lastFail++; if (firstLastFail < 0) firstLastFail = k; }
    let i = arrival[k] + 1;
    while (sat(k - 1, i) !== 1) { i++; if (i > arrival[k] + 4 * periods[k - 1] + 2) { i = -1; break; } }
    if (i !== N) { identFail++; if (firstIdentFail < 0) firstIdentFail = k; }
    if (N < N1) vBefore1++;
    if (N < N2) { vBefore2++; if (N === N2 - 1) vBefore2by1++; }
  } else {
    skipped++;
    if (N < N1) sBefore1++;
    if (N < N2) sBefore2++;
    if (N < N1 && N < N2) sBeforeBoth++;
  }
}
console.log(`diagonals 18..${K_O}: visited by the front ${visited}, skipped ${skipped} (visited fraction ${(visited / (visited + skipped)).toFixed(4)}); without any transient: ${noTransient}`);
console.log(`visited: onset = departure index + 1 fails ${lastFail}${firstLastFail >= 0 ? ' (first k = ' + firstLastFail + ')' : ''}; onset = first black of S_{k-1} past the arrival fails ${identFail}${firstIdentFail >= 0 ? ' (first k = ' + firstIdentFail + ')' : ''}`);
console.log(`settles strictly before a driver (N_k < N_{k-1} | N_k < N_{k-2}): visited ${vBefore1} | ${vBefore2} (of which by exactly one index: ${vBefore2by1}); skipped ${sBefore1} | ${sBefore2} (both: ${sBeforeBoth})`);
console.log(`onsets: mean N_k/k over k in [1000, ${K_O}]: ${(sumOnset / cntOnset).toFixed(4)}; max ${maxOnsetRatio.toFixed(4)} at k = ${maxOnsetAt}`);
const killNames = ['none', 'masked by a black neighbour', 'neighbour deviates, C != R', 'left cell deviates, neighbour white', 'all three deviate, C = R'];
console.log(`what kills the last transient (types: ${killNames.map((n, i) => i + ' = ' + n).join('; ')})`);
console.log(`   visited diagonals: ${killV.map((n, i) => i + ':' + n).join(' ')}`);
console.log(`   skipped diagonals: ${killS.map((n, i) => i + ':' + n).join(' ')}; of those settling before their neighbour: ${killSB.map((n, i) => i + ':' + n).join(' ')}`);
console.log(`(${Date.now() - t0} ms)`);
