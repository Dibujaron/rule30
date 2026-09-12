// Talus, 2026-09-12.  The mechanism behind the criterion, measured rather than
// argued.
//
// CLAIM.  Past radius a the cone supplies exactly ONE free bit per row -- the
// next right-half cell, cell(0,k) -- and the column value at that row is then
// FORCED, because the left cell it would otherwise flip has to be white.  So the
// surviving population multiplies by 2 (the free bit) and is cut by the fraction
// of forced values the target admits.  If the target language has growth rate
// lambda per symbol, that fraction is lambda/2 under the null that the forced
// value is a coin, so
//
//        population at depth k  ~  lambda^k.
//
// Hence: the search is extinct iff lambda = 1, and the cone sees exactly the
// zero-entropy targets.  This script measures the population growth exactly (no
// node budget, a fixed depth) and puts it beside lambda.
//
// The null is built in: lambda is computed from the TARGET alone, with no rule 30
// in it, so agreement is a statement about rule 30's forced column being
// coin-like and not about the target.

function classReq(kind, a, cap) {
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  const put = (p, v) => { if (p >= 0 && p <= cap + 3) req[p] = v; };
  if (kind >= 2) put(a, 1);
  if (kind >= 3) put(a - 1, 1);
  return req;
}

// exhaustive to depth K, exact population per level
function census(a, forbidden, K, kind, budget) {
  const col = new Uint8Array(K + 6);
  const req = classReq(kind, a, K);
  const LD = [], RD = [];
  for (let k = 0; k <= K + 3; k++) { LD.push(new Uint8Array(K + 4)); RD.push(new Uint8Array(K + 4)); }
  const pop = new Float64Array(K + 2);
  let nodes = 0, over = false;
  const STOP = "stop";

  function ok(k) {
    for (const w of forbidden) {
      const m = w.length;
      if (k + 1 < m) continue;
      let hit = true;
      for (let i = 0; i < m; i++) if (col[k - m + 1 + i] !== w[i]) { hit = false; break; }
      if (hit) return false;
    }
    return true;
  }

  function rec(k) {
    if (k > K) return;
    if (++nodes > budget) { over = true; throw STOP; }
    for (const rc of [0, 1]) {
      const rdk = RD[k], rd1 = RD[k - 1], rd2 = k >= 2 ? RD[k - 2] : null;
      rdk[0] = rc;
      for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
      const ldk = LD[k], ld1 = LD[k - 1], ld2 = k >= 2 ? LD[k - 2] : null;
      ldk[0] = 0;
      for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
      const centre0 = ldk[k - 1] ^ (col[k - 1] | rdk[k - 1]);
      for (const cv of [0, 1]) {
        const lc = centre0 ^ cv;
        if (req[k] >= 0 && lc !== req[k]) continue;
        col[k] = cv;
        if (!ok(k)) continue;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        pop[k]++;
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
  }

  try {
    for (const s of [0, 1]) {
      if (req[0] >= 0 && s !== req[0]) continue;
      col[0] = s;
      if (!ok(0)) continue;
      LD[0][0] = s; RD[0][0] = s;
      pop[0]++;
      rec(1);
    }
  } catch (e) { if (e !== STOP) throw e; }
  return { pop, nodes, over };
}

// growth rate of the target language, from the target alone
function lambdaOf(S) {
  const m = Math.max(...S.map((w) => w.length));
  const K = m - 1, N = 1 << K;
  const bits = (v) => { const o = []; for (let i = K - 1; i >= 0; i--) o.push((v >> i) & 1); return o; };
  const bad = (h, nx) => {
    const seq = [...h, nx];
    for (const w of S) {
      if (w.length > seq.length) continue;
      let hit = true;
      for (let i = 0; i < w.length; i++) if (seq[seq.length - w.length + i] !== w[i]) { hit = false; break; }
      if (hit) return true;
    }
    return false;
  };
  let vec = new Float64Array(N).fill(1);
  const M = [];
  for (let v = 0; v < N; v++) {
    const row = new Float64Array(N), h = bits(v);
    for (const nx of [0, 1]) if (!bad(h, nx)) row[K === 0 ? 0 : (((v << 1) | nx) & (N - 1))] += 1;
    M.push(row);
  }
  let lam = 0;
  for (let it = 0; it < 6000; it++) {
    const nv = new Float64Array(N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) nv[j] += M[i][j] * vec[i];
    let s = 0; for (let j = 0; j < N; j++) s += nv[j];
    const t = vec.reduce((x, y) => x + y, 0);
    if (s === 0) return 0;
    lam = s / t;
    for (let j = 0; j < N; j++) nv[j] /= s;
    vec = nv;
  }
  return lam;
}

const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");
const ALLW = [];
for (let m = 1; m <= 4; m++)
  for (let v = 0; v < (1 << m); v++) {
    const w = []; for (let i = m - 1; i >= 0; i--) w.push((v >> i) & 1);
    ALLW.push([show(w), [w]]);
  }
ALLW.push(["const", [[0, 1], [1, 0]]]);
ALLW.push(["alt", [[0, 0], [1, 1]]]);

// deepest exhaustive census whose tree fits in `cap` nodes -- never a partial one
function bestCensus(a, S, kind, capNodes) {
  let last = null;
  for (let K = 10; K <= 34; K++) {
    const r = census(a, S, K, kind, capNodes);
    if (r.over) break;
    last = { r, K };
    if (r.nodes > capNodes / 3) break;
  }
  if (!last) last = { r: census(a, S, 10, kind, 4e8), K: 10 };
  return last;
}

const A = 6, KIND = 2, BUD = 1.5e7;
console.log(`[P] exact survivor population by depth, class C${KIND}, a = ${A}`);
console.log(`    every census below is EXHAUSTIVE to its own depth -- no partial levels`);
console.log("    'measured' = (pop[K]/pop[m])^(1/(K-m)) over the deepest levels that are nonzero");
console.log("    'lambda'   = growth rate of the W-free language, computed from W alone");
console.log("\n       W |  lambda | measured | meas/lam | census depth | population trace (last 8)");
const out = [];
for (const [name, S] of ALLW) {
  const lam = lambdaOf(S);
  const { r, K } = bestCensus(A, S, KIND, BUD);
  let top = -1;
  for (let k = 0; k <= K; k++) if (r.pop[k] > 0) top = k;
  let meas = NaN; const m0 = Math.max(A + 2, top - 8);
  if (top > m0 && r.pop[m0] > 0) meas = Math.pow(r.pop[top] / r.pop[m0], 1 / (top - m0));
  const trace = [];
  for (let k = Math.max(0, top - 7); k <= top; k++) trace.push(r.pop[k]);
  out.push({ name, lam, meas, top, K, trace, extinct: top < K });
}
out.sort((x, y) => x.lam - y.lam);
for (const o of out)
  console.log(`    ${o.name.padStart(5)} | ${o.lam.toFixed(4)} | ${(isNaN(o.meas) ? "  --  " : o.meas.toFixed(4)).padStart(8)}` +
    ` | ${(isNaN(o.meas) ? "  --  " : (o.meas / o.lam).toFixed(3)).padStart(8)} | ${String(o.K).padStart(12)}` +
    ` | ${o.trace.join(" ")}${o.extinct ? "   EXTINCT at " + (o.top + 1) : ""}`);

console.log("\n[Q] the same in class C3, and in C1 for the two that separate the classes");
console.log("       W | class |  lambda | measured | census depth | extinct?");
for (const kind of [3, 1]) {
  for (const nm of ["0", "1", "01", "10", "00", "11", "const", "alt"]) {
    const e = ALLW.find((x) => x[0] === nm);
    const lam = lambdaOf(e[1]);
    const { r, K } = bestCensus(A, e[1], kind, BUD);
    let top = -1; for (let k = 0; k <= K; k++) if (r.pop[k] > 0) top = k;
    const m0 = Math.max(A + 2, top - 8);
    const meas = (top > m0 && r.pop[m0] > 0) ? Math.pow(r.pop[top] / r.pop[m0], 1 / (top - m0)) : NaN;
    console.log(`    ${nm.padStart(5)} |    C${kind} | ${lam.toFixed(4)} | ${(isNaN(meas) ? "  --  " : meas.toFixed(4)).padStart(8)}` +
      ` | ${String(K).padStart(12)} | ${top < K ? "extinct at " + (top + 1) : "alive, pop " + r.pop[top]}`);
  }
}
