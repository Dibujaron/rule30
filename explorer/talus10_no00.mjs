// Talus, 2026-09-12.  The 00-free target in the LEFT-HALF RELAXATION.
//
// talus10_no11.mjs found, exhaustively over configurations, that 11-free centre
// columns of coned configurations are long (capped, no upper bound found) while
// 00-free ones looked BOUNDED: 16, 16, 27, 31 cells at a = 1..4, genuine maxima.
// That asymmetry mirrors the two proved run bounds (black < a, white < 3a) and
// would matter a lot, because a linear 00-free bound gives "00 occurs infinitely
// often" outright -- the single-colour result, stronger than the disjunction.
//
// The exhaustive search is exponential in the DEPTH (the column word is a branch
// too), so it cannot be pushed.  The relaxation can: column -1 is DETERMINED at
// every black time of a 00-free column (c(t)=1 gives d(t) = not c(t+1)) and free
// only at the white times, which are isolated.  Everything further left follows
// from leftSolve.  f_relax >= f_exact, so a finite relaxed answer would settle it
// and an infinite one says a left-half-only proof cannot work.

// D[k][j] = cell(-j, k-j);  D[k][0] = c(k), D[k][1] = d(k-1),
// D[k][j] = D[k][j-1] XOR (D[k-1][j-1] OR D[k-2][j-2]);  D[k][k] = 0 for k > a.
function relax(a, allowed, dFree, cap, edge) {
  const D = [];
  for (let k = 0; k <= cap + 2; k++) D.push(new Uint8Array(cap + 3));
  const col = new Uint8Array(cap + 3);
  let best = 0, bestCol = null, nodes = 0;

  function rec(k) {
    if (k > cap) return;
    if (++nodes > 2e8) throw new Error("node budget");
    for (const cv of [0, 1]) {
      if (!allowed(col[k - 1], cv)) continue;
      col[k] = cv;
      // d(k-1) = cell(-1, k-1): determined when c(k-1) = 1, free when c(k-1) = 0
      const dChoices = dFree(col[k - 1], cv);
      for (const dv of dChoices) {
        const Dk = D[k], D1 = D[k - 1], D2 = k >= 2 ? D[k - 2] : null;
        Dk[0] = cv;
        Dk[1] = dv;
        for (let j = 2; j <= k; j++) Dk[j] = Dk[j - 1] ^ (D1[j - 1] | D2[j - 2]);
        const lc = Dk[k];
        if (k > a && lc === 1) continue;
        if (edge && k === a && lc !== 1) continue;
        if (edge && k === a - 1 && lc !== 1) continue;
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
        rec(k + 1);
      }
    }
  }
  for (const s of [0, 1]) { col[0] = s; D[0][0] = s; rec(1); }
  return { best, bestCol, nodes };
}

// d(k-1) choices.  prev = c(k-1), cur = c(k).
// black time k-1: d(k-1) = not c(k) .  white time k-1: free.
const dRule = (prev, cur) => (prev === 1 ? [cur === 1 ? 0 : 1] : [0, 1]);

const ALT = (p, n) => n !== p;
const NO00 = (p, n) => !(p === 0 && n === 0);
const NO11 = (p, n) => !(p === 1 && n === 1);

console.log("[V] the relaxation on the ALTERNATING target, against talus10_relax.mjs");
console.log("    talus10_relax.mjs a=1..10 -> 8,8,8,8,10,11,13,18,19,19");
{
  let s = "    here                  -> ";
  for (let a = 1; a <= 10; a++) {
    try { s += relax(a, ALT, dRule, 10 * a + 40, false).best; } catch (e) { s += "budget"; }
    s += a < 10 ? "," : "";
  }
  console.log(s);
}

console.log("\n[R] the relaxation on the single-colour targets");
console.log("      a | 00-free relax | 11-free relax | exhaustive 00-free | 3a  | cap");
const exhaust00 = { 1: 16, 2: 16, 3: 27, 4: 31 };
for (const a of [1, 2, 3, 4, 5, 6, 8, 10, 12]) {
  const cap = Math.min(220, 12 * a + 60);
  let r00 = "?", r11 = "?";
  try { const r = relax(a, NO00, dRule, cap, false); r00 = r.best >= cap ? `>=${r.best} CAP` : String(r.best); }
  catch (e) { r00 = "budget"; }
  try { const r = relax(a, NO11, dRule, cap, false); r11 = r.best >= cap ? `>=${r.best} CAP` : String(r.best); }
  catch (e) { r11 = "budget"; }
  console.log(`    ${String(a).padStart(3)} | ${String(r00).padStart(13)} | ${String(r11).padStart(13)} | ` +
    `${String(exhaust00[a] ?? "-").padStart(18)} | ${String(3 * a).padStart(3)} | ${cap}`);
}
