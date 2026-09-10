/**
 * Talus, 2026-09-10. P2 attack: the excess, the runs, and the sparse cuts.
 *
 * Reads the centre column produced by talus7_deep.mjs (10^7 terms) if it is
 * there, otherwise talus7_center.mjs's 2*10^5. Everything is reported beside a
 * fair-coin null of the same length, because every claim in this topic has to
 * be FALSE for some Bool sequence to be worth anything, and the null is what
 * says whether it is.
 *
 * Three things measured:
 *  (a) the excess E(N) = 2*count(N) - N: extremes, sign changes, decades;
 *  (b) the run-length distribution of the centre column, both colours, with
 *      the longest run and its position, against the geometric null;
 *  (c) the excess read at the sparse sets rule 30 supplies -- the period
 *      doubling depths, the eventually-white left diagonals, the powers of
 *      two -- and, for each, the sharpness d that
 *      centerColumn_density_tendsto_half_of_nearby_cuts would need.
 */

import { readFileSync, existsSync } from 'node:fs';

const DEEP = new URL('./talus7_center10m.bin', import.meta.url);
const SHALLOW = new URL('./talus7_center.bin', import.meta.url);
const path = existsSync(DEEP) ? DEEP : SHALLOW;
const bits = new Uint8Array(readFileSync(path));
const N = bits.length;
console.log(`centre column: ${N} terms from ${path.pathname.split('/').pop()}`);

function xs(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x; };
}
function coin(n, seed) {
  const g = xs(seed);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i += 32) {
    let w = g();
    for (let j = 0; j < 32 && i + j < n; j++) { out[i + j] = w & 1; w >>>= 1; }
  }
  return out;
}

// ------------------------------------------------------------------ (a) excess
function excessReport(name, b) {
  const n = b.length;
  let E = 0, minE = 0, minAt = 0, maxE = 0, maxAt = 0, firstNeg = -1, signChanges = 0;
  let lastNonPos = -1, timePos = 0;
  let prevSign = 0;
  const prefix = new Int32Array(0);
  const decades = [];
  let nextDecade = 10;
  for (let t = 0; t < n; t++) {
    E += b[t] ? 1 : -1;
    if (E < minE) { minE = E; minAt = t + 1; }
    if (E > maxE) { maxE = E; maxAt = t + 1; }
    if (firstNeg < 0 && E < 0) firstNeg = t + 1;
    if (E <= 0) lastNonPos = t + 1;
    if (E > 0) timePos++;
    const s = Math.sign(E);
    if (s !== 0 && prevSign !== 0 && s !== prevSign) signChanges++;
    if (s !== 0) prevSign = s;
    if (t + 1 === nextDecade) {
      decades.push([nextDecade, E, (E / Math.sqrt(nextDecade)).toFixed(3)]);
      nextDecade *= 10;
    }
  }
  console.log(`\n[excess] ${name}`);
  console.log(`  E(N)=${E}  E/sqrt(N)=${(E / Math.sqrt(n)).toFixed(3)}  ` +
    `min=${minE}@${minAt}  max=${maxE}@${maxAt}  firstNeg=${firstNeg}  signChanges=${signChanges}`);
  console.log(`  last N with E(N) <= 0: ${lastNonPos}   fraction of N with E(N) > 0: ${(timePos / n).toFixed(4)}`);
  console.log('  decades: ' + decades.map(([d, e, r]) => `${d}:${e}(${r}s)`).join(' '));
  void prefix;
}

// -------------------------------------------------------------------- (b) runs
function runReport(name, b) {
  const n = b.length;
  const hist = [new Map(), new Map()]; // hist[colour]: length -> count
  let longest = [0, 0], longestAt = [0, 0];
  let runs = 0;
  let i = 0;
  while (i < n) {
    const c = b[i];
    let j = i;
    while (j < n && b[j] === c) j++;
    const len = j - i;
    // drop the final, possibly truncated, run
    if (j < n) {
      hist[c].set(len, (hist[c].get(len) ?? 0) + 1);
      runs++;
      if (len > longest[c]) { longest[c] = len; longestAt[c] = i; }
    }
    i = j;
  }
  console.log(`\n[runs] ${name}`);
  console.log(`  runs=${runs}  runs/N=${(runs / n).toFixed(5)}  ` +
    `longest white=${longest[0]}@${longestAt[0]}  longest black=${longest[1]}@${longestAt[1]}`);
  for (const c of [0, 1]) {
    const total = [...hist[c].values()].reduce((a, x) => a + x, 0);
    let m1 = 0, m2 = 0;
    for (const [len, k] of hist[c]) { m1 += len * k; m2 += len * len * k; }
    const row = [];
    for (let len = 1; len <= 20; len++) {
      const k = hist[c].get(len) ?? 0;
      row.push(`${len}:${k}`);
    }
    console.log(`  colour ${c}: count=${total} mean=${(m1 / total).toFixed(5)} ` +
      `E[L^2]=${(m2 / total).toFixed(5)} (geometric null: mean 2, E[L^2] 6)`);
    console.log(`    ${row.join(' ')}`);
    // ratio test against the geometric null 2^-len
    const ratios = [];
    for (let len = 1; len <= 12; len++) {
      const k = hist[c].get(len) ?? 0;
      const exp = total * Math.pow(2, -len);
      ratios.push(`${len}:${(k / exp).toFixed(3)}`);
    }
    console.log(`    observed/geometric  ${ratios.join(' ')}`);
  }
}

// ------------------------------------------------------------ (c) sparse cuts
function cutReport(name, b) {
  const n = b.length;
  const pre = new Int32Array(n + 1);
  for (let t = 0; t < n; t++) pre[t + 1] = pre[t] + (b[t] ? 1 : -1);
  const sets = {
    'period doublings (NKS p.871)': [3, 8, 29, 400, 87867],
    'eventually-white left diagonals': [2, 7, 28, 399, 53207, 58286, 87866],
    'powers of two': Array.from({ length: 25 }, (_, i) => 2 ** i).filter((x) => x < n && x > 0),
    'squares': Array.from({ length: 4000 }, (_, i) => (i + 1) * (i + 1)).filter((x) => x < n),
  };
  console.log(`\n[cuts] ${name}`);
  for (const [label, set] of Object.entries(sets)) {
    const ok = set.filter((x) => x <= n);
    if (!ok.length) continue;
    const vals = ok.map((x) => pre[x]);
    const norm = ok.map((x, i) => vals[i] / Math.sqrt(x));
    const maxAbs = Math.max(...norm.map(Math.abs));
    console.log(`  ${label.padEnd(34)} |E|/sqrt(N) max=${maxAbs.toFixed(3)} ` +
      `values=${ok.slice(0, 8).map((x, i) => `${x}:${vals[i]}`).join(' ')}${ok.length > 8 ? ' ...' : ''}`);
  }
}

const seedBits = bits;
const nullBits = coin(N, 0x5eed1234);

excessReport('rule 30 centre column', seedBits);
excessReport('fair coin', nullBits);
runReport('rule 30 centre column', seedBits);
runReport('fair coin', nullBits);
cutReport('rule 30 centre column', seedBits);
cutReport('fair coin', nullBits);

// ---- the lemma's own hypothesis, read against these cut sets ---------------
// centerColumn_density_tendsto_half_of_nearby_cuts needs, for every d, a cut
// M <= N with d*(N-M) <= N for all large N. So the cut set must meet every
// window [N(1-1/d), N]. Report the worst relative gap of each set.
console.log('\n[cut admissibility] largest relative gap (N-M)/N over the set, ' +
  'which must tend to 0 for the localisation lemma to apply');
for (const [label, set] of Object.entries({
  'period doublings': [3, 8, 29, 400, 87867, 2107985255],
  'eventually-white diagonals': [2, 7, 28, 399, 53207, 58286, 87866, 1420878968],
  'powers of two': Array.from({ length: 32 }, (_, i) => 2 ** i).slice(1),
})) {
  let worst = 0, at = 0;
  for (let i = 1; i < set.length; i++) {
    // the worst N is just below set[i]: gap (set[i]-1-set[i-1])/(set[i]-1)
    const g = (set[i] - 1 - set[i - 1]) / (set[i] - 1);
    if (g > worst) { worst = g; at = set[i]; }
  }
  console.log(`  ${label.padEnd(30)} worst (N-M)/N = ${worst.toFixed(5)} just below ${at}` +
    `  => needs d <= ${(1 / worst).toFixed(3)}, lemma needs every d`);
}

// ---- the cut set the lemma would actually need, read off the data ---------
// P2 is equivalent to: for every eps, the set Z(eps) = { M : |E(M)| <= eps*M }
// meets every window [N(1-delta), N] for all large N. So the question "is
// there a sparse rule-30 set of good cuts" has a data answer: how sparse is
// the set of good cuts, measured multiplicatively?
console.log('\n[the cut set the lemma needs] largest relative gap of ' +
  'Z(eps) = { M <= N : |E(M)| <= eps*M }, over the top decade M >= N/10');
for (const [name, b] of [['rule 30', seedBits], ['fair coin', nullBits]]) {
  const n = b.length;
  const pre = new Int32Array(n + 1);
  for (let t = 0; t < n; t++) pre[t + 1] = pre[t] + (b[t] ? 1 : -1);
  for (const eps of [0, 1e-4, 1e-3]) {
    const from = Math.floor(n / 10);
    let last = from, worst = 0, at = 0;
    for (let M = from; M <= n; M++) {
      if (Math.abs(pre[M]) <= eps * M) {
        const g = (M - 1 - last) / (M - 1);
        if (g > worst) { worst = g; at = M; }
        last = M;
      }
    }
    const tail = (n - last) / n;
    console.log(`  ${name.padEnd(10)} eps=${eps}  worst interior gap ${worst.toFixed(4)} ` +
      `(before M=${at}), gap to the end ${tail.toFixed(4)}`);
  }
}
