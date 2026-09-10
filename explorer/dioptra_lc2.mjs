// Dioptra, 2026-09-10.  How the linear complexity profile DEVIATES, and how
// that deviation grows.  The point of the comparison:
//
//   * Thue-Morse and the period-doubling sequence have RIGID profiles — the
//     deviation |L(n) - n/2| stays at 1 or 1/2 for ever.  That rigidity is
//     exactly what Allouche-Peyriere-Wen-Wen prove, and it is the only kind of
//     explicit sequence for which anybody has ever proved unbounded linear
//     complexity.
//   * A fair coin's deviation grows like log2(n), because the partial-quotient
//     degrees are geometric(1/2) and the maximum of N of them is ~log2 N.
//   * Rule 30's centre column behaves like the coin, not like Thue-Morse.

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
function maxDevUpTo(p, n) { let w = 0; for (let k = 1; k <= n; k++) { const d = Math.abs(p[k] - k / 2); if (d > w) w = d; } return w; }

const seqs = {};
seqs['rule 30 centre'] = centreColumn(N);
{ const a = new Uint8Array(N); for (let i = 0; i < N; i++) { let v = i, b = 0; while (v) { b ^= v & 1; v >>>= 1; } a[i] = b; } seqs['Thue-Morse'] = a; }
{ let s = '1'; while (s.length < N) s = s.split('').map(ch => ch === '1' ? '10' : '11').join('');
  const a = new Uint8Array(N); for (let i = 0; i < N; i++) a[i] = s.charCodeAt(i) - 48; seqs['period-doubling'] = a; }
{ let st = 2463534242; const a = new Uint8Array(N);
  for (let i = 0; i < N; i++) { st ^= st << 13; st ^= st >>> 17; st ^= st << 5; st >>>= 0; a[i] = st & 1; } seqs['fair coin'] = a; }
{ let st = 88172645; const a = new Uint8Array(N);
  for (let i = 0; i < N; i++) { st ^= st << 13; st ^= st >>> 17; st ^= st << 5; st >>>= 0; a[i] = st & 1; } seqs['fair coin (2nd)'] = a; }

const marks = [1000, 4000, 8000, 20000, 40000, N];
console.log('max |L(n) - n/2| over the first n terms\n');
console.log('sequence'.padEnd(18) + marks.map(m => String(m).padStart(8)).join(''));
for (const [name, s] of Object.entries(seqs)) {
  const p = bmProfile(s);
  console.log(name.padEnd(18) + marks.map(m => maxDevUpTo(p, m).toFixed(1).padStart(8)).join(''));
}

console.log('\nlargest partial-quotient degree (largest single jump of L) over the first n terms\n');
console.log('sequence'.padEnd(18) + marks.map(m => String(m).padStart(8)).join('') + '   log2(n) at the end');
for (const [name, s] of Object.entries(seqs)) {
  const p = bmProfile(s);
  const row = marks.map(m => { let w = 0; for (let k = 1; k <= m; k++) { const j = p[k] - p[k - 1]; if (j > w) w = j; } return String(w).padStart(8); }).join('');
  console.log(name.padEnd(18) + row + '   ' + Math.log2(N).toFixed(1));
}

// The Wang-Massey style question: which sequences have EVERY Hankel
// determinant nonzero over F_2, i.e. a perfect profile?  Report the fraction.
console.log('\nfraction of Hankel matrices H_m (m <= n/2) nonsingular over F_2, n = ' + N);
for (const [name, s] of Object.entries(seqs)) {
  const p = bmProfile(s);
  let nz = 0, tot = 0;
  for (let m = 1; 2 * m <= N; m++) { tot++; if (p[2 * m] === m) nz++; }
  console.log('  ' + name.padEnd(18) + (nz / tot).toFixed(4) + `   (${nz}/${tot})`);
}
