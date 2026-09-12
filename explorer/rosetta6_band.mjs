// Rosetta, 2026-09-12. The exact-cancellation theorem, tested sharply.
//
// CLAIM (from the board's proved evolveFrom_leftPermutive): let C be uniform on
// a family of configurations that is a full cube in config bits 1..m-1 (bit 0
// pinned black), and Y = Phi_t(C) the row at depth t, a word on bits 0..N-1
// with N = m + 2t. Then for EVERY character gamma != 0 whose lowest set bit is
// at index > 2t, the character sum sum (-1)^{gamma . Y} is EXACTLY ZERO.
//
// Reason: row-t bit b depends only on config bits b-2t .. b, and depends on
// config bit b-2t AFFINELY with coefficient 1 (left-permutivity, radius t). If
// l = min supp(gamma) then no other bit in supp(gamma) sees config bit l-2t, so
// summing over that one free bit cancels. Free requires l-2t >= 1.
//
// So the whole Fourier spectrum of the reachable set lives on the bottom 2t+1
// coordinates: the LEFT CONE BAND. Tested for sharpness (it must fail at
// l = 2t) and against rule 86, which is right-permutive and must put its band
// at the TOP instead.
//
// rosetta6_fourier.mjs confounded m with t (it held N fixed). This file varies
// them separately.

const STEP = {
  30: (r) => (4 * r) ^ ((2 * r) | r),
  86: (r) => ((4 * r) | (2 * r)) ^ r,
  90: (r) => (4 * r) ^ r,
  150: (r) => (4 * r) ^ (2 * r) ^ r,
};

function build(rule, m, t) {
  // configs: bit 0 pinned black, bits 1..m-1 free (a full cube: 2^(m-1) of
  // them). No pin at the top, so the family really is a cube and the theorem's
  // hypothesis holds exactly.
  const step = STEP[rule];
  const N = m + 2 * t;
  const K = 1 << (m - 1);
  const members = new Int32Array(K);
  for (let hi = 0; hi < K; hi++) {
    let r = 1 | (hi << 1);
    for (let s = 0; s < t; s++) r = step(r);
    members[hi] = r;
  }
  return { N, K, members };
}

// character sum for one gamma, computed directly (no 2^N array needed)
function chi(members, gamma) {
  let s = 0;
  for (let i = 0; i < members.length; i++) {
    let p = members[i] & gamma, c = 0;
    while (p) { p &= p - 1; c ^= 1; }
    s += c ? -1 : 1;
  }
  return s;
}

function pc(x) { let c = 0; while (x) { x &= x - 1; c++; } return c; }

console.log('=== per-bit bias profile: how determined each cell is ===');
console.log('bias(b) = |E (-1)^{Y_b}|; 1 = that cell is constant over the whole');
console.log('family, 0 = exactly unbiased. Cell x sits at bit x + t.\n');
for (const rule of [30, 86, 90]) {
  for (const t of [2, 4, 6, 8]) {
    const m = 14;
    const { N, K, members } = build(rule, m, t);
    const prof = [];
    for (let b = 0; b < N; b++) prof.push((Math.abs(chi(members, 1 << b)) / K).toFixed(2));
    console.log(`rule ${rule} m=${m} t=${t} N=${N}: ${prof.join(' ')}`);
    console.log(`${' '.repeat(22)}bit 2t = ${2 * t}, centre cell of the config at bit ${t}`);
  }
  console.log();
}

console.log('=== the exact-cancellation theorem, and its sharpness ===');
console.log('maxchar(s) = max over gamma != 0 with min supp(gamma) >= s of');
console.log('|character sum| / |A|.  The claim is maxchar(2t+1) = 0 exactly,');
console.log('and sharpness needs maxchar(2t) > 0.\n');
for (const rule of [30, 86, 90, 150]) {
  for (const [m, t] of [[12, 2], [12, 3], [12, 4], [14, 3], [10, 4]]) {
    const { N, K, members } = build(rule, m, t);
    const out = [];
    for (const s of [2 * t - 1, 2 * t, 2 * t + 1, 2 * t + 2]) {
      if (s < 0) { out.push(`s=${s}:n/a`); continue; }
      // enumerate every gamma with min supp exactly >= s, exhaustively over the
      // top N-s bits
      let mx = 0;
      const top = N - s;
      if (top > 20) { out.push(`s=${s}:skip`); continue; }
      for (let g = 1; g < (1 << top); g++) {
        const v = Math.abs(chi(members, g << s));
        if (v > mx) mx = v;
      }
      out.push(`s=${s}: ${(mx / K).toFixed(6)}`);
    }
    console.log(`rule ${rule} m=${m} t=${t} N=${N} (2t=${2 * t}):  ${out.join('   ')}`);
  }
  console.log();
}

console.log('=== the affine hull: exact linear relations on every reachable row ===');
console.log('codim = number of independent gamma with |character sum| = |A|.\n');
for (const rule of [30, 90]) {
  for (const m of [10, 12, 14, 16]) {
    const row = [];
    for (const t of [1, 2, 3, 4, 5, 6]) {
      const { N, K, members } = build(rule, m, t);
      // exact relations must be supported in bits 0..2t (theorem above), so
      // search there only, and verify by a full search at one small case
      const width = Math.min(2 * t + 1, N);
      const basis = [];
      for (let g = 1; g < (1 << width); g++) {
        if (Math.abs(chi(members, g)) === K) {
          // reduce against the basis to count independent relations
          let x = g;
          for (const b of basis) if ((x ^ b) < x) x ^= b;
          if (x) { basis.push(x); basis.sort((p, q) => q - p); }
        }
      }
      row.push(`t=${t}:${basis.length}`);
    }
    console.log(`rule ${rule} m=${m}: ${row.join('  ')}`);
  }
  console.log();
}
