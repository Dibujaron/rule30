import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.EvolveEqFalseOfOutsideCone

/-! Is candidate (5)'s hypothesis refutable from the cone alone, with no use of
periodicity?  If so the node is worthless: a prover closes it in two lines and
the "residual" it points at is nailed shut for a trivial reason. -/

example (p N : ℕ) (hp : 0 < p)
    (h : ∀ k : ℕ, evolve N ((k : ℤ) + 1) = evolve (N + p) ((k : ℤ) + 1)) : False := by
  have hk := h (N + p - 1)
  rw [show ((N + p - 1 : ℕ) : ℤ) + 1 = ((N + p : ℕ) : ℤ) by push_cast; omega] at hk
  rw [evolve_right_edge (N + p)] at hk
  rw [evolve_eq_false_of_outside_cone N ((N + p : ℕ) : ℤ)
      (by rw [abs_of_nonneg (by positivity)]; push_cast; omega)] at hk
  exact Bool.false_ne_true hk
