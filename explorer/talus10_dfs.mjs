// Talus, 2026-09-12.  EXACT answer to: how long can the centre column of a
// configuration alternate, given bounds on its support?
//
// The configuration is built outward from the origin.  At step k we CHOOSE the
// right cell at +k and the left cell at -k is then FORCED, because one step of
// rule 30 iterated k times is left-permutive with radius k: flipping cell(-k)
// flips the centre cell at time k, so exactly one value of cell(-k) gives the
// required c(k).  A branch dies when the forced left cell is black beyond the
// left bound.  So the search tree is exactly the set of configurations whose
// centre column alternates, and its depth of extinction is the answer.
//
// Two implementations of the forced value, checked against each other and
// against the exhaustive enumeration of talus10_alt.mjs.

// ---- reference: evolve a window k steps, O(k^2), no incremental state ----
function centreAt(cfg, k, off) {
  // cfg is a Uint8Array with cfg[off + x] = cell at position x; cells
  // [-k, k] must be set.  Returns the centre cell at time k.
  let row = cfg.slice(off - k, off + k + 1); // length 2k+1
  for (let t = 1; t <= k; t++) {
    const n = row.length - 2;
    const nr = new Uint8Array(n);
    for (let i = 0; i < n; i++) nr[i] = row[i] ^ (row[i + 1] | row[i + 2]);
    row = nr;
  }
  return row[0];
}

// ---- the search ----
// leftBound a: cells at x < -a must be white.  rightBound R: cells at x > R
// must be white (R = Infinity for none).  target c(t) = phase ^ (t & 1).
function search(a, R, phase, cap, incremental) {
  const off = cap + 4;
  const cfg = new Uint8Array(2 * cap + 12);
  let best = 0, bestCfg = null;
  // LD[k][t] = cell(t, -k+t), RD[k][t] = cell(t, k-t), for the current branch
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 1; k++) { LD.push(new Uint8Array(cap + 3)); RD.push(new Uint8Array(cap + 3)); }

  const target = (t) => (phase ^ (t & 1)) & 1;

  cfg[off] = target(0);
  LD[0][0] = target(0); RD[0][0] = target(0);
  if (1 > best) { best = 1; bestCfg = cfg.slice(); }

  function rec(k) {
    // cells [-(k-1), k-1] are set and the column is correct for t < k
    if (k > cap) return;
    const rightChoices = (k > R) ? [0] : [0, 1];
    for (const rc of rightChoices) {
      cfg[off + k] = rc;
      // RD_k(t) = cell(t, k-t): the right-diagonal recurrence, which reads the
      // two shallower diagonals at index t-1 and itself at t-1.
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      // LD_k(t) = cell(t, -k+t): the left-diagonal recurrence, same shape.
      // With cfg[-k] = 0, to read off the affine offset.
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      // centre at time k, with cfg[-k] = 0
      const prevApex = target(k - 1);
      const centre0 = ldk[k - 1] ^ (prevApex | rdk[k - 1]);
      const lc = centre0 ^ target(k);       // the forced left cell
      if (k > a && lc === 1) continue;      // support would exceed the bound
      cfg[off - k] = lc;
      if (lc === 1) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      // the two diagonals meet at the apex, cell(k, 0), which is now correct
      ldk[k] = target(k); rdk[k] = target(k);
      if (incremental === false) {
        const chk = centreAt(cfg, k, off);
        if (chk !== target(k)) throw new Error(`forced value wrong at k=${k}`);
      }
      if (k + 1 > best) { best = k + 1; bestCfg = cfg.slice(); }
      rec(k + 1);
    }
    cfg[off + k] = 0; cfg[off - k] = 0;
  }
  rec(1);
  return { best, bestCfg, off };
}

function show(cfgOff, a, L) {
  const { bestCfg, off } = cfgOff;
  let s = "";
  for (let x = -L - 1; x <= L + 1; x++) s += bestCfg[off + x];
  return s;
}

// ---- validation: reproduce talus10_alt.mjs block A (support in [-a,a]) ----
console.log("[V] support in [-a,a]: DFS max alternating cells vs exhaustive");
console.log("    exhaustive (talus10_alt block A): a=0..10 -> 1,7,7,7,7,9,10,10,15,17,17");
{
  let line = "    DFS                              : ";
  for (let a = 0; a <= 10; a++) {
    const r0 = search(a, a, 0, 4 * a + 12, false);
    const r1 = search(a, a, 1, 4 * a + 12, false);
    line += Math.max(r0.best, r1.best) + (a < 10 ? "," : "");
  }
  console.log(line);
}

// ---- the real question: LEFT bound only ----
console.log("\n[L] left bound only (cells at x < -a white, right half unbounded)");
console.log("    a   maxAltCells   3a    ratio    witness row 0 (x from -L-1)");
for (let a = 0; a <= 16; a++) {
  const cap = Math.max(40, 6 * a + 20);
  const r0 = search(a, Infinity, 0, cap, true);
  const r1 = search(a, Infinity, 1, cap, true);
  const r = r0.best >= r1.best ? r0 : r1;
  const L = r.best;
  const hit = L >= cap ? " (HIT CAP)" : "";
  console.log(`    ${String(a).padStart(2)}  ${String(L).padStart(11)}  ${String(3 * a).padStart(4)}  ${(a ? (L / a).toFixed(3) : "  -  ").padStart(6)}   ${show(r, a, Math.min(L, 24))}${hit}`);
}

// ---- and with both bounds, pushed further ----
console.log("\n[B] support in [-a,a], pushed past the exhaustive range");
console.log("    a   maxAltCells   2a+1   3a    ratio");
for (let a = 0; a <= 22; a++) {
  const cap = Math.max(40, 6 * a + 20);
  const r0 = search(a, a, 0, cap, true);
  const r1 = search(a, a, 1, cap, true);
  const L = Math.max(r0.best, r1.best);
  console.log(`    ${String(a).padStart(2)}  ${String(L).padStart(11)}  ${String(2 * a + 1).padStart(5)}  ${String(3 * a).padStart(4)}  ${(a ? (L / a).toFixed(3) : "  -  ").padStart(6)}`);
}
