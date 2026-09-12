// Sextant, 2026-09-12.  Produces the concrete data for the kernel check
// explorer/sextant9_scratch_reach.lean.

function step(row) {
  const n = row.length;
  const out = new Uint8Array(n + 2);
  const get = (k) => (k < 0 || k >= n) ? 0 : row[k];
  for (let j = 0; j < n + 2; j++) out[j] = get(j - 2) ^ (get(j - 1) | get(j));
  return out;
}
{ let r = Uint8Array.from([1]); for (let s = 0; s < 3; s++) r = step(r);
  if (Array.from(r).join('') !== '1101111') { console.log('ENGINE FAIL'); process.exit(1); }
  console.log('engine self-check OK'); }

// --- K1: C1's construction at one instance ---------------------------------
function solveBack(y) {                     // free cells white
  const n = y.length;
  const x = new Uint8Array(n + 2);          // x[j] is absolute position j-1
  for (let i = n - 1; i >= 0; i--) x[i] = y[i] ^ (x[i + 1] | x[i + 2]);
  return x;
}
{
  const t = 4;
  const w = Uint8Array.from([1, 0, 1, 0, 1, 1]);   // target window, positions 0..5
  let cur = w;
  for (let s = 0; s < t; s++) cur = solveBack(cur);
  // cur occupies absolute positions [-t, 5+t] = [-4, 9]
  console.log('K1: target window w =', Array.from(w).join(''), 'at positions 0..5 of row', t);
  console.log('K1: preimage row-0 word (positions -4..9) =', Array.from(cur).join(''));
  // verify by forward evolution with white padding
  let r = cur; for (let s = 0; s < t; s++) r = step(r);   // r occupies [-4-t, 9+t] = [-8, 13]
  const readAt = (p) => r[p - (-8)];
  console.log('K1: row 4 at positions 0..5 =', [0, 1, 2, 3, 4, 5].map(readAt).join(''));
  console.log('K1: full row 4 (positions -8..13) =', Array.from(r).join(''));
  // as a Lean list of Bool, positions -4..9
  console.log('K1 Lean list (positions -4..9):', '[' + Array.from(cur).map(b => b ? 'true' : 'false').join(', ') + ']');
}

// --- K2/K3: a span-11 word that is / is not a 1-step image -----------------
{
  const n = 11;
  const images = new Set();
  // preimage support is forced into [1, n-2] = [1, 9]; enumerate all of them
  for (let m = 0; m < (1 << 9); m++) {
    const c = new Uint8Array(9);
    for (let j = 0; j < 9; j++) c[j] = (m >> j) & 1;
    // c sits at absolute positions 1..9; image sits at 0..10
    const padded = new Uint8Array(11);
    for (let j = 0; j < 9; j++) padded[j + 1] = c[j];
    // one step on the padded array, read positions 0..10 of the SAME frame
    const get = (k) => (k < 0 || k >= 11) ? 0 : padded[k];
    const img = new Uint8Array(11);
    for (let k = 0; k < 11; k++) img[k] = get(k - 1) ^ (get(k) | get(k + 1));
    images.add(Array.from(img).join(''));
  }
  console.log(`\nK2: images of configs supported in [1,9], read on [0,10]: ${images.size} distinct of ${1 << 11}`);
  // pick a word with black ends that is NOT an image, and one that IS
  let neg = null, pos = null;
  for (let code = 0; code < (1 << 9); code++) {
    let s = '1';
    for (let j = 0; j < 9; j++) s += (code >> j) & 1;
    s += '1';
    if (!images.has(s) && !neg) neg = s;
    if (images.has(s) && !pos) pos = s;
    if (neg && pos) break;
  }
  console.log('K2 (negative): span-11 word NOT a 1-step image of any finite config:', neg);
  console.log('K3 (positive): span-11 word that IS:', pos);
  const toLean = (s) => '[' + s.split('').map(ch => ch === '1' ? 'true' : 'false').join(', ') + ']';
  console.log('K2 Lean list (positions 0..10):', toLean(neg));
  console.log('K3 Lean list (positions 0..10):', toLean(pos));
  // witness for K3
  for (let m = 0; m < (1 << 9); m++) {
    const c = new Uint8Array(9);
    for (let j = 0; j < 9; j++) c[j] = (m >> j) & 1;
    const padded = new Uint8Array(11);
    for (let j = 0; j < 9; j++) padded[j + 1] = c[j];
    const get = (k) => (k < 0 || k >= 11) ? 0 : padded[k];
    let img = '';
    for (let k = 0; k < 11; k++) img += (get(k - 1) ^ (get(k) | get(k + 1)));
    if (img === pos) {
      console.log('K3 witness config (positions 1..9):', Array.from(c).join(''),
        ' Lean list:', '[' + Array.from(c).map(b => b ? 'true' : 'false').join(', ') + ']');
      break;
    }
  }
  // how many span-11 black-ended words are images?  predicted 2^(11-2-2)=128
  let cnt = 0;
  for (let code = 0; code < (1 << 9); code++) {
    let s = '1'; for (let j = 0; j < 9; j++) s += (code >> j) & 1; s += '1';
    if (images.has(s)) cnt++;
  }
  console.log(`K2: black-ended span-11 words that are 1-step images: ${cnt}, predicted 2^(11-2*1-2) = ${1 << 7}`);
}
