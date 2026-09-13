// Astrolabe, 2026-09-13.  The two-way bound, which the row count does NOT give.
//
// log2(#distinct rows) is the ONE-WAY complexity D^{A->B}(f) -- Fact 7 of
// arXiv cs/0111062, "D(f) = ceil(log row(f))".  It is NOT a lower bound on the
// two-way complexity D(f), which can be far smaller.  For D(f) the standard
// unconditional bound is log-rank, and the rank must be taken over a field of
// characteristic 0 (or any field) -- my previous sighting measured the rank
// over F_2, which for a 0/1 matrix is typically far below the rational rank,
// and read off "about t/2".  This script measures the rank over a large prime,
// which lower-bounds the rational rank, and so gives the honest two-way bound.
//
// Matrix: DRT's M_c^n, rows indexed by Alice's n cells left of the origin,
// columns by Bob's n cells right of it, centre fixed to c, entry = origin cell
// at time n.
//
// Exact: the matrix is built exhaustively and the elimination is exact modular
// arithmetic.  rank mod p <= rank over Q, so a large rank mod p is a
// certificate and never an overestimate.

const P = 1000003; // p^2 < 2^53, so products are exact in doubles

function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

function buildMatrix(rule, n, centre) {
  const N = 1 << n;
  const M = new Uint8Array(N * N);
  const width = 2 * n + 1;
  const cur = new Uint8Array(width), nxt = new Uint8Array(width);
  for (let a = 0; a < N; a++) {
    for (let b = 0; b < N; b++) {
      cur.fill(0);
      for (let k = 0; k < n; k++) { cur[k] = (a >> k) & 1; cur[n + 1 + k] = (b >> k) & 1; }
      cur[n] = centre;
      let lo = 0, hi = width - 1;
      let src = cur, dst = nxt;
      for (let t = 0; t < n; t++) {
        const nlo = lo + 1, nhi = hi - 1;
        for (let i = nlo; i <= nhi; i++) dst[i] = ruleBit(rule, src[i - 1], src[i], src[i + 1]);
        const tmp = src; src = dst; dst = tmp;
        lo = nlo; hi = nhi;
      }
      M[a * N + b] = src[n];
      if (src !== cur) { /* keep buffers straight */ }
      // restore: src may be nxt; next iteration refills cur anyway, but if src
      // is nxt we must make sure `cur` is the one we refill.  Copy back.
      if (src === nxt) { cur.set(src); }
    }
  }
  return M;
}

function powmod(a, e, p) { let r = 1; a %= p; while (e > 0) { if (e & 1) r = (r * a) % p; a = (a * a) % p; e >>= 1; } return r; }

function rankModP(M, N) {
  // rows as Float64Array of ints mod P
  const rows = [];
  for (let i = 0; i < N; i++) {
    const r = new Float64Array(N);
    for (let j = 0; j < N; j++) r[j] = M[i * N + j];
    rows.push(r);
  }
  let rank = 0;
  for (let col = 0; col < N && rank < N; col++) {
    let piv = -1;
    for (let i = rank; i < N; i++) if (rows[i][col] !== 0) { piv = i; break; }
    if (piv < 0) continue;
    const tmp = rows[rank]; rows[rank] = rows[piv]; rows[piv] = tmp;
    const pr = rows[rank];
    const inv = powmod(pr[col], P - 2, P);
    for (let j = col; j < N; j++) pr[j] = (pr[j] * inv) % P;
    for (let i = 0; i < N; i++) {
      if (i === rank) continue;
      const f = rows[i][col];
      if (f === 0) continue;
      const ri = rows[i];
      for (let j = col; j < N; j++) {
        let v = ri[j] - f * pr[j] % P;
        if (v < 0) v += P;
        ri[j] = v % P;
      }
    }
    rank++;
  }
  return rank;
}

function rankF2(M, N) {
  const words = Math.ceil(N / 32);
  const rows = [];
  for (let i = 0; i < N; i++) {
    const r = new Uint32Array(words);
    for (let j = 0; j < N; j++) if (M[i * N + j]) r[j >>> 5] |= 1 << (j & 31);
    rows.push(r);
  }
  let rank = 0;
  for (let col = 0; col < N && rank < N; col++) {
    const w = col >>> 5, bit = 1 << (col & 31);
    let piv = -1;
    for (let i = rank; i < N; i++) if (rows[i][w] & bit) { piv = i; break; }
    if (piv < 0) continue;
    const tmp = rows[rank]; rows[rank] = rows[piv]; rows[piv] = tmp;
    const pr = rows[rank];
    for (let i = 0; i < N; i++) {
      if (i === rank) continue;
      if (rows[i][w] & bit) { const ri = rows[i]; for (let k = 0; k < words; k++) ri[k] ^= pr[k]; }
    }
    rank++;
  }
  return rank;
}

console.log('Rank of DRT\'s M_0^n (centre fixed white).  N = 2^n.');
console.log('log2 rank_p lower-bounds the TWO-WAY complexity D(f) by log-rank;');
console.log('the trivial upper bound is n.  rank_F2 is what my previous sighting');
console.log('measured, and is shown beside it to make the difference visible.');
console.log('\nrule   n      N   rank mod p   log2      rank F2   log2F2    n');
for (const rule of [30, 45, 110, 90, 150, 22]) {
  for (let n = 3; n <= 10; n++) {
    const N = 1 << n;
    const M = buildMatrix(rule, n, 0);
    const rp = rankModP(M, N);
    const r2 = rankF2(M, N);
    console.log(String(rule).padStart(4) + String(n).padStart(4) + String(N).padStart(7) +
      String(rp).padStart(13) + Math.log2(Math.max(rp, 1)).toFixed(3).padStart(8) +
      String(r2).padStart(13) + Math.log2(Math.max(r2, 1)).toFixed(3).padStart(9) +
      String(n).padStart(5));
  }
  console.log('');
}

// validation: a uniformly random 0/1 matrix should be (near) full rank mod p
{
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) & 1; };
  for (const n of [8, 9]) {
    const N = 1 << n;
    const M = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) M[i] = rnd();
    console.log(`validation: random 0/1 matrix ${N}x${N}: rank mod p = ${rankModP(M, N)} (expect ${N}), rank F2 = ${rankF2(M, N)}`);
  }
}
