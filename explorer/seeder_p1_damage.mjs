/**
 * Seeder scratch, 2026-09-10. Checks four candidate P1 statements against a
 * naive array engine. Empirical only; see explorer/README.md.
 *
 *   A. the centre column takes both colours infinitely often (finite check)
 *   B. the mask law   : dX(-1) = (!c) && dX(1)      when column 0 agrees at t, t+1
 *   C. the derivative : dX(-2) = dX(-1) t XOR dX(-1) (t+1)   same hypothesis
 *   D. self-similarity: evolve (m*2^k + k) (m*2^k) = centerColumn k
 *
 * B and C are stated over ANY two configurations, so they are tested on random
 * pairs, not only on the seed.
 */

const R = 30;

/** One rule-30 step on a plain array of booleans, white outside. */
function step(row) {
  const n = row.length;
  const out = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    const l = i > 0 ? row[i - 1] : false;
    const c = row[i];
    const r = i < n - 1 ? row[i + 1] : false;
    out[i] = (l !== (c || r)); // left XOR (centre OR right)
  }
  return out;
}

/** Grow `steps` rows from `row0`. Index i of a row is cell (i - origin). */
function grow(row0, steps) {
  const rows = [row0];
  for (let t = 0; t < steps; t++) rows.push(step(rows[t]));
  return rows;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --------------------------------------------------------------------------
// A. both colours infinitely often (a finite prefix can only illustrate)
// --------------------------------------------------------------------------
{
  const W = 4001, ORIGIN = 2000, T = 1800;
  const seed = new Array(W).fill(false); seed[ORIGIN] = true;
  const rows = grow(seed, T);
  let black = 0, white = 0, lastWhite = -1, lastBlack = -1;
  for (let t = 0; t <= T; t++) {
    if (rows[t][ORIGIN]) { black++; lastBlack = t; } else { white++; lastWhite = t; }
  }
  console.log(`A  centre column to t=${T}: ${black} black, ${white} white;` +
    ` last white at ${lastWhite}, last black at ${lastBlack}`);
}

// --------------------------------------------------------------------------
// B and C, over random configuration pairs
// --------------------------------------------------------------------------
{
  const W = 601, ORIGIN = 300, T = 260;
  const rnd = mulberry(12345);
  let hyp = 0, failB = 0, failC = 0, nontrivB = 0, nontrivC = 0;
  for (let trial = 0; trial < 400; trial++) {
    // Two random configs, correlated so that column 0 agrees often.
    const base = Array.from({ length: W }, () => rnd() < 0.5);
    const X = base.slice();
    const Y = base.slice();
    // perturb Y in a few places (near the right, so the origin agrees a while)
    const flips = 1 + Math.floor(rnd() * 4);
    for (let f = 0; f < flips; f++) {
      const p = ORIGIN + 1 + Math.floor(rnd() * 200);
      Y[p] = !Y[p];
    }
    const rx = grow(X, T + 2), ry = grow(Y, T + 2);
    const cell = (rows, t, x) => rows[t][ORIGIN + x];
    for (let t = 0; t <= T; t++) {
      if (cell(rx, t, 0) !== cell(ry, t, 0)) continue;
      if (cell(rx, t + 1, 0) !== cell(ry, t + 1, 0)) continue;
      hyp++;
      const d = (x, s) => cell(rx, s, x) !== cell(ry, s, x);
      // B
      const lhsB = d(-1, t);
      const rhsB = (!cell(rx, t, 0)) && d(1, t);
      if (lhsB !== rhsB) failB++;
      if (lhsB) nontrivB++;
      // C
      const lhsC = d(-2, t);
      const rhsC = d(-1, t) !== d(-1, t + 1);
      if (lhsC !== rhsC) failC++;
      if (lhsC) nontrivC++;
    }
  }
  console.log(`B  mask law      : ${hyp} times satisfying the hypothesis, ` +
    `${failB} failures, ${nontrivB} with a nonzero left-hand side`);
  console.log(`C  derivative law: ${hyp} times satisfying the hypothesis, ` +
    `${failC} failures, ${nontrivC} with a nonzero left-hand side`);
}

// --------------------------------------------------------------------------
// C'. does the cascade continue? test dX(-3) = dX(-2) t XOR dX(-2) (t+1)
// --------------------------------------------------------------------------
{
  const W = 601, ORIGIN = 300, T = 200;
  const rnd = mulberry(999);
  let hyp = 0, fail = 0;
  for (let trial = 0; trial < 200; trial++) {
    const base = Array.from({ length: W }, () => rnd() < 0.5);
    const X = base.slice(), Y = base.slice();
    const p = ORIGIN + 1 + Math.floor(rnd() * 150); Y[p] = !Y[p];
    const rx = grow(X, T + 2), ry = grow(Y, T + 2);
    const cell = (rows, t, x) => rows[t][ORIGIN + x];
    for (let t = 0; t <= T; t++) {
      if (cell(rx, t, 0) !== cell(ry, t, 0)) continue;
      if (cell(rx, t + 1, 0) !== cell(ry, t + 1, 0)) continue;
      hyp++;
      const d = (x, s) => cell(rx, s, x) !== cell(ry, s, x);
      if (d(-3, t) !== (d(-2, t) !== d(-2, t + 1))) fail++;
    }
  }
  console.log(`C' third step    : ${hyp} hypothesis hits, ${fail} failures ` +
    `(expected to FAIL: the cascade should stop at two)`);
}

// --------------------------------------------------------------------------
// D. self-similarity on the right: evolve (m*2^k + k) (m*2^k) = centerColumn k
// --------------------------------------------------------------------------
{
  const KMAX = 6, MMAX = 4;
  const maxT = MMAX * 2 ** KMAX + KMAX + 2;
  const W = 2 * maxT + 3, ORIGIN = maxT + 1;
  const seed = new Array(W).fill(false); seed[ORIGIN] = true;
  const rows = grow(seed, maxT);
  const cc = (t) => rows[t][ORIGIN];
  let checked = 0, fail = 0;
  for (let k = 0; k <= KMAX; k++) {
    for (let m = 0; m <= MMAX; m++) {
      const pos = m * 2 ** k;
      const t = pos + k;
      checked++;
      if (rows[t][ORIGIN + pos] !== cc(k)) {
        fail++;
        console.log(`   D FAIL k=${k} m=${m}`);
      }
    }
  }
  console.log(`D  self-similarity: ${checked} checked, ${fail} failures`);
}
