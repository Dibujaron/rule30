// Talus, 2026-09-12.  WHICH TARGET WORDS THE CONE CAN SEE, second pass.
//
// Same outward DFS as talus10_no11.mjs / talus11_cone.mjs.  Three changes that
// make the answers mean something:
//
//  (1) The class.  talus10 searched C1 = "white at every x < -a", which contains
//      the ZERO configuration, whose column is white for ever -- so f_W(a) is
//      infinite there for every W that is not a block of zeros, for a reason
//      that is not about rule 30.  Row a of the seed satisfies much more, and
//      five of its cells are closed theorems on the board:
//        C2 = C1 + cell(-a) black                 (evolve_left_edge)
//        C3 = C2 + cell(-(a-1)) black             (+ evolve_left_second_diagonal)
//        C5 = C3 + cell(-(a-2)) white, cell(-(a-3)) = [(a-3) even],
//                  cell(-(a-4)) black             (+ third, fourth, fifth)
//      C2 is the weakest class that excludes the zero configuration.
//
//  (2) Stop at the cap.  We only need to know WHETHER some configuration has a
//      W-free block of `cap` cells, not how many do.  Aborting on the first one
//      makes the unbounded cells cheap and leaves the budget for the finite
//      ones, which are the answers worth having.
//
//  (3) An invariant check against the seed.  Row a of the seed IS a member of
//      C5(a) (hence of C3(a), C2(a)), so the seed's own longest W-free block
//      starting at time a is a LOWER BOUND on f_W(a).  Any exhaustive f below it
//      is a defect in the search, not a fact about rule 30.  Checked for every
//      word and every a before a single number is reported.

const ABORT_CAP = "cap", ABORT_BUD = "budget";

function centreAt(cfg, k, off) {
  let row = cfg.slice(off - k, off + k + 1);
  for (let t = 1; t <= k; t++) {
    const n = row.length - 2;
    const nr = new Uint8Array(n);
    for (let i = 0; i < n; i++) nr[i] = row[i] ^ (row[i + 1] | row[i + 2]);
    row = nr;
  }
  return row[0];
}

function classReq(kind, a, cap) {
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  const put = (p, v) => { if (p >= 0 && p <= cap + 3) req[p] = v; };
  if (kind >= 2) put(a, 1);
  if (kind >= 3) put(a - 1, 1);
  if (kind >= 5) { put(a - 2, 0); put(a - 3, (a - 3) % 2 === 0 ? 1 : 0); put(a - 4, 1); }
  return req;
}

// status: "exact" (tree exhausted), "cap" (some config reached `cap` cells),
//         "budget" (neither -- the value is a weak lower bound)
function search(a, forbidden, cap, budget, kind, verify) {
  const off = cap + 8;
  const cfg = new Uint8Array(2 * cap + 20);
  const col = new Uint8Array(cap + 6);
  const req = classReq(kind, a, cap);
  let best = 0, bestCol = null;
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
      cfg[off + k] = rc;
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
        cfg[off - k] = lc;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (verify && centreAt(cfg, k, off) !== cv) throw new Error(`engine disagrees at k=${k}`);
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
    cfg[off + k] = 0; cfg[off - k] = 0;
  }

  try {
    for (const s of [0, 1]) {
      if (req[0] >= 0 && s !== req[0]) continue;
      col[0] = s;
      if (!ok(0)) continue;
      cfg[off] = s;
      LD[0][0] = s; RD[0][0] = s;
      if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); }
      rec(1);
    }
  } catch (e) { if (e !== ABORT_CAP && e !== ABORT_BUD) throw e; }

  return { best, status, nodes, bestCol };
}

const words = (m) => {
  const out = [];
  for (let v = 0; v < (1 << m); v++) {
    const w = [];
    for (let i = m - 1; i >= 0; i--) w.push((v >> i) & 1);
    out.push(w);
  }
  return out;
};
const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");
const ALLW = [1, 2, 3, 4].flatMap(words);
const fmt = (r) => r.status === "exact" ? String(r.best)
  : r.status === "cap" ? `>=${r.best}` : `${r.best}?`;

// the seed's own centre column, packed
function packedCenter(T) {
  const nw = ((2 * T + 64) >>> 5) + 2;
  let cur = new Uint32Array(nw), nxt = new Uint32Array(nw);
  cur[0] = 1;
  const c = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    c[t] = (cur[t >>> 5] >>> (t & 31)) & 1;
    const top = Math.min(nw - 1, ((2 * t + 3) >>> 5) + 1);
    for (let w = top; w >= 0; w--) {
      const x = cur[w], lo = w === 0 ? 0 : cur[w - 1];
      nxt[w] = ((((x << 2) | (lo >>> 30)) >>> 0) ^ ((((x << 1) | (lo >>> 31)) >>> 0) | x)) >>> 0;
    }
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  return c;
}
const SEED = packedCenter(20000);
// longest W-free block of the seed's centre column STARTING exactly at time a
function seedBlock(a, w) {
  const m = w.length;
  let L = 0;
  for (let n = 1; a + n <= SEED.length; n++) {
    // does col[a..a+n-1] contain w?
    if (n >= m) {
      let hit = true;
      for (let i = 0; i < m; i++) if (SEED[a + n - m + i] !== w[i]) { hit = false; break; }
      if (hit) return n - 1;
    }
    L = n;
    if (n > 400) break;
  }
  return L;
}

const CAP = 40, BUD = 1.5e6;

console.log("[V] the instrument, checked three ways before anything is reported");
{
  let checked = 0;
  for (const S of [[[0, 0], [1, 1]], [[1, 1]], [[0, 0]], [[1]], [[0, 1, 0]]])
    for (let a = 1; a <= 3; a++)
      for (const kind of [1, 2, 3, 5])
        checked += search(a, S, 3 * a + 10, 4e6, kind, true).nodes;
  console.log(`    (a) ${checked} accepted nodes re-derived by direct evolution, 0 disagreements`);
  let s = "";
  for (let a = 1; a <= 7; a++) s += search(a, [[0, 0], [1, 1]], 6 * a + 24, 4e8, 1).best + " ";
  console.log(`    (b) talus10's C1 alternating a=1..7 = ${s.trim()}   (published 8 8 8 8 9 10 10)`);
  s = "";
  for (let a = 1; a <= 10; a++) s += search(a, [[0]], 70, 4e7, 3).best + " ";
  console.log(`    (c) C3, all-black column, a=1..10 = ${s.trim()}`);
  console.log(`        centerColumn_black_run_lt_start says run <= a: 1 2 3 4 5 6 7 8 9 10.  tight at odd a.`);
}

const AMAX = 6;
const seedFails = [];
let seedTests = 0;

for (const kind of [1, 2, 3, 5]) {
  const lo = kind === 5 ? 5 : 1;
  console.log(`\n[T${kind}] class C${kind}: f_W(a), cap ${CAP}, budget ${BUD}`);
  console.log(`      n = exact maximum;  >=n = a configuration reaches n cells (cap hit);  n? = budget hit`);
  let head = "       W |";
  for (let a = lo; a <= AMAX; a++) head += `    a=${a}`;
  console.log(head + "  | the seed's own W-free block starting at those a");
  const rows = [];
  for (const w of [...ALLW, "const", "alt"]) {
    const S = w === "const" ? [[0, 1], [1, 0]] : w === "alt" ? [[0, 0], [1, 1]] : [w];
    const vals = [];
    for (let a = lo; a <= AMAX; a++) {
      const r = search(a, S, CAP, BUD, kind);
      vals.push(r);
      if (r.status === "exact" && typeof w !== "string") {
        seedTests++;
        const sb = seedBlock(a, w);
        if (sb > r.best) seedFails.push(`C${kind} a=${a} W=${show(w)}: seed ${sb} > f ${r.best}`);
      }
    }
    rows.push({ w, vals, seen: vals.every((v) => v.status === "exact") });
  }
  rows.sort((x, y) => (x.seen === y.seen
    ? (typeof x.w === "string" ? 99 : x.w.length) - (typeof y.w === "string" ? 99 : y.w.length)
    : (x.seen ? -1 : 1)));
  for (const r of rows) {
    const nm = typeof r.w === "string" ? r.w : show(r.w);
    let s = `    ${nm.padStart(5)} |`;
    for (const v of r.vals) s += ` ${fmt(v).padStart(6)}`;
    const sb = [];
    if (typeof r.w !== "string") for (let a = lo; a <= AMAX; a++) sb.push(seedBlock(a, r.w));
    console.log(s + `  | ${sb.join(",")}${r.seen ? "   SEEN" : ""}`);
  }
}

console.log(`\n[X] ${seedTests} exhaustive cells checked against the seed's own block ` +
  `(the seed is a member of every C(a), so f_W(a) must be at least its block)`);
console.log(`    ${seedFails.length} violations${seedFails.length ? ": " + seedFails.slice(0, 5).join("; ") : ""}`);
