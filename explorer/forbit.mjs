/**
 * The settled words of the left diagonals from the recurrence alone, to
 * diagonal 87867 and beyond, with the branch bits read from the engine.
 *
 *   node explorer/forbit.mjs
 *
 * S_k = F(S_{k-2}, S_{k-1}) (settledwords.mjs) is single-valued except when
 * S_{k-1} is white, where the two solutions are either shifts of each other
 * (period doubles) or complements (period stays). At every such step this
 * script reads the seed's diagonal k from the engine, past its onset, to pick
 * the branch the seed took, and otherwise never consults the engine. So the
 * orbit is a computation with the recurrence, checked against the picture
 * only at the branch points. It reports
 *
 *   - every branch point, its type, and the branch taken (NKS p. 871 and
 *     Rowland 2006 §6 give doublings at 3, 8, 29, 400, 87867 and a
 *     complement-type branch at 53209, all computed from the picture);
 *   - whether any consecutive pair (S_{k-1}, S_k) repeats (it cannot: the
 *     recurrence runs backwards, and a repeat would put two eventually-white
 *     diagonals side by side), and how many distinct single words occur;
 *   - for k = 29 and 400, an index past the onset where the diagonal fails
 *     the period it had before the doubling, for the kernel to check.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { centerBitIndex, rows } from './rule30.mjs';
import { F, same, at, key, isWhite, settle } from './settledwords.mjs';

const K_MAX = 200000;          // run the orbit this far
const T = 137000;              // engine rows; enough to read diagonal 87867 past its onset
const WIN = 64;                // cells read per branch point
const j0 = (k) => Math.ceil(0.55 * k) + 16;   // where the read starts: past every measured onset

// --- engine: the window D_k(j0(k) .. j0(k)+WIN) for every k with k + j0(k) + WIN <= T
const t0 = Date.now();
const KREAD = Math.floor((T - WIN - 16) / 1.55) - 2;
const win = new Array(KREAD + 1);
for (let k = 0; k <= KREAD; k++) win[k] = new Uint8Array(WIN);
const base = centerBitIndex(T);
{
  let t = 0;
  for (const row of rows(T)) {
    // k with j0(k) <= t - k < j0(k) + WIN, i.e. k + j0(k) in (t - WIN, t]
    const kLo = Math.max(0, Math.floor((t - WIN - 16) / 1.55) - 2), kHi = Math.min(KREAD, Math.ceil(t / 1.55) + 2);
    if (kLo <= kHi) {
      const posLo = base - (t - kLo);            // smallest bit position needed (largest j)
      const width = kHi - kLo + 1;
      const slice = ((row >> BigInt(posLo)) & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');
      for (let k = kLo; k <= kHi; k++) {
        const j = t - k, m = j - j0(k);
        if (m >= 0 && m < WIN) win[k][m] = slice.charCodeAt(width - 1 - (k - kLo)) === 49 ? 1 : 0;
      }
    }
    t++;
  }
}
console.log(`engine: ${T} rows, windows for diagonals 0..${KREAD} (${Date.now() - t0} ms)`);

const matches = (S, k) => { const w = win[k]; for (let m = 0; m < WIN; m++) if (at(S, j0(k) + m) !== w[m]) return false; return true; };

// --- the orbit
const S = [{ p: 1, onset: 0, word: Uint8Array.of(1) }, { p: 1, onset: 0, word: Uint8Array.of(1) }];
const pairs = new Set([key(S[0]) + '|' + key(S[1])]);
const singles = new Set([key(S[0])]);
const branches = [];
let repeat = null, pmax = 1;
for (let k = 2; k <= K_MAX; k++) {
  const sols = F(S[k - 2], S[k - 1]);
  let s;
  if (sols.length === 1) s = sols[0];
  else {
    if (k > KREAD) { console.log(`branch at k = ${k} beyond the engine's reach; stopping`); break; }
    const ok = sols.map((x) => matches(x, k));
    const type = sols[0].p > S[k - 2].p ? 'shift' : 'complement';
    const which = ok[0] && !ok[1] ? 0 : ok[1] && !ok[0] ? 1 : -1;
    branches.push({ k, type, which, ok, pa: S[k - 2].p, pk: sols[0].p });
    if (which < 0) { console.log(`branch at k = ${k}: engine window matches ${ok.filter(Boolean).length} candidates; stopping`); break; }
    s = sols[which];
  }
  S.push(s);
  if (s.p > pmax) pmax = s.p;
  singles.add(key(s));
  const pk = key(S[k - 1]) + '|' + key(s);
  if (pairs.has(pk) && !repeat) repeat = k;
  pairs.add(pk);
  // spot checks against the engine at non-branch points
  if (k <= KREAD && (k % 5000 === 0 || k === 2400 || k === 53210 || k === 87868) && !matches(s, k)) console.log(`   MISMATCH with the engine at k = ${k}`);
}
console.log(`orbit to k = ${S.length - 1}; largest period ${pmax}; distinct pairs ${pairs.size} of ${S.length - 1}${repeat ? ' (FIRST REPEAT at k = ' + repeat + ')' : ' (no repeated pair)'}; distinct single words ${singles.size}`);
console.log('branch points:');
for (const b of branches) console.log(`   k = ${String(b.k).padStart(6)}: S_{k-1} white, S_{k-2} period ${b.pa}, S_k period ${b.pk}, ${b.type}-type, branch ${b.which} taken (engine window matched [${b.ok.join(',')}])`);
const firsts = [1, 2, 4, 8, 16, 32, 64].map((p) => `${p}@${S.findIndex((s) => s.p === p)}`);
console.log(`first diagonal with each period: ${firsts.join(' ')}`);
console.log(`spot checks at k = 2400, 5000, ..., 53210, 87868 against the engine: done (mismatches are printed above if any)`);

// --- windows for the kernel: k = 29 (period 8, not 4) and k = 400 (period 16, not 8)
for (const [k, pOld] of [[29, 4], [400, 8]]) {
  // read the diagonal fully from the engine for this k to get its onset
  const N = 4 * k + 200;
  const d = new Uint8Array(N - k);
  let t = 0;
  const b2 = centerBitIndex(N);
  for (const row of rows(N)) { if (t >= k) d[t - k] = Number((row >> BigInt(b2 - (t - k))) & 1n); t++; }
  const st = settle(d);
  let jBad = -1;
  for (let j = st.onset; j + pOld < d.length; j++) if (d[j] !== d[j + pOld]) { jBad = j; break; }
  console.log(`k = ${k}: engine onset ${st.onset}, period ${st.p}; first j >= onset with D_k(j) != D_k(j+${pOld}): j = ${jBad} (cells at rows ${jBad + k} and ${jBad + pOld + k})`);
}
console.log(`(${Date.now() - t0} ms)`);
