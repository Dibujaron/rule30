// Parallax, 2026-09-13. Sheaf-theoretic contextuality vantage.
//
// The F_2-affine hull of an elementary rule's local relation.
//
// An elementary CA rule R gives one 4-ary relation on {0,1}:
//   S_R = { (l, c, r, o) : o = R(l,c,r) },  |S_R| = 8  inside  F_2^4.
// The cohomological obstruction of Abramsky-Mansfield is a linear-algebra
// object over a ring; over F_2 it can only see the F_2-AFFINE consequences
// of the local relations (Abramsky-Barbosa-Kishida-Lal-Mansfield's chain
// AvN_R => SC(Aff S) => CSC_R => SC).  So the first question for any rule is:
// what affine relations does its local relation imply?
//
// An affine relation is (alpha in F_2^4, beta in F_2) with alpha . v = beta
// for every v in S_R.  alpha = 0, beta = 0 is the trivial one.
// If the only affine relation is the trivial one, the affine hull of S_R is
// the whole of F_2^4 and the relation implies NOTHING linear: the affine
// relaxation of any CSP over that rule is vacuous and always satisfiable.

const OUT = [];
function log(s) { OUT.push(s); console.log(s); }

function ruleBit(rule, idx) { return (rule >> idx) & 1; }
function relation(rule) {
  const S = [];
  for (let l = 0; l < 2; l++)
    for (let c = 0; c < 2; c++)
      for (let r = 0; r < 2; r++) {
        const o = ruleBit(rule, 4 * l + 2 * c + r);
        S.push([l, c, r, o]);
      }
  return S;
}

// all (alpha,beta) in F_2^4 x F_2 that hold on every tuple
function affineRelations(S) {
  const rels = [];
  for (let a = 0; a < 16; a++) {
    for (let b = 0; b < 2; b++) {
      let ok = true;
      for (const v of S) {
        let s = 0;
        for (let i = 0; i < 4; i++) if ((a >> i) & 1) s ^= v[i];
        if (s !== b) { ok = false; break; }
      }
      if (ok && !(a === 0 && b === 0)) rels.push([a, b]);
    }
  }
  return rels;
}

// is R affine as a Boolean function of (l,c,r)?
function isAffineRule(rule) {
  // R(l,c,r) = e + a l + b c + d r  for some bits
  for (let m = 0; m < 16; m++) {
    let ok = true;
    for (let l = 0; l < 2 && ok; l++)
      for (let c = 0; c < 2 && ok; c++)
        for (let r = 0; r < 2 && ok; r++) {
          const want = ruleBit(rule, 4 * l + 2 * c + r);
          const got = ((m & 1) ^ (((m >> 1) & 1) & l) ^ (((m >> 2) & 1) & c) ^ (((m >> 3) & 1) & r));
          if (want !== got) ok = false;
        }
    if (ok) return true;
  }
  return false;
}

log('[A] affine relations implied by one local relation, per rule');
const withRel = [];
const affineRules = [];
for (let rule = 0; rule < 256; rule++) {
  const rels = affineRelations(relation(rule));
  if (rels.length > 0) withRel.push(rule);
  if (isAffineRule(rule)) affineRules.push(rule);
}
log(`  rules with a nontrivial affine relation: ${withRel.length}`);
log(`  they are: ${withRel.join(', ')}`);
log(`  rules that are affine as Boolean functions: ${affineRules.length}`);
log(`  they are: ${affineRules.join(', ')}`);
log(`  the two lists agree: ${JSON.stringify(withRel) === JSON.stringify(affineRules)}`);

log('');
log('[B] the four rules this vantage compares');
for (const rule of [30, 120, 90, 150, 60, 105]) {
  const rels = affineRelations(relation(rule));
  const pretty = rels.map(([a, b]) => {
    const names = ['l', 'c', 'r', 'o'];
    const terms = [];
    for (let i = 0; i < 4; i++) if ((a >> i) & 1) terms.push(names[i]);
    return `${terms.join(' + ')} = ${b}`;
  });
  const dim = 4 - rels.length.toString(2).length + 1; // placeholder, recomputed below
  // affine hull dimension = 4 - (number of independent alpha's)
  const alphas = rels.map(([a]) => a);
  // rank over F_2 of the alpha vectors
  let rank = 0; const basis = [];
  for (const a of alphas) {
    let v = a;
    for (const b of basis) v = Math.min(v, v ^ b) === (v ^ b) && (v ^ b) < v ? (v ^ b) : v;
    // simple elimination
    let x = a;
    for (const b of basis) { const hb = 31 - Math.clz32(b); if ((x >> hb) & 1) x ^= b; }
    if (x !== 0) { basis.push(x); rank++; basis.sort((p, q) => q - p); }
  }
  log(`  rule ${rule}: ${rels.length} nontrivial affine relation(s)` +
      (pretty.length ? ` -> ${pretty.join('; ')}` : '') +
      `; affine hull has dimension ${4 - rank} (whole space = 4)`);
}

log('');
log('[C] sanity: rule 30 = rule 150 plus the quadratic monomial c*r?');
{
  let ok = true;
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
    const r30 = ruleBit(30, 4 * l + 2 * c + r);
    const r150 = ruleBit(150, 4 * l + 2 * c + r);
    if (r30 !== (r150 ^ (c & r))) ok = false;
  }
  log(`  rule30 == rule150 XOR (c AND r) at all 8 neighbourhoods: ${ok}`);
  let ok2 = true;
  for (let l = 0; l < 2; l++) for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
    const r120 = ruleBit(120, 4 * l + 2 * c + r);
    if (r120 !== (l ^ (c & r))) ok2 = false;
  }
  log(`  rule120 == l XOR (c AND r) at all 8 neighbourhoods: ${ok2}`);
}
