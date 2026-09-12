// Talus, 2026-09-12.  WHY the surviving set dies, level by level.
//
// The question this answers: at a target of growth rate 1 (the p-periodic
// columns are 2^p points, so the column is pinned outright from level p on),
// the whole surviving population dies on ONE level rather than decaying.  No
// cause was identified this morning.  This script measures the cause.
//
// THE TWO BITS AT EACH LEVEL.  Building outward by radius k, the free datum is
// rc = cell(0, +k) and the determined datum is lc = cell(0, -k).  The centre
// cell at time k is the rule applied at the origin one step earlier:
//
//    col[k] = cell(k-1,-1) XOR ( col[k-1] OR cell(k-1,+1) )
//           = LD_k[k-1]    XOR ( col[k-1] OR RD_k[k-1] )
//
// LD_k is affine in lc, so lc can always hit whichever col[k] is wanted -- but
// lc is FORCED white for k > a by the cone.  So the only freedom is rc, through
// RD_k[k-1].  Write phi(rc) = col[k] with lc = 0.  Then a survivor has
//    2 children  if phi is constant and equal to the required value
//    0 children  if phi is constant and not
//    1 child     if phi is a bijection.
// Mean children over the two possible required values is EXACTLY 1 in all
// cases: the process is exactly critical, whatever phi does.
//
// So the measurement is: how often is phi constant, and when it is, is the
// constant SHARED across survivors?  A shared constant is a one-level death.

const RULES = {
  30: (l, c, r) => l ^ (c | r),
  90: (l, c, r) => l ^ r,
  150: (l, c, r) => l ^ c ^ r,
  86: (l, c, r) => r ^ (c | l), // rule 30's mirror: orientation control
};

const ABORT = "abort";

function run(a, p, ruleNo, cap, budget, want) {
  const F = RULES[ruleNo];
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
  const C = [];
  for (let k = 0; k <= cap + 3; k++) {
    C.push({ pop: 0, k0: 0, k1: 0, k2: 0, k4: 0, phiConst: 0, phiFree: 0, constBlack: 0, constWhite: 0, cls: new Map() });
  }

  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = F(rd2[t - 1], rd1[t - 1], rdk[t - 1]);
    return rdk[k - 1];
  }

  function rec(k) {
    if (k > cap) { status = "cap"; throw ABORT; }
    if (++nodes > budget) { status = "budget"; throw ABORT; }
    const S = C[k];
    S.pop++;
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = F(ldk[t - 1], ld1[t - 1], ld2[t - 1]);
    const base = ldk[k - 1];
    const c0 = F(base, col[k - 1], fillRD(k, 0));
    const c1 = F(base, col[k - 1], fillRD(k, 1));
    const constant = (c0 === c1);
    if (constant) {
      S.phiConst++;
      if (col[k - 1] === 1) S.constBlack++; else S.constWhite++;
      // the class is the period word (all survivors of a class share the whole
      // column), and within a class we record which constant value phi took
      if (k >= p) {
        let key = "";
        for (let i = 0; i < p; i++) key += col[i];
        const e = S.cls.get(key) || { agree: 0, disagree: 0 };
        if (c0 === col[k - p]) e.agree++; else e.disagree++;
        S.cls.set(key, e);
      }
    } else S.phiFree++;

    let kids = 0;
    for (const rc of [0, 1]) {
      const centre0 = rc === 0 ? c0 : c1;
      fillRD(k, rc);
      const rdk = RD[k];
      for (const cv of [0, 1]) {
        if (k >= p && cv !== col[k - p]) continue;
        const lc = centre0 ^ cv;
        if (req[k] >= 0 && lc !== req[k]) continue;
        kids++;
        col[k] = cv;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (k + 1 > best) best = k + 1;
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
    if (kids === 0) S.k0++; else if (kids === 1) S.k1++; else if (kids === 2) S.k2++; else S.k4++;
  }

  try {
    for (const s of [0, 1]) {
      col[0] = s; LD[0][0] = s; RD[0][0] = s;
      if (1 > best) best = 1;
      rec(1);
    }
  } catch (e) { if (e !== ABORT) throw e; }
  return { best, status, nodes, C };
}

const CAP = 70, BUD = 3e8;

// ---------------------------------------------------------------- [F] filter
// Crystal 66: an argument that survives OR -> XOR is refuted.  Rule 30 is
// left-permutive and NOT right-permutive; 90 and 150 are both.  If finiteness
// is caused by the failure of right-permutivity, it must break for 90 and 150.
console.log(`[F] crystal 66's filter, on finiteness itself.  f(p,a) for four rules.`);
console.log(`    + means a configuration reached the cap ${CAP}, i.e. no finite bound found.`);
for (const ruleNo of [30, 86, 90, 150]) {
  let line = `    rule ${String(ruleNo).padStart(3)} |`;
  for (const [p, a] of [[1, 3], [2, 3], [3, 3], [3, 6], [4, 4], [5, 5], [6, 4]]) {
    const r = run(a, p, ruleNo, CAP, BUD);
    line += `  p${p}a${a}=${r.best}${r.status === "exact" ? "" : r.status === "cap" ? "+" : "?"}`;
  }
  console.log(line);
}

// --------------------------------------------------- [P] the population census
console.log(`\n[P] rule 30, the level-by-level census.  For each level k:`);
console.log(`    pop   = survivors whose column word has length k`);
console.log(`    kids  = how many of them had 0 / 1 / 2 / 4 children`);
console.log(`    const = how many had phi constant (the right half could NOT move col[k])`);
console.log(`    blk   = of those, how many because col[k-1] was black (column_succ_of_black)`);
for (const [p, a] of [[3, 8], [3, 12], [2, 8], [5, 9]]) {
  const r = run(a, p, 30, CAP, BUD);
  console.log(`\n    p = ${p}, a = ${a}:  f = ${r.best} (${r.status}), ${r.nodes} nodes`);
  console.log(`      k |    pop |    k0    k1    k2    k4 |  const  free |   blk  whi | classes`);
  for (let k = 1; k <= r.best; k++) {
    const S = r.C[k];
    if (S.pop === 0) continue;
    const cl = [...S.cls.entries()].map(([w, e]) => `${w}:${e.agree}/${e.agree + e.disagree}`).join(" ");
    console.log(
      `    ${String(k).padStart(3)} | ${String(S.pop).padStart(6)} |` +
      ` ${String(S.k0).padStart(5)} ${String(S.k1).padStart(5)} ${String(S.k2).padStart(5)} ${String(S.k4).padStart(5)} |` +
      ` ${String(S.phiConst).padStart(6)} ${String(S.phiFree).padStart(5)} |` +
      ` ${String(S.constBlack).padStart(5)} ${String(S.constWhite).padStart(4)} | ${cl}`);
  }
}
