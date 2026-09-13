// Astrolabe, 2026-09-13. Is the rung-2 alternation family's refutation
// exponential, or only its TREE-LIKE refutation?
//
// astrolabe2_tree.mjs measures the tree-like refutation (a DFS deciding the free
// row-0 cells left to right): node count 146, 512, 2932, 12822, 102362, 293728
// at a = 2,4,6,8,10,12, i.e. about 2.35^a. Tree-like resolution size for this
// family is therefore exponential in a. General (DAG-like) resolution can reuse
// derived clauses, and that is what a lower bound would have to beat.
//
// THE STATE. Having assigned row-0 cells x = -a .. k, a triangle cell (s,x') is
// determined exactly when s + x' <= k (its light cone lies inside the assigned
// cells, with white to the left of -a). So the frontier is the anti-diagonal
// s + x' = k. Rule 30 reads three cells one row up, so advancing the frontier by
// one needs the TWO previous anti-diagonals -- this is the right-diagonal
// recurrence's two-term form. Hence the pair (A_{k-1}, A_k), truncated to the
// depths we still care about, DETERMINES the whole future: two survivors sharing
// it produce identical column bits under every continuation.
//
// So counting distinct such pairs per level is an exact measurement of the width
// of the natural DAG-like refutation, and its sum is an upper bound on DAG-like
// refutation size. If the width stays small, no exponential DAG-like lower bound
// exists for this family and the tree-like blow-up is an artefact of tree-likeness.

const RULES = [30, 120, 180];

function table(r) {
  const t = new Uint8Array(8);
  for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1;
  return t;
}

// Exhaustive forward simulation, used only to validate the frontier recurrence.
function centreColumnRef(tab, a, cells, L) {
  const R = cells.length - 1 - a;
  const pad = L + 2;
  const W = a + R + 1 + 2 * pad;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let j = 0; j < cells.length; j++) cur[j + pad] = cells[j];
  const out = [];
  for (let t = 0; t <= L; t++) {
    out.push(cur[a + pad]);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return out;
}

// Frontier representation. A_k[s] = cell(s, k - s), for s = 0 .. S, where cells
// with k - s < -a are white and rows beyond the cap are not tracked.
// Advance: A_{k+1}[s] = rule( cell(s-1, k-s), cell(s-1, k+1-s), cell(s-1, k+2-s) )
//                     = rule( A_{k-1}[s-1],   A_k[s-1],         A_{k+1}[s-1]    ).
// So the new anti-diagonal is built top-down from its own previous entry, which
// is why (A_{k-1}, A_k) is the state and one anti-diagonal is not enough.
function advance(tab, Aprev, Acur, newCell, S) {
  const Anew = new Uint8Array(S + 1);
  Anew[0] = newCell;                       // cell(0, k+1) is the row-0 cell just assigned
  for (let s = 1; s <= S; s++) {
    const l = Aprev[s - 1] ?? 0;           // cell(s-1, k-s)
    const c = Acur[s - 1] ?? 0;            // cell(s-1, k+1-s)
    const r = Anew[s - 1];                 // cell(s-1, k+2-s)
    Anew[s] = tab[4 * l + 2 * c + r];
  }
  return Anew;
}

// [V] validate the frontier recurrence against forward simulation.
function validate(rule, a, trials, L) {
  const tab = table(rule);
  let bad = 0, checked = 0;
  for (let n = 0; n < trials; n++) {
    const R = L;                            // assign cells -a .. L
    const cells = [];
    for (let j = 0; j <= a + R; j++) cells.push(Math.random() < 0.5 ? 1 : 0);
    const col = centreColumnRef(tab, a, cells, L);
    // run the frontier from k = -a-1 (both anti-diagonals all white)
    let Aprev = new Uint8Array(L + 1), Acur = new Uint8Array(L + 1);
    const bits = [];
    for (let j = 0; j <= a + R; j++) {
      const Anew = advance(tab, Aprev, Acur, cells[j], L);
      Aprev = Acur; Acur = Anew;
      const k = j - a;
      if (k >= 0) bits.push(Acur[k]);       // cell(k, 0) sits at s = k on frontier k
    }
    for (let t = 0; t < bits.length && t <= L; t++) {
      checked++;
      if (bits[t] !== col[t]) bad++;
    }
  }
  return { bad, checked };
}

// [W] the DAG width: BFS over states, level by level, keeping only survivors
// whose determined column bits match the alternating target.
function dagWidth(rule, a, startBit, capL) {
  const tab = table(rule);
  const S = capL;
  let states = new Map();
  const key = (p, c) => p.join('') + '|' + c.join('');
  const z = new Uint8Array(S + 1);
  states.set(key(z, z), [z, z]);
  const widths = [];
  let total = 0, best = 0;
  for (let j = 0; j <= a + capL; j++) {
    const k = j - a;
    const next = new Map();
    for (const [, [Aprev, Acur]] of states) {
      for (let v = 0; v < 2; v++) {
        const Anew = advance(tab, Aprev, Acur, v, S);
        if (k >= 0) {
          const bit = Anew[k];
          if (bit !== ((k + startBit) & 1)) continue;
        }
        const kk = key(Acur, Anew);
        if (!next.has(kk)) next.set(kk, [Acur, Anew]);
      }
    }
    states = next;
    if (states.size === 0) break;
    if (k >= 0) { widths.push(states.size); best = k + 1; }
    total += states.size;
  }
  return { widths, total, best, alive: states.size };
}

console.log('[V] frontier recurrence vs forward simulation (rule, a, bad/checked)');
for (const rule of RULES) {
  for (const a of [3, 6, 9]) {
    const r = validate(rule, a, 60, 24);
    console.log(`   rule ${rule}  a=${a}  ${r.bad} / ${r.checked}` + (r.bad ? '   MISMATCH' : '   ok'));
  }
}
console.log('');

console.log('[W] DAG width of the alternation refutation (states per level), rule 30');
for (const a of [2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40]) {
  let best = 0, maxw = 0, total = 0;
  for (const s of [0, 1]) {
    const r = dagWidth(30, a, s, 70);
    best = Math.max(best, r.best);
    maxw = Math.max(maxw, Math.max(0, ...r.widths));
    total += r.total;
  }
  console.log(`   a=${String(a).padStart(3)}  f(a)=${String(best).padStart(3)}  max width=${String(maxw).padStart(7)}  sum of widths=${String(total).padStart(8)}`);
}
console.log('');

console.log('[W2] width profile at a = 20, phase 0');
{
  const r = dagWidth(30, 20, 0, 70);
  console.log('   ' + r.widths.join(' '));
}
console.log('');

console.log('[W3] the same width, rules 120 and 180 (the controls that can fire)');
for (const rule of [120, 180]) {
  for (const a of [8, 16, 24, 32, 40]) {
    let best = 0, maxw = 0, total = 0;
    for (const s of [0, 1]) {
      const r = dagWidth(rule, a, s, 70);
      best = Math.max(best, r.best);
      maxw = Math.max(maxw, Math.max(0, ...r.widths));
      total += r.total;
    }
    console.log(`   rule ${rule}  a=${String(a).padStart(3)}  f(a)=${String(best).padStart(3)}  max width=${String(maxw).padStart(7)}  sum=${String(total).padStart(8)}`);
  }
}
