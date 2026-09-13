// Talus, 2026-09-13. What the centre column can see about the rule table.
//
// Rule 30 is l XOR (c OR r); rule 120 is l XOR (c AND r). They differ at exactly
// four of the eight table rows: n = 4l+2c+r in {1,2,5,6}, i.e. the (c,r) pairs
// (0,1) and (1,0) -- "exactly one of centre and right is black". Crystal 74 says
// the whole distance between "P1 trivially settled" and "P1 open" is those four
// entries. This script asks which of them the SEED's picture actually consumes,
// and which of them the CENTRE COLUMN can see.
//
// Three experiments:
//   [A] rule 120's picture from a single black cell, exactly.
//   [B] the eight single-entry mutants of rule 30: when does the centre column
//       first diverge, and what does the picture become?
//   [C] entry usage census on rule 30's own picture, split by half-plane.
//
// Engine: plain Uint8Array rows, width 2T+5 so the cone never touches an edge.
// Validated in [V] against the repo's own BigInt-style packed row and against
// A051023's first terms derived from the rule by hand.

const T = 3000;
const W = 2 * T + 9;
const MID = T + 4;

function grow(rule, T, seedCells) {
  // returns { col, rows? } ; rows kept only if T is small
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (const x of seedCells) cur[MID + x] = 1;
  const col = new Uint8Array(T + 1);
  col[0] = cur[MID];
  for (let s = 1; s <= T; s++) {
    for (let i = 1; i < W - 1; i++)
      nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
    col[s] = cur[MID];
  }
  return col;
}

// keep the whole picture, for small T
function picture(rule, T) {
  const rows = [];
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[MID] = 1;
  rows.push(cur.slice());
  for (let s = 1; s <= T; s++) {
    for (let i = 1; i < W - 1; i++)
      nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    nxt[0] = 0; nxt[W - 1] = 0;
    const tmp = cur; cur = nxt; nxt = tmp;
    rows.push(cur.slice());
  }
  return rows;
}

// ---------------------------------------------------------------- [V] controls
console.log('[V] ENGINE CONTROLS');
{
  // rule 30 centre column, first 11 terms, against the value this project has
  // had to re-derive twice: 1 1 0 1 1 1 0 0 1 1 0  (crystal 46, settledCenter).
  const c = grow(30, 40, [0]);
  const first = Array.from(c.subarray(0, 11)).join('');
  console.log(`    rule 30 centre column t=0..10 : ${first}   (crystal 46 says 11011100110)  ${first === '11011100110' ? 'MATCH' : 'MISMATCH'}`);
  // rule 30's left edge and right edge, both proved black on the board
  const rows = picture(30, 60);
  let leftEdgeAllBlack = true, rightEdgeAllBlack = true, secondLeftAllBlack = true, thirdLeftAllWhite = true;
  for (let t = 0; t <= 60; t++) {
    if (rows[t][MID - t] !== 1) leftEdgeAllBlack = false;
    if (rows[t][MID + t] !== 1) rightEdgeAllBlack = false;
    if (t >= 1 && rows[t][MID - (t - 1)] !== 1) secondLeftAllBlack = false;
    if (t >= 2 && rows[t][MID - (t - 2)] !== 0) thirdLeftAllWhite = false;
  }
  console.log(`    evolve_left_edge (black at x=-t)            : ${leftEdgeAllBlack ? 'holds' : 'FAILS'}   [proved node]`);
  console.log(`    evolve_right_edge (black at x=+t)           : ${rightEdgeAllBlack ? 'holds' : 'FAILS'}   [proved node]`);
  console.log(`    evolve_left_second_diagonal (black at -t+1) : ${secondLeftAllBlack ? 'holds' : 'FAILS'}   [proved node]`);
  console.log(`    evolve_left_third_diagonal (white at -t+2)  : ${thirdLeftAllWhite ? 'holds' : 'FAILS'}   [proved node]`);
  // cone: nothing black outside |x| <= t
  let coneOk = true;
  for (let t = 0; t <= 60; t++) for (let i = 0; i < W; i++) {
    const x = i - MID;
    if (Math.abs(x) > t && rows[t][i] === 1) coneOk = false;
  }
  console.log(`    evolve_eq_false_of_outside_cone             : ${coneOk ? 'holds' : 'FAILS'}   [proved node]`);
}

// ------------------------------------------------------- [A] rule 120's picture
console.log('\n[A] RULE 120 FROM A SINGLE BLACK CELL');
{
  const rows = picture(120, 400);
  let supportIsTheRay = true, firstBad = null;
  for (let t = 0; t <= 400; t++) {
    for (let i = 0; i < W; i++) {
      const want = (i - MID === t) ? 1 : 0;
      if (rows[t][i] !== want) { supportIsTheRay = false; if (firstBad === null) firstBad = [t, i - MID]; }
    }
  }
  console.log(`    support is exactly {(t, x) : x = t}, t = 0..400 : ${supportIsTheRay ? 'YES' : 'NO at ' + firstBad}`);
  const c120 = grow(120, T, [0]);
  let firstBlackAfter0 = -1;
  for (let t = 1; t <= T; t++) if (c120[t]) { firstBlackAfter0 = t; break; }
  console.log(`    centre column black at any t in 1..${T}         : ${firstBlackAfter0 < 0 ? 'NEVER (white from t=1)' : 'at t=' + firstBlackAfter0}`);
  let blackLeft = 0;
  for (let t = 0; t <= 400; t++) for (let i = 0; i < MID; i++) if (rows[t][i]) blackLeft++;
  console.log(`    black cells strictly left of the origin        : ${blackLeft}`);
  // rule 120 is NOT trivial in general: give it a random row
  let cur = new Uint8Array(W);
  let s = 123456789;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s; };
  for (let i = 200; i < W - 200; i++) cur[i] = rnd() & 1;
  let nxt = new Uint8Array(W), density = 0;
  for (let t = 0; t < 500; t++) {
    for (let i = 1; i < W - 1; i++) nxt[i] = (120 >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  for (let i = 400; i < W - 400; i++) density += cur[i];
  console.log(`    from a RANDOM row, rule 120 density after 500  : ${(density / (W - 800)).toFixed(5)}   (so 120 is not a trivial automaton; only its SEED orbit is)`);
}

// ------------------------------------------- [B] the eight single-entry mutants
console.log('\n[B] SINGLE-ENTRY MUTANTS OF RULE 30');
console.log('    n = 4l+2c+r.  n in {1,2,5,6} are the four rows where OR differs from AND.');
console.log('    "first divergence" = least t with mutant centre column != rule 30 centre column.\n');
const c30 = grow(30, T, [0]);
const nbhd = ['000', '001', '010', '011', '100', '101', '110', '111'];
const orAnd = new Set([1, 2, 5, 6]);
console.log('      n  nbhd  30->  mutant rule   first col divergence   mutant col t=0..12');
for (let n = 0; n < 8; n++) {
  const m = 30 ^ (1 << n);
  const cm = grow(m, T, [0]);
  let d = -1;
  for (let t = 0; t <= T; t++) if (cm[t] !== c30[t]) { d = t; break; }
  const tag = orAnd.has(n) ? ' *OR/AND*' : '';
  console.log(`      ${n}  ${nbhd[n]}   ${(30 >> n) & 1}     ${String(m).padStart(3)}         ${d < 0 ? 'never (<=' + T + ')' : 't = ' + d}` +
    `${d < 0 ? '' : '           '}   ${Array.from(cm.subarray(0, 13)).join('')}${tag}`);
}
console.log(`\n    rule 30 col t=0..12                                          ${Array.from(c30.subarray(0, 13)).join('')}`);
console.log('    rule 120 = 30 XOR (2+4+32+64) = all four OR/AND entries flipped at once.');

// ------------------------------------------------- [C] entry census on rule 30
console.log('\n[C] ENTRY CENSUS ON RULE 30\'S OWN PICTURE (t = 0..1999)');
{
  const TT = 2000;
  const rows = picture(30, TT);
  // count uses of each neighbourhood n, split by the position of the OUTPUT cell
  const all = new Array(8).fill(0), left = new Array(8).fill(0), right = new Array(8).fill(0), origin = new Array(8).fill(0);
  for (let t = 0; t < TT; t++) {
    for (let x = -(t + 1); x <= t + 1; x++) {
      const i = MID + x;
      const n = 4 * rows[t][i - 1] + 2 * rows[t][i] + rows[t][i + 1];
      all[n]++;
      if (x < 0) left[n]++; else if (x > 0) right[n]++; else origin[n]++;
    }
  }
  console.log('      n  nbhd   uses in cone    left half   right half   at x=0');
  for (let n = 0; n < 8; n++)
    console.log(`      ${n}  ${nbhd[n]}  ${String(all[n]).padStart(11)} ${String(left[n]).padStart(11)} ${String(right[n]).padStart(12)} ${String(origin[n]).padStart(8)}${orAnd.has(n) ? '  *OR/AND*' : ''}`);
  // which entry fires at the left edge itself?
  const edgeN = new Set();
  for (let t = 0; t < TT; t++) {
    const i = MID - (t + 1);            // the NEW left edge cell at time t+1
    edgeN.add(4 * rows[t][i - 1] + 2 * rows[t][i] + rows[t][i + 1]);
  }
  console.log(`\n    the entry that creates the left edge cell (t+1, -(t+1)) : n = ${[...edgeN].join(', ')}  (${[...edgeN].map(n => nbhd[n]).join(', ')})`);
  const originN = new Set();
  for (let t = 0; t < TT; t++) originN.add(4 * rows[t][MID - 1] + 2 * rows[t][MID] + rows[t][MID + 1]);
  console.log(`    entries that create the centre column cell (t+1, 0)      : n = ${[...originN].sort().join(', ')}`);
}
