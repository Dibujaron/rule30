// Talus, 2026-09-09.  If the increment is the number of ODD periodic points and the
// odd periodic points are one cycle -- the seed's own truncated orbit -- then
//
//        |A(n)| = 1 + sum_{m=1..n} P(m),        P(m) = period of the seed's cycle mod 2^m,
//        T_n has exactly n+1 cycles, of lengths P(0)=1, P(1), ..., P(n),
//
// with no reference to the attractor at all.  Test both against the attractor computed
// by lifting (T triangular => A(n) subset {a, a+2^(n-1) : a in A(n-1)}), to n = 520.
//
// usage: node talus5_formula.mjs

const NMAX = 520;

// ---- P(m): minimal period of the seed's orbit mod 2^m, from the orbit itself ----
function seedPeriods(nmax) {
  const P = [1]; // P[0] = 1 by convention (the fixed point 0 mod 1 is the whole space)
  // run the true rows once, keeping them as BigInts, far enough for width nmax
  const T = 3 * nmax + 200;
  const rows = [1n];
  for (let t = 1; t <= T; t++) { const r = rows[t - 1]; rows.push((4n * r) ^ ((2n * r) | r)); }
  for (let m = 1; m <= nmax; m++) {
    const mask = (1n << BigInt(m)) - 1n;
    // find the cycle by taking a late row and looking for its return
    const t0 = T - 200;
    const a = rows[t0] & mask;
    let p = 0;
    for (let d = 1; d <= 128; d++) if ((rows[t0 + d] & mask) === a) { p = d; break; }
    if (!p) throw new Error(`no period <=128 at m=${m}`);
    // verify it really is a period over the last 200 rows, and minimal
    for (let t = t0; t + p <= T; t++) if (((rows[t] & mask) ^ (rows[t + p] & mask)) !== 0n) throw new Error(`bad period m=${m}`);
    P[m] = p;
  }
  return P;
}

// ---- attractor by lifting, exact for any n ----
function attractorByLifting(nmax) {
  let A = [0n, 1n];
  const out = [];
  for (let n = 2; n <= nmax; n++) {
    const mask = (1n << BigInt(n)) - 1n;
    const step = (r) => ((4n * r) ^ ((2n * r) | r)) & mask;
    const hi = 1n << BigInt(n - 1);
    const cand = [];
    for (const a of A) { cand.push(a); cand.push(a + hi); }
    const idx = new Map();
    cand.forEach((v, i) => idx.set(v, i));
    const nxt = cand.map((v) => {
      const s = step(v);
      const j = idx.get(s);
      if (j === undefined) throw new Error('candidate set not closed under T');
      return j;
    });
    // peel indegree 0
    const deg = new Int32Array(cand.length);
    for (const j of nxt) deg[j]++;
    const stack = [];
    for (let i = 0; i < cand.length; i++) if (deg[i] === 0) stack.push(i);
    const gone = new Uint8Array(cand.length);
    while (stack.length) { const i = stack.pop(); gone[i] = 1; const j = nxt[i]; if (--deg[j] === 0 && !gone[j]) stack.push(j); }
    const keep = [];
    for (let i = 0; i < cand.length; i++) if (!gone[i]) keep.push(i);
    // cycle spectrum
    const seen = new Uint8Array(cand.length);
    const lens = [];
    for (const i0 of keep) {
      if (seen[i0]) continue;
      let i = i0, L = 0;
      do { seen[i] = 1; i = nxt[i]; L++; } while (i !== i0);
      lens.push(L);
    }
    const odd = keep.filter((i) => (cand[i] & 1n) === 1n).length;
    out[n] = { size: keep.length, lens: lens.sort((a, b) => a - b), odd };
    A = keep.map((i) => cand[i]);
  }
  out[1] = { size: 2, lens: [1, 1], odd: 1 };
  return out;
}

const P = seedPeriods(NMAX);
const AT = attractorByLifting(NMAX);

let badSize = 0, badCount = 0, badSpec = 0, badOdd = 0, badLaw = 0, firstBad = null;
let sum = 0;
for (let n = 1; n <= NMAX; n++) {
  sum += P[n];
  const pred = 1 + sum;
  const a = AT[n];
  if (a.size !== pred) { badSize++; firstBad ??= n; }
  if (a.lens.length !== n + 1) badCount++;
  const wantSpec = [];
  for (let m = 0; m <= n; m++) wantSpec.push(P[m]);
  wantSpec.sort((x, y) => x - y);
  if (wantSpec.join(',') !== a.lens.join(',')) badSpec++;
  if (a.odd !== P[n]) badOdd++;
  if (n >= 2 && a.size - AT[n - 1].size !== Math.max(...a.lens)) badLaw++;
}
console.log(`n = 1..${NMAX}`);
console.log(`  |A(n)| = 1 + sum_{m<=n} P(m)          : ${badSize} failures${firstBad ? ` (first n=${firstBad})` : ''}`);
console.log(`  number of cycles of T_n = n+1         : ${badCount} failures`);
console.log(`  cycle spectrum = multiset {P(0..n)}   : ${badSpec} failures`);
console.log(`  #odd periodic points = P(n)           : ${badOdd} failures`);
console.log(`  |A(n)|-|A(n-1)| = maxCycle(n)         : ${badLaw} failures  (the topic's law)`);
const steps = [];
for (let m = 2; m <= NMAX; m++) if (P[m] !== P[m - 1]) steps.push(`${m}:${P[m - 1]}->${P[m]}`);
console.log(`  P(m) staircase steps: ${steps.join('  ')}`);
for (const n of [22, 31, 35, 100, 420, 520]) if (n <= NMAX) console.log(`  |A(${n})| = ${AT[n].size}   maxCycle = ${Math.max(...AT[n].lens)}   #odd = ${AT[n].odd}`);
