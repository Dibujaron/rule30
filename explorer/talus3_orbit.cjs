/**
 * The constraint class that actually matches the settled region.
 *
 * The rings of explorer/mmc_pow2.cjs are spatially periodic; the settled
 * picture is not.  What the settled picture IS (crystal 44/47, Rowland 2006
 * section 6) is a sequence of periodic words S_k, one per left diagonal,
 * obeying the diagonal recurrence
 *
 *     S_{k+2}(i+1) = S_k(i+2) XOR ( S_{k+1}(i+1) OR S_{k+2}(i) ),
 *
 * with S_k of period dividing 2^a.  When S_{k+1} has a black cell the driver
 * resets and S_{k+2} is UNIQUE, so with no identically-white diagonal the map
 * (S_k, S_{k+1}) -> (S_{k+1}, S_{k+2}) is deterministic and the whole class is
 * the orbit space of that map on pairs of period-L words.  The seed's own
 * settled words are one orbit of it.
 *
 * So this is the same DP measured over the right family: shear-periodic
 * backgrounds (cell (t+L, x-L) = cell (t,x)) rather than ring-periodic ones.
 *
 *   node explorer/talus3_orbit.cjs
 *
 * Reports, per period L: the max exact front speed over all orbits, and the
 * amplitude 2E = max_t (2*advances(t) - t), which is the additive constant the
 * onset induction must pay.  Nothing here is a proof.
 */
'use strict';

const bit = (w, i, L) => (w >> (((i % L) + L) % L)) & 1;

/** next settled word from (u, v) at period L; null if it is not L-periodic. */
function nextWord(u, v, L) {
  // x(i+1) = a(i) xor (b(i) or x(i)), a(i) = u(i+2), b(i) = v(i+1)
  // solve for the L-periodic solution; with some b(i)=1 it is unique.
  let x0 = 0;
  // find a reset index: b(i)=1 gives x(i+1) = !a(i)
  let reset = -1;
  for (let i = 0; i < L; i++) if (bit(v, i + 1, L) === 1) { reset = i; break; }
  if (reset < 0) return null; // v identically white: not admissible here
  // start just after the reset and run a full period
  const x = new Array(L + 1);
  let idx = reset + 1;
  let cur = bit(u, reset + 2, L) ^ 1;
  const vals = new Map();
  vals.set(((idx % L) + L) % L, cur);
  for (let s = 1; s < L; s++) {
    const i = idx + s - 1;
    const a = bit(u, i + 2, L), b = bit(v, i + 1, L);
    cur = a ^ (b | cur);
    vals.set((((i + 1) % L) + L) % L, cur);
  }
  let w = 0;
  for (let i = 0; i < L; i++) w |= (vals.get(i) || 0) << i;
  // verify L-periodicity of the solution
  for (let i = 0; i < L; i++) {
    const a = bit(u, i + 2, L), b = bit(v, i + 1, L);
    if (bit(w, i + 1, L) !== (a ^ (b | bit(w, i, L)))) return null;
  }
  return w;
}

/** background cell (t,x): diagonal k = t+x, index j = -x. */
function makeBackground(S, L) {
  return (t, x) => bit(S[t + x], -x, L);
}

/** check the generated background really obeys rule 30 on a window.
 *  Only where every diagonal index it reads is in range: k = t+x runs from
 *  tLo+xLo-1 to tHi+xHi+1 and S is defined for k >= 0 only. */
function checkRule30(S, L, tLo, tHi, xLo, xHi) {
  const cell = makeBackground(S, L);
  let bad = 0, n = 0;
  for (let t = tLo; t < tHi; t++) {
    for (let x = xLo; x <= xHi; x++) {
      if (t + x - 1 < 0 || t + x + 2 >= S.length) continue;
      const l = cell(t, x - 1), c = cell(t, x), r = cell(t, x + 1);
      if (cell(t + 1, x) !== (l ^ (c | r))) bad++;
      n++;
    }
  }
  return { bad, n };
}

function runDP(cell, L, H, steps) {
  let m = 0, t = 4; // start clear of k < 0
  let set = new Uint8Array(H); set.fill(1);
  let maxE2 = 0, argmax = 0;
  const seen = new Map();
  let cycle = null;
  for (let step = 0; step < steps; step++) {
    const E2 = (-m) * 2 - step;
    if (E2 > maxE2) { maxE2 = E2; argmax = step; }
    const st = `${t + m}|${((m % L) + L) % L}|${set.join('')}`;
    if (cycle === null && seen.has(st)) { const [s0, m0] = seen.get(st); cycle = { num: m0 - m, den: step - s0 }; }
    if (!seen.has(st)) seen.set(st, [step, m]);
    const hits = [];
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o, Lc = cell(t, x - 1), C = cell(t, x), R = cell(t, x + 1);
      if (Lc === 0) hits.push([x - 1, false]);
      else if (C === 0 && R === 0) hits.push([x, false]);
      else if (C === 0 && R === 1) hits.push([x + 1, true]);
      else hits.push([x, true]);
    }
    let mNew = Infinity;
    for (const [v] of hits) if (v < mNew) mNew = v;
    const next = new Uint8Array(H);
    for (const [v, isRay] of hits) {
      if (!isRay) { const o = v - mNew; if (o >= 0 && o < H) next[o] = 1; }
      else { for (let o = Math.max(0, v - mNew); o < H; o++) next[o] = 1; }
    }
    m = mNew; set = next; t++;
  }
  return { cycle, maxE2, argmax, advances: -m, steps };
}

const STEPS = 800;

for (const L of [2, 4, 8]) {
  const M = 1 << L;
  const seenPair = new Uint8Array(M * M);
  let orbits = 0, dead = 0;
  let best = null, worstAmp = null;
  for (let u = 0; u < M; u++) {
    for (let v = 0; v < M; v++) {
      if (seenPair[u * M + v]) continue;
      // walk the orbit forward marking pairs; abort if a white diagonal appears
      const S = [u, v];
      let ok = true;
      const KMAX = STEPS + 6 * L + 60;
      for (let k = 0; k + 2 <= KMAX; k++) {
        const w = nextWord(S[k], S[k + 1], L);
        if (w === null) { ok = false; break; }
        S.push(w);
        if (k < 4 * M) seenPair[S[k] * M + S[k + 1]] = 1;
      }
      seenPair[u * M + v] = 1;
      if (!ok) { dead++; continue; }
      orbits++;
      const chk = checkRule30(S, L, 30, 70, -20, 20);
      if (chk.bad !== 0) { console.log(`  !! background is not a rule 30 evolution: ${chk.bad}/${chk.n} at L=${L} u=${u} v=${v}`); continue; }
      const cell = makeBackground(S, L);
      const r = runDP(cell, L, 6 * L + 40, STEPS);
      const sp = r.cycle ? r.cycle.num / r.cycle.den : r.advances / r.steps;
      const rec = { sp, u, v, cyc: r.cycle, E2: r.maxE2, at: r.argmax };
      if (best === null || rec.sp > best.sp) best = rec;
      if (worstAmp === null || rec.E2 > worstAmp.E2) worstAmp = rec;
    }
  }
  const f = (r) => `${r.cyc ? `${r.cyc.num}/${r.cyc.den}` : '~'} = ${r.sp.toFixed(6)}`;
  console.log(`L = ${L}: ${orbits} admissible orbit starts, ${dead} pairs reaching a white diagonal`);
  if (!best) { console.log('  no admissible orbit'); continue; }
  console.log(`  max exact speed ${f(best)}   from pair (u=${best.u.toString(2).padStart(L, '0')}, v=${best.v.toString(2).padStart(L, '0')})`);
  console.log(`  max amplitude 2E = ${worstAmp.E2} at step ${worstAmp.at}  (pair u=${worstAmp.u.toString(2).padStart(L, '0')}, v=${worstAmp.v.toString(2).padStart(L, '0')}, speed ${worstAmp.sp.toFixed(6)})`);
}
