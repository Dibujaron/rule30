// Talus, 2026-09-12.  What the seed's centre column actually is, from two
// independent engines, because a Lean `decide` just refuted my memory of it.

// 1. naive rule-table evolution on an array
function naive(T) {
  const N = 2 * T + 9, org = T + 4;
  let row = new Array(N).fill(0);
  row[org] = 1;
  const out = [];
  for (let t = 0; t < T; t++) {
    out.push(row[org]);
    const nx = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const l = i > 0 ? row[i - 1] : 0, c = row[i], r = i < N - 1 ? row[i + 1] : 0;
      nx[i] = l ^ (c | r);
    }
    row = nx;
  }
  return out;
}

// 2. the Lean file's own model: a Nat row, bit i = cell(x = i - OFF)
function leanModel(T) {
  const W = 40n, OFF = 16n, M = 1n << W;
  let r = 1n << OFF;
  const out = [];
  for (let t = 0; t < T; t++) {
    out.push(Number((r >> OFF) & 1n));
    r = ((2n * r) ^ (r | (r >> 1n))) % M;
  }
  return out;
}

const A = naive(20), B = leanModel(20);
console.log("naive      :", A.join(""));
console.log("lean model :", B.join(""));
console.log("agree      :", A.join("") === B.join(""));
console.log("as a Lean list of 8:", "[" + B.slice(0, 8).map(b => (b ? "true" : "false")).join(", ") + "]");
