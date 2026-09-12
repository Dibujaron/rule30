// Talus, 2026-09-12.  Is the alternating-block bound RIGIDITY or a COUNT?
//
// Condrey's constant-trace theorem is rigidity: a white centre makes column 1
// monotone, so the left half collapses to one integer.  If the alternating
// target also collapses -- if column 1, or the left half, is DETERMINED across
// the surviving configurations -- then C2 has Condrey's mechanism and a route.
// If the surviving set stays exponentially large until it dies, C2 is a
// counting statement and the dimension-count obstruction applies to it.
//
// This enumerates every configuration whose centre column alternates for k
// cells and whose support is white left of -a, at every depth k, and reports
// (i) how many there are, and (ii) how many of the cells of row 0 and of
// column 1 are constant across them.

function centreAt(cfg, k, off) {
  let row = cfg.slice(off - k, off + k + 1);
  for (let t = 1; t <= k; t++) {
    const n = row.length - 2;
    const nr = new Uint8Array(n);
    for (let i = 0; i < n; i++) nr[i] = row[i] ^ (row[i + 1] | row[i + 2]);
    row = nr;
  }
  return row[0];
}

// column 1 of a configuration, times 0..T-1
function col1(cfg, off, T) {
  const W = 2 * T + 8;
  let row = new Uint8Array(W), nxt = new Uint8Array(W);
  const o2 = T + 4;
  for (let x = -T - 3; x <= T + 3; x++) row[o2 + x] = cfg[off + x] || 0;
  const out = [];
  for (let t = 0; t < T; t++) {
    out.push(row[o2 + 1]);
    for (let i = 1; i < W - 1; i++) nxt[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = row; row = nxt; nxt = tmp;
  }
  return out;
}

// enumerate surviving branches level by level (BFS), left bound a, right free
function levels(a, phase, cap) {
  const target = (t) => (phase ^ (t & 1)) & 1;
  const off = cap + 6;
  // a branch is the row-0 cell array as a plain Array of 0/1 over [-k, k]
  let cur = [];
  {
    const cfg = new Uint8Array(2 * cap + 16);
    cfg[off] = target(0);
    cur.push(cfg);
  }
  const out = [{ k: 0, n: 1 }];
  for (let k = 1; k <= cap; k++) {
    const next = [];
    for (const base of cur) {
      for (const rc of [0, 1]) {
        const cfg = base.slice();
        cfg[off + k] = rc;
        // forced left cell by left-permutivity at radius k
        cfg[off - k] = 0;
        const z = centreAt(cfg, k, off);
        const lc = z ^ target(k);
        if (k > a && lc === 1) continue;
        cfg[off - k] = lc;
        next.push(cfg);
      }
    }
    if (next.length === 0) break;
    cur = next;
    out.push({ k, n: cur.length, branches: cur });
  }
  return { out, off, target };
}

console.log("[L] surviving configurations by depth (left bound only, alternating)");
for (const a of [6, 8, 10, 12]) {
  const cap = 4 * a + 12;
  let bestPhase = null, bestOut = null;
  for (const ph of [0, 1]) {
    const r = levels(a, ph, cap);
    if (!bestOut || r.out.length > bestOut.out.length) { bestOut = r; bestPhase = ph; }
  }
  const ks = bestOut.out.map(o => `${o.k}:${o.n}`).join(" ");
  console.log(`    a=${a} phase=${bestPhase}: depth:count  ${ks}`);
  // at the deepest level, how determined are row 0 and column 1?
  const last = bestOut.out[bestOut.out.length - 1];
  const K = last.k;
  if (last.branches && last.branches.length > 0) {
    const off = bestOut.off;
    const bs = last.branches;
    let detRow = 0, freeRow = 0;
    for (let x = -K; x <= K; x++) {
      const v = bs[0][off + x];
      if (bs.every(b => b[off + x] === v)) detRow++; else freeRow++;
    }
    const c1s = bs.map(b => col1(b, off, K + 1));
    let detC1 = 0, freeC1 = 0;
    for (let t = 0; t <= K; t++) {
      const v = c1s[0][t];
      if (c1s.every(c => c[t] === v)) detC1++; else freeC1++;
    }
    console.log(`      at max depth k=${K}: ${bs.length} surviving configurations;` +
      ` row-0 cells determined ${detRow}/${detRow + freeRow};` +
      ` column-1 values determined ${detC1}/${detC1 + freeC1}`);
    // and specifically: column 1 at the EVEN times (black times for phase 1)
    let detEven = 0, totEven = 0;
    for (let t = 0; t <= K; t++) {
      if (bestOut.target(t) !== 1) continue;   // the black times
      totEven++;
      const v = c1s[0][t];
      if (c1s.every(c => c[t] === v)) detEven++;
    }
    console.log(`      column 1 at the BLACK times: determined ${detEven}/${totEven}`);
  }
}

console.log("\n[V] sanity: does the same instrument show Condrey's collapse for the");
console.log("    CONSTANT-white target, where column 1 is monotone and the left half");
console.log("    should be pinned to one integer?");
for (const a of [6, 8, 10]) {
  const cap = 4 * a + 12;
  // constant white target
  const target = () => 0;
  const off = cap + 6;
  let cur = [];
  { const cfg = new Uint8Array(2 * cap + 16); cfg[off] = 0; cur.push(cfg); }
  const counts = ["0:1"];
  for (let k = 1; k <= cap; k++) {
    const next = [];
    for (const base of cur) for (const rc of [0, 1]) {
      const cfg = base.slice();
      cfg[off + k] = rc; cfg[off - k] = 0;
      const lc = centreAt(cfg, k, off) ^ target(k);
      if (k > a && lc === 1) continue;
      cfg[off - k] = lc; next.push(cfg);
    }
    if (next.length === 0) break;
    cur = next; counts.push(`${k}:${cur.length}`);
  }
  console.log(`    a=${a} all-white: depth:count  ${counts.slice(0, 40).join(" ")}`);
}
