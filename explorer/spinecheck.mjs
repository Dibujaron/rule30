// Engine cross-check for spine statement A (inversion of rule30_eq):
//   evolve t (i-1) = evolve (t+1) i XOR (evolve t i OR evolve t (i+1))
// and for the "left of the cone" facts D relies on.
import { rows, centerBitIndex } from './rule30.mjs';
const G = 120;
const c0 = centerBitIndex(G);
const R = [...rows(G)];
const cell = (t, i) => Number((R[t] >> BigInt(c0 + i)) & 1n);
let checked = 0, bad = 0;
for (let t = 0; t + 1 < G; t++) for (let i = -G; i <= G; i++) {
  const lhs = cell(t, i - 1);
  const rhs = cell(t + 1, i) ^ (cell(t, i) | cell(t, i + 1));
  checked++; if (lhs !== rhs) bad++;
}
console.log(`A: ${checked} (t,i) pairs, ${bad} mismatches`);
// sanity: left edge black, outside cone white, for the columns D uses
let edge = 0, cone = 0;
for (let m = 0; m < G; m++) { if (cell(m, -m) !== 1) edge++; for (let t = 0; t < m; t++) if (cell(t, -m) !== 0) cone++; }
console.log(`left edge non-black: ${edge}; inside-white violations: ${cone}`);
