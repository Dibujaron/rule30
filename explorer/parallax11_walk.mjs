// Parallax, 2026-09-12.  The self-driving walk in G = <q0,q1,q2>.
//
//   s_t = E^t|_{delta|_t},   s_{t+1} = u_t . (s_t|_{delta_t}),
//   u_t in {q0,q1,q2} read off (cell(t,1), cell(t,0)).
//
// What this script settles:
//   A. the step law: u_t = q0|_{ab} with a = cell(t,1), b = cell(t,0).
//   B. AUTONOMY.  Is u_t a function of s_t alone?  Equivalently: in the
//      minimal transducer of E^t, does every state have only one incoming
//      letter?  If not, the walk needs one bit of its environment per step,
//      and the bit is column 1.
//   C. the step sequence u is EQUIVALENT to the pair (column 0, column -1):
//      u determines both, and both determine u.
//   D. step frequencies of the self-driving walk, against the stationary law
//      of the section chain driven by uniform coins.
//
// Controls: the picture is rebuilt two ways (packed BigInt rows, and the
// transducer's own action on the all-white ray) and compared.

// ---------------- transducer library (mine; cross-checked in E) ----------
function elt(n, perm, d, root = 0) { return { n, perm: Uint8Array.from(perm), d: Int32Array.from(d), root }; }
const ID = elt(1, [0], [0, 0]);

function canon(g) {
  // reachable part, then Moore minimisation, then a canonical BFS relabelling
  const seen = new Map(); const order = [];
  const stack = [g.root];
  while (stack.length) { const s = stack.pop(); if (seen.has(s)) continue; seen.set(s, order.length); order.push(s); stack.push(g.d[2 * s], g.d[2 * s + 1]); }
  const m = order.length;
  const perm = new Uint8Array(m), d = new Int32Array(2 * m);
  for (let i = 0; i < m; i++) { const s = order[i]; perm[i] = g.perm[s]; d[2 * i] = seen.get(g.d[2 * s]); d[2 * i + 1] = seen.get(g.d[2 * s + 1]); }
  let cls = Array.from(perm);
  for (;;) {
    const key = new Map(); const next = new Array(m);
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
function mul(g, h) {   // (g.h)(w) = g(h(w))
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
function apply(g, w) { let s = g.root; const out = []; for (const x of w) { out.push(x ^ g.perm[s]); s = g.d[2 * s + x]; } return out; }
function sectionAtWord(g, w) { let s = g.root; for (const x of w) { const y = x; s = g.d[2 * s + y]; } return canon(elt(g.n, g.perm, g.d, s)); }

const AUT = elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0);   // q0=(q0,q2), q1=s(q0,q2), q2=s(q1,q2)
const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));
const Q = [q0, q1, q2], QN = ['q0', 'q1', 'q2'];

// ---------------- the picture (packed rows) ----------------
const TMAX = 400;
const rows = [1n];
for (let t = 1; t <= TMAX + 4; t++) { const r = rows[t - 1]; rows.push((4n * r) ^ ((2n * r) | r)); }
const bit = (x, k) => (k < 0 ? 0 : Number((x >> BigInt(k)) & 1n));
const cell = (t, x) => bit(rows[t], x + t);

// ---------------- A. the step law ----------------
console.log('=== A. the step law  u_t = q0|_{cell(t,1) cell(t,0)} ===');
{
  // read the automaton directly: from ANY state, reading a,b lands where?
  const land = (a, b) => {
    const res = new Set();
    for (const st of [0, 1, 2]) { let s = st; s = AUT.d[2 * s + a]; s = AUT.d[2 * s + b]; res.add(s); }
    return [...res];
  };
  for (const a of [0, 1]) for (const b of [0, 1]) {
    const L = land(a, b);
    console.log(`   read (${a},${b}) from all three states -> {${L.map(i => QN[i]).join(',')}}${L.length === 1 ? '' : '   *** not a reset ***'}`);
  }
}

// ---------------- B. autonomy: does s_t determine cell(t,1)? ----------------
console.log('\n=== B. autonomy.  in the minimal transducer of E^t, does each state have a unique incoming letter? ===');
{
  let g = ID;
  for (let t = 1; t <= 16; t++) {
    g = mul(q0, g);
    const inLetters = Array.from({ length: g.n }, () => new Set());
    for (let s = 0; s < g.n; s++) for (const x of [0, 1]) inLetters[g.d[2 * s + x]].add(x);
    const both = inLetters.filter(S => S.size === 2).length;
    // and the sharper question: restricted to the actual level-t vertices
    if (t <= 16) {
      const byState = new Map();           // state -> set of last letters of length-t words reaching it
      // BFS over words of length t, tracking (state, lastLetter)
      let front = new Map([[g.root + ':-', [g.root, -1]]]);
      for (let i = 0; i < t; i++) {
        const nf = new Map();
        for (const [, [s]] of front) for (const x of [0, 1]) { const s2 = g.d[2 * s + x]; nf.set(s2 + ':' + x, [s2, x]); }
        front = nf;
      }
      for (const [, [s, x]] of front) { if (!byState.has(s)) byState.set(s, new Set()); byState.get(s).add(x); }
      const ambig = [...byState.values()].filter(S => S.size === 2).length;
      console.log(`   t=${t}: |E^t| = ${g.n} states; states with both in-letters (whole transducer) = ${both}; reached at level ${t} by both letters = ${ambig} of ${byState.size}`);
    }
  }
}

// ---------------- C. u  <-->  (column 0, column -1) ----------------
console.log('\n=== C. the step sequence u is equivalent to the pair (column 0, column -1) ===');
{
  const T = 200000;
  // rebuild columns 0, 1, -1 from the packed engine at depth T using a wide row
  // (cheap: run the BigInt row map T steps and read three bits per row)
  let r = 1n, badF = 0, badB = 0, n = 0;
  const u = new Uint8Array(T), c0 = new Uint8Array(T), cm1 = new Uint8Array(T), c1 = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c0[t] = Number((r >> BigInt(t)) & 1n);
    c1[t] = Number((r >> BigInt(t + 1)) & 1n);
    cm1[t] = t === 0 ? 0 : Number((r >> BigInt(t - 1)) & 1n);
    u[t] = c0[t] === 1 ? 2 : (c1[t] === 1 ? 1 : 0);
    r = (4n * r) ^ ((2n * r) | r);
  }
  // forward: does u determine (c0, c-1)?   c0 = [u==q2];  c-1(t) = c0(t+1) xor (c0(t) or c1(t))
  for (let t = 0; t + 1 < T; t++) {
    n++;
    const c0t = u[t] === 2 ? 1 : 0;
    if (c0t !== c0[t]) badF++;
    // c1 at white times of c0 is recoverable: u==q1 <-> c1=1
    const c1known = u[t] === 2 ? null : (u[t] === 1 ? 1 : 0);
    const pred = c0[t + 1] ^ ((c0t | (c1known === null ? 1 : c1known)) & 1);
    // when c0(t)=1 the OR is 1 whatever c1 is, so the formula needs no c1 there
    if (pred !== cm1[t]) badB++;
  }
  console.log(`   u determines column 0            : ${badF} failures over ${n}`);
  console.log(`   u determines column -1           : ${badB} failures over ${n}`);
  // backward: (c0, c-1) determines u?   at black times of c0, u=q2; at white times,
  // c1(t) = c0(t+1) xor c-1(t)  (since c0(t)=0 makes the OR equal c1)
  let badU = 0;
  for (let t = 0; t + 1 < T; t++) {
    let uu;
    if (c0[t] === 1) uu = 2; else uu = ((c0[t + 1] ^ cm1[t]) === 1) ? 1 : 0;
    if (uu !== u[t]) badU++;
  }
  console.log(`   (column 0, column -1) determines u: ${badU} failures over ${T - 1}`);

  // ---------------- D. step frequencies ----------------
  const cnt = [0, 0, 0];
  for (let t = 0; t < T; t++) cnt[u[t]]++;
  console.log(`\n=== D. step frequencies of the self-driving walk, T = ${T} ===`);
  console.log(`   q0: ${(cnt[0] / T).toFixed(6)}   q1: ${(cnt[1] / T).toFixed(6)}   q2: ${(cnt[2] / T).toFixed(6)}`);
  console.log(`   stationary law of the section chain under uniform coins: q0 1/4, q1 1/4, q2 1/2`);
  // control: coin-driven letters
  let rng = 88172645463325252n;
  const coin = () => { rng ^= rng << 13n; rng &= 0xFFFFFFFFFFFFFFFFn; rng ^= rng >> 7n; rng ^= rng << 17n; rng &= 0xFFFFFFFFFFFFFFFFn; return Number(rng & 1n); };
  const cc = [0, 0, 0];
  let st = 0;
  for (let t = 0; t < T; t++) { const a = coin(), b = coin(); let s = st; s = AUT.d[2 * s + a]; s = AUT.d[2 * s + b]; cc[s]++; st = s; }
  console.log(`   coin control:  q0: ${(cc[0] / T).toFixed(6)}   q1: ${(cc[1] / T).toFixed(6)}   q2: ${(cc[2] / T).toFixed(6)}`);
}

// ---------------- E. the walk itself, and the two controls ----------------
console.log('\n=== E. the walk s_t, verified against the picture ===');
{
  let s = ID; let badChi = 0, badLeft = 0, cells = 0, badRec = 0;
  const sizes = [];
  for (let t = 0; t <= 60; t++) {
    if (chi(s) !== cell(t, 0)) badChi++;
    const J = Math.min(t, 30);
    const out = apply(s, new Array(J + 1).fill(0));
    for (let j = 0; j <= J; j++) { cells++; if (out[j] !== cell(t, -j)) badLeft++; }
    sizes.push(s.n);
    const u = cell(t, 0) === 1 ? q2 : (cell(t, 1) === 1 ? q1 : q0);
    const next = mul(u, section(s, t === 0 ? 1 : 0));
    if (t <= 12) {   // rebuild E^{t+1}|_{delta|_{t+1}} from scratch
      let g = ID; for (let i = 0; i <= t; i++) g = mul(q0, g);
      const v = []; for (let i = 0; i <= t; i++) v.push(i === 0 ? 1 : 0);
      if (key(sectionAtWord(g, v)) !== key(next)) badRec++;
    }
    s = next;
  }
  console.log(`   chi(s_t) = centerColumn t : ${badChi} failures over 61 rows`);
  console.log(`   s_t(0^inf) = left half of row t : ${badLeft} failures over ${cells} cells`);
  console.log(`   recursion vs rebuilt section (t <= 12) : ${badRec} failures`);
  console.log(`   |s_t| (transducer states), t=0..24: ${sizes.slice(0, 25).join(' ')}`);
}
