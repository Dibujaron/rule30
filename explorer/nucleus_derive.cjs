'use strict';
// Derive the transducer for rule 30's periodic (right-hand) edge, from the rule
// table alone, and validate it against a direct simulation of the automaton.

const L = require('./nucleus_lib.cjs');

const rule30 = (l, c, r) => l ^ (c | r);

// ---------------------------------------------------------------- permutivity
// left-permutive: for fixed (c,r), l -> f(l,c,r) is a bijection
// right-permutive: for fixed (l,c), r -> f(l,c,r) is a bijection
function permutivity(f) {
  let left = true, right = true;
  for (const c of [0, 1]) for (const r of [0, 1]) if (f(0, c, r) === f(1, c, r)) left = false;
  for (const l of [0, 1]) for (const c of [0, 1]) if (f(l, c, 0) === f(l, c, 1)) right = false;
  return { left, right };
}
console.log('rule 30 truth table (l,c,r) -> new:');
for (let i = 7; i >= 0; i--) {
  const l = (i >> 2) & 1, c = (i >> 1) & 1, r = i & 1;
  process.stdout.write(`${l}${c}${r}->${rule30(l, c, r)}  `);
}
console.log('\npermutivity of rule 30:', JSON.stringify(permutivity(rule30)));

// ------------------------------------------------------- the 4-state machine
// Left-permutivity means the NEW cell is a bijection in its LEFT input, so the
// invertible reading direction is right-to-left. Reading the row in decreasing
// position order, with state = (x_i, x_{i+1}) = the two cells already read,
// the machine reads x_{i-1} and emits new_i = x_{i-1} XOR (x_i OR x_{i+1}),
// moving to state (x_{i-1}, x_i).
//   state index = 2*c + r  where (c,r) = (x_i, x_{i+1})
const perm4 = [], tr4 = [];
for (let s = 0; s < 4; s++) {
  const c = (s >> 1) & 1, r = s & 1;
  // output on input a is a XOR (c OR r): root permutation bit is (c OR r)
  perm4.push(c | r);
  tr4.push([2 * 0 + c, 2 * 1 + c]); // input a -> state (a, c)
}
console.log('\nraw 4-state machine, states (c,r)=(x_i,x_{i+1}) indexed 2c+r:');
for (let s = 0; s < 4; s++) {
  console.log(`  s${s}=(${(s >> 1) & 1},${s & 1}): out = in XOR ${perm4[s]}, ` +
    `sections -> s${tr4[s][0]} (on 0), s${tr4[s][1]} (on 1)`);
}
const invertible = perm4.every(p => p === 0 || p === 1);
console.log('every state acts by a permutation of the alphabet:', invertible);

// initial state for the space-time diagram is (0,0): everything right of the
// light cone is white.
const q0 = L.build(perm4, tr4, 0); // (0,0)
const q1 = L.build(perm4, tr4, 1); // (0,1)
const q2 = L.build(perm4, tr4, 2); // (1,0)
const q3 = L.build(perm4, tr4, 3); // (1,1)
console.log('\nminimized as elements: ');
for (const [n, g] of [['(0,0)', q0], ['(0,1)', q1], ['(1,0)', q2], ['(1,1)', q3]]) {
  console.log(`  ${n}: ${g.perm.length} states  key=${g.key}`);
}
console.log('  (1,0) == (1,1) ?', q2.key === q3.key);
const merged = L.build(perm4, tr4, 0);
// count the states of the minimized whole automaton (all four states reachable)
console.log('\nMINIMIZED AUTOMATON (from (0,0)):');
console.log('  ' + L.describe(merged));
console.log('  number of states:', merged.perm.length);

// ------------------------------------------------------------- validation #1
// the transducer really is one rule-30 step (read right-to-left)
function step(row) { // row[i], zeros outside
  const n = row.length;
  const at = i => (i < 0 || i >= n) ? 0 : row[i];
  return row.map((_, i) => rule30(at(i - 1), at(i), at(i + 1)));
}
let ok1 = true;
let rng = 12345;
const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) >> 16 & 1;
for (let trial = 0; trial < 2000; trial++) {
  const n = 1 + (trial % 25);
  const row = Array.from({ length: n }, rand);
  // read right-to-left: input letters are x[n-1], x[n-2], ..., x[0]
  const input = row.slice().reverse();
  const out = L.apply(q0, input); // outputs new[n], new[n-1], ..., new[1]
  const direct = step(row.concat([0, 0])); // positions 0..n+1
  for (let j = 0; j < n; j++) {
    // out[j] is new at position n-j
    if (out[j] !== direct[n - j]) { ok1 = false; }
  }
}
console.log('\nvalidation 1 (transducer == one rule-30 step, 2000 random rows):', ok1);

// ------------------------------------------------------------- validation #2
// q0 iterated on u0 = 1000... reproduces the right-hand diagonals of the
// single-cell space-time diagram: u_t(j) = x_t(t - j).
const T = Number(process.argv[2] || 400), W = 40;
let cur = new Array(2 * T + 5).fill(0);
const centre = T + 2;
cur[centre] = 1;
const diag = []; // diag[t][j] = x_t(t-j)
for (let t = 0; t <= T; t++) {
  diag.push(Array.from({ length: W }, (_, j) => cur[centre + t - j] || 0));
  cur = step(cur);
}
let u = Array.from({ length: W }, (_, j) => (j === 0 ? 1 : 0));
let ok2 = (u.join('') === diag[0].join(''));
for (let t = 1; t <= T; t++) {
  u = L.apply(q0, u);
  if (u.join('') !== diag[t].join('')) ok2 = false;
}
console.log('validation 2 (q0^t on 1000... == right diagonals, t <= T):', ok2);

// ------------------------------------------------------------- validation #3
// right diagonal k is PURELY periodic with period dividing 2^k
const rows = [];
for (let k = 0; k < 14; k++) rows.push(diag.map(d => d[k]));
const periods = rows.map((col, k) => {
  for (let p = 1; p <= (1 << k); p++) {
    if ((1 << k) % p) continue;
    let good = true;
    for (let t = 0; t + p < col.length; t++) if (col[t] !== col[t + p]) { good = false; break; }
    if (good) return p;
  }
  return null;
});
console.log('right-diagonal periods k=0..13 (pure, no transient):',
  JSON.stringify(periods), ' all divide 2^k:', periods.every((p, k) => p !== null));

module.exports = { q0, q1, q2, perm4, tr4 };
