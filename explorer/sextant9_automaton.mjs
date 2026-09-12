// Sextant, 2026-09-12. Topic: the 4^-t constraint.
//
// C3: L_t = { w : the configuration ...0 w 0... is row t of some FINITE
// configuration } is a REGULAR language, recognised reading the word
// RIGHT TO LEFT by the t-level backward solve carried as state.
//
// State.  Write y_0 = w and y_k for the k-th backward level, so
//   y_k(i-1) = y_{k-1}(i) XOR (y_k(i) OR y_k(i+1)).
// Level k lags the input by k cells, so the state after reading position p is
// the pair (a_k, b_k) = (y_k(p-k), y_k(p-k+1)) for k = 1..t: 2t bits, 4^t
// states.  Reading the next input bit e (at position p-1):
//   a_0' = e;   a_k' = a_{k-1}' XOR (a_k | b_k);   b_k' = a_k.
// Accept iff feeding white for ever returns every level to white -- which,
// since a nonzero pair under white input goes to all-black and never back,
// is decidable by iterating the zero transition.
//
// This file measures the MINIMAL number of states, which is the honest answer
// to "how complicated is the reachable set", and cross-checks the automaton
// against the independent backward-solve decision procedure of
// sextant9_criterion.mjs and against brute-force enumeration.

const T_MAX = 9;

function makeAutomaton(t) {
  const S = 1 << (2 * t);                 // state = bits a_1,b_1,a_2,b_2,...
  const A = (s, k) => (s >> (2 * (k - 1))) & 1;
  const B = (s, k) => (s >> (2 * (k - 1) + 1)) & 1;
  function next(s, e) {
    let out = 0, aPrev = e;
    for (let k = 1; k <= t; k++) {
      const a = A(s, k), b = B(s, k);
      const aNew = aPrev ^ (a | b);
      out |= aNew << (2 * (k - 1));
      out |= a << (2 * (k - 1) + 1);
      aPrev = aNew;
    }
    return out;
  }
  const delta = [new Int32Array(S), new Int32Array(S)];
  for (let s = 0; s < S; s++) { delta[0][s] = next(s, 0); delta[1][s] = next(s, 1); }
  // accepting: feeding 0 for ever reaches state 0
  const acc = new Uint8Array(S);
  for (let s = 0; s < S; s++) {
    let q = s;
    for (let i = 0; i <= 2 * t + 4; i++) { if (q === 0) break; q = delta[0][q]; }
    acc[s] = q === 0 ? 1 : 0;
  }
  return { S, delta, acc, start: 0 };
}

// reachable-state trim, then Moore minimisation
function minimise(m) {
  const { S, delta, acc, start } = m;
  const seen = new Uint8Array(S), order = [];
  const stack = [start]; seen[start] = 1;
  while (stack.length) {
    const s = stack.pop(); order.push(s);
    for (const e of [0, 1]) { const q = delta[e][s]; if (!seen[q]) { seen[q] = 1; stack.push(q); } }
  }
  const idx = new Int32Array(S).fill(-1);
  order.forEach((s, i) => { idx[s] = i; });
  const R = order.length;
  const d = [new Int32Array(R), new Int32Array(R)];
  const f = new Uint8Array(R);
  for (let i = 0; i < R; i++) {
    f[i] = acc[order[i]];
    d[0][i] = idx[delta[0][order[i]]];
    d[1][i] = idx[delta[1][order[i]]];
  }
  let cls = Int32Array.from(f);
  let nCls = new Set(cls).size;
  for (;;) {
    const sig = new Map();
    const nc = new Int32Array(R);
    for (let i = 0; i < R; i++) {
      const k = cls[i] + ',' + cls[d[0][i]] + ',' + cls[d[1][i]];
      if (!sig.has(k)) sig.set(k, sig.size);
      nc[i] = sig.get(k);
    }
    if (sig.size === nCls) break;
    cls = nc; nCls = sig.size;
  }
  return { reachable: R, minimal: nCls };
}

// independent decision procedure (backward solve, trimmed) for cross-check
function backOne(y) {
  const n = y.length;
  const lo = -2;
  const x = new Int8Array(n + 2);
  const get = (p) => (p >= n - 1 || p < lo) ? 0 : x[p - lo];
  const set = (p, v) => { if (p >= lo && p < n - 1) x[p - lo] = v; };
  for (let i = n - 1; i >= -1; i--) {
    const yi = (i >= 0 && i < n) ? (y.charCodeAt(i) - 48) : 0;
    set(i - 1, yi ^ (get(i) | get(i + 1)));
  }
  if (get(-1) !== 0 || get(-2) !== 0) return { ok: false };
  let s = '';
  for (let p = 0; p <= n - 2; p++) s += get(p);
  let a = 0, b = s.length - 1;
  while (a <= b && s[a] === '0') a++;
  while (b >= a && s[b] === '0') b--;
  return { ok: true, word: a > b ? '' : s.slice(a, b + 1) };
}
function reachableSolve(w, t) {
  let cur = w.replace(/^0+/, '').replace(/0+$/, '');
  for (let s = 0; s < t; s++) {
    if (cur === '') return false;
    const r = backOne(cur);
    if (!r.ok) return false;
    cur = r.word;
  }
  return cur !== '';
}
function acceptsDFA(m, w) {          // read right to left
  let s = m.start;
  for (let i = w.length - 1; i >= 0; i--) s = m.delta[w.charCodeAt(i) - 48][s];
  return m.acc[s] === 1;
}

console.log('t   4^t      reachable   minimal    (states of the right-to-left DFA for L_t)');
const mins = [];
for (let t = 1; t <= T_MAX; t++) {
  const m = makeAutomaton(t);
  const r = minimise(m);
  mins.push(r.minimal);
  console.log(`${String(t).padStart(1)}   ${String(1 << (2 * t)).padStart(7)}  ${String(r.reachable).padStart(9)}  ${String(r.minimal).padStart(8)}`);
}
console.log('ratios minimal(t+1)/minimal(t):', mins.slice(1).map((v, i) => (v / mins[i]).toFixed(4)).join(' '));

// cross-check: DFA vs backward solve, exhaustively over all words of length n
console.log('\ncross-check DFA vs the independent backward solve:');
for (let t = 1; t <= 6; t++) {
  const m = makeAutomaton(t);
  const n = 2 * t + 8;
  let bad = 0, total = 0, acceptCount = 0;
  for (let code = 0; code < (1 << n); code++) {
    let w = '';
    for (let j = 0; j < n; j++) w += (code >> j) & 1;
    const a = acceptsDFA(m, w), b = reachableSolve(w, t);
    total++; if (a) acceptCount++;
    if (a !== b) bad++;
  }
  console.log(`  t=${t}, all ${total} words of length ${n}: ${bad} disagreements, ${acceptCount} accepted`);
}

// cross-check: DFA counts vs brute-force enumeration of configurations
function step(row) {
  const n = row.length;
  const out = new Uint8Array(n + 2);
  const get = (k) => (k < 0 || k >= n) ? 0 : row[k];
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return out;
}
console.log('\ncross-check DFA vs brute-force enumeration of finite configurations:');
for (let t = 1; t <= 5; t++) {
  const m = makeAutomaton(t);
  for (const span of [2 * t + 3, 2 * t + 6]) {
    // truth: all rows of span exactly `span` at depth t
    const mm = span - 2 * t;
    const truth = new Set();
    const hi = mm === 1 ? 1 : (1 << (mm - 2));
    for (let mid = 0; mid < hi; mid++) {
      const c = new Uint8Array(mm); c[0] = 1; c[mm - 1] = 1;
      for (let j = 1; j < mm - 1; j++) c[j] = (mid >> (j - 1)) & 1;
      let r = c; for (let s = 0; s < t; s++) r = step(r);
      truth.add(Array.from(r).join(''));
    }
    let dfaCount = 0;
    for (let code = 0; code < (1 << (span - 2)); code++) {
      let w = '1';
      for (let j = 0; j < span - 2; j++) w += (code >> j) & 1;
      w += '1';
      if (acceptsDFA(m, w)) dfaCount++;
    }
    const ok = dfaCount === truth.size ? 'OK' : 'MISMATCH';
    console.log(`  t=${t}, span=${span}: brute force ${truth.size}, DFA ${dfaCount}, predicted 2^(${span}-2*${t}-2)=${mm >= 2 ? (1 << (mm - 2)) : 1}  ${ok}`);
  }
}
