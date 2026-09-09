// Talus, 2026-09-08. Is the rotation counterexample a REALIZABILITY failure?
//
// Three rotations of 1001101000 are good, so by C2 the left half of each X_b is
// a rule 30 ring whose orbit has cycle length 10 and whose position-0 trace is
// b. Reading that same orbit four steps later gives the trace sigma^4 b =
// 1010001001. So if the ring is there, 1010001001 IS the centre column of a
// space-time periodic configuration -- realizably good -- while X_{1010001001},
// the one configuration in the family with a white right half, does not follow
// it. That would make the rotation counterexample exactly a failure of the
// realizability half of C2, not a new phenomenon.

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
  w[0] = c0[t0]; w[1] = cur[t0];
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

function ringStep(w) {
  const n = w.length, o = new Uint8Array(n);
  for (let k = 0; k < n; k++) o[k] = w[(k + 1) % n] ^ (w[k] | w[(k - 1 + n) % n]);
  return o;
}

for (const [s, t0] of [['0011010001', 30000], ['0110100010', 30000], ['1101000100', 30000]]) {
  const b = s.split('').map(Number);
  const K = 4000;
  const w = leftRow(b, t0, K);
  const [n, onset] = leastSpatialPeriod(w, K >> 1, 1200);
  if (n === 0) { console.log(`${s}: no spatial period <= 1200 at t=${t0}`); continue; }
  const rho = w.slice(onset, onset + n);
  // cycle length of this ring orbit
  let x = rho, L = 0;
  for (let i = 1; i <= 4000; i++) { x = ringStep(x); if (x.join('') === rho.join('')) { L = i; break; } }
  // the trace at position 0 over L steps, and its time-rotations
  const orbit = [];
  let y = rho;
  for (let i = 0; i < (L || 10); i++) { orbit.push(y[0]); y = ringStep(y); }
  const tr = orbit.join('');
  const rots = [];
  for (let r = 0; r < tr.length; r++) rots.push(tr.slice(r) + tr.slice(0, r));
  console.log(
    `${s}  spatial n=${n} onset=${onset}  ring cycle L=${L}  trace=${tr}  b matches trace: ${tr === s}  ` +
    `1010001001 among the time-rotations of the trace: ${rots.includes('1010001001')}`
  );
}
