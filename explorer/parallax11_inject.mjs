// Parallax, 2026-09-12.  How much does the walk's position remember?
//
// The walk is  s_{t+1} = u_t . (s_t|_0).  A positive WORD of length t is
// recoverable from its product (the monoid is free, measured to t=8), but
// the walk's word is built from SECTIONS of its steps, and q0|_0 = q1|_0 = q0,
// so two different step sequences can give the same element.  Measure it.
//
//   A. over all 3^t step sequences: how many distinct s_t?
//   B. over the 2^t REALISABLE step sequences (one per boundary b, crystal 40):
//      how many distinct s_t?   i.e. does the walk's position at time t
//      remember the centre column so far?
//   C. a random-sample extension of the freeness test to longer words.

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
const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));
const GEN = [q0, q1, q2];

console.log('=== A. distinct walk positions s_t over ALL 3^t step sequences (sections at 0) ===');
{
  let cur = new Map([[key(ID), ID]]);
  for (let t = 1; t <= 8; t++) {
    const nx = new Map();
    for (const g of cur.values()) { const sec = section(g, 0); for (const a of GEN) { const h = mul(a, sec); nx.set(key(h), h); } }
    cur = nx;
    console.log(`   t=${t}: ${cur.size} distinct positions   (3^${t} = ${3 ** t})`);
  }
}

console.log('\n=== B. does s_t remember the centre column so far?  (realisable walks, one per b) ===');
{
  const stepsOf = (bbits, T) => {
    const W = T + 4; let y = new Uint8Array(W); const u = [];
    for (let t = 0; t < T; t++) {
      const c = (bbits >> t) & 1;
      u.push(c === 1 ? 2 : (y[0] === 1 ? 1 : 0));
      const ny = new Uint8Array(W); ny[0] = c ^ (y[0] | y[1]);
      for (let k = 1; k < W - 1; k++) ny[k] = y[k - 1] ^ (y[k] | y[k + 1]);
      y = ny;
    }
    return u;
  };
  for (let T = 1; T <= 12; T++) {
    const pos = new Set(), steps = new Set();
    for (let bb = 0; bb < (1 << T); bb++) {
      const u = stepsOf(bb, T); steps.add(u.join(''));
      let s = ID; for (let t = 0; t < T; t++) s = mul(GEN[u[t]], section(s, 0));
      pos.add(key(s));
    }
    console.log(`   T=${T}: ${steps.size} distinct step sequences and ${pos.size} distinct positions, over 2^${T} = ${1 << T} boundaries`);
  }
}

console.log('\n=== C. freeness of the positive monoid, random sample at longer lengths ===');
{
  let rng = 0xdeadbeef >>> 0;
  const rnd = m => { rng ^= rng << 13; rng >>>= 0; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0; return rng % m; };
  for (const L of [10, 12, 14, 16]) {
    const seen = new Set(); let coll = 0, N = 400;
    const words = new Set();
    for (let i = 0; i < N; i++) {
      let w = ''; let g = ID;
      for (let j = 0; j < L; j++) { const a = rnd(3); w += a; g = mul(g, GEN[a]); }
      if (words.has(w)) { i--; continue; }
      words.add(w);
      const k = key(g); if (seen.has(k)) coll++; seen.add(k);
    }
    console.log(`   length ${L}: ${N} distinct random positive words -> ${seen.size} distinct elements, ${coll} collisions`);
  }
}
