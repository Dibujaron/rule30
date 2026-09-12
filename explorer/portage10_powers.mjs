// Portage, 2026-09-12.  The minimal transducer of E^t, where E = q0 is rule
// 30's right-edge map.  Two numbers per t:
//   m(t) = number of states       = number of DISTINCT SECTIONS of E^t
//   R(t) = states reachable from a cycle = the DEEP sections of E^t,
//          every one of which must lie in the nucleus of <q0,q1,q2>.
// A growing R(t) is a certificate that the group is not contracting, indexed
// by rule 30's own t-step map rather than by an arbitrary long word.

const TMAX = 20;

// automaton E: states 0=q0,1=q1,2=q2 ; q0=(q0,q2), q1=s(q0,q2), q2=s(q1,q2)
const APERM = [0, 1, 1];
const AD = [[0, 2], [0, 2], [1, 2]];   // AD[s][x] = section of state s at letter x

// element = {n, perm:Uint8Array, d0:Int32Array, d1:Int32Array} rooted at 0
function minimise(n, perm, d0, d1) {
  let cls = new Int32Array(n);
  for (let i = 0; i < n; i++) cls[i] = perm[i];
  let ncls = 2, rounds = 0;
  for (;;) {
    rounds++;
    const key = new Map(); const next = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      const k = cls[i] * 1000000007 + cls[d0[i]] * 1000003 + cls[d1[i]];
      const kk = k + ':' + cls[i] + ':' + cls[d0[i]] + ':' + cls[d1[i]];
      let v = key.get(kk);
      if (v === undefined) { v = key.size; key.set(kk, v); }
      next[i] = v;
    }
    if (key.size === ncls) break;
    ncls = key.size; cls = next;
    if (rounds > 200) { console.log('  !! refinement did not converge'); break; }
  }
  // relabel BFS from class of state 0
  const m = ncls;
  const rep = new Int32Array(m).fill(-1);
  for (let i = 0; i < n; i++) if (rep[cls[i]] < 0) rep[cls[i]] = i;
  const map = new Int32Array(m).fill(-1);
  const queue = [cls[0]]; map[cls[0]] = 0;
  const P = new Uint8Array(m), D0 = new Int32Array(m), D1 = new Int32Array(m);
  for (let h = 0; h < queue.length; h++) {
    const c = queue[h], i = rep[c];
    P[h] = perm[i];
    const a = cls[d0[i]], b = cls[d1[i]];
    if (map[a] < 0) { map[a] = queue.length; queue.push(a); }
    D0[h] = map[a];
    if (map[b] < 0) { map[b] = queue.length; queue.push(b); }
    D1[h] = map[b];
  }
  return { n: queue.length, perm: P.slice(0, queue.length), d0: D0.slice(0, queue.length), d1: D1.slice(0, queue.length) };
}

// left-multiply g by the automaton state a=0 (i.e. q0 * g)
function mulByE(g, aStart) {
  const idx = new Map(); const S = [], U = [];
  function id(s, u) { const k = s * g.n + u; let v = idx.get(k); if (v === undefined) { v = S.length; idx.set(k, v); S.push(s); U.push(u); } return v; }
  id(aStart, 0);
  const perm = [], d0 = [], d1 = [];
  for (let i = 0; i < S.length; i++) {
    const s = S[i], u = U[i], pg = g.perm[u];
    perm.push(APERM[s] ^ pg);
    d0.push(id(AD[s][0 ^ pg], g.d0[u]));
    d1.push(id(AD[s][1 ^ pg], g.d1[u]));
  }
  return minimise(S.length, Uint8Array.from(perm), Int32Array.from(d0), Int32Array.from(d1));
}

// states reachable from a cycle (= sections at arbitrarily deep vertices)
function deepStates(g) {
  // Tarjan-free: iterative Kosaraju-lite — find states on cycles via SCC using
  // an iterative Tarjan.
  const n = g.n, index = new Int32Array(n).fill(-1), low = new Int32Array(n), onstk = new Uint8Array(n);
  const stk = [], comp = new Int32Array(n).fill(-1); let idx = 0, nc = 0;
  const compSize = [], selfLoop = [];
  for (let root = 0; root < n; root++) {
    if (index[root] >= 0) continue;
    const work = [[root, 0]];
    while (work.length) {
      const fr = work[work.length - 1]; const v = fr[0];
      if (fr[1] === 0) { index[v] = low[v] = idx++; stk.push(v); onstk[v] = 1; }
      let recursed = false;
      while (fr[1] < 2) {
        const w = fr[1] === 0 ? g.d0[v] : g.d1[v]; fr[1]++;
        if (index[w] < 0) { work.push([w, 0]); recursed = true; break; }
        else if (onstk[w]) low[v] = Math.min(low[v], index[w]);
      }
      if (recursed) continue;
      if (low[v] === index[v]) {
        let size = 0, loop = false, w;
        do { w = stk.pop(); onstk[w] = 0; comp[w] = nc; size++; if (g.d0[w] === v || g.d1[w] === v) loop = true; } while (w !== v);
        compSize.push(size); selfLoop.push(size > 1 || loop || g.d0[v] === v || g.d1[v] === v);
        nc++;
      }
      work.pop();
      if (work.length) { const p = work[work.length - 1][0]; low[p] = Math.min(low[p], low[v]); }
    }
  }
  // states reachable from a cyclic component
  const seen = new Uint8Array(n); const q = [];
  for (let v = 0; v < n; v++) if (selfLoop[comp[v]] && compSize[comp[v]] > 0) { if (!seen[v]) { seen[v] = 1; q.push(v); } }
  for (let h = 0; h < q.length; h++) { const v = q[h]; for (const w of [g.d0[v], g.d1[v]]) if (!seen[w]) { seen[w] = 1; q.push(w); } }
  let c = 0; for (let v = 0; v < n; v++) if (seen[v]) c++;
  return { deep: c, comps: nc };
}

const published = [3, 7, 16, 35, 71, 141, 272, 517, 971, 1792, 3263, 5873, 10483, 18619, 32885, 57741, 100901, 175680, 304714, 526563];
console.log('t | m(t)=#sections of E^t | R(t)=#deep | sextant9 size | equal? | #SCCs (1 = strongly connected)');
let g = { n: 1, perm: Uint8Array.from([0]), d0: Int32Array.from([0]), d1: Int32Array.from([0]) }; // identity
for (let t = 1; t <= TMAX; t++) {
  const t0 = Date.now();
  g = mulByE(g, 0);
  const R = deepStates(g);
  const p = published[t - 1];
  console.log(`${t} | ${g.n} | ${R.deep} | ${p ?? '-'} | ${p === undefined ? '' : (p === g.n ? 'YES' : 'NO')} | ${R.comps}   (${Date.now() - t0} ms)`);
}
