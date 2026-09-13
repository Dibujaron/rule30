// Groma, 2026-09-13. What KZ rung n actually excludes, as against the board's
// period ladder Sigma_p.
//
// It would be tidy, and it is FALSE, that "KZ rung n" = "no eventual period
// < 2n", i.e. that the KZ ladder is the board's period ladder repackaged. It is
// strictly stronger: rung n also excludes periodic sequences of period >= 2n
// whose phases no n-window separates. The smallest witness is (00001)^inf, of
// period 5, which fails KZ rung 2.
//
// Exhaustive: for every primitive binary word of period q <= 12, compute
// p*(n) for n = 1,2,3 over the purely periodic sequence (all windows of span
// < 4q suffice, since the sequence has period q and a window's pattern set
// depends only on the lags mod q).

function pStar(word, n) {
  const q = word.length;
  // patterns at window {0=d1<...<dn}; only the lags mod q matter, so span < n*q
  // is enough, and we take the max over all such windows.
  let best = 0;
  const dmax = n * q; // generous
  const win = new Array(n).fill(0);
  const rec = (idx, next) => {
    if (idx === n) {
      const seen = new Set();
      for (let p = 0; p < q; p++) {
        let code = 0;
        for (let r = 0; r < n; r++) code = (code << 1) | word[(p + win[r]) % q];
        seen.add(code);
      }
      if (seen.size > best) best = seen.size;
      return;
    }
    for (let d = next; d <= dmax; d++) { win[idx] = d; rec(idx + 1, d + 1); }
  };
  win[0] = 0;
  if (n === 1) { rec(1, 1); } else rec(1, 1);
  return best;
}

function isPrimitive(w) {
  const q = w.length;
  for (let p = 1; p < q; p++) {
    if (q % p) continue;
    let ok = true;
    for (let i = 0; i < q; i++) if (w[i] !== w[i % p]) { ok = false; break; }
    if (ok) return false;
  }
  return true;
}

console.log('For each least period q, the purely periodic words w of period exactly q that');
console.log('FAIL KZ rung n (p*(n) < 2n). "period ladder" would predict: all q < 2n, none above.');
for (const n of [2, 3]) {
  console.log(`\n  --- rung n = ${n}, threshold 2n = ${2 * n}`);
  for (let q = 1; q <= 12; q++) {
    let total = 0, fail = 0;
    const examples = [];
    for (let v = 0; v < (1 << q); v++) {
      const w = new Uint8Array(q);
      for (let i = 0; i < q; i++) w[i] = (v >> i) & 1;
      if (!isPrimitive(w)) continue;
      total++;
      if (pStar(w, n) < 2 * n) { fail++; if (examples.length < 3) examples.push(Array.from(w).join('')); }
    }
    const pred = q < 2 * n ? 'all' : 'none';
    const got = fail === total ? 'all' : fail === 0 ? 'none' : `${fail}/${total}`;
    console.log(`    q=${String(q).padStart(2)}: ${String(fail).padStart(4)} of ${String(total).padStart(4)} primitive words fail   [period-ladder prediction: ${pred}; actual: ${got}]${examples.length ? '   e.g. ' + examples.join(', ') : ''}`);
  }
}

console.log('\n[the named witness] (00001)^inf, least period 5 >= 2n = 4:');
const w = Uint8Array.from([0, 0, 0, 0, 1]);
console.log(`   primitive: ${isPrimitive(w)};  p*(1) = ${pStar(w, 1)};  p*(2) = ${pStar(w, 2)} (threshold 4);  p*(3) = ${pStar(w, 3)} (threshold 6)`);
console.log('   so it fails KZ rung 2 although its period is 5 — the ladders are different.');
