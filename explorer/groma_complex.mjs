// Groma, 2026-09-10.  Factor complexity of the switch-index sequence.
//
// The switch-index sequence j_0 j_1 j_2 ... is one integer per maximal white
// run of the centre column: where in that run column 1 turns black (or the run
// length, if it never does).  For a periodic boundary b the run lengths are
// bounded, so the j's live in a finite alphabet, and Morse-Hedlund applies:
// a sequence over a finite alphabet is eventually periodic iff its factor
// complexity p(n) is eventually constant, equivalently iff p(n) <= n for some n.
//
// This script measures p(n) for
//   (a) the switch-index sequence of X_b, for several b;
//   (b) column 1 of X_b restricted to the white times of b (the bit sequence
//       that obstruction 9's residual is literally about);
//   (c) the seed's own switch-index sequence, whose alphabet is not bounded;
//   (d) the seed's centre column, as the control with known near-maximal
//       complexity.
//
// The question the numbers answer: is p(n) linear (which would put the
// sequence in a structure class -- quasi-Sturmian, hence a rotation coding)
// or exponential with a small rate (which puts it in no class at all and
// makes a small count at n = 32 a measurement of the window, not the object)?

const T = Number(process.env.GROMA_T ?? 1000000);
const NMAX = 40;

// ------------------------------------------------------------------ engines
function halflineTrace(b, T) {
  const p = b.length;
  const W = ((T + 96) >> 5) + 2;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T);
  r[0] = b[0] & 1;
  for (let t = 0; t < T; t++) {
    col0[t] = r[0] & 1;
    col1[t] = (r[0] >>> 1) & 1;
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
  return { col0, col1 };
}

function seedTrace(T) {
  const W = ((2 * T + 96) >> 5) + 3;
  let r = new Uint32Array(W), s = new Uint32Array(W);
  const col0 = new Uint8Array(T), col1 = new Uint8Array(T);
  r[0] = 1;
  for (let t = 0; t < T; t++) {
    col0[t] = (r[t >> 5] >>> (t & 31)) & 1;
    col1[t] = (r[(t + 1) >> 5] >>> ((t + 1) & 31)) & 1;
    const last = Math.min(W - 2, ((2 * t) >> 5) + 2);
    for (let i = last; i >= 0; i--) {
      const cur = r[i], prev = i > 0 ? r[i - 1] : 0;
      const l2 = ((cur << 2) | (prev >>> 30)) >>> 0;
      const l1 = ((cur << 1) | (prev >>> 31)) >>> 0;
      s[i] = (l2 ^ (l1 | cur)) >>> 0;
    }
    const tmp = r; r = s; s = tmp;
  }
  return { col0, col1 };
}

// ------------------------------------------------------- derived sequences
// switch indices, and column 1 read at the white times
function derive(col0, col1, T) {
  const j = [], white = [];
  let t = 0;
  while (t < T) {
    if (col0[t] !== 0) { t++; continue; }
    const s0 = t;
    while (t < T && col0[t] === 0) { white.push(col1[t]); t++; }
    if (t >= T) break;
    const L = t - s0;
    let v = L;
    for (let m = 0; m < L; m++) if (col1[s0 + m] === 1) { v = m; break; }
    j.push(v);
  }
  return { j, white };
}

// ------------------------------------------------------- factor complexity
// distinct factors of length n in seq[from..to), counted exactly.
function complexity(seq, from, to, n) {
  const set = new Set();
  const isNum = typeof seq[0] === 'number';
  for (let i = from; i + n <= to; i++) {
    let key = '';
    if (isNum) { for (let k = 0; k < n; k++) key += String.fromCharCode(48 + seq[i + k]); }
    else { for (let k = 0; k < n; k++) key += String.fromCharCode(48 + seq[i + k]); }
    set.add(key);
  }
  return set.size;
}

function profile(name, seq) {
  const N = seq.length;
  if (N < 4000) { console.log(`${name}: only ${N} letters, skipped`); return; }
  const from = N >> 1, to = N; // second half only: skip the transient
  const alph = new Set();
  for (let i = from; i < to; i++) alph.add(seq[i]);
  const ps = [];
  for (let n = 1; n <= NMAX; n++) {
    const c = complexity(seq, from, to, n);
    ps.push(c);
    if (c >= to - from - n) break; // saturated: every window distinct
  }
  // slope of log2 p(n) over the last third of the measured range
  const m = ps.length;
  const a = Math.max(1, m - Math.max(4, m >> 1)), bb = m - 1;
  const slope = bb > a ? (Math.log2(ps[bb]) - Math.log2(ps[a])) / (bb - a) : 0;
  console.log(
    `${name.padEnd(34)} len=${String(to - from).padEnd(8)} |A|=${String(alph.size).padEnd(3)} ` +
    `p(1..${m})=${ps.slice(0, Math.min(m, 24)).join(',')}${m > 24 ? ',...' : ''}`
  );
  console.log(
    `${''.padEnd(34)} p(8)=${ps[7] ?? '-'} p(16)=${ps[15] ?? '-'} p(24)=${ps[23] ?? '-'} ` +
    `p(32)=${ps[31] ?? '-'} p(40)=${ps[39] ?? '-'}  log2 p slope over n=${a + 1}..${bb + 1}: ${slope.toFixed(4)} bits/letter` +
    (ps[m - 1] >= to - from - m ? '  [SATURATED]' : '')
  );
}

// ===================================================================== run
console.log(`factor complexity of switch-index sequences, T = ${T} rows`);
console.log('');

const bs = ['10', '01011', '1000', '10010', '1010001001', '100000000'];
for (const str of bs) {
  const b = [...str].map((c) => (c === '1' ? 1 : 0));
  const t0 = Date.now();
  const { col0, col1 } = halflineTrace(b, T);
  const { j, white } = derive(col0, col1, T);
  console.log(`--- b = ${str}   (${j.length} runs, ${white.length} white times, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  profile(`  switch index of X_${str}`, j);
  profile(`  col1 at white times of ${str}`, white);
}

console.log('');
{
  const t0 = Date.now();
  const { col0, col1 } = seedTrace(T);
  const { j, white } = derive(col0, col1, T);
  console.log(`--- the seed   (${j.length} runs, ${white.length} white times, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  profile('  switch index of the seed', j);
  profile('  col1 at white times of seed', white);
  profile('  centre column (control)', Array.from(col0));
}
