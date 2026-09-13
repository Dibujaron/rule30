// Astrolabe, 2026-09-13. astrolabe2_dag2.mjs with a width cap, so the controls
// can be measured without the heap dying, plus the exponential fit for rule 30.
//
// Reads the same object as dag2: the state-based refutation of the rung-2
// alternation family, state = the two frontier anti-diagonals truncated to the
// only depths ever read. dag2 established, for rule 30 at a = 1..18: max width
// 8,8,16,16,56,120,271,283,3928,4440,4760,5128,8192,25288,50688,155096,809408,
// 809408 -- i.e. exponential in a, log2 of the width running 3.0 to 19.6.
//
// The point of this script is the control: do the other nonaffine left-permutive
// rules behave the same way? If they do, "the state-based refutation of the cone
// family is exponential" is a fact about a class of rules and not about rule 30.

// DEFECT, NAMED RATHER THAN REMOVED. The final block ("and the affine ones")
// breaks its L-loop on `r.capped || !r.sat` and then prints the last satisfiable L,
// so a WIDTH EXPLOSION and an UNSATISFIABLE instance print the same number. It
// reported f(6) = 19 for rule 60, which is a cap: brute force over every assignment
// (explorer/astrolabe2_check60.mjs) reaches the test cap of 26 at every right
// extent, so rule 60's family is unbounded. Rule 240's 8 is a genuine bound and
// agrees with brute force at R = 6, 10, 14. Read that block's numbers as
// "satisfiable at least this far" and nothing more.
const WIDTH_CAP = 400_000;

function table(r) { const t = new Uint8Array(8); for (let i = 0; i < 8; i++) t[i] = (r >> i) & 1; return t; }

function advance(tab, Ap, Ac, v, L) {
  const An = new Uint8Array(L + 1);
  An[0] = v;
  for (let s = 1; s <= L; s++) An[s] = tab[4 * Ap[s - 1] + 2 * Ac[s - 1] + An[s - 1]];
  return An;
}

function run(rule, a, startBit, L) {
  const tab = table(rule);
  const z = new Uint8Array(L + 1);
  let states = new Map([['z', [z, z]]]);
  let sum = 0, maxw = 0, reached = 0, capped = false;
  for (let j = 0; j <= a + L; j++) {
    const k = j - a;
    if (k >= L) break;
    const next = new Map();
    for (const [, [Ap, Ac]] of states) {
      for (let v = 0; v < 2; v++) {
        const An = advance(tab, Ap, Ac, v, L);
        if (k >= 0 && An[k] !== ((k + startBit) & 1)) continue;
        const kk = Ac.join('') + '|' + An.join('');
        if (!next.has(kk)) next.set(kk, [Ac, An]);
      }
    }
    states = next;
    if (states.size === 0) return { sat: false, maxw, sum, capped };
    if (states.size > WIDTH_CAP) { capped = true; return { sat: null, maxw: states.size, sum, capped }; }
    if (k >= 0) reached = k + 1;
    sum += states.size;
    if (states.size > maxw) maxw = states.size;
  }
  return { sat: reached >= L, maxw, sum, capped };
}

function fOf(rule, a, cap) {
  let best = 0;
  for (const s of [0, 1]) {
    for (let L = 1; L <= cap; L++) {
      const r = run(rule, a, s, L);
      if (r.capped) return { f: best, capped: true };
      if (!r.sat) break;
      if (L > best) best = L;
    }
  }
  return { f: best, capped: false };
}

console.log('# state-based refutation width, by rule. affine left-permutive rules give a');
console.log('# SATISFIABLE family (no refutation at all) and are omitted.');
console.log('# rule    a   f(a)   maxwidth  log2   sumwidth  capped');
for (const rule of [30, 120, 180]) {
  for (let a = 2; a <= 20; a += 2) {
    const { f, capped: fc } = fOf(rule, a, 60);
    if (fc) { console.log(`${String(rule).padStart(5)} ${String(a).padStart(5)}    (width cap hit while finding f)`); break; }
    const L = f + 1;
    let maxw = 0, sum = 0, cap = false;
    for (const s of [0, 1]) {
      const r = run(rule, a, s, L);
      maxw = Math.max(maxw, r.maxw); sum += r.sum; cap = cap || r.capped;
    }
    console.log(
      `${String(rule).padStart(5)} ${String(a).padStart(5)} ${String(f).padStart(6)} ${String(maxw).padStart(10)} ` +
      `${Math.log2(maxw).toFixed(2).padStart(5)} ${String(sum).padStart(10)}  ${cap ? 'CAP' : '-'}`
    );
    if (cap) break;
  }
  console.log('');
}

console.log('# and the affine ones, to show the family is satisfiable rather than hard');
console.log('# rule   a   longest alternating block found within L <= 55');
for (const rule of [60, 90, 150, 240]) {
  const a = 6;
  let best = 0;
  for (const s of [0, 1]) {
    for (let L = 1; L <= 55; L++) {
      const r = run(rule, a, s, L);
      if (r.capped || !r.sat) break;
      if (L > best) best = L;
    }
  }
  console.log(`${String(rule).padStart(5)} ${String(a).padStart(4)}   ${best}${best >= 55 ? '  (no bound found; satisfiable at every L tested)' : ''}`);
}
