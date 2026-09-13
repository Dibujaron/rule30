// Talus, 2026-09-13. Why the p = 1 rung is proved and p >= 2 is not.
//
// centerColumn_not_eventually_constant is a (B) fact whose conclusion is about
// column 0 at unbounded time (talus14_baudit.mjs). It is the p = 1 rung of P1,
// proved. Its two mechanisms are:
//
//   BLACK: column_succ_of_black   c(t+1) = NOT L(t)      -- pins column -1, at black times
//   WHITE: white_run_monotone     col1(t+1) = col1(t) OR col2(t)  -- col 1 monotone, at white times
//
// Each is TOTAL exactly when the period word is constant, and each covers a
// density-(that colour) subset otherwise. This file checks that the coverage is
// what it says and that nothing on the board covers the complement:
//
//   [M] at black times column -1 is pinned by column 0 alone; at white times it is not,
//       and here are two configurations of the coned class proving it.
//   [N] the coverage fraction for every periodic word up to length 8.
//   [O] rule 120's version of the same two laws, for the control.

const A = 4;            // cone radius of the class
const L = 14;           // depth of the column word

function colsOf(rule, cfgBits, a, depth) {
  const side = depth + 3, w = 2 * side + 3, mid = side + 1;
  let c = new Uint8Array(w), n = new Uint8Array(w);
  c[mid - a] = 1;
  const freeLo = -a + 1, nFree = depth - freeLo + 1;
  for (let k = 0; k < nFree; k++) if ((cfgBits >> k) & 1) c[mid + freeLo + k] = 1;
  const col0 = [], colm1 = [], colp1 = [];
  col0.push(c[mid]); colm1.push(c[mid - 1]); colp1.push(c[mid + 1]);
  for (let s = 1; s <= depth; s++) {
    for (let i = 1; i < w - 1; i++) n[i] = (rule >> (4 * c[i - 1] + 2 * c[i] + c[i + 1])) & 1;
    n[0] = 0; n[w - 1] = 0;
    const t = c; c = n; n = t;
    col0.push(c[mid]); colm1.push(c[mid - 1]); colp1.push(c[mid + 1]);
  }
  return { col0, colm1, colp1 };
}

function pinAnalysis(rule, a, depth) {
  const freeLo = -a + 1, nFree = depth - freeLo + 1;
  const byWord = new Map();          // column-0 word -> list of column(-1) words
  for (let m = 0; m < (1 << nFree); m++) {
    const { col0, colm1 } = colsOf(rule, m, a, depth);
    const key = col0.join('');
    if (!byWord.has(key)) byWord.set(key, []);
    const arr = byWord.get(key);
    if (arr.length < 64) arr.push(colm1.join(''));
  }
  // for each column-0 word and each time, is column -1 the same across all realisations?
  let blackTimes = 0, blackPinned = 0, whiteTimes = 0, whitePinned = 0;
  let witness = null;
  for (const [key, arr] of byWord) {
    for (let t = 0; t < depth; t++) {          // t < depth: the law reads c(t+1)
      const vals = new Set(arr.map(s => s[t]));
      const pinned = vals.size === 1;
      if (key[t] === '1') { blackTimes++; if (pinned) blackPinned++; }
      else {
        whiteTimes++;
        if (pinned) whitePinned++;
        else if (!witness) {
          // find two realisations that ACTUALLY differ at t. The first version of
          // this line took arr.slice(0, 2) and printed two identical strings: a
          // "witness" that witnessed nothing.
          const v0 = arr.find(s => s[t] === '0'), v1 = arr.find(s => s[t] === '1');
          witness = [key, t, [v0, v1]];
        }
      }
    }
  }
  return { blackTimes, blackPinned, whiteTimes, whitePinned, witness, words: byWord.size };
}

console.log('[M] IS COLUMN -1 PINNED BY COLUMN 0 ALONE?  Coned class, a = ' + A + ', depth ' + L + '.');
console.log('    "pinned at time t" = every configuration of the class with this column-0 word');
console.log('    agrees on column -1 at time t.\n');
for (const rule of [30, 120]) {
  const r = pinAnalysis(rule, A, L);
  console.log(`    rule ${rule}:  distinct column-0 words ${r.words}`);
  console.log(`       at BLACK times of column 0 : ${r.blackPinned} / ${r.blackTimes} pinned  (${(100 * r.blackPinned / r.blackTimes).toFixed(1)}%)`);
  console.log(`       at WHITE times of column 0 : ${r.whitePinned} / ${r.whiteTimes} pinned  (${(100 * r.whitePinned / r.whiteTimes).toFixed(1)}%)`);
  if (r.witness) {
    console.log(`       witness at a white time: column-0 word ${r.witness[0]}, time ${r.witness[1]}`);
    console.log(`          two realisations of column -1 : ${r.witness[2][0]}`);
    console.log(`                                          ${r.witness[2][1]}`);
  }
  console.log('');
}
console.log('    READ THIS CORRECTLY. The high white-time figure is NOT the two named laws doing work.');
console.log('    Cell (t+1, i) reads i-1, i, i+1, so for i <= -1 it reads only cells <= 0: the left');
console.log('    half-plane TOGETHER WITH column 0 is a closed system. In this class row 0 is white at');
console.log('    x < -a, black at -a and free only on [-a+1, -1], i.e. a - 1 free bits, so column -1 is');
console.log('    a function of column 0 and at most a - 1 bits however deep you go. Rowan retracted a');
console.log('    finding on exactly this ground on 2026-09-12; this reproduces the retraction from the');
console.log('    other side. The sweep below is the check: pinning must decay as a grows.\n');
{
  console.log('      a    left-half free bits (a-1)    white-time pinned, rule 30');
  for (let a = 1; a <= 7; a++) {
    const r = pinAnalysis(30, a, 11);
    console.log(`      ${a}    ${String(a - 1).padStart(20)}    ${(100 * r.whitePinned / r.whiteTimes).toFixed(1)}%   (black-time: ${(100 * r.blackPinned / r.blackTimes).toFixed(1)}%)`);
  }
  console.log('\n    Black-time pinning stays at 100% at every a -- that is column_succ_of_black, a theorem,');
  console.log('    independent of the class. White-time pinning decays -- that is the class, not a law.\n');
}

console.log('[N] COVERAGE OF THE TWO LAWS AS A FUNCTION OF THE HYPOTHESISED PERIOD WORD.');
console.log('    Under "column 0 is eventually periodic with period word W":');
console.log('      the black law pins column -1 at the black positions of W;');
console.log('      the white law (white_run_monotone) constrains column 1 at the white positions.');
console.log('    A law is TOTAL iff W is constant of that colour.\n');
console.log('      |W|   words   W all black   W all white   W mixed (neither law total)');
for (let p = 1; p <= 8; p++) {
  const n = 1 << p;
  console.log(`      ${String(p).padStart(3)} ${String(n).padStart(7)} ${String(1).padStart(13)} ${String(1).padStart(13)} ${String(n - 2).padStart(14)}`);
}
console.log('\n    So the proved p = 1 rung is exactly the two words at which a law is total, and every');
console.log('    p >= 2 introduces at least one word of each colour, hence a positive-density set of');
console.log('    times at which NEITHER law says anything. That is the seam, and it is not "reach".');

console.log('\n[O] THE SAME TWO LAWS UNDER RULE 120, for the control.');
{
  // black law: rule30  c(t+1) = L(t) XOR (c(t) OR col1(t)); at c(t)=1 -> NOT L(t)
  // rule120  c(t+1) = L(t) XOR (c(t) AND col1(t)); at c(t)=1 -> L(t) XOR col1(t): NOT pinned
  const chk = (rule, c, col1) => {
    // does c(t+1) depend on col1 when c(t) = 1?
    const f = (L, cc, r) => (rule >> (4 * L + 2 * cc + r)) & 1;
    return f(0, c, 0) !== f(0, c, 1) || f(1, c, 0) !== f(1, c, 1);
  };
  for (const rule of [30, 120]) {
    const depAtBlack = chk(rule, 1);
    const depAtWhite = chk(rule, 0);
    console.log(`    rule ${rule}: at a BLACK centre, the next centre cell depends on column 1 : ${depAtBlack ? 'YES' : 'NO  (so column -1 is pinned)'}`);
    console.log(`    rule ${rule}: at a WHITE centre, the next centre cell depends on column 1 : ${depAtWhite ? 'YES' : 'NO  (so column -1 is pinned)'}`);
  }
  console.log('\n    The OR entry (l,1,0) vs (l,1,1) is exactly what makes column 1 INVISIBLE at a black');
  console.log('    centre for rule 30. For rule 120 it is invisible at a WHITE centre instead -- the');
  console.log('    same mechanism, on the other colour. So even the pinning law is not the distinction;');
  console.log('    the distinction is which colour the seed\'s own picture supplies at the left edge.');
}
