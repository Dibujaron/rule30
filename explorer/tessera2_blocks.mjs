// Seeder, 2026-09-10. Two questions about the P2 tier's premises.
//
// (1) Is "every block of some fixed length L is balanced to L/d" satisfiable
//     for the centre column?  If long runs keep appearing, it is not, and a
//     node with that hypothesis would be unsuppliable.
// (2) What do the excess and the gaps look like, for the cuts node's reason.
import { centerColumn } from './rule30.mjs';

const N = Number(process.argv[2] ?? 400000);
const s = new Uint8Array(N);
{ let i = 0; for (const b of centerColumn(N)) s[i++] = b; }
const bit = (i) => s[i];

// (1) longest run of each colour in each prefix
let runMax = { 0: 0, 1: 0 };
let cur = bit(0), len = 1;
const marks = [1000, 10000, 100000, 400000].filter((m) => m <= N);
const runReport = [];
let mi = 0;
for (let i = 1; i < N; i++) {
  const b = bit(i);
  if (b === cur) len++;
  else { if (len > runMax[cur]) runMax[cur] = len; cur = b; len = 1; }
  if (mi < marks.length && i + 1 === marks[mi]) {
    const r0 = Math.max(runMax[0], cur === 0 ? len : 0);
    const r1 = Math.max(runMax[1], cur === 1 ? len : 0);
    runReport.push([marks[mi], r0, r1]);
    mi++;
  }
}
console.log('longest run of white / black, by prefix length:');
for (const [m, r0, r1] of runReport) console.log(`  N=${m}  white ${r0}  black ${r1}`);

// (2) worst block excess |2c - L| / L over all blocks of length L in [0,N)
console.log('\nworst |2c-L|/L over every block of length L in [0,N):');
const pre = new Int32Array(N + 1);
for (let i = 0; i < N; i++) pre[i + 1] = pre[i] + bit(i);
for (const L of [16, 64, 256, 1024, 4096, 16384]) {
  let worst = 0, at = 0;
  for (let M = 0; M + L <= N; M++) {
    const c = pre[M + L] - pre[M];
    const e = Math.abs(2 * c - L) / L;
    if (e > worst) { worst = e; at = M; }
  }
  console.log(`  L=${String(L).padStart(6)}  worst ${worst.toFixed(4)} at M=${at}`);
}

// (3) the excess itself, and what a cut sequence would have to beat
console.log('\nexcess |2*count(N) - N| and its ratio to N:');
for (const m of [100, 1000, 10000, 100000, 400000].filter((x) => x <= N)) {
  const e = Math.abs(2 * pre[m] - m);
  console.log(`  N=${String(m).padStart(7)}  excess ${String(e).padStart(6)}  ratio ${(e / m).toFixed(6)}`);
}
