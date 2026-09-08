/**
 * The recurrence orbit past 200,000: where is the next eventually-white
 * diagonal after 87866, and is the sixth doubling where NKS p. 871 puts it?
 *
 *   node explorer/orbit32.mjs
 *
 * From the state (S_87866, S_87867) = (0, w), w of period 32, the settled
 * words are fixed by the recurrence alone until the next eventually-white
 * diagonal. At a white diagonal of odd parity (the word two before it has
 * an odd number of black cells in its 32-block) the period doubles to 64 and
 * this script stops that branch; at one of even parity the two continuations
 * are complements and both are followed (a tree, as in leftsides_tree.mjs),
 * because only the picture can say which the seed takes and the picture is
 * out of reach at this depth. So every white diagonal found on the root
 * branch before the first even-parity white is the seed's own, exactly.
 *
 * Steps: (1) the orbit to 200,000 with settledwords.F and the branch bits
 * forbit.mjs read from the engine, checked against engine windows at the
 * branch points; (2) a bit-parallel 32-bit step, checked against the slow
 * one on the whole orbit 87867..200,000 and on random inputs; (3) the tree.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerBitIndex, rows } from './rule30.mjs';
import { F, at, isWhite } from './settledwords.mjs';

const STEP_BUDGET = 8e9;   // total F-steps across all branches (about 20 ns per step)
const MAX_BRANCHES = 16;
const T = 137000, WIN = 64;
const j0 = (k) => Math.ceil(0.55 * k) + 16;
// branch indices as forbit.mjs printed them (solution order of settledwords.F)
const BRANCHES = new Map([[3, 1], [8, 1], [29, 0], [400, 0], [53208, 0], [58287, 1], [87867, 1]]);

const t0 = Date.now();
// --- (1) engine windows at the branch points and a few spot checks
const KREAD = Math.floor((T - WIN - 16) / 1.55) - 2;
const want = new Set([...BRANCHES.keys(), 2400, 53210, 87868]);
const win = new Map();
for (const k of want) if (k <= KREAD) win.set(k, new Uint8Array(WIN));
{
  const base = centerBitIndex(T);
  let t = 0;
  for (const row of rows(T)) {
    for (const [k, w] of win) { const m = t - k - j0(k); if (m >= 0 && m < WIN) w[m] = Number((row >> BigInt(base - (t - k))) & 1n); }
    t++;
  }
}
const matches = (S, k) => { const w = win.get(k); for (let m = 0; m < WIN; m++) if (at(S, j0(k) + m) !== w[m]) return false; return true; };

const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
const whites = [];
for (let k = 2; k <= 200000; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  let s;
  if (sols.length === 1) s = sols[0];
  else {
    if (!BRANCHES.has(k)) throw new Error(`unexpected branch at k = ${k}`);
    s = sols[BRANCHES.get(k)];
    if (!matches(s, k)) throw new Error(`branch bit at k = ${k} disagrees with the engine`);
    whites.push(k - 1);
  }
  S.push(s);
  if (win.has(k) && !BRANCHES.has(k) && !matches(s, k)) throw new Error(`orbit disagrees with the engine at k = ${k}`);
}
console.log(`slow orbit to 200,000 rebuilt; white diagonals ${whites.join(', ')}; engine agrees at every branch point and at 2400, 53210, 87868 (${Date.now() - t0} ms)`);

// after-white structure on the seed's whites m: S_{m+1} = w (the branch word), S_{m+2} black, S_{m+3}(i) = not S_{m+1}(i+2)
let afterOk = true;
for (const m of whites) {
  const black = S[m + 2].word.every((v) => v === 1);
  let comp = true;
  const q = Math.max(S[m + 1].p, S[m + 3].p);
  for (let i = 0; i < q; i++) if (at(S[m + 3], i + 1) !== 1 - at(S[m + 1], i + 2)) comp = false;
  if (!black || !comp) { afterOk = false; console.log(`   after-white structure FAILS at m = ${m}: black ${black}, complement-shift ${comp}`); }
}
console.log(`after every white diagonal m: S_{m+2} is black and S_{m+3}(i+1) = not S_{m+1}(i+2): ${afterOk ? 'holds' : 'FAILS'} for m in {${whites.join(', ')}}`);

// --- (2) 32-bit words
const L = 32;
const toInt = (s) => { let x = 0; for (let i = 0; i < L; i++) x = (x | (at(s, i) << i)) >>> 0; return x; };
const rotr1 = (x) => ((x >>> 1) | (x << 31)) >>> 0;   // rotr1(x)(i) = x(i+1)
const rotl1 = (x) => ((x << 1) | (x >>> 31)) >>> 0;   // rotl1(x)(i) = x(i-1)
/** The unique 32-periodic solution of c(i) = a(i+1) xor (b(i) || c(i-1)), b != 0, by iteration to the fixed point. */
function stepFast(a, b) {
  const d = rotr1(a);
  let c = d;
  for (let n = 0; n < 40; n++) {
    const nx = (d ^ (b | rotl1(c))) >>> 0;
    if (nx === c) return c;
    c = nx;
  }
  throw new Error('stepFast: no fixed point (b white?)');
}
const popcount = (x) => { let n = 0; while (x) { n += x & 1; x >>>= 1; } return n; };
const bits = (x) => { let s = ''; for (let i = 0; i < L; i++) s += (x >>> i) & 1; return s; };

// check stepFast against the slow orbit from 87867 to 200,000
{
  let a = toInt(S[87866]), b = toInt(S[87867]);
  if (a !== 0) throw new Error('S_87866 is not white');
  for (let k = 87868; k <= 200000; k++) {
    const c = stepFast(a, b);
    if (c !== toInt(S[k])) throw new Error(`stepFast disagrees with the slow orbit at k = ${k}`);
    a = b; b = c;
  }
  // and against the bit-serial definition on random pairs
  let x = 123456789;
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
  for (let n = 0; n < 200000; n++) {
    const aa = rnd(), bb = rnd(); if (bb === 0) continue;
    let i0 = -1; for (let i = 0; i < L; i++) if ((bb >>> i) & 1) { i0 = i; break; }
    let c = 0, prev = 0;
    for (let m = 0; m < L; m++) { const i = (i0 + m) % L; const v = ((aa >>> ((i + 1) % L)) & 1) ^ (((bb >>> i) & 1) | prev); c = (c | (v << i)) >>> 0; prev = v; }
    if (c !== stepFast(aa, bb)) throw new Error('stepFast disagrees with the serial solve');
  }
  console.log(`stepFast agrees with the slow orbit on 87868..200,000 and with the serial solve on 200,000 random pairs (${Date.now() - t0} ms)`);
}

// --- (3) the tree beyond 200,000
const root = { a: toInt(S[199999]), b: toInt(S[200000]), k: 200000, lastWhite: 87866, path: 'seed' };
const work = [root];
let steps = 0, branchesMade = 0;
const found = [];
while (work.length && steps < STEP_BUDGET) {
  const st = work.shift();
  let { a, b, k } = st;
  const budgetHere = Math.floor((STEP_BUDGET - steps) / (work.length + 1));
  let n = 0;
  while (n < budgetHere) {
    const c = stepFast(a, b);
    k++; n++;
    if (c === 0) {
      // white at k; u = a; gap from the previous white
      const par = popcount(a) & 1;
      found.push({ k, gap: k - st.lastWhite, path: st.path, parity: par ? 'odd' : 'even' });
      console.log(`   white diagonal at k = ${k} on path ${st.path}: gap ${k - st.lastWhite} from the previous white (2^32 = ${2 ** 32}); u = S_{k-2} has ${par ? 'odd' : 'even'} parity: ${par ? 'the period DOUBLES to 64 at k+1 = ' + (k + 1) : 'complement-type, both continuations followed'} (${Date.now() - t0} ms, ${(steps + n).toExponential(2)} steps so far)`);
      if (par) break;
      // running xor of shift(u): w'(i+1) = u(i+2) xor w'(i), two solutions, complements
      let w0 = 0, prev = 0;
      for (let i = 0; i < L; i++) { w0 = (w0 | (prev << i)) >>> 0; prev ^= (a >>> ((i + 2) % L)) & 1; }
      // w0 has w0(0) = 0; consistency around the cycle needs even parity, which holds
      const w1 = (~w0) >>> 0;
      if (branchesMade < MAX_BRANCHES) { work.push({ a: 0, b: w0, k: k + 1, lastWhite: k, path: st.path + '.0' }); work.push({ a: 0, b: w1, k: k + 1, lastWhite: k, path: st.path + '.1' }); branchesMade += 2; }
      break;
    }
    a = b; b = c;
  }
  steps += n;
  if (n >= budgetHere) console.log(`   path ${st.path}: budget exhausted at k = ${k} with no white since ${st.lastWhite} (${k - st.lastWhite} diagonals, ${((k - st.lastWhite) / 2 ** 32).toFixed(3)} of 2^32)`);
}
console.log(`tree done: ${steps.toExponential(2)} steps, ${found.length} white diagonals found, ${branchesMade} branches made (${Date.now() - t0} ms)`);
