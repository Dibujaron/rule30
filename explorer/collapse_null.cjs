// Null models for "how much of T's collapse is just triangularity?"
//
// Four families, all analysed EXHAUSTIVELY over all 2^n states with the same
// image-shrink criterion as collapse_brute.cjs:
//
//   (A) the 256 uniform 3-local triangular maps: bit i of T_g(r) =
//       g(r_{i-2}, r_{i-1}, r_i), one fixed g for every i.  These are the 256
//       elementary CAs read as maps on n-bit words; rule 30 is g = 30.
//   (B) per-level random 3-local: g_i drawn independently for each bit i.
//   (C) fully random triangular: bit i an independent uniform random function
//       of bits 0..i.  This is the exact "triangularity and nothing else" null.
//   (D) a fully random map on 2^n points, for scale.
//
// usage: node collapse_null.cjs <mode> [nmax] [draws]
//        mode in: all256 | local | tri | rand
const MODES = ['all256', 'local', 'tri', 'rand'];

function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

// exhaustive image shrink; step given as a Int32Array table for speed
function analyse(n, table) {
  const size = 2 ** n;
  const words = Math.max(1, size / 32);
  let cur = new Uint32Array(words);
  if (size >= 32) cur.fill(0xffffffff); else cur[0] = (2 ** size - 1);
  let curCount = size, m = 0;
  for (;;) {
    const next = new Uint32Array(words);
    for (let w = 0; w < words; w++) {
      let bits = cur[w];
      while (bits) { const lsb = bits & -bits; const idx = 31 - Math.clz32(lsb); bits ^= lsb; const y = table[w * 32 + idx]; next[y >>> 5] |= 1 << (y & 31); }
    }
    let cnt = 0;
    for (let w = 0; w < words; w++) cnt += popcnt(next[w]);
    m++;
    if (cnt === curCount) return { maxTail: m - 1, attractor: cnt };
    cur = next; curCount = cnt;
    if (m > 4000000) throw new Error('no stabilisation');
  }
}

// (A)/(B) 3-local triangular table
function localTable(n, gOf) { // gOf(i) -> 8-bit rule number used at bit i
  const size = 2 ** n;
  const t = new Int32Array(size);
  const g = []; for (let i = 0; i < n; i++) g.push(gOf(i));
  for (let r = 0; r < size; r++) {
    let y = 0;
    for (let i = 0; i < n; i++) {
      const a = i >= 2 ? (r >> (i - 2)) & 1 : 0;
      const b = i >= 1 ? (r >> (i - 1)) & 1 : 0;
      const c = (r >> i) & 1;
      const idx = (a << 2) | (b << 1) | c;
      if ((g[i] >> idx) & 1) y |= 1 << i;
    }
    t[r] = y >>> 0;
  }
  return t;
}
// (C) fully random triangular table
function triTable(n) {
  const size = 2 ** n;
  const t = new Int32Array(size);
  const h = [];
  for (let i = 0; i < n; i++) { const m = 2 ** (i + 1); const arr = new Uint8Array(m); for (let k = 0; k < m; k++) arr[k] = Math.random() < 0.5 ? 1 : 0; h.push(arr); }
  for (let r = 0; r < size; r++) {
    let y = 0;
    for (let i = 0; i < n; i++) if (h[i][r & (2 ** (i + 1) - 1)]) y |= 1 << i;
    t[r] = y >>> 0;
  }
  return t;
}
// (D) fully random map
function randTable(n) {
  const size = 2 ** n;
  const t = new Int32Array(size);
  for (let r = 0; r < size; r++) t[r] = (Math.random() * size) >>> 0;
  return t;
}

const mode = process.argv[2] || 'all256';
if (!MODES.includes(mode)) throw new Error('mode: ' + MODES.join('|'));
const nmax = Number(process.argv[3] || 18);
const draws = Number(process.argv[4] || 12);
const NS = [];
for (let n = 8; n <= nmax; n += (nmax - 8 >= 8 ? Math.max(1, Math.floor((nmax - 8) / 5)) : 1)) NS.push(n);
if (NS[NS.length - 1] !== nmax) NS.push(nmax);

if (mode === 'all256') {
  console.log('the 256 uniform 3-local triangular maps (= the 256 ECAs on n-bit words), exhaustive');
  console.log('rule  ' + NS.map((n) => `n=${n}:tail/|A|`).join('   '));
  const summary = [];
  for (let g = 0; g < 256; g++) {
    const cells = [], rec = { g, tails: [], attrs: [] };
    for (const n of NS) {
      const { maxTail, attractor } = analyse(n, localTable(n, () => g));
      cells.push(`${String(maxTail).padStart(5)}/${String(attractor).padStart(6)}`);
      rec.tails.push(maxTail); rec.attrs.push(attractor);
    }
    summary.push(rec);
    console.log(String(g).padStart(4) + '  ' + cells.join('   '));
  }
  // classify by growth between the last two n
  const [n1, n2] = [NS[NS.length - 2], NS[NS.length - 1]];
  console.log(`\nclassification using n=${n1} -> n=${n2} (delta n = ${n2 - n1}):`);
  let linA = 0, expA = 0, linT = 0, expT = 0;
  const worstA = [], worstT = [];
  for (const r of summary) {
    const a1 = r.attrs[r.attrs.length - 2], a2 = r.attrs[r.attrs.length - 1];
    const t1 = r.tails[r.tails.length - 2], t2 = r.tails[r.tails.length - 1];
    if (a2 <= a1 + 8 * (n2 - n1)) linA++; else expA++;
    if (t2 <= t1 + 4 * (n2 - n1)) linT++; else expT++;
    worstA.push([a2, r.g]); worstT.push([t2, r.g]);
  }
  worstA.sort((x, y) => y[0] - x[0]); worstT.sort((x, y) => y[0] - x[0]);
  console.log(`  |attractor(${n2})| grows slowly (<= +8 per bit): ${linA}/256 rules;  faster: ${expA}/256`);
  console.log(`  maxTail(${n2}) grows slowly (<= +4 per bit): ${linT}/256 rules;  faster: ${expT}/256`);
  console.log(`  largest |attractor(${n2})|: ` + worstA.slice(0, 8).map(([v, g]) => `r${g}:${v}`).join(' '));
  console.log(`  largest maxTail(${n2}):     ` + worstT.slice(0, 8).map(([v, g]) => `r${g}:${v}`).join(' '));
  const r30 = summary.find((r) => r.g === 30);
  console.log(`  rule 30: attractor ${r30.attrs.join(',')}  maxTail ${r30.tails.join(',')}  (n = ${NS.join(',')})`);
  const rankA = worstA.findIndex(([, g]) => g === 30) + 1, rankT = worstT.findIndex(([, g]) => g === 30) + 1;
  console.log(`  rule 30 rank among 256 by |attractor(${n2})|: ${rankA};  by maxTail(${n2}): ${rankT}  (1 = largest)`);
} else {
  const maker = mode === 'local' ? ((n) => localTable(n, () => (Math.random() * 256) >>> 0))
    : mode === 'tri' ? triTable : randTable;
  const label = { local: 'per-level random 3-local triangular', tri: 'fully random triangular', rand: 'fully random map on 2^n points' }[mode];
  console.log(`${label}: ${draws} independent draws per n, exhaustive analysis of each`);
  console.log('  n   maxTail: min/median/max      |attractor|: min/median/max     sqrt(2^n)  sqrt(pi*2^n/8)');
  for (const n of NS) {
    const ts = [], as = [];
    for (let d = 0; d < draws; d++) { const { maxTail, attractor } = analyse(n, maker(n)); ts.push(maxTail); as.push(attractor); }
    ts.sort((a, b) => a - b); as.sort((a, b) => a - b);
    const med = (v) => v[Math.floor(v.length / 2)];
    console.log([String(n).padStart(3),
      `${String(ts[0]).padStart(7)}/${String(med(ts)).padStart(7)}/${String(ts[ts.length - 1]).padStart(7)}`,
      `${String(as[0]).padStart(11)}/${String(med(as)).padStart(9)}/${String(as[as.length - 1]).padStart(9)}`,
      Math.sqrt(2 ** n).toFixed(0).padStart(10), Math.sqrt(Math.PI * 2 ** n / 8).toFixed(0).padStart(12)].join('  '));
  }
}
