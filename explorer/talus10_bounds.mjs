// Talus, 2026-09-12.  The same exact DFS as talus10_dfs.mjs, but with the
// target column word as a parameter, so the instrument can be checked against
// two theorems the board already owns:
//
//   centerColumn_black_run_lt_start : a black run beginning at a >= 1 has
//       L < a, i.e. at most a cells.
//   centerColumn_white_run_lt_start : a white run beginning at a has L < 3a,
//       i.e. at most 3a cells.
//
// In the DFS, "time 0" plays the part of the seed's time a and the left bound
// plays the part of the seed's cone edge.  If the DFS reproduces a and 3a,
// the number it gives for the ALTERNATING target is worth reading.
//
// The two theorems use more than "white at x < -a": they use the cone edge's
// two adjacent black cells (evolve_left_edge, evolve_left_second_diagonal).
// Both variants are run.

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

// target(t) -> 0/1 ; edge: null, or [v0, v1] forced at x = -a, -a+1
function search(a, R, target, cap, edge, verify) {
  const off = cap + 4;
  const cfg = new Uint8Array(2 * cap + 12);
  let best = 0, bestCfg = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 2; k++) { LD.push(new Uint8Array(cap + 3)); RD.push(new Uint8Array(cap + 3)); }

  cfg[off] = target(0);
  LD[0][0] = target(0); RD[0][0] = target(0);
  best = 1; bestCfg = cfg.slice();

  function rec(k) {
    if (k > cap) return;
    const rightChoices = (k > R) ? [0] : [0, 1];
    for (const rc of rightChoices) {
      cfg[off + k] = rc;
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      const centre0 = ldk[k - 1] ^ (target(k - 1) | rdk[k - 1]);
      const lc = centre0 ^ target(k);
      if (k > a && lc === 1) continue;
      if (edge) {
        if (k === a && lc !== edge[0]) continue;
        if (k === a - 1 && lc !== edge[1]) continue;
      }
      cfg[off - k] = lc;
      if (lc === 1) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      ldk[k] = target(k); rdk[k] = target(k);
      if (verify && centreAt(cfg, k, off) !== target(k)) throw new Error(`bad at k=${k}`);
      if (k + 1 > best) { best = k + 1; bestCfg = cfg.slice(); }
      rec(k + 1);
    }
    cfg[off + k] = 0; cfg[off - k] = 0;
  }
  rec(1);
  return { best, bestCfg, off };
}

const BLACK = () => 1;
const WHITE = () => 0;
const ALT0 = (t) => t & 1;
const ALT1 = (t) => 1 - (t & 1);

console.log("[C] CONTROL: does the DFS reproduce the two proved run bounds?");
console.log("    'white left of -a' only, and then with the cone edge's two black cells.");
console.log("     a | black cells: plain / +edge   (theorem: <= a)");
console.log("       | white cells: plain / +edge   (theorem: <= 3a)");
for (let a = 1; a <= 14; a++) {
  const cap = 6 * a + 24;
  const bp = search(a, Infinity, BLACK, cap, null, false).best;
  const be = search(a, Infinity, BLACK, cap, [1, 1], false).best;
  const wp = search(a, Infinity, WHITE, cap, null, false).best;
  const we = search(a, Infinity, WHITE, cap, [1, 1], false).best;
  console.log(`    ${String(a).padStart(2)} | black ${String(bp).padStart(3)} / ${String(be).padStart(3)}   (<= ${a})` +
    `   | white ${String(wp).padStart(3)} / ${String(we).padStart(3)}   (<= ${3 * a})`);
}

console.log("\n[A] the ALTERNATING target, both phases, same instrument");
console.log("     a | alt cells: plain / +edge |  a   2a   3a  | ratio plain, ratio edge");
for (let a = 1; a <= 26; a++) {
  const cap = 6 * a + 30;
  const p = Math.max(search(a, Infinity, ALT0, cap, null, false).best,
                     search(a, Infinity, ALT1, cap, null, false).best);
  const e = Math.max(search(a, Infinity, ALT0, cap, [1, 1], false).best,
                     search(a, Infinity, ALT1, cap, [1, 1], false).best);
  console.log(`    ${String(a).padStart(2)} | alt ${String(p).padStart(3)} / ${String(e).padStart(3)}` +
    `          | ${String(a).padStart(3)} ${String(2 * a).padStart(4)} ${String(3 * a).padStart(4)}  | ` +
    `${(p / a).toFixed(3)}  ${(e / a).toFixed(3)}`);
}

console.log("\n[V] spot verification of the forced-value shortcut against the O(k^2) reference");
for (const a of [3, 6, 9]) {
  search(a, Infinity, ALT0, 4 * a + 12, null, true);
  search(a, Infinity, BLACK, 4 * a + 12, null, true);
  console.log(`    a=${a}: every forced cell re-checked by direct evolution, no mismatch`);
}
