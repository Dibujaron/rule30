// Talus, 2026-09-12.  Two things I owe the criterion before writing it down.
//
// [F] Crystal 66's filter, run on my own proposal.  The one-bit-per-row
//     accounting uses left-permutivity and the cone and NOTHING ELSE, so if the
//     criterion is real it should hold for rule 150 (OR -> XOR) and rule 90
//     (l XOR r) too -- both left-permutive -- and then it is a statement about
//     the METHOD, not about rule 30.  If it holds only for rule 30, that would be
//     far more interesting and I would have to say why.
//
// [S] The shape of the extinction at lambda = 1.  A critical branching process
//     from N individuals dies gradually and slowly; the alternating target dies
//     from ~100 survivors to 0 in one level, which 2^-100 does not explain.  Full
//     population traces, and the per-level survival fraction, so the document can
//     say which it is.

const RULES = {
  r30: (l, c, r) => l ^ (c | r),
  r150: (l, c, r) => l ^ (c ^ r),
  r90: (l, c, r) => l ^ r,
  r86: (l, c, r) => r ^ (c | l),   // rule 30's mirror: RIGHT-permutive, a control
};

// census with a pluggable local rule; the left cell at -k is solved for by
// left-permutivity, which every rule here except r86 has.
function census(rule, a, forbidden, K, kind, budget) {
  const f = RULES[rule];
  const col = new Uint8Array(K + 6);
  const req = new Int8Array(K + 4).fill(-1);
  for (let k = a + 1; k <= K + 3; k++) req[k] = 0;
  if (kind >= 2 && a <= K + 3) req[a] = 1;
  if (kind >= 3 && a - 1 >= 0) req[a - 1] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= K + 3; k++) { LD.push(new Uint8Array(K + 4)); RD.push(new Uint8Array(K + 4)); }
  const pop = new Float64Array(K + 2);
  let nodes = 0, over = false;
  const STOP = "stop";

  const ok = (k) => {
    for (const w of forbidden) {
      const m = w.length;
      if (k + 1 < m) continue;
      let hit = true;
      for (let i = 0; i < m; i++) if (col[k - m + 1 + i] !== w[i]) { hit = false; break; }
      if (hit) return false;
    }
    return true;
  };

  function rec(k) {
    if (k > K) return;
    if (++nodes > budget) { over = true; throw STOP; }
    for (const rc of [0, 1]) {
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      // right diagonal: cell(t, k-t) from cell(t-1, k-t-1), cell(t-1,k-t), cell(t-1,k-t+1)
      for (let t = 1; t <= k - 1; t++) rdk[t] = f(rd2[t - 1], rd1[t - 1], rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      // left diagonal with cell(0,-k) = 0, then permuted by the flip below
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = f(ldk[t - 1], ld1[t - 1], ld2[t - 1]);
      const centre0 = f(ldk[k - 1], col[k - 1], rdk[k - 1]);
      for (const cv of [0, 1]) {
        const lc = centre0 ^ cv;            // left-permutivity: one lc per cv
        if (req[k] >= 0 && lc !== req[k]) continue;
        col[k] = cv;
        if (!ok(k)) continue;
        if (lc === 1) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        pop[k]++;
        rec(k + 1);
        if (lc === 1) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
  }
  try {
    for (const s of [0, 1]) {
      if (req[0] >= 0 && s !== req[0]) continue;
      col[0] = s;
      if (!ok(0)) continue;
      LD[0][0] = s; RD[0][0] = s;
      pop[0]++;
      rec(1);
    }
  } catch (e) { if (e !== STOP) throw e; }
  return { pop, nodes, over };
}

// left-permutivity is the only property the solve uses -- check it per rule
console.log("[L] is the left cell really solvable?  flipping l must flip the output");
for (const [nm, f] of Object.entries(RULES)) {
  let good = true;
  for (const c of [0, 1]) for (const r of [0, 1]) if (f(0, c, r) === f(1, c, r)) good = false;
  console.log(`    ${nm.padEnd(5)} left-permutive: ${good}${good ? "" : "   <- the solve is invalid for this rule, excluded below"}`);
}

const SETS = [["0", [[0]]], ["1", [[1]]], ["const", [[0, 1], [1, 0]]], ["alt", [[0, 0], [1, 1]]],
              ["01", [[0, 1]]], ["00", [[0, 0]]], ["11", [[1, 1]]], ["000", [[0, 0, 0]]],
              ["101", [[1, 0, 1]]], ["1111", [[1, 1, 1, 1]]]];
const LAM = { "0": 1, "1": 1, "const": 1, "alt": 1, "01": 1, "00": 1.61803, "11": 1.61803,
              "000": 1.83929, "101": 1.75488, "1111": 1.92756 };

console.log("\n[F] the criterion under OR -> XOR.  class C2, a = 6, exhaustive to the stated depth");
console.log("       W | lambda |   rule 30    |   rule 150   |   rule 90");
for (const [nm, S] of SETS) {
  let line = `    ${nm.padStart(5)} | ${LAM[nm].toFixed(4)} |`;
  for (const rule of ["r30", "r150", "r90"]) {
    let shown = "  ?  ";
    for (let K = 10; K <= 26; K++) {
      const r = census(rule, 6, S, K, 2, 1.2e7);
      if (r.over) break;
      let top = -1; for (let k = 0; k <= K; k++) if (r.pop[k] > 0) top = k;
      if (top < K) { shown = `extinct ${top + 1}`; break; }
      const m0 = Math.max(8, top - 8);
      const meas = r.pop[m0] > 0 ? Math.pow(r.pop[top] / r.pop[m0], 1 / (top - m0)) : NaN;
      shown = `alive ${meas.toFixed(3)}`;
    }
    line += ` ${shown.padStart(12)} |`;
  }
  console.log(line);
}

console.log("\n[S] how the lambda = 1 targets die: full population trace, rule 30, class C1");
for (const [nm, S] of [["alt", [[0, 0], [1, 1]]], ["const", [[0, 1], [1, 0]]], ["0", [[0]]]]) {
  for (const a of [6, 8, 10, 12, 14]) {
    const K = 3 * a + 12;
    const r = census("r30", a, S, K, 1, 3e8);
    const tr = [];
    for (let k = 0; k <= K; k++) { tr.push(r.pop[k]); if (r.pop[k] === 0) break; }
    const last = tr[tr.length - 2] || 0;
    console.log(`    ${nm.padStart(5)} a=${String(a).padStart(2)}  f=${tr.length - 1}` +
      `  last level before extinction held ${last} survivors, all of which die at once` +
      `${r.over ? "  (BUDGET)" : ""}`);
    console.log(`          ${tr.join(" ")}`);
  }
}
