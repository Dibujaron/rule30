// Talus, 2026-09-12.  WHICH TARGET WORDS THE CONE CAN SEE.
//
// f_W(a) = the greatest number of cells of the centre column of a configuration
// white at every x < -a that contains no occurrence of the word W.  The four
// points already measured (talus10_*) are the two-word sets {01,10} (constant),
// {00,11} (alternating) and the single words 11 and 00.  This sweeps every word
// of length <= 4.
//
// The search is talus10_no11.mjs's, with `allowed(prev,next)` replaced by a
// sliding-window check against a SET of forbidden words, and with the extra
// bookkeeping a classification needs: per-level survivor counts, and an explicit
// flag saying whether the answer is a maximum (tree exhausted) or a lower bound
// (depth cap or node budget hit).  A FINITE verdict is an absence and is worth
// nothing unless the tree was exhausted; that distinction is the whole point.
//
// Geometry, unchanged and re-verified in section [V]: build the configuration
// outward one radius at a time.  cell(0,k) is a free branch at every k; the
// column value col[k] is a branch too, constrained by the target set; and the
// left cell cell(0,-k) is then FORCED by left-permutivity at radius k, so the
// tree is exactly the set of configurations whose column lies in the target
// set.  Pruning "cell(0,-k) must be white for k > a" is the cone constraint.

const BUDGET = "budget";

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

// forbidden : array of arrays of 0/1.  Returns
//   { best, exact, nodes, pop }  where `exact` says the tree was exhausted.
function search(a, forbidden, cap, budget, verify) {
  const off = cap + 6;
  const cfg = new Uint8Array(2 * cap + 16);
  const col = new Uint8Array(cap + 4);
  let best = 0, bestCol = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 2; k++) { LD.push(new Uint8Array(cap + 3)); RD.push(new Uint8Array(cap + 3)); }
  let nodes = 0, truncated = false, over = false;
  const pop = new Array(cap + 2).fill(0);

  function ok(k) {
    for (const w of forbidden) {
      const m = w.length;
      if (k + 1 < m) continue;
      let hit = true;
      for (let i = 0; i < m; i++) if (col[k - m + 1 + i] !== w[i]) { hit = false; break; }
      if (hit) return false;
    }
    return true;
  }

  function rec(k) {
    if (k > cap) { truncated = true; return; }
    if (++nodes > budget) { over = true; throw BUDGET; }
    for (const rc of [0, 1]) {
      cfg[off + k] = rc;
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      const centre0 = ldk[k - 1] ^ (col[k - 1] | rdk[k - 1]);
      for (const cv of [0, 1]) {
        const lc = centre0 ^ cv;
        if (k > a && lc === 1) continue;
        col[k] = cv;
        if (!ok(k)) continue;
        cfg[off - k] = lc;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (verify && centreAt(cfg, k, off) !== cv) throw new Error(`engine disagrees at k=${k}`);
        pop[k]++;
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
    cfg[off + k] = 0; cfg[off - k] = 0;
  }

  try {
    for (const s of [0, 1]) {
      col[0] = s;
      if (!ok(0)) continue;
      cfg[off] = s;
      LD[0][0] = s; RD[0][0] = s;
      pop[0]++;
      if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); }
      rec(1);
    }
  } catch (e) { if (e !== BUDGET) throw e; }

  return { best, exact: !truncated && !over, nodes, pop, bestCol, truncated, over };
}

const words = (m) => {
  const out = [];
  for (let v = 0; v < (1 << m); v++) {
    const w = [];
    for (let i = m - 1; i >= 0; i--) w.push((v >> i) & 1);
    out.push(w);
  }
  return out;
};
const show = (w) => w.map((b) => (b ? "1" : "0")).join("");
const showSet = (S) => S.map(show).join(",");

// ---------------------------------------------------------------- [V]
console.log("[V] the instrument, re-verified before anything is measured");
console.log("    (a) every accepted node's centre cell re-derived by direct evolution");
{
  let checked = 0;
  for (const S of [[[0, 0], [1, 1]], [[0, 1], [1, 0]], [[1, 1]], [[0, 0]], [[1]], [[0, 1, 0]]]) {
    for (let a = 1; a <= 3; a++) {
      const r = search(a, S, 3 * a + 10, 4e6, true);
      checked += r.nodes;
    }
  }
  console.log(`        ${checked} nodes verified cell-by-cell, 0 disagreements`);
}
console.log("    (b) the four points talus10 already published, reproduced here");
{
  const ALT = [[0, 0], [1, 1]], CON = [[0, 1], [1, 0]], N11 = [[1, 1]], N00 = [[0, 0]];
  const line = (name, S, cap, bud) => {
    let s = `        ${name.padEnd(12)}`;
    for (let a = 1; a <= 7; a++) {
      const r = search(a, S, cap(a), bud);
      s += ` ${r.best}${r.exact ? "" : "+"}`;
    }
    console.log(s);
  };
  console.log("        talus10      alternating a=1..7 -> 8,8,8,8,9,10,10   00-free -> 16,16,27,31");
  line("alternating", ALT, (a) => 6 * a + 24, 4e8);
  line("00-free", N00, (a) => Math.min(46, 8 * a + 20), 4e8);
  line("11-free", N11, (a) => Math.min(46, 8 * a + 20), 4e8);
  line("constant", CON, (a) => 6 * a + 24, 4e8);
  console.log("        (a trailing + marks a LOWER BOUND: cap or node budget hit)");
}

// ---------------------------------------------------------------- [T]
console.log("\n[T] every single forbidden word of length 1..4, a = 1..6");
console.log("    f_W(a) = longest W-free centre-column block of a configuration white at x < -a");
const CAP = 100, BUD = 2e6;
console.log(`    '+' = lower bound only (cap/budget hit).  cap ${CAP}, budget ${BUD} per cell.`);
console.log("\n       W |   a=1    a=2    a=3    a=4    a=5    a=6 | verdict");
const rows = [];
for (let m = 1; m <= 4; m++) {
  for (const w of words(m)) {
    const vals = [];
    for (let a = 1; a <= 6; a++) {
      const r = search(a, [w], CAP, BUD);
      vals.push(r);
    }
    const allExact = vals.every((v) => v.exact);
    const verdict = allExact ? "FINITE (exhausted)" : "unbounded within reach";
    rows.push({ w, vals, allExact, verdict });
  }
}
rows.sort((x, y) => (x.allExact === y.allExact ? x.w.length - y.w.length
  : (x.allExact ? -1 : 1)));
for (const r of rows) {
  let s = `    ${show(r.w).padStart(4)} |`;
  for (const v of r.vals) s += ` ${String(v.best + (v.exact ? "" : "+")).padStart(6)}`;
  console.log(s + ` | ${r.verdict}`);
}

// ---------------------------------------------------------------- [P]
console.log("\n[P] the two-word sets already on the board, for the same a range");
for (const [name, S] of [["constant {01,10}", [[0, 1], [1, 0]]],
                         ["alternating {00,11}", [[0, 0], [1, 1]]]]) {
  let s = `    ${name.padEnd(21)}`;
  for (let a = 1; a <= 6; a++) {
    const r = search(a, S, CAP, BUD);
    s += ` ${String(r.best + (r.exact ? "" : "+")).padStart(6)}`;
  }
  console.log(s);
}

// ---------------------------------------------------------------- [S]
console.log("\n[S] survivor profile at a = 5: rigidity (collapse to 1) vs a count");
console.log("       W | population by depth k = 0,1,2,...  (cut at the first 0)");
for (const w of [...words(1), ...words(2), ...words(3)]) {
  const r = search(5, [w], 60, BUD);
  const p = [];
  for (let k = 0; k < r.pop.length; k++) { p.push(r.pop[k]); if (r.pop[k] === 0) break; }
  console.log(`    ${show(w).padStart(4)} | ${p.join(" ")}${r.exact ? "" : "   (LOWER BOUND)"}`);
}
for (const [name, S] of [["const", [[0, 1], [1, 0]]], ["alt", [[0, 0], [1, 1]]]]) {
  const r = search(5, S, 60, BUD);
  const p = [];
  for (let k = 0; k < r.pop.length; k++) { p.push(r.pop[k]); if (r.pop[k] === 0) break; }
  console.log(`    ${name.padStart(4)} | ${p.join(" ")}${r.exact ? "" : "   (LOWER BOUND)"}`);
}
