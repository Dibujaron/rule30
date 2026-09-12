// Sextant, 2026-09-12.  Is the sharp cone condition TIGHT?
//
// sextant10_scratch_cone.lean proves: if every right diagonal d <= D has a
// period 2^e with e <= n, then row 2^n is white at 2^n - d for all such d.
// Since the minimal period P_d divides 2^d and is a power of two, "P_d <= 2^n"
// is exactly "P_d divides 2^n", so the theorem gives
//
//     m(2^n)  >=  1 + max { d : P_d <= 2^n }
//
// where m(2^n) = Rowland's a(n) is the distance from row 2^n's right edge to
// the next black cell.  Measured here: the two sides are EQUAL at every n
// computed, so the periodicity argument is not merely a bound, it is the
// whole truth about a(n) given the minimal-period spectrum.
//
// Weaker instance for comparison: P_d <= 2^d always, giving only a(n) >= n+1.

// P_d is computed TWO ways: (i) directly, by testing each candidate 2^e over a
// window that covers a full true period 2^d, which is exact only for small d;
// (ii) by the doubling criterion -- P_d = 2*L or L according to the parity of
// the driver's weight over one period L = max(P_{d-1}, P_{d-2}) -- which is
// exact at every d and needs only L indices.
//
// My first version had only (i), with a guard that ACCEPTED 2^e without
// testing once 2^e outgrew the window.  That capped every large P_d at the
// window size, so at n = 22 it reported max{d : P_d <= 2^22} = 70 and a
// "sharp bound" of 71 against a true m(2^22) = 55 -- i.e. it contradicted a
// theorem the kernel had just accepted, which is how the bug was caught.
const NMAX = 20, KLEV = 55;
const L = (1 << 23) + (1 << 22) + 8 * KLEV + 64;

// centre column, to supply the free bits
const CC = [];
{
  let r = 1n;
  for (let t = 0; t <= KLEV + 4; t++) { CC.push(Number((r >> BigInt(t)) & 1n)); r = (r << 2n) ^ ((r << 1n) | r); }
}
// engine self-check: centre column starts 1101110011 (A051023), asymmetric
if (CC.slice(0, 10).join('') !== '1101110011') { console.log('ENGINE FAIL', CC.slice(0, 10).join('')); process.exit(1); }
console.log('engine self-check: centre column 0..9 = 1101110011  OK');

const anti = new Array(KLEV + 1).fill(null);  // anti[d] = [least q with R_d(j+q) = !R_d(j), verified over]
const P = new Array(KLEV + 1).fill(0);        // by the doubling criterion
const Pdirect = new Array(KLEV + 1).fill(-1); // by exhaustive verification
const hits = [];                              // hits[d][n] = R_d(2^n - d)
{
  let prev2 = new Uint8Array(L), prev1 = new Uint8Array(L), spare = new Uint8Array(L);
  for (let k = 0; k <= KLEV; k++) {
    let cur = spare;
    if (k === 0) cur.fill(1);
    else if (k === 1) { for (let j = 0; j < L; j++) cur[j] = (j % 2 === 0) ? 1 : 0; }
    else {
      cur[0] = CC[k];
      for (let i = 0; i + 2 < L; i++) cur[i + 1] = cur[i] ^ (prev1[i + 1] | prev2[i + 2]);
      cur[L - 1] = 0;
    }
    // (ii) the doubling criterion
    if (k <= 1) P[k] = k === 0 ? 1 : 2;
    else {
      const Lk = Math.max(P[k - 1], P[k - 2]);
      let w = 0;
      for (let j = 0; j < Lk; j++) w ^= (prev1[j + 1] | prev2[j + 2]);
      P[k] = w ? 2 * Lk : Lk;
    }
    // (i) exhaustive: a candidate 2^e is the period only if verified over a
    // window containing a full true period 2^k, so this is exact only while
    // 2^k + 2^e fits.  Otherwise leave -1 = "not decided here".
    if ((1 << Math.min(k, 30)) + (1 << Math.min(k, 30)) < L && k <= 23) {
      for (let e = 0; e <= k; e++) {
        const q = 1 << e;
        let ok = true;
        for (let j = 0; j + q < (1 << k) + q; j++) if (cur[j] !== cur[j + q]) { ok = false; break; }
        if (ok) { Pdirect[k] = q; break; }
      }
    }
    // is R_k antiperiodic at q = P_k / 2 ?  (that is what a doubling gives)
    if (k >= 1 && P[k] >= 2) {
      const q = P[k] / 2;
      const top = Math.min(L - q, 8 * q);
      let ok = true;
      for (let j = 0; j < top; j++) if (cur[j + q] === cur[j]) { ok = false; break; }
      anti[k] = ok ? q : 0;
    }
    const row = [];
    for (let n = 0; n <= NMAX; n++) { const idx = (1 << n) - k; row.push(idx >= 0 ? cur[idx] : -1); }
    hits.push(row);
    spare = prev2; prev2 = prev1; prev1 = cur;
  }
}
console.log(`\nminimal periods P_d by the doubling criterion, d = 0..24: ${P.slice(0, 25).join(' ')}`);
console.log(`  (obstruction 20 publishes 1 2 2 4 8 8 16 32 32 64 64 64 64 64 64 128 256 -- compare the first 17)`);
{
  let dis = 0, checked = 0;
  for (let k = 0; k <= 23; k++) if (Pdirect[k] > 0) { checked++; if (Pdirect[k] !== P[k]) dis++; }
  console.log(`  cross-check against exhaustive verification over a full period: ${checked} depths, ${dis} disagreements`);
}
console.log(`  P_d for d = 25..${KLEV}: ${P.slice(25).join(' ')}`);

// m(2^n): least d >= 1 with R_d(2^n - d) = 1.  Indices below 0 only occur for
// d > 2^n, i.e. n <= 4, and those cells are read from the picture instead.
const rowsPic = [];
{
  let cur = new Uint8Array(1); cur[0] = 1; rowsPic.push(cur);
  for (let t = 1; t <= 600; t++) {
    const p = rowsPic[t - 1], n = new Uint8Array(p.length + 2);
    const g = (i) => (i < 0 || i >= p.length) ? 0 : p[i];
    for (let j = 0; j < n.length; j++) n[j] = g(j - 2) ^ (g(j - 1) | g(j));
    rowsPic.push(n);
  }
}
const pic = (t, x) => { const a = rowsPic[t], i = x + t; return (i < 0 || i >= a.length) ? 0 : a[i]; };

const aRow = [1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36, 37, 39, 41, 43, 48, 49, 51,
  54, 55, 58, 60, 63, 64, 66, 69, 70, 72, 74, 77, 79, 80, 82, 84, 86, 90, 91, 93];

console.log(`\n  n   m(2^n)  Rowland a(n)   sharp bound 1+max{d:P_d<=2^n}   weak bound n+1`);
let tight = 0, agree = 0;
for (let n = 0; n <= NMAX; n++) {
  let m = -1;
  for (let d = 1; d <= KLEV; d++) {
    const v = hits[d][n] >= 0 ? hits[d][n] : pic(1 << n, (1 << n) - d);
    if (v === 1) { m = d; break; }
  }
  let best = 0;
  for (let d = 0; d <= KLEV; d++) if (P[d] > 0 && P[d] <= (1 << n)) best = d;
  const sharp = best + 1;
  if (sharp === m) tight++;
  if (m === aRow[n]) agree++;
  console.log(`  ${String(n).padStart(2)}   ${String(m).padStart(6)}  ${String(aRow[n]).padStart(12)}   ${String(sharp).padStart(28)}   ${String(n + 1).padStart(13)}`);
}
console.log(`\n  sharp bound tight at ${tight} of ${NMAX + 1} values of n; m(2^n) = Rowland's a(n) at ${agree} of ${NMAX + 1}`);

// the hypothesis `edge_gap` needs: at D = min{d : P_d > 2^n}, is P_D = 2^(n+1)
// and is R_D antiperiodic at exactly 2^n?
console.log(`\nthe antiperiodicity hypothesis of edge_gap, at D = min{d : P_d > 2^n}:`);
console.log(`   n    D   P_D    2^(n+1)   antiperiodic at   2^n`);
let hyp = 0;
for (let n = 0; n <= NMAX; n++) {
  let D = -1;
  for (let d = 0; d <= KLEV; d++) if (P[d] > (1 << n)) { D = d; break; }
  if (D < 0) continue;
  const good = P[D] === (1 << (n + 1)) && anti[D] === (1 << n);
  if (good) hyp++;
  console.log(`  ${String(n).padStart(2)}  ${String(D).padStart(3)}  ${String(P[D]).padStart(7)}  ${String(1 << (n + 1)).padStart(8)}  ${String(anti[D]).padStart(14)}  ${String(1 << n).padStart(8)}  ${good ? '' : '  <-- FAILS'}`);
}
console.log(`  hypothesis holds at ${hyp} of ${NMAX + 1} values of n`);

// Since every P_d is a power of two, "P_d divides p" depends only on ord_2(p),
// so edge_gap_eq says the gap at row p depends only on ord_2(p).  Check it.
{
  const PMAX = 6000;
  const ord2 = (p) => { let e = 0; while (p % 2 === 0) { p /= 2; e++; } return e; };
  const gap = (p) => {
    for (let d = 1; d <= KLEV; d++) {
      const idx = p - d;
      // read from the tower when the index is non-negative, else the picture
      const val = idx >= 0 ? towerAt(d, idx) : pic(p, p - d);
      if (val === 1) return d;
    }
    return -1;
  };
  // the tower again, this time keeping the levels we need over [0, PMAX)
  const keep = [];
  {
    const L2 = PMAX + 8 * KLEV + 32;
    let prev2 = new Uint8Array(L2), prev1 = new Uint8Array(L2), spare = new Uint8Array(L2);
    for (let k = 0; k <= KLEV; k++) {
      let cur = spare;
      if (k === 0) cur.fill(1);
      else if (k === 1) { for (let j = 0; j < L2; j++) cur[j] = (j % 2 === 0) ? 1 : 0; }
      else {
        cur[0] = CC[k];
        for (let i = 0; i + 2 < L2; i++) cur[i + 1] = cur[i] ^ (prev1[i + 1] | prev2[i + 2]);
        cur[L2 - 1] = 0;
      }
      keep.push(Uint8Array.from(cur.subarray(0, PMAX + 1)));
      spare = prev2; prev2 = prev1; prev1 = cur;
    }
  }
  function towerAt(d, idx) { return keep[d][idx]; }
  // validate the kept tower against the picture
  let vbad = 0;
  for (let d = 0; d <= 40; d++) for (let j = 0; j <= 300; j++) { const v = pic(j + d, j); if (v !== keep[d][j]) vbad++; }
  const byOrd = new Map();
  let bad = 0, tested = 0;
  for (let p = 1; p <= PMAX; p++) {
    const g = gap(p);
    const e = ord2(p);
    tested++;
    if (!byOrd.has(e)) byOrd.set(e, g);
    else if (byOrd.get(e) !== g) bad++;
  }
  console.log(`\nthe gap at row p depends only on ord_2(p)?  p = 1..${PMAX}: ${tested} rows, ${bad} deviations`);
  console.log(`  (kept tower validated against the picture: ${vbad} mismatches on 12,341 cells)`);
  const es = Array.from(byOrd.keys()).sort((a, b) => a - b);
  console.log(`  gap by ord_2:  ${es.map((e) => `${e}:${byOrd.get(e)}`).join('  ')}`);
  console.log(`  Rowland a(n):  ${es.map((e) => `${e}:${aRow[e]}`).join('  ')}`);
  console.log(`  the white VOID at the right edge is gap - 1: ${es.map((e) => byOrd.get(e) - 1).join(' ')}`);
  console.log(`  crystal 12's mirror measurement (Cairn, computed):  0 2 3 5 6 8 14 15 23 24 26`);
}
console.log(`  the weak bound n+1 is below the truth by a factor tending to about ${(aRow[22] / 23).toFixed(2)}`);
