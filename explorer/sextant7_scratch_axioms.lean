import Rule30.Basic
import Mathlib.Tactic

/-! Sextant, 2026-09-10.  Axioms of the four theorems in
`sextant7_scratch_forced.lean`, and a MUTANT beside them: the same forcing
lemma with the triple's right cell `x.testBit (n+2)` weakened from `true` to
`false`.  If the mutant is also accepted, the check is measuring nothing.
Expected: the four print `[propext, Quot.sound]` (or less) and the mutant
FAILS to elaborate. -/

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem mod_two_pow_eq_iff (a b m : ℕ) :
    a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
  constructor
  · intro h i hi
    have := congrArg (fun x => x.testBit i) h
    simpa [Nat.testBit_mod_two_pow, hi] using this
  · intro h
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
    by_cases hi : i < m
    · simp [hi, h i hi]
    · simp [hi]

private theorem rowStep_mod_two_pow (r n : ℕ) :
    rowStep r % 2 ^ n = rowStep (r % 2 ^ n) % 2 ^ n := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, testBit_rowStep, testBit_rowStep]
  by_cases hi : i < n
  · have h1 : i - 1 < n := by omega
    have h2 : i - 2 < n := by omega
    simp [Nat.testBit_mod_two_pow, hi, h1, h2]
  · simp [hi]

theorem forced_two (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
    (hb : x.testBit n = true) (hw : x.testBit (n + 1) = false)
    (hy : y.testBit (n + 1) = true) (hr : x.testBit (n + 2) = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) := by
  have hlow := (mod_two_pow_eq_iff x y (n + 1)).1 h
  have hlow1 := (mod_two_pow_eq_iff (rowStep x) (rowStep y) (n + 1)).1
    (by rw [rowStep_mod_two_pow x (n + 1), h, ← rowStep_mod_two_pow y (n + 1)])
  rw [mod_two_pow_eq_iff]
  intro i hi
  by_cases hi' : i < n + 1
  · exact hlow1 i hi'
  · have hyn : y.testBit n = true := by rw [← hlow n (by omega)]; exact hb
    have hcase : i = n + 1 ∨ i = n + 2 := by omega
    rcases hcase with rfl | rfl
    · rw [testBit_rowStep, testBit_rowStep, show n + 1 - 1 = n by omega,
        hlow (n + 1 - 2) (by omega), hb, hyn, hw, hy]
      simp
    · rw [testBit_rowStep, testBit_rowStep, show n + 2 - 1 = n + 1 by omega,
        show n + 2 - 2 = n by omega, hb, hyn, hw, hy, hr]
      simp

theorem forced_bound :
    (11 : ℕ) % 2 ^ 2 = (15 : ℕ) % 2 ^ 2 ∧
    rowStep 11 % 2 ^ 4 = rowStep 15 % 2 ^ 4 ∧
    rowStep 11 % 2 ^ 5 ≠ rowStep 15 % 2 ^ 5 := by
  refine ⟨by decide, by decide, by decide⟩

theorem cone_le_120 :
    ∀ t : Fin 121, 2 ^ (2 * (t : ℕ)) ≤ rowNat t ∧ rowNat t < 2 ^ (2 * (t : ℕ) + 1) := by
  decide +kernel

#print axioms forced_two
#print axioms forced_bound
#print axioms cone_le_120

/-- THE MUTANT.  Right cell of the triple flipped to white.  Then `x`'s side of
bit `n+2` reads `x_n xor (x_(n+1) || x_(n+2)) = 1 xor 0 = 1` while `y`'s reads
`1 xor (1 || _) = 0`, so the two differ and the conclusion is false.  This
`sorry`-free proof attempt must FAIL. -/
theorem mutant_right_cell_white (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
    (hb : x.testBit n = true) (hw : x.testBit (n + 1) = false)
    (hy : y.testBit (n + 1) = true) (hr : x.testBit (n + 2) = false) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) := by
  have hlow := (mod_two_pow_eq_iff x y (n + 1)).1 h
  have hlow1 := (mod_two_pow_eq_iff (rowStep x) (rowStep y) (n + 1)).1
    (by rw [rowStep_mod_two_pow x (n + 1), h, ← rowStep_mod_two_pow y (n + 1)])
  rw [mod_two_pow_eq_iff]
  intro i hi
  by_cases hi' : i < n + 1
  · exact hlow1 i hi'
  · have hyn : y.testBit n = true := by rw [← hlow n (by omega)]; exact hb
    have hcase : i = n + 1 ∨ i = n + 2 := by omega
    rcases hcase with rfl | rfl
    · rw [testBit_rowStep, testBit_rowStep, show n + 1 - 1 = n by omega,
        hlow (n + 1 - 2) (by omega), hb, hyn, hw, hy]
      simp
    · rw [testBit_rowStep, testBit_rowStep, show n + 2 - 1 = n + 1 by omega,
        show n + 2 - 2 = n by omega, hb, hyn, hw, hy, hr]
      simp
