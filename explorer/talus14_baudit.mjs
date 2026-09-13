// Talus, 2026-09-13. Which proved board facts are (B) facts, mechanically.
//
// The 17:15Z reading says "every proved (B) fact on the board" uses the two OR
// entries and comes from the left edge. No such list exists on disk -- I looked
// at the 16:50Z entry the brief names and it is not there. So build it, and build
// it by a criterion rather than by judgement:
//
//    a proved board statement about the SEED's picture is a (B) FACT
//    iff it is FALSE for rule 120.
//
// Rule 120 = l XOR (c AND r) agrees with rule 30 at the four table rows with
// c = r and differs at the four with c != r (kernel: talus14_scratch_and.lean,
// or_and_differ_exactly, no axioms). So "false for 120" is exactly "consumes at
// least one of the four OR/AND entries in an essential way".
//
// Controls reported beside it: rule 110 (Rowan's old control), rule 86 (rule 30's
// mirror), and the count over all 256 rules, which says whether the fact is about
// rule 30 at all.

const T = 3000;
const W = 2 * T + 9;
const MID = T + 4;

function picture(rule, T) {
  const rows = [];
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[MID] = 1;
  rows.push(cur.slice());
  for (let s = 1; s <= T; s++) {
    for (let i = 1; i < W - 1; i++) nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
    rows.push(cur.slice());
  }
  return rows;
}
const at = (rows, t, x) => rows[t][MID + x];

const TT = 1200;   // depth at which the picture predicates are evaluated

// Each entry: node name, predicate on the picture, and where its CONCLUSION lives.
//   'edge'   : about cells at x = -t + O(1) -- the left edge region
//   'col0'   : about column 0 at unbounded time
//   'other'  : right edge / diagonals / elsewhere
const facts = [
  ['evolve_left_edge', 'edge', r => { for (let t = 0; t <= TT; t++) if (at(r, t, -t) !== 1) return false; return true; }],
  ['evolve_left_second_diagonal', 'edge', r => { for (let t = 0; t <= TT; t++) if (at(r, t + 1, -t) !== 1) return false; return true; }],
  ['evolve_left_third_diagonal', 'edge', r => { for (let t = 0; t <= TT; t++) if (at(r, t + 2, -t) !== 0) return false; return true; }],
  ['evolve_left_fourth_diagonal', 'edge', r => { for (let t = 0; t <= TT; t++) if (at(r, t + 3, -t) !== (t % 2 === 0 ? 1 : 0)) return false; return true; }],
  ['evolve_left_fifth_diagonal', 'edge', r => { for (let t = 0; t <= TT; t++) if (at(r, t + 4, -t) !== 1) return false; return true; }],
  ['evolve_right_edge', 'other', r => { for (let t = 0; t <= TT; t++) if (at(r, t, t) !== 1) return false; return true; }],
  ['evolve_right_second_diagonal', 'other', r => { for (let t = 0; t <= TT; t++) if (at(r, t + 1, t) !== (t % 2 === 0 ? 1 : 0)) return false; return true; }],
  ['evolve_eq_false_of_outside_cone', 'other', r => { for (let t = 0; t <= 200; t++) for (let x = -T - 2; x <= T + 2; x++) { if (Math.abs(x) > t && MID + x >= 0 && MID + x < W && at(r, t, x) === 1) return false; } return true; }],
  ['centerColumn_zero', 'col0', r => at(r, 0, 0) === 1],
  ['centerColumn_not_eventually_constant', 'col0', r => { let b = false, w = false; for (let t = TT - 400; t <= TT; t++) { if (at(r, t, 0)) b = true; else w = true; } return b && w; }],
  ['centerColumn_black_run_lt_start', 'col0', r => runBound(r, 1, 1)],
  ['centerColumn_white_run_lt_start', 'col0', r => runBound(r, 0, 3)],
  ['centerColumn_window_not_constant', 'col0', r => { for (let a = 1; a * 4 <= TT; a++) { let b = false, w = false; for (let s = 0; s <= 3 * a; s++) { if (at(r, a + s, 0)) b = true; else w = true; } if (!b || !w) return false; } return true; }],
  ['not_isEventuallyPeriodic_adjacent (cols 0,1)', 'col0', r => !(evPer(r, 0) && evPer(r, 1))],
  ['not_isEventuallyPeriodic_pair (cols 0,5)', 'col0', r => !(evPer(r, 0) && evPer(r, 5))],
  ['leftDiagonal_not_both_eventually_white (k=0,1)', 'edge', r => !(diagEvWhite(r, 0) && diagEvWhite(r, 1))],
  ['leftDiagonal_period_unbounded (some k has period > 2)', 'edge', r => { for (let k = 0; k < 60; k++) if (!diagPeriodDivides(r, k, 2)) return true; return false; }],
  ['rightDiagonal_period_unbounded (some k has period > 2)', 'other', r => { for (let k = 0; k < 60; k++) if (!rdiagPeriodDivides(r, k, 2)) return true; return false; }],
  ['rightDiagonal_periodicFrom_pow (k<=8, period 2^k from 0)', 'other', r => { for (let k = 0; k <= 8; k++) if (!rdiagPeriodDivides(r, k, 1 << k)) return false; return true; }],
  ['rightDiagonal_not_constant (k=1..8)', 'other', r => { for (let k = 1; k <= 8; k++) { let b = false, w = false; for (let j = 0; j < 600; j++) { if (at(r, j + k, j)) b = true; else w = true; } if (!b || !w) return false; } return true; }],
];

function runBound(r, colour, mult) {
  let a = 1;
  while (a < TT) {
    if (at(r, a, 0) === colour) {
      let run = 0; while (a + run < TT && at(r, a + run, 0) === colour) run++;
      if (a + run >= TT) break;
      if (!(run - 1 < mult * a)) return false;
      a += run;
    } else a++;
  }
  return true;
}
function evPer(r, x) {            // eventually periodic with period <= 64, onset <= TT/2
  for (let p = 1; p <= 64; p++) {
    let ok = true;
    for (let t = TT / 2; t + p <= TT; t++) if (at(r, t, x) !== at(r, t + p, x)) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}
function diagEvWhite(r, k) { for (let j = 300; j < 900; j++) if (at(r, j + k, -j)) return false; return true; }
function diagPeriodDivides(r, k, p) { for (let j = 300; j + p < 900; j++) if (at(r, j + k, -j) !== at(r, j + p + k, -j - p)) return false; return true; }
function rdiagPeriodDivides(r, k, p) { for (let j = 0; j + p < 600; j++) if (at(r, j + k, j) !== at(r, j + p + k, j + p)) return false; return true; }

const pics = new Map();
for (const rule of [30, 120, 110, 86]) pics.set(rule, picture(rule, TT + 10));

console.log(`[V] rule 30 centre column t=0..10 : ${[...Array(11).keys()].map(t => at(pics.get(30), t, 0)).join('')}  (crystal 46: 11011100110)`);
console.log(`    rule 120 picture is the ray x=t : ${(() => { const r = pics.get(120); for (let t = 0; t <= 300; t++) for (let x = -t; x <= t; x++) if (at(r, t, x) !== (x === t ? 1 : 0)) return 'NO'; return 'YES'; })()}\n`);

console.log('THE (B) AUDIT.  "(B)" = the statement is FALSE for rule 120, i.e. it consumes an OR/AND entry.');
console.log('"reach" = where the statement\'s own conclusion lives.\n');
console.log('  node                                              reach   r30  r120  r110  r86   (B)?');
const bFacts = [];
for (const [name, reach, f] of facts) {
  const v = {};
  for (const rule of [30, 120, 110, 86]) v[rule] = f(pics.get(rule));
  const isB = v[30] && !v[120];
  if (isB) bFacts.push([name, reach]);
  const y = b => (b ? ' Y ' : ' . ');
  console.log(`  ${name.padEnd(48)} ${reach.padEnd(7)}${y(v[30])}  ${y(v[120])}  ${y(v[110])}  ${y(v[86])}  ${isB ? 'YES' : 'no'}${v[30] ? '' : '   <-- rule 30 FAILS its own node, check the predicate'}`);
}

console.log(`\n  (B) facts found: ${bFacts.length} of ${facts.length}.`);
const byReach = new Map();
for (const [n, r] of bFacts) { if (!byReach.has(r)) byReach.set(r, []); byReach.get(r).push(n); }
for (const [r, ns] of byReach) {
  console.log(`\n  reach = ${r}   (${ns.length})`);
  for (const n of ns) console.log(`      ${n}`);
}

// ---- how many of the 256 rules satisfy each (B) fact? a fact many rules share is not about rule 30
console.log('\n\nHOW MANY OF THE 256 RULES SATISFY EACH FACT (single black cell, same predicate):');
const allPics = new Map();
for (let rule = 0; rule < 256; rule++) allPics.set(rule, picture(rule, TT + 10));
console.log('  node                                              rules/256');
for (const [name, , f] of facts) {
  let n = 0;
  for (let rule = 0; rule < 256; rule++) if (f(allPics.get(rule))) n++;
  console.log(`  ${name.padEnd(48)} ${String(n).padStart(6)}`);
}
