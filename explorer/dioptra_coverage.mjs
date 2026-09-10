// Dioptra, 2026-09-10.
//
// Two measurements around the white-run law kernel-proved in
// explorer/dioptra_scratch_whiterun.lean.
//
// (1) COVERAGE.  The board's `column_succ_of_black` reads the next centre cell
//     off column -1 whenever the centre is black.  The new law reads the centre
//     cell off column -1 whenever the centre is white twice running and column
//     -1 was black at the first of them.  Both have the SAME conclusion,
//         col0(s) = !col(-1)(s-1),
//     which holds exactly when col0(s-1) || col1(s-1).  So the question is what
//     fraction of the centre column each hypothesis reaches.
//
// (2) THE SEARCH TREE.  Meier-Staffelbach guess the right half of the seed and
//     run forward.  On the single seed under the cone constraint that search
//     tree is exactly obstruction 3's window count.  Obstruction 3 says
//     "Neither number is about column 1."  This measures the number that IS:
//     how many distinct column-1 prefixes the whole tree produces.
//     Depth-first over row 0 at x = 0, 1, 2, …, pruning at level k because
//     col0(k) depends only on row 0 at x in [0, k] when x <= -1 is white.

const PAD = 8;

function seedPicture(rows) {
  const w = 2 * rows + 2 * PAD + 3;
  const off = rows + PAD;
  let cur = new Uint8Array(w); cur[off] = 1;
  const pic = [];
  for (let t = 0; t < rows; t++) {
    pic.push(cur);
    const nxt = new Uint8Array(w);
    for (let i = 1; i < w - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    cur = nxt;
  }
  return { pic, off };
}

// ---------------------------------------------------------------------------
console.log('=== 1. coverage: how much of the centre column is a function of column -1 ===');
{
  const T = 200000;
  const { pic, off } = seedPicture(T);
  const c0 = new Uint8Array(T), c1 = new Uint8Array(T), cm = new Uint8Array(T);
  for (let t = 0; t < T; t++) { c0[t] = pic[t][off]; c1[t] = pic[t][off + 1]; cm[t] = pic[t][off - 1]; }

  let truth = 0, black = 0, newLaw = 0, either = 0, neither = 0, iterated = 0;
  // "iterated": inside a maximal white run, once col(-1) has been black at some
  // r with r+1 still in the run, monotonicity keeps col1 black for the rest.
  let runBlackSeen = false;
  for (let s = 2; s < T; s++) {
    const holds = (c0[s] === (cm[s - 1] ^ 1));      // col0(s) = !col(-1)(s-1)
    const expect = (c0[s - 1] | c1[s - 1]) === 1;   // when it must hold
    if (holds !== expect && !(holds && !expect)) { /* holds may accidentally coincide */ }
    if (expect && !holds) { console.log('  *** identity failed at s =', s); }
    if (holds) truth++;
    const b = c0[s - 1] === 1;
    const nl = (c0[s - 2] === 0 && c0[s - 1] === 0 && cm[s - 2] === 1);
    if (b) black++;
    if (nl) newLaw++;
    if (b || nl) either++; else neither++;
  }
  // iterated form: track the current white run of c0 and whether col(-1) has
  // gone black at a time r with r+1 still white.
  {
    let t = 0, cov = 0;
    while (t < T) {
      if (c0[t] === 1) { t++; continue; }
      let s = t; while (t < T && c0[t] === 0) t++;
      const e = t - 1;                       // maximal white run [s, e]
      // col1 is non-decreasing on [s, e+1]; col1(r) = col(-1)(r) for r in [s,e-1]
      let firstBlack = -1;
      for (let r = s; r <= e - 1; r++) if (cm[r] === 1) { firstBlack = r; break; }
      if (firstBlack >= 0) cov += (e + 1) - firstBlack; // times s' in [firstBlack+1, e+1] pinned
    }
    iterated = cov;
  }
  console.log(`  rows ${T}`);
  console.log(`  identity col0(s) = !col(-1)(s-1) actually holds at ${truth} of ${T - 2} times (${(truth / (T - 2)).toFixed(4)})`);
  console.log(`  reached by the black-time law alone            : ${black} (${(black / (T - 2)).toFixed(4)})`);
  console.log(`  reached by the new double-white law alone      : ${newLaw} (${(newLaw / (T - 2)).toFixed(4)})`);
  console.log(`  reached by either                              : ${either} (${(either / (T - 2)).toFixed(4)})`);
  console.log(`  reached by neither                             : ${neither} (${(neither / (T - 2)).toFixed(4)})`);
  console.log(`  reached by the ITERATED white law + black law  : ${(iterated + black) } (${((iterated + black) / (T - 2)).toFixed(4)})`);
}

// ---------------------------------------------------------------------------
console.log('\n=== 2. the Meier-Staffelbach search tree on the single seed ===');
{
  const D = 26;
  const { pic, off } = seedPicture(D + 2);
  const cTrue = new Uint8Array(D + 1);
  for (let t = 0; t <= D; t++) cTrue[t] = pic[t][off];

  // DFS over row 0 at x = 0..D.  After fixing y[0..k] the picture is decided on
  // the triangle that col0(0..k) lives in, so col0(k) can be checked at level k.
  const W = 2 * D + 10, OFF = D + 5;
  const nodes = new Int32Array(D + 2);          // consistent prefixes per level
  const col1sets = [];                          // distinct column-1 prefixes per level
  for (let k = 0; k <= D; k++) col1sets.push(new Set());
  const cm1sets = [];                           // distinct column-(-1) prefixes per level
  for (let k = 0; k <= D; k++) cm1sets.push(new Set());

  const y = new Uint8Array(D + 1);
  // evolve a given row-0 prefix (white elsewhere) for k+1 rows, return columns
  const rowbuf = [];
  for (let i = 0; i <= D + 1; i++) rowbuf.push(new Uint8Array(W));

  function run(k) {
    // build the picture from y[0..k], rows 0..k
    rowbuf[0].fill(0);
    for (let x = 0; x <= k; x++) rowbuf[0][OFF + x] = y[x];
    for (let t = 0; t < k; t++) {
      const cur = rowbuf[t], nxt = rowbuf[t + 1];
      nxt.fill(0);
      for (let i = 1; i < W - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    }
    return rowbuf;
  }

  function dfs(k) {
    // y[0..k] fixed; check col0(k)
    const rb = run(k);
    if (rb[k][OFF] !== cTrue[k]) return;
    nodes[k]++;
    let key1 = '', keym = '';
    for (let t = 0; t <= k; t++) { key1 += rb[t][OFF + 1]; keym += rb[t][OFF - 1]; }
    col1sets[k].add(key1);
    cm1sets[k].add(keym);
    if (k === D) return;
    for (const b of [0, 1]) { y[k + 1] = b; dfs(k + 1); }
  }
  for (const b of [0, 1]) { y[0] = b; dfs(0); }

  console.log('  k\twindows\tcol1 prefixes\tcol(-1) prefixes\tlog2(col1)');
  for (let k = 0; k <= D; k++) {
    console.log(`  ${k}\t${nodes[k]}\t${col1sets[k].size}\t\t${cm1sets[k].size}\t\t\t${Math.log2(col1sets[k].size).toFixed(2)}`);
  }
  console.log(`\n  column 1 free bits per row at depth ${D}: ${(Math.log2(col1sets[D].size) / D).toFixed(4)}`);
  console.log(`  window free bits per row at depth ${D}   : ${(Math.log2(nodes[D]) / D).toFixed(4)}`);
}
