// Dioptra, 2026-09-10.  Two small things the document needs.
//
// (1) The jump histogram of Thue-Morse's linear complexity profile, to say
//     precisely what "rigid" means there.
// (2) The SWITCH-INDEX sequence.  Obstruction 9 reduces the wall to "column 1,
//     read at the WHITE times of the centre column, is eventually periodic".
//     The kernel-proved 0*1* law (explorer/dioptra_scratch_whiterun.lean) says
//     column 1 on a maximal white run of length L is 0^a 1^(L-a).  So the whole
//     residual content of column 1 at white times is one integer per white run:
//     the switch index a.  This prints that sequence and its statistics.

const N = 60000;
function bmProfile(s) {
  const n = s.length;
  const C = new Uint8Array(n + 1); C[0] = 1;
  const B = new Uint8Array(n + 1); B[0] = 1;
  const T = new Uint8Array(n + 1);
  const profile = new Int32Array(n + 1);
  let L = 0, m = 1;
  for (let k = 0; k < n; k++) {
    let d = s[k];
    for (let i = 1; i <= L; i++) if (C[i]) d ^= s[k - i];
    if (d === 0) m += 1;
    else if (2 * L <= k) {
      T.set(C.subarray(0, L + 1)); for (let i = L + 1; i <= n; i++) T[i] = 0;
      for (let i = 0; i + m <= n; i++) if (B[i]) C[i + m] ^= 1;
      const nl = k + 1 - L; B.set(T.subarray(0, n + 1)); L = nl; m = 1;
    } else { for (let i = 0; i + m <= n; i++) if (B[i]) C[i + m] ^= 1; m += 1; }
    profile[k + 1] = L;
  }
  return profile;
}

console.log('=== 1. jump histograms of the linear complexity profile, n = ' + N + ' ===');
{
  const tm = new Uint8Array(N);
  for (let i = 0; i < N; i++) { let v = i, b = 0; while (v) { b ^= v & 1; v >>>= 1; } tm[i] = b; }
  const p = bmProfile(tm);
  const h = new Map();
  for (let k = 1; k <= N; k++) { const j = p[k] - p[k - 1]; if (j > 0) h.set(j, (h.get(j) ?? 0) + 1); }
  console.log('  Thue-Morse : ' + [...h.keys()].sort((a, b) => a - b).map(k => `degree ${k}: ${h.get(k)}`).join('   '));
  // which Hankel matrices are nonsingular?
  const nz = []; for (let m = 1; 2 * m <= N && nz.length < 20; m++) if (p[2 * m] === m) nz.push(m);
  console.log('  Thue-Morse : first 20 m with H_m nonsingular over F_2 : ' + nz.join(' '));
}

console.log('\n=== 2. the switch-index sequence of the seed ===');
{
  const T = 200000, PAD = 6;
  const w = 2 * T + 2 * PAD + 3, off = T + PAD;
  let cur = new Uint8Array(w); cur[off] = 1;
  const c0 = new Uint8Array(T), c1 = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c0[t] = cur[off]; c1[t] = cur[off + 1];
    const nxt = new Uint8Array(w);
    for (let i = 1; i < w - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    cur = nxt;
  }
  // maximal white runs of the centre column, and the switch index of column 1
  const idx = [], lens = [];
  let t = 0, badShape = 0;
  while (t < T) {
    if (c0[t] === 1) { t++; continue; }
    const s = t; while (t < T && c0[t] === 0) t++;
    const e = t - 1;
    if (e >= T - 1) break;
    const L = e - s + 1;
    // column 1 on [s, e] must be 0^a 1^(L-a)
    let a = 0; while (a < L && c1[s + a] === 0) a++;
    for (let r = s + a; r <= e; r++) if (c1[r] !== 1) badShape++;
    idx.push(a); lens.push(L);
  }
  console.log(`  rows ${T}: ${idx.length} maximal white runs, shape violations of 0^a 1^b : ${badShape}`);
  console.log(`  first 40 switch indices : ${idx.slice(0, 40).join(' ')}`);
  console.log(`  first 40 run lengths    : ${lens.slice(0, 40).join(' ')}`);
  const hist = new Map(); for (const a of idx) hist.set(a, (hist.get(a) ?? 0) + 1);
  console.log('  switch-index histogram  : ' + [...hist.keys()].sort((a, b) => a - b).slice(0, 12).map(k => `${k}:${hist.get(k)}`).join('  '));
  const bits = lens.reduce((acc, L) => acc + Math.log2(L + 1), 0);
  const whites = lens.reduce((a, b) => a + b, 0);
  console.log(`  white centre cells ${whites}; bits if column 1 were free there ${whites}`);
  console.log(`  bits after the 0*1* law (sum log2(L+1))                        ${bits.toFixed(0)}`);
  console.log(`  the wall is now: is the switch-index sequence eventually periodic?`);
  // is the switch-index sequence itself obviously aperiodic?  distinct factors
  const s = idx.join(',');
  const facs = new Set();
  const arr = idx;
  for (let i = 0; i + 32 <= arr.length; i++) facs.add(arr.slice(i, i + 32).join(','));
  console.log(`  distinct length-32 factors of the switch-index sequence: ${facs.size} of ${arr.length - 31}`);
}
