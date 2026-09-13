// Astrolabe, 2026-09-13. Algebraic-circuit vantage. Second pass at the Raz rank.
//
// astrolabe3_raz.mjs reported rank 35 for a "uniformly random density-1/2
// polynomial" at the natural partition at n = 13, 17, 21 AND 23 -- the same
// number at four different sizes, which is a broken generator and not a finding.
// Its xorshift32 was seeded 555+t and the filter read one bit per draw. This
// file replaces the generator with mulberry32, and -- the check that should have
// been there first -- validates the F2 rank routine against a uniformly random
// 0/1 matrix, whose rank must sit one or two below the maximum.

const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ruleAnf(rule) {
  const a = [];
  for (let i = 0; i < 8; i++) a.push((rule >> i) & 1);
  for (let j = 0; j < 3; j++) for (let m = 0; m < 8; m++) if ((m >> j) & 1) a[m] ^= a[m ^ (1 << j)];
  return a;
}

function coneMonomials(rule, t) {
  const n = 2 * t + 1, L = 2 ** (n - 5);
  const anf = ruleAnf(rule);
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
  const mons = [];
  for (let w = 0; w < L; w++) {
    let word = a[w];
    while (word) {
      const bit = 31 - Math.clz32((word & (-word >>> 0)) >>> 0);
      mons.push((w << 5) | bit);
      word = (word & (word - 1)) >>> 0;
    }
  }
  return mons;
}

// F2 rank of a bit matrix given as (rows, W words per row, flat Uint32Array)
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
  const rows = 1 << a, W = Math.ceil((1 << b) / 32);
  const yPos = new Int32Array(n).fill(-1), zPos = new Int32Array(n).fill(-1);
  yVars.forEach((v, i) => { yPos[v] = i; });
  zVars.forEach((v, i) => { zPos[v] = i; });
  const mat = new Uint32Array(rows * W);
  for (const m of mons) {
    let ys = 0, zs = 0;
    for (let j = 0; j < n; j++) if ((m >>> j) & 1) {
      if (yPos[j] >= 0) ys |= 1 << yPos[j]; else zs |= 1 << zPos[j];
    }
    mat[ys * W + (zs >>> 5)] ^= (1 << (zs & 31));
  }
  return rankBits(mat, rows, W);
}

// ---- validation of the rank routine itself ----
console.log('=== validation: F2 rank of a uniformly random 0/1 matrix ===');
console.log('(a random 2^a x 2^b matrix over F2 has rank min(2^a,2^b) minus O(1))');
for (const [a, b] of [[9, 8], [11, 10], [12, 11]]) {
  const rows = 1 << a, W = Math.ceil((1 << b) / 32);
  const mat = new Uint32Array(rows * W);
  const rng = mulberry32(0x5eed ^ (a * 131 + b));
  for (let i = 0; i < mat.length; i++) mat[i] = (rng() * 4294967296) >>> 0;
  console.log(`  2^${a} x 2^${b}: rank ${rankBits(mat, rows, W)} of ${1 << Math.min(a, b)}`);
}

// ---- validation: the rank routine on a random POLYNOMIAL ----
function randomPolyDense(n, d, rng) {
  const mons = [];
  for (let m = 0; m < 2 ** n; m++) {
    let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; }
    if (pc <= d && rng() < 0.5) mons.push(m);
  }
  return mons;
}
function randomPolySparse(n, d, rng, count) {
  const pool = [];
  for (let m = 0; m < 2 ** n; m++) {
    let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; }
    if (pc <= d) pool.push(m);
  }
  for (let i = pool.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
  return pool.slice(0, count);
}

console.log('');
console.log('=== Raz rank of M_f over F2: rule 30 against controls and nulls ===');
const RULES = [30, 86, 45, 110, 90, 150];
for (const t of [5, 6, 7, 8, 9, 10, 11]) {
  const n = 2 * t + 1;
  const a = Math.ceil(n / 2), b = n - a;
  const full = 1 << Math.min(a, b);
  const cones = {};
  for (const r of RULES) cones[r] = coneMonomials(r, t);
  const d30 = cones[30].reduce((mx, m) => { let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; } return Math.max(mx, pc); }, 0);
  const rngD = mulberry32(0xabcdef ^ t), rngS = mulberry32(0x123456 ^ t);
  const nullDense = randomPolyDense(n, d30, rngD);
  const nullSparse = randomPolySparse(n, d30, rngS, cones[30].length);

  // natural partition (cone split at the origin) and 6 random ones
  const nat = { y: [], z: [] };
  for (let j = 0; j < n; j++) (j < a ? nat.y : nat.z).push(j);
  const parts = [{ name: 'natural', ...nat }];
  const rngP = mulberry32(0x777 ^ t);
  for (let p = 0; p < 6; p++) {
    const idx = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = (rngP() * (i + 1)) | 0; const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
    parts.push({ name: `rand${p + 1}`, y: idx.slice(0, a), z: idx.slice(a) });
  }
  const res = {};
  const keys = [...RULES.map(String), 'nullDense', 'nullSparse'];
  const polys = { ...cones, nullDense, nullSparse };
  for (const k of keys) res[k] = parts.map((p) => razRank(n, polys[k], p.y, p.z));

  console.log(`\n t=${t}  n=${n}  |Y|=${a} |Z|=${b}  full=${full}  |ANF(30)|=${cones[30].length} deg=${d30}`);
  console.log('   object      natural  ' + parts.slice(1).map((p) => p.name.padStart(6)).join('') +
    '   median(random)/full');
  for (const k of keys) {
    const rs = res[k].slice(1).slice().sort((x, y) => x - y);
    const med = rs[Math.floor(rs.length / 2)];
    console.log(`   ${k.padEnd(11)} ${String(res[k][0]).padStart(7)}  ` +
      res[k].slice(1).map((v) => String(v).padStart(6)).join('') +
      `      ${(med / full).toFixed(3)}`);
  }
}
