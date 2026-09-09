// Spot-check: at a few large n, does a much larger sample beat the 300-sample
// maxTail lower bound used by collapse_sweep.cjs?  Also reports what fraction
// of sampled starts attain the max, which is what makes the sampler credible.
//
// usage: node collapse_spot.cjs <n1,n2,...> [samples]
const { makeStepBig, cyclicNodes } = require('./collapse_lib.cjs');

function towerL(n) {
  let A = [0n, 1n], spec = new Map([[1, 2]]);
  for (let m = 2; m <= n; m++) {
    const step = makeStepBig(m);
    const hi = 1n << BigInt(m - 1);
    const cand = [];
    for (const a of A) { cand.push(a); cand.push(a + hi); }
    const { cyclic, spectrum } = cyclicNodes(cand, step, (x) => x.toString(16));
    A = cand.filter((x) => cyclic.has(x.toString(16)));
    spec = spectrum;
  }
  return { L: Math.max(...spec.keys()), size: A.length };
}

const ns = (process.argv[2] || '100,200,300,420').split(',').map(Number);
const S = Number(process.argv[3] || 20000);
console.log(`n   L  |A|   tail(1)  tail(9)  sampledMax(${S})  #at max  frac at max  meanTail`);
for (const n of ns) {
  const { L, size } = towerL(n);
  const step = makeStepBig(n);
  const mask = (1n << BigInt(n)) - 1n;
  const tail = (r) => { let x = r, y = r; for (let i = 0; i < L; i++) y = step(y); let k = 0; while (x !== y) { x = step(x); y = step(y); k++; } return k; };
  const t1 = tail(1n), t9 = tail(9n);
  let best = 0, atMax = 0, sum = 0;
  for (let i = 0; i < S; i++) {
    let r = 0n;
    for (let b = 0; b < n; b += 30) r |= BigInt((Math.random() * 2 ** 30) >>> 0) << BigInt(b);
    const t = tail(r & mask);
    sum += t;
    if (t > best) { best = t; atMax = 1; } else if (t === best) atMax++;
  }
  console.log([String(n).padStart(3), String(L).padStart(2), String(size).padStart(5), String(t1).padStart(8),
    String(t9).padStart(8), String(Math.max(best, t1, t9)).padStart(15), String(atMax).padStart(8),
    (atMax / S).toExponential(2).padStart(11), (sum / S).toFixed(2).padStart(9)].join(' '));
}
