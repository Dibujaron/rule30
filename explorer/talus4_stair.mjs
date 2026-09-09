// Talus, 2026-09-09. The staircase: for every k, the MINIMAL p that closes the
// wall's instance at depth k, i.e. the least p > 0 with g_{k+1}^[2k](1) = g_{k+1}^[2k+p](1).
//
// Prediction: it is 2^(d(k)) with d(k) = #{doublings at or below k}, and NKS p. 871
// puts the doublings at k = 3, 8, 29, 400, 87867. So the staircase should step at
// exactly those k and nowhere else.

const KMAX = 600;
const PS = [1, 2, 4, 8, 16, 32];

function minimalP(k) {
  const n = k + 1;
  const mask = (1n << BigInt(n)) - 1n;
  const tmax = 2 * k + 64;
  const buf = new Array(65).fill(0n);
  let r = 1n & mask;
  buf[0] = r;
  const lastDiff = new Map(PS.map((p) => [p, -1]));
  for (let t = 1; t <= tmax; t++) {
    r = ((4n * r) ^ ((2n * r) | r)) & mask;
    buf[t % 65] = r;
    for (const p of PS) if (t >= p && buf[(t - p + 65) % 65] !== r) lastDiff.set(p, t);
  }
  for (const p of PS) if (lastDiff.get(p) < 2 * k) return p;
  return null;
}

let prev = null;
const steps = [];
for (let k = 0; k <= KMAX; k++) {
  const p = minimalP(k);
  if (p !== prev) { steps.push([k, p]); prev = p; }
}
console.log("minimal p as a step function of k, k = 0..%d", KMAX);
for (const [k, p] of steps) console.log(`  from k = ${k}: p = ${p}`);
console.log("");
console.log("NKS p. 871 doublings (period first appears at diagonal k): 2@3, 4@8, 8@29, 16@400, 32@87867");
console.log("steps found at k =", steps.map(([k]) => k).join(", "));
