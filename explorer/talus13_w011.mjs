// Talus, 2026-09-12.  The left-only reduction for one word: w = 011 at general a.
//
// THE SYSTEM.  Pin the centre column to the periodic word w.  Column +1 is free.
// The leftward solve (sideways_inverse / leftSolve_eq_column) is
//     C_k[t] = C_{k-1}[t+1] XOR (C_{k-1}[t] OR C_{k-2}[t]),   C_k = column (-k),
// with C_0 = the pinned word and C_1[t] = c(t+1) XOR (c(t) OR r(t)), r = column 1.
// The class C2(a) demands  cell(-a, 0) = 1  and  cell(-k, 0) = 0 for every k > a,
// i.e. C_a[0] = 1 and C_k[0] = 0 for k > a.  D(a) := the largest K such that the
// constraints at columns a .. K are simultaneously satisfiable.  D(a) < infinity
// for every a is exactly the left-only reduction of the rung at that word.
//
// Note the free-bit rate: r(t) is invisible when c(t) = 1, so the only meaningful
// free bits sit at the white times of w -- one per period for 011.

// ---------------------------------------------------------------------------
// [V] CONTROL FIRST.  The solver against the real automaton.
// ---------------------------------------------------------------------------
function rule30Row(row) { // row: Uint8Array over a window, returns next row (same window, edges lost)
  const n = row.length, out = new Uint8Array(n);
  for (let i = 1; i < n - 1; i++) out[i] = row[i - 1] ^ (row[i] | row[i + 1]);
  return out;
}

function validate(trials, W, T, seedBase) {
  // Build a random config on [-W, W], evolve T steps in a window wide enough that
  // the cells we read are never touched by the truncation, read columns 0 and 1,
  // run the leftward solve, and compare every solved column against the truth.
  let cells = 0, wrong = 0;
  let s = seedBase >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  for (let trial = 0; trial < trials; trial++) {
    const PAD = T + 6, N = 2 * W + 1 + 2 * PAD, ORIG = PAD + W;
    let row = new Uint8Array(N);
    for (let i = 0; i < 2 * W + 1; i++) row[PAD + i] = rnd();
    const pic = [row];
    for (let t = 1; t <= T + 2; t++) { row = rule30Row(row); pic.push(row); }
    const col = (x, t) => pic[t][ORIG + x];
    const c0 = [], c1 = [];
    for (let t = 0; t <= T + 1; t++) { c0.push(col(0, t)); c1.push(col(1, t)); }
    // leftSolve
    const C = [c0, null];
    C[1] = [];
    for (let t = 0; t + 1 <= T + 1; t++) C[1].push(c0[t + 1] ^ (c0[t] | c1[t]));
    for (let k = 2; k <= T - 2; k++) {
      const arr = [];
      for (let t = 0; t + 1 < C[k - 1].length; t++) arr.push(C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]));
      C.push(arr);
    }
    for (let k = 1; k <= T - 2; k++) for (let t = 0; t < C[k].length; t++) {
      if (t + k > T) continue;         // stay inside the evolved window
      cells++;
      if (C[k][t] !== col(-k, t)) wrong++;
    }
  }
  return { cells, wrong };
}

const v = validate(300, 40, 40, 0x9e3779b9);
console.log(`[V] leftward solve vs forward evolution: ${v.cells} cells, ${v.wrong} wrong`);

// A mutant: use OR where the rule has XOR, to show the comparison can fail.
function validateMutant(trials, W, T, seedBase) {
  let cells = 0, wrong = 0;
  let s = seedBase >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s & 1; };
  for (let trial = 0; trial < trials; trial++) {
    const PAD = T + 6, N = 2 * W + 1 + 2 * PAD, ORIG = PAD + W;
    let row = new Uint8Array(N);
    for (let i = 0; i < 2 * W + 1; i++) row[PAD + i] = rnd();
    const pic = [row];
    for (let t = 1; t <= T + 2; t++) { row = rule30Row(row); pic.push(row); }
    const col = (x, t) => pic[t][ORIG + x];
    const c0 = [], c1 = [];
    for (let t = 0; t <= T + 1; t++) { c0.push(col(0, t)); c1.push(col(1, t)); }
    const C = [c0, null];
    C[1] = [];
    for (let t = 0; t + 1 <= T + 1; t++) C[1].push(c0[t + 1] ^ (c0[t] & c1[t]));   // MUTANT: & not |
    for (let k = 2; k <= T - 2; k++) {
      const arr = [];
      for (let t = 0; t + 1 < C[k - 1].length; t++) arr.push(C[k - 1][t + 1] ^ (C[k - 1][t] & C[k - 2][t]));
      C.push(arr);
    }
    for (let k = 1; k <= T - 2; k++) for (let t = 0; t < C[k].length; t++) {
      if (t + k > T) continue;
      cells++;
      if (C[k][t] !== col(-k, t)) wrong++;
    }
  }
  return { cells, wrong };
}
const vm = validateMutant(20, 40, 40, 0x9e3779b9);
console.log(`    mutant (AND for OR): ${vm.cells} cells, ${vm.wrong} wrong  <- the check can fail`);

// ---------------------------------------------------------------------------
// [A] D(a) for the six primitive period-3 words, exactly.
// ---------------------------------------------------------------------------
// DFS on j = the time index of the column-1 bit; branch only where c(j) = 0,
// since r(j) is invisible when c(j) = 1.  At step j the only newly testable cone
// constraint is at column k = j+1 (the cell C_{j+1}[0]).
function coneDepth(word, a, JMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    if (j + 1 > best) best = j + 1;      // columns 1 .. j+1 all satisfied
    const branch = C[0][j % p] === 0 ? [0, 1] : [0];
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ (C[0][j % p] | b);
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status, nodes };
}

const words3 = [[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]];
const show = (w) => w.join("");
console.log(`\n[A] D(a) = the deepest column the cone conditions reach, period-3 words.`);
console.log(`    "CAP"/"bud" = the search did not terminate, so no finite bound was found.`);
for (const w of words3) {
  let line = `    w=${show(w)}  `;
  for (let a = 1; a <= 24; a++) {
    const r = coneDepth(w, a, 400, 4e8);
    line += (r.status === "exact" ? String(r.best) : r.status.slice(0, 3)).padStart(5);
  }
  console.log(line);
}
console.log(`    (columns a = 1 .. 24 left to right)`);

// ---------------------------------------------------------------------------
// [B] the surviving-set census for w = 011: how many partial assignments live
//     at each depth, and how the death happens.
// ---------------------------------------------------------------------------
function census(word, a, JMAX) {
  const p = word.length;
  // level-by-level BFS over the antidiagonal state.  State = the column values
  // C_k[t] for k+t = j+1 that later steps still need: C_{k}[j-k+1] for all k,
  // plus C_{k}[j-k] one step back.  Simplest: keep whole triangles (small).
  let live = [{ C: [] }];
  // represent a survivor by the chosen bits; recompute (JMAX small)
  const res = [];
  let bits = [[]];
  for (let j = 0; j <= JMAX; j++) {
    const next = [];
    for (const bs of bits) {
      const branch = word[j % p] === 0 ? [0, 1] : [0];
      for (const b of branch) {
        const cand = bs.concat([b]);
        // recompute the triangle for cand and test all constraints up to k=j+1
        const C = [];
        for (let k = 0; k <= j + 2; k++) C.push(new Uint8Array(j + 3));
        for (let t = 0; t <= j + 1; t++) C[0][t] = word[t % p];
        for (let t = 0; t <= j; t++) C[1][t] = C[0][(t + 1) % p] ^ (C[0][t % p] | cand[t]);
        let good = true;
        if (!(1 > a ? C[1][0] === 0 : 1 === a ? C[1][0] === 1 : true)) good = false;
        for (let k = 2; good && k <= j + 1; k++)
          for (let t = 0; good && t <= j + 1 - k; t++) {
            C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
            if (t === 0 && !(k > a ? C[k][0] === 0 : k === a ? C[k][0] === 1 : true)) good = false;
          }
        if (good) next.push(cand);
      }
    }
    res.push({ j, k: j + 1, live: next.length });
    bits = next;
    if (next.length === 0) break;
    if (bits.length > 200000) { res.push({ j: -1, k: -1, live: -1 }); break; }
  }
  return res;
}
console.log(`\n[B] the surviving-set census for w = 011 (population after the constraint`);
console.log(`    at column k has been imposed).  "0" is the death.`);
for (const a of [3, 6, 9, 12]) {
  const r = census([0, 1, 1], a, 40);
  console.log(`    a=${String(a).padStart(2)}: ` + r.map((x) => `${x.k}:${x.live}`).join(" "));
}
