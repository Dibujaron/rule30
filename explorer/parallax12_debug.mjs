// Diagnostic for parallax12_recur.mjs's leastRecurrence: the coin null returned
// L = 33 at every width, which is impossible for a random vector sequence, so
// the solver is suspect. Referee: recover the coefficients explicitly and CHECK
// the recurrence, rather than trusting "the system was consistent".

function xs32(seed) { let s = seed | 0; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }

// Slow, obviously-correct referee: full augmented matrix, RREF, then solve and
// VERIFY by substitution.
function recurrenceHolds(rows, n, L) {
  const m = rows.length;
  const eqs = [];
  for (let t = 0; t + L < m; t++)
    for (let j = 0; j < n; j++) {
      const coef = new Uint8Array(L + 1);
      for (let i = 0; i < L; i++) coef[i] = rows[t + i][j];
      coef[L] = rows[t + L][j];
      eqs.push(coef);
    }
  let r = 0;
  for (let c = 0; c < L && r < eqs.length; c++) {
    let piv = -1;
    for (let i = r; i < eqs.length; i++) if (eqs[i][c]) { piv = i; break; }
    if (piv < 0) continue;
    [eqs[r], eqs[piv]] = [eqs[piv], eqs[r]];
    for (let i = 0; i < eqs.length; i++)
      if (i !== r && eqs[i][c]) for (let k = c; k <= L; k++) eqs[i][k] ^= eqs[r][k];
    r++;
  }
  for (const e of eqs) {
    let allz = true;
    for (let k = 0; k < L; k++) if (e[k]) { allz = false; break; }
    if (allz && e[L]) return { ok: false };
  }
  const c = new Uint8Array(L);
  for (let i = eqs.length - 1; i >= 0; i--) {
    let lead = -1;
    for (let k = 0; k < L; k++) if (eqs[i][k]) { lead = k; break; }
    if (lead < 0) continue;
    let v = eqs[i][L];
    for (let k = lead + 1; k < L; k++) if (eqs[i][k]) v ^= c[k];
    c[lead] = v;
  }
  let bad = 0, checked = 0;
  for (let t = 0; t + L < m; t++)
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let i = 0; i < L; i++) if (c[i]) s ^= rows[t + i][j];
      checked++;
      if (s !== rows[t + L][j]) bad++;
    }
  return { ok: bad === 0, bad, checked, c };
}

const n = 16, m = 260;
const rnd = xs32(7717 + n);
const rows = [];
for (let t = 0; t < m; t++) { const x = new Uint8Array(n); for (let i = 0; i < n; i++) x[i] = rnd() < 0.5 ? 1 : 0; rows.push(x); }

console.log("== referee on the coin rows the fast solver called L = 33 ==");
for (const L of [30, 32, 33, 34, 40]) {
  const res = recurrenceHolds(rows, n, L);
  console.log(`  L=${L}  consistent=${res.ok}${res.bad !== undefined ? `  failures=${res.bad}/${res.checked}` : ""}`);
}

console.log("\n== sanity: the coin rows' own bit density and a repeat check ==");
{
  let ones = 0;
  for (const x of rows) for (const v of x) ones += v;
  console.log(`  density = ${(ones / (m * n)).toFixed(4)} (want 0.5)`);
  const seen = new Map(); let dup = 0;
  rows.forEach((x, i) => { const k = x.join(""); if (seen.has(k)) dup++; else seen.set(k, i); });
  console.log(`  duplicate rows among ${m}: ${dup}`);
  console.log(`  rows 0..3: ${rows.slice(0, 4).map((x) => x.join("")).join(" ")}`);
}

console.log("\n== referee on the planted order-5 recurrence (positive control) ==");
{
  const rnd2 = xs32(4242);
  const rr = [];
  for (let t = 0; t < 5; t++) { const x = new Uint8Array(32); for (let i = 0; i < 32; i++) x[i] = rnd2() < 0.5 ? 1 : 0; rr.push(x); }
  for (let t = 5; t < 260; t++) { const x = new Uint8Array(32); for (let i = 0; i < 32; i++) x[i] = rr[t - 3][i] ^ rr[t - 5][i]; rr.push(x); }
  for (const L of [4, 5, 6]) {
    const res = recurrenceHolds(rr, 32, L);
    console.log(`  L=${L}  consistent=${res.ok}${res.bad !== undefined ? `  failures=${res.bad}/${res.checked}` : ""}`);
  }
}
