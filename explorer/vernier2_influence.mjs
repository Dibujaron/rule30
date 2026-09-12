// Vernier, 2026-09-12. A two-line question left over from the sighting, answered so
// the next connector does not start without it.
//
// The cone-conditioned centre cell is a Boolean function of the free configuration
// cells 1..t. Its largest single-coordinate Walsh coefficient is big -- 0.42 at
// t = 15, 0.20 at t = 22 -- a first-order correlation surviving to depth 22, which
// is the Meier-Staffelbach weakness measured at depth. WHICH coordinate carries it:
// a fixed one (say cell 1, nearest the origin), or one that moves with t?
//
// Also printed: the influence of each coordinate (the fraction of inputs whose
// output flips when that cell is flipped), since that is the quantity the
// restriction/KKL literature actually owns.

function centreTable(t) {
  const size = 1 << t, W = 2 * t + 3;
  const tt = new Uint8Array(size);
  const cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let u = 0; u < size; u++) {
    cur.fill(0);
    cur[t] = 1;
    for (let k = 1; k <= t; k++) cur[t + k] = (u >> (k - 1)) & 1;
    for (let s = 0; s < t; s++) {
      for (let i = 0; i < W; i++) {
        const l = i > 0 ? cur[i - 1] : 0, c = cur[i], r = i < W - 1 ? cur[i + 1] : 0;
        nxt[i] = (30 >> (4 * l + 2 * c + r)) & 1;
      }
      cur.set(nxt);
    }
    tt[u] = cur[t];
  }
  return tt;
}

function walsh(tt) {
  const n = tt.length;
  const f = new Float64Array(n);
  for (let i = 0; i < n; i++) f[i] = tt[i] ? -1 : 1;
  for (let len = 1; len < n; len <<= 1)
    for (let i = 0; i < n; i += len << 1)
      for (let j = i; j < i + len; j++) { const a = f[j], b = f[j + len]; f[j] = a + b; f[j + len] = a - b; }
  return f;
}

function popc(x) { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; }

console.log('variable i (0-indexed) = configuration cell i+1; cell t is the outermost,');
console.log('the one whose cone just reaches the origin in t steps.\n');
for (let t = 4; t <= 22; t++) {
  const tt = centreTable(t), size = 1 << t;
  const W = walsh(tt);
  // singleton Walsh coefficients
  let best = -1, bestI = -1;
  const singles = [];
  for (let i = 0; i < t; i++) {
    const v = Math.abs(W[1 << i]) / size;
    singles.push(+v.toFixed(4));
    if (v > best) { best = v; bestI = i; }
  }
  // influences
  const infl = [];
  for (let i = 0; i < t; i++) {
    let flips = 0;
    const bit = 1 << i;
    for (let u = 0; u < size; u++) if (tt[u] !== tt[u ^ bit]) flips++;
    infl.push(+(flips / size).toFixed(4));
  }
  // largest Walsh coefficient over all characters, and its weight
  let gmax = 0, garg = 0;
  for (let g = 1; g < size; g++) if (Math.abs(W[g]) > gmax) { gmax = Math.abs(W[g]); garg = g; }
  console.log(JSON.stringify({
    t,
    maxSingletonWalsh: +best.toFixed(4),
    atCell: bestI + 1,
    cellFromOuterEnd: t - (bestI + 1),
    totalInfluence: +infl.reduce((a, b) => a + b, 0).toFixed(3),
    maxInfluence: Math.max(...infl), atCellInf: infl.indexOf(Math.max(...infl)) + 1,
    maxWalshAnyChar: +(gmax / size).toFixed(4), itsWeight: popc(garg),
  }));
  if (t === 22 || t === 15) {
    console.log('   singleton Walsh by cell 1..t:', singles.join(' '));
    console.log('   influence by cell 1..t      :', infl.join(' '));
  }
}
