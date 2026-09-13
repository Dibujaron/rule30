// Ephemeris, 2026-09-13. The generating-function vantage, part 2:
// the radial behaviour of F(x) = sum_t c(t) x^t as x -> 1, which is what the
// Tauberian arm of Prize 2 is about, and the radial limits at roots of unity,
// which are the densities of the centre column along arithmetic progressions.
//
// Run: node explorer/ephemeris3_radial.mjs

const say = (...a) => console.log(...a);
const N = 1 << 20; // 1,048,576 rows (the guard allows no argument, so edit here)

// ---- word-parallel cone engine -------------------------------------------
// bit `index` of the row is the cell at position index - N; the seed sits at
// index N. After t steps the cone spans index N-t .. N+t, so a row of
// 2N+3 bits is never touched at its ends and no boundary garbage can enter.
function centreColumn(n, rule = 30) {
  const bits = 2 * n + 3;
  const W = (bits + 31) >> 5;
  let a = new Uint32Array(W), up = new Uint32Array(W), dn = new Uint32Array(W), b = new Uint32Array(W);
  a[n >> 5] |= 1 << (n & 31);
  const col = new Uint8Array(n);
  for (let t = 0; t < n; t++) {
    col[t] = (a[n >> 5] >>> (n & 31)) & 1; // cell at position 0 is index n at every t
    // (the first version of this line read index n+t, which is position t: the
    //  cone's right edge, black at every row by evolve_right_edge, so the column
    //  came out identically 1 -- a wrong value that looks like a measurement)
    // up[i] = a[i-1] (shift toward higher index), dn[i] = a[i+1]
    let carry = 0;
    for (let i = 0; i < W; i++) { const w = a[i]; up[i] = (w << 1) | carry; carry = w >>> 31; }
    carry = 0;
    for (let i = W - 1; i >= 0; i--) { const w = a[i]; dn[i] = (w >>> 1) | (carry << 31); carry = w & 1; }
    for (let i = 0; i < W; i++) b[i] = up[i] ^ (a[i] | dn[i]);
    const tmp = a; a = b; b = tmp;
  }
  return col;
}

// naive control
function centreColumnNaive(n) {
  let a = new Uint8Array(2 * n + 3); a[n + 1] = 1;
  const col = [];
  for (let t = 0; t < n; t++) {
    col.push(a[n + 1]);
    const c = new Uint8Array(a.length);
    for (let i = 1; i < a.length - 1; i++) c[i] = a[i - 1] ^ (a[i] | a[i + 1]);
    a = c;
  }
  return col;
}

say("=== A. engine validation ===");
const t0 = Date.now();
const c = centreColumn(N);
say("rows:", N, " seconds:", ((Date.now() - t0) / 1000).toFixed(1));
{
  const known = "11011100110";
  say("first eleven          :", Array.from(c.slice(0, 11)).join(""), " expected", known);
  const naive = centreColumnNaive(400);
  let bad = 0;
  for (let t = 0; t < 400; t++) if (naive[t] !== c[t]) bad++;
  say("naive disagreements   :", bad, "/ 400");
}

// ---- the excess and the density ------------------------------------------
say("");
say("=== B. the Cesaro side: density and excess ===");
let count = 0;
for (let t = 0; t < N; t++) count += c[t];
say("black density at N =", N, ":", (count / N).toFixed(6));
say("excess E(N) = 2*count - N :", 2 * count - N, "  E/sqrt(N) =", ((2 * count - N) / Math.sqrt(N)).toFixed(4));

// ---- the Abel side: (1-x) F(x) as x -> 1 ---------------------------------
say("");
say("=== C. the Abel side: (1-x)F(x) for x = 1 - eps ===");
function abel(seq, eps, n) {
  const x = 1 - eps;
  let s = 0, p = 1;
  for (let t = 0; t < n; t++) { if (seq[t]) s += p; p *= x; if (p < 1e-300) break; }
  return { val: eps * s, tail: p / eps * eps }; // tail bound: sum_{t>=n} x^t * eps = x^n
}
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rng = mulberry32(20260913);
const coin = new Uint8Array(N); for (let t = 0; t < N; t++) coin[t] = rng() < 0.5 ? 1 : 0;
const per = new Uint8Array(N); for (let t = 0; t < N; t++) per[t] = (t % 7 < 3) ? 1 : 0; // density 3/7, rational F

say("eps        (1-x)F(x) rule30    coin        periodic(3/7)   truncation bound");
for (const eps of [1e-1, 1e-2, 1e-3, 1e-4, 1e-5]) {
  const a1 = abel(c, eps, N), a2 = abel(coin, eps, N), a3 = abel(per, eps, N);
  const trunc = Math.pow(1 - eps, N);
  say(`${eps.toExponential(0).padEnd(10)} ${a1.val.toFixed(6).padEnd(11)} ${a2.val.toFixed(6).padEnd(11)} ${a3.val.toFixed(6).padEnd(15)} ${trunc.toExponential(2)}`);
}
say("(3/7 = " + (3 / 7).toFixed(6) + ", the periodic control's true density)");

// ---- radial limits at roots of unity = progression densities -------------
say("");
say("=== D. densities along arithmetic progressions t = a mod q ===");
say("(these are the radial limits of (1-x)F(x) at the q-th roots of unity)");
say(" q   max_a |d_a - 1/2|  rule 30      coin control");
for (const q of [2, 3, 4, 5, 7, 8, 11, 16, 32, 64, 128, 1024]) {
  const cnt = new Float64Array(q), tot = new Float64Array(q), cc = new Float64Array(q);
  for (let t = 0; t < N; t++) { const a = t % q; cnt[a] += c[t]; cc[a] += coin[t]; tot[a]++; }
  let m1 = 0, m2 = 0;
  for (let a = 0; a < q; a++) { m1 = Math.max(m1, Math.abs(cnt[a] / tot[a] - 0.5)); m2 = Math.max(m2, Math.abs(cc[a] / tot[a] - 0.5)); }
  say(` ${String(q).padEnd(5)} ${m1.toFixed(5).padEnd(24)} ${m2.toFixed(5)}`);
}

// one direct Abel check at zeta = -1, against the q = 2 densities
say("");
say("=== D2. null for the progression table: 20 coin draws ===");
say(" q    rule 30     coin median   coin max   draws at least as extreme / 20");
for (const q of [2, 3, 4, 5, 7, 8, 11, 16, 32, 64, 128, 1024]) {
  const dev = (seq) => {
    const cnt = new Float64Array(q), tot = new Float64Array(q);
    for (let t = 0; t < N; t++) { cnt[t % q] += seq[t]; tot[t % q]++; }
    let m = 0; for (let a = 0; a < q; a++) m = Math.max(m, Math.abs(cnt[a] / tot[a] - 0.5));
    return m;
  };
  const mine = dev(c);
  const draws = [];
  for (let d = 0; d < 20; d++) {
    const r2 = mulberry32(1000 + d), s = new Uint8Array(N);
    for (let t = 0; t < N; t++) s[t] = r2() < 0.5 ? 1 : 0;
    draws.push(dev(s));
  }
  draws.sort((x, y) => x - y);
  say(` ${String(q).padEnd(5)} ${mine.toFixed(5).padEnd(11)} ${draws[10].toFixed(5).padEnd(13)} ${draws[19].toFixed(5).padEnd(10)} ${draws.filter((v) => v >= mine).length}`);
}

// F. the one cell of the table above that was outside its null: q = 3.
// A real bias makes the NORMALISED deviation (d_a - 1/2) * sqrt(n_a) grow like
// sqrt(N); a fluctuation leaves it O(1) and wandering. So read it at cut points.
say("");
say("=== F. is the q=3 deviation a bias or a fluctuation? ===");
for (const q of [3, 11]) {
  say(` q = ${q}: normalised deviations (d_a - 1/2)*sqrt(n_a) at cut points`);
  for (const frac of [16, 8, 4, 2, 1]) {
    const M = Math.floor(N / frac);
    const cnt = new Float64Array(q), tot = new Float64Array(q);
    for (let t = 0; t < M; t++) { cnt[t % q] += c[t]; tot[t % q]++; }
    const z = [];
    for (let a = 0; a < q; a++) z.push(((cnt[a] / tot[a] - 0.5) * Math.sqrt(tot[a])).toFixed(2));
    say(`   N=${String(M).padEnd(8)} ${z.join("  ")}`);
  }
  // the same statistic over 20 coin draws at the full N, for the max |z|
  const zs = [];
  for (let d = 0; d < 20; d++) {
    const r2 = mulberry32(7000 + d);
    const cnt = new Float64Array(q), tot = new Float64Array(q);
    for (let t = 0; t < N; t++) { const v = r2() < 0.5 ? 1 : 0; cnt[t % q] += v; tot[t % q]++; }
    let m = 0; for (let a = 0; a < q; a++) m = Math.max(m, Math.abs((cnt[a] / tot[a] - 0.5) * Math.sqrt(tot[a])));
    zs.push(m);
  }
  zs.sort((x, y) => x - y);
  say(`   coin max|z| over 20 draws: median ${zs[10].toFixed(2)}, max ${zs[19].toFixed(2)}`);
}

say("");
say("=== E. cross-check: Abel limit at x = -(1-eps) vs the q=2 densities ===");
{
  let d0 = 0, d1 = 0, n0 = 0, n1 = 0;
  for (let t = 0; t < N; t++) { if (t % 2 === 0) { d0 += c[t]; n0++; } else { d1 += c[t]; n1++; } }
  d0 /= n0; d1 /= n1;
  for (const eps of [1e-2, 1e-3, 1e-4]) {
    const x = -(1 - eps);
    let s = 0, p = 1;
    for (let t = 0; t < N; t++) { if (c[t]) s += p; p *= x; if (Math.abs(p) < 1e-300) break; }
    // (1-r) F(-r) -> (1/2)(d0 - d1)
    say(`eps=${eps.toExponential(0)}  (1-r)F(-r) = ${(eps * s).toFixed(6)}   predicted (d0-d1)/2 = ${((d0 - d1) / 2).toFixed(6)}`);
  }
}
