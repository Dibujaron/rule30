// Rosetta, 2026-09-12. Are rule 30's exact linear relations confined to the
// band, while a linear rule's reach across the whole word? The band-only codim
// search in rosetta6_band.mjs was verified complete for rule 30
// (rosetta6_caveat.mjs); it must NOT be assumed complete for rule 90, since a
// linear map's image of a dim-(m-1) family has codimension at least 2t+1 and
// only one relation was found inside the band. Full sweep, both rules.

const S = { 30: (r) => (4 * r) ^ ((2 * r) | r), 90: (r) => (4 * r) ^ r };
const lowBit = (g) => Math.log2(g & -g) | 0;
const high = (g) => 31 - Math.clz32(g);

for (const rule of [30, 90]) {
  for (const [m, t] of [[10, 2], [10, 3], [12, 3]]) {
    const N = m + 2 * t, K = 1 << (m - 1);
    const mem = new Int32Array(K);
    for (let hi = 0; hi < K; hi++) { let r = 1 | (hi << 1); for (let s = 0; s < t; s++) r = S[rule](r); mem[hi] = r; }
    let exact = 0, maxHigh = -1, minLow = 99;
    const basis = [];
    for (let g = 1; g < (1 << N); g++) {
      let s = 0;
      for (let i = 0; i < K; i++) { let p = mem[i] & g, c = 0; while (p) { p &= p - 1; c ^= 1; } s += c ? -1 : 1; }
      if (Math.abs(s) === K) {
        exact++;
        if (high(g) > maxHigh) maxHigh = high(g);
        if (lowBit(g) < minLow) minLow = lowBit(g);
        let x = g; for (const b of basis) if ((x ^ b) < x) x ^= b;
        if (x) { basis.push(x); basis.sort((p, q) => q - p); }
      }
    }
    console.log(`rule ${rule} m=${m} t=${t} N=${N}: codim=${basis.length}, ${exact} exact relations,`
      + ` support spans bits [${minLow}..${maxHigh}], band top = 2t = ${2 * t}`
      + `  -> relations ${maxHigh > 2 * t ? 'REACH ABOVE the band' : 'confined to the band'}`);
  }
}
