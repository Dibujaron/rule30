// Parallax, 2026-09-13.
// BLOCK [A] IS WRONG FOR THE 128 NON-QUIESCENT RULES -- it evolves only the
// cone [-t, t] and freezes the background, which is right when f(0,0,0) = 0 and
// wrong otherwise.  Superseded by parallax_bg.mjs.  Block [B], the centralisers,
// is unaffected (it never simulates a picture).
//
// parallax_controls.mjs allocated a fresh 40 KB row at
// every one of 20000 steps for every one of 256 rules -- about 200 GB of
// allocation churn -- and did not finish.  Same measurements, two preallocated
// buffers swapped, and the live range only.
//
//  [A] the exact list of elementary rules whose centre column shows no period.
//  [B] |centraliser| at radius 0, 1, 2 for a spread of rules.

const bit = (n, i) => (n >> i) & 1;
const localF = (rule) => (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;

// ------------------------------------------------------------------ [A]
const T = 20000, W = 2 * T + 3, O = T + 1;
const bufA = new Uint8Array(W), bufB = new Uint8Array(W);
function centreColumn(rule) {
  const f = localF(rule);
  let cur = bufA, nxt = bufB;
  cur.fill(0); nxt.fill(0);
  cur[O] = 1;
  const out = new Uint8Array(T + 1);
  out[0] = 1;
  for (let t = 1; t <= T; t++) {
    const lo = O - t, hi = O + t;
    for (let i = lo; i <= hi; i++) nxt[i] = f(cur[i - 1], cur[i], cur[i + 1]);
    const tmp = cur; cur = nxt; nxt = tmp;
    out[t] = cur[O];
  }
  return out;
}
function evPeriodicFast(seq, maxP) {
  const n = seq.length;
  for (let p = 1; p <= maxP; p++) {
    let last = -1;
    for (let i = 0; i + p < n; i++) if (seq[i] !== seq[i + p]) last = i;
    if (last === -1) return { p, n: 0 };
    if (last < n / 2) return { p, n: last + 1 };
  }
  return null;
}

console.log("=== [A] elementary rules with NO detected period in the centre column ===");
console.log(`    (depth ${T}, periods to 64, single black cell)`);
const none = [], per = new Map();
const t0 = Date.now();
for (let rule = 0; rule < 256; rule++) {
  const r = evPeriodicFast(centreColumn(rule), 64);
  if (!r) none.push(rule); else per.set(rule, r);
}
console.log(`  ${none.length} rules: [${none.join(", ")}]`);
console.log(`  the other ${256 - none.length} have an eventually periodic centre column at that depth.`);
console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log();

// ------------------------------------------------------------------ [B]
function centraliser(rule, r, cap = 2e8) {
  const f = localF(rule);
  const nEntries = 1 << (2 * r + 1), winLen = 2 * r + 3, nWin = 1 << winLen;
  const at = (w, j) => (w >> (j + r + 1)) & 1;
  const byMax = new Map();
  for (let w = 0; w < nWin; w++) {
    let idxA = 0;
    for (let j = -r; j <= r; j++) idxA |= f(at(w, j - 1), at(w, j), at(w, j + 1)) << (j + r);
    const idx = [];
    for (const j of [-1, 0, 1]) {
      let m = 0;
      for (let d = -r; d <= r; d++) m |= at(w, j + d) << (d + r);
      idx.push(m);
    }
    const c = [idxA, idx[0], idx[1], idx[2]];
    const mx = Math.max(...c);
    if (!byMax.has(mx)) byMax.set(mx, []);
    byMax.get(mx).push(c);
  }
  const Tb = new Int8Array(nEntries).fill(-1);
  let count = 0, nodes = 0, capped = false;
  (function dfs(i) {
    if (capped) return;
    if (i === nEntries) { count++; return; }
    for (const v of [0, 1]) {
      if (++nodes > cap) { capped = true; return; }
      Tb[i] = v;
      let ok = true;
      for (const [a, b, c, d] of (byMax.get(i) || [])) if (Tb[a] !== f(Tb[b], Tb[c], Tb[d])) { ok = false; break; }
      if (ok) dfs(i + 1);
    }
    Tb[i] = -1;
  })(0);
  return capped ? null : count;
}

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
  if (commutes(AND2, 2, f) || commutes(OR2, 2, f) || commutes(MAJ3, 3, f)) return "bounded width";
  if (commutes(MIN3, 3, f)) return "affine";
  return "trivial clone";
}

console.log("=== [B] |centraliser| at radius 0, 1, 2 ===");
console.log("    the shift-and-power monoid plus the constant gives (r+1)^2 + 1 = 2, 5, 10");
console.log("   rule   r=0   r=1    r=2   clone verdict     centre column");
for (const rule of [30, 45, 86, 110, 120, 180, 184, 22, 60, 90, 105, 150, 165, 204, 240, 232]) {
  const row = [0, 1, 2].map((r) => String(centraliser(rule, r) ?? "cap").padStart(5)).join(" ");
  const p = per.get(rule);
  console.log(`   ${String(rule).padStart(4)}  ${row}   ${verdict(rule).padEnd(15)}  ` +
    (p ? `eventually periodic (p=${p.p}, onset ${p.n})` : "no period <= 64"));
}
