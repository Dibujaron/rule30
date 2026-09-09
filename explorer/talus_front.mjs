// Talus, 2026-09-08. The pinned damage front, and a re-check of the marginal
// "good" boundaries from talus_class.mjs.
//
// Under a boundary b of period p, compare the half-line picture with itself
// shifted p rows in time: D(t, x) = cell(t, x) xor cell(t + p, x). Column 0 is
// exactly p-periodic by construction, so D(t, 0) = 0 for every t. Column k is
// eventually p-periodic exactly when the front F(t) = min { x >= 1 : D(t,x)=1 }
// stays above k. So the residual, in this family, is the question of whether a
// damage front pinned off the origin is pushed away from it or bounces on it.
//
// Only p + 1 rows are kept at a time, so the run costs no memory in T.

const T = 120000;

function run(b, T, onRow) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    onRow(t, r, Math.min(W, (t >> 5) + 3));
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
}

// front statistics for the shift by q, keeping only q+1 rows
function frontStats(b, q, T, from) {
  const ring = [];
  for (let i = 0; i <= q; i++) ring.push(new Uint32Array(((T + 96) >> 5) + 2));
  const hist = new Map();
  let min = Infinity, max = -1, sum = 0, n = 0;
  run(b, T, (t, r, len) => {
    ring[t % (q + 1)].set(r.subarray(0, len));
    const tp = t - q;
    if (tp < 0) return;
    const a = ring[tp % (q + 1)], c = ring[t % (q + 1)];
    let x = -1;
    for (let i = 0; i < a.length; i++) {
      let d = a[i] ^ c[i];
      if (i === 0) d &= ~1;
      if (d !== 0) { x = (i << 5) + (31 - Math.clz32(d & -d)); break; }
    }
    if (x < 0) x = Infinity;
    if (tp >= from) {
      if (x < min) min = x;
      if (x > max && x !== Infinity) max = x;
      sum += (x === Infinity ? 0 : x); n++;
      const key = x === Infinity ? 'inf' : (x > 12 ? '>12' : x);
      hist.set(key, (hist.get(key) || 0) + 1);
    }
  });
  const top = [...hist.entries()].sort((u, v) => v[1] - u[1]).slice(0, 7);
  return { min, max, mean: sum / n, top, n };
}

console.log(`damage front against the shift by p: T=${T}, statistics over t >= T/2`);
console.log('b            min  max     mean     front value : count');
for (const s of ['10', '110', '1010', '100000', '1000000', '11100110', '1000101111', '1000', '1110', '1000000000']) {
  const b = s.split('').map(Number);
  const st = frontStats(b, b.length, T, T >> 1);
  console.log(
    `${s.padEnd(12)} ${String(st.min).padEnd(4)} ${String(st.max).padEnd(7)} ${st.mean.toFixed(2).padEnd(8)} ${st.top.map(([v, c]) => `${v}:${c}`).join(' ')}`
  );
}

// ------------------------------------- re-check the marginal good boundaries
console.log('');
console.log(`re-check of the "good" boundaries whose onset was a large fraction of T=30000`);
console.log(`now at T=${T}, every lag q <= 5000, agreement required over the last ${T / 2} terms`);
function col1of(b, T) {
  const col = new Uint8Array(T);
  run(b, T, (t, r) => { col[t] = (r[0] >>> 1) & 1; });
  return col;
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
console.log('b            claimed q/onset at T=30000     result at T=' + T);
for (const [s, claim] of [['111011010', '9/7171'], ['110110101', '9/7170'], ['011101101', '9/7172'],
  ['1000100001', '5/11377'], ['1011011101', '10/11055'], ['1001100011', '10/1103'],
  ['0111101010', '10/1090'], ['1111010100', '10/1089']]) {
  const b = s.split('').map(Number);
  const col = col1of(b, T);
  const [q, onset] = leastEventualPeriod(col, T, 5000, T >> 1);
  console.log(`${s.padEnd(12)} ${claim.padEnd(29)} ${q ? `q=${q} onset=${onset}` : 'NOT eventually periodic'}`);
}
