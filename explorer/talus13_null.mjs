// Talus, 2026-09-12.  The null model for D(a), the exact affine-relation space of
// the cone map's image, and the Nerode width at a FIXED lookahead.
//
// THE NULL.  The cone map x |-> W(x) = (cell(-1,0), cell(-2,0), ...) is injective
// with image of size exactly 2^v(K) inside {0,1}^K, where v(K) is the number of
// free bits column K actually reads.  If the image were an arbitrary set of that
// size, the target word 0^(a-1) 1 0^(K-a) would be matched to depth K whenever
// 2^v(K) >= 2^(K-a+1), i.e. while v(K) >= K - a + 1.  So the null predicts
//      D_null(a) = max { K : v(K) >= K - a + 1 }.
// Measuring v(K) rather than guessing it is the point: my own first guess was
// ceil(K/p) and it is wrong by a lag.

const P3 = [[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]];
const show = (w) => w.join("");

function triangle(word, xs, K, T) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= K + 1; k++) C.push(new Uint8Array(T + 3));
  for (let t = 0; t <= T + 2; t++) C[0][t] = word[t % p];
  const whites = []; for (let t = 0; t < p; t++) if (word[t] === 0) whites.push(t);
  for (let t = 0; t + 1 <= T + 1; t++) {
    let r = 0;
    if (word[t % p] === 0) {
      const m = Math.floor(t / p) * whites.length + whites.indexOf(t % p);
      r = m < xs.length ? xs[m] : 0;
    }
    C[1][t] = C[0][(t + 1) % p] ^ (C[0][t % p] | r);
  }
  for (let k = 2; k <= K; k++) for (let t = 0; t + k <= T + 1; t++) C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
  return C;
}
function coneWord(word, xs, K) {
  const T = word.length * (xs.length + 2) + 4;
  const C = triangle(word, xs, K, T);
  const out = []; for (let k = 1; k <= K; k++) out.push(C[k][0]);
  return out;
}

// --------------------------------------------------------------------------
// [v] v(K): how many free bits does the constraint at column K actually read?
// --------------------------------------------------------------------------
console.log(`[v] v(K) = the number of free bits x_m that column K's cone cell depends`);
console.log(`    on, measured by flipping each bit against 64 random backgrounds.`);
function vOf(word, K, M, trials) {
  let s = (0x243f6a88 ^ (K * 2654435761)) >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  const dep = new Array(M).fill(false);
  for (let tr = 0; tr < trials; tr++) {
    const x = []; for (let i = 0; i < M; i++) x.push(rnd());
    const base = coneWord(word, x, K)[K - 1];
    for (let i = 0; i < M; i++) {
      if (dep[i]) continue;
      x[i] ^= 1;
      if (coneWord(word, x, K)[K - 1] !== base) dep[i] = true;
      x[i] ^= 1;
    }
  }
  return dep.filter(Boolean).length;
}
const V = {};
for (const w of P3) {
  const M = 30, row = [];
  for (let K = 1; K <= 45; K++) row.push(vOf(w, K, M, 48));
  V[show(w)] = row;
  console.log(`    w=${show(w)}  K=1..45: ${row.join(",")}`);
}

// --------------------------------------------------------------------------
// [D] measured D(a) against the null prediction
// --------------------------------------------------------------------------
function coneDepth(word, a, JMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {
    if (j > best) best = j;
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const branch = word[j % p] === 0 ? [0, 1] : [0];
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ (C[0][j % p] | b);
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status };
}
console.log(`\n[D] measured D(a) against the null D_null(a) = max{K : v(K) >= K-a+1}.`);
console.log(`    word    a   measured   null   ratio`);
for (const w of P3) {
  const v = V[show(w)];
  for (const a of [10, 16, 20, 24, 28]) {
    let dn = 0;
    for (let K = 1; K <= 45; K++) if (v[K - 1] >= K - a + 1) dn = K;
    const r = coneDepth(w, a, 200, 4e8);
    const meas = r.status === "exact" ? r.best : r.status;
    console.log(`    ${show(w)}   ${String(a).padStart(2)}   ${String(meas).padStart(8)}   ${String(dn).padStart(4)}   ${typeof meas === "number" && dn > 0 ? (meas / dn).toFixed(3) : "-"}`);
  }
}

// --------------------------------------------------------------------------
// [L] the exact affine-relation space of the image, by Gaussian elimination
// --------------------------------------------------------------------------
console.log(`\n[L] the affine relations satisfied by every achievable row, w = 011.`);
console.log(`    The image has 2^v(K) points in {0,1}^K; a set that is an affine`);
console.log(`    subspace satisfies K - v(K) independent relations.  How many does it`);
console.log(`    actually satisfy?`);
{
  const W011 = [0, 1, 1], M = 16, KM = 45;
  const rows = [];
  for (let vv = 0; vv < (1 << M); vv++) {
    const x = []; for (let i = 0; i < M; i++) x.push((vv >> i) & 1);
    rows.push(coneWord(W011, x, KM));
  }
  const base = rows[0];
  console.log(`    K   v(K)   #relations   a subspace would have`);
  for (let K = 3; K <= KM; K += 3) {
    // relations: a with <a, w> constant = the orthogonal complement of the span of
    // {w - base}.  dim(complement) = K - rank.
    const vecs = [];
    for (const w of rows) {
      let b = 0n; for (let i = 0; i < K; i++) if (w[i] ^ base[i]) b |= 1n << BigInt(i);
      if (b) vecs.push(b);
    }
    // Gaussian elimination
    const piv = new Map();
    let rank = 0;
    for (let b of vecs) {
      while (b) {
        const hi = b.toString(2).length - 1;
        if (piv.has(hi)) b ^= piv.get(hi); else { piv.set(hi, b); rank++; break; }
      }
    }
    console.log(`   ${String(K).padStart(2)}   ${String(V["011"][K - 1]).padStart(3)}   ${String(K - rank).padStart(10)}   ${K - V["011"][K - 1]}`);
  }
  // name the relations at K = 12
  const K = 12;
  const vecs = [];
  for (const w of rows) { let b = 0; for (let i = 0; i < K; i++) if (w[i] ^ base[i]) b |= 1 << i; if (b) vecs.push(b); }
  const rels = [];
  for (let a = 1; a < (1 << K); a++) {
    let val = null, ok = true;
    for (const w of rows) { let s = 0; for (let i = 0; i < K; i++) if (a & (1 << i)) s ^= w[i]; if (val === null) val = s; else if (s !== val) { ok = false; break; } }
    if (ok) rels.push([a, val]);
  }
  console.log(`    every affine relation on the first ${K} columns (W_k = cell(-k,0)):`);
  for (const [a, val] of rels) {
    const parts = []; for (let i = 0; i < K; i++) if (a & (1 << i)) parts.push(`W${i + 1}`);
    console.log(`        ${parts.join(" + ")} = ${val}`);
  }
}

// --------------------------------------------------------------------------
// [N] Nerode width at a FIXED lookahead, so the numbers are comparable in K
// --------------------------------------------------------------------------
console.log(`\n[N] Nerode width of the image language at a fixed lookahead d.`);
console.log(`    A width that stops growing in K means a finite-state invariant.`);
{
  const W011 = [0, 1, 1], M = 18, KTOT = 3 * M;
  const words = [];
  for (let vv = 0; vv < (1 << M); vv++) {
    const x = []; for (let i = 0; i < M; i++) x.push((vv >> i) & 1);
    words.push(coneWord(W011, x, KTOT).join(""));
  }
  for (const d of [9, 15, 21]) {
    const out = [];
    for (let K = 3; K + d <= KTOT; K += 3) {
      const byPrefix = new Map();
      for (const w of words) {
        const p = w.slice(0, K), s = w.slice(K, K + d);
        let set = byPrefix.get(p); if (!set) { set = new Set(); byPrefix.set(p, set); }
        set.add(s);
      }
      const sigs = new Set();
      for (const [, set] of byPrefix) sigs.add([...set].sort().join("|"));
      out.push(`${K}:${sigs.size}`);
    }
    console.log(`    lookahead ${String(d).padStart(2)}   ${out.join("  ")}`);
  }
}
