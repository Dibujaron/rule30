// Rosetta, 2026-09-12. The three fetched hypotheses, measured on the object.
//
// (a) PFR / Marton (Gowers-Green-Manners-Tao, arXiv:2311.05762, Thm 1.2, C=12):
//     |A+A| <= K|A|  =>  A is covered by at most 2K^12 cosets of a subgroup of
//     size at most |A|. Density-free, so it survives the scaling seam. Its
//     CONCLUSION is non-trivial only if 2K^12 |A| < |G|, i.e. K^12 < 4^t / 2.
//     So measure K on the right family and compare.
//
// (b) Sanders (arXiv:1011.0107, Thm A.1): density alpha in F_2^n gives a
//     subspace of codimension O(log^4 (2/alpha)) inside 4A. With alpha = 4^-t
//     that is O(t^4), non-trivial only if t^4 << n = m + 2t.
//
// (c) The cocycle. rowStep(r) = 4r XOR (2r|r) = L(r) XOR Q(r) with L linear
//     (rule 150) and Q(r) = 2r AND r, so
//        rowStep(x) XOR rowStep(y) = rowStep(x XOR y) XOR B(x,y),
//        B(x,y) = (2x AND y) XOR (2y AND x),
//     exactly: an almost-homomorphism with a symmetric bilinear defect. Tested.
//     Then the ANF degree of Phi_t, which is what the Gowers hierarchy is
//     indexed by.

const step30 = (r) => (4 * r) ^ ((2 * r) | r);
const pc = (x) => { let c = 0; while (x) { x &= x - 1; c++; } return c; };

// ---- (c) the cocycle identity, exhaustively -------------------------------
{
  console.log('=== the cocycle: rowStep(x)^rowStep(y) = rowStep(x^y) ^ B(x,y) ===');
  const B = (x, y) => ((2 * x) & y) ^ ((2 * y) & x);
  let bad = 0, n = 0, nonzero = 0;
  for (let x = 0; x < 512; x++) for (let y = 0; y < 512; y++) {
    n++;
    if ((step30(x) ^ step30(y)) !== (step30(x ^ y) ^ B(x, y))) bad++;
    if (B(x, y) !== 0) nonzero++;
  }
  console.log(`  ${n - bad}/${n} pairs satisfy it exactly; B nonzero on ${nonzero}/${n}`);
  console.log(`  (B identically zero would make rule 30 additive, so a nonzero`);
  console.log(`   count is what makes the check informative rather than vacuous)`);
  // and the mirror: does rule 90 have B = 0?
  const step90 = (r) => (4 * r) ^ r;
  let bad90 = 0;
  for (let x = 0; x < 512; x++) for (let y = 0; y < 512; y++)
    if ((step90(x) ^ step90(y)) !== step90(x ^ y)) bad90++;
  console.log(`  rule 90 is exactly additive: ${bad90 === 0 ? 'YES (0 failures)' : 'NO'}`);
  console.log();
}

// ---- ANF degree of Phi_t --------------------------------------------------
{
  console.log('=== ANF degree of the depth-t row map (Gowers hierarchy index) ===');
  console.log('degree of output bit b as a polynomial in the m free config bits;');
  console.log('the table reports the maximum over b. Bound: 2^t, capped by m.\n');
  for (const m of [10, 14, 18]) {
    const row = [];
    for (let t = 1; t <= 6; t++) {
      const N = m + 2 * t;
      // truth table of each output bit over all 2^m configs, then Mobius
      const size = 1 << m;
      const img = new Int32Array(size);
      for (let c = 0; c < size; c++) { let r = c; for (let s = 0; s < t; s++) r = step30(r); img[c] = r; }
      let maxdeg = 0;
      for (let b = 0; b < N; b++) {
        const f = new Uint8Array(size);
        for (let c = 0; c < size; c++) f[c] = (img[c] >> b) & 1;
        // Mobius (ANF) transform
        for (let i = 0; i < m; i++)
          for (let c = 0; c < size; c++) if (c & (1 << i)) f[c] ^= f[c ^ (1 << i)];
        for (let c = 0; c < size; c++) if (f[c]) { const d = pc(c); if (d > maxdeg) maxdeg = d; }
      }
      row.push(`t=${t}: ${maxdeg} (2^t=${2 ** t})`);
    }
    console.log(`  m=${m}: ${row.join('   ')}`);
  }
  console.log();
}

// ---- (a) doubling on the cube family, against PFR's constant ---------------
{
  console.log('=== doubling of the reachable set, against PFR Thm 1.2 (C=12) ===');
  console.log('A = { Phi_t(c) : c in F_2^m, bit 0 black } in F_2^N, N = m+2t.');
  console.log('PFR bites only if 2K^12 |A| < |G|, i.e. K <= (4^t/2)^(1/12).\n');
  for (const [m, t] of [[12, 2], [12, 3], [12, 4], [14, 3], [16, 2], [10, 5]]) {
    const N = m + 2 * t;
    const K0 = 1 << (m - 1);
    const mem = new Int32Array(K0);
    for (let hi = 0; hi < K0; hi++) { let r = 1 | (hi << 1); for (let s = 0; s < t; s++) r = step30(r); mem[hi] = r; }
    const hit = new Uint8Array(1 << N);
    for (let i = 0; i < K0; i++) for (let j = i; j < K0; j++) hit[mem[i] ^ mem[j]] = 1;
    let ss = 0; for (let i = 0; i < (1 << N); i++) ss += hit[i];
    const K = ss / K0;
    const need = Math.pow(4 ** t / 2, 1 / 12);
    console.log(`  m=${m} t=${t}: |A|=${K0}  |A+A|/|A| = ${K.toFixed(2)}`
      + `   PFR needs K <= ${need.toFixed(3)}   -> ${K <= need ? 'APPLIES' : 'VACUOUS'}`
      + `   (2K^12|A|/|G| = ${(2 * Math.pow(K, 12) * K0 / 2 ** N).toExponential(2)})`);
  }
  console.log();
}

// ---- (b) Sanders' codimension against the ambient dimension ---------------
{
  console.log('=== Sanders Thm A.1: cod V = O(log^4 (2/alpha)) with alpha = 4^-t ===');
  console.log('Taking the O() as 1 (the most generous possible reading), the');
  console.log('conclusion is non-trivial only when log^4(2*4^t) < n = m + 2t.\n');
  for (const t of [1, 2, 3, 4, 5, 10, 20]) {
    const cod = Math.pow(Math.log2(2 * 4 ** t), 4);
    const mNeeded = Math.max(0, Math.ceil(cod) - 2 * t);
    console.log(`  t=${t}: log2(2/alpha)=${(2 * t + 1)}  cod<=~${cod.toFixed(0)}`
      + `  needs span n > ${cod.toFixed(0)}, i.e. excess span m > ${mNeeded}`
      + `   (the seed has m = 1)`);
  }
  console.log();
}

// ---- the seed's fibre is a single point ------------------------------------
{
  console.log('=== the fibre the prize lives in ===');
  console.log('Span grows by exactly 2 a step (both cone edges black), so a word');
  console.log('of span n is a t-step image only of a config of span n-2t.\n');
  for (const t of [1, 2, 3, 4, 5]) {
    // count span-exact reachable words at each span, by brute force
    const out = [];
    for (const n of [2 * t + 1, 2 * t + 2, 2 * t + 3, 2 * t + 6]) {
      const m = n - 2 * t;
      if (m < 1) { out.push(`n=${n}:0`); continue; }
      const set = new Set();
      const lo = m === 1 ? 1 : (1 << (m - 1)) | 1;
      const hiMask = m === 1 ? 1 : ((1 << (m - 2)) - 1);
      for (let mid = 0; mid <= hiMask; mid++) {
        const c = m === 1 ? 1 : (1 | (mid << 1) | (1 << (m - 1)));
        let r = c; for (let s = 0; s < t; s++) r = step30(r);
        set.add(r);
      }
      out.push(`n=${n}: ${set.size}`);
    }
    console.log(`  t=${t}  |{reachable words of span exactly n}| :  ${out.join('   ')}`);
  }
  // does the seed have a finite preimage?
  let found = 0;
  for (let c = 1; c < (1 << 20); c++) if (step30(c) === 1) found++;
  console.log(`\n  finite configs whose 1-step image is the single seed: ${found}`);
  console.log('  (so the seed is in R_t and not in R_{t+1}: its row sits on the');
  console.log('   boundary of the nested chain R_1 > R_2 > ... at every depth)');
  console.log();
  // weight spread at fixed t, growing m: the coding-theory row
  console.log('=== weight spread of the reachable set (the e-balanced-code row) ===');
  for (const t of [2, 4]) {
    for (const m of [8, 12, 16]) {
      const K0 = 1 << (m - 1);
      let wmin = 1e9, wmax = -1;
      for (let hi = 0; hi < K0; hi++) {
        let r = 1 | (hi << 1); for (let s = 0; s < t; s++) r = step30(r);
        const w = pc(r) / (m + 2 * t);
        if (w < wmin) wmin = w; if (w > wmax) wmax = w;
      }
      console.log(`  t=${t} m=${m} N=${m + 2 * t}: weight fraction in [${wmin.toFixed(4)}, ${wmax.toFixed(4)}]`);
    }
  }
}
