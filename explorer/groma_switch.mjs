// Groma, 2026-09-10.  Connector sighting: the switch-index sequence.
//
// Obstruction 9 + white_run_monotone: inside one maximal white run of the
// centre column, column 1 switches white->black at most once, so each run
// carries one integer -- the switch index j -- rather than a word.
//
// This script builds the switch-index sequence for X_b (the configuration
// white at every x >= 1 at time 0 whose centre column is the chosen boundary
// b) and for the single seed, and tests one structural identity:
//
//   CLAIM.  j_i = min(L_i, g(s_i) - 1), where s_i is the first time of white
//   run i, L_i is the run's length, and g(t) = min { x >= 1 : cell(t,x) = 1 }
//   is the position of the leftmost black cell strictly right of the origin.
//
//   Reason (a bearing, not a proof): while the centre is white the left
//   neighbour of the leftmost black in x >= 1 is white, and rule 30 sends a
//   black cell one place left per row into white, so the leftmost black walks
//   left at speed exactly 1 and reaches column 1 after g - 1 rows.
//
// Engine: bit-packed row.  For X_b, bit index = x.  For the seed, bit index =
// x + t (the board's rowNat packing), so the step is (4r) ^ ((2r) | r).
// Both are cross-checked against a naive cell-by-cell simulation first.

// --------------------------------------------------------------- engines

// X_b: row 0 is white everywhere except position 0, pinned to b at every step.
function halflineTrace(b, T, GCAP) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const col0 = new Uint8Array(T);
  const col1 = new Uint8Array(T);
  const gap = new Int32Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col0[t] = r[0] & 1;
    col1[t] = (r[0] >>> 1) & 1;
    let g = -1;
    const wlast = Math.min(W - 1, (t >> 5) + 1);
    for (let i = 0; i <= wlast; i++) {
      let v = r[i];
      if (i === 0) v &= ~1;
      if (v !== 0) { g = (i << 5) + (31 - Math.clz32(v & -v)); break; }
      if ((i << 5) > GCAP) break;
    }
    gap[t] = g;
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
  return { col0, col1, gap };
}

// The single seed, bit index x + t: cell(t+1,x) is bit x+t+1 = B, and it reads
// old bits B-2, B-1, B.  So the whole-row step is (4r) ^ ((2r) | r).
function seedTrace(T, GCAP) {
  const W = ((2 * T + 96) >> 5) + 3;
  let r = new Uint32Array(W);
  let s = new Uint32Array(W);
  const col0 = new Uint8Array(T);
  const col1 = new Uint8Array(T);
  const gap = new Int32Array(T);
  r[0] = 1;
  for (let t = 0; t < T; t++) {
    const b0 = t, b1 = t + 1;
    col0[t] = (r[b0 >> 5] >>> (b0 & 31)) & 1;
    col1[t] = (r[b1 >> 5] >>> (b1 & 31)) & 1;
    let g = -1;
    const i0 = b1 >> 5;
    const mask = (0xffffffff << (b1 & 31)) >>> 0;
    const wlast = Math.min(W - 1, ((2 * t) >> 5) + 1);
    for (let i = i0; i <= wlast; i++) {
      const v = (i === i0 ? r[i] & mask : r[i]) >>> 0;
      if (v !== 0) { g = (i << 5) + (31 - Math.clz32(v & -v)) - t; break; }
      if ((i << 5) - b1 > GCAP) break;
    }
    gap[t] = g;
    const last = Math.min(W - 2, ((2 * t) >> 5) + 2);
    for (let i = last; i >= 0; i--) {
      const cur = r[i];
      const prev = i > 0 ? r[i - 1] : 0;
      const l2 = ((cur << 2) | (prev >>> 30)) >>> 0;   // 4r
      const l1 = ((cur << 1) | (prev >>> 31)) >>> 0;   // 2r
      s[i] = (l2 ^ (l1 | cur)) >>> 0;
    }
    const tmp = r; r = s; s = tmp;
  }
  return { col0, col1, gap };
}

// -------------------------------------------------- naive cross-check engine
// Plain cell-by-cell rule 30 on an offset array, no packing, no reuse.
function naiveSeed(T) {
  const N = 2 * T + 5;
  let row = new Uint8Array(N);
  let nxt = new Uint8Array(N);
  const O = T + 2; // index of x = 0
  row[O] = 1;
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T), gap = new Int32Array(T);
  for (let t = 0; t < T; t++) {
    col0[t] = row[O]; col1[t] = row[O + 1];
    let g = -1;
    for (let x = 1; x <= T + 1; x++) if (row[O + x]) { g = x; break; }
    gap[t] = g;
    for (let i = 1; i < N - 1; i++) nxt[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    nxt[0] = 0; nxt[N - 1] = 0;
    const tmp = row; row = nxt; nxt = tmp;
  }
  return { col0, col1, gap };
}

function naiveHalfline(b, T) {
  const p = b.length;
  const N = T + 5;
  let row = new Uint8Array(N);
  let nxt = new Uint8Array(N);
  row[0] = b[0] & 1;
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T), gap = new Int32Array(T);
  for (let t = 0; t < T; t++) {
    col0[t] = row[0]; col1[t] = row[1];
    let g = -1;
    for (let x = 1; x < N - 1; x++) if (row[x]) { g = x; break; }
    gap[t] = g;
    for (let i = 1; i < N - 1; i++) nxt[i] = row[i - 1] ^ (row[i] | row[i + 1]);
    nxt[N - 1] = 0;
    nxt[0] = b[(t + 1) % p] & 1;
    const tmp = row; row = nxt; nxt = tmp;
  }
  return { col0, col1, gap };
}

// ------------------------------------------------- runs and switch indices

function switchIndices(col0, col1, T) {
  const runs = [];
  let monoFail = 0;
  let t = 0;
  while (t < T) {
    if (col0[t] !== 0) { t++; continue; }
    const s0 = t;
    while (t < T && col0[t] === 0) t++;
    const L = t - s0;
    if (t >= T) break; // truncated final run: drop it
    let j = L;
    for (let m = 0; m < L; m++) if (col1[s0 + m] === 1) { j = m; break; }
    for (let m = 0; m < L; m++) {
      const want = m >= j ? 1 : 0;
      if (col1[s0 + m] !== want) { monoFail++; break; }
    }
    runs.push({ s: s0, L, j });
  }
  return { runs, monoFail };
}

function bitsOf(str) { return [...str].map((c) => (c === '1' ? 1 : 0)); }

function checkIdentity(name, tr, T) {
  const { col0, col1, gap } = tr;
  const { runs, monoFail } = switchIndices(col0, col1, T);
  let idFail = 0, idChecked = 0, gapUnknown = 0;
  const firstFails = [];
  for (const rn of runs) {
    const g = gap[rn.s];
    if (g < 0) { gapUnknown++; continue; }
    idChecked++;
    const pred = Math.min(rn.L, g - 1);
    if (pred !== rn.j) {
      idFail++;
      if (firstFails.length < 5) firstFails.push(`t=${rn.s} L=${rn.L} j=${rn.j} g=${g} pred=${pred}`);
    }
  }
  const alpha = new Set(runs.map((r) => r.j));
  const lens = new Set(runs.map((r) => r.L));
  console.log(
    `${name.padEnd(22)} runs=${String(runs.length).padEnd(8)} monoFail=${String(monoFail).padEnd(6)} ` +
    `idFail=${idFail}/${idChecked} gapUncapped=${gapUnknown} ` +
    `Lmax=${lens.size ? Math.max(...lens) : '-'} |alph|=${alpha.size} jmax=${alpha.size ? Math.max(...alpha) : '-'}`
  );
  if (firstFails.length) for (const f of firstFails) console.log('    ' + f);
  return runs;
}

// ================================================================== run

// 0. engine validation against the naive simulation
{
  const Tv = 900;
  let bad = 0;
  const a = seedTrace(Tv, 1 << 20), n = naiveSeed(Tv);
  for (let t = 0; t < Tv; t++) {
    if (a.col0[t] !== n.col0[t] || a.col1[t] !== n.col1[t] || a.gap[t] !== n.gap[t]) bad++;
  }
  let bad2 = 0, cells2 = 0;
  for (const bs of ['10', '1000', '1010001001', '0000000001']) {
    const b = bitsOf(bs);
    const p = halflineTrace(b, Tv, 1 << 20), q = naiveHalfline(b, Tv);
    for (let t = 0; t < Tv; t++) {
      cells2 += 3;
      if (p.col0[t] !== q.col0[t]) bad2++;
      if (p.col1[t] !== q.col1[t]) bad2++;
      if (p.gap[t] !== q.gap[t]) bad2++;
    }
  }
  console.log(`engine check vs naive: seed ${bad}/${3 * Tv} mismatches, X_b ${bad2}/${cells2} mismatches`);
  console.log(`seed centre column, first 24: ${[...n.col0.slice(0, 24)].join('')}`);
  console.log('');
}

// 1. the identity, on X_b and on the seed
{
  const T = 60000, GCAP = 1 << 20;
  console.log(`identity j = min(L, g-1) and white_run_monotone, T=${T}`);
  const boundaries = [
    '10', '1000', '1', '01011', '01101', '10101', '10110', '11010',
    '11111110', '1010001001', '1111010000', '100000000', '1010000111',
    '110', '10010', '1001101000', '0000000001', '11011',
  ];
  for (const bs of boundaries) checkIdentity(`X_${bs}`, halflineTrace(bitsOf(bs), T, GCAP), T);
  console.log('');
}

// 2. the seed's own runs, gaps and alphabet growth
{
  const T = 400000, GCAP = 1 << 20;
  const st = seedTrace(T, GCAP);
  const runs = checkIdentity('seed', st, T);
  const hl = new Map(), hj = new Map();
  for (const r of runs) {
    hl.set(r.L, (hl.get(r.L) ?? 0) + 1);
    hj.set(r.j, (hj.get(r.j) ?? 0) + 1);
  }
  const fmt = (m) => [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log('seed run lengths:', fmt(hl));
  console.log('seed switch idx :', fmt(hj));
  let mx = -1;
  const marks = [];
  for (let i = 0; i < runs.length; i++) if (runs[i].j > mx) { mx = runs[i].j; marks.push(`${mx}@i=${i},t=${runs[i].s}`); }
  console.log('seed alphabet growth (new max switch index):', marks.join(' '));
}
