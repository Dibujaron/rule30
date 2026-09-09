// Talus, 2026-09-08. The right-diagonal tower of X_b, and the positive
// criterion it gives.
//
// For ANY configuration white at every x >= 1 at time 0 the right diagonals
// R_k(j) := cell (j+k, j) satisfy, exactly as for the seed:
//   R_0 == b(0)            (the right edge: cell (j+1,j+1) reads (j,j) and two
//                           white cells, so R_0 is constant)
//   R_1(j) = b(1) XOR j*b(0)
//   R_{k+2}(i+1) = R_{k+2}(i) XOR ( R_{k+1}(i+1) | R_k(i+2) ),  R_{k+2}(0) = b(k+2)
// so every R_k is EXACTLY periodic from index 0 with period dividing 2^k, by
// the same induction as rightDiagonal_periodicFrom_pow. The free constant at
// each depth is the centre column entry b(k).
//
// THE CRITERION. If the minimal periods pi_k stay bounded by L, the pair
// (R_k, R_{k+1}) lives in a finite set; b is periodic, so the driving constant
// b(k) is a periodic input; hence k -> (R_k, R_{k+1}, k mod p) is eventually
// periodic in k, say with period Q. Then R_{k+Q} = R_k for large k, and since
// column j at time t is R_{t-j}(j), EVERY column of X_b is eventually periodic
// with period Q. So a cycle in the tower is a FINITE CERTIFICATE OF GOODNESS.
//
// This script (1) checks the tower against the real picture, (2) finds which
// words have a cycling tower, (3) cross-tabulates that against goodness and
// against full periodicity of column 1.

const LMAX = 512;   // give up once a diagonal's minimal period exceeds this
const KMAX = 600;   // give up after this many depths

function minPeriod(w) {
  const n = w.length;
  for (let q = 1; q <= n; q++) {
    if (n % q) continue;
    let ok = true;
    for (let i = 0; i < n; i++) if (w[i] !== w[i % q]) { ok = false; break; }
    if (ok) return q;
  }
  return n;
}

function reduce(w) { const q = minPeriod(w); return q === w.length ? w : w.slice(0, q); }

function lcm(a, b) { let x = a, y = b; while (y) { const t = x % y; x = y; y = t; } return (a / x) * b; }

// tower for boundary b; returns {status, K, Q, maxPeriod, periods}
function tower(b, kmax = KMAX, lmax = LMAX) {
  const p = b.length;
  const bAt = (k) => b[k % p];
  let Rk = Uint8Array.from([bAt(0)]);                       // R_0, period 1
  let Rk1 = bAt(0) ? Uint8Array.from([bAt(1), bAt(1) ^ 1])  // R_1 alternates
                   : Uint8Array.from([bAt(1)]);
  Rk = reduce(Rk); Rk1 = reduce(Rk1);
  const seen = new Map();
  const periods = [Rk.length, Rk1.length];
  for (let k = 0; k + 2 <= kmax; k++) {
    const key = Array.from(Rk).join('') + '|' + Array.from(Rk1).join('') + '|' + ((k) % p);
    if (seen.has(key)) {
      return { status: 'cycle', K: seen.get(key), Q: k - seen.get(key), maxPeriod: Math.max(...periods), periods };
    }
    seen.set(key, k);
    const L = lcm(Rk.length, Rk1.length);
    if (L > lmax) return { status: 'period>' + lmax, K: k, Q: 0, maxPeriod: L, periods };
    // driver g(i) = R_{k+1}(i+1) | R_k(i+2), period L
    let weight = 0;
    const g = new Uint8Array(L);
    for (let i = 0; i < L; i++) {
      g[i] = (Rk1[(i + 1) % Rk1.length] | Rk[(i + 2) % Rk.length]) & 1;
      weight += g[i];
    }
    const span = (weight % 2 === 0) ? L : 2 * L;
    if (span > lmax) return { status: 'period>' + lmax, K: k, Q: 0, maxPeriod: span, periods };
    const Rk2 = new Uint8Array(span);
    Rk2[0] = bAt(k + 2);
    for (let i = 0; i + 1 < span; i++) Rk2[i + 1] = Rk2[i] ^ g[i % L];
    const red = reduce(Rk2);
    periods.push(red.length);
    Rk = Rk1; Rk1 = red;
  }
  return { status: 'nocycle<' + kmax, K: kmax, Q: 0, maxPeriod: Math.max(...periods), periods };
}

// ---- the real picture, for the self-check and for column 1
function col1(b, T) {
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

function pic(b, T, W) {
  const p = b.length;
  const words = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(words), s = new Uint32Array(words);
  const rows = [];
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    const line = new Uint8Array(W);
    for (let x = 0; x < W; x++) line[x] = (r[x >> 5] >>> (x & 31)) & 1;
    rows.push(line);
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
  return rows;
}

function bits(n, p) { const a = []; for (let i = 0; i < p; i++) a.push((n >> i) & 1); return a; }

// ------------------------------------------------------------------ check 1
console.log('=== check: the tower reproduces the picture ===');
{
  const T = 240, W = 100;
  let bad = 0, tested = 0;
  for (const s of ['1', '10', '110', '1000', '11111110', '1010000000', '10110101']) {
    const b = s.split('').map(Number);
    const rows = pic(b, T, W);
    // rebuild the diagonals slowly, no lcm/period logic, straight from the recurrence
    const N = 120;
    const R = [];
    R.push(new Uint8Array(N).fill(b[0]));
    const r1 = new Uint8Array(N);
    for (let j = 0; j < N; j++) r1[j] = b[1 % b.length] ^ ((j % 2) & b[0]);
    R.push(r1);
    for (let k = 2; k < N; k++) {
      const rk = new Uint8Array(N);
      rk[0] = b[k % b.length];
      for (let i = 0; i + 1 < N; i++) rk[i + 1] = rk[i] ^ (R[k - 1][(i + 1) % N] | R[k - 2][(i + 2) % N]);
      R.push(rk);
    }
    for (let k = 0; k < N; k++) for (let j = 0; j + k < T && j < 60 && j + 2 < N; j++) {
      tested++; if (R[k][j] !== rows[j + k][j]) bad++;
    }
  }
  console.log(`  slow tower vs picture: ${bad}/${tested} mismatches`);
}
// ------------------------------------------------------------------ check 2
console.log('=== check: the period-aware tower agrees with the slow tower ===');
{
  let bad = 0, tested = 0;
  for (const s of ['1', '10', '110', '1000', '11111110', '10110101', '11011100']) {
    const b = s.split('').map(Number);
    const N = 60;
    const R = [];
    R.push(new Uint8Array(4 * N).fill(b[0]));
    const r1 = new Uint8Array(4 * N);
    for (let j = 0; j < 4 * N; j++) r1[j] = b[1 % b.length] ^ ((j % 2) & b[0]);
    R.push(r1);
    for (let k = 2; k < N; k++) {
      const rk = new Uint8Array(4 * N);
      rk[0] = b[k % b.length];
      for (let i = 0; i + 1 < 4 * N; i++) rk[i + 1] = rk[i] ^ (R[k - 1][i + 1] | R[k - 2][i + 2]);
      R.push(rk);
    }
    // periods from the slow tower, on a window; compare with the fast one
    const t = tower(b, N, 1 << 20);
    for (let k = 0; k < Math.min(N - 4, t.periods.length); k++) {
      const q = t.periods[k];
      if (q > 2 * N) continue;
      for (let j = 0; j + q < 2 * N; j++) { tested++; if (R[k][j] !== R[k][j + q]) bad++; }
    }
  }
  console.log(`  fast periods are periods of the slow tower: ${bad}/${tested} violations`);
}

// ------------------------------------------------- which towers cycle, p <= 10
console.log('');
console.log('=== which boundaries have a cycling tower? (period cap ' + LMAX + ', depth cap ' + KMAX + ') ===');
console.log(' p    #words   cycling   fraction   (also: column 1 eventually periodic at T=6000)');
const T1 = 6000;
function col1Periodic(b) {
  const c = col1(b, T1);
  const half = T1 >> 1;
  for (let q = 1; q <= 600; q++) {
    let ok = true;
    for (let t = half; t + q < T1; t++) if (c[t + q] !== c[t]) { ok = false; break; }
    if (ok) return q;
  }
  return 0;
}
const cycSet = new Map();
for (let p = 1; p <= 10; p++) {
  let n_cyc = 0, n_c1 = 0, disagree = [];
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const t = tower(b);
    const c = col1Periodic(b);
    const cyc = t.status === 'cycle';
    if (cyc) n_cyc++;
    if (c > 0) n_c1++;
    if (cyc !== (c > 0)) disagree.push([b.join(''), t.status, c, t.Q]);
    cycSet.set(b.join(''), cyc);
  }
  console.log(` ${String(p).padEnd(4)} ${String(1 << p).padEnd(8)} ${String(n_cyc).padEnd(9)} ${(n_cyc / (1 << p)).toFixed(3)}      col1 e.p.: ${n_c1}${disagree.length ? '   DISAGREEMENTS: ' + disagree.slice(0, 8).map((d) => d[0] + '(' + d[1] + ',c1q=' + d[2] + ')').join(' ') : ''}`);
}

console.log('');
console.log('=== cycling towers at p <= 8, with their tower period Q and max diagonal period ===');
for (let p = 1; p <= 8; p++) {
  const out = [];
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const t = tower(b);
    if (t.status === 'cycle') out.push(`${b.join('')}(K${t.K},Q${t.Q},L${t.maxPeriod})`);
  }
  console.log(`p=${p} (${out.length}): ${out.join(' ')}`);
}
