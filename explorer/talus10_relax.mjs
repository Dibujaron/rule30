// Talus, 2026-09-12.  The left-half relaxation of the alternating-block
// question, which is an UPPER bound on talus10_dfs.mjs's exact answer and is
// cheap enough to reach large a.
//
// Mechanism.  If the centre column alternates on a block, then at every BLACK
// time t of the block column_succ_of_black forces cell(-1, t) = 1, because
// c(t+1) = not cell(-1,t) and c(t+1) = 0.  So column -1 is black at every
// black time and free only at the white times: one free bit per two rows.
// Everything further left is then determined by leftSolve's recursion
//     cell(-(j+2), t) = cell(-(j+1), t+1) XOR (cell(-(j+1), t) OR cell(-j, t)),
// so the whole left half is a function of those half-as-many bits, while the
// cone imposes ONE equation per depth: cell(-k, 0) = 0 for every k > a.
// Equations outrun unknowns at depth about 2a.  This script computes the exact
// extinction depth of that system.
//
// Relaxation, stated plainly: column -1's white-time values are treated as free
// here.  In a real configuration they are not -- they are whatever the right
// half produces.  So this over-counts, and f_relax >= f_exact.  Block V checks
// that against talus10_dfs.mjs's exact numbers.

// D[k][j] = cell(-j, k-j).  D[k][0] = c(k); D[k][1] = d(k-1);
// D[k][j] = D[k][j-1] XOR (D[k-1][j-1] OR D[k-2][j-2]).   Constraint: D[k][k]=0
// for k > a (and = 1 at k = a, a-1 when the cone edge is imposed).

function relax(a, phase, cap, edge) {
  const c = (t) => (phase ^ (t & 1)) & 1;
  const D = [];
  for (let k = 0; k <= cap + 2; k++) D.push(new Uint8Array(cap + 3));
  D[0][0] = c(0);
  let best = 1;                       // cells; level 0 reached means 1 cell

  function rec(k) {
    if (k > cap) return;
    const blackPrev = c(k - 1) === 1;
    const choices = blackPrev ? [1] : [0, 1];   // d(k-1) forced at black times
    for (const dv of choices) {
      const Dk = D[k], D1 = D[k - 1], D2 = k >= 2 ? D[k - 2] : null;
      Dk[0] = c(k);
      if (k >= 1) Dk[1] = dv;
      for (let j = 2; j <= k; j++) Dk[j] = Dk[j - 1] ^ (D1[j - 1] | D2[j - 2]);
      const leftCell = Dk[k];         // cell(-k, 0)
      if (k > a && leftCell === 1) continue;
      if (edge && k === a && leftCell !== 1) continue;
      if (edge && k === a - 1 && leftCell !== 1) continue;
      if (k + 1 > best) best = k + 1;
      rec(k + 1);
    }
  }
  rec(1);
  return best;
}

function f(a, cap, edge) {
  return Math.max(relax(a, 0, cap, edge), relax(a, 1, cap, edge));
}

console.log("[V] relaxation vs the exact configuration search (talus10_dfs.mjs [L])");
console.log("    exact, white left of -a:  a=1..19 -> 8,8,8,8,9,10,10,17,17,17,17,17,17,20,22,26,26,26,36");
{
  let s = "    relaxed                :  ";
  for (let a = 1; a <= 19; a++) s += f(a, 8 * a + 40, false) + (a < 19 ? "," : "");
  console.log(s);
}

console.log("\n[R] the relaxation, pushed far.  Bound needed for rung 2: <= 3a.");
console.log("      a | relax plain | relax +edge |   2a    3a | ratio plain  ratio edge");
const rows = [];
for (const a of [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,24,28,32,40,48,56,64,80,96,128,160,200,256,320,400]) {
  const cap = 8 * a + 60;
  const p = f(a, cap, false), e = f(a, cap, true);
  rows.push([a, p, e]);
  const flag = (p >= cap) ? "  HIT CAP" : "";
  console.log(`    ${String(a).padStart(3)} | ${String(p).padStart(11)} | ${String(e).padStart(11)} | ` +
    `${String(2 * a).padStart(4)} ${String(3 * a).padStart(4)} | ${(p / a).toFixed(3)}       ${(e / a).toFixed(3)}${flag}`);
}
let worstP = 0, worstPa = 0, worstE = 0, worstEa = 0;
let worstP3 = 0, worstE3 = 0;
for (const [a, p, e] of rows) {
  if (a >= 3 && p / a > worstP) { worstP = p / a; worstPa = a; }
  if (a >= 3 && e / a > worstE) { worstE = e / a; worstEa = a; }
}
console.log(`\n    worst ratio over a >= 3: plain ${worstP.toFixed(3)} at a = ${worstPa}; +edge ${worstE.toFixed(3)} at a = ${worstEa}`);
console.log(`    (rung 2's window form needs the alternating block from a to have at most 3a cells)`);
