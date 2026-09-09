/**
 * Parallax, session 4 — the census of aperiodicity proofs.
 *
 * For each family of aperiodicity proof in print, measure whether rule 30's
 * centre column has the structure that proof needs. Every measurement is run
 * on four controls beside the column: Thue-Morse (substitutive, aperiodic),
 * Rudin-Shapiro (automatic, aperiodic, sqrt discrepancy), a genuinely periodic
 * word, and a xorshift PRNG (the "no structure at all" null).
 *
 * Nothing here proves anything.
 */

import { centerColumnBits } from './rule30.mjs';

const N = Number(process.env.PARALLAX_N ?? 200000);

// --------------------------------------------------------------------------
// the sequences
// --------------------------------------------------------------------------

function thueMorse(n) {
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) a[i] = a[i >> 1] ^ (i & 1);
  return a;
}

function rudinShapiro(n) {
  // number of (possibly overlapping) '11' pairs in the binary expansion, mod 2
  const a = new Uint8Array(n);
  for (let i = 1; i < n; i++) {
    a[i] = (i & 1 && i & 2) ? a[i >> 1] ^ 1 : a[i >> 1];
  }
  return a;
}

function periodicWord(n, word) {
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i++) a[i] = word[i % word.length];
  return a;
}

function xorshift(n, seed = 0x2f4b7c1) {
  const a = new Uint8Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    a[i] = s & 1;
  }
  return a;
}

// --------------------------------------------------------------------------
// 1. the Pi-0-2 witness function
//
// "not eventually periodic" is  for all p>0, for all N, exists n>=N with
// c(n+p) != c(n).  A constructive proof supplies a bound B(p,N) on how far
// past N you must look. Measure the true value of that witness.
// --------------------------------------------------------------------------

function witness(a, maxP, onsets) {
  let worst = 0, worstAt = null;
  let total = 0, count = 0;
  for (let p = 1; p <= maxP; p++) {
    for (const Nn of onsets) {
      let d = -1;
      for (let n = Nn; n + p < a.length; n++) {
        if (a[n + p] !== a[n]) { d = n - Nn; break; }
      }
      if (d < 0) return { unbounded: true, p, onset: Nn };
      total += d; count++;
      if (d > worst) { worst = d; worstAt = { p, onset: Nn }; }
    }
  }
  return { worst, worstAt, mean: total / count };
}

// --------------------------------------------------------------------------
// 2. discrepancy.  eventually periodic  =>  D(n) = (s/p)*n + O(1).
//    so "D(n) - alpha*n unbounded for every alpha" implies aperiodic.
// --------------------------------------------------------------------------

function discrepancy(a) {
  let d = 0, maxAbs = 0, argmax = 0;
  const marks = [];
  const checkpoints = new Set([1e3, 1e4, 1e5, 2e5, 3e5, 4e5, 5e5, 1e6, 2e6].map(Number));
  for (let i = 0; i < a.length; i++) {
    d += a[i] ? -1 : 1;
    if (Math.abs(d) > maxAbs) { maxAbs = Math.abs(d); argmax = i + 1; }
    if (checkpoints.has(i + 1)) marks.push([i + 1, d, (d / Math.sqrt(i + 1)).toFixed(3)]);
  }
  return { final: d, maxAbs, argmax, marks, ratio: maxAbs / Math.sqrt(a.length) };
}

// --------------------------------------------------------------------------
// 3. repetitions.  a proof by power-avoidance needs the sequence to contain
//    no k-th power for some k. find the largest power that occurs.
// --------------------------------------------------------------------------

function maxRepetition(a, maxQ, limit) {
  const n = Math.min(a.length, limit);
  let best = { exponent: 0, q: 0, len: 0, at: 0 };
  for (let q = 1; q <= maxQ; q++) {
    let run = 0;
    for (let i = q; i < n; i++) {
      if (a[i] === a[i - q]) {
        run++;
        const len = run + q;              // maximal factor with period q
        const e = len / q;
        if (e > best.exponent) best = { exponent: e, q, len, at: i - run - q + 1 };
      } else run = 0;
    }
  }
  return best;
}

// --------------------------------------------------------------------------
// 4. factor complexity.  Morse-Hedlund: aperiodic iff p(n) >= n+1 for all n.
// --------------------------------------------------------------------------

function complexity(a, maxN, limit) {
  const n = Math.min(a.length, limit);
  const out = [];
  for (let m = 1; m <= maxN; m++) {
    const seen = new Set();
    let w = 0;
    const mask = (1 << m) - 1;
    for (let i = 0; i < n; i++) {
      w = ((w << 1) | a[i]) & mask;
      if (i >= m - 1) seen.add(w);
    }
    out.push([m, seen.size]);
    if (seen.size === (1 << m) && m > 4) { /* still maximal */ }
  }
  return out;
}

// --------------------------------------------------------------------------
// 5. gaps and density.  a proof by "density 0 but infinitely many ones", or
//    by "unbounded gaps", needs one of those two.
// --------------------------------------------------------------------------

function gaps(a) {
  let last = -1, maxGap = 0, ones = 0, at = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i]) {
      ones++;
      if (last >= 0 && i - last > maxGap) { maxGap = i - last; at = last; }
      last = i;
    }
  }
  return { density: ones / a.length, maxGap, at };
}

// --------------------------------------------------------------------------

function report(name, a, opts = {}) {
  console.log(`\n=== ${name}  (length ${a.length}) ===`);
  const g = gaps(a);
  console.log(`  density        ${g.density.toFixed(6)}   max gap ${g.maxGap} (at ${g.at})`);
  const d = discrepancy(a);
  console.log(`  discrepancy    final ${d.final}  max|D| ${d.maxAbs} at ${d.argmax}  max/sqrt(N) ${d.ratio.toFixed(3)}`);
  console.log(`                 D(n)/sqrt(n) at checkpoints: ${d.marks.map(([n, v, r]) => `${n}:${v}(${r})`).join(' ')}`);
  const r = maxRepetition(a, opts.maxQ ?? 60, opts.repLimit ?? 200000);
  console.log(`  max repetition exponent ${r.exponent.toFixed(3)} (period ${r.q}, length ${r.len}, at ${r.at})`);
  const c = complexity(a, opts.maxN ?? 22, opts.cxLimit ?? 400000);
  console.log(`  complexity     ${c.map(([m, s]) => `${m}:${s}`).join(' ')}`);
  const wmax = opts.maxP ?? 2000;
  const onsets = (opts.onsets ?? [0, 1000, 10000, 100000]).filter(o => o < a.length / 2);
  const w = witness(a, wmax, onsets);
  if (w.unbounded) console.log(`  witness        NO DISAGREEMENT for p=${w.p} onset=${w.onset} within the prefix (periodic here)`);
  else console.log(`  witness        worst ${w.worst} at p=${w.worstAt.p} onset=${w.worstAt.onset}; mean ${w.mean.toFixed(3)}  (p<=${wmax}, onsets ${onsets.join(',')})`);
}

console.log(`rule 30 centre column, ${N} terms ...`);
const c30 = centerColumnBits(N);
console.log(`  first 41: ${Array.from(c30.slice(0, 41)).join('')}`);

report('rule 30 centre column', c30);
report('Thue-Morse', thueMorse(N));
report('Rudin-Shapiro', rudinShapiro(N));
report('periodic (01101 repeated)', periodicWord(N, [0, 1, 1, 0, 1]));
report('periodic (0011 repeated, balanced)', periodicWord(N, [0, 0, 1, 1]));
report('xorshift', xorshift(N));
