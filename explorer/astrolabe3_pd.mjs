// Astrolabe, 2026-09-13. Algebraic-circuit vantage.
//
// The Nisan-Wigderson partial-derivative measure on the cone polynomial.
//
// Part A (arithmetic, no automaton in it): for a polynomial in n variables of
// F2-degree d, the order-k partial-derivative space has dimension at most
//     min( C(n,k) , #{multilinear monomials of degree <= d-k} ),
// and a single product of d linear forms has order-k partial-derivative space of
// dimension at most C(d,k). So the NW method can never output a depth-3 top
// fan-in bound larger than the ratio of those, maximised over k. Computed
// exactly for d = n-2 (rule 30's cone polynomial) and for d = 1 (the linear
// controls), at every t.
//
// Part B (measured): the actual dimension of span{ d^S f : |S| = k } for rule 30,
// rules 90 and 150, and a uniformly random polynomial of the same degree, to see
// whether rule 30 sits at the ceiling or under it.

// ---------- exact big-integer binomials ----------
function binom(n, k) {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  const K = BigInt(Math.min(k, n - k));
  for (let i = 0n; i < K; i++) r = (r * BigInt(n - Number(i))) / (i + 1n);
  return r;
}
function sumBinom(n, upTo) { // #monomials of degree <= upTo
  let s = 0n;
  for (let i = 0; i <= upTo; i++) s += binom(n, i);
  return s;
}
function ratioStr(a, b) {
  if (b === 0n) return 'inf';
  return (Number(a) / Number(b)).toPrecision(6);
}

console.log('=== Part A: the ceiling of the NW partial-derivative method ===');
console.log('for a polynomial of n = 2t+1 variables and F2-degree d = n-2,');
console.log('best possible depth-3 top-fan-in bound = max_k min(C(n,k), M(d-k)) / C(d,k)');
console.log('');
console.log('   t    n    d   argmax k    ceiling      t(2t+1)   ceiling/t^2');
for (let t = 2; t <= 24; t++) {
  const n = 2 * t + 1, d = n - 2;
  let best = 0, bestK = -1;
  for (let k = 0; k <= d; k++) {
    const num = binom(n, k) < sumBinom(n, d - k) ? binom(n, k) : sumBinom(n, d - k);
    const den = binom(d, k);
    if (den === 0n) continue;
    const v = Number(num) / Number(den);
    if (v > best) { best = v; bestK = k; }
  }
  console.log(`  ${String(t).padStart(2)}  ${String(n).padStart(3)}  ${String(d).padStart(3)}` +
    `   ${String(bestK).padStart(3)}      ${best.toPrecision(7).padStart(12)}` +
    `  ${String(t * (2 * t + 1)).padStart(7)}   ${(best / (t * t)).toFixed(4)}`);
}

console.log('');
console.log('same ceiling for the linear controls (d = 1):');
for (const t of [2, 5, 10, 20]) {
  const n = 2 * t + 1, d = 1;
  let best = 0, bestK = -1;
  for (let k = 0; k <= d; k++) {
    const num = binom(n, k) < sumBinom(n, d - k) ? binom(n, k) : sumBinom(n, d - k);
    const den = binom(d, k);
    if (den === 0n) continue;
    const v = Number(num) / Number(den);
    if (v > best) { best = v; bestK = k; }
  }
  console.log(`   t=${t}  n=${n}  d=1   argmax k=${bestK}   ceiling=${best}`);
}

// ---------- Part B: measured dimensions ----------
const PAT = [0xaaaaaaaa, 0xcccccccc, 0xf0f0f0f0, 0xff00ff00, 0xffff0000];

function ruleAnf(rule) {
  const a = [];
  for (let i = 0; i < 8; i++) a.push((rule >> i) & 1);
  for (let j = 0; j < 3; j++) for (let m = 0; m < 8; m++) if ((m >> j) & 1) a[m] ^= a[m ^ (1 << j)];
  return a;
}

function coneAnfBits(rule, t) {
  const n = 2 * t + 1, L = 2 ** (n - 5);
  const anf = ruleAnf(rule);
  const terms = [];
  for (let m = 0; m < 8; m++) if (anf[m]) terms.push(m);
  let cur = [], nxt = [];
  for (let j = 0; j < n; j++) {
    const v = new Uint32Array(L);
    if (j < 5) v.fill(PAT[j] >>> 0);
    else { const sh = j - 5; for (let w = 0; w < L; w++) v[w] = ((w >>> sh) & 1) ? 0xffffffff : 0; }
    cur.push(v); nxt.push(new Uint32Array(L));
  }
  for (let s = 1; s <= t; s++) {
    for (let j = s; j <= n - 1 - s; j++) {
      const l = cur[j - 1], c = cur[j], r = cur[j + 1], o = nxt[j];
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
        o[w] = v >>> 0;
      }
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  const a = cur[t];
  for (let j = 0; j < 5 && j < n; j++) {
    const low = (~PAT[j]) >>> 0, sh = 1 << j;
    for (let w = 0; w < L; w++) a[w] = (a[w] ^ (((a[w] & low) << sh) >>> 0)) >>> 0;
  }
  for (let j = 5; j < n; j++) {
    const blk = 1 << (j - 5);
    for (let base = 0; base < L; base += 2 * blk)
      for (let k = 0; k < blk; k++) a[base + blk + k] ^= a[base + k];
  }
  // return list of monomial masks
  const mons = [];
  for (let w = 0; w < L; w++) {
    let word = a[w];
    while (word) {
      const bit = 31 - Math.clz32((word & (-word >>> 0)) >>> 0);
      mons.push((w << 5) | bit);
      word = (word & (word - 1)) >>> 0;
    }
  }
  return { n, mons };
}

function randomAnf(n, d, rng) {
  const mons = [];
  for (let m = 0; m < 2 ** n; m++) {
    let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; }
    if (pc <= d && rng() < 0.5) mons.push(m);
  }
  // force the degree to be exactly d
  let has = mons.some((m) => { let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; } return pc === d; });
  if (!has) { let m = (1 << d) - 1; mons.push(m); }
  return mons;
}

function xorshift(seed) {
  let s = seed | 0;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296); };
}

// subsets of [n] of size k, as bitmasks
function subsets(n, k) {
  const out = [];
  const rec = (start, mask, left) => {
    if (left === 0) { out.push(mask); return; }
    for (let j = start; j <= n - left; j++) rec(j + 1, mask | (1 << j), left - 1);
  };
  rec(0, 0, k);
  return out;
}

// rank over F2 of the order-k derivative space, monomials given as masks
function derivRank(n, mons, k) {
  const W = Math.ceil(2 ** n / 32);
  const pivots = [];       // {p: pivot index, v: Uint32Array}
  const pivotOf = new Map();
  for (const S of subsets(n, k)) {
    const v = new Uint32Array(W);
    for (const m of mons) if ((m & S) === S) { const q = m ^ S; v[q >>> 5] ^= (1 << (q & 31)); }
    // reduce
    let lead = -1;
    for (;;) {
      lead = -1;
      for (let w = 0; w < W; w++) if (v[w] !== 0) { lead = (w << 5) + (31 - Math.clz32((v[w] & (-v[w] >>> 0)) >>> 0)); break; }
      if (lead < 0) break;
      const pv = pivotOf.get(lead);
      if (pv === undefined) break;
      for (let w = lead >>> 5; w < W; w++) v[w] ^= pv[w];
    }
    if (lead >= 0) { pivotOf.set(lead, v); pivots.push(lead); }
  }
  return pivots.length;
}

console.log('');
console.log('=== Part B: measured dim span{ d^S f : |S| = k } ===');
for (const t of [3, 4, 5, 6]) {
  const n = 2 * t + 1;
  const r30 = coneAnfBits(30, t);
  const r90 = coneAnfBits(90, t);
  const r150 = coneAnfBits(150, t);
  const rng = xorshift(12345 + t);
  const rnd = randomAnf(n, n - 2, rng);
  const degOf = (mons) => Math.max(...mons.map((m) => { let pc = 0, x = m; while (x) { pc += x & 1; x >>>= 1; } return pc; }));
  const d30 = degOf(r30.mons);
  console.log(`\n t=${t}  n=${n}   deg(rule30)=${d30}  |ANF|=${r30.mons.length}   random deg=${degOf(rnd)} |ANF|=${rnd.length}`);
  console.log('   k   C(n,k)   M(d-k)   ceiling   rule30   random   rule90   rule150   C(d,k)   r30/C(d,k)');
  for (let k = 0; k <= Math.min(n, d30); k++) {
    if (binom(n, k) > 3000n) { console.log(`   ${String(k).padStart(2)}   (skipped, C(n,k)=${binom(n, k)})`); continue; }
    const ceil = binom(n, k) < sumBinom(n, d30 - k) ? binom(n, k) : sumBinom(n, d30 - k);
    const a = derivRank(n, r30.mons, k);
    const b = derivRank(n, rnd, k);
    const c = derivRank(n, r90.mons, k);
    const e = derivRank(n, r150.mons, k);
    const cd = binom(d30, k);
    console.log(`   ${String(k).padStart(2)}  ${String(binom(n, k)).padStart(7)}  ${String(sumBinom(n, d30 - k)).padStart(7)}` +
      `  ${String(ceil).padStart(8)}  ${String(a).padStart(7)}  ${String(b).padStart(7)}  ${String(c).padStart(7)}  ${String(e).padStart(8)}` +
      `  ${String(cd).padStart(7)}  ${ratioStr(BigInt(a), cd)}`);
  }
}
