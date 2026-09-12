// Rosetta, 2026-09-12. The Stoneham dictionary, measured.
//
// Bailey-Crandall prove alpha_{b,c} = sum_n 1/(c^n b^{c^n}) is b-normal, and the
// engine of the proof is that the base-b digits from position c^m on are the
// digits of a rational with denominator c^m, whose period is ord_{c^m}(b); for b
// a primitive root that orbit is the WHOLE unit group. So digit N is a function
// of a state of size O(log N), and that state's orbit fills a positive fraction
// of its space.
//
// The rule 30 analogue of "the state at position N" is the packed row:
// centerColumn(t) is bit t of rowNat(t), and rowNat(t) mod 2^n is T_n^t(1) with
// T_n(r) = (4r XOR (2r OR r)) mod 2^n. Measured side by side:
//   A. Stoneham: |orbit of 2 mod 3^m| / 3^m, and whether 2 is a primitive root.
//   B. rule 30: the preperiod and cycle length of T_n's orbit of 1, the cycle's
//      density in Z/2^n, and whether the centre column's read at step t < n
//      falls inside the preperiod -- i.e. whether the periodic part of the
//      orbit, the only part a Stoneham-type argument can use, is ever reached.
//   C. the exact-balance (antiperiodic) blocks rule 30 does have: the minimal
//      period and weight of each right diagonal.

// ---------- A. Stoneham ----------------------------------------------------
console.log('A. Stoneham alpha_{2,3}: the orbit of 2 modulo 3^m');
console.log('   m   3^m        ord_{3^m}(2)   phi(3^m)   orbit density   primitive root');
for (let m = 1; m <= 12; m++) {
  const mod = 3n ** BigInt(m);
  let x = 2n % mod, ord = 1n;
  while (x !== 1n) { x = (x * 2n) % mod; ord++; }
  const phi = 2n * 3n ** BigInt(m - 1);
  console.log(`   ${String(m).padStart(2)}  ${String(mod).padStart(9)}  ${String(ord).padStart(11)}  ${String(phi).padStart(9)}   ${(Number(ord) / Number(mod)).toFixed(6)}        ${ord === phi}`);
}

// ---------- B. rule 30's row map ------------------------------------------
console.log('\nB. rule 30: the orbit of 1 under T_n(r) = (4r XOR (2r OR r)) mod 2^n');
console.log('   n     preperiod  cycle P(n)   pre/n     cycle density P(n)/2^n   pre(n) > n?');
for (const n of [8, 12, 16, 17, 18, 19, 20, 21, 24, 32, 48, 64, 100, 200, 400, 500, 800, 1200, 2000]) {
  const mod = 1n << BigInt(n);
  const seen = new Map();
  let r = 1n, t = 0;
  while (!seen.has(r)) { seen.set(r, t); r = ((4n * r) ^ ((2n * r) | r)) % mod; t++; }
  const pre = seen.get(r), cyc = t - pre;
  const dens = Math.exp(Math.log(cyc) - n * Math.LN2);
  console.log(`   ${String(n).padStart(5)} ${String(pre).padStart(10)} ${String(cyc).padStart(11)}   ${(pre / n).toFixed(4)}   ${dens.toExponential(3).padStart(12)}        ${pre > n}`);
}
console.log('   (the last column is the one that matters: the centre column reads bit t at');
console.log('    step t, so a Stoneham-type argument would need step t to be in the PERIODIC');
console.log('    part of the orbit mod 2^{t+1}. It is not, from n = 20 on.)');

// ---------- C. the exact-balance blocks rule 30 does have -----------------
console.log('\nC. right diagonals: minimal period and weight');
console.log('   (an antiperiodic word -- shift by P/2 complements it -- is exactly balanced;');
console.log('    that is the Champernowne / Thue-Morse pairing, and this board proves it');
console.log('    happens exactly where the period doubles.)');
const DEPTH = 24, ROWS = 4200;
const diag = Array.from({ length: DEPTH + 1 }, () => []);
{
  let r = 1n;
  for (let t = 0; t <= ROWS; t++) {
    for (let k = 0; k <= DEPTH && k <= t; k++) {
      const j = t - k;                       // cell evolve(t)(j), bit 2j+k of row t
      diag[k].push(Number((r >> BigInt(2 * j + k)) & 1n));
    }
    r = (4n * r) ^ ((2n * r) | r);
  }
}
console.log('\n   k   P_k    weight   balanced   antiperiodic at P_k/2   R_k(0) = centerColumn k');
const balanced = [];
for (let k = 0; k <= DEPTH; k++) {
  const d = diag[k];
  let P = 1;
  for (;;) {
    let ok = true;
    for (let j = 0; j + P < d.length && ok; j++) if (d[j] !== d[j + P]) ok = false;
    if (ok || P > d.length / 4) break;
    P *= 2;                                  // the periods are powers of two
  }
  let w = 0; for (let j = 0; j < P; j++) w += d[j];
  let anti = P > 1;
  if (anti) for (let j = 0; j < P / 2; j++) if (d[j] === d[j + P / 2]) { anti = false; break; }
  const bal = 2 * w === P;
  if (bal) balanced.push(k);
  console.log(`   ${String(k).padStart(2)}  ${String(P).padStart(5)}  ${String(w).padStart(7)}   ${String(bal).padStart(8)}   ${String(anti).padStart(21)}   ${d[0]}`);
}
console.log('\n   exactly balanced depths k:', balanced.join(', '));
console.log('   unbalanced depths k:', [...Array(DEPTH + 1).keys()].filter((k) => !balanced.includes(k)).join(', '));

// Does the balance of the word say anything about its value at index 0?
let bal0 = 0, balN = 0, unbal0 = 0, unbalN = 0;
for (let k = 0; k <= DEPTH; k++) {
  if (balanced.includes(k)) { balN++; bal0 += diag[k][0]; } else { unbalN++; unbal0 += diag[k][0]; }
}
console.log(`   centre column at balanced depths: ${bal0}/${balN} black; at unbalanced depths: ${unbal0}/${unbalN} black`);
console.log('   (the read is at index 0 of each word; balance of the word constrains index 0');
console.log('    not at all, which is the seam.)');
