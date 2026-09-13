// Groma, 2026-09-13. The directional control for the bispecial/Cassaigne vantage.
//
// One pass over the packed rule 30 triangle. In the packed row `rowNat t`, bit b
// is the cell at x = b - t. So:
//   left  diagonal k  is bit k         (fixed low bit), read at rows t >= k
//   centre column     is bit t         (speed 1 in bit index)
//   right diagonal k  is bit 2t - k    (fixed offset from the top)
//   a ray of slope (s-1) in x per t is bit round(s*t)
// Every line of the space-time diagram is therefore one read of the same pass.
//
// We measure factor complexity p(n) of each read, on the LAST HALF of the run,
// and report where it saturates at 2^n and where it is bounded.

const T = 200000;
const KDIAG = 8;
const NMAX = 24;

const words = ((2 * T + 2) >> 5) + 2;
const a = new Uint32Array(words);
a[0] = 1; // row 0: single black cell, bit 0

function getBit(arr, b) {
  if (b < 0) return 0;
  return (arr[b >>> 5] >>> (b & 31)) & 1;
}

// reads
const SPEEDS = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const rays = SPEEDS.map(() => new Uint8Array(T + 1));
const ld = [];
const rd = [];
for (let k = 0; k < KDIAG; k++) { ld.push(new Uint8Array(T + 1)); rd.push(new Uint8Array(T + 1)); }
const centre = new Uint8Array(T + 1);

let top = 0; // highest word index in use
for (let t = 0; t <= T; t++) {
  // read
  centre[t] = getBit(a, t);
  for (let k = 0; k < KDIAG; k++) {
    ld[k][t] = getBit(a, k);
    rd[k][t] = getBit(a, 2 * t - k);
  }
  for (let i = 0; i < SPEEDS.length; i++) {
    rays[i][t] = getBit(a, Math.round(SPEEDS[i] * t));
  }
  if (t === T) break;
  // step: r' = (4r) ^ ((2r) | r)
  const newTop = ((2 * (t + 1)) >>> 5) + 1;
  if (newTop > top) top = Math.min(newTop, words - 1);
  for (let i = top; i >= 0; i--) {
    const cur = a[i];
    const lo = i > 0 ? a[i - 1] : 0;
    const s1 = ((cur << 1) | (lo >>> 31)) >>> 0;
    const s2 = ((cur << 2) | (lo >>> 30)) >>> 0;
    a[i] = (s2 ^ (s1 | cur)) >>> 0;
  }
}

// ---- factor complexity on the last half ----
function complexity(seq, from, to, nmax) {
  const out = [];
  for (let n = 1; n <= nmax; n++) {
    const set = new Set();
    let code = 0n;
    const mask = (1n << BigInt(n)) - 1n;
    for (let i = from; i < to; i++) {
      code = ((code << 1n) | BigInt(seq[i])) & mask;
      if (i - from >= n - 1) set.add(code);
      if (set.size >= (1 << Math.min(n, 30))) { /* saturated */ }
    }
    out.push(set.size);
    if (set.size < n + 1) { out.push(-1); break; } // bounded: Morse-Hedlund tripped
  }
  return out;
}

function firstShortfall(p) {
  for (let n = 1; n <= p.length; n++) if (p[n - 1] < (1 << n)) return n;
  return p.length + 1;
}

const half = T >> 1;
console.log(`# rule 30 triangle, T = ${T}, complexity measured on rows [${half}, ${T}]`);
console.log(`# centre column prefix (t = 0..23): ${Array.from(centre.slice(0, 24)).join('')}`);

const pc = complexity(centre, half, T, NMAX);
console.log(`\ncentre column   p(n) = ${pc.join(', ')}`);
console.log(`  first n with p(n) < 2^n : ${firstShortfall(pc)}`);

console.log(`\nleft diagonals (bit k fixed; eventually periodic on the board)`);
for (let k = 0; k < KDIAG; k++) {
  const p = complexity(ld[k], half, T, NMAX);
  console.log(`  k=${String(k).padStart(2)}  p(n) = ${p.join(', ')}`);
}
console.log(`\nright diagonals (bit 2t-k; purely periodic on the board)`);
for (let k = 0; k < KDIAG; k++) {
  const p = complexity(rd[k], half, T, NMAX);
  console.log(`  k=${String(k).padStart(2)}  p(n) = ${p.join(', ')}`);
}
console.log(`\nrays: bit index speed s, i.e. the line x = (s-1) t`);
for (let i = 0; i < SPEEDS.length; i++) {
  const p = complexity(rays[i], half, T, NMAX);
  console.log(`  s=${String(SPEEDS[i]).padStart(4)}  x=(${SPEEDS[i] - 1})t  first n with p(n)<2^n: ${String(firstShortfall(p)).padStart(3)}   p(1..8) = ${p.slice(0, 8).join(', ')}`);
}
