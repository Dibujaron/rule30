// Portage, 2026-09-12.  Where does rule 30's edge automaton sit in the
// enumeration of the 5832 labelled 3-state 2-letter automata?
//
// The numbering convention is NOT quoted from the classification paper (whose
// tables would not fetch).  It is reverse-engineered from the one worked
// example that did fetch — arXiv:0704.3876 via ar5iv, "automaton number 741"
// with recursion a = sigma(c,a), b = (b,a), c = (a,a) — and it is checked
// against that example below.  One example, so: treat the resulting number as
// UNVERIFIED.
//
// Convention under test:  an automaton with states (q1,q2,q3), state i given
// by q_i = sigma^{p_i} (q_{t_i0}, q_{t_i1}), gets
//     number = 1 + sum_i [ (t_i0 - 1) 3^{2i-2} + (t_i1 - 1) 3^{2i-1} ]
//                + 729 * sum_i p_i 2^{i-1}.

// an automaton is {t: [[t10,t11],[t20,t21],[t30,t31]] (1-based), p: [p1,p2,p3]}
function number(A) {
  let trans = 0;
  for (let i = 0; i < 3; i++) { trans += (A.t[i][0] - 1) * 3 ** (2 * i); trans += (A.t[i][1] - 1) * 3 ** (2 * i + 1); }
  let perm = 0;
  for (let i = 0; i < 3; i++) perm += A.p[i] * 2 ** i;
  return 1 + trans + 729 * perm;
}

// ---- check against the one fetched example ----
// 741:  a = sigma(c,a),  b = (b,a),  c = (a,a)     (a=q1,b=q2,c=q3)
const ex = { t: [[3, 1], [2, 1], [1, 1]], p: [1, 0, 0] };
console.log(`convention check: automaton "a=s(c,a), b=(b,a), c=(a,a)" -> ${number(ex)} (paper says 741)`);

// ---- rule 30's edge automaton ----
// q0 = (q0,q2), q1 = sigma(q0,q2), q2 = sigma(q1,q2)
// as (q1,q2,q3) = (q0,q1,q2):
const E = { t: [[1, 3], [1, 3], [2, 3]], p: [0, 1, 1] };
console.log(`\nrule 30's edge automaton, labelled (a,b,c) = (q0,q1,q2): ${number(E)}`);

// ---- the symmetry orbit: permute states, swap letters, invert states ----
function permuteStates(A, s) {           // s: new label i came from old s[i]
  const inv = [0, 0, 0]; for (let i = 0; i < 3; i++) inv[s[i]] = i;
  return { t: [0, 1, 2].map(i => [inv[A.t[s[i]][0] - 1] + 1, inv[A.t[s[i]][1] - 1] + 1]), p: [0, 1, 2].map(i => A.p[s[i]]) };
}
function swapLetters(A) { return { t: A.t.map(r => [r[1], r[0]]), p: A.p.slice() }; }
function invertStates(A) { return { t: [0, 1, 2].map(i => A.p[i] ? [A.t[i][1], A.t[i][0]] : [A.t[i][0], A.t[i][1]]), p: A.p.slice() }; }

const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const orbit = new Set();
for (const s of perms) for (const f of [x => x, swapLetters]) for (const h of [x => x, invertStates]) {
  orbit.add(number(h(f(permuteStates(E, s)))));
}
const sorted = [...orbit].sort((a, b) => a - b);
console.log(`  its symmetry orbit (permute states / swap letters / invert states): ${sorted.join(', ')}`);
console.log(`  smallest number in the orbit: ${sorted[0]}`);

// sanity: the orbit of the example, for scale
const orb2 = new Set();
for (const s of perms) for (const f of [x => x, swapLetters]) for (const h of [x => x, invertStates]) orb2.add(number(h(f(permuteStates(ex, s)))));
console.log(`  (for scale, the orbit of 741 has ${orb2.size} members, smallest ${Math.min(...orb2)})`);
