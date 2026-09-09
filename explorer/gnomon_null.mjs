// Gnomon — the right null model for the onset wall's tail bound.
//
// The board's onset wall is a preperiod ("tail") bound for the orbit of 1 under
//   T_n(r) = (4r XOR (2r OR r)) mod 2^n,
// which in the co-moving frame is rule 30's local map read as a triangular
// (lower-triangular / T-function) map on n bits:
//   bit_i(T r) = f(bit_{i-2} r, bit_{i-1} r, bit_i r),  bits below 0 read white.
//
// A random map on 2^n points has tail ~ 2^{n/2}. That is the WRONG null: the
// object is not a random map, it is a random TRIANGULAR map. This script
// measures three nulls and rule 30 against them:
//   (A) all 256 elementary rules, each read as a triangular map on n bits;
//   (B) random T-functions with a fresh random radius-3 rule at every level;
//   (C) random T-functions with bit i a random function of ALL bits <= i
//       (realised by hashing, so the map is a genuine deterministic function);
// and (D) an explicit triangular map whose tail is 2^{n-1} - O(1), to show
// triangularity alone does NOT force a polynomial tail.
//
// Two quantities per map and per n:
//   tail1(n)   preperiod of the orbit of 1        (the wall's own object)
//   depth(n)   max preperiod over all 2^n starts  (the all-starts / Cerny form)
//   attr(n)    number of states on cycles         ("the attractor")

// ---------- generic machinery ----------

// step for a radius-3 rule table given as a function idx(0..7) -> 0/1, applied
// at every bit position i of an n-bit word, with bits -1, -2 read as 0.
function makeEcaStep(ruleBits, n) {
  const mask = (1 << n) - 1;
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const b0 = i >= 2 ? (r >>> (i - 2)) & 1 : 0;
      const b1 = i >= 1 ? (r >>> (i - 1)) & 1 : 0;
      const b2 = (r >>> i) & 1;
      if (ruleBits[(b0 << 2) | (b1 << 1) | b2]) out |= 1 << i;
    }
    return out & mask;
  };
}

// The fast path for rule 30 exactly: 4r XOR (2r OR r), truncated.
function makeRule30Step(n) {
  const mask = (1 << n) - 1;
  return (r) => ((4 * r) ^ ((2 * r) | r)) & mask;
}

// tail and cycle of the orbit of one start, by table lookup (n <= 24).
function orbitTail(step, start, n) {
  const seen = new Map();
  let r = start, t = 0;
  for (;;) {
    if (seen.has(r)) return { tail: seen.get(r), cycle: t - seen.get(r) };
    seen.set(r, t);
    r = step(r);
    t++;
    if (t > (1 << n) + 4) return { tail: -1, cycle: -1 };
  }
}

// depth of the functional graph = least t with |T^t(Q)| = |T^{t+1}(Q)|, and the
// stabilised image is the attractor. Done by iterating a bitset of the whole
// state set: O(2^n) per step, no per-state parent array.
function graphDepthAndAttractor(step, n) {
  const N = 1 << n;
  let cur = new Uint8Array(N).fill(1);
  let size = N;
  for (let t = 0; ; t++) {
    const nxt = new Uint8Array(N);
    let s = 0;
    for (let r = 0; r < N; r++) if (cur[r]) { const q = step(r); if (!nxt[q]) { nxt[q] = 1; s++; } }
    if (s === size) return { depth: t, attractor: s };
    cur = nxt; size = s;
  }
}

// ---------- (D) an explicit triangular map with an exponential tail ----------
// bits 0..n-2 run the binary odometer (r -> r+1), which is a T-function.
// bit n-1 is CLEARED when the low part is 0 and HELD otherwise -- a triangular
// dependence on bits 0..n-1. So bit n-1 keeps its start value until the
// odometer first returns to 0, which takes up to 2^{n-1} steps.
function makeOdometerHoldStep(n) {
  const low = (1 << (n - 1)) - 1;
  const top = 1 << (n - 1);
  return (r) => {
    const l = r & low;
    const nl = (l + 1) & low;
    const b = (l === 0) ? 0 : (r & top);
    return nl | b;
  };
}

// ---------- (B)/(C) random triangular maps ----------
function mix32(a, b) {
  let h = (a * 0x9e3779b1) ^ (b + 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return (h ^ (h >>> 15)) >>> 0;
}

// (B) fresh random radius-3 rule at every level i (still a T-function).
function makeRandomLevelEcaStep(n, seed) {
  const tables = [];
  for (let i = 0; i < n; i++) {
    const t = new Uint8Array(8);
    for (let k = 0; k < 8; k++) t[k] = (mix32(seed * 131 + i, k) >>> 3) & 1;
    tables.push(t);
  }
  const mask = (1 << n) - 1;
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const b0 = i >= 2 ? (r >>> (i - 2)) & 1 : 0;
      const b1 = i >= 1 ? (r >>> (i - 1)) & 1 : 0;
      const b2 = (r >>> i) & 1;
      if (tables[i][(b0 << 2) | (b1 << 1) | b2]) out |= 1 << i;
    }
    return out & mask;
  };
}

// (C) bit i a uniformly random function of bits 0..i, realised by hashing the
// masked state. Deterministic, and a uniformly random T-function in law.
function makeRandomTFunctionStep(n, seed) {
  const mask = (1 << n) - 1;
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const s = r & ((2 << i) - 1); // bits 0..i
      if ((mix32(seed * 7919 + i * 31 + 1, s) >>> 9) & 1) out |= 1 << i;
    }
    return out & mask;
  };
}

// ---------- runs ----------

function slope(ns, ys) { // least squares through the origin-free line y = a n + b
  const m = ns.length;
  const sx = ns.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxx = ns.reduce((a, b) => a + b * b, 0), sxy = ns.reduce((a, b, i) => a + b * ys[i], 0);
  const a = (m * sxy - sx * sy) / (m * sxx - sx * sx);
  return a;
}

const NS = [];
for (let n = 6; n <= 20; n++) NS.push(n);

console.log("=== rule 30, as a triangular map on n bits ===");
{
  const t1 = [], dp = [], at = [];
  for (const n of NS) {
    const step = makeRule30Step(n);
    const { tail } = orbitTail(step, 1, n);
    const { depth, attractor } = graphDepthAndAttractor(step, n);
    t1.push(tail); dp.push(depth); at.push(attractor);
    console.log(`n=${n}  tail1=${tail}  depth=${depth}  attractor=${attractor}`);
  }
  console.log(`slope tail1 = ${slope(NS, t1).toFixed(3)}, slope depth = ${slope(NS, dp).toFixed(3)}, slope attractor = ${slope(NS, at).toFixed(3)}`);
}

console.log("\n=== (D) an explicit triangular map with an exponential tail ===");
for (const n of [8, 12, 16, 20]) {
  const step = makeOdometerHoldStep(n);
  const { depth, attractor } = graphDepthAndAttractor(step, n);
  console.log(`n=${n}  depth=${depth}  (2^{n-1} = ${1 << (n - 1)})  attractor=${attractor}`);
}

console.log("\n=== (B) random T-function, fresh random radius-3 rule per level ===");
{
  const SEEDS = 40;
  for (const n of [10, 14, 18]) {
    let st = 0, sd = 0, sa = 0, cnt = 0;
    let mx = 0;
    for (let s = 1; s <= SEEDS; s++) {
      const step = makeRandomLevelEcaStep(n, s);
      const { tail } = orbitTail(step, 1, n);
      const { depth, attractor } = graphDepthAndAttractor(step, n);
      st += tail; sd += depth; sa += attractor; cnt++;
      if (depth > mx) mx = depth;
    }
    console.log(`n=${n}  mean tail1=${(st / cnt).toFixed(2)}  mean depth=${(sd / cnt).toFixed(2)}  max depth=${mx}  mean attractor=${(sa / cnt).toFixed(1)}`);
  }
}

console.log("\n=== (C) random T-function, bit i a random function of all bits <= i ===");
{
  const SEEDS = 40;
  for (const n of [10, 14, 18]) {
    let st = 0, sd = 0, sa = 0, cnt = 0, mx = 0;
    for (let s = 1; s <= SEEDS; s++) {
      const step = makeRandomTFunctionStep(n, s);
      const { tail } = orbitTail(step, 1, n);
      const { depth, attractor } = graphDepthAndAttractor(step, n);
      st += tail; sd += depth; sa += attractor; cnt++;
      if (depth > mx) mx = depth;
    }
    console.log(`n=${n}  mean tail1=${(st / cnt).toFixed(2)}  mean depth=${(sd / cnt).toFixed(2)}  max depth=${mx}  mean attractor=${(sa / cnt).toFixed(1)}`);
  }
}

console.log("\n=== (A) all 256 elementary rules as triangular maps: depth slope ===");
{
  const rows = [];
  const ns = [10, 12, 14, 16, 18];
  for (let R = 0; R < 256; R++) {
    const bits = [];
    for (let k = 0; k < 8; k++) bits.push((R >>> k) & 1);
    const ds = [], t1s = [], as = [];
    for (const n of ns) {
      const step = makeEcaStep(bits, n);
      const { depth, attractor } = graphDepthAndAttractor(step, n);
      const { tail } = orbitTail(step, 1, n);
      ds.push(depth); t1s.push(tail); as.push(attractor);
    }
    rows.push({ R, dslope: slope(ns, ds), d18: ds[ds.length - 1], t18: t1s[t1s.length - 1], a18: as[as.length - 1] });
  }
  rows.sort((a, b) => b.dslope - a.dslope);
  console.log("worst 12 rules by depth slope:");
  for (const r of rows.slice(0, 12)) console.log(`  rule ${r.R}: depth slope ${r.dslope.toFixed(3)}  depth(18)=${r.d18}  tail1(18)=${r.t18}  attractor(18)=${r.a18}`);
  const r30 = rows.find((r) => r.R === 30);
  const rank = rows.findIndex((r) => r.R === 30) + 1;
  console.log(`  rule 30: depth slope ${r30.dslope.toFixed(3)}  depth(18)=${r30.d18}  tail1(18)=${r30.t18}  attractor(18)=${r30.a18}   [rank ${rank} of 256, largest slope first]`);
  const over2 = rows.filter((r) => r.d18 > 2 * (18 - 1)).length;
  console.log(`  rules with depth(18) > 2*(18-1) = 34 (i.e. violating the wall's budget at n=18): ${over2}`);
  const superlinear = rows.filter((r) => r.d18 > 60).length;
  console.log(`  rules with depth(18) > 60: ${superlinear}`);
  let sum = 0; for (const r of rows) sum += r.dslope;
  console.log(`  mean depth slope over all 256 rules: ${(sum / 256).toFixed(3)}`);
}
