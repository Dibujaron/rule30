// Talus, 2026-09-12.  The period ladder, which is the ladder P1 actually has.
//
// Sigma_p = { columns with x(n+p) = x(n) for every n } has exactly 2^p points, so
// its language has 2^p words of every length and lambda = 1: the criterion says
// the cone sees it, at every p.  And it matters, because
//
//    f(p,a) < infinity for every p and every a   <=>   PRIZE 1.
//
// (=>) If the seed's centre column were periodic with period p from time N, then
// row N of the seed -- white at every x < -N and black at -N, by
// evolve_eq_false_of_outside_cone and evolve_left_edge -- would be a member of
// C2(N) with a period-p column for ever, so f(p,N) = infinity.
// (<=) is immediate: the seed's own rows realise blocks.
//
// So this table is the finite part of P1, computed rather than assumed.  What is
// wanted from it is the SHAPE: f(p,a) >= p holds trivially (a word shorter than
// p is vacuously p-periodic), so the informative quantity is the excess
// f(p,a) - p.

const ABORT_CAP = "cap", ABORT_BUD = "budget";

function search(a, forbidden, cap, budget, kind) {
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (kind >= 2 && a <= cap + 3) req[a] = 1;
  if (kind >= 3 && a - 1 >= 0) req[a - 1] = 1;
  let best = 0, bestCol = null;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let nodes = 0, status = "exact";

  const ok = (k) => {
    for (const w of forbidden) {
      const m = w.length;
      if (k + 1 < m) continue;
      let hit = true;
      for (let i = 0; i < m; i++) if (col[k - m + 1 + i] !== w[i]) { hit = false; break; }
      if (hit) return false;
    }
    return true;
  };

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
        if (k + 1 > best) { best = k + 1; bestCol = col.slice(0, k + 1); }
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
      if (1 > best) { best = 1; bestCol = Uint8Array.from([s]); }
      rec(1);
    }
  } catch (e) { if (e !== ABORT_CAP && e !== ABORT_BUD) throw e; }
  return { best, status, nodes, bestCol };
}

const sigma = (p) => {
  const out = [];
  for (let v = 0; v < (1 << (p + 1)); v++) {
    const w = []; for (let i = p; i >= 0; i--) w.push((v >> i) & 1);
    if (w[0] !== w[p]) out.push(w);
  }
  return out;
};
const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");

// the seed's own centre column, as a lower-bound check: row a of the seed is in
// C2(a) and C3(a), so f(p,a) is at least the seed's own p-periodic block there
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
const SEED = packedCenter(60000);
const seedBlock = (a, p) => { let n = 0; while (a + n + p < SEED.length && SEED[a + n + p] === SEED[a + n]) n++; return n + p; };

const CAP = 64, BUD = 2.5e8;
console.log(`[L] f(p,a): the longest period-p block of a coned configuration's centre column`);
console.log(`    class C2 (white at x < -a, black at -a).  cap ${CAP}, budget ${BUD}.`);
console.log(`    n = exact maximum.  n+ = a configuration reached the cap.  n? = budget hit.`);
let head = "      p |";
for (let a = 1; a <= 12; a++) head += `   a=${String(a).padStart(2)}`;
console.log(head);
const F = {};
for (let p = 1; p <= 8; p++) {
  const S = sigma(p);
  let line = `    ${String(p).padStart(3)} |`;
  for (let a = 1; a <= 12; a++) {
    const r = search(a, S, CAP, BUD, 2);
    F[`${p},${a}`] = r;
    line += ` ${(r.best + (r.status === "exact" ? "" : r.status === "cap" ? "+" : "?")).padStart(6)}`;
  }
  console.log(line);
}

console.log(`\n[E] the excess f(p,a) - p, which is the informative part (f >= p is trivial)`);
console.log(head);
for (let p = 1; p <= 8; p++) {
  let line = `    ${String(p).padStart(3)} |`;
  for (let a = 1; a <= 12; a++) {
    const r = F[`${p},${a}`];
    line += ` ${((r.best - p) + (r.status === "exact" ? "" : "*")).padStart(6)}`;
  }
  console.log(line);
}

console.log(`\n[X] the seed's own p-periodic block starting at time a, which f(p,a) must exceed`);
let fails = 0, tests = 0;
for (let p = 1; p <= 8; p++) for (let a = 1; a <= 12; a++) {
  const r = F[`${p},${a}`];
  if (r.status !== "exact") continue;
  tests++;
  if (seedBlock(a, p) > r.best) { fails++; console.log(`    VIOLATION p=${p} a=${a}: seed ${seedBlock(a, p)} > f ${r.best}`); }
}
console.log(`    ${tests} exhaustive cells checked, ${fails} violations`);

console.log(`\n[W] the extremal column word at a = 10, for each p`);
for (let p = 1; p <= 8; p++) {
  const r = F[`${p},10`];
  if (r.bestCol) console.log(`    p=${p}  ${show(r.bestCol)}  (${r.best} cells, ${r.status})`);
}
