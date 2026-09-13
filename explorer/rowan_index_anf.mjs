/**
 * Rowan, 2026-09-13. Is the centre column a low-degree Boolean function of the
 * binary digits of its index?
 *
 * Read c(t) for t < 2^m as a Boolean function of the m bits of t, take its
 * algebraic normal form (the Mobius transform over F_2 of the truth table) and
 * measure the degree, the monomial counts near the top degree, and the Walsh-
 * Hadamard maximum. A degree bounded well below m is what a coding-theory route
 * to Prize 2 (balance) would need: by Ax / McEliece, a function in RM(d, m) has
 * weight divisible by 2^(ceil(m/d) - 1), so a small enough d makes a small
 * nonzero density excess arithmetically impossible. The last section spells that
 * out, and says why Carlitz-Uchiyama — the theorem usually reached for here — is
 * not a statement about ANF degree at all.
 *
 * Every number is printed beside two coin-flip nulls of the same length, and
 * beside the closed-form expectation for a uniformly random Boolean function,
 * because "the degree is m" is worth nothing until you know that a coin also
 * gives m. Nothing here proves anything; see explorer/README.md.
 *
 * The column comes from explorer/talus7_center10m.bin (10^7 terms, produced by
 * talus7_deep.mjs), which caps m at 23. The file is checked here twice before
 * use: against A051023's 41-term prefix, and term by term against this repo's
 * BigInt engine over the first 2^16 terms.
 *
 *   node explorer/rowan_index_anf.mjs
 */

import { readFileSync } from 'node:fs';
import { centerColumnBits, A051023_PREFIX } from './rule30.mjs';

const M_MIN = 8;
const M_MAX = 23;                 // 2^23 = 8,388,608 <= 10^7 cached terms
const SHIFT_MS = [16, 20];        // shifts are tested at these m
const SHIFTS = [1, 2, 3];
const NULL_SEEDS = [0x9e3779b9, 0x85ebca6b];

// ---------------------------------------------------------------------------
// the sequences
// ---------------------------------------------------------------------------

const column = new Uint8Array(
  readFileSync(new URL('./talus7_center10m.bin', import.meta.url)),
);

/** mulberry32 — a decent 32-bit PRNG; all 32 bits of each draw are used. */
function coin(n, seed) {
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

// ---------------------------------------------------------------------------
// the transforms
// ---------------------------------------------------------------------------

/**
 * Mobius transform over F_2, in place: turns a truth table into its ANF.
 * Afterwards a[S] is the coefficient of the monomial prod_{i in S} x_i, where
 * S is read as the bitmask of the index.
 */
function mobius(a) {
  const n = a.length;
  for (let len = 1; len < n; len <<= 1) {
    for (let i = 0; i < n; i += len << 1) {
      for (let j = 0; j < len; j++) a[i + len + j] ^= a[i + j];
    }
  }
  return a;
}

/** Walsh-Hadamard transform of (-1)^f, in place. */
function walsh(w) {
  const n = w.length;
  for (let len = 1; len < n; len <<= 1) {
    for (let i = 0; i < n; i += len << 1) {
      for (let j = 0; j < len; j++) {
        const u = w[i + j];
        const v = w[i + len + j];
        w[i + j] = u + v;
        w[i + len + j] = u - v;
      }
    }
  }
  return w;
}

const POP16 = new Uint8Array(1 << 16);
for (let i = 1; i < POP16.length; i++) POP16[i] = POP16[i >> 1] + (i & 1);
const popcount = (i) => POP16[i & 0xffff] + POP16[i >>> 16];

/**
 * Everything measured about one truth table of length 2^m.
 * `f` is consumed (both transforms run over copies of it).
 */
function measure(f, m) {
  const n = f.length;

  const anf = mobius(Uint8Array.from(f));
  const byDeg = new Float64Array(m + 1);
  let deg = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    if (anf[i]) {
      const d = popcount(i);
      byDeg[d]++;
      total++;
      if (d > deg) deg = d;
    }
  }

  const w = new Int32Array(n);
  for (let i = 0; i < n; i++) w[i] = 1 - 2 * f[i];
  walsh(w);
  let maxAll = 0;
  let maxNz = 0;
  for (let i = 0; i < n; i++) {
    const v = Math.abs(w[i]);
    if (v > maxAll) maxAll = v;
    if (i !== 0 && v > maxNz) maxNz = v;
  }

  let ones = 0;
  for (let i = 0; i < n; i++) ones += f[i];

  return {
    deg,
    total,
    top: byDeg[m],
    top1: byDeg[m - 1],
    top2: byDeg[m - 2],
    maxAll,
    maxNz,
    ones,
  };
}

// ---------------------------------------------------------------------------
// self-test: the transforms, on functions whose answers are known by hand
// ---------------------------------------------------------------------------

{
  const m = 12;
  const n = 1 << m;

  // Thue-Morse, t -> popcount(t) mod 2: ANF is x_0 + ... + x_{m-1}, so degree
  // 1 with exactly m monomials, and it is affine, so max |W| is the full 2^m.
  const tm = new Uint8Array(n);
  for (let i = 1; i < n; i++) tm[i] = tm[i >> 1] ^ (i & 1);
  const rtm = measure(tm, m);
  if (rtm.deg !== 1 || rtm.total !== m || rtm.maxAll !== n) {
    throw new Error(`self-test failed on Thue-Morse: ${JSON.stringify(rtm)}`);
  }

  // A single monomial x_0 x_1 x_2: degree 3, one monomial, weight 2^(m-3).
  const mono = new Uint8Array(n);
  for (let i = 0; i < n; i++) mono[i] = (i & 7) === 7 ? 1 : 0;
  const rmo = measure(mono, m);
  if (rmo.deg !== 3 || rmo.total !== 1 || rmo.ones !== n >> 3) {
    throw new Error(`self-test failed on a monomial: ${JSON.stringify(rmo)}`);
  }
  console.log('self-test passed: Thue-Morse (degree 1) and x_0x_1x_2 (degree 3)');
}

// ---------------------------------------------------------------------------
// checks on the cached column
// ---------------------------------------------------------------------------

for (let i = 0; i < A051023_PREFIX.length; i++) {
  if (column[i] !== A051023_PREFIX[i]) {
    throw new Error(`cache disagrees with A051023 at t=${i}`);
  }
}
{
  const CHECK = 1 << 16;
  const fresh = centerColumnBits(CHECK);
  for (let i = 0; i < CHECK; i++) {
    if (column[i] !== fresh[i]) {
      throw new Error(`cache disagrees with the BigInt engine at t=${i}`);
    }
  }
  console.log(`cache checked: A051023 prefix + ${CHECK} terms vs the BigInt engine`);
}

// ---------------------------------------------------------------------------
// the main sweep
// ---------------------------------------------------------------------------

const nulls = NULL_SEEDS.map((s) => coin(1 << M_MAX, s));

/**
 * Two structured controls, so a maximal degree cannot be dismissed as "this
 * statistic says m for everything". Both are aperiodic automatic sequences
 * whose ANF in the index bits is known in closed form:
 *   Thue-Morse    t -> sum_i x_i             degree 1
 *   Rudin-Shapiro t -> sum_i x_i x_{i+1}     degree 2
 * If the centre column had any comparable digit structure, this is where it
 * would show.
 */
const structured = (() => {
  const n = 1 << M_MAX;
  const tm = new Uint8Array(n);
  const rs = new Uint8Array(n);
  for (let i = 1; i < n; i++) {
    tm[i] = tm[i >> 1] ^ (i & 1);
    rs[i] = (i & 1) && (i & 2) ? rs[i >> 1] ^ 1 : rs[i >> 1];
  }
  return [['thue-mors', tm], ['rudin-sh', rs]];
})();

const choose2 = (m) => (m * (m - 1)) / 2;
/** max |W| for a uniformly random function: 2^(m/2) sqrt(2 m ln 2), roughly. */
const wNull = (m) => 2 ** (m / 2) * Math.sqrt(2 * m * Math.LN2);

const row = (label, r, m) =>
  `${label.padEnd(9)} deg=${String(r.deg).padStart(2)}  ` +
  `mon(m)=${r.top}/1  mon(m-1)=${String(r.top1).padStart(2)}/${m}  ` +
  `mon(m-2)=${String(r.top2).padStart(3)}/${choose2(m)}  ` +
  `total=${String(r.total).padStart(9)} (${((r.total / 2 ** m) * 100).toFixed(2)}%)  ` +
  `max|W|=${String(r.maxAll).padStart(7)}  max|W|_{a!=0}=${String(r.maxNz).padStart(7)}  ` +
  `ones=${r.ones}`;

console.log('\n=== c(t), t in [0, 2^m) — ANF degree, monomials, nonlinearity ===');
console.log(`(mon(d)/K: monomials of degree d out of the K that exist at that degree;`);
console.log(` a random function sets each of the 2^m coefficients with probability 1/2)\n`);

const results = [];
for (let m = M_MIN; m <= M_MAX; m++) {
  const n = 1 << m;
  const r = measure(column.subarray(0, n), m);
  results.push({ m, ...r });
  console.log(`m=${m}  n=2^${m}=${n}`);
  console.log(row('rule30', r, m));
  for (let k = 0; k < nulls.length; k++) {
    console.log(row(`coin${k + 1}`, measure(nulls[k].subarray(0, n), m), m));
  }
  for (const [label, seq] of structured) {
    console.log(row(label, measure(seq.subarray(0, n), m), m));
  }
  console.log(
    `${''.padEnd(9)} random-function expectation: deg=m w.p. 1/2, ` +
    `total~=${n / 2}, max|W| ~ ${wNull(m).toFixed(0)}`,
  );
  console.log('');
}

// ---------------------------------------------------------------------------
// shifted reads: c(t + s)
// ---------------------------------------------------------------------------

console.log('=== c(t + s), t in [0, 2^m) — a low-degree structure could be offset ===\n');
for (const m of SHIFT_MS) {
  const n = 1 << m;
  for (const s of SHIFTS) {
    console.log(row(`s=${s} m=${m}`, measure(column.subarray(s, s + n), m), m));
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// the Carlitz-Uchiyama / Reed-Muller reading
// ---------------------------------------------------------------------------

console.log('=== what a degree-d bound would have bought ===');
console.log([
  'Carlitz-Uchiyama is NOT a bound on RM(d, m). It bounds the weights of the',
  'dual of the t-error-correcting BCH code — the trace functions Tr(f(x)) with',
  'deg f <= 2t-1 over GF(2^m) — by |2*wt - 2^m| <= (t-1) 2^(m/2+1). Its',
  'parameter is the polynomial degree over GF(2^m), and ANF degree is only the',
  'binary weight of the exponent, so a small ANF degree implies no CU bound at',
  'all. RM(d, m) on its own admits no balance bound in either direction: the',
  'single monomial x_1...x_d has weight 2^(m-d), as unbalanced as it gets.',
  '',
  'The theorem that a low ANF degree does buy is Ax / McEliece divisibility:',
  'every f in RM(d, m) has weight divisible by 2^(ceil(m/d) - 1), so the excess',
  'E = 2*wt - 2^m is divisible by 2^ceil(m/d). A measured E with 0 < |E| <',
  '2^ceil(m/d) would then be a contradiction, forcing exact balance. Below:',
  'the divisibility the MEASURED degree yields, and the degree that would have',
  'been needed to force E = 0 at this m.',
  '',
].join('\n'));
for (const r of results) {
  const n = 1 << r.m;
  const excess = Math.abs(2 * r.ones - n);
  const k = Math.ceil(r.m / r.deg);           // E divisible by 2^k
  let need = 0;                                // largest d forcing E = 0
  for (let d = 1; d <= r.m; d++) {
    if (2 ** Math.ceil(r.m / d) > excess) need = d;
  }
  console.log(
    `m=${String(r.m).padStart(2)}  d=${String(r.deg).padStart(2)}  ` +
    `E=${String(excess).padStart(6)}  ` +
    `Ax/McEliece: E divisible by 2^${k}=${2 ** k}  ` +
    `(bites only if it exceeds |E|: ${2 ** k > excess})  ` +
    `degree needed to force E=0: d <= ${need}`,
  );
}
