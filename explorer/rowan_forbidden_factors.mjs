// Does the rule 30 centre column have any FORBIDDEN FACTOR?
// WHY: the Kupin-Rowland/Chvatal pipeline that produced rigorous two-sided density bounds
// for the Kolakoski word runs on a finite set of PROVABLY FORBIDDEN factors. Steps 2-4
// (cluster method -> generating function -> bound) are mechanical. Step 1 is the whole
// question, and it is empirical first: if every word of length k occurs, there is no input.
const T = 200000, R = T + 64, NB = 2*R + 64, NW = (NB+31)>>5, OFF = R;
const cur = new Uint32Array(NW), nxt = new Uint32Array(NW), A = new Uint32Array(NW), B = new Uint32Array(NW);
cur[OFF>>5] |= (1 << (OFF&31));
const col = new Uint8Array(T);
for (let t = 0; t < T; t++) {
  col[t] = (cur[OFF>>5] >>> (OFF&31)) & 1;
  let c=0; for(let w=0;w<NW;w++){const v=cur[w];A[w]=((v<<1)|c)>>>0;c=v>>>31;}
  let b=0; for(let w=NW-1;w>=0;w--){const v=cur[w];B[w]=((v>>>1)|(b<<31))>>>0;b=v&1;}
  for(let w=0;w<NW;w++)nxt[w]=(A[w]^(cur[w]|B[w]))>>>0;
  cur.set(nxt);
}
console.log(`centre column prefix ${Array.from(col.slice(0,6)).join("")} (must be 110111); length ${T}`);

function coverage(seq, k) {                       // how many of the 2^k words occur
  const seen = new Uint8Array(1 << k);
  let v = 0; const mask = (1 << k) - 1;
  for (let i = 0; i < seq.length; i++) {
    v = ((v << 1) | seq[i]) & mask;
    if (i >= k - 1) seen[v] = 1;
  }
  let n = 0; for (let i = 0; i < seen.length; i++) n += seen[i];
  return n;
}
// null model: a nonlinear pseudorandom sequence of the SAME length, same procedure
let s = 0x9e3779b9 >>> 0;
const rb = () => { s = (Math.imul(s ^ (s>>>16), 0x7feb352d))>>>0;
                   s = (Math.imul(s ^ (s>>>15), 0x846ca68b))>>>0; return (s>>>13)&1; };
const ctrl = new Uint8Array(T); for (let i = 0; i < T; i++) ctrl[i] = rb();

console.log("\n  k   rule30 words seen / 2^k      control seen / 2^k     all present?");
let largestFull = 0;
for (let k = 1; k <= 18; k++) {
  const tot = 1 << k, a = coverage(col, k), b = coverage(ctrl, k);
  if (a === tot) largestFull = k;
  console.log(`  ${String(k).padStart(2)}   ${String(a).padStart(7)} / ${String(tot).padEnd(8)}        ${String(b).padStart(7)} / ${String(tot).padEnd(8)}   ${a===tot ? "ALL" : "missing " + (tot-a)}`);
}
console.log(`\nLargest k with EVERY binary word of length k present: ${largestFull}`);
console.log(`(a forbidden factor of length <= ${largestFull} would be a counterexample to P2's`);
console.log(` full-complexity behaviour and is the required input to the cluster method)`);
