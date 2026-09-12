// Talus, 2026-09-12.  The criterion's most dangerous prediction, tested before
// the criterion is written down.
//
// "The centre column is periodic with period p" is a target with exactly 2^p
// points, so its language has 2^p words of every length and lambda = 1.  The
// criterion therefore says the cone SEES it, for every p -- which is P1 for the
// whole coned family, and that is open.  So either
//   (a) the searches go extinct, and the criterion is making a very strong
//       prediction that the board should know about, or
//   (b) they do not, and the criterion over-promises at lambda = 1 and must be
//       stated only for the targets actually measured.
// Say which.
//
// Sigma_p as forbidden words: avoid every word of length p+1 whose first and
// last symbols differ.  That is 2^p forbidden words and it is exactly
// "x(n+p) = x(n) for every n".

const ABORT_CAP = "cap", ABORT_BUD = "budget";

function classReq(kind, a, cap) {
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (kind >= 2 && a <= cap + 3) req[a] = 1;
  if (kind >= 3 && a - 1 >= 0) req[a - 1] = 1;
  return req;
}

function search(a, forbidden, cap, budget, kind) {
  const col = new Uint8Array(cap + 6);
  const req = classReq(kind, a, cap);
  let best = 0, bestCol = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let nodes = 0, status = "exact";
  const pop = new Float64Array(cap + 3);

  const ok = (k) => {
    for (const w of forbidden) {
      const m = w.length;
      if (k + 1 < m) continue;
      let hit = true;
      for (let i = 0; i < m; i++) if (col[k - m + 1 + i] !== w[i]) { hit = false; break; }
      if (hit) return false;
    }
    return true;
  };

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
        pop[k]++;
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
  }
  try {
    for (const s of [0, 1]) {
      if (req[0] >= 0 && s !== req[0]) continue;
      col[0] = s;
      if (!ok(0)) continue;
      LD[0][0] = s; RD[0][0] = s;
      pop[0]++;
      if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); }
      rec(1);
    }
  } catch (e) { if (e !== ABORT_CAP && e !== ABORT_BUD) throw e; }
  return { best, status, nodes, pop, bestCol };
}

function sigma(p) {
  const out = [];
  for (let v = 0; v < (1 << (p + 1)); v++) {
    const w = []; for (let i = p; i >= 0; i--) w.push((v >> i) & 1);
    if (w[0] !== w[p]) out.push(w);
  }
  return out;
}
const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");

console.log("[S] f(a) for the target 'the centre column is periodic with period p'");
console.log("    lambda = 1 for every p (the target has exactly 2^p points), so the criterion");
console.log("    predicts the search goes extinct for every p and every a.");
console.log("    n = exact maximum;  >=n = a configuration reached n cells;  n? = budget hit");
for (const kind of [1, 2, 3]) {
  console.log(`\n    class C${kind}`);
  let head = "      p |";
  for (let a = 1; a <= 8; a++) head += `    a=${a}`;
  console.log(head);
  for (let p = 1; p <= 6; p++) {
    const S = sigma(p);
    let line = `    ${String(p).padStart(3)} |`;
    for (let a = 1; a <= 8; a++) {
      const r = search(a, S, 60, 2.5e7, kind);
      line += ` ${(r.best + (r.status === "exact" ? "" : r.status === "cap" ? "+" : "?")).padStart(6)}`;
    }
    console.log(line);
  }
}

console.log("\n[P] population traces at a = 6, class C2, to see whether the death is a collapse");
for (let p = 1; p <= 5; p++) {
  const r = search(6, sigma(p), 60, 6e7, 2);
  const tr = [];
  for (let k = 0; k < r.pop.length; k++) { tr.push(r.pop[k]); if (r.pop[k] === 0) break; }
  console.log(`    p=${p}  f=${r.best} (${r.status})  ${tr.join(" ")}`);
}

console.log("\n[W] the deepest periodic block found, for the first few p, class C2, a = 6");
for (let p = 1; p <= 5; p++) {
  const r = search(6, sigma(p), 60, 6e7, 2);
  console.log(`    p=${p}  ${show(r.bestCol)}  (${r.best} cells, ${r.status})`);
}
