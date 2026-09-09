// Parallax, 2026-09-09. Is the width-2 trace of rule 30 a g-measure with
// regular g? The Bowen / summable-variation question, measured exactly.
//
// Under the uniform Bernoulli ensemble the CENTRE COLUMN ALONE is exactly a
// fair coin (parallax3_trace.mjs, section A), so its g-function is the constant
// 1/2 and there is nothing to measure. The first non-degenerate object is the
// PAIR of columns (0, 1) -- which is also the object of Kopra's theorem and of
// Jen's sandwich lemma. Its trace measure is NOT uniform: some pair words are
// forbidden outright.
//
// This script computes that measure EXACTLY (no sampling: the pair word of
// length n depends only on the window [-(n-1), n], so enumerating that window
// is the measure), and then measures
//
//     var_k = max | P(next | u) - P(next | u') |   over realisable pasts u, u'
//                                                  agreeing in their last k symbols
//
// which is the variation of the g-function. Summable variation (Walters) gives
// a unique g-measure and Bowen's condition; square-summable variation is the
// sharp threshold (Johansson-Oberg); Bramson-Kalikow show continuity alone is
// not enough. var_k = 0 for some finite k would mean the trace is a Markov
// measure of that order and the whole question is finite.

const NMAX = 13;

const step = (r, mask) => (((r << 1) ^ (r | (r >>> 1))) & mask) >>> 0;

console.log('=== the width-2 trace measure of rule 30 under the uniform ensemble ===');
console.log('n    windows      realisable pair words   / 4^n        growth ratio   entropy (bits/step)');
const wordCounts = [];
let prevCount = null;
for (let n = 1; n <= NMAX; n++) {
  const W = 2 * n;                    // positions -(n-1) .. n
  const mask = ((1 << W) - 1) >>> 0;
  const off0 = n - 1, off1 = n;
  const N = 1 << W;
  const counts = new Int32Array(1 << (2 * n));
  for (let w = 0; w < N; w++) {
    let r = w, word = 0;
    for (let t = 0; t < n; t++) {
      word |= (((r >>> off0) & 1) | (((r >>> off1) & 1) << 1)) << (2 * t);
      r = step(r, mask);
    }
    counts[word]++;
  }
  let distinct = 0;
  for (let v = 0; v < counts.length; v++) if (counts[v] > 0) distinct++;
  console.log(String(n).padEnd(4), String(N).padEnd(12), String(distinct).padEnd(23),
    (distinct / 4 ** n).toFixed(6).padEnd(11),
    (prevCount ? (distinct / prevCount).toFixed(4) : '  -   ').padEnd(14),
    (Math.log2(distinct) / n).toFixed(4));
  prevCount = distinct;
  wordCounts.push(counts);
}

// ---- the g-function's variation, from the deepest table ----
const n = NMAX;
const counts = wordCounts[n - 1];
const m = n - 1;                       // length of the "past"
console.log();
console.log(`=== variation of the g-function, from exact counts at depth ${n} ===`);
console.log('(past = the first m symbols, next = symbol m; "last k symbols" = the k most recent)');

// counts of pasts (length m) obtained by marginalising over symbol m
const pastCount = new Map();
const nextCount = new Map();           // key = past * 4 + a
for (let v = 0; v < counts.length; v++) {
  if (counts[v] === 0) continue;
  const past = v & ((1 << (2 * m)) - 1);
  const a = (v >>> (2 * m)) & 3;
  pastCount.set(past, (pastCount.get(past) || 0) + counts[v]);
  const key = past * 4 + a;
  nextCount.set(key, (nextCount.get(key) || 0) + counts[v]);
}
const pasts = [...pastCount.keys()];
console.log(`realisable pasts of length ${m}: ${pasts.length}`);

console.log('k    groups   var_k = max spread of P(next | past)   (k = symbols of recent past held fixed)');
for (let k = 0; k <= m; k++) {
  const groups = new Map();            // key = last k symbols
  for (const p of pasts) {
    // the "last" k symbols are positions m-k .. m-1, i.e. bits 2(m-k) .. 2m-1
    const key = k === 0 ? 0 : (p >>> (2 * (m - k)));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  let worst = 0;
  for (const list of groups.values()) {
    for (let a = 0; a < 4; a++) {
      let lo = Infinity, hi = -Infinity;
      for (const p of list) {
        const q = (nextCount.get(p * 4 + a) || 0) / pastCount.get(p);
        if (q < lo) lo = q; if (q > hi) hi = q;
      }
      if (hi - lo > worst) worst = hi - lo;
    }
  }
  console.log(String(k).padEnd(4), String(groups.size).padEnd(8), worst.toFixed(8));
}
