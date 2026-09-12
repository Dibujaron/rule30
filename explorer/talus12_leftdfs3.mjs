// Talus, 2026-09-12.  The left-only bound, third pass -- with the black cell at
// -a actually imposed.
//
// talus12_leftdfs2.mjs imposed only "white at x < -a" and found exactly one word
// of period <= 4 the cone could not kill: the all-white column.  That is the
// zero configuration sneaking into the class, the same defect this morning's
// classification had.  C2(a) also demands cell(-a, 0) = BLACK
// (evolve_left_edge), and the solver can test that too, at the same moment it
// tests the cone at column -a.  Every number here has it imposed.
//
//    LB(w,a) := the largest number of column-1 bits that can be chosen with the
//               centre column pinned to the periodic word w for ever, subject to
//               cell(-a,0) = 1 and cell(-k,0) = 0 for every testable k > a.
// f_w(a) <= LB(w,a) + 1.

function leftBound(word, a, TMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= TMAX + 3; k++) C.push(new Uint8Array(TMAX + 3));
  for (let t = 0; t <= TMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const testK = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {
    if (j > TMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    if (j > best) best = j;
    for (const b of [0, 1]) {
      let ok = true;
      C[1][j] = C[0][j + 1] ^ (C[0][j] | b);
      if (j === 0 && !testK(1, C[1][0])) ok = false;
      for (let k = 2; ok && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !testK(k, C[k][0])) ok = false;
      }
      if (ok) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status, nodes };
}

// ---- the exhaustive outward DFS (the real f) -------------------------------
function dfsF(a, word, cap, budget) {
  const p = word.length;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
    return rdk[k - 1];
  }
  function rec(k) {
    if (k > cap) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
    const base = ldk[k - 1];
    for (const rc of [0, 1]) {
      const centre0 = base ^ (col[k - 1] | fillRD(k, rc));
      const rdk = RD[k];
      const cv = word[k % p];
      const lc = centre0 ^ cv;
      if (req[k] >= 0 && lc !== req[k]) continue;
      col[k] = cv;
      const flip = (lc === 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      ldk[k] = cv; rdk[k] = cv;
      if (k + 1 > best) best = k + 1;
      rec(k + 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
    }
  }
  try { col[0] = word[0]; LD[0][0] = word[0]; RD[0][0] = word[0]; best = 1; rec(1); }
  catch (e) { if (e !== AB) throw e; }
  return { best, status };
}

const show = (w) => w.join("");
function primitiveWords(P) {
  const out = [];
  for (let p = 1; p <= P; p++) for (let v = 0; v < (1 << p); v++) {
    const w = []; for (let i = 0; i < p; i++) w.push((v >> (p - 1 - i)) & 1);
    let prim = true;
    for (let d = 1; d < p; d++) if (p % d === 0) { let s = true; for (let i = 0; i < p; i++) if (w[i] !== w[i % d]) s = false; if (s) prim = false; }
    if (prim) out.push(w);
  }
  return out;
}

// ================= [D] the domination control, with the black cell =========
console.log(`[D] f_w(a) <= LB(w,a) + 1, every primitive word of period <= 5, a <= 13.`);
console.log(`    A violation would mean the left-only solver is over-pruning.`);
let tot = 0, viol = 0, tight = 0, slack = 0, worst = -1, worstAt = "";
for (const w of primitiveWords(5)) for (let a = 1; a <= 13; a++) {
  const lb = leftBound(w, a, 240, 6e7);
  const f = dfsF(a, w, 90, 2e8);
  if (lb.status !== "exact" || f.status !== "exact") continue;
  tot++;
  if (f.best > lb.best + 1) { viol++; if (viol <= 10) console.log(`    VIOLATION w=${show(w)} a=${a}: f=${f.best} > LB+1=${lb.best + 1}`); }
  else { const s = lb.best + 1 - f.best; slack += s; if (s === 0) tight++; if (s > worst) { worst = s; worstAt = `w=${show(w)} a=${a}`; } }
}
console.log(`    ${tot} cells where both are exhaustive, ${viol} violations,`);
console.log(`    mean slack ${(slack / Math.max(1, tot - viol)).toFixed(2)}, tight at ${tight} cells, worst ${worst} at ${worstAt}`);

// ================= [Z] does the cone alone kill EVERY word? ================
console.log(`\n[Z] the left-only bound with cell(-a,0) = black imposed.  "CAP" would mean`);
console.log(`    the cone alone bounds nothing for that word; "bud" = node budget.`);
let capped = 0, finite = 0;
for (const w of primitiveWords(5)) {
  let line = `    w=${show(w).padEnd(6)} |`;
  for (const a of [1, 2, 3, 5, 8, 12, 16, 20]) {
    const r = leftBound(w, a, 240, 6e7);
    if (r.status === "exact") finite++; else if (r.status === "cap") capped++;
    line += ` a${a}:${r.status === "exact" ? r.best : r.status === "cap" ? "CAP" : "bud" + r.best}`.padEnd(10);
  }
  console.log(line);
}
console.log(`    ${finite} cells with a finite left-only bound, ${capped} capped`);

// ================= [S] the all-white word, alone and in detail =============
console.log(`\n[S] the all-white column, which the cone could not see until the black`);
console.log(`    cell at -a was imposed.  LB with, and without, that one constraint.`);
function leftBoundNoBlack(word, a, TMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= TMAX + 3; k++) C.push(new Uint8Array(TMAX + 3));
  for (let t = 0; t <= TMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  function rec(j) {
    if (j > TMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    if (j > best) best = j;
    for (const b of [0, 1]) {
      let ok = true;
      C[1][j] = C[0][j + 1] ^ (C[0][j] | b);
      if (j === 0 && 1 > a && C[1][0] === 1) ok = false;
      for (let k = 2; ok && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && k > a && C[k][0] === 1) ok = false;
      }
      if (ok) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status, nodes };
}
for (const a of [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]) {
  const w = leftBound([0], a, 240, 6e7), wo = leftBoundNoBlack([0], a, 240, 6e7);
  const f = dfsF(a, [0], 90, 2e8);
  console.log(`    a=${String(a).padStart(2)}  LB with black = ${String(w.status === "exact" ? w.best : w.status).padStart(5)}` +
    `   LB without = ${String(wo.status === "exact" ? wo.best : wo.status).padStart(5)}   f = ${f.best}${f.status === "exact" ? "" : "+"}`);
}
