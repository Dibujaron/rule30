// Portage, 2026-09-12.  |s_t| across the family X_b.
//
// For ANY configuration white at every x >= 1, the row read leftward from the
// cone's right edge is a point w of the tree boundary and the picture is the
// orbit T^t w.  Put s_t = T^t|_{w|_t}: then c(t) = w_t XOR chi(s_t), and
// s_t(0^inf) is the left half of row t.  |s_t| — the number of states of the
// minimal transducer of s_t — is therefore a complexity of row t's left half,
// computable from the picture alone.
//
// The seed gives |s_t| = m(t) ~ 1.77^t, the largest it can be.  Does a
// PERIODIC centre column give something smaller?  If yes, this is a statistic
// that separates the seed from the family in obstruction 20; if no, it is that
// obstruction's fourth death.

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
function mul(g, h) {
  const idx = new Map(); const order = [];
  function id(s, t) { const k = s * h.n + t; if (!idx.has(k)) { idx.set(k, order.length); order.push([s, t]); } return idx.get(k); }
  id(g.root, h.root);
  const perm = [], d = [];
  for (let i = 0; i < order.length; i++) { const [s, t] = order[i]; perm.push(g.perm[s] ^ h.perm[t]); for (const x of [0, 1]) { const y = x ^ h.perm[t]; d.push(id(g.d[2 * s + y], h.d[2 * t + x])); } }
  return canon(elt(order.length, perm, d, 0));
}
function section(g, x) { return canon(elt(g.n, g.perm, g.d, g.d[2 * g.root + x])); }
function chi(g) { return g.perm[g.root]; }
const q0 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 0));
const q1 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 1));
const q2 = canon(elt(3, [0, 1, 1], [0, 2, 0, 2, 1, 2], 2));

// ---- the picture of X_b: column 1 by the right half-line, row 0 by leftSolve
function pictureFromBoundary(b, T) {
  // b: array of length >= 2T+4 of 0/1 (the centre column)
  const W = 2 * T + 4;
  // right half-line: R[t][k] = cell(t, k+1), R[0][*] = 0
  let R = new Uint8Array(W).fill(0);
  const col1 = [];
  for (let t = 0; t < T + 2; t++) {
    col1.push(R[0]);
    const N = new Uint8Array(W);
    N[0] = b[t] ^ (R[0] | R[1]);
    for (let k = 0; k + 2 < W; k++) N[k + 1] = R[k] ^ (R[k + 1] | R[k + 2]);
    R = N;
  }
  // leftSolve: L[k][t] = cell(t, -k)
  const L = [];
  L.push(b.slice());
  const l1 = [];
  for (let t = 0; t + 1 < b.length; t++) l1.push(b[t + 1] ^ (b[t] | (col1[t] ?? 0)));
  L.push(l1);
  for (let k = 0; k + 2 <= T + 2; k++) {
    const prev = L[k + 1], prev2 = L[k], out = [];
    for (let t = 0; t + 1 < prev.length; t++) out.push(prev[t + 1] ^ (prev[t] | prev2[t]));
    L.push(out);
  }
  const w = []; for (let k = 0; k <= T; k++) w.push(L[k] ? L[k][0] : 0);  // row 0 read leftward
  return { col1, w };
}

function sizes(b, T, label) {
  const { col1, w } = pictureFromBoundary(b, T);
  let s = ID; const out = []; let badC = 0, checked = 0;
  for (let t = 0; t <= T; t++) {
    const u = b[t] === 1 ? q2 : (col1[t] === 1 ? q1 : q0);
    s = mul(u, section(s, w[t]));
    // c(t+1) = w_{t+1} XOR chi(s_{t+1}): does the walk reproduce the boundary?
    if (t + 1 <= T) { checked++; if ((w[t + 1] ^ chi(s)) !== b[t + 1]) badC++; }
    out.push(s.n);
    if (s.n > 120000) break;
  }
  console.log(`  ${label.padEnd(26)} c(t) = w_t XOR chi(s_t): ${badC} failures over ${checked}`);
  console.log(`  ${label.padEnd(26)} |s_t| t=1..${out.length}: ${out.slice(0, 20).join(' ')}${out.length > 20 ? ' ...' : ''}`);
  const r = out.length > 6 ? (out[out.length - 1] / out[out.length - 2]).toFixed(3) : '-';
  console.log(`  ${' '.repeat(26)} last ratio ${r}, reached ${out[out.length - 1]} at t=${out.length}`);
  return out;
}

// ---- the seed, for control: its centre column and column 1 from the row model
const T = 30;
const rows = [1n]; for (let t = 1; t <= 2 * T + 8; t++) { const r = rows[t - 1]; rows.push((4n * r) ^ ((2n * r) | r)); }
const bit = (x, k) => (k < 0 ? 0 : Number((x >> BigInt(k)) & 1n));
const seedB = []; for (let t = 0; t <= 2 * T + 6; t++) seedB.push(bit(rows[t], t));

console.log('=== |s_t| for the seed and for periodic centre columns ===');
console.log('(the seed is X_b for b = its own centre column; the others are crystal 40 configurations)');
sizes(seedB, T, 'the seed');
const mk = (pat, n) => { const a = []; while (a.length < n) a.push(...pat); return a.slice(0, n); };
for (const [nm, pat] of [['b = 1^inf', [1]], ['b = (10)^inf', [1, 0]], ['b = (1000)^inf', [1, 0, 0, 0]],
['b = (11010)^inf', [1, 1, 0, 1, 0]], ['b = (1110011000)^inf', [1, 1, 1, 0, 0, 1, 1, 0, 0, 0]],
['b = 0^inf', [0]], ['b = (110)^inf', [1, 1, 0]]]) {
  sizes(mk(pat, 2 * T + 8), T, nm);
}
// a pseudo-random boundary, as a second control
{
  let x = 88172645463325252n;
  const b = [];
  for (let i = 0; i < 2 * T + 8; i++) { x ^= x << 13n; x &= (1n << 64n) - 1n; x ^= x >> 7n; x ^= x << 17n; x &= (1n << 64n) - 1n; b.push(Number(x & 1n)); }
  sizes(b, T, 'b = coin flips');
}
