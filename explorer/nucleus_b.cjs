'use strict';
// Nucleus computation, implementation B -- deliberately independent of A.
//
// A: elements are transducers; composition is the product construction;
//    equality is Moore minimization + canonical relabelling (exact).
// B: elements are WORDS in the generators and their inverses; composition is
//    concatenation; sections are computed symbolically by the wreath rule
//    (gh)|_a = g|_{sigma_h(a)} . h|_a, folded right to left; equality is decided
//    by directly simulating the word's action on every word of length D.
//
// B shares no code with A.  Its equality test is only valid up to depth D, so
// it can in principle merge distinct elements; the comparison script checks
// that it does not, by holding A's exact keys against B's action keys.

// A symbol is an integer: 2*i for generator i, 2*i+1 for its inverse.
function makeAlphabet(perm, tr) {
  const nsym = 2 * perm.length;
  const sperm = new Array(nsym), ssec = new Array(nsym);
  for (let i = 0; i < perm.length; i++) {
    sperm[2 * i] = perm[i];
    ssec[2 * i] = [2 * tr[i][0], 2 * tr[i][1]];
    // (g^-1)|_a = (g|_{sigma^-1(a)})^-1, and sigma^-1 = sigma for a transposition
    sperm[2 * i + 1] = perm[i];
    ssec[2 * i + 1] = [2 * tr[i][0 ^ perm[i]] + 1, 2 * tr[i][1 ^ perm[i]] + 1];
  }
  return { sperm, ssec, nsym };
}

const inv = s => s ^ 1;

function reduce(word) {
  const out = [];
  for (const s of word) {
    if (out.length && out[out.length - 1] === inv(s)) out.pop();
    else out.push(s);
  }
  return out;
}

// section of a word at letter a, plus sigma_word(a)
function wordSection(A, word, a) {
  const parts = new Array(word.length);
  let cur = a;
  for (let i = word.length - 1; i >= 0; i--) {
    parts[i] = A.ssec[word[i]][cur];
    cur ^= A.sperm[word[i]];
  }
  return { sec: reduce(parts), image: cur };
}

// apply one symbol to a bit array (direct transducer simulation)
function applySymbol(A, s, bits) {
  let st = s;
  const out = new Array(bits.length);
  for (let i = 0; i < bits.length; i++) {
    out[i] = bits[i] ^ A.sperm[st];
    st = A.ssec[st][bits[i]];
  }
  return out;
}

function applyWord(A, word, bits) {
  let cur = bits;
  for (let i = word.length - 1; i >= 0; i--) cur = applySymbol(A, word[i], cur);
  return cur;
}

// action key: the image of every length-D word, as a permutation of 0..2^D-1
function actionKey(A, word, D, cache) {
  const ws = word.join(',');
  if (cache.has(ws)) return cache.get(ws);
  const n = 1 << D;
  const img = new Uint32Array(n);
  const bits = new Array(D);
  for (let x = 0; x < n; x++) {
    for (let i = 0; i < D; i++) bits[i] = (x >> (D - 1 - i)) & 1;
    const out = applyWord(A, word, bits);
    let y = 0;
    for (let i = 0; i < D; i++) y = (y << 1) | out[i];
    img[x] = y;
  }
  const key = Buffer.from(img.buffer).toString('base64');
  cache.set(ws, key);
  return key;
}

function deepSectionsWord(A, word, D, cache) {
  const repOf = new Map(); // key -> shortest word seen
  const keyOf = w => {
    const k = actionKey(A, w, D, cache);
    const prev = repOf.get(k);
    if (!prev || w.length < prev.length) repOf.set(k, w);
    return k;
  };
  const seen = new Map();
  const seq = [];
  let cur = new Set([keyOf(word)]);
  for (; ;) {
    const sig = [...cur].sort().join('|');
    if (seen.has(sig)) {
      const start = seen.get(sig);
      const union = new Set();
      for (let i = start; i < seq.length; i++) for (const k of seq[i]) union.add(k);
      return { depth: start, elems: [...union].map(k => repOf.get(k)), keys: [...union] };
    }
    seen.set(sig, seq.length);
    seq.push(cur);
    const nxt = new Set();
    for (const k of cur) {
      const w = repOf.get(k);
      for (const a of [0, 1]) nxt.add(keyOf(wordSection(A, w, a).sec));
    }
    cur = nxt;
  }
}

// Forced lower bound, word version.  Same mathematical loop as nucleus_forced,
// implemented over words.
function forcedB(perm, tr, gens, { D = 12, rounds = 3, cap = 1e9, seconds = 120 } = {}) {
  const A = makeAlphabet(perm, tr);
  const cache = new Map();
  const t0 = Date.now();
  const F = new Map(); // key -> word
  const idKey = actionKey(A, [], D, cache);
  F.set(idKey, []);
  for (const g of gens) for (const s of [2 * g, 2 * g + 1]) {
    const ds = deepSectionsWord(A, [s], D, cache);
    ds.keys.forEach((k, i) => { if (!F.has(k)) F.set(k, ds.elems[i]); });
  }
  const history = [F.size];
  let elems = [...F.values()];
  let done = 0;
  let stabilised = false;
  for (let r = 0; r < rounds; r++) {
    const before = elems.length;
    outer:
    for (let i = 0; i < elems.length; i++) {
      for (let j = (i < done ? done : 0); j < elems.length; j++) {
        const p = reduce(elems[i].concat(elems[j]));
        const ds = deepSectionsWord(A, p, D, cache);
        ds.keys.forEach((k, ix) => {
          if (!F.has(k)) { F.set(k, ds.elems[ix]); elems.push(ds.elems[ix]); }
        });
        if (F.size > cap || (Date.now() - t0) / 1000 > seconds) break outer;
      }
    }
    done = before;
    history.push(F.size);
    if (F.size === before) { stabilised = true; break; }
    if (F.size > cap || (Date.now() - t0) / 1000 > seconds) break;
  }
  return { F, size: F.size, history, stabilised, secs: (Date.now() - t0) / 1000, D };
}

// Strict rounds, word version -- must agree with forcedRounds in nucleus_forced.
function forcedRoundsB(perm, tr, gens, { D = 12, rounds = 2 } = {}) {
  const A = makeAlphabet(perm, tr);
  const cache = new Map();
  const F = new Map();
  F.set(actionKey(A, [], D, cache), []);
  for (const g of gens) for (const s of [2 * g, 2 * g + 1]) {
    const ds = deepSectionsWord(A, [s], D, cache);
    ds.keys.forEach((k, i) => { if (!F.has(k)) F.set(k, ds.elems[i]); });
  }
  const history = [F.size];
  for (let r = 0; r < rounds; r++) {
    const elems = [...F.values()];
    const add = [];
    for (const g of elems) for (const h of elems) {
      const ds = deepSectionsWord(A, reduce(g.concat(h)), D, cache);
      ds.keys.forEach((k, i) => add.push([k, ds.elems[i]]));
    }
    for (const [k, w] of add) if (!F.has(k)) F.set(k, w);
    history.push(F.size);
    if (F.size === elems.length) return { F, history, stabilised: true, D };
  }
  return { F, history, stabilised: false, D };
}

module.exports = { makeAlphabet, wordSection, applyWord, actionKey, deepSectionsWord, forcedB, forcedRoundsB, reduce };
