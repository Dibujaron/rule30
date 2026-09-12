// Seeder, 2026-09-12. Checks the damage-front tier for P1.
//
// X is the seed's picture; Y is the seed's picture slid forward by p, i.e.
// Y's column i at time t is evolve(t+p) i. The damage is D_i(t) = X_i(t) xor Y_i(t).
//
// Four claims, all checked against a direct cell-by-cell rule 30 (no BigInt):
//
//  (1) FRONT ADVANCE (no hypothesis on the centre column at all).
//      If D_{-i}(t)=0 for every i <= k+1 and D_{-(k+2)}(t)=1, then at t+1
//      D_{-i}=0 for 1 <= i <= k and D_{-(k+1)}=1.
//  (2) FRONT EXISTS.  If D_0(t)=0 then some depth carries damage, so a least
//      one exists; and depth t+p always carries damage.
//  (3) MASK.  If D_0(t)=D_0(t+1)=0 then D_{-1}(t) = (!X_0(t)) && D_1(t).
//      (this is the board's closed column_neg_one_damage_mask; checked here
//      only to confirm the instantiation X = seed, Y = seed slid by p.)
//  (4) ARRIVAL.  If D_0 = 0 on [t, t+k] and D_{-i}(t)=0 for i<=k and
//      D_{-(k+1)}(t)=1, then X_0(t+k)=false and D_1(t+k)=1.

const T = 220;          // rows to run
const W = T + 40;       // half-width of the grid

function rowOf(cells) {
  // cells: Set of integer positions that are black
  const a = new Uint8Array(2 * W + 1);
  for (const c of cells) if (Math.abs(c) <= W) a[c + W] = 1;
  return a;
}

function step(a) {
  const b = new Uint8Array(a.length);
  for (let i = 1; i < a.length - 1; i++) b[i] = a[i - 1] ^ (a[i] | a[i + 1]);
  return b;
}

function picture(row0, n) {
  const rows = [row0];
  for (let t = 0; t < n; t++) rows.push(step(rows[rows.length - 1]));
  return rows;
}

const seed = picture(rowOf([0]), T + 60);
const at = (rows, t, x) => rows[t][x + W];

let fails = { advance: 0, exists: 0, mask: 0, arrival: 0 };
let hits = { advance: 0, exists: 0, mask: 0, arrival: 0 };
let edgeChecked = 0;

for (let p = 1; p <= 12; p++) {
  // Y's column i at time t is evolve(t+p) i.
  const X = (t, x) => at(seed, t, x);
  const Y = (t, x) => at(seed, t + p, x);
  const D = (t, x) => X(t, x) ^ Y(t, x);

  for (let t = 0; t + p + 2 < T; t++) {
    // (2b) the left cone edge always carries damage
    if (p >= 1) {
      const d = D(t, -(t + p));
      edgeChecked++;
      if (d !== 1) fails.exists++;
    }

    // (1) front advance, at every depth where the hypothesis holds
    for (let k = 0; k + 2 <= t + p; k++) {
      let ok = true;
      for (let i = 0; i <= k + 1 && ok; i++) if (D(t, -i) !== 0) ok = false;
      if (!ok) continue;
      if (D(t, -(k + 2)) !== 1) continue;
      hits.advance++;
      for (let i = 1; i <= k; i++) if (D(t + 1, -i) !== 0) fails.advance++;
      if (D(t + 1, -(k + 1)) !== 1) fails.advance++;
      break; // the hypothesis pins k uniquely (least damaged depth minus one)
    }

    // (3) mask
    if (D(t, 0) === 0 && D(t + 1, 0) === 0) {
      hits.mask++;
      const lhs = D(t, -1);
      const rhs = (X(t, 0) === 0 ? 1 : 0) & D(t, 1);
      if (lhs !== rhs) fails.mask++;
    }

    // (4) arrival: needs D_0 = 0 on [t, t+k]
    for (let k = 0; k <= 12 && k + 1 <= t + p; k++) {
      let zero = true;
      for (let s = 0; s <= k + 1 && zero; s++) if (D(t + s, 0) !== 0) zero = false;
      if (!zero) break;
      let agree = true;
      for (let i = 0; i <= k && agree; i++) if (D(t, -i) !== 0) agree = false;
      if (!agree) continue;
      if (D(t, -(k + 1)) !== 1) continue;
      hits.arrival++;
      if (X(t + k, 0) !== 0) fails.arrival++;
      if (D(t + k, 1) !== 1) fails.arrival++;
    }
  }
}

console.log('front advance :', hits.advance, 'instances,', fails.advance, 'failures');
console.log('cone-edge dmg :', edgeChecked, 'instances,', fails.exists, 'failures');
console.log('mask          :', hits.mask, 'instances,', fails.mask, 'failures');
console.log('arrival       :', hits.arrival, 'instances,', fails.arrival, 'failures');

// A deliberately wrong variant of (1), to show the check has teeth:
// claim the front stays put instead of advancing.
let wrongHits = 0, wrongFails = 0;
for (let p = 1; p <= 6; p++) {
  const D = (t, x) => at(seed, t, x) ^ at(seed, t + p, x);
  for (let t = 0; t + p + 2 < T; t++) {
    for (let k = 0; k + 2 <= t + p; k++) {
      let ok = true;
      for (let i = 0; i <= k + 1 && ok; i++) if (D(t, -i) !== 0) ok = false;
      if (!ok) continue;
      if (D(t, -(k + 2)) !== 1) continue;
      wrongHits++;
      if (D(t + 1, -(k + 2)) !== 1) wrongFails++;
      break;
    }
  }
}
console.log('MUTANT (front stays):', wrongHits, 'instances,', wrongFails, 'failures (want many)');
