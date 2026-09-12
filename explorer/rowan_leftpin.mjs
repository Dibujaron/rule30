// Rowan, 2026-09-12. Talus's named next move, run: does the column-1 pattern count
// stay bounded as T grows?
//
// SETUP (Talus's, from the w=011 document). Configurations white at every x < 0,
// black at x = 0, FREE on [1, T+1]. Row 0 beyond T+1 cannot affect the centre column
// or column 1 at times <= T, so sweeping [1, T+1] is a COMPLETE answer at depth T,
// not a sample. Of the 2^(T+1) configurations, keep those whose centre column agrees
// with the seed's for t = 0..T, and ask how many distinct patterns column 1 takes
// AT THE WHITE TIMES of the centre column.
//
// Talus measured that count as 1, 2, 1, 2 at T = 15, 17, 19, 21 -- flat, not growing
// -- with 430,528 of 2^22 configurations sharing the centre column at T = 21. With
// the invisibility lemma (a black centre cell hides column 1 from the whole left
// half, so column -k is a function of column 0 plus column 1 at column 0's white
// times) a bounded count says the seed's centre column PINS its entire left half.
//
// BIT-PARALLEL: 32 configurations at a time, one per bit of a Uint32. Rule 30 is
// new = l XOR (c OR r), which is bitwise across configurations unchanged.
//
// Reproduce before extending: T = 21 must give 430,528 and 2.

function sweep(T) {
  const W = 2 * T + 6, mid = T + 3;          // mid = cell 0; cone never reaches an edge
  const nCfg = 2 ** (T + 1);
  const batches = Math.ceil(nCfg / 32);
  // seed's own centre column and its white times
  const seedCol = new Uint8Array(T + 1);
  {
    let cur = new Uint8Array(W), nxt = new Uint8Array(W);
    cur[mid] = 1; seedCol[0] = 1;
    for (let s = 1; s <= T; s++) {
      for (let i = 1; i < W - 1; i++) nxt[i] = (30 >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
      const t = cur; cur = nxt; nxt = t; seedCol[s] = cur[mid];
    }
  }
  const whiteTimes = [];
  for (let t = 0; t <= T; t++) if (seedCol[t] === 0) whiteTimes.push(t);

  let matched = 0;
  const patterns = new Set();
  const cur = new Uint32Array(W), nxt = new Uint32Array(W);
  // per-batch record of column0 / column1 over time
  const col0 = new Uint32Array(T + 1), col1 = new Uint32Array(T + 1);

  for (let b = 0; b < batches; b++) {
    cur.fill(0); nxt.fill(0);
    const base = b * 32;
    cur[mid] = 0xffffffff;                    // cell 0 black in every configuration
    for (let k = 1; k <= T + 1; k++) {
      let word = 0;
      for (let j = 0; j < 32; j++) {
        const cfg = base + j;
        if (cfg < nCfg && ((cfg >> (k - 1)) & 1)) word |= (1 << j);
      }
      cur[mid + k] = word >>> 0;
    }
    col0[0] = cur[mid]; col1[0] = cur[mid + 1];
    for (let s = 1; s <= T; s++) {
      for (let i = 1; i < W - 1; i++) nxt[i] = (cur[i - 1] ^ (cur[i] | cur[i + 1])) >>> 0;
      for (let i = 1; i < W - 1; i++) cur[i] = nxt[i];
      col0[s] = cur[mid]; col1[s] = cur[mid + 1];
    }
    // which configurations in this batch match the seed's centre column everywhere?
    let ok = 0xffffffff;
    for (let t = 0; t <= T; t++) ok = (ok & (seedCol[t] ? col0[t] : ~col0[t])) >>> 0;
    if (base + 32 > nCfg) { const valid = nCfg - base; ok = (ok & (valid >= 32 ? 0xffffffff : ((1 << valid) - 1))) >>> 0; }
    if (ok === 0) continue;
    for (let j = 0; j < 32; j++) {
      if (!((ok >>> j) & 1)) continue;
      matched++;
      let key = '';
      for (const t of whiteTimes) key += ((col1[t] >>> j) & 1);
      patterns.add(key);
    }
  }
  return { T, nCfg, matched, whiteTimes: whiteTimes.length, distinct: patterns.size, patterns: [...patterns] };
}

const Ts = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number);
for (const T of (Ts.length ? Ts : [15, 17, 19, 21])) {
  const r = sweep(T);
  console.log(`T=${String(r.T).padStart(2)}  configs=2^${T + 1}=${r.nCfg}  share seed's centre column: ${String(r.matched).padStart(9)}  white times: ${String(r.whiteTimes).padStart(2)}  DISTINCT column-1 patterns at white times: ${r.distinct}`);
  if (r.distinct <= 4) for (const p of r.patterns) console.log(`      ${p}`);
}
