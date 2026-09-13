// Astrolabe, 2026-09-13. Validate the frontier recurrence for the AFFINE rules,
// which astrolabe2_dag.mjs's [V] block never covered -- it checked rules 30, 120
// and 180 only, and dag3 then reported f(6) = 19 for rule 60 where brute force
// (astrolabe2_check60.mjs) says 26 or more. One of the two is wrong.

function table(r) { const t = new Uint8Array(8); for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1; return t; }

function advance(tab, Ap, Ac, v, L) {
  const An = new Uint8Array(L + 1);
  An[0] = v;
  for (let s = 1; s <= L; s++) An[s] = tab[4 * Ap[s - 1] + 2 * Ac[s - 1] + An[s - 1]];
  return An;
}

function column(tab, a, R, bitsArr, L) {
  const pad = L + 3, W = a + R + 1 + 2 * pad;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let j = 0; j <= a + R; j++) cur[j + pad] = bitsArr[j];
  const zero = a + pad, out = [];
  for (let t = 0; t < L; t++) {
    out.push(cur[zero]);
    for (let i = 1; i < W - 1; i++) nxt[i] = tab[4 * cur[i - 1] + 2 * cur[i] + cur[i + 1]];
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return out;
}

console.log('# frontier recurrence vs forward simulation, per rule (bad/checked)');
for (const rule of [30, 60, 90, 120, 150, 180, 210, 240]) {
  const tab = table(rule);
  const a = 6, R = 20, L = 20;
  let bad = 0, checked = 0, firstBad = null;
  for (let n = 0; n < 200; n++) {
    const cells = [];
    for (let j = 0; j <= a + R; j++) cells.push(Math.random() < 0.5 ? 1 : 0);
    const col = column(tab, a, R, cells, L);
    let Ap = new Uint8Array(L + 1), Ac = new Uint8Array(L + 1);
    const bits = [];
    for (let j = 0; j <= a + R; j++) {
      const An = advance(tab, Ap, Ac, cells[j], L);
      Ap = Ac; Ac = An;
      const k = j - a;
      if (k >= 0 && k < L) bits.push(Ac[k]);
    }
    for (let t = 0; t < Math.min(bits.length, L); t++) {
      checked++;
      if (bits[t] !== col[t]) { bad++; if (firstBad === null) firstBad = t; }
    }
  }
  console.log(`   rule ${String(rule).padStart(3)}   ${String(bad).padStart(6)} / ${checked}` +
    (bad ? `   MISMATCH, first at t = ${firstBad}` : '   ok'));
}
console.log('');

// The frontier state must carry enough DEPTH. Reading bit k needs frontier depth k,
// and advancing to depth k needs the previous frontiers to depth k-1 -- but the
// TRUNCATION at depth L throws away depths > L, and depth-s entries at s > L are
// never needed. That is sound. The other truncation is the array LENGTH: does
// An[s] for s <= L depend on anything beyond index L-1? No. So test the real
// suspect instead: does the answer change if the arrays are made longer?
console.log('# does the frontier BFS answer depend on the state DEPTH it carries?');
function run(rule, a, startBit, L, depth) {
  const tab = table(rule);
  const D = depth;
  const z = new Uint8Array(D + 1);
  let states = new Map([['z', [z, z]]]);
  let reached = 0;
  for (let j = 0; j <= a + L; j++) {
    const k = j - a;
    if (k >= L) break;
    const next = new Map();
    for (const [, [Ap, Ac]] of states) {
      for (let v = 0; v < 2; v++) {
        const An = advance(tab, Ap, Ac, v, D);
        if (k >= 0 && An[k] !== ((k + startBit) & 1)) continue;
        const kk = Ac.join('') + '|' + An.join('');
        if (!next.has(kk)) next.set(kk, [Ac, An]);
      }
    }
    states = next;
    if (states.size === 0) return false;
    if (k >= 0) reached = k + 1;
  }
  return reached >= L;
}
for (const rule of [60, 90, 150, 240, 30]) {
  const row = [];
  for (const L of [8, 12, 16, 20, 26]) {
    const sat = run(rule, 6, 0, L, L) || run(rule, 6, 1, L, L);
    row.push(`L=${L}:${sat ? 'SAT' : 'unsat'}`);
  }
  console.log(`   rule ${String(rule).padStart(3)}  ${row.join('  ')}`);
}
