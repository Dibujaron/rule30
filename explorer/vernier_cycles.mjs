// Vernier / connector, 2026-09-09.
// (a) the first terms of the orbit r_t = T^t(1) as integers, for an OEIS lookup;
// (b) the cyclic states of T mod 2^n listed explicitly, and which of them are
//     reductions of cyclic states at level n+1 -- i.e. which cycles are genuine
//     2-adic periodic orbits and which are artefacts of truncating the top bits;
// (c) the algebraic normal form of the coordinate functions, checked by table.

const T = (r) => (4n * r) ^ ((2n * r) | r);

console.log('--- (a) the orbit of 1 as integers ---');
{
  let r = 1n; const out = [];
  for (let t = 0; t <= 14; t++) { out.push(r.toString()); r = T(r); }
  console.log('r_t   :', out.join(', '));
  let s = 1n; const bits = [];
  for (let t = 0; t <= 40; t++) { bits.push(Number((s >> BigInt(t)) & 1n)); s = T(s); }
  console.log('centre column bit_t(r_t):', bits.join(''));
}

console.log('\n--- (c) algebraic normal form of coordinate i ---');
{
  // claim: bit_i(T(x)) = x_{i-2} XOR x_{i-1} XOR x_i XOR x_{i-1}*x_i
  let bad = 0;
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) {
    // x_{i-2}=a, x_{i-1}=b, x_i=c
    const rule = a ^ (b | c);
    const anf = (a ^ b ^ c ^ (b & c));
    if (rule !== anf) bad++;
  }
  console.log(`x_{i-2} XOR (x_{i-1} OR x_i)  ==  x_{i-2}+x_{i-1}+x_i+x_{i-1}x_i  over F2 : ${bad} mismatches / 8`);
  // and it is the SAME polynomial for every i, with the convention x_j = 0 for j<0.
  let bad2 = 0;
  const N = 20;
  for (let trial = 0; trial < 2000; trial++) {
    let x = 0n;
    for (let i = 0; i < N; i++) if (Math.random() < 0.5) x |= 1n << BigInt(i);
    const y = T(x);
    for (let i = 0; i < N + 2; i++) {
      const g = (j) => (j >= 0 ? Number((x >> BigInt(j)) & 1n) : 0);
      const want = g(i - 2) ^ g(i - 1) ^ g(i) ^ (g(i - 1) & g(i));
      if (Number((y >> BigInt(i)) & 1n) !== want) bad2++;
    }
  }
  console.log(`same quadratic at every coordinate, 2000 random 20-bit inputs: ${bad2} mismatches`);
}

console.log('\n--- (b) cyclic states of T mod 2^n, and reduction compatibility ---');
function cyclicStates(n) {
  const size = 1 << n, mask = size - 1;
  const f = (r) => (((4 * r) ^ ((2 * r) | r)) & mask) >>> 0;
  const done = new Uint8Array(size);
  const onCycle = new Uint8Array(size);
  const cycles = [];
  const path = new Int32Array(4096);
  const seen = new Map();
  for (let s = 0; s < size; s++) {
    if (done[s]) continue;
    seen.clear();
    let len = 0, x = s;
    while (!done[x] && !seen.has(x)) { seen.set(x, len); path[len++] = x; x = f(x); }
    if (seen.has(x)) {
      const start = seen.get(x);
      const cy = [];
      for (let i = start; i < len; i++) { onCycle[path[i]] = 1; cy.push(path[i]); }
      cycles.push(cy);
    }
    for (let i = 0; i < len; i++) done[path[i]] = 1;
  }
  return { cycles, onCycle, size, mask, f };
}

const cache = new Map();
const get = (n) => { if (!cache.has(n)) cache.set(n, cyclicStates(n)); return cache.get(n); };

for (let n = 9; n <= 20; n++) {
  const A = get(n), B = get(n + 1);
  // a cyclic state of level n is "liftable" if some cyclic state of level n+1
  // reduces to it.  Genuine 2-adic periodic orbits are liftable at every level.
  const lower = new Set();
  for (const cy of B.cycles) for (const x of cy) lower.add(x & (A.size - 1));
  let liftable = 0, total = 0;
  const dead = [];
  for (const cy of A.cycles) {
    total += cy.length;
    const ok = cy.every((x) => lower.has(x));
    if (ok) liftable += cy.length; else dead.push(`len${cy.length}:${cy[0].toString(2).padStart(n, '0')}`);
  }
  console.log(`n=${String(n).padStart(2)}  cyclic=${String(total).padStart(3)}  liftable to n+1 = ${String(liftable).padStart(3)}   not liftable: ${dead.length ? dead.join(' ') : '(none)'}`);
}

console.log('\n--- the cycles at n=16, written out (bit 0 = leftmost cell of the cone) ---');
{
  const A = get(16);
  for (const cy of A.cycles.sort((a, b) => a.length - b.length || a[0] - b[0])) {
    console.log(`  len ${String(cy.length).padStart(2)}: ${cy.map((x) => x.toString(2).padStart(16, '0').split('').reverse().join('')).join('  ')}`);
  }
}
