// Rowan 2026-09-13: check that rule 120 = l XOR (c AND r) is the OR->AND mutant
// of rule 30 = l XOR (c OR r), and that from a single black cell its centre
// column is white from t = 1 while rule 30's is not.
const tableOf = (n) => Array.from({ length: 8 }, (_, i) => (n >> i) & 1);
const idx = (l, c, r) => (l << 2) | (c << 1) | r;
const t30 = tableOf(30), t120 = tableOf(120);

// 1. the two formulas
let ok = true;
const diffs = [];
for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
  const i = idx(l, c, r);
  if (t30[i] !== (l ^ (c | r))) ok = false;
  if (t120[i] !== (l ^ (c & r))) ok = false;
  if (t30[i] !== t120[i]) diffs.push(`(l,c,r)=(${l},${c},${r}) 30->${t30[i]} 120->${t120[i]}`);
}
console.log('rule 30 == l XOR (c OR r) and rule 120 == l XOR (c AND r):', ok);
console.log('table entries where they differ:');
diffs.forEach((d) => console.log('  ', d));

// 2. evolve both from a single black cell, 200 rows, on a wide zero background
const N = 200, W = 2 * N + 3, ORIGIN = N + 1;
function evolve(tab) {
  let row = new Uint8Array(W); row[ORIGIN] = 1;
  const centre = [], support = [];
  for (let t = 0; t <= N; t++) {
    let lo = -1, hi = -1;
    for (let x = 0; x < W; x++) if (row[x]) { if (lo < 0) lo = x; hi = x; }
    centre.push(row[ORIGIN]);
    support.push(lo < 0 ? null : [lo - ORIGIN, hi - ORIGIN]);
    const next = new Uint8Array(W);
    for (let x = 1; x < W - 1; x++) next[x] = tab[idx(row[x - 1], row[x], row[x + 1])];
    row = next;
  }
  return { centre, support };
}
const a = evolve(t30), b = evolve(t120);
console.log('\nrule  30 centre column t=0..79:', a.centre.slice(0, 80).join(''));
console.log('rule 120 centre column t=0..79:', b.centre.slice(0, 80).join(''));
console.log('rule 120 centre column, any black at t>=1:', b.centre.slice(1).some((x) => x === 1));
console.log('rule  30 centre column black count over t=0..200:', a.centre.filter((x) => x).length);
console.log('\nrow support [leftmost,rightmost] relative to seed:');
for (const t of [0, 1, 2, 3, 5, 10, 50, 100, 200]) {
  console.log(`  t=${String(t).padStart(3)}  30: ${JSON.stringify(a.support[t])}   120: ${JSON.stringify(b.support[t])}`);
}
console.log('\nrule 120 support is the single cell {t}? ',
  b.support.every(([lo, hi], t) => lo === t && hi === t));
console.log('rule  30 left edge is -t?           ', a.support.every(([lo], t) => lo === -t));
console.log('rule 120 population per row always 1:', b.support.every(([lo, hi]) => lo === hi));

// 3. the board's derived objects, read off rule 120's picture
function picture(tab) {
  let row = new Uint8Array(W); row[ORIGIN] = 1;
  const rows = [];
  for (let t = 0; t <= N; t++) {
    rows.push(row);
    const next = new Uint8Array(W);
    for (let x = 1; x < W - 1; x++) next[x] = tab[idx(row[x - 1], row[x], row[x + 1])];
    row = next;
  }
  return (t, x) => rows[t][ORIGIN + x];
}
const P30 = picture(t30), P120 = picture(t120);
const LD = (P) => (k, j) => P(j + k, -j);          // leftDiagonal k j
const RD = (P) => (k, j) => P(j + k, j);           // rightDiagonal k j
const show = (f, n) => Array.from({ length: n }, (_, i) => (f(i) ? 1 : 0)).join('');
console.log('\nleft/right diagonals and centre column, rule 120:');
for (const k of [0, 1, 2, 3]) {
  console.log(`  leftDiagonal ${k}  j=0..29: ${show((j) => LD(P120)(k, j), 30)}   (rule 30: ${show((j) => LD(P30)(k, j), 30)})`);
}
for (const k of [0, 1, 2, 3]) {
  console.log(`  rightDiagonal ${k} j=0..29: ${show((j) => RD(P120)(k, j), 30)}   (rule 30: ${show((j) => RD(P30)(k, j), 30)})`);
}
// the three edge diagonals the board proves
console.log('\nrule 120: left edge evolve t (-t) black for all t? ',
  Array.from({ length: N }, (_, t) => P120(t, -t)).every((v) => v === 1));
console.log('rule 120: second-left evolve (t+1) (-t) black? ',
  Array.from({ length: N }, (_, t) => P120(t + 1, -t)).every((v) => v === 1));
console.log('rule 120: right edge evolve t t black for all t? ',
  Array.from({ length: N }, (_, t) => P120(t, t)).every((v) => v === 1));
console.log('rule 120: second-right evolve (t+1) t alternates? ',
  show((t) => P120(t + 1, t), 20), ' (rule 30: ', show((t) => P30(t + 1, t), 20), ')');

// 4. the packed-row / T-function dictionary
const T = (g) => (r) => (4n * r) ^ g(2n * r, r);
const T30 = T((x, y) => x | y), T120 = T((x, y) => x & y);
let r30 = 1n, r120 = 1n, dict30 = true, dict120 = true;
for (let t = 0; t <= 60; t++) {
  if (((r30 >> BigInt(t)) & 1n) !== BigInt(P30(t, 0))) dict30 = false;
  if (((r120 >> BigInt(t)) & 1n) !== BigInt(P120(t, 0))) dict120 = false;
  r30 = T30(r30); r120 = T120(r120);
}
console.log('\ncenterColumn t = bit_t(rowNat t): rule 30', dict30, '| rule 120', dict120);
console.log('rule 120 orbit of 1 under r -> 4r XOR (2r AND r):',
  [1n, T120(1n), T120(T120(1n)), T120(T120(T120(1n)))].map(String).join(', '), '(= 4^t)');
