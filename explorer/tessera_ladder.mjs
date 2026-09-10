// The ladder, measured: how the agreement width between rows t and t+p grows,
// and what the increments are made of.  Companion to tessera_frontier.mjs.
//
// The point: the "+1 per black control bit" law alone has slope exactly 2,
// which is exactly the wall's budget and therefore proves nothing.  The margin
// comes from the steps where the width jumps by more than one.

const T = (r) => (4n * r) ^ ((2n * r) | r);
const bit = (r, b) => ((r >> BigInt(b)) & 1n) === 1n;
const mod = (r, n) => r & ((1n << BigInt(n)) - 1n);

const N = 12000;
const rows = new Array(N + 1);
rows[0] = 1n;
for (let t = 0; t < N; t++) rows[t + 1] = T(rows[t]);

const width = (t, p) => {
  const d = rows[t] ^ rows[t + p];
  if (d === 0n) return Infinity;
  let w = 0n, v = d;
  while ((v & 1n) === 0n) { v >>= 1n; w++; }
  return Number(w);
};

console.log("increment histogram of the agreement width, seed rows t vs t+p");
for (const p of [4, 8, 16, 32]) {
  const hist = new Map();
  let steps = 0, blackControl = 0, gained = 0;
  for (let t = 0; t + p <= N && t < 5000; t++) {
    const w = width(t, p), nx = width(t + 1, p);
    if (w === Infinity || nx === Infinity) break;
    if (bit(rows[t], w - 1)) blackControl++;
    const inc = nx - w;
    hist.set(inc, (hist.get(inc) ?? 0) + 1);
    gained += inc; steps++;
  }
  const keys = [...hist.keys()].sort((a, b) => a - b);
  console.log(`  p=${p}: steps ${steps}, black control ${blackControl}, width gained ${gained}, `
    + `mean gain/step ${(gained / steps).toFixed(4)}  ` + keys.map(k => `${k}:${hist.get(k)}`).join(" "));
  const jumps = keys.filter(k => k >= 2).reduce((a, k) => a + hist.get(k), 0);
  const ones = hist.get(1) ?? 0;
  // Slope = steps per unit of width.  The wall's budget is 2.  A ladder that
  // only ever counts +1 per black control bit gains `blackControl` of width in
  // `steps` steps; the real gain is `gained`.
  console.log(`         increments: +1 ${ones}, +2 or more ${jumps};`
    + ` slope with the +1 law alone ${(steps / (blackControl || 1)).toFixed(3)},`
    + ` actual slope ${(steps / (gained || 1)).toFixed(3)}, budget slope 2`);
}

// --------------------------------------------------------------------------
// The period wall's arithmetic side, on truncated orbits so nothing is stored.
// For each n:  is there a power of two q <= n and a time t with
//   rowNat t = rowNat (t+q)  (mod 2^n) ?
// This is the right-hand side of the proposed equivalence.
console.log("\nperiod-wall arithmetic side: least power of two q <= n that returns");
{
  let bad = 0;
  const firsts = new Map();
  for (let n = 1; n <= 700; n++) {
    const m = (1n << BigInt(n)) - 1n;
    const horizon = 4 * n + 400;
    const orb = [];
    let r = 1n & m;
    for (let t = 0; t <= horizon + n + 1; t++) { orb.push(r); r = T(r) & m; }
    let found = null;
    for (let a = 0; (1 << a) <= n; a++) {
      const q = 1 << a;
      for (let t = 0; t + q < orb.length; t++) {
        if (orb[t] === orb[t + q]) { found = q; break; }
      }
      if (found !== null) break;
    }
    if (found === null) { bad++; if (bad < 6) console.log(`  NO q <= ${n} at n=${n}`); }
    else if (!firsts.has(found)) firsts.set(found, n);
  }
  console.log(`  n = 1..700: ${bad} failures`);
  console.log("  first n needing each q: " + [...firsts.entries()].map(([q, n]) => `q=${q} at n=${n}`).join(", "));
}

// --------------------------------------------------------------------------
// The OR filter: the two-level law's right-hand side is an equality of ORs,
// and an OR forgets information.  Replace OR by XOR and the free level goes away.
console.log("\nthe OR is what buys the free level");
{
  let orAgree = 0, xorAgree = 0, bitAgree = 0, n = 0;
  for (let i = 0; i < 400000; i++) {
    const a = Math.random() < 0.5, b = Math.random() < 0.5;
    const c = Math.random() < 0.5, d = Math.random() < 0.5;
    if ((a || b) === (c || d)) orAgree++;
    if ((a !== b) === (c !== d)) xorAgree++;
    if (a === c) bitAgree++;
    n++;
  }
  console.log(`  P(OR agrees) = ${(orAgree / n).toFixed(4)}   (5/8)`);
  console.log(`  P(XOR agrees) = ${(xorAgree / n).toFixed(4)}  (1/2)`);
  console.log(`  P(single bit agrees) = ${(bitAgree / n).toFixed(4)} (1/2)`);
}
