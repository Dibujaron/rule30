// Astrolabe, 2026-09-13. Corrected DAG-width measurement for the rung-2
// alternation family.
//
// WHAT WAS WRONG WITH astrolabe2_dag.mjs. Its state carried the two frontier
// anti-diagonals to depth 70, where only depths 0 .. f(a)+1 are ever read --
// f(a) is about 1.2a, so at a = 16 that is 20 relevant depths and 50 irrelevant
// ones. Two states differing only in the irrelevant tail are behaviourally
// identical and were counted separately, so the "max width 155096 at a = 16"
// was a count of an unstated and mostly dead state space, and it ran out of
// memory at a = 20. Rowan's whole SAT sweep to a = 40 took 37.3 s
// (explorer/rowan_rung2_cores.txt line 64), which is the tell: a refutation the
// solver finds in milliseconds cannot need 10^5 states.
//
// THE STATE, truncated correctly. Testing a target block of length L, the only
// column bits ever read are 0 .. L-1, so the frontier need only be carried to
// depth L. State = (A_{k-1}, A_k) on depths 0 .. L. Two survivors sharing it
// produce identical bits 0 .. L-1 under every continuation, so the count per
// level is an exact width for the natural state-based refutation, and the sum
// of the widths bounds its size.

function table(r) {
  const t = new Uint8Array(8);
  for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1;
  return t;
}

function advance(tab, Aprev, Acur, newCell, L) {
  const Anew = new Uint8Array(L + 1);
  Anew[0] = newCell;
  for (let s = 1; s <= L; s++) {
    Anew[s] = tab[4 * Aprev[s - 1] + 2 * Acur[s - 1] + Anew[s - 1]];
  }
  return Anew;
}

// Is there a configuration in the class (white left of -a, free from -a on)
// whose centre column matches the target for its first L bits?
// Returns { sat, maxWidth, sumWidth, widths }.
function run(rule, a, startBit, L) {
  const tab = table(rule);
  const z = new Uint8Array(L + 1);
  let states = new Map([['z', [z, z]]]);
  const widths = [];
  let sum = 0, maxw = 0, reached = 0;
  for (let j = 0; j <= a + L; j++) {
    const k = j - a;
    if (k >= L) break;                     // bits 0 .. L-1 all checked
    const next = new Map();
    for (const [, [Aprev, Acur]] of states) {
      for (let v = 0; v < 2; v++) {
        const Anew = advance(tab, Aprev, Acur, v, L);
        if (k >= 0 && Anew[k] !== ((k + startBit) & 1)) continue;
        const kk = Acur.join('') + '|' + Anew.join('');
        if (!next.has(kk)) next.set(kk, [Acur, Anew]);
      }
    }
    states = next;
    if (states.size === 0) return { sat: false, maxWidth: maxw, sumWidth: sum, widths, died: k };
    if (k >= 0) { widths.push(states.size); reached = k + 1; }
    sum += states.size;
    if (states.size > maxw) maxw = states.size;
  }
  return { sat: reached >= L, maxWidth: maxw, sumWidth: sum, widths, died: -1 };
}

function fOf(rule, a, cap) {
  let best = 0;
  for (const s of [0, 1]) {
    for (let L = 1; L <= cap; L++) {
      if (!run(rule, a, s, L).sat) break;
      if (L > best) best = L;
    }
  }
  return best;
}

const pub = [8,8,8,8,9,10,10,17,17,17,17,17,17,20,22,26,26,26,36,36,36,36,36,36,36,36,
             36,36,38,39,40,41,42,42,43,45,46,48,49,49];

console.log('# rule 30: f(a), and the width of the state-based refutation at L = f(a)+1');
console.log('#   a   f(a)  pub  agree   maxwidth  sumwidth   vars~L^2  log2(maxwidth)');
for (let a = 1; a <= 40; a++) {
  const f = fOf(30, a, 60);
  const L = f + 1;
  let maxw = 0, sum = 0;
  for (const s of [0, 1]) {
    const r = run(30, a, s, L);
    if (r.sat) { console.log(`   a=${a}: UNEXPECTEDLY SAT at L=${L} phase ${s}`); }
    maxw = Math.max(maxw, r.maxWidth); sum += r.sumWidth;
  }
  const p = a <= pub.length ? pub[a - 1] : null;
  console.log(
    `${String(a).padStart(5)} ${String(f).padStart(6)} ${String(p ?? '-').padStart(4)} ` +
    `${(p === null ? '-' : (f === p ? 'ok' : 'MISMATCH')).padStart(8)} ` +
    `${String(maxw).padStart(10)} ${String(sum).padStart(9)} ${String((L + 1) * (L + 1)).padStart(10)} ` +
    `  ${(Math.log2(Math.max(1, maxw))).toFixed(2)}`
  );
}
console.log('');

console.log('# the controls that can fire: the nonaffine left-permutive rules 120 and 180');
console.log('# rule    a   f(a)   maxwidth  sumwidth');
for (const rule of [120, 180]) {
  for (const a of [4, 8, 12, 16, 20, 24, 28, 32, 36, 40]) {
    const f = fOf(rule, a, 60);
    const L = f + 1;
    let maxw = 0, sum = 0;
    for (const s of [0, 1]) {
      const r = run(rule, a, s, L);
      maxw = Math.max(maxw, r.maxWidth); sum += r.sumWidth;
    }
    console.log(`${String(rule).padStart(5)} ${String(a).padStart(5)} ${String(f).padStart(6)} ${String(maxw).padStart(10)} ${String(sum).padStart(9)}`);
  }
}
console.log('');

console.log('# width profile at a = 30, rule 30, phase 0, L = f+1');
{
  const f = fOf(30, 30, 60);
  const r = run(30, 30, 0, f + 1);
  console.log(`   f(30) = ${f};  widths per level: ${r.widths.join(' ')}`);
  console.log(`   died at level k = ${r.died}`);
}
