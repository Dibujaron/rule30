// Astrolabe, 2026-09-13. The vantage's own premise, checked rather than inherited:
// "the statement 'centre cell at time t equals b' has a unit-propagation proof of
// size O(t^2) from the seed and the rule".
//
// [A] Build the CNF honestly. Variables: one per triangle cell (s,x) with
//     0 <= s <= t and |x| <= t - s ... plus the seed row. Clauses: for each cell
//     of rows 1..t, the 8 clauses of "new = l XOR (c OR r)" (one per falsifying
//     assignment of the four variables), plus unit clauses for row 0, plus the
//     unit clause negating the true answer. Run PURE unit propagation -- no
//     decisions, no learning -- and report whether it reaches a conflict, how
//     many propagations it took, and how many clauses the formula has.
//
// [B] The causal certificate. Unit propagation touching every cell is an upper
//     bound; how many cells does a derivation actually NEED? Backwards from
//     (t,0): a cell is computed as l XOR (c OR r), so l is always needed, c is
//     always needed, and r is needed only when c is WHITE (when c is black the
//     OR is already satisfied and r cannot matter). That pruning is rule 30's
//     own nonlinearity used as a proof-shortening device, and it is exactly what
//     the linear rules cannot do. Measured as a fraction of the causal triangle,
//     for rule 30 and for the controls.

function table(r) { const t = new Uint8Array(8); for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1; return t; }

// ---------------------------------------------------------------- picture
function picture(rule, t) {
  const tab = table(rule);
  const W = 2 * t + 3;
  const rows = [];
  let cur = new Uint8Array(W);
  cur[t + 1] = 1;                      // the single black cell, at index t+1 <-> x = 0
  rows.push(cur.slice());
  for (let s = 1; s <= t; s++) {
    const nxt = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    rows.push(nxt.slice());
    cur = nxt;
  }
  return { rows, off: t + 1 };
}

// ---------------------------------------------------------------- [A] unit propagation
function upCheck(rule, t) {
  const tab = table(rule);
  const { rows, off } = picture(rule, t);
  // variable numbering over the causal triangle: cell (s,x) for 0<=s<=t, |x|<=t-s
  const id = new Map();
  const key = (s, x) => s * 10000 + (x + 5000);
  let nv = 0;
  for (let s = 0; s <= t; s++) for (let x = -(t - s); x <= t - s; x++) { id.set(key(s, x), ++nv); }
  const clauses = [];
  const lit = (s, x, pos) => (pos ? 1 : -1) * id.get(key(s, x));
  // row 0: the seed, as units
  for (let x = -t; x <= t; x++) clauses.push([lit(0, x, x === 0)]);
  // rows 1..t: 8 clauses per cell, one forbidding each falsifying (l,c,r,y)
  for (let s = 1; s <= t; s++) {
    for (let x = -(t - s); x <= t - s; x++) {
      for (let m = 0; m < 8; m++) {
        const l = (m >> 2) & 1, c = (m >> 1) & 1, r = m & 1;
        const y = tab[4 * l + 2 * c + r];
        // forbid (l,c,r) together with y' = 1-y
        // (l != L) or (c != C) or (r != R) or (y == Y).  The last literal is POSITIVE
        // when Y = 1: writing `y === 0` here encodes the complement of the rule, and
        // the whole formula then propagates just as happily to the wrong picture.
        clauses.push([lit(s - 1, x - 1, !l), lit(s - 1, x, !c), lit(s - 1, x + 1, !r), lit(s, x, y === 1)]);
      }
    }
  }
  // No answer clause. The check is stronger without one: if pure unit propagation
  // assigns EVERY cell and agrees with the picture, then "cell(t,0) = b" has a
  // unit-propagation derivation of exactly this many steps, and adding the
  // negation of b makes the formula refutable in one more step.
  const truth = rows[t][off];

  // pure unit propagation
  const val = new Int8Array(nv + 1);        // 0 unknown, 1 true, -1 false
  const occ = new Map();
  for (let ci = 0; ci < clauses.length; ci++) for (const L of clauses[ci]) {
    const v = Math.abs(L);
    if (!occ.has(v)) occ.set(v, []);
    occ.get(v).push(ci);
  }
  const queue = [];
  let props = 0, conflict = false;
  const assign = (v, s) => {
    if (val[v] === s) return true;
    if (val[v] === -s) { conflict = true; return false; }
    val[v] = s; props++; queue.push(v); return true;
  };
  const scan = (ci) => {
    let unassigned = 0, last = 0;
    for (const L of clauses[ci]) {
      const v = Math.abs(L), s = L > 0 ? 1 : -1;
      if (val[v] === s) return;              // satisfied
      if (val[v] === 0) { unassigned++; last = L; }
    }
    if (unassigned === 0) { conflict = true; return; }
    if (unassigned === 1) assign(Math.abs(last), last > 0 ? 1 : -1);
  };
  for (let ci = 0; ci < clauses.length && !conflict; ci++) scan(ci);
  while (queue.length && !conflict) {
    const v = queue.shift();
    for (const ci of occ.get(v) ?? []) { scan(ci); if (conflict) break; }
  }
  // does the propagated assignment equal the actual picture, cell for cell?
  let agree = true;
  for (let s = 0; s <= t && agree; s++) for (let x = -(t - s); x <= t - s; x++) {
    const want = rows[s][x + off] === 1 ? 1 : -1;
    if (val[id.get(key(s, x))] !== want) { agree = false; break; }
  }
  return { nv, nc: clauses.length, props, conflict, truth, agree };
}

// ---------------------------------------------------------------- [B] causal certificate
function certificate(rule, t) {
  const { rows, off } = picture(rule, t);
  const tab = table(rule);
  // A MINIMUM SUFFICIENT PARENT SET, which is the sound notion. "flipping this
  // parent changes the output" is NOT sound: for rule 30 at a cell whose centre and
  // right parents are both black, flipping either one alone changes nothing
  // (1 or 1 = 1 or 0 = 0 or 1), so the flip test drops both and keeps only the left
  // parent -- but then nothing in the certificate witnesses that the OR was
  // satisfied. So: enumerate the 8 subsets, keep those that DETERMINE the output
  // over all assignments agreeing on the subset, take a smallest one, and among
  // smallest prefer parents already in the certificate.
  function minSufficient(l, c, r, alreadyMarked) {
    const y = tab[4 * l + 2 * c + r];
    const act = [l, c, r];
    let best = null, bestKey = null;
    for (let S = 0; S < 8; S++) {
      let determines = true;
      for (let m = 0; m < 8 && determines; m++) {
        const v = [(m >> 2) & 1, (m >> 1) & 1, m & 1];
        let agrees = true;
        for (let i = 0; i < 3; i++) if ((S >> (2 - i)) & 1) { if (v[i] !== act[i]) { agrees = false; break; } }
        if (!agrees) continue;
        if (tab[4 * v[0] + 2 * v[1] + v[2]] !== y) determines = false;
      }
      if (!determines) continue;
      let size = 0, reused = 0;
      for (let i = 0; i < 3; i++) if ((S >> (2 - i)) & 1) { size++; if (alreadyMarked[i]) reused++; }
      const key = size * 10 - reused;
      if (bestKey === null || key < bestKey) { bestKey = key; best = S; }
    }
    return [(best >> 2) & 1, (best >> 1) & 1, best & 1].map(Boolean);
  }
  const mark = new Set();
  const k = (s, x) => s + ':' + x;
  const stack = [[t, 0]];
  mark.add(k(t, 0));
  while (stack.length) {
    const [s, x] = stack.pop();
    if (s === 0) continue;
    const l = rows[s - 1][x - 1 + off], c = rows[s - 1][x + off], r = rows[s - 1][x + 1 + off];
    const parents = [[s - 1, x - 1], [s - 1, x], [s - 1, x + 1]];
    const already = parents.map(([ps, px]) => mark.has(k(ps, px)));
    const n = minSufficient(l, c, r, already);
    for (let i = 0; i < 3; i++) if (n[i]) {
      const kk = k(parents[i][0], parents[i][1]);
      if (!mark.has(kk)) { mark.add(kk); stack.push(parents[i]); }
    }
  }
  // TWO denominators, and saying which is which is the whole point. The BACKWARD
  // cone of (t,0) is what a derivation may use: (t+1)^2 cells. The INTERSECTION
  // with the seed's forward cone is smaller, and a certificate may legitimately
  // sit outside it (white cells are still needed as witnesses), so cert/tri > 1
  // is not an error -- the backward cone is the honest denominator.
  let tri = 0;
  for (let s = 0; s <= t; s++) tri += Math.min(2 * (t - s) + 1, 2 * s + 1);
  return { cert: mark.size, tri, back: (t + 1) * (t + 1) };
}

console.log('[A] pure unit propagation on the seeded triangle CNF, no answer clause');
console.log('#   rule    t   vars=(t+1)^2   clauses   propagations   all-assigned   agrees-with-picture');
for (const rule of [30, 90, 150]) {
  for (const t of [4, 8, 16, 32, 64, 128]) {
    const r = upCheck(rule, t);
    console.log(`${String(rule).padStart(7)} ${String(t).padStart(4)} ${String(r.nv).padStart(14)} ${String(r.nc).padStart(9)} ` +
      `${String(r.props).padStart(14)} ${String(r.props === r.nv).padStart(14)} ${String(r.agree).padStart(21)}`);
  }
}
console.log('');

console.log('[B] causal certificate: cells a derivation of cell(t,0) actually needs.');
console.log('    Denominator is the BACKWARD cone of (t,0), which is (t+1)^2 cells.');
console.log('# rule     t     cert   backward-cone   cert/back   fwd-cap-tri');
for (const rule of [30, 90, 150, 45, 110, 86]) {
  for (const t of [16, 64, 256, 1024]) {
    const r = certificate(rule, t);
    console.log(`${String(rule).padStart(5)} ${String(t).padStart(6)} ${String(r.cert).padStart(8)} ${String(r.back).padStart(15)}   ` +
      `${(r.cert / r.back).toFixed(4).padStart(9)}   ${String(r.tri).padStart(11)}`);
  }
  console.log('');
}
