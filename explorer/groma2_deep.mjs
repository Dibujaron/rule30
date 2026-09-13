// Groma, 2026-09-13. The cheapest way to break my own section 3.2: push the
// cone search on KZ rung 2 (and 3) to larger cone distance a.
//
// The board's obstruction "The cone sees exactly the zero-entropy targets"
// records that the 00-free target is exhaustively finite at small a and has a
// THRESHOLD at a* = 5, above which the surviving population never dies. So
// "finite at a <= 8" is worth very little on its own; what would make the KZ
// result worth a theorist's session is finiteness well past any threshold the
// occurrence targets show.
//
// Depth-first, with undo, so memory is O(depth) rather than O(population) and
// the search can run to a = 16 instead of a = 8.
//
// f(n, a) = the longest centre-column prefix, over configurations white at
// x < -a and black at x = -a, in which EVERY n-window sees < 2n patterns.

const LMAX = 60;

function makeRung(n, TARGET, maxLen) {
  const W = [];
  const rec = (pref, next) => {
    if (pref.length === n) { W.push(pref.slice()); return; }
    for (let d = next; d <= maxLen - 1; d++) { pref.push(d); rec(pref, d + 1); pref.pop(); }
  };
  if (n === 1) W.push([0]); else rec([0], 1);
  const nw = W.length;
  const bySpan = [];
  for (let s = 0; s < maxLen; s++) bySpan.push([]);
  const look = [];
  for (let q = 0; q < nw; q++) {
    bySpan[W[q][n - 1]].push(q);
    look.push(Int32Array.from(W[q].map((d) => W[q][n - 1] - d)));
  }
  const bySpanA = bySpan.map((l) => Int32Array.from(l));
  const pc = new Uint8Array(1 << (1 << n));
  for (let i = 1; i < pc.length; i++) pc[i] = pc[i >> 1] + (i & 1);
  return { nw, bySpanA, look, pc, n, TARGET };
}

function ruleTable(rule) {
  const t = new Uint8Array(8);
  for (let i = 0; i < 8; i++) t[i] = (rule >> i) & 1;
  return t;
}

function initDiagonals(tab, a, leftBits, L) {
  const pad = L + 3, W = pad + a + 1 + pad;
  let row = new Uint8Array(W);
  for (let i = 0; i <= a; i++) row[pad + i] = leftBits[i];
  const origin = pad + a;
  const B = new Uint8Array(L + 2), C = new Uint8Array(L + 2);
  for (let t = 0; t <= L + 1; t++) {
    B[t] = origin - t >= 0 ? row[origin - t] : 0;
    C[t] = origin - t - 1 >= 0 ? row[origin - t - 1] : 0;
    const nxt = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * row[i - 1] + 2 * row[i] + row[i + 1]];
    row = nxt;
  }
  return { B, C };
}

function search(rule, n, TARGET, a, nodeCap) {
  const tab = ruleTable(rule);
  const R = makeRung(n, TARGET, LMAX + 2);
  const DEPTH = LMAX + 2;
  // preallocated stacks
  const Bs = [], Cs = [];
  for (let d = 0; d <= DEPTH + 1; d++) { Bs.push(new Uint8Array(DEPTH + 2)); Cs.push(new Uint8Array(DEPTH + 2)); }
  const hist = new Uint8Array(DEPTH + 2);
  const masks = new Uint32Array(R.nw);
  const undoQ = new Int32Array(2 * R.nw), undoV = new Int32Array(2 * R.nw);
  let best = 0, nodes = 0, hitCap = false, hitDepth = false;

  // apply the rung step at index i; returns the number of undo entries, or -1
  function step(i, undoBase) {
    let u = undoBase;
    for (let s = 0; s <= i; s++) {
      const list = R.bySpanA[s];
      for (let z = 0; z < list.length; z++) {
        const q = list[z], lk = R.look[q];
        let code = 0;
        for (let r = 0; r < R.n; r++) code = (code << 1) | hist[i - lk[r]];
        const bit = 1 << code, old = masks[q];
        if (old & bit) continue;
        const m = old | bit;
        if (R.pc[m] >= R.TARGET) { for (let z2 = u - 1; z2 >= undoBase; z2--) masks[undoQ[z2]] = undoV[z2]; return -1; }
        masks[q] = m; undoQ[u] = q; undoV[u] = old; u++;
      }
    }
    return u;
  }
  function unstep(from, to) { for (let z = to - 1; z >= from; z--) masks[undoQ[z]] = undoV[z]; }

  // K = index of the last row-0 cell fixed on the right; depth index d = K+1
  function rec(K, undoBase) {
    if (++nodes > nodeCap) { hitCap = true; return; }
    if (K + 1 > best) best = K + 1;
    if (K + 1 >= LMAX) { hitDepth = true; return; }
    const B = Bs[K], C = Cs[K];
    for (let b = 0; b <= 1; b++) {
      const Bn = Bs[K + 1], Cn = Cs[K + 1];
      Bn[0] = b;
      for (let t = 1; t <= DEPTH + 1; t++) Bn[t] = tab[4 * C[t - 1] + 2 * B[t - 1] + Bn[t - 1]];
      Cn.set(B);
      hist[K + 1] = Bn[K + 1];
      const u = step(K + 1, undoBase);
      if (u >= 0) { rec(K + 1, u); unstep(undoBase, u); }
      if (hitCap) return;
    }
  }

  for (let v = 0; v < (1 << a); v++) {
    const left = new Uint8Array(a + 1);
    left[0] = 1;
    for (let i = 0; i < a; i++) left[1 + i] = (v >> i) & 1;
    const { B, C } = initDiagonals(tab, a, left, DEPTH);
    Bs[0].set(B.subarray(0, DEPTH + 2));
    Cs[0].set(C.subarray(0, DEPTH + 2));
    hist[0] = Bs[0][0];
    masks.fill(0);
    const u = step(0, 0);
    if (u >= 0) rec(0, u);
    if (hitCap) break;
  }
  return { f: best, nodes, hitCap, hitDepth };
}

// validation, same as before: the incremental evolution must reproduce the seed
{
  const tab = ruleTable(30);
  let { B, C } = initDiagonals(tab, 0, Uint8Array.from([1]), 40);
  const got = [B[0]];
  for (let K = 0; K < 21; K++) {
    const Bn = new Uint8Array(B.length);
    Bn[0] = 0;
    for (let t = 1; t < B.length; t++) Bn[t] = tab[4 * C[t - 1] + 2 * B[t - 1] + Bn[t - 1]];
    C = B; B = Bn; got.push(B[K + 1]);
  }
  const want = '1101110011000101100100';
  console.log(`[validation] incremental evolution vs the seed's centre column: ${got.join('') === want ? 'MATCH' : '*** MISMATCH ***'}`);
  console.log(`   got  ${got.join('')}\n   want ${want}`);
}

const NODECAP = 3.0e8;
console.log(`\nf(n, a) by depth-first search, node cap ${NODECAP.toExponential(1)}, depth cap ${LMAX}`);
console.log('  "cap" = the node budget ran out, so f is a LOWER bound and the target may escape.');
for (const [rule, n, TARGET] of [[30, 2, 4], [30, 3, 6], [90, 2, 4]]) {
  const row = [];
  for (let a = 1; a <= 18; a++) {
    const t0 = Date.now();
    const r = search(rule, n, TARGET, a, NODECAP);
    row.push(`${a}:${r.f}${r.hitCap ? 'cap' : ''}${r.hitDepth ? 'DEPTH' : ''}`);
    process.stdout.write(`  rule ${rule} rung ${n}: a=${a} f=${r.f} nodes=${r.nodes}${r.hitCap ? ' CAP' : ''}${r.hitDepth ? ' DEPTHCAP' : ''} (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);
    if (r.hitCap || r.hitDepth) break;
  }
  console.log(`  => rule ${rule}, KZ rung ${n}:  ${row.join(' ')}\n`);
}
