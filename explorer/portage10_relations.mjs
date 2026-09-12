// Portage, 2026-09-12.  Structure of G = <q0,q1,q2>, rule 30's edge group,
// and the clean form of the section-sequence identities (t >= 1, where the
// seed ray's letters are all 0 and the t = 0 boundary does not intrude).

function elt(n, perm, d, root = 0) { return { n, perm: Uint8Array.from(perm), d: Int32Array.from(d), root }; }
const ID = elt(1, [0], [0, 0]);
function canon(g) {
  const seen = new Map(); const order = []; const stack = [g.root];
  while (stack.length) { const s = stack.pop(); if (seen.has(s)) continue; seen.set(s, order.length); order.push(s); stack.push(g.d[2 * s], g.d[2 * s + 1]); }
  const m = order.length; const perm = new Uint8Array(m), d = new Int32Array(2 * m);
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
  for (let h = 0; h < q.length; h++) { const c = q[h], i = rep.get(c); P.push(perm[i]); for (const x of [0, 1]) { const c2 = cls[d[2 * i + x]]; if (!map.has(c2)) { map.set(c2, q.length); q.push(c2); } D.push(map.get(c2)); } }
  return elt(q.length, P, D, 0);
}
function key(g) { return g.n + '|' + Array.from(g.perm).join('') + '|' + Array.from(g.d).join(','); }
function mul(g, h) {
  const idx = new Map(); const order = [];
  function id(s, t) { const k = s * h.n + t; if (!idx.has(k)) { idx.set(k, order.length); order.push([s, t]); } return idx.get(k); }
  id(g.root, h.root);
  const perm = [], d = [];
  for (let i = 0; i < order.length; i++) { const [s, t] = order[i]; perm.push(g.perm[s] ^ h.perm[t]); for (const x of [0, 1]) { const y = x ^ h.perm[t]; d.push(id(g.d[2 * s + y], h.d[2 * t + x])); } }
  return canon(elt(order.length, perm, d, 0));
}
function inv(g) { const perm = Array.from(g.perm), d = new Array(2 * g.n); for (let s = 0; s < g.n; s++) for (const y of [0, 1]) d[2 * s + y] = g.d[2 * s + (y ^ g.perm[s])]; return canon(elt(g.n, perm, d, g.root)); }
function section(g, x) { return canon(elt(g.n, g.perm, g.d, g.d[2 * g.root + x])); }
function isId(g) { return g.n === 1 && g.perm[0] === 0; }
function chi(g) { return g.perm[g.root]; }
function apply(g, w) { let s = g.root; const out = []; for (const x of w) { out.push(x ^ g.perm[s]); s = g.d[2 * s + x]; } return out; }

const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));

console.log('=== 0. q0 q1^-1 is the root transposition, and 1 is a reset word ===');
{
  const sigma = canon(elt(2, [1, 0], [1, 1, 1, 1]));          // sigma(id, id)
  console.log(`  q0 q1^-1 = sigma (the root swap)? ${key(mul(q0, inv(q1))) === key(sigma)}`);
  console.log(`  sigma * q0 = q1 ? ${key(mul(sigma, q0)) === key(q1)}`);
  // reading the letter 1 from each state of E
  const st = [['q0', q0], ['q1', q1], ['q2', q2]];
  const land = st.map(([nm, g]) => `${nm}|_1 = ${key(section(g, 1)) === key(q2) ? 'q2' : '?'}`);
  console.log(`  reading the letter 1: ${land.join(', ')}  (a reset word iff all are q2)`);
  const land0 = st.map(([nm, g]) => `${nm}|_0 = ${key(section(g, 0)) === key(q0) ? 'q0' : (key(section(g, 0)) === key(q1) ? 'q1' : 'q2')}`);
  console.log(`  reading the letter 0: ${land0.join(', ')}`);
}

console.log('\n=== 1. involutions among the ratios ===');
const pairs = [['q0 q1^-1', mul(q0, inv(q1))], ['q1 q2^-1', mul(q1, inv(q2))], ['q0 q2^-1', mul(q0, inv(q2))], ['q1 q0^-1', mul(q1, inv(q0))]];
for (const [nm, g] of pairs) {
  const sq = mul(g, g);
  let ord = 0, p = g;
  for (let i = 1; i <= 12; i++) { if (isId(p)) { ord = i; break; } p = mul(p, g); if (p.n > 20000) break; }
  console.log(`  ${nm}: states ${g.n}, square trivial? ${isId(sq)}, order ${ord || '> 12 (or large)'}`);
}
{
  const u = mul(q0, inv(q1)), v = mul(q1, inv(q2));
  const uv = mul(u, v);
  let ord = 0, p = uv, sizes = [];
  for (let i = 1; i <= 14; i++) { if (isId(p)) { ord = i; break; } sizes.push(p.n); p = mul(p, uv); if (p.n > 60000) break; }
  console.log(`  u = q0q1^-1, v = q1q2^-1 : order of uv = ${ord || '> ' + sizes.length}; |(uv)^i| = ${sizes.join(' ')}`);
  console.log(`  do u and v commute? ${isId(mul(mul(u, v), inv(mul(v, u))))}`);
  console.log(`  is q2 = q1 * (q0^-1 q1) ... sanity, u,v as sections: u = ${key(u).slice(0, 40)}`);
}

console.log('\n=== 2. the section sequence, stated for t >= 1 ===');
{
  const TM = 17;
  const rows = [1n]; for (let t = 1; t <= TM + 2; t++) { const r = rows[t - 1]; rows.push((4n * r) ^ ((2n * r) | r)); }
  const bit = (x, k) => (k < 0 ? 0 : Number((x >> BigInt(k)) & 1n));
  const cell = (t, x) => bit(rows[t], x + t);
  let s = ID, badChi = 0, badLeft = 0, cells = 0, n = 0;
  for (let t = 0; t <= TM; t++) {
    if (t >= 1) {
      n++;
      if (chi(s) !== cell(t, 0)) badChi++;
      const J = Math.min(t, 30);
      const out = apply(s, new Array(J + 1).fill(0));
      for (let j = 0; j <= J; j++) { cells++; if (out[j] !== cell(t, -j)) badLeft++; }
    }
    const u = cell(t, 0) === 1 ? q2 : (cell(t, 1) === 1 ? q1 : q0);
    s = mul(u, section(s, t === 0 ? 1 : 0));
  }
  console.log(`  chi(s_t) = centerColumn t, t = 1..${TM}: ${badChi} failures over ${n}`);
  console.log(`  s_t(0^inf)_j = cell(t,-j), t = 1..${TM}: ${badLeft} failures over ${cells} cells`);
  console.log(`  (at t = 0 both fail, and must: delta_0 = 1, so c(0) = delta_0 XOR chi(s_0).)`);
}

console.log('\n=== 3. is the growth of G free-product-like? ===');
{
  const gens = [q0, q1, q2, inv(q0), inv(q1), inv(q2)];
  let ball = new Map([[key(ID), ID]]); let frontier = [ID]; const sizes = [];
  for (let r = 1; r <= 7; r++) {
    const next = [];
    for (const g of frontier) for (const a of gens) { const p = mul(a, g), k = key(p); if (!ball.has(k)) { ball.set(k, p); next.push(p); } }
    frontier = next; sizes.push(ball.size);
    if (ball.size > 60000) break;
  }
  console.log(`  |ball(r)| in the 6-letter generating set: ${sizes.join(' ')}`);
  console.log(`  sphere sizes: ${sizes.map((s, i) => s - (i ? sizes[i - 1] : 1)).join(' ')}`);
  console.log(`  free group of rank 3 would give: 7 37 187 937 4687 23437 117187`);
}
