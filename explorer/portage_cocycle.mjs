/**
 * Portage (connector, 2026-09-08, second session): the cocycle / coboundary
 * reading of the right edge, and the vantage's own question — is the transient
 * part of the telescoped centre-column sum a cocycle over the settled part?
 *
 *   node explorer/portage_cocycle.mjs
 *
 * Conventions match Rule30/Basic.lean: cell(t, x), x rightward, time down;
 * right diagonal R_k(j) = cell(j + k, j).
 *
 * The central object here is the RIGHT-EDGE STATE
 *
 *     e(t)_d = cell(t, t - d),   d = 0, 1, 2, ...
 *
 * the row read leftward from its rightmost cell. Because the rule reads only
 * x-1, x, x+1, the rightmost d+1 cells of row t+1 depend only on the rightmost
 * d+1 cells of row t:
 *
 *     e(t+1)_d = e(t)_d  XOR  ( e(t)_{d-1} OR e(t)_{d-2} )        (bits < 0 white)
 *
 * i.e. e(t+1) = E(e(t)) with E(w) = w ^ ((w<<1) | (w<<2)) as a bit vector.
 * E is TRIANGULAR (coordinate d changes by a function of the coordinates below
 * it) and hence a bijection on every level: an automorphism of the binary
 * rooted tree. R_k(j) = e(j+k)_k and c(t) = e(t)_t.
 *
 * Sections:
 *
 *  0. Sanity: the edge engine against a real triangle.
 *  A. E as an automorphism of T_2: bijectivity, orbit periods, and the fact
 *     that its section at a vertex depends only on the vertex's last two
 *     letters (so E is a finite-state / self-similar automorphism).
 *  B. The wreath-product = Anzai coboundary criterion for period doubling,
 *     with the transfer function exhibited, and the identity
 *     sigma_k = c(k) XOR cell(k + L, L).
 *  C. The generalized-Morse (Keane b x b-bar) nesting test on the tower.
 *  D. The settled / transient split of the telescoped sum, within the seed.
 *  E. Across configurations: does the settled data determine the centre
 *     column? (the vantage's question, in its decisive form)
 *  F. Per-residue densities of c mod m.
 *  H. THE COBOUNDARY EQUATION. d_{j,x}(t) = c(t) XOR cell(t + j, x): is any
 *     column cohomologous to the centre column? If one is, the residual
 *     follows. Swept over a grid of (j, x) and searched for a period.
 *
 * Nothing here is a proof.
 */

const t0 = Date.now();
const ms = () => `${Date.now() - t0} ms`;

// ---------------------------------------------------------------------------
// The right-edge engine (48 bits deep, so valid for right diagonals k <= 47).
// ---------------------------------------------------------------------------

const NBITS = 48n;
const EMASK = (1n << NBITS) - 1n;
const TEDGE = 600000;

const Eg = new Array(TEDGE);
{
  let w = 1n;
  for (let t = 0; t < TEDGE; t++) {
    Eg[t] = w;
    w = (w ^ ((w << 1n) | (w << 2n))) & EMASK;
  }
}
const ebit = (t, d) => Number((Eg[t] >> BigInt(d)) & 1n);
const R = (k, j) => ebit(j + k, k);        // R_k(j) = cell(j+k, j)
const KMAX = 40;
console.log(`edge engine: ${TEDGE} rows, ${NBITS} bits (${ms()})`);

// ---------------------------------------------------------------------------
// A full row engine in BigInt, for the centre column and nearby columns.
// bit (x + t) of row[t] is cell(t, x).
// ---------------------------------------------------------------------------

const TROW = 60000, XW = 72;
const col = new Map();                       // x -> Uint8Array over t
for (let x = -XW; x <= XW; x++) col.set(x, new Uint8Array(TROW));
{
  let r = 1n;
  for (let t = 0; t < TROW; t++) {
    for (let x = -XW; x <= XW; x++) {
      if (x < -t || x > t) continue;
      col.get(x)[t] = Number((r >> BigInt(x + t)) & 1n);
    }
    r = (4n * r) ^ ((2n * r) | r);
  }
}
const cc = col.get(0);
const cellNear = (t, x) => (t >= 0 && t < TROW && x >= -XW && x <= XW ? col.get(x)[t] : null);
console.log(`row engine: ${TROW} rows, columns -${XW}..${XW} (${ms()})`);

// ---------------------------------------------------------------------------
// A small real triangle, for the telescoped sum and its settled/transient split.
// ---------------------------------------------------------------------------

function triangle(seedCells, T) {
  const W = 2 * T + 5, OFF = T + 2;
  const P = new Uint8Array(T * W);
  for (const x of seedCells) P[0 * W + OFF + x] = 1;
  for (let t = 0; t + 1 < T; t++) {
    const a = t * W, b = (t + 1) * W;
    for (let i = 1; i <= W - 2; i++) P[b + i] = P[a + i - 1] ^ (P[a + i] | P[a + i + 1]);
  }
  return { T, cell: (t, x) => (t >= 0 && t < T && OFF + x >= 0 && OFF + x < W ? P[t * W + OFF + x] : 0) };
}

const T1 = 3000;
const G = triangle([0], T1);

// --- 0. sanity
{
  let bad = 0, tot = 0;
  for (let t = 0; t < 2000; t++) for (let d = 0; d <= Math.min(t, 40); d++) { tot++; if (ebit(t, d) !== G.cell(t, t - d)) bad++; }
  let b2 = 0, b3 = 0;
  for (let t = 0; t < 47; t++) if (ebit(t, t) !== cc[t]) b2++;
  for (let t = 0; t < T1; t++) for (let x = -40; x <= 40; x++) if (G.cell(t, x) !== cellNear(t, x)) b3++;
  console.log(`0  edge engine vs triangle: ${tot} cells, ${bad} failures; c(t) = e(t)_t (t<47): ${b2} failures; row engine vs triangle: ${b3} failures`);
  console.log(`0  c(0..40) = ${Array.from(cc.slice(0, 41)).join('')}`);
}

// ---------------------------------------------------------------------------
// A. E as an automorphism of the binary rooted tree.
// ---------------------------------------------------------------------------

function Elevel(w, m) {
  let out = 0;
  for (let d = 0; d < m; d++) {
    const a = d >= 2 ? (w >> (d - 2)) & 1 : 0, b = d >= 1 ? (w >> (d - 1)) & 1 : 0;
    out |= (((w >> d) & 1) ^ (a | b)) << d;
  }
  return out;
}

{
  let bij = true;
  for (let m = 1; m <= 16 && bij; m++) {
    const seen = new Uint8Array(1 << m);
    for (let w = 0; w < (1 << m); w++) { const v = Elevel(w, m); if (seen[v]) { bij = false; break; } seen[v] = 1; }
  }
  console.log(`A1 E is a bijection on level m, m = 1..16: ${bij}`);

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const ord = [], per = [];
  for (let m = 1; m <= 15; m++) {
    const seen = new Uint8Array(1 << m);
    let o = 1;
    for (let w = 0; w < (1 << m); w++) {
      if (seen[w]) continue;
      let v = w, len = 0;
      do { seen[v] = 1; v = Elevel(v, m); len++; } while (v !== w);
      o = (o * len) / gcd(o, len);
    }
    ord.push(`${m}:${o}`);
    let v = 1, len = 0;
    do { v = Elevel(v, m); len++; } while (v !== 1);
    per.push(`${m}:${len}`);
  }
  console.log(`A2 order of E on level m (a power of 2, forced: the level group is a 2-group): ${ord.join(' ')}`);
  console.log(`A2 orbit period of the seed point 1000... on level m: ${per.join(' ')}`);

  // A3: sections
  const DEPTH = 12, TAIL = 8;
  const sectionKey = (v, d) => {
    let key = '';
    for (let x = 0; x < (1 << TAIL); x++) {
      let out = 0;
      const bitAt = (q) => (q < d ? (v >> q) & 1 : (x >> (q - d)) & 1);
      for (let i = 0; i < TAIL; i++) {
        const dd = d + i;
        const a = dd >= 2 ? bitAt(dd - 2) : 0, b = dd >= 1 ? bitAt(dd - 1) : 0;
        out |= (bitAt(dd) ^ (a | b)) << i;
      }
      key += out.toString(36) + ',';
    }
    return key;
  };
  let ok = true; const distinct = new Map();
  for (let d = 2; d <= DEPTH && ok; d++) {
    const byTail = new Map();
    for (let v = 0; v < (1 << d); v++) {
      const tail = (v >> (d - 2)) & 3, key = sectionKey(v, d);
      if (!distinct.has(key)) distinct.set(key, new Set());
      distinct.get(key).add(tail);
      if (byTail.has(tail)) { if (byTail.get(tail) !== key) ok = false; } else byTail.set(tail, key);
    }
  }
  console.log(`A3 section of E at a vertex depends only on its last two letters (depths 2..${DEPTH}): ${ok}; distinct sections: ${distinct.size}, grouping the four tails as ${[...distinct.values()].map((s) => '{' + [...s].sort().map((t) => t.toString(2).padStart(2, '0')).join(',') + '}').join(' ')}`);

  // A4: the explicit 3-state Mealy automaton, checked against E
  //   state s in {q0 = (0,0), q1 = (1,0), q2 = (b = 1)};
  //   on input x: output x XOR flip(s), next state next(s, x)
  const flip = { q0: 0, q1: 1, q2: 1 };
  const next = { q0: { 0: 'q0', 1: 'q2' }, q1: { 0: 'q0', 1: 'q2' }, q2: { 0: 'q1', 1: 'q2' } };
  {
    let bad = 0, tot = 0;
    for (let w = 0; w < (1 << 16); w++) {
      let s = 'q0', out = 0;
      for (let d = 0; d < 16; d++) { const x = (w >> d) & 1; out |= (x ^ flip[s]) << d; s = next[s][x]; }
      tot++; if (out !== Elevel(w, 16)) bad++;
    }
    console.log(`A4 3-state Mealy automaton (q0=(q0,q2), q1=sigma(q0,q2), q2=sigma(q1,q2)) reproduces E: ${tot} words of length 16, ${bad} failures`);
  }

  // A5: minimal periods
  const P = [];
  for (let k = 0; k <= KMAX; k++) {
    let p = 0;
    for (let q = 1; q <= (1 << 18); q *= 2) {
      if (q * 3 > TEDGE - k) break;
      let good = true;
      const lim = Math.min(TEDGE - k - q, 200000);
      for (let j = 0; j < lim; j++) if (R(k, j) !== R(k, j + q)) { good = false; break; }
      if (good) { p = q; break; }
    }
    P.push(p);
  }
  let mono = true;
  for (let k = 1; k <= KMAX; k++) if (P[k] > 0 && P[k - 1] > 0 && P[k] < P[k - 1]) mono = false;
  console.log(`A5 minimal period P_k, k = 0..${KMAX}: ${P.join(' ')}   (non-decreasing: ${mono})`);
  globalThis.__P = P;
}

// ---------------------------------------------------------------------------
// B. The coboundary criterion for period doubling.
// ---------------------------------------------------------------------------

{
  const P = globalThis.__P;
  const rows = [];
  let failD = 0, failI = 0, failT = 0, failA = 0, n = 0;
  for (let k = 2; k <= KMAX; k++) {
    const L = Math.max(P[k - 1], P[k - 2]);
    if (L <= 0 || P[k] <= 0 || 3 * L > TEDGE) continue;
    const g = (j) => R(k - 1, j) | R(k - 2, j + 1);
    let sigma = 0;
    for (let j = 0; j < L; j++) sigma ^= g(j);
    if (P[k] !== (sigma ? 2 * L : L)) failD++;
    if ((R(k, L) ^ R(k, 0)) !== sigma) failI++;
    let psi = 0, tf = true, anti = true;
    for (let j = 1; j <= 2 * L; j++) {
      psi ^= g(j);
      if ((R(k, 0) ^ psi) !== R(k, j)) tf = false;
      if (j === L && psi !== sigma) anti = false;
    }
    if (!tf) failT++;
    if (!anti) failA++;
    n++;
    rows.push(`${k}:L=${L},s=${sigma},P=${P[k]}`);
  }
  console.log(`B  ${rows.join(' ')}`);
  console.log(`B  period doubles iff sigma_k odd: ${failD} failures / ${n} levels`);
  console.log(`B  sigma_k = c(k) XOR cell(k+L, L)  (= R_k(L) XOR R_k(0)): ${failI} failures / ${n}`);
  console.log(`B  R_k(j) = c(k) XOR psi_k(j), psi_k(j) = sum_{i<=j} g_k(i): ${failT} failures / ${n}`);
  console.log(`B  psi_k(L) = sigma_k (transfer function closes iff no doubling; else antiperiodic): ${failA} failures / ${n}`);
  // the copy identity, re-verified: R_k(X) = R_k(0) whenever P_k | X
  let cop = 0, copTot = 0;
  for (let k = 0; k <= 35; k++) {
    if (P[k] <= 0) continue;
    for (let X = P[k]; X <= 100000; X += P[k]) { copTot++; if (R(k, X) !== R(k, 0)) cop++; }
  }
  console.log(`B  copy identity cell(k+X, X) = c(k) whenever P_k | X: ${copTot} instances, ${cop} failures`);
}

// ---------------------------------------------------------------------------
// C. Generalized Morse nesting.
// ---------------------------------------------------------------------------

{
  const P = globalThis.__P;
  const firstK = new Map(), lastK = new Map();
  for (let k = 0; k <= KMAX; k++) if (P[k] > 0) { if (!firstK.has(P[k])) firstK.set(P[k], k); lastK.set(P[k], k); }
  const word = (k, len) => Array.from({ length: len }, (_, j) => R(k, j)).join('');
  const compl = (s) => s.split('').map((ch) => (ch === '0' ? '1' : '0')).join('');
  const ns = [];
  for (let n = 0; n <= 20; n++) if (firstK.has(1 << n)) ns.push(n);
  const o1 = [], o2 = [], o3 = [];
  for (let i = 0; i + 1 < ns.length; i++) {
    const n = ns[i], m = ns[i + 1];
    if (m !== n + 1) { o1.push(`${n}->${m}:GAP`); continue; }
    const wn = word(firstK.get(1 << n), 1 << n), wm = word(firstK.get(1 << m), 1 << m);
    const u = wm.slice(0, 1 << n);
    o1.push(`${n}:${wm === u + compl(u) ? 'antiper' : 'NO'}`);
    o2.push(`${n}:${u === wn ? 'nests' : 'no'}`);
    let rel = 'no';
    for (let s = 0; s < (1 << n); s++) {
      const rot = wn.slice(s) + wn.slice(0, s);
      if (rot === u) { rel = `shift${s}`; break; }
      if (compl(rot) === u) { rel = `comp-shift${s}`; break; }
    }
    o3.push(`${n}:${rel}`);
  }
  console.log(`C  the level word is antiperiodic (u . bar u) at each new period: ${o1.join(' ')}`);
  console.log(`C  Keane nesting  w_{n+1} = w_n . bar(w_n): ${o2.join(' ')}`);
  console.log(`C  is the first half of w_{n+1} a shift or complemented shift of w_n: ${o3.join(' ')}`);
}

// ---------------------------------------------------------------------------
// D. Settled / transient split of the telescoped sum.
// ---------------------------------------------------------------------------

const CUT = 0.2;
{
  const KLO = 200, KHI = T1;
  const A = [], B = [];
  let bad = 0;
  for (let k = KLO; k < KHI; k++) {
    const cut = -CUT * (k - 1);
    let aS = 0, aT = 0;
    for (let j = 0; j >= -k; j--) {
      const g = G.cell(j + k - 1, j) | G.cell(j + k - 1, j + 1);
      if (j < cut) aS ^= g; else aT ^= g;
    }
    if ((aS ^ aT) !== G.cell(k, 0)) bad++;
    A.push(aS); B.push(aT);
  }
  const cs = Array.from({ length: KHI - KLO }, (_, i) => G.cell(KLO + i, 0));
  const dens = (v) => (v.reduce((a, b) => a + b, 0) / v.length).toFixed(4);
  const agree = (u, v) => (u.filter((x, i) => x === v[i]).length / u.length).toFixed(4);
  console.log(`D  identity c = A xor B over k in [${KLO}, ${KHI}): ${bad} failures`);
  console.log(`D  density A = ${dens(A)}, B = ${dens(B)}, c = ${dens(cs)}; A predicts c: ${agree(A, cs)}; B predicts c: ${agree(B, cs)}`);
  const sh = (v, s) => { let a = 0, n = 0; for (let i = 0; i + s < v.length; i++) { n++; if (v[i] === v[i + s]) a++; } return (a / n).toFixed(4); };
  const pw = [];
  for (let e = 0; e <= 10; e++) pw.push(`2^${e}:A=${sh(A, 1 << e)},B=${sh(B, 1 << e)}`);
  console.log(`D  shift agreement of A and B: ${pw.join(' ')}`);
  const wins = [];
  for (const Wd of [4, 8, 12, 16, 20, 24]) {
    const feats = [], lab = [];
    for (let k = KLO; k < KHI; k++) {
      const cut = Math.floor(-CUT * (k - 1));
      let key = 0;
      for (let i = 0; i < Wd; i++) { const j = cut - i; key = key * 2 + (G.cell(j + k - 1, j) | G.cell(j + k - 1, j + 1)); }
      feats.push(key); lab.push(B[k - KLO]);
    }
    const half = feats.length >> 1, tab = new Map();
    for (let i = 0; i < half; i++) { const e = tab.get(feats[i]) || [0, 0]; e[lab[i]]++; tab.set(feats[i], e); }
    let hit = 0, tot = 0;
    for (let i = half; i < feats.length; i++) {
      const e = tab.get(feats[i]); tot++;
      if (!e) { hit += 0.5; continue; }
      if ((e[1] > e[0] ? 1 : 0) === lab[i]) hit++;
    }
    wins.push(`W=${Wd}:${(hit / tot).toFixed(3)}(${tab.size} keys)`);
  }
  console.log(`D  settled window below the seam predicts B, held out (0.5 = nothing): ${wins.join(' ')}`);
}

// ---------------------------------------------------------------------------
// E. Across configurations.
// ---------------------------------------------------------------------------

{
  const T2 = 1500;
  const base = triangle([0], T2);
  const configs = [
    ['seed + cell at 3', [0, 3]],
    ['seed + cell at 5', [0, 5]],
    ['seed + cells 7,9', [0, 7, 9]],
    ['block [0,4]', [0, 1, 2, 3, 4]],
    ['fibonacci block', [0, 2, 3, 5, 8, 13, 21, 34]],
  ];
  const out = [];
  for (const [name, cells] of configs) {
    const X = triangle(cells, T2);
    const rate = (N, tlo, thi, flo, fhi, step) => {
      let ok = 0, tot = 0;
      for (let t = tlo; t < thi; t += step) {
        for (let x = -Math.floor(fhi * t); x <= -Math.floor(flo * t); x++) {
          const tt = t + N, xx = x - N;
          if (tt < 0 || tt >= T2) continue;
          tot++; if (X.cell(tt, xx) === base.cell(t, x)) ok++;
        }
      }
      return [ok, tot];
    };
    let bestN = null, bestR = -1;
    for (let N = -200; N <= 200; N++) {
      const [ok, tot] = rate(N, 700, 1000, 0.30, 0.45, 7);
      if (tot > 0 && ok / tot > bestR) { bestR = ok / tot; bestN = N; }
    }
    const [ok1, tot1] = rate(bestN, 700, 1300, 0.30, 0.48, 1);
    const [ok2, tot2] = rate(bestN, 700, 1300, 0.26, 0.30, 1);
    let cBest = 0, cOff = null;
    for (let off = -250; off <= 250; off++) {
      let ok = 0, tot = 0;
      for (let t = 300; t < 1400; t++) { const u = t + off; if (u < 0 || u >= T2) continue; tot++; if (X.cell(t, 0) === base.cell(u, 0)) ok++; }
      if (tot > 500 && ok / tot > cBest) { cBest = ok / tot; cOff = off; }
    }
    out.push(`${name}: N=${bestN}; settled cells (x in [-0.48t,-0.30t]) agree ${(ok1 / tot1).toFixed(5)} of ${tot1}; just right of the seam (x in [-0.30t,-0.26t]) ${(ok2 / tot2).toFixed(4)}; best centre-column agreement over 501 offsets ${cBest.toFixed(4)} at ${cOff}`);
  }
  console.log(`E  ${out.join('\n   ')}`);
  console.log(`E  baseline: the max of 501 independent binomials at n = 1100 is about 0.5 + 3 * 0.0151 = 0.545`);
}

// ---------------------------------------------------------------------------
// F. Per-residue densities of c.
// ---------------------------------------------------------------------------

{
  const out = [];
  for (const m of [2, 4, 8, 16, 64, 256, 1024, 4096, 3, 5, 7, 100, 1000]) {
    const s = new Int32Array(m), n2 = new Int32Array(m);
    for (let t = 0; t < TROW; t++) { s[t % m] += cc[t]; n2[t % m]++; }
    let worst = 0;
    for (let r = 0; r < m; r++) worst = Math.max(worst, Math.abs(s[r] / n2[r] - 0.5));
    out.push(`${m}:${worst.toFixed(4)}`);
  }
  console.log(`F  max over r of |density(c on t = r mod m) - 1/2|, ${TROW} terms: ${out.join(' ')}`);
  console.log(`F  chance size of that max at m = 4096 (n = ${(TROW / 4096) | 0} per class): about ${(3 / (2 * Math.sqrt(TROW / 4096))).toFixed(3)}`);
}

// ---------------------------------------------------------------------------
// H. The coboundary equation: is any column cohomologous to the centre column?
// ---------------------------------------------------------------------------

{
  const ONSET = 20000, PMAX = 4096;
  // exact test: does d have period p from ONSET, checked to TROW?
  const hasPeriod = (d, p, lo, hi) => { for (let t = lo; t + p < hi; t++) if (d[t] !== d[t + p]) return false; return true; };
  const results = [];
  let anyPeriodic = 0, nseq = 0;
  const runs = [];
  for (let x = -24; x <= 24; x++) {
    for (let j = -8; j <= 24; j++) {
      if (x === 0 && j === 0) continue;                       // d = 0, the trivial solution
      const hi = TROW - Math.max(j, 0) - 2, lo = Math.max(ONSET, Math.abs(x) - j + 2);
      const d = new Uint8Array(hi);
      for (let t = 0; t < hi; t++) { const u = t + j; d[t] = cc[t] ^ (u >= 0 && u < TROW ? col.get(x)[u] : 0); }
      nseq++;
      let found = 0;
      for (let p = 1; p <= PMAX; p++) if (hasPeriod(d, p, lo, hi)) { found = p; break; }
      if (found) { anyPeriodic++; results.push(`x=${x},j=${j}:PERIOD ${found}`); }
      let best = 0, bestP = 0;
      for (let p = 1; p <= 256; p++) {
        let t = lo;
        while (t + p < hi && d[t] === d[t + p]) t++;
        if (t - lo > best) { best = t - lo; bestP = p; }
      }
      runs.push([best, x, j, bestP]);
    }
  }
  runs.sort((a, b) => b[0] - a[0]);
  console.log(`H  d_{j,x}(t) = c(t) XOR cell(t+j, x), x in [-24,24], j in [-8,24], the trivial (0,0) dropped: ${nseq} sequences`);
  console.log(`H  sequences with a period p <= ${PMAX} holding from t = ${ONSET} to t = ${TROW}: ${anyPeriodic}${anyPeriodic ? ' -- ' + results.join('; ') : ''}`);
  console.log(`H  longest runs of any period p <= 256 past t = ${ONSET}: ${runs.slice(0, 3).map((r) => `${r[0]} steps (x=${r[1]},j=${r[2]},p=${r[3]})`).join(', ')}`);
  // the diagonal family, with a much longer period search on a shorter window
  const deep = [];
  for (const L of [1, 2, 3, 4, 5, 8, 16, 32, 64]) {
    const hi = TROW - L - 2;
    const d = new Uint8Array(hi);
    for (let t = 0; t < hi; t++) d[t] = cc[t] ^ col.get(L)[t + L];
    let found = 0;
    for (let p = 1; p <= 16384; p++) if (hasPeriod(d, p, 30000, hi)) { found = p; break; }
    deep.push(`L=${L}:${found ? 'PERIOD ' + found : 'none <= 16384 on [30000, ' + hi + ')'}`);
  }
  console.log(`H  the diagonal family d_L(t) = c(t) XOR cell(t+L, L): ${deep.join(' ')}`);
  // the special diagonal family d_L(t) = c(t) xor cell(t+L, L): where it first turns on
  const P = globalThis.__P;
  const on = [];
  for (const L of [1, 2, 4, 8, 16, 32, 64]) {
    const d = [];
    for (let t = 0; t + L < TROW; t++) d.push(cc[t] ^ col.get(L)[t + L]);
    let first = -1;
    for (let t = 0; t < d.length; t++) if (d[t]) { first = t; break; }
    const dens = d.reduce((a, b) => a + b, 0) / d.length;
    // K(L) = last k with P_k <= L
    let K = -1;
    for (let k = 0; k <= KMAX; k++) if (P[k] > 0 && P[k] <= L) K = k;
    on.push(`L=${L}: first nonzero at t=${first} (last k with P_k<=L is ${K}), density ${dens.toFixed(4)}`);
  }
  console.log(`H  ${on.join('\n   ')}`);
}

// ---------------------------------------------------------------------------
// I. Transfer functions: the running XOR of c, and of the two halves of the
//    telescoped sum. If B were a coboundary with a STRUCTURED transfer
//    function, its running XOR would show it.
// ---------------------------------------------------------------------------

{
  const runx = (v) => { const o = new Uint8Array(v.length); let a = 0; for (let i = 0; i < v.length; i++) { a ^= v[i]; o[i] = a; } return o; };
  const dens = (v) => (Array.from(v).reduce((a, b) => a + b, 0) / v.length).toFixed(4);
  const sh = (v, s) => { let a = 0, n = 0; for (let i = 0; i + s < v.length; i++) { n++; if (v[i] === v[i + s]) a++; } return (a / n).toFixed(4); };
  const psiC = runx(cc);
  console.log(`I  running XOR of c over ${TROW} terms: density ${dens(psiC)}; shift agreement 2^0..2^10 ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => sh(psiC, 1 << e)).join(' ')}`);
  const ONSET = 20000;
  const hasPeriod = (d, p, lo, hi) => { for (let t = lo; t + p < hi; t++) if (d[t] !== d[t + p]) return false; return true; };
  let f = 0;
  for (let p = 1; p <= 4096; p++) if (hasPeriod(psiC, p, ONSET, TROW)) { f = p; break; }
  console.log(`I  running XOR of c has a period p <= 4096 from t = ${ONSET}: ${f ? f : 'none'}`);
}

// ---------------------------------------------------------------------------
// J. The observable is at depth t. Anything continuous on the odometer factor
//    reads finitely many coordinates; how much of c can it see?
// ---------------------------------------------------------------------------

{
  // J1: is c a Toeplitz sequence? for each t, is there p with c(t + np) = c(t) for all n?
  const PMAXT = 8192, TT = 2000;
  let toe = 0;
  for (let t = 0; t < TT; t++) {
    let found = false;
    for (let p = 1; p <= PMAXT && !found; p++) {
      let ok = true;
      for (let u = t + p; u < TROW; u += p) if (cc[u] !== cc[t]) { ok = false; break; }
      if (ok) found = true;
    }
    if (found) toe++;
  }
  console.log(`J1 Toeplitz test: positions t < ${TT} with some p <= ${PMAXT} such that c(t+np) = c(t) for every n with t+np < ${TROW}: ${toe}`);

  // J2: a fixed depth d of the edge, as a predictor of c
  const o2 = [];
  for (const d of [1, 2, 4, 8, 16, 24, 32, 40]) {
    let a = 0, n = 0;
    for (let t = d; t < TROW; t++) { n++; if (ebit(t, d) === cc[t]) a++; }
    o2.push(`d=${d}:${(a / n).toFixed(4)}`);
  }
  console.log(`J2 the right diagonal at a fixed depth d, as a predictor of c(t): ${o2.join(' ')}`);

  // J3: the BEST predictor of c from the whole level-n odometer factor, i.e. the
  //     best function of t mod 2^n. Held-out on the second half.
  const o3 = [];
  for (let n = 1; n <= 14; n++) {
    const m = 1 << n, half = TROW >> 1;
    const tab = new Int32Array(2 * m);
    for (let t = 0; t < half; t++) tab[2 * (t % m) + cc[t]]++;
    let hit = 0, tot = 0;
    for (let t = half; t < TROW; t++) {
      const r = t % m; tot++;
      const pred = tab[2 * r + 1] > tab[2 * r] ? 1 : 0;
      if (pred === cc[t]) hit++;
    }
    o3.push(`2^${n}:${(hit / tot).toFixed(4)}`);
  }
  console.log(`J3 best function of t mod 2^n as a predictor of c, trained on the first half of ${TROW}, tested on the second: ${o3.join(' ')}`);
  console.log(`J3 chance level for a table of m cells trained on n samples is about 0.5 + 0.4 * sqrt(m / n)`);
}

console.log(`(${ms()})`);
