/**
 * The settled words of the left diagonals, and the picture they predict.
 *
 *   node explorer/settledwords.mjs
 *
 * Diagonal k of the seed's picture, leftDiagonal k j = evolve (j+k) (-j), is
 * eventually periodic with a power-of-two period. Its *settled word* S_k is
 * the periodic function on all of Z that agrees with the diagonal from its
 * onset on, kept in absolute phase (S_k(j) is indexed by the diagonal's own
 * j, not by "position in the period"). Rowland 2006 §6 observes that S_k is
 * fixed by S_{k-2} and S_{k-1} alone whenever S_{k-1} has a black cell, so
 * the settled region is the same for every configuration white far to the
 * left, up to one choice at each eventually-white diagonal. This script
 *
 *   1. reads S_k for k <= K from N rows of the engine, and checks S_k against
 *      the unique periodic solution of the diagonal recurrence driven by
 *      S_{k-2}, S_{k-1} (or, at a white diagonal, against the two solutions);
 *   2. lists the eventually-white diagonals and the branch taken there;
 *   3. evaluates the settled picture at the centre, s(t) = S_t(0), and at
 *      column -1, S_{t-1}(1), against the real centre column and column -1,
 *      i.e. measures the deviation E = picture xor S on the seam;
 *   4. looks for a repeated consecutive pair (S_{k-1}, S_k), which would make
 *      the settled words, and s, periodic in k from there on.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerBitIndex, rows } from './rule30.mjs';

const N = 6000;
const K = 2400;
const MIN_CYCLES = 8;
const MAX_P = 64;
const MIN_TAIL = 128;   // a short constant tail is chance, not a period 1

/** Diagonals D_k(j) = cell (j+k, -j) of the seed, k <= K, from N engine rows. */
export function seedDiagonals(N, K) {
  const diag = [];
  for (let k = 0; k <= K; k++) diag.push(new Uint8Array(N - k));
  const base = centerBitIndex(N);
  let t = 0;
  for (const row of rows(N)) {
    const s = row.toString(2);
    const len = s.length;
    for (let k = 0; k <= K && k <= t; k++) {
      const pos = base - (t - k);
      diag[k][t - k] = pos < len && s.charCodeAt(len - 1 - pos) === 49 ? 1 : 0;
    }
    t++;
  }
  return diag;
}

/**
 * Diagonals of the half-line x <= -1 grown from the left word w (w[0] = cell -1)
 * with boundary c (a function of t), for N rows: D_k(j) = cell (j+k, -j), with
 * D_k(0) = c(k). Same coordinates as seedDiagonals when c is the centre column
 * and w is empty.
 */
export function halfLineDiagonals(c, w, N, K) {
  const diag = [];
  for (let k = 0; k <= K; k++) diag.push(new Uint8Array(N - k));
  const W = N + w.length + 3;
  let row = new Uint8Array(W), next = new Uint8Array(W);
  for (let i = 0; i < w.length; i++) row[i + 1] = w[i];
  for (let t = 0; t < N; t++) {
    row[0] = c(t);
    for (let k = 0; k <= K && k <= t; k++) diag[k][t - k] = row[t - k];
    const lim = Math.min(W - 2, t + w.length + 2);
    for (let j = 1; j <= lim; j++) next[j] = row[j + 1] ^ (row[j] | row[j - 1]);
    for (let j = lim + 1; j < W; j++) next[j] = 0;
    [row, next] = [next, row];
  }
  return diag;
}

const mod = (a, p) => ((a % p) + p) % p;

/**
 * Settle a diagonal: minimal power-of-two period p with at least MIN_CYCLES
 * cycles and MIN_TAIL cells of tail, its onset, and the settled word in
 * absolute phase, word[j mod p] = S(j).
 */
export function settle(a, minCycles = MIN_CYCLES, maxP = MAX_P) {
  for (let p = 1; p <= maxP && p * minCycles <= a.length; p *= 2) {
    let lastBreak = -1;
    for (let i = p; i < a.length; i++) if (a[i] !== a[i - p]) lastBreak = i;
    const onset = lastBreak < 0 ? 0 : lastBreak - p + 1;
    if (a.length - onset >= Math.max(minCycles * p, MIN_TAIL)) {
      const word = new Uint8Array(p);
      for (let r = 0; r < p; r++) word[r] = a[onset + mod(r - onset, p)];
      return { p, onset, word };
    }
  }
  return null;
}

export const at = (S, j) => S.word[mod(j, S.p)];
export const key = (S) => `${S.p}:${Array.from(S.word).join('')}`;
export const isWhite = (S) => S.word.every((v) => v === 0);

/**
 * F(Sa, Sb): the periodic solutions x of x(i+1) = Sa(i+2) xor (Sb(i+1) || x(i)).
 * If Sb has a black cell the solution with period q = max(pa, pb) is unique
 * and is returned as [x]. If Sb is white the machine is x(i+1) = Sa(i+2) xor x(i)
 * and the two solutions (complements of each other, period q or 2q) are returned.
 */
export function F(Sa, Sb) {
  const q = Math.max(Sa.p, Sb.p);
  if (!isWhite(Sb)) {
    let i0 = -1;
    for (let i = 0; i < q; i++) if (at(Sb, i + 1) === 1) { i0 = i; break; }
    const x = new Uint8Array(2 * q + 2);      // x[m] = value at index i0 + 1 + m
    x[0] = 1 ^ at(Sa, i0 + 2);
    for (let m = 0; m < 2 * q + 1; m++) {
      const i = i0 + 1 + m;
      x[m + 1] = at(Sa, i + 2) ^ (at(Sb, i + 1) | x[m]);
    }
    for (let m = 0; m < q; m++) if (x[m] !== x[m + q]) throw new Error('F: not q-periodic');
    const word = new Uint8Array(q);
    for (let m = 0; m < q; m++) word[mod(i0 + 1 + m, q)] = x[m];
    return [{ p: q, onset: 0, word }];
  }
  const sols = [];
  for (const x0 of [0, 1]) {
    const x = new Uint8Array(2 * q + 1);
    x[0] = x0;
    for (let i = 0; i < 2 * q; i++) x[i + 1] = at(Sa, i + 2) ^ x[i];
    const p = x[q] === x[0] ? q : 2 * q;
    sols.push({ p, onset: 0, word: x.slice(0, p) });
  }
  return sols;
}

export const same = (S, T) => {
  const q = Math.max(S.p, T.p);
  for (let j = 0; j < q; j++) if (at(S, j) !== at(T, j)) return false;
  return true;
};

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('settledwords.mjs')) {
  const t0 = Date.now();
  const diag = seedDiagonals(N, K);
  console.log(`seed: ${N} rows, diagonals 0..${K} (${Date.now() - t0} ms)`);

  const S = [];
  let unsettled = 0;
  for (let k = 0; k <= K; k++) {
    const s = settle(diag[k]);
    if (!s) { unsettled++; S.push(null); continue; }
    S.push(s);
  }
  console.log(`settled ${K + 1 - unsettled} diagonals, ${unsettled} without ${MIN_CYCLES} cycles`);

  // 1. the recurrence on settled words
  let ok = 0, bad = 0, whiteSteps = [];
  const firstBad = [];
  for (let k = 2; k <= K; k++) {
    if (!S[k] || !S[k - 1] || !S[k - 2]) continue;
    const sols = F(S[k - 2], S[k - 1]);
    if (sols.length === 1) {
      if (same(sols[0], S[k])) ok++; else { bad++; if (firstBad.length < 5) firstBad.push(k); }
    } else {
      const which = sols.findIndex((x) => same(x, S[k]));
      whiteSteps.push({ k, which, pa: S[k - 2].p, pk: S[k].p, parity: S[k - 2].word.reduce((a, b) => a + b, 0) % 2 });
      if (which >= 0) ok++; else { bad++; if (firstBad.length < 5) firstBad.push(k); }
    }
  }
  console.log(`S_k = F(S_{k-2}, S_{k-1}): ${ok} agree, ${bad} disagree${bad ? ' (first at k = ' + firstBad.join(', ') + ')' : ''}`);
  console.log('eventually-white diagonals k-1 (branch points), with the branch S_k took:');
  for (const w of whiteSteps) console.log(`   k = ${String(w.k).padStart(5)}: S_{k-2} has period ${w.pa} with ${w.parity ? 'odd' : 'even'} parity; S_k has period ${w.pk}; branch ${w.which} (${w.which < 0 ? 'NEITHER' : w.pk > w.pa ? 'a shift by ' + w.pa + ' of the other' : 'the complement of the other'})`);

  // 2. periods and onsets in brief
  const maxOnsetRatio = [];
  for (let k = 1; k <= K; k++) if (S[k]) maxOnsetRatio.push([S[k].onset / k, k]);
  maxOnsetRatio.sort((a, b) => b[0] - a[0]);
  console.log(`largest onset/k: ${maxOnsetRatio.slice(0, 5).map(([r, k]) => `${r.toFixed(3)} at k=${k} (onset ${S[k].onset}, period ${S[k].p})`).join('; ')}`);
  const pmax = Math.max(...S.filter(Boolean).map((s) => s.p));
  console.log(`largest period: ${pmax}; first k with each period: ${[1, 2, 4, 8, 16, 32, 64].map((p) => `${p}@${S.findIndex((s) => s && s.p === p)}`).join(' ')}`);

  // 3. the settled picture on the seam
  const c = diag.map((d) => d[0]);                 // c(k) = D_k(0)
  const L = (t) => (t >= 1 ? diag[t - 1][1] : 0);   // column -1 at time t = D_{t-1}(1)
  let eCount = 0, eL = 0, tot = 0, eBlack = 0, blacks = 0, eLblack = 0;
  const eBits = [];
  for (let t = 1; t < K; t++) {
    if (!S[t] || !S[t - 1]) continue;
    tot++;
    const s = at(S[t], 0), e = c[t] ^ s;
    eBits.push(e);
    if (e) eCount++;
    const sL = at(S[t - 1], 1), el = L(t) ^ sL;
    if (el) eL++;
    if (c[t]) { blacks++; if (el) eLblack++; }
  }
  console.log(`deviation at the centre, e(t) = c(t) xor S_t(0): ${eCount}/${tot} = ${(eCount / tot).toFixed(3)}; at column -1, ${eL}/${tot} = ${(eL / tot).toFixed(3)}; at column -1 restricted to black times ${eLblack}/${blacks} = ${(eLblack / blacks).toFixed(3)}`);
  console.log(`e(1..120): ${eBits.slice(0, 120).join('')}`);
  console.log(`s(1..120): ${Array.from({ length: 120 }, (_, i) => at(S[i + 1], 0)).join('')}`);
  console.log(`c(1..120): ${c.slice(1, 121).join('')}`);
  // how long is a diagonal's transient in the deviation sense: last j with D_k(j) != S_k(j)
  let sumOnset = 0, cnt = 0;
  for (let k = 1000; k <= K; k++) if (S[k]) { sumOnset += S[k].onset / k; cnt++; }
  console.log(`mean onset/k over k in [1000, ${K}]: ${(sumOnset / cnt).toFixed(3)}`);

  // 4. repeated consecutive pairs of settled words
  const seen = new Map();
  let firstRepeat = null;
  for (let k = 1; k <= K; k++) {
    if (!S[k] || !S[k - 1]) continue;
    const pk = key(S[k - 1]) + '|' + key(S[k]);
    if (seen.has(pk)) { firstRepeat = { k, k0: seen.get(pk) }; break; }
    seen.set(pk, k);
  }
  if (firstRepeat) {
    const { k, k0 } = firstRepeat;
    // check how far the repetition S_{k0+i} = S_{k+i} continues
    let run = 0;
    while (k + run <= K && S[k + run] && S[k0 + run] && same(S[k + run], S[k0 + run])) run++;
    console.log(`first repeated pair: (S_${k0 - 1}, S_${k0}) = (S_${k - 1}, S_${k}), lag ${k - k0}; the repetition continues for ${run} diagonals${k + run > K ? ' (to the end of the scan)' : ', then breaks at k = ' + (k + run)}`);
  } else console.log(`no repeated consecutive pair of settled words for k <= ${K} (${seen.size} distinct pairs)`);
  console.log(`(${Date.now() - t0} ms)`);
}
