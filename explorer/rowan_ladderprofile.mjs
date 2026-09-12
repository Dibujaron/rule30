// Rowan, 2026-09-12. The occurrence ladder as a PROFILE per rule, not a yes/no.
//
// rowan_rulecontrol.mjs found that rung 2 in window [a,4a] is satisfied by exactly
// three equivalence classes of 88 -- rule 30's, rule 45's and {54,147} -- and rung 3
// in [a,16a] by two, rule 30's and rule 45's. So rule 45 is the only other class
// that tracks rule 30 up the ladder, and at rung 4 in [a,16a] rule 45 passes where
// rule 30 FAILS. That asymmetry is the thing to measure rather than to admire.
//
// For each rule and each word length L, this reports the least power-of-two window
// multiplier m with: every word of length L occurs in [a, m*a] for every a >= 2 in
// range. A smaller m means a RICHER centre column -- every word turns up sooner.

const T = 200000;
function centreColumn(rule, T) {
  const W = 2 * T + 5, mid = T + 2;
  let cur = new Uint8Array(W), nxt = new Uint8Array(W);
  cur[mid] = 1;
  const col = new Uint8Array(T + 1);
  col[0] = 1;
  for (let s = 1; s <= T; s++) {
    for (let i = 1; i < W - 1; i++) nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1;
    const tmp = cur; cur = nxt; nxt = tmp;
    col[s] = cur[mid];
  }
  return col;
}
function leastMultiplier(c, L, maxA) {
  const need = 1 << L;
  for (let k = 1; k <= 12; k++) {
    const m = 1 << k;
    let ok = true;
    for (let a = 2; a <= maxA && ok; a++) {
      // whole word inside [a, m*a]; a word starting at t occupies t..t+L-1
      const hi = Math.min(m * a - (L - 1), c.length - L);
      if (hi - a < need) { ok = false; break; }
      const seen = new Set();
      for (let t = a; t <= hi; t++) { let v = 0; for (let j = 0; j < L; j++) v = v * 2 + c[t + j]; seen.add(v); }
      if (seen.size < need) ok = false;
    }
    if (ok) return m;
  }
  return null;
}
const rules = [30, 45, 54, 86, 110, 90, 150, 105];
console.log(`least power-of-two window multiplier m such that every word of length L`);
console.log(`occurs in [a, m*a] for every a >= 2 (T = ${T}); null = none up to 4096\n`);
process.stdout.write('rule  ');
for (let L = 1; L <= 6; L++) process.stdout.write(`  L=${L}`.padStart(7));
console.log();
for (const r of rules) {
  const c = centreColumn(r, T);
  process.stdout.write(String(r).padStart(4) + '  ');
  for (let L = 1; L <= 6; L++) {
    const maxA = Math.floor((T - L) / (1 << 12));   // same a-range for every m, so columns compare
    const m = leastMultiplier(c, L, maxA);
    process.stdout.write(String(m === null ? '-' : m).padStart(7));
  }
  console.log();
}
