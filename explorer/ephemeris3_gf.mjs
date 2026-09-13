// Ephemeris, 2026-09-13. The generating-function vantage, part 1.
//
// A  engine validation
// B  the INTEGER (over C) Hadamard recursion for the row series, and the F_2 one
// C  the linear rules: F_2 closed forms, and the C-side collapse
// D  left-diagonal rational generating functions, and the free zero-section
//
// Run: node explorer/ephemeris3_gf.mjs

const say = (...a) => console.log(...a);

// ---------------------------------------------------------------- engines

// Boolean row engine over positions -T..T, as Uint8Array with offset T.
function boolRow(T) {
  const a = new Uint8Array(2 * T + 3);
  a[T + 1] = 1; // position 0 lives at index T+1
  return a;
}
function stepBool(a, rule) {
  const n = a.length;
  const b = new Uint8Array(n);
  for (let i = 1; i < n - 1; i++) {
    const l = a[i - 1], c = a[i], r = a[i + 1];
    if (rule === 30) b[i] = l ^ (c | r);
    else if (rule === 90) b[i] = l ^ r;
    else if (rule === 150) b[i] = l ^ c ^ r;
    else throw new Error("rule");
  }
  return b;
}

// The same step written with INTEGER arithmetic only: every Boolean operation
// on {0,1} is a polynomial with integer coefficients, so this is the rule as an
// identity in Z, which is what the complex-analytic arm needs.
function stepInt(a) {
  const n = a.length;
  const b = new Int32Array(n);
  for (let i = 1; i < n - 1; i++) {
    const l = a[i - 1], c = a[i], r = a[i + 1];
    const m = c + r - c * r;          // c OR r
    b[i] = l + m - 2 * l * m;         // l XOR m
  }
  return b;
}

// And over F_2, as a polynomial identity mod 2.
function stepF2(a) {
  const n = a.length;
  const b = new Int32Array(n);
  for (let i = 1; i < n - 1; i++) {
    const l = a[i - 1], c = a[i], r = a[i + 1];
    b[i] = (l + c + r + c * r) % 2;
  }
  return b;
}

// ------------------------------------------------------------------ A

say("=== A. engine validation ===");
{
  const T = 40;
  let a = boolRow(T);
  const col = [];
  for (let t = 0; t <= 10; t++) { col.push(a[T + 1]); a = stepBool(a, 30); }
  const known = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0]; // Rule30/Basic.lean, settledCenter guard
  say("centre column 0..10 :", col.join(""));
  say("Basic.lean's eleven  :", known.join(""));
  say("match                :", col.join("") === known.join(""));

  // independent check: a BigInt packed-row engine (the explorer's own model)
  let r = 1n, ok = true;
  const packed = [];
  for (let t = 0; t <= 60; t++) {
    packed.push(Number((r >> BigInt(t)) & 1n));
    r = (4n * r) ^ ((2n * r) | r);
  }
  let a2 = boolRow(80);
  for (let t = 0; t <= 60; t++) { if (a2[81] !== packed[t]) ok = false; a2 = stepBool(a2, 30); }
  say("packed BigInt engine agrees on t<=60 :", ok);
}

// ------------------------------------------------------------------ B

say("");
say("=== B. the rule as an integer identity, and as an F_2 identity ===");
{
  const T = 320;
  let ab = boolRow(T), ai = Int32Array.from(boolRow(T)), af = Int32Array.from(boolRow(T));
  let badInt = 0, badF2 = 0, outOfRange = 0, cells = 0;
  for (let t = 0; t < 300; t++) {
    ab = stepBool(ab, 30); ai = stepInt(ai); af = stepF2(af);
    for (let i = 1; i < ab.length - 1; i++) {
      cells++;
      if (ai[i] !== ab[i]) badInt++;
      if (af[i] !== ab[i]) badF2++;
      if (ai[i] !== 0 && ai[i] !== 1) outOfRange++;
    }
  }
  say("cells compared                       :", cells);
  say("integer form disagreements           :", badInt);
  say("F_2 form disagreements               :", badF2);
  say("integer form leaving {0,1}           :", outOfRange);
}

// ------------------------------------------------------------------ C

say("");
say("=== C. the linear rules ===");
{
  // rule 90: cell(t,x) = [X^x](X + X^-1)^t mod 2 = C(t,(t+x)/2) mod 2.
  // rule 150: cell(t,x) = [X^x](X + 1 + X^-1)^t mod 2.
  const T = 620;
  for (const rule of [90, 150]) {
    let a = boolRow(T);
    const col0 = [], col1 = [];
    for (let t = 0; t < 600; t++) { col0.push(a[T + 1]); col1.push(a[T + 2]); a = stepBool(a, rule); }
    // closed form by Lucas / trinomial, computed mod 2 from the polynomial power
    let poly = new Map([[0, 1]]);                      // P(X)^t as a map exponent -> coeff mod 2
    const P = rule === 90 ? [-1, 1] : [-1, 0, 1];
    let mism0 = 0, mism1 = 0;
    for (let t = 0; t < 600; t++) {
      if (((poly.get(0) ?? 0)) !== col0[t]) mism0++;
      if (((poly.get(1) ?? 0)) !== col1[t]) mism1++;
      const next = new Map();
      for (const [e, c] of poly) for (const d of P) next.set(e + d, ((next.get(e + d) ?? 0) + c) % 2);
      poly = new Map([...next].filter(([, c]) => c === 1));
    }
    say(`rule ${rule}: [X^0]P^t vs column 0, mismatches = ${mism0}; [X^1]P^t vs column 1, mismatches = ${mism1}`);
    say(`  column 0 first 16: ${col0.slice(0, 16).join("")}   column 1 first 16: ${col1.slice(0, 16).join("")}`);
    // is column 1 eventually periodic within reach?
    let per = null;
    outer: for (let p = 1; p <= 200; p++) for (const N of [0, 1, 2, 4, 8, 16, 32]) {
      let ok = true;
      for (let t = N; t + p < 600; t++) if (col1[t] !== col1[t + p]) { ok = false; break; }
      if (ok) { per = [p, N]; break outer; }
    }
    say(`  column 1 eventual period p<=200 with onset in {0,1,2,4,8,16,32}: ${per ? per.join(" from ") : "none"}`);
    // 2-kernel of column 1 (Christol control): finite iff 2-automatic
    say(`  2-kernel of column 1: ${kernelProfile(col1, 6, 40).join(" ")}`);
  }
}

// C2. The cross-arm witness, checked rather than inherited: rule 150's column 1
// is 2-automatic (hence algebraic over F_2(x) by Christol) AND not eventually
// periodic (hence, by Szego, its complex series has the unit circle as a natural
// boundary and is transcendental over C(x)).
say("");
say("=== C2. is the cross-arm witness really aperiodic? ===");
{
  const n = 100000;
  for (const rule of [90, 150]) {
    const bits = 2 * n + 3, W = (bits + 31) >> 5;
    let a = new Uint32Array(W), up = new Uint32Array(W), dn = new Uint32Array(W), b = new Uint32Array(W);
    a[n >> 5] |= 1 << (n & 31);
    const col1 = new Uint8Array(n);
    for (let t = 0; t < n; t++) {
      col1[t] = (a[(n + 1) >> 5] >>> ((n + 1) & 31)) & 1; // position +1 is index n+1
      let carry = 0;
      for (let i = 0; i < W; i++) { const w = a[i]; up[i] = (w << 1) | carry; carry = w >>> 31; }
      carry = 0;
      for (let i = W - 1; i >= 0; i--) { const w = a[i]; dn[i] = (w >>> 1) | (carry << 31); carry = w & 1; }
      if (rule === 90) for (let i = 0; i < W; i++) b[i] = up[i] ^ dn[i];
      else for (let i = 0; i < W; i++) b[i] = up[i] ^ a[i] ^ dn[i];
      const tmp = a; a = b; b = tmp;
    }
    // every eventual period p <= 20000 with onset <= 2000
    let found = null;
    for (let p = 1; p <= 20000 && !found; p++) {
      let ok = true;
      for (let t = 2000; t + p < n; t++) if (col1[t] !== col1[t + p]) { ok = false; break; }
      if (ok) found = p;
    }
    // distinct factors of length 32 in the tail, the board's own diagnostic
    const fac = new Set();
    for (let t = n / 2; t + 32 < n; t++) { let s = ""; for (let j = 0; j < 32; j++) s += col1[t + j]; fac.add(s); }
    say(`rule ${rule} column 1 over ${n} terms: eventual period p<=20000 from onset 2000: ${found ?? "none"}`);
    say(`  distinct factors of length 32 in the tail: ${fac.size}`);
    say(`  2-kernel profile (prefix 200): ${kernelProfile(col1, 9, 200).join(" ")}`);
    say(`  black positions below 64: ${Array.from(col1.slice(0, 64)).map((v, i) => v ? i : -1).filter((i) => i >= 0).join(",")}`);
    if (rule === 90) {
      // g = sum_j x^(2^j - 1), j >= 1.  Over F_2, g satisfies  x g^2 + g + x = 0,
      // and over F_2 squaring is the coefficientwise map g^2(x) = g(x^2).
      // So [x^n](x g^2 + g + x) = g_{(n-1)/2}  (n odd)  + g_n + [n = 1].
      let bad = 0;
      for (let n = 0; n < 100000; n++) {
        let v = col1[n] + (n === 1 ? 1 : 0);
        if (n % 2 === 1) v += col1[(n - 1) / 2];
        if (v % 2 !== 0) bad++;
      }
      say(`  x*g^2 + g + x = 0 over F_2, failures over 100000 coefficients: ${bad}`);
    }
  }
}

function kernelProfile(seq, maxE, prefix) {
  // number of distinct subsequences t -> seq[2^e t + r] for e <= E, compared on
  // their first `prefix` terms; saturation = finite kernel = automatic
  const out = [];
  const seen = new Set();
  for (let e = 0; e <= maxE; e++) {
    const step = 1 << e;
    for (let r = 0; r < step; r++) {
      const key = [];
      for (let i = 0; i < prefix; i++) {
        const idx = step * i + r;
        if (idx >= seq.length) break;
        key.push(seq[idx]);
      }
      if (key.length === prefix) seen.add(key.join(""));
    }
    out.push(seen.size);
  }
  return out;
}

// ------------------------------------------------------------------ D

say("");
say("=== D. left diagonals: rational sections with unbounded denominators ===");
{
  // leftDiagonal k j = evolve (j+k) (-j). Read the picture down to depth D.
  const D = 4200, K = 44;
  const T = D + K + 4;
  let a = boolRow(T);
  const diag = Array.from({ length: K }, () => []);
  for (let t = 0; t <= D + K; t++) {
    for (let k = 0; k < K; k++) { const j = t - k; if (j >= 0 && j <= D) diag[k][j] = a[T + 1 - j]; }
    a = stepBool(a, 30);
  }
  const rows = [];
  for (let k = 0; k < K; k++) {
    const d = diag[k];
    // minimal eventual period among powers of two, with its least onset
    let best = null;
    for (let e = 0; e <= 12 && !best; e++) {
      const p = 1 << e;
      // least onset for this p
      let onset = null;
      // the window must be long enough to be evidence: the board has twice been
      // told "period 1" by a detector that saw six equal cells at the end of its
      // array, so demand 64 periods and at least 200 cells of agreement.
      const need = Math.max(64 * p, 200);
      for (let N = 0; N + need < d.length; N++) {
        let ok = true;
        for (let j = N; j + p < d.length; j++) if (d[j] !== d[j + p]) { ok = false; break; }
        if (ok) { onset = N; break; }
      }
      if (onset !== null) best = [p, onset];
    }
    rows.push([k, best ? best[0] : null, best ? best[1] : null]);
  }
  say("k : minimal power-of-two eventual period : least onset");
  for (const [k, p, o] of rows) if (k < 12 || k % 4 === 0) say(`  ${String(k).padStart(2)} : ${String(p).padStart(5)} : ${o}`);
  const maxP = Math.max(...rows.map((r) => r[1] ?? 0));
  say("largest period seen over k<44 :", maxP, "(all powers of two:",
    rows.every((r) => r[1] !== null && (r[1] & (r[1] - 1)) === 0), ")");
  say("onset 0 exactly for k in :", rows.filter((r) => r[2] === 0).map((r) => r[0]).join(","));

  // The free zero-section: any target sequence at j = 0, with unbounded periods.
  // a(k,j) = c(k) if j = 0, else [j = 1 mod 2^k].
  const target = diag.map((d) => d[0]); // take the centre column itself as the target
  let free = true, periods = [];
  for (let k = 1; k < 20; k++) {
    const sec = [];
    for (let j = 0; j < 4096; j++) sec.push(j === 0 ? target[k] : (j % (1 << k) === 1 ? 1 : 0));
    // minimal period from onset 1
    let p = null;
    for (let q = 1; q <= 4096 && !p; q++) {
      let ok = true;
      for (let j = 1; j + q < sec.length; j++) if (sec[j] !== sec[j + q]) { ok = false; break; }
      if (ok) p = q;
    }
    periods.push(p);
    if (sec[0] !== target[k]) free = false;
  }
  say("free construction: zero-section equals the target :", free);
  say("its minimal periods from onset 1, k=1..19 :", periods.join(","));
}
