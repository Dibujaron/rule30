// Groma, 2026-09-13. The Kamae-Zamboni ladder, priced against the board's own
// cone instrument, and the growth-rate criterion that decides whether the cone
// can see it.
//
// Kamae-Zamboni: x is ultimately periodic  <=>  p*_x(k) < 2k for some k, where
// p*_x(k) = sup over k-element windows S of N of the number of patterns x[n+S].
// So "for every n, SOME n-window sees at least 2n patterns" is EQUIVALENT to
// aperiodicity -- a ladder whose conjunction is exactly P1, and whose rungs are
// strictly weaker than the board's occurrence rungs ("the contiguous n-window
// sees all 2^n"), since 2n <= 2^n.
//
// The board's criterion (obstruction "The cone sees exactly the zero-entropy
// targets"): the cone bounds the longest S-avoiding block at every cone distance
// exactly when the S-avoiding language has growth rate lambda_S = 1, because past
// radius a the cone supplies one free bit per row and the surviving population
// grows like lambda_S^k.
//
// [A] lambda for the KZ target: words in which EVERY n-window of span <= D sees
//     fewer than 2n patterns. Counted exactly by DFS with incremental masks.
// [B] the cone search: f(n, D, a) = the longest centre-column prefix, over
//     configurations white at x < -a and black at x = -a (class A2(a), which
//     row N of the seed lies in), that fails KZ rung n at span D.
//     Occurrence rung run beside it as the control that reproduces the board.

const NMAX_LEN = 26;

// ---------- windows {0 = d_1 < d_2 < ... < d_n} with d_n <= D ----------
function windows(n, D) {
  const out = [];
  const rec = (pref, next) => {
    if (pref.length === n) { out.push(pref.slice()); return; }
    for (let d = next; d <= D; d++) { pref.push(d); rec(pref, d + 1); pref.pop(); }
  };
  if (n === 1) return [[0]];
  rec([0], 1);
  return out;
}

// A survivor carries, for each window, the bitmask of patterns already seen.
// Appending a letter at index i completes, for window w = [0,d_2,...,d_n], the
// occurrence starting at i - d_n, provided i >= d_n.
// Pattern code: bit (n-1-r) of the code is the letter at offset d_{r+1}.

function makeStepper(n, D, TARGET) {
  const W = windows(n, D);
  const nw = W.length;
  const span = W.map((w) => w[w.length - 1]);
  const offs = W.map((w) => w.map((d) => w[w.length - 1] - d)); // lookback amounts
  // the mask ranges over subsets of the 2^n patterns, so the table is 2^(2^n)
  // long, not 2^n. (It was 2^n in the first version of this file: popcnt[m] was
  // then undefined for every m >= 2^n, `NaN >= TARGET` is false, and NOTHING was
  // ever pruned -- every row of table [A] came back identical and capped.)
  const popcnt = new Uint8Array(1 << (1 << n));
  for (let i = 1; i < (1 << (1 << n)); i++) popcnt[i] = popcnt[i >> 1] + (i & 1);
  // returns null if the extension now SATISFIES the rung (>= TARGET patterns in
  // some window); otherwise the new mask array.
  return {
    nw,
    step(hist, i, masks) {
      // hist: Uint8Array of letters, hist[0..i] valid
      const out = masks.slice();
      for (let q = 0; q < nw; q++) {
        if (i < span[q]) continue;
        let code = 0;
        const o = offs[q];
        for (let r = 0; r < n; r++) code = (code << 1) | hist[i - o[r]];
        const m = out[q] | (1 << code);
        if (popcnt[m] >= TARGET) return null;
        out[q] = m;
      }
      return out;
    },
    zero() { return new Uint16Array(nw); },
  };
}

// ---------- [A] growth rate of the rung-failing language ----------
function langCounts(n, D, TARGET, maxLen) {
  const S = makeStepper(n, D, TARGET);
  const counts = new Array(maxLen + 1).fill(0);
  const hist = new Uint8Array(maxLen + 2);
  let nodes = 0;
  const CAP = 40e6;
  function rec(i, masks) {
    // hist[0..i-1] fixed and surviving
    if (i > maxLen) return;
    counts[i]++;
    if (++nodes > CAP) throw new Error('cap');
    if (i === maxLen) return;
    for (const b of [0, 1]) {
      hist[i] = b;
      const m2 = S.step(hist, i, masks);
      if (m2 !== null) rec(i + 1, m2);
    }
  }
  try { rec(0, S.zero()); } catch (e) { return { counts, capped: true }; }
  return { counts, capped: false };
}

// control: the instrument must reproduce a number nobody here computed.
// "at lag 1, not all four pairs occur" is the union of four avoid-one-pair
// languages; the two that matter (avoid 00, avoid 11) are Fibonacci, so the
// count at length m is 2*F(m+2) - (overlaps), and lambda must be the golden
// ratio 1.6180..., not 2.
{
  const { counts } = langCounts(2, 1, 4, 24);
  const fib = [1, 1];
  for (let i = 2; i <= 28; i++) fib.push(fib[i - 1] + fib[i - 2]);
  console.log('[control] "lag-1 pairs do not all occur": |L(m)| against 2*F(m+2) - 2*(m+1) + 2');
  for (const m of [8, 12, 16, 20, 24]) {
    const pred = 2 * fib[m + 1] - 2 * (m + 1) + 2;
    console.log(`   m=${String(m).padStart(2)}  |L| = ${String(counts[m]).padStart(8)}   closed form ${String(pred).padStart(8)}   ${counts[m] === pred ? 'MATCH' : 'MISMATCH'}`);
  }
  console.log(`   lambda = ${(counts[24] / counts[23]).toFixed(5)}  (golden ratio 1.61803)\n`);
}

console.log('[A] the KZ-rung-failing language: words in which every n-window of span <= D');
console.log('    sees fewer than 2n patterns. Counted exactly; lambda is the last ratio.');
console.log('    Compare: the board\'s criterion is that the cone sees a target iff lambda = 1.');
console.log('  n   D   2n   |L(20)|      |L(22)|      |L(24)|     lambda (|L(24)|/|L(23)|)');
for (const n of [2, 3, 4]) {
  for (const D of [n - 1, 3, 4, 5, 6, 8]) {
    if (D < n - 1) continue;
    const { counts, capped } = langCounts(n, D, 2 * n, NMAX_LEN);
    const lam = counts[NMAX_LEN - 1] > 0 ? counts[NMAX_LEN] / counts[NMAX_LEN - 1] : 0;
    console.log(`  ${n}  ${String(D).padStart(2)}  ${String(2 * n).padStart(3)}  ${String(counts[20]).padStart(10)}  ${String(counts[22]).padStart(10)}  ${String(counts[24]).padStart(10)}   ${lam.toFixed(5)}${capped ? '  (CAPPED)' : ''}`);
  }
}

console.log('\n[A-control] the same, for the OCCURRENCE rung (target 2^n, contiguous window):');
console.log('  n   D   target   |L(20)|      |L(24)|     lambda');
for (const n of [2, 3, 4]) {
  const { counts, capped } = langCounts(n, n - 1, 1 << n, NMAX_LEN);
  const lam = counts[NMAX_LEN - 1] > 0 ? counts[NMAX_LEN] / counts[NMAX_LEN - 1] : 0;
  console.log(`  ${n}  ${String(n - 1).padStart(2)}  ${String(1 << n).padStart(6)}  ${String(counts[20]).padStart(10)}  ${String(counts[24]).padStart(10)}   ${lam.toFixed(5)}${capped ? '  (CAPPED)' : ''}`);
}

// ---------- the cone search ----------
// Class A2(a): row 0 is white at every x < -a, black at x = -a, free at x > -a.
// Centre cell at time k reads only row-0 cells in [-k, k]; cells < -a are white,
// so centre[0..K] is determined by the window [-a, K].
//
// Survivors are grown by appending one free row-0 cell at a time on the right.
// Because the rung predicate is monotone in the prefix (once some window sees
// 2n patterns, every extension does too), pruning is exact.

function rule30Row(row) {
  const m = row.length;
  const out = new Uint8Array(m);
  for (let i = 0; i < m; i++) {
    const l = i > 0 ? row[i - 1] : 0;
    const c = row[i];
    const r = i + 1 < m ? row[i + 1] : 0;
    out[i] = (l ^ (c | r)) & 1;
  }
  return out;
}

// centre column of the configuration with the given window [-a .. K], white
// outside on the left and white outside on the right (the right padding is
// irrelevant for times <= K by the cone).
function centreOf(window, a, K, L) {
  // pad generously so the cone never reads the edge
  const pad = L + 4;
  const W = pad + (a + K + 1) + pad;
  let row = new Uint8Array(W);
  for (let i = 0; i <= a + K; i++) row[pad + i] = window[i];
  const origin = pad + a; // index of x = 0
  const c = new Uint8Array(L);
  for (let t = 0; t < L; t++) { c[t] = row[origin]; row = rule30Row(row); }
  return c;
}

function coneSearch(n, D, TARGET, a, CAP) {
  const S = makeStepper(n, D, TARGET);
  // level 0: windows over [-a .. 0]; cell -a is black, cells -a+1..0 free
  let survivors = [];
  const base = a + 1; // number of cells in [-a .. 0]
  for (let v = 0; v < (1 << a); v++) {
    const w = new Uint8Array(base);
    w[0] = 1;
    for (let i = 0; i < a; i++) w[1 + i] = (v >> i) & 1;
    survivors.push(w);
  }
  let best = 0, capped = false;
  let K = 0;
  // for each survivor we recompute the centre prefix from scratch (K is small)
  let cur = [];
  for (const w of survivors) {
    const c = centreOf(w, a, 0, 1);
    const hist = new Uint8Array(1); hist[0] = c[0];
    const m = S.step(hist, 0, S.zero());
    if (m !== null) cur.push({ w, c: [c[0]], masks: m });
  }
  if (cur.length) best = 1;
  while (cur.length) {
    K++;
    if (K > 200) { capped = true; break; }
    const next = [];
    for (const s of cur) {
      for (const b of [0, 1]) {
        const w2 = new Uint8Array(s.w.length + 1);
        w2.set(s.w); w2[s.w.length] = b;
        const c = centreOf(w2, a, K, K + 1);
        // prefix must match (it does, by the cone) -- new letter is c[K]
        const hist = Uint8Array.from(c);
        const m2 = S.step(hist, K, s.masks);
        if (m2 !== null) next.push({ w: w2, c: Array.from(c), masks: m2 });
      }
    }
    if (next.length === 0) break;
    if (next.length > CAP) { capped = true; best = K + 1; cur = next; break; }
    cur = next;
    best = K + 1;
  }
  return { f: best, capped, pop: cur.length };
}

console.log('\n[B] the cone search in class A2(a) (white at x < -a, black at x = -a).');
console.log('    f = longest centre-column prefix that FAILS the rung. Finite at every a');
console.log('    would make the rung a theorem about the seed (row N of the seed is in A2(N)).');
const CAP = 300000;
for (const [n, D, TARGET, name] of [
  [1, 0, 2, 'occurrence rung 1 (both colours)  [board: PROVED]'],
  [2, 1, 4, 'occurrence rung 2 (all four pairs) [board: reachable]'],
  [3, 2, 8, 'occurrence rung 3 (all eight triples) [board: REFUTED]'],
  [2, 1, 4, 'KZ rung 2, span 1 (= occurrence rung 2)'],
  [2, 3, 4, 'KZ rung 2, span 3'],
  [2, 6, 4, 'KZ rung 2, span 6'],
  [3, 2, 6, 'KZ rung 3, span 2'],
  [3, 4, 6, 'KZ rung 3, span 4'],
  [3, 6, 6, 'KZ rung 3, span 6'],
  [4, 3, 8, 'KZ rung 4, span 3'],
  [4, 6, 8, 'KZ rung 4, span 6'],
]) {
  const row = [];
  for (let a = 1; a <= 7; a++) {
    const r = coneSearch(n, D, TARGET, a, CAP);
    row.push(`${a}:${r.f}${r.capped ? '*' : ''}`);
    if (r.capped) break;
  }
  console.log(`  ${name.padEnd(52)} f(a) = ${row.join(' ')}   (* = population cap ${CAP}, so a LOWER bound)`);
}
