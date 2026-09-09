/**
 * N = 32 and N = 64 in the mmc_pow2 family.
 *
 *   node explorer/half2_n32.cjs [trials] [cap]
 *
 * 2^32 seeds cannot be enumerated, so this samples.  A width-32 ring is one
 * 32-bit word and rule 30 on it is three bit operations, so the sample can be
 * large; Floyd's cycle detection with a step cap keeps a ring with a huge orbit
 * from costing anything.  For each seed with a power-of-two row period and no
 * white left diagonal, the exact DP speed, sandwiched.
 *
 * Reported honestly: the sample size, how many seeds cycled inside the cap, how
 * many had a power-of-two period, and how many DISTINCT backgrounds those were.
 * A width-32 ring whose spatial period divides 16 is a width-16 ring in
 * disguise, so most of what turns up here is already in the exhaustive scan.
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

const TRIALS = Number(process.argv[2] || 200000);
const CAP = Number(process.argv[3] || 20000);

const rotl = (x, n) => (((x << n) | (x >>> (32 - n))) >>> 0);
const rotr = (x, n) => (((x >>> n) | (x << (32 - n))) >>> 0);
// cell i is bit i.  left neighbour of i is cell i-1 = bit i-1, so the word of
// left-neighbours is x rotated so that bit i-1 lands at bit i, i.e. rotl by 1.
const F = (x) => ((rotl(x, 1) ^ (x | rotr(x, 1))) >>> 0);

function wordToRow(x, N) { const r = new Uint8Array(N); for (let i = 0; i < N; i++) r[i] = (x >>> i) & 1; return r; }

// sanity: the 32-bit step must agree with the array step
{
  let bad = 0;
  for (let t = 0; t < 200; t++) {
    const x = (Math.random() * 4294967296) >>> 0;
    const a = L.rowKey(L.step30(wordToRow(x, 32)));
    const b = L.rowKey(wordToRow(F(x), 32));
    if (a !== b) bad++;
  }
  console.log(`bitwise rule 30 agrees with the array implementation on 200 random words: ${bad === 0} (mismatches ${bad})`);
}

/** Floyd, capped.  Returns the cycle length, or null if it did not close. */
function cycleLen(x0, cap) {
  let t = F(x0), h = F(F(x0)), steps = 1;
  while (t !== h) { if (steps++ > cap) return null; t = F(t); h = F(F(h)); }
  // t is on the cycle; measure its length
  let len = 1; let y = F(t);
  while (y !== t) { if (len++ > cap) return null; y = F(y); }
  return { len, onCycle: t };
}

let s = 20260909 >>> 0;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };

const N = 32;
let closed = 0, pow2 = 0, adm = 0;
const byBg = new Map();
for (let it = 0; it < TRIALS; it++) {
  const x0 = rnd();
  const c = cycleLen(x0, CAP);
  if (!c) continue;
  closed++;
  if (!L.isPow2(c.len)) continue;
  pow2++;
  const cyc = [];
  let y = c.onCycle;
  for (let i = 0; i < c.len; i++) { cyc.push(wordToRow(y, N)); y = F(y); }
  if (L.whiteDiagonals(cyc, N).length > 0) continue;
  adm++;
  const k = L.backgroundKey(cyc, N);
  if (!byBg.has(k)) byBg.set(k, { cyc, x0 });
}
console.log(`\nN = 32, ${TRIALS} random seeds, Floyd capped at ${CAP} steps`);
console.log(`  seeds whose orbit closed inside the cap : ${closed}`);
console.log(`  ... with power-of-two row period        : ${pow2}`);
console.log(`  ... and no identically-white diagonal   : ${adm}`);
console.log(`  DISTINCT backgrounds                    : ${byBg.size}`);
for (const v of byBg.values()) {
  const lo = L.dpSub(v.cyc, N, 300), hi = L.dpSup(v.cyc, N, 12);
  const q = lo ? L.reduce(lo) : null;
  // minimal spatial period of the background
  let sp = N;
  for (let p = 1; p <= N; p++) {
    if (N % p) continue;
    let ok = true;
    for (const r of v.cyc) for (let i = 0; i < N && ok; i++) if (r[i] !== r[(i + p) % N]) ok = false;
    if (ok) { sp = p; break; }
  }
  console.log(`    rowPeriod ${v.cyc.length}  minimal spatial period ${sp}  lower ${lo ? `${lo.num}/${lo.den} = ${q.num}/${q.den} = ${(lo.num / lo.den).toFixed(6)}` : '-'}  upper ${hi ? (hi.num / hi.den).toFixed(6) : '-'}`);
  console.log(`      ${Array.from(v.cyc[0]).map((x) => (x ? '#' : '.')).join('')}`);
}
