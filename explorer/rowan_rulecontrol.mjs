// Rowan, 2026-09-12. A control instrument the board has never had.
//
// THE PROBLEM. CLAUDE.md's goal section asks whether a node bears on a prize, and
// the sharpest version of that question is "is this statement about RULE 30, or is
// it true of anything?" The board answers it by hand, one node at a time, in
// DOES NOT PROVE fields, and the seeder got it wrong for the P2 tier this week
// (claimed all twelve closed P2 nodes hold of every Nat -> Bool; ten do).
//
// "True of every Bool sequence" is not mechanically checkable here. "True of every
// elementary cellular automaton" is, and it is the useful half: a property shared
// with rule 45 or rule 110 is not a property OF RULE 30, whatever else it is.
// Talus used exactly this once, against rule 86, and it killed a claim.
//
// So: run each candidate property over all 256 rules from the same single black
// cell, and report how many rules satisfy it. A property satisfied by many rules is
// a property of elementary CAs. A property satisfied by rule 30 alone is the kind a
// prize could rest on.
//
// Rules are the standard Wolfram numbering; the centre column is cell 0 at time t,
// with a single black cell at the origin on a white background.

const T = 4000;                       // rows to grow
const W = 2 * T + 5;                  // enough width that the cone never reaches an edge

function centreColumn(rule, T) {
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  const mid = T + 2;
  cur[mid] = 1;
  const col = new Uint8Array(T + 1);
  col[0] = cur[mid];
  for (let s = 1; s <= T; s++) {
    for (let i = 1; i < W - 1; i++) nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    nxt[0] = (rule >> (2 * cur[0] + cur[1])) & 1;
    nxt[W - 1] = (rule >> (4 * cur[W - 2] + 2 * cur[W - 1])) & 1;
    const tmp = cur; cur = nxt; nxt = tmp;
    col[s] = cur[mid];
  }
  return col;
}

// --- properties, each a predicate on the centre column ---

// P1  not eventually constant, checked over the window we have
function notEventuallyConstant(c) {
  const tail = c.subarray(c.length - 500);
  let allSame = true;
  for (let i = 1; i < tail.length; i++) if (tail[i] !== tail[0]) { allSame = false; break; }
  return !allSame;
}

// P2  centerColumn_black_run_lt_start, stated EXACTLY as the node does:
//     (ha : 1 <= a) (h : forall s <= L, centerColumn (a+s) = true) : L < a
// The run spans cells a..a+L, so it has L+1 cells and the claim is (run length) <= a.
// An earlier version of this function demanded (run length) < a, one stricter, and
// reported rule 30 as FAILING its own proved node. Read the quantifiers.
function blackRunLtStart(c) {
  let a = 1;
  while (a < c.length) {
    if (c[a] === 1) {
      let run = 0; while (a + run < c.length && c[a + run] === 1) run++;
      if (a + run >= c.length) break;    // truncated run, do not judge
      if (!(run - 1 < a)) return false;  // L = run - 1
      a += run;
    } else a++;
  }
  return true;
}

// P3  rung 2: all four length-2 words occur in every window [a, 4a], a >= 2
function rungTwo(c, maxA) {
  for (let a = 2; a <= maxA; a++) {
    // The WHOLE word must fit inside [a, 4a]: a word starting at t occupies
    // t..t+1, so t may run only to 4a-1. Letting it start at 4a silently widens
    // the window by L-1 and reports multipliers that are too small -- that was
    // this file's first version, and it disagreed with ephemeris2_rung2.mjs,
    // which has the convention right.
    const hi = Math.min(4 * a - 1, c.length - 2);
    const seen = new Set();
    for (let t = a; t <= hi; t++) seen.add(c[t] * 2 + c[t + 1]);
    if (seen.size < 4) return false;
  }
  return true;
}

// P4  rung 1: both colours occur in every window [a, 4a], a >= 2
function rungOne(c, maxA) {
  for (let a = 2; a <= maxA; a++) {
    const hi = Math.min(4 * a, c.length - 1);   // L = 1, so no spill correction needed
    let b = false, w = false;
    for (let t = a; t <= hi; t++) { if (c[t]) b = true; else w = true; }
    if (!b || !w) return false;
  }
  return true;
}

// P5  centerColumn_white_run_lt_start: white run spanning a..a+L has L < 3a
function whiteRunLtThriceStart(c) {
  let a = 1;
  while (a < c.length) {
    if (c[a] === 0) {
      let run = 0; while (a + run < c.length && c[a + run] === 0) run++;
      if (a + run >= c.length) break;
      if (!(run - 1 < 3 * a)) return false;
      a += run;
    } else a++;
  }
  return true;
}

// P6/P7  rung L: all 2^L words of length L occur in every window [a, m*a], a >= 2
function rungL(c, L, m, maxA) {
  const need = 1 << L;
  for (let a = 2; a <= maxA; a++) {
    const hi = Math.min(m * a - (L - 1), c.length - L);   // whole word inside [a, m*a]
    const seen = new Set();
    for (let t = a; t <= hi; t++) { let v = 0; for (let j = 0; j < L; j++) v = v * 2 + c[t + j]; seen.add(v); }
    if (seen.size < need) return false;
  }
  return true;
}

const props = [
  ['not eventually constant',            c => notEventuallyConstant(c)],
  ['black run < its start (a>=1)',       c => blackRunLtStart(c)],
  ['rung 1: both colours in [a,4a]',     c => rungOne(c, 800)],
  ['rung 2: all 4 pairs in [a,4a]',      c => rungTwo(c, 800)],
  ['white run < 3x its start (a>=1)',    c => whiteRunLtThriceStart(c)],
  ['rung 3: all 8 triples in [a,4a]',    c => rungL(c, 3, 4, 600)],
  ['rung 3: all 8 triples in [a,16a]',   c => rungL(c, 3, 16, 200)],
  ['rung 4: all 16 words in [a,16a]',    c => rungL(c, 4, 16, 200)],
];

// Rule equivalence under left-right reflection and black-white complement: the
// standard group of order 4 on elementary rules. Two rules in one class are the
// same automaton in different coordinates, so a property holding for one holds for
// all four; counting CLASSES rather than rules is the honest measure.
function reflect(r) { let o = 0; for (let n = 0; n < 8; n++) { const m = ((n & 4) >> 2) | (n & 2) | ((n & 1) << 2); if ((r >> n) & 1) o |= 1 << m; } return o; }
function complement(r) { let o = 0; for (let n = 0; n < 8; n++) { if (!((r >> (7 - n)) & 1)) o |= 1 << n; } return o; }
function classOf(r) { const c = complement(r); return Math.min(r, reflect(r), c, reflect(c)); }
// CAVEAT, and it bit this file once. Reflection fixes the centre column (cell 0 maps
// to itself), so a centre-column property is always reflection-invariant. COMPLEMENT
// IS NOT A SYMMETRY OF A COLOUR-SPECIFIC PROPERTY: it turns a black run into a white
// one. So the 4-element class is the right unit for the colour-symmetric rung
// properties ("all 2^L words occur") and the WRONG unit for the run bounds, where it
// produces the nonsense "242 of 256 rules but 88 of 88 classes". Read the class count
// only on the rung rows; read the rule count everywhere.
function classOfReflectionOnly(r) { return Math.min(r, reflect(r)); }

const cols = new Map();
for (let r = 0; r < 256; r++) cols.set(r, centreColumn(r, T));

console.log(`Each property run over all 256 elementary rules, single black cell, T = ${T}.`);
console.log('A property many rules satisfy is a property of elementary CAs, not of rule 30.\n');
for (const [name, f] of props) {
  const sat = [];
  for (let r = 0; r < 256; r++) if (f(cols.get(r))) sat.push(r);
  const has30 = sat.includes(30);
  console.log(`${name}`);
  console.log(`   rules satisfying : ${sat.length} / 256     rule 30 among them: ${has30 ? 'YES' : 'NO'}`);
  const allCls = new Set(sat.map(classOf));
  console.log(`   equivalence classes satisfying : ${allCls.size} / 88`);
  if (sat.length <= 24) {
    console.log(`   they are: ${sat.join(', ')}`);
    const cls = new Map();
    for (const r of sat) { const k = classOf(r); if (!cls.has(k)) cls.set(k, []); cls.get(k).push(r); }
    console.log(`   equivalence classes (reflection / complement), ${cls.size} of them:`);
    for (const [k, v] of cls) console.log(`      class ${k}: ${v.join(', ')}`);
  }
  console.log('');
}
