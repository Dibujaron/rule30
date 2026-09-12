// Rosetta, 2026-09-12. Independent guard for the centre column used in
// rosetta_controls.mjs, whose hand-typed expected prefix was wrong.
// This engine shares no code with the packed-row one: it is a literal
// cell-by-cell evolution of rule30 c i = c(i-1) XOR (c(i) OR c(i+1)) on an
// array, exactly Basic.lean's rule30_eq, with the cone padded white.

const T = 200;
const W = 2 * T + 5;
let row = new Uint8Array(W);
row[T + 2] = 1;                      // the single black cell at the origin
const col = [];
for (let t = 0; t < T; t++) {
  col.push(row[T + 2]);
  const next = new Uint8Array(W);
  for (let i = 1; i < W - 1; i++) next[i] = row[i - 1] ^ (row[i] | row[i + 1]);
  row = next;
}
const literal = col.join('');

// the packed-row engine, as used in the other scripts
const packed = [];
{
  let r = 1n;
  for (let t = 0; t < T; t++) {
    packed.push(Number((r >> BigInt(t)) & 1n));
    r = (4n * r) ^ ((2n * r) | r);
  }
}
const p = packed.join('');

console.log('literal cell-by-cell :', literal.slice(0, 48));
console.log('packed row           :', p.slice(0, 48));
console.log('agree over', T, 'terms:', literal === p);

// the board's own kernel guard in Basic.lean is on the SETTLED centre column,
// a different object; reproduce it too, as a second anchor.
// settledCenter k = leftDiagonal k (2^k) = evolve(2^k + k)(-2^k)
{
  const K = 10, TT = (1 << K) + K + 2, WW = 2 * TT + 5;
  let r2 = new Uint8Array(WW);
  r2[TT + 2] = 1;
  const pic = [];
  for (let t = 0; t <= TT; t++) {
    pic.push(r2);
    const nx = new Uint8Array(WW);
    for (let i = 1; i < WW - 1; i++) nx[i] = r2[i - 1] ^ (r2[i] | r2[i + 1]);
    r2 = nx;
  }
  const settled = [];
  for (let k = 0; k <= K; k++) settled.push(pic[(1 << k) + k][TT + 2 - (1 << k)]);
  console.log('settledCenter 0..10  :', settled.join(','),
    '\n  Basic.lean expects   : 1,1,0,1,1,1,0,0,1,1,0  ->',
    settled.join(',') === '1,1,0,1,1,1,0,0,1,1,0');
}
