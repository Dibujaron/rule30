// Vernier, 2026-09-12. The exact criterion, tested over all 256 elementary rules.
//
// CLAIM. For the cone-conditioned family -- configuration white at every position
// < 0, black at 0, free at 1..t -- the centre cell at time t has bias EXACTLY 0 at
// every t if and only if the rule is permutive in its RIGHT variable.
//
// Why the "if": right-permutivity means f(l,c,r) = r XOR g(l,c), so the cell at
// position p at time t is a XOR in the configuration cell at p + t, the RIGHTMOST
// cell of its cone. For the centre cell that is cell t, which the cone hypothesis
// leaves free -- so flipping it is a fixed-point-free involution pairing black with
// white. That is exactly the argument of the board's proved `window_count_half`,
// run on the other end of the window.
//
// Rule 30 is permutive in its LEFT variable and not its right (the board's
// `rule30_leftPermutive`, and obstruction 11's correction). The prize's cone
// hypothesis pins the left. So the one coordinate that would make the centre cell
// balanced for free is the one the hypothesis nails down.
//
// This test is NOT mirror-symmetric: rule 30 and rule 86 must come out differently.

function ttOf(rule) {
  const tt = new Uint8Array(8);
  for (let i = 0; i < 8; i++) tt[i] = (rule >> i) & 1;   // Wolfram index 4l+2c+r
  return tt;
}
function permutivity(rule) {
  const tt = ttOf(rule);
  let lp = true, rp = true;
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
    const i = 4 * l + 2 * c + r;
    if (tt[i] === tt[4 * (1 - l) + 2 * c + r]) lp = false;   // flipping l must flip out
    if (tt[i] === tt[4 * l + 2 * c + (1 - r)]) rp = false;   // flipping r must flip out
  }
  return { leftPermutive: lp, rightPermutive: rp };
}

function coneBias(rule, t) {
  const tt = ttOf(rule);
  const size = 1 << t, W = 2 * t + 3;
  let ones = 0;
  const cur = new Uint8Array(W), nxt = new Uint8Array(W);
  for (let u = 0; u < size; u++) {
    cur.fill(0);
    cur[t] = 1;
    for (let k = 1; k <= t; k++) cur[t + k] = (u >> (k - 1)) & 1;
    for (let s = 0; s < t; s++) {
      for (let i = 0; i < W; i++) {
        const l = i > 0 ? cur[i - 1] : 0, c = cur[i], r = i < W - 1 ? cur[i + 1] : 0;
        nxt[i] = tt[4 * l + 2 * c + r];
      }
      cur.set(nxt);
    }
    ones += cur[t];
  }
  return Math.abs(2 * ones - size) / size;
}

const TMAX = 12;
let agree = 0, disagree = [];
const zeroRules = [], rightPermRules = [];
for (let rule = 0; rule < 256; rule++) {
  const { rightPermutive } = permutivity(rule);
  let allZero = true;
  for (let t = 1; t <= TMAX; t++) if (coneBias(rule, t) !== 0) { allZero = false; break; }
  if (allZero) zeroRules.push(rule);
  if (rightPermutive) rightPermRules.push(rule);
  if (allZero === rightPermutive) agree++; else disagree.push({ rule, allZero, rightPermutive });
}
console.log('rules with cone-conditioned centre bias exactly 0 for every t <= ' + TMAX + ':', zeroRules.length);
console.log('right-permutive rules:', rightPermRules.length);
console.log('agreement over all 256 rules:', agree + '/256');
console.log('disagreements:', JSON.stringify(disagree));
console.log('set equality:', JSON.stringify(zeroRules) === JSON.stringify(rightPermRules));
console.log('rule 30 in the zero set?', zeroRules.includes(30),
            '| rule 86 (the mirror)?', zeroRules.includes(86));
console.log('rule 30 bias at t=1..12:', Array.from({ length: 12 }, (_, i) => coneBias(30, i + 1).toFixed(4)).join(' '));
console.log('rule 86 bias at t=1..12:', Array.from({ length: 12 }, (_, i) => coneBias(86, i + 1).toFixed(4)).join(' '));
