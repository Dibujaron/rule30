// Parallax, 2026-09-12.  Is the positive monoid <q0,q1,q2>^+ free?
//
// A generator q_i acts on a binary word w by
//     v_k = w_k XOR chi(state_k),  state_0 = i,  state_{k+1} = d(state_k, w_k)
// with chi = (0,1,1) and d(q0,0)=q0 d(q0,1)=q2 d(q1,0)=q0 d(q1,1)=q2
//              d(q2,0)=q1 d(q2,1)=q2.
// So a positive word (i_0 ... i_{t-1}), applied right to left, is t stacked
// rows of rule 30 on a half-line with a prescribed boundary memory per row,
// and its value on the all-white ray 0^inf is the left half of row t.
//
// If the map (word) -> (image of 0^inf, truncated to N digits) is injective
// then the monoid is free, since a fortiori the automorphisms differ.
// That is a STRONGER statement than freeness, and it is cheap.
//
// Control: the same count for the MIRROR automaton (rule 86's), which must
// not be free for the same reason if the property is an artefact of my
// bookkeeping rather than of rule 30 -- and for a deliberately collapsed
// automaton where two states are equal, which must NOT give 3^t.

const CHI = [0, 1, 1];
const D = [0, 2, 0, 2, 1, 2];      // d[2*s + letter]

function imageOfWhiteRay(word, N, chi, d) {
  // v starts as the all-white ray of length N
  let v = new Uint8Array(N);
  for (const i of word) {          // word[0] applied first
    const nv = new Uint8Array(N);
    let s = i;
    for (let k = 0; k < N; k++) { nv[k] = v[k] ^ chi[s]; s = d[2 * s + v[k]]; }
    v = nv;
  }
  return v;
}

function sweep(chi, d, TMAX, label) {
  console.log(`\n--- ${label} ---`);
  for (let t = 1; t <= TMAX; t++) {
    const N = 3 * t + 8;
    const total = 3 ** t;
    const seen = new Set();
    const word = new Array(t).fill(0);
    for (let n = 0; n < total; n++) {
      let m = n; for (let j = 0; j < t; j++) { word[j] = m % 3; m = (m / 3) | 0; }
      const v = imageOfWhiteRay(word, N, chi, d);
      seen.add(v.join(''));
    }
    console.log(`   t=${t}: ${seen.size} distinct images of 0^inf   (3^${t} = ${total})   ${seen.size === total ? 'INJECTIVE' : '*** collapse ***'}`);
    if (seen.size !== total) break;
  }
}

sweep(CHI, D, 11, 'rule 30 edge automaton E  (q0=(q0,q2), q1=s(q0,q2), q2=s(q1,q2))');

// control 1: an automaton with two identical states must collapse at t=1
sweep([0, 0, 1], [0, 2, 0, 2, 1, 2], 3, 'CONTROL: chi = (0,0,1), so q0 and q1 have the same label and the same sections');

// control 2: the identity-ish automaton
sweep([0, 0, 0], [0, 0, 0, 0, 0, 0], 3, 'CONTROL: all states trivial (every element is the identity)');
