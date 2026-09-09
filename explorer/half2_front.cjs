/**
 * Is the DP actually a bound on the real damage front, and is my localMove the
 * right automaton?  Two things, and the second exists so the first is not a
 * check that cannot fail.
 *
 *   node explorer/half2_front.cjs
 *
 * (a) VALIDITY.  Tile the background to a wide ring, flip one cell, evolve both
 *     under rule 30, and track F(t) = the leftmost cell where they disagree.
 *     The DP's min R(t), run on the SAME background, must satisfy
 *     min R(t) <= F(t) on every row.  It must also be TIGHT somewhere if the
 *     1/2 is to mean anything about the real front.
 * (b) MUTATION.  Re-run (a) with each of the four cases of the local law broken
 *     in turn.  Every mutant must be caught, otherwise (a) proves nothing.
 *
 * Nothing here is a proof.
 */
'use strict';
const L = require('./half2_lib.cjs');

// backgrounds worth testing: the pow2 maximiser (period-4 word 1011) and a
// random rule 30 ring.
function tile(word, copies) {
  const out = new Uint8Array(word.length * copies);
  for (let i = 0; i < out.length; i++) out[i] = word[i % word.length];
  return out;
}

/** DP run on an explicit background sequence, with a chosen local law. */
function dpMin(rowsOf, N, steps, H, law) {
  let m = 0;
  let set = new Uint8Array(H).fill(1);
  const trace = [0];
  for (let t = 0; t < steps; t++) {
    const row = rowsOf(t);
    const S = (x) => row[((x % N) + N) % N];
    const targets = [];
    let lo = Infinity;
    for (let o = 0; o < H; o++) {
      if (!set[o]) continue;
      const x = m + o;
      const [v, isRay] = law(S(x - 1), S(x), S(x + 1), o);
      targets.push([v, isRay]);
      if (v < lo) lo = v;
    }
    const next = new Uint8Array(H);
    for (const [v, isRay] of targets) {
      const o = v - lo;
      if (isRay) { for (let j = Math.max(0, o); j < H; j++) next[j] = 1; }
      else if (o >= 0 && o < H) next[o] = 1;
    }
    m += lo; set = next;
    trace.push(m);
  }
  return trace;
}

const lawTrue = (Lc, C, R, o) => {
  if (Lc === 0) return [o - 1, false];
  if (C === 0 && R === 0) return [o, false];
  if (C === 0 && R === 1) return [o + 1, true];
  return [o, true];
};
const mutants = {
  'case (0,*,*) -> stay instead of advance': (Lc, C, R, o) => (Lc === 0 ? [o, false] : lawTrue(Lc, C, R, o)),
  'case (1,0,0) -> advance instead of stay': (Lc, C, R, o) => (Lc === 1 && C === 0 && R === 0 ? [o - 1, false] : lawTrue(Lc, C, R, o)),
  'case (1,0,1) -> ray at o instead of o+1': (Lc, C, R, o) => (Lc === 1 && C === 0 && R === 1 ? [o, true] : lawTrue(Lc, C, R, o)),
  'case (1,1,*) -> ray at o+1 instead of o': (Lc, C, R, o) => (Lc === 1 && C === 1 ? [o + 1, true] : lawTrue(Lc, C, R, o)),
  'case (1,1,*) -> point instead of ray': (Lc, C, R, o) => (Lc === 1 && C === 1 ? [o, false] : lawTrue(Lc, C, R, o)),
};

function trial(name, word, steps, flipFrac, law) {
  const copies = Math.ceil((6 * steps + 400) / word.length);
  const N = word.length * copies;
  const flipAt = Math.floor(N * flipFrac / word.length) * word.length;  // keep the phase
  const bg0 = tile(word, copies);
  // the background rows, precomputed
  const rows = [bg0];
  for (let t = 1; t <= steps + 2; t++) rows.push(L.step30(rows[t - 1]));
  const rowsOf = (t) => rows[t];

  const pic = Uint8Array.from(bg0);
  pic[flipAt] ^= 1;
  let cur = pic;
  const trace = dpMin(rowsOf, N, steps, 400, law);
  let violations = 0, tight = 0, firstViol = null;
  const fronts = [];
  for (let t = 0; t < steps; t++) {
    // leftmost disagreement, searched in a window around the expected front
    const bg = rows[t];
    let F = null;
    for (let x = flipAt - steps - 5; x <= flipAt + steps + 5; x++) {
      const i = ((x % N) + N) % N;
      if (cur[i] !== bg[i]) { F = x; break; }
    }
    if (F === null) break;                     // damage died out entirely
    fronts.push(F);
    const minR = flipAt + trace[t];            // DP started with min R = flipAt
    if (minR > F) { violations++; if (firstViol === null) firstViol = { t, F, minR }; }
    if (minR === F) tight++;
    cur = L.step30(cur);
  }
  const rowsSeen = fronts.length;
  const frontSpeed = rowsSeen ? (flipAt - fronts[rowsSeen - 1]) / rowsSeen : 0;
  const dpSpeed = rowsSeen ? -trace[rowsSeen - 1] / rowsSeen : 0;
  return { name, violations, tight, rowsSeen, frontSpeed, dpSpeed, firstViol };
}

const WORDS = {
  'pow2 maximiser 1011 (period 4)': [1, 0, 1, 1],
  'random rule 30 ring width 64': (() => {
    let s = 777777 >>> 0;
    const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
    const w = new Uint8Array(64); for (let i = 0; i < 64; i++) w[i] = rnd() & 1;
    let r = w; for (let i = 0; i < 500; i++) r = L.step30(r);
    return Array.from(r);
  })(),
};

const STEPS = 1200;
for (const [wname, word] of Object.entries(WORDS)) {
  console.log(`\n=== background: ${wname} ===`);
  const base = trial("true law", word, STEPS, 0.6, lawTrue);
  console.log(`  true law:  rows ${base.rowsSeen}  minR > F on ${base.violations} rows (must be 0)  minR == F on ${base.tight} rows`);
  console.log(`             real front speed ${base.frontSpeed.toFixed(6)}   DP speed ${base.dpSpeed.toFixed(6)}`);
  // A one-sided screen is not a screen.  The "min R <= F" check can only catch
  // mutants that make the DP too OPTIMISTIC; a mutant that makes it too
  // pessimistic keeps min R <= F and is caught instead by the DP's speed moving
  // away from the real front's.  Both are reported.
  for (const [mname, law] of Object.entries(mutants)) {
    const r = trial(mname, word, STEPS, 0.6, law);
    const byBound = r.violations > 0;
    const bySpeed = Math.abs(r.dpSpeed - base.dpSpeed) > 1e-9;
    const caught = byBound || bySpeed;
    console.log(`  MUTANT ${caught ? 'CAUGHT' : '*** MISSED ***'}  by-bound ${byBound ? 'Y' : 'n'} (${r.violations} viol)  by-speed ${bySpeed ? 'Y' : 'n'} (${r.dpSpeed.toFixed(6)} vs ${base.dpSpeed.toFixed(6)})  ${mname}`);
  }
}
