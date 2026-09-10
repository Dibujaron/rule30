// Seeder scratch, 2026-09-10.
//
// `leftDiagonal_onset_le_of_black_ladder` is closed. Its ladder N is STRICTLY
// increasing, so `N k <= k` forces `N 0 = 0` and `N k = k` for every k: exactly
// one ladder is admissible. So the wall's residual through that block is the one
// concrete sequence
//
//     for every k:  leftDiagonal (k+1) (k+1) = true
//                   OR  diagonal k+1 is white from index k+1 on.
//
// This script measures it, in the packed-row model the board already has:
//   rowNat 0 = 1, rowNat (t+1) = (4r) XOR ((2r) OR r)          (Basic.lean rowStep)
//   leftDiagonal k j = bit k of rowNat (j + k)                  (landed lemma)
//   centerColumn t   = bit t of rowNat t                        (landed lemma)
//
// Cross-checks first, so a null result cannot be the model being wrong.
import { centerColumn as engineCenter, A051023_PREFIX } from './rule30.mjs'

const K = 3000

// A051023 prefix, read from the repo (explorer/verify.mjs checks the engine
// against this same constant) rather than from anyone's memory.
const A051023 = A051023_PREFIX.join('')

function rows (n) {
  const out = new Array(n + 1)
  let r = 1n
  out[0] = r
  for (let t = 1; t <= n; t++) {
    r = (4n * r) ^ ((2n * r) | r)
    out[t] = r
  }
  return out
}

const bit = (r, i) => ((r >> BigInt(i)) & 1n) === 1n

// We need rowNat up to index 2K+2 to read leftDiagonal (k+1) (k+1) for k <= K.
const N = 2 * K + 4
const R = rows(N)

// --- check 1: centre column against the OEIS prefix -------------------------
let center = ''
for (let t = 0; t < A051023.length; t++) center += bit(R[t], t) ? '1' : '0'
if (center !== A051023) {
  console.error('MODEL WRONG: centre column disagrees with A051023')
  console.error('  got  ' + center)
  console.error('  want ' + A051023)
  process.exit(1)
}
console.log('check 1 ok: centre column = A051023 prefix (' + A051023.length + ' terms)')

// --- check 2: centre column against the independent BigInt engine ----------
{
  const eng = [...engineCenter(400)].join('')
  let mine = ''
  for (let t = 0; t < 400; t++) mine += bit(R[t], t) ? '1' : '0'
  if (eng !== mine) {
    console.error('MODEL WRONG: disagrees with explorer/rule30.mjs centerColumn')
    for (let t = 0; t < 400; t++) if (eng[t] !== mine[t]) { console.error('  first at t=' + t); break }
    process.exit(1)
  }
  console.log('check 2 ok: centre column = explorer engine (400 terms)')
}

// --- check 3: the three edge diagonals, which the board has proved ---------
// leftDiagonal 0 all black, 1 all black, 2 all white.
for (let j = 0; j < 500; j++) {
  if (!bit(R[j + 0], 0)) { console.error('MODEL WRONG: leftDiagonal 0 not black at ' + j); process.exit(1) }
  if (!bit(R[j + 1], 1)) { console.error('MODEL WRONG: leftDiagonal 1 not black at ' + j); process.exit(1) }
  if (bit(R[j + 2], 2)) { console.error('MODEL WRONG: leftDiagonal 2 not white at ' + j); process.exit(1) }
}
console.log('check 3 ok: left diagonals 0,1 black and 2 white to j=500')

const D = (k, j) => bit(R[j + k], k)

// --- the residual ----------------------------------------------------------
// black witness at the forced index
const blackFails = []
for (let k = 0; k <= K; k++) if (!D(k + 1, k + 1)) blackFails.push(k)

console.log('\n--- black branch: leftDiagonal (k+1) (k+1) for k <= ' + K + ' ---')
console.log('failures: ' + blackFails.length + ' of ' + (K + 1))
console.log('first 40 failing k: ' + blackFails.slice(0, 40).join(' '))

// For each failing k, is diagonal k+1 white from index k+1 on (as far as we see)?
// We can see diagonal k+1 out to index N-(k+1). Report the next black cell.
console.log('\n--- for the failures, the next black cell of diagonal k+1 at/after k+1 ---')
let unresolved = 0
const gaps = []
for (const k of blackFails.slice(0, 25)) {
  const d = k + 1
  let j = k + 1
  const lim = N - d
  while (j < lim && !D(d, j)) j++
  if (j >= lim) { console.log('  k=' + k + '  diagonal ' + d + ': no black seen to index ' + lim); unresolved++ }
  else console.log('  k=' + k + '  diagonal ' + d + ': next black at ' + j + '  (gap ' + (j - (k + 1)) + ')')
}
for (const k of blackFails) {
  const d = k + 1
  let j = k + 1
  const lim = N - d
  while (j < lim && !D(d, j)) j++
  if (j < lim) gaps.push(j - (k + 1))
}
if (gaps.length) {
  gaps.sort((a, b) => a - b)
  console.log('\ngap stats over ' + gaps.length + ' failures: min ' + gaps[0] +
    '  median ' + gaps[gaps.length >> 1] + '  max ' + gaps[gaps.length - 1])
}
