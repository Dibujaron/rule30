// Parallax 12 / B''. Controls for the corank rate, and the null nobody supplied.
//
// B8 measured corank(D f^t)/t -> 1.333..1.344 along the seed's orbit. 4/3 is
// already on this board twice: sextant7 corrected crystal 69's settling-front
// constant to 4/3 = 1/(1 - 1/4) with 1/4 Wolfram's regular/irregular boundary
// speed. Obstruction 17 says every T-map regularity so far has been the diagonal
// picture in disguise, so before the number goes in the document it needs to be
// asked what it was measured OVER.
//
// Three backgrounds, same Jacobian product:
//   (a) the seed's own orbit   -- the object
//   (b) i.i.d. fair-coin rows  -- destroys the orbit, keeps the Jacobian shape
//   (c) a fixed random row repeated -- destroys the orbit AND the variation
// If (a) and (b) agree, the rate is a fact about rule 30's Jacobian shape and
// NOT about the seed's orbit, and no front is involved.

const table = (rule) => { const t = []; for (let k = 0; k < 8; k++) t.push((rule >> k) & 1); return t; };
const apply = (tb, l, c, r) => tb[4 * l + 2 * c + r];
const partials = (tb, l, c, r) => {
  const v = apply(tb, l, c, r);
  return [v ^ apply(tb, l ^ 1, c, r), v ^ apply(tb, l, c ^ 1, r), v ^ apply(tb, l, c, r ^ 1)];
};
const bitsOf = (r, n) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = Number((r >> BigInt(i)) & 1n); return b; };
function stepBits(tb, b) {
  const n = b.length, o = new Uint8Array(n);
  for (let i = 0; i < n; i++) o[i] = apply(tb, i >= 2 ? b[i - 2] : 0, i >= 1 ? b[i - 1] : 0, b[i]);
  return o;
}
function jacobian(tb, b) {
  const n = b.length, J = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) {
    const [dl, dc, dr] = partials(tb, i >= 2 ? b[i - 2] : 0, i >= 1 ? b[i - 1] : 0, b[i]);
    let row = 0n;
    if (dl && i >= 2) row ^= 1n << BigInt(i - 2);
    if (dc && i >= 1) row ^= 1n << BigInt(i - 1);
    if (dr) row ^= 1n << BigInt(i);
    J[i] = row;
  }
  return J;
}
function matmul(A, B, n) {
  const out = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) { let acc = 0n; const a = A[i]; for (let k = 0; k < n; k++) if ((a >> BigInt(k)) & 1n) acc ^= B[k]; out[i] = acc; }
  return out;
}
function rank(M, n) {
  const rows = M.slice(); let r = 0;
  for (let col = 0; col < n && r < rows.length; col++) {
    let piv = -1;
    for (let i = r; i < rows.length; i++) if ((rows[i] >> BigInt(col)) & 1n) { piv = i; break; }
    if (piv < 0) continue;
    [rows[r], rows[piv]] = [rows[piv], rows[r]];
    for (let i = 0; i < rows.length; i++) if (i !== r && ((rows[i] >> BigInt(col)) & 1n)) rows[i] ^= rows[r];
    r++;
  }
  return r;
}
// xorshift32, because an LCG's low bit alternates (my own notebook, 2026-09-07)
function xs32(seed) { let s = seed | 0; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }

function coRankRate(n, T, kind, seed) {
  const tb = table(30);
  const rnd = xs32(seed);
  let b = kind === "seed" ? bitsOf(1n, n) : (() => { const x = new Uint8Array(n); for (let i = 0; i < n; i++) x[i] = rnd() < 0.5 ? 1 : 0; return x; })();
  const fixed = b.slice();
  let P = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) P[i] = 1n << BigInt(i);
  const out = [];
  for (let t = 1; t <= T; t++) {
    P = matmul(jacobian(tb, b), P, n);
    if (kind === "seed") b = stepBits(tb, b);
    else if (kind === "coin") { for (let i = 0; i < n; i++) b[i] = rnd() < 0.5 ? 1 : 0; }
    else b = fixed;
    if (t === T) out.push(n - rank(P, n));
  }
  return out[0] / T;
}

console.log("== B9  corank(D f^t)/t for rule 30, three backgrounds ==");
for (const [n, T] of [[128, 32], [256, 64], [512, 128], [768, 192]]) {
  const s = coRankRate(n, T, "seed", 1);
  const c1 = coRankRate(n, T, "coin", 12345);
  const c2 = coRankRate(n, T, "coin", 999331);
  const f1 = coRankRate(n, T, "fixed", 5551);
  console.log(`  n=${String(n).padStart(4)} t=${String(T).padStart(3)}  seed=${s.toFixed(4)}  coin=${c1.toFixed(4)},${c2.toFixed(4)}  fixed-row=${f1.toFixed(4)}`);
}
console.log("  if seed ~ coin, the rate is the Jacobian's shape, not the orbit's.");

console.log("\n== B10  the same rate for the other rules, seed orbit, n=512 t=128 ==");
for (const rule of [30, 90, 150, 60, 110, 86, 45, 106]) {
  const tb = table(rule);
  const n = 512, T = 128;
  let b = bitsOf(1n, n);
  let P = new Array(n).fill(0n);
  for (let i = 0; i < n; i++) P[i] = 1n << BigInt(i);
  for (let t = 1; t <= T; t++) { P = matmul(jacobian(tb, b), P, n); b = stepBits(tb, b); }
  console.log(`  rule ${String(rule).padStart(3)}  corank/t = ${((n - rank(P, n)) / T).toFixed(4)}`);
}
