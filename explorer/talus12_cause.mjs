// Talus, 2026-09-12.  Three things the fast solver could not tell me.
//
// [G] A GENERAL-RULE search.  The fast outward DFS solves cell(-k) from the
//     wanted column value, which is only legitimate for a LEFT-PERMUTIVE rule.
//     Rule 86 -- rule 30's mirror, the project's standard orientation guard --
//     is right-permutive and not left-permutive, so the fast solver's rule-86
//     row was meaningless.  This one loops over cell(-k) and cell(+k) and
//     computes the column, which is correct for any rule, and reproduces rule
//     30's numbers as its own control.
//
// [C] WHY THE DEATH IS SIMULTANEOUS.  At a level where the free right-half cell
//     cannot move the column, the survivor's fate is decided by one bit
//     c = LD_k[k-1] XOR (col[k-1] OR RD_k[k-1]).  If every survivor holds the
//     same c, they all live or all die together.  Count the distinct c.
//
// [A] WHEN CAN THE RIGHT HALF MOVE THE COLUMN AT ALL?  Flipping cell(0,+k)
//     flips RD_k[t] only while RD_{k-1}[t-1] is white, so the flip reaches the
//     centre at time k iff the whole anti-diagonal RD_{k-1}[0..k-2] is white.
//     Predicted, then checked against the observed freedom.

const RULES = {
  30: (l, c, r) => l ^ (c | r),
  86: (l, c, r) => r ^ (c | l),
  90: (l, c, r) => l ^ r,
  150: (l, c, r) => l ^ c ^ r,
  110: (l, c, r) => (c ^ r) | (c & (1 ^ l)) ? 1 : 0,
};
// rule 110 written properly: new = (c OR r) AND NOT (l AND c AND r)
RULES[110] = (l, c, r) => ((c | r) & (1 ^ (l & c & r)));

const AB = "ab";

// ---------------- [G] the general (slow but rule-agnostic) search ----------
function searchGeneral(a, word, ruleNo, cap, budget) {
  const F = RULES[ruleNo];
  const p = word.length;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
  function rec(k) {
    if (k > cap) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    for (const lc of [0, 1]) {
      if (req[k] >= 0 && lc !== req[k]) continue;
      ldk[0] = lc;
      for (let t = 1; t <= k - 1; t++) ldk[t] = F(ldk[t - 1], ld1[t - 1], ld2[t - 1]);
      for (const rc of [0, 1]) {
        rdk[0] = rc;
        for (let t = 1; t <= k - 1; t++) rdk[t] = F(rd2[t - 1], rd1[t - 1], rdk[t - 1]);
        const cv = F(ldk[k - 1], col[k - 1], rdk[k - 1]);
        if (cv !== word[k % p]) continue;
        col[k] = cv; ldk[k] = cv; rdk[k] = cv;
        if (k + 1 > best) best = k + 1;
        rec(k + 1);
      }
    }
  }
  try {
    for (const s of [0, 1]) {
      if (s !== word[0]) continue;
      col[0] = s; LD[0][0] = s; RD[0][0] = s;
      if (1 > best) best = 1;
      rec(1);
    }
  } catch (e) { if (e !== AB) throw e; }
  return { best, status };
}

const show = (w) => w.join("");
const CAP = 46, BUD = 2e8;
const CASES = [[[1], 3], [[0], 3], [[0, 1], 3], [[0, 1, 1], 3], [[1, 0, 0], 4], [[0, 0, 1, 1], 3], [[1, 1, 1, 0], 4]];

console.log(`[G] the general search (loops over cell(-k) AND cell(+k); no permutivity`);
console.log(`    assumed).  "+" = a configuration reached the cap ${CAP}, i.e. no bound.`);
for (const ruleNo of [30, 86, 90, 150, 110]) {
  let line = `    rule ${String(ruleNo).padStart(3)} |`;
  for (const [w, a] of CASES) {
    const r = searchGeneral(a, w, ruleNo, CAP, BUD);
    line += `  ${show(w)}@${a}=${r.best}${r.status === "exact" ? "" : r.status === "cap" ? "+" : "?"}`;
  }
  console.log(line);
}

// control: the general search must reproduce the fast one on rule 30
function dfsFast(a, word, cap, budget) {
  const p = word.length;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
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
let cmp = 0, dis = 0;
for (const w of [[0], [1], [0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 0], [0, 0, 1, 1], [1, 0, 1, 1]])
  for (let a = 1; a <= 6; a++) {
    const g = searchGeneral(a, w, 30, 40, 2e8), f = dfsFast(a, w, 40, 2e8);
    cmp++;
    if (g.best !== f.best || g.status !== f.status) { dis++; console.log(`    DISAGREE w=${show(w)} a=${a}: general ${g.best}${g.status} fast ${f.best}${f.status}`); }
  }
console.log(`    control: ${cmp} rule-30 cells, general vs fast, ${dis} disagreements`);

// ---------------- [C] the distinct forced value, per level ------------------
function census(a, word) {
  const p = word.length, cap = 60, budget = 3e8;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0;
  const lvl = [];
  for (let k = 0; k <= cap + 3; k++) lvl.push({ pop: 0, free: 0, c0: 0, c1: 0, whiteDiag: 0 });
  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
    return rdk[k - 1];
  }
  function rec(k) {
    if (k > cap || ++nodes > budget) throw AB;
    const S = lvl[k]; S.pop++;
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
    const base = ldk[k - 1];
    const v0 = base ^ (col[k - 1] | fillRD(k, 0));
    const v1 = base ^ (col[k - 1] | fillRD(k, 1));
    if (v0 !== v1) S.free++; else { if (v0 === 0) S.c0++; else S.c1++; }
    // [A] the predicted condition: the whole anti-diagonal RD_{k-1}[0..k-2] white
    let allWhite = true;
    for (let t = 0; t <= k - 2; t++) if (RD[k - 1][t]) { allWhite = false; break; }
    if (allWhite) S.whiteDiag++;
    if ((v0 !== v1) !== (allWhite && col[k - 1] === 0)) S.mismatch = (S.mismatch || 0) + 1;
    for (const rc of [0, 1]) {
      const centre0 = rc === 0 ? v0 : v1;
      fillRD(k, rc);
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
  return { best, lvl };
}

console.log(`\n[C] the forced value at each level, for one pinned word.  "split" counts`);
console.log(`    levels where survivors disagreed about the forced value; a death is`);
console.log(`    total exactly when they all agreed on the wrong one.`);
console.log(`      w / a | f  | levels | split levels | levels with any right-half freedom`);
for (const [w, a] of [[[0, 1, 1], 8], [[0, 1, 1], 12], [[1, 0, 0], 10], [[0, 1], 8], [[0, 0, 0, 0, 1], 9]]) {
  const r = census(a, w);
  let split = 0, freeL = 0, lv = 0, mism = 0;
  for (let k = 1; k <= r.best; k++) {
    const S = r.lvl[k];
    if (S.pop === 0) continue;
    lv++;
    if (S.c0 > 0 && S.c1 > 0) split++;
    if (S.free > 0) freeL++;
    mism += S.mismatch || 0;
  }
  console.log(`    ${show(w)} / ${String(a).padStart(2)} | ${String(r.best).padStart(2)} | ${String(lv).padStart(6)} | ${String(split).padStart(12)} | ${String(freeL).padStart(6)}` +
    `   (deepest level with freedom: ${(() => { let d = 0; for (let k = 1; k <= r.best; k++) if (r.lvl[k].free > 0) d = k; return d; })()})`);
  console.log(`        [A] predicted-vs-observed freedom mismatches: ${mism}`);
  // the last three levels in detail
  for (let k = Math.max(1, r.best - 2); k <= r.best; k++) {
    const S = r.lvl[k];
    console.log(`        level ${k}: pop ${S.pop}, forced value 0 for ${S.c0}, 1 for ${S.c1}, free ${S.free}, required ${w[k % w.length]}`);
  }
}
