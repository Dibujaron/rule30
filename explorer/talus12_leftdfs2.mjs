// Talus, 2026-09-12.  The left-only bound, second pass: controls first, honest
// caps, and the one word the cone cannot see.
//
//    LB(w,a) := the largest number of column-1 bits that can be chosen while
//               every cone constraint testable so far still holds, with the
//               centre column pinned to the periodic word w for ever.
//
// leftSolve_eq_column makes the whole left half a function of columns 0 and 1,
// so this computation never mentions the right half.  Relation to the outward
// DFS's f (the longest block, the real quantity): fixing j bits of column 1
// makes columns -1 .. -j testable, so  f_w(a) <= LB(w,a) + 1.  [D] tests that.

// ---- the incremental solver, over an ARBITRARY col0 (needed by the control) --
// C[k][t] = column -k at time t;  C[k+1][t] = C[k][t+1] XOR ( C[k][t] OR C[k-1][t] )
function makeSolver(TMAX) {
  const C = [];
  for (let k = 0; k <= TMAX + 3; k++) C.push(new Uint8Array(TMAX + 3));
  return C;
}

function leftBound(word, a, TMAX, budget) {
  const p = word.length;
  const C = makeSolver(TMAX);
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

// ================= [V] the solver against the real automaton ===============
function evolveRow(row) {
  const n = row.length, out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) out[i] = (i > 0 ? row[i - 1] : 0) ^ (row[i] | (i < n - 1 ? row[i + 1] : 0));
  return out;
}
let sv = 2463534242;
const rnd = () => { sv ^= sv << 13; sv >>>= 0; sv ^= sv >>> 17; sv ^= sv << 5; sv >>>= 0; return sv; };

console.log(`[V] control: the sideways solver's columns against real rule 30 pictures.`);
let cells = 0, wrong = 0;
for (let trial = 0; trial < 300; trial++) {
  const T = 26, LO = T + 20, HI = T + 8;
  const row = new Array(LO + HI + 1).fill(0), org = LO;
  for (let x = -LO + 2; x <= HI; x++) row[org + x] = rnd() & 1;
  let cur = row;
  const pic = [];
  for (let t = 0; t < T; t++) { pic.push(cur); cur = evolveRow(cur); }
  const C = makeSolver(T);
  for (let t = 0; t < T; t++) C[0][t] = pic[t][org];
  // column 1 comes from the picture; every deeper column must be reproduced
  for (let j = 0; j < T - 1; j++) {
    const b = pic[j][org + 1];
    C[1][j] = C[0][j + 1] ^ (C[0][j] | b);
    for (let k = 2; k <= j + 1; k++) {
      const t = j - k + 1;
      C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
      cells++;
      if (C[k][t] !== pic[t][org - k]) wrong++;
    }
  }
}
console.log(`    ${cells} solved cells compared against the picture, ${wrong} wrong`);

// ================= [C] cross-check against brute-force enumeration =========
function leftOK_mask(col0mask, col1mask, a, T) {
  let A = col0mask >>> 0, B = col1mask >>> 0, len = T;
  for (let k = 1; k <= T - 2; k++) {
    let C = ((A >>> 1) ^ (A | B)) >>> 0;
    len -= 1;
    if (len <= 0) break;
    const M = ((1 << len) - 1) >>> 0;
    C = (C & M) >>> 0;
    if (k > a && (C & 1)) return k;
    B = A; A = C;
  }
  return 0;
}
const periodic = (w, T) => { const c = []; for (let t = 0; t < T; t++) c.push(w[t % w.length]); return c; };
const maskOf = (arr, T) => { let m = 0; for (let t = 0; t < T; t++) m |= (arr[t] ? 1 : 0) << t; return m >>> 0; };
const show = (w) => w.join("");
function bruteBest(word, a, TMAX) {
  let best = 0;
  for (let T = 1; T <= TMAX; T++) {
    const col0 = periodic(word, T + 2), m0 = maskOf(col0, T + 2);
    let any = false;
    for (let v = 0; v < (1 << T); v++) if (leftOK_mask(m0, v, a, T + 2) === 0) { any = true; break; }
    if (any) best = T; else return { best, capped: false };
  }
  return { best, capped: true };
}
console.log(`\n[C] cross-check: incremental left DFS vs brute force over all 2^T prefixes`);
let n = 0, mis = 0, skipped = 0;
for (const word of [[0], [1], [0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1, 1], [0, 0, 1, 1]]) {
  for (const a of [1, 2, 3, 4, 5]) {
    const inc = leftBound(word, a, 19, 5e7);
    const bru = bruteBest(word, a, 18);
    if (bru.capped || inc.status !== "exact") { skipped++; continue; }
    n++;
    if (inc.best !== bru.best) { mis++; console.log(`    MISMATCH w=${show(word)} a=${a}: inc ${inc.best} brute ${bru.best}`); }
  }
}
console.log(`    ${n} cells compared exactly, ${mis} disagreements (${skipped} skipped, one side capped)`);

// ================= the exhaustive outward DFS (the real f) =================
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

// ================= [D] does the left half alone bound f? ==================
console.log(`\n[D] f_w(a) <= LB(w,a) + 1, over every word of period <= 4 and a <= 14`);
const wordsP4 = [];
for (let p = 1; p <= 4; p++) for (let v = 0; v < (1 << p); v++) {
  const w = []; for (let i = 0; i < p; i++) w.push((v >> (p - 1 - i)) & 1);
  let prim = true;
  for (let d = 1; d < p; d++) if (p % d === 0) { let s = true; for (let i = 0; i < p; i++) if (w[i] !== w[i % d]) s = false; if (s) prim = false; }
  if (prim) wordsP4.push(w);
}
let tot = 0, viol = 0, tightc = 0, slackSum = 0, worst = -1, worstAt = "";
for (const w of wordsP4) for (let a = 1; a <= 14; a++) {
  const lb = leftBound(w, a, 220, 8e7);
  const f = dfsF(a, w, 90, 2e8);
  if (lb.status !== "exact" || f.status !== "exact") continue;
  tot++;
  if (f.best > lb.best + 1) { viol++; if (viol <= 10) console.log(`    VIOLATION w=${show(w)} a=${a}: f=${f.best} > LB+1=${lb.best + 1}`); }
  else { const s = lb.best + 1 - f.best; slackSum += s; if (s === 0) tightc++; if (s > worst) { worst = s; worstAt = `w=${show(w)} a=${a}`; } }
}
console.log(`    ${tot} cells where both are exhaustive, ${viol} violations`);
console.log(`    mean slack LB+1-f = ${(slackSum / (tot - viol)).toFixed(2)}, tight at ${tightc} cells, worst ${worst} at ${worstAt}`);

// ================= [Z] the word the cone cannot see ========================
console.log(`\n[Z] which words does the cone alone kill?  "cap" = the left-only search`);
console.log(`    ran to depth 220 without dying, so the cone alone bounds nothing there.`);
for (const w of wordsP4) {
  let line = `    w=${show(w).padEnd(5)} |`;
  for (const a of [1, 2, 3, 5, 8, 12, 16, 20]) {
    const r = leftBound(w, a, 220, 8e7);
    line += ` a${a}:${r.status === "exact" ? r.best : r.status === "cap" ? "CAP" : "bud" + r.best}`.padEnd(10);
  }
  console.log(line);
}
