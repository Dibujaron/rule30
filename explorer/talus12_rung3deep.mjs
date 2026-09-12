// Talus, 2026-09-12.  The p = 3 row of the ladder, pushed past a = 18, to test
// the fitted shape 2a + 6 over a wider range than it was fitted on.
const AB = "ab";
function dfsF(a, p, cap, budget) {
  const col = new Uint8Array(cap + 6);
  const req = new Int8Array(cap + 4).fill(-1);
  for (let k = a + 1; k <= cap + 3; k++) req[k] = 0;
  if (a <= cap + 3) req[a] = 1;
  const LD = [], RD = [];
  for (let k = 0; k <= cap + 3; k++) { LD.push(new Uint8Array(cap + 4)); RD.push(new Uint8Array(cap + 4)); }
  let best = 0, nodes = 0, status = "exact", bestCol = null;
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
    for (const s of [0, 1]) { col[0] = s; LD[0][0] = s; RD[0][0] = s; if (1 > best) best = 1; rec(1); }
  } catch (e) { if (e !== AB) throw e; }
  return { best, status, nodes, bestCol };
}
const show = (w) => Array.from(w).map((b) => (b ? "1" : "0")).join("");
console.log(`[R3] the p = 3 row, exhaustive, a = 1..26.  Testing f(3,a) <= 2a + 6.`);
let bad = 0, cells = 0, tight = 0;
for (let a = 1; a <= 26; a++) {
  const r = dfsF(a, 3, 120, 1.2e9);
  if (r.status !== "exact") { console.log(`     a=${a}: ${r.status} at ${r.best} after ${r.nodes} nodes`); continue; }
  cells++;
  const b = 2 * a + 6;
  if (r.best > b) bad++;
  if (r.best === b) tight++;
  console.log(`     a=${String(a).padStart(2)}  f = ${String(r.best).padStart(3)}   2a+6 = ${String(b).padStart(3)}   ${r.best > b ? "BREAKS" : r.best === b ? "tight" : ""}   ${show(r.bestCol)}`);
}
console.log(`     ${cells} exhaustive cells, ${bad} violations of 2a+6, tight at ${tight}`);
