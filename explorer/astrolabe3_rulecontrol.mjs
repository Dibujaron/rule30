// Astrolabe, 2026-09-13. Algebraic-circuit vantage.
//
// "How much rule 30 is in this statement?" over all 256 elementary rules, in the
// vantage's own units: the F2-degree of the cone polynomial, its ANF density, the
// number of top-degree monomials, and the Raz rank of M_f at three random
// balanced partitions. Same instrument as explorer/rowan_rulecontrol.mjs, aimed
// at an algebraic measure instead of an occurrence rung.
//
// The question it answers: does any algebraic measure of the cone polynomial
// single rule 30 out, or does it only separate nonlinear rules from linear ones?

const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];
const T = 7;

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
  for (const m of mons) {
    let ys = 0, zs = 0;
    for (let j = 0; j < n; j++) if ((m >>> j) & 1) {
      if (yPos[j] >= 0) ys |= 1 << yPos[j]; else zs |= 1 << zPos[j];
    }
    mat[ys * W + (zs >>> 5)] ^= (1 << (zs & 31));
  }
  return rankBits(mat, rows, W);
}

const n = 2 * T + 1, A = Math.ceil(n / 2), B = n - A, FULL = 1 << Math.min(A, B);
const rngP = mulberry32(0x2026);
const parts = [];
for (let p = 0; p < 3; p++) {
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = (rngP() * (i + 1)) | 0; const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
  parts.push({ y: idx.slice(0, A), z: idx.slice(A) });
}

const rows = [];
for (let rule = 0; rule < 256; rule++) {
  const mons = coneMonomials(rule, T);
  let deg = 0, top = 0;
  const seen = new Set();
  for (const m of mons) {
    let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; }
    if (pc > deg) { deg = pc; top = 1; } else if (pc === deg) top++;
    for (let j = 0; j < n; j++) if ((m >>> j) & 1) seen.add(j);
  }
  const ranks = parts.map((p) => razRank(n, mons, p.y, p.z));
  ranks.sort((a, b) => a - b);
  rows.push({ rule, deg, top, size: mons.length, infl: seen.size, medRank: ranks[1], ranks });
}

console.log(`=== all 256 elementary rules, cone polynomial at t=${T} (n=${n} variables) ===`);
console.log(`full Raz rank = ${FULL};  ANF density is |ANF| / 2^${n}`);
const r30 = rows[30];
console.log('');
console.log(`rule 30: deg=${r30.deg} (=2t-1=${2 * T - 1})  |ANF|=${r30.size}  density=${(r30.size / 2 ** n).toFixed(4)}` +
  `  #top=${r30.top}  infl=${r30.infl}  Raz ranks=${r30.ranks.join(',')} of ${FULL}`);

const byDeg = [...rows].sort((a, b) => b.deg - a.deg || b.size - a.size);
console.log('');
console.log('rules by F2-degree, top 14:');
console.log('  rule  deg  #top   |ANF|  density  infl  medRank');
for (const r of byDeg.slice(0, 14))
  console.log(`  ${String(r.rule).padStart(4)}  ${String(r.deg).padStart(3)}  ${String(r.top).padStart(4)}` +
    `  ${String(r.size).padStart(6)}  ${(r.size / 2 ** n).toFixed(4)}  ${String(r.infl).padStart(4)}  ${String(r.medRank).padStart(7)}`);

const maxDeg = Math.max(...rows.map((r) => r.deg));
const atMax = rows.filter((r) => r.deg === maxDeg).map((r) => r.rule);
const atLeast30 = rows.filter((r) => r.deg >= r30.deg).map((r) => r.rule);
console.log('');
console.log(`max degree over all 256 rules: ${maxDeg}; attained by ${atMax.length} rules: ${atMax.join(',')}`);
console.log(`rules with degree >= rule 30's ${r30.deg} (${atLeast30.length}): ${atLeast30.join(',')}`);

const bySize = [...rows].sort((a, b) => b.size - a.size);
console.log('');
console.log('densest ANF, top 10: ' + bySize.slice(0, 10).map((r) => `${r.rule}:${(r.size / 2 ** n).toFixed(4)}`).join('  '));
console.log(`rule 30 ANF-density rank among 256: ${bySize.findIndex((r) => r.rule === 30) + 1}`);

const byRank = [...rows].sort((a, b) => b.medRank - a.medRank);
console.log('');
console.log('highest median Raz rank, top 10: ' + byRank.slice(0, 10).map((r) => `${r.rule}:${r.medRank}`).join('  '));
console.log(`rule 30 Raz-rank position among 256: ${byRank.findIndex((r) => r.rule === 30) + 1}`);
const above = rows.filter((r) => r.medRank > r30.medRank).length;
console.log(`rules with median Raz rank strictly above rule 30's ${r30.medRank}: ${above}`);
console.log(`rules attaining FULL Raz rank ${FULL}: ` +
  (rows.filter((r) => r.medRank === FULL).map((r) => r.rule).join(',') || 'none'));
console.log('');
console.log('linear controls: ' + [90, 150, 60, 105, 165].map((x) => `rule ${x}: deg=${rows[x].deg} rank=${rows[x].medRank}`).join(';  '));
