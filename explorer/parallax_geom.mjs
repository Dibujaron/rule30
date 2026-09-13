// Parallax, 2026-09-13.  The controls for the clone computation, and the
// geometric side of the seam.
//
// TWO OF ITS FIVE BLOCKS ARE WRONG AND ARE SUPERSEDED.  See parallax_geom2.mjs.
//   [D] carried a frontier that GREW by one cell per step; the anti-diagonal
//       x + t = R never leaves the cone (the cone edge is x + t = -a), so the
//       true frontier is infinite with a constant tail.  Its f(a) column is
//       non-monotone, which is the tell.  Corrected in parallax_geom2.mjs [D].
//   [E] used the wrong left-diagonal recurrence and fails on half the cells.
//       Corrected and derived in parallax_geom2.mjs [E].
// [A] is RIGHT and is the one block here that the later scripts got wrong: it
// updates the whole array, so for the 128 non-quiescent rules it evolves the
// flipping background correctly.  parallax_bg.mjs redoes it exactly and agrees.
// [B] and [C] stand.
//
// [A] Does the clone verdict correlate with anything about the centre column?
//     (control: rules whose centre column IS eventually periodic but whose
//      local relation has the same trivial clone as rule 30's.)
// [B] {f_30, 0, 1} is a complete Boolean basis: explicit circuits.
// [C] AND from four rule-30 gates, verified on all inputs.
// [D] the geometry: the rung-2 family for fixed a is recognised by a finite
//     automaton reading row 0 left to right; its size, measured.
// [E] the left-diagonal control: the diagonals obey the SAME local relation.

const bit = (n, i) => (n >> i) & 1;
const localF = (rule) => (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;

// --------------------------------------------------------------- [A] columns
// centre column of rule R from a single black cell, by a packed BigInt row.
function centreColumn(rule, T) {
  const f = localF(rule);
  // dense array row, width 2T+3, origin at index T+1
  const W = 2 * T + 3;
  let cur = new Uint8Array(W);
  cur[T + 1] = 1;
  const out = [1];
  for (let t = 1; t <= T; t++) {
    const nxt = new Uint8Array(W);
    for (let i = 0; i < W; i++) {
      const l = i > 0 ? cur[i - 1] : 0;
      const c = cur[i];
      const r = i < W - 1 ? cur[i + 1] : 0;
      nxt[i] = f(l, c, r);
    }
    cur = nxt;
    out.push(cur[T + 1]);
  }
  return out;
}

// eventual periodicity with period <= P and onset <= N, tested on a tail
function evPeriodic(seq, P, N) {
  const T = seq.length;
  for (let p = 1; p <= P; p++) {
    for (let n = 0; n <= N; n += 1) {
      let ok = true;
      for (let i = n; i + p < T; i++) if (seq[i] !== seq[i + p]) { ok = false; break; }
      if (ok) return { p, n };
      // if it failed at some i < n+p there is no point trying larger n cheaply;
      // fall through: the loop over n is bounded and this is only run at small P.
    }
  }
  return null;
}

// faster: find the smallest (onset, period) by scanning the tail
function evPeriodicFast(seq, maxP) {
  const T = seq.length;
  for (let p = 1; p <= maxP; p++) {
    // largest index where seq[i] != seq[i+p]
    let last = -1;
    for (let i = 0; i + p < T; i++) if (seq[i] !== seq[i + p]) last = i;
    if (last === -1) return { p, n: 0 };
    if (last < T / 2) return { p, n: last + 1 };
  }
  return null;
}

// rebuild the clone verdict cheaply (same test as parallax_clone.mjs)
function commutes(op, k, f) {
  const N = 1 << k;
  for (let L = 0; L < N; L++) for (let C = 0; C < N; C++) for (let R = 0; R < N; R++) {
    let O = 0;
    for (let i = 0; i < k; i++) O |= f(bit(L, i), bit(C, i), bit(R, i)) << i;
    if (op[O] !== f(op[L], op[C], op[R])) return false;
  }
  return true;
}
const AND2 = [0, 0, 0, 1], OR2 = [0, 1, 1, 1];
const MAJ3 = [0, 0, 0, 1, 0, 1, 1, 1].map((_, m) => (bit(m, 0) + bit(m, 1) + bit(m, 2)) >= 2 ? 1 : 0);
const MIN3 = [0, 1, 2, 3, 4, 5, 6, 7].map((m) => bit(m, 0) ^ bit(m, 1) ^ bit(m, 2));
function verdict(rule) {
  const f = localF(rule);
  const a = commutes(AND2, 2, f), o = commutes(OR2, 2, f);
  const mj = commutes(MAJ3, 3, f), mn = commutes(MIN3, 3, f);
  if (a || o || mj) return "bounded width";
  if (mn) return "affine";
  return "trivial clone";
}

console.log("=== [A] the clone verdict against the centre column, all 256 rules ===");
const T = 20000;
const tally = new Map();
const examples = new Map();
for (let rule = 0; rule < 256; rule++) {
  const v = verdict(rule);
  const col = centreColumn(rule, T);
  const per = evPeriodicFast(col, 64);
  const key = `${v} | centre column ${per ? "EVENTUALLY PERIODIC" : "no period <= 64 found"}`;
  tally.set(key, (tally.get(key) || 0) + 1);
  if (!examples.has(key)) examples.set(key, []);
  if (examples.get(key).length < 14) examples.get(key).push(per ? `${rule}(p=${per.p})` : `${rule}`);
}
for (const [k, n] of [...tally].sort()) {
  console.log(`  ${String(n).padStart(3)}  ${k}`);
  console.log(`       e.g. ${examples.get(k).join(" ")}`);
}
console.log();
console.log("  the rules this board argues about, individually:");
for (const rule of [30, 45, 90, 110, 150, 184, 22, 105, 60, 240, 204, 232, 128]) {
  const col = centreColumn(rule, T);
  const per = evPeriodicFast(col, 64);
  console.log(`    rule ${String(rule).padStart(3)}  ${verdict(rule).padEnd(15)}  centre column: ` +
    (per ? `eventually periodic, period ${per.p}, onset ${per.n}` : "no period <= 64 within 20000 terms"));
}
console.log();

// -------------------------------------------- [B][C] complete Boolean basis
console.log("=== [B] {f_30, 0, 1} is a complete Boolean basis ===");
const f30 = localF(30);
const NOT = (x) => f30(x, 1, 0);
const OR = (x, y) => f30(0, x, y);
const XOR = (x, y) => f30(x, y, 0);
const AND = (x, y) => NOT(OR(NOT(x), NOT(y)));
let okB = true;
for (const x of [0, 1]) {
  if (NOT(x) !== (1 ^ x)) okB = false;
  for (const y of [0, 1]) {
    if (OR(x, y) !== (x | y)) okB = false;
    if (XOR(x, y) !== (x ^ y)) okB = false;
    if (AND(x, y) !== (x & y)) okB = false;
  }
}
console.log(`  NOT x   = f(x, 1, 0)          : ${[0, 1].map(NOT).join("")}   (want 10)`);
console.log(`  x OR y  = f(0, x, y)          : ${[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => OR(a, b)).join("")}  (want 0111)`);
console.log(`  x XOR y = f(x, y, 0)          : ${[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => XOR(a, b)).join("")}  (want 0110)`);
console.log(`  x AND y = NOT(OR(NOT,NOT))    : ${[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => AND(a, b)).join("")}  (want 0001)  [4 gates]`);
console.log(`  all tables correct: ${okB}`);
console.log();

console.log("=== [C] which rules give a complete basis with constants? ===");
console.log("  (Post: {f, 0, 1} is complete iff f is neither monotone nor affine)");
function isMonotone(f) {
  for (let m = 0; m < 8; m++) for (let n = 0; n < 8; n++) {
    if ((m & n) === m) { // m <= n bitwise, bits are (l,c,r) = (2,1,0)
      if (f(bit(m, 2), bit(m, 1), bit(m, 0)) > f(bit(n, 2), bit(n, 1), bit(n, 0))) return false;
    }
  }
  return true;
}
function isAffine(f) {
  const g = (m) => f(bit(m, 2), bit(m, 1), bit(m, 0));
  for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) for (let z = 0; z < 8; z++)
    if ((g(x) ^ g(y) ^ g(z)) !== g(x ^ y ^ z)) return false;
  return true;
}
let complete = [], trivialClone = [];
for (let rule = 0; rule < 256; rule++) {
  const f = localF(rule);
  if (!isMonotone(f) && !isAffine(f)) complete.push(rule);
  if (verdict(rule) === "trivial clone") trivialClone.push(rule);
}
console.log(`  complete bases: ${complete.length} rules`);
console.log(`  trivial clone : ${trivialClone.length} rules`);
const onlyTrivial = trivialClone.filter((r) => !complete.includes(r));
const onlyComplete = complete.filter((r) => !trivialClone.includes(r));
console.log(`  complete but not trivial clone: [${onlyComplete.join(",")}]`);
console.log(`  trivial clone but not complete: [${onlyTrivial.join(",")}]`);
console.log(`    (those are the monotone non-affine rules whose graph still has only`);
console.log(`     projections: monotone is NOT the same as being a lattice homomorphism)`);
for (const r of onlyTrivial) {
  const f = localF(r);
  const tt = [];
  for (let m = 7; m >= 0; m--) tt.push(f(bit(m, 2), bit(m, 1), bit(m, 0)));
  console.log(`      rule ${String(r).padStart(3)}  truth table (111..000) ${tt.join("")}`);
}
console.log();

// ----------------------------------------------------- [D] the geometry side
console.log("=== [D] the rung-2 family is a REGULAR language of initial rows ===");
console.log("  Read row 0 left to right from x = -a.  After deciding cells -a..R the");
console.log("  centre column is determined for t <= R, and the state that must be");
console.log("  carried is the anti-diagonal frontier.  Automaton size, measured:");
console.log("      a   |states|  longest alternating block f(a)");
for (let a = 1; a <= 10; a++) {
  const res = frontier(a, 200);
  console.log(`     ${String(a).padStart(2)}   ${String(res.maxStates).padStart(7)}   ${res.f}`);
}

// exact frontier automaton: state = (D0, D1) the two anti-diagonals needed to
// continue, as bit strings.  cell(t, R-t) and cell(t, R-1-t).
function frontier(a, cap) {
  let f = 0, maxStates = 0;
  for (const phase of [0, 1]) {
    // after deciding row0 cells -a .. R, the picture is determined on the
    // triangle { (t,x) : x + t <= R, x >= -a-t }.  To extend we need the
    // anti-diagonal x + t = R and x + t = R-1 (two of them, because the rule
    // reads x-1, x, x+1 one step up).
    // encode D as an array indexed by t = 0..(R+a), D[t] = cell(t, R-t).
    let cur = new Set();
    // R = -a: only cell(0,-a) exists on the diagonal x+t = -a, and the previous
    // diagonal is all white (outside the cone).
    for (const b of [0, 1]) cur.add(JSON.stringify([[b], []]));
    let R = -a, depth = 0;
    while (cur.size > 0 && depth < cap) {
      maxStates = Math.max(maxStates, cur.size);
      const next = new Set();
      for (const s of cur) {
        const [D0, D1] = JSON.parse(s);
        for (const b of [0, 1]) {
          // new diagonal E at x + t = R+1:  E[0] = b (cell(0, R+1))
          // E[t] = f( cell(t-1, R-t), cell(t-1, R+1-t), cell(t-1, R+2-t) )
          //      = f( D1[t-1] , D0[t-1] , E[t-1] )
          // where D0[t-1] = cell(t-1, R-(t-1)) = cell(t-1, R-t+1)  ✓
          //       D1[t-1] = cell(t-1, R-1-(t-1)) = cell(t-1, R-t)  ✓
          //       E[t-1]  = cell(t-1, R+1-(t-1)) = cell(t-1, R-t+2) ✓
          const E = [b];
          for (let t = 1; t <= D0.length; t++) {
            const l = t - 1 < D1.length ? D1[t - 1] : 0;
            const c = D0[t - 1];
            const r = E[t - 1];
            E.push(localF(30)(l, c, r));
          }
          // the column value at time t = R+1 is cell(R+1, 0) which is E[R+1]
          // only once R+1 >= 0.
          const tcol = R + 1;
          if (tcol >= 0) {
            const v = E[tcol];
            if (v !== ((tcol + phase) % 2)) continue;   // alternation violated
            f = Math.max(f, tcol + 1);
          }
          next.add(JSON.stringify([E, D0]));
        }
      }
      cur = next;
      R += 1;
      depth += 1;
    }
  }
  return { f, maxStates };
}

console.log();
console.log("=== [E] the left diagonals obey the SAME local relation ===");
console.log("  leftDiagonal_recurrence:  LD_k[j] = LD_k[j-1] XOR (LD_{k-1}[j-1] OR LD_{k-2}[j-1])");
console.log("  i.e. the same f(l,c,r) = l XOR (c OR r) on a different triple of cells.");
{
  // verify against the picture
  const N = 400;
  const W = 2 * N + 3;
  let cur = new Uint8Array(W); cur[N + 1] = 1;
  const pic = [Array.from(cur)];
  for (let t = 1; t <= N; t++) {
    const nxt = new Uint8Array(W);
    for (let i = 0; i < W; i++) nxt[i] = f30(i > 0 ? cur[i - 1] : 0, cur[i], i < W - 1 ? cur[i + 1] : 0);
    cur = nxt; pic.push(Array.from(cur));
  }
  const LD = (k, j) => pic[j + k][N + 1 - j];
  let fails = 0, checked = 0;
  for (let k = 2; k < 150; k++) for (let j = 1; j + k < N; j++) {
    checked++;
    if (LD(k, j) !== (LD(k, j - 1) ^ (LD(k - 1, j - 1) | LD(k - 2, j - 1)))) fails++;
  }
  console.log(`  checked ${checked} cells of the left-diagonal recurrence: ${fails} failures`);
  console.log("  So the diagonal family is an instance over the SAME constraint language,");
  console.log("  with a different hypergraph, and every diagonal at k >= 1 is provably");
  console.log("  eventually periodic (leftDiagonal_periodicFrom_pow).  The clone is blind");
  console.log("  to the difference because the clone is a property of the relation alone.");
}
