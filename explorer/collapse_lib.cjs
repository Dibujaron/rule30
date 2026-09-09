// Shared helpers for the collapse_* verification scripts.
// T(r) = (4r XOR (2r OR r)) mod 2^n  -- rule 30 as one map on n-bit words.

// --- 32-bit-safe step, valid for n <= 32 ---------------------------------
function makeStep32(n) {
  if (n > 32) throw new Error('makeStep32 only for n <= 32');
  const mask = n === 32 ? -1 : (2 ** n - 1); // -1 is all-ones as int32
  return (r) => ((((4 * r) ^ ((2 * r) | r)) & mask) >>> 0);
}

// --- BigInt step, any n --------------------------------------------------
function makeStepBig(n) {
  const mask = (1n << BigInt(n)) - 1n;
  return (r) => ((4n * r) ^ ((2n * r) | r)) & mask;
}

// --- two-word (<=64 bit) step, as [lo,hi] unsigned 32-bit pairs ----------
// Fast path for sampling at 32 < n <= 64.
function makeStep64(n) {
  if (n > 64) throw new Error('makeStep64 only for n <= 64');
  const hiMask = n <= 32 ? 0 : (n === 64 ? -1 : ((2 ** (n - 32)) - 1));
  const loMask = n >= 32 ? -1 : (2 ** n - 1);
  return (lo, hi, out) => {
    // s1 = r << 1
    const s1lo = (lo << 1) >>> 0;
    const s1hi = (((hi << 1) | (lo >>> 31)) >>> 0);
    // s2 = r << 2
    const s2lo = (lo << 2) >>> 0;
    const s2hi = (((hi << 2) | (lo >>> 30)) >>> 0);
    out[0] = (((s2lo ^ (s1lo | lo)) & loMask) >>> 0);
    out[1] = (((s2hi ^ (s1hi | hi)) & hiMask) >>> 0);
  };
}

function popcnt(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

// Cycle-node detection on a small explicit set closed under `step`.
// Returns { cyclic: Set, spectrum: Map(len -> count) }.
function cyclicNodes(states, step, keyOf) {
  const key = keyOf || ((x) => x);
  const set = new Set(states.map(key));
  const colour = new Map(); // key -> 0 unvisited/absent, 1 on stack, 2 done
  const cyclic = new Set();
  const spectrum = new Map();
  for (const s0 of states) {
    if (colour.get(key(s0)) === 2) continue;
    const path = [];
    let x = s0;
    while (colour.get(key(x)) === undefined) {
      colour.set(key(x), 1);
      path.push(x);
      x = step(x);
      if (!set.has(key(x))) throw new Error('set not closed under step: ' + key(x));
    }
    if (colour.get(key(x)) === 1) {
      // found a new cycle: walk it
      let y = x, len = 0;
      do { cyclic.add(key(y)); y = step(y); len++; } while (key(y) !== key(x));
      spectrum.set(len, (spectrum.get(len) || 0) + 1);
    }
    for (const p of path) colour.set(key(p), 2);
  }
  return { cyclic, spectrum };
}

function fmtSpectrum(spectrum) {
  return [...spectrum.entries()].sort((a, b) => a[0] - b[0]).map(([l, c]) => `${l}x${c}`).join(' ');
}

module.exports = { makeStep32, makeStepBig, makeStep64, popcnt, cyclicNodes, fmtSpectrum };
