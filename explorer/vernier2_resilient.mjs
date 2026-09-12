// Vernier, 2026-09-12. Two things.
//
// A. Martin's exhaustive-search theorem, re-run here: no elementary local rule is
//    simultaneously nonlinear and first-order correlation immune. (Quoted from
//    arXiv:2405.02875v1; checked rather than accepted.)
//
// B. The decisive control. Prize 1 and Prize 2 both carry the CONE hypothesis: the
//    configuration is white far to the left. Left-permutivity makes the centre cell
//    at time t a XOR in the window's LEFTMOST cell, which is the whole content of the
//    proved `window_count_half` (exactly half of the 2^(2t+1) windows give a black
//    centre). The cone pins that leftmost cell white. So:
//
//      for a rule that is permutive on ONE side only, pinning that side destroys the
//      free balance; for a BIPERMUTIVE rule the other permutive coordinate survives
//      and the balance is still exactly 0.
//
//    That is Leporati and Mariot's "bipermutive rules are 1-resilient" read as a
//    prediction, and it separates rule 30 from rule 86 -- its mirror -- so an
//    orientation error cannot pass it.
//
//    Family: cells 0..t, cell 0 black (leftmost black cell at the origin), cells 1..t
//    free; output = the cell at position 0 at time t, which is the centre column.

function truthTable(rule) {
  const tt = [];
  for (let i = 0; i < 8; i++) {
    const l = i & 1, c = (i >> 1) & 1, r = (i >> 2) & 1;
    tt.push((rule >> (4 * l + 2 * c + r)) & 1);
  }
  return tt;
}
function walsh(tt) {
  const n = tt.length, f = tt.map((b) => (b ? -1 : 1));
  for (let len = 1; len < n; len <<= 1)
    for (let i = 0; i < n; i += len << 1)
      for (let j = i; j < i + len; j++) { const a = f[j], b = f[j + len]; f[j] = a + b; f[j + len] = a - b; }
  return f;
}
function popc(x) { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; }

// ---------------- A. the 256-rule sweep -------------------------------------
let nonlinAndCI1 = [], bipermutive = [], ci1 = [], nonlin = [];
for (let rule = 0; rule < 256; rule++) {
  const tt = truthTable(rule), W = walsh(tt);
  let maxW = 0;
  for (let w = 0; w < 8; w++) maxW = Math.max(maxW, Math.abs(W[w]));
  const nonlinearity = 4 - maxW / 2;
  const isCI1 = [1, 2, 4].every((w) => W[w] === 0);
  const balanced = tt.reduce((s, b) => s + b, 0) === 4;
  let lp = true, rp = true;
  for (let i = 0; i < 8; i++) {
    if ((i & 1) === 0 && tt[i] === tt[i | 1]) lp = false;
    if ((i & 4) === 0 && tt[i] === tt[i | 4]) rp = false;
  }
  if (nonlinearity > 0) nonlin.push(rule);
  if (isCI1) ci1.push(rule);
  if (nonlinearity > 0 && isCI1) nonlinAndCI1.push(rule);
  if (lp && rp) bipermutive.push({ rule, balanced, isCI1, nonlinearity });
}
console.log('A. nonlinear rules:', nonlin.length,
            '| first-order correlation immune rules:', ci1.length,
            '| BOTH:', JSON.stringify(nonlinAndCI1));
console.log('A. bipermutive rules:', bipermutive.length,
            '| of those, balanced AND first-order CI (i.e. 1-resilient):',
            bipermutive.filter((b) => b.balanced && b.isCI1).length,
            '| counterexamples:', JSON.stringify(bipermutive.filter((b) => !(b.balanced && b.isCI1)).map((b) => b.rule)));
console.log('A. rule 30 bipermutive?', bipermutive.some((b) => b.rule === 30),
            '| rule 86?', bipermutive.some((b) => b.rule === 86),
            '| rule 90?', bipermutive.some((b) => b.rule === 90));

// ---------------- B. the cone-conditioned centre-cell bias -------------------
// generic elementary-CA step on a packed row of width W, cells indexed 0..W-1,
// with white outside. Row t cell at position p is stored at index p + t.
function centreBiasConditioned(rule, t) {
  const tt = new Uint8Array(8);
  for (let i = 0; i < 8; i++) tt[i] = (rule >> i) & 1;      // Wolfram index l,c,r
  const n = t;                                              // free cells 1..t
  const size = 1 << n;
  const W = 2 * t + 3;                                      // room for the cone
  let ones = 0;
  const cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let u = 0; u < size; u++) {
    cur.fill(0);
    // cell p of the configuration sits at index p + t
    cur[t] = 1;                                             // cell 0 black
    for (let k = 1; k <= t; k++) cur[t + k] = (u >> (k - 1)) & 1;
    for (let s = 0; s < t; s++) {
      for (let i = 0; i < W; i++) {
        const l = i > 0 ? cur[i - 1] : 0;
        const c = cur[i];
        const r = i < W - 1 ? cur[i + 1] : 0;
        nxt[i] = tt[4 * l + 2 * c + r];
      }
      cur.set(nxt);
    }
    ones += cur[t];                                         // position 0 at time t
  }
  return { blackFraction: ones / size, bias: Math.abs(2 * ones - size) / size };
}

console.log('\nB. cone-conditioned bias of the centre cell (leftmost black pinned at the origin)');
console.log('   rule 30 is left-permutive only; 86 is its mirror (right-permutive only);');
console.log('   90, 150, 105 are bipermutive; 45 left-only nonlinear; 106 right-only nonlinear.');
const rules = [30, 86, 45, 106, 90, 150, 105, 60, 110];
const header = ['t'].concat(rules.map((r) => 'r' + r)).join('\t');
console.log(header);
for (let t = 1; t <= 18; t++) {
  const row = [t];
  for (const r of rules) row.push(centreBiasConditioned(r, t).bias.toFixed(5));
  console.log(row.join('\t'));
}

// deeper, rule 30 alone, against the random-function null 2^{-t/2}
console.log('\nB2. rule 30 alone, deeper, with the random-Boolean-function null sqrt(2/pi)*2^{-t/2}');
for (let t = 19; t <= 24; t++) {
  const { blackFraction, bias } = centreBiasConditioned(30, t);
  const nullBias = Math.sqrt(2 / Math.PI) * Math.pow(2, -t / 2);
  console.log(JSON.stringify({ t, blackFraction: +blackFraction.toFixed(6), bias: +bias.toFixed(6),
    nullBias: +nullBias.toExponential(3), ratio: +(bias / nullBias).toFixed(1) }));
}
