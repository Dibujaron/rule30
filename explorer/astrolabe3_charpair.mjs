// Astrolabe, 2026-09-13. Algebraic-circuit vantage. The characteristic-two price.
//
// The brief asks this priced first: does characteristic two kill the measures?
// Two of them turn on derivatives, and in characteristic two the FORMAL
// derivative of a circuit is not the discrete derivative of the function it
// computes, because d(x^2)/dx = 2x = 0 while x^2 = x on the cube.
//
// (A) Baur-Strassen says the whole gradient costs at most a constant factor more
//     than the single output. Here: the natural simulation circuit for rule 30
//     (one gate layer per time step, l + c + r + c*r over F2) is differentiated in
//     reverse mode with the FORMAL rules, and the result is compared to the
//     genuine sensitivity vector -- flipping cell j of row 0 and seeing whether
//     cell (t,0) flips. They are the same thing over the rationals and different
//     objects over F2. Measured: how often they differ.
//
// (B) The Strassen degree bound in its elementary form is size >= log2(degree).
//     Over F2 the function's own degree is 2t-1 (multilinear), giving log2(2t-1).
//     If instead one insists that the circuit compute the FORMAL composite, the
//     degree doubles per step. This computes the formal total degree exactly, by
//     substituting x_j -> c_j * u for random c_j in a large field and reading the
//     degree in u -- which is the formal total degree unless the leading form
//     vanishes at c.

// ---------------- (A) formal gradient vs sensitivity ----------------

// Evaluate the cone at a Boolean point, with reverse-mode FORMAL differentiation
// over F2 of the natural circuit  new = l ^ (c & r) ^ c ^ r   ( = l + c + r + cr ).
function formalGradient(t, x0) {
  const n = 2 * t + 1;
  // forward pass: rows[s][j] = value of cell j at time s (j in [s, n-1-s])
  const rows = [x0.slice()];
  for (let s = 1; s <= t; s++) {
    const prev = rows[s - 1], cur = new Array(n).fill(0);
    for (let j = s; j <= n - 1 - s; j++) {
      const l = prev[j - 1], c = prev[j], r = prev[j + 1];
      cur[j] = (l ^ c ^ r ^ (c & r)) & 1;
    }
    rows.push(cur);
  }
  // reverse pass: adjoint of cell j at time s. d(new)/dl = 1, d/dc = 1 + r, d/dr = 1 + c
  let adj = new Array(n).fill(0);
  adj[t] = 1; // output is cell t at time t
  for (let s = t; s >= 1; s--) {
    const prev = rows[s - 1], nadj = new Array(n).fill(0);
    for (let j = s; j <= n - 1 - s; j++) {
      const a = adj[j];
      if (!a) continue;
      const c = prev[j], r = prev[j + 1];
      nadj[j - 1] ^= a;                 // d/dl = 1
      nadj[j] ^= (a & (1 ^ r)) & 1;     // d/dc = 1 + r
      nadj[j + 1] ^= (a & (1 ^ c)) & 1; // d/dr = 1 + c
    }
    adj = nadj;
  }
  return { grad: adj.slice(0, n), out: rows[t][t] };
}

function coneValue(t, x0) {
  const n = 2 * t + 1;
  let cur = x0.slice();
  for (let s = 1; s <= t; s++) {
    const nxt = new Array(n).fill(0);
    for (let j = s; j <= n - 1 - s; j++) {
      const l = cur[j - 1], c = cur[j], r = cur[j + 1];
      nxt[j] = (l ^ c ^ r ^ (c & r)) & 1;
    }
    cur = nxt;
  }
  return cur[t];
}

function sensitivity(t, x0) {
  const n = 2 * t + 1;
  const base = coneValue(t, x0);
  const s = [];
  for (let j = 0; j < n; j++) {
    const y = x0.slice(); y[j] ^= 1;
    s.push(coneValue(t, y) ^ base);
  }
  return s;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let z = Math.imul(a ^ (a >>> 15), 1 | a);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

console.log('=== (A) Baur-Strassen in characteristic two: formal gradient vs sensitivity ===');
console.log('the toy case first: the circuit y = x*x computes the identity on {0,1};');
console.log('  its formal derivative is 2x = 0, its discrete derivative is 1 --- they differ at every point.');
console.log('');
console.log('  t    points   coords   formal==sensitivity   disagreeing coords   all-zero formal grads');
for (let t = 2; t <= 10; t++) {
  const n = 2 * t + 1;
  const rng = mulberry32(0xc0ffee ^ t);
  const P = 2000;
  let sameVec = 0, coordAgree = 0, coords = 0, zeroGrad = 0;
  for (let p = 0; p < P; p++) {
    const x0 = [];
    for (let j = 0; j < n; j++) x0.push(rng() < 0.5 ? 1 : 0);
    const { grad } = formalGradient(t, x0);
    const sens = sensitivity(t, x0);
    let eq = true;
    for (let j = 0; j < n; j++) { coords++; if (grad[j] === sens[j]) coordAgree++; else eq = false; }
    if (eq) sameVec++;
    if (grad.every((g) => g === 0)) zeroGrad++;
  }
  console.log(`  ${String(t).padStart(2)}   ${String(P).padStart(6)}   ${String(coords).padStart(6)}` +
    `   ${String(sameVec).padStart(6)}/${P}        ${(1 - coordAgree / coords).toFixed(4)}` +
    `            ${zeroGrad}/${P}`);
}

// also: the sensitivity vector IS the discrete gradient, and the discrete
// gradient of a multilinear polynomial IS its formal gradient. So check that the
// ANF-derivative agrees with sensitivity -- the transfer that does hold.
console.log('');
console.log('control: the same comparison against the derivative of the MULTILINEAR form');
console.log('(d f / d x_j computed from the ANF), which must agree with sensitivity everywhere');

// build ANF of the cone (small t only; plain object over 2^n ints)
function coneAnfSmall(t) {
  const n = 2 * t + 1, N = 2 ** n;
  const tt = new Uint8Array(N);
  for (let m = 0; m < N; m++) {
    const x0 = [];
    for (let j = 0; j < n; j++) x0.push((m >>> j) & 1);
    tt[m] = coneValue(t, x0);
  }
  for (let j = 0; j < n; j++)
    for (let m = 0; m < N; m++) if ((m >>> j) & 1) tt[m] ^= tt[m ^ (1 << j)];
  return { n, tt };
}
for (let t = 2; t <= 6; t++) {
  const { n, tt } = coneAnfSmall(t);
  const rng = mulberry32(0xfeed ^ t);
  let bad = 0, tot = 0;
  for (let p = 0; p < 400; p++) {
    const x0 = [];
    for (let j = 0; j < n; j++) x0.push(rng() < 0.5 ? 1 : 0);
    const sens = sensitivity(t, x0);
    for (let j = 0; j < n; j++) {
      // d f/d x_j evaluated at x0 : sum over monomials m containing j of prod_{i in m\{j}} x_i
      let v = 0;
      for (let m = 0; m < 2 ** n; m++) {
        if (!tt[m] || !((m >>> j) & 1)) continue;
        let prod = 1;
        for (let i = 0; i < n; i++) if (i !== j && ((m >>> i) & 1) && !x0[i]) { prod = 0; break; }
        v ^= prod;
      }
      tot++; if (v !== sens[j]) bad++;
    }
  }
  console.log(`  t=${t}: multilinear formal derivative disagrees with sensitivity at ${bad} of ${tot} coordinates`);
}

// ---------------- (B) formal total degree of the natural composite ----------------
// arithmetic over F_{2^16} = F2[a]/(a^16 + a^5 + a^3 + a^2 + 1)
const MOD = 0x1002d; // x^16 + x^5 + x^3 + x^2 + 1
function gfmul(x, y) {
  let r = 0;
  while (y) { if (y & 1) r ^= x; y >>= 1; x <<= 1; if (x & 0x10000) x ^= MOD; }
  return r;
}
function polyMul(a, b) {
  const r = new Int32Array(a.length + b.length - 1);
  for (let i = 0; i < a.length; i++) { if (!a[i]) continue; for (let j = 0; j < b.length; j++) if (b[j]) r[i + j] ^= gfmul(a[i], b[j]); }
  return r;
}
function polyAdd(a, b) {
  const r = new Int32Array(Math.max(a.length, b.length));
  for (let i = 0; i < a.length; i++) r[i] ^= a[i];
  for (let i = 0; i < b.length; i++) r[i] ^= b[i];
  return r;
}
function polyDeg(a) { for (let i = a.length - 1; i >= 0; i--) if (a[i]) return i; return -Infinity; }

console.log('');
console.log('=== (B) the formal total degree of the natural composite, over F2 ===');
console.log('substituting x_j -> c_j*u for random c_j in F_{2^16}: degree in u = formal total degree');
console.log('  t    multilinear deg (2t-1)   formal deg   2^t    log2(formal)');
for (let t = 1; t <= 9; t++) {
  const n = 2 * t + 1;
  const rng = mulberry32(0x1234 ^ t);
  let cur = [];
  for (let j = 0; j < n; j++) {
    const c = 1 + ((rng() * 65534) | 0);
    cur.push(new Int32Array([0, c])); // c_j * u
  }
  for (let s = 1; s <= t; s++) {
    const nxt = new Array(n).fill(null);
    for (let j = s; j <= n - 1 - s; j++) {
      const l = cur[j - 1], c = cur[j], r = cur[j + 1];
      nxt[j] = polyAdd(polyAdd(polyAdd(l, c), r), polyMul(c, r));
    }
    cur = nxt;
  }
  const d = polyDeg(cur[t]);
  console.log(`  ${String(t).padStart(2)}   ${String(2 * t - 1).padStart(20)}   ${String(d).padStart(10)}` +
    `  ${String(2 ** t).padStart(6)}   ${Math.log2(d).toFixed(3)}`);
}
