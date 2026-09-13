// Parallax, 2026-09-13.  Controls, capped so they terminate.
//  [A] the exact list of elementary rules whose centre column shows no period.
//  [B] centralisers at radius <= 2 for a spread of rules, rule 30 against the
//      linear ones and against rule 184 (trivial clone, constant centre column).
//  [C] the binary picture-level polymorphism search at radius 2, node-capped.

const bit = (n, i) => (n >> i) & 1;
const localF = (rule) => (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;

// ------------------------------------------------------------------ [A]
function centreColumn(rule, T) {
  const f = localF(rule), W = 2 * T + 3;
  let cur = new Uint8Array(W); cur[T + 1] = 1;
  const out = [1];
  for (let t = 1; t <= T; t++) {
    const nxt = new Uint8Array(W);
    for (let i = 0; i < W; i++) nxt[i] = f(i > 0 ? cur[i - 1] : 0, cur[i], i < W - 1 ? cur[i + 1] : 0);
    cur = nxt; out.push(cur[T + 1]);
  }
  return out;
}
function evPeriodicFast(seq, maxP) {
  const T = seq.length;
  for (let p = 1; p <= maxP; p++) {
    let last = -1;
    for (let i = 0; i + p < T; i++) if (seq[i] !== seq[i + p]) last = i;
    if (last === -1) return { p, n: 0 };
    if (last < T / 2) return { p, n: last + 1 };
  }
  return null;
}
console.log("=== [A] elementary rules with NO detected period in the centre column ===");
console.log("    (depth 20000, periods to 64, single black cell)");
const none = [];
for (let rule = 0; rule < 256; rule++) {
  if (!evPeriodicFast(centreColumn(rule, 20000), 64)) none.push(rule);
}
console.log(`  ${none.length} rules: [${none.join(", ")}]`);
console.log(`  the other ${256 - none.length} have an eventually periodic centre column at that depth.`);
console.log();

// ------------------------------------------------------------------ [B]
function centraliser(rule, r, cap = 5e7) {
  const f = localF(rule);
  const nEntries = 1 << (2 * r + 1), winLen = 2 * r + 3, nWin = 1 << winLen;
  const at = (w, j) => (w >> (j + r + 1)) & 1;
  const cons = [];
  for (let w = 0; w < nWin; w++) {
    let idxA = 0;
    for (let j = -r; j <= r; j++) idxA |= f(at(w, j - 1), at(w, j), at(w, j + 1)) << (j + r);
    const idx = [];
    for (const j of [-1, 0, 1]) {
      let m = 0;
      for (let d = -r; d <= r; d++) m |= at(w, j + d) << (d + r);
      idx.push(m);
    }
    cons.push([idxA, idx[0], idx[1], idx[2]]);
  }
  const T = new Int8Array(nEntries).fill(-1);
  const byMax = new Map();
  for (const c of cons) {
    const mx = Math.max(...c);
    if (!byMax.has(mx)) byMax.set(mx, []);
    byMax.get(mx).push(c);
  }
  let count = 0, nodes = 0, capped = false;
  (function dfs(i) {
    if (capped) return;
    if (i === nEntries) { count++; return; }
    for (const v of [0, 1]) {
      if (++nodes > cap) { capped = true; return; }
      T[i] = v;
      let ok = true;
      for (const [a, b, c, d] of (byMax.get(i) || [])) if (T[a] !== f(T[b], T[c], T[d])) { ok = false; break; }
      if (ok) dfs(i + 1);
    }
    T[i] = -1;
  })(0);
  return capped ? null : count;
}
console.log("=== [B] |centraliser| at radius 0, 1, 2 ===");
console.log("    the shift-and-power monoid alone would give (r+1)^2 + 1 = 2, 5, 10");
console.log("   rule   r=0   r=1    r=2   clone verdict            centre column");
const AND2 = [0, 0, 0, 1], OR2 = [0, 1, 1, 1];
const MAJ3 = [0, 1, 2, 3, 4, 5, 6, 7].map((m) => (bit(m, 0) + bit(m, 1) + bit(m, 2)) >= 2 ? 1 : 0);
const MIN3 = [0, 1, 2, 3, 4, 5, 6, 7].map((m) => bit(m, 0) ^ bit(m, 1) ^ bit(m, 2));
function commutes(op, k, f) {
  const N = 1 << k;
  for (let L = 0; L < N; L++) for (let C = 0; C < N; C++) for (let R = 0; R < N; R++) {
    let O = 0;
    for (let i = 0; i < k; i++) O |= f(bit(L, i), bit(C, i), bit(R, i)) << i;
    if (op[O] !== f(op[L], op[C], op[R])) return false;
  }
  return true;
}
function verdict(rule) {
  const f = localF(rule);
  if (commutes(AND2, 2, f) || commutes(OR2, 2, f) || commutes(MAJ3, 3, f)) return "bounded width";
  if (commutes(MIN3, 3, f)) return "affine";
  return "trivial clone";
}
for (const rule of [30, 45, 86, 110, 120, 180, 184, 22, 60, 90, 105, 150, 165, 204, 240, 232]) {
  const row = [0, 1, 2].map((r) => String(centraliser(rule, r) ?? "capped").padStart(5)).join(" ");
  const per = evPeriodicFast(centreColumn(rule, 5000), 64);
  console.log(`   ${String(rule).padStart(4)}  ${row}   ${verdict(rule).padEnd(15)}  ` +
    (per ? `eventually periodic (p=${per.p})` : "no period <= 64"));
}
console.log();

// ------------------------------------------------------------------ [C]
console.log("=== [C] binary picture-level polymorphisms at radius 2, node-capped ===");
function binaryCentraliser(r, nodeCap) {
  const F = localF(30);
  const span = 2 * r + 1, nEntries = 1 << (2 * span);
  const winLen = 2 * r + 3, nWin = 1 << winLen;
  const at = (w, j) => (w >> (j + r + 1)) & 1;
  const pack = (wx, wy, j) => {
    let mx = 0, my = 0;
    for (let d = -r; d <= r; d++) { mx |= at(wx, j + d) << (d + r); my |= at(wy, j + d) << (d + r); }
    return mx | (my << span);
  };
  const byMax = new Map();
  for (let wx = 0; wx < nWin; wx++) for (let wy = 0; wy < nWin; wy++) {
    let ax = 0, ay = 0;
    for (let j = -r; j <= r; j++) {
      ax |= F(at(wx, j - 1), at(wx, j), at(wx, j + 1)) << (j + r);
      ay |= F(at(wy, j - 1), at(wy, j), at(wy, j + 1)) << (j + r);
    }
    const c = [ax | (ay << span), pack(wx, wy, -1), pack(wx, wy, 0), pack(wx, wy, 1)];
    const mx = Math.max(...c);
    if (!byMax.has(mx)) byMax.set(mx, []);
    byMax.get(mx).push(c);
  }
  const T = new Int8Array(nEntries).fill(-1);
  let count = 0, both = 0, nodes = 0, capped = false;
  (function dfs(i) {
    if (capped) return;
    if (i === nEntries) {
      count++;
      let dx = false, dy = false;
      for (let m = 0; m < nEntries; m++) {
        for (let b = 0; b < span; b++) if (T[m] !== T[m ^ (1 << b)]) dx = true;
        for (let b = span; b < 2 * span; b++) if (T[m] !== T[m ^ (1 << b)]) dy = true;
      }
      if (dx && dy) both++;
      return;
    }
    for (const v of [0, 1]) {
      if (++nodes > nodeCap) { capped = true; return; }
      T[i] = v;
      let ok = true;
      for (const [a, b, c, d] of (byMax.get(i) || [])) if (T[a] !== F(T[b], T[c], T[d])) { ok = false; break; }
      if (ok) dfs(i + 1);
    }
    T[i] = -1;
  })(0);
  return { count, both, nodes, capped, nEntries };
}
for (const r of [0, 1, 2]) {
  const t0 = Date.now();
  const res = binaryCentraliser(r, 4e8);
  console.log(`  radius ${r}: ${res.capped ? "CAPPED" : "complete"} — ${res.count} solutions, ` +
    `${res.both} genuinely binary, ${res.nodes} nodes, ${res.nEntries} unknowns, ${Date.now() - t0} ms`);
}
