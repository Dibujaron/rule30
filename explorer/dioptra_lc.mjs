// Dioptra, 2026-09-10.
// Linear complexity profile of the rule 30 centre column, over GF(2).
//
// Why: a sequence eventually periodic with preperiod N and period p has
// linear complexity L(n) <= N + p for every n.  So a measured L(n) is an
// UNCONDITIONAL lower bound on N + p, and a proof that L(n) -> infinity
// would be a proof of P1.  Also records the Hankel-determinant profile:
// det H_n != 0 over F_2 iff L(2n) = n.
//
// Engine: rowNat as a BigInt, row_{t+1} = (4r) ^ ((2r) | r); the centre cell
// at time t is bit t.  Cross-checked against the first terms of A051023.

const N = 20000;

// ---- generate the centre column -------------------------------------------
function centreColumn(n) {
  const out = new Uint8Array(n);
  let r = 1n;
  for (let t = 0; t < n; t++) {
    out[t] = Number((r >> BigInt(t)) & 1n);
    r = (r << 2n) ^ ((r << 1n) | r);
  }
  return out;
}

// ---- Berlekamp-Massey over GF(2) ------------------------------------------
// Returns the profile L(1..n) as an Int32Array.
function bmProfile(s) {
  const n = s.length;
  const C = new Uint8Array(n + 1); C[0] = 1;
  const B = new Uint8Array(n + 1); B[0] = 1;
  const T = new Uint8Array(n + 1);
  const profile = new Int32Array(n + 1);
  let L = 0, m = 1;
  for (let k = 0; k < n; k++) {
    let d = s[k];
    for (let i = 1; i <= L; i++) if (C[i]) d ^= s[k - i];
    if (d === 0) {
      m += 1;
    } else if (2 * L <= k) {
      T.set(C.subarray(0, L + 1));
      for (let i = L + 1; i <= n; i++) T[i] = 0;
      // C <- C + x^m B
      for (let i = 0; i + m <= n; i++) if (B[i]) C[i + m] ^= 1;
      const newL = k + 1 - L;
      B.set(T.subarray(0, n + 1));
      L = newL; m = 1;
    } else {
      for (let i = 0; i + m <= n; i++) if (B[i]) C[i + m] ^= 1;
      m += 1;
    }
    profile[k + 1] = L;
  }
  return profile;
}

// ---- sanity: A051023 first terms ------------------------------------------
const c = centreColumn(N);
// Checked against Rule30/Basic.lean's own kernel-verified `decide` example,
// which pins the first eleven centre cells as 11011100110.  (An earlier
// version of this script compared against a REMEMBERED A051023 prefix; the
// remembered string was wrong and the engine was right.)
const head = Array.from(c.subarray(0, 11)).join('');
console.log('centre column head :', head);
console.log('Basic.lean example :', '11011100110');
console.log('match              :', head === '11011100110');

// control: Berlekamp-Massey on a known sequence
{
  // (10)^inf has period 2, so L(n) = 2 for n >= 2 and never grows.
  const alt = new Uint8Array(200); for (let i = 0; i < 200; i++) alt[i] = i % 2;
  const p = bmProfile(alt);
  console.log('control (10)^inf   : L(200) =', p[200], '(want 2)');
  // a de Bruijn-ish LFSR sequence of period 15 from x^4+x+1
  const lf = new Uint8Array(200); let st = [1, 0, 0, 0];
  for (let i = 0; i < 200; i++) { lf[i] = st[3]; const nb = st[3] ^ st[0]; st = [nb, st[0], st[1], st[2]]; }
  const p2 = bmProfile(lf);
  console.log('control LFSR(4)    : L(200) =', p2[200], '(want 4)');
  // periodic with preperiod: 5 junk bits then period 3
  const pp = new Uint8Array(300); for (let i = 0; i < 300; i++) pp[i] = i < 5 ? [1,1,0,1,0][i] : [1,0,0][(i-5)%3];
  console.log('control pre5.per3  : L(300) =', bmProfile(pp)[300], '(want <= 8)');
}

// ---- the real thing --------------------------------------------------------
console.time('bm');
const prof = bmProfile(c);
console.timeEnd('bm');

console.log('\nn\tL(n)\tL(n)-n/2');
for (const n of [16, 64, 256, 1024, 4096, 8192, 16384, N]) {
  if (n > N) continue;
  console.log(`${n}\t${prof[n]}\t${(prof[n] - n / 2).toFixed(1)}`);
}

// deviation statistics: d(n) = L(n) - n/2
let maxAbove = -1e9, maxBelow = 1e9, argAbove = 0, argBelow = 0;
for (let n = 1; n <= N; n++) {
  const d = prof[n] - n / 2;
  if (d > maxAbove) { maxAbove = d; argAbove = n; }
  if (d < maxBelow) { maxBelow = d; argBelow = n; }
}
console.log(`\ndeviation L(n) - n/2 : max ${maxAbove} at n=${argAbove}, min ${maxBelow} at n=${argBelow}`);

// jump structure: L jumps by (k+1-2L_old) at a discrepancy with 2L<=k.
// A PERFECT profile has |L(n) - n/2| <= 1/2 for every n.
let perfect = true, firstBreak = -1;
for (let n = 1; n <= N; n++) {
  if (Math.abs(prof[n] - n / 2) > 0.5) { perfect = false; if (firstBreak < 0) firstBreak = n; }
}
console.log(`perfect linear complexity profile : ${perfect}` + (perfect ? '' : `  (first break at n=${firstBreak})`));

// Hankel determinants: det H_m != 0 over F_2 iff L(2m) = m.
let nonzero = 0, zero = 0, firstZero = -1;
for (let m = 1; 2 * m <= N; m++) {
  if (prof[2 * m] === m) nonzero++;
  else { zero++; if (firstZero < 0) firstZero = m; }
}
console.log(`Hankel over F_2 : ${nonzero} nonsingular, ${zero} singular, of ${Math.floor(N / 2)}` +
  (firstZero > 0 ? `; first singular at m=${firstZero}` : ''));

// the unconditional consequence
console.log(`\nUNCONDITIONAL: any eventual period p with preperiod N0 of the centre column satisfies N0 + p >= ${prof[N]}.`);

// ---- comparison sequences --------------------------------------------------
// The point: a proof that L(n) -> infinity exists in the literature for exactly
// one kind of explicit sequence — automatic sequences whose Hankel determinants
// obey a substitution recursion (Allouche-Peyriere-Wen-Wen for Thue-Morse).
// Those sequences have a PERFECT profile, |L(n) - n/2| <= 1/2 for every n.
// Rule 30's does not.  That is the seam, and it is measurable.
function profileReport(name, s) {
  const p = bmProfile(s);
  const n = s.length;
  let worst = 0, argw = 0, firstBreak = -1;
  for (let k = 1; k <= n; k++) {
    const d = Math.abs(p[k] - k / 2);
    if (d > worst) { worst = d; argw = k; }
    if (d > 0.5 && firstBreak < 0) firstBreak = k;
  }
  let nz = 0; for (let m = 1; 2 * m <= n; m++) if (p[2 * m] === m) nz++;
  console.log(`  ${name.padEnd(22)} L(${n}) = ${String(p[n]).padStart(6)}   max |L-n/2| = ${worst.toFixed(1)} at n=${argw}` +
    `   perfect: ${firstBreak < 0 ? 'YES' : 'no (first break n=' + firstBreak + ')'}` +
    `   nonsingular Hankel ${nz}/${Math.floor(n / 2)}`);
}
console.log('\n--- linear complexity profiles side by side (depth 8192) ---');
{
  const M = 8192;
  const tm = new Uint8Array(M);
  for (let i = 0; i < M; i++) { let v = i, b = 0; while (v) { b ^= v & 1; v >>>= 1; } tm[i] = b; }
  profileReport('Thue-Morse', tm);

  // period-doubling sequence: fixed point of 1 -> 10, 0 -> 11
  {
    let s = '1';
    while (s.length < M) s = s.split('').map(ch => ch === '1' ? '10' : '11').join('');
    const pd = new Uint8Array(M); for (let i = 0; i < M; i++) pd[i] = s.charCodeAt(i) - 48;
    profileReport('period-doubling', pd);
  }
  // regular paperfolding sequence
  {
    const pf = new Uint8Array(M);
    for (let i = 1; i <= M; i++) { let k = i; while ((k & 1) === 0) k >>= 1; pf[i - 1] = ((k >> 1) & 1) ^ 1; }
    profileReport('paperfolding', pf);
  }
  // rule 90's centre column from a single seed — eventually periodic (all white
  // after t = 0), so its linear complexity is bounded.  The control that shows
  // the criterion really does separate.
  {
    const r90 = new Uint8Array(M);
    let r = 1n;
    for (let t = 0; t < M; t++) { r90[t] = Number((r >> BigInt(t)) & 1n); r = (r << 2n) ^ r; }
    profileReport('rule 90 centre column', r90);
  }
  // a fair coin
  {
    let st = 2463534242;
    const rnd = new Uint8Array(M);
    for (let i = 0; i < M; i++) { st ^= st << 13; st ^= st >>> 17; st ^= st << 5; st >>>= 0; rnd[i] = st & 1; }
    profileReport('xorshift32 low bit', rnd);
  }
  profileReport('rule 30 centre column', c.subarray(0, M));
}

// the distribution of jump sizes (partial-quotient degrees of the continued
// fraction of the generating series in F_2((x))): a jump of size j at step k
// corresponds to a partial quotient of degree j.
const jumps = new Map();
for (let n = 1; n <= N; n++) {
  const j = prof[n] - prof[n - 1];
  if (j > 0) jumps.set(j, (jumps.get(j) ?? 0) + 1);
}
const ks = [...jumps.keys()].sort((a, b) => a - b);
console.log('\njump sizes (partial-quotient degrees) : ' +
  ks.map(k => `${k}:${jumps.get(k)}`).join('  '));
let tot = 0, cnt = 0;
for (const k of ks) { tot += k * jumps.get(k); cnt += jumps.get(k); }
console.log(`largest degree ${ks[ks.length - 1]}, mean ${(tot / cnt).toFixed(4)}, ${cnt} partial quotients`);
