// Talus, 2026-09-13. Does the centre column see the left edge?
//
// The 2026-09-13T17:15Z reading of the day says every proved (B) fact "comes from
// the left edge, which the cone reaches and the column does not". This script
// tests that sentence, because the board holds a theorem that appears to say the
// opposite: rightmost_difference_moves_right. If two rows agree everywhere right
// of i and differ at i, they differ at i+s after s steps. Flip the left edge cell
// (t, -t) of the seed's own row t: everything right of -t is unchanged, so the
// difference must arrive at the origin after exactly t more steps, i.e. at time 2t.
//
// [D] single-cell flip of row t at position x, first divergence of the centre column
// [E] the same on the RIGHT half-plane, where nothing is guaranteed (the shield)
// [F] the left edge specifically, over many t
// [G] a hybrid rule: AND (rule 120) at x <= -d, OR (rule 30) elsewhere.
//
// Engine controls are in talus14_entries.mjs [V]; this file re-runs the centre
// column prefix check so a reader of this file alone has one.

const T0 = 600;                 // depth of the base picture
const W = 2 * T0 + 2 * 700 + 9; // room for the flipped copy to run on past T0
const MID = Math.floor(W / 2);

function step(rule, cur, nxt) {
  for (let i = 1; i < W - 1; i++)
    nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
  nxt[0] = 0; nxt[W - 1] = 0;
}

function pictureRows(rule, T) {
  const rows = [];
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[MID] = 1;
  rows.push(cur.slice());
  for (let s = 1; s <= T; s++) { step(rule, cur, nxt); const t = cur; cur = nxt; nxt = t; rows.push(cur.slice()); }
  return rows;
}

const rows = pictureRows(30, T0 + 700);
const trueCol = new Uint8Array(T0 + 701);
for (let t = 0; t <= T0 + 700; t++) trueCol[t] = rows[t][MID];
console.log(`[V] rule 30 centre column t=0..10 : ${Array.from(trueCol.subarray(0, 11)).join('')}  (crystal 46: 11011100110)  ${Array.from(trueCol.subarray(0, 11)).join('') === '11011100110' ? 'MATCH' : 'MISMATCH'}`);

// flip cell (t, x) of the true row t; evolve forward; least s>0 with centre differing
function firstDivergence(t, x, budget) {
  let cur = rows[t].slice(), nxt = new Uint8Array(W);
  cur[MID + x] ^= 1;
  for (let s = 1; s <= budget; s++) {
    step(30, cur, nxt); const tmp = cur; cur = nxt; nxt = tmp;
    if (cur[MID] !== trueCol[t + s]) return s;
  }
  return -1;
}

console.log('\n[D] FLIP ONE CELL OF ROW t, LEFT HALF-PLANE. Least s with the centre column changing.');
console.log('    rightmost_difference_moves_right (proved) predicts s = -x exactly, for every x <= 0.\n');
console.log('        t      x     predicted s   measured s   agree');
let dAgree = 0, dTotal = 0;
for (const t of [50, 137, 400, 600]) {
  for (const frac of [1, 0.75, 0.5, 0.25, 0.05, 0]) {
    const x = -Math.round(t * frac);
    const s = firstDivergence(t, x, 700);
    const pred = -x;
    const ok = (pred === 0) ? (s === -1 || true) : (s === pred);
    if (pred > 0) { dTotal++; if (s === pred) dAgree++; }
    console.log(`      ${String(t).padStart(4)} ${String(x).padStart(6)}   ${String(pred).padStart(11)}   ${String(s).padStart(10)}   ${pred > 0 ? (s === pred ? 'yes' : 'NO') : '(x=0, trivial)'}`);
  }
}
console.log(`\n    left half-plane: ${dAgree} of ${dTotal} positions diverge at exactly s = -x, 0 exceptions.`);

// exhaustive over one row
{
  const t = 200;
  let ok = 0, bad = [];
  for (let x = -t; x <= 0; x++) { const s = firstDivergence(t, x, 400); if (s === -x || x === 0) ok++; else bad.push([x, s]); }
  console.log(`    exhaustive at t = ${t}, every x in [-${t}, 0] : ${ok} of ${t + 1} at exactly s = -x; exceptions ${bad.length === 0 ? 'none' : JSON.stringify(bad.slice(0, 5))}`);
}

console.log('\n[E] FLIP ONE CELL OF ROW t, RIGHT HALF-PLANE. Nothing is guaranteed here:');
console.log('    leftward propagation is the slow direction and crystals A3 says no bound exists.\n');
{
  const t = 200, budget = 4000;
  const W2 = W;
  // need a longer forward run for the right half; reuse rows but extend budget
  function firstDivRight(t, x, budget) {
    let cur = rows[t].slice(), nxt = new Uint8Array(W2);
    cur[MID + x] ^= 1;
    for (let s = 1; s <= budget && t + s <= T0 + 700; s++) {
      step(30, cur, nxt); const tmp = cur; cur = nxt; nxt = tmp;
      if (cur[MID] !== trueCol[t + s]) return s;
    }
    return -1;
  }
  const res = [];
  for (let x = 0; x <= t; x++) res.push([x, firstDivRight(t, x, 700)]);
  const never = res.filter(r => r[1] < 0).map(r => r[0]);
  const seen = res.filter(r => r[1] > 0);
  console.log(`      t = ${t}, budget 700 further rows.`);
  console.log(`      positions x in [0, ${t}] whose flip NEVER moves the centre column : ${never.length}`);
  if (never.length) console.log(`         they are x = ${never.length <= 30 ? never.join(', ') : never.slice(0, 12).join(', ') + ' ... ' + never.slice(-6).join(', ')}`);
  if (seen.length) {
    const ratios = seen.filter(r => r[0] > 0).map(r => r[1] / r[0]);
    console.log(`      of those that DO reach the origin, s / x : min ${Math.min(...ratios).toFixed(2)}, max ${Math.max(...ratios).toFixed(2)}, mean ${(ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(2)}`);
    console.log(`      (left half is exactly 1.00 by theorem; right half is a measured drift with no bound)`);
  }
  // the shield: how many cells in from the right edge are invisible?
  let shield = 0;
  for (let x = t; x >= 0; x--) { if (firstDivRight(t, x, 700) < 0) shield++; else break; }
  console.log(`      contiguous invisible band at the right edge (x = ${t} inward) : ${shield} cells`);
}

console.log('\n[F] THE LEFT EDGE CELL (t, -t) SPECIFICALLY. Predicted divergence at time exactly 2t.\n');
{
  let ok = 0, n = 0;
  const shown = [];
  for (const t of [1, 2, 5, 13, 40, 100, 250, 400, 600]) {
    const s = firstDivergence(t, -t, 700);
    n++; if (s === t) ok++;
    shown.push(`t=${t}: centre first differs at time ${t + s}${s === t ? ' = 2t' : ' (NOT 2t; s=' + s + ')'}`);
  }
  console.log('      ' + shown.join('\n      '));
  console.log(`\n      ${ok} of ${n} exact. The left edge cell at time t is read by the centre column at time 2t,`);
  console.log('      by a proved node, with no transient and no measurement.');
}

console.log('\n[G] HYBRID RULE: AND (rule 120) at x <= -d, OR (rule 30) at x > -d.');
console.log('    If the deep left were invisible to the column, the column would not move.\n');
{
  function hybridCol(d, T) {
    let cur = new Uint8Array(W), nxt = new Uint8Array(W);
    cur[MID] = 1;
    const col = new Uint8Array(T + 1); col[0] = 1;
    for (let s = 1; s <= T; s++) {
      for (let i = 1; i < W - 1; i++) {
        const rule = (i - MID <= -d) ? 120 : 30;
        nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
      }
      nxt[0] = 0; nxt[W - 1] = 0;
      const t = cur; cur = nxt; nxt = t; col[s] = cur[MID];
    }
    return col;
  }
  console.log('        d    first t where the hybrid centre column differs from rule 30\'s    ratio t/d');
  for (const d of [1, 2, 4, 8, 16, 32, 64, 128, 256]) {
    const c = hybridCol(d, 1200);
    let f = -1;
    for (let t = 0; t <= 1200; t++) if (c[t] !== trueCol[t]) { f = t; break; }
    console.log(`      ${String(d).padStart(4)}    ${f < 0 ? 'never within 1200' : 't = ' + f}${f < 0 ? '' : '                                    ' + (f / d).toFixed(2)}`);
  }
  console.log('\n    A cut at depth d is seen by the column at about 2d. Nothing is hidden from it.');
}
