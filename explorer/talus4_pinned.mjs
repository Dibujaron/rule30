// Talus, 2026-09-09. Why does every odd start land on the SEED's cycle, when
// obstruction 4 says each eventually-white diagonal carries a free branch bit?
//
// Conjecture: the branch is not free. An eventually-white diagonal w is white only
// from its own onset on; before that it has black cells. If w still has a black cell
// at an index at or past the onsets of diagonals w-1 and w-2, then
// bool_driven_periodicFrom_of_reset / leftDiagonal_periodicFrom_step_of_black pin
// diagonal w+1 outright -- no branch. The freedom obstruction 4 describes belongs to
// the settled-word orbit, not to any picture whose transient still reaches that depth.
//
// Test: for every eventually-white diagonal w of the seed below 90000, measure
//   onset(w-2), onset(w-1), onset(w)  and  lastBlack(w) = the largest index i with
//   leftDiagonal w i = true.
// The branch is pinned iff lastBlack(w) >= max(onset(w-2), onset(w-1)).

const W = 32;
const N = 90000;          // width
const WHITES = [2, 7, 28, 399, 53207, 58286, 87866];
const P = 32;             // eventual period at this width

function makeEngine(n) {
  const words = ((n + W - 1) / W) | 0;
  const topBits = n - (words - 1) * W;
  const topMask = topBits === 32 ? 0xffffffff : ((1 << topBits) >>> 0) - 1;
  function step(src, dst) {
    for (let i = words - 1; i >= 0; i--) {
      const a = src[i];
      const b = i >= 1 ? src[i - 1] : 0;
      dst[i] = (((a << 2) | (b >>> 30)) ^ (((a << 1) | (b >>> 31)) | a)) >>> 0;
    }
    dst[words - 1] = (dst[words - 1] & topMask) >>> 0;
  }
  return { words, step };
}

const TRACK = [];
for (const w of WHITES) for (const d of [-2, -1, 0, 1]) if (w + d >= 0 && w + d < N) TRACK.push(w + d);
const uniq = [...new Set(TRACK)].sort((a, b) => a - b);

const { words, step } = makeEngine(N);
const T = 2 * N + 4 * P;
// bit j at row t is leftDiagonal j (t - j); record the whole column of each tracked bit
const cols = new Map(uniq.map((j) => [j, new Uint8Array(T + 1)]));
let cur = new Uint32Array(words); cur[0] = 1;
let nxt = new Uint32Array(words);
for (let t = 0; t <= T; t++) {
  for (const j of uniq) cols.get(j)[t] = (cur[(j / 32) | 0] >>> (j % 32)) & 1;
  step(cur, nxt);
  const tmp = cur; cur = nxt; nxt = tmp;
}

// diagonal j at index i is bit j at row i + j, for i = 0 .. T - j
function diag(j, i) { return cols.get(j)[i + j]; }
function onset(j) {
  const last = T - j - P;
  let lastDiff = -1;
  for (let i = 0; i <= last; i++) if (diag(j, i) !== diag(j, i + P)) lastDiff = i;
  return lastDiff + 1;
}
function lastBlack(j) {
  const last = T - j;
  for (let i = last; i >= 0; i--) if (diag(j, i)) return i;
  return -1;
}

console.log("  w    onset(w-2)  onset(w-1)   onset(w)   lastBlack(w)   pinned?  (lastBlack(w) >= max onset of drivers)");
for (const w of WHITES) {
  const o2 = w >= 2 ? onset(w - 2) : 0;
  const o1 = w >= 1 ? onset(w - 1) : 0;
  const ow = onset(w);
  const lb = lastBlack(w);
  const need = Math.max(o2, o1);
  console.log(
    `${String(w).padStart(6)} ${String(o2).padStart(11)} ${String(o1).padStart(11)} ${String(ow).padStart(10)} ${String(lb).padStart(14)}      ${lb >= need ? "yes" : "NO "}   (need >= ${need})`,
  );
}
console.log("");
console.log("A 'yes' on every row means every branch point of the seed's own picture is reset by a black");
console.log("cell of the white diagonal's own transient, so no configuration whose transient reaches that");
console.log("depth can take the other branch.");
