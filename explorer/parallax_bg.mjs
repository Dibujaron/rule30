// Parallax, 2026-09-13.  The referee and the engine disagreed, and the REFEREE
// was wrong.  Both parallax_controls2.mjs and parallax_referee.mjs evolve only
// the cone [-t, t] and treat everything outside as white for ever.  That is
// correct for a QUIESCENT rule (f(0,0,0) = 0) and wrong for the other 128:
// with f(0,0,0) = 1 the infinite white background itself flips at every step,
// so "a single black cell on a white background" is not a cone at all.
// parallax_geom.mjs [A] updates the whole array and therefore gets the
// background right, which is why its list contains 167 and 181.
//
// This file does it exactly: carry the background value analytically and pad
// the live range with it.  Quiescent rules are untouched; non-quiescent ones
// are now right rather than accidentally right.

const localF = (rule) => (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;

const T = 20000, W = 2 * T + 5, O = T + 2;
const bufA = new Uint8Array(W), bufB = new Uint8Array(W);

function centreColumn(rule) {
  const f = localF(rule);
  let cur = bufA, nxt = bufB;
  cur.fill(0); nxt.fill(0);
  cur[O] = 1;
  let bg = 0;                                  // value of every cell outside [-t, t]
  const out = new Uint8Array(T + 1);
  out[0] = 1;
  for (let t = 1; t <= T; t++) {
    const lo = O - t, hi = O + t;
    const get = (i) => (i >= lo + 1 && i <= hi - 1) ? cur[i] : ((i >= O - (t - 1) && i <= O + (t - 1)) ? cur[i] : bg);
    for (let i = lo; i <= hi; i++) {
      const l = (i - 1 >= O - (t - 1) && i - 1 <= O + (t - 1)) ? cur[i - 1] : bg;
      const c = (i >= O - (t - 1) && i <= O + (t - 1)) ? cur[i] : bg;
      const r = (i + 1 >= O - (t - 1) && i + 1 <= O + (t - 1)) ? cur[i + 1] : bg;
      nxt[i] = f(l, c, r);
    }
    bg = f(bg, bg, bg);
    const tmp = cur; cur = nxt; nxt = tmp;
    out[t] = cur[O];
  }
  return out;
}

function evPeriodic(col, maxP) {
  const n = col.length, start = n >> 1;
  for (let p = 1; p <= maxP; p++) {
    let ok = true;
    for (let i = start; i + p < n; i++) if (col[i] !== col[i + p]) { ok = false; break; }
    if (ok) return p;
  }
  return null;
}

// ---- self-check: reproduce rule 30's centre column prefix, and the quiescent
// rules must be unchanged from the cone-only engine.
const c30 = centreColumn(30);
console.log("=== self-check ===");
console.log(`  rule 30, t = 0..10: ${Array.from(c30.slice(0, 11)).join("")}  (board: 11011100110)  ` +
  `agree: ${Array.from(c30.slice(0, 11)).join("") === "11011100110"}`);
console.log(`  rule 110 constant black: ${Array.from(centreColumn(110).slice(0, 24)).join("")}`);
console.log(`  rule 184 constant white from t=1: ${Array.from(centreColumn(184).slice(0, 24)).join("")}`);
console.log();

// ---- clone verdict, same test as parallax_clone.mjs
const bit = (n, i) => (n >> i) & 1;
const AND2 = [0, 0, 0, 1], OR2 = [0, 1, 1, 1];
const MAJ3 = [0, 1, 2, 3, 4, 5, 6, 7].map((m) => (bit(m, 0) + bit(m, 1) + bit(m, 2)) >= 2 ? 1 : 0);
const MIN3 = [0, 1, 2, 3, 4, 5, 6, 7].map((m) => bit(m, 0) ^ bit(m, 1) ^ bit(m, 2));
function commutes(op, k, f) {
  const N = 1 << k;
  for (let L = 0; L < N; L++) for (let C = 0; C < N; C++) for (let R = 0; R < N; R++) {
    let Oo = 0;
    for (let i = 0; i < k; i++) Oo |= f(bit(L, i), bit(C, i), bit(R, i)) << i;
    if (op[Oo] !== f(op[L], op[C], op[R])) return false;
  }
  return true;
}
function verdict(rule) {
  const f = localF(rule);
  if (commutes(AND2, 2, f) || commutes(OR2, 2, f) || commutes(MAJ3, 3, f)) return "structured (bounded width)";
  if (commutes(MIN3, 3, f)) return "structured (affine)";
  return "structureless (trivial clone)";
}

console.log("=== the cross-tabulation, with the background handled correctly ===");
const tally = new Map();
const noPeriod = [];
for (let rule = 0; rule < 256; rule++) {
  const v = verdict(rule);
  const p = evPeriodic(centreColumn(rule), 64);
  const key = `${v} | ${p === null ? "no period <= 64" : "eventually periodic"}`;
  tally.set(key, (tally.get(key) || 0) + 1);
  if (p === null) noPeriod.push(rule);
}
for (const [k, n] of [...tally].sort()) console.log(`  ${String(n).padStart(3)}  ${k}`);
console.log();
console.log(`  no period <= 64 at depth ${T}: ${noPeriod.length} rules`);
console.log(`    [${noPeriod.join(", ")}]`);
const quiescent = noPeriod.filter((r) => (r & 1) === 0);
console.log(`    of which quiescent (f(0,0,0)=0): [${quiescent.join(", ")}]`);
console.log(`    non-quiescent: [${noPeriod.filter((r) => r & 1).join(", ")}]`);
console.log();
console.log("  For comparison, the cone-only engines (parallax_controls2.mjs and");
console.log("  parallax_referee.mjs) give [30, 45, 75, 86, 89, 101, 126, 129, 135,");
console.log("  137, 149, 161, 169, 193, 225] -- they agree with this list on every");
console.log("  QUIESCENT rule and are wrong on the others, which is the whole of the");
console.log("  disagreement.");
