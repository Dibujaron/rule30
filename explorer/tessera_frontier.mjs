// Checks for the packed-row frontier tier.
//
// rowStep r = (4r) XOR ((2r) OR r).  Bit b of the output reads bits b-2, b-1, b
// of the input, so the map is triangular and every claim below is a claim about
// a three-bit window.
//
// Five independent checks:
//   A. one-step congruence:  x = y mod 2^n  ->  T x = T y mod 2^n
//   B. the frontier law (all starts), the generalisation of rowNat_return_succ_iff
//   C. the two-level law (all starts), the generalisation of rowNat_return_succ_two
//   D. the stepMod / rowStep bridge
//   E. how often each law fires on the seed's own ladder -- the 2n vs 1.25n story

const T = (r) => (4n * r) ^ ((2n * r) | r);
const bit = (r, b) => ((r >> BigInt(b)) & 1n) === 1n;
const mod = (r, n) => r & ((1n << BigInt(n)) - 1n);

let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; if (fail < 20) console.log("FAIL " + msg); } };

// ---------- A. one-step congruence -------------------------------------------
{
  let cases = 0;
  for (let n = 0; n <= 12; n++) {
    for (let i = 0; i < 4000; i++) {
      const x = BigInt(Math.floor(Math.random() * 2 ** 20));
      const hi = BigInt(Math.floor(Math.random() * 2 ** 20)) << BigInt(n);
      const y = mod(x, n) | hi;
      check(mod(T(x), n) === mod(T(y), n), `A n=${n} x=${x} y=${y}`);
      cases++;
    }
  }
  console.log(`A  one-step congruence: ${cases} cases, ${fail} failures`);
}

// ---------- B. the frontier law, all starts -----------------------------------
// h : x = y mod 2^(n+1)
// T x = T y mod 2^(n+2)  <->  bit n of x  \/  x = y mod 2^(n+2)
{
  const before = fail;
  let cases = 0, lhsTrue = 0;
  for (let n = 0; n <= 10; n++) {
    for (let i = 0; i < 6000; i++) {
      const low = BigInt(Math.floor(Math.random() * 2 ** 20));
      const xh = BigInt(Math.floor(Math.random() * 2 ** 20)) << BigInt(n + 1);
      const yh = BigInt(Math.floor(Math.random() * 2 ** 20)) << BigInt(n + 1);
      const x = mod(low, n + 1) | xh;
      const y = mod(low, n + 1) | yh;
      const lhs = mod(T(x), n + 2) === mod(T(y), n + 2);
      const rhs = bit(x, n) || mod(x, n + 2) === mod(y, n + 2);
      check(lhs === rhs, `B n=${n} x=${x} y=${y} lhs=${lhs} rhs=${rhs}`);
      if (lhs) lhsTrue++;
      cases++;
    }
  }
  console.log(`B  frontier law: ${cases} cases, ${fail - before} failures, lhs true ${lhsTrue}`);
}

// ---------- C. the two-level law, all starts ----------------------------------
// h : x = y mod 2^(n+1),  hb : bit n of x
// T x = T y mod 2^(n+3)  <->  (bit (n+1) x || bit (n+2) x) = (bit (n+1) y || bit (n+2) y)
{
  const before = fail;
  let cases = 0, lhsTrue = 0, viaOld = 0;
  for (let n = 0; n <= 10; n++) {
    for (let i = 0; i < 8000; i++) {
      let low = BigInt(Math.floor(Math.random() * 2 ** 20));
      low = low | (1n << BigInt(n)); // force bit n black
      const xh = BigInt(Math.floor(Math.random() * 2 ** 20)) << BigInt(n + 1);
      const yh = BigInt(Math.floor(Math.random() * 2 ** 20)) << BigInt(n + 1);
      const x = mod(low, n + 1) | xh;
      const y = mod(low, n + 1) | yh;
      const lhs = mod(T(x), n + 3) === mod(T(y), n + 3);
      const rhs = (bit(x, n + 1) || bit(x, n + 2)) === (bit(y, n + 1) || bit(y, n + 2));
      check(lhs === rhs, `C n=${n} x=${x} y=${y} lhs=${lhs} rhs=${rhs}`);
      if (lhs) lhsTrue++;
      if (bit(x, n + 1) && bit(y, n + 1)) viaOld++;
      cases++;
    }
  }
  console.log(`C  two-level law: ${cases} cases, ${fail - before} failures, lhs true ${lhsTrue}`
    + `, of which the already-closed rowNat_return_succ_two case covers ${viaOld}`);
}

// ---------- D. stepMod / rowStep bridge ---------------------------------------
// (stepMod n)^[t] (x % 2^n) = (rowStep^[t] x) % 2^n
{
  const before = fail;
  let cases = 0;
  for (let n = 1; n <= 14; n++) {
    for (let i = 0; i < 200; i++) {
      const x = BigInt(Math.floor(Math.random() * 2 ** 24));
      let a = mod(x, n), b = x;
      for (let t = 0; t <= 30; t++) {
        check(a === mod(b, n), `D n=${n} t=${t} x=${x}`);
        a = mod(T(a), n); b = T(b);
        cases++;
      }
    }
  }
  console.log(`D  stepMod bridge: ${cases} cases, ${fail - before} failures`);
}

// ---------- E. the ladder on the seed's own rows ------------------------------
// For a fixed shift p, W(t) = lowest bit where row t and row t+p disagree.
// Report: how W grows, and how the increments split between +1 and +2-or-more.
{
  const N = 40000;
  const rows = new Array(N + 1);
  rows[0] = 1n;
  for (let t = 0; t < N; t++) rows[t + 1] = T(rows[t]);

  const width = (t, p) => {
    const d = rows[t] ^ rows[t + p];
    if (d === 0n) return Infinity;
    let w = 0;
    let v = d;
    while ((v & 1n) === 0n) { v >>= 1n; w++; }
    return w;
  };

  for (const p of [8, 16]) {
    let plus1 = 0, plus2plus = 0, stall = 0, blackControl = 0;
    let prev = width(0, p);
    const target = [];
    for (let t = 0; t + p <= N && t < 6000; t++) {
      const w = width(t, p);
      const nxt = width(t + 1, p);
      const inc = (nxt === Infinity ? 999 : nxt) - (w === Infinity ? 999 : w);
      if (w === Infinity) break;
      if (bit(rows[t], w - 1)) blackControl++;
      if (inc === 0) stall++;
      else if (inc === 1) plus1++;
      else plus2plus++;
      target.push([t, w]);
    }
    // first time width >= m, against the wall's budget 2*(m-1)
    let worst = 0, worstM = 0;
    for (let m = 2; m <= 200; m++) {
      let t0 = null;
      for (const [t, w] of target) if (w >= m) { t0 = t; break; }
      if (t0 === null) break;
      const budget = 2 * (m - 1);
      const ratio = t0 / budget;
      if (ratio > worst) { worst = ratio; worstM = m; }
    }
    console.log(`E  p=${p}: +1 steps ${plus1}, +2-or-more steps ${plus2plus}, stalls ${stall},`
      + ` black control ${blackControl}; worst (time to width m)/(2(m-1)) = ${worst.toFixed(4)} at m=${worstM}`);
  }

  // The same, over many p, reporting the slope of "time to reach width m".
  for (const p of [16]) {
    const ms = [50, 100, 200, 400];
    for (const m of ms) {
      let t0 = null;
      for (let t = 0; t + p <= N; t++) { if (width(t, p) >= m) { t0 = t; break; } }
      console.log(`E  p=${p}: width ${m} first reached at t=${t0}, slope ${t0 === null ? "-" : (t0 / m).toFixed(3)}`
        + ` (budget slope 2)`);
    }
  }
}

// ---------- F. the period wall's arithmetic side --------------------------------
// For each n, the least power of two q <= n such that some T has
// rowNat T = rowNat (T+q) mod 2^n.  This is the RHS of the proposed equivalence.
{
  const N = 300000;
  let r = 1n;
  const snapshot = [];
  for (let t = 0; t <= N; t++) { snapshot.push(r); r = T(r); }
  let bad = 0;
  for (let n = 1; n <= 600; n++) {
    let found = null;
    for (let a = 0; (1 << a) <= n; a++) {
      const q = 1 << a;
      // look for a T with agreement; the onset is at most ~1.5n in practice
      for (let t = 0; t < 4 * n + 200 && t + q <= N; t++) {
        if (mod(snapshot[t], n) === mod(snapshot[t + q], n)) { found = q; break; }
      }
      if (found !== null) break;
    }
    if (found === null) { bad++; if (bad < 5) console.log(`F  no q <= ${n} at n=${n}`); }
  }
  console.log(`F  period-wall arithmetic side: n = 1..600, ${bad} failures`);
}

console.log(fail === 0 ? "ALL CHECKS PASSED" : `${fail} FAILURES`);
