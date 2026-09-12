// Rosetta, 2026-09-12. Two caveats on the numbers in the sighting document.
//
// (1) rosetta6_band.mjs computed the affine-hull codimension by searching only
//     characters supported in bits 0..2t, justified by the band theorem. But
//     the theorem only forbids relations whose LEAST set bit exceeds 2t; a
//     relation could have a low least bit and support reaching above 2t. So the
//     reported codimension is a lower bound until a full search is run. Run it.
//
// (2) Confirm the band theorem by a full sweep over every character, rather
//     than over the thresholded families, so the zeros are not an artefact of
//     how the enumeration was scoped.

const step30 = (r) => (4 * r) ^ ((2 * r) | r);

function members(m, t) {
  const K = 1 << (m - 1);
  const a = new Int32Array(K);
  for (let hi = 0; hi < K; hi++) { let r = 1 | (hi << 1); for (let s = 0; s < t; s++) r = step30(r); a[hi] = r; }
  return a;
}
function chi(mem, g) {
  let s = 0;
  for (let i = 0; i < mem.length; i++) { let p = mem[i] & g, c = 0; while (p) { p &= p - 1; c ^= 1; } s += c ? -1 : 1; }
  return s;
}
const lowBit = (g) => Math.log2(g & -g) | 0;

for (const [m, t] of [[10, 2], [10, 3], [12, 2], [12, 3], [8, 4]]) {
  const N = m + 2 * t, mem = members(m, t), K = mem.length;
  let exact = 0, exactBandOnly = 0, violate = 0, worstAbove = 0;
  const basis = [];
  for (let g = 1; g < (1 << N); g++) {
    const v = Math.abs(chi(mem, g));
    if (lowBit(g) > 2 * t) { if (v > worstAbove) worstAbove = v; }
    if (v === K) {
      exact++;
      if (g < (1 << (2 * t + 1))) exactBandOnly++;
      let x = g;
      for (const b of basis) if ((x ^ b) < x) x ^= b;
      if (x) { basis.push(x); basis.sort((p, q) => q - p); }
      // does any exact relation reach above bit 2t?
      if (g >= (1 << (2 * t + 1))) violate++;
    }
  }
  console.log(`m=${m} t=${t} N=${N} |A|=${K}`);
  console.log(`  FULL sweep over all ${(1 << N) - 1} characters:`);
  console.log(`    max |char sum| over min supp > 2t = ${worstAbove}   (band theorem wants 0)`);
  console.log(`    exact relations: ${exact} total, codim = ${basis.length}`);
  console.log(`    of them supported inside bits 0..2t only: ${exactBandOnly}`);
  console.log(`    relations reaching above bit 2t: ${violate}`
    + `   -> band-only search ${violate === 0 ? 'was COMPLETE' : 'UNDERCOUNTED'}`);
}
