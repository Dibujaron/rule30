// Astrolabe, 2026-09-13. Algebraic-circuit vantage.
//
// How far from full rank is the cone polynomial's Raz matrix? The verified
// criterion (Alon-Kumar-Volk, arXiv:1708.02037) asks for rank_{Y,Z}(f) = 2^{n/2}
// at EVERY balanced partition, so the minimum over partitions decides it; a
// Raz-style "with high probability" criterion would turn on the median. Both, over
// 30 random balanced partitions plus the natural one, with the deficiency measured
// in bits: log2(full / rank).

const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];
const NPART = 30;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ruleAnfBits(rule) {
  const a = [];
  for (let i = 0; i < 8; i++) a.push((rule >> i) & 1);
  for (let j = 0; j < 3; j++) for (let m = 0; m < 8; m++) if ((m >> j) & 1) a[m] ^= a[m ^ (1 << j)];
  return a;
}
function coneMonomials(rule, t) {
  const n = 2 * t + 1, L = 2 ** (n - 5);
  const anf = ruleAnfBits(rule);
  const terms = [];
  for (let m = 0; m < 8; m++) if (anf[m]) terms.push(m);
  let cur = [], nxt = [];
  for (let j = 0; j < n; j++) {
    const v = new Uint32Array(L);
    if (j < 5) v.fill(PAT[j] >>> 0);
    else { const sh = j - 5; for (let w = 0; w < L; w++) v[w] = ((w >>> sh) & 1) ? 0xffffffff : 0; }
    cur.push(v); nxt.push(new Uint32Array(L));
  }
  for (let s = 1; s <= t; s++) {
    for (let j = s; j <= n - 1 - s; j++) {
      const l = cur[j - 1], c = cur[j], r = cur[j + 1], o = nxt[j];
      for (let w = 0; w < L; w++) {
        const lw = l[w], cw = c[w], rw = r[w];
        let v = 0;
        for (let i = 0; i < terms.length; i++) {
          const m = terms[i];
          let p = 0xffffffff;
          if (m & 4) p &= lw;
          if (m & 2) p &= cw;
          if (m & 1) p &= rw;
          v ^= p;
        }
        o[w] = v >>> 0;
      }
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  const a = cur[t];
  for (let j = 0; j < 5 && j < n; j++) {
    const low = (~PAT[j]) >>> 0, sh = 1 << j;
    for (let w = 0; w < L; w++) a[w] = (a[w] ^ (((a[w] & low) << sh) >>> 0)) >>> 0;
  }
  for (let j = 5; j < n; j++) {
    const blk = 1 << (j - 5);
    for (let base = 0; base < L; base += 2 * blk)
      for (let k = 0; k < blk; k++) a[base + blk + k] ^= a[base + k];
  }
  const mons = new Int32Array(((a) => { let c = 0; for (let w = 0; w < L; w++) { let x = a[w]; while (x) { c++; x = (x & (x - 1)) >>> 0; } } return c; })(a));
  let idx = 0;
  for (let w = 0; w < L; w++) {
    let word = a[w];
    while (word) {
      const bit = 31 - Math.clz32((word & (-word >>> 0)) >>> 0);
      mons[idx++] = (w << 5) | bit;
      word = (word & (word - 1)) >>> 0;
    }
  }
  return mons;
}
function rankBits(mat, rows, W) {
  const pivotOf = new Map();
  let rank = 0;
  const v = new Uint32Array(W);
  for (let r = 0; r < rows; r++) {
    v.set(mat.subarray(r * W, r * W + W));
    for (;;) {
      let lead = -1;
      for (let w = 0; w < W; w++) if (v[w] !== 0) { lead = (w << 5) + (31 - Math.clz32((v[w] & (-v[w] >>> 0)) >>> 0)); break; }
      if (lead < 0) break;
      const pv = pivotOf.get(lead);
      if (pv === undefined) { pivotOf.set(lead, v.slice()); rank++; break; }
      for (let w = lead >>> 5; w < W; w++) v[w] ^= pv[w];
    }
  }
  return rank;
}
function razRank(n, mons, yVars, zVars) {
  const a = yVars.length, b = zVars.length;
  const rows = 1 << a, W = Math.max(1, Math.ceil((1 << b) / 32));
  const yPos = new Int32Array(n).fill(-1), zPos = new Int32Array(n).fill(-1);
  yVars.forEach((v, i) => { yPos[v] = i; });
  zVars.forEach((v, i) => { zPos[v] = i; });
  const mat = new Uint32Array(rows * W);
  for (let i = 0; i < mons.length; i++) {
    const m = mons[i];
    let ys = 0, zs = 0;
    for (let j = 0; j < n; j++) if ((m >>> j) & 1) {
      if (yPos[j] >= 0) ys |= 1 << yPos[j]; else zs |= 1 << zPos[j];
    }
    mat[ys * W + (zs >>> 5)] ^= (1 << (zs & 31));
  }
  return rankBits(mat, rows, W);
}

console.log('=== Raz rank deficiency of rule 30\'s cone polynomial ===');
console.log(`${NPART} random balanced partitions per t, plus the natural (left half | right half) one.`);
console.log('deficiency = log2(full / rank); the AKV criterion needs it to be 0 at EVERY partition.');
console.log('');
console.log('  t    n   full   natural    min   median    max   defic(median)  defic(min)  frac full-rank');
for (let t = 5; t <= 11; t++) {
  const n = 2 * t + 1, a = Math.ceil(n / 2), b = n - a, full = 1 << Math.min(a, b);
  const mons = coneMonomials(30, t);
  const nat = { y: [], z: [] };
  for (let j = 0; j < n; j++) (j < a ? nat.y : nat.z).push(j);
  const natRank = razRank(n, mons, nat.y, nat.z);
  const rng = mulberry32(0x51de ^ (t * 7919));
  const ranks = [];
  for (let p = 0; p < NPART; p++) {
    const idx = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
    ranks.push(razRank(n, mons, idx.slice(0, a), idx.slice(a)));
  }
  ranks.sort((x, y) => x - y);
  const med = ranks[Math.floor(NPART / 2)], mn = ranks[0], mx = ranks[NPART - 1];
  const nFull = ranks.filter((r) => r === full).length;
  console.log(`  ${String(t).padStart(2)}  ${String(n).padStart(3)}  ${String(full).padStart(5)}` +
    `  ${String(natRank).padStart(7)}  ${String(mn).padStart(5)}  ${String(med).padStart(6)}  ${String(mx).padStart(5)}` +
    `        ${Math.log2(full / med).toFixed(3)}      ${Math.log2(full / mn).toFixed(3)}      ${nFull}/${NPART}`);
}
