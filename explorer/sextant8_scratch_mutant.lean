import Rule30.Basic

/-!
Sextant, 2026-09-12. The demonstration that sextant8_scratch_rows.lean can
fail. Same definitions, three assertions each one step off the true one:

  (a) the one-block bound with 6t+8 in place of 6t+9 -- it is attained at
      t = 0, 1, 2, so shaving one off the constant must break it;
  (b) the identity with +1 in place of +2 -- the two infinite outer gaps of
      the cone contribute one black cell each, not one between them;
  (c) the witness ring given temporal period 4 instead of 5.

Lean must reject all three. `lake env lean` on this file is expected to exit
non-zero; if it ever exits 0, the checks in the companion file are vacuous.
-/

namespace Sextant8Mutant

private def cell (t i : ℕ) : Bool := rowCell t ((i : ℤ) - (t : ℤ))

private def bRow (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter (fun i => cell t i)).length

private def rhoRow (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter
    (fun i => cell t i && (decide (i = 0) || !cell t (i - 1)))).length

private def g2Row (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter
    (fun i => decide (1 ≤ i) && cell t (i - 1) && !cell t i && !cell t (i + 1))).length

private def ringStep (s : List Bool) : List Bool :=
  let n := s.length
  (List.range n).map (fun i =>
    xor (s.getD ((i + n - 1) % n) false)
      (s.getD i false || s.getD ((i + 1) % n) false))

private def w : List Bool := [true, false, false, true, true]

set_option maxRecDepth 100000

-- (a) must fail at t = 0, where the true bound is attained
example : ∀ t ∈ List.range 24, 2 * bRow (t + 1) + 3 * bRow t ≤ 6 * t + 8 := by decide

-- (b) must fail everywhere: the cone contributes two blacks, not one
example : ∀ t ∈ List.range 24, bRow (t + 1) = rhoRow t + 2 * g2Row t + 1 := by decide

-- (c) must fail: the witness ring has temporal period 5
example : ringStep^[4] w = w := by decide

end Sextant8Mutant
