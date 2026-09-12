// Vernier, 2026-09-12. The reachable set of rule 30 rows read as a CODE and as a
// SAMPLE SPACE, in the vocabulary of epsilon-biased sets / epsilon-balanced codes.
//
// Setup. A configuration is supported on positions 0..m-1 with cell 0 black (the
// leftmost black cell) and cells 1..m-1 free: 2^(m-1) configurations. Packed, bit j
// of the config number is the cell at position j. One rule 30 step on the packed row
// is r -> (4r) XOR ((2r) OR r), which slides the origin one bit right, so after t
// steps bit i of the row is the cell at position i - t and the row lives in
// N = m + 2t bits, bit 0 being the left cone edge.
//
// What this measures:
//   1. injectivity (pre-injectivity, crystal 4) and |A| = 2^(m-1);
//   2. whether the upper N - (2t+1) bits of the row are a BIJECTIVE image of the
//      free config bits -- i.e. whether A is the graph of a function, a systematic
//      code with 2t+1 parity symbols;
//   3. the affine hull of A and A's index in it (is A linear? the duality needs it);
//   4. the weight spread of A (is A an epsilon-balanced code?);
//   5. the full bias profile |E_c (-1)^{gamma . row}| over every gamma != 0, by
//      Walsh-Hadamard transform -- which is the weight distribution of the code
//      read backwards, C(A) = { (gamma.a)_{a in A} : gamma };
//   6. the minimum distance of A.

const args = process.argv.slice(2);

function rowAt(cfg, t) {
  let r = cfg;
  for (let s = 0; s < t; s++) r = (4n * r) ^ ((2n * r) | r);
  return r;
}

function popcountBig(x) {
  let n = 0;
  while (x > 0n) { n += Number(x & 1n); x >>= 1n; }
  return n;
}

function analyse(m, t, { wht = true } = {}) {
  const N = m + 2 * t;
  const free = m - 1;
  const nCfg = 1 << free;
  const rows = new Array(nCfg);
  for (let u = 0; u < nCfg; u++) {
    const cfg = 1n | (BigInt(u) << 1n);          // cell 0 black, cells 1..m-1 = u
    rows[u] = rowAt(cfg, t);
  }

  // 1. injectivity
  const seen = new Set(rows.map((r) => r.toString()));
  const injective = seen.size === nCfg;

  // check every row really lives in N bits and bit 0 is set (left cone edge black)
  let inBand = true, edgeBlack = true;
  for (const r of rows) {
    if (r >> BigInt(N) !== 0n) inBand = false;
    if ((r & 1n) !== 1n) edgeBlack = false;
  }

  // 2. is the map u -> (row bits 2t+1 .. N-1) a bijection?
  const upperMask = ((1n << BigInt(free)) - 1n) << BigInt(2 * t + 1);
  const uppers = rows.map((r) => (r & upperMask) >> BigInt(2 * t + 1));
  const upperSet = new Set(uppers.map((x) => x.toString()));
  const systematic = upperSet.size === nCfg;

  // 3. affine hull: span of { a XOR a0 }
  const a0 = rows[0];
  const basis = [];
  const reduce = (v) => {
    for (const b of basis) {
      const hb = 63 - Math.clz32(Number(b >> 32n)) + 32; // unused; do it simply below
    }
    return v;
  };
  const topBit = (v) => { let i = -1; while (v > 0n) { v >>= 1n; i++; } return i; };
  const piv = new Map();
  for (const r of rows) {
    let v = r ^ a0;
    while (v !== 0n) {
      const p = topBit(v);
      if (!piv.has(p)) { piv.set(p, v); break; }
      v ^= piv.get(p);
    }
  }
  const hullDim = piv.size;
  const hullIndex = Math.pow(2, hullDim - free);   // |hull| / |A|
  const isAffine = hullDim === free;

  // 4. weight spread
  let wmin = Infinity, wmax = -Infinity, wsum = 0;
  for (const r of rows) { const w = popcountBig(r); if (w < wmin) wmin = w; if (w > wmax) wmax = w; wsum += w; }

  // 6. minimum distance (over pairs) -- only for modest nCfg
  let dmin = Infinity;
  if (nCfg <= 4096) {
    for (let i = 0; i < nCfg; i++)
      for (let j = i + 1; j < nCfg; j++) {
        const d = popcountBig(rows[i] ^ rows[j]);
        if (d < dmin) dmin = d;
      }
  }

  const out = {
    m, t, N, free, nCfg, injective, inBand, edgeBlack, systematic,
    hullDim, hullIndex, isAffine,
    wminFrac: wmin / N, wmaxFrac: wmax / N, wmeanFrac: wsum / nCfg / N,
    dmin: dmin === Infinity ? null : dmin,
  };

  // 5. bias profile by WHT over 2^N (only when N is small enough)
  if (wht && N <= 22) {
    const size = 1 << N;
    const f = new Int32Array(size);
    for (const r of rows) f[Number(r)] += 1;
    // Walsh-Hadamard
    for (let len = 1; len < size; len <<= 1)
      for (let i = 0; i < size; i += len << 1)
        for (let j = i; j < i + len; j++) {
          const a = f[j], b = f[j + len];
          f[j] = a + b; f[j + len] = a - b;
        }
    // f[gamma] = sum_a (-1)^{gamma.a}; bias = |f[gamma]| / nCfg
    let maxAll = 0, maxAllG = 0;
    let maxOff = 0, maxOffG = 0;               // gamma with support entirely > 2t
    let nZeroOff = 0, nOff = 0;
    const bandMask = (1 << (2 * t + 1)) - 1;
    for (let g = 1; g < size; g++) {
      const b = Math.abs(f[g]) / nCfg;
      if (b > maxAll) { maxAll = b; maxAllG = g; }
      if ((g & bandMask) === 0) {
        nOff++;
        if (b === 0) nZeroOff++;
        if (b > maxOff) { maxOff = b; maxOffG = g; }
      }
    }
    out.maxBias = maxAll; out.maxBiasGamma = maxAllG.toString(2);
    out.maxBiasOffBand = maxOff; out.offBandChars = nOff; out.offBandZero = nZeroOff;
    // bias at the single-coordinate characters (per-bit balance of the row)
    out.perBitBias = [];
    for (let i = 0; i < N; i++) out.perBitBias.push(+(Math.abs(f[1 << i]) / nCfg).toFixed(4));
    // the all-ones character: bias of the row's total parity
    out.allOnesBias = Math.abs(f[size - 1]) / nCfg;
  }
  return out;
}

const points = args.length
  ? [args.map(Number)]
  : [[8, 2], [10, 2], [12, 2], [10, 3], [12, 3], [14, 3], [10, 4], [12, 4], [10, 5], [12, 5], [13, 4]];

for (const [m, t] of points) {
  const r = analyse(m, t);
  console.log(JSON.stringify(r));
}
