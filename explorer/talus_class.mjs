// Talus, 2026-09-08. Which periodic boundaries are "good"?
//
// good b  :=  X_b has some column other than 0 eventually periodic
//             (equivalently, by the sandwich lemma, column 1 or column -1)
// bad  b  :=  it does not
//
// Two stages, because the engine costs T^2/64 word operations per boundary:
// a cheap sweep at T=3000 to find candidates, then an exhaustive-lag
// confirmation at T=30000 requiring the onset to sit in the first half.
//
// Then the mechanism: for a good b, the whole left half of X_b is eventually
// time-periodic, so by crystal 24 (F^p is left-permutive with radius p, so a
// temporally p-periodic configuration is determined leftward by any 2p
// consecutive cells) the row past the onset should be *spatially* eventually
// periodic going left. That prediction is tested at the end.

const TSWEEP = 3000;
const TCONF = 30000;
const QCONF = 3000;
const PMAX = 10;

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

// row of X_b at time t0, positions 0 .. -(len-1), by the sideways solve
function leftRowAt(col0, col1, t0, len, T) {
  const row = new Uint8Array(len);
  let prev = col0, cur = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) cur[t] = col0[t + 1] ^ (col0[t] | col1[t]);
  row[0] = col0[t0];
  if (len > 1) row[1] = cur[t0];
  for (let k = 2; k < len; k++) {
    const next = new Uint8Array(T);
    for (let t = 0; t + 1 < T - k; t++) next[t] = cur[t + 1] ^ (cur[t] | prev[t]);
    row[k] = next[t0];
    prev = cur; cur = next;
  }
  return row;
}

function leastEventualPeriod(col, T, QMAX, lo) {
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

// least spatial period of w[from..], searching periods up to smax
function spatialPeriod(w, from, smax) {
  for (let s = 1; s <= smax; s++) {
    let ok = true;
    for (let i = from; i + s < w.length; i++) if (w[i + s] !== w[i]) { ok = false; break; }
    if (ok) return s;
  }
  return 0;
}

console.log('stage 1: sweep at T=' + TSWEEP + ', stage 2: exhaustive lags q<=' + QCONF + ' at T=' + TCONF);
console.log('');
console.log(' p   #b    candidates  confirmed good   good fraction');
const good = [];
for (let p = 1; p <= PMAX; p++) {
  const cand = [];
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const cols = halfline(b, TSWEEP, 1);
    const [q] = leastEventualPeriod(cols[0], TSWEEP, 200, TSWEEP >> 1);
    if (q > 0) cand.push(b);
  }
  let conf = 0;
  for (const b of cand) {
    const cols = halfline(b, TCONF, 1);
    const [q, onset] = leastEventualPeriod(cols[0], TCONF, QCONF, TCONF >> 1);
    if (q > 0) { conf++; good.push([p, b.join(''), q, onset]); }
  }
  console.log(
    ` ${String(p).padEnd(3)} ${String(1 << p).padEnd(5)} ${String(cand.length).padEnd(11)} ${String(conf).padEnd(16)} ${(conf / (1 << p)).toFixed(3)}`
  );
}

console.log('');
console.log('confirmed good boundaries with a nontrivial onset (onset > 8):');
for (const [p, s, q, onset] of good) if (onset > 8) console.log(`  p=${p} b=${s} q=${q} onset=${onset}`);

console.log('');
console.log('mechanism: is the row of X_b at t=1000 spatially eventually periodic leftward?');
console.log('  (predicted yes for good b, from crystal 24; tested on positions 0..-600, periods <= 120)');
console.log('  b            class  spatial period of row(1000) left of the origin');
const probe = ['1000', '1000000000', '1110', '100', '10', '110', '100000', '11100110'];
const goodSet = new Set(good.map(([, s]) => s));
for (const s of probe) {
  const b = s.split('').map(Number);
  const T = 4000;
  const cols = halfline(b, T, 1);
  const col0 = new Uint8Array(T);
  for (let t = 0; t < T; t++) col0[t] = b[t % b.length];
  const row = leftRowAt(col0, cols[0], 1000, 600, T);
  const sp = spatialPeriod(row, 100, 120);
  console.log(`  ${s.padEnd(12)} ${(goodSet.has(s) ? 'good' : 'bad').padEnd(6)} ${sp === 0 ? 'none <= 120' : sp}`);
}
