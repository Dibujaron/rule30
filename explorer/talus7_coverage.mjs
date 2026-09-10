/**
 * Talus, 2026-09-10. Route (2) of the P2 topic: does the forcing coverage
 * carry any information about rule 30?
 *
 * The board's black-time law (column_succ_of_black) and Dioptra's white-time
 * law (centre_forced_after_double_white) are quoted as determining 0.6885 of
 * the centre column from column -1, measured over 200,000 rows. Both are
 * theorems about an ARBITRARY Config. Crystal 40 says column 0 and the right
 * half are free coordinates, so for every Bool sequence b there is a
 * configuration X_b, white at every x >= 1 at time 0, whose centre column is b.
 * So both laws hold for every b, and the coverage figure is a measurement over
 * whatever b happens to be.
 *
 * This script measures the coverage for the seed and for other boundaries:
 * fair-coin b, biased b, periodic b. If the seed's numbers are the numbers a
 * coin gives, the coverage is not a fact about rule 30.
 *
 * Quantities, with c = column 0, R = column 1, L = column -1:
 *   sideways_inverse at the origin gives  L(t) = c(t+1) XOR (c(t) OR R(t)),
 *   so  c(t+1) = !L(t)  holds exactly when  c(t) OR R(t)  is black.
 * That is the whole "forcing" phenomenon; its coverage is dens(c OR R).
 */

// ---------------------------------------------------------------- seed engine
// Full packed rows (the low-end map keeps the entire row, since word (t>>4)+1
// covers bits up to 2t+63 and row t occupies bits 0..2t).
// cell(t, x) = bit (x + t) of rowNat t.
function seedColumns(n) {
  const WORDS = ((2 * n + 96) >> 5) + 2;
  const r = new Uint32Array(WORDS);
  r[0] = 1;
  const c = new Uint8Array(n);
  const R = new Uint8Array(n);
  const L = new Uint8Array(n);
  for (let t = 0; t < n; t++) {
    const bit = (i) => (r[i >> 5] >>> (i & 31)) & 1;
    c[t] = bit(t);
    R[t] = bit(t + 1);
    L[t] = t >= 1 ? bit(t - 1) : 0;
    const limit = Math.min(WORDS - 1, (t >> 4) + 1);
    let prev = 0;
    for (let j = 0; j <= limit; j++) {
      const cur = r[j];
      const s2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const s1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      r[j] = (s2 ^ (s1 | cur)) >>> 0;
      prev = cur;
    }
  }
  return { c, R, L };
}

// ------------------------------------------------------------ half-line X_b
// Right half of X_b: x >= 1 white at time 0, position 0 pinned to b.
function halflineColumns(b, T) {
  const W = ((T + 96) >> 5) + 3;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const R = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    R[t] = (r[0] >>> 1) & 1; // column 1
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = ((cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0)) >>> 0;
      const down = ((cur >>> 1) | (r[i + 1] << 31)) >>> 0;
      s[i] = (up ^ (cur | down)) >>> 0;
    }
    s[last + 1] = 0;
    s[0] = ((s[0] & ~1) | (b[t + 1] & 1)) >>> 0;
    const tmp = r;
    r = s;
    s = tmp;
  }
  // L(t) = c(t+1) XOR (c(t) OR R(t))
  const L = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) L[t] = b[t + 1] ^ (b[t] | R[t]);
  return { R, L };
}

function stats(name, c, R, T) {
  let nc = 0, nR = 0, nOr = 0, nDW = 0;
  for (let t = 0; t + 2 < T; t++) {
    nc += c[t];
    nR += R[t];
    if (c[t] | R[t]) nOr++;
    // the double-white law's own trigger: c(t)=c(t+1)=0 and L(t)=1, which by
    // col_one_of_white at t is R(t)=1
    if (!c[t] && !c[t + 1] && R[t]) nDW++;
  }
  const d = T - 2;
  console.log(
    `${name.padEnd(22)} dens(c)=${(nc / d).toFixed(4)} dens(col1)=${(nR / d).toFixed(4)} ` +
    `dens(c OR col1)=${(nOr / d).toFixed(4)} doubleWhiteTrigger=${(nDW / d).toFixed(4)} ` +
    `E_c=${2 * nc - d}`,
  );
  return nOr / d;
}

const T = 200_000;

console.log(`--- forcing coverage, T = ${T} ---`);
console.log('dens(c OR col1) is the exact coverage of  c(t+1) = !L(t).');
console.log('');

const seed = seedColumns(T);
// cross-check the seed engine against the validated centre-column engine
{
  const A = [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0];
  let bad = 0;
  for (let i = 0; i < A.length; i++) if (seed.c[i] !== A[i]) bad++;
  // and the forcing identity itself, on the seed, as a check on L and R
  let idBad = 0, idHold = 0;
  for (let t = 0; t + 1 < T; t++) {
    const holds = seed.c[t + 1] === (1 - seed.L[t]);
    const pred = (seed.c[t] | seed.R[t]) === 1;
    if (holds !== pred) idBad++;
    if (holds) idHold++;
  }
  console.log(`seed check: A051023 prefix mismatches ${bad}; ` +
    `"c(t+1)=!L(t) iff c(t) OR col1(t)" fails ${idBad} of ${T - 1} times; ` +
    `identity holds at ${(idHold / (T - 1)).toFixed(4)}`);
  console.log('');
}

stats('seed', seed.c, seed.R, T);

// xorshift32
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return x;
  };
}

for (const s of [0x9e3779b9, 0x12345, 0xdeadbeef]) {
  const g = rng(s);
  const b = new Uint8Array(T + 2);
  for (let i = 0; i < b.length; i++) b[i] = g() & 1;
  const hl = halflineColumns(b, T);
  stats(`coin b (seed ${s.toString(16)})`, b, hl.R, T);
}

for (const [name, p] of [['biased 1/4', 4], ['biased 3/4', 4]]) {
  const g = rng(0xabcdef);
  const b = new Uint8Array(T + 2);
  for (let i = 0; i < b.length; i++) {
    const u = g() % p;
    b[i] = name === 'biased 1/4' ? (u === 0 ? 1 : 0) : (u === 0 ? 0 : 1);
  }
  const hl = halflineColumns(b, T);
  stats(name, b, hl.R, T);
}

for (const w of ['10', '1', '0', '1101110', '11010']) {
  const b = new Uint8Array(T + 2);
  for (let i = 0; i < b.length; i++) b[i] = Number(w[i % w.length]);
  const hl = halflineColumns(b, T);
  stats(`periodic (${w})^inf`, b, hl.R, T);
}
