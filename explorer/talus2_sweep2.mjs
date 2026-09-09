// Talus, 2026-09-08. The classification sweep, redone with the instrument that
// actually works.
//
// The T = 3000 sweep of the earlier session produced BOTH false positives (a
// spurious period in a short tail) and false negatives (a real period whose
// onset was past half the run: 011000001 settles only at time ~125,000).
// So: run deeper, and decide by FACTOR COUNTS rather than by a lag scan.
//
// For the tail u of v = column 1 restricted to the white times of b: if the
// number of distinct factors of length 32 equals the number at length 128, the
// tail is purely periodic with that many states (Morse-Hedlund / crystal 21,
// finite form: P(n) = P(n+1) forces the Rauzy graph to be a union of cycles).
// If the two counts differ, the tail is NOT purely periodic, and any eventual
// period of v has onset inside the tail or exceeds P(128).
//
// Three verdicts, and the third is honest ignorance:
//   GOOD       tail purely periodic, and an explicit period + onset confirmed
//   BAD        factor counts large and growing (>= 200 at length 32)
//   UNDECIDED  low but growing counts: quasi-periodic, or an onset past the run

const T = 30000;
const PMAX = 8;

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

function classify(b, T) {
  const p = b.length;
  const c1 = col1(b, T);
  const v = [];
  for (let t = 0; t < T; t++) if (b[t % p] === 0) v.push(c1[t]);
  if (v.length === 0) return { verdict: 'GOOD', q: 0, onset: 0, note: 'b all black' };
  const M = Math.max(64, v.length >> 2);
  const start = v.length - M;
  const count = (n) => {
    const st = new Set();
    for (let i = start; i + n <= v.length; i++) { let h = ''; for (let j = 0; j < n; j++) h += v[i + j]; st.add(h); }
    return st.size;
  };
  const f32 = count(32), f128 = count(128);
  if (f32 === f128 && f32 <= M / 4) {
    // confirm with an explicit period, and find the onset over the whole of v
    let q = 0;
    for (let cand = 1; cand <= f32 && !q; cand++) {
      let ok = true;
      for (let i = start; i + cand < v.length; i++) if (v[i + cand] !== v[i]) { ok = false; break; }
      if (ok) q = cand;
    }
    if (!q) return { verdict: 'UNDECIDED', q: 0, onset: -1, note: `f32=f128=${f32} but no period found` };
    let onset = 0;
    for (let i = start - 1; i >= 0; i--) if (v[i + q] !== v[i]) { onset = i + 1; break; }
    return { verdict: 'GOOD', q, onset, note: '' };
  }
  if (f32 >= 200) return { verdict: 'BAD', q: 0, onset: -1, note: `f32=${f32} f128=${f128}` };
  return { verdict: 'UNDECIDED', q: 0, onset: -1, note: `f32=${f32} f128=${f128}` };
}

function bits(n, p) { const a = []; for (let i = 0; i < p; i++) a.push((n >> i) & 1); return a; }

console.log(`=== classification at T = ${T}, decided by factor counts ===`);
console.log('');
console.log(' p    #words   GOOD   BAD    UNDECIDED');
const results = new Map();
for (let p = 1; p <= PMAX; p++) {
  let g = 0, bd = 0, u = 0;
  const m = new Map();
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    const r = classify(b, T);
    m.set(b.join(''), r);
    if (r.verdict === 'GOOD') g++; else if (r.verdict === 'BAD') bd++; else u++;
  }
  results.set(p, m);
  console.log(` ${String(p).padEnd(4)} ${String(1 << p).padEnd(8)} ${String(g).padEnd(6)} ${String(bd).padEnd(6)} ${u}`);
}

console.log('');
console.log('=== GOOD words, with the period and onset of the white-time restriction ===');
for (let p = 1; p <= PMAX; p++) {
  const l = [];
  for (const [w, r] of results.get(p)) if (r.verdict === 'GOOD') l.push(`${w}(q${r.q},N${r.onset})`);
  console.log(`p=${p} (${l.length}): ${l.join(' ')}`);
}

console.log('');
console.log('=== UNDECIDED words (need a deeper run) ===');
for (let p = 1; p <= PMAX; p++) {
  const l = [];
  for (const [w, r] of results.get(p)) if (r.verdict === 'UNDECIDED') l.push(`${w}[${r.note}]`);
  if (l.length) console.log(`p=${p} (${l.length}): ${l.join(' ')}`);
}

console.log('');
console.log('=== rotation classes: is the verdict constant on each class? ===');
let split = 0, checked = 0;
for (let p = 1; p <= PMAX; p++) {
  const m = results.get(p);
  const seen = new Set();
  for (let n = 0; n < (1 << p); n++) {
    const b = bits(n, p);
    if (seen.has(b.join(''))) continue;
    const cls = [];
    let cur = b;
    for (let i = 0; i < p; i++) { cls.push(cur.join('')); seen.add(cur.join('')); cur = cur.slice(1).concat(cur.slice(0, 1)); }
    checked++;
    const vs = cls.map((w) => m.get(w).verdict);
    const hasG = vs.includes('GOOD'), hasB = vs.includes('BAD');
    if (hasG && hasB) {
      split++;
      console.log(`  p=${p} SPLIT good=${cls.filter((w) => m.get(w).verdict === 'GOOD').join(',')} bad=${cls.filter((w) => m.get(w).verdict === 'BAD').join(',')} undecided=${cls.filter((w) => m.get(w).verdict === 'UNDECIDED').join(',')}`);
    }
  }
}
console.log(`classes checked: ${checked}; classes with a GOOD member and a BAD member: ${split}`);
