// Talus, 2026-09-13.
//
// [H] VACUITY. talus14_baudit.mjs reports rule 120 "satisfying" the two proved run
//     bounds. It does not: its centre column is white from t = 1, so there is no
//     black run to bound and the final white run is truncated by the horizon and
//     skipped. The obstruction file's "the white one holds for every rule there is
//     (256/256)" carries the same artifact, inherited from rowan_rulecontrol.mjs's
//     "truncated run, do not judge" convention -- which is the right convention and
//     the wrong denominator. Report the NON-VACUOUS population instead.
//
// [I] THE LADDER CONTROL. Obstruction 33/35: f_R(p, a) is the longest block, from
//     time 0, over which a configuration white at every x < -a and black at -a has
//     a p-periodic centre column under rule R. f(p,a) < infinity for all p, a
//     implies P1. Run rule 120 and rule 110 against it: a candidate P1 statement
//     that rule 120 also satisfies is not about rule 30.
//     Brute force over the class: the column to depth L reads row 0 on [-L, L], and
//     the class fixes x < -a white and x = -a black, so 2^(L+a) configurations.

const TT = 3000;
const W = 2 * TT + 9, MID = TT + 4;

function centreCol(rule, T) {
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[MID] = 1;
  const col = new Uint8Array(T + 1); col[0] = 1;
  for (let s = 1; s <= T; s++) {
    for (let i = 1; i < W - 1; i++) nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    nxt[0] = 0; nxt[W - 1] = 0;
    const t = cur; cur = nxt; nxt = t; col[s] = cur[MID];
  }
  return col;
}

const T = 1200;
const cols = new Map();
for (let r = 0; r < 256; r++) cols.set(r, centreCol(r, T));
console.log(`[V] rule 30 centre column t=0..10 : ${Array.from(cols.get(30).subarray(0, 11)).join('')}  (crystal 46: 11011100110)`);

// ------------------------------------------------------------------ [H] vacuity
console.log('\n[H] THE RUN BOUNDS, WITH THE VACUOUS CASES SEPARATED OUT.');
console.log('    A rule whose centre column has no run of that colour, or whose final run runs off');
console.log('    the horizon, cannot be judged. rowan_rulecontrol.mjs skips those and counts them as');
console.log('    satisfying. Here they are counted separately.\n');

function runVerdict(col, colour, mult) {
  // returns 'holds' | 'fails' | 'vacuous'
  let a = 1, judged = 0;
  while (a < col.length) {
    if (col[a] === colour) {
      let run = 0; while (a + run < col.length && col[a + run] === colour) run++;
      if (a + run >= col.length) break;           // truncated: cannot judge
      judged++;
      if (!(run - 1 < mult * a)) return 'fails';
      a += run;
    } else a++;
  }
  return judged === 0 ? 'vacuous' : 'holds';
}

for (const [label, colour, mult] of [['black run <= a  (centerColumn_black_run_lt_start)', 1, 1],
                                     ['white run < 3a  (centerColumn_white_run_lt_start)', 0, 3]]) {
  const c = { holds: 0, fails: 0, vacuous: 0 };
  const vac = [];
  for (let r = 0; r < 256; r++) { const v = runVerdict(cols.get(r), colour, mult); c[v]++; if (v === 'vacuous') vac.push(r); }
  console.log(`    ${label}`);
  console.log(`       holds non-vacuously : ${c.holds} / 256      fails : ${c.fails}      VACUOUS : ${c.vacuous}`);
  console.log(`       rule 30 : ${runVerdict(cols.get(30), colour, mult)}    rule 120 : ${runVerdict(cols.get(120), colour, mult)}    rule 110 : ${runVerdict(cols.get(110), colour, mult)}`);
  if (vac.length && vac.length <= 20) console.log(`       vacuous rules: ${vac.join(', ')}`);
  console.log('');
}

// restrict to rules whose column is NOT eventually constant -- the honest population
const live = [];
for (let r = 0; r < 256; r++) {
  const col = cols.get(r); let b = false, w = false;
  for (let t = T - 400; t <= T; t++) { if (col[t]) b = true; else w = true; }
  if (b && w) live.push(r);
}
console.log(`    Rules whose centre column is not eventually constant (the only ones either bound can`);
console.log(`    constrain at large t): ${live.length} of 256.  Among THOSE:`);
for (const [label, colour, mult] of [['black run <= a', 1, 1], ['white run < 3a', 0, 3]]) {
  let h = 0, f = 0, v = 0;
  for (const r of live) { const x = runVerdict(cols.get(r), colour, mult); if (x === 'holds') h++; else if (x === 'fails') f++; else v++; }
  console.log(`       ${label.padEnd(16)} holds ${h} / ${live.length}   fails ${f}   vacuous ${v}`);
}
console.log('\n    So the bounds are still shared very widely, and the obstruction file\'s reading stands;');
console.log('    but "holds for every rule there is" was counting rules with no run to bound.');

// ------------------------------------------------------------------- [I] ladder
console.log('\n[I] THE PERIOD LADDER f_R(p, a), BRUTE FORCE OVER THE CONED CLASS.');
console.log('    class: row 0 white at x < -a, black at x = -a, free on [-a+1, L].');
console.log('    f = longest L such that some member has centre column p-periodic on [0, L).\n');

function ladder(rule, p, a, cap) {
  // grow one configuration given its free bits; column to depth L
  const side = cap + 2;
  const w = 2 * side + 3, mid = side + 1;
  const cur0 = new Uint8Array(w);
  let best = 0, bestWitness = null;
  const freeLo = -a + 1, freeHi = cap;             // free positions
  const nFree = freeHi - freeLo + 1;
  if (nFree > 24) throw new Error('too many free bits');
  const cur = new Uint8Array(w), nxt = new Uint8Array(w);
  for (let m = 0; m < (1 << nFree); m++) {
    cur.fill(0); cur0.fill(0);
    cur[mid - a] = 1;
    for (let k = 0; k < nFree; k++) if ((m >> k) & 1) cur[mid + freeLo + k] = 1;
    // evolve, reading the column, stopping as soon as periodicity breaks
    let L = 0;
    const col = [];
    let c = cur.slice(), n = new Uint8Array(w);
    col.push(c[mid]);
    let ok = true;
    for (let s = 1; s <= cap && ok; s++) {
      for (let i = 1; i < w - 1; i++) n[i] = (rule >> (4 * c[i - 1] + 2 * c[i] + c[i + 1])) & 1;
      n[0] = 0; n[w - 1] = 0;
      const t = c; c = n; n = t;
      col.push(c[mid]);
      if (col.length > p && col[col.length - 1] !== col[col.length - 1 - p]) ok = false;
    }
    const len = ok ? cap + 1 : col.length - 1;
    if (len > best) { best = len; bestWitness = m; }
    if (best > cap) return { f: best, capped: true };
  }
  return { f: best, capped: best >= cap + 1 };
}

const CAP = 20;
console.log('      rule   p   a=1    a=2    a=3      (value = longest p-periodic block; "cap" = hit the ' + CAP + '-row cap)');
for (const rule of [30, 120, 110, 90, 150]) {
  for (const p of [1, 2, 3]) {
    const out = [];
    for (const a of [1, 2, 3]) {
      const r = ladder(rule, p, a, CAP);
      out.push(r.capped ? `cap` : String(r.f));
    }
    console.log(`      ${String(rule).padStart(4)}  ${p}   ${out.map(s => s.padStart(4)).join('   ')}`);
  }
}
console.log('\n    "cap" means the cone did NOT bound the block within ' + CAP + ' rows: the statement f < infinity');
console.log('    is not visibly true for that rule at that (p, a), so the rule is a live control.');
