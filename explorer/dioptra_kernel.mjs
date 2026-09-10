// Dioptra, 2026-09-10.  The 2-kernel of the centre column.
//
// WHY.  Christol's theorem: a sequence over F_q is q-automatic exactly when its
// generating series is ALGEBRAIC over F_q(x).  Eventually periodic implies
// rational implies algebraic implies 2-automatic implies FINITE 2-KERNEL.  So
//
//     the 2-kernel of the centre column is infinite   =>   P1.
//
// The 2-kernel is the set of subsequences  t |-> c(2^k t + r),  0 <= r < 2^k,
// k >= 0.  Thue-Morse has a 2-kernel of size 2.  This measures rule 30's.
//
// A finite computation can only give a LOWER bound on the kernel's size — two
// members are certainly distinct once their prefixes differ — which is the
// useful direction.

const K = 9;            // kernel depth
const M = 128;          // prefix length used to separate kernel members
const T = (1 << K) * M + 4;

// ---- packed-row engine ------------------------------------------------------
// bit i of the row at time t is the cell at position i - t.
const WORDS = Math.ceil((2 * T + 8) / 32);
let row = new Uint32Array(WORDS), tmpA = new Uint32Array(WORDS), tmpB = new Uint32Array(WORDS);
function shiftLeft(src, dst, k) {
  const w = k >>> 5, b = k & 31;
  if (b === 0) { for (let i = WORDS - 1; i >= 0; i--) dst[i] = i - w >= 0 ? src[i - w] : 0; return; }
  for (let i = WORDS - 1; i >= 0; i--) {
    const lo = i - w >= 0 ? src[i - w] : 0;
    const hi = i - w - 1 >= 0 ? src[i - w - 1] : 0;
    dst[i] = ((lo << b) | (hi >>> (32 - b))) >>> 0;
  }
}
function getBit(a, i) { return (a[i >>> 5] >>> (i & 31)) & 1; }

const c = new Uint8Array(T);
row[0] = 1;
for (let t = 0; t < T; t++) {
  c[t] = getBit(row, t);
  shiftLeft(row, tmpA, 2);      // 4r
  shiftLeft(row, tmpB, 1);      // 2r
  for (let i = 0; i < WORDS; i++) row[i] = (tmpA[i] ^ (tmpB[i] | row[i])) >>> 0;
}
// engine check against Rule30/Basic.lean's kernel-verified prefix
const head = Array.from(c.subarray(0, 11)).join('');
console.log('engine check: centre column head', head, head === '11011100110' ? '== Basic.lean OK' : '*** MISMATCH ***');

// ---- 2-kernel ---------------------------------------------------------------
function kernelReport(name, seq) {
  console.log(`\n  ${name}`);
  console.log('   k   subsequences 2^k   distinct (by a prefix of ' + M + ')');
  let prev = 0;
  for (let k = 0; k <= K; k++) {
    const seen = new Set();
    for (let r = 0; r < (1 << k); r++) {
      let s = '';
      for (let t = 0; t < M; t++) s += seq[(t << k) + r];
      seen.add(s);
    }
    console.log(`   ${k}   ${String(1 << k).padStart(6)}             ${seen.size}` +
      (k > 0 ? `   (+${seen.size - prev})` : ''));
    prev = seen.size;
  }
}

kernelReport('rule 30 centre column', c);

{
  const tm = new Uint8Array(T);
  for (let i = 0; i < T; i++) { let v = i, b = 0; while (v) { b ^= v & 1; v >>>= 1; } tm[i] = b; }
  kernelReport('Thue-Morse (2-automatic; kernel size 2)', tm);
}
{
  let s = '1'; while (s.length < T) s = s.split('').map(ch => ch === '1' ? '10' : '11').join('');
  const pd = new Uint8Array(T); for (let i = 0; i < T; i++) pd[i] = s.charCodeAt(i) - 48;
  kernelReport('period-doubling (2-automatic)', pd);
}
{
  // an eventually periodic control: preperiod 7, period 5 — kernel must be finite
  const ep = new Uint8Array(T);
  for (let i = 0; i < T; i++) ep[i] = i < 7 ? [1,1,0,1,0,0,1][i] : [1,0,0,1,1][(i - 7) % 5];
  kernelReport('preperiod 7, period 5 (eventually periodic)', ep);
}
{
  let st = 12345;
  const rnd = new Uint8Array(T);
  for (let i = 0; i < T; i++) {
    st = (st + 0x9E3779B9) >>> 0;
    let z = st;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    rnd[i] = ((z ^ (z >>> 15)) >>> 31);
  }
  kernelReport('nonlinear coin', rnd);
}
