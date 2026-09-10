// Talus, 2026-09-10.  How far from a collapse is the driver?
//
// A period drop needs the driver g(j) = v(j+1) OR u(j+2) to be h-periodic,
// h = L/2.  "0 collapses" says the failure set
//     D = { j in [0,h) : g(j) != g(j+h) }
// is nonempty; it does not say how big it is.  If |D| is a fixed small number
// the law is marginal and a proof must be delicate; if |D| is a constant
// fraction of L the law has a large margin and the next session should look
// for a lower bound on |D| rather than for a clever parity argument.
//
// Obstruction 7 measured the analogous "all three local coincidences fail"
// count at 0.16 L to 0.25 L for the seed to k = 54.  This measures |D| itself,
// for the seed and for random members of the family, and also reports the
// SMALLEST |D| ever seen, which is the number a proof has to beat.

const DEPTH = 44, RAND_TOWERS = 300, RAND_DEPTH = 40;

function minPeriod(w) {
  const N = w.length;
  for (let d = 1; d < N; d <<= 1) {
    let ok = true;
    for (let i = 0; i + d < N; i++) if (w[i] !== w[i + d]) { ok = false; break; }
    if (ok) return d;
  }
  return N;
}
function shiftUp(r, k, words) {
  const out = new Uint32Array(words);
  const w = k >> 5, b = k & 31;
  if (b === 0) { for (let i = r.length - 1; i >= 0; i--) if (i + w < words) out[i + w] = r[i]; }
  else for (let i = r.length - 1; i >= 0; i--) {
    const v = r[i];
    if (i + w < words) out[i + w] |= (v << b) >>> 0;
    if (i + w + 1 < words) out[i + w + 1] |= (v >>> (32 - b));
  }
  return out;
}
function seedCentre(n) {
  const c = new Uint8Array(n + 1);
  let r = new Uint32Array(1); r[0] = 1; c[0] = 1;
  for (let t = 0; t < n; t++) {
    const words = ((2 * (t + 1)) >> 5) + 1;
    const a = shiftUp(r, 2, words), b = shiftUp(r, 1, words);
    const o = new Uint32Array(words);
    for (let i = 0; i < words; i++) o[i] = (a[i] ^ (b[i] | (i < r.length ? r[i] : 0))) >>> 0;
    r = o; c[t + 1] = (r[(t + 1) >> 5] >>> ((t + 1) & 31)) & 1;
  }
  return c;
}

// |D| for a pair, and whether the step is OPEN (plateau interior).
// NOTE: |D| = #{ j < h : g(j) != g(j+h) } has the SAME PARITY as the driver's
// full-period weight W, since sum_{j<h}(g(j) xor g(j+h)) = W mod 2.  So on a
// DOUBLING step (W odd) |D| is odd and therefore nonzero for free -- that is
// the odd branch, which needs no hypothesis.  The law's real content is
// |D| >= 2 on the NON-doubling steps, where |D| is even and 0 is allowed by
// parity.  Reporting min |D| over all steps would put the free branch's
// witnesses in the denominator, so both are reported separately.
function margin(u, v) {
  const L = Math.max(u.length, v.length);
  if (L < 2) return null;
  const h = L >> 1;
  const g = new Uint8Array(L);
  for (let j = 0; j < L; j++) g[j] = v[(j + 1) % v.length] | u[(j + 2) % u.length];
  let D = 0, W = 0;
  for (let j = 0; j < h; j++) if (g[j] !== g[j + h]) D++;
  for (let j = 0; j < L; j++) W += g[j];
  return { L, h, D, W, doubling: W % 2 === 1, open: u.length === v.length };
}

function tower(bitAt, depth, label, report) {
  let u = Uint8Array.from([bitAt(0)]);
  const buf = new Uint8Array(2); buf[0] = bitAt(1); buf[1] = buf[0] ^ u[0];
  let v = buf.slice(0, minPeriod(buf));
  const rows = [];
  for (let k = 2; k <= depth; k++) {
    const m = margin(u, v);
    const L = Math.max(u.length, v.length);
    const g = new Uint8Array(L);
    for (let j = 0; j < L; j++) g[j] = v[(j + 1) % v.length] | u[(j + 2) % u.length];
    const b2 = new Uint8Array(2 * L); b2[0] = bitAt(k);
    for (let j = 0; j + 1 < 2 * L; j++) b2[j + 1] = b2[j] ^ g[j % L];
    const p = minPeriod(b2);
    if (m) rows.push({ k, ...m, P: p });
    u = v; v = b2.slice(0, p);
  }
  if (report) {
    console.log(`${label}: k  L  |D|  |D|/L  open?`);
    for (const r of rows) if (r.k >= 8)
      console.log(`  ${r.k}  ${r.L}  ${r.D}  ${(r.D / r.L).toFixed(4)}  ${r.open ? 'OPEN' : ''}`);
  }
  return rows;
}

const c = seedCentre(DEPTH);
const seedRows = tower((k) => c[k], DEPTH, 'seed', true);
{
  const open = seedRows.filter((r) => r.open && r.L >= 8);
  const rs = open.map((r) => r.D / r.L).sort((a, b) => a - b);
  console.log(`seed OPEN steps with L>=8: ${open.length}, |D|/L min ${rs[0]?.toFixed(4)} ` +
    `median ${rs[rs.length >> 1]?.toFixed(4)} max ${rs[rs.length - 1]?.toFixed(4)}; ` +
    `smallest |D| = ${Math.min(...open.map((r) => r.D))}`);
}

let seed = 987654321;
const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >> 17; seed ^= seed << 5; seed >>>= 0; return seed & 1; };
const allOpen = [];
for (let t = 0; t < RAND_TOWERS; t++) {
  const bits = new Uint8Array(RAND_DEPTH + 1);
  bits[0] = 1; for (let i = 1; i <= RAND_DEPTH; i++) bits[i] = rnd();
  for (const r of tower((k) => bits[k], RAND_DEPTH, '', false))
    if (r.open && r.L >= 8) allOpen.push(r);
}
function report(label, rows) {
  if (!rows.length) { console.log(`  ${label}: none`); return; }
  const rs = rows.map((r) => r.D / r.L).sort((a, b) => a - b);
  const minD = rows.reduce((m, r) => (r.D < m.D ? r : m), rows[0]);
  console.log(`  ${label}: ${rows.length} steps; |D|/L min ${rs[0].toFixed(4)} ` +
    `median ${rs[rs.length >> 1].toFixed(4)} max ${rs[rs.length - 1].toFixed(4)}; ` +
    `smallest |D| = ${minD.D} at L = ${minD.L} (k = ${minD.k}); ` +
    `steps with |D| <= 4: ${rows.filter((r) => r.D <= 4).length}`);
}
console.log(`\nfamily: ${allOpen.length} OPEN steps with L>=8 over ${RAND_TOWERS} random towers`);
report('NON-doubling (W even) -- where the law has content', allOpen.filter((r) => !r.doubling));
report('doubling (W odd) -- |D| odd, so nonzero for free ', allOpen.filter((r) => r.doubling));
const sd = seedRows.filter((r) => r.open && r.L >= 8 && !r.doubling);
report('seed, NON-doubling OPEN steps                    ', sd);
