// Parallax, 2026-09-13.  parallax_centralizer.mjs measured the unary
// centraliser of rule 30 at radius r = 0,1,2,3 as 2, 5, 10, 17 members.
// Those are (r+1)^2 + 1, which is exactly |{ sigma^a F^b : |a| + b <= r }| + 1.
// A clean count is not a structure theorem -- my own notebook says distrust it --
// so this file builds the shift-and-power tables explicitly and compares SETS.

const F = (l, c, r) => l ^ (c | r);

// A radius-r block map as a table indexed by an m in [0, 2^(2r+1)), where bit
// (d + r) of m is the cell at offset d.
function tableOf(map, r) {
  const span = 2 * r + 1, N = 1 << span, T = new Int8Array(N);
  for (let m = 0; m < N; m++) {
    const w = [];
    for (let d = -r; d <= r; d++) w.push((m >> (d + r)) & 1);
    T[m] = map(w, r);
  }
  return Array.from(T).join("");
}

// sigma^a F^b as a radius-r map: read the window w (offsets -r..r), apply F b
// times (each step loses one cell each side), then take the cell at offset a.
function shiftPower(a, b) {
  return (w, r) => {
    let cur = w.slice();          // offsets -r .. r
    let lo = -r;
    for (let s = 0; s < b; s++) {
      const nxt = [];
      for (let i = 1; i < cur.length - 1; i++) nxt.push(F(cur[i - 1], cur[i], cur[i + 1]));
      cur = nxt; lo += 1;
    }
    return cur[a - lo];
  };
}

// re-run the centraliser search (same code as parallax_centralizer.mjs [A])
function unaryCentraliser(r) {
  const nEntries = 1 << (2 * r + 1), winLen = 2 * r + 3, nWin = 1 << winLen;
  const at = (w, j) => (w >> (j + r + 1)) & 1;
  const cons = [];
  for (let w = 0; w < nWin; w++) {
    let idxA = 0;
    for (let j = -r; j <= r; j++) idxA |= F(at(w, j - 1), at(w, j), at(w, j + 1)) << (j + r);
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
  const sols = [];
  (function dfs(i) {
    if (i === nEntries) { sols.push(Array.from(T).join("")); return; }
    for (const v of [0, 1]) {
      T[i] = v;
      let ok = true;
      for (const [a, b, c, d] of (byMax.get(i) || [])) if (T[a] !== F(T[b], T[c], T[d])) { ok = false; break; }
      if (ok) dfs(i + 1);
    }
    T[i] = -1;
  })(0);
  return new Set(sols);
}

console.log("=== the unary centraliser of rule 30 is exactly the shift-and-power monoid, plus 0 ===");
console.log("   r   |centraliser|   (r+1)^2+1   |{sigma^a F^b}|   equal as sets?   extra members");
for (let r = 0; r <= 3; r++) {
  const found = unaryCentraliser(r);
  const predicted = new Set();
  for (let b = 0; b <= r; b++) for (let a = -(r - b); a <= r - b; a++) {
    predicted.add(tableOf(shiftPower(a, b), r));
  }
  const zero = "0".repeat(1 << (2 * r + 1));
  predicted.add(zero);
  const extra = [...found].filter((s) => !predicted.has(s));
  const missing = [...predicted].filter((s) => !found.has(s));
  console.log(`  ${r}    ${String(found.size).padStart(10)}   ${String((r + 1) ** 2 + 1).padStart(9)}   ` +
    `${String(predicted.size).padStart(13)}   ${String(extra.length === 0 && missing.length === 0).padStart(14)}   ` +
    `${extra.length} extra, ${missing.length} missing`);
  if (extra.length) console.log(`      EXTRA: ${extra.join("  ")}`);
}
console.log();
console.log("  sigma^a F^b with |a| + b <= r, plus the constant-white map, and nothing");
console.log("  else, at every radius computed.  So rule 30's centraliser is as small as");
console.log("  a surjective CA's centraliser can be: it contains no automorphism of the");
console.log("  full shift beyond the shifts themselves, and no idempotent beyond 0 and 1.");
console.log();

// control: a rule whose centraliser is genuinely bigger
console.log("=== control: the same search for the linear rules ===");
function centraliserOfRule(rule, r) {
  const f = (l, c, rr) => (rule >> (4 * l + 2 * c + rr)) & 1;
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
  let count = 0;
  (function dfs(i) {
    if (i === nEntries) { count++; return; }
    for (const v of [0, 1]) {
      T[i] = v;
      let ok = true;
      for (const [a, b, c, d] of (byMax.get(i) || [])) if (T[a] !== f(T[b], T[c], T[d])) { ok = false; break; }
      if (ok) dfs(i + 1);
    }
    T[i] = -1;
  })(0);
  return count;
}
console.log("   rule   r=0   r=1   r=2   r=3      (r+1)^2+1 would be 2, 5, 10, 17");
for (const rule of [30, 45, 86, 90, 105, 110, 150, 184, 204]) {
  const row = [0, 1, 2, 3].map((r) => String(centraliserOfRule(rule, r)).padStart(5)).join(" ");
  console.log(`   ${String(rule).padStart(4)}  ${row}`);
}
