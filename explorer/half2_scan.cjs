/**
 * The same exhaustive scan as half2_enum.cjs but fast enough to go wide: dedupe
 * attractors by a cheap key first, run the DP only on distinct backgrounds.
 *
 *   node explorer/half2_scan.cjs [maxN] [--pow2|--all] [--sampleN=32] [--trials=2000000]
 *
 * --all drops the power-of-two row-period filter and keeps only the
 * "no identically-white left diagonal" filter, which is the boundary probe:
 * anything above 1/2 there is a background the pow2 filter is the only thing
 * excluding.
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

const args = process.argv.slice(2);
const maxN = Number(args.find((a) => /^\d+$/.test(a)) || 18);
const MODE = args.includes('--all') ? 'all' : 'pow2';
const sampleArg = args.find((a) => a.startsWith('--sampleN='));
const trialsArg = args.find((a) => a.startsWith('--trials='));
const SAMPLE_N = sampleArg ? Number(sampleArg.split('=')[1]) : 0;
const TRIALS = trialsArg ? Number(trialsArg.split('=')[1]) : 2000000;

const half = { num: 1, den: 2 };
const f = (r) => { const q = L.reduce(r); return `${r.num}/${r.den} = ${q.num}/${q.den} = ${(r.num / r.den).toFixed(6)}`; };

function cheapKey(cyc) {
  const rows = cyc.map((r) => L.rowKey(r));
  rows.sort();
  return rows.join(',');
}

function scanFamily(N, seedIter, label, seedCount) {
  let pow2Seeds = 0, admissibleSeeds = 0;
  const seen = new Map();                       // cheap key -> representative
  for (const row0 of seedIter) {
    const cyc = L.attractor(row0);
    if (MODE === 'pow2' && !L.isPow2(cyc.length)) continue;
    pow2Seeds++;
    if (L.whiteDiagonals(cyc, N).length > 0) continue;
    admissibleSeeds++;
    const ck = cheapKey(cyc);
    if (seen.has(ck)) { seen.get(ck).seeds++; continue; }
    seen.set(ck, { cyc, seeds: 1, seed0: Array.from(row0).join('') });
  }
  // collapse spatial rotation too
  const byCanon = new Map();
  for (const v of seen.values()) {
    const k = L.backgroundKey(v.cyc, N);
    if (byCanon.has(k)) { byCanon.get(k).seeds += v.seeds; continue; }
    byCanon.set(k, v);
  }
  let bestLo = null, bestHi = null, best = null, viol = 0, disagree = 0, failed = 0;
  const above = [];
  const hist = new Map();
  for (const v of byCanon.values()) {
    const lo = L.dpSub(v.cyc, N, 8 * N + 64);
    const hi = L.dpSup(v.cyc, N, 12);
    if (!lo || !hi) { failed++; continue; }
    v.lo = lo; v.hi = hi;
    if (L.cmpRat(lo, hi) > 0) viol++;
    if (L.cmpRat(lo, hi) !== 0) disagree++;
    if (bestLo === null || L.cmpRat(lo, bestLo) > 0) { bestLo = lo; best = v; }
    if (bestHi === null || L.cmpRat(hi, bestHi) > 0) bestHi = hi;
    if (L.cmpRat(lo, half) > 0) above.push(v);
    const q = L.reduce(lo); const kk = `${q.num}/${q.den}`;
    hist.set(kk, (hist.get(kk) || 0) + 1);
  }
  console.log(`N=${String(N).padStart(2)} [${label}] seeds ${seedCount}  ${MODE === 'pow2' ? 'pow2-period ' : ''}${pow2Seeds}  admissible ${admissibleSeeds}  DISTINCT backgrounds ${byCanon.size}  dpFail ${failed}`);
  console.log(`      max lower ${bestLo ? f(bestLo) : '-'}   max upper ${bestHi ? f(bestHi) : '-'}   lo>hi ${viol}   lo!=hi ${disagree}   above 1/2: ${above.length}`);
  if (best) console.log(`      maximiser seed ${best.seed0} rowPeriod ${best.cyc.length}: ${best.cyc.map((r) => Array.from(r).map((x) => (x ? '#' : '.')).join('')).slice(0, 4).join(' | ')}${best.cyc.length > 4 ? ' | ...' : ''}`);
  for (const v of above.slice(0, 5)) {
    console.log(`      *** ABOVE 1/2: seed ${v.seed0} rowPeriod ${v.cyc.length} speed ${f(v.lo)} upper ${f(v.hi)}`);
    for (const r of v.cyc.slice(0, 12)) console.log('          ' + Array.from(r).map((x) => (x ? '#' : '.')).join(''));
  }
  return { bestLo, bestHi, above, distinct: byCanon.size, hist };
}

function* allSeeds(N) {
  const row = new Uint8Array(N);
  for (let it = 0; it < (1 << N); it++) {
    for (let i = 0; i < N; i++) row[i] = (it >>> i) & 1;
    yield row;
  }
}
function* randSeeds(N, trials, seed) {
  let s = seed >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
  const row = new Uint8Array(N);
  for (let it = 0; it < trials; it++) {
    for (let i = 0; i < N; i++) row[i] = rnd() & 1;
    yield row;
  }
}

const NS = MODE === 'pow2' ? [4, 8, 16].filter((n) => n <= maxN) : [];
if (MODE === 'all') for (let n = 2; n <= maxN; n++) NS.push(n);

for (const N of NS) scanFamily(N, allSeeds(N), 'exhaustive', 1 << N);
if (SAMPLE_N) scanFamily(SAMPLE_N, randSeeds(SAMPLE_N, TRIALS, 20260909), `random sample`, TRIALS);
