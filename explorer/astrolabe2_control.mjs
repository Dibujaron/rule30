// Astrolabe, 2026-09-13. The brief's control premise, checked rather than inherited:
// "linear rules 90 and 150 have polylog-computable columns".
//
// The mechanism, if it holds, is automaticity: a sequence is 2-AUTOMATIC iff its
// 2-kernel -- the set of subsequences t |-> a(2^k t + r) for 0 <= r < 2^k -- is
// FINITE, and a 2-automatic sequence's n-th term is computed by a DFA reading the
// binary digits of n, i.e. in O(log n) time. So: compute the centre column of each
// rule from the single seed, form the 2-kernel to depth k, and count distinct
// members. A finite count that stops growing is automaticity (to the depth tested);
// a count that keeps doubling is not.
//
// Rule 30 is the control on the control: this board's crystal 73 excludes a
// 2-automatic centre column by measurement, so rule 30's kernel count must grow.

// T = 2^13, not 2^18: the naive double-buffer costs T * (2T) cell updates, so 2^18
// is 1.4e11 operations and does not finish. 2^13 gives a kernel to depth 5 compared
// on 256 terms, which is enough to separate a closed kernel from a growing one.
const T = 1 << 13;

function table(r) { const t = new Uint8Array(8); for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1; return t; }

function centreColumn(rule, T) {
  const tab = table(rule);
  const W = 2 * T + 3, off = T + 1;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[off] = 1;
  const out = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    out[t] = cur[off];
    const lo = Math.max(1, off - t - 1), hi = Math.min(W - 2, off + t + 1);
    for (let i = lo; i <= hi; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    for (let i = lo; i <= hi; i++) { cur[i] = nxt[i]; }
    cur[lo - 1] = cur[lo - 1] | 0;
    // recompute the two edge cells that the window clipped
    const tmp = 0; void tmp;
  }
  return out;
}

// The above in-place update is error-prone; use a clean double-buffer instead.
function centreColumn2(rule, T) {
  const tab = table(rule);
  const W = 2 * T + 5, off = T + 2;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[off] = 1;
  const out = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    out[t] = cur[off];
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return out;
}

// distinct members of the 2-kernel, comparing subsequences on a common prefix
function kernelCounts(seq, maxK, cmpLen) {
  const counts = [];
  const seen = new Set();
  for (let k = 0; k <= maxK; k++) {
    const p = 1 << k;
    for (let r = 0; r < p; r++) {
      const key = [];
      for (let i = 0; i < cmpLen; i++) {
        const idx = p * i + r;
        if (idx >= seq.length) break;
        key.push(seq[idx]);
      }
      if (key.length === cmpLen) seen.add(key.join(''));
    }
    counts.push(seen.size);
  }
  return counts;
}

console.log(`# centre column of each rule from the single seed, T = ${T}`);
console.log('# 2-kernel: cumulative distinct subsequences a(2^k t + r), compared on 256 terms');
console.log('# rule   k=0  k=1  k=2  k=3  k=4  k=5   verdict');
for (const rule of [90, 150, 60, 240, 30, 45]) {
  const seq = centreColumn2(rule, T);
  const c = kernelCounts(seq, 5, 256);
  const flat = c[5] === c[4] && c[4] === c[3];
  console.log(`${String(rule).padStart(5)}  ${c.map(x => String(x).padStart(4)).join(' ')}   ${flat ? 'kernel closed -> 2-automatic (to this depth) -> O(log n)' : 'kernel still growing'}`);
}
console.log('');
console.log('# first 24 terms, as a sanity print');
for (const rule of [90, 150, 30]) {
  console.log(`   rule ${String(rule).padStart(3)}: ${Array.from(centreColumn2(rule, 24)).join('')}`);
}
console.log('');
console.log('# rule 90: is the centre column eventually white (crystal 66)?');
{
  const seq = centreColumn2(90, 1 << 12);
  let last = -1;
  for (let t = 0; t < seq.length; t++) if (seq[t]) last = t;
  console.log(`   last black at t = ${last} out of ${seq.length}`);
}
console.log('# rule 150: black density and longest white run');
{
  const seq = centreColumn2(150, 1 << 12);
  let ones = 0, run = 0, best = 0;
  for (const b of seq) { ones += b; if (b) run = 0; else { run++; if (run > best) best = run; } }
  console.log(`   density ${(ones / seq.length).toFixed(6)}, longest white run ${best}`);
}
