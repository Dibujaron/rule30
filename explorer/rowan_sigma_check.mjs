// C2 at small scale: Sigma(x) = D(x, 2^(x+1)-x) for x in 0..W-1; grow Sigma; compare cells (t,x) with x+t < W (inside the cone of the known part)
// with D(t+x, 2^(t+x+1) - x). Independent engine (same as rowan_leftside_check).
const T = 5000, W = 12;
function grow(init, T) { const rows = []; let r = init; for (let t = 0; t <= T; t++) { rows.push(r); const rr = r << 1n; r = (rr << 1n) ^ (rr | (rr >> 1n)); } return rows; }
const bit = (r, i) => (i < 0 ? 0n : ((r >> BigInt(i)) & 1n));
const seed = grow(1n, T);
const D = (k, j) => Number(bit(seed[j + k], -j + j + k)); // cell -j at time j+k: bit index x + t = -j + (j+k) = k
if ([...Array(11).keys()].map(k => D(k, 2 ** k)).join('') !== '11011100110') { console.log('ENGINE GUARD FAILED'); process.exit(1); }
let sigma = 0n; for (let x = 0; x < W; x++) if (D(x, 2 ** (x + 1) - x)) sigma |= (1n << BigInt(x));
console.log('Sigma(0..11) =', [...Array(W).keys()].map(x => D(x, 2 ** (x + 1) - x)).join(''));
const S = grow(sigma, W);
let checks = 0, bad = 0;
for (let t = 0; t < W; t++) for (let x = -t; x + t < W; x++) { const k = t + x; const idx = 2 ** (k + 1) - x; if (idx + k > T) continue; const lhs = Number(bit(S[t], x + t)); const rhs = D(k, idx); checks++; if (lhs !== rhs) { bad++; if (bad < 5) console.log('mismatch at', t, x); } }
console.log(`C2 small-scale: ${checks} cells inside the cone of Sigma(0..11), mismatches ${bad}`);
