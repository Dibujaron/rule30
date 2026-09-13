// Astrolabe, 2026-09-13. The rung-2 alternation family read as a propositional
// refutation, and measured across the left-permutive elementary rules.
//
// THE FAMILY (obstruction 29/30/35's object). Fix a. Row 0 is white at every
// x < -a and free from x = -a rightwards. Ask that the centre column alternate
// (be {00,11}-free) for L steps from time 0. f(a) is the largest satisfiable L;
// at L = f(a)+1 the family is unsatisfiable, and THAT is the t-indexed
// unsatisfiable formula family the proof-complexity vantage is about.
//
// WHY A DFS TREE IS A PROOF-COMPLEXITY MEASUREMENT. Cell (t,0) reads only row-0
// cells in [-t, t], so once cells -a .. k are assigned, column bit k is
// determined by forward simulation alone -- i.e. by unit propagation on the CNF
// whose extension variables are the triangle cells. So a DFS that decides ONLY
// the free row-0 cells, left to right, and propagates after each decision, is a
// tree-like resolution refutation of that CNF. Its node count bounds tree-like
// resolution SIZE from above and its depth bounds resolution WIDTH from above.
//
// THE CONTROL. The brief names rules 90 and 150. They are left-permutive and
// AFFINE. Obstruction 34 says the four affine left-permutive rules run past
// every cap; this script measures that from the refutation side, and measures
// the eleven nonaffine left-permutive rules as the control that can actually
// fire.

const CAP_L = 90;          // depth cap on the block length
const NODE_CAP = 4_000_000; // node cap per (rule, a, phase)

function table(r) {
  const t = new Uint8Array(8);
  for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1;
  return t;
}

// left-permutive: flipping the left neighbour always flips the output.
function isLeftPermutive(r) {
  const t = table(r);
  for (let c = 0; c < 2; c++) for (let rr = 0; rr < 2; rr++) {
    if (t[4 + 2 * c + rr] === t[2 * c + rr]) return false;
  }
  return true;
}
// quiescent: all-white maps to all-white, so the cone exists.
function isQuiescent(r) { return table(r)[0] === 0; }
// affine: the rule is a XOR of its three arguments and a constant.
function isAffine(r) {
  const t = table(r);
  const c0 = t[0];
  const cl = t[4] ^ c0, cc = t[2] ^ c0, cr = t[1] ^ c0;
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let rr = 0; rr < 2; rr++) {
    if (t[4 * l + 2 * c + rr] !== (c0 ^ (l & cl) ^ (c & cc) ^ (rr & cr))) return false;
  }
  return true;
}

// Build the triangle from an assignment of row-0 cells x in [-a, R], white left of -a
// and white right of R, and read the centre column. Only used inside the DFS via
// incremental simulation, so this is the reference implementation for validation.
function centreColumnRef(tab, a, cells, L) {
  const R = cells.length - 1 - a;      // rightmost assigned index is x = R
  const pad = L + 2;
  const W = a + R + 1 + 2 * pad;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  const idx = (x) => x + a + pad;
  for (let j = 0; j < cells.length; j++) cur[j + pad] = cells[j];
  const out = [];
  for (let t = 0; t <= L; t++) {
    out.push(cur[idx(0)]);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return out;
}

// The DFS. Decide cells x = -a, -a+1, ... in order. After deciding cell x = k with
// k >= 0, column bit k is determined; check it against the target.
// Returns { best, nodes, maxDepth, hitCap } where best is the longest verified block.
function search(rule, a, startBit, capL) {
  const tab = table(rule);
  // A full triangle recomputation per node is O(L^2); with the node counts here
  // that is affordable and it is the implementation least likely to be wrong.
  let best = 0, nodes = 0, maxDepth = 0, hitCap = false;
  const cells = [];          // cells[j] is the cell at x = j - a
  function target(t) { return (t + startBit) & 1; }

  function rec(j) {          // about to assign cells[j], i.e. x = j - a
    if (hitCap) return;
    if (nodes > NODE_CAP) { hitCap = true; return; }
    const x = j - a;
    if (x > capL) { hitCap = true; return; }
    for (let v = 0; v < 2; v++) {
      nodes++;
      cells[j] = v;
      if (j > maxDepth) maxDepth = j;
      let ok = true;
      if (x >= 0) {
        const col = centreColumnRef(tab, a, cells, x);
        for (let t = 0; t <= x; t++) if (col[t] !== target(t)) { ok = false; break; }
        if (ok && x + 1 > best) best = x + 1;   // bits 0..x verified: block length x+1
      }
      if (ok) rec(j + 1);
    }
    cells.length = j;
  }
  rec(0);
  return { best, nodes, maxDepth, hitCap };
}

const LP = [];
for (let r = 0; r < 256; r++) if (isLeftPermutive(r) && isQuiescent(r)) LP.push(r);
console.log('# quiescent left-permutive rules:', LP.join(', '));
console.log('# affine among them:', LP.filter(isAffine).join(', '));
console.log('');

// [A] rule 30, reproduce obstruction 29's published f(a) table.
console.log('[A] rule 30, f(a) = max over both phases, relaxed class (cell at -a free)');
console.log('# a   f(a)   nodes(both phases)   maxdepth   capped');
const pub = [8,8,8,8,9,10,10,17,17,17,17,17,17,20,22,26,26,26,36,36,36,36,36,36,36,36];
for (let a = 1; a <= 22; a++) {
  let f = 0, nodes = 0, md = 0, cap = false;
  for (const s of [0, 1]) {
    const r = search(30, a, s, CAP_L);
    f = Math.max(f, r.best); nodes += r.nodes; md = Math.max(md, r.maxDepth); cap = cap || r.hitCap;
  }
  const mark = a <= pub.length ? (f === pub[a - 1] ? 'ok' : `MISMATCH pub=${pub[a-1]}`) : '';
  console.log(`${String(a).padStart(3)} ${String(f).padStart(6)} ${String(nodes).padStart(20)} ${String(md).padStart(10)}   ${cap ? 'CAP' : '-'}  ${mark}`);
}
console.log('');

// [B] the same family under every quiescent left-permutive rule.
console.log('[B] f(a) and refutation tree size by rule, a = 6');
console.log('# rule  affine   f(6)   nodes   maxdepth   capped');
for (const rule of LP) {
  let f = 0, nodes = 0, md = 0, cap = false;
  for (const s of [0, 1]) {
    const r = search(rule, 6, s, CAP_L);
    f = Math.max(f, r.best); nodes += r.nodes; md = Math.max(md, r.maxDepth); cap = cap || r.hitCap;
  }
  console.log(`${String(rule).padStart(5)} ${String(isAffine(rule)).padStart(7)} ${String(f).padStart(7)} ${String(nodes).padStart(9)} ${String(md).padStart(10)}   ${cap ? 'CAP' : '-'}`);
}
console.log('');

// [C] growth of the refutation tree in a, for the nonaffine rules that terminate.
console.log('[C] tree size and depth vs a, for the nonaffine left-permutive rules');
console.log('# rule   a   f(a)   nodes   maxdepth   capped');
for (const rule of LP.filter(r => !isAffine(r))) {
  for (let a = 2; a <= 12; a += 2) {
    let f = 0, nodes = 0, md = 0, cap = false;
    for (const s of [0, 1]) {
      const r = search(rule, a, s, CAP_L);
      f = Math.max(f, r.best); nodes += r.nodes; md = Math.max(md, r.maxDepth); cap = cap || r.hitCap;
    }
    console.log(`${String(rule).padStart(5)} ${String(a).padStart(4)} ${String(f).padStart(6)} ${String(nodes).padStart(9)} ${String(md).padStart(10)}   ${cap ? 'CAP' : '-'}`);
    if (cap) break;
  }
}
