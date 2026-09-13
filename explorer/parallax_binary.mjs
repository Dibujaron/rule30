// Parallax, 2026-09-13.  Binary picture-level polymorphisms, across rules.
// G : (S^Z)^2 -> S^Z of radius r with G(Fx, Fy) = F(G(x,y)) for all x, y.
// Exhaustive: equality of block maps of radius R is decided by all windows of
// length 2R+1, so the constraint set below is complete, not sampled.
//
// The control that matters: for an AFFINE rule, coordinatewise XOR is a
// genuinely binary such G.  For rule 30 it should not be, and the question is
// whether anything else is.

const localF = (rule) => (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;

function binary(rule, r, nodeCap = 3e8) {
  const F = localF(rule);
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
  const examples = [];
  (function dfs(i) {
    if (capped) return;
    if (i === nEntries) {
      count++;
      let dx = false, dy = false;
      for (let m = 0; m < nEntries; m++) {
        for (let b = 0; b < span; b++) if (T[m] !== T[m ^ (1 << b)]) dx = true;
        for (let b = span; b < 2 * span; b++) if (T[m] !== T[m ^ (1 << b)]) dy = true;
      }
      if (dx && dy) { both++; if (examples.length < 3) examples.push(Array.from(T).join("")); }
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
  return { count, both, capped, examples, nEntries };
}

console.log("=== binary picture-level polymorphisms G(x,y), by rule and radius ===");
console.log("  'both' = depends genuinely on both arguments (the geometric analogue of");
console.log("  an AND / OR / majority / minority polymorphism of the local relation).");
console.log();
console.log("   rule    r=0 total/both    r=1 total/both");
for (const rule of [30, 45, 86, 110, 120, 180, 184, 22, 232, 60, 90, 105, 150, 165, 204]) {
  const a = binary(rule, 0), b = binary(rule, 1);
  const fmt = (x) => x.capped ? "   CAPPED   " : `${String(x.count).padStart(5)} / ${String(x.both).padStart(4)}`;
  console.log(`   ${String(rule).padStart(4)}    ${fmt(a)}      ${fmt(b)}`);
}
console.log();

console.log("=== is coordinatewise XOR a binary polymorphism? (radius 0) ===");
for (const rule of [30, 45, 90, 110, 150, 184, 204]) {
  const F = localF(rule);
  // G(x,y) = x XOR y, radius 0.  Check G(Fx,Fy) = F(G(x,y)) on all windows of length 3.
  let ok = true;
  for (let wx = 0; wx < 8 && ok; wx++) for (let wy = 0; wy < 8 && ok; wy++) {
    const bx = [(wx >> 0) & 1, (wx >> 1) & 1, (wx >> 2) & 1];
    const by = [(wy >> 0) & 1, (wy >> 1) & 1, (wy >> 2) & 1];
    const lhs = F(bx[0], bx[1], bx[2]) ^ F(by[0], by[1], by[2]);
    const rhs = F(bx[0] ^ by[0], bx[1] ^ by[1], bx[2] ^ by[2]);
    if (lhs !== rhs) ok = false;
  }
  console.log(`   rule ${String(rule).padStart(3)}: XOR commutes = ${ok}`);
}
console.log();
console.log("  XOR is a picture-level binary polymorphism exactly for the LINEAR rules,");
console.log("  and that is crystal 66's filter appearing one level up: the coboundary");
console.log("  object c(t) XOR c(t+p) is the image of a picture and its own time-shift");
console.log("  under a map that IS compatible with the dynamics for rule 90 and 150 and");
console.log("  is not for rule 30.");
