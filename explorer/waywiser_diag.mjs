/**
 * Diagnostics for waywiser_onset.mjs: print (k, minimal eventual period,
 * onset) for a window of diagonals, the running maximum of the period, and
 * the diagonals whose onset jumps.
 *
 *   node explorer/waywiser_diag.mjs
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const K_MAX = 2000;
const TAIL_CYCLES = 8;
const MARGIN = 1200;
const T_MAX = Math.ceil(1.6 * K_MAX) + MARGIN + 4;
const WORDS = ((2 * T_MAX + 8) >> 5) + 4;

function stepPacked(src, dst, words) {
  let c1 = 0, c2 = 0;
  for (let i = 0; i < words; i++) {
    const w = src[i];
    const s1 = ((w << 1) | c1) >>> 0;
    const s2 = ((w << 2) | c2) >>> 0;
    c1 = w >>> 31; c2 = w >>> 30;
    dst[i] = (s2 ^ (s1 | w)) >>> 0;
  }
}

const PS = [1, 2, 4, 8, 16, 32, 64];
const lastBreak = new Int32Array((K_MAX + 1) * PS.length).fill(-1);
const maxJ = new Int32Array(K_MAX + 1).fill(-1);
const hist = new Uint32Array(K_MAX + 1);
const histHi = new Uint32Array(K_MAX + 1);
const tail = [];
for (let k = 0; k <= K_MAX; k++) tail.push([]);

let cur = new Uint32Array(WORDS), nxt = new Uint32Array(WORDS);
cur[0] = 1;
const until = (k) => Math.floor(0.6 * k) + MARGIN;

for (let t = 0; t <= T_MAX; t++) {
  for (let k = 0; k <= Math.min(K_MAX, t); k++) {
    const j = t - k;
    if (j > until(k)) continue;
    const v = (cur[k >>> 5] >>> (k & 31)) & 1;
    for (let i = 0; i < PS.length; i++) {
      const p = PS[i];
      if (j >= p) {
        const prev = p <= 32 ? (hist[k] >>> (p - 1)) & 1 : (histHi[k] >>> (p - 33)) & 1;
        if (prev !== v) lastBreak[k * PS.length + i] = j;
      }
    }
    histHi[k] = ((histHi[k] << 1) | (hist[k] >>> 31)) >>> 0;
    hist[k] = ((hist[k] << 1) | v) >>> 0;
    if (j > until(k) - 80) tail[k].push(v);
    maxJ[k] = j;
  }
  stepPacked(cur, nxt, WORDS);
  const tm = cur; cur = nxt; nxt = tm;
}

const onset = new Int32Array(K_MAX + 1).fill(-1);
const period = new Int32Array(K_MAX + 1).fill(-1);
for (let k = 0; k <= K_MAX; k++) {
  for (let i = 0; i < PS.length; i++) {
    const p = PS[i];
    const lb = lastBreak[k * PS.length + i];
    const N = lb < 0 ? 0 : lb - p + 1;
    if (maxJ[k] - N >= TAIL_CYCLES * p) { onset[k] = N; period[k] = p; break; }
  }
}

console.log('k, period, onset, onset/k for k <= 40 and around the published doublings');
const show = [];
for (let k = 0; k <= 40; k++) show.push(k);
for (const k of [27, 28, 29, 30, 31, 397, 398, 399, 400, 401, 402, 403]) if (!show.includes(k)) show.push(k);
show.sort((a, b) => a - b);
for (const k of show) console.log(`  k=${String(k).padStart(4)}  P=${String(period[k]).padStart(3)}  o=${String(onset[k]).padStart(5)}  o/k=${(onset[k] / Math.max(k, 1)).toFixed(3)}  tail=${tail[k].slice(0, 40).join('')}`);

let run = 0;
const runSteps = [];
for (let k = 0; k <= K_MAX; k++) { if (period[k] > run) { run = period[k]; runSteps.push(`${k}->${run}`); } }
console.log(`running max of the minimal period: ${runSteps.join(', ')}`);

const drops = [];
for (let k = 1; k <= K_MAX; k++) if (period[k] < period[k - 1]) drops.push(k);
console.log(`diagonals whose minimal period is smaller than their predecessor's: ${drops.length} of ${K_MAX} (first 20: ${drops.slice(0, 20).join(', ')})`);

const jumps = [];
for (let k = 1; k <= K_MAX; k++) if (Math.abs(onset[k] - onset[k - 1]) > 40) jumps.push(`${k}:${onset[k - 1]}->${onset[k]} (P ${period[k - 1]}->${period[k]})`);
console.log(`onset jumps over 40: ${jumps.length}; first 12: ${jumps.slice(0, 12).join('  ')}`);
