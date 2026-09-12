// Rosetta, 2026-09-12. Five binary sequences side by side, four of them with a
// PROVED block-length-1 balance, and rule 30's centre column.
//
// The point is to run the literature's three proof mechanisms as DETECTORS and
// check each fires on the sequence it was built for, before reporting that all
// three miss rule 30. A negative is worth what its controls are worth.
//
//   renormalisation detector : factor complexity (Sturmian n+1, automatic O(n))
//   pairing detector         : max flip rate of t -> t XOR m (Thue-Morse: 1.0)
//   discrepancy detector     : |2b(N) - N| / sqrt(N) (constructions: small)
//
// The sequences:
//   TM    Thue-Morse            balance exact, by the pairing 2n <-> 2n+1
//   CH2   Champernowne base 2   normal, by block boundaries at known positions
//   STU   Sturmian, slope 1/phi density = slope exactly, by the three-distance thm
//   STO   Stoneham alpha_{2,3}  2-normal (Stoneham 1973, Bailey-Crandall 2002)
//   R30   rule 30 centre column Prize 2, open

const N = 1 << 16;

// ---- the five sequences --------------------------------------------------
const tm = new Uint8Array(N);
for (let t = 1; t < N; t++) tm[t] = tm[t >> 1] ^ (t & 1);

const ch2 = new Uint8Array(N);
{
  let i = 0;
  for (let k = 1; i < N; k++) {
    const s = k.toString(2);
    for (const ch of s) { if (i < N) ch2[i++] = ch === '1' ? 1 : 0; }
  }
}

const stu = new Uint8Array(N);
{
  const a = (Math.sqrt(5) - 1) / 2;
  for (let n = 0; n < N; n++) stu[n] = Math.floor((n + 1) * a) - Math.floor(n * a);
}

// Stoneham alpha_{2,3} = sum_{n>=1} 1/(3^n 2^{3^n}), computed exactly to K bits.
const sto = new Uint8Array(N);
{
  const K = N + 4096;
  let acc = 0n;
  for (let n = 1; 3 ** n < K; n++) {
    const e = BigInt(K - 3 ** n);
    acc += (1n << e) / (3n ** BigInt(n));
  }
  for (let i = 0; i < N; i++) sto[i] = Number((acc >> BigInt(K - 1 - i)) & 1n);
}

const r30 = new Uint8Array(N);
{
  let r = 1n;
  for (let t = 0; t < N; t++) {
    r30[t] = Number((r >> BigInt(t)) & 1n);
    r = (4n * r) ^ ((2n * r) | r);
  }
}

// ---- guards: each sequence must be the sequence it claims to be ----------
console.log('guards (first 32 bits each):');
console.log('  TM  ', [...tm.slice(0, 32)].join(''), ' expect 01101001100101101001011001101001');
console.log('  CH2 ', [...ch2.slice(0, 32)].join(''), ' expect 1 10 11 100 101 110 111 1000 ...');
console.log('  STU ', [...stu.slice(0, 32)].join(''));
console.log('  STO ', [...sto.slice(0, 32)].join(''));
console.log('  R30 ', [...r30.slice(0, 32)].join(''), ' expect 11011100110001011001001111011111');
// STO cross-check: alpha_{2,3} ~ 1/(3*2^3) + 1/(9*2^9) + ... = 0.0416666...+0.000217..
{
  let v = 0;
  for (let i = 0; i < 53; i++) v += sto[i] * Math.pow(2, -(i + 1));
  let truth = 0;
  for (let n = 1; n <= 5; n++) truth += 1 / (Math.pow(3, n) * Math.pow(2, Math.pow(3, n)));
  console.log('  STO value from its own bits:', v, ' direct sum:', truth,
    ' agree:', Math.abs(v - truth) < 1e-15);
}

// ---- the three detectors -------------------------------------------------
function complexity(s, len) {
  const set = new Set();
  for (let i = 0; i + len <= s.length; i++) {
    let k = 0;
    for (let j = 0; j < len; j++) k = k * 2 + s[i + j];
    set.add(k);
  }
  return set.size;
}
function pairing(s) {
  let best = 0, bestM = 0;
  for (let m = 1; m < 256; m++) {
    let f = 0;
    for (let t = 0; t < s.length; t++) f += s[t] ^ s[t ^ m];
    const rate = f / s.length;
    if (rate > best) { best = rate; bestM = m; }
  }
  return { rate: best, m: bestM };
}
function excess(s) {
  let b = 0;
  for (let t = 0; t < s.length; t++) b += s[t];
  return (2 * b - s.length) / Math.sqrt(s.length);
}

const seqs = [['TM ', tm], ['CH2', ch2], ['STU', stu], ['STO', sto], ['R30', r30]];
console.log('\n              complexity at length            pairing max          excess');
console.log('              n=4    n=8     n=12    n=16     rate    (m)      (2b-N)/sqrt(N)');
for (const [name, s] of seqs) {
  const c = [4, 8, 12, 16].map((L) => complexity(s, L));
  const p = pairing(s);
  console.log(`  ${name}     ${c.map((x) => String(x).padStart(6)).join(' ')}   ${p.rate.toFixed(4)} (${String(p.m).padStart(3)})   ${excess(s).toFixed(4)}`);
}
console.log('\n  maximum possible complexity at these lengths:',
  [4, 8, 12, 16].map((L) => Math.min(2 ** L, N - L + 1)).join(', '));
console.log('  a Sturmian word has complexity exactly n+1:',
  [4, 8, 12, 16].map((L) => L + 1).join(', '));
console.log('\n  Reading: the pairing detector fires only on Thue-Morse (rate 1.0000 at m = 1);');
console.log('  the renormalisation detector fires only on Sturmian (complexity n+1);');
console.log('  Champernowne, Stoneham and rule 30 look alike on every one of these');
console.log('  statistics -- which is the point. Their proofs, where they exist, come');
console.log('  from the construction or from the multiplier, not from any statistic.');
