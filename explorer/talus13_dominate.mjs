// Talus, 2026-09-12.  The domination control for the left-only reduction.
//
// f_w(a) is the longest block, from time 0, over which the centre column of a
// configuration white at x < -a and black at -a agrees with the periodic word w.
// D(a) is the deepest column the LEFT-ONLY system reaches.  Because the cone
// cell at column k reads only c(0..k), a block of length L forces the cone
// constraints at columns 1..L-1, so  f_w(a) <= D(a) + 1.  A violation means the
// left-only solver over-prunes and every number in the document is worthless.
//
// The exhaustive f is computed by a SECOND engine -- the outward DFS over
// configurations by radius, which shares no code with the leftward solve.

const W = [0, 1, 1];

function coneDepth(word, a, JMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : k === a ? v === 1 : true);
  function rec(j) {
    if (j > best) best = j;
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const branch = word[j % p] === 0 ? [0, 1] : [0];
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ (C[0][j % p] | b);
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status };
}

function dfsF(a, word, cap, budget) {
  const p = word.length;
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  function fillRD(k, rc) {
    const rdk = RD[k], rd1 = RD[k - 1], rd2 = RD[k - 2];
    rdk[0] = rc;
    for (let t = 1; t <= k - 1; t++) rdk[t] = rd2[t - 1] ^ (rd1[t - 1] | rdk[t - 1]);
    return rdk[k - 1];
  }
  function rec(k) {
    if (k > cap) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const ldk = LD[k], ld1 = LD[k - 1], ld2 = LD[k - 2];
    ldk[0] = 0;
    for (let t = 1; t <= k - 1; t++) ldk[t] = ldk[t - 1] ^ (ld1[t - 1] | ld2[t - 1]);
    const base = ldk[k - 1];
    for (const rc of [0, 1]) {
      const centre0 = base ^ (col[k - 1] | fillRD(k, rc));
      const rdk = RD[k];
      const cv = word[k % p];
      const lc = centre0 ^ cv;
      if (req[k] >= 0 && lc !== req[k]) continue;
      col[k] = cv;
      const flip = (lc === 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
      ldk[k] = cv; rdk[k] = cv;
      if (k + 1 > best) best = k + 1;
      rec(k + 1);
      if (flip) for (let t = 0; t <= k - 1; t++) ldk[t] ^= 1;
    }
  }
  try { col[0] = word[0]; LD[0][0] = word[0]; RD[0][0] = word[0]; best = 1; rec(1); }
  catch (e) { if (e !== AB) throw e; }
  return { best, status };
}

console.log(`[C] f_011(a) against D(a) + 1, both exhaustive.`);
console.log(`     a    f   D+1   slack`);
let tot = 0, viol = 0, tight = 0, worst = -1, worstAt = 0;
for (let a = 1; a <= 24; a++) {
  const d = coneDepth(W, a, 400, 1.2e9);
  const f = dfsF(a, W, 95, 6e8);
  if (d.status !== "exact" || f.status !== "exact") { console.log(`    ${String(a).padStart(2)}   not exhaustive (${d.status}/${f.status})`); continue; }
  tot++;
  const s = d.best + 1 - f.best;
  if (s < 0) { viol++; console.log(`    ${String(a).padStart(2)}   VIOLATION f=${f.best} > D+1=${d.best + 1}`); }
  else { if (s === 0) tight++; if (s > worst) { worst = s; worstAt = a; } }
  console.log(`    ${String(a).padStart(2)}  ${String(f.best).padStart(3)}  ${String(d.best + 1).padStart(4)}  ${String(s).padStart(5)}`);
}
console.log(`    ${tot} cells exhaustive, ${viol} violations, tight at ${tight}, worst slack ${worst} at a=${worstAt}`);

console.log(`\n[M] the same against a MUTANT left-only solver that forgets the`);
console.log(`    black cell at -a.  It must OVER-count (report a larger D), so`);
console.log(`    domination against it is no evidence at all -- this shows the`);
console.log(`    tightness above is doing work.`);
function coneDepthNoBlack(word, a, JMAX, budget) {
  const p = word.length;
  const C = [];
  for (let k = 0; k <= JMAX + 3; k++) C.push(new Uint8Array(JMAX + 3));
  for (let t = 0; t <= JMAX + 2; t++) C[0][t] = word[t % p];
  let best = 0, nodes = 0, status = "exact";
  const AB = "ab";
  const ok0 = (k, v) => (k > a ? v === 0 : true);
  function rec(j) {
    if (j > best) best = j;
    if (j > JMAX) { status = "cap"; throw AB; }
    if (++nodes > budget) { status = "budget"; throw AB; }
    const branch = word[j % p] === 0 ? [0, 1] : [0];
    for (const b of branch) {
      let good = true;
      C[1][j] = C[0][(j + 1) % p] ^ (C[0][j % p] | b);
      if (j === 0 && !ok0(1, C[1][0])) good = false;
      for (let k = 2; good && k <= j + 1; k++) {
        const t = j - k + 1;
        C[k][t] = C[k - 1][t + 1] ^ (C[k - 1][t] | C[k - 2][t]);
        if (t === 0 && !ok0(k, C[k][0])) good = false;
      }
      if (good) rec(j + 1);
    }
  }
  try { rec(0); } catch (e) { if (e !== AB) throw e; }
  return { best, status };
}
for (const a of [3, 6, 9, 12, 16, 20]) {
  const d = coneDepth(W, a, 400, 1.2e9), dm = coneDepthNoBlack(W, a, 400, 1.2e9);
  console.log(`    a=${String(a).padStart(2)}  D=${String(d.best).padStart(3)}   D(no black cell)=${dm.status === "exact" ? dm.best : dm.status}`);
}
