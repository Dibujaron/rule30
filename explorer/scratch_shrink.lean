import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs

namespace Shrink

-- the tier's node 1, assumed available as a sibling proof
theorem rule30_alternating_step (X : Config) (L : ℕ)
    (h : ∀ j < L + 2, X (-(j : ℤ)) = decide (j % 2 = 0)) :
    ∀ j < L + 1, rule30 X (-(j : ℤ)) = decide (j % 2 = 0) := by
  have alt_succ : ∀ j : ℕ, (decide ((j + 1) % 2 = 0)) = !(decide (j % 2 = 0)) := by
    intro j
    rcases Nat.mod_two_eq_zero_or_one j with hp | hp <;> simp [Nat.add_mod, hp]
  intro j hj
  rw [rule30_eq]
  have hj0 : X (-(j : ℤ)) = decide (j % 2 = 0) := h j (by omega)
  have hjm : X (-(j : ℤ) - 1) = !(decide (j % 2 = 0)) := by
    have hx := h (j + 1) (by omega)
    rw [alt_succ] at hx
    rw [← hx]
    congr 1
    push_cast
    ring
  have hor : (X (-(j : ℤ)) || X (-(j : ℤ) + 1)) = true := by
    cases j with
    | zero => rw [hj0]; simp
    | succ n =>
        have hx := h n (by omega)
        have he : X (-((n : ℕ) + 1 : ℤ) + 1) = decide (n % 2 = 0) := by
          rw [← hx]; congr 1; push_cast; ring
        push_cast at hj0 he ⊢
        rw [hj0, he, alt_succ]
        cases (decide (n % 2 = 0)) <;> simp
  rw [hjm, hor]
  cases (decide (j % 2 = 0)) <;> simp

theorem column_alternating_shrink (X : Config) (t L : ℕ)
    (h : ∀ j < L + 1, column X (-(j : ℤ)) t = decide (j % 2 = 0))
    (hmax : column X (-((L : ℕ) + 1 : ℤ)) t ≠ decide ((L + 1) % 2 = 0)) :
    (∀ j < L, column X (-(j : ℤ)) (t + 1) = decide (j % 2 = 0))
      ∧ column X (-(L : ℤ)) (t + 1) ≠ decide (L % 2 = 0) := by
  have alt_succ : ∀ j : ℕ, (decide ((j + 1) % 2 = 0)) = !(decide (j % 2 = 0)) := by
    intro j
    rcases Nat.mod_two_eq_zero_or_one j with hp | hp <;> simp [Nat.add_mod, hp]
  constructor
  · intro j hj
    cases L with
    | zero => omega
    | succ M =>
        have hs2 := rule30_alternating_step (evolveFrom X t) M (by
          intro i hii
          have := h i (by omega)
          simpa [column] using this)
        have hx := hs2 j (by omega)
        simpa [column, evolveFrom_succ] using hx
  · have hstep : column X (-(L : ℤ)) (t + 1)
        = xor (column X (-(L : ℤ) - 1) t)
            (column X (-(L : ℤ)) t || column X (-(L : ℤ) + 1) t) := by
      simp [column, evolveFrom_succ, rule30_eq]
    have hL : column X (-(L : ℤ)) t = decide (L % 2 = 0) := h L (by omega)
    have hor : (column X (-(L : ℤ)) t || column X (-(L : ℤ) + 1) t) = true := by
      cases L with
      | zero => rw [hL]; simp
      | succ m =>
          have hm : column X (-(m : ℤ)) t = decide (m % 2 = 0) := h m (by omega)
          have he : column X (-((m : ℕ) + 1 : ℤ) + 1) t = decide (m % 2 = 0) := by
            rw [← hm]; congr 1; push_cast; ring
          push_cast at hL he ⊢
          rw [hL, he, alt_succ]
          cases (decide (m % 2 = 0)) <;> simp
    have hmax' : column X (-(L : ℤ) - 1) t ≠ !(decide (L % 2 = 0)) := by
      have he : column X (-(L : ℤ) - 1) t = column X (-((L : ℕ) + 1 : ℤ)) t := by
        congr 1; push_cast; ring
      rw [he, ← alt_succ]
      exact hmax
    rw [hstep, hor]
    revert hmax'
    cases (column X (-(L : ℤ) - 1) t) <;> cases (decide (L % 2 = 0)) <;> simp

end Shrink

#print axioms Shrink.column_alternating_shrink
