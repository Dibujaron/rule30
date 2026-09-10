// Dioptra, 2026-09-10.  Corrected null, and the Wang-Massey criterion.
//
// CORRECTION to explorer/dioptra_lc2.mjs.  Its row labelled "fair coin" was the
// low bit of xorshift32, which is a LINEAR generator: its linear complexity is
// 32 and stays there, so the row read as a wild deviation when it was a tiny
// one.  A true nonlinear null is used here (multiply-xor mixing, high bit) and
// checked against the two things a coin must do: half its Hankel matrices
// nonsingular, and a largest partial-quotient degree near log2(n).
//
// WANG-MASSEY.  Search result (EUROCRYPT'86, "The characterization of all
// binary sequences with a perfect linear complexity profile"): a binary
// sequence (s_i)_{i>=1} has a perfect linear complexity profile iff s_1 = 1 and
// s_{2i+1} = s_{2i} + s_i (mod 2) for every i >= 1.  Calibrated below against
// the period-doubling sequence, which the previous script measured to have a
// perfect profile (30000/30000 nonsingular Hankel matrices at n = 60000), and
// then applied to the rule 30 centre column.

const N = 60000;

function centreColumn(n) {
  const out = new Uint8Array(n);
  let r = 1n;
  for (let t = 0; t < n; t++) { out[t] = Number((r >> BigInt(t)) & 1n); r = (r << 2n) ^ ((r << 1n) | r); }
  return out;
}
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
    if (d === 0) m += 1;
    else if (2 * L <= k) {
      T.set(C.subarray(0, L + 1)); for (let i = L + 1; i <= n; i++) T[i] = 0;
      for (let i = 0; i + m <= n; i++) if (B[i]) C[i + m] ^= 1;
      const nl = k + 1 - L; B.set(T.subarray(0, n + 1)); L = nl; m = 1;
    } else { for (let i = 0; i + m <= n; i++) if (B[i]) C[i + m] ^= 1; m += 1; }
    profile[k + 1] = L;
  }
  return profile;
}

const seqs = {};
seqs['rule 30 centre'] = centreColumn(N);
{ const a = new Uint8Array(N); for (let i = 0; i < N; i++) { let v = i, b = 0; while (v) { b ^= v & 1; v >>>= 1; } a[i] = b; } seqs['Thue-Morse'] = a; }
{ let s = '1'; while (s.length < N) s = s.split('').map(ch => ch === '1' ? '10' : '11').join('');
  const a = new Uint8Array(N); for (let i = 0; i < N; i++) a[i] = s.charCodeAt(i) - 48; seqs['period-doubling'] = a; }
// nonlinear null: multiply-xor mixing (Math.imul is nonlinear over F_2), high bit
function mixed(seed) {
  const a = new Uint8Array(N); let st = seed >>> 0;
  for (let i = 0; i < N; i++) {
    st = (st + 0x9E3779B9) >>> 0;
    let z = st;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    a[i] = z >>> 31;
  }
  return a;
}
seqs['nonlinear coin #1'] = mixed(1);
seqs['nonlinear coin #2'] = mixed(777);

console.log('n = ' + N + '\n');
console.log('sequence'.padEnd(20) + 'max|L-n/2|'.padStart(11) + 'max jump'.padStart(10) + 'nonsing.Hankel'.padStart(16) + '   density');
for (const [name, s] of Object.entries(seqs)) {
  const p = bmProfile(s);
  let dev = 0, jump = 0, nz = 0, tot = 0;
  for (let k = 1; k <= N; k++) {
    const d = Math.abs(p[k] - k / 2); if (d > dev) dev = d;
    const j = p[k] - p[k - 1]; if (j > jump) jump = j;
  }
  for (let m = 1; 2 * m <= N; m++) { tot++; if (p[2 * m] === m) nz++; }
  console.log(name.padEnd(20) + dev.toFixed(1).padStart(11) + String(jump).padStart(10) + `${nz}/${tot}`.padStart(16) + '   ' + (nz / tot).toFixed(4));
}
console.log('\nlog2(n) = ' + Math.log2(N).toFixed(1) + '  (the degree a coin\'s largest partial quotient should be near)');

// --- Wang-Massey ------------------------------------------------------------
console.log('\n--- Wang-Massey: s_1 = 1 and s_{2i+1} = s_{2i} + s_i (mod 2) ---');
console.log('(sequences here are 0-indexed, so s_i = a[i-1]; the test is');
console.log(' a[2i] = a[2i-1] XOR a[i-1] for i >= 1, plus a[0] = 1)');
for (const [name, a] of Object.entries(seqs)) {
  let viol = 0, tot = 0;
  for (let i = 1; 2 * i < N; i++) { tot++; if (a[2 * i] !== (a[2 * i - 1] ^ a[i - 1])) viol++; }
  console.log(`  ${name.padEnd(20)} a[0] = ${a[0]}   violations ${viol} of ${tot}   (rate ${(viol / tot).toFixed(4)})`);
}
console.log('\nThe period-doubling sequence is the calibrator: it measured a PERFECT');
console.log('profile above, so it must have zero violations if the criterion is stated');
console.log('right.  Whatever rule 30 scores, it scores against that calibration.');
