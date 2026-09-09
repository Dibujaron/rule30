// Talus, 2026-09-09.  The rigidity law |A(n)| - |A(n-1)| = maxCycle(n), taken apart.
//
// T_n(r) = (4r XOR (2r OR r)) mod 2^n.  Bit i of T(r) is r_{i-2} XOR (r_{i-1} OR r_i).
//
// The claim I want to test is not the law itself but a decomposition of it:
//   (H)  T(2s) = 2 T(s)  identically  ->  A(n) ∩ 2Z = 2 A(n-1)
//   so   |A(n)| - |A(n-1)| = #{ODD periodic points of T_n},
//   and the law is then exactly  #odd periodic points = maxCycle(n).
// If in addition the odd periodic points form a SINGLE cycle, the law is immediate.
//
// Everything here is exhaustive over the whole 2^n state space, by peeling
// in-degree-zero nodes; no lifting, no sampling.  Cross-checked against a
// BigInt implementation of the same map.
//
// usage: node talus5_odd.mjs      (parameters below)

const NMAX = 22; // exhaustive; 2^22 states

function stepFn(n) {
  const mask = n >= 32 ? 0xffffffff : (2 ** n - 1);
  return (r) => ((((r * 4) ^ ((r * 2) | r)) >>> 0) & mask) >>> 0;
}
function stepBig(n) {
  const mask = (1n << BigInt(n)) - 1n;
  return (r) => ((4n * r) ^ ((2n * r) | r)) & mask;
}

// ---- engine check: the fast map against BigInt, and against rule 30 rows ----
{
  let bad = 0;
  for (let n = 1; n <= 24; n++) {
    const f = stepFn(n), g = stepBig(n);
    for (let t = 0; t < 400; t++) {
      const r = (Math.random() * 2 ** n) >>> 0;
      if (BigInt(f(r)) !== g(BigInt(r))) bad++;
    }
  }
  console.log(`engine check, fast vs BigInt, 24x400 random states: ${bad} mismatches`);
}

// rows of the real picture, as BigInts, to identify the seed's orbit
function rowNats(T) {
  const out = [1n];
  for (let t = 1; t <= T; t++) {
    const r = out[t - 1];
    out.push((4n * r) ^ ((2n * r) | r));
  }
  return out;
}

// ---- exhaustive attractor of T_n ----
function attractor(n) {
  const N = 2 ** n;
  const f = stepFn(n);
  const img = new Uint32Array(N);
  const indeg = new Uint32Array(N);
  for (let r = 0; r < N; r++) { const s = f(r); img[r] = s; indeg[s]++; }
  // peel
  const stack = [];
  for (let r = 0; r < N; r++) if (indeg[r] === 0) stack.push(r);
  const removed = new Uint8Array(N);
  while (stack.length) {
    const r = stack.pop();
    removed[r] = 1;
    const s = img[r];
    if (--indeg[s] === 0 && !removed[s]) stack.push(s);
  }
  // survivors are exactly the cyclic nodes
  const cyclic = [];
  for (let r = 0; r < N; r++) if (!removed[r]) cyclic.push(r);
  // decompose into cycles
  const seen = new Uint8Array(N);
  const cycles = [];
  for (const r0 of cyclic) {
    if (seen[r0]) continue;
    const cyc = [];
    let x = r0;
    do { seen[x] = 1; cyc.push(x); x = img[x]; } while (x !== r0);
    cycles.push(cyc);
  }
  return { cyclic, cycles, img };
}

const rows = rowNats(4 * NMAX + 64);
let prev = null;
const P = []; // P[n] = length of the cycle the seed's orbit lands on, at width n
console.log('\n n   |A(n)|   incr  maxCyc  #odd  #oddCyc  oddCycLens  evenPart=2A(n-1)  spectrum');
let violations = { even: 0, incr: 0, law: 0, oneOdd: 0, seedmax: 0 };
let sumP = 0;
for (let n = 1; n <= NMAX; n++) {
  const { cyclic, cycles } = attractor(n);
  const set = new Set(cyclic);
  const maxCyc = Math.max(...cycles.map((c) => c.length));
  const odd = cyclic.filter((r) => r & 1);
  const oddCycles = cycles.filter((c) => c[0] & 1);
  const incr = prev === null ? cyclic.length : cyclic.length - prev.cyclic.length;
  // even part vs 2*A(n-1)
  let evenOk = 'n/a';
  if (prev) {
    const even = cyclic.filter((r) => !(r & 1)).map((r) => r / 2).sort((a, b) => a - b);
    const want = [...prev.cyclic].sort((a, b) => a - b);
    evenOk = even.length === want.length && even.every((v, i) => v === want[i]) ? 'yes' : 'NO';
    if (evenOk === 'NO') violations.even++;
    if (incr !== odd.length) violations.incr++;
  }
  if (incr !== maxCyc) violations.law++;
  if (oddCycles.length !== 1) violations.oneOdd++;
  // is the seed's own orbit the (unique) odd cycle, and is it of length maxCyc?
  const seedState = Number(rows[4 * n + 60] & ((1n << BigInt(n)) - 1n));
  const seedCyc = cycles.find((c) => c.includes(seedState));
  if (!seedCyc || seedCyc.length !== maxCyc || !(seedCyc[0] & 1)) violations.seedmax++;
  P[n] = seedCyc ? seedCyc.length : -1;
  sumP += P[n];
  const spectrum = new Map();
  for (const c of cycles) spectrum.set(c.length, (spectrum.get(c.length) || 0) + 1);
  const spec = [...spectrum.entries()].sort((a, b) => a[0] - b[0]).map(([l, c]) => `${l}x${c}`).join(' ');
  console.log(
    `${String(n).padStart(2)} ${String(cyclic.length).padStart(7)} ${String(incr).padStart(6)} ${String(maxCyc).padStart(7)} ` +
      `${String(odd.length).padStart(5)} ${String(oddCycles.length).padStart(8)}  ${oddCycles.map((c) => c.length).join(',').padEnd(10)} ` +
      `${String(evenOk).padEnd(16)}  ${spec}`
  );
  // closed form  |A(n)| = 1 + sum_{m<=n} P(m)
  if (cyclic.length !== 1 + sumP) console.log(`   closed form FAILS at n=${n}: |A|=${cyclic.length} vs 1+sumP=${1 + sumP}`);
  prev = { cyclic, cycles };
}
console.log('\nviolations:', JSON.stringify(violations));

// ---- the halving identity, exhaustively ----
{
  let bad = 0, tested = 0;
  for (let n = 2; n <= 22; n++) {
    const f = stepFn(n), g = stepFn(n - 1);
    const M = 2 ** (n - 1);
    for (let s = 0; s < M; s++) { tested++; if (f(2 * s) !== 2 * g(s)) bad++; }
  }
  console.log(`halving identity T_n(2s) = 2 T_{n-1}(s): ${bad} failures over ${tested} states, n=2..22`);
}

// ---- odd periodic points have bits 0,1 black and bit 2 white ----
{
  let bad = 0, n0 = 0;
  for (let n = 3; n <= 20; n++) {
    const { cyclic } = attractor(n);
    for (const r of cyclic) if (r & 1) { n0++; if ((r & 7) !== 3) bad++; }
  }
  console.log(`odd periodic points with r mod 8 != 3: ${bad} of ${n0}, n=3..20`);
}
