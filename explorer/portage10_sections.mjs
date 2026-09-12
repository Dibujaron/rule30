// Portage, 2026-09-12.  The section sequence along the seed ray.
//
//   s_t := E^t |_{delta|_t}   (delta = 1000..., E = q0 the right-edge map)
//
// Claims tested here:
//   A.  s_t(0^inf) is the LEFT half of row t: s_t(0^inf)_j = cell(t, -j).
//       In particular chi(s_t) = centerColumn t, where chi = root permutation.
//   B.  the recursion  s_{t+1} = u_t * (s_t|_{delta_t})  with u_t in {q0,q1,q2}
//       read off two cells of row t.
//   C.  |s_t| (states of the minimal transducer) — a complexity of row t's
//       left half, and a lower bound on the nucleus.
//   D.  deep-section counts of length-8 words (does any beat 517?).
//   E.  short relations in G and the orders of the generators.

// ---------------- transducer library ----------------
function elt(n, perm, d, root = 0) { return { n, perm: Uint8Array.from(perm), d: Int32Array.from(d), root }; }
const ID = elt(1, [0], [0, 0]);

function canon(g) {
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
function key(g) { return g.n + '|' + Array.from(g.perm).join('') + '|' + Array.from(g.d).join(','); }
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
function section(g, x) { return canon(elt(g.n, g.perm, g.d, g.d[2 * g.root + x])); }
function isId(g) { return g.n === 1 && g.perm[0] === 0; }
function chi(g) { return g.perm[g.root]; }
function apply(g, w) { let s = g.root; const out = []; for (const x of w) { out.push(x ^ g.perm[s]); s = g.d[2 * s + x]; } return out; }
// states reachable from a cycle = sections at arbitrarily deep vertices
function deepCount(g) {
  const n = g.n; const idx = new Int32Array(n).fill(-1), low = new Int32Array(n), on = new Uint8Array(n);
  const st = [], comp = new Int32Array(n).fill(-1); let ctr = 0, nc = 0; const cyc = [];
  for (let r = 0; r < n; r++) {
    if (idx[r] >= 0) continue;
    const work = [[r, 0]];
    while (work.length) {
      const fr = work[work.length - 1], v = fr[0];
      if (fr[1] === 0) { idx[v] = low[v] = ctr++; st.push(v); on[v] = 1; }
      let rec = false;
      while (fr[1] < 2) { const w = g.d[2 * v + fr[1]]; fr[1]++; if (idx[w] < 0) { work.push([w, 0]); rec = true; break; } else if (on[w]) low[v] = Math.min(low[v], idx[w]); }
      if (rec) continue;
      if (low[v] === idx[v]) { let size = 0, loop = false, w; do { w = st.pop(); on[w] = 0; comp[w] = nc; size++; if (g.d[2 * w] === v || g.d[2 * w + 1] === v) loop = true; } while (w !== v); cyc.push(size > 1 || loop); nc++; }
      work.pop(); if (work.length) { const p = work[work.length - 1][0]; low[p] = Math.min(low[p], low[v]); }
    }
  }
  const seen = new Uint8Array(n), q = [];
  for (let v = 0; v < n; v++) if (cyc[comp[v]] && !seen[v]) { seen[v] = 1; q.push(v); }
  for (let h = 0; h < q.length; h++) { const v = q[h]; for (const w of [g.d[2 * v], g.d[2 * v + 1]]) if (!seen[w]) { seen[w] = 1; q.push(w); } }
  let c = 0; for (let v = 0; v < n; v++) if (seen[v]) c++; return c;
}

const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));

// ---------------- the picture ----------------
const TMAX = 300;
const rows = [1n];
for (let t = 1; t <= TMAX + 2; t++) { const r = rows[t - 1]; rows.push((4n * r) ^ ((2n * r) | r)); }
const bit = (x, k) => (k < 0 ? 0 : Number((x >> BigInt(k)) & 1n));
// cell(t,x) = bit (x+t) of rows[t]
const cell = (t, x) => bit(rows[t], x + t);

// ---------------- A/B/C: the section sequence ----------------
console.log('=== A,B,C. the section sequence s_t = E^t|_{delta|_t} ===');
let s = ID;
const seenS = new Map(); const sizes = [];
let badChi = 0, badLeft = 0, leftCells = 0, badRec = 0, firstRepeat = null;
for (let t = 0; t <= TMAX; t++) {
  // chi(s_t) = centerColumn t
  if (chi(s) !== cell(t, 0)) badChi++;
  // s_t(0^inf)_j = cell(t,-j) for j = 0..min(t, 40)
  const J = Math.min(t, 40);
  const out = apply(s, new Array(J + 1).fill(0));
  for (let j = 0; j <= J; j++) { leftCells++; if (out[j] !== cell(t, -j)) badLeft++; }
  const k = key(s);
  if (seenS.has(k) && firstRepeat === null) firstRepeat = [seenS.get(k), t];
  if (!seenS.has(k)) seenS.set(k, t);
  sizes.push(s.n);
  // step: u_t from two cells of row t, then s_{t+1} = u_t * (s_t|_{delta_t})
  const prev1 = cell(t, 0), prev2 = cell(t, 1);
  const u = prev1 === 1 ? q2 : (prev2 === 1 ? q1 : q0);
  const deltaT = t === 0 ? 1 : 0;
  const next = mul(u, section(s, deltaT));
  // independent check of the recursion: compare with E^{t+1}|_{delta|_{t+1}}
  // rebuilt from scratch.  Only cheap while E^t is small (m(t) ~ 1.77^t).
  if (t <= 13) {
    let g = ID; for (let i = 0; i <= t; i++) g = mul(q0, g);
    let sec = g; for (let i = 0; i <= t; i++) sec = section(sec, i === 0 ? 1 : 0);
    if (key(sec) !== key(next)) badRec++;
  }
  s = next;
  if (t % 20 === 0) console.log(`    t=${t}: |s_t|=${s.n}`);
  if (s.n > 300000) { console.log(`    stopping: |s_${t + 1}| = ${s.n}`); break; }
}
console.log(`  chi(s_t) = centerColumn t : ${badChi} failures over ${sizes.length} rows`);
console.log(`  s_t(0^inf) = the left half of row t : ${badLeft} failures over ${leftCells} cells`);
console.log(`  recursion vs rebuilt E^t|_v (t <= 13) : ${badRec} failures`);
console.log(`  distinct s_t among t=0..${TMAX}: ${seenS.size}   first repeat: ${firstRepeat ?? 'none'}`);
console.log(`  |s_t| states, t=0..40: ${sizes.slice(0, 41).join(' ')}`);
console.log(`  |s_t| at t=50,100,150,200,250,300: ${[50, 100, 150, 200, 250, 300].map(i => sizes[i]).join(' ')}`);

// ---------------- D: deep sections of length-8 words ----------------
console.log('\n=== D. deep-section counts of words of length 8 ===');
{
  const gens = [q0, q1, q2, inv(q0), inv(q1), inv(q2)];
  let rng = 12345;
  const rnd = m => ((rng = (rng * 1103515245 + 12345) & 0x7fffffff) >>> 5) % m;
  let best = 0, bestWord = null; const hist = new Map();
  for (let trial = 0; trial < 3000; trial++) {
    let g = ID; const w = [];
    for (let i = 0; i < 8; i++) { const j = rnd(6); w.push(j); g = mul(g, gens[j]); }
    const dc = deepCount(g);
    hist.set(dc, (hist.get(dc) ?? 0) + 1);
    if (dc > best) { best = dc; bestWord = w.slice(); }
  }
  const ks = [...hist.keys()].sort((a, b) => a - b);
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  console.log(`  most common deep-section counts (count: how many of 3000): ${top.map(([v, c]) => v + ': ' + c).join(', ')}`);
  console.log(`  how many of the 3000 words have exactly 517: ${hist.get(517) ?? 0}`);
  console.log(`  3000 random words of length 8: deep-section counts range ${ks[0]}..${ks[ks.length - 1]}`);
  console.log(`  max ${best} at word ${bestWord?.join('')} (letters 0,1,2 = q0,q1,q2; 3,4,5 = inverses)`);
  let gp = ID; for (let i = 0; i < 8; i++) gp = mul(gp, q0);
  console.log(`  for comparison, E^8 has ${gp.n} states, ${deepCount(gp)} deep sections`);
  const over = ks.filter(k => k > 517);
  console.log(`  counts above 517 seen: ${over.length ? over.join(' ') : 'none'}`);
}

// ---------------- E: relations and orders ----------------
console.log('\n=== E. relations in G ===');
{
  const gens = [q0, q1, q2, inv(q0), inv(q1), inv(q2)];
  const names = ['a', 'b', 'c', 'A', 'B', 'C'];   // a=q0, b=q1, c=q2
  // orders of the generators
  for (const [nm, g] of [['q0', q0], ['q1', q1], ['q2', q2]]) {
    let p = g, ord = 0; const sz = [];
    for (let i = 1; i <= 24; i++) {
      if (isId(p)) { ord = i; break; }
      sz.push(p.n);
      if (p.n > 60000) break;
      p = mul(p, g);
    }
    console.log(`  order of ${nm}: ${ord === 0 ? '> ' + sz.length : ord};  |${nm}^i| states, i=1..: ${sz.join(' ')}`);
  }
  // shortest nontrivial relations: words w with w = 1, no cancellation
  const found = [];
  const search = (w, g) => {
    if (w.length > 0 && isId(g)) { found.push(w.map(i => names[i]).join('')); return; }
    if (w.length >= 6 || found.length >= 8) return;
    for (let j = 0; j < 6; j++) {
      if (w.length && (w[w.length - 1] + 3) % 6 === j) continue;  // no free cancellation
      search([...w, j], mul(g, gens[j]));
    }
  };
  search([], ID);
  console.log(`  relations of length <= 6 (a=q0,b=q1,c=q2, capitals are inverses): ${found.length ? found.slice(0, 8).join(', ') : 'none'}`);
}

// ---------------- F: level-n image of G ----------------
console.log('\n=== F. the level-n image of G (a 2-group inside Aut(T_n)) ===');
{
  const gens = [q0, q1, q2];
  for (let n = 1; n <= 5; n++) {
    const N = 1 << n;
    const words = [];
    for (let v = 0; v < N; v++) { const w = []; for (let k = 0; k < n; k++) w.push((v >> k) & 1); words.push(w); }
    const enc = g => { const p = []; for (let v = 0; v < N; v++) { const o = apply(g, words[v]); let y = 0; for (let k = 0; k < n; k++) if (o[k]) y |= 1 << k; p.push(y); } return p; };
    const compose = (p, q) => q.map(x => p[x]);   // (p o q)(x) = p(q(x))
    const gp = gens.map(enc);
    const seen = new Set([enc(ID).join(',')]);
    let frontier = [enc(ID)]; let cap = false;
    while (frontier.length) {
      const nx = [];
      for (const p of frontier) for (const a of gp) { const r = compose(a, p); const k = r.join(','); if (!seen.has(k)) { seen.add(k); nx.push(r); } }
      frontier = nx;
      if (seen.size > 3000000) { cap = true; break; }
    }
    const autn = Math.pow(2, N - 1);
    console.log(`  n=${n}: |G_n| = ${cap ? '>3e6' : seen.size}${cap ? '' : ` = 2^${Math.log2(seen.size).toFixed(0)}`}   |Aut(T_n)| = 2^${N - 1}   ratio log/log = ${cap ? '-' : (Math.log2(seen.size) / (N - 1)).toFixed(4)}`);
    if (cap) break;
  }
}
