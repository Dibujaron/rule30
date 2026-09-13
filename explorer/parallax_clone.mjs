// Parallax, 2026-09-13.
// The polymorphism clone of the local relation of every elementary CA.
//
// For rule number R, the local function is f(l,c,r) = bit (4l+2c+r) of R.
// The LOCAL RELATION is its graph:
//     Rel_R = { (l,c,r,o) in {0,1}^4 : o = f(l,c,r) },   8 tuples.
// A k-ary operation g : {0,1}^k -> {0,1} is a POLYMORPHISM of Rel_R iff
// applying g coordinatewise to k tuples of Rel_R lands back in Rel_R, i.e.
//     g(f(L,C,R)) = f(g(L), g(C), g(R))   for all L,C,R in ({0,1}^k)
// where f is applied coordinatewise on the left.  So Pol(Rel_R) is exactly
// the set of operations COMMUTING with f.
//
// Encoding: a k-ary operation is an array of 2^k bits; op[m] = g(x) where
// bit i of m is x_i.  A k-tuple of domain values is an integer 0..2^k-1.

const bit = (n, i) => (n >> i) & 1;

function localF(rule) {
  return (l, c, r) => (rule >> (4 * l + 2 * c + r)) & 1;
}

// apply f coordinatewise to three k-bit vectors
function coordF(f, k, L, C, R) {
  let O = 0;
  for (let i = 0; i < k; i++) O |= f(bit(L, i), bit(C, i), bit(R, i)) << i;
  return O;
}

// does the k-ary operation `op` (array of length 2^k) commute with f?
function commutes(op, k, f) {
  const N = 1 << k;
  for (let L = 0; L < N; L++)
    for (let C = 0; C < N; C++)
      for (let R = 0; R < N; R++) {
        const O = coordF(f, k, L, C, R);
        if (op[O] !== f(op[L], op[C], op[R])) return false;
      }
  return true;
}

function opFromIndex(idx, k) {
  const N = 1 << k;
  const op = new Array(N);
  for (let m = 0; m < N; m++) op[m] = (idx >> m) & 1;
  return op;
}

// ---------------------------------------------------------------- named ops
const AND2 = [0, 0, 0, 1];           // g(x,y) = x & y   (m = x + 2y)
const OR2 = [0, 1, 1, 1];
const XOR2 = [0, 1, 1, 0];
const projections = (k) => {
  const out = [];
  for (let i = 0; i < k; i++) {
    const N = 1 << k, op = new Array(N);
    for (let m = 0; m < N; m++) op[m] = bit(m, i);
    out.push(op);
  }
  return out;
};
const MAJ3 = (() => {
  const op = new Array(8);
  for (let m = 0; m < 8; m++) op[m] = (bit(m, 0) + bit(m, 1) + bit(m, 2)) >= 2 ? 1 : 0;
  return op;
})();
const MIN3 = (() => {           // minority = x xor y xor z
  const op = new Array(8);
  for (let m = 0; m < 8; m++) op[m] = bit(m, 0) ^ bit(m, 1) ^ bit(m, 2);
  return op;
})();

const isIdempotent = (op, k) => op[0] === 0 && op[(1 << k) - 1] === 1;
const isProjection = (op, k) => projections(k).some((p) => p.every((v, i) => v === op[i]));

// weak near-unanimity: idempotent and g(y,x,..,x) = g(x,y,x,..,x) = ... = g(x,..,x,y)
function isWNU(op, k) {
  if (!isIdempotent(op, k)) return false;
  for (const [x, y] of [[0, 1], [1, 0]]) {
    let v = null;
    for (let pos = 0; pos < k; pos++) {
      let m = 0;
      for (let i = 0; i < k; i++) m |= (i === pos ? y : x) << i;
      if (v === null) v = op[m]; else if (op[m] !== v) return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------- Post facts
function isMonotone(f) {
  const pts = [];
  for (let m = 0; m < 8; m++) pts.push([bit(m, 2), bit(m, 1), bit(m, 0)]);
  for (const a of pts) for (const b of pts) {
    if (a.every((v, i) => v <= b[i])) {
      if (f(a[0], a[1], a[2]) > f(b[0], b[1], b[2])) return false;
    }
  }
  return true;
}
function isAffine(f) {
  // f affine iff f(x)+f(y)+f(z)+f(x+y+z) = 0 for all x,y,z  (the Maltsev/minority test)
  for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) for (let z = 0; z < 8; z++) {
    const w = x ^ y ^ z;
    const g = (m) => f(bit(m, 2), bit(m, 1), bit(m, 0));
    if ((g(x) ^ g(y) ^ g(z)) !== g(w)) return false;
  }
  return true;
}
function isSelfDual(f) {
  for (let m = 0; m < 8; m++) {
    const n = 7 ^ m;
    if (f(bit(m, 2), bit(m, 1), bit(m, 0)) === f(bit(n, 2), bit(n, 1), bit(n, 0))) return false;
  }
  return true;
}
function dependsOn(f, which) {   // which: 0 = l, 1 = c, 2 = r
  for (let m = 0; m < 8; m++) {
    const n = m ^ (1 << (2 - which));
    if (f(bit(m, 2), bit(m, 1), bit(m, 0)) !== f(bit(n, 2), bit(n, 1), bit(n, 0))) return true;
  }
  return false;
}

// ---------------------------------------------------------------- the sweep
const rows = [];
for (let rule = 0; rule < 256; rule++) {
  const f = localF(rule);

  // unary polymorphisms (endomorphisms of the relational structure)
  const unary = [];
  for (let idx = 0; idx < 4; idx++) {
    const op = opFromIndex(idx, 1);
    if (commutes(op, 1, f)) unary.push(`${op[0]}${op[1]}`); // g(0)g(1)
  }

  // exhaustive idempotent binary and ternary polymorphisms
  let bin = 0, ter = 0, terNonProj = [];
  for (let idx = 0; idx < 16; idx++) {
    const op = opFromIndex(idx, 2);
    if (isIdempotent(op, 2) && commutes(op, 2, f)) bin++;
  }
  for (let idx = 0; idx < 256; idx++) {
    const op = opFromIndex(idx, 3);
    if (isIdempotent(op, 3) && commutes(op, 3, f)) {
      ter++;
      if (!isProjection(op, 3)) terNonProj.push(idx);
    }
  }

  const hasAnd = commutes(AND2, 2, f);
  const hasOr = commutes(OR2, 2, f);
  const hasXor = commutes(XOR2, 2, f);
  const hasMaj = commutes(MAJ3, 3, f);
  const hasMin = commutes(MIN3, 3, f);

  // WNU of arity 3 and 4 among the polymorphisms
  let wnu3 = false;
  for (let idx = 0; idx < 256 && !wnu3; idx++) {
    const op = opFromIndex(idx, 3);
    if (isWNU(op, 3) && !isProjection(op, 3) && commutes(op, 3, f)) wnu3 = true;
  }
  let wnu4 = false;
  for (let idx = 0; idx < 65536 && !wnu4; idx++) {
    const op = opFromIndex(idx, 4);
    if (isWNU(op, 4) && !isProjection(op, 4) && commutes(op, 4, f)) wnu4 = true;
  }

  // Schaefer verdict for the language { Rel_R, {0}, {1} }
  const boundedWidth = hasAnd || hasOr || hasMaj;
  const tractable = boundedWidth || hasMin;
  const verdict = boundedWidth ? "bounded width"
    : (hasMin ? "affine: tractable, width UNBOUNDED" : "NP-complete, width UNBOUNDED");

  rows.push({
    rule, unary, bin, ter, terNonProj,
    hasAnd, hasOr, hasXor, hasMaj, hasMin, wnu3, wnu4,
    mono: isMonotone(f), aff: isAffine(f), sd: isSelfDual(f),
    dl: dependsOn(f, 0), dc: dependsOn(f, 1), dr: dependsOn(f, 2),
    q: f(0, 0, 0) === 0,
    leftPerm: [0, 1, 2, 3, 4, 5, 6, 7].every((m) => {
      const n = m ^ 4;
      return f(bit(m, 2), bit(m, 1), bit(m, 0)) !== f(bit(n, 2), bit(n, 1), bit(n, 0));
    }),
    verdict,
  });
}

const R30 = rows[30];
console.log("=== [A] rule 30's local relation ===");
console.log("  tuples (l,c,r,o):");
{
  const f = localF(30);
  const ts = [];
  for (let m = 0; m < 8; m++) {
    const l = bit(m, 2), c = bit(m, 1), r = bit(m, 0);
    ts.push(`(${l}${c}${r}|${f(l, c, r)})`);
  }
  console.log("    " + ts.join(" "));
}
console.log("  unary polymorphisms g(0)g(1):", R30.unary.join(", "));
console.log("  idempotent BINARY polymorphisms:", R30.bin, "(projections alone would be 2)");
console.log("  idempotent TERNARY polymorphisms:", R30.ter, "(projections alone would be 3)");
console.log("  non-projection idempotent ternary:", R30.terNonProj.length);
console.log("  AND:", R30.hasAnd, " OR:", R30.hasOr, " MAJORITY:", R30.hasMaj, " MINORITY:", R30.hasMin);
console.log("  non-projection WNU of arity 3:", R30.wnu3, "  of arity 4:", R30.wnu4);
console.log("  monotone:", R30.mono, " affine:", R30.aff, " self-dual:", R30.sd);
console.log("  VERDICT:", R30.verdict);
console.log();

console.log("=== [B] the four minimal idempotent Boolean clones, per rule ===");
console.log("(a nontrivial idempotent clone on {0,1} must contain AND, OR, MAJORITY or MINORITY)");
const classes = new Map();
for (const r of rows) {
  const key = `${+r.hasAnd}${+r.hasOr}${+r.hasMaj}${+r.hasMin}`;
  if (!classes.has(key)) classes.set(key, []);
  classes.get(key).push(r.rule);
}
for (const [key, rs] of [...classes].sort()) {
  const names = ["AND", "OR", "MAJ", "MIN"].filter((_, i) => key[i] === "1");
  console.log(`  {${names.join(",") || "none"}}  ${rs.length} rules  ` +
    (rs.length <= 24 ? `[${rs.join(",")}]` : `[${rs.slice(0, 20).join(",")},...]`));
}
console.log();

console.log("=== [C] does 'trivial idempotent clone' == 'non-monotone and non-affine'? ===");
let mismatch = 0;
for (const r of rows) {
  const trivial = r.ter === 3 && r.bin === 2;
  const post = !r.mono && !r.aff;
  if (trivial !== post) { mismatch++; if (mismatch < 10) console.log("  MISMATCH rule", r.rule, { trivial, post, mono: r.mono, aff: r.aff }); }
}
console.log(`  mismatches: ${mismatch} of 256`);
const trivialRules = rows.filter((r) => r.ter === 3 && r.bin === 2).map((r) => r.rule);
console.log(`  rules with trivial idempotent clone (= NP-complete with constants): ${trivialRules.length} of 256`);
console.log();

console.log("=== [D] WNU 3 and WNU 4, against the bounded-width verdict ===");
let bad = 0;
for (const r of rows) {
  const bw = r.hasAnd || r.hasOr || r.hasMaj;
  if ((r.wnu3 && r.wnu4) !== bw) {
    bad++;
    if (bad <= 8) console.log("  DISAGREE rule", r.rule, { wnu3: r.wnu3, wnu4: r.wnu4, bw, aff: r.aff });
  }
}
console.log(`  Barto-Kozik (WNU 3 and 4) vs Schaefer (AND/OR/MAJ): ${bad} disagreements of 256`);
const wnu3only = rows.filter((r) => r.wnu3 && !r.wnu4).map((r) => r.rule);
console.log(`  rules with a WNU of arity 3 but none of arity 4 (the affine trap): ${wnu3only.length}`);
console.log(`    ${wnu3only.join(",")}`);
console.log();

console.log("=== [E] the sixteen left-permutive rules ===");
console.log("  rule  affine  mono  dependsOn(r)  clone                     verdict");
for (const r of rows.filter((x) => x.leftPerm)) {
  const names = ["AND", "OR", "MAJ", "MIN"].filter((_, i) =>
    [r.hasAnd, r.hasOr, r.hasMaj, r.hasMin][i]);
  console.log(`  ${String(r.rule).padStart(4)}  ${String(r.aff).padStart(6)}  ${String(r.mono).padStart(4)}  ` +
    `${String(r.dr).padStart(12)}  {${(names.join(",") || "-").padEnd(22)}} ${r.verdict}`);
}
console.log();

console.log("=== [F] the rules this board uses as controls ===");
for (const rule of [30, 45, 60, 86, 90, 105, 110, 120, 150, 165, 180, 184, 204, 210, 240]) {
  const r = rows[rule];
  const names = ["AND", "OR", "MAJ", "MIN"].filter((_, i) =>
    [r.hasAnd, r.hasOr, r.hasMaj, r.hasMin][i]);
  console.log(`  rule ${String(rule).padStart(3)}  unary=${r.unary.join("/")}  ` +
    `clone={${(names.join(",") || "-").padEnd(11)}}  ${r.verdict}`);
}
console.log();

console.log("=== [G] cores: is the bare language {Rel_R} (no constants) already trivial? ===");
console.log("  A constant unary polymorphism retracts the structure to one point,");
console.log("  and then CSP({Rel_R}) is trivially satisfiable by the all-constant map.");
let withConst0 = 0, withConst1 = 0, coreIsOnePoint = 0;
for (const r of rows) {
  if (r.unary.includes("00")) withConst0++;
  if (r.unary.includes("11")) withConst1++;
  if (r.unary.includes("00") || r.unary.includes("11")) coreIsOnePoint++;
}
console.log(`  constant-0 is an endomorphism for ${withConst0} rules (f(0,0,0)=0, the quiescent ones)`);
console.log(`  constant-1 is an endomorphism for ${withConst1} rules (f(1,1,1)=1)`);
console.log(`  one-point core for ${coreIsOnePoint} of 256 rules; rule 30: ${rows[30].unary.join("/")}`);
