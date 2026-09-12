// Independent brute-force check of arXiv:2609.09431 (Condrey, 8 Sep 2026).
// The paper's claims are about NONZERO finite configurations; the zero row is excluded
// by hypothesis (it is the one configuration with a genuinely constant trace).
function prefixLen(bits, w, T) {
  const R = w + T + 2, N = 2 * R + 1, O = R;
  let a = new Uint8Array(N);
  for (let i = -w; i <= w; i++) a[O + i] = bits[i + w];
  const c0 = a[O]; let L = 0;
  for (let t = 0; t < T; t++) {
    if (a[O] !== c0) break;
    L++;
    const b = new Uint8Array(N);
    for (let j = 1; j < N - 1; j++) b[j] = (a[j - 1] ^ (a[j] | a[j + 1])) & 1;
    a = b;
  }
  return { L, c0 };
}
console.log(" w   max|c0=0  claim    max|c0=1  claim    overall  claim    #attaining  claim    verdict");
let allOk = true;
for (let w = 0; w <= 10; w++) {
  const n = 2 * w + 1, total = 1 << n, T = w + 8;
  let m0 = -1, m1 = -1, attain = 0; const target = w + 2;
  for (let m = 1; m < total; m++) {          // m = 0 is the zero row: excluded
    const bits = new Uint8Array(n);
    for (let i = 0; i < n; i++) bits[i] = (m >> i) & 1;
    const { L, c0 } = prefixLen(bits, w, T);
    if (c0 === 0) { if (L > m0) m0 = L; } else { if (L > m1) m1 = L; }
    if (L >= target) attain++;
  }
  const p0 = 2 * Math.ceil(w / 2) + 1, p1 = 2 * Math.floor(w / 2) + 2;
  const pc = (w % 2 === 0) ? (1 << w) : ((1 << w) - 1);
  const overall = Math.max(m0, m1);
  // m0 === -1 means the c0=0 class is EMPTY for this radius (true only at w=0, where the
  // sole nonzero configuration is the single centre cell). Vacuous, not a counterexample.
  const ok0 = (m0 === -1) || (m0 === p0);
  const ok = ok0 && (m1 === p1) && (overall === w + 2) && (attain === pc);
  if (!ok) allOk = false;
  console.log(`${String(w).padStart(2)}  ${(m0===-1?"(empty)":String(m0)).padStart(8)}  ${String(p0).padStart(5)}  ${String(m1).padStart(10)}  ${String(p1).padStart(5)}  ${String(overall).padStart(9)}  ${String(w+2).padStart(5)}  ${String(attain).padStart(11)}  ${String(pc).padStart(5)}    ${ok ? "ok" : "*** MISMATCH ***"}`);
}
console.log("\n" + (allOk
  ? "EVERY CLAIM REPRODUCED EXACTLY, w = 0..10, all 2^(2w+1)-1 nonzero configurations enumerated (none sampled)."
  : "*** AT LEAST ONE CLAIM FAILS ***"));
