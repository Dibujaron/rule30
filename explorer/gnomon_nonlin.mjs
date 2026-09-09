// Gnomon — does the transient depth of an elementary rule, read as a triangular
// map on n bits, track its distance from being F2-affine?
//
// Fitting's lemma gives depth <= n for an affine map with no effort. Rule 30 is
// rule 150 XOR one quadratic term: 4r ^ (2r|r) = (4r ^ 2r ^ r) ^ (2r & r).
// If depth grew with nonlinearity, "perturbed Fitting" would be a route. This
// measures the correlation over all 256 rules.

function analyse(step, n) {
  const N = 1 << n;
  const next = new Int32Array(N);
  for (let x = 0; x < N; x++) next[x] = step(x);
  const indeg = new Int32Array(N);
  for (let x = 0; x < N; x++) indeg[next[x]]++;
  const stack = new Int32Array(N); let sp = 0;
  for (let x = 0; x < N; x++) if (indeg[x] === 0) stack[sp++] = x;
  const removed = new Uint8Array(N);
  while (sp > 0) { const x = stack[--sp]; removed[x] = 1; if (--indeg[next[x]] === 0) stack[sp++] = next[x]; }
  const depth = new Int32Array(N).fill(-1);
  for (let x = 0; x < N; x++) if (!removed[x]) depth[x] = 0;
  const path = new Int32Array(N); let maxDepth = 0;
  for (let x0 = 0; x0 < N; x0++) {
    if (depth[x0] >= 0) continue;
    let len = 0, x = x0;
    while (depth[x] < 0) { path[len++] = x; x = next[x]; }
    let d = depth[x];
    while (len > 0) { d++; depth[path[--len]] = d; }
    if (d > maxDepth) maxDepth = d;
  }
  return maxDepth;
}
function makeEcaStep(bits, n) {
  const mask = (1 << n) - 1;
  return (r) => {
    let out = 0;
    for (let i = 0; i < n; i++) {
      const b0 = i >= 2 ? (r >>> (i - 2)) & 1 : 0;
      const b1 = i >= 1 ? (r >>> (i - 1)) & 1 : 0;
      const b2 = (r >>> i) & 1;
      if (bits[(b0 << 2) | (b1 << 1) | b2]) out |= 1 << i;
    }
    return out & mask;
  };
}
const tableOf = (R) => { const b = []; for (let k = 0; k < 8; k++) b.push((R >>> k) & 1); return b; };

// distance from the nearest affine function of 3 variables (16 of them)
function nonlinearity(R) {
  const b = tableOf(R);
  let best = 8;
  for (let a = 0; a < 16; a++) {
    const a0 = a & 1, a1 = (a >> 1) & 1, a2 = (a >> 2) & 1, a3 = (a >> 3) & 1;
    let d = 0;
    for (let k = 0; k < 8; k++) {
      const l = (k >> 2) & 1, c = (k >> 1) & 1, r = k & 1;
      const v = a0 ^ (a1 & l) ^ (a2 & c) ^ (a3 & r);
      if (v !== b[k]) d++;
    }
    if (d < best) best = d;
  }
  return best;
}

const NS = [12, 16, 20];
const byNL = new Map();
const rows = [];
for (let R = 0; R < 256; R++) {
  const nl = nonlinearity(R);
  const ds = NS.map((n) => analyse(makeEcaStep(tableOf(R), n), n));
  rows.push({ R, nl, ds });
  if (!byNL.has(nl)) byNL.set(nl, []);
  byNL.get(nl).push({ R, d: ds[2] });
}
console.log("nonlinearity = Hamming distance of the local rule from the nearest affine function");
console.log("depth measured at n = 20 (the wall's budget there is 2n-2 = 38)\n");
console.log("NL   #rules   mean depth   max depth   max depth / n   worst rules");
for (const nl of [...byNL.keys()].sort((a, b) => a - b)) {
  const g = byNL.get(nl);
  const mean = g.reduce((s, x) => s + x.d, 0) / g.length;
  const mx = Math.max(...g.map((x) => x.d));
  const worst = g.filter((x) => x.d === mx).map((x) => x.R).slice(0, 6).join(",");
  console.log(` ${nl}   ${String(g.length).padStart(6)}   ${mean.toFixed(2).padStart(10)}   ${String(mx).padStart(9)}   ${(mx / 20).toFixed(3).padStart(13)}   ${worst}`);
}
const r30 = rows[30];
console.log(`\nrule 30: nonlinearity ${r30.nl}, depth at n=12,16,20 = ${r30.ds.join(", ")}`);
console.log(`rule 150 (its affine part, l^c^r): nonlinearity ${rows[150].nl}, depth = ${rows[150].ds.join(", ")}`);
console.log(`rule  90 (l^r):                    nonlinearity ${rows[90].nl}, depth = ${rows[90].ds.join(", ")}`);

// correlation between nonlinearity and depth at n = 20
{
  const xs = rows.map((r) => r.nl), ys = rows.map((r) => r.ds[2]);
  const m = xs.length;
  const mx = xs.reduce((a, b) => a + b) / m, my = ys.reduce((a, b) => a + b) / m;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < m; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  console.log(`\nPearson correlation(nonlinearity, depth at n=20) over 256 rules = ${(sxy / Math.sqrt(sxx * syy)).toFixed(3)}`);
}
