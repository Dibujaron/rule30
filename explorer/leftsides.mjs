/**
 * How many left sides of rule 30 are there? Rowland 2006 §5 ends with the
 * observation that at his column 53209 (our diagonal 53208; diagonal 53207 is
 * eventually white and the period of 53206 has even parity) the settled word
 * has two candidates, complements of each other, "providing a counterexample
 * to the conjecture (if in fact they do occur for some initial conditions)",
 * and that each candidate branches again (at his 58288 and 72577; the
 * recurrence tree in leftsides_tree.mjs confirms both numbers, ours 58287
 * and 72576).
 *
 *   node explorer/leftsides.mjs
 *
 * This script grows configurations white on x < 0 and black at 0 (Rowland's
 * "rightful rows with a white left tail"), random and structured, runs the
 * settled-word orbit (forbit.mjs) for each one to K_MAX, reading the picture
 * only at the eventually-white diagonals, and compares the settled word each
 * configuration takes at 53208 and 58287 with the seed's *up to a cyclic
 * shift* — the choice at a doubling branch (3, 8, 29, 400) shifts every later
 * word, so the raw branch labels of F are not comparable across
 * configurations, only the cyclic words are. A configuration on the seed's
 * side has the seed's cyclic word at 53208 and a branch at 58287; one on the
 * other side has the complementary cyclic word and its next branch at 72576.
 *
 * For each configuration it also reads the transient of diagonal 53207 from
 * the picture: the index j* of its last black cell (the onset is j* + 1),
 * the settled driver word a = S_53206 at j* + 1, and the value of the
 * candidate word P (the F solution with P(0) = 0) at j*. The recurrence says
 * S_53208(j*) = not a(j* + 1), so which candidate is taken is decided by
 * where j* falls against the driver's period.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { step } from './rule30.mjs';
import { F, at } from './settledwords.mjs';

const K_MAX = 90000;
const WIN = 64;
const j0 = (k) => Math.ceil(0.55 * k) + 16;
const T = Math.ceil((K_MAX + 2) * 1.55) + WIN + 32;
const W = 3000;
const KE = 53207;              // the eventually-white diagonal before the complement branch
const KES = [53207, 58286, 87866];   // every eventually-white diagonal in [400, 90000): the seam of each is read
const JMAX = 40000;            // how far each of those diagonals is read

let xs = 88172645;
const rnd = () => { xs ^= xs << 13; xs >>>= 0; xs ^= xs >>> 17; xs ^= xs << 5; xs >>>= 0; return xs; };

const configs = [];
configs.push({ name: 'seed', cells: [0] });
configs.push({ name: 'seed + cell 1', cells: [0, 1] });
configs.push({ name: 'seed + cell 2', cells: [0, 2] });
configs.push({ name: 'seed + cell 7', cells: [0, 7] });
configs.push({ name: 'seed + cell 100', cells: [0, 100] });
configs.push({ name: 'cells 0..2999 black', cells: Array.from({ length: W }, (_, i) => i) });
configs.push({ name: 'cells 0..99 black', cells: Array.from({ length: 100 }, (_, i) => i) });
configs.push({ name: '(10)^1500', cells: Array.from({ length: 1500 }, (_, i) => 2 * i) });
configs.push({ name: '(100)^1000', cells: Array.from({ length: 1000 }, (_, i) => 3 * i) });
configs.push({ name: '(1000)^750', cells: Array.from({ length: 750 }, (_, i) => 4 * i) });
configs.push({ name: '(110)^1000', cells: Array.from({ length: 2000 }, (_, i) => 3 * Math.floor(i / 2) + (i % 2)) });
configs.push({ name: 'black at 0, 3000..3999', cells: [0, ...Array.from({ length: 1000 }, (_, i) => 3000 + i)] });
for (let r = 0; r < 20; r++) {
  const cells = [0];
  for (let x = 1; x < W; x++) if (rnd() & 1) cells.push(x);
  configs.push({ name: `random right half #${r + 1} (width ${W})`, cells });
}
for (let r = 0; r < 4; r++) {
  const cells = [0];
  for (let x = 1; x < 20000; x++) if (rnd() & 1) cells.push(x);
  configs.push({ name: `random right half, wide #${r + 1} (width 20000)`, cells });
}
for (let r = 0; r < 4; r++) {
  const cells = [0];
  for (let x = 1; x < W; x++) if ((rnd() & 15) === 0) cells.push(x);
  configs.push({ name: `sparse random right half #${r + 1} (density 1/16)`, cells });
}

const cyclicShift = (A, B) => {
  const q = Math.max(A.p, B.p);
  for (let d = 0; d < q; d++) { let ok = true; for (let j = 0; j < q; j++) if (at(A, j) !== at(B, j + d)) { ok = false; break; } if (ok) return d; }
  return -1;
};

let seedWords = null;
const tally = { same: 0, other: 0, unknown: 0 };
const jstars = [];
for (const cfg of configs) {
  const t0 = Date.now();
  const base = T + 2;
  let row = 0n;
  for (const x of cfg.cells) row |= 1n << BigInt(base + x);
  const win = new Array(K_MAX + 1);
  for (let k = 0; k <= K_MAX; k++) win[k] = new Uint8Array(WIN);
  const dEs = new Map(KES.map((k) => [k, new Uint8Array(JMAX)]));    // the eventually-white diagonals, indices 0..JMAX-1
  const dE = dEs.get(KE);
  for (let t = 0; t < T; t++) {
    const kLo = Math.max(0, Math.floor((t - WIN - 16) / 1.55) - 2), kHi = Math.min(K_MAX, Math.ceil(t / 1.55) + 2);
    if (kLo <= kHi) {
      const posLo = base - (t - kLo);
      const width = kHi - kLo + 1;
      const slice = ((row >> BigInt(posLo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
      for (let k = kLo; k <= kHi; k++) {
        const j = t - k, m = j - j0(k);
        if (m >= 0 && m < WIN) win[k][m] = slice.charCodeAt(width - 1 - (k - kLo)) === 49 ? 1 : 0;
      }
    }
    for (const k of KES) if (t >= k && t - k < JMAX) dEs.get(k)[t - k] = Number((row >> BigInt(base - (t - k))) & 1n);
    row = step(row);
  }
  const matches = (S, k) => { const w = win[k]; for (let m = 0; m < WIN; m++) if (at(S, j0(k) + m) !== w[m]) return false; return true; };
  const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
  const branches = [];
  let stopped = '';
  let spot = 0, spotBad = 0;
  let P = null;
  for (let k = 2; k <= K_MAX; k++) {
    const sols = F(S[k - 2], S[k - 1]);
    let s;
    if (sols.length === 1) s = sols[0];
    else {
      const ok = sols.map((x) => matches(x, k));
      const which = ok[0] && !ok[1] ? 0 : ok[1] && !ok[0] ? 1 : -1;
      branches.push({ k, type: sols[0].p > S[k - 2].p ? 'shift' : 'complement', which });
      if (k === KE + 1) P = sols[0];
      if (which < 0) { stopped = ` (stopped at k = ${k}: window matched [${ok.join(',')}])`; break; }
      s = sols[which];
    }
    S.push(s);
    if (k % 3000 === 0) { spot++; if (!matches(s, k)) spotBad++; }
  }
  if (!seedWords) seedWords = { w53208: S[53208], w58287: S[58287] };
  const d1 = S[53208] ? cyclicShift(S[53208], seedWords.w53208) : -2;
  const has58287 = branches.some((b) => b.k === 58287), has72576 = branches.some((b) => b.k === 72576);
  const side = d1 >= 0 && has58287 && !has72576 ? 'seed side' : d1 === -1 && has72576 ? 'OTHER side' : 'unknown';
  tally[side === 'seed side' ? 'same' : side === 'OTHER side' ? 'other' : 'unknown']++;
  // the transient of diagonal KE
  let jstar = -1;
  for (let j = JMAX - 1; j >= 0; j--) if (dE[j] === 1) { jstar = j; break; }
  const a = S[KE - 1];
  // the seam (last black cell) of every eventually-white diagonal read, and the translation N it implies against the seed's
  const seams = KES.map((k) => { const d = dEs.get(k); let j = -1; for (let i = JMAX - 1; i >= 0; i--) if (d[i] === 1) { j = i; break; } return j; });
  if (!seedWords.seams) seedWords.seams = seams;
  const Ns = seams.map((j, i) => j - seedWords.seams[i]);
  const info = `seams at ${KES.join('/')}: ${seams.join('/')}, N = ${Ns.join('/')}${Ns.every((n) => n === Ns[0]) ? ' (constant)' : ' (NOT CONSTANT)'}`;
  jstars.push({ name: cfg.name, jstar, Ns, side, d1 });
  console.log(`${cfg.name.padEnd(44)} ${side.padEnd(10)} word at 53208 = seed's shifted by ${d1}; branches ${branches.map((b) => `${b.k}:${b.type[0]}${b.which}`).join(' ')}${stopped}; spot ${spot - spotBad}/${spot}; ${info} (${Date.now() - t0} ms)`);
}
console.log(`\n${configs.length} configurations: ${tally.same} on the seed's side at 53208 (word a cyclic shift of the seed's, next branch 58287), ${tally.other} on the other side (complementary word, next branch 72576), ${tally.unknown} undetermined`);
console.log(`seed's word at 53208: ${Array.from(seedWords.w53208.word).join('')} (period ${seedWords.w53208.p}); seed's seams at ${KES.join('/')}: ${seedWords.seams.join('/')}`);
const constant = jstars.filter((r) => r.Ns.every((n) => n === r.Ns[0])).length;
const phaseOk = jstars.filter((r) => r.d1 >= 0 && (((r.d1 + r.Ns[0]) % 16) + 16) % 16 === 0).length;
console.log(`N read off the three seams is the same integer at all three for ${constant} of ${jstars.length} configurations; the cyclic shift of the word at 53208 is -N mod 16 for ${phaseOk} of ${jstars.length}`);
