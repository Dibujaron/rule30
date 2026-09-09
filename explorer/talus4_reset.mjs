// Talus, 2026-09-09. Obstruction 6 in the arithmetic language of the truncated row map.
//
// The induction a Lean proof of the onset wall would run is
// leftDiagonal_periodicFrom_step_of_black: if diagonals j-2, j-1 share a period from
// index N and diagonal j-1 is black at index i+1 >= N, then diagonal j is periodic from
// i+1. Iterating it from the edge gives the "reset front"
//     R_0 = R_1 = 0,
//     R_j = 1 + (least i >= max(R_{j-1}, R_{j-2}) with leftDiagonal (j-1) (i+1) = true).
// The wall needs onset(j) <= j, i.e. preperiod pre(n) = max_j (onset(j) + j) <= 2(n-1).
// This measures R_j / j and the resulting preperiod bound against the budget 2(n-1),
// and against the TRUE onsets.

const W = 32;
const N = 8000;
const P = 16; // eventual period at this width

const words = ((N + W - 1) / W) | 0;
const topBits = N - (words - 1) * W;
const topMask = topBits === 32 ? 0xffffffff : ((1 << topBits) >>> 0) - 1;
const T = 2 * N + 4 * P;

// store the whole low-N-bit picture
const pic = new Uint32Array((T + 1) * words);
pic[0] = 1;
for (let t = 1; t <= T; t++) {
  const o = t * words, q = (t - 1) * words;
  for (let i = words - 1; i >= 0; i--) {
    const a = pic[q + i];
    const b = i >= 1 ? pic[q + i - 1] : 0;
    pic[o + i] = (((a << 2) | (b >>> 30)) ^ (((a << 1) | (b >>> 31)) | a)) >>> 0;
  }
  pic[o + words - 1] = (pic[o + words - 1] & topMask) >>> 0;
}
// diagonal j at index i = bit j of row i+j
const diag = (j, i) => (pic[(i + j) * words + ((j / 32) | 0)] >>> (j % 32)) & 1;

// true onsets
const onset = new Int32Array(N);
for (let j = 0; j < N; j++) {
  const lastIdx = T - j - P;
  let ld = -1;
  for (let i = 0; i <= lastIdx; i++) if (diag(j, i) !== diag(j, i + P)) ld = i;
  onset[j] = ld + 1;
}

// reset front
const R = new Int32Array(N);
R[0] = 0; R[1] = 0;
let overflow = -1;
for (let j = 2; j < N; j++) {
  const start = Math.max(R[j - 1], R[j - 2]);
  let i = start;
  while (i + 1 <= T - (j - 1) && !diag(j - 1, i + 1)) i++;
  // no black cell past `start`: crystal 45's white branch, which costs one index
  // (and doubles the period) rather than jumping to a reset.
  R[j] = i + 1 > T - (j - 1) ? start + 1 : i + 1;
}
const last = overflow > 0 ? overflow - 1 : N - 1;

function stats(arr, name) {
  let mx = 0, mxj = 0;
  for (let j = 2; j <= last; j++) if (arr[j] / j > mx) { mx = arr[j] / j; mxj = j; }
  console.log(`${name}: value at j=${last} is ${arr[last]} (${(arr[last] / last).toFixed(4)} j); worst ratio ${mx.toFixed(4)} at j=${mxj}`);
}
console.log(`width ${N}, rows to ${T}, diagonals 2..${last}`);
stats(onset, "true onset(j)     ");
stats(R, "reset-front R(j)  ");
console.log("");
let preTrue = 0, preReset = 0;
for (let j = 0; j <= last; j++) { preTrue = Math.max(preTrue, onset[j] + j); preReset = Math.max(preReset, R[j] + j); }
console.log(`preperiod implied by the TRUE onsets over diagonals 0..${last}: ${preTrue}  (${(preTrue / (last + 1)).toFixed(4)} n)`);
console.log(`preperiod implied by the RESET FRONT over the same range:      ${preReset}  (${(preReset / (last + 1)).toFixed(4)} n)`);
console.log(`the wall's budget at n = ${last + 1} is 2(n-1) = ${2 * last}`);
console.log(`reset-front bound within budget? ${preReset <= 2 * last ? "yes" : "NO -- overshoots by " + ((preReset / (2 * last) - 1) * 100).toFixed(1) + "%"}`);
