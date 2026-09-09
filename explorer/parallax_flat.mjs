/**
 * Parallax / connect: does rule 30 ITSELF admit a picture with an automatic
 * column?
 *
 * The tempting non-argument is "rule 30 is nonlinear over F_2, so its columns
 * cannot be automatic". Talus's counterexample configuration X_b -- white at
 * every x >= 1, centre column b = (10)^inf -- is a genuine rule 30 picture
 * (obstruction 7's travelling wave) whose column 1 Talus measured to have only
 * 48 distinct factors of length 32, i.e. LINEAR factor complexity, where the
 * seed's centre column has ~5*10^5. Cobham's bound p(n) = O(n) is the necessary
 * condition for automaticity, so this column passes the one test the seed's
 * column fails by five orders of magnitude.
 *
 * This script asks whether it is actually 2-automatic, by the same kernel test
 * used in parallax_kernel.mjs.
 *
 * Sections
 *   A  build X_b's right half-line from the boundary b, check it against a real
 *      full-line evolution of the configuration ...10101|000...
 *   B  factor complexity of column 1 (Cobham's necessary condition)
 *   C  the 2-kernel of column 1, and of the same object for other k
 */

const D = 1 << 20;

/** right half-line: cell at x = k+1 at time t, boundary b at x = 0, white start */
function halfRight(b, depth, width) {
  let a = new Uint8Array(width + 2), n = new Uint8Array(width + 2);
  const col1 = new Uint8Array(depth), col2 = new Uint8Array(depth);
  for (let t = 0; t < depth; t++) {
    col1[t] = a[0]; col2[t] = a[1];
    n[0] = b(t) ^ (a[0] | a[1]);
    for (let k = 1; k < width; k++) n[k] = a[k - 1] ^ (a[k] | a[k + 1]);
    const tmp = a; a = n; n = tmp;
  }
  return { col1, col2 };
}

console.log('--- A. engine check: the half-line driven by the SEED must rebuild the seed ---');
{
  const T = 1200, W = 2 * T + 6, O = T + 2;
  let a = new Uint8Array(W), n = new Uint8Array(W);
  a[O] = 1;
  const c0 = [], c1 = [], c2 = [];
  for (let t = 0; t < T; t++) {
    c0.push(a[O]); c1.push(a[O + 1]); c2.push(a[O + 2]);
    for (let i = 1; i < W - 1; i++) n[i] = a[i - 1] ^ (a[i] | a[i + 1]);
    const tmp = a; a = n; n = tmp;
  }
  const hr = halfRight(t => c0[t], T, T + 4);
  let b1 = 0, b2 = 0;
  for (let t = 0; t < T; t++) { if (hr.col1[t] !== c1[t]) b1++; if (hr.col2[t] !== c2[t]) b2++; }
  console.log(`  half-line vs the seed's own columns 1 and 2, ${T} rows: ${b1} and ${b2} mismatches`);

  // obstruction 2's boundary: b === true. Its columns go eventually constant,
  // so THEY ARE eventually periodic and hence 2-automatic -- a rule 30 picture
  // with automatic columns exists, and the rule alone cannot forbid one.
  const ht = halfRight(() => 1, 200, 400);
  console.log(`  boundary b = 1^inf: column 1 rows 2..20 = ` +
    `${[...ht.col1.slice(2, 20)].join('')}, column 2 = ${[...ht.col2.slice(2, 20)].join('')}` +
    `  (obstruction 2: both constant from row 2)`);
}

const { col1 } = halfRight(t => (t % 2 === 0 ? 1 : 0), D, D / 2 + 8);

console.log('\n--- B. factor complexity of column 1 (Cobham needs p(n) = O(n)) ---');
{
  for (const n of [8, 16, 32, 64, 128, 256]) {
    const seen = new Set();
    let s = '';
    for (let i = 0; i < D; i++) {
      s += col1[i];
      if (s.length > n) s = s.slice(1);
      if (s.length === n) seen.add(s);
    }
    console.log(`  p(${String(n).padStart(3)}) = ${String(seen.size).padStart(5)}` +
      `   p(n)/n = ${(seen.size / n).toFixed(2)}`);
  }
}

console.log('\n--- C. the k-kernel of column 1 ---');
function kernelProfile(seq, emax, prefix, k = 2) {
  const seen = new Set(); const cum = []; let total = 0;
  for (let e = 0; e <= emax; e++) {
    const ke = k ** e;
    for (let r = 0; r < ke; r++) {
      let s = '';
      for (let n = 0; n < prefix; n++) {
        const i = ke * n + r;
        if (i >= seq.length) throw new Error('too short');
        s += seq[i];
      }
      if (!seen.has(s)) { seen.add(s); total++; }
    }
    cum.push(total);
  }
  return cum;
}
for (const k of [2, 3, 4]) {
  let em = 0; while (k ** (em + 1) * 63 < D) em++;
  const cu = kernelProfile(col1, em, 64, k);
  console.log(`  k = ${k}: kernel by e=0..${em}: ${cu.join(' ')}` +
    `   (max ${(k ** (em + 1) - 1) / (k - 1)})`);
}
