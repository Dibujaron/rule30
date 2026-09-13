// Parallax, 2026-09-13.  Corrected [D] and [E] of parallax_geom.mjs, with an
// engine check against the board's own numbers first.
//
// parallax_geom.mjs blocks [D] and [E] are both WRONG and are labelled there:
//   [D] carried a frontier that GREW by one cell per step, but the anti-diagonal
//       x + t = R never leaves the cone (the cone edge is x + t = -a), so the
//       true frontier is infinite with a constant tail equal to the cone-edge
//       cell.  Its f(a) column read 10,5,13,8,... against the published
//       8,8,8,8,9,10,10,17 — non-monotone, which is the tell.
//   [E] used LD_k[j] = LD_k[j-1] XOR (LD_{k-1}[j-1] OR LD_{k-2}[j-1]),
//       which fails on half the cells.  The identity is derived below.

const bit = (n, i) => (n >> i) & 1;
const localF = (rule) => (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;
const f30 = localF(30);

// ------------------------------------------------------------ engine check
console.log("=== [0] engine check: the seed's centre column against the board ===");
const N = 600;
const W = 2 * N + 3;
let cur = new Uint8Array(W); cur[N + 1] = 1;
const pic = [Array.from(cur)];
for (let t = 1; t <= N; t++) {
  const nxt = new Uint8Array(W);
  for (let i = 0; i < W; i++) nxt[i] = f30(i > 0 ? cur[i - 1] : 0, cur[i], i < W - 1 ? cur[i + 1] : 0);
  cur = nxt; pic.push(Array.from(cur));
}
const col = [];
for (let t = 0; t <= 10; t++) col.push(pic[t][N + 1]);
console.log(`  centre column t = 0..10: ${col.join("")}`);
console.log(`  board (crystal 46 / Basic.lean): 11011100110`);
console.log(`  agree: ${col.join("") === "11011100110"}`);
console.log();

// --------------------------------------- [E] the left-diagonal recurrence
console.log("=== [E] do the left diagonals obey the SAME 4-ary relation? ===");
const LD = (k, j) => pic[j + k][N + 1 - j];
console.log("  leftDiagonal k j = evolve (j+k) (-j),  Basic.lean:88");
console.log("  Substituting into cell(t,x) = cell(t-1,x-1) XOR (cell(t-1,x) OR cell(t-1,x+1)):");
console.log("    t = j+k, x = -j");
console.log("    cell(t-1,x-1) = LD(k-2, j+1)   cell(t-1,x) = LD(k-1, j)   cell(t-1,x+1) = LD(k, j-1)");
const forms = [
  ["LD(k,j) = LD(k-2,j+1) XOR (LD(k-1,j) OR LD(k,j-1))   [derived]",
    (k, j) => LD(k, j) === (LD(k - 2, j + 1) ^ (LD(k - 1, j) | LD(k, j - 1)))],
  ["LD(k,j) = LD(k,j-1) XOR (LD(k-1,j-1) OR LD(k-2,j-1))  [the form I first used]",
    (k, j) => LD(k, j) === (LD(k, j - 1) ^ (LD(k - 1, j - 1) | LD(k - 2, j - 1)))],
];
for (const [name, test] of forms) {
  let fails = 0, checked = 0;
  for (let k = 2; k < 200; k++) for (let j = 1; j + k < N - 1; j++) { checked++; if (!test(k, j)) fails++; }
  console.log(`  ${fails} failures of ${checked}   ${name}`);
}
console.log("  => the diagonal family is an instance over the SAME 8-tuple relation,");
console.log("     laid out on a different hypergraph.  Every diagonal at k >= 1 is");
console.log("     provably eventually periodic (leftDiagonal_periodicFrom_pow) and the");
console.log("     j = 0 slice of the same family is the centre column (CLAUDE.md).");
console.log();

// ---------------------------- [D] the rung-2 family as a finite automaton
console.log("=== [D] the rung-2 family for fixed a is a REGULAR language of rows ===");
console.log("  Decide row 0 left to right from x = -a.  Once cells -a..R are fixed,");
console.log("  every cell with x + t <= R is determined.  Carry the two anti-diagonals");
console.log("  x + t = R and x + t = R-1, truncated at depth CAP (only column values at");
console.log("  t <= CAP are ever read).  At R = -a the diagonal x+t = -a IS the cone");
console.log("  edge, whose cells all equal row0[-a]; the one left of it is white.");
console.log();
console.log("      a   f_relaxed(a)   published   max |states|   states at the last level");

const PUB = [8, 8, 8, 8, 9, 10, 10, 17, 17, 17, 17, 17];
const CAP = 40;

function frontier(a, phase, pinLeftBlack) {
  // state: [D0, D1] arrays of length CAP+2; D0[s] = cell(s, R-s), D1[s] = cell(s, R-1-s)
  let cur = new Map();
  const starts = pinLeftBlack ? [1] : [0, 1];
  for (const b of starts) {
    const D0 = new Array(CAP + 2).fill(b);   // the cone edge, constant
    const D1 = new Array(CAP + 2).fill(0);   // outside the cone
    cur.set(JSON.stringify([D0, D1]), true);
  }
  let R = -a, best = 0, maxStates = cur.size, lastSize = cur.size;
  while (cur.size > 0 && R < CAP) {
    const next = new Map();
    for (const s of cur.keys()) {
      const [D0, D1] = JSON.parse(s);
      for (const b of [0, 1]) {
        const E = new Array(CAP + 2);
        E[0] = b;
        for (let t = 1; t <= CAP + 1; t++) E[t] = f30(D1[t - 1], D0[t - 1], E[t - 1]);
        const tcol = R + 1;
        if (tcol >= 0) {
          if (tcol > CAP) continue;
          if (E[tcol] !== ((tcol + phase) % 2)) continue;
          best = Math.max(best, tcol + 1);
        }
        next.set(JSON.stringify([E, D0]), true);
      }
    }
    cur = next; R += 1;
    if (cur.size) { maxStates = Math.max(maxStates, cur.size); lastSize = cur.size; }
  }
  return { best, maxStates, lastSize };
}

for (let a = 1; a <= 12; a++) {
  let best = 0, maxStates = 0, last = 0;
  for (const phase of [0, 1]) {
    const r = frontier(a, phase, false);
    best = Math.max(best, r.best);
    maxStates = Math.max(maxStates, r.maxStates);
    last = Math.max(last, r.lastSize);
  }
  const pub = a <= PUB.length ? PUB[a - 1] : "--";
  console.log(`     ${String(a).padStart(2)}   ${String(best).padStart(12)}   ${String(pub).padStart(9)}   ` +
    `${String(maxStates).padStart(12)}   ${last}`);
}
console.log();
console.log("  So for each a the question 'is there a row of this class whose centre");
console.log("  column alternates for L steps' is decided by a FINITE AUTOMATON reading");
console.log("  row 0 left to right.  The instance family is therefore about as far from");
console.log("  an arbitrary instance over the language as a family can be.");
