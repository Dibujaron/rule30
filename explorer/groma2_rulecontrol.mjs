// Groma, 2026-09-13. How much rule 30 is in the structure this vantage offers.
//
// The brief offers two proved facts as feed for a complexity lower bound on the
// centre column: left-permutivity, and that the left diagonals are eventually
// periodic with unbounded period. Run Rowan's instrument on them: which of the
// 256 elementary rules, grown from one black cell, share each property, and how
// many of those have a centre column that is eventually constant anyway.

const T = 1200;
const KMAX = 24;
const PMAX = 256;

function run(rule) {
  const W = 2 * T + 3, off = T + 1;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[off] = 1;
  const tab = [];
  for (let i = 0; i < 8; i++) tab.push((rule >> i) & 1);
  const diag = [];
  for (let k = 0; k <= KMAX; k++) diag.push(new Uint8Array(T + 1));
  const centre = new Uint8Array(T + 1);
  for (let t = 0; t <= T; t++) {
    centre[t] = cur[off];
    for (let k = 0; k <= KMAX; k++) if (t >= k) diag[k][t - k] = cur[off + k - t];
    if (t === T) break;
    for (let i = off - t - 1; i <= off + t + 1; i++) nxt[i] = tab[4 * (cur[i - 1] | 0) + 2 * (cur[i] | 0) + (cur[i + 1] | 0)];
    const tmp = cur; cur = nxt; nxt = tmp;
  }
  const a0 = Math.floor((T - KMAX) * 0.7), a1 = T - KMAX - 1;
  const periods = [];
  for (let k = 0; k <= KMAX; k++) {
    const d = diag[k];
    let per = -1;
    for (let p = 1; p <= PMAX; p++) {
      let ok = true;
      for (let j = a0; j + p <= a1; j++) if (d[j] !== d[j + p]) { ok = false; break; }
      if (ok) { per = p; break; }
    }
    periods.push(per);
  }
  // centre column eventually constant on the tail?
  const b0 = Math.floor(T * 0.7);
  let constant = true;
  for (let t = b0; t <= T; t++) if (centre[t] !== centre[b0]) { constant = false; break; }
  return { periods, constant };
}

const isPow2 = (x) => x > 0 && (x & (x - 1)) === 0;

let allEP = [], allPow2 = [], grows = [], growsAndConstant = [], notConstant = [];
const detail = {};
for (let rule = 0; rule < 256; rule++) {
  const { periods, constant } = run(rule);
  const ep = periods.every((p) => p > 0);
  const pw = ep && periods.every(isPow2);
  const mx = ep ? Math.max(...periods) : -1;
  const g = ep && mx >= 8; // the period has at least trebled from 1 within k <= 24
  if (ep) allEP.push(rule);
  if (pw) allPow2.push(rule);
  if (g) grows.push(rule);
  if (g && constant) growsAndConstant.push(rule);
  if (!constant) notConstant.push(rule);
  detail[rule] = { mx, constant, pw };
}

console.log(`rows ${T}, diagonals k <= ${KMAX}, periods tested to ${PMAX}\n`);
console.log(`every left diagonal k <= ${KMAX} eventually periodic : ${allEP.length}/256`);
console.log(`  ... and every period a power of two                : ${allPow2.length}/256`);
console.log(`  ... and the largest of them at least 8 ("periods grow"): ${grows.length}/256`);
console.log(`centre column NOT eventually constant on the tail     : ${notConstant.length}/256`);
console.log(`\nrules whose left-diagonal periods grow AND whose centre column is eventually CONSTANT:`);
console.log(`  ${growsAndConstant.length}/256 -> ${growsAndConstant.join(', ')}`);
console.log(`\nrules whose periods grow and whose centre column is not constant:`);
const gnc = grows.filter((r) => !detail[r].constant);
console.log(`  ${gnc.length}/256 -> ${gnc.join(', ')}`);
for (const r of [30, 86, 90, 150, 45, 110]) {
  console.log(`  rule ${String(r).padStart(3)}: max diagonal period k<=${KMAX} = ${String(detail[r].mx).padStart(4)}, all powers of two = ${detail[r].pw}, centre column eventually constant = ${detail[r].constant}`);
}
