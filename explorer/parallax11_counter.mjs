// Parallax, 2026-09-12.  The counterfactual walk, and the positive monoid.
//
// A. POSITIVE MONOID.  Is <q0,q1,q2>^+ free?  If so a walk s_t IS its own
//    step word and the group adds nothing.
// B. COUNTERFACTUAL.  Crystal 40 supplies configurations X_b whose centre
//    column IS eventually periodic.  Run the self-driving walk on them.
//    b = (10)^inf is obstruction 9's witness: c has period 2 and no other
//    column is eventually periodic.  So its walk has a PERIODIC label
//    sequence and (by Jen-free reasoning: column -1 aperiodic) an APERIODIC
//    step sequence.  Measure both, and compare every group statistic with
//    the seed's.
// C. the seed's own step sequence: factor complexity, for contrast.

function elt(n, perm, d, root = 0) { return { n, perm: Uint8Array.from(perm), d: Int32Array.from(d), root }; }
const ID = elt(1, [0], [0, 0]);
function canon(g) {
  const seen = new Map(); const order = []; const stack = [g.root];
  while (stack.length) { const s = stack.pop(); if (seen.has(s)) continue; seen.set(s, order.length); order.push(s); stack.push(g.d[2 * s], g.d[2 * s + 1]); }
  const m = order.length;
  const perm = new Uint8Array(m), d = new Int32Array(2 * m);
  for (let i = 0; i < m; i++) { const s = order[i]; perm[i] = g.perm[s]; d[2 * i] = seen.get(g.d[2 * s]); d[2 * i + 1] = seen.get(g.d[2 * s + 1]); }
  let cls = new Int32Array(m); for (let i = 0; i < m; i++) cls[i] = perm[i];
  for (;;) {
    const key = new Map(); const next = new Int32Array(m);
    for (let i = 0; i < m; i++) { const k = cls[i] + ',' + cls[d[2 * i]] + ',' + cls[d[2 * i + 1]]; if (!key.has(k)) key.set(k, key.size); next[i] = key.get(k); }
    let same = true; for (let i = 0; i < m; i++) if (next[i] !== cls[i]) { same = false; break; }
    cls = next; if (same) break;
  }
  const map = new Map(); const q = [cls[0]]; map.set(cls[0], 0);
  const rep = new Map(); for (let i = 0; i < m; i++) if (!rep.has(cls[i])) rep.set(cls[i], i);
  const P = [], D = [];
  for (let h = 0; h < q.length; h++) {
    const c = q[h], i = rep.get(c); P.push(perm[i]);
    for (const x of [0, 1]) { const c2 = cls[d[2 * i + x]]; if (!map.has(c2)) { map.set(c2, q.length); q.push(c2); } D.push(map.get(c2)); }
  }
  return elt(q.length, P, D, 0);
}
const key = g => g.n + '|' + Array.from(g.perm).join('') + '|' + Array.from(g.d).join(',');
function mul(g, h) {
  const idx = new Map(); const order = [];
  function id(s, t) { const k = s * h.n + t; if (!idx.has(k)) { idx.set(k, order.length); order.push([s, t]); } return idx.get(k); }
  id(g.root, h.root);
  const perm = [], d = [];
  for (let i = 0; i < order.length; i++) {
    const [s, t] = order[i]; perm.push(g.perm[s] ^ h.perm[t]);
    for (const x of [0, 1]) { const y = x ^ h.perm[t]; d.push(id(g.d[2 * s + y], h.d[2 * t + x])); }
  }
  return canon(elt(order.length, perm, d, 0));
}
const section = (g, x) => canon(elt(g.n, g.perm, g.d, g.d[2 * g.root + x]));
const chi = g => g.perm[g.root];
const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));
const GEN = [q0, q1, q2];

// ---------------- A. is the positive monoid free? ----------------
console.log('=== A. distinct products of t POSITIVE generators (exact, by minimal transducer) ===');
{
  let cur = new Map([[key(ID), ID]]);
  for (let t = 1; t <= 8; t++) {
    const nx = new Map();
    for (const g of cur.values()) for (const a of GEN) { const h = mul(g, a); nx.set(key(h), h); }
    cur = nx;
    console.log(`   t=${t}: ${cur.size} distinct   (3^${t} = ${3 ** t})   ${cur.size === 3 ** t ? 'free so far' : '*** relation ***'}`);
    if (cur.size > 40000) break;
  }
}
console.log('=== A2. the same, separated only by the ACTION ON LEVEL 14 (a weaker test, so a lower bound) ===');
{
  // represent a positive word by its permutation of the 2^14 level-14 vertices
  const L = 14, N = 1 << L;
  // generator action on level L: read bits low-to-high (bit k = letter k)
  const permOf = st => {
    const p = new Int32Array(N);
    for (let v = 0; v < N; v++) {
      let s = st, y = 0;
      for (let k = 0; k < L; k++) { const x = (v >> k) & 1; if (x ^ AUTP[s]) y |= 1 << k; s = AUTD[2 * s + x]; }
      p[v] = y;
    }
    return p;
  };
  const AUTP = [0, 1, 1], AUTD = [0, 2, 0, 2, 1, 2];
  const gp = [permOf(0), permOf(1), permOf(2)];
  const compose = (p, q) => { const r = new Int32Array(N); for (let i = 0; i < N; i++) r[i] = p[q[i]]; return r; };
  const hash = p => { let h = 2166136261 >>> 0; for (let i = 0; i < N; i++) { h ^= p[i]; h = Math.imul(h, 16777619) >>> 0; } return h; };
  let cur = [new Int32Array(N).map((_, i) => i)];
  for (let t = 1; t <= 11; t++) {
    const nx = []; const seen = new Set();
    for (const p of cur) for (const a of gp) { const r = compose(a, p); const h = hash(r); if (!seen.has(h)) { seen.add(h); nx.push(r); } }
    cur = nx;
    console.log(`   t=${t}: ${cur.size} distinct actions on level ${L}   (3^${t} = ${3 ** t})   ${cur.size === 3 ** t ? 'free so far' : '*** collapse ***'}`);
    if (cur.size > 200000) break;
  }
}

// ---------------- the half-line engine for X_b ----------------
// X_b: white at every x >= 1 at time 0, centre column b (crystal 40).
// y[k] = cell(t, k+1).  Also carry column -1 via the sideways solve:
//   col(-1)(t) = c(t+1) xor (c(t) or col1(t))
function stepsOf(bfun, T) {
  const W = T + 4;
  let y = new Uint8Array(W);
  const u = new Uint8Array(T), c = new Uint8Array(T), cm1 = new Uint8Array(T);
  const c1 = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    const cv = bfun(t);
    c[t] = cv; c1[t] = y[0];
    u[t] = cv === 1 ? 2 : (y[0] === 1 ? 1 : 0);
    const ny = new Uint8Array(W);
    ny[0] = cv ^ (y[0] | y[1]);
    for (let k = 1; k < W - 1; k++) ny[k] = y[k - 1] ^ (y[k] | y[k + 1]);
    y = ny;
  }
  for (let t = 0; t + 1 < T; t++) cm1[t] = c[t + 1] ^ ((c[t] | c1[t]) & 1);
  return { u, c, cm1, c1 };
}
const factors = (arr, L, from, to) => { const s = new Set(); for (let i = from; i + L <= to; i++) s.add(Array.from(arr.slice(i, i + L)).join('')); return s.size; };

// seed's centre column from the packed row map
const T = 20000;
{
  let r = 1n; const cs = new Uint8Array(T);
  for (let t = 0; t < T; t++) { cs[t] = Number((r >> BigInt(t)) & 1n); r = (4n * r) ^ ((2n * r) | r); }
  const seed = stepsOf(t => cs[t], T);
  console.log('\n=== B. the seed, and the counterfactuals from crystal 40 ===');
  const report = (name, R, T) => {
    const n = [0, 0, 0]; for (let t = 0; t < T; t++) n[R.u[t]]++;
    console.log(`   ${name}`);
    console.log(`      step freqs  q0 ${(n[0] / T).toFixed(5)}  q1 ${(n[1] / T).toFixed(5)}  q2 ${(n[2] / T).toFixed(5)}`);
    console.log(`      labels  c: distinct factors of length 16 in the tail = ${factors(R.c, 16, T >> 1, T)}`);
    console.log(`      steps   u: distinct factors of length 16 in the tail = ${factors(R.u, 16, T >> 1, T - 1)}   (max 3^16)`);
    console.log(`      col -1   : distinct factors of length 16 in the tail = ${factors(R.cm1, 16, T >> 1, T - 1)}`);
  };
  report('seed (single black cell)', seed, T);
  const cases = [
    ['b = 1^inf            (label sequence constant 1)', t => 1],
    ['b = (10)^inf         (label period 2; obstruction 9 witness)', t => 1 - (t & 1)],
    ['b = (1000)^inf       (label period 4)', t => (t % 4 === 0 ? 1 : 0)],
    ['b = (11010)^inf      (label period 5)', t => [1, 1, 0, 1, 0][t % 5]],
  ];
  for (const [nm, f] of cases) report(nm, stepsOf(f, T), T);
}

// ---------------- C. group statistics on the counterfactual ----------------
console.log('\n=== C. group statistics: seed vs a configuration whose centre column IS periodic ===');
{
  const TT = 20;
  const runWalk = (R, firstSec) => {
    let s = ID; const sizes = [], labels = [];
    for (let t = 0; t < TT; t++) {
      s = mul(GEN[R.u[t]], section(s, t === 0 ? firstSec : 0));
      sizes.push(s.n); labels.push(chi(s));
      if (s.n > 3000000) break;
    }
    return { sizes, labels };
  };
  let r = 1n; const cs = new Uint8Array(TT + 2);
  for (let t = 0; t < TT + 2; t++) { cs[t] = Number((r >> BigInt(t)) & 1n); r = (4n * r) ^ ((2n * r) | r); }
  const A = runWalk(stepsOf(t => cs[t], TT + 2), 1);
  console.log(`   seed          |s_t|: ${A.sizes.join(' ')}`);
  for (const [nm, f, fs] of [['b=(10)^inf ', t => 1 - (t & 1), 1], ['b=1^inf    ', t => 1, 1], ['b=(1000)^inf', t => (t % 4 === 0 ? 1 : 0), 1]]) {
    const B = runWalk(stepsOf(f, TT + 2), fs);
    console.log(`   ${nm}  |s_t|: ${B.sizes.join(' ')}`);
  }
}
