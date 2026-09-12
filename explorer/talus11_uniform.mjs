// Talus, 2026-09-12.  Is the period ladder a ladder, or one inequality?
//
// f(p,a) >= p is trivial.  If the EXCESS f(p,a) - p were bounded by a function of
// a alone, then f(p,a) <= p + g(a) for every p, and an eventually periodic centre
// column with period p and onset a would give an infinite period-p block, so P1
// would follow from ONE inequality rather than from a rung at every p.
//
// That is cheap to test at small a: past radius a the column is forced, so the
// tree is about 4^a * 2^(p-a) at level p and then decays.  p can be pushed far.

const ABORT_CAP = "cap", ABORT_BUD = "budget";

function search(a, forbidden, cap, budget, kind) {
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (kind >= 2 && a <= cap + 3) req[a] = 1;
  if (kind >= 3 && a - 1 >= 0) req[a - 1] = 1;
  let best = 0;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let nodes = 0, status = "exact";
  const P = forbidden.P;

  // periodic target: col[k] must equal col[k-P] once k >= P
  const ok = (k) => k < P || col[k] === col[k - P];

  function rec(k) {
    if (k > cap) { status = "cap"; throw ABORT_CAP; }
    if (++nodes > budget) { status = "budget"; throw ABORT_BUD; }
    for (const rc of [0, 1]) {
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      const centre0 = ldk[k - 1] ^ (col[k - 1] | rdk[k - 1]);
      for (const cv of [0, 1]) {
        const lc = centre0 ^ cv;
        if (req[k] >= 0 && lc !== req[k]) continue;
        col[k] = cv;
        if (!ok(k)) continue;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (k + 1 > best) best = k + 1;
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
  }
  try {
    for (const s of [0, 1]) {
      if (req[0] >= 0 && s !== req[0]) continue;
      col[0] = s;
      LD[0][0] = s; RD[0][0] = s;
      if (1 > best) best = 1;
      rec(1);
    }
  } catch (e) { if (e !== ABORT_CAP && e !== ABORT_BUD) throw e; }
  return { best, status, nodes };
}

// cross-check the fast period test against the forbidden-word encoding used in
// talus11_ladder.mjs, on the cells both can reach
console.log("[V] the direct period test against the forbidden-word encoding of Sigma_p");
{
  let bad = 0, n = 0;
  for (let p = 1; p <= 6; p++) for (let a = 1; a <= 8; a++) {
    const r = search(a, { P: p }, 64, 2.5e8, 2);
    n++;
    const known = {
      "1,1": 3, "1,2": 4, "1,3": 5, "1,4": 6, "1,5": 7, "1,6": 8, "1,7": 9, "1,8": 10,
      "2,1": 8, "2,2": 7, "2,3": 6, "2,4": 6, "2,5": 9, "2,6": 10, "2,7": 10, "2,8": 17,
      "3,1": 8, "3,2": 10, "3,3": 9, "3,4": 9, "3,5": 10, "3,6": 14, "3,7": 13, "3,8": 17,
      "4,1": 8, "4,2": 10, "4,3": 10, "4,4": 11, "4,5": 13, "4,6": 14, "4,7": 14, "4,8": 17,
      "5,1": 11, "5,2": 10, "5,3": 10, "5,4": 11, "5,5": 13, "5,6": 13, "5,7": 14, "5,8": 16,
      "6,1": 15, "6,2": 14, "6,3": 14, "6,4": 13, "6,5": 13, "6,6": 16, "6,7": 16, "6,8": 18,
    }[`${p},${a}`];
    if (r.status !== "exact" || r.best !== known) { bad++; console.log(`    MISMATCH p=${p} a=${a}: ${r.best} (${r.status}) vs ${known}`); }
  }
  console.log(`    ${n} cells compared, ${bad} mismatches`);
}

const CAP = 200, BUD = 3e8;
console.log(`\n[U] f(p,a) and the excess f - p, class C2, p pushed as far as it goes`);
for (const a of [1, 2, 3, 4, 5, 6]) {
  const fs = [], ex = [];
  let stopped = null;
  for (let p = 1; p <= 40; p++) {
    const r = search(a, { P: p }, CAP, BUD, 2);
    if (r.status !== "exact") { stopped = `${p} (${r.status} at f>=${r.best})`; break; }
    fs.push(r.best); ex.push(r.best - p);
  }
  console.log(`    a=${a}  f(p,a), p=1..${fs.length}: ${fs.join(" ")}`);
  console.log(`          excess      : ${ex.join(" ")}   max ${Math.max(...ex)}` +
    `${stopped ? `   (stopped at p=${stopped})` : ""}`);
}
