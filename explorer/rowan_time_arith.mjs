/**
 * Rowan, 2026-09-13. Does the centre column see any arithmetic of t other than
 * ord_2(t)?
 *
 * The fence Rosetta proposes in docs/connections/2026-09-13-pretentious-*.md
 * §3.4 and §6: the only arithmetic of the time index this board has proved the
 * picture sees is the 2-adic valuation (the right edge's gap is a function of
 * ord_2(t) alone). Katai / Bourgain-Sarnak-Ziegler, the route to Prize 2 that
 * §3.3 prices, needs the picture to see multiplicative structure. So: measure
 * whether c(t) sees residues mod q at all, and whether a(t) = (-1)^c(t)
 * correlates with omega, Liouville, Mobius, or the p-adic valuation at any
 * prime.
 *
 * Every number is printed beside two coin nulls of the same length, beside
 * Thue-Morse (t -> popcount(t) mod 2, a structured automatic control), and
 * beside a calibrated spike -- a coin whose bit is replaced by ord_2(t) mod 2
 * with probability eps -- so that "no signal" is a statement with a threshold
 * attached rather than a shrug. Nothing here proves anything.
 *
 * The column is explorer/talus7_center10m.bin (10^7 terms, from talus7_deep.mjs),
 * checked twice before use: against A051023's prefix, and term by term against
 * this repo's BigInt engine over the first 2^16 terms.
 *
 *   node explorer/rowan_time_arith.mjs
 */

import { readFileSync } from 'node:fs';
import { centerColumnBits, A051023_PREFIX } from './rule30.mjs';

const N = 10_000_000;      // terms in the cache, t = 0 .. N-1
const T0 = 1;              // t = 0 is excluded: omega(0), ord_p(0) are undefined
const T1 = N - 1;
const COUNT = T1 - T0 + 1; // 9,999,999 -- the denominator for every "all t" row
const QMAX = 64;
const SPIKE_EPS = 0.001;

const t0 = Date.now();
const clock = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;

// ---------------------------------------------------------------------------
// the sequences
// ---------------------------------------------------------------------------

const column = new Uint8Array(
  readFileSync(new URL('./talus7_center10m.bin', import.meta.url)),
);
if (column.length !== N) throw new Error(`cache is ${column.length} bytes, expected ${N}`);

/** mulberry32 -- all 32 bits of each draw are used. */
function coinBits(n, seed) {
  const a = new Uint8Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i += 32) {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    t = (t ^ (t >>> 14)) >>> 0;
    const lim = Math.min(32, n - i);
    for (let j = 0; j < lim; j++) a[i + j] = (t >>> j) & 1;
  }
  return a;
}

/** uniform [0,1) draws from the same generator, for the spike control */
function coinFloats(n, seed) {
  const a = new Float64Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    a[i] = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return a;
}

// ---------------------------------------------------------------------------
// checks on the cache (same two as rowan_index_anf.mjs)
// ---------------------------------------------------------------------------

for (let i = 0; i < A051023_PREFIX.length; i++) {
  if (column[i] !== A051023_PREFIX[i]) throw new Error(`cache disagrees with A051023 at t=${i}`);
}
{
  const CHECK = 1 << 16;
  const fresh = centerColumnBits(CHECK);
  for (let i = 0; i < CHECK; i++) {
    if (column[i] !== fresh[i]) throw new Error(`cache disagrees with the BigInt engine at t=${i}`);
  }
  console.log(`cache checked: A051023 prefix + ${CHECK} terms vs the BigInt engine  [${clock()}]`);
}

// ---------------------------------------------------------------------------
// the sieve: omega mod 2, Omega mod 2 (Liouville), squarefree, ord_p mod 2
// ---------------------------------------------------------------------------

const composite = new Uint8Array(N);
for (let p = 2; p * p < N; p++) {
  if (composite[p]) continue;
  for (let m = p * p; m < N; m += p) composite[m] = 1;
}

const omegaPar = new Uint8Array(N);   // parity of #distinct prime factors
const bigOmPar = new Uint8Array(N);   // parity of #prime factors with multiplicity
for (let p = 2; p < N; p++) {
  if (composite[p]) continue;
  for (let m = p; m < N; m += p) omegaPar[m] ^= 1;
  for (let pk = p; pk < N; pk *= p) {
    for (let m = pk; m < N; m += pk) bigOmPar[m] ^= 1;
    if (pk > (N - 1) / p) break;
  }
}

const squarefree = new Uint8Array(N).fill(1);
squarefree[0] = 0;
for (let p = 2; p * p < N; p++) {
  if (composite[p]) continue;
  const q = p * p;
  for (let m = q; m < N; m += q) squarefree[m] = 0;
}

/** parity of ord_p(t) */
function ordParity(p) {
  const a = new Uint8Array(N);
  for (let pk = p; pk < N; pk *= p) {
    for (let m = pk; m < N; m += pk) a[m] ^= 1;
    if (pk > (N - 1) / p) break;
  }
  return a;
}
const ordPar = { 2: ordParity(2), 3: ordParity(3), 5: ordParity(5), 7: ordParity(7) };

// self-tests against values computable by hand
{
  const check = (name, got, want) => {
    if (got !== want) throw new Error(`sieve self-test ${name}: got ${got}, want ${want}`);
  };
  check('omega(12)=2 even', omegaPar[12], 0);            // 12 = 2^2 * 3
  check('Omega(12)=3 odd', bigOmPar[12], 1);
  check('omega(30)=3 odd', omegaPar[30], 1);             // 30 = 2*3*5
  check('Omega(30)=3 odd', bigOmPar[30], 1);
  check('sqfree(12)=0', squarefree[12], 0);
  check('sqfree(30)=1', squarefree[30], 1);
  check('ord_2(24)=3 odd', ordPar[2][24], 1);            // 24 = 2^3 * 3
  check('ord_3(54)=3 odd', ordPar[3][54], 1);            // 54 = 2 * 3^3
  check('ord_3(36)=2 even', ordPar[3][36], 0);
  check('ord_5(7)=0 even', ordPar[5][7], 0);
  console.log(`sieve self-test passed  [${clock()}]`);
}

// ---------------------------------------------------------------------------
// the four (five) sequences under test
// ---------------------------------------------------------------------------

const coin1 = coinBits(N, 0x9e3779b9);
const coin2 = coinBits(N, 0x85ebca6b);

const thueMorse = new Uint8Array(N);
for (let i = 1; i < N; i++) thueMorse[i] = thueMorse[i >> 1] ^ (i & 1);

// A coin whose bit is replaced by ord_2(t) mod 2 with probability eps: a real
// but tiny 2-adic signal, so the reader can see the instrument's threshold
// rather than take it on trust. Both the unspiked coin and the spiked one are
// reported, because the DIFFERENCE is the calibration -- the base coin sits
// wherever chance put it, and eps*sqrt(N) is the shift on top of that.
const spikeBase = coinBits(N, 0xc2b2ae35);
const spike = Uint8Array.from(spikeBase);
let spikeReplacements = 0;
{
  const u = coinFloats(N, 0x27d4eb2f);
  for (let t = 1; t < N; t++) {
    if (u[t] < SPIKE_EPS) {
      spike[t] = ordPar[2][t];
      spikeReplacements++;
    }
  }
}

const SEQS = [
  ['rule30', column],
  ['coin1', coin1],
  ['coin2', coin2],
  ['thue-morse', thueMorse],
  ['spike-base', spikeBase],
  [`spike(${SPIKE_EPS})`, spike],
];

// ---------------------------------------------------------------------------
// 1. density on residue classes t = r mod q, q = 2..64
// ---------------------------------------------------------------------------

/** number of t in [T0, T1] with t = r (mod q) */
const classSize = (q, r) => Math.floor((T1 - r) / q) + (r === 0 ? 0 : 1);

function densityScan(bits) {
  let best = { stat: -1, q: 0, r: 0, n: 0, dens: 0 };
  for (let q = 2; q <= QMAX; q++) {
    const ones = new Float64Array(q);
    let r = T0 % q;
    for (let t = T0; t <= T1; t++) {
      ones[r] += bits[t];
      if (++r === q) r = 0;
    }
    let tot = 0;
    for (let rr = 0; rr < q; rr++) {
      const n = classSize(q, rr);
      tot += n;
      const dens = ones[rr] / n;
      const stat = Math.abs(dens - 0.5) * Math.sqrt(n);
      if (stat > best.stat) best = { stat, q, r: rr, n, dens };
    }
    if (tot !== COUNT) throw new Error(`class sizes for q=${q} sum to ${tot}, not ${COUNT}`);
  }
  return best;
}

console.log(`\n=== 1. density of the sequence on t = r (mod q), q = 2..${QMAX} ===`);
console.log(`measured over t = ${T0} .. ${T1} (${COUNT} terms), ${(QMAX * (QMAX + 1)) / 2 - 1} classes in total`);
console.log(`statistic: max over (q,r) of |density - 1/2| * sqrt(#class).`);
console.log(`a coin gives sd 1/2 per class, so the max of ~2079 of them lands near`);
console.log(`0.5*sqrt(2 ln 2079) = ${(0.5 * Math.sqrt(2 * Math.log(2079))).toFixed(2)}.\n`);
console.log(`${'sequence'.padEnd(14)} ${'max stat'.padStart(9)}  argmax (q,r)   #class    density`);
for (const [label, bits] of SEQS) {
  const b = densityScan(bits);
  console.log(
    `${label.padEnd(14)} ${b.stat.toFixed(3).padStart(9)}  ` +
    `q=${String(b.q).padStart(2)} r=${String(b.r).padStart(2)}  ` +
    `${String(b.n).padStart(8)}  ${b.dens.toFixed(6)}`,
  );
}
console.log(`[${clock()}]`);

// ---------------------------------------------------------------------------
// 2 & 3. correlation of a(t) = (-1)^c(t) with arithmetic functions of t
// ---------------------------------------------------------------------------

const GS = [
  ['(-1)^omega', (t) => 1 - 2 * omegaPar[t], null],
  ['lambda', (t) => 1 - 2 * bigOmPar[t], null],
  ['mu | sqfree', (t) => 1 - 2 * omegaPar[t], (t) => squarefree[t] === 1],
  ['(-1)^ord_2', (t) => 1 - 2 * ordPar[2][t], null],
  ['(-1)^ord_3', (t) => 1 - 2 * ordPar[3][t], null],
  ['(-1)^ord_5', (t) => 1 - 2 * ordPar[5][t], null],
  ['(-1)^ord_7', (t) => 1 - 2 * ordPar[7][t], null],
];

// subsets: 0 all t, 1 odd t, 2..4 ord_2(t) = 1,2,3
const SUBSETS = ['all t', 'odd t', 'ord_2=1', 'ord_2=2', 'ord_2=3'];
const S = SUBSETS.length;
const G = GS.length;
const Q = SEQS.length;

const sums = new Float64Array(Q * G * S);
const counts = new Float64Array(G * S);
const gVal = new Int32Array(G);
const inSup = new Uint8Array(G);

for (let t = T0; t <= T1; t++) {
  const v2 = t & 1 ? 0 : 31 - Math.clz32(t & -t);
  const sub2 = t & 1 ? 1 : v2 <= 3 ? v2 + 1 : -1;
  for (let g = 0; g < G; g++) {
    const [, fn, sup] = GS[g];
    inSup[g] = sup === null || sup(t) ? 1 : 0;
    if (inSup[g]) gVal[g] = fn(t);
  }
  for (let g = 0; g < G; g++) {
    if (!inSup[g]) continue;
    counts[g * S] += 1;
    if (sub2 >= 0) counts[g * S + sub2] += 1;
  }
  for (let q = 0; q < Q; q++) {
    const a = 1 - 2 * SEQS[q][1][t];
    const base = q * G * S;
    for (let g = 0; g < G; g++) {
      if (!inSup[g]) continue;
      const p = a * gVal[g];
      sums[base + g * S] += p;
      if (sub2 >= 0) sums[base + g * S + sub2] += p;
    }
  }
}

console.log(`\n=== 2 & 3. correlation of a(t) = (-1)^c(t) with g(t) ===`);
console.log(`statistic: (sum_{t in subset} a(t) g(t)) / sqrt(#subset)  -- a coin gives N(0,1).`);
console.log(`"mu | sqfree" is mu(t) summed over squarefree t only, hence its smaller denominator.`);
console.log(`subsets partition-wise: "all t" is t = ${T0}..${T1}; "odd t" removes the 2-adic channel;`);
console.log(`"ord_2=k" is t with exactly k factors of 2.\n`);

for (let s = 0; s < S; s++) {
  console.log(`--- subset: ${SUBSETS[s]} ---`);
  console.log(
    `${'g(t)'.padEnd(12)} ${'#terms'.padStart(9)}` +
    SEQS.map(([l]) => l.padStart(13)).join(''),
  );
  for (let g = 0; g < G; g++) {
    const n = counts[g * S + s];
    const cells = SEQS.map((_, q) =>
      (n > 0 ? (sums[q * G * S + g * S + s] / Math.sqrt(n)).toFixed(3) : 'n/a').padStart(13),
    );
    console.log(`${GS[g][0].padEnd(12)} ${String(n).padStart(9)}${cells.join('')}`);
  }
  console.log('');
}

{
  const idxBase = SEQS.findIndex(([l]) => l === 'spike-base');
  const idxSpike = SEQS.findIndex(([l]) => l.startsWith('spike('));
  const gOrd2 = GS.findIndex(([l]) => l === '(-1)^ord_2');
  const n = counts[gOrd2 * S];
  const b = sums[idxBase * G * S + gOrd2 * S] / Math.sqrt(n);
  const sp = sums[idxSpike * G * S + gOrd2 * S] / Math.sqrt(n);
  console.log(
    `=== does the instrument have power? ===\n` +
    `Thue-Morse is a strong control at the prime 3, not at 2: read its ` +
    `(-1)^ord_3 row\nand its q=3 density. Its (-1)^ord_2 correlation is ` +
    `genuinely ~0 -- the Thue-Morse\npartial sums over {ord_2(t) = k} are ` +
    `bounded -- so it demonstrates nothing at 2.\n\n` +
    `The spike does. ${spikeReplacements} of ${COUNT} bits (${(
      (spikeReplacements / COUNT) * 100
    ).toFixed(4)}%) were replaced by ord_2(t) mod 2:\n` +
    `  spike-base   (-1)^ord_2, all t: ${b.toFixed(3)}\n` +
    `  spike        (-1)^ord_2, all t: ${sp.toFixed(3)}\n` +
    `  shift        ${(sp - b).toFixed(3)}   predicted eps*sqrt(N) = ${(
      SPIKE_EPS * Math.sqrt(COUNT)
    ).toFixed(3)}\n` +
    `So a 2-adic signal present in one bit in a thousand is visible at ~3 sigma.\n` +
    `Note spike-base itself: an honest coin can sit at ${b.toFixed(
      2,
    )}, which is why the\nthreshold for calling anything real here is 4, not 2.`,
  );
}
console.log(`\n[${clock()}]`);
