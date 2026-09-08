/**
 * Portage (connector, 2026-09-08): the in-degree-one pair map on period-L
 * settled words, and whether it has a profinite limit.
 *
 *   node explorer/portage_pairmap.mjs
 *
 * The left-diagonal recurrence on settled words is
 *     w(j) = u(j+1) XOR ( v(j) OR w(j-1) ),        u = S_{k-2}, v = S_{k-1}
 * and the pair map is T(u, v) = (v, w). Three things are checked.
 *
 *  1. In-degree one. Backwards, u(j+1) = w(j) XOR (v(j) OR w(j-1)) is total
 *     and single-valued, so every pair has exactly one predecessor. Forwards
 *     the map is partial and two-valued exactly on {v = 0}. Counted
 *     exhaustively: the image of the backward map should have size
 *     4^L - 2^(L-1), missing exactly the pairs (u, 0) with u of odd weight.
 *
 *  2. The cycle structure of the forward map restricted to where it is a
 *     bijection, for small L. This is what governs the gaps between white
 *     diagonals, i.e. between period doublings.
 *
 *  3. THE PROFINITE TEST. The spaces X_n (pairs of period-2^n words) sit
 *     inside X_{n+1} by pullback, so they form a DIRECT system: the union is
 *     the locally constant functions on Z_2, which is not compact. For a
 *     compact (profinite) limit one needs SURJECTIONS X_{n+1} -> X_n. The
 *     natural one in F_2[Z/2^(n+1)] = F_2[T]/(T^(2^(n+1))) is multiplication
 *     by T^(2^n), i.e. fold(w)(j) = w(j) XOR w(j + 2^n). This script asks
 *     whether fold commutes with the pair map. If it does not, there is no
 *     inverse limit carrying the dynamics, and no compactness argument on
 *     the settled words is available.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const bit = (w, j, L) => (w >> (((j % L) + L) % L)) & 1;
const weight = (w, L) => { let s = 0; for (let j = 0; j < L; j++) s += (w >> j) & 1; return s; };

/** Periodic solutions w of w(j) = u(j+1) XOR (v(j) OR w(j-1)) of period L. */
function forward(u, v, L) {
  if (v !== 0) {
    // start at a j0 with v(j0) = 1: there w(j0) = u(j0+1) XOR 1, no dependence
    let j0 = -1;
    for (let j = 0; j < L; j++) if (bit(v, j, L)) { j0 = j; break; }
    let w = 0, prev = bit(u, j0 + 1, L) ^ 1;
    w |= prev << (j0 % L);
    for (let m = 1; m < L; m++) {
      const j = j0 + m;
      const x = bit(u, j + 1, L) ^ (bit(v, j, L) | prev);
      w |= x << (((j % L) + L) % L);
      prev = x;
    }
    // check it closes
    const jn = j0 + L;
    if ((bit(u, jn + 1, L) ^ (bit(v, jn, L) | prev)) !== bit(w, j0, L)) return [];
    return [w];
  }
  // v = 0: w(j) = u(j+1) XOR w(j-1); closes with period L iff u has even weight
  if (weight(u, L) % 2 === 1) return [];
  const out = [];
  for (const w0 of [0, 1]) {
    let w = w0, prev = w0;
    for (let j = 1; j < L; j++) { const x = bit(u, j + 1, L) ^ prev; w |= x << j; prev = x; }
    if ((bit(u, 1, L) ^ prev) === w0) out.push(w);
  }
  return out;
}

/** The unique predecessor: u(j+1) = w(j) XOR (v(j) OR w(j-1)). */
function backward(v, w, L) {
  let u = 0;
  for (let j = 0; j < L; j++) {
    const x = bit(w, j, L) ^ (bit(v, j, L) | bit(w, j - 1, L));
    u |= x << (((j + 1) % L + L) % L);
  }
  return u;
}

for (const L of [2, 4, 8]) {
  const M = 1 << L;
  // 1. in-degree one
  const seen = new Set();
  let bad = 0;
  for (let v = 0; v < M; v++) for (let w = 0; w < M; w++) {
    const u = backward(v, w, L);
    seen.add(u * M + v);
    // consistency: w must be one of the forward solutions of (u, v)
    if (!forward(u, v, L).includes(w)) bad++;
  }
  const missing = [];
  for (let u = 0; u < M; u++) if (!seen.has(u * M + 0)) missing.push(u);
  console.log(`L=${L}: image of the backward map ${seen.size} of ${M * M} (predicted ${M * M - M / 2}); pairs with no predecessor ${M * M - seen.size}, all of the form (u, 0) with odd weight: ${missing.every((u) => weight(u, L) % 2 === 1) && missing.length === M / 2}; forward/backward inconsistencies ${bad}`);

  // 2. cycle lengths under the backward map (a total function)
  const vis = new Int8Array(M * M);
  const lens = new Map();
  for (let s = 0; s < M * M; s++) {
    if (vis[s]) continue;
    const idx = new Map();
    let x = s, n = 0;
    while (!vis[x] && !idx.has(x)) { idx.set(x, n++); const v = x / M | 0, w = x % M; x = backward(v, w, L) * M + v; }
    if (idx.has(x)) { const len = n - idx.get(x); lens.set(len, (lens.get(len) || 0) + 1); }
    for (const y of idx.keys()) vis[y] = 1;
  }
  console.log(`L=${L}: cycle lengths of the backward map (u = pred): ${[...lens.entries()].sort((a, b) => a[0] - b[0]).map(([l, n]) => `${l}x${n}`).join(' ')}`);
}

// 3. THE PROFINITE TEST
console.log('');
for (const n of [1, 2]) {   // n = 3 means 4^16 pairs, out of reach
  const L = 1 << (n + 1), Ls = 1 << n, M = 1 << L;
  const fold = (w) => { let f = 0; for (let j = 0; j < Ls; j++) f |= (bit(w, j, L) ^ bit(w, j + Ls, L)) << j; return f; };
  const trunc = (w) => w & ((1 << Ls) - 1);
  let tot = 0, okFold = 0, okTrunc = 0;
  for (let u = 0; u < M; u++) for (let v = 0; v < M; v++) {
    const big = forward(u, v, L);
    if (big.length !== 1) continue;
    const w = big[0];
    for (const [name, f, cnt] of [['fold', fold, 0], ['trunc', trunc, 0]]) {
      const small = forward(f(u), f(v), Ls);
      const hit = small.length >= 1 && small.some((z) => z === f(w));
      if (name === 'fold') { if (hit) okFold++; } else if (hit) okTrunc++;
    }
    tot++;
  }
  console.log(`profinite test, 2^${n + 1} -> 2^${n}: over ${tot} pairs where the big map is single-valued, fold commutes ${okFold} (${(okFold / tot).toFixed(3)}), truncation commutes ${okTrunc} (${(okTrunc / tot).toFixed(3)})`);
}
