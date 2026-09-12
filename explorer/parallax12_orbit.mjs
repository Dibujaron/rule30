// Parallax 12 / A. The literal transport of cycle exclusion.
//
// Cycle exclusion in arithmetic dynamics proves "this orbit of this map is not
// periodic". Transport that literally to rule 30's row map and ask what it says.
//
// Two objects:
//   (i) the orbit of 1 under rowStep on all of N (untruncated);
//  (ii) the orbit of 1 under stepMod n = rowStep mod 2^n.
//
// Measured here: the height law for (i), hence that (i) has no cycle at all and
// the transported conclusion is free; and the tail/period structure of (ii),
// against obstruction 17's warning that every T-map regularity has turned out to
// be the doubling staircase.

const step = (r) => (4n * r) ^ ((2n * r) | r);

function report(name, rows) {
  console.log(`\n== ${name} ==`);
  for (const r of rows) console.log(r);
}

// ---------------------------------------------------------------- A1. height law
{
  let r = 1n;
  let bad = 0, badMono = 0, n = 0;
  const samples = [];
  for (let t = 0; t < 3000; t++) {
    const L = r.toString(2).length;
    if (L !== 2 * t + 1) bad++;
    const nx = step(r);
    if (!(nx > r)) badMono++;
    if (t < 6 || t === 100 || t === 2999) samples.push(`t=${t} bitlen=${L} (2t+1=${2 * t + 1})`);
    r = nx; n++;
  }
  report("A1  bit-length of rowNat t, orbit of 1 under rowStep on N", [
    ...samples,
    `rows tested: ${n}`,
    `bitlen(rowNat t) != 2t+1 : ${bad} failures`,
    `rowNat (t+1) > rowNat t  : ${badMono} failures`,
    `=> the orbit is strictly increasing, hence injective, hence NOT periodic.`,
    `   "the orbit does not return" is a two-line theorem, not the prize.`,
  ]);
}

// ---------------------------------------------------------------- A2. the truncated orbit
// tail (preperiod) and cycle length of the orbit of 1 under stepMod n, by
// Brent-style detection on exact BigInt values.
function tailAndPeriod(n, start = 1n) {
  const M = 1n << BigInt(n);
  const seen = new Map();
  let r = start % M, t = 0;
  while (!seen.has(r)) { seen.set(r, t); r = step(r) % M; t++; }
  const N = seen.get(r);
  return { tail: N, period: t - N };
}

{
  const rows = [];
  for (const n of [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64]) {
    const { tail, period } = tailAndPeriod(n);
    rows.push(`n=${String(n).padStart(3)} tail=${String(tail).padStart(4)} period=${String(period).padStart(4)}  tail/n=${(tail / n).toFixed(3)}`);
  }
  report("A2  orbit of 1 under stepMod n: EVERY orbit returns (finite set)", [
    ...rows,
    `=> in the truncated map the return is automatic. There is nothing to exclude.`,
    `   The wall is a bound on the TAIL, not the existence of a cycle.`,
  ]);
}

// ---------------------------------------------------------------- A3. obstruction 17's check
// Is the period the doubling staircase? The board's left-diagonal period
// doublings are at k = 3, 8, 29, 400, 87867 (NKS p.871). If period(n) = 2^(number
// of doublings <= n-1) then the T-map period carries no information the diagonal
// picture did not already have.
{
  const doublings = [3, 8, 29, 400];
  const predict = (n) => 2 ** doublings.filter((d) => d <= n - 1).length;
  const rows = [];
  let bad = 0;
  for (let n = 1; n <= 64; n++) {
    const { period } = tailAndPeriod(n);
    const p = predict(n);
    if (period !== p) { bad++; if (rows.length < 12) rows.push(`MISMATCH n=${n} period=${period} predicted=${p}`); }
  }
  report("A3  is the truncated period the doubling staircase? (obstruction 17)", [
    ...rows,
    `mismatches over n=1..64: ${bad}`,
    bad === 0
      ? `=> yes. The period of the truncated orbit is 2^(doublings below n), so it`
      : `=> no, and that would be news.`,
    `   is the diagonal picture in another vocabulary. Measure before arguing.`,
  ]);
}

// ---------------------------------------------------------------- A4. the reading
// The centre column is NOT the return of the truncated orbit. It is bit t of
// rowNat t: a diagonal read, one bit per step, of an orbit that provably never
// returns. Print the two objects side by side to make the seam concrete.
{
  let r = 1n;
  const col = [];
  for (let t = 0; t < 24; t++) { col.push(Number((r >> BigInt(t)) & 1n)); r = step(r); }
  report("A4  the centre column as a diagonal read of the non-returning orbit", [
    `centerColumn(0..23) = ${col.join("")}`,
    `c(t) = bit_t(rowNat t), and bitlen(rowNat t) = 2t+1, so the read sits at the`,
    `midpoint of a word whose length grows by two per step: it never enters a`,
    `region the orbit has visited before, because the orbit visits nothing twice.`,
  ]);
}
