/**
 * The black-time test with a BigInt half-line: dense periods to 20, sparse
 * patterns to period 240, and the per-test survival rate.
 *
 *   node explorer/sparseleft.mjs
 *
 * Same test as periodicleft.mjs: a periodic column c can belong to a
 * configuration white far to the left only if c(t+1) = not L(t) at every
 * black time t, L being column -1 of the half-line x <= -1 driven by c from
 * the left word w. Here the half-line is one BigInt, bit k = cell -k for
 * k >= 1 and bit 0 the boundary, stepped by
 *     next = (x >> 1) xor (x or (x << 1)),  then bit 0 := c(t+1),
 * so a run of thousands of rows costs milliseconds.
 *
 * Reported per family: the largest number of black-time tests any candidate
 * passed, against log2(#candidates), which is what a fair coin per test
 * would give; and the observed survival rate per test.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

const DENSE_P = 20;       // every minimal pattern of period <= DENSE_P
const DENSE_M = 1;        // left words up to this length for the dense sweep
const PULSE_P = 240;      // single pulse per period, period 2..PULSE_P
const PULSE_M = 10;       // left words up to this length (w_1 = 1 forced)
const TWO_P = 40;         // two pulses per period, period 3..TWO_P
const TWO_M = 8;
const CAP_TESTS = 200;    // a candidate passing this many tests is a survivor

/**
 * Run the test. `c` is a function t -> 0|1, `w` a left word (w[0] = cell -1).
 * Returns the number of black-time tests passed before the first failure
 * (CAP_TESTS if none), and the time of failure.
 */
function blackTests(c, w, capTests) {
  let x = 0n;
  for (let i = 0; i < w.length; i++) if (w[i]) x |= 1n << BigInt(i + 1);
  let passed = 0, t = 0;
  const ct0 = c(0);
  if (ct0) x |= 1n;
  for (;;) {
    const ct = c(t);
    if (ct === 1) {
      const L = Number((x >> 1n) & 1n);
      if (c(t + 1) !== 1 - L) return { passed, t };
      if (++passed >= capTests) return { passed, t: -1 };
    }
    x = ((x >> 1n) ^ (x | (x << 1n))) & ~1n;
    if (c(t + 1)) x |= 1n;
    t++;
  }
}

const isMinimal = (pat) => {
  const p = pat.length;
  for (let q = 1; q < p; q++) if (p % q === 0) {
    let ok = true;
    for (let i = q; i < p; i++) if (pat[i] !== pat[i - q]) { ok = false; break; }
    if (ok) return false;
  }
  return true;
};

function report(label, results, nCand) {
  // results: array of passed counts
  const hist = [];
  for (const k of results) hist[k] = (hist[k] || 0) + 1;
  let max = 0;
  for (const k of results) if (k > max) max = k;
  const survivors = results.filter((k) => k >= CAP_TESTS).length;
  // survival rate per test: among candidates reaching test k, fraction passing it
  let rateStr = '';
  let reaching = results.length;
  for (let k = 0; k < Math.min(max, 8); k++) {
    const failedHere = hist[k] || 0;
    rateStr += `${((reaching - failedHere) / reaching).toFixed(2)} `;
    reaching -= failedHere;
  }
  console.log(`  ${label.padEnd(34)} cands ${String(nCand).padStart(8)}  log2 ${Math.log2(nCand).toFixed(1).padStart(5)}  max tests passed ${String(max).padStart(3)}  survivors ${survivors}  pass-rate by test: ${rateStr}`);
}

console.log('dense sweep: every minimal pattern, all phases, left words to length ' + DENSE_M);
for (let p = 1; p <= DENSE_P; p++) {
  for (let m = 0; m <= DENSE_M; m++) {
    const results = [];
    let nCand = 0;
    for (let code = 0; code < (1 << p); code++) {
      const pat = Array.from({ length: p }, (_, i) => (code >> i) & 1);
      if (!isMinimal(pat) || pat.every((v) => v === 0)) continue;
      const c = (t) => pat[t % p];
      for (let wc = 0; wc < (1 << m); wc++) {
        const w = Array.from({ length: m }, (_, i) => (wc >> i) & 1);
        results.push(blackTests(c, w, CAP_TESTS).passed);
        nCand++;
      }
    }
    if (nCand) report(`p=${p} m=${m}`, results, nCand);
  }
}

console.log(`\nsingle pulse at time 0 mod p, left word w with w_1 = 1, length <= ${PULSE_M}`);
{
  let worst = { passed: -1 };
  const perP = [];
  for (let p = 2; p <= PULSE_P; p++) {
    const c = (t) => (t % p === 0 ? 1 : 0);
    let max = -1, maxW = null;
    for (let m = 1; m <= PULSE_M; m++) {
      for (let wc = 0; wc < (1 << (m - 1)); wc++) {
        const w = [1, ...Array.from({ length: m - 1 }, (_, i) => (wc >> i) & 1)];
        const r = blackTests(c, w, CAP_TESTS);
        if (r.passed > max) { max = r.passed; maxW = w.join(''); }
      }
    }
    perP.push([p, max, maxW]);
    if (max > worst.passed) worst = { passed: max, p, w: maxW };
  }
  const nCand = (1 << PULSE_M) - 1;
  console.log(`  candidates per period: ${nCand} (log2 ${Math.log2(nCand).toFixed(1)}); deepest overall: ${worst.passed} tests at p=${worst.p}, w=${worst.w}`);
  console.log('  max tests passed by period: ' + perP.map(([p, mx]) => `${p}:${mx}`).join(' '));
}

console.log(`\ntwo pulses per period (at 0 and i), left word w with w_1 = 1, length <= ${TWO_M}`);
{
  let worst = { passed: -1 };
  const results = [];
  let nCand = 0;
  for (let p = 3; p <= TWO_P; p++) {
    for (let i = 1; i < p; i++) {
      const c = (t) => (t % p === 0 || t % p === i ? 1 : 0);
      for (let m = 1; m <= TWO_M; m++) {
        for (let wc = 0; wc < (1 << (m - 1)); wc++) {
          const w = [1, ...Array.from({ length: m - 1 }, (_, i2) => (wc >> i2) & 1)];
          const r = blackTests(c, w, CAP_TESTS);
          results.push(r.passed); nCand++;
          if (r.passed > worst.passed) worst = { passed: r.passed, p, i, w: w.join('') };
        }
      }
    }
  }
  report('two pulses, all p<=' + TWO_P, results, nCand);
  console.log(`  deepest: ${worst.passed} tests at p=${worst.p}, pulses at 0 and ${worst.i}, w=${worst.w}`);
}
