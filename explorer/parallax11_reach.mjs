// Parallax, 2026-09-12.  How many positions can a walk of this shape occupy?
//
//   R(t) = #{ s_t : s_{t+1} = u_t . (s_t|_0), u_t in {q0,q1,q2}^t }
//
// This is the size of the reachable set of the i.i.d. control class (sections
// always at letter 0, which is the seed's own section pattern for t >= 1).
// Contrast: over crystal 40's FAMILY the position is E^t|_v for a level-t
// vertex v, and there are m(t) ~ 1.73^t of those.

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

// the seed's own element at each t, for comparison: E^t|_{delta|_t}
let E = ID; const seedKeys = [];
{
  let g = ID;
  for (let t = 1; t <= 16; t++) {
    g = mul(q0, g);
    // section at delta|_t = 1 0^{t-1}
    let s = g; s = section(s, 1); for (let i = 1; i < t; i++) s = section(s, 0);
    seedKeys.push(key(s));
  }
}

let cur = new Map([[key(ID), ID]]);
const R = [];
for (let t = 1; t <= 16; t++) {
  const nx = new Map();
  for (const g of cur.values()) { const sec = section(g, 0); for (const a of GEN) { const h = mul(a, sec); nx.set(key(h), h); } }
  cur = nx; R.push(cur.size);
  const hasSeed = cur.has(seedKeys[t - 1]);
  const sizes = [...cur.values()].map(g => g.n);
  console.log(`   t=${t}: R(t) = ${cur.size}   (3^t = ${3 ** t})   transducer sizes ${Math.min(...sizes)}..${Math.max(...sizes)}   seed's own element present: ${hasSeed}`);
  if (cur.size > 20000) break;
}
console.log(`\n   R(t) = ${R.join(', ')}`);
console.log(`   successive ratios: ${R.slice(1).map((v, i) => (v / R[i]).toFixed(3)).join(' ')}`);
