// Talus, 2026-09-12.  The period ladder f(p,a), extended beyond this morning's
// 96 cells, with the fitted shape 2p+2a+2 tested rather than cited.
//
// CLASS.  C2(a) = configurations white at every x < -a and black at -a.  Row N
// of the seed is in C2(N) (evolve_eq_false_of_outside_cone plus
// evolve_left_edge), which is why f(p,a) < infinity for every p and a implies
// Prize 1.
//
// GEOMETRY.  Build the configuration outward by radius k.  Two diagonals per
// radius, both ending at the centre cell of time k:
//    LD_k[t] = cell(t, -k+t),  LD_k[t] = LD_k[t-1] XOR (LD_{k-1}[t-1] | LD_{k-2}[t-1])
//    RD_k[t] = cell(t,  k-t),  RD_k[t] = RD_{k-2}[t-1] XOR (RD_{k-1}[t-1] | RD_k[t-1])
// LD is AFFINE in its own seed cell(-k) -- left permutivity, the self term is in
// the XOR -- so exactly one cell(-k) gives each column value: the left cell is
// determined, never free.  RD is NOT affine in its own seed cell(+k): the self
// term sits inside the OR.  That asymmetry is the subject of talus12_branch.mjs.
//
// TARGET.  col[k] = col[k-p] for k >= p.  No forbidden-word machinery.

const ABORT_CAP = "cap", ABORT_BUD = "budget";

function search(a, p, cap, budget) {
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  let best = 0, bestCol = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let nodes = 0, status = "exact";

  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
    return rdk[k - 1];
  }

  function rec(k) {
    if (k > cap) { status = "cap"; throw ABORT_CAP; }
    if (++nodes > budget) { status = "budget"; throw ABORT_BUD; }
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
    const base = ldk[k - 1];
    for (const rc of [0, 1]) {
      const centre0 = base ^ (col[k - 1] | fillRD(k, rc));
      const rdk = RD[k];
      for (const cv of [0, 1]) {
        if (k >= p && cv !== col[k - p]) continue;
        const lc = centre0 ^ cv;
        if (req[k] >= 0 && lc !== req[k]) continue;
        col[k] = cv;
        const flip = (lc === 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
        ldk[k] = cv; rdk[k] = cv;
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
        rec(k + 1);
        if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      }
    }
  }

  try {
    for (const s of [0, 1]) {
      col[0] = s;
      LD[0][0] = s; RD[0][0] = s;
      if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); }
      rec(1);
    }
  } catch (e) { if (e !== ABORT_CAP && e !== ABORT_BUD) throw e; }
  return { best, status, nodes, bestCol };
}

const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");

// width of the widest level, before any constraint bites: 4 children per level
// while both the column bit and the left cell are free, 2 thereafter
const widest = (p, a) => { const m = Math.min(p, a); return 2 * Math.pow(4, m - 1) * Math.pow(2, Math.max(p, a) - m); };

// ---- engine control: the seed's own rows are members of C2(a) --------------
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
const SEED = packedCenter(300000);
const seedBlock = (a, p) => { let n = 0; while (a + n + p < SEED.length && SEED[a + n + p] === SEED[a + n]) n++; return n + p; };

const CAP = 96, BUD = 6e8, WIDTH_CAP = 6e6;
const PMAX = 12, AMAX = 18;

console.log(`[L] f(p,a): the longest exactly-p-periodic block of the centre column of a`);
console.log(`    configuration white at x < -a and black at -a.  cap ${CAP}, node budget ${BUD},`);
console.log(`    cells with predicted width above ${WIDTH_CAP} skipped and printed '-'.`);
console.log(`    bare number = exhaustive maximum.  + = reached the cap.  ? = budget.`);
let head = "      p |";
for (let a = 1; a <= AMAX; a++) head += `  a=${String(a).padStart(2)}`;
console.log(head);
const F = {};
for (let p = 1; p <= PMAX; p++) {
  let line = `    ${String(p).padStart(3)} |`;
  for (let a = 1; a <= AMAX; a++) {
    if (widest(p, a) > WIDTH_CAP) { line += `     -`; continue; }
    const r = search(a, p, CAP, BUD);
    F[`${p},${a}`] = r;
    line += ` ${(r.best + (r.status === "exact" ? "" : r.status === "cap" ? "+" : "?")).padStart(5)}`;
  }
  console.log(line);
}

// ---- control 1: the seed's own p-periodic block at row a must fit ----------
console.log(`\n[X] control: row a of the seed IS a member of C2(a), so f(p,a) must be at`);
console.log(`    least the seed's own p-periodic block starting at time a.`);
console.log(`    (seed carried to ${SEED.length} terms by a packed engine)`);
let fails = 0, tests = 0, tight = 0;
for (const key of Object.keys(F)) {
  const [p, a] = key.split(",").map(Number);
  const r = F[key];
  if (r.status !== "exact") continue;
  tests++;
  const sb = seedBlock(a, p);
  if (sb > r.best) { fails++; console.log(`    VIOLATION p=${p} a=${a}: seed ${sb} > f ${r.best}`); }
  if (sb === r.best) tight++;
}
console.log(`    ${tests} exhaustive cells, ${fails} violations, ${tight} of them tight`);

// ---- the fitted shape 2p + 2a + 2, tested rather than cited ----------------
console.log(`\n[B] the fitted shape f(p,a) <= 2p + 2a + 2, over the whole exhaustive range`);
let bad = 0, cells = 0, worst = -1e9, worstAt = "";
for (const key of Object.keys(F)) {
  const [p, a] = key.split(",").map(Number);
  const r = F[key];
  if (r.status !== "exact") continue;
  cells++;
  const excess = r.best - (2 * p + 2 * a + 2);
  if (excess > 0) { bad++; if (bad <= 20) console.log(`    BREAKS p=${p} a=${a}: f = ${r.best} > ${2 * p + 2 * a + 2}`); }
  if (excess > worst) { worst = excess; worstAt = `p=${p} a=${a}`; }
}
console.log(`    ${cells} exhaustive cells tested, ${bad} violations; worst f-(2p+2a+2) = ${worst} at ${worstAt}`);

// ---- excess f(p,a) - p ----------------------------------------------------
console.log(`\n[E] the excess f(p,a) - p  (f >= p is trivial, so this is the content)`);
console.log(head);
for (let p = 1; p <= PMAX; p++) {
  let line = `    ${String(p).padStart(3)} |`;
  for (let a = 1; a <= AMAX; a++) {
    const r = F[`${p},${a}`];
    line += ` ${(r ? ((r.best - p) + (r.status === "exact" ? "" : "*")) : "-").padStart(5)}`;
  }
  console.log(line);
}

console.log(`\n[W] the extremal column word, p = 3`);
for (let a = 1; a <= AMAX; a++) {
  const r = F[`3,${a}`];
  if (r && r.bestCol) console.log(`    a=${String(a).padStart(2)}  ${show(r.bestCol)}  (${r.best} cells, ${r.status})`);
}
