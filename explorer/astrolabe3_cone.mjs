// Astrolabe, 2026-09-13. Algebraic-circuit vantage.
//
// The cone polynomial: cell (t,0) as a Boolean function of the 2t+1 free cells
// of row 0 (positions -t..t), for any elementary rule. Computes the exact ANF
// (algebraic normal form over F2) by evaluating the function at all 2^(2t+1)
// inputs, bit-packed, then Moebius-transforming in place.
//
// Reports: F2-degree, number and identity of top-degree monomials, ANF support,
// which variables occur at all (= influential variables), and the largest
// monomial containing each variable.
//
// Independent of explorer/astrolabe2_degree.mjs and astrolabe2_anf.mjs: this one
// goes through the full truth table and a packed Moebius transform, those built
// the ANF symbolically. Written to re-check an inherited claim, not to extend it.

const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];

// ANF of a rule number as a function of (l,c,r): array of 8 bits, index
// b = 4*l + 2*c + r, giving the coefficient of the monomial l^{bit2} c^{bit1} r^{bit0}.
function ruleAnf(rule) {
  // truth table indexed by Wolfram's 4l+2c+r
  const tt = [];
  for (let i = 0; i < 8; i++) tt.push((rule >> i) & 1);
  // Moebius over 3 variables, index bits: bit2 = l, bit1 = c, bit0 = r
  const a = tt.slice();
  for (let j = 0; j < 3; j++) {
    for (let m = 0; m < 8; m++) if ((m >> j) & 1) a[m] ^= a[m ^ (1 << j)];
  }
  return a;
}

function makeStep(rule, L) {
  const a = ruleAnf(rule);
  const terms = [];
  for (let m = 0; m < 8; m++) if (a[m]) terms.push(m); // m bits: 4=l,2=c,1=r
  // returns out = XOR over terms of AND of the named variables (empty = all-ones)
  return function step(out, l, c, r) {
    for (let w = 0; w < L; w++) {
      const lw = l[w], cw = c[w], rw = r[w];
      let v = 0;
      for (let i = 0; i < terms.length; i++) {
        const m = terms[i];
        let p = 0xffffffff;
        if (m & 4) p &= lw;
        if (m & 2) p &= cw;
        if (m & 1) p &= rw;
        v ^= p;
      }
      out[w] = v >>> 0;
    }
  };
}

// ---- exact cone ANF -------------------------------------------------------

function coneAnf(rule, t) {
  const n = 2 * t + 1;
  if (n < 5) throw new Error('n>=5 only');
  const L = 2 ** (n - 5);
  const step = makeStep(rule, L);

  // row s occupies positions -(t-s)..(t-s); store in arrays indexed 0..n-1 by
  // j = position + t, so row s lives in [s, n-1-s].
  let cur = [], nxt = [];
  for (let j = 0; j < n; j++) {
    const v = new Uint32Array(L);
    if (j < 5) v.fill(PAT[j] >>> 0);
    else {
      const sh = j - 5;
      for (let w = 0; w < L; w++) v[w] = ((w >>> sh) & 1) ? 0xffffffff : 0;
    }
    cur.push(v);
    nxt.push(new Uint32Array(L));
  }

  for (let s = 1; s <= t; s++) {
    for (let j = s; j <= n - 1 - s; j++) step(nxt[j], cur[j - 1], cur[j], cur[j + 1]);
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  const f = cur[t]; // centre

  // Moebius transform in place -> ANF coefficients
  const a = f;
  for (let j = 0; j < 5 && j < n; j++) {
    const low = (~PAT[j]) >>> 0, sh = 1 << j;
    for (let w = 0; w < L; w++) a[w] = (a[w] ^ (((a[w] & low) << sh) >>> 0)) >>> 0;
  }
  for (let j = 5; j < n; j++) {
    const blk = 1 << (j - 5);
    for (let base = 0; base < L; base += 2 * blk)
      for (let k = 0; k < blk; k++) a[base + blk + k] ^= a[base + k];
  }
  return { n, a, L };
}

function popcount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

function report(rule, t) {
  const { n, a, L } = coneAnf(rule, t);
  let support = 0, deg = 0, topCount = 0;
  const tops = [];
  const byDeg = new Array(n + 1).fill(0);
  const varMax = new Array(n).fill(-1);   // largest monomial containing var j
  const varSeen = new Array(n).fill(false);
  for (let w = 0; w < L; w++) {
    let word = a[w];
    while (word) {
      const b = 31 - Math.clz32(word & -word) + 1 - 1; // lowest set bit index
      const bit = 31 - Math.clz32(word & (-word >>> 0));
      const m = (w << 5) | bit;
      word = (word & (word - 1)) >>> 0;
      support++;
      const d = popcount(m);
      byDeg[d]++;
      if (d > deg) { deg = d; topCount = 1; tops.length = 0; tops.push(m); }
      else if (d === deg) { topCount++; if (tops.length < 8) tops.push(m); }
      for (let j = 0; j < n; j++) if ((m >>> j) & 1) {
        varSeen[j] = true;
        if (d > varMax[j]) varMax[j] = d;
      }
      void b;
    }
  }
  const influential = varSeen.reduce((s, v) => s + (v ? 1 : 0), 0);
  return { rule, t, n, deg, topCount, tops, support, byDeg, varMax, influential, varSeen };
}

function monStr(m, n, t) {
  const parts = [];
  for (let j = 0; j < n; j++) if ((m >>> j) & 1) parts.push(j - t);
  return '{' + parts.join(',') + '}';
}

const TMAX = 10;
const RULES = [30, 90, 150, 45, 86, 60, 110];

console.log('=== cone polynomial: exact ANF over F2, n = 2t+1 free cells of row 0 ===');
for (const rule of RULES) {
  console.log(`\n--- rule ${rule} ---`);
  console.log('  t    n   deg   #top   |ANF|   infl   deg/n');
  for (let t = 2; t <= TMAX; t++) {
    const r = report(rule, t);
    console.log(
      `  ${String(t).padStart(2)}  ${String(r.n).padStart(3)}  ${String(r.deg).padStart(4)}` +
      `  ${String(r.topCount).padStart(5)}  ${String(r.support).padStart(7)}` +
      `  ${String(r.influential).padStart(4)}   ${(r.deg / r.n).toFixed(3)}`);
    if (t === TMAX || t === 5) {
      console.log('       top monomials (cell positions): ' +
        r.tops.map((m) => monStr(m, r.n, t)).join(' ') + (r.topCount > r.tops.length ? ' ...' : ''));
      console.log('       largest monomial containing each variable, x=-t..t: ' + r.varMax.join(','));
      if (!r.varSeen.every((v) => v)) {
        const dead = [];
        for (let j = 0; j < r.n; j++) if (!r.varSeen[j]) dead.push(j - t);
        console.log('       variables absent from the polynomial: ' + dead.join(','));
      }
    }
  }
}
