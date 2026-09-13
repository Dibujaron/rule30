// Astrolabe, 2026-09-13. Algebraic-circuit vantage.
//
// Raz's rank measure for multilinear formulas, on the cone polynomial.
//
// For a multilinear f in n variables and a partition of the variables into
// Y (size a) and Z (size b), let M_f be the 2^a x 2^b matrix whose (S,T) entry
// is the ANF coefficient of the monomial S u T. Raz's multilinear-formula lower
// bound is driven by rank(M_f) over the field: a polynomial whose matrix is of
// (near) full rank for a random balanced partition has no small multilinear
// formula. So: measure rank(M_f)/2^min(a,b) for rule 30 and for the controls.
//
// Also: the validation the board asks for. The cone polynomial evaluated at the
// single-seed input must equal centerColumn t, and the orientation check that
// actually bites is that rule 30's cheap variable sits on the LEFT (x = -t,
// appearing only linearly) while its mirror rule 86's sits on the right.

const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];
const CENTER = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0]; // A051023, t=0..14

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
  return { n, anf: a, L };
}

function monList(n, anf, L) {
  const mons = [];
  for (let w = 0; w < L; w++) {
    let word = anf[w];
    while (word) {
      const bit = 31 - Math.clz32((word & (-word >>> 0)) >>> 0);
      mons.push((w << 5) | bit);
      word = (word & (word - 1)) >>> 0;
    }
  }
  return mons;
}

function xorshift(seed) {
  let s = seed | 0; if (s === 0) s = 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296); };
}

// rank over F2 of M_f for a given partition. yIdx/zIdx: variable -> position
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
  // gaussian elimination
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

function randomPoly(n, d, rng, count) {
  // uniformly random multilinear poly of degree <= d with exactly `count` monomials
  // (count = null means density 1/2)
  const pool = [];
  for (let m = 0; m < 2 ** n; m++) {
    let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; }
    if (pc <= d) pool.push(m);
  }
  if (count === null) return pool.filter(() => rng() < 0.5);
  // reservoir-free shuffle-and-take
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
  return pool.slice(0, count);
}

function degOf(mons) {
  let d = 0;
  for (const m of mons) { let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; } if (pc > d) d = pc; }
  return d;
}

// ---------------- validation ----------------
console.log('=== validation ===');
for (let t = 2; t <= 8; t++) {
  const { n, anf, L } = coneMonomials(30, t);
  const mons = monList(n, anf, L);
  // seed input: only the centre cell (index t) is black
  let val = 0;
  for (const m of mons) if ((m & ~(1 << t)) === 0) val ^= 1;
  const ok = val === CENTER[t];
  const varMax = new Array(n).fill(-1);
  for (const m of mons) { const d = degOf([m]); for (let j = 0; j < n; j++) if ((m >>> j) & 1) if (d > varMax[j]) varMax[j] = d; }
  const m86 = monList(...(() => { const r = coneMonomials(86, t); return [r.n, r.anf, r.L]; })());
  const vm86 = new Array(n).fill(-1);
  for (const m of m86) { const d = degOf([m]); for (let j = 0; j < n; j++) if ((m >>> j) & 1) if (d > vm86[j]) vm86[j] = d; }
  console.log(`  t=${t}: cone(seed)=${val} centerColumn=${CENTER[t]} ${ok ? 'OK' : 'MISMATCH'}` +
    `   rule30 cheap variable at x=${varMax.indexOf(1) - t} (max monomial 1);` +
    ` rule86 at x=${vm86.indexOf(1) - t}`);
}

// ---------------- Raz rank ----------------
console.log('');
console.log('=== Raz rank of M_f, balanced partitions, over F2 ===');
console.log('full = 2^min(|Y|,|Z|); "natural" = left half vs right half of the cone');
const RULES = [30, 86, 45, 110, 90, 150, 60];
for (const t of [4, 6, 8, 10, 11]) {
  const n = 2 * t + 1;
  const a = Math.ceil(n / 2), b = n - a;
  const full = 1 << Math.min(a, b);
  console.log(`\n t=${t}  n=${n}  |Y|=${a} |Z|=${b}  full rank = ${full}`);
  const rng = xorshift(987654 + t);
  // fixed set of partitions used for every rule, so the comparison is paired
  const parts = [];
  {
    const nat = { y: [], z: [] };
    for (let j = 0; j < n; j++) (j < a ? nat.y : nat.z).push(j);
    parts.push({ name: 'natural', ...nat });
  }
  for (let p = 0; p < 3; p++) {
    const idx = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
    parts.push({ name: `random${p + 1}`, y: idx.slice(0, a), z: idx.slice(a) });
  }
  const header = ['partition'.padEnd(10)];
  for (const r of RULES) header.push(`r${r}`.padStart(7));
  header.push('rand1/2'.padStart(8), 'randSp'.padStart(8));
  console.log('  ' + header.join(''));
  const c = {};
  for (const r of RULES) { const o = coneMonomials(r, t); c[r] = monList(o.n, o.anf, o.L); }
  const d30 = degOf(c[30]);
  const rndHalf = randomPoly(n, d30, xorshift(555 + t), null);
  const rndSparse = randomPoly(n, d30, xorshift(777 + t), c[30].length);
  for (const p of parts) {
    const row = [p.name.padEnd(10)];
    for (const r of RULES) row.push(String(razRank(n, c[r], p.y, p.z)).padStart(7));
    row.push(String(razRank(n, rndHalf, p.y, p.z)).padStart(8));
    row.push(String(razRank(n, rndSparse, p.y, p.z)).padStart(8));
    console.log('  ' + row.join(''));
  }
  console.log(`  (|ANF| rule30 = ${c[30].length}, deg = ${d30}; randSp has the same monomial count)`);
}
