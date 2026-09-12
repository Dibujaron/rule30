// Talus, 2026-09-12.  Why the p-periodic column dies: the two halves, separated.
//
// Pin the centre column to an exactly p-periodic word.  By leftSolve_eq_column
// the whole left half is then a function of columns 0 and 1, and by
// evolveHalfRight_eq_column the whole right half is a function of column 0 and
// row 0 at x >= 1.  So column 1 is the ONE object both halves see, and the
// question splits:
//
//   L(a, w, T) = the column-1 prefixes of length T for which the leftward solve
//                keeps every column -k, k > a, white at time 0 -- the cone.
//   R(w, T)    = the column-1 prefixes of length T realised by SOME right half.
//
// A configuration in C2(a) with a p-periodic column to depth T gives a prefix in
// L and R both.  So L n R = {} certifies f(p,a) < T.
//
// THE NULL.  If L and R were independent random subsets of the 2^T prefixes, the
// expected size of the intersection is |L|*|R|/2^T.  A death at the level the
// null predicts is what a coin does and is worth nothing; a death far earlier is
// a mechanism.  This is the test four routes on this board have died to.
//
// Both halves are bitmask loops: a column is a mask over t, a row is a mask over
// x, and each solve is one word operation per step.

const RULES = {
  30: { f: (l, c, r) => l ^ (c | r), name: "l XOR (c OR r)" },
  90: { f: (l, c, r) => l ^ r, name: "l XOR r" },
  150: { f: (l, c, r) => l ^ c ^ r, name: "l XOR c XOR r" },
};

// ---- right half: which column-1 prefixes does some right half realise? ------
// bit b of the row mask is cell(t, b+1).  cell(t+1, b+1) = F(cell(t,b),
// cell(t,b+1), cell(t,b+2)), with cell(t,0) = col0[t].
function rightSet(col0, T, ruleNo) {
  const F = RULES[ruleNo].f;
  const W = T;                       // cells x = 1..T; anything further is invisible
  const MASK = W === 32 ? 0xffffffff : ((1 << W) - 1) >>> 0;
  const out = new Set();
  const N = 1 << W;
  for (let r = 0; r < N; r++) {
    let m = r >>> 0, col1 = 0;
    for (let t = 0; t < T; t++) {
      col1 |= (m & 1) << t;
      const left = (((m << 1) >>> 0) | (col0[t] ? 1 : 0)) >>> 0;
      const cen = m, right = m >>> 1;
      // apply F bitwise
      let nx;
      if (ruleNo === 30) nx = (left ^ (cen | right)) >>> 0;
      else if (ruleNo === 90) nx = (left ^ right) >>> 0;
      else nx = (left ^ cen ^ right) >>> 0;
      m = (nx & MASK) >>> 0;
    }
    out.add(col1 >>> 0);
  }
  return out;
}

// ---- left half: which column-1 prefixes keep the cone white? ----------------
// col(-(k+1))[t] = F( col(-k)[t+1], col(-k)[t], col(-k+1)[t] ) read backwards:
// the rule at position -k says col(-k+1)... no: solve sideways.  The board's
// sideways_inverse is  c(i-1) = rule30 c i XOR (c i OR c (i+1)), i.e.
//    col(-(k+1))[t] = col(-k)[t+1] XOR ( col(-k)[t] OR col(-(k-1))[t] )
// for rule 30, and the same shape with the rule's own combiner for 90 / 150,
// which are their own sideways inverses in the left argument.
function leftOK(col0mask, col1mask, a, T, ruleNo) {
  let prev = col0mask, cur = col1mask;   // prev = col(-(k-1)), cur = col(-k) ... start k = 0
  // k = 0: col(0) = col0, col(1) = col1.  We step LEFT: col(-1) from col(0), col(1).
  let A = col0mask, B = col1mask, len = T;
  for (let k = 1; k <= T - 2; k++) {
    // C = col(-k) from A = col(-(k-1)) and B = col(-(k-2)) ... careful:
    // sideways: c(i-1)[t] = c(i)[t+1] XOR ( c(i)[t] OR c(i+1)[t] ), with i = -(k-1)
    // so col(-k) = shift(col(-(k-1))) XOR ( col(-(k-1)) OR col(-(k-2)) )
    let C;
    if (ruleNo === 30) C = ((A >>> 1) ^ (A | B)) >>> 0;
    else if (ruleNo === 90) C = ((A >>> 1) ^ B) >>> 0;
    else C = ((A >>> 1) ^ A ^ B) >>> 0;
    len -= 1;
    if (len <= 0) break;
    const M = len >= 32 ? 0xffffffff : ((1 << len) - 1) >>> 0;
    C = (C & M) >>> 0;
    if (k > a && (C & 1)) return false;   // cell(-k, 0) must be white
    B = A; A = C;
  }
  return true;
}

function leftSet(col0, T, a, ruleNo) {
  let col0mask = 0;
  for (let t = 0; t < T; t++) col0mask |= (col0[t] ? 1 : 0) << t;
  const out = new Set();
  const N = 1 << T;
  for (let v = 0; v < N; v++) if (leftOK(col0mask >>> 0, v >>> 0, a, T, ruleNo)) out.add(v >>> 0);
  return out;
}

const periodic = (w, T) => { const c = []; for (let t = 0; t < T; t++) c.push(w[t % w.length]); return c; };
const show = (w) => w.join("");

// ---- cross-check against the exhaustive DFS -------------------------------
// (the DFS from talus12_ladder, inlined, for the same (p,a) with the column
//  additionally pinned to one word rather than to any p-periodic word)
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

console.log(`[H] the two halves of a pinned periodic column, separated.`);
console.log(`    |L| = column-1 prefixes whose leftward solve keeps the cone white`);
console.log(`    |R| = column-1 prefixes realised by some right half`);
console.log(`    null = |L|*|R|/2^T, the intersection two independent random sets of`);
console.log(`           those sizes would have.  obs = the true intersection.`);
console.log(`    f = the exhaustive longest block for that word, from the outward DFS.`);

for (const ruleNo of [30, 90, 150]) {
  console.log(`\n  rule ${ruleNo}  (${RULES[ruleNo].name})`);
  for (const word of [[0, 1, 1], [1, 0, 0], [0, 1], [1, 1, 1, 0]]) {
    for (const a of [3, 6]) {
      let line = `    w=${show(word)} a=${a} |`;
      const f = ruleNo === 30 ? dfsF(a, word, 60, 2e8) : null;
      for (const T of [10, 14, 18, 20]) {
        const col0 = periodic(word, T);
        const R = rightSet(col0, T, ruleNo);
        const L = leftSet(col0, T, a, ruleNo);
        let obs = 0;
        for (const v of L) if (R.has(v)) obs++;
        const nul = (L.size * R.size) / Math.pow(2, T);
        line += `  T=${T}: |L|=${L.size} |R|=${R.size} null=${nul.toFixed(2)} obs=${obs}`;
      }
      if (f) line += `   [DFS f=${f.best}${f.status === "exact" ? "" : "+"}]`;
      console.log(line);
    }
  }
}
