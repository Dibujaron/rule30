/**
 * Where the linearity is lost, measured four ways.
 *
 * Over F_2, rule 30 = rule 150 + the single quadratic monomial c*r:
 *
 *     l XOR (c OR r) = (l + c + r) + c*r.
 *
 * Rule 150 is the F_2-LINEAR rule, and every theorem in the analytic number
 * theory of digital sequences (Mauduit-Rivat and descendants) is built on an
 * exponential sum that factorises because the underlying digital function is
 * additive. So: how much of rule 150 survives inside rule 30?
 *
 * (1) The centre columns of the two linear elementary rules, 90 and 150, from
 *     the same single seed. If Prize 1 and Prize 2 are interesting for rule 30
 *     they should at least be non-trivial for its linearisation.
 *
 * (2) The linear approximation, quantitatively. Rule 30 agrees with rule 150
 *     on 6 of the 8 neighbourhoods (they differ exactly when c = r = 1), so
 *     one step is a linear function with bias 1/4. Linear cryptanalysis's
 *     piling-up lemma predicts the bias of the composed map decays
 *     geometrically in the number of active nonlinear gates. Measured here as
 *     Pr[rule30 centre cell at time t = rule150 centre cell at time t] over
 *     random windows.
 *
 * (3) The density of the monomial actually firing: the fraction of cells of
 *     the seed's own picture with a black cell immediately to the right of a
 *     black cell. That is how often the correction term is non-zero, and it is
 *     the rule-30 analogue of a carry.
 *
 * (4) The Fourier-Walsh spectrum of the map f_t : window -> centre cell at
 *     time t. Rule 30 is left permutive, so f_t(w) = w[-t] XOR g_t(rest),
 *     which forces EVERY non-zero Fourier coefficient of (-1)^{f_t} to be
 *     supported on a set containing the left-edge coordinate -- and in
 *     particular the empty coefficient to vanish, which is the board's
 *     `window_count_half`. Checked exhaustively.
 */

// --------------------------------------------------------------------------
// (1) the linear rules' centre columns
// --------------------------------------------------------------------------

function centreColumnOfRule(rule, gens) {
  // bit-parallel evolution of a single seed, cell x at bit x + gens + 2
  const centre = BigInt(gens + 2);
  let x = 1n << centre;
  const out = new Uint8Array(gens);
  for (let t = 0; t < gens; t++) {
    out[t] = Number((x >> centre) & 1n);
    const l = x << 1n;
    const r = x >> 1n;
    if (rule === 30) x = l ^ (x | r);
    else if (rule === 150) x = l ^ x ^ r;
    else if (rule === 90) x = l ^ r;
    else throw new Error('rule');
  }
  return out;
}

const GENS = 200_000;
console.log('(1) centre columns of the linear rules, from the same single seed\n');
for (const rule of [90, 150, 30]) {
  const col = centreColumnOfRule(rule, GENS);
  let ones = 0;
  let lastOne = -1;
  for (let t = 0; t < GENS; t++) {
    if (col[t]) {
      ones++;
      lastOne = t;
    }
  }
  console.log(
    `  rule ${String(rule).padStart(3)}:  density of 1s over ${GENS} terms = ${(ones / GENS).toFixed(6)}` +
      `   last 1 at t = ${lastOne}   first 20: ${Array.from(col.slice(0, 20)).join('')}`,
  );
}

// --------------------------------------------------------------------------
// (2) the linear approximation, over random windows
// --------------------------------------------------------------------------

console.log('\n(2) Pr[ rule 30 centre cell = rule 150 centre cell ] at time t,');
console.log('    over uniform random windows of width 2T+1 (same window for both)\n');

const T = 160;
const SAMPLES = 20_000;
const agree = new Float64Array(T + 1);
const width = BigInt(2 * T + 1);
const centreBit = BigInt(T);

function randomWindow() {
  let x = 0n;
  for (let i = 0; i < 2 * T + 1; i += 30) {
    x |= BigInt((Math.random() * 2 ** 30) >>> 0) << BigInt(i);
  }
  return x & ((1n << width) - 1n);
}

for (let s = 0; s < SAMPLES; s++) {
  const w = randomWindow();
  let a = w;
  let b = w;
  const mask = (1n << width) - 1n;
  for (let t = 0; t <= T; t++) {
    if (((a >> centreBit) & 1n) === ((b >> centreBit) & 1n)) agree[t]++;
    a = ((a << 1n) ^ (a | (a >> 1n))) & mask;
    b = ((b << 1n) ^ b ^ (b >> 1n)) & mask;
  }
}
const shown = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160];
for (const t of shown) {
  if (t > T) continue;
  const p = agree[t] / SAMPLES;
  console.log(
    `    t = ${String(t).padStart(3)}   agreement ${p.toFixed(4)}   bias |2p-1| = ${Math.abs(2 * p - 1).toFixed(4)}`,
  );
}

// --------------------------------------------------------------------------
// (3) how often the monomial fires in the seed's own picture
// --------------------------------------------------------------------------

console.log('\n(3) density of the correction term c*r in the seed\'s picture');
console.log('    (a black cell with a black cell immediately to its right)\n');

{
  const ROWS = 20_000;
  let x = 1n;
  let fire = 0;
  let cells = 0;
  let ones = 0;
  for (let t = 0; t < ROWS; t++) {
    // cells of row t inside the cone: 2t+1 of them
    const both = x & (x >> 1n); // cell black and right neighbour black
    let bits = both;
    while (bits > 0n) {
      const lo = bits & -bits;
      fire++;
      bits ^= lo;
    }
    let ob = x;
    while (ob > 0n) {
      ob &= ob - 1n;
      ones++;
    }
    cells += 2 * t + 1;
    x = (x << 1n) ^ (x | (x >> 1n));
    if (t % 4000 === 3999) {
      console.log(
        `    rows <= ${String(t + 1).padStart(6)}   cells ${String(cells).padStart(10)}   ` +
          `density of 1s ${(ones / cells).toFixed(6)}   density of the firing block 11 ${(fire / cells).toFixed(6)}`,
      );
    }
  }
}

// --------------------------------------------------------------------------
// (4) the Fourier-Walsh spectrum of f_t
// --------------------------------------------------------------------------

console.log('\n(4) Fourier-Walsh spectrum of f_t : {0,1}^(2t+1) -> centre cell at time t');
console.log('    left-edge coordinate is bit 0 (position -t).  Exhaustive.\n');
console.log('  t    n    hat(empty)   weight OFF sets containing the left edge   hat({left edge})   max |hat|');

for (let t = 1; t <= 9; t++) {
  const n = 2 * t + 1;
  const N = 2 ** n;
  const f = new Float64Array(N);
  const mask = (1 << n) - 1;
  for (let w = 0; w < N; w++) {
    let x = w;
    for (let s = 0; s < t; s++) x = ((x << 1) ^ (x | (x >>> 1))) & mask;
    f[w] = (x >>> t) & 1 ? -1 : 1; // (-1)^{f_t(w)}
  }
  // Walsh-Hadamard, then normalise
  for (let len = 1; len < N; len <<= 1) {
    for (let i = 0; i < N; i += len << 1) {
      for (let j = i; j < i + len; j++) {
        const a = f[j];
        const b = f[j + len];
        f[j] = a + b;
        f[j + len] = a - b;
      }
    }
  }
  let offWeight = 0;
  let maxAbs = 0;
  for (let S = 0; S < N; S++) {
    f[S] /= N;
    const v = f[S];
    if ((S & 1) === 0) offWeight += v * v; // S does not contain the left edge
    if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
  }
  console.log(
    `  ${String(t).padStart(2)}  ${String(n).padStart(3)}   ${f[0].toFixed(6).padStart(10)}   ${offWeight.toExponential(3).padStart(40)}   ${f[1].toFixed(6).padStart(16)}   ${maxAbs.toFixed(6).padStart(9)}`,
  );
}
