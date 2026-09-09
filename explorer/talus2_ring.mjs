// Talus, 2026-09-08. THE MECHANISM: a good boundary is a ring trace.
//
// The left half of X_b at time t, read from x = 0 leftward, was measured to be
// exactly spatially periodic for good b. If the row at time t is exactly
// n-periodic on x <= 0, then for every x <= -1 the cell at (t+1, x) reads three
// cells all at x <= 0, so it is the rule-30 RING step on Z/n; and the cell at
// (t+1, 0) is b(t+1) by the definition of X_b. So the row stays exactly
// n-periodic on x <= 0 forever exactly when
//
//        b(t+1) = (ring step of rho_t)(0)   at every t,
//
// i.e. exactly when b is the CENTRE-COLUMN TRACE of a rule 30 orbit on the
// finite ring Z/n. Ring orbits are eventually periodic (2^n states), so every
// column x <= 0 of X_b is then eventually periodic and b is good.
//
// This script tests both directions:
//   (I)  for measured-good b, read rho off the row and check that the ring
//        orbit's trace reproduces b -- and that the ring's own cycle length is
//        the temporal period seen in the columns;
//   (II) for rings built independently, check that their traces are good;
//   (III) controls: the same spatial measurement on measured-BAD b.

const KCOLS = 4000;

function col1of(b, T) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words), s = new Uint32Array(words);
  const out = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    out[t] = (r[0] >>> 1) & 1;
    const last = Math.min(words - 2, (t >> 5) + 1);
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
  return out;
}

// w[k] = cell at x = -k, at time t0; columns solved sideways from 0 and 1
function leftRow(b, t0, K) {
  const T = t0 + K + 40;
  const c0 = new Uint8Array(T);
  for (let t = 0; t < T; t++) c0[t] = b[t % b.length];
  const c1 = col1of(b, T);
  let prev = c0;
  const cm1 = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) cm1[t] = c0[t + 1] ^ (c0[t] | c1[t]);
  let cur = cm1;
  const w = new Uint8Array(K);
  w[0] = c0[t0]; if (K > 1) w[1] = cur[t0];
  for (let k = 2; k < K; k++) {
    const nx = new Uint8Array(T);
    for (let t = 0; t + 1 < T - k; t++) nx[t] = cur[t + 1] ^ (cur[t] | prev[t]);
    w[k] = nx[t0];
    prev = cur; cur = nx;
  }
  return w;
}

function leastSpatialPeriod(w, from, smax) {
  for (let s = 1; s <= smax; s++) {
    let ok = true;
    for (let i = from; i + s < w.length; i++) if (w[i + s] !== w[i]) { ok = false; break; }
    if (ok) {
      let onset = 0;
      for (let i = from - 1; i >= 0; i--) if (w[i + s] !== w[i]) { onset = i + 1; break; }
      return [s, onset];
    }
  }
  return [0, -1];
}

// rule 30 on a ring, in the k coordinate (k = -x): w'[k] = w[k+1] ^ (w[k] | w[k-1])
function ringStep(w) {
  const n = w.length;
  const o = new Uint8Array(n);
  for (let k = 0; k < n; k++) o[k] = w[(k + 1) % n] ^ (w[k] | w[(k - 1 + n) % n]);
  return o;
}

// trace at k=0 of the orbit of rho, for L steps (rho itself is step 0)
function ringTrace(rho, L) {
  const out = new Uint8Array(L);
  let w = rho;
  for (let i = 0; i < L; i++) { out[i] = w[0]; w = ringStep(w); }
  return out;
}

// eventual cycle length and transient of a ring orbit
function ringCycle(rho) {
  const seen = new Map();
  let w = rho, i = 0;
  for (;;) {
    const key = Array.from(w).join('');
    if (seen.has(key)) return { transient: seen.get(key), cycle: i - seen.get(key) };
    seen.set(key, i);
    w = ringStep(w); i++;
    if (i > 400000) return { transient: -1, cycle: -1 };
  }
}

function bits(n, p) { const a = []; for (let i = 0; i < p; i++) a.push((n >> i) & 1); return a; }

// =========================================================== I. good -> ring
console.log('=== I. for a measured-good b: read the left row, is b the ring trace? ===');
console.log('b               t0     spatial n  onset  ring cycle  trace matches b over 4000 steps?');
const goods = [
  ['1000000000', 400], ['10000000000', 400], ['100000000000', 400], ['1000', 400],
  ['10000000', 400], ['0111', 400], ['01111111', 400], ['0111111111', 400],
  ['1', 400], ['11', 400], ['1110011000', 4000], ['0011000111', 4000],
  ['10110101011', 4000], ['11111011110', 4000], ['1010100000', 4000],
  ['0101000001', 4000], ['100', 4000], ['011000001', 200000],
  ['11110010000', 100000], ['10110100001', 20000],
];
for (const [s, t0] of goods) {
  const b = s.split('').map(Number);
  const K = Math.min(KCOLS, 4000);
  const w = leftRow(b, t0, K);
  const [n, onset] = leastSpatialPeriod(w, K >> 1, 900);
  if (n === 0) { console.log(`${s.padEnd(15)} ${String(t0).padEnd(6)} none <= 900`); continue; }
  // the ring lives on the periodic part: take the window starting at `onset`
  const rho = w.slice(onset, onset + n);
  const cyc = ringCycle(rho);
  // the trace at k = onset corresponds to column x = -onset, whose values over
  // time are the ring trace; when onset = 0 that column IS b.
  const L = 4000;
  const tr = ringTrace(rho, L);
  let mism = 0;
  for (let i = 0; i < L; i++) if (tr[i] !== b[(t0 + i) % b.length]) mism++;
  const verdict = onset === 0 ? (mism === 0 ? 'YES (0 mismatches)' : `no (${mism}/${L})`) : `n/a, onset ${onset} > 0`;
  console.log(
    `${s.padEnd(15)} ${String(t0).padEnd(6)} ${String(n).padEnd(10)} ${String(onset).padEnd(6)} ${String(cyc.cycle).padEnd(11)} ${verdict}`
  );
}

// ============================================ I'. does the ring drive column -k?
console.log('');
console.log('=== I\'. does the ring orbit reproduce columns 0, -1, -2, ... of X_b? ===');
for (const [s, t0] of [['1000000000', 400], ['1110011000', 4000], ['10110101011', 4000], ['1000', 400]]) {
  const b = s.split('').map(Number);
  const K = 4000;
  const w = leftRow(b, t0, K);
  const [n, onset] = leastSpatialPeriod(w, K >> 1, 900);
  if (n === 0 || onset !== 0) { console.log(`${s}: skipped (n=${n}, onset=${onset})`); continue; }
  const rho = w.slice(0, n);
  // evolve the ring and compare with real columns -k for k = 0..n-1
  const L = 600;
  const real = [];
  for (let k = 0; k < Math.min(n, 40); k++) real.push(new Uint8Array(L));
  // rebuild real columns from the picture: solve sideways at each time
  const T = t0 + L + 60;
  const c0 = new Uint8Array(T);
  for (let t = 0; t < T; t++) c0[t] = b[t % b.length];
  const c1 = col1of(b, T);
  let prev = c0, cur = new Uint8Array(T);
  for (let t = 0; t + 1 < T; t++) cur[t] = c0[t + 1] ^ (c0[t] | c1[t]);
  const colArr = [c0, cur];
  for (let k = 2; k < Math.min(n, 40); k++) {
    const nx = new Uint8Array(T);
    for (let t = 0; t + 1 < T - k; t++) nx[t] = colArr[k - 1][t + 1] ^ (colArr[k - 1][t] | colArr[k - 2][t]);
    colArr.push(nx);
  }
  let mism = 0, tested = 0;
  let ww = rho;
  for (let i = 0; i < L; i++) {
    for (let k = 0; k < Math.min(n, 40); k++) { tested++; if (ww[k] !== colArr[k][t0 + i]) mism++; }
    ww = ringStep(ww);
  }
  console.log(`${s.padEnd(14)} ring n=${String(n).padEnd(4)} vs columns 0..${Math.min(n, 40) - 1} over ${L} rows: ${mism}/${tested} mismatches`);
}

// ========================================================== II. ring -> good
console.log('');
console.log('=== II. build rings independently; are their traces good boundaries? ===');
console.log('n    rho                  cycle   trace period  is the trace a good boundary?');
function goodness(b, T) {
  const c1 = col1of(b, T);
  const p = b.length;
  const v = [];
  for (let t = 0; t < T; t++) if (b[t % p] === 0) v.push(c1[t]);
  if (v.length === 0) return 'good (b all black)';
  const M = Math.min(6000, v.length >> 2);
  const tail = v.slice(v.length - M);
  const f = (n) => { const st = new Set(); for (let i = 0; i + n <= tail.length; i++) st.add(tail.slice(i, i + n).join('')); return st.size; };
  const f32 = f(32), f128 = f(128);
  if (f32 === f128) return `GOOD (tail period ${f32})`;
  return `not periodic in tail (factors 32:${f32} 128:${f128})`;
}
let ok2 = 0, tot2 = 0;
for (let n = 2; n <= 22; n++) {
  for (let trial = 0; trial < 3; trial++) {
    let rho = new Uint8Array(n);
    for (let i = 0; i < n; i++) rho[i] = (Math.random() < 0.5) ? 1 : 0;
    const cyc = ringCycle(rho);
    if (cyc.cycle <= 0 || cyc.cycle > 4000) continue;
    // move onto the cycle
    for (let i = 0; i < cyc.transient; i++) rho = ringStep(rho);
    const tr = ringTrace(rho, cyc.cycle);
    // reduce to the minimal period of the trace
    let p = cyc.cycle;
    for (let q = 1; q <= cyc.cycle; q++) {
      if (cyc.cycle % q) continue;
      let good = true;
      for (let i = 0; i < cyc.cycle; i++) if (tr[i] !== tr[i % q]) { good = false; break; }
      if (good) { p = q; break; }
    }
    const b = Array.from(tr.slice(0, p));
    const T = Math.max(20000, 200 * p);
    const g = goodness(b, Math.min(T, 60000));
    tot2++; if (g.startsWith('GOOD') || g.startsWith('good')) ok2++;
    console.log(
      `${String(n).padEnd(4)} ${Array.from(rho).join('').slice(0, 20).padEnd(20)} ${String(cyc.cycle).padEnd(7)} ${String(p).padEnd(13)} ${g}`
    );
  }
}
console.log(`ring traces that came out good: ${ok2}/${tot2}`);

// =============================================================== III. controls
console.log('');
console.log('=== III. control: the same spatial measurement on measured-BAD b ===');
console.log('b               t0     least spatial period of the left row, searched to 900');
for (const [s, t0] of [['10', 4000], ['011', 4000], ['10000', 4000], ['100000000', 4000], ['0111111', 4000], ['11011100', 4000], ['1011011101', 4000], ['0010001001', 4000]]) {
  const b = s.split('').map(Number);
  const w = leftRow(b, t0, 4000);
  const [n, onset] = leastSpatialPeriod(w, 2000, 900);
  console.log(`${s.padEnd(15)} ${String(t0).padEnd(6)} ${n === 0 ? 'none <= 900' : n + ' (onset ' + onset + ')'}`);
}
