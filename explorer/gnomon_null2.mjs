// Gnomon — the right null model for the onset wall's tail bound. (v2: O(2^n)
// per map, by building the whole functional graph and peeling it, instead of
// iterating the image set.)
//
// The wall is a preperiod ("tail") bound for the orbit of 1 under
//   T_n(r) = (4r XOR (2r OR r)) mod 2^n,
// i.e. rule 30's local map read as a lower-triangular (T-function) map on n
// bits: bit_i(T r) = f(bit_{i-2} r, bit_{i-1} r, bit_i r), bits below 0 white.
//
// A random map on 2^n points has tail ~ 2^{n/2}. That is the WRONG null. The
// right null is a random TRIANGULAR map. Measured here:
//   (A) all 256 elementary rules read as triangular maps on n bits
//   (B) random T-functions, fresh random radius-3 rule at every level
//   (C) random T-functions, bit i a random function of ALL bits <= i
//   (D) an explicit triangular map with tail exactly 2^{n-1} - 1
// against rule 30.

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
function makeRule30Step(n) {
  const mask = (1 << n) - 1;
  return (r) => ((4 * r) ^ ((2 * r) | r)) & mask;
}
function mix32(a, b) {
  let h = Math.imul(a, 0x9e3779b1) ^ (b + 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return (h ^ (h >>> 15)) >>> 0;
}
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
function makeRandomTFunctionStep(n, seed) {
  const mask = (1 << n) - 1;
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const s = r & ((2 << i) - 1);
      if ((mix32(seed * 7919 + i * 31 + 1, s) >>> 9) & 1) out |= 1 << i;
    }
    return out & mask;
  };
}

// Whole functional graph: tail depth of every state, and the attractor size.
function analyse(step, n) {
  const N = 1 << n;
  const next = new Int32Array(N);
  for (let x = 0; x < N; x++) next[x] = step(x);
  const indeg = new Int32Array(N);
  for (let x = 0; x < N; x++) indeg[next[x]]++;
  // peel the trees: what survives is exactly the cyclic states
  const stack = new Int32Array(N);
  let sp = 0;
  for (let x = 0; x < N; x++) if (indeg[x] === 0) stack[sp++] = x;
  const removed = new Uint8Array(N);
  while (sp > 0) {
    const x = stack[--sp];
    removed[x] = 1;
    const y = next[x];
    if (--indeg[y] === 0) stack[sp++] = y;
  }
  let attractor = 0;
  for (let x = 0; x < N; x++) if (!removed[x]) attractor++;
  // depth (tail length) by memoised path following
  const depth = new Int32Array(N).fill(-1);
  for (let x = 0; x < N; x++) if (!removed[x]) depth[x] = 0;
  const path = new Int32Array(N);
  let maxDepth = 0;
  for (let x0 = 0; x0 < N; x0++) {
    if (depth[x0] >= 0) continue;
    let len = 0, x = x0;
    while (depth[x] < 0) { path[len++] = x; x = next[x]; }
    let d = depth[x];
    while (len > 0) { d++; depth[path[--len]] = d; }
    if (d > maxDepth) maxDepth = d;
  }
  return { tail1: depth[1 % N], depth: maxDepth, attractor };
}

function slope(ns, ys) {
  const m = ns.length;
  const sx = ns.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxx = ns.reduce((a, b) => a + b * b, 0);
  const sxy = ns.reduce((a, b, i) => a + b * ys[i], 0);
  return (m * sxy - sx * sy) / (m * sxx - sx * sx);
}

console.log("=== rule 30, as a triangular map on n bits ===");
{
  const ns = [], t1 = [], dp = [], at = [];
  for (let n = 6; n <= 22; n++) {
    const r = analyse(makeRule30Step(n), n);
    ns.push(n); t1.push(r.tail1); dp.push(r.depth); at.push(r.attractor);
    console.log(`n=${n}  tail1=${r.tail1}  depth=${r.depth}  attractor=${r.attractor}  budget 2(n-1)=${2 * (n - 1)}`);
  }
  console.log(`slopes: tail1 ${slope(ns, t1).toFixed(3)}, depth ${slope(ns, dp).toFixed(3)}, attractor ${slope(ns, at).toFixed(3)}`);
}

console.log("\n=== (D) explicit triangular map with an exponential tail ===");
console.log("bits 0..n-2 = binary odometer; bit n-1 held until the odometer returns to 0, then cleared.");
for (const n of [8, 12, 16, 20, 24, 28]) {
  // tail of the start (top bit set, low part = 1): the odometer needs 2^{n-1}-1
  // steps to come back to 0, and only then does the top bit lose its value.
  const low = (1 << (n - 1)) - 1;
  const top = 1 << (n - 1);
  let r = top | 1, t = 0;
  while ((r & top) !== 0) { const l = r & low; r = ((l + 1) & low) | (l === 0 ? 0 : (r & top)); t++; }
  console.log(`n=${n}  tail of start (2^{n-1} + 1) = ${t}   2^{n-1} = ${top}`);
}

console.log("\n=== (B) random T-function: fresh random radius-3 rule per level ===");
for (const n of [10, 14, 18, 20]) {
  let st = 0, sd = 0, sa = 0, mx = 0, cnt = 0, over = 0;
  for (let s = 1; s <= 60; s++) {
    const r = analyse(makeRandomLevelEcaStep(n, s), n);
    st += r.tail1; sd += r.depth; sa += r.attractor; cnt++;
    if (r.depth > mx) mx = r.depth;
    if (r.depth > 2 * (n - 1)) over++;
  }
  console.log(`n=${n}  mean tail1=${(st / cnt).toFixed(2)}  mean depth=${(sd / cnt).toFixed(2)}  max depth=${mx}  mean attractor=${(sa / cnt).toFixed(1)}  depth>2(n-1) in ${over}/${cnt}`);
}

console.log("\n=== (C) random T-function: bit i a random function of all bits <= i ===");
for (const n of [10, 14, 18, 20]) {
  let st = 0, sd = 0, sa = 0, mx = 0, cnt = 0, over = 0;
  for (let s = 1; s <= 60; s++) {
    const r = analyse(makeRandomTFunctionStep(n, s), n);
    st += r.tail1; sd += r.depth; sa += r.attractor; cnt++;
    if (r.depth > mx) mx = r.depth;
    if (r.depth > 2 * (n - 1)) over++;
  }
  console.log(`n=${n}  mean tail1=${(st / cnt).toFixed(2)}  mean depth=${(sd / cnt).toFixed(2)}  max depth=${mx}  mean attractor=${(sa / cnt).toFixed(1)}  depth>2(n-1) in ${over}/${cnt}`);
}

console.log("\n=== (A) all 256 elementary rules as triangular maps ===");
{
  const ns = [12, 14, 16, 18];
  const rows = [];
  for (let R = 0; R < 256; R++) {
    const bits = [];
    for (let k = 0; k < 8; k++) bits.push((R >>> k) & 1);
    const ds = [], t1s = [], as = [];
    for (const n of ns) {
      const r = analyse(makeEcaStep(bits, n), n);
      ds.push(r.depth); t1s.push(r.tail1); as.push(r.attractor);
    }
    rows.push({ R, dslope: slope(ns, ds), d18: ds[3], t18: t1s[3], a18: as[3] });
  }
  const sorted = rows.slice().sort((a, b) => b.d18 - a.d18);
  console.log("worst 15 rules by depth at n=18 (budget 2(n-1)=34):");
  for (const r of sorted.slice(0, 15)) console.log(`  rule ${String(r.R).padStart(3)}: depth(18)=${r.d18}  slope ${r.dslope.toFixed(2)}  tail1(18)=${r.t18}  attractor(18)=${r.a18}`);
  const r30 = rows[30];
  const rank = sorted.findIndex((r) => r.R === 30) + 1;
  console.log(`  rule  30: depth(18)=${r30.d18}  slope ${r30.dslope.toFixed(2)}  tail1(18)=${r30.t18}  attractor(18)=${r30.a18}   [rank ${rank} of 256, deepest first]`);
  const over = sorted.filter((r) => r.d18 > 34);
  console.log(`  rules with depth(18) > 34: ${over.length}  -> ${over.map((r) => r.R).join(",")}`);
  const big = sorted.filter((r) => r.d18 > 100);
  console.log(`  rules with depth(18) > 100: ${big.length}  -> ${big.map((r) => r.R + ":" + r.d18).join(",")}`);
  let s = 0; for (const r of rows) s += r.d18;
  console.log(`  mean depth(18) over 256 rules: ${(s / 256).toFixed(2)}   median: ${sorted[128].d18}`);
  const medslope = rows.map((r) => r.dslope).sort((a, b) => a - b)[128];
  console.log(`  median depth slope over 256 rules: ${medslope.toFixed(3)}`);
}
