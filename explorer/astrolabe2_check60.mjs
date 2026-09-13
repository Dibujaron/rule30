// Astrolabe, 2026-09-13. astrolabe2_tree.mjs and astrolabe2_dag3.mjs disagree on
// rule 60: f(6) = 91 (capped) against 19. One of them is wrong and I cite the
// number, so: brute force, by direct simulation over every assignment of the cells
// that can matter, with no frontier and no pruning.
//
// For rule 60 = l XOR c the column reads only cells at x <= 0 (cell(t,x) is a sum
// of binomials times row0(x-k)), so beyond the assigned left block nothing can
// steer it -- which predicts a BOUNDED f and makes the 91 suspect. Predictions are
// not measurements, so this enumerates.

function table(r) { const t = new Uint8Array(8); for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1; return t; }

// column bits 0..L-1 from an explicit assignment of cells x = -a .. R, white outside
function column(tab, a, R, bits, L) {
  const pad = L + 3;
  const W = a + R + 1 + 2 * pad;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let j = 0; j <= a + R; j++) cur[j + pad] = (bits >>> j) & 1;
  const zero = a + pad;                    // index of x = 0
  const out = [];
  for (let t = 0; t < L; t++) {
    out.push(cur[zero]);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return out;
}

// longest alternating prefix achievable, over all assignments of cells -a .. R
function brute(rule, a, R, startBit, L) {
  const tab = table(rule);
  const N = 1 << (a + R + 1);
  let best = 0;
  for (let m = 0; m < N; m++) {
    const col = column(tab, a, R, m, L);
    let k = 0;
    while (k < L && col[k] === ((k + startBit) & 1)) k++;
    if (k > best) { best = k; if (best === L) break; }
  }
  return best;
}

console.log('# brute force: longest alternating centre-column prefix, cells x = -a..R free');
console.log('# rule   a    R   phase0   phase1   max      (L cap = 26)');
for (const rule of [60, 240, 90, 150, 30]) {
  for (const a of [6]) {
    for (const R of [6, 10, 14]) {
      const b0 = brute(rule, a, R, 0, 26), b1 = brute(rule, a, R, 1, 26);
      console.log(`${String(rule).padStart(5)} ${String(a).padStart(4)} ${String(R).padStart(4)} ${String(b0).padStart(8)} ${String(b1).padStart(8)} ${String(Math.max(b0, b1)).padStart(5)}`);
    }
  }
}
console.log('');
console.log('# and for rule 60, which cells does the column actually read?');
{
  const tab = table(60), a = 6, R = 10, L = 12;
  const base = column(tab, a, R, 0b0, L);
  const seen = [];
  for (let j = 0; j <= a + R; j++) {
    const col = column(tab, a, R, 1 << j, L);
    let differs = false;
    for (let t = 0; t < L; t++) if (col[t] !== base[t]) differs = true;
    if (differs) seen.push(j - a);
  }
  console.log('   cells x whose flip changes some column bit t < 12:', seen.join(' '));
}
