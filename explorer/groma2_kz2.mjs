// Groma, 2026-09-13. The Kamae-Zamboni ladder at UNBOUNDED span, which is the
// only version the KZ theorem is about, plus the cone search run against it.
//
// KZ rung n: "some n-element window of positions sees at least 2n patterns".
// The conjunction over all n is EXACTLY aperiodicity (Kamae-Zamboni), and each
// rung is strictly weaker than the board's occurrence rung n ("the contiguous
// n-window sees all 2^n"), because 2n <= 2^n and the window may be spread out.
//
// The board's criterion (obstruction "The cone sees exactly the zero-entropy
// targets"): the cone bounds the longest rung-failing block at every cone
// distance a exactly when the rung-failing language has growth rate lambda = 1.
//
// [A] |L_n(m)| = # binary words of length m in which EVERY n-window inside the
//     word sees fewer than 2n patterns. Exact, by DFS with incremental masks.
//     Two independent counters: the DFS, and brute force over all 2^m words.
// [B] the cone search in the board's own class A2(a), by the two-diagonal
//     incremental evolution, with occurrence rung 1 as the control that must
//     reproduce the board's f(1,a) = a + 2.

// ---------- the rung predicate, incrementally ----------
// State: for every window W = {0 = d_1 < ... < d_n} with d_n <= i, the bitmask of
// patterns already seen. A window is keyed by its lookback tuple. Rather than
// enumerating windows up front (their number grows with the word), the state is a
// Map from a packed window key to a mask; a window first appears when its span
// first fits.

function makeRung(n, TARGET, maxLen) {
  // windows with span <= maxLen-1
  const W = [];
  const rec = (pref, next) => {
    if (pref.length === n) { W.push(pref.slice()); return; }
    for (let d = next; d <= maxLen - 1; d++) { pref.push(d); rec(pref, d + 1); pref.pop(); }
  };
  if (n === 1) W.push([0]); else rec([0], 1);
  const nw = W.length;
  const span = new Int32Array(nw);
  const look = [];
  for (let q = 0; q < nw; q++) {
    span[q] = W[q][n - 1];
    look.push(Int32Array.from(W[q].map((d) => W[q][n - 1] - d)));
  }
  // index windows by span so a step touches only the ones that can fire
  const bySpan = [];
  for (let s = 0; s < maxLen; s++) bySpan.push([]);
  for (let q = 0; q < nw; q++) bySpan[span[q]].push(q);
  const pc = new Uint8Array(1 << (1 << n));
  for (let i = 1; i < pc.length; i++) pc[i] = pc[i >> 1] + (i & 1);
  return { nw, span, look, bySpan, pc, n, TARGET, maxLen };
}

// hist[0..i] valid; masks is Uint32Array(nw). Returns false if the word now
// SATISFIES the rung (some window at >= TARGET patterns), true otherwise, and
// mutates masks in place. `undo` records the windows touched so the caller can
// roll back.
function rungStep(R, hist, i, masks, undo) {
  undo.length = 0;
  for (let s = 0; s <= i; s++) {
    const list = R.bySpan[s];
    for (let z = 0; z < list.length; z++) {
      const q = list[z];
      const lk = R.look[q];
      let code = 0;
      for (let r = 0; r < R.n; r++) code = (code << 1) | hist[i - lk[r]];
      const bit = 1 << code;
      const old = masks[q];
      if (old & bit) continue;
      const m = old | bit;
      if (R.pc[m] >= R.TARGET) { return false; }
      masks[q] = m;
      undo.push(q, old);
    }
  }
  return true;
}
function rungUndo(masks, undo) {
  for (let z = undo.length - 2; z >= 0; z -= 2) masks[undo[z]] = undo[z + 1];
}

function langCounts(n, TARGET, maxLen) {
  const R = makeRung(n, TARGET, maxLen);
  const counts = new Array(maxLen + 1).fill(0);
  const hist = new Uint8Array(maxLen + 2);
  const masks = new Uint32Array(R.nw);
  const stack = [];
  function rec(i) {
    counts[i]++;
    if (i === maxLen) return;
    for (const b of [0, 1]) {
      hist[i] = b;
      const undo = [];
      if (rungStep(R, hist, i, masks, undo)) { rec(i + 1); }
      rungUndo(masks, undo);
    }
  }
  rec(0);
  return counts;
}

// brute-force cross-check, no shared code with the DFS
function langBrute(n, TARGET, m) {
  const wins = [];
  const rec = (pref, next) => {
    if (pref.length === n) { wins.push(pref.slice()); return; }
    for (let d = next; d < m; d++) { pref.push(d); rec(pref, d + 1); pref.pop(); }
  };
  if (n === 1) wins.push([0]); else rec([0], 1);
  let cnt = 0;
  const w = new Uint8Array(m);
  for (let v = 0; v < (1 << m); v++) {
    for (let i = 0; i < m; i++) w[i] = (v >> i) & 1;
    let ok = true;
    for (const win of wins) {
      const span = win[n - 1];
      const seen = new Set();
      for (let p = 0; p + span < m; p++) {
        let code = 0;
        for (const d of win) code = (code << 1) | w[p + d];
        seen.add(code);
      }
      if (seen.size >= TARGET) { ok = false; break; }
    }
    if (ok) cnt++;
  }
  return cnt;
}

console.log('[cross-check] DFS count against brute force over all 2^m words');
for (const [n, T] of [[2, 4], [3, 6], [4, 8]]) {
  for (const m of [10, 14, 16]) {
    const d = langCounts(n, T, m)[m];
    const b = langBrute(n, T, m);
    console.log(`  n=${n} target=${T} m=${m}:  DFS ${String(d).padStart(7)}   brute ${String(b).padStart(7)}   ${d === b ? 'MATCH' : '*** MISMATCH ***'}`);
  }
}

console.log('\n[A] |L_n(m)| = # words of length m in which EVERY n-window inside the word');
console.log('    sees < 2n patterns, i.e. the words that FAIL KZ rung n. Unbounded span.');
console.log('    Growth rate 1 is the board\'s criterion for "the cone can see this target".');
for (const [n, T] of [[2, 4], [3, 6], [4, 8], [5, 10]]) {
  const M = n <= 3 ? 34 : 30;
  const c = langCounts(n, T, M);
  const tail = [];
  for (let m = M - 8; m <= M; m++) tail.push(`${m}:${c[m]}`);
  const lam = c[M] / c[M - 1];
  // polynomial degree estimate: log(c(M)/c(M/2)) / log 2
  const deg = Math.log(c[M] / c[M >> 1]) / Math.log(2);
  console.log(`  n=${n}, target ${T}, up to m=${M}`);
  console.log(`    ${tail.join('  ')}`);
  console.log(`    lambda = c(${M})/c(${M - 1}) = ${lam.toFixed(5)}    apparent polynomial degree log2(c(M)/c(M/2)) = ${deg.toFixed(3)}`);
}

// ---------- [B] the cone search ----------
// Class A2(a): row 0 white at every x < -a, black at x = -a, free at x > -a.
// Incremental evolution by two anti-diagonals. With row 0 known on [-a, K]:
//   B[t] = cell(t, K - t),   C[t] = cell(t, K - 1 - t)
// are determined, and appending the row-0 cell at x = K+1 gives
//   B'[0] = that cell,  B'[t] = C[t-1] XOR ( B[t-1] OR B'[t-1] ),  C' = B.
// The centre cell at time K is B[K].

function initDiagonals(a, leftBits, L) {
  // leftBits[0..a] are the row-0 cells at x = -a .. 0 (leftBits[0] = 1)
  const pad = L + 3;
  const W = pad + a + 1 + pad;
  let row = new Uint8Array(W);
  for (let i = 0; i <= a; i++) row[pad + i] = leftBits[i];
  const origin = pad + a;
  const B = new Uint8Array(L + 2), C = new Uint8Array(L + 2);
  for (let t = 0; t <= L + 1; t++) {
    // cell(t, -t) and cell(t, -1-t): both determined by row 0 on x <= 0
    B[t] = origin - t >= 0 ? row[origin - t] : 0;
    C[t] = origin - t - 1 >= 0 ? row[origin - t - 1] : 0;
    const nxt = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) nxt[i] = (row[i - 1] ^ (row[i] | row[i + 1])) & 1;
    row = nxt;
  }
  return { B, C };
}

function coneSearch(n, TARGET, a, LMAX, CAP) {
  const R = makeRung(n, TARGET, LMAX + 1);
  // level K = 0
  let cur = [];
  for (let v = 0; v < (1 << a); v++) {
    const left = new Uint8Array(a + 1);
    left[0] = 1;
    for (let i = 0; i < a; i++) left[1 + i] = (v >> i) & 1;
    const { B, C } = initDiagonals(a, left, LMAX + 2);
    const hist = new Uint8Array(LMAX + 2);
    hist[0] = B[0];
    const masks = new Uint32Array(R.nw);
    const undo = [];
    if (rungStep(R, hist, 0, masks, undo)) cur.push({ B, C, hist, masks });
  }
  let best = cur.length ? 1 : 0, capped = false;
  for (let K = 0; K < LMAX; K++) {
    const next = [];
    for (const s of cur) {
      for (const b of [0, 1]) {
        const Bn = new Uint8Array(s.B.length), Cn = s.B;
        Bn[0] = b;
        for (let t = 1; t < s.B.length; t++) Bn[t] = (s.C[t - 1] ^ (s.B[t - 1] | Bn[t - 1])) & 1;
        const hist = Uint8Array.from(s.hist);
        hist[K + 1] = Bn[K + 1];
        const masks = Uint32Array.from(s.masks);
        const undo = [];
        if (rungStep(R, hist, K + 1, masks, undo)) next.push({ B: Bn, C: Cn, hist, masks });
      }
    }
    if (next.length === 0) return { f: best, capped: false };
    best = K + 2;
    if (next.length > CAP) { capped = true; return { f: best, capped }; }
    cur = next;
  }
  return { f: best, capped: true };
}

console.log('\n[B] the cone search in class A2(a): f = the longest centre-column prefix,');
console.log('    over configurations white at x < -a and black at x = -a, that FAILS the rung.');
console.log('    Finite at every a implies the rung for the seed, since row N of the seed is in A2(N).');
const LMAX = 60, CAP = 400000;
for (const [n, T, name] of [
  [1, 2, 'occurrence rung 1 = KZ rung 1 (both colours)   [board: PROVED, f = a+2]'],
  [2, 4, 'KZ rung 2 (some lag sees all four pairs)'],
  [3, 6, 'KZ rung 3 (some 3-window sees 6 patterns)'],
  [4, 8, 'KZ rung 4 (some 4-window sees 8 patterns)'],
  [5, 10, 'KZ rung 5 (some 5-window sees 10 patterns)'],
]) {
  const row = [];
  for (let a = 1; a <= 10; a++) {
    const r = coneSearch(n, T, a, LMAX, CAP);
    row.push(`${a}:${r.f}${r.capped ? '*' : ''}`);
    if (r.capped) break;
  }
  console.log(`  ${name}\n      f(a) = ${row.join(' ')}     (* = cap, so a lower bound)`);
}
