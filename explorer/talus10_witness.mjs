// Talus, 2026-09-12.  Spot-check the witnesses quoted in the attack document,
// independently of the DFS that found them: evolve the named configuration
// cell-by-cell and read its centre column.

function column(blackAt, T) {
  const lo = Math.min(...blackAt) - T - 2, hi = Math.max(...blackAt) + T + 2;
  const W = hi - lo + 1, off = -lo;
  let row = new Uint8Array(W), nxt = new Uint8Array(W);
  for (const x of blackAt) row[off + x] = 1;
  const c = [];
  for (let t = 0; t < T; t++) {
    c.push(row[off]);
    for (let i = 1; i < W - 1; i++) nxt[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = row; row = nxt; nxt = tmp;
  }
  return c;
}

function altLen(c) {
  let L = 1;
  while (L < c.length && c[L] !== c[L - 1]) L++;
  return L;
}

console.log("[W] the a = 1 witness quoted in section 5: black at x = -1 and x = 7 only");
{
  const c = column([-1, 7], 24);
  console.log(`    centre column: ${c.join("")}`);
  console.log(`    alternating prefix: ${altLen(c)} cells`);
  console.log(`    white at every x < -1 : true by construction (support = {-1, 7})`);
  console.log(`    so 8 > 3*1 : ${altLen(c) > 3}`);
}

console.log("\n[W] the a = 8 witness from talus10_dfs [L]: black at x = -8, -1, 6, 9");
{
  const c = column([-8, -1, 6, 9], 30);
  console.log(`    centre column: ${c.join("")}`);
  console.log(`    alternating prefix: ${altLen(c)} cells   (DFS said 17)`);
}

console.log("\n[W] the seed itself, for comparison");
{
  const c = column([0], 40);
  console.log(`    centre column: ${c.join("")}`);
  console.log(`    alternating prefix from t=0: ${altLen(c)} cells`);
}

console.log("\n[W] a = 2: is there a 2-cell-radius-left witness with 8 alternating cells?");
{
  // the DFS reported 8 at a = 2 as well; brute force over configurations with
  // left support in [-2,-1] and right support in [1, 12]
  let found = null;
  for (let m = 0; m < (1 << 15) && !found; m++) {
    const black = [];
    for (let j = 0; j < 2; j++) if ((m >> j) & 1) black.push(-2 + j);
    if ((m >> 2) & 1) black.push(0);
    for (let j = 0; j < 12; j++) if ((m >> (3 + j)) & 1) black.push(1 + j);
    if (black.length === 0) continue;
    const c = column(black, 20);
    if (altLen(c) >= 8) found = { black, L: altLen(c), c: c.slice(0, 10).join("") };
  }
  console.log(found
    ? `    yes: black at ${JSON.stringify(found.black)}, ${found.L} alternating cells, column ${found.c}...`
    : `    none found in the searched box`);
}
