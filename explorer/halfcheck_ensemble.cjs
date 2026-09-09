/**
 * halfcheck_ensemble.cjs -- the greedy walker's speed as a function of the
 * background's diagonal period p.
 *
 *   node explorer/halfcheck_ensemble.cjs [nDiagPerOrbit] [nOrbits]
 *
 * The settled background of rule 30's left region is p-periodic along every
 * diagonal, with p a power of two that doubles only at an eventually-white
 * diagonal -- so p is FIXED (p = 32) over the whole stretch every long
 * measurement of the walker has ever been made on. This script asks whether
 * the walker's excess over 1/2 is a property of p.
 *
 * The diagonal recurrence
 *   S_{k+1}(j) = S_{k-1}(j+1) xor (S_k(j) or S_{k+1}(j-1))
 * turns ANY pair of period-p words (A, B) with B non-white into a valid
 * p-periodic rule 30 background (the map (A,B) -> (B,C) is a bijection, so the
 * uniform measure on pairs is invariant). Random seeds therefore give an
 * ensemble of backgrounds of the same kind as rule 30's own, at any p we like,
 * and rule 30's own background is one orbit of that system at p = 32.
 *
 * Controls:
 *   IID    -- fresh fair bits at every cell (no periodicity): speed must be 1/2.
 *   INDEP  -- a fresh random period-p word at every diagonal, no recurrence:
 *             the gap is geometric truncated at p, so the speed must be
 *             very slightly BELOW 1/2.
 */
'use strict';

const NDIAG = parseInt(process.argv[2] || '5000000', 10);
const NORB = parseInt(process.argv[3] || '8', 10);
const BURN = 4096;

// ---- xorshift128 PRNG, seeded, so every run is reproducible ---------------
function mkRng(seed) {
  let a = seed | 0 || 1, b = 362436069, c = 521288629, d = 88675123;
  return function () {
    const t = a ^ (a << 11);
    a = b; b = c; c = d;
    d = (d ^ (d >>> 19)) ^ (t ^ (t >>> 8));
    return d >>> 0;
  };
}

/** S_{k+1} from A = S_{k-1}, B = S_k, written into C. B must be non-white. */
function nextWordP(A, B, C, p) {
  let j0 = 0; while (B[j0] === 0) j0++;
  let jp = j0 + 1; if (jp === p) jp = 0;
  let prev = A[jp] ^ 1;
  C[j0] = prev;
  let j = j0;
  for (let m = 1; m < p; m++) {
    j++; if (j === p) j = 0;
    let j1 = j + 1; if (j1 === p) j1 = 0;
    prev = A[j1] ^ (B[j] | prev);
    C[j] = prev;
  }
}

/** run one orbit; returns null on escape (white diagonal) */
function runOrbit(p, A, B, r, nDiag, burn) {
  let C = new Uint8Array(p);
  let adv = 0, diag = 0;
  const total = nDiag + burn;
  for (let n = 0; n < total; n++) {
    // gap: consecutive zeros of B starting at r
    let g = 0, q = r;
    while (B[q] === 0) { g++; q++; if (q === p) q = 0; if (g >= p) return null; }
    r = q;
    if (n >= burn) { adv += g; diag++; }
    nextWordP(A, B, C, p);
    const t = A; A = B; B = C; C = t;
  }
  return { adv, diag };
}

function summarise(label, samples) {
  // samples: array of {adv, diag}
  let adv = 0, diag = 0;
  for (const s of samples) { adv += s.adv; diag += s.diag; }
  const gbar = adv / diag;
  const sp = adv / (adv + diag);
  // per-orbit speeds, for an honest error bar over independent orbits
  const sps = samples.map((s) => s.adv / (s.adv + s.diag));
  const m = sps.reduce((a, b) => a + b, 0) / sps.length;
  const sd = sps.length > 1 ? Math.sqrt(sps.reduce((a, b) => a + (b - m) * (b - m), 0) / (sps.length - 1)) : NaN;
  const sem = sd / Math.sqrt(sps.length);
  console.log(`  ${label}: diagonals ${diag}, mean gap ${gbar.toFixed(6)}, speed ${sp.toFixed(7)}, excess ${(sp - 0.5).toExponential(3)}, sem ${sem.toExponential(3)}, z = ${((sp - 0.5) / sem).toFixed(2)}`);
  return { p: null, sp, sem, excess: sp - 0.5 };
}

// BUDGET = word-ops per period; diagonals per period = BUDGET / p, split into NORB orbits
const BUDGET = NDIAG * NORB;
console.log(`ensemble of p-periodic rule 30 backgrounds: budget ${BUDGET.toExponential(2)} word-ops per p, ${NORB} random orbits each (burn-in ${BURN})`);
const results = [];
const PLIST = (process.env.HC_PLIST || '8,16,32,64,128,256').split(',').map(Number);
for (const p of PLIST) {
  const perOrbit = Math.max(1000, Math.round(BUDGET / p / NORB));
  const rng = mkRng(0x1234567 + p * 7919);
  const samples = [];
  let escapes = 0;
  const t0 = Date.now();
  for (let o = 0; o < NORB; o++) {
    let A, B, res = null, tries = 0;
    while (res === null && tries < 40) {
      A = new Uint8Array(p); B = new Uint8Array(p);
      for (let j = 0; j < p; j++) { A[j] = rng() & 1; B[j] = rng() & 1; }
      let any = false; for (let j = 0; j < p; j++) if (B[j]) any = true;
      if (!any) { tries++; continue; }
      res = runOrbit(p, A, B, rng() % p, perOrbit, BURN);
      if (res === null) escapes++;
      tries++;
    }
    if (res) samples.push(res);
  }
  const r = summarise(`p = ${String(p).padStart(4)} (${samples.length} orbits x ${perOrbit} diagonals, ${Date.now() - t0} ms)`, samples);
  r.p = p; r.escapes = escapes; results.push(r);
}

console.log('\nexcess vs 1/p:');
for (const r of results) console.log(`  p=${String(r.p).padStart(4)}  excess ${r.excess.toExponential(3)}  sem ${r.sem.toExponential(3)}  p*excess ${(r.p * r.excess).toFixed(4)}  sqrt(p)*excess ${(Math.sqrt(r.p) * r.excess).toFixed(5)}${r.escapes ? `  (${r.escapes} escapes)` : ''}`);

// ---- controls --------------------------------------------------------------
console.log('\ncontrols:');
{
  // IID: fresh fair bits everywhere. The walker reads one fresh bit per step.
  const rng = mkRng(987654321);
  const N = Math.min(NDIAG * NORB, 200000000);
  let adv = 0, diag = 0;
  for (let n = 0; n < N; n++) {
    let g = 0;
    while ((rng() & 1) === 0) g++;
    adv += g; diag++;
  }
  const sp = adv / (adv + diag);
  console.log(`  IID fair bits: diagonals ${diag}, mean gap ${(adv / diag).toFixed(6)}, speed ${sp.toFixed(7)}, excess ${(sp - 0.5).toExponential(3)} (sem ~ ${(0.5 / Math.sqrt(adv + diag)).toExponential(3)})`);
}
for (const p of [16, 32, 64]) {
  // INDEP: a fresh uniform period-p word at every diagonal, no recurrence
  const rng = mkRng(555 + p);
  const N = Math.min(NDIAG * NORB, 40000000);
  let adv = 0, diag = 0, r = 0;
  const B = new Uint8Array(p);
  for (let n = 0; n < N; n++) {
    let any = false;
    for (let j = 0; j < p; j++) { B[j] = rng() & 1; if (B[j]) any = true; }
    if (!any) continue;
    let g = 0, q = r;
    while (B[q] === 0) { g++; q++; if (q === p) q = 0; }
    r = q; adv += g; diag++;
  }
  const sp = adv / (adv + diag);
  console.log(`  INDEP random period-${p} words: diagonals ${diag}, mean gap ${(adv / diag).toFixed(6)}, speed ${sp.toFixed(7)}, excess ${(sp - 0.5).toExponential(3)} (sem ~ ${(0.5 / Math.sqrt(adv + diag)).toExponential(3)}); predicted mean gap 1 - 2^-(p-1) = ${(1 - Math.pow(2, -(p - 1))).toFixed(9)}`);
}
