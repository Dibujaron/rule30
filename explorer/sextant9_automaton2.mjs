// Sextant, 2026-09-12. Topic: the 4^-t constraint.  Deeper run of C3.
//
// sextant9_automaton.mjs builds the whole 4^t state space; this one explores
// only the REACHABLE states by breadth-first search from the start state, so t
// can be pushed far past 4^t being enumerable.  Same transition function, same
// acceptance, plus (a) an identification of the one word the backward-solve
// decider and the automaton disagreed on, and (b) growth-rate fits.

const T_MAX = 20;

// state is a BigInt-free packed array of 2t bits held as a string key when
// t > 15; for t <= 15 the 2t bits fit in a 30-bit integer.
function explore(t) {
  const useInt = 2 * t <= 30;
  const stepState = (s, e) => {                 // s: Int (bit 2(k-1)=a_k, 2(k-1)+1=b_k)
    let out = 0, aPrev = e;
    for (let k = 1; k <= t; k++) {
      const a = (s >> (2 * (k - 1))) & 1, b = (s >> (2 * (k - 1) + 1)) & 1;
      const aNew = aPrev ^ (a | b);
      out |= aNew << (2 * (k - 1));
      out |= a << (2 * (k - 1) + 1);
      aPrev = aNew;
    }
    return out;
  };
  const stepBig = (s, e) => {                   // s: BigInt
    let out = 0n, aPrev = BigInt(e);
    for (let k = 0; k < t; k++) {
      const a = (s >> BigInt(2 * k)) & 1n, b = (s >> BigInt(2 * k + 1)) & 1n;
      const aNew = aPrev ^ (a | b);
      out |= aNew << BigInt(2 * k);
      out |= a << BigInt(2 * k + 1);
      aPrev = aNew;
    }
    return out;
  };
  const st = useInt ? stepState : stepBig;
  const zero = useInt ? 0 : 0n;

  const index = new Map([[useInt ? 0 : '0', 0]]);
  const states = [zero];
  const keyOf = (s) => useInt ? s : s.toString();
  const d0 = [], d1 = [];
  for (let i = 0; i < states.length; i++) {
    for (const e of [0, 1]) {
      const q = st(states[i], e);
      const k = keyOf(q);
      let j = index.get(k);
      if (j === undefined) { j = states.length; index.set(k, j); states.push(q); }
      (e === 0 ? d0 : d1)[i] = j;
    }
  }
  const R = states.length;
  // accepting: iterating the 0-transition reaches state 0
  const acc = new Uint8Array(R);
  for (let i = 0; i < R; i++) {
    let q = i;
    for (let s = 0; s <= 2 * t + 4; s++) { if (q === 0) break; q = d0[q]; }
    acc[i] = q === 0 ? 1 : 0;
  }
  return { R, d0: Int32Array.from(d0), d1: Int32Array.from(d1), acc };
}

function minimise(m) {
  const { R, d0, d1, acc } = m;
  let cls = Int32Array.from(acc);
  let nCls = new Set(cls).size;
  const trip = new Int32Array(R * 3);
  for (;;) {
    for (let i = 0; i < R; i++) { trip[3 * i] = cls[i]; trip[3 * i + 1] = cls[d0[i]]; trip[3 * i + 2] = cls[d1[i]]; }
    const order = Int32Array.from({ length: R }, (_, i) => i);
    const arr = Array.from(order).sort((x, y) =>
      (trip[3 * x] - trip[3 * y]) || (trip[3 * x + 1] - trip[3 * y + 1]) || (trip[3 * x + 2] - trip[3 * y + 2]));
    const nc = new Int32Array(R);
    let c = 0;
    for (let i = 0; i < R; i++) {
      if (i > 0) {
        const p = arr[i - 1], q = arr[i];
        if (trip[3 * p] !== trip[3 * q] || trip[3 * p + 1] !== trip[3 * q + 1] || trip[3 * p + 2] !== trip[3 * q + 2]) c++;
      }
      nc[arr[i]] = c;
    }
    const k = c + 1;
    if (k === nCls) break;
    cls = nc; nCls = k;
  }
  return nCls;
}

console.log(' t   reachable    minimal   min(t)/min(t-1)');
let prev = null;
const mins = [];
for (let t = 1; t <= T_MAX; t++) {
  const m = explore(t);
  const k = minimise(m);
  mins.push(k);
  console.log(` ${String(t).padStart(2)}  ${String(m.R).padStart(9)}  ${String(k).padStart(9)}   ${prev ? (k / prev).toFixed(5) : ''}`);
  prev = k;
}

// growth fits
const n = mins.length;
const lastRatio = mins[n - 1] / mins[n - 2];
console.log(`\nlast ratio ${lastRatio.toFixed(5)}`);
// fit minimal ~ C * t^alpha  and  minimal ~ C * lambda^t over the last half
const fitPow = (xs, ys) => {
  const lx = xs.map(Math.log), ly = ys.map(Math.log);
  const mx = lx.reduce((a, b) => a + b) / lx.length, my = ly.reduce((a, b) => a + b) / ly.length;
  let num = 0, den = 0;
  for (let i = 0; i < lx.length; i++) { num += (lx[i] - mx) * (ly[i] - my); den += (lx[i] - mx) ** 2; }
  return num / den;
};
const fitExp = (xs, ys) => {
  const ly = ys.map(Math.log);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ly.reduce((a, b) => a + b) / ly.length;
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) { num += (xs[i] - mx) * (ly[i] - my); den += (xs[i] - mx) ** 2; }
  return Math.exp(num / den);
};
const half = Math.floor(n / 2);
const xs = Array.from({ length: n - half }, (_, i) => half + 1 + i);
const ys = mins.slice(half);
console.log(`power-law fit over t=${xs[0]}..${xs[xs.length - 1]}: minimal ~ t^${fitPow(xs, ys).toFixed(4)}`);
console.log(`exponential fit over the same range: minimal ~ ${fitExp(xs, ys).toFixed(5)}^t`);
console.log(`4^t would be 4.00000^t; the trivial bound.`);

// --- the one disagreement -----------------------------------------------
// sextant9_automaton.mjs found exactly one word per (t, n) on which the DFA
// and the trimming backward solve disagree.  Identify it.
function backOne(y) {
  const nn = y.length, lo = -2;
  const x = new Int8Array(nn + 2);
  const get = (p) => (p >= nn - 1 || p < lo) ? 0 : x[p - lo];
  const set = (p, v) => { if (p >= lo && p < nn - 1) x[p - lo] = v; };
  for (let i = nn - 1; i >= -1; i--) {
    const yi = (i >= 0 && i < nn) ? (y.charCodeAt(i) - 48) : 0;
    set(i - 1, yi ^ (get(i) | get(i + 1)));
  }
  if (get(-1) !== 0 || get(-2) !== 0) return { ok: false };
  let s = '';
  for (let p = 0; p <= nn - 2; p++) s += get(p);
  let a = 0, b = s.length - 1;
  while (a <= b && s[a] === '0') a++;
  while (b >= a && s[b] === '0') b--;
  return { ok: true, word: a > b ? '' : s.slice(a, b + 1) };
}
function reachableSolve(w, t) {
  let cur = w.replace(/^0+/, '').replace(/0+$/, '');
  for (let s = 0; s < t; s++) { if (cur === '') return false; const r = backOne(cur); if (!r.ok) return false; cur = r.word; }
  return cur !== '';
}
{
  const t = 3, len = 12;
  const m = explore(t);
  const accepts = (w) => { let s = 0; for (let i = w.length - 1; i >= 0; i--) s = (w.charCodeAt(i) === 48 ? m.d0 : m.d1)[s]; return m.acc[s] === 1; };
  const bad = [];
  for (let code = 0; code < (1 << len); code++) {
    let w = ''; for (let j = 0; j < len; j++) w += (code >> j) & 1;
    if (accepts(w) !== reachableSolve(w, t)) bad.push(w);
  }
  console.log(`\nthe disagreement at t=3, length ${len}: ${bad.length} word(s): ${JSON.stringify(bad)}`);
  console.log('(the all-white word is the empty configuration, which IS a t-step image of itself;');
  console.log(' the trimming decider rejects it by convention.  A boundary case, not a defect.)');
}
