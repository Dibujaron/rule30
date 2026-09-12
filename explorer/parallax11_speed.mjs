// Parallax, 2026-09-12.  Speed of the self-driving walk, and the Schreier
// picture.
//
// A. BALL.  BFS in G = <q0,q1,q2> with inverses, canonical minimal
//    transducers as keys.  Sphere sizes = the growth of G.
// B. SPEED.  word length |s_t| of the self-driving walk, exactly, for as many
//    t as the ball reaches.  Controls: i.i.d. steps, and the same walk for
//    other configurations X_b.
// C. SCHREIER.  orbits of <q0> and of G on level n; is G level-transitive?
//    The <q0>-orbit of delta|_n is the cycle whose length is the lcm of the
//    right-diagonal periods; the centre column reads a DIAGONAL of that
//    family of cycles.

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
function inv(g) {
  const perm = Array.from(g.perm), d = new Array(2 * g.n);
  for (let s = 0; s < g.n; s++) for (const y of [0, 1]) d[2 * s + y] = g.d[2 * s + (y ^ g.perm[s])];
  return canon(elt(g.n, perm, d, g.root));
}
const section = (g, x) => canon(elt(g.n, g.perm, g.d, g.d[2 * g.root + x]));
function apply(g, w) { let s = g.root; const out = []; for (const x of w) { out.push(x ^ g.perm[s]); s = g.d[2 * s + x]; } return out; }
const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));
const GEN = [q0, q1, q2];
const GENS = [q0, q1, q2, inv(q0), inv(q1), inv(q2)];

// ---------------- the seed's step sequence ----------------
const TMAX = 30;
let r = 1n; const useed = [], cseed = [];
for (let t = 0; t <= TMAX + 2; t++) {
  const c0 = Number((r >> BigInt(t)) & 1n), c1 = Number((r >> BigInt(t + 1)) & 1n);
  cseed.push(c0); useed.push(c0 === 1 ? 2 : (c1 === 1 ? 1 : 0));
  r = (4n * r) ^ ((2n * r) | r);
}
const walk = (steps, firstSecLetter) => {
  let s = ID; const out = [];
  for (let t = 0; t < steps.length; t++) { s = mul(GEN[steps[t]], section(s, t === 0 ? firstSecLetter : 0)); out.push(s); }
  return out;
};
const seedWalk = walk(useed.slice(0, 12), 1);

// ---------------- A. ball ----------------
console.log('=== A. the ball of G in {q0,q1,q2}^{+-1}, and word lengths of s_t ===');
{
  const RMAX = 8;
  const dist = new Map(); dist.set(key(ID), 0);
  let frontier = [ID];
  const targets = new Map();
  for (let t = 1; t <= 12; t++) targets.set(key(seedWalk[t - 1]), t);
  const found = new Map();
  if (dist.has([...targets.keys()][0])) { }
  console.log(`   sphere sizes:`);
  for (let rr = 1; rr <= RMAX; rr++) {
    const nx = [];
    for (const g of frontier) for (const a of GENS) {
      const h = mul(g, a), k = key(h);
      if (!dist.has(k)) { dist.set(k, rr); nx.push(h); if (targets.has(k)) found.set(targets.get(k), rr); }
    }
    frontier = nx;
    console.log(`     r=${rr}: sphere ${nx.length}, ball ${dist.size}`);
    if (dist.size > 900000) { console.log('     (stopping, ball too large)'); break; }
  }
  const rows = [];
  for (let t = 1; t <= 12; t++) rows.push(`t=${t}: |s_t|_word = ${found.has(t) ? found.get(t) : '> ' + RMAX}`);
  console.log('   ' + rows.join(', '));
  // controls: i.i.d. steps
  let rng = 0x12345678 >>> 0;
  const rnd = () => { rng ^= rng << 13; rng >>>= 0; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0; return rng / 4294967296; };
  for (let trial = 0; trial < 4; trial++) {
    const steps = Array.from({ length: 10 }, () => { const x = rnd(); return x < 0.25 ? 0 : (x < 0.5 ? 1 : 2); });
    const w = walk(steps, 0);
    const ds = w.map((g, i) => { const k = key(g); return dist.has(k) ? dist.get(k) : '>' + RMAX; });
    console.log(`   i.i.d. control steps ${steps.join('')}: word lengths ${ds.join(' ')}`);
  }
}

// ---------------- C. Schreier ----------------
console.log('\n=== C. orbits on level n ===');
{
  for (let n = 1; n <= 14; n++) {
    const N = 1 << n;
    const wordOf = v => { const w = []; for (let k = 0; k < n; k++) w.push((v >> k) & 1); return w; };
    const enc = w => { let y = 0; for (let k = 0; k < n; k++) if (w[k]) y |= 1 << k; return y; };
    const act = (g, v) => enc(apply(g, wordOf(v)));
    // delta|_n = 1 0 0 ... 0  -> v = 1
    // <q0>-orbit of delta
    let v = 1, cyc = 0;
    do { v = act(q0, v); cyc++; } while (v !== 1 && cyc < 1 << 20);
    // G-orbit of delta
    const seen = new Set([1]); const st = [1];
    while (st.length) { const x = st.pop(); for (const a of GEN) { const y = act(a, x); if (!seen.has(y)) { seen.add(y); st.push(y); } } }
    console.log(`   n=${n}: <q0>-orbit of delta = ${cyc};  G-orbit of delta = ${seen.size} of ${N}  ${seen.size === N ? '(transitive)' : '(NOT transitive)'}`);
  }
}
