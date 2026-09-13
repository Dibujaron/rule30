// Groma, 2026-09-13. The seed's own KZ rungs, measured on the orbit rather than
// on the cone class, so that the topic handed to a theorist is not vacuous.
//
// g(n, N) = the least L such that the block centerColumn[N, N+L) already
// satisfies KZ rung n (some n-window inside the block sees >= 2n patterns).
// The cone bound f(n, a) of groma2_deep.mjs is a bound on the max of g(n, N)
// over the whole class A2(a), so g(n, N) <= f(n, N) must hold for every N, and
// the gap between them says how much slack the cone argument is carrying.

const T = 400000;

function centreColumn30(T) {
  const words = ((2 * T + 2) >> 5) + 2;
  const a = new Uint32Array(words);
  a[0] = 1;
  const c = new Uint8Array(T + 1);
  let top = 0;
  for (let t = 0; t <= T; t++) {
    c[t] = (a[t >>> 5] >>> (t & 31)) & 1;
    if (t === T) break;
    const nt = ((2 * (t + 1)) >>> 5) + 1;
    if (nt > top) top = Math.min(nt, words - 1);
    for (let i = top; i >= 0; i--) {
      const cur = a[i], lo = i > 0 ? a[i - 1] : 0;
      const s1 = ((cur << 1) | (lo >>> 31)) >>> 0;
      const s2 = ((cur << 2) | (lo >>> 30)) >>> 0;
      a[i] = (s2 ^ (s1 | cur)) >>> 0;
    }
  }
  return c;
}
const c = centreColumn30(T);
console.log(`prefix t=0..23: ${Array.from(c.slice(0, 24)).join('')}  (orientation guard)`);

// least L with rung n satisfied inside c[N, N+L)
function g(n, TARGET, N, LCAP) {
  const masks = new Map(); // key -> mask
  for (let L = 1; L <= LCAP; L++) {
    const i = N + L - 1; // the new letter
    // all windows {0=d1<...<dn} whose last position is i, inside [N, i]
    // enumerate lookbacks 0 = l_n < ... < l_1 <= i - N
    const maxlb = i - N;
    const lb = new Array(n).fill(0);
    const rec = (idx, next) => {
      if (idx === n) {
        let code = 0;
        for (let r = 0; r < n; r++) code = (code << 1) | c[i - lb[r]];
        const key = lb.join(',');
        const m = (masks.get(key) || 0) | (1 << code);
        masks.set(key, m);
        let pc = 0, x = m;
        while (x) { pc += x & 1; x >>= 1; }
        if (pc >= TARGET) throw L;
        return;
      }
      for (let d = next; d >= 0; d--) { lb[idx] = d; rec(idx + 1, d - 1); }
    };
    try { rec(0, maxlb); } catch (L2) { return L2; }
  }
  return -1;
}

for (const [n, TARGET] of [[1, 2], [2, 4], [3, 6], [4, 8]]) {
  let worst = 0, worstN = -1, fails = 0;
  const NMAX = 20000;
  for (let N = 0; N < NMAX; N++) {
    const L = g(n, TARGET, N, 200);
    if (L < 0) { fails++; continue; }
    if (L > worst) { worst = L; worstN = N; }
  }
  console.log(`KZ rung ${n}: over starts N = 0..${NMAX - 1}, the seed satisfies the rung within`);
  console.log(`   at most ${worst} rows (worst start N = ${worstN});  starts never satisfying it within 200: ${fails}`);
}
