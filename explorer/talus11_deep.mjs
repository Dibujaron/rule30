// Talus, 2026-09-12.  The two cells the classification turns on, exhaustively,
// plus the candidate criterion's left-hand side.
//
// [G] For each target set S, the growth rate of the S-free LANGUAGE (the number
//     of S-free words of length n).  Transfer matrix on the (m-1)-suffix, Perron
//     root by power iteration.  Zero entropy = polynomial growth = the subshift
//     is countable and every point is eventually constant or periodic.
//
// [D] f_W(a) for W = 00 and W = 11 -- the only two single words of length 2 whose
//     avoidance language grows exponentially, and the two the occurrence ladder
//     would need for a SINGLE-COLOUR result -- run to exhaustion where the clock
//     allows, in talus10's class C1 and in the cone classes C2 and C3.

const ABORT_CAP = "cap", ABORT_BUD = "budget";

function classReq(kind, a, cap) {
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  const put = (p, v) => { if (p >= 0 && p <= cap + 3) req[p] = v; };
  if (kind >= 2) put(a, 1);
  if (kind >= 3) put(a - 1, 1);
  if (kind >= 5) { put(a - 2, 0); put(a - 3, (a - 3) % 2 === 0 ? 1 : 0); put(a - 4, 1); }
  return req;
}

function search(a, forbidden, cap, budget, kind) {
  const off = cap + 8;
  const col = new Uint8Array(cap + 6);
  const req = classReq(kind, a, cap);
  let best = 0;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let nodes = 0, status = "exact";

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
    if (k > cap) { status = "cap"; throw ABORT_CAP; }
    if (++nodes > budget) { status = "budget"; throw ABORT_BUD; }
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
        if (k + 1 > best) best = k + 1;
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
      if (1 > best) best = 1;
      rec(1);
    }
  } catch (e) { if (e !== ABORT_CAP && e !== ABORT_BUD) throw e; }
  return { best, status, nodes };
}

const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");

// ---- [G] growth rate of the S-free language ---------------------------------
function growth(S) {
  const m = Math.max(...S.map((w) => w.length));
  const K = m - 1;                       // state = last K symbols
  const N = 1 << K;
  const bad = (hist, next) => {          // hist = last K symbols, oldest first
    const seq = [...hist, next];
    for (const w of S) {
      if (w.length > seq.length) continue;
      let hit = true;
      for (let i = 0; i < w.length; i++) if (seq[seq.length - w.length + i] !== w[i]) { hit = false; break; }
      if (hit) return true;
    }
    return false;
  };
  const bits = (v) => { const o = []; for (let i = K - 1; i >= 0; i--) o.push((v >> i) & 1); return o; };
  const M = [];
  for (let v = 0; v < N; v++) {
    const row = new Float64Array(N);
    const h = bits(v);
    for (const nx of [0, 1]) {
      if (bad(h, nx)) continue;
      const nv = K === 0 ? 0 : ((v << 1) | nx) & (N - 1);
      row[nv] += 1;
    }
    M.push(row);
  }
  // count words of length n directly (exact), and the Perron root by iteration
  let vec = new Float64Array(N).fill(1), lam = 0;
  for (let it = 0; it < 4000; it++) {
    const nv = new Float64Array(N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) nv[j] += M[i][j] * vec[i];
    let s = 0; for (let j = 0; j < N; j++) s += nv[j];
    if (s === 0) { lam = 0; break; }
    lam = s / vec.reduce((x, y) => x + y, 0);
    for (let j = 0; j < N; j++) nv[j] /= s;
    vec = nv;
  }
  // exact count of S-free words of length 12 as a cross-check on lam
  let cnt = 0;
  for (let v = 0; v < (1 << 12); v++) {
    const w = []; for (let i = 11; i >= 0; i--) w.push((v >> i) & 1);
    let bad2 = false;
    for (const f of S) for (let p = 0; p + f.length <= 12 && !bad2; p++) {
      let hit = true;
      for (let i = 0; i < f.length; i++) if (w[p + i] !== f[i]) { hit = false; break; }
      if (hit) bad2 = true;
    }
    if (!bad2) cnt++;
  }
  return { lam, cnt };
}

console.log("[G] growth of the W-free language: L(12) = number of W-free words of length 12,");
console.log("    lambda = growth rate per symbol.  lambda = 1 means polynomial growth (zero entropy).");
const sets = [];
for (let m = 1; m <= 4; m++)
  for (let v = 0; v < (1 << m); v++) {
    const w = []; for (let i = m - 1; i >= 0; i--) w.push((v >> i) & 1);
    sets.push([show(w), [w]]);
  }
sets.push(["{01,10} const", [[0, 1], [1, 0]]]);
sets.push(["{00,11} alt", [[0, 0], [1, 1]]]);
const grows = [];
for (const [name, S] of sets) {
  const g = growth(S);
  grows.push([name, g]);
}
grows.sort((x, y) => x[1].lam - y[1].lam);
for (const [name, g] of grows)
  console.log(`    ${name.padStart(12)}  L(12) = ${String(g.cnt).padStart(4)}   lambda = ${g.lam.toFixed(5)}` +
    `${g.lam < 1.0001 ? "   <- polynomial" : ""}`);

// ---- [D] the decisive cells -------------------------------------------------
const CAP = 80;
console.log(`\n[D] f_W(a) to exhaustion where the clock allows, cap ${CAP}`);
console.log("       W  class    a   f      status        nodes      seconds");
for (const [wn, w] of [["00", [0, 0]], ["11", [1, 1]]]) {
  for (const kind of [1, 2, 3]) {
    for (let a = 1; a <= 7; a++) {
      const t0 = Date.now();
      const r = search(a, [w], CAP, 2.4e8, kind);
      const dt = (Date.now() - t0) / 1000;
      console.log(`    ${wn.padStart(4)}    C${kind}   ${String(a).padStart(2)}  ${String(r.best).padStart(3)}` +
        `   ${r.status.padEnd(8)}  ${String(r.nodes).padStart(11)}   ${dt.toFixed(1)}`);
    }
  }
}
