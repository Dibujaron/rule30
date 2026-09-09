// Talus, 2026-09-08. Column -1 against column +1.
//
// The board has two walls for the residual: the strong one asks for column 1,
// the frontier one asks for *some* column j != 0. Two proved nodes collapse the
// existential: evolve_isEventuallyPeriodic_of_between walks any eventually
// periodic column j inward to column 1 (j >= 2) or column -1 (j <= -2), and
// evolve_period_sub_one turns "columns 0 and 1 periodic" into "column -1
// periodic". So, given column 0 eventually periodic,
//
//     (some column j != 0 is eventually periodic)  <=>  (column -1 is)
//
// and the strong wall implies the frontier one but not conversely -- unless
// column -1 periodic always drags column 1 with it, which nothing proves.
//
// This script looks for the separating case in the family X_b: a periodic
// boundary b whose column -1 is eventually periodic while column 1 is not. If
// one exists the two walls are genuinely different statements; if the sweep
// finds none, the two look equivalent on the evidence and that is worth saying.

const TS = 6000;    // sweep depth
const TC = 90000;   // confirmation depth
const PMAX = 8;

function halfline(b, T, ncols) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const cols = [];
  for (let k = 0; k < ncols; k++) cols.push(new Uint8Array(T));
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < ncols; k++) {
      const x = k + 1;
      cols[k][t] = (r[x >> 5] >>> (x & 31)) & 1;
    }
    const last = Math.min(W - 2, (t >> 5) + 1);
    for (let i = 0; i <= last; i++) {
      const cur = r[i];
      const up = (cur << 1) | (i > 0 ? r[i - 1] >>> 31 : 0);
      const down = (cur >>> 1) | (r[i + 1] << 31);
      s[i] = up ^ (cur | down);
    }
    s[last + 1] = 0;
    s[0] = (s[0] & ~1) | (b[(t + 1) % p] & 1);
    const tmp = r; r = s; s = tmp;
  }
  return cols;
}

// column -1 by the sideways solve: col(-1)(t) = col0(t+1) xor (col0(t) | col1(t))
function colMinus1(b, col1, T) {
  const c = new Uint8Array(T - 1);
  const p = b.length;
  for (let t = 0; t + 1 < T; t++) c[t] = b[(t + 1) % p] ^ (b[t % p] | col1[t]);
  return c;
}

function ep(col, T, QMAX, lo) {
  for (let q = 1; q <= QMAX; q++) {
    let ok = true;
    for (let t = lo; t + q < T; t++) if (col[t + q] !== col[t]) { ok = false; break; }
    if (ok) {
      let onset = 0;
      for (let t = lo - 1; t >= 0; t--) if (col[t + q] !== col[t]) { onset = t + 1; break; }
      return [q, onset];
    }
  }
  return [0, -1];
}

function bits(n, p) { const a = []; for (let i = 0; i < p; i++) a.push((n >> i) & 1); return a; }

console.log(`sweep at T=${TS}, then confirmation at T=${TC}`);
console.log('looking for b with column -1 eventually periodic and column +1 not');
console.log('');
console.log(' p    #b    col+1 EP   col-1 EP   disagreements (sweep)');
const disagree = [];
for (let p = 1; p <= PMAX; p++) {
  let n1 = 0, nm = 0, nd = 0;
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const cols = halfline(b, TS, 1);
    const cm = colMinus1(b, cols[0], TS);
    const a = ep(cols[0], TS, 400, TS >> 1)[0];
    const c = ep(cm, TS - 1, 400, TS >> 1)[0];
    if (a) n1++;
    if (c) nm++;
    if ((a > 0) !== (c > 0)) { nd++; disagree.push([p, b]); }
  }
  console.log(` ${String(p).padEnd(4)} ${String(1 << p).padEnd(5)} ${String(n1).padEnd(10)} ${String(nm).padEnd(10)} ${nd}`);
}

console.log('');
console.log(`confirming the ${disagree.length} sweep disagreements at T=${TC}, lags <= 4000:`);
if (disagree.length === 0) console.log('  none to confirm');
let held = 0;
for (const [p, b] of disagree) {
  const cols = halfline(b, TC, 1);
  const cm = colMinus1(b, cols[0], TC);
  const [q1, o1] = ep(cols[0], TC, 4000, TC >> 1);
  const [qm, om] = ep(cm, TC - 1, 4000, TC >> 1);
  const verdict = (q1 > 0) !== (qm > 0) ? 'SEPARATES' : 'no separation at depth';
  if (verdict === 'SEPARATES') held++;
  console.log(
    `  p=${p} b=${b.join('')}  col+1 ${q1 ? `q=${q1} onset=${o1}` : 'none'}   col-1 ${qm ? `q=${qm} onset=${om}` : 'none'}   ${verdict}`
  );
}
console.log('');
console.log(`separating boundaries surviving confirmation: ${held}`);
