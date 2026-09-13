// Astrolabe, 2026-09-13.  Neciporuk's method on rule 30's cone map.
//
// Durr-Rapaport-Theyssier's d_n is the number of distinct subfunctions of the
// cone map obtained by fixing everything outside Alice's block.  That is
// exactly a Neciporuk term.  Neciporuk's bound is UNCONDITIONAL and applies to
// a fixed explicit function, which is what the brief asks for, so this script
// measures the terms and reports the bound the method actually yields.
//
//   L(f) >= (1/4) * sum_i log2 s_i,      s_i = #subfunctions on block i
//
// f = the cone map P_t: the origin cell at time t as a function of the
// n = 2t+1 cells of row 0 inside the light cone.
//
// Exact and exhaustive: for each block, every one of the 2^(n-b) assignments
// to the complement is enumerated, and the subfunction on the block is
// computed bit-parallel over all 2^b block assignments at once.
// No sampling anywhere in this file.

function ruleBit(rule, l, c, r) { return (rule >> (4 * l + 2 * c + r)) & 1; }

// Simulate t steps on cells -t..t, bit-parallel over the block's assignments.
// masks[i] is a 2^b-bit integer.  Returns the origin's mask at time t.
function coneMasks(rule, t, masks, FULL) {
  const n = 2 * t + 1;
  let cur = masks.slice();
  const nxt = new Array(n).fill(0);
  let lo = 0, hi = n - 1, bg = 0;
  for (let s = 0; s < t; s++) {
    const nlo = lo + 1, nhi = hi - 1;
    for (let i = nlo; i <= nhi; i++) {
      const L = cur[i - 1], C = cur[i], R = cur[i + 1];
      let o = 0;
      for (let nb = 0; nb < 8; nb++) {
        if (((rule >> nb) & 1) === 0) continue;
        const x = (nb >> 2) & 1 ? L : ~L & FULL;
        const y = (nb >> 1) & 1 ? C : ~C & FULL;
        const z = nb & 1 ? R : ~R & FULL;
        o |= x & y & z;
      }
      nxt[i] = o & FULL;
    }
    for (let i = nlo; i <= nhi; i++) cur[i] = nxt[i];
    bg = ruleBit(rule, bg, bg, bg);
    lo = nlo; hi = nhi;
  }
  return cur[t] & FULL;
}

// #distinct subfunctions of P_t on the block of cells [p, p+b) (window indices)
function subfunctionCount(rule, t, p, b) {
  const n = 2 * t + 1;
  const FULL = (1 << b) === 32 ? -1 >>> 0 : ((1 << (1 << b)) - 1) >>> 0;
  const nOut = n - b;
  // block cell j (0..b-1) carries the mask "bit j of the assignment index"
  const blockMask = [];
  for (let j = 0; j < b; j++) {
    let m = 0;
    for (let idx = 0; idx < 1 << b; idx++) if ((idx >> j) & 1) m |= 1 << idx;
    blockMask.push(m >>> 0);
  }
  const outIdx = [];
  for (let i = 0; i < n; i++) if (i < p || i >= p + b) outIdx.push(i);
  const seen = new Set();
  const masks = new Array(n).fill(0);
  for (let j = 0; j < b; j++) masks[p + j] = blockMask[j];
  const total = 1 << nOut;
  for (let a = 0; a < total; a++) {
    for (let k = 0; k < nOut; k++) masks[outIdx[k]] = (a >> k) & 1 ? FULL : 0;
    seen.add(coneMasks(rule, t, masks, FULL));
  }
  return seen.size;
}

const RULES = [30, 86, 45, 110, 90, 150, 105, 60, 22, 106];

// -------------------------------------------------- [A] per-position, b = 3
console.log('[A] subfunction count s on each single block of b=3 consecutive');
console.log('    cells of row 0, at t = 6 (n = 13).  Ceiling is 2^(2^3) = 256.');
console.log('    Block start p = 0 is the leftmost cone cell x = -t.');
{
  const t = 6, b = 3, n = 2 * t + 1;
  console.log('rule  ' + Array.from({ length: n - b + 1 }, (_, p) => ('p' + p).padStart(4)).join(''));
  for (const rule of RULES) {
    const row = [];
    for (let p = 0; p + b <= n; p++) row.push(subfunctionCount(rule, t, p, b));
    console.log(String(rule).padStart(4) + '  ' + row.map((v) => String(v).padStart(4)).join(''));
  }
}

// -------------------------------------------- [B] the Neciporuk bound itself
console.log('\n[B] Neciporuk bound L(f) >= (1/4) sum log2 s_i, disjoint blocks');
console.log('    of size b laid left to right; leftover cells at the right end');
console.log('    are dropped (legitimate: dropping blocks only weakens it).');
for (const b of [2, 3, 4]) {
  console.log(`  --- b = ${b}, ceiling per block 2^(2^${b}) = 2^${1 << b} ---`);
  console.log('   t    n  blocks   sum log2 s_i   bound   trivial(n-1)  rule');
  for (const rule of RULES) {
    for (const t of [4, 6, 8]) {
      const n = 2 * t + 1;
      if (n - b > 22) continue;
      const nb = Math.floor(n / b);
      let sum = 0;
      const parts = [];
      for (let k = 0; k < nb; k++) {
        const s = subfunctionCount(rule, t, k * b, b);
        parts.push(s);
        sum += Math.log2(s);
      }
      console.log(
        String(t).padStart(4) + String(n).padStart(5) + String(nb).padStart(8) +
        sum.toFixed(2).padStart(15) + (sum / 4).toFixed(2).padStart(8) +
        String(n - 1).padStart(14) + String(rule).padStart(7) +
        '   s = [' + parts.join(',') + ']');
    }
  }
}

// ------------------------------- [C] saturation: does log2 s reach 2^b?
console.log('\n[C] saturation of the best block, as t grows.  sat = log2(s)/2^b.');
console.log('    If sat -> 1 the method reaches its own ceiling and Neciporuk');
console.log('    yields Omega(n^2/log n); if sat -> 0 it yields nothing.');
for (const b of [3, 4]) {
  console.log(`  b = ${b}:`);
  console.log('  rule    t=3     t=4     t=5     t=6     t=7     t=8     t=9');
  for (const rule of [30, 86, 45, 110, 90, 150]) {
    const row = [];
    for (let t = 3; t <= 9; t++) {
      const n = 2 * t + 1;
      if (n - b > 20) { row.push('   -  '); continue; }
      let best = 0;
      for (let p = 0; p + b <= n; p++) best = Math.max(best, subfunctionCount(rule, t, p, b));
      row.push((Math.log2(best) / (1 << b)).toFixed(4));
    }
    console.log(String(rule).padStart(6) + '  ' + row.join('  '));
  }
}
