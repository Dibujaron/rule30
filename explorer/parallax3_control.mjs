// Parallax, 2026-09-09. Repair of the "rule 30 from a random row" control in
// parallax3_pressure2.mjs, which was boundary-contaminated: white cells at the
// ends of the array send damage RIGHT at speed exactly 1 (evolve_right_edge),
// so after t steps the leftmost t cells of the array are not rule 30 on Z at
// all. With W = 2T + 3 and T = 20000 that was half the array, which is why the
// control read a firing density of 0.226 instead of 0.25.
//
// Here the array is 6T wide and only the provably uncontaminated middle is
// measured: right of (left end + t + margin), left of (right end - 0.35t -
// margin), using speed 1 leftward-boundary damage and a generous 0.35 for the
// right-boundary damage (measured left front speed is ~0.24).

const T = 20000;
const W = 6 * T;
const KMAX = 14;
const SAMPLE_FROM = Math.floor(T * 0.5);
const MARGIN = 200;

let s0 = 987654321, s1 = 12345, s2 = 555555555, s3 = 24680;
function rnd() {
  const t = s0 ^ (s0 << 11); s0 = s1; s1 = s2; s2 = s3;
  s3 = (s3 ^ (s3 >>> 19)) ^ (t ^ (t >>> 8));
  return (s3 >>> 0) / 4294967296;
}

let row = new Uint8Array(W), next = new Uint8Array(W);
for (let i = 0; i < W; i++) row[i] = rnd() < 0.5 ? 0 : 1;

let n = 0, f = 0, z = 0, zz = 0, m = 0;
const blocks = new Map();

for (let t = 0; t < T; t++) {
  const lo = t + MARGIN, hi = W - Math.round(0.35 * t) - MARGIN;
  if (hi - lo > 1000) {
    let ff = 0;
    for (let i = lo; i < hi; i++) if (row[i] && row[i + 1]) ff++;
    const nn = hi - lo;
    n += nn; f += ff;
    const zz1 = (ff - nn / 4) / Math.sqrt(nn);
    z += zz1; zz += zz1 * zz1; m++;
    if (t >= SAMPLE_FROM && t % 11 === 0) {
      for (let i = lo; i + KMAX + 1 < hi; i++) {
        let v = 0; for (let k = 0; k <= KMAX; k++) v = v * 2 + row[i + k];
        blocks.set(v, (blocks.get(v) || 0) + 1);
      }
    }
  }
  next.fill(0);
  for (let i = 1; i < W - 1; i++) next[i] = row[i - 1] ^ (row[i] | row[i + 1]);
  const tmp = row; row = next; next = tmp;
}

console.log('--- CONTROL, repaired: rule 30 from one uniform random row ---');
console.log(`firing density                 ${(f / n).toFixed(7)}   (-P'(0) = 0.25)`);
console.log(`mean  (N-n/4)/sqrt(n)          ${(z / m).toFixed(6)}`);
console.log(`var   (N-n/4)/sqrt(n)          ${(zz / m - (z / m) ** 2).toFixed(6)}   (P''(0) = 0.3125)`);
console.log(`rows used                      ${m}`);

function stats(map, k) {
  let tot = 0; for (const c of map.values()) tot += c;
  let H = 0, chi = 0; const exp = tot / (1 << k);
  for (const c of map.values()) { const p = c / tot; H -= p * Math.log2(p); }
  for (let v = 0; v < (1 << k); v++) { const c = map.get(v) || 0; chi += (c - exp) * (c - exp) / exp; }
  const df = (1 << k) - 1;
  return { H, chi, z: (chi - df) / Math.sqrt(2 * df), tot };
}
const at = [];
for (let k = 1; k <= KMAX + 1; k++) {
  const mm = new Map(); const sh = (KMAX + 1) - k;
  for (const [v, c] of blocks) { const key = v >>> sh; mm.set(key, (mm.get(key) || 0) + c); }
  at.push(stats(mm, k));
}
console.log('k   H_k/k (bits)   h_k             chi^2 vs uniform (z-score)');
for (let k = 1; k <= KMAX + 1; k++) {
  const s = at[k - 1];
  const hk = k === 1 ? s.H : s.H - at[k - 2].H;
  console.log(String(k).padEnd(4), (s.H / k).toFixed(6).padEnd(15), hk.toFixed(6).padEnd(16),
    `${s.chi.toFixed(0)} (z=${s.z.toFixed(1)})`);
}
console.log(`block samples ${at[0].tot}`);
