// The OR-to-XOR filter, run on the proposed hypothesis.
//
// Hypothesis H(rule): for every k and every N there is t >= N with
//   row_t(-j) = (j even) for every j < k.
// (the alternating fixed point reappears arbitrarily deep, arbitrarily late,
//  immediately left of the origin)
//
// Checked here for rules 30, 150, 90 from the single seed: the deepest
// alternating stretch seen at the origin, and how late it is still seen.

const RULES = [30, 150, 90, 86];
const STEPS = 4000;

function stepRow(row, rule) {
  const n = row.length;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const l = i - 1 >= 0 ? row[i - 1] : 0;
    const c = row[i];
    const r = i + 1 < n ? row[i + 1] : 0;
    out[i] = (rule >> (4 * l + 2 * c + r)) & 1;
  }
  return out;
}

function altDepth(row, off, maxJ) {
  let L = 0;
  while (L < maxJ && off - L >= 0) {
    if (row[off - L] !== (L % 2 === 0 ? 1 : 0)) break;
    L++;
  }
  return L;
}

for (const rule of RULES) {
  const W = 2 * STEPS + 200, OFF = STEPS + 100;
  let row = new Uint8Array(W);
  row[OFF] = 1;
  let best = 0, bestT = -1;
  // "still seen late": deepest stretch in the last quarter of the run
  let lateBest = 0, lateT = -1;
  let centreBlack = 0;
  for (let t = 0; t < STEPS; t++) {
    const d = altDepth(row, OFF, 60);
    if (d > best) { best = d; bestT = t; }
    if (t >= 3 * STEPS / 4 && d > lateBest) { lateBest = d; lateT = t; }
    if (row[OFF] === 1) centreBlack++;
    row = stepRow(row, rule);
  }
  console.log(
    `rule ${String(rule).padStart(3)}:  deepest alternating stretch ${best} (t=${bestT}); ` +
    `deepest in last quarter ${lateBest} (t=${lateT}); centre black ${centreBlack}/${STEPS}`);
}
