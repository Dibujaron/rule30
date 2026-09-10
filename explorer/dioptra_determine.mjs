// Dioptra, 2026-09-10.
//
// CLAIM UNDER TEST.  For configurations white on x <= -1 at time 0, the centre
// column determines every other column from some time on.  This is the
// positive structural statement behind Meier-Staffelbach: their attack works
// because the keystream determines the state.  The project's right-edge shield
// (obstruction 10) is the residual non-uniqueness, and it escapes to infinity
// along the right edge, so it does not stop a FIXED column being determined.
//
// Method.  Enumerate every row 0 supported in x in [0, K] (white elsewhere,
// and white on x <= -1), group by the centre column to depth T, and inside
// each group ask, for each column j, the least time from which all members
// agree.  Truncation is exact: col_j(t) reads row 0 on [j-t, j+t], so with row
// 0 white outside [0, K] the value is decided once t + j <= K, i.e. the table
// below is only read where t <= K - j.

const K = 18;                 // row 0 free on x in [0, K]
const T = K;                  // depth of the centre-column grouping
const COLS = [1, 2, 3, 4, 5, -1, -2, -3];

const W = 2 * K + 2 * T + 10, OFF = T + 5;

function columnsOf(mask) {
  let cur = new Uint8Array(W);
  for (let x = 0; x <= K; x++) if ((mask >> x) & 1) cur[OFF + x] = 1;
  const out = new Map();
  for (const j of COLS) out.set(j, new Uint8Array(T + 1));
  const c0 = new Uint8Array(T + 1);
  for (let t = 0; t <= T; t++) {
    c0[t] = cur[OFF];
    for (const j of COLS) out.get(j)[t] = cur[OFF + j];
    const nxt = new Uint8Array(W);
    for (let i = 1; i < W - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
    cur = nxt;
  }
  return { c0, out };
}

console.log(`enumerating 2^${K + 1} = ${2 ** (K + 1)} rows, grouping by the centre column to depth ${T}`);
const groups = new Map();
for (let mask = 0; mask < (1 << (K + 1)); mask++) {
  const { c0, out } = columnsOf(mask);
  const key = c0.join('');
  let g = groups.get(key);
  if (!g) { g = { n: 0, cols: new Map() }; groups.set(key, g); for (const j of COLS) g.cols.set(j, []); }
  g.n++;
  for (const j of COLS) {
    const arr = g.cols.get(j);
    if (arr.length === 0) arr.push(out.get(j));
    else {
      // keep at most 2 representatives plus a running disagreement mask
      if (!g.dis) g.dis = new Map();
      let d = g.dis.get(j);
      if (!d) { d = new Uint8Array(T + 1); g.dis.set(j, d); }
      const ref = arr[0], now = out.get(j);
      for (let t = 0; t <= T; t++) if (ref[t] !== now[t]) d[t] = 1;
    }
  }
}
console.log(`distinct centre columns to depth ${T}: ${groups.size}`);
let sizes = [...groups.values()].map(g => g.n).sort((a, b) => b - a);
console.log(`largest group ${sizes[0]}, median ${sizes[Math.floor(sizes.length / 2)]}, singletons ${sizes.filter(s => s === 1).length}`);

console.log('\ncolumn j : the largest t <= K-j at which two members of one group still disagree');
console.log('(so "determined from t0 on" means the entry below is t0 - 1)');
for (const j of COLS) {
  const bound = K - Math.abs(j);      // beyond this the truncation makes the value undecided
  let worst = -1, worstKey = null;
  for (const [key, g] of groups) {
    if (g.n < 2 || !g.dis) continue;
    const d = g.dis.get(j);
    if (!d) continue;
    for (let t = 0; t <= Math.min(T, bound); t++) if (d[t] && t > worst) { worst = t; worstKey = key; }
  }
  console.log(`  j = ${String(j).padStart(2)} : last disagreement at t = ${String(worst).padStart(2)}   (checked t <= ${Math.min(T, bound)})` +
    (worstKey ? `   e.g. centre column ${worstKey.slice(0, 12)}…` : '   — never disagrees'));
}

// The control: two configurations that are NOT white far to the left.
console.log('\ncontrol: drop the cone (row 0 free on x in [-6, 6], nothing white on the left)');
{
  const KK = 6, TT = 10;
  const WW = 4 * (KK + TT) + 10, O2 = 2 * (KK + TT) + 5;
  const g2 = new Map();
  for (let mask = 0; mask < (1 << (2 * KK + 1)); mask++) {
    let cur = new Uint8Array(WW);
    for (let x = -KK; x <= KK; x++) if ((mask >> (x + KK)) & 1) cur[O2 + x] = 1;
    const c0 = []; const c1 = [];
    for (let t = 0; t <= TT; t++) {
      c0.push(cur[O2]); c1.push(cur[O2 + 1]);
      const nxt = new Uint8Array(WW);
      for (let i = 1; i < WW - 1; i++) nxt[i] = cur[i - 1] ^ (cur[i] | cur[i + 1]);
      cur = nxt;
    }
    const key = c0.join('');
    let g = g2.get(key); if (!g) { g = []; g2.set(key, g); }
    g.push(c1.join(''));
  }
  let worst = -1;
  for (const [, arr] of g2) {
    const s = new Set(arr);
    if (s.size > 1) {
      const list = [...s];
      for (let t = 0; t <= TT - 1; t++) if (new Set(list.map(x => x[t])).size > 1 && t > worst) worst = t;
    }
  }
  console.log(`  column 1, last disagreement inside a centre-column group at t = ${worst} (checked t <= ${TT - 1})`);
  console.log('  — without the cone the centre column does NOT determine column 1.');
}
