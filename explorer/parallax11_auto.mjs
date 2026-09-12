// Parallax, 2026-09-12.  Is the self-driving walk AUTONOMOUS, and is it
// distinguishable from an i.i.d. walk of the same shape?
//
//   s_{t+1} = u_t . (s_t|_0),      u_t = q0|_{(a,b)},
//   a = cell(t,1) = last digit of T^t(v) where v = w|_t,
//   b = cell(t,0) = w_t XOR chi(s_t).
//
// A. AUTONOMY.  Over ALL vertices v of length t (= over crystal 40's whole
//    family of configurations), does the section s = E^t|_v determine
//    a = the last output digit of E^t on v?  If yes, the walk needs no bit
//    from its environment except w_t, and for the seed (w_t = 0, t >= 1) it
//    is a deterministic autonomous recursion s_{t+1} = F(s_t).
//
// B. CONTROL.  The realisable walks are exactly the sections of E^t, which
//    all have m(t) states (Portage).  What does a walk of the same SHAPE but
//    with i.i.d. steps do?  |s_t| for u_t drawn i.i.d. from (1/4,1/4,1/2),
//    from the uniform law, and from the seed's own step sequence.

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

// ---------------- A. autonomy over the whole family ----------------
console.log('=== A. does the section E^t|_v determine the last OUTPUT digit of E^t on v? ===');
console.log('    (v ranges over every vertex of level t, i.e. over crystal 40\'s whole family)');
{
  let g = ID;
  for (let t = 1; t <= 16; t++) {
    g = mul(q0, g);
    // walk every v in X^t through g, recording (final state, last output digit)
    // frontier: map from (state, lastOut) seen; we need per-final-state the set of lastOut
    let front = new Map();        // key state -> Set of "lastOut" is only meaningful at the end
    // do a BFS over (state) with the pair (state, lastOutput) as the carried item
    let cur = [[g.root, -1]];
    for (let i = 0; i < t; i++) {
      const seen = new Set(); const nx = [];
      for (const [s] of cur) for (const x of [0, 1]) {
        const out = x ^ g.perm[s], s2 = g.d[2 * s + x];
        const k = s2 * 2 + out;
        if (!seen.has(k)) { seen.add(k); nx.push([s2, out]); }
      }
      cur = nx;
    }
    front = new Map();
    for (const [s, out] of cur) { if (!front.has(s)) front.set(s, new Set()); front.get(s).add(out); }
    const ambig = [...front.values()].filter(S => S.size === 2).length;
    console.log(`   t=${t}: |E^t| = ${g.n};  level-${t} sections reached = ${front.size};  with BOTH last-output digits = ${ambig}`);
  }
}

// ---------------- B. control: walks of the same shape with i.i.d. steps ----------------
console.log('\n=== B. |s_t| for walks s_{t+1} = u_t . (s_t|_0) with different step sequences ===');
{
  const TMAX = 22, CAP = 4000000;
  // the seed's own step sequence, from the picture
  let r = 1n; const useed = [];
  for (let t = 0; t <= TMAX + 2; t++) {
    const c0 = Number((r >> BigInt(t)) & 1n), c1 = Number((r >> BigInt(t + 1)) & 1n);
    useed.push(c0 === 1 ? 2 : (c1 === 1 ? 1 : 0));
    r = (4n * r) ^ ((2n * r) | r);
  }
  const run = (steps, secLetters) => {
    let s = ID; const sizes = [];
    for (let t = 0; t < steps.length; t++) {
      s = mul(GEN[steps[t]], section(s, secLetters ? secLetters[t] : 0));
      sizes.push(s.n);
      if (s.n > CAP) break;
    }
    return sizes;
  };
  // the seed: section letter is delta_t = 1 at t=0, 0 afterwards
  const seedSec = useed.map((_, t) => (t === 0 ? 1 : 0));
  const seedSizes = run(useed.slice(0, TMAX), seedSec);
  console.log(`   seed's walk          |s_t|, t=1..${seedSizes.length}: ${seedSizes.join(' ')}`);

  let rng = 0x9e3779b9 >>> 0;
  const rnd = () => { rng ^= rng << 13; rng >>>= 0; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0; return rng / 4294967296; };
  const draw = law => { const x = rnd(); return x < law[0] ? 0 : (x < law[0] + law[1] ? 1 : 2); };
  for (const [name, law] of [['(1/4,1/4,1/2)', [0.25, 0.25, 0.5]], ['uniform  ', [1 / 3, 1 / 3, 1 / 3]]]) {
    for (let trial = 0; trial < 3; trial++) {
      const steps = Array.from({ length: TMAX }, () => draw(law));
      const sz = run(steps, null);
      console.log(`   i.i.d. ${name} #${trial}  |s_t|: ${sz.join(' ')}`);
    }
  }
  // and: the seed's own step sequence but with section letters all 0 from t=0
  const sz = run(useed.slice(0, TMAX), null);
  console.log(`   seed steps, sections all at 0: ${sz.join(' ')}`);
}

// ---------------- C. the realisable step sequences ----------------
console.log('\n=== C. which step sequences are realisable?  (= arise from some configuration) ===');
{
  // u_t is determined by (cell(t,1), cell(t,0)); a configuration is X_b for
  // arbitrary b (crystal 40).  Sweep b over all 2^T words and collect the
  // u-prefixes that occur.  Compare with 3^T.
  const T = 14;
  // X_b: white at every x >= 1 at time 0, centre column b.  Build the right
  // half-line from b: column k for k >= 1.
  const seen = new Set();
  const NB = 1 << T;
  for (let bb = 0; bb < NB; bb++) {
    // right half-line: y[k] = cell(t, k+1); boundary c(t) = bit t of bb
    let y = new Uint8Array(T + 3);   // all white at t=0
    let us = '';
    for (let t = 0; t < T; t++) {
      const c = (bb >> t) & 1;
      us += (c === 1 ? '2' : (y[0] === 1 ? '1' : '0'));
      const ny = new Uint8Array(T + 3);
      ny[0] = c ^ (y[0] | y[1]);
      for (let k = 1; k < T + 2; k++) ny[k] = y[k - 1] ^ (y[k] | y[k + 1]);
      y = ny;
    }
    seen.add(us);
  }
  console.log(`   distinct u-prefixes of length ${T} over all 2^${T} boundaries: ${seen.size}   (2^${T} = ${NB}, 3^${T} = ${3 ** T})`);
  // count by length
  for (let L = 1; L <= T; L++) {
    const s2 = new Set(); for (const u of seen) s2.add(u.slice(0, L));
    process.stdout.write(`${s2.size} `);
  }
  console.log('  <- distinct u-prefixes by length 1..' + T);
}
