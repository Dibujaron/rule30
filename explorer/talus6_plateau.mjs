// Talus, 2026-09-10.  Sharpening the denominator of the no-drop sweep.
//
// A step of the tower is CLOSED (obstruction 7's own argument settles it) when
// the previous depth doubled -- minper(v) = 2 minper(u) -- because then v is
// antiperiodic at minper(u) and the driver can only lose its period if u is
// constantly black, which rightDiagonal_not_constant forbids.  A step is OPEN
// when minper(u) = minper(v) = L, the interior of a plateau.  "0 drops in N
// transitions" is worth what its OPEN count is, so count them.
//
// Also: at which L does the driver ever collapse (minper(g) < L) at all?
// And: how many distinct towers are there vs distinct consecutive pairs --
// the centre column is recoverable from the tower (b(k) = R_k(0)), but a
// single pair need not remember it.

const EXH = 20;

function minPeriod(w) {
  const N = w.length;
  for (let d = 1; d < N; d <<= 1) {
    let ok = true;
    for (let i = 0; i + d < N; i++) if (w[i] !== w[i + d]) { ok = false; break; }
    if (ok) return d;
  }
  return N;
}

let openSteps = 0, closedSteps = 0, otherSteps = 0, drops = 0, towers = 0;
const collapseByL = new Map();      // L -> count of steps with minper(g) < L
const stepsByL = new Map();         // L -> total steps at that L
const openByL = new Map();

function stepInfo(u, v, bit) {
  const L = Math.max(u.length, v.length);
  const g = new Uint8Array(L);
  for (let j = 0; j < L; j++) g[j] = v[(j + 1) % v.length] | u[(j + 2) % u.length];
  const gp = minPeriod(g);
  const buf = new Uint8Array(2 * L);
  buf[0] = bit;
  for (let j = 0; j + 1 < 2 * L; j++) buf[j + 1] = buf[j] ^ g[j % L];
  const p = minPeriod(buf);
  return { L, gp, w: buf.slice(0, p) };
}

function dfs(u, v, k) {
  if (k > EXH) { towers++; return; }
  for (const bit of [0, 1]) {
    const r = stepInfo(u, v, bit);
    const L = r.L;
    stepsByL.set(L, (stepsByL.get(L) || 0) + 1);
    if (u.length === v.length) { openSteps++; openByL.set(L, (openByL.get(L) || 0) + 1); }
    else if (v.length === 2 * u.length) closedSteps++;
    else otherSteps++;
    if (r.gp < L) collapseByL.set(L, (collapseByL.get(L) || 0) + 1);
    if (r.w.length < L) drops++;
    dfs(v, r.w, k + 1);
  }
}

for (const b0 of [0, 1]) for (const b1 of [0, 1]) {
  const R0 = Uint8Array.from([b0]);
  const buf = new Uint8Array(2); buf[0] = b1; buf[1] = b1 ^ b0;
  dfs(R0, buf.slice(0, minPeriod(buf)), 2);
}

console.log(`towers enumerated to depth ${EXH}: ${towers}`);
console.log(`steps: ${openSteps} OPEN (plateau interior, minper(u)=minper(v)), ` +
  `${closedSteps} CLOSED (previous depth doubled), ${otherSteps} other`);
console.log(`drops: ${drops}`);
console.log('L : total steps : open steps : driver collapses (minper(g) < L)');
for (const L of Array.from(stepsByL.keys()).sort((a, b) => a - b))
  console.log(`${L} : ${stepsByL.get(L)} : ${openByL.get(L) || 0} : ${collapseByL.get(L) || 0}`);
