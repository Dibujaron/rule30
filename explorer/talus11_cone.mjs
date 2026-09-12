// Talus, 2026-09-12.  WHICH TARGET WORDS THE CONE CAN SEE -- corrected class.
//
// talus10_*.mjs searched the class
//    C1(a) = { X : X(x) = white for every x < -a }
// and that class contains the ALL-WHITE configuration, whose centre column is
// white for ever.  So f_W(a) = infinity in C1 for every word W that is not a
// block of zeros, for a reason that has nothing to do with rule 30.  The four
// points talus10 reported are still correct numbers; two of them are the zero
// configuration wearing a search result.
//
// The class a proof would actually have is row a of the seed's own picture, and
// the board proves five of its cells outright:
//    evolve_left_edge            cell(a, -a)     = black
//    evolve_left_second_diagonal cell(a, -(a-1)) = black
//    evolve_left_third_diagonal  cell(a, -(a-2)) = white
//    evolve_left_fourth_diagonal cell(a, -(a-3)) = black iff (a-3) even
//    evolve_left_fifth_diagonal  cell(a, -(a-4)) = black
// plus whiteness at every x < -a (evolve_eq_false_of_outside_cone).  So:
//    C1 = white outside            (talus10's class, keeps the zero config)
//    C2 = C1 + black at -a         (evolve_left_edge)
//    C3 = C2 + black at -(a-1)     (+ second diagonal)
//    C5 = C3 + the third, fourth and fifth diagonals
// C2 is the weakest class that excludes the zero configuration, and every one of
// C2..C5 is cited from closed nodes, so a bound measured in them is a bound a
// proof could aim at.
//
// The search is talus10_no11.mjs's outward DFS, unchanged in its geometry and
// re-verified in [V]: cell(0,k) branches freely, the column value branches
// subject to the target set, and cell(0,-k) is then FORCED by left-permutivity
// at radius k.  The class is imposed as a required value for that forced cell.

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

// cls(a) -> { req: Int8Array indexed by k>=0 giving -1 free / 0 white / 1 black
//             for cell(0,-k); entries beyond a are 0 by construction }
function classReq(kind, a, cap) {
  const req = new Int8Array(cap + 3).fill(-1);
  for (let k = a + 1; k <= cap + 2; k++) req[k] = 0;
  const put = (pos, v) => { if (pos >= 0 && pos <= cap + 2) req[pos] = v; };
  if (kind >= 2) put(a, 1);
  if (kind >= 3) put(a - 1, 1);
  if (kind >= 5) { put(a - 2, 0); put(a - 3, (a - 3) % 2 === 0 ? 1 : 0); put(a - 4, 1); }
  return req;
}

function search(a, forbidden, cap, budget, kind, verify) {
  const off = cap + 6;
  const cfg = new Uint8Array(2 * cap + 16);
  const col = new Uint8Array(cap + 4);
  const req = classReq(kind, a, cap);
  let best = 0, bestCol = null, bestCfg = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 2; k++) { LD.push(new Uint8Array(cap + 3)); RD.push(new Uint8Array(cap + 3)); }
  let nodes = 0, truncated = false, over = false;
  const pop = new Array(cap + 3).fill(0);

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
        if (req[k] >= 0 && lc !== req[k]) continue;
        col[k] = cv;
        if (!ok(k)) continue;
        cfg[off - k] = lc;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (verify && centreAt(cfg, k, off) !== cv) throw new Error(`engine disagrees at k=${k}`);
        pop[k]++;
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); bestCfg = cfg.slice(off - k, off + k + 1); }
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
    cfg[off + k] = 0; cfg[off - k] = 0;
  }

  try {
    for (const s of [0, 1]) {
      if (req[0] >= 0 && s !== req[0]) continue;
      col[0] = s;
      if (!ok(0)) continue;
      cfg[off] = s;
      LD[0][0] = s; RD[0][0] = s;
      pop[0]++;
      if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); bestCfg = Uint8Array.from([s]); }
      rec(1);
    }
  } catch (e) { if (e !== BUDGET) throw e; }

  return { best, exact: !truncated && !over, nodes, pop, bestCol, bestCfg, truncated, over };
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
const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");

const ALLW = [1, 2, 3, 4].flatMap(words);

// ---------------------------------------------------------------- [V]
console.log("[V] the instrument");
{
  let checked = 0;
  for (const S of [[[0, 0], [1, 1]], [[0, 1], [1, 0]], [[1, 1]], [[0, 0]], [[1]], [[0, 1, 0]]])
    for (let a = 1; a <= 3; a++)
      for (const kind of [1, 2, 3])
        checked += search(a, S, 3 * a + 10, 4e6, kind, true).nodes;
  console.log(`    every accepted node's centre cell re-derived by direct evolution:`);
  console.log(`    ${checked} nodes, 0 disagreements`);
  let s = "    talus10's own class C1, alternating a=1..7 (published 8,8,8,8,9,10,10): ";
  for (let a = 1; a <= 7; a++) s += search(a, [[0, 0], [1, 1]], 6 * a + 24, 4e8, 1).best + " ";
  console.log(s);
}

// ---------------------------------------------------------------- [W]
console.log("\n[W] the trivial witness inside C1");
{
  for (const wname of ["1", "11", "101", "1111"]) {
    const w = wname.split("").map(Number);
    const r = search(4, [w], 40, 1e6, 1);
    console.log(`    C1(4), avoid ${wname.padEnd(4)}: depth ${r.best}${r.exact ? "" : "+"}, ` +
      `deepest column = ${show(r.bestCol).slice(0, 24)}...  all white: ${show(r.bestCol).indexOf("1") < 0}`);
  }
  const r = search(5, [[0, 1], [1, 0]], 60, 2e6, 1);
  const p = []; for (let k = 0; k < r.pop.length && (k < 3 || r.pop[k] > 0); k++) p.push(r.pop[k]);
  console.log(`    C1(5), constant column: population ${p.slice(0, 14).join(" ")} ... ` +
    `collapses to ${r.pop[40]} at depth 40`);
  console.log(`    and the survivor's row-0 window is ${show(r.bestCfg)}`);
}

// ---------------------------------------------------------------- [C]
console.log("\n[C] Condrey's constant-trace maxima, as a control on the class");
console.log("    avoid '0' = an all-BLACK column; avoid '1' = an all-WHITE column");
for (const kind of [1, 2, 3]) {
  for (const wname of ["0", "1"]) {
    const w = wname.split("").map(Number);
    let s = `    C${kind}  avoid ${wname} :`;
    for (let a = 1; a <= 10; a++) {
      const r = search(a, [w], 70, 3e7, kind);
      s += ` ${r.best}${r.exact ? "" : "+"}`;
    }
    console.log(s);
  }
}
console.log("    Condrey arXiv:2609.09431: 2*floor(w/2)+2 for centre 1, 2*ceil(w/2)+1 for centre 0");
console.log("    2*floor(a/2)+2, a=1..10 ->  2 4 4 6 6 8 8 10 10 12");
console.log("    2*ceil(a/2)+1,  a=1..10 ->  3 3 5 5 7 7 9  9 11 11");

// ---------------------------------------------------------------- [T]
const CAP = 56, FAST = 3e5, DEEP = 6e7;
console.log(`\n[T] every forbidden word of length 1..4, a = 1..6, in each class`);
console.log(`    two passes: budget ${FAST} to classify, then ${DEEP} on anything that looked finite`);
console.log(`    '+' = LOWER BOUND (node budget or depth cap ${CAP} hit)`);
for (const kind of [1, 2, 3]) {
  console.log(`\n    class C${kind}`);
  console.log("       W |   a=1    a=2    a=3    a=4    a=5    a=6");
  const rows = [];
  for (const w of ALLW) {
    const vals = [];
    for (let a = 1; a <= 6; a++) {
      let r = search(a, [w], CAP, FAST, kind);
      if (r.exact) r = search(a, [w], CAP, DEEP, kind);
      vals.push(r);
    }
    rows.push({ w, vals, allExact: vals.every((v) => v.exact) });
  }
  rows.sort((x, y) => (x.allExact === y.allExact
    ? x.vals[5].best - y.vals[5].best : (x.allExact ? -1 : 1)));
  for (const r of rows) {
    let s = `    ${show(r.w).padStart(4)} |`;
    for (const v of r.vals) s += ` ${String(v.best + (v.exact ? "" : "+")).padStart(6)}`;
    console.log(s + (r.allExact ? "  FINITE" : ""));
  }
  for (const [name, S] of [["const", [[0, 1], [1, 0]]], ["alt", [[0, 0], [1, 1]]]]) {
    let s = `    ${name.padStart(4)} |`;
    for (let a = 1; a <= 6; a++) {
      let r = search(a, S, CAP, FAST, kind);
      if (r.exact) r = search(a, S, CAP, DEEP, kind);
      s += ` ${String(r.best + (r.exact ? "" : "+")).padStart(6)}`;
    }
    console.log(s);
  }
}
