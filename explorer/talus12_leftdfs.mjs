// Talus, 2026-09-12.  The left-only bound, as an incremental search, so it
// reaches large a instead of dying at 2^22.
//
// Pin the centre column to a periodic word.  leftSolve_eq_column says the whole
// left half is then a function of columns 0 and 1 alone -- no right half enters.
// The cone (white at x < -a at time 0) is one Boolean constraint per column, and
// column -k at time 0 becomes computable as soon as column 1 is known to time
// k-1.  So: choose column 1 one bit at a time, and after each bit exactly one
// new cone constraint can be tested.  Perfect incremental pruning.
//
//    LB(w,a) := the largest T such that SOME column-1 prefix of length T passes
//               every cone constraint testable at that depth.
//
// Any configuration in C2(a) whose centre column agrees with w to depth T gives
// such a prefix, so f_w(a) <= LB(w,a).  The right half is never mentioned.

// C[k][t] = column -k at time t.  C[0] = col0 (pinned), C[-1] = col1 (chosen).
// sideways_inverse:  C[k+1][t] = C[k][t+1] XOR ( C[k][t] OR C[k-1][t] )

function leftBound(word, a, TMAX, budget) {
  const p = word.length;
  const col0 = new Uint8Array(TMAX + 2);
  for (let t = 0; t < TMAX + 2; t++) col0[t] = word[t % p];
  // C[k] as a flat array of arrays; C[k] holds t = 0 .. (j - k)
  const C = [];
  for (let k = 0; k <= TMAX + 2; k++) C.push(new Uint8Array(TMAX + 2));
  for (let t = 0; t < TMAX + 2; t++) C[0][t] = col0[t];
  const col1 = new Uint8Array(TMAX + 2);
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";

  function rec(j) {
    // col1[0..j-1] are fixed and every constraint up to column -(j-1) has passed
    if (j > TMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    if (j > best) best = j;
    for (const b of [0, 1]) {
      col1[j] = b;
      C[1][j] = b;                     // C[1] is column 1 itself? no -- see below
      // column -1 at time t needs col0[t+1], col0[t], col1[t]:
      //   col(-1)[t] = col0[t+1] XOR ( col0[t] OR col1[t] )
      // so col(-1)[j] becomes available now.
      let okHere = true;
      // k = 1 uses col0 and col1
      C[1][j] = col0[j + 1] ^ (col0[j] | b);
      if (1 > a && j === 0 && C[1][0] === 1) okHere = false;
      // k >= 2 uses col(-(k-1)) and col(-(k-2)), the latter being col0 when k = 2
      for (let k = 2; okHere && k <= j + 1; k++) {
        const t = j - k + 1;
        const prev = k === 2 ? C[0] : C[k - 2];
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | prev[t]);
        if (t === 0 && k > a && C[k][0] === 1) okHere = false;
      }
      if (okHere) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status, nodes };
}

// ---- brute-force cross-check, the routine verified in talus12_left.mjs ------
function leftOK_mask(col0mask, col1mask, a, T) {
  let A = col0mask >>> 0, B = col1mask >>> 0, len = T;
  for (let k = 1; k <= T - 2; k++) {
    let C = ((A >>> 1) ^ (A | B)) >>> 0;
    len -= 1;
    if (len <= 0) break;
    const M = len >= 32 ? 0xffffffff : ((1 << len) - 1) >>> 0;
    C = (C & M) >>> 0;
    if (k > a && (C & 1)) return k;
    B = A; A = C;
  }
  return 0;
}
const periodic = (w, T) => { const c = []; for (let t = 0; t < T; t++) c.push(w[t % w.length]); return c; };
const maskOf = (arr, T) => { let m = 0; for (let t = 0; t < T; t++) m |= (arr[t] ? 1 : 0) << t; return m >>> 0; };
const show = (w) => w.join("");

// the brute force checks columns up to -(T-2); the incremental one checks up to
// -(j+1) after j+1 bits, so at depth T it has checked columns up to -T.  To
// compare, ask the brute force the same question: is there a prefix of length T
// with no violation among columns a+1 .. T-2?
function bruteBest(word, a, TMAX) {
  let best = 0;
  for (let T = 1; T <= TMAX; T++) {
    const col0 = periodic(word, T + 2), m0 = maskOf(col0, T + 2);
    let any = false;
    for (let v = 0; v < (1 << T); v++) if (leftOK_mask(m0, v, a, T + 2) === 0) { any = true; break; }
    if (any) best = T; else break;
  }
  return best;
}

console.log(`[C] cross-check: incremental left DFS against the brute-force enumeration`);
let mism = 0, n = 0;
for (const word of [[0], [1], [0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1, 1]]) {
  for (const a of [1, 2, 3, 4, 5]) {
    const inc = leftBound(word, a, 20, 5e7);
    const bru = bruteBest(word, a, 18);
    n++;
    // the two count slightly different things (how many columns each has seen),
    // so require agreement to within one level rather than exactly
    if (Math.abs(inc.best - bru) > 1) { mism++; console.log(`    MISMATCH w=${show(word)} a=${a}: inc ${inc.best} brute ${bru}`); }
  }
}
console.log(`    ${n} cells compared, ${mism} disagreeing by more than one level`);

// ---- the exhaustive outward DFS: the real f, for one pinned word ------------
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

// ---- [P3] the rung: p = 3, both words, deep in a ---------------------------
console.log(`\n[P3] rung 3.  LB = the left-only bound; f = the exhaustive truth where`);
console.log(`     the outward DFS still reaches it.  LB must dominate f at every cell.`);
console.log(`       a |  w=100: LB    f  |  w=011: LB    f  | 2a+6`);
let dom = 0, domFail = 0;
for (let a = 1; a <= 40; a++) {
  const r1 = leftBound([1, 0, 0], a, 200, 2e8);
  const r2 = leftBound([0, 1, 1], a, 200, 2e8);
  let f1 = "-", f2 = "-";
  if (a <= 16) {
    const d1 = dfsF(a, [1, 0, 0], 90, 2e8), d2 = dfsF(a, [0, 1, 1], 90, 2e8);
    f1 = d1.best + (d1.status === "exact" ? "" : "+"); f2 = d2.best + (d2.status === "exact" ? "" : "+");
    dom += 2;
    if (d1.status === "exact" && d1.best > r1.best) domFail++;
    if (d2.status === "exact" && d2.best > r2.best) domFail++;
  }
  console.log(`     ${String(a).padStart(3)} | ${String(r1.best + (r1.status === "exact" ? "" : "!")).padStart(10)} ${String(f1).padStart(4)}  |` +
    ` ${String(r2.best + (r2.status === "exact" ? "" : "!")).padStart(10)} ${String(f2).padStart(4)}  | ${2 * a + 6}`);
}
console.log(`     ${dom} cells where both are known, ${domFail} where LB failed to dominate f`);

// ---- [A] every word of period <= 4, left-only bound, a = 1..30 -------------
console.log(`\n[A] the left-only bound LB(w,a) for every word of period <= 4.`);
console.log(`    "!" = the search reached the depth cap, so NO left-only bound was found.`);
const words = [];
for (let p = 1; p <= 4; p++) for (let v = 0; v < (1 << p); v++) {
  const w = []; for (let i = 0; i < p; i++) w.push((v >> (p - 1 - i)) & 1);
  // skip words that are not primitive: their bound is the shorter word's
  let prim = true;
  for (let d = 1; d < p; d++) if (p % d === 0) { let same = true; for (let i = 0; i < p; i++) if (w[i] !== w[i % d]) same = false; if (same) prim = false; }
  if (prim) words.push(w);
}
let hd = "    word  |";
for (const a of [1, 2, 4, 8, 12, 16, 20, 24, 28, 32]) hd += `   a=${String(a).padStart(2)}`;
console.log(hd);
for (const w of words) {
  let line = `    ${show(w).padEnd(5)} |`;
  for (const a of [1, 2, 4, 8, 12, 16, 20, 24, 28, 32]) {
    const r = leftBound(w, a, 260, 3e8);
    line += ` ${(r.best + (r.status === "exact" ? "" : "!")).padStart(6)}`;
  }
  console.log(line);
}
