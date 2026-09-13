// Parallax, 2026-09-13.  REFEREE -- AND THE REFEREE WAS THE WRONG ONE.
//
// This file agreed with parallax_controls2.mjs and both are wrong for the 128
// NON-QUIESCENT rules: they evolve only the cone [-t, t] and treat the outside
// as white for ever, but when f(0,0,0) = 1 the infinite white background flips
// at every step and the picture is not a cone.  A referee written by the same
// head shares its assumptions.  Settled by parallax_bg.mjs, which carries the
// background value analytically; this file's verdicts are correct on quiescent
// rules (rule 30, 86, 110, 184 among them) and wrong on the rest.
//
// parallax_geom.mjs [A] printed the first fourteen no-period rules as
//   30 45 75 86 89 101 126 129 135 137 149 161 167 181
// and parallax_controls2.mjs [A] printed all fifteen as
//   30 45 75 86 89 101 126 129 135 137 149 161 169 193 225
// Both say fifteen; they disagree on the members.  A count that agrees while
// the membership does not is exactly the shape my notebook says to referee
// rather than to stare at, so here is a third implementation that shares no
// code with either: a plain array-of-numbers picture, no typed arrays, no
// buffer swapping, no live range, one row appended per step.

function pictureColumn(rule, T) {
  const f = (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;
  let row = new Map();                 // sparse: position -> 1
  row.set(0, 1);
  const col = [1];
  for (let t = 1; t <= T; t++) {
    const nxt = new Map();
    for (let x = -t; x <= t; x++) {
      const l = row.get(x - 1) || 0, c = row.get(x) || 0, r = row.get(x + 1) || 0;
      if (f(l, c, r)) nxt.set(x, 1);
    }
    row = nxt;
    col.push(row.get(0) || 0);
  }
  return col;
}

// a period test written the other way round: for each (onset, period) pair with
// onset <= T/2 and period <= 64, verify directly.
function hasPeriod(col, maxP) {
  const T = col.length;
  const start = Math.floor(T / 2);
  for (let p = 1; p <= maxP; p++) {
    let ok = true;
    for (let i = start; i + p < T; i++) if (col[i] !== col[i + p]) { ok = false; break; }
    if (ok) return p;
  }
  return null;
}

const T = 20000;
const disputed = [161, 167, 169, 181, 193, 225, 30, 45, 86, 110, 184];
console.log("=== referee: sparse-map picture, period tested on the second half ===");
console.log("   rule   period found on col[10000..20000]   first 24 of the column");
for (const rule of disputed) {
  const col = pictureColumn(rule, T);
  const p = hasPeriod(col, 64);
  console.log(`   ${String(rule).padStart(4)}   ${String(p === null ? "none <= 64" : p).padStart(28)}   ` +
    col.slice(0, 24).join(""));
}
console.log();

console.log("=== referee: the full list, all 256 rules ===");
const none = [];
for (let rule = 0; rule < 256; rule++) {
  if (hasPeriod(pictureColumn(rule, 4000), 64) === null) none.push(rule);
}
console.log(`  at T = 4000: ${none.length} rules with no period <= 64 on the tail: [${none.join(", ")}]`);
const none2 = [];
for (const rule of none) {
  if (hasPeriod(pictureColumn(rule, T), 64) === null) none2.push(rule);
}
console.log(`  of those, still none at T = ${T}: ${none2.length} rules: [${none2.join(", ")}]`);
console.log();
console.log("  Note the difference between the two period tests.  The referee asks");
console.log("  'is the SECOND HALF periodic', which is a genuine eventual-periodicity");
console.log("  test with onset <= T/2.  parallax_geom.mjs and parallax_controls2.mjs");
console.log("  both use evPeriodicFast, which finds the LAST index where col[i] and");
console.log("  col[i+p] differ and accepts if that index is below T/2 -- the same");
console.log("  statement.  If the three disagree, evPeriodicFast is wrong.");
