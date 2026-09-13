// Talus, 2026-09-13. The rule control nobody has run on the period ladder.
//
// Obstruction 33/35 leaves the period ladder as the one candidate of the shape a
// P1 proof must have: f(p, a) < infinity for all p, a implies P1, where f(p, a) is
// the longest p-periodic block of the centre column of a configuration white at
// every x < -a and black at x = -a.
//
// talus14_ladder.mjs [I] found rule 120 satisfying it with comparable constants at
// every (p, a) tested. If that survives a bigger sweep, the ladder is NOT a
// statement about the OR entries -- it is rule-generic, and the OR entry is spent
// somewhere else. This file runs (a) rule 120 deeper and (b) all 256 rules.
//
// Engine control [V]: rule 30's own ladder row must reproduce obstruction 35's
// published f(3, a) = 8, 10, 9, 9, 10, 14, 13, ... and f(1, a) = a + 2.

function ladderTable(rule, ps, a, cap) {
  // class: row 0 white at x < -a, black at -a, free on [-a+1, cap]
  const side = cap + 3, w = 2 * side + 3, mid = side + 1;
  const freeLo = -a + 1, nFree = cap - freeLo + 1;
  const best = new Map(); for (const p of ps) best.set(p, 0);
  const cur = new Uint8Array(w), nxt = new Uint8Array(w);
  const col = new Uint8Array(cap + 2);
  for (let m = 0; m < (1 << nFree); m++) {
    cur.fill(0); nxt.fill(0);
    cur[mid - a] = 1;
    for (let k = 0; k < nFree; k++) if ((m >> k) & 1) cur[mid + freeLo + k] = 1;
    let c = cur, n = nxt;
    col[0] = c[mid];
    for (let s = 1; s <= cap + 1; s++) {
      for (let i = 1; i < w - 1; i++) n[i] = (rule >> (4 * c[i - 1] + 2 * c[i] + c[i + 1])) & 1;
      n[0] = 0; n[w - 1] = 0;
      const t = c; c = n; n = t;
      col[s] = c[mid];
    }
    if (c !== cur) { /* buffers swapped an odd number of times; harmless, both are scratch */ }
    for (const p of ps) {
      let L = 0;
      while (L + p <= cap + 1 && col[L + p] === col[L]) L++;
      // longest prefix length over which period p holds = L + p cells, index 0..L+p-1
      const len = L + p;
      if (len > best.get(p)) best.set(p, Math.min(len, cap + 2));
    }
  }
  return best;
}

console.log('[V] ENGINE CONTROL: rule 30\'s own ladder against obstruction 35\'s published table.');
{
  const pub3 = [8, 10, 9, 9, 10, 14];        // f(3, a) for a = 1..6, obstruction 35
  const got3 = [], got1 = [];
  for (let a = 1; a <= 6; a++) {
    const b = ladderTable(30, [1, 3], a, 22 - a);
    got3.push(b.get(3)); got1.push(b.get(1));
  }
  console.log(`    f(3, a), a = 1..6   measured : ${got3.join(', ')}`);
  console.log(`                       published : ${pub3.join(', ')}    ${got3.join()===pub3.join() ? 'MATCH' : 'MISMATCH'}`);
  console.log(`    f(1, a), a = 1..6   measured : ${got1.join(', ')}   (obstruction 35: f(1,a) = a + 2)`);
  const want1 = [3, 4, 5, 6, 7, 8];
  console.log(`                        expected : ${want1.join(', ')}    ${got1.join()===want1.join() ? 'MATCH' : 'MISMATCH'}`);
}

console.log('\n[J] RULE 120 ON THE SAME LADDER, DEEPER.  Its seed picture is a bare ray, so if the');
console.log('    ladder were about the OR entries this table would be all "cap".\n');
console.log('       a     p=1    p=2    p=3    p=4      rule 30 for comparison (p=1..4)');
for (let a = 1; a <= 5; a++) {
  const cap = 22 - a;
  const b120 = ladderTable(120, [1, 2, 3, 4], a, cap);
  const b30 = ladderTable(30, [1, 2, 3, 4], a, cap);
  const fm = (b) => [1, 2, 3, 4].map(p => (b.get(p) >= cap + 2 ? 'cap' : String(b.get(p))).padStart(5)).join('  ');
  console.log(`      ${a}   ${fm(b120)}      ${fm(b30)}`);
}

console.log('\n[K] ALL 256 RULES, a = 1, p = 1..3, cap 14.  "satisfies" = every f(p,1) is bounded');
console.log('    below the cap, i.e. the cone visibly bounds the block.\n');
{
  const cap = 14;
  const sat = [];
  for (let r = 0; r < 256; r++) {
    const b = ladderTable(r, [1, 2, 3], 1, cap);
    let ok = true;
    for (const p of [1, 2, 3]) if (b.get(p) >= cap + 2) ok = false;
    if (ok) sat.push(r);
  }
  console.log(`    rules whose cone bounds every p = 1,2,3 block at a = 1 : ${sat.length} / 256`);
  console.log(`    rule 30 among them : ${sat.includes(30) ? 'YES' : 'NO'}      rule 120 : ${sat.includes(120) ? 'YES' : 'NO'}      rule 110 : ${sat.includes(110) ? 'YES' : 'NO'}`);
  console.log(`    rule 90 : ${sat.includes(90) ? 'YES' : 'NO'}      rule 150 : ${sat.includes(150) ? 'YES' : 'NO'}      rule 45 : ${sat.includes(45) ? 'YES' : 'NO'}      rule 86 : ${sat.includes(86) ? 'YES' : 'NO'}`);
  if (sat.length <= 140) console.log(`    they are: ${sat.join(', ')}`);
}

console.log('\n[L] WHERE THE OR ENTRY IS ACTUALLY SPENT.');
console.log('    The ladder implies P1 only through this step: if the centre column were p-periodic');
console.log('    from time N, then ROW N LIES IN THE CLASS -- white at x < -N and BLACK AT -N.');
console.log('    The second half is evolve_left_edge, which is the (0,0,1) entry and is false for');
console.log('    rule 120.  So check: for each rule, is row N of its own picture in its own class?\n');
{
  const T = 400, W = 2 * T + 9, MID = T + 4;
  function pic(rule) {
    const rows = []; let cur = new Uint8Array(W), nxt = new Uint8Array(W); cur[MID] = 1; rows.push(cur.slice());
    for (let s = 1; s <= T; s++) { for (let i = 1; i < W - 1; i++) nxt[i] = (rule >> (4 * cur[i - 1] + 2 * cur[i] + cur[i + 1])) & 1; nxt[0] = 0; nxt[W - 1] = 0; const t = cur; cur = nxt; nxt = t; rows.push(cur.slice()); }
    return rows;
  }
  let n = 0; const fails = [];
  for (let r = 0; r < 256; r++) {
    const rows = pic(r);
    let ok = true;
    for (let t = 1; t <= 200; t++) if (rows[t][MID - t] !== 1) { ok = false; break; }
    if (ok) n++; else fails.push(r);
  }
  console.log(`    rules whose own row t is black at x = -t for every t in 1..200 : ${n} / 256`);
  console.log(`    rule 30 : ${!fails.includes(30) ? 'YES' : 'no'}     rule 120 : ${!fails.includes(120) ? 'YES' : 'no'}     rule 110 : ${!fails.includes(110) ? 'YES' : 'no'}     rule 90 : ${!fails.includes(90) ? 'YES' : 'no'}`);
  console.log('\n    THIS is the (B) step, and it is one line of the reduction. The ladder itself is not.');
}
