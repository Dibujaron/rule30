// Linear complexity profile of the rule 30 centre column over F_2.
// WHY: over a finite field, a sequence is eventually periodic  <=>  its generating function
// is rational  <=>  its Hankel determinants vanish from some point on. So the jumps of the
// linear-complexity profile are the zero-window sizes of the number wall, and a BOUNDED
// largest window is the precondition for the Thue-Morse / apwenian / Lunnon technology.
// Also: an eventually periodic sequence with pre-period a and period p has linear
// complexity at most a+p, so L(N) is a RIGOROUS LOWER BOUND on a+p.

function bmProfile(bitAt, N) {               // Berlekamp-Massey over GF(2), bitset-accelerated
  const W = (N >> 5) + 2;
  const C = new Uint32Array(W), B = new Uint32Array(W), T = new Uint32Array(W), S = new Uint32Array(W);
  C[0] = 1; B[0] = 1;
  let L = 0, m = -1;
  const jumps = [];
  const pc = v => { v = v - ((v >> 1) & 0x55555555); v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
    return (((v + (v >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24; };
  for (let n = 0; n < N; n++) {
    // S <<= 1 ; S[0] = s[n]      (bit i of S is s[n-i])
    let carry = 0;
    for (let w = 0; w < W; w++) { const v = S[w]; S[w] = ((v << 1) | carry) >>> 0; carry = v >>> 31; }
    if (bitAt(n)) S[0] |= 1;
    let d = 0;
    const lim = (L >> 5) + 1;
    for (let w = 0; w <= lim && w < W; w++) d ^= pc((C[w] & S[w]) >>> 0) & 1;
    if (d) {
      T.set(C);
      const sh = n - m, sw = sh >> 5, sb = sh & 31;
      for (let w = W - 1; w >= sw; w--) {
        let v = (B[w - sw] << sb) >>> 0;
        if (sb && w - sw - 1 >= 0) v = (v | (B[w - sw - 1] >>> (32 - sb))) >>> 0;
        C[w] = (C[w] ^ v) >>> 0;
      }
      if (2 * L <= n) { const old = L; L = n + 1 - L; m = n; B.set(T); jumps.push({ n, size: L - old }); }
    }
  }
  return { L, jumps };
}

// ---------- CONTROLS FIRST ----------
console.log("CONTROLS");
{ // eventually periodic: LC must stabilise well below N/2
  const pre = [1,0,1,1,0,0,1], per = [1,1,0,1,0];
  const f = n => n < pre.length ? pre[n] : per[(n - pre.length) % per.length];
  const { L } = bmProfile(f, 4000);
  console.log(`  eventually periodic (pre 7, period 5): L = ${L}  ${L <= 20 ? "PASS (stabilises)" : "*** FAIL ***"}`);
}
{ // xorshift32 is GF(2)-LINEAR, so its true linear complexity is exactly 32.
  // Keep it: it is the sharpest possible test that Berlekamp-Massey is correct, because
  // the right answer is a specific small number rather than a statistical range.
  let s = 2463534242; const rb = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  const bits = new Uint8Array(20000); for (let i = 0; i < bits.length; i++) bits[i] = rb();
  const { L } = bmProfile(n => bits[n], bits.length);
  console.log(`  xorshift32 (GF(2)-linear, 32-bit state): L = ${L}  ${L === 32 ? "PASS (recovers the exact recurrence order)" : "*** FAIL ***"}`);
}
{ // genuinely NONLINEAR control: LC must sit near N/2, jumps geometric
  let s = 0x9e3779b9 >>> 0;
  const rb = () => { s = (Math.imul(s ^ (s >>> 16), 0x7feb352d)) >>> 0;
                     s = (Math.imul(s ^ (s >>> 15), 0x846ca68b)) >>> 0; return (s >>> 13) & 1; };
  const bits = new Uint8Array(20000); for (let i = 0; i < bits.length; i++) bits[i] = rb();
  const { L, jumps } = bmProfile(n => bits[n], bits.length);
  const mx = Math.max(...jumps.map(j => j.size));
  console.log(`  nonlinear mixer N=20000: L = ${L} (expect ~${bits.length/2}), largest jump ${mx} (log2 N = ${Math.log2(bits.length).toFixed(1)})  ${Math.abs(L - bits.length/2) < 300 ? "PASS" : "*** FAIL ***"}`);
}

// ---------- RULE 30 ----------
const N = 60000, R = N + 64, NBIT = 2 * R + 64, NW = (NBIT + 31) >> 5, OFF = R;
const cur = new Uint32Array(NW), nxt = new Uint32Array(NW), A = new Uint32Array(NW), Bb = new Uint32Array(NW);
cur[OFF >> 5] |= (1 << (OFF & 31));
const col = new Uint8Array(N);
for (let t = 0; t < N; t++) {
  col[t] = (cur[OFF >> 5] >>> (OFF & 31)) & 1;
  let c = 0; for (let w = 0; w < NW; w++) { const v = cur[w]; A[w] = ((v << 1) | c) >>> 0; c = v >>> 31; }
  let b = 0; for (let w = NW - 1; w >= 0; w--) { const v = cur[w]; Bb[w] = ((v >>> 1) | (b << 31)) >>> 0; b = v & 1; }
  for (let w = 0; w < NW; w++) nxt[w] = (A[w] ^ (cur[w] | Bb[w])) >>> 0;
  cur.set(nxt);
}
console.log(`\n  (centre column prefix check: ${Array.from(col.slice(0,6)).join("")} — must be 110111)`);
const { L, jumps } = bmProfile(n => col[n], N);
const sizes = jumps.map(j => j.size);
const mx = Math.max(...sizes);
const hist = new Map(); for (const s of sizes) hist.set(s, (hist.get(s) || 0) + 1);
console.log(`\nRULE 30 CENTRE COLUMN, first N = ${N} bits`);
console.log(`  linear complexity L(N) = ${L}   (N/2 = ${N/2}, ratio ${(L/(N/2)).toFixed(5)})`);
console.log(`  => any eventual period p with pre-period a satisfies a + p >= ${L}`);
console.log(`  number of jumps: ${sizes.length}`);
console.log(`  LARGEST JUMP (largest zero-window in the number wall): ${mx}`);
console.log(`  jump-size histogram:`);
[...hist.entries()].sort((a,b)=>a[0]-b[0]).forEach(([s,n]) =>
  console.log(`    size ${String(s).padStart(3)}: ${String(n).padStart(6)}   (geometric prediction ${(sizes.length * Math.pow(2,-s)).toFixed(1)})`));
console.log(`  largest jump located at n = ${jumps.find(j=>j.size===mx).n}`);

// ---------- does the largest zero-window grow, and how? ----------
// Apwenian sequences (Thue-Morse and friends) have ALL Hankel determinants nonzero,
// i.e. largest window 0, forever. That is what the Han / Bugeaud-Han / Lunnon technology
// needs. A window growing like log2(N) is the random-sequence signature instead.
console.log("\nSCALING OF THE LARGEST ZERO-WINDOW (rule 30 centre column)");
console.log("     N      L(N)   L/(N/2)   largest window   log2(N)");
for (const n of [7500, 15000, 30000, 60000]) {
  const r = bmProfile(k => col[k], n);
  const mxw = Math.max(...r.jumps.map(j => j.size));
  console.log(`  ${String(n).padStart(6)}  ${String(r.L).padStart(7)}   ${(r.L/(n/2)).toFixed(5)}   ${String(mxw).padStart(14)}   ${Math.log2(n).toFixed(2)}`);
}
